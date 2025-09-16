namespace TechPrep.Application.DTOs.Sessions;

public record SessionTemplateListItemDto
{
    public int Id { get; init; }
    public string Name { get; init; } = default!;
    public string Mode { get; init; } = default!; // "study" or "interview"
    public string Status { get; init; } = default!; // "draft" or "published"
    public int? TimeLimitMin { get; init; }
    public int TotalItems { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}