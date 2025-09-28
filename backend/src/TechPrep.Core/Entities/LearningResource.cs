using TechPrep.Core.Enums;

namespace TechPrep.Core.Entities;

public class LearningResource
{
    public int Id { get; set; }
    public ResourceKind Kind { get; set; }
    public string Title { get; set; } = default!;
    public string Url { get; set; } = default!;
    public string? Author { get; set; }
    public TimeSpan? Duration { get; set; }
    public double? Rating { get; set; }
    public string? Description { get; set; }
    public ResourceDifficulty? Difficulty { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<QuestionResource> QuestionLinks { get; set; } = new List<QuestionResource>();
    public ICollection<ResourceTopic> TopicLinks { get; set; } = new List<ResourceTopic>();
}
