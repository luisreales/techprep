namespace TechPrep.Core.Entities;

public class UserAnalyticsAggregate : AnalyticsAggregate
{
    public int Id { get; set; }
    public Guid UserId { get; set; }
    public int? TemplateId { get; set; } // null = all templates
    public int? TopicId { get; set; } // null = all topics

    // Session metrics
    public int TotalPracticeSessions { get; set; }
    public int TotalInterviewSessions { get; set; }
    public int CompletedSessions { get; set; }
    public double AverageSessionDuration { get; set; }

    // Performance metrics
    public double AverageScore { get; set; }
    public double BestScore { get; set; }
    public double ImprovementRate { get; set; } // Score improvement over time
    public int CurrentStreak { get; set; } // Consecutive days with activity

    // Progress metrics
    public int TopicsStarted { get; set; }
    public int TopicsCompleted { get; set; }
    public int CertificatesEarned { get; set; }
    public int CreditsConsumed { get; set; }

    // Engagement metrics
    public DateTime LastActivity { get; set; }
    public int ActiveDays { get; set; }
    public double AvgSessionsPerActiveDay { get; set; }

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual SessionTemplate? Template { get; set; }
    public virtual Topic? Topic { get; set; }
}