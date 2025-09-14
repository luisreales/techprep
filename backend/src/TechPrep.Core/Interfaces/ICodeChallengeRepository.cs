using TechPrep.Core.Entities;
using TechPrep.Core.Enums;

namespace TechPrep.Core.Interfaces;

public interface ICodeChallengeRepository : IGenericRepository<CodeChallenge>
{
    Task<IEnumerable<CodeChallenge>> GetByLanguageAsync(ChallengeLanguage language);
    Task<IEnumerable<CodeChallenge>> GetByDifficultyAsync(ChallengeDifficulty difficulty);
    Task<IEnumerable<CodeChallenge>> GetByFiltersAsync(
        ChallengeLanguage? language, 
        ChallengeDifficulty? difficulty, 
        string? searchTerm, 
        IEnumerable<int>? tagIds, 
        IEnumerable<int>? topicIds,
        int skip, 
        int take);
    Task<CodeChallenge?> GetWithDetailsAsync(int id);
    Task<IEnumerable<CodeChallenge>> GetWithTagsAsync();
    Task<int> GetCountByFiltersAsync(
        ChallengeLanguage? language, 
        ChallengeDifficulty? difficulty, 
        string? searchTerm, 
        IEnumerable<int>? tagIds, 
        IEnumerable<int>? topicIds);
}