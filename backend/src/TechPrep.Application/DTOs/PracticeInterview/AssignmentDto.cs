using TechPrep.Core.Enums;

namespace TechPrep.Application.DTOs.PracticeInterview;

public class AssignmentDto
{
    public int Id { get; set; }
    public int TemplateId { get; set; }
    public string TemplateName { get; set; } = string.Empty;
    public TemplateKind TemplateKind { get; set; }
    public VisibilityType Visibility { get; set; }
    public int? GroupId { get; set; }
    public string? GroupName { get; set; }
    public Guid? UserId { get; set; }
    public string? UserName { get; set; }
    public DateTime? WindowStart { get; set; }
    public DateTime? WindowEnd { get; set; }
    public int? MaxAttempts { get; set; }
    public int? CooldownHoursBetweenAttempts { get; set; }
    public bool CertificationEnabled { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateAssignmentDto
{
    public int TemplateId { get; set; }
    public VisibilityType Visibility { get; set; }
    public int? GroupId { get; set; }
    public Guid? UserId { get; set; }
    public DateTime? WindowStart { get; set; }
    public DateTime? WindowEnd { get; set; }
    public int? MaxAttempts { get; set; }
    public int? CooldownHoursBetweenAttempts { get; set; }
    public bool CertificationEnabled { get; set; } = false;
}

public class UpdateAssignmentDto : CreateAssignmentDto
{
    public int Id { get; set; }
}