using TechPrep.Application.DTOs;
using TechPrep.Core.Enums;

namespace TechPrep.Application.Interfaces;

public interface IQuestionService
{
    Task<List<QuestionDto>> GetQuestionsAsync(
        int? topicId = null,
        QuestionType? type = null,
        DifficultyLevel? level = null,
        string? search = null,
        int page = 1,
        int limit = 25);
    
    Task<int> GetQuestionsCountAsync(
        int? topicId = null,
        QuestionType? type = null,
        DifficultyLevel? level = null,
        string? search = null,
        bool? usableInPractice = null,
        bool? usableInInterview = null,
        bool enforceInterviewCooldown = false);
    
    Task<QuestionDto?> GetQuestionByIdAsync(Guid id);
    Task<QuestionDto> CreateQuestionAsync(CreateQuestionDto createQuestionDto);
    Task<QuestionDto?> UpdateQuestionAsync(Guid id, UpdateQuestionDto updateQuestionDto);
    Task<bool> DeleteQuestionAsync(Guid id);
    Task<int> BulkDeleteQuestionsAsync(List<Guid> ids);
    Task<byte[]> ExportQuestionsAsync(List<Guid>? ids = null);
}
