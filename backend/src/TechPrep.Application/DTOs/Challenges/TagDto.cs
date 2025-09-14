namespace TechPrep.Application.DTOs.Challenges;

public record TagDto(
    int Id,
    string Name,
    string? Color,
    DateTime CreatedAt
);