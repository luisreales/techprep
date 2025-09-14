using TechPrep.Core.Entities;

namespace TechPrep.Core.Interfaces;

public interface IChallengeAttemptRepository : IGenericRepository<ChallengeAttempt>
{
    Task<IEnumerable<ChallengeAttempt>> GetByUserIdAsync(Guid userId);
    Task<IEnumerable<ChallengeAttempt>> GetByChallengeIdAsync(int challengeId);
    Task<ChallengeAttempt?> GetLatestAttemptAsync(int challengeId, Guid userId);
    Task<IEnumerable<ChallengeAttempt>> GetUserAttemptsAsync(Guid userId, int skip, int take);
    Task<int> GetUserAttemptCountAsync(Guid userId);
    Task<bool> HasUserAttemptedChallengeAsync(int challengeId, Guid userId);
}