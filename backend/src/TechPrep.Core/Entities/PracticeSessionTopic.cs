namespace TechPrep.Core.Entities;

public class PracticeSessionTopic
{
    public Guid PracticeSessionId { get; set; }
    public int TopicId { get; set; }

    public PracticeSessionNew PracticeSession { get; set; } = default!;
    public Topic Topic { get; set; } = default!;
}