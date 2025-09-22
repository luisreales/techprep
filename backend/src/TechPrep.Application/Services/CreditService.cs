using AutoMapper;
using TechPrep.Application.DTOs.Common;
using TechPrep.Application.DTOs.PracticeInterview;
using TechPrep.Application.Interfaces;
using TechPrep.Core.Entities;
using TechPrep.Core.Enums;
using TechPrep.Core.Interfaces;

namespace TechPrep.Application.Services;

public class CreditService : ICreditService
{
    private readonly ICreditLedgerRepository _creditLedgerRepository;
    private readonly IMapper _mapper;

    public CreditService(ICreditLedgerRepository creditLedgerRepository, IMapper mapper)
    {
        _creditLedgerRepository = creditLedgerRepository;
        _mapper = mapper;
    }

    public async Task<ApiResponse<UserCreditsDto>> GetUserCreditsAsync(Guid userId)
    {
        try
        {
            var availableCredits = await _creditLedgerRepository.GetUserAvailableCreditsAsync(userId);
            var recentTransactions = await _creditLedgerRepository.GetByUserIdAsync(userId);

            var recentTransactionDtos = _mapper.Map<List<CreditLedgerDto>>(
                recentTransactions.Take(10).ToList());

            var nextExpiration = recentTransactions
                .Where(t => t.ExpiresAt.HasValue && t.ExpiresAt > DateTime.UtcNow)
                .OrderBy(t => t.ExpiresAt)
                .FirstOrDefault()?.ExpiresAt;

            var userCreditsDto = new UserCreditsDto
            {
                AvailableCredits = availableCredits,
                RecentTransactions = recentTransactionDtos,
                NextExpiration = nextExpiration
            };

            return ApiResponse<UserCreditsDto>.SuccessResponse(userCreditsDto);
        }
        catch (Exception ex)
        {
            return ApiResponse<UserCreditsDto>.ErrorResponse(
                "GET_CREDITS_ERROR", "Failed to get user credits", ex.Message);
        }
    }

    public async Task<ApiResponse<object>> AddCreditsAsync(Guid userId, CreditTopUpDto topUpDto)
    {
        try
        {
            await _creditLedgerRepository.AddCreditTransactionAsync(
                userId,
                CreditTransactionType.Purchase,
                topUpDto.Credits,
                "Credit top-up purchase",
                expiresAt: topUpDto.ExpiresAt);

            return ApiResponse<object>.SuccessResponse(null, "Credits added successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<object>.ErrorResponse(
                "ADD_CREDITS_ERROR", "Failed to add credits", ex.Message);
        }
    }

    public async Task<ApiResponse<bool>> HasSufficientCreditsAsync(Guid userId, int requiredCredits)
    {
        try
        {
            var availableCredits = await _creditLedgerRepository.GetUserAvailableCreditsAsync(userId);
            var hasSufficient = availableCredits >= requiredCredits;

            return ApiResponse<bool>.SuccessResponse(hasSufficient);
        }
        catch (Exception ex)
        {
            return ApiResponse<bool>.ErrorResponse(
                "CHECK_CREDITS_ERROR", "Failed to check credit balance", ex.Message);
        }
    }

    public async Task<ApiResponse<object>> ConsumeCreditsAsync(
        Guid userId,
        int credits,
        Guid interviewSessionId,
        string description)
    {
        try
        {
            var availableCredits = await _creditLedgerRepository.GetUserAvailableCreditsAsync(userId);
            if (availableCredits < credits)
            {
                return ApiResponse<object>.ErrorResponse(
                    "INSUFFICIENT_CREDITS", "Not enough credits available");
            }

            await _creditLedgerRepository.AddCreditTransactionAsync(
                userId,
                CreditTransactionType.Consumption,
                -credits, // Negative for consumption
                description,
                interviewSessionId: interviewSessionId);

            return ApiResponse<object>.SuccessResponse(null, "Credits consumed successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<object>.ErrorResponse(
                "CONSUME_CREDITS_ERROR", "Failed to consume credits", ex.Message);
        }
    }

    public async Task<ApiResponse<PaginatedResponse<CreditLedgerDto>>> GetCreditHistoryAsync(
        Guid userId,
        int page = 1,
        int pageSize = 10)
    {
        try
        {
            var transactions = await _creditLedgerRepository.GetByUserIdAsync(userId);
            var totalCount = transactions.Count();
            var pagedTransactions = transactions
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var transactionDtos = _mapper.Map<List<CreditLedgerDto>>(pagedTransactions);

            var response = new PaginatedResponse<CreditLedgerDto>
            {
                Data = transactionDtos,
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

            return ApiResponse<PaginatedResponse<CreditLedgerDto>>.SuccessResponse(response);
        }
        catch (Exception ex)
        {
            return ApiResponse<PaginatedResponse<CreditLedgerDto>>.ErrorResponse(
                "GET_CREDIT_HISTORY_ERROR", "Failed to get credit history", ex.Message);
        }
    }
}