using TechPrep.Core.Enums;

namespace TechPrep.Application.DTOs.PracticeInterview;

public class UserCreditsDto
{
    public int AvailableCredits { get; set; }
    public List<CreditLedgerDto> RecentTransactions { get; set; } = new();
    public DateTime? NextExpiration { get; set; }
}

public class CreditLedgerDto
{
    public Guid Id { get; set; }
    public CreditTransactionType TransactionType { get; set; }
    public int Credits { get; set; }
    public int BalanceAfter { get; set; }
    public string? Description { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreditTopUpDto
{
    public int Credits { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

public class SubscriptionPlanDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int InterviewCreditsPerMonth { get; set; }
    public bool IsActive { get; set; }
}

public class UserSubscriptionDto
{
    public Guid Id { get; set; }
    public int SubscriptionPlanId { get; set; }
    public string PlanName { get; set; } = string.Empty;
    public SubscriptionStatus Status { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}