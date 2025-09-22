using TechPrep.Core.Enums;

namespace TechPrep.Core.Entities;

public class SessionAssignment
{
    public int Id { get; set; }
    public int TemplateId { get; set; }
    public VisibilityType Visibility { get; set; }
    public int? GroupId { get; set; }
    public Guid? UserId { get; set; }
    public DateTime? WindowStart { get; set; }
    public DateTime? WindowEnd { get; set; }
    public int? MaxAttempts { get; set; }
    public int? CooldownHoursBetweenAttempts { get; set; }
    public bool CertificationEnabled { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual InterviewTemplate Template { get; set; } = null!;
    public virtual Group? Group { get; set; }
    public virtual User? User { get; set; }
    public virtual ICollection<InterviewSessionNew> InterviewSessions { get; set; } = new List<InterviewSessionNew>();
    public virtual ICollection<PracticeSessionNew> PracticeSessions { get; set; } = new List<PracticeSessionNew>();
}