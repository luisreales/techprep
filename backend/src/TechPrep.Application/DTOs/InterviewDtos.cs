namespace TechPrep.Application.DTOs;

public record StartInterviewRequest(int assignmentId);

public record StartInterviewResponse(Guid interviewSessionId);

public record RunnerOptionDto(
    string Id,
    string Text
);

public record RunnerQuestionDto(
    Guid QuestionId,
    string Type,
    string Text,
    IEnumerable<RunnerOptionDto>? Options,
    string Topic,
    string Level,
    int Index,
    int Total
);

public record RunnerStateDto(
    Guid InterviewSessionId,
    int CurrentQuestionIndex,
    int TotalItems,
    IEnumerable<RunnerQuestionDto> Questions
);

public record SaveLocalAnswerDto(
    Guid QuestionId,
    string Type,
    IEnumerable<Guid>? OptionIds,
    string? Text,
    int TimeMs
);

public record SubmitInterviewRequest(
    IEnumerable<SubmitItem> Questions
);

public record SubmitItem(
    Guid QuestionId,
    string Type,
    IEnumerable<Guid>? OptionIds,
    string? Text,
    int TimeMs
);

public record InterviewSummaryDto(
    Guid InterviewSessionId,
    DateTime StartedAt,
    DateTime SubmittedAt,
    int TotalItems,
    int CorrectCount,
    int IncorrectCount,
    int TotalTimeSec,
    IEnumerable<SummarySlice> ByTopic,
    IEnumerable<SummarySlice> ByType,
    IEnumerable<SummarySlice> ByLevel
);

public record SummarySlice(
    string Key,
    int Correct,
    int Total,
    double Accuracy
);

public record RetakeResponse(
    Guid newInterviewSessionId,
    int numberAttemps
);

public record InterviewSessionListDto(
    Guid Id,
    Guid? ParentSessionId,
    int AttemptNumber,
    string AssignmentName,
    string Status,
    int? Score,
    int TotalItems,
    DateTime StartedAt,
    DateTime? SubmittedAt,
    int DurationSec
);

public record InterviewRetakeDto(
    Guid InterviewSessionId
);