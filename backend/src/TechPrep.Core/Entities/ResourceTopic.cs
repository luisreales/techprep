namespace TechPrep.Core.Entities;

public class ResourceTopic
{
    public int ResourceId { get; set; }
    public LearningResource Resource { get; set; } = default!;
    public int TopicId { get; set; }
    public Topic Topic { get; set; } = default!;
}