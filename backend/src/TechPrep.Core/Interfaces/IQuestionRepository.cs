using TechPrep.Core.Entities;
using TechPrep.Core.Enums;

namespace TechPrep.Core.Interfaces;

public interface IQuestionRepository : IGenericRepository<Question>
{
    Task<IEnumerable<Question>> GetByTopicIdAsync(int topicId);
    Task<IEnumerable<Question>> GetByTypeAsync(QuestionType type);
    Task<IEnumerable<Question>> GetByLevelAsync(DifficultyLevel level);
    Task<IEnumerable<Question>> GetByFiltersAsync(int? topicId, QuestionType? type, DifficultyLevel? level, int skip, int take);
    Task<Question?> GetWithOptionsAsync(Guid id);
    Task<IEnumerable<Question>> GetRandomQuestionsAsync(int? topicId, DifficultyLevel? level, int count);
    Task<int> GetCountByFiltersAsync(int? topicId, QuestionType? type, DifficultyLevel? level);
}