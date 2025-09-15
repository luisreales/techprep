using TechPrep.Core.Enums;

namespace TechPrep.Application.DTOs.Resources;

public record ResourceUpdateDto(
    ResourceKind Kind,
    string Title,
    string Url,
    string? Author,
    TimeSpan? Duration,
    double? Rating,
    string? Description,
    ResourceDifficulty? Difficulty,
    List<Guid>? QuestionIds,
    List<int>? TopicIds
);