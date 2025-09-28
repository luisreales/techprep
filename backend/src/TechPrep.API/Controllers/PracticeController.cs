using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechPrep.Application.DTOs.Common;
using TechPrep.Application.DTOs.PracticeInterview;
using TechPrep.Application.Interfaces;
using TechPrep.Core.Enums;
using TechPrep.Core.Entities;
using TechPrep.Infrastructure.Data;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace TechPrep.API.Controllers;

public class SubmitPracticeAttemptRequest
{
    public string Answer { get; set; } = string.Empty;
    public int TimeSpent { get; set; } // in milliseconds
}

public class UpdateProgressRequest
{
    public int CurrentQuestionIndex { get; set; }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PracticeController : ControllerBase
{
    private readonly IPracticeSessionService _practiceSessionService;
    private readonly ISessionAssignmentService _assignmentService;
    private readonly TechPrepDbContext _context;

    public PracticeController(
        IPracticeSessionService practiceSessionService,
        ISessionAssignmentService assignmentService,
        TechPrepDbContext context)
    {
        _practiceSessionService = practiceSessionService;
        _assignmentService = assignmentService;
        _context = context;
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim ?? throw new UnauthorizedAccessException("User not authenticated"));
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PaginatedResponse<AssignmentDto>>>> GetAvailablePractices(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var userId = GetCurrentUserId();
        var result = await _assignmentService.GetMyAssignmentsAsync(userId, TemplateKind.Practice, page, pageSize);
        return Ok(result);
    }

    [HttpPost("start")]
    public async Task<ActionResult<ApiResponse<PracticeSessionDto>>> StartPractice([FromBody] StartPracticeDto startDto)
    {
        var userId = GetCurrentUserId();
        var result = await _practiceSessionService.StartPracticeAsync(userId, startDto);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPost("start-direct")]
    public async Task<ActionResult> StartDirectPractice([FromBody] StartDirectPracticeDto request)
    {
        Console.WriteLine("🎯 StartDirectPractice endpoint called");
        Console.WriteLine($"📨 Request data: TopicId={request.TopicId}, Level={request.Level}, QuestionCount={request.QuestionCount}");

        var userId = GetCurrentUserId();
        Console.WriteLine($"👤 User ID: {userId}");
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { success = false, message = "Invalid user token" });
        }

        // Fetch questions based on the request parameters
        var questionsQuery = _context.Questions
            .Include(q => q.Options)
            .Include(q => q.Topic)
            .Where(q => q.UsableInPractice == true)
            .AsQueryable();

        // Collect the topic IDs that will be used
        var topicIds = new List<int>();

        if (request.TopicId.HasValue)
        {
            questionsQuery = questionsQuery.Where(q => q.TopicId == request.TopicId.Value);
            topicIds.Add(request.TopicId.Value);
        }
        else
        {
            // If no specific topic, get all topics represented in the questions
            topicIds = await questionsQuery.Select(q => q.TopicId).Distinct().ToListAsync();
        }

        if (!string.IsNullOrEmpty(request.Level))
        {
            // Support multiple levels separated by commas
            var levelStrings = request.Level.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(l => l.Trim())
                .ToList();

            // Convert string levels to enum values
            var validLevels = new List<DifficultyLevel>();
            foreach (var levelString in levelStrings)
            {
                if (Enum.TryParse<DifficultyLevel>(levelString, true, out var level))
                {
                    validLevels.Add(level);
                }
            }

            if (validLevels.Any())
            {
                questionsQuery = questionsQuery.Where(q => validLevels.Contains(q.Level));
            }
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
            AssignmentId = null, // No assignment for direct practice
            Status = SessionStatus.InProgress, // Start as InProgress since user is actively starting
            StartedAt = DateTime.UtcNow,
            TotalItems = questions.Count,
            CorrectCount = 0,
            IncorrectCount = 0,
            TotalScore = 0,
            CurrentQuestionIndex = 0
        };

        _context.PracticeSessionsNew.Add(session);
        await _context.SaveChangesAsync();

