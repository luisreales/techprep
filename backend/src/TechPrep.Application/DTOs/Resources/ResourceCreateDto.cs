using TechPrep.Core.Enums;

namespace TechPrep.Application.DTOs.Resources;

public record ResourceCreateDto(
    ResourceKind Kind,
    string Title,
    string Url,
    string? Author,
    TimeSpan? Duration,
    double? Rating,              // 0..5
    string? Description,
    ResourceDifficulty? Difficulty,
    List<Guid>? QuestionIds,     // associations iniciales
    List<int>? TopicIds
);