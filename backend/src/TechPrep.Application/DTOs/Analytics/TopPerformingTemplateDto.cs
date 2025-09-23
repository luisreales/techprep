namespace TechPrep.Application.DTOs.Analytics;

public class TopPerformingTemplateDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int SessionsCount { get; set; }
    public double AverageScore { get; set; }
    public double CompletionRate { get; set; }
}