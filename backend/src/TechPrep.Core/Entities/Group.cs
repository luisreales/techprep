namespace TechPrep.Core.Entities;

public class Group
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? OrganizationId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public Guid CreatedByUserId { get; set; }

    // Navigation properties
    public virtual Organization? Organization { get; set; }
    public virtual User CreatedByUser { get; set; } = null!;
    public virtual ICollection<UserGroup> UserGroups { get; set; } = new List<UserGroup>();
    public virtual ICollection<SessionAssignment> SessionAssignments { get; set; } = new List<SessionAssignment>();
}