        // Add the topics associated with this session
        var actualTopicIds = questions.Select(q => q.TopicId).Distinct().ToList();
        foreach (var topicId in actualTopicIds)
        {
            var sessionTopic = new PracticeSessionTopic
            {
                PracticeSessionId = session.Id,
                TopicId = topicId
            };
            _context.PracticeSessionTopics.Add(sessionTopic);
        }

        await _context.SaveChangesAsync();

        return Ok(new {
            success = true,
            data = new {
                sessionId = session.Id,
                questionCount = questions.Count,
                questions = questions.Select(q => new
                {
                    id = q.Id,
                    text = q.Text,
                    type = q.Type.ToString(),
                    level = q.Level.ToString(),
                    topicId = q.TopicId,
                    topicName = q.Topic?.Name,
                    options = q.Options.Select(o => new {
                        id = o.Id,
                        text = o.Text,
                        isCorrect = o.IsCorrect,
                        orderIndex = o.OrderIndex
                    }).ToList()
                }).ToList()
            }
        });
    }

    [HttpPost("{sessionId}/answer")]
    public async Task<ActionResult<ApiResponse<PracticeAnswerDto>>> SubmitAnswer(
        Guid sessionId,
        [FromBody] SubmitAnswerDto answerDto)
    {
        var result = await _practiceSessionService.SubmitAnswerAsync(sessionId, answerDto);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPatch("{sessionId}/state")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateSessionState(
        Guid sessionId,
        [FromBody] SessionStateDto stateDto)
    {
        var result = await _practiceSessionService.UpdateSessionStateAsync(sessionId, stateDto);
        return Ok(result);
    }

    [HttpPost("{sessionId}/submit")]
    public async Task<ActionResult<ApiResponse<PracticeSessionDto>>> SubmitPractice(Guid sessionId)
    {
        var result = await _practiceSessionService.SubmitPracticeAsync(sessionId);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpGet("{sessionId}")]
    public async Task<ActionResult> GetSession(Guid sessionId)
    {
        try
        {
            var userId = GetCurrentUserId();

            var session = await _context.PracticeSessionsNew
                .Include(s => s.Topics)
                .ThenInclude(st => st.Topic)
                .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId);

            if (session == null)
            {
                return NotFound(new { success = false, message = "Session not found" });
            }

            // Get questions from this session - for now, we'll generate them again based on criteria
            // In a real implementation, you'd store the specific questions used in a session
            var questionsQuery = _context.Questions
                .Include(q => q.Options)
                .Include(q => q.Topic)
                .Where(q => q.UsableInPractice == true);

            // Filter by session topics
            var topicIds = session.Topics.Select(st => st.TopicId).ToList();
            if (topicIds.Any())
            {
                questionsQuery = questionsQuery.Where(q => topicIds.Contains(q.TopicId));
            }

            var questions = await questionsQuery
                .Take(session.TotalItems)
                .ToListAsync();

            var result = new
            {
                id = session.Id,
                status = session.Status.ToString(),
                startedAt = session.StartedAt,
                finishedAt = session.FinishedAt,
                totalItems = session.TotalItems,
                currentQuestionIndex = session.CurrentQuestionIndex,
                correctCount = session.CorrectCount,
                incorrectCount = session.IncorrectCount,
                totalScore = session.TotalScore,
                questions = questions.Select(q => new
                {
                    id = q.Id,
                    text = q.Text,
                    type = q.Type.ToString(),
                    level = q.Level.ToString(),
                    topicId = q.TopicId,
                    topicName = q.Topic?.Name,
                    options = q.Options.Select(o => new {
                        id = o.Id,
                        text = o.Text,
                        isCorrect = o.IsCorrect,
                        orderIndex = o.OrderIndex
                    }).ToList()
                }).ToList()
            };

            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [HttpPost("{sessionId}/pause")]
    public async Task<ActionResult<ApiResponse<PracticeSessionDto>>> PauseSession(Guid sessionId)
    {
        var result = await _practiceSessionService.PauseSessionAsync(sessionId);
        return Ok(result);
    }

    [HttpPost("{sessionId}/resume")]
    public async Task<ActionResult<ApiResponse<PracticeSessionDto>>> ResumeSession(Guid sessionId)
    {
        var result = await _practiceSessionService.ResumeSessionAsync(sessionId);
        return Ok(result);
    }

    [HttpGet("my-sessions")]
    public async Task<ActionResult<ApiResponse<PaginatedResponse<PracticeSessionDto>>>> GetMySessions(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var userId = GetCurrentUserId();
        var result = await _practiceSessionService.GetMySessionsAsync(userId, page, pageSize);
        return Ok(result);
    }

    [HttpGet("sessions")]
    public async Task<ActionResult> GetPracticeSessions([FromQuery] int? topicId, [FromQuery] string? status)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { success = false, message = "Invalid user token" });
        }

        var sessionsQuery = _context.PracticeSessionsNew
            .Include(s => s.Topics)
            .ThenInclude(st => st.Topic)
            .Where(s => s.UserId == userId)
            .AsQueryable();

        if (topicId.HasValue)
        {
            sessionsQuery = sessionsQuery.Where(s => s.Topics.Any(st => st.TopicId == topicId.Value));
        }

        if (!string.IsNullOrEmpty(status))
        {
            if (Enum.TryParse<SessionStatus>(status, true, out var sessionStatus))
            {
                sessionsQuery = sessionsQuery.Where(s => s.Status == sessionStatus);
            }
        }

        var sessions = await sessionsQuery
            .OrderByDescending(s => s.StartedAt)
            .Select(s => new
            {
                id = s.Id,
                topicId = s.Topics.FirstOrDefault() != null ? s.Topics.FirstOrDefault()!.TopicId : (int?)null,
                topicName = s.Topics.Any() ? string.Join(", ", s.Topics.Select(st => st.Topic.Name)) : "Mixed Topics",
                level = "Mixed", // Could be enhanced to track actual levels used
                questionCount = s.TotalItems,
                status = s.Status.ToString(),
                startedAt = s.StartedAt,
                finishedAt = s.FinishedAt,
                totalScore = s.TotalScore,
                correctCount = s.CorrectCount,
                incorrectCount = s.IncorrectCount,
                totalItems = s.TotalItems,
                currentQuestionIndex = s.CurrentQuestionIndex,
                topics = s.Topics.Select(st => new { id = st.TopicId, name = st.Topic.Name }).ToList()
            })
            .ToListAsync();

        return Ok(new { success = true, data = sessions });
    }

    [HttpGet("progress")]
    public async Task<ActionResult<ApiResponse<object>>> GetPracticeProgress()
    {
        try
        {
            var userId = GetCurrentUserId();

            // Get overall practice statistics
            var totalAttempts = await _context.PracticeAnswers
                .Join(_context.PracticeSessionsNew,
                    a => a.PracticeSessionId,
                    s => s.Id,
                    (a, s) => new { Answer = a, Session = s })
                .Where(x => x.Session.UserId == userId)
                .CountAsync();

            var correctAttempts = await _context.PracticeAnswers
                .Join(_context.PracticeSessionsNew,
                    a => a.PracticeSessionId,
                    s => s.Id,
                    (a, s) => new { Answer = a, Session = s })
                .Where(x => x.Session.UserId == userId && x.Answer.IsCorrect)
                .CountAsync();

            var totalSessions = await _context.PracticeSessionsNew
                .Where(s => s.UserId == userId)
                .CountAsync();

            var completedSessions = await _context.PracticeSessionsNew
                .Where(s => s.UserId == userId && s.Status == SessionStatus.Completed)
                .CountAsync();

            // Get topic-wise progress
            var topicProgress = await _context.PracticeAnswers
                .Join(_context.PracticeSessionsNew,
                    a => a.PracticeSessionId,
                    s => s.Id,
                    (a, s) => new { Answer = a, Session = s })
                .Join(_context.Questions,
                    x => x.Answer.QuestionId,
                    q => q.Id,
                    (x, q) => new { x.Answer, x.Session, Question = q })
                .Join(_context.Topics,
                    x => x.Question.TopicId,
                    t => t.Id,
                    (x, t) => new { x.Answer, x.Session, x.Question, Topic = t })
                .Where(x => x.Session.UserId == userId)
                .GroupBy(x => new { x.Topic.Id, x.Topic.Name })
                .Select(g => new
                {
                    topicId = g.Key.Id,
                    topicName = g.Key.Name,
                    totalQuestions = g.Count(),
                    correctAnswers = g.Count(x => x.Answer.IsCorrect),
                    accuracy = g.Count() > 0 ? (decimal)g.Count(x => x.Answer.IsCorrect) / g.Count() * 100 : 0
                })
                .ToListAsync();

            var result = new
            {
                totalAttempts,
                correctAttempts,
                accuracy = totalAttempts > 0 ? (decimal)correctAttempts / totalAttempts * 100 : 0,
                totalSessions,
                completedSessions,
                topicProgress
            };

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data = result,
                Message = "Practice progress retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = ex.Message,
                Error = new ErrorDetails
                {
                    Code = "PROGRESS_ERROR",
                    Message = ex.Message
                }
            });
        }
    }

    [HttpGet("questions/{questionId}")]
    public async Task<ActionResult<ApiResponse<object>>> GetPracticeQuestion(Guid questionId)
    {
        try
        {
            var userId = GetCurrentUserId();

            var question = await _context.Questions
                .Include(q => q.Topic)
                .Include(q => q.Options)
                .Include(q => q.ResourceLinks)
                .ThenInclude(rl => rl.Resource)
                .FirstOrDefaultAsync(q => q.Id == questionId && q.UsableInPractice == true);

            if (question == null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Question not found or not available for practice"
                });
            }

            // Get user's attempts for this question
            var attempts = await _context.PracticeAnswers
                .Join(_context.PracticeSessionsNew,
                    a => a.PracticeSessionId,
                    s => s.Id,
                    (a, s) => new { Answer = a, Session = s })
                .Where(x => x.Session.UserId == userId && x.Answer.QuestionId == questionId)
                .Select(x => new
                {
                    id = x.Answer.Id,
                    answer = x.Answer.GivenAnswer,
                    isCorrect = x.Answer.IsCorrect,
                    matchPercentage = x.Answer.MatchPercentage,
                    timeSpent = x.Answer.TimeSpentSec,
                    createdAt = x.Answer.AnsweredAt
                })
                .OrderByDescending(x => x.createdAt)
                .ToListAsync();

            var result = new
            {
                id = question.Id,
                text = question.Text,
                type = question.Type.ToString(),
                level = question.Level.ToString(),
                topicId = question.TopicId,
                topicName = question.Topic?.Name,
                officialAnswer = question.OfficialAnswer,
                hintSummary = question.HintSummary,
                isBookmarked = false, // TODO: Implement bookmark functionality
                options = question.Options.Select(o => new
                {
                    id = o.Id,
                    text = o.Text,
                    isCorrect = o.IsCorrect,
                    orderIndex = o.OrderIndex
                }).OrderBy(o => o.orderIndex).ToList(),
                resources = question.ResourceLinks?.Select(rl => new
                {
                    id = rl.ResourceId,
                    title = rl.Resource?.Title ?? "",
                    url = rl.Resource?.Url ?? "",
                    type = rl.Resource?.Kind.ToString() ?? "",
                    description = rl.Resource?.Description ?? "",
                    difficulty = rl.Resource?.Difficulty?.ToString() ?? "Basic"
                }).Cast<object>().ToList() ?? new List<object>(),
                attempts = attempts,
                attemptCount = attempts.Count,
                lastAttemptAt = attempts.FirstOrDefault()?.createdAt,
                bestScore = attempts.Any() ? attempts.Max(a => a.isCorrect ? 1 : 0) : 0
            };

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data = result,
                Message = "Question retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = ex.Message,
                Error = new ErrorDetails
                {
                    Code = "QUESTION_ERROR",
                    Message = ex.Message
                }
            });
        }
    }

    [HttpPost("questions/{questionId}/attempt")]
    public async Task<ActionResult<ApiResponse<object>>> SubmitPracticeAttempt(
        Guid questionId,
        [FromBody] SubmitPracticeAttemptRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();

            // Get the question to validate it exists and is available for practice
            var question = await _context.Questions
                .Include(q => q.Options)
                .FirstOrDefaultAsync(q => q.Id == questionId && q.UsableInPractice == true);

            if (question == null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Question not found or not available for practice"
                });
            }

            // For now, create a simple practice session if none exists
            // In a real scenario, this should be part of an active practice session
            var practiceSession = await _context.PracticeSessionsNew
                .FirstOrDefaultAsync(s => s.UserId == userId && s.Status == SessionStatus.InProgress);

            if (practiceSession == null)
            {
                // Create a simple session for standalone practice
                practiceSession = new PracticeSessionNew
                {
                    UserId = userId,
                    Status = SessionStatus.InProgress,
                    StartedAt = DateTime.UtcNow,
                    TotalItems = 1,
                    CurrentQuestionIndex = 0
                };
                _context.PracticeSessionsNew.Add(practiceSession);
                await _context.SaveChangesAsync();
            }

            // Evaluate the answer (simplified version)
            bool isCorrect = false;
            decimal? matchPercentage = null;

            switch (question.Type)
            {
                case QuestionType.SingleChoice:
                case QuestionType.MultiChoice:
                    // For choice questions, check if the answer matches correct options
                    var correctOptionIds = question.Options.Where(o => o.IsCorrect).Select(o => o.Id.ToString()).ToList();
                    isCorrect = correctOptionIds.Contains(request.Answer);
                    matchPercentage = isCorrect ? 100m : 0m;
                    break;
                case QuestionType.Written:
                    // Simple text matching for written questions
                    if (!string.IsNullOrEmpty(question.OfficialAnswer) && !string.IsNullOrEmpty(request.Answer))
                    {
                        var normalizedOfficial = question.OfficialAnswer.ToLowerInvariant().Trim();
                        var normalizedUser = request.Answer.ToLowerInvariant().Trim();
                        matchPercentage = normalizedUser.Contains(normalizedOfficial) ? 100m :
                                         normalizedOfficial.Contains(normalizedUser) ? 80m : 0m;
                        isCorrect = matchPercentage >= 80m;
                    }
                    break;
            }

            // Create practice answer record
            var practiceAnswer = new PracticeAnswer
            {
                Id = Guid.NewGuid(),
                PracticeSessionId = practiceSession.Id,
                QuestionId = questionId,
                GivenAnswer = request.Answer,
                IsCorrect = isCorrect,
                MatchPercentage = matchPercentage,
                Score = isCorrect ? 1 : 0,
                TimeSpentSec = request.TimeSpent / 1000, // Convert from milliseconds to seconds
                TimeMs = request.TimeSpent,
                AnsweredAt = DateTime.UtcNow
            };

            _context.PracticeAnswers.Add(practiceAnswer);

            // Update session stats
            if (isCorrect)
            {
                practiceSession.CorrectCount += 1;
                practiceSession.TotalScore += 1;
            }
            else
            {
                practiceSession.IncorrectCount += 1;
            }

            await _context.SaveChangesAsync();

            var result = new
            {
                isCorrect,
                matchPercentage,
                correctAnswer = question.OfficialAnswer,
                explanation = question.OfficialAnswer,
                timeSpent = request.TimeSpent
            };

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data = result,
                Message = "Practice attempt submitted successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = ex.Message,
                Error = new ErrorDetails
                {
                    Code = "ATTEMPT_ERROR",
                    Message = ex.Message
                }
            });
        }
    }

    [HttpPost("{sessionId}/complete")]
    public async Task<ActionResult> CompleteSession(Guid sessionId)
    {
        try
        {
            var userId = GetCurrentUserId();

            var session = await _context.PracticeSessionsNew
                .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId);

            if (session == null)
            {
                return NotFound(new { success = false, message = "Session not found" });
            }

            // Update session status to completed
            session.Status = SessionStatus.Completed;
            session.FinishedAt = DateTime.UtcNow;
            session.CurrentQuestionIndex = session.TotalItems; // Mark all questions as completed

            await _context.SaveChangesAsync();

            return Ok(new {
                success = true,
                message = "Session completed successfully",
                data = new {
                    sessionId = session.Id,
                    status = session.Status.ToString(),
                    finishedAt = session.FinishedAt
                }
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [HttpPost("{sessionId}/update-progress")]
    public async Task<ActionResult> UpdateSessionProgress(Guid sessionId, [FromBody] UpdateProgressRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();

            var session = await _context.PracticeSessionsNew
                .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId);

            if (session == null)
            {
                return NotFound(new { success = false, message = "Session not found" });
            }

            // Update current question index
            session.CurrentQuestionIndex = request.CurrentQuestionIndex;

            await _context.SaveChangesAsync();

            return Ok(new {
                success = true,
                message = "Progress updated successfully",
                data = new {
                    sessionId = session.Id,
                    currentQuestionIndex = session.CurrentQuestionIndex
                }
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [HttpGet("questions")]
    public async Task<ActionResult<ApiResponse<object>>> GetPracticeQuestions(
        [FromQuery] int page = 1,
        [FromQuery] int limit = 12,
        [FromQuery] string? search = null,
        [FromQuery] int? topicId = null,
        [FromQuery] string? level = null,
        [FromQuery] string? type = null,
        [FromQuery] bool includeAttemptStats = false)
    {
        try
        {
            var userId = GetCurrentUserId();

            var questionsQuery = _context.Questions
                .Include(q => q.Topic)
                .Include(q => q.Options)
                .Where(q => q.UsableInPractice == true)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(search))
            {
                questionsQuery = questionsQuery.Where(q => q.Text.Contains(search));
            }

            if (topicId.HasValue)
            {
                questionsQuery = questionsQuery.Where(q => q.TopicId == topicId.Value);
            }

            if (!string.IsNullOrEmpty(level))
            {
                if (Enum.TryParse<DifficultyLevel>(level, true, out var difficultyLevel))
                {
                    questionsQuery = questionsQuery.Where(q => q.Level == difficultyLevel);
                }
            }

            if (!string.IsNullOrEmpty(type))
            {
                if (Enum.TryParse<QuestionType>(type, true, out var questionType))
                {
                    questionsQuery = questionsQuery.Where(q => q.Type == questionType);
                }
            }

            var totalCount = await questionsQuery.CountAsync();

            var questions = await questionsQuery
                .Skip((page - 1) * limit)
                .Take(limit)
                .Select(q => new
                {
                    id = q.Id,
                    text = q.Text,
                    type = q.Type.ToString(),
                    level = q.Level.ToString(),
                    topicId = q.TopicId,
                    topic = q.Topic != null ? new { id = q.Topic.Id, name = q.Topic.Name } : null,
                    officialAnswer = q.OfficialAnswer,
                    options = q.Options.Select(o => new
                    {
                        id = o.Id,
                        text = o.Text,
                        isCorrect = o.IsCorrect,
                        orderIndex = o.OrderIndex
                    }).ToList()
                })
                .ToListAsync();

            var result = new
            {
                questions,
                pagination = new
                {
                    page,
                    limit,
                    totalCount,
                    totalPages = (int)Math.Ceiling((double)totalCount / limit),
                    hasNext = page * limit < totalCount,
                    hasPrevious = page > 1
                }
            };

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data = result,
                Message = "Questions retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = ex.Message,
                Error = new ErrorDetails
                {
                    Code = "QUESTIONS_ERROR",
                    Message = ex.Message
                }
            });
        }
    }
}