namespace TechPrep.Core.Entities;

public class TemplateAnalyticsAggregate : AnalyticsAggregate
{
    public int Id { get; set; }
    public int TemplateId { get; set; }
    public int? GroupId { get; set; } // null = all groups

    // Session metrics
    public int TotalSessions { get; set; }
    public int CompletedSessions { get; set; }
    public int AbandonedSessions { get; set; }
    public int AutoSubmittedSessions { get; set; }
    public double CompletionRate => TotalSessions > 0 ? (double)CompletedSessions / TotalSessions : 0;

    // Performance metrics
    public double AverageScore { get; set; }
    public double MedianScore { get; set; }
    public double AverageDurationMinutes { get; set; }
    public double MedianDurationMinutes { get; set; }

    // Difficulty metrics
    public double PassRate { get; set; } // % above passing threshold
    public int UniqueTakers { get; set; }
    public int RepeatTakers { get; set; }

    // Integrity metrics
    public int SessionsWithViolations { get; set; }
    public int TotalIntegrityViolations { get; set; }
    public double IntegrityViolationRate => TotalSessions > 0 ? (double)SessionsWithViolations / TotalSessions : 0;

    // Topic breakdown (JSON)
    public string TopicPerformanceJson { get; set; } = string.Empty; // Serialized topic scores

    // Navigation properties
    public virtual SessionTemplate Template { get; set; } = null!;
    public virtual Group? Group { get; set; }
}