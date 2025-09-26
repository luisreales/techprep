namespace TechPrep.Core.Entities;

public class InterviewAnswerNew
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid InterviewSessionId { get; set; }
    public Guid QuestionId { get; set; }

    public string Type { get; set; } = "single";
    public string? GivenText { get; set; }
    public string? ChosenOptionIdsJson { get; set; }
    public bool IsCorrect { get; set; }
    public int? MatchPercent { get; set; }
    public int TimeMs { get; set; }
    public int NumberAttemps { get; set; } = 1;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual InterviewSessionNew InterviewSession { get; set; } = null!;
}