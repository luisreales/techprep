using Microsoft.EntityFrameworkCore;
using TechPrep.Core.Entities;
using TechPrep.Core.Interfaces;
using TechPrep.Infrastructure.Data;

namespace TechPrep.Infrastructure.Repositories;

public class ChallengeAttemptRepository : GenericRepository<ChallengeAttempt>, IChallengeAttemptRepository
{
    public ChallengeAttemptRepository(TechPrepDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<ChallengeAttempt>> GetByUserIdAsync(Guid userId)
    {
        return await _dbSet
            .Where(a => a.UserId == userId)
            .Include(a => a.CodeChallenge)
            .OrderByDescending(a => a.StartedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<ChallengeAttempt>> GetByChallengeIdAsync(int challengeId)
    {
        return await _dbSet
            .Where(a => a.CodeChallengeId == challengeId)
            .Include(a => a.CodeChallenge)
            .OrderByDescending(a => a.StartedAt)
            .ToListAsync();
    }

    public async Task<ChallengeAttempt?> GetLatestAttemptAsync(int challengeId, Guid userId)
    {
        return await _dbSet
            .Where(a => a.CodeChallengeId == challengeId && a.UserId == userId)
            .Include(a => a.CodeChallenge)
            .OrderByDescending(a => a.StartedAt)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<ChallengeAttempt>> GetUserAttemptsAsync(Guid userId, int skip, int take)
    {
        return await _dbSet
            .Where(a => a.UserId == userId)
            .Include(a => a.CodeChallenge)
            .OrderByDescending(a => a.StartedAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<int> GetUserAttemptCountAsync(Guid userId)
    {
        return await _dbSet
            .Where(a => a.UserId == userId)
            .CountAsync();
    }

    public async Task<bool> HasUserAttemptedChallengeAsync(int challengeId, Guid userId)
    {
        return await _dbSet
            .AnyAsync(a => a.CodeChallengeId == challengeId && a.UserId == userId);
    }
}