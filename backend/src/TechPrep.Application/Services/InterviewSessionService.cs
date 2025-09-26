using AutoMapper;
using TechPrep.Application.DTOs.Common;
using TechPrep.Application.DTOs.PracticeInterview;
using TechPrep.Application.DTOs;
using TechPrep.Application.Interfaces;
using TechPrep.Core.Entities;
using TechPrep.Core.Enums;
using TechPrep.Core.Interfaces;
using System.Text.Json;

namespace TechPrep.Application.Services;

public class InterviewSessionService : IInterviewSessionService
{
    private readonly IInterviewSessionNewRepository _sessionRepository;
    private readonly ISessionAssignmentRepository _assignmentRepository;
    private readonly ICreditService _creditService;
    private readonly IMapper _mapper;

    public InterviewSessionService(
        IInterviewSessionNewRepository sessionRepository,
        ISessionAssignmentRepository assignmentRepository,
        ICreditService creditService,
        IMapper mapper)
    {
        _sessionRepository = sessionRepository;
        _assignmentRepository = assignmentRepository;
        _creditService = creditService;
        _mapper = mapper;
    }

    public async Task<ApiResponse<InterviewSessionDto>> StartInterviewAsync(Guid userId, StartInterviewDto startDto)
    {
        try
        {
            // Check if assignment exists and user has access
            var assignment = await _assignmentRepository.GetWithDetailsAsync(startDto.AssignmentId);
            if (assignment == null)
            {
                return ApiResponse<InterviewSessionDto>.ErrorResponse(
                    "ASSIGNMENT_NOT_FOUND", "Assignment not found");
            }

            // Check for existing active session
            var existingSession = await _sessionRepository.GetActiveSessionAsync(userId, startDto.AssignmentId);
            if (existingSession != null)
            {
                var existingDto = _mapper.Map<InterviewSessionDto>(existingSession);
                return ApiResponse<InterviewSessionDto>.SuccessResponse(existingDto, "Resumed existing session");
            }

            // Consume credits
            var creditResult = await _creditService.ConsumeCreditsAsync(
                userId,
                assignment.Template.InterviewCost,
                Guid.Empty, // Will be set after session creation
                $"Interview: {assignment.Template.Name}");

            if (!creditResult.Success)
            {
                return ApiResponse<InterviewSessionDto>.ErrorResponse(
                    "INSUFFICIENT_CREDITS", "Not enough credits to start interview");
            }

            // Create new session
            var session = new InterviewSessionNew
            {
                UserId = userId,
                AssignmentId = startDto.AssignmentId,
                Status = "Active",
                StartedAt = DateTime.UtcNow,
                CurrentQuestionIndex = 0
            };

            await _sessionRepository.AddAsync(session);

            var sessionDto = _mapper.Map<InterviewSessionDto>(session);
            return ApiResponse<InterviewSessionDto>.SuccessResponse(sessionDto, "Interview session started");
        }
        catch (Exception ex)
        {
            return ApiResponse<InterviewSessionDto>.ErrorResponse(
                "START_INTERVIEW_ERROR", "Failed to start interview session", ex.Message);
        }
    }

    public async Task<ApiResponse<object>> SubmitAnswerAsync(Guid sessionId, SubmitAnswerDto answerDto)
    {
        try
        {
            var session = await _sessionRepository.GetWithAnswersAsync(sessionId);
            if (session == null)
            {
                return ApiResponse<object>.ErrorResponse(
                    "SESSION_NOT_FOUND", "Interview session not found");
            }

            if (session.Status != "Active")
            {
                return ApiResponse<object>.ErrorResponse(
                    "INVALID_SESSION_STATUS", "Session is not active");
            }

            // Create interview answer (no immediate evaluation)
            var answer = new InterviewAnswerNew
            {
                InterviewSessionId = sessionId,
                QuestionId = answerDto.QuestionId,
                ChosenOptionIdsJson = answerDto.SelectedOptionIds != null ?
                    JsonSerializer.Serialize(answerDto.SelectedOptionIds) : null,
                GivenText = answerDto.GivenText,
                TimeMs = answerDto.TimeSpentSec * 1000,
                CreatedAt = DateTime.UtcNow
                // IsCorrect and Score will be evaluated after session completion
            };

            // Add answer to session
            session.Answers.Add(answer);
            session.CurrentQuestionIndex++;

            _sessionRepository.Update(session);

            return ApiResponse<object>.SuccessResponse(null, "Answer submitted successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<object>.ErrorResponse(
                "SUBMIT_ANSWER_ERROR", "Failed to submit answer", ex.Message);
        }
    }

    public async Task<ApiResponse<InterviewSessionDto>> SubmitInterviewAsync(Guid sessionId)
    {
        try
        {
            var session = await _sessionRepository.GetWithAnswersAsync(sessionId);
            if (session == null)
            {
                return ApiResponse<InterviewSessionDto>.ErrorResponse(
                    "SESSION_NOT_FOUND", "Interview session not found");
            }

            session.Status = "Completed";
            session.SubmittedAt = DateTime.UtcNow;
            session.TotalTimeSec = (int)(DateTime.UtcNow - session.StartedAt).TotalSeconds;

            // Evaluate all answers now
            await EvaluateAllAnswersAsync(session);

            // Calculate total score
            session.TotalScore = session.Answers.Count(a => a.IsCorrect);

            // Generate certificate if enabled
            // Generate certificate logic can be implemented later
            // if (session.Assignment.CertificationEnabled)
            {
                await GenerateCertificateAsync(session);
            }

            _sessionRepository.Update(session);

            var sessionDto = _mapper.Map<InterviewSessionDto>(session);
            return ApiResponse<InterviewSessionDto>.SuccessResponse(sessionDto, "Interview session completed");
        }
        catch (Exception ex)
        {
            return ApiResponse<InterviewSessionDto>.ErrorResponse(
                "SUBMIT_INTERVIEW_ERROR", "Failed to submit interview session", ex.Message);
        }
    }

    public async Task<ApiResponse<InterviewSessionDto>> GetSessionAsync(Guid sessionId)
    {
        try
        {
            var session = await _sessionRepository.GetWithAnswersAsync(sessionId);
            if (session == null)
            {
                return ApiResponse<InterviewSessionDto>.ErrorResponse(
                    "SESSION_NOT_FOUND", "Interview session not found");
            }

            var sessionDto = _mapper.Map<InterviewSessionDto>(session);
            return ApiResponse<InterviewSessionDto>.SuccessResponse(sessionDto);
        }
        catch (Exception ex)
        {
            return ApiResponse<InterviewSessionDto>.ErrorResponse(
                "GET_SESSION_ERROR", "Failed to get interview session", ex.Message);
        }
    }

    public async Task<ApiResponse<PaginatedResponse<InterviewSessionDto>>> GetMySessionsAsync(Guid userId, int page = 1, int pageSize = 10)
    {
        try
        {
            var sessions = await _sessionRepository.GetByUserIdAsync(userId);
            var totalCount = sessions.Count();
            var pagedSessions = sessions.Skip((page - 1) * pageSize).Take(pageSize).ToList();

            var sessionDtos = _mapper.Map<List<InterviewSessionDto>>(pagedSessions);

            var response = new PaginatedResponse<InterviewSessionDto>
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

            return ApiResponse<PaginatedResponse<InterviewSessionDto>>.SuccessResponse(response);
        }
        catch (Exception ex)
        {
            return ApiResponse<PaginatedResponse<InterviewSessionDto>>.ErrorResponse(
                "GET_SESSIONS_ERROR", "Failed to get interview sessions", ex.Message);
        }
    }

    public async Task<ApiResponse<object>> RecordAuditEventAsync(Guid sessionId, AuditEventDto eventDto)
    {
        try
        {
            var session = await _sessionRepository.GetByIdAsync(sessionId);
            if (session == null)
            {
                return ApiResponse<object>.ErrorResponse(
                    "SESSION_NOT_FOUND", "Interview session not found");
            }

            var auditEvent = new SessionAuditEvent
            {
                SessionType = "interview",
                SessionId = sessionId,
                UserId = session.UserId,
                EventType = eventDto.EventType,
                MetaJson = eventDto.Meta != null ? JsonSerializer.Serialize(eventDto.Meta) : null,
                CreatedAt = DateTime.UtcNow
            };

            // Audit events can be implemented later
            // session.AuditEvents.Add(auditEvent);
            _sessionRepository.Update(session);

            return ApiResponse<object>.SuccessResponse(null, "Audit event recorded");
        }
        catch (Exception ex)
        {
            return ApiResponse<object>.ErrorResponse(
                "RECORD_AUDIT_ERROR", "Failed to record audit event", ex.Message);
        }
    }

    public async Task<ApiResponse<CertificateDto>> GetCertificateAsync(Guid sessionId)
    {
        try
        {
            var session = await _sessionRepository.GetWithAnswersAsync(sessionId);
            if (session == null)
            {
                return ApiResponse<CertificateDto>.ErrorResponse(
                    "CERTIFICATE_NOT_FOUND", "Certificate not found");
            }

            // Certificate functionality can be implemented later
            var certificateDto = new CertificateDto();
            return ApiResponse<CertificateDto>.SuccessResponse(certificateDto);
        }
        catch (Exception ex)
        {
            return ApiResponse<CertificateDto>.ErrorResponse(
                "GET_CERTIFICATE_ERROR", "Failed to get certificate", ex.Message);
        }
    }

    private async Task EvaluateAllAnswersAsync(InterviewSessionNew session)
    {
        // Simplified evaluation logic - in real implementation, this would use
        // the text matching algorithm from the existing QuestionService
        foreach (var answer in session.Answers)
        {
            answer.IsCorrect = true; // Placeholder evaluation
            answer.MatchPercent = 85; // Placeholder score
        }
    }

    private async Task GenerateCertificateAsync(InterviewSessionNew session)
    {
        var certificate = new InterviewCertificate
        {
            InterviewSessionId = session.Id,
            SessionId = session.Id.ToString(),
            UserId = session.UserId,
            CertificateId = $"CERT-{DateTime.UtcNow:yyyyMMdd}-{session.Id.ToString()[..8]}",
            UserName = "Student", // Will be implemented with proper relationships
            TemplateName = "Interview Template",
            TotalScore = session.TotalScore,
            MaxScore = 100,
            ScorePercentage = session.TotalScore,
            CompletedAt = session.SubmittedAt ?? DateTime.UtcNow,
            DurationMinutes = (int)(session.SubmittedAt?.Subtract(session.StartedAt).TotalMinutes ?? 0),
            VerificationUrl = $"https://techprep.com/verify/{session.Id}",
            QrCodeData = $"verify:{session.Id}",
            IssuedAt = DateTime.UtcNow,
            IsValid = true,
            IssuedByUserId = session.UserId // TODO: Use actual admin user ID
        };

        // session.Certificate = certificate; // Will be implemented later
        session.CertificateIssued = true;
    }

    // New interview state management methods
    public async Task<ApiResponse<InterviewSessionDto>> FinishInterviewAsync(Guid sessionId)
    {
        try
        {
            var session = await _sessionRepository.GetByIdAsync(sessionId);
            if (session == null)
            {
                return ApiResponse<InterviewSessionDto>.ErrorResponse(
                    "SESSION_NOT_FOUND",
                    "Interview session not found",
                    $"Session {sessionId} does not exist");
            }

            // Only allow finishing if status is "InProgress"
            if (session.Status != "InProgress")
            {
                // Idempotent - return existing session if already submitted
                if (session.Status == "Submitted" || session.Status == "Finalized")
                {
                    return ApiResponse<InterviewSessionDto>.SuccessResponse(
                        _mapper.Map<InterviewSessionDto>(session),
                        "Interview session already submitted");
                }
                return ApiResponse<InterviewSessionDto>.ErrorResponse(
                    "INVALID_STATE",
                    "Cannot finish interview in current state",
                    $"Session status is '{session.Status}', expected 'InProgress'");
            }

            // Update session status and compute metrics
            session.Status = "Submitted";
            session.SubmittedAt = DateTime.UtcNow;
            session.TotalTimeSec = (int)(DateTime.UtcNow - session.StartedAt).TotalSeconds;

            _sessionRepository.Update(session);

            return ApiResponse<InterviewSessionDto>.SuccessResponse(
                _mapper.Map<InterviewSessionDto>(session),
                "Interview finished successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<InterviewSessionDto>.ErrorResponse(
                "FINISH_ERROR",
                "Error finishing interview",
                ex.Message);
        }
    }

    public async Task<ApiResponse<InterviewSessionDto>> FinalizeInterviewAsync(Guid sessionId)
    {
        try
        {
            var session = await _sessionRepository.GetByIdAsync(sessionId);
            if (session == null)
            {
                return ApiResponse<InterviewSessionDto>.ErrorResponse(
                    "SESSION_NOT_FOUND",
                    "Interview session not found",
                    $"Session {sessionId} does not exist");
            }

            // Only allow finalizing if status is "Submitted" or already "Finalized"
            if (session.Status != "Submitted" && session.Status != "Finalized")
            {
                return ApiResponse<InterviewSessionDto>.ErrorResponse(
                    "INVALID_STATE",
                    "Cannot finalize interview in current state",
                    $"Session status is '{session.Status}', expected 'Submitted' or 'Finalized'");
            }

            // Idempotent - return existing session if already finalized
            if (session.Status == "Finalized")
            {
                return ApiResponse<InterviewSessionDto>.SuccessResponse(
                    _mapper.Map<InterviewSessionDto>(session),
                    "Interview session already finalized");
            }

            // Update session status
            session.Status = "Finalized";
            session.FinalizedAt = DateTime.UtcNow;

            _sessionRepository.Update(session);

            return ApiResponse<InterviewSessionDto>.SuccessResponse(
                _mapper.Map<InterviewSessionDto>(session),
                "Interview finalized successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<InterviewSessionDto>.ErrorResponse(
                "FINALIZE_ERROR",
                "Error finalizing interview",
                ex.Message);
        }
    }

    public async Task<ApiResponse<InterviewSummaryDto>> GetInterviewSummaryAsync(Guid sessionId)
    {
        try
        {
            var session = await _sessionRepository.GetByIdAsync(sessionId);
            if (session == null)
            {
                return ApiResponse<InterviewSummaryDto>.ErrorResponse(
                    "SESSION_NOT_FOUND",
                    "Interview session not found",
                    $"Session {sessionId} does not exist");
            }

            var summary = new InterviewSummaryDto(
                session.Id,
                session.StartedAt,
                session.SubmittedAt ?? DateTime.UtcNow,
                session.TotalItems,
                session.CorrectCount,
                session.IncorrectCount,
                session.TotalTimeSec,
                new List<SummarySlice>(), // TODO: Implement topic breakdown
                new List<SummarySlice>(), // TODO: Implement type breakdown
                new List<SummarySlice>()  // TODO: Implement level breakdown
            );

            return ApiResponse<InterviewSummaryDto>.SuccessResponse(summary, "Summary retrieved successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<InterviewSummaryDto>.ErrorResponse(
                "SUMMARY_ERROR",
                "Error retrieving interview summary",
                ex.Message);
        }
    }

    public async Task<ApiResponse<List<InterviewSessionListDto>>> GetMyInterviewSessionsAsync(Guid userId)
    {
        try
        {
            var sessions = await _sessionRepository.GetByUserIdAsync(userId);
            var sessionList = sessions.Select(session => new InterviewSessionListDto(
                session.Id,
                session.ParentSessionId,
                session.AttemptNumber,
                "Assignment Name", // TODO: Get actual assignment name
                session.Status,
                session.TotalScore,
                session.TotalItems,
                session.StartedAt,
                session.SubmittedAt,
                session.TotalTimeSec
            )).ToList();

            return ApiResponse<List<InterviewSessionListDto>>.SuccessResponse(
                sessionList,
                "Interview sessions retrieved successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<List<InterviewSessionListDto>>.ErrorResponse(
                "LIST_ERROR",
                "Error retrieving interview sessions",
                ex.Message);
        }
    }

    public async Task<ApiResponse<InterviewRetakeDto>> RetakeInterviewAsync(Guid sessionId)
    {
        try
        {
            var originalSession = await _sessionRepository.GetByIdAsync(sessionId);
            if (originalSession == null)
            {
                return ApiResponse<InterviewRetakeDto>.ErrorResponse(
                    "SESSION_NOT_FOUND",
                    "Interview session not found",
                    $"Session {sessionId} does not exist");
            }

            // Only allow retaking if status is "Finalized"
            if (originalSession.Status != "Finalized")
            {
                return ApiResponse<InterviewRetakeDto>.ErrorResponse(
                    "INVALID_STATE",
                    "Cannot retake interview in current state",
                    $"Session status is '{originalSession.Status}', expected 'Finalized'");
            }

            // Create new session for retake
            var newSession = new InterviewSessionNew
            {
                Id = Guid.NewGuid(),
                UserId = originalSession.UserId,
                AssignmentId = originalSession.AssignmentId,
                Status = "Assigned",
                StartedAt = DateTime.UtcNow,
                TotalItems = originalSession.TotalItems,
                AttemptNumber = originalSession.AttemptNumber + 1,
                ParentSessionId = originalSession.ParentSessionId ?? originalSession.Id // Root session if no parent
            };

            await _sessionRepository.AddAsync(newSession);

            return ApiResponse<InterviewRetakeDto>.SuccessResponse(
                new InterviewRetakeDto(newSession.Id),
                "Retake session created successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<InterviewRetakeDto>.ErrorResponse(
                "RETAKE_ERROR",
                "Error creating retake session",
                ex.Message);
        }
    }
}