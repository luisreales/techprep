using Microsoft.EntityFrameworkCore;
using TechPrep.Core.Entities;
using TechPrep.Core.Enums;
using TechPrep.Core.Interfaces;
using TechPrep.Infrastructure.Data;

namespace TechPrep.Infrastructure.Repositories;

public class QuestionRepository : GenericRepository<Question>, IQuestionRepository
{
    public QuestionRepository(TechPrepDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Question>> GetByTopicIdAsync(int topicId)
    {
        return await _dbSet
            .Where(q => q.TopicId == topicId)
            .Include(q => q.Topic)
            .Include(q => q.Options)
            .ToListAsync();
    }

    public async Task<IEnumerable<Question>> GetByTypeAsync(QuestionType type)
    {
        return await _dbSet
            .Where(q => q.Type == type)
            .Include(q => q.Topic)
            .Include(q => q.Options)
            .ToListAsync();
    }

    public async Task<IEnumerable<Question>> GetByLevelAsync(DifficultyLevel level)
    {
        return await _dbSet
            .Where(q => q.Level == level)
            .Include(q => q.Topic)
            .Include(q => q.Options)
            .ToListAsync();
    }

    public async Task<IEnumerable<Question>> GetByFiltersAsync(int? topicId, QuestionType? type, DifficultyLevel? level, int skip, int take)
    {
        var query = _dbSet.AsQueryable();

        if (topicId.HasValue)
            query = query.Where(q => q.TopicId == topicId.Value);

        if (type.HasValue)
            query = query.Where(q => q.Type == type.Value);

        if (level.HasValue)
            query = query.Where(q => q.Level == level.Value);

        return await query
            .Include(q => q.Topic)
            .Include(q => q.Options)
            .Include(q => q.ResourceLinks)
            .OrderBy(q => q.CreatedAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<Question?> GetWithOptionsAsync(Guid id)
    {
        return await _dbSet
            .Where(q => q.Id == id)
            .Include(q => q.Topic)
            .Include(q => q.Options)
            .Include(q => q.ResourceLinks)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<Question>> GetRandomQuestionsAsync(int? topicId, DifficultyLevel? level, int count)
    {
        var query = _dbSet.AsQueryable();

        if (topicId.HasValue)
            query = query.Where(q => q.TopicId == topicId.Value);

        if (level.HasValue)
            query = query.Where(q => q.Level == level.Value);

        // Get random questions using GUID ordering (SQLite compatible)
        return await query
            .Include(q => q.Topic)
            .Include(q => q.Options)
            .OrderBy(q => Guid.NewGuid())
            .Take(count)
            .ToListAsync();
    }

    public async Task<int> GetCountByFiltersAsync(int? topicId, QuestionType? type, DifficultyLevel? level)
    {
        var query = _dbSet.AsQueryable();

        if (topicId.HasValue)
            query = query.Where(q => q.TopicId == topicId.Value);

        if (type.HasValue)
            query = query.Where(q => q.Type == type.Value);

        if (level.HasValue)
            query = query.Where(q => q.Level == level.Value);

        return await query.CountAsync();
    }
}