namespace TechPrep.Application.DTOs.Challenges;

public record TagCreateDto(
    string Name,
    string? Color = null
);