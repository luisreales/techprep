using TechPrep.Core.Entities;
using TechPrep.Core.Enums;

namespace TechPrep.Core.Interfaces;

public interface IInterviewSessionRepository : IGenericRepository<InterviewSession>
{
    Task<IEnumerable<InterviewSession>> GetByUserIdAsync(Guid userId);
    Task<InterviewSession?> GetWithAnswersAsync(Guid id);
    Task<IEnumerable<InterviewSession>> GetUserSessionsByModeAsync(Guid userId, PracticeMode mode);
    Task<InterviewSession?> GetActiveSessionAsync(Guid userId);
}