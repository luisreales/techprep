using TechPrep.Application.DTOs.Common;
using TechPrep.Application.DTOs.PracticeInterview;

namespace TechPrep.Application.Interfaces;

public interface ICreditService
{
    Task<ApiResponse<UserCreditsDto>> GetUserCreditsAsync(Guid userId);
    Task<ApiResponse<object>> AddCreditsAsync(Guid userId, CreditTopUpDto topUpDto);
    Task<ApiResponse<bool>> HasSufficientCreditsAsync(Guid userId, int requiredCredits);
    Task<ApiResponse<object>> ConsumeCreditsAsync(Guid userId, int credits, Guid interviewSessionId, string description);
    Task<ApiResponse<PaginatedResponse<CreditLedgerDto>>> GetCreditHistoryAsync(Guid userId, int page = 1, int pageSize = 10);
}