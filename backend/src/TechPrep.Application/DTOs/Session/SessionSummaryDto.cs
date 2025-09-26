namespace TechPrep.Application.DTOs.Session;

public class SessionSummaryDto
{
    public Guid SessionId { get; set; }
    public int TotalQuestions { get; set; }
    public int CorrectAnswers { get; set; }
    public int IncorrectAnswers { get; set; }
    public decimal Score { get; set; }
    public int TotalTimeMs { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? FinishedAt { get; set; }
    public List<TopicStatsDto> TopicStats { get; set; } = new();
    public List<QuestionSummaryDto> Questions { get; set; } = new(); // Only for practice mode
}

public class TopicStatsDto
{
    public int TopicId { get; set; }
    public string TopicName { get; set; } = string.Empty;
    public int TotalQuestions { get; set; }
    public int CorrectAnswers { get; set; }
    public decimal Accuracy { get; set; }
}

public class QuestionSummaryDto
{
    public Guid QuestionId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public decimal? MatchPercent { get; set; }
    public string? UserAnswer { get; set; }
    public string? OfficialAnswer { get; set; }
    public string? Explanation { get; set; }
    public List<ResourceDto> Resources { get; set; } = new();
}