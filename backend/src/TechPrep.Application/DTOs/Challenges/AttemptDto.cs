namespace TechPrep.Application.DTOs.Challenges;

public record AttemptDto(
    Guid Id,
    int ChallengeId,
    DateTime StartedAt,
    DateTime? FinishedAt,
    bool? MarkedSolved,
    int? Score,
    string? Notes
);