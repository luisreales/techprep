namespace TechPrep.Application.DTOs.Analytics;

public class TopPerformingUserDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public double AverageScore { get; set; }
    public int CompletedSessions { get; set; }
    public TimeSpan TotalStudyTime { get; set; }
}