namespace TechPrep.Core.Entities;

public class CreditTopUp
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public int Credits { get; set; }
    public decimal Amount { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual ICollection<CreditLedger> CreditEntries { get; set; } = new List<CreditLedger>();
}