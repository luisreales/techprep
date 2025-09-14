namespace TechPrep.Core.Entities;

public class Tag
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    
    // Navigation properties
    public ICollection<ChallengeTag> ChallengeTag { get; set; } = new List<ChallengeTag>();
}