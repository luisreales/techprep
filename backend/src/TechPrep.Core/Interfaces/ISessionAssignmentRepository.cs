using TechPrep.Core.Entities;
using TechPrep.Core.Enums;

namespace TechPrep.Core.Interfaces;

public interface ISessionAssignmentRepository : IGenericRepository<SessionAssignment>
{
    Task<IEnumerable<SessionAssignment>> GetByTemplateIdAsync(int templateId);
    Task<IEnumerable<SessionAssignment>> GetPublicAssignmentsAsync(TemplateKind kind);
    Task<IEnumerable<SessionAssignment>> GetByUserIdAsync(Guid userId, TemplateKind kind);
    Task<IEnumerable<SessionAssignment>> GetByGroupIdAsync(int groupId);
    Task<SessionAssignment?> GetWithDetailsAsync(int id);
}