namespace TechPrep.Core.Entities;

public class Organization
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Domain { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ICollection<Group> Groups { get; set; } = new List<Group>();
    public virtual ICollection<User> Users { get; set; } = new List<User>();
}