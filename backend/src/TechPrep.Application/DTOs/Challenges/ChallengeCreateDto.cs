namespace TechPrep.Application.DTOs.Challenges;

public record ChallengeCreateDto(
    string Title,
    string Language,
    string Difficulty,
    string Prompt,
    string? OfficialSolution,
    string? TestsJson,
    List<string>? Tags,
    List<int>? TopicIds
);