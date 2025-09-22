using TechPrep.Core.Entities;
using TechPrep.Core.Enums;

namespace TechPrep.Core.Interfaces;

public interface ICreditLedgerRepository : IGenericRepository<CreditLedger>
{
    Task<IEnumerable<CreditLedger>> GetByUserIdAsync(Guid userId);
    Task<int> GetUserAvailableCreditsAsync(Guid userId);
    Task<CreditLedger> AddCreditTransactionAsync(Guid userId, CreditTransactionType type, int credits, string? description = null, Guid? sourceTopUpId = null, Guid? interviewSessionId = null, DateTime? expiresAt = null);
}