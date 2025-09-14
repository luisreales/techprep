using Microsoft.EntityFrameworkCore;
using TechPrep.Core.Entities;
using TechPrep.Core.Enums;
using TechPrep.Core.Interfaces;
using TechPrep.Infrastructure.Data;

namespace TechPrep.Infrastructure.Repositories;

public class CodeChallengeRepository : GenericRepository<CodeChallenge>, ICodeChallengeRepository
{
    public CodeChallengeRepository(TechPrepDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<CodeChallenge>> GetByLanguageAsync(ChallengeLanguage language)
    {
        return await _dbSet
            .Where(c => c.Language == language)
            .Include(c => c.Tags)
                .ThenInclude(ct => ct.Tag)
            .Include(c => c.Topics)
                .ThenInclude(ct => ct.Topic)
            .ToListAsync();
    }

    public async Task<IEnumerable<CodeChallenge>> GetByDifficultyAsync(ChallengeDifficulty difficulty)
    {
        return await _dbSet
            .Where(c => c.Difficulty == difficulty)
            .Include(c => c.Tags)
                .ThenInclude(ct => ct.Tag)
            .Include(c => c.Topics)
                .ThenInclude(ct => ct.Topic)
            .ToListAsync();
    }

    public async Task<IEnumerable<CodeChallenge>> GetByFiltersAsync(
        ChallengeLanguage? language, 
        ChallengeDifficulty? difficulty, 
        string? searchTerm, 
        IEnumerable<int>? tagIds, 
        IEnumerable<int>? topicIds,
        int skip, 
        int take)
    {
        var query = _dbSet.AsQueryable();

        if (language.HasValue)
            query = query.Where(c => c.Language == language.Value);

        if (difficulty.HasValue)
            query = query.Where(c => c.Difficulty == difficulty.Value);

        if (!string.IsNullOrWhiteSpace(searchTerm))
            query = query.Where(c => c.Title.Contains(searchTerm) || c.Prompt.Contains(searchTerm));

        if (tagIds?.Any() == true)
            query = query.Where(c => c.Tags.Any(ct => tagIds.Contains(ct.TagId)));

        if (topicIds?.Any() == true)
            query = query.Where(c => c.Topics.Any(ct => topicIds.Contains(ct.TopicId)));

        return await query
            .Include(c => c.Tags)
                .ThenInclude(ct => ct.Tag)
            .Include(c => c.Topics)
                .ThenInclude(ct => ct.Topic)
            .OrderByDescending(c => c.CreatedAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<CodeChallenge?> GetWithDetailsAsync(int id)
    {
        return await _dbSet
            .Where(c => c.Id == id)
            .Include(c => c.Tags)
                .ThenInclude(ct => ct.Tag)
            .Include(c => c.Topics)
                .ThenInclude(ct => ct.Topic)
            .Include(c => c.Attempts)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<CodeChallenge>> GetWithTagsAsync()
    {
        return await _dbSet
            .Include(c => c.Tags)
                .ThenInclude(ct => ct.Tag)
            .Include(c => c.Topics)
                .ThenInclude(ct => ct.Topic)
            .ToListAsync();
    }

    public async Task<int> GetCountByFiltersAsync(
        ChallengeLanguage? language, 
        ChallengeDifficulty? difficulty, 
        string? searchTerm, 
        IEnumerable<int>? tagIds, 
        IEnumerable<int>? topicIds)
    {
        var query = _dbSet.AsQueryable();

        if (language.HasValue)
            query = query.Where(c => c.Language == language.Value);

        if (difficulty.HasValue)
            query = query.Where(c => c.Difficulty == difficulty.Value);

        if (!string.IsNullOrWhiteSpace(searchTerm))
            query = query.Where(c => c.Title.Contains(searchTerm) || c.Prompt.Contains(searchTerm));

        if (tagIds?.Any() == true)
            query = query.Where(c => c.Tags.Any(ct => tagIds.Contains(ct.TagId)));

        if (topicIds?.Any() == true)
            query = query.Where(c => c.Topics.Any(ct => topicIds.Contains(ct.TopicId)));

        return await query.CountAsync();
    }
}