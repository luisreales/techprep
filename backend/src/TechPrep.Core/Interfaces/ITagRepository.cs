using TechPrep.Core.Entities;

namespace TechPrep.Core.Interfaces;

public interface ITagRepository : IGenericRepository<Tag>
{
    Task<IEnumerable<Tag>> GetByNamesAsync(IEnumerable<string> names);
    Task<Tag?> GetByNameAsync(string name);
    Task<bool> ExistsByNameAsync(string name);
}