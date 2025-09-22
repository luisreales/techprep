namespace TechPrep.Core.Entities;

public class Group
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? OrgId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ICollection<UserGroup> UserGroups { get; set; } = new List<UserGroup>();
    public virtual ICollection<SessionAssignment> Assignments { get; set; } = new List<SessionAssignment>();
}