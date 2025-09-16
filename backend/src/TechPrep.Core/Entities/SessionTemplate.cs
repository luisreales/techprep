using TechPrep.Core.Enums;

namespace TechPrep.Core.Entities;

public class SessionTemplate
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public PracticeMode Mode { get; set; }
    public string TopicsJson { get; set; } = "[]";
    public string LevelsJson { get; set; } = "[]";
    public bool RandomOrder { get; set; } = true;
    public int? TimeLimitMin { get; set; }
    public int ThresholdWritten { get; set; } = 80;
    public TemplateStatus Status { get; set; } = TemplateStatus.Draft;
    
    public string QuestionsConfigJson { get; set; } = "{}";
    public string ChallengesConfigJson { get; set; } = "{}";
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    public ICollection<SessionTemplateItem> TemplateItems { get; set; } = new List<SessionTemplateItem>();
}