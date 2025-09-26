using TechPrep.Core.Entities;
using TechPrep.Core.Enums;

namespace TechPrep.Core.Interfaces;

public interface IInterviewTemplateRepository : IGenericRepository<InterviewTemplate>
{
    Task<IEnumerable<InterviewTemplate>> GetByKindAsync(TemplateKind kind);
    Task<InterviewTemplate?> GetWithDetailsAsync(int id);
    Task<IEnumerable<InterviewTemplate>> GetPublicTemplatesAsync(TemplateKind kind);
    Task<IEnumerable<(InterviewTemplate Template, int AssignmentId)>> GetTemplatesByUserAsync(Guid userId, TemplateKind? kind = null);
}