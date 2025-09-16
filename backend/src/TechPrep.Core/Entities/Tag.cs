namespace TechPrep.Core.Entities;

public class Tag
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public string? Color { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<ChallengeTag> ChallengeTag { get; set; } = new List<ChallengeTag>();
}