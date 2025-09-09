using Microsoft.EntityFrameworkCore;
using TechPrep.Core.Entities;
using TechPrep.Core.Interfaces;
using TechPrep.Infrastructure.Data;

namespace TechPrep.Infrastructure.Repositories;

public class TopicRepository : GenericRepository<Topic>, ITopicRepository
{
    public TopicRepository(TechPrepDbContext context) : base(context)
    {
    }

    public async Task<Topic?> GetByNameAsync(string name)
    {
        return await _dbSet.FirstOrDefaultAsync(t => t.Name.ToLower() == name.ToLower());
    }

    public async Task<IEnumerable<Topic>> GetTopicsWithQuestionsAsync()
    {
        return await _dbSet
            .Include(t => t.Questions)
            .Where(t => t.Questions.Any())
            .ToListAsync();
    }

    public async Task<IEnumerable<Topic>> GetActiveTopicsAsync()
    {
        return await _dbSet
            .Where(t => t.Questions.Any())
            .OrderBy(t => t.Name)
            .ToListAsync();
    }
}