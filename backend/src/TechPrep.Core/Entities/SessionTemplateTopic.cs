namespace TechPrep.Core.Entities;

public class SessionTemplateTopic
{
    public int TemplateId { get; set; }
    public int TopicId { get; set; }

    public SessionTemplate Template { get; set; } = default!;
    public Topic Topic { get; set; } = default!;
}

