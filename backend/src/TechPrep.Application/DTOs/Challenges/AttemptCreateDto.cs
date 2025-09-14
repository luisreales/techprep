namespace TechPrep.Application.DTOs.Challenges;

public record AttemptCreateDto(
    string? SubmittedCode,
    bool? MarkSolved,
    int? Score,
    string? Notes
);