using TechPrep.Application.DTOs.Challenges;
using TechPrep.Core.Enums;

namespace TechPrep.Application.Interfaces;

public interface ICodeChallengeService
{
    Task<List<ChallengeListItemDto>> GetChallengesAsync(
        ChallengeLanguage? language = null,
        ChallengeDifficulty? difficulty = null,
        string? searchTerm = null,
        IEnumerable<int>? tagIds = null,
        IEnumerable<int>? topicIds = null,
        int page = 1,
        int limit = 25);
        
    Task<ChallengeDetailDto?> GetChallengeByIdAsync(int id);
    
    Task<ChallengeDetailDto> CreateChallengeAsync(ChallengeCreateDto createDto);
    
    Task<ChallengeDetailDto?> UpdateChallengeAsync(int id, ChallengeUpdateDto updateDto);
    
    Task<bool> DeleteChallengeAsync(int id);
    
    Task<int> GetChallengesCountAsync(
        ChallengeLanguage? language = null,
        ChallengeDifficulty? difficulty = null,
        string? searchTerm = null,
        IEnumerable<int>? tagIds = null,
        IEnumerable<int>? topicIds = null);
        
    Task<AttemptDto> SubmitAttemptAsync(int challengeId, Guid userId, AttemptCreateDto attemptDto);
    
    Task<List<AttemptDto>> GetUserAttemptsAsync(Guid userId, int page = 1, int limit = 25);
    
    Task<AttemptDto?> GetLatestAttemptAsync(int challengeId, Guid userId);
}