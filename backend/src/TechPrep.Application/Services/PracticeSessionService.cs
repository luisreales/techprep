using AutoMapper;
using TechPrep.Application.DTOs.Common;
using TechPrep.Application.DTOs.PracticeInterview;
using TechPrep.Application.Interfaces;
using TechPrep.Core.Entities;
using TechPrep.Core.Enums;
using TechPrep.Core.Interfaces;

namespace TechPrep.Application.Services;

public class PracticeSessionService : IPracticeSessionService
{
    private readonly IPracticeSessionRepository _sessionRepository;
    private readonly ISessionAssignmentRepository _assignmentRepository;
    private readonly IQuestionService _questionService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IEvaluationService _evaluationService;
    private readonly IMapper _mapper;

    public PracticeSessionService(
        IPracticeSessionRepository sessionRepository,
        ISessionAssignmentRepository assignmentRepository,
        IQuestionService questionService,
        IUnitOfWork unitOfWork,
        IEvaluationService evaluationService,
        IMapper mapper)
    {
        _sessionRepository = sessionRepository;
        _assignmentRepository = assignmentRepository;
        _questionService = questionService;
        _unitOfWork = unitOfWork;
        _evaluationService = evaluationService;
        _mapper = mapper;
    }

    public async Task<ApiResponse<PracticeSessionDto>> StartPracticeAsync(Guid userId, StartPracticeDto startDto)
    {
        try
        {
            // Check if assignment exists and user has access
            var assignment = await _assignmentRepository.GetWithDetailsAsync(startDto.AssignmentId);
            if (assignment == null)
            {
                return ApiResponse<PracticeSessionDto>.ErrorResponse(
                    "ASSIGNMENT_NOT_FOUND", "Assignment not found");
            }

            // Check for existing active session
            var existingSession = await _sessionRepository.GetActiveSessionAsync(userId, startDto.AssignmentId);
            if (existingSession != null)
            {
                var existingDto = _mapper.Map<PracticeSessionDto>(existingSession);
                return ApiResponse<PracticeSessionDto>.SuccessResponse(existingDto, "Resumed existing session");
            }

            // Create new session
            var session = new PracticeSessionNew
            {
                UserId = userId,
                AssignmentId = startDto.AssignmentId,
                Status = SessionStatus.InProgress,
                StartedAt = DateTime.UtcNow,
                CurrentQuestionIndex = 0
            };

            await _sessionRepository.AddAsync(session);

            var sessionDto = _mapper.Map<PracticeSessionDto>(session);
            return ApiResponse<PracticeSessionDto>.SuccessResponse(sessionDto, "Practice session started");
        }
        catch (Exception ex)
        {
            return ApiResponse<PracticeSessionDto>.ErrorResponse(
                "START_PRACTICE_ERROR", "Failed to start practice session", ex.Message);
        }
    }

    public async Task<ApiResponse<PracticeAnswerDto>> SubmitAnswerAsync(Guid sessionId, SubmitAnswerDto answerDto)
    {
        try
        {
            var session = await _sessionRepository.GetWithAnswersAsync(sessionId);
            if (session == null)
            {
                return ApiResponse<PracticeAnswerDto>.ErrorResponse(
                    "SESSION_NOT_FOUND", "Practice session not found");
            }

            if (session.Status != SessionStatus.InProgress)
            {
                return ApiResponse<PracticeAnswerDto>.ErrorResponse(
                    "INVALID_SESSION_STATUS", "Session is not active");
            }

            // Create practice answer with immediate evaluation
            var answer = new PracticeAnswer
            {
                PracticeSessionId = sessionId,
                QuestionId = answerDto.QuestionId,
                SelectedOptionIds = answerDto.SelectedOptionIds != null ?
                    System.Text.Json.JsonSerializer.Serialize(answerDto.SelectedOptionIds) : null,
                GivenText = answerDto.GivenText,
                TimeSpentSec = answerDto.TimeSpentSec,
                AnsweredAt = DateTime.UtcNow
            };

            // Evaluate answer (simplified logic)
            var evaluationResult = await EvaluateAnswerAsync(answerDto);
            answer.IsCorrect = evaluationResult.IsCorrect;
            answer.Score = evaluationResult.Score;

            // Add answer to session
            session.Answers.Add(answer);
            session.CurrentQuestionIndex++;

            _sessionRepository.Update(session);

            var answerResponseDto = new PracticeAnswerDto
            {
                Id = answer.Id,
                QuestionId = answer.QuestionId,
                SelectedOptionIds = answerDto.SelectedOptionIds,
                GivenText = answer.GivenText,
                IsCorrect = answer.IsCorrect,
                Score = answer.Score,
                AnsweredAt = answer.AnsweredAt,
                TimeSpentSec = answer.TimeSpentSec,
                Explanation = evaluationResult.Explanation,
                SuggestedResources = evaluationResult.SuggestedResources
            };

            return ApiResponse<PracticeAnswerDto>.SuccessResponse(answerResponseDto, "Answer submitted successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<PracticeAnswerDto>.ErrorResponse(
                "SUBMIT_ANSWER_ERROR", "Failed to submit answer", ex.Message);
        }
    }

    public async Task<ApiResponse<object>> UpdateSessionStateAsync(Guid sessionId, SessionStateDto stateDto)
    {
        try
        {
            var session = await _sessionRepository.GetByIdAsync(sessionId);
            if (session == null)
            {
                return ApiResponse<object>.ErrorResponse(
                    "SESSION_NOT_FOUND", "Practice session not found");
            }

            session.CurrentQuestionState = stateDto.CurrentQuestionState;
            session.CurrentQuestionIndex = stateDto.CurrentQuestionIndex;

            _sessionRepository.Update(session);

            return ApiResponse<object>.SuccessResponse(null, "Session state updated");
        }
        catch (Exception ex)
        {
            return ApiResponse<object>.ErrorResponse(
                "UPDATE_STATE_ERROR", "Failed to update session state", ex.Message);
        }
    }

    public async Task<ApiResponse<PracticeSessionDto>> SubmitPracticeAsync(Guid sessionId)
    {
        try
        {
            var session = await _sessionRepository.GetWithAnswersAsync(sessionId);
            if (session == null)
            {
                return ApiResponse<PracticeSessionDto>.ErrorResponse(
                    "SESSION_NOT_FOUND", "Practice session not found");
            }

            session.Status = SessionStatus.Completed;
            session.SubmittedAt = DateTime.UtcNow;
            session.TotalScore = session.Answers.Sum(a => (int)a.Score);
            session.TotalTimeSec = (int)(DateTime.UtcNow - session.StartedAt).TotalSeconds;

            _sessionRepository.Update(session);

            var sessionDto = _mapper.Map<PracticeSessionDto>(session);
            return ApiResponse<PracticeSessionDto>.SuccessResponse(sessionDto, "Practice session completed");
        }
        catch (Exception ex)
        {
            return ApiResponse<PracticeSessionDto>.ErrorResponse(
                "SUBMIT_PRACTICE_ERROR", "Failed to submit practice session", ex.Message);
        }
    }

    public async Task<ApiResponse<PracticeSessionDto>> GetSessionAsync(Guid sessionId)
    {
        try
        {
            var session = await _sessionRepository.GetWithAnswersAsync(sessionId);
            if (session == null)
            {
                return ApiResponse<PracticeSessionDto>.ErrorResponse(
                    "SESSION_NOT_FOUND", "Practice session not found");
            }

            var sessionDto = _mapper.Map<PracticeSessionDto>(session);
            return ApiResponse<PracticeSessionDto>.SuccessResponse(sessionDto);
        }
        catch (Exception ex)
        {
            return ApiResponse<PracticeSessionDto>.ErrorResponse(
                "GET_SESSION_ERROR", "Failed to get practice session", ex.Message);
        }
    }

    public async Task<ApiResponse<PaginatedResponse<PracticeSessionDto>>> GetMySessionsAsync(Guid userId, int page = 1, int pageSize = 10)
    {
        try
        {
            var sessions = await _sessionRepository.GetByUserIdAsync(userId);
            var totalCount = sessions.Count();
            var pagedSessions = sessions.Skip((page - 1) * pageSize).Take(pageSize).ToList();

            var sessionDtos = _mapper.Map<List<PracticeSessionDto>>(pagedSessions);

            var response = new PaginatedResponse<PracticeSessionDto>
            {
                Data = sessionDtos,
                Pagination = new PaginationInfo
                {
                    Page = page,
                    PageSize = pageSize,
                    TotalItems = totalCount,
                    TotalPages = (int)Math.Ceiling((double)totalCount / pageSize),
                    HasNext = page < (int)Math.Ceiling((double)totalCount / pageSize),
                    HasPrevious = page > 1
                }
            };

            return ApiResponse<PaginatedResponse<PracticeSessionDto>>.SuccessResponse(response);
        }
        catch (Exception ex)
        {
            return ApiResponse<PaginatedResponse<PracticeSessionDto>>.ErrorResponse(
                "GET_SESSIONS_ERROR", "Failed to get practice sessions", ex.Message);
        }
    }

    public async Task<ApiResponse<PracticeSessionDto>> PauseSessionAsync(Guid sessionId)
    {
        try
        {
            var session = await _sessionRepository.GetByIdAsync(sessionId);
            if (session == null)
            {
                return ApiResponse<PracticeSessionDto>.ErrorResponse(
                    "SESSION_NOT_FOUND", "Practice session not found");
            }

            session.Status = SessionStatus.Paused;
            session.PausedAt = DateTime.UtcNow;

            _sessionRepository.Update(session);

            var sessionDto = _mapper.Map<PracticeSessionDto>(session);
            return ApiResponse<PracticeSessionDto>.SuccessResponse(sessionDto, "Session paused");
        }
        catch (Exception ex)
        {
            return ApiResponse<PracticeSessionDto>.ErrorResponse(
                "PAUSE_SESSION_ERROR", "Failed to pause session", ex.Message);
        }
    }

    public async Task<ApiResponse<PracticeSessionDto>> ResumeSessionAsync(Guid sessionId)
    {
        try
        {
            var session = await _sessionRepository.GetByIdAsync(sessionId);
            if (session == null)
            {
                return ApiResponse<PracticeSessionDto>.ErrorResponse(
                    "SESSION_NOT_FOUND", "Practice session not found");
            }

            session.Status = SessionStatus.InProgress;
            session.PausedAt = null;

            _sessionRepository.Update(session);

            var sessionDto = _mapper.Map<PracticeSessionDto>(session);
            return ApiResponse<PracticeSessionDto>.SuccessResponse(sessionDto, "Session resumed");
        }
        catch (Exception ex)
        {
            return ApiResponse<PracticeSessionDto>.ErrorResponse(
                "RESUME_SESSION_ERROR", "Failed to resume session", ex.Message);
        }
    }

    private async Task<AnswerEvaluationResult> EvaluateAnswerAsync(SubmitAnswerDto answerDto)
    {
        try
        {
            // Get the question to evaluate against
            var question = await _unitOfWork.Questions.GetByIdAsync(answerDto.QuestionId);
            if (question == null)
            {
                return new AnswerEvaluationResult
                {
                    IsCorrect = false,
                    Score = 0,
                    Explanation = "Question not found",
                    SuggestedResources = new List<string>()
                };
            }

            decimal matchPercentage = 0;
            bool isCorrect = false;
            string explanation = "";

            switch (question.Type)
            {
                case QuestionType.SingleChoice:
                    isCorrect = _evaluationService.EvaluateSingleChoice(question, answerDto.SelectedOptionIds ?? new List<Guid>());
                    matchPercentage = isCorrect ? 100 : 0;
                    explanation = isCorrect ? "Correct answer!" : "Incorrect answer. Please review the topic.";
                    break;

                case QuestionType.MultiChoice:
                    isCorrect = _evaluationService.EvaluateMultiChoice(question, answerDto.SelectedOptionIds ?? new List<Guid>());
                    matchPercentage = isCorrect ? 100 : 0;
                    explanation = isCorrect ? "Correct answer!" : "Incorrect answer. Please review the topic.";
                    break;

                case QuestionType.Written:
                    var userThreshold = 80m; // TODO: Get from user settings
                    var (textMatchPercent, textIsCorrect) = _evaluationService.EvaluateWritten(question, answerDto.GivenText ?? "", userThreshold);
                    matchPercentage = textMatchPercent;
                    isCorrect = textIsCorrect;
                    explanation = $"Your answer matched {matchPercentage:F1}% of the expected keywords. " +
                                 (isCorrect ? "Good job!" : $"Try to include more key concepts. Threshold: {userThreshold}%");
                    break;

                default:
                    explanation = "Unknown question type";
                    break;
            }

            return new AnswerEvaluationResult
            {
                IsCorrect = isCorrect,
                Score = matchPercentage,
                Explanation = explanation,
                SuggestedResources = new List<string>() // TODO: Implement resource suggestions
            };
        }
        catch (Exception ex)
        {
            return new AnswerEvaluationResult
            {
                IsCorrect = false,
                Score = 0,
                Explanation = $"Error evaluating answer: {ex.Message}",
                SuggestedResources = new List<string>()
            };
        }
    }

    private class AnswerEvaluationResult
    {
        public bool IsCorrect { get; set; }
        public decimal Score { get; set; }
        public string Explanation { get; set; } = string.Empty;
        public List<string> SuggestedResources { get; set; } = new();
    }
}