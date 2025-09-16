namespace TechPrep.Application.DTOs.Sessions;

public record SessionTemplateUpdateDto
{
    public string Name { get; init; } = default!;
    public string Mode { get; init; } = default!; // "study" or "interview"
    public List<int> Topics { get; init; } = new();
    public List<string> Levels { get; init; } = new(); // ["basic", "medium", "difficult"]
    public bool RandomOrder { get; init; } = true;
    public int? TimeLimitMin { get; init; }
    public int ThresholdWritten { get; init; } = 80;
    public QuestionsConfigDto Questions { get; init; } = new();
    public ChallengesConfigDto Challenges { get; init; } = new();
    public string Status { get; init; } = "draft"; // "draft" or "published"
}