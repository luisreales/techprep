using TechPrep.Core.Enums;

namespace TechPrep.Application.DTOs.Sessions;

public record SessionTemplateDetailDto
{
    public int Id { get; init; }
    public string Name { get; init; } = default!;
    public string Mode { get; init; } = default!; // "study" or "interview"
    public List<int> Topics { get; init; } = new();
    public List<string> Levels { get; init; } = new(); // ["basic", "medium", "difficult"]
    public bool RandomOrder { get; init; } = true;
    public int? TimeLimitMin { get; init; }
    public int ThresholdWritten { get; init; } = 80;
    public string Status { get; init; } = default!; // "draft" or "published"
    public QuestionsConfigDto Questions { get; init; } = new();
    public ChallengesConfigDto Challenges { get; init; } = new();
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public List<SessionTemplateItemDto> Items { get; init; } = new();
}

public record SessionTemplateItemDto
{
    public int Id { get; init; }
    public string ItemType { get; init; } = default!; // "question" or "challenge"
    public string ItemId { get; init; } = default!;
    public int OrderIndex { get; init; }
}