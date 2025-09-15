namespace TechPrep.Application.DTOs.Resources;

public record ResourceDetailDto(
    int Id,
    string Kind,
    string Title,
    string Url,
    string? Author,
    string? Duration,
    double? Rating,
    string? Description,
    string? Difficulty,
    IEnumerable<Guid> QuestionIds,
    IEnumerable<string> Topics
);