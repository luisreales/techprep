using TechPrep.Core.Enums;

namespace TechPrep.Core.Entities;

public class CreditLedger
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public CreditTransactionType TransactionType { get; set; }
    public int Credits { get; set; } // Positive for credit, negative for debit
    public int BalanceAfter { get; set; }
    public string? Description { get; set; }
    public Guid? SourceTopUpId { get; set; }
    public Guid? InterviewSessionId { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual CreditTopUp? SourceTopUp { get; set; }
    public virtual InterviewSessionNew? InterviewSession { get; set; }
}