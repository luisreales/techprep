namespace TechPrep.Core.Entities;

public class InterviewAnswer
{
    public Guid Id { get; set; }
    public Guid SessionId { get; set; }
    public Guid QuestionId { get; set; }
    public string? GivenAnswer { get; set; } // For written questions
    public string? SelectedOptionsJson { get; set; } // For choice questions, JSON array
    public bool IsCorrect { get; set; }
    public decimal? MatchPercentage { get; set; } // For written questions
    public int TimeSpentSeconds { get; set; }
    public DateTime AnsweredAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual InterviewSession Session { get; set; } = null!;
    public virtual Question Question { get; set; } = null!;
}