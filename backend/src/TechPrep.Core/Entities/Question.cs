using TechPrep.Core.Enums;

namespace TechPrep.Core.Entities;

public class Question
{
    public Guid Id { get; set; }
    public int TopicId { get; set; }
    public string Text { get; set; } = string.Empty;
    public QuestionType Type { get; set; }
    public DifficultyLevel Level { get; set; }
    public string? OfficialAnswer { get; set; } // Required for written questions
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual Topic Topic { get; set; } = null!;
    public virtual ICollection<QuestionOption> Options { get; set; } = new List<QuestionOption>();
    public virtual ICollection<InterviewAnswer> InterviewAnswers { get; set; } = new List<InterviewAnswer>();
    public virtual ICollection<LearningResource> LearningResources { get; set; } = new List<LearningResource>();
}