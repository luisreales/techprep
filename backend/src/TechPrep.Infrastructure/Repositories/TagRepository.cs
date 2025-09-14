using Microsoft.EntityFrameworkCore;
using TechPrep.Core.Entities;
using TechPrep.Core.Interfaces;
using TechPrep.Infrastructure.Data;

namespace TechPrep.Infrastructure.Repositories;

public class TagRepository : GenericRepository<Tag>, ITagRepository
{
    public TagRepository(TechPrepDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Tag>> GetByNamesAsync(IEnumerable<string> names)
    {
        return await _dbSet
            .Where(t => names.Contains(t.Name))
            .ToListAsync();
    }

    public async Task<Tag?> GetByNameAsync(string name)
    {
        return await _dbSet
            .FirstOrDefaultAsync(t => t.Name == name);
    }

    public async Task<bool> ExistsByNameAsync(string name)
    {
        return await _dbSet
            .AnyAsync(t => t.Name == name);
    }
}