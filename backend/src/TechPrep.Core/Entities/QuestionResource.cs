namespace TechPrep.Core.Entities;

public class QuestionResource
{
    public Guid QuestionId { get; set; }
    public Question Question { get; set; } = default!;
    public int ResourceId { get; set; }
    public LearningResource Resource { get; set; } = default!;
    public string? Note { get; set; }
}