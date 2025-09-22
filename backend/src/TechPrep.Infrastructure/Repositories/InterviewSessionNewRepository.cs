using Microsoft.EntityFrameworkCore;
using TechPrep.Core.Entities;
using TechPrep.Core.Enums;
using TechPrep.Core.Interfaces;
using TechPrep.Infrastructure.Data;

namespace TechPrep.Infrastructure.Repositories;

public class InterviewSessionNewRepository : GenericRepository<InterviewSessionNew>, IInterviewSessionNewRepository
{
    public InterviewSessionNewRepository(TechPrepDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<InterviewSessionNew>> GetByUserIdAsync(Guid userId)
    {
        return await _context.InterviewSessionsNew
            .Where(ints => ints.UserId == userId)
            .Include(ints => ints.Assignment)
                .ThenInclude(a => a.Template)
            .OrderByDescending(ints => ints.StartedAt)
            .ToListAsync();
    }

    public async Task<InterviewSessionNew?> GetWithAnswersAsync(Guid id)
    {
        return await _context.InterviewSessionsNew
            .Include(ints => ints.Answers)
                .ThenInclude(a => a.Question)
            .Include(ints => ints.Assignment)
                .ThenInclude(a => a.Template)
            .Include(ints => ints.Certificate)
            .FirstOrDefaultAsync(ints => ints.Id == id);
    }

    public async Task<InterviewSessionNew?> GetActiveSessionAsync(Guid userId, int assignmentId)
    {
        return await _context.InterviewSessionsNew
            .Where(ints => ints.UserId == userId &&
                          ints.AssignmentId == assignmentId &&
                          ints.Status == SessionStatus.InProgress)
            .Include(ints => ints.Assignment)
                .ThenInclude(a => a.Template)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<InterviewSessionNew>> GetCompletedSessionsAsync(Guid userId)
    {
        return await _context.InterviewSessionsNew
            .Where(ints => ints.UserId == userId && ints.Status == SessionStatus.Completed)
            .Include(ints => ints.Assignment)
                .ThenInclude(a => a.Template)
            .Include(ints => ints.Certificate)
            .OrderByDescending(ints => ints.SubmittedAt)
            .ToListAsync();
    }
}