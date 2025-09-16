using TechPrep.Core.Enums;

namespace TechPrep.Core.Entities;

public class PracticeSessionItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SessionId { get; set; }
    public int OrderIndex { get; set; }
    public SessionItemType ItemType { get; set; }
    public string ItemId { get; set; } = default!;
    public string Level { get; set; } = default!;
    public int TopicId { get; set; }
    
    // Tracking
    public int TimeMs { get; set; }
    public bool? IsCorrect { get; set; }
    public int? MatchPercent { get; set; }
    public string? ChosenOptionsJson { get; set; }
    public string? GivenText { get; set; }
    public bool? ChallengeSolved { get; set; }
    public DateTime? AnsweredAt { get; set; }
    
    public PracticeSession Session { get; set; } = default!;
    public Topic Topic { get; set; } = default!;
}