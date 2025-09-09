namespace TechPrep.Core.Interfaces;

public interface IUnitOfWork : IDisposable
{
    ITopicRepository Topics { get; }
    IQuestionRepository Questions { get; }
    IInterviewSessionRepository InterviewSessions { get; }
    IGenericRepository<T> Repository<T>() where T : class;
    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}