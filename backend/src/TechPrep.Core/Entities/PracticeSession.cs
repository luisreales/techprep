using TechPrep.Core.Enums;

namespace TechPrep.Core.Entities;

public class PracticeSession
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public int? TemplateId { get; set; }
    public PracticeMode Mode { get; set; }
    public bool RandomOrder { get; set; }
    public int? TimeLimitMin { get; set; }
    public int ThresholdWritten { get; set; }
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? FinishedAt { get; set; }
    public int TotalItems { get; set; }
    public int CorrectCount { get; set; }
    public int IncorrectCount { get; set; }
    
    public User User { get; set; } = default!;
    public SessionTemplate? Template { get; set; }
    public ICollection<PracticeSessionItem> SessionItems { get; set; } = new List<PracticeSessionItem>();
}