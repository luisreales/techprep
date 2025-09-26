using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TechPrep.Core.Entities;
using TechPrep.Core.Enums;
using TechPrep.Infrastructure.Data;
using TechPrep.Application.DTOs.Session;

namespace TechPrep.API.Controllers;

public class CreatePracticeSessionRequest
{
    public int? TopicId { get; set; }
    public string? Level { get; set; }
    public int QuestionCount { get; set; } = 10;
    public int? AssignmentId { get; set; }
}

public class PracticeAnswerSubmissionDto
{
    public Guid QuestionId { get; set; }
    public QuestionType AnswerType { get; set; }
    public string? Text { get; set; }
    public List<Guid> Options { get; set; } = new();
    public int TimeMs { get; set; }
}

[ApiController]
[Route("api/practice-sessions")]
[Authorize]
public class PracticeSessionsController : ControllerBase
{
    private readonly TechPrepDbContext _db;

    public PracticeSessionsController(TechPrepDbContext db)
    {
        _db = db;
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var id) ? id : Guid.Empty;
    }

    [HttpPost]
    public async Task<IActionResult> CreateSession([FromBody] CreatePracticeSessionRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { success = false, message = "Invalid user token" });
        }

        // Fetch questions based on the request parameters
        var questionsQuery = _db.Questions
            .Include(q => q.Options)
            .Where(q => q.UsableInPractice == true)
            .AsQueryable();

        if (request.TopicId.HasValue)
        {
            questionsQuery = questionsQuery.Where(q => q.TopicId == request.TopicId.Value);
        }

        if (!string.IsNullOrEmpty(request.Level))
        {
            questionsQuery = questionsQuery.Where(q => q.Level.ToString().ToLower() == request.Level.ToLower());
        }

        var questions = await questionsQuery
            .Take(request.QuestionCount)
            .ToListAsync();

        if (questions.Count == 0)
        {
            return BadRequest(new { success = false, message = "No questions found matching the criteria" });
        }

        // Create the practice session
        var session = new PracticeSessionNew
        {
            UserId = userId,
            AssignmentId = request.AssignmentId,
            Status = SessionStatus.NotStarted,
            StartedAt = DateTime.UtcNow,
            TotalItems = questions.Count,
            CorrectCount = 0,
            IncorrectCount = 0,
            TotalScore = 0,
            CurrentQuestionIndex = 0
        };

        _db.PracticeSessionsNew.Add(session);
        await _db.SaveChangesAsync();

        return Ok(new { success = true, data = new { sessionId = session.Id, questionCount = questions.Count, questions = questions.Select(q => new
        {
            id = q.Id,
            text = q.Text,
            type = q.Type.ToString(),
            level = q.Level.ToString(),
            topicId = q.TopicId,
            options = q.Options.Select(o => new { id = o.Id, text = o.Text, orderIndex = o.OrderIndex }).ToList()
        }).ToList() } });
    }

    [HttpPost("{sessionId:guid}/answers")]
    public async Task<IActionResult> SubmitAnswer(Guid sessionId, [FromBody] PracticeAnswerSubmissionDto submission)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { success = false, message = "Invalid user token" });
        }

        // Get session to verify ownership
        var session = await _db.PracticeSessionsNew
            .Include(s => s.Answers)
            .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId);

        if (session == null)
        {
            return NotFound(new { success = false, message = "Session not found" });
        }

        // Get question with options for evaluation
        var question = await _db.Questions
            .Include(q => q.Options)
            .Include(q => q.ResourceLinks)
            .ThenInclude(rl => rl.Resource)
            .FirstOrDefaultAsync(q => q.Id == submission.QuestionId);

        if (question == null)
        {
            return NotFound(new { success = false, message = "Question not found" });
        }

        // Check if answer already exists for this question in this session
        var existingAnswer = session.Answers.FirstOrDefault(a => a.QuestionId == submission.QuestionId);
        if (existingAnswer != null)
        {
            return BadRequest(new { success = false, message = "Answer already submitted for this question" });
        }

        // Evaluate the answer
        bool isCorrect = false;
        decimal? matchPercent = null;

        switch (submission.AnswerType)
        {
            case QuestionType.SingleChoice:
                if (submission.Options.Count == 1)
                {
                    var selectedOption = question.Options.FirstOrDefault(o => o.Id == submission.Options.First());
                    isCorrect = selectedOption?.IsCorrect ?? false;
                }
                break;
            case QuestionType.MultiChoice:
                var correctOptionIds = question.Options.Where(o => o.IsCorrect).Select(o => o.Id).ToHashSet();
                var selectedSet = submission.Options.ToHashSet();
                isCorrect = correctOptionIds.SetEquals(selectedSet);
                break;
            case QuestionType.Written:
                // Simple text matching for now - TODO: Use EvaluationService
                if (!string.IsNullOrEmpty(question.OfficialAnswer) && !string.IsNullOrEmpty(submission.Text))
                {
                    var normalizedOfficial = question.OfficialAnswer.ToLowerInvariant().Trim();
                    var normalizedUser = submission.Text.ToLowerInvariant().Trim();
                    matchPercent = normalizedUser.Contains(normalizedOfficial) ? 100m : 0m;
                    isCorrect = matchPercent >= 80m; // Default threshold
                }
                break;
        }

        // Create answer record
        var answer = new PracticeAnswer
        {
            Id = Guid.NewGuid(),
            PracticeSessionId = sessionId,
            QuestionId = submission.QuestionId,
            GivenText = submission.Text,
            GivenAnswer = submission.Text,
            SelectedOptionIds = submission.Options.Any() ? System.Text.Json.JsonSerializer.Serialize(submission.Options) : null,
            IsCorrect = isCorrect,
            MatchPercentage = matchPercent,
            Score = isCorrect ? 1 : 0,
            TimeSpentSec = submission.TimeMs / 1000,
            TimeMs = submission.TimeMs,
            AnsweredAt = DateTime.UtcNow
        };

        _db.PracticeAnswers.Add(answer);

        // Update session statistics
        if (isCorrect)
        {
            session.CorrectCount += 1;
            session.TotalScore += 1;
        }
        else
        {
            session.IncorrectCount += 1;
        }

        session.Status = SessionStatus.InProgress;
        await _db.SaveChangesAsync();

        // Return immediate feedback for practice mode
        var response = new
        {
            accepted = true,
            isCorrect = (bool?)isCorrect,
            matchPercent = matchPercent,
            explanation = question.OfficialAnswer,
            resources = question.ResourceLinks?.Select(rl => new
            {
                id = rl.ResourceId,
                title = rl.Resource?.Title ?? "",
                url = rl.Resource?.Url ?? "",
                type = rl.Resource?.Kind.ToString() ?? ""
            }).Cast<object>().ToList() ?? new List<object>()
        };

        return Ok(new { success = true, data = response });
    }

    [HttpGet("{sessionId:guid}")]
    public async Task<IActionResult> GetSession(Guid sessionId)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { success = false, message = "Invalid user token" });
        }

        var session = await _db.PracticeSessionsNew
            .Include(s => s.Assignment)
            .ThenInclude(a => a.Template)
            .Include(s => s.Answers)
            .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId);

        if (session == null)
        {
            return NotFound(new { success = false, message = "Session not found" });
        }

        var sessionData = new
        {
            id = session.Id,
            userId = session.UserId,
            assignmentId = session.AssignmentId,
            status = session.Status.ToString(),
            startedAt = session.StartedAt,
            submittedAt = session.SubmittedAt,
            finishedAt = session.FinishedAt,
            totalItems = session.TotalItems,
            correctCount = session.CorrectCount,
            incorrectCount = session.IncorrectCount,
            totalScore = session.TotalScore,
            currentQuestionIndex = session.CurrentQuestionIndex,
            assignment = session.Assignment != null ? new
            {
                id = session.Assignment.Id,
                templateId = session.Assignment.TemplateId,
                visibility = session.Assignment.Visibility.ToString(),
                template = session.Assignment.Template != null ? new
                {
                    id = session.Assignment.Template.Id,
                    name = session.Assignment.Template.Name,
                    kind = session.Assignment.Template.Kind.ToString()
                } : null
            } : null,
            answersCount = session.Answers.Count
        };

        return Ok(new { success = true, data = sessionData });
    }

    [HttpPost("{sessionId:guid}/finish")]
    public async Task<IActionResult> FinishSession(Guid sessionId)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { success = false, message = "Invalid user token" });
        }

        var session = await _db.PracticeSessionsNew
            .Include(s => s.Answers)
            .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId);

        if (session == null)
        {
            return NotFound(new { success = false, message = "Session not found" });
        }

        // Update session as finished
        session.FinishedAt = DateTime.UtcNow;
        session.SubmittedAt = DateTime.UtcNow;
        session.Status = SessionStatus.Completed;

        // Recalculate totals
        session.CorrectCount = session.Answers.Count(a => a.IsCorrect);
        session.IncorrectCount = session.Answers.Count(a => !a.IsCorrect);
        session.TotalItems = session.Answers.Count();

        await _db.SaveChangesAsync();

        return Ok(new { success = true, message = "Practice session finished successfully" });
    }

    [HttpGet("{sessionId:guid}/summary")]
    public async Task<IActionResult> GetSessionSummary(Guid sessionId)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { success = false, message = "Invalid user token" });
        }

        var session = await _db.PracticeSessionsNew
            .Include(s => s.Assignment)
            .ThenInclude(a => a.Template)
            .Include(s => s.Answers)
            .ThenInclude(a => a.Question)
            .ThenInclude(q => q.Topic)
            .Include(s => s.Answers)
            .ThenInclude(a => a.Question)
            .ThenInclude(q => q.ResourceLinks)
            .ThenInclude(rl => rl.Resource)
            .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId);

        if (session == null)
        {
            return NotFound(new { success = false, message = "Session not found" });
        }

        var totalQuestions = session.Answers.Count();
        var correctAnswers = session.Answers.Count(a => a.IsCorrect);

        var summary = new
        {
            sessionId = sessionId,
            totalQuestions = totalQuestions,
            correctAnswers = correctAnswers,
            incorrectAnswers = totalQuestions - correctAnswers,
            score = session.TotalScore,
            totalTimeMs = session.Answers.Sum(a => a.TimeMs),
            startedAt = session.StartedAt,
            finishedAt = session.FinishedAt,
            topicStats = session.Answers
                .GroupBy(a => a.Question.TopicId)
                .Select(g => new
                {
                    topicId = g.Key,
                    topicName = g.First().Question.Topic?.Name ?? "Unknown",
                    totalQuestions = g.Count(),
                    correctAnswers = g.Count(a => a.IsCorrect),
                    accuracy = g.Count() > 0 ? (decimal)g.Count(a => a.IsCorrect) / g.Count() * 100 : 0
                }).ToList(),
            questions = session.Answers.Select(a => new
            {
                questionId = a.QuestionId,
                questionText = a.Question.Text,
                isCorrect = a.IsCorrect,
                matchPercent = a.MatchPercentage,
                userAnswer = a.GivenAnswer ?? a.SelectedOptionIds,
                officialAnswer = a.Question.OfficialAnswer,
                explanation = a.Question.OfficialAnswer,
                resources = a.Question.ResourceLinks?.Select(rl => new
                {
                    id = rl.ResourceId,
                    title = rl.Resource?.Title ?? "",
                    url = rl.Resource?.Url ?? "",
                    type = rl.Resource?.Kind.ToString() ?? ""
                }).Cast<object>().ToList() ?? new List<object>()
            }).Cast<object>().ToList()
        };

        return Ok(new { success = true, data = summary });
    }
}