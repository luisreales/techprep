namespace TechPrep.Core.Entities;

public class PracticeSessionTopic
{
    public Guid PracticeSessionId { get; set; }
    public string TopicId { get; set; } = string.Empty;
    public string Levels { get; set; } = string.Empty;

    public PracticeSessionNew PracticeSession { get; set; } = default!;
    public Topic? Topic { get; set; }
}