using TechPrep.Core.Entities;

namespace TechPrep.Core.Interfaces;

public interface IPracticeSessionRepository : IGenericRepository<PracticeSessionNew>
{
    Task<IEnumerable<PracticeSessionNew>> GetByUserIdAsync(Guid userId);
    Task<PracticeSessionNew?> GetWithAnswersAsync(Guid id);
    Task<PracticeSessionNew?> GetActiveSessionAsync(Guid userId, int assignmentId);
}