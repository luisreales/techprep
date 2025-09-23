using TechPrep.Core.Enums;

namespace TechPrep.Application.DTOs.Groups;

public class GroupDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? OrganizationId { get; set; }
    public string? OrganizationName { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid CreatedByUserId { get; set; }
    public string CreatedByUserName { get; set; } = string.Empty;
    public int MemberCount { get; set; }
    public GroupRole? CurrentUserRole { get; set; }
}