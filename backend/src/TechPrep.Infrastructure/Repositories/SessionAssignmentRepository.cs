using Microsoft.EntityFrameworkCore;
using TechPrep.Core.Entities;
using TechPrep.Core.Enums;
using TechPrep.Core.Interfaces;
using TechPrep.Infrastructure.Data;

namespace TechPrep.Infrastructure.Repositories;

public class SessionAssignmentRepository : GenericRepository<SessionAssignment>, ISessionAssignmentRepository
{
    public SessionAssignmentRepository(TechPrepDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<SessionAssignment>> GetByTemplateIdAsync(int templateId)
    {
        return await _context.SessionAssignments
            .Where(a => a.TemplateId == templateId)
            .Include(a => a.Template)
            .Include(a => a.Group)
            .Include(a => a.User)
            .OrderBy(a => a.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<SessionAssignment>> GetPublicAssignmentsAsync(TemplateKind kind)
    {
        return await _context.SessionAssignments
            .Where(a => a.Visibility == VisibilityType.Public && a.Template.Kind == kind)
            .Include(a => a.Template)
            .OrderBy(a => a.Template.Name)
            .ToListAsync();
    }

    public async Task<IEnumerable<SessionAssignment>> GetByUserIdAsync(Guid userId, TemplateKind kind)
    {
        return await _context.SessionAssignments
            .Where(a => a.Template.Kind == kind &&
                       (a.Visibility == VisibilityType.Public ||
                        (a.Visibility == VisibilityType.Private && a.UserId == userId) ||
                        (a.Visibility == VisibilityType.Group && a.Group!.UserGroups.Any(ug => ug.UserId == userId))))
            .Include(a => a.Template)
            .Include(a => a.Group)
            .OrderBy(a => a.Template.Name)
            .ToListAsync();
    }

    public async Task<IEnumerable<SessionAssignment>> GetByGroupIdAsync(int groupId)
    {
        return await _context.SessionAssignments
            .Where(a => a.GroupId == groupId)
            .Include(a => a.Template)
            .OrderBy(a => a.Template.Name)
            .ToListAsync();
    }

    public async Task<SessionAssignment?> GetWithDetailsAsync(int id)
    {
        return await _context.SessionAssignments
            .Include(a => a.Template)
            .Include(a => a.Group)
            .Include(a => a.User)
            .FirstOrDefaultAsync(a => a.Id == id);
    }
}