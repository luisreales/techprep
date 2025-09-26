using TechPrep.Core.Enums;

namespace TechPrep.Application.DTOs.Session;

public class AnswerSubmissionDto
{
    public Guid QuestionId { get; set; }
    public QuestionType AnswerType { get; set; }
    public string? Text { get; set; } // For written questions
    public List<Guid> Options { get; set; } = new(); // For choice questions
    public int TimeMs { get; set; } // Time spent answering in milliseconds
}