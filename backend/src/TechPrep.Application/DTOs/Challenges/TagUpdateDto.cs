namespace TechPrep.Application.DTOs.Challenges;

public record TagUpdateDto(
    string Name,
    string? Color = null
);