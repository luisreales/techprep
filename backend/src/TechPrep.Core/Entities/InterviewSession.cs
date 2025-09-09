using TechPrep.Core.Enums;

namespace TechPrep.Core.Entities;

public class InterviewSession
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public PracticeMode Mode { get; set; }
    public int? TopicId { get; set; }
    public DifficultyLevel? Level { get; set; }
    public int TotalQuestions { get; set; }
    public int CorrectAnswers { get; set; }
    public decimal Score { get; set; }
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? FinishedAt { get; set; }
    public bool IsCompleted { get; set; }
    
    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Topic? Topic { get; set; }
    public virtual ICollection<InterviewAnswer> Answers { get; set; } = new List<InterviewAnswer>();
}