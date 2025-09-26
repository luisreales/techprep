using TechPrep.Application.DTOs.Common;
using TechPrep.Application.DTOs.PracticeInterview;
using TechPrep.Application.DTOs;

namespace TechPrep.Application.Interfaces;

public interface IInterviewSessionService
{
    Task<ApiResponse<InterviewSessionDto>> StartInterviewAsync(Guid userId, StartInterviewDto startDto);
    Task<ApiResponse<object>> SubmitAnswerAsync(Guid sessionId, SubmitAnswerDto answerDto);
    Task<ApiResponse<InterviewSessionDto>> SubmitInterviewAsync(Guid sessionId);
    Task<ApiResponse<InterviewSessionDto>> GetSessionAsync(Guid sessionId);
    Task<ApiResponse<PaginatedResponse<InterviewSessionDto>>> GetMySessionsAsync(Guid userId, int page = 1, int pageSize = 10);
    Task<ApiResponse<object>> RecordAuditEventAsync(Guid sessionId, AuditEventDto eventDto);
    Task<ApiResponse<CertificateDto>> GetCertificateAsync(Guid sessionId);

    // New interview state management endpoints
    Task<ApiResponse<InterviewSessionDto>> FinishInterviewAsync(Guid sessionId);
    Task<ApiResponse<InterviewSessionDto>> FinalizeInterviewAsync(Guid sessionId);
    Task<ApiResponse<InterviewSummaryDto>> GetInterviewSummaryAsync(Guid sessionId);
    Task<ApiResponse<List<InterviewSessionListDto>>> GetMyInterviewSessionsAsync(Guid userId);
    Task<ApiResponse<InterviewRetakeDto>> RetakeInterviewAsync(Guid sessionId);
}