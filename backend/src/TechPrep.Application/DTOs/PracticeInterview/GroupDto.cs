namespace TechPrep.Application.DTOs.PracticeInterview;

public class GroupDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? OrgId { get; set; }
    public int MemberCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class GroupDetailDto : GroupDto
{
    public List<GroupMemberDto> Members { get; set; } = new();
}

public class CreateGroupDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? OrgId { get; set; }
}

public class UpdateGroupDto : CreateGroupDto
{
    public int Id { get; set; }
}

public class GroupMemberDto
{
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? RoleInGroup { get; set; }
    public DateTime JoinedAt { get; set; }
}

public class AddGroupMembersDto
{
    public List<Guid> UserIds { get; set; } = new();
    public string? RoleInGroup { get; set; }
}

public class RemoveGroupMembersDto
{
    public List<Guid> UserIds { get; set; } = new();
}