using TechPrep.Application.DTOs.Common;
using TechPrep.Application.DTOs.PracticeInterview;

namespace TechPrep.Application.Interfaces;

public interface IPracticeSessionService
{
    Task<ApiResponse<PracticeSessionDto>> StartPracticeAsync(Guid userId, StartPracticeDto startDto);
    Task<ApiResponse<PracticeAnswerDto>> SubmitAnswerAsync(Guid sessionId, SubmitAnswerDto answerDto);
    Task<ApiResponse<object>> UpdateSessionStateAsync(Guid sessionId, SessionStateDto stateDto);
    Task<ApiResponse<PracticeSessionDto>> SubmitPracticeAsync(Guid sessionId);
    Task<ApiResponse<PracticeSessionDto>> GetSessionAsync(Guid sessionId);
    Task<ApiResponse<PaginatedResponse<PracticeSessionDto>>> GetMySessionsAsync(Guid userId, int page = 1, int pageSize = 10);
    Task<ApiResponse<PracticeSessionDto>> PauseSessionAsync(Guid sessionId);
    Task<ApiResponse<PracticeSessionDto>> ResumeSessionAsync(Guid sessionId);
}