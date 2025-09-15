namespace TechPrep.Application.DTOs.Resources;

public record ResourceListItemDto(
    int Id,
    string Kind,
    string Title,
    string Url,
    string? Author,
    double? Rating,
    string? Difficulty,
    DateTime CreatedAt,
    IEnumerable<string> Topics
);