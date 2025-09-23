using System.ComponentModel.DataAnnotations;
using TechPrep.Core.Enums;

namespace TechPrep.Application.DTOs.Groups;

public class AddGroupMembersRequest
{
    [Required]
    public List<Guid> UserIds { get; set; } = new();

    public GroupRole DefaultRole { get; set; } = GroupRole.Member;
}