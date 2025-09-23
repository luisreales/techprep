namespace TechPrep.Application.DTOs.Analytics;

public class MetricDataPointDto
{
    public DateTime Date { get; set; }
    public string Label { get; set; } = string.Empty;
    public double Value { get; set; }
    public string MetricType { get; set; } = string.Empty;
    public string? ComparisonValue { get; set; }
}