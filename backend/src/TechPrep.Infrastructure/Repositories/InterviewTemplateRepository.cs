using Microsoft.EntityFrameworkCore;
using TechPrep.Core.Entities;
using TechPrep.Core.Enums;
using TechPrep.Core.Interfaces;
using TechPrep.Infrastructure.Data;

namespace TechPrep.Infrastructure.Repositories;

public class InterviewTemplateRepository : GenericRepository<InterviewTemplate>, IInterviewTemplateRepository
{
    public InterviewTemplateRepository(TechPrepDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<InterviewTemplate>> GetByKindAsync(TemplateKind kind)
    {
        return await _context.InterviewTemplates
            .Where(t => t.Kind == kind)
            .OrderBy(t => t.Name)
            .ToListAsync();
    }

    public async Task<InterviewTemplate?> GetWithDetailsAsync(int id)
    {
        return await _context.InterviewTemplates
            .Include(t => t.Assignments)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<IEnumerable<InterviewTemplate>> GetPublicTemplatesAsync(TemplateKind kind)
    {
        return await _context.InterviewTemplates
            .Where(t => t.Kind == kind && t.VisibilityDefault == VisibilityType.Public)
            .OrderBy(t => t.Name)
            .ToListAsync();
    }

    public async Task<IEnumerable<(InterviewTemplate Template, int AssignmentId)>> GetTemplatesByUserAsync(Guid userId, TemplateKind? kind = null)
    {
        var query = _context.SessionAssignments
            .Include(sa => sa.Template)
            .Where(sa => sa.UserId == userId);

        if (kind.HasValue)
        {
            query = query.Where(sa => sa.Template.Kind == kind.Value);
        }

        var assignments = await query
            .OrderByDescending(sa => sa.CreatedAt)
            .ToListAsync();

        return assignments.Select(sa => (sa.Template, sa.Id));
    }
}