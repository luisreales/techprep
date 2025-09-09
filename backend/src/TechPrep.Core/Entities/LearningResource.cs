namespace TechPrep.Core.Entities;

public class LearningResource
{
    public Guid Id { get; set; }
    public Guid QuestionId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual Question Question { get; set; } = null!;
}