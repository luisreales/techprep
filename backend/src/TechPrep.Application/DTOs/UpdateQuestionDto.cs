using System.ComponentModel.DataAnnotations;
using TechPrep.Core.Enums;

namespace TechPrep.Application.DTOs;

public class UpdateQuestionDto
{
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Topic ID must be greater than 0")]
    public int TopicId { get; set; }

    [Required]
    [MinLength(10, ErrorMessage = "Question text must be at least 10 characters")]
    public string Text { get; set; } = string.Empty;

    [Required]
    public QuestionType Type { get; set; }

    [Required]
    public DifficultyLevel Level { get; set; }

    public string? OfficialAnswer { get; set; }

    public List<UpdateQuestionOptionDto> Options { get; set; } = new();

    public List<UpdateLearningResourceDto> LearningResources { get; set; } = new();
}

public class UpdateQuestionOptionDto
{
    public Guid? Id { get; set; }

    [Required]
    [MinLength(1, ErrorMessage = "Option text is required")]
    public string Text { get; set; } = string.Empty;

    public bool IsCorrect { get; set; }

    public int OrderIndex { get; set; }
}

public class UpdateLearningResourceDto
{
    public Guid? Id { get; set; }

    [Required]
    [MinLength(1, ErrorMessage = "Title is required")]
    public string Title { get; set; } = string.Empty;

    [Required]
    [Url(ErrorMessage = "Invalid URL format")]
    public string Url { get; set; } = string.Empty;

    public string? Description { get; set; }
}