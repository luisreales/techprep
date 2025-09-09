using TechPrep.Core.Enums;

namespace TechPrep.Application.DTOs.Session;

public class InterviewSessionDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public PracticeMode Mode { get; set; }
    public int? TopicId { get; set; }
    public string? TopicName { get; set; }
    public DifficultyLevel? Level { get; set; }
    public int TotalQuestions { get; set; }
    public int CorrectAnswers { get; set; }
    public decimal Score { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? FinishedAt { get; set; }
    public bool IsCompleted { get; set; }
    public IEnumerable<InterviewAnswerDto> Answers { get; set; } = new List<InterviewAnswerDto>();
}

public class InterviewAnswerDto
{
    public Guid Id { get; set; }
    public Guid QuestionId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string? GivenAnswer { get; set; }
    public IEnumerable<Guid>? SelectedOptions { get; set; }
    public bool IsCorrect { get; set; }
    public decimal? MatchPercentage { get; set; }
    public int TimeSpentSeconds { get; set; }
    public DateTime AnsweredAt { get; set; }
}

public class StartSessionDto
{
    public PracticeMode Mode { get; set; }
    public int? TopicId { get; set; }
    public DifficultyLevel? Level { get; set; }
    public int QuestionCount { get; set; } = 10;
}

public class SubmitAnswerDto
{
    public Guid QuestionId { get; set; }
    public string? WrittenAnswer { get; set; }
    public IEnumerable<Guid>? SelectedOptionIds { get; set; }
    public int TimeSpentSeconds { get; set; }
}