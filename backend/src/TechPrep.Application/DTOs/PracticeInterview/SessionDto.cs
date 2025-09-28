using TechPrep.Core.Enums;

namespace TechPrep.Application.DTOs.PracticeInterview;

public class PracticeSessionDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public int? AssignmentId { get; set; }
    public string? AssignmentName { get; set; }
    public SessionStatus Status { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public DateTime? PausedAt { get; set; }
    public int TotalScore { get; set; }
    public int TotalTimeSec { get; set; }
    public int CurrentQuestionIndex { get; set; }
    public List<PracticeAnswerDto> Answers { get; set; } = new();
}

public class InterviewSessionDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public int AssignmentId { get; set; }
    public string AssignmentName { get; set; } = string.Empty;
    public SessionStatus Status { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public int TotalScore { get; set; }
    public int TotalTimeSec { get; set; }
    public int CurrentQuestionIndex { get; set; }
    public bool CertificateIssued { get; set; }
    public List<InterviewAnswerDto> Answers { get; set; } = new();
}

public class StartPracticeDto
{
    public int AssignmentId { get; set; }
}

public class StartDirectPracticeDto
{
    public int? TopicId { get; set; }
    public string? Level { get; set; }
    public int QuestionCount { get; set; } = 10;
}

public class StartInterviewDto
{
    public int AssignmentId { get; set; }
}

public class SubmitAnswerDto
{
    public Guid QuestionId { get; set; }
    public List<Guid>? SelectedOptionIds { get; set; }
    public string? GivenText { get; set; }
    public int TimeSpentSec { get; set; }
}

public class PracticeAnswerDto
{
    public Guid Id { get; set; }
    public Guid QuestionId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public List<Guid>? SelectedOptionIds { get; set; }
    public string? GivenText { get; set; }
    public bool IsCorrect { get; set; }
    public decimal Score { get; set; }
    public DateTime AnsweredAt { get; set; }
    public int TimeSpentSec { get; set; }
    public string? Explanation { get; set; }
    public List<string> SuggestedResources { get; set; } = new();
}

public class InterviewAnswerDto
{
    public Guid Id { get; set; }
    public Guid QuestionId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public List<Guid>? SelectedOptionIds { get; set; }
    public string? GivenText { get; set; }
    public bool? IsCorrect { get; set; }
    public decimal? Score { get; set; }
    public DateTime AnsweredAt { get; set; }
    public int TimeSpentSec { get; set; }
}

public class SessionStateDto
{
    public string? CurrentQuestionState { get; set; }
    public int CurrentQuestionIndex { get; set; }
}

public class AuditEventDto
{
    public AuditEventType EventType { get; set; }
    public Dictionary<string, object>? Meta { get; set; }
}