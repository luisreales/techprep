namespace TechPrep.Application.DTOs.Challenges;

public record ChallengeUpdateDto(
    string Title,
    string Language,
    string Difficulty,
    string Prompt,
    string? OfficialSolution,
    string? TestsJson,
    List<string>? Tags,
    List<int>? TopicIds
);