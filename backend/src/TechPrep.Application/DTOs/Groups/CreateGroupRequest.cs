using System.ComponentModel.DataAnnotations;

namespace TechPrep.Application.DTOs.Groups;

public class CreateGroupRequest
{
    [Required, StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    public int? OrganizationId { get; set; }

    public List<Guid> InitialMemberIds { get; set; } = new();
}