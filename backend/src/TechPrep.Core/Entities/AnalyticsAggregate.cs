namespace TechPrep.Core.Entities;

public abstract class AnalyticsAggregate
{
    public DateTime CalculatedAt { get; set; } = DateTime.UtcNow;
    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
    public string AggregationType { get; set; } = string.Empty; // "daily", "weekly", "monthly"
}