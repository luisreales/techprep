namespace TechPrep.Application.DTOs.Analytics;

public class OverviewAnalyticsDto
{
    public int TotalUsers { get; set; }
    public int ActiveUsersToday { get; set; }
    public int ActiveUsersThisWeek { get; set; }
    public int ActiveUsersThisMonth { get; set; }

    public int TotalSessions { get; set; }
    public int SessionsToday { get; set; }
    public int CompletedSessions { get; set; }
    public double CompletionRate { get; set; }

    public double AverageScore { get; set; }
    public double AverageDuration { get; set; }
    public int CertificatesIssued { get; set; }
    public int IntegrityViolations { get; set; }

    public List<MetricDataPointDto> TrendData { get; set; } = new();
    public List<TopPerformingTemplateDto> TopTemplates { get; set; } = new();
    public List<TopPerformingUserDto> TopUsers { get; set; } = new();
}