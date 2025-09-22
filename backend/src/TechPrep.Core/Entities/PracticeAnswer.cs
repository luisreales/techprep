namespace TechPrep.Core.Entities;

public class PracticeAnswer
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PracticeSessionId { get; set; }
    public Guid QuestionId { get; set; }
    public string? SelectedOptionIds { get; set; } // JSON array for multi-choice
    public string? GivenText { get; set; } // For written questions
    public bool IsCorrect { get; set; }
    public decimal Score { get; set; }
    public DateTime AnsweredAt { get; set; } = DateTime.UtcNow;
    public int TimeSpentSec { get; set; }

    // Navigation properties
    public virtual PracticeSessionNew PracticeSession { get; set; } = null!;
    public virtual Question Question { get; set; } = null!;
}