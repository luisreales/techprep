namespace TechPrep.Core.Entities;

public class Topic
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual ICollection<Question> Questions { get; set; } = new List<Question>();
}