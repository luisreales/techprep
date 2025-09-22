using Microsoft.EntityFrameworkCore;
using TechPrep.Core.Entities;
using TechPrep.Core.Enums;
using TechPrep.Core.Interfaces;
using TechPrep.Infrastructure.Data;

namespace TechPrep.Infrastructure.Repositories;

public class CreditLedgerRepository : GenericRepository<CreditLedger>, ICreditLedgerRepository
{
    public CreditLedgerRepository(TechPrepDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<CreditLedger>> GetByUserIdAsync(Guid userId)
    {
        return await _context.CreditLedgers
            .Where(cl => cl.UserId == userId)
            .Include(cl => cl.SourceTopUp)
            .Include(cl => cl.InterviewSession)
            .OrderByDescending(cl => cl.CreatedAt)
            .ToListAsync();
    }

    public async Task<int> GetUserAvailableCreditsAsync(Guid userId)
    {
        var totalCredits = await _context.CreditLedgers
            .Where(cl => cl.UserId == userId &&
                        (cl.ExpiresAt == null || cl.ExpiresAt > DateTime.UtcNow))
            .SumAsync(cl => cl.Credits);

        return Math.Max(0, totalCredits);
    }

    public async Task<CreditLedger> AddCreditTransactionAsync(
        Guid userId,
        CreditTransactionType type,
        int credits,
        string? description = null,
        Guid? sourceTopUpId = null,
        Guid? interviewSessionId = null,
        DateTime? expiresAt = null)
    {
        var currentBalance = await GetUserAvailableCreditsAsync(userId);
        var newBalance = currentBalance + credits;

        var transaction = new CreditLedger
        {
            UserId = userId,
            TransactionType = type,
            Credits = credits,
            BalanceAfter = newBalance,
            Description = description,
            SourceTopUpId = sourceTopUpId,
            InterviewSessionId = interviewSessionId,
            ExpiresAt = expiresAt,
            CreatedAt = DateTime.UtcNow
        };

        _context.CreditLedgers.Add(transaction);
        await _context.SaveChangesAsync();

        return transaction;
    }
}