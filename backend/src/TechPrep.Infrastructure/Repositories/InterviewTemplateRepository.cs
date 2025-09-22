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
}