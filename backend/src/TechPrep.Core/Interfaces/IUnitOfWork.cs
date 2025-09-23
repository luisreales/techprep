namespace TechPrep.Core.Interfaces;

public interface IUnitOfWork : IDisposable
{
    ITopicRepository Topics { get; }
    IQuestionRepository Questions { get; }
    IInterviewSessionRepository InterviewSessions { get; }
    ICodeChallengeRepository CodeChallenges { get; }
    ITagRepository Tags { get; }
    IChallengeAttemptRepository ChallengeAttempts { get; }
    IInterviewTemplateRepository InterviewTemplates { get; }
    IGenericRepository<T> Repository<T>() where T : class;
    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}