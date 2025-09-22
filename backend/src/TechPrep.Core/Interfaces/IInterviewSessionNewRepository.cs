using TechPrep.Core.Entities;

namespace TechPrep.Core.Interfaces;

public interface IInterviewSessionNewRepository : IGenericRepository<InterviewSessionNew>
{
    Task<IEnumerable<InterviewSessionNew>> GetByUserIdAsync(Guid userId);
    Task<InterviewSessionNew?> GetWithAnswersAsync(Guid id);
    Task<InterviewSessionNew?> GetActiveSessionAsync(Guid userId, int assignmentId);
    Task<IEnumerable<InterviewSessionNew>> GetCompletedSessionsAsync(Guid userId);
}