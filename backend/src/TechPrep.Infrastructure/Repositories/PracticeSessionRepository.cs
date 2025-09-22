using Microsoft.EntityFrameworkCore;
using TechPrep.Core.Entities;
using TechPrep.Core.Enums;
using TechPrep.Core.Interfaces;
using TechPrep.Infrastructure.Data;

namespace TechPrep.Infrastructure.Repositories;

public class PracticeSessionRepository : GenericRepository<PracticeSessionNew>, IPracticeSessionRepository
{
    public PracticeSessionRepository(TechPrepDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<PracticeSessionNew>> GetByUserIdAsync(Guid userId)
    {
        return await _context.PracticeSessionsNew
            .Where(ps => ps.UserId == userId)
            .Include(ps => ps.Assignment)
                .ThenInclude(a => a!.Template)
            .OrderByDescending(ps => ps.StartedAt)
            .ToListAsync();
    }

    public async Task<PracticeSessionNew?> GetWithAnswersAsync(Guid id)
    {
        return await _context.PracticeSessionsNew
            .Include(ps => ps.Answers)
                .ThenInclude(a => a.Question)
            .Include(ps => ps.Assignment)
                .ThenInclude(a => a!.Template)
            .FirstOrDefaultAsync(ps => ps.Id == id);
    }

    public async Task<PracticeSessionNew?> GetActiveSessionAsync(Guid userId, int assignmentId)
    {
        return await _context.PracticeSessionsNew
            .Where(ps => ps.UserId == userId &&
                        ps.AssignmentId == assignmentId &&
                        ps.Status == SessionStatus.InProgress)
            .Include(ps => ps.Assignment)
                .ThenInclude(a => a!.Template)
            .FirstOrDefaultAsync();
    }
}