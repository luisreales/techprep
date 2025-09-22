namespace TechPrep.Core.Entities;

public class InterviewAnswerNew
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid InterviewSessionId { get; set; }
    public Guid QuestionId { get; set; }
    public string? SelectedOptionIds { get; set; } // JSON array for multi-choice
    public string? GivenText { get; set; } // For written questions
    public bool? IsCorrect { get; set; } // Evaluated after session
    public decimal? Score { get; set; } // Calculated after session
    public DateTime AnsweredAt { get; set; } = DateTime.UtcNow;
    public int TimeSpentSec { get; set; }

    // Navigation properties
    public virtual InterviewSessionNew InterviewSession { get; set; } = null!;
    public virtual Question Question { get; set; } = null!;
}