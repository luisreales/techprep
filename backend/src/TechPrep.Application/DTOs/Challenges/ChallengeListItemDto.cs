namespace TechPrep.Application.DTOs.Challenges;

public record ChallengeListItemDto(
    int Id,
    string Title,
    string Language,
    string Difficulty,
    bool HasSolution,
    DateTime CreatedAt,
    IEnumerable<string> Tags
);