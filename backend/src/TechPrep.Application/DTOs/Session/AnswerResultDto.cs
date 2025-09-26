namespace TechPrep.Application.DTOs.Session;

public class AnswerResultDto
{
    public bool Accepted { get; set; } = true; // Always true for successful submission
    public bool? IsCorrect { get; set; } // Only shown in practice mode
    public decimal? MatchPercent { get; set; } // Only for written questions in practice mode
    public string? Explanation { get; set; } // Only in practice mode
    public List<ResourceDto> Resources { get; set; } = new(); // Only in practice mode
}

public class ResourceDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
}