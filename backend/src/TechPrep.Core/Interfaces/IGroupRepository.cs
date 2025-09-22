using TechPrep.Core.Entities;

namespace TechPrep.Core.Interfaces;

public interface IGroupRepository : IGenericRepository<Group>
{
    Task<Group?> GetWithMembersAsync(int id);
    Task<IEnumerable<Group>> GetByUserIdAsync(Guid userId);
    Task AddMembersAsync(int groupId, IEnumerable<Guid> userIds, string? roleInGroup = null);
    Task RemoveMembersAsync(int groupId, IEnumerable<Guid> userIds);
    Task<bool> IsUserInGroupAsync(int groupId, Guid userId);
}