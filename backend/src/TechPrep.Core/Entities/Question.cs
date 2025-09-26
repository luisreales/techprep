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

    // New fields for Practice/Interview system
    public bool UsableInPractice { get; set; } = true;
    public bool UsableInInterview { get; set; } = true;
    public string? Difficulty { get; set; } // Additional difficulty descriptor
    public int EstimatedTimeSec { get; set; } = 60;
    public int InterviewCooldownDays { get; set; } = 0;
    public DateTime? LastUsedInInterviewAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual Topic Topic { get; set; } = null!;
    public virtual ICollection<QuestionOption> Options { get; set; } = new List<QuestionOption>();
    public virtual ICollection<QuestionResource> ResourceLinks { get; set; } = new List<QuestionResource>();
    public virtual ICollection<QuestionKeyword> Keywords { get; set; } = new List<QuestionKeyword>();
}