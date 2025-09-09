using Microsoft.EntityFrameworkCore;
using TechPrep.Core.Entities;
using TechPrep.Core.Enums;
using TechPrep.Core.Interfaces;
using TechPrep.Infrastructure.Data;

namespace TechPrep.Infrastructure.Repositories;

public class InterviewSessionRepository : GenericRepository<InterviewSession>, IInterviewSessionRepository
{
    public InterviewSessionRepository(TechPrepDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<InterviewSession>> GetByUserIdAsync(Guid userId)
    {
        return await _dbSet
            .Where(s => s.UserId == userId)
            .Include(s => s.Topic)
            .OrderByDescending(s => s.StartedAt)
            .ToListAsync();
    }

    public async Task<InterviewSession?> GetWithAnswersAsync(Guid id)
    {
        return await _dbSet
            .Where(s => s.Id == id)
            .Include(s => s.Topic)
            .Include(s => s.User)
            .Include(s => s.Answers)
                .ThenInclude(a => a.Question)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<InterviewSession>> GetUserSessionsByModeAsync(Guid userId, PracticeMode mode)
    {
        return await _dbSet
            .Where(s => s.UserId == userId && s.Mode == mode)
            .Include(s => s.Topic)
            .OrderByDescending(s => s.StartedAt)
            .ToListAsync();
    }

    public async Task<InterviewSession?> GetActiveSessionAsync(Guid userId)
    {
        return await _dbSet
            .Where(s => s.UserId == userId && !s.IsCompleted)
            .Include(s => s.Topic)
            .Include(s => s.Answers)
            .OrderByDescending(s => s.StartedAt)
            .FirstOrDefaultAsync();
    }
}