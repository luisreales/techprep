namespace TechPrep.Core.Entities;

public class UserGroup
{
    public int GroupId { get; set; }
    public Guid UserId { get; set; }
    public string? RoleInGroup { get; set; }
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Group Group { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}