using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;
using TechPrep.Application.DTOs;
using TechPrep.Application.Interfaces;
using TechPrep.Core.Entities;
using TechPrep.Core.Enums;
using TechPrep.Infrastructure.Data;

namespace TechPrep.API.Controllers;

[ApiController]
[Route("api/interviews")]
[Authorize]
public class InterviewRunnerController : ControllerBase
{
    private readonly TechPrepDbContext _context;
    private readonly IEvaluationService _evaluationService;
    private readonly ILogger<InterviewRunnerController> _logger;

    public InterviewRunnerController(
        TechPrepDbContext context,
        IEvaluationService evaluationService,
        ILogger<InterviewRunnerController> logger)
    {
        _context = context;
        _evaluationService = evaluationService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
    }

    [HttpPost("sessions")]
    public async Task<ActionResult<StartInterviewResponse>> StartInterview([FromBody] StartInterviewRequest request)
    {
        try
        {
            var userId = GetUserId();
            if (userId == Guid.Empty)
                return Unauthorized();

            // Get assignment first, then load the associated interview template
            var assignment = await _context.SessionAssignments
                .Include(sa => sa.Template)
                .FirstOrDefaultAsync(sa => sa.Id == request.assignmentId && sa.UserId == userId);

            if (assignment == null)
                return NotFound(new { message = "Assignment not found or not assigned to current user" });

            var template = assignment.Template;

            if (template == null)
                return NotFound(new { message = "Interview template not found" });

            if (template.Kind != TemplateKind.Interview)
                return BadRequest(new { message = "Assignment is not for an interview template" });

            // Check for existing active session
            var existingSession = await _context.InterviewSessionsNew
                .FirstOrDefaultAsync(s => s.UserId == userId && s.AssignmentId == request.assignmentId && s.Status == "Active");

            if (existingSession != null)
            {
                return Ok(new StartInterviewResponse(existingSession.Id));
            }

            // Get questions for this template
            var questions = await GetTemplateQuestions(template);

            // Create new interview session
            var newSession = new InterviewSessionNew
            {
                UserId = userId,
                AssignmentId = request.assignmentId,
                Status = "Active",
                StartedAt = DateTime.UtcNow,
                NumberAttemps = 1,
                TotalItems = questions.Count()
            };

            _context.InterviewSessionsNew.Add(newSession);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Interview session started: {SessionId} for user {UserId}", newSession.Id, userId);

            return Ok(new StartInterviewResponse(newSession.Id));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting interview session");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    [HttpGet("sessions/{sessionId}/runner")]
    public async Task<ActionResult<RunnerStateDto>> GetRunnerState(Guid sessionId)
    {
        try
        {
            var userId = GetUserId();
            if (userId == Guid.Empty)
                return Unauthorized();

            var session = await _context.InterviewSessionsNew
                .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId);

            if (session == null)
                return NotFound(new { message = "Session not found" });

            if (session.Status != "Active")
                return BadRequest(new { message = "Session is not active" });

            // Get template from assignment
            var assignment = await _context.SessionAssignments
                .Include(sa => sa.Template)
                .FirstOrDefaultAsync(sa => sa.Id == session.AssignmentId);

            var template = assignment?.Template;
            if (template == null)
                return NotFound(new { message = "Template not found" });

            var questions = await GetTemplateQuestions(template);
            var questionDtos = questions.Select((q, index) => new RunnerQuestionDto(
                q.Id,
                GetQuestionTypeString(q.Type),
                q.Text,
                q.Type == QuestionType.Written ? null : q.Options
                    .GroupBy(o => o.Text)
                    .Select(g => g.First())
                    .OrderBy(o => o.OrderIndex)
                    .Select(o => new RunnerOptionDto(o.Id.ToString(), o.Text)),
                q.Topic?.Name ?? "General",
                GetLevelString(q.Level),
                index,
                questions.Count
            )).ToList();

            var runnerState = new RunnerStateDto(
                session.Id,
                session.CurrentQuestionIndex,
                session.TotalItems,
                questionDtos
            );

            return Ok(runnerState);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting runner state for session {SessionId}", sessionId);
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    [HttpPost("sessions/{sessionId}/submit")]
    public async Task<ActionResult<InterviewSummaryDto>> SubmitAnswers(Guid sessionId, [FromBody] SubmitInterviewRequest request)
    {
        try
        {
            var userId = GetUserId();
            if (userId == Guid.Empty)
                return Unauthorized();

            var session = await _context.InterviewSessionsNew
                .Include(s => s.Answers)
                .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId);

            if (session == null)
                return NotFound(new { message = "Session not found" });

            if (session.Status == "Submitted")
            {
                // Return existing summary if already submitted
                return await GetSummaryInternal(session);
            }

            if (session.Status != "Active")
                return BadRequest(new { message = "Session is not active" });

            // Get template from assignment
            var assignmentForSubmit = await _context.SessionAssignments
                .Include(sa => sa.Template)
                .FirstOrDefaultAsync(sa => sa.Id == session.AssignmentId);

            var template = assignmentForSubmit?.Template;
            if (template == null)
                return NotFound(new { message = "Template not found" });

            var questions = await GetTemplateQuestions(template);
            var questionDict = questions.ToDictionary(q => q.Id, q => q);

            int correctCount = 0;
            int totalTimeMs = 0;

            // Process each submitted answer
            foreach (var submitItem in request.Questions)
            {
                if (!questionDict.TryGetValue(submitItem.QuestionId, out var question))
                    continue;

                bool isCorrect = false;
                int? matchPercent = null;

                // Evaluate based on question type
                switch (question.Type)
                {
                    case QuestionType.SingleChoice:
                        var selectedIds = submitItem.OptionIds?.ToList() ?? new List<Guid>();
                        isCorrect = _evaluationService.EvaluateSingleChoice(question, selectedIds);
                        break;

                    case QuestionType.MultiChoice:
                        var multiSelectedIds = submitItem.OptionIds?.ToList() ?? new List<Guid>();
                        isCorrect = _evaluationService.EvaluateMultiChoice(question, multiSelectedIds);
                        break;

                    case QuestionType.Written:
                        var (percent, correct) = _evaluationService.EvaluateWritten(question, submitItem.Text ?? "", 80m);
                        matchPercent = (int)percent;
                        isCorrect = correct;
                        break;
                }

                if (isCorrect)
                    correctCount++;

                totalTimeMs += submitItem.TimeMs;

                // Create answer record
                var answer = new InterviewAnswerNew
                {
                    InterviewSessionId = sessionId,
                    QuestionId = submitItem.QuestionId,
                    Type = GetQuestionTypeString(question.Type),
                    GivenText = submitItem.Text,
                    ChosenOptionIdsJson = submitItem.OptionIds != null ? JsonSerializer.Serialize(submitItem.OptionIds) : null,
                    IsCorrect = isCorrect,
                    MatchPercent = matchPercent,
                    TimeMs = submitItem.TimeMs,
                    NumberAttemps = session.NumberAttemps,
                    CreatedAt = DateTime.UtcNow
                };

                _context.InterviewAnswersNew.Add(answer);
            }

            // Update session
            session.CorrectCount = correctCount;
            session.IncorrectCount = session.TotalItems - correctCount;
            session.TotalTimeSec = totalTimeMs / 1000;
            session.SubmittedAt = DateTime.UtcNow;
            session.Status = "Submitted";

            await _context.SaveChangesAsync();

            _logger.LogInformation("Interview session submitted: {SessionId} for user {UserId}", sessionId, userId);

            return await GetSummaryInternal(session);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting answers for session {SessionId}", sessionId);
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    [HttpGet("sessions/{sessionId}/summary")]
    public async Task<ActionResult<InterviewSummaryDto>> GetSummary(Guid sessionId)
    {
        try
        {
            var userId = GetUserId();
            if (userId == Guid.Empty)
                return Unauthorized();

            var session = await _context.InterviewSessionsNew
                .Include(s => s.Answers)
                .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId);

            if (session == null)
                return NotFound(new { message = "Session not found" });

            return await GetSummaryInternal(session);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting summary for session {SessionId}", sessionId);
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    [HttpPost("sessions/{sessionId}/retake")]
    public async Task<ActionResult<RetakeResponse>> RetakeInterview(Guid sessionId)
    {
        try
        {
            var userId = GetUserId();
            if (userId == Guid.Empty)
                return Unauthorized();

            var originalSession = await _context.InterviewSessionsNew
                .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId);

            if (originalSession == null)
                return NotFound(new { message = "Session not found" });

            if (originalSession.Status != "Submitted")
                return BadRequest(new { message = "Can only retake submitted sessions" });

            // Get template from assignment
            var assignmentForRetake = await _context.SessionAssignments
                .Include(sa => sa.Template)
                .FirstOrDefaultAsync(sa => sa.Id == originalSession.AssignmentId);

            var template = assignmentForRetake?.Template;
            if (template == null)
                return NotFound(new { message = "Template not found" });

            var questions = await GetTemplateQuestions(template);

            // Create new session with incremented attempts
            var newSession = new InterviewSessionNew
            {
                UserId = userId,
                AssignmentId = originalSession.AssignmentId,
                Status = "Active",
                StartedAt = DateTime.UtcNow,
                NumberAttemps = originalSession.NumberAttemps + 1,
                TotalItems = questions.Count()
            };

            _context.InterviewSessionsNew.Add(newSession);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Interview session retake created: {SessionId} for user {UserId}", newSession.Id, userId);

            return Ok(new RetakeResponse(newSession.Id, newSession.NumberAttemps));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating retake for session {SessionId}", sessionId);
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    [HttpGet("sessions/{sessionId}/review")]
    public async Task<ActionResult<object>> GetReview(Guid sessionId)
    {
        try
        {
            var userId = GetUserId();
            if (userId == Guid.Empty)
                return Unauthorized();

            var session = await _context.InterviewSessionsNew
                .Include(s => s.Answers)
                .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId);

            if (session == null)
                return NotFound(new { message = "Session not found" });

            // Get template from assignment
            var assignmentForReview = await _context.SessionAssignments
                .Include(sa => sa.Template)
                .FirstOrDefaultAsync(sa => sa.Id == session.AssignmentId);

            var template = assignmentForReview?.Template;
            if (template == null)
                return NotFound(new { message = "Template not found" });

            var questions = await GetTemplateQuestions(template);
            var questionDict = questions.ToDictionary(q => q.Id, q => q);

            var reviewData = session.Answers.Select(a =>
            {
                var question = questionDict.GetValueOrDefault(a.QuestionId);
                var selectedOptions = new List<Guid>();

                if (!string.IsNullOrEmpty(a.ChosenOptionIdsJson))
                {
                    try
                    {
                        selectedOptions = JsonSerializer.Deserialize<List<Guid>>(a.ChosenOptionIdsJson) ?? new List<Guid>();
                    }
                    catch { }
                }

                return new
                {
                    QuestionId = a.QuestionId,
                    QuestionText = question?.Text ?? "",
                    Type = a.Type,
                    GivenText = a.GivenText,
                    SelectedOptions = selectedOptions,
                    IsCorrect = a.IsCorrect,
                    MatchPercent = a.MatchPercent,
                    TimeMs = a.TimeMs,
                    Options = question?.Options.Select(o => new { o.Id, o.Text, o.IsCorrect }).ToList()
                };
            }).ToList();

            return Ok(new { SessionId = sessionId, Questions = reviewData });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting review for session {SessionId}", sessionId);
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    private async Task<List<Question>> GetTemplateQuestions(InterviewTemplate template)
    {
        // Parse selection criteria from JSON
        var selectionCriteria = JsonSerializer.Deserialize<Dictionary<string, object>>(template.SelectionCriteriaJson ?? "{}");

        var query = _context.Questions
            .Include(q => q.Topic)
            .Include(q => q.Options)
            .AsQueryable();

        // Apply filters based on selection criteria
        if (selectionCriteria.ContainsKey("topicIds"))
        {
            var topicIds = JsonSerializer.Deserialize<List<int>>(selectionCriteria["topicIds"].ToString() ?? "[]");
            if (topicIds?.Any() == true)
                query = query.Where(q => topicIds.Contains(q.TopicId));
        }

        if (selectionCriteria.ContainsKey("levels"))
        {
            var levels = JsonSerializer.Deserialize<List<string>>(selectionCriteria["levels"].ToString() ?? "[]");
            if (levels?.Any() == true)
            {
                var levelEnums = levels.Select(l => Enum.TryParse<DifficultyLevel>(l, true, out var level) ? level : DifficultyLevel.Basic).ToList();
                query = query.Where(q => levelEnums.Contains(q.Level));
            }
        }

        var questions = await query.ToListAsync();

        // Take only the specified number of questions if configured
        if (selectionCriteria.ContainsKey("maxQuestions"))
        {
            if (int.TryParse(selectionCriteria["maxQuestions"].ToString(), out var maxQuestions) && maxQuestions > 0)
                questions = questions.Take(maxQuestions).ToList();
        }

        return questions;
    }

    private async Task<ActionResult<InterviewSummaryDto>> GetSummaryInternal(InterviewSessionNew session)
    {
        // Get template from assignment
        var assignmentForSummary = await _context.SessionAssignments
            .Include(sa => sa.Template)
            .FirstOrDefaultAsync(sa => sa.Id == session.AssignmentId);

        var template = assignmentForSummary?.Template;
        if (template == null)
            return NotFound(new { message = "Template not found" });

        var questions = await GetTemplateQuestions(template);
        var questionDict = questions.ToDictionary(q => q.Id, q => q);

        // Calculate summary slices
        var byTopic = session.Answers
            .Where(a => questionDict.ContainsKey(a.QuestionId))
            .GroupBy(a => questionDict[a.QuestionId].Topic?.Name ?? "General")
            .Select(g => new SummarySlice(
                g.Key,
                g.Count(a => a.IsCorrect),
                g.Count(),
                g.Count() > 0 ? Math.Round((double)g.Count(a => a.IsCorrect) / g.Count() * 100, 2) : 0
            )).ToList();

        var byType = session.Answers
            .GroupBy(a => a.Type)
            .Select(g => new SummarySlice(
                g.Key,
                g.Count(a => a.IsCorrect),
                g.Count(),
                g.Count() > 0 ? Math.Round((double)g.Count(a => a.IsCorrect) / g.Count() * 100, 2) : 0
            )).ToList();

        var byLevel = session.Answers
            .Where(a => questionDict.ContainsKey(a.QuestionId))
            .GroupBy(a => GetLevelString(questionDict[a.QuestionId].Level))
            .Select(g => new SummarySlice(
                g.Key,
                g.Count(a => a.IsCorrect),
                g.Count(),
                g.Count() > 0 ? Math.Round((double)g.Count(a => a.IsCorrect) / g.Count() * 100, 2) : 0
            )).ToList();

        var summary = new InterviewSummaryDto(
            session.Id,
            session.StartedAt,
            session.SubmittedAt ?? DateTime.UtcNow,
            session.TotalItems,
            session.CorrectCount,
            session.IncorrectCount,
            session.TotalTimeSec,
            byTopic,
            byType,
            byLevel
        );

        return Ok(summary);
    }

    private static string GetQuestionTypeString(QuestionType type)
    {
        return type switch
        {
            QuestionType.SingleChoice => "single",
            QuestionType.MultiChoice => "multiple",
            QuestionType.Written => "written",
            _ => "single"
        };
    }

    private static string GetLevelString(DifficultyLevel level)
    {
        return level switch
        {
            DifficultyLevel.Basic => "Basic",
            DifficultyLevel.Intermediate => "Intermediate",
            DifficultyLevel.Advanced => "Advanced",
            _ => "Basic"
        };
    }
}