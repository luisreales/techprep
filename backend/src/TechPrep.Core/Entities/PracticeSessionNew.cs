using TechPrep.Core.Enums;

namespace TechPrep.Core.Entities;

public class PracticeSessionNew
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public int? AssignmentId { get; set; }
    public SessionStatus Status { get; set; } = SessionStatus.NotStarted;
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? SubmittedAt { get; set; }
    public DateTime? PausedAt { get; set; }
    public int TotalScore { get; set; } = 0;
    public int TotalTimeSec { get; set; } = 0;
    public string? CurrentQuestionState { get; set; } // JSON for autosave
    public int CurrentQuestionIndex { get; set; } = 0;
    public int TotalItems { get; set; } = 0;
    public int CorrectCount { get; set; } = 0;
    public int IncorrectCount { get; set; } = 0;
    public DateTime? FinishedAt { get; set; }

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual SessionAssignment? Assignment { get; set; }
    public virtual ICollection<PracticeAnswer> Answers { get; set; } = new List<PracticeAnswer>();
}