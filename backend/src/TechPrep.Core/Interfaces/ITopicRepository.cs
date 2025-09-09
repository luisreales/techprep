using TechPrep.Core.Entities;

namespace TechPrep.Core.Interfaces;

public interface ITopicRepository : IGenericRepository<Topic>
{
    Task<Topic?> GetByNameAsync(string name);
    Task<IEnumerable<Topic>> GetTopicsWithQuestionsAsync();
    Task<IEnumerable<Topic>> GetActiveTopicsAsync();
}