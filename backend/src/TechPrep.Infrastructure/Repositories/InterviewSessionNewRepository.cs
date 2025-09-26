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
            .OrderByDescending(ints => ints.StartedAt)
            .ToListAsync();
    }

    public async Task<InterviewSessionNew?> GetWithAnswersAsync(Guid id)
    {
        return await _context.InterviewSessionsNew
            .Include(ints => ints.Answers)
            .FirstOrDefaultAsync(ints => ints.Id == id);
    }

    public async Task<InterviewSessionNew?> GetActiveSessionAsync(Guid userId, int assignmentId)
    {
        return await _context.InterviewSessionsNew
            .Where(ints => ints.UserId == userId &&
                          ints.AssignmentId == assignmentId &&
                          ints.Status == "Active")
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<InterviewSessionNew>> GetCompletedSessionsAsync(Guid userId)
    {
        return await _context.InterviewSessionsNew
            .Where(ints => ints.UserId == userId && ints.Status == "Completed")
            .OrderByDescending(ints => ints.SubmittedAt)
            .ToListAsync();
    }
}