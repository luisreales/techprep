using Microsoft.EntityFrameworkCore.Storage;
using TechPrep.Core.Interfaces;
using TechPrep.Infrastructure.Data;

namespace TechPrep.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly TechPrepDbContext _context;
    private readonly Dictionary<Type, object> _repositories = new();
    private IDbContextTransaction? _transaction;

    public UnitOfWork(TechPrepDbContext context)
    {
        _context = context;
        Topics = new TopicRepository(_context);
        Questions = new QuestionRepository(_context);
        InterviewSessions = new InterviewSessionRepository(_context);
    }

    public ITopicRepository Topics { get; private set; }
    public IQuestionRepository Questions { get; private set; }
    public IInterviewSessionRepository InterviewSessions { get; private set; }

    public IGenericRepository<T> Repository<T>() where T : class
    {
        var type = typeof(T);
        
        if (_repositories.ContainsKey(type))
        {
            return (IGenericRepository<T>)_repositories[type];
        }

        var repository = new GenericRepository<T>(_context);
        _repositories.Add(type, repository);
        
        return repository;
    }

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public async Task BeginTransactionAsync()
    {
        _transaction = await _context.Database.BeginTransactionAsync();
    }

    public async Task CommitTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.CommitAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
    }
}