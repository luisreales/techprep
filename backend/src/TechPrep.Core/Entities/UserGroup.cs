using TechPrep.Core.Enums;

namespace TechPrep.Core.Entities;

public class UserGroup
{
    public int GroupId { get; set; }
    public Guid UserId { get; set; }
    public GroupRole Role { get; set; } = GroupRole.Member;
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    public Guid? AddedByUserId { get; set; }

    // Navigation properties
    public virtual Group Group { get; set; } = null!;
    public virtual User User { get; set; } = null!;
    public virtual User? AddedByUser { get; set; }
}