namespace TechPrep.Application.DTOs.Challenges;

public record ChallengeDetailDto(
    int Id,
    string Title,
    string Language,
    string Difficulty,
    string Prompt,
    bool HasSolution,
    string? OfficialSolution,
    string? TestsJson,
    IEnumerable<string> Tags,
    IEnumerable<string> Topics
);