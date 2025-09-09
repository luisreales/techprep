using TechPrep.Core.Enums;

namespace TechPrep.Application.DTOs.Question;

public class QuestionDto
{
    public Guid Id { get; set; }
    public int TopicId { get; set; }
    public string TopicName { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    public QuestionType Type { get; set; }
    public DifficultyLevel Level { get; set; }
    public string? OfficialAnswer { get; set; }
    public IEnumerable<QuestionOptionDto> Options { get; set; } = new List<QuestionOptionDto>();
    public IEnumerable<LearningResourceDto> LearningResources { get; set; } = new List<LearningResourceDto>();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class QuestionOptionDto
{
    public Guid Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public int OrderIndex { get; set; }
}

public class LearningResourceDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class CreateQuestionDto
{
    public int TopicId { get; set; }
    public string Text { get; set; } = string.Empty;
    public QuestionType Type { get; set; }
    public DifficultyLevel Level { get; set; }
    public string? OfficialAnswer { get; set; }
    public IEnumerable<CreateQuestionOptionDto> Options { get; set; } = new List<CreateQuestionOptionDto>();
    public IEnumerable<CreateLearningResourceDto> LearningResources { get; set; } = new List<CreateLearningResourceDto>();
}

public class CreateQuestionOptionDto
{
    public string Text { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public int OrderIndex { get; set; }
}

public class CreateLearningResourceDto
{
    public string Title { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class QuestionFilterDto
{
    public int? TopicId { get; set; }
    public QuestionType? Type { get; set; }
    public DifficultyLevel? Level { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}