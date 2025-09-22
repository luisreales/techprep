using Microsoft.EntityFrameworkCore;
using TechPrep.Core.Entities;
using TechPrep.Core.Interfaces;
using TechPrep.Infrastructure.Data;

namespace TechPrep.Infrastructure.Repositories;

public class GroupRepository : GenericRepository<Group>, IGroupRepository
{
    public GroupRepository(TechPrepDbContext context) : base(context)
    {
    }

    public async Task<Group?> GetWithMembersAsync(int id)
    {
        return await _context.Groups
            .Include(g => g.UserGroups)
                .ThenInclude(ug => ug.User)
            .FirstOrDefaultAsync(g => g.Id == id);
    }

    public async Task<IEnumerable<Group>> GetByUserIdAsync(Guid userId)
    {
        return await _context.Groups
            .Where(g => g.UserGroups.Any(ug => ug.UserId == userId))
            .OrderBy(g => g.Name)
            .ToListAsync();
    }

    public async Task AddMembersAsync(int groupId, IEnumerable<Guid> userIds, string? roleInGroup = null)
    {
        var existingMemberships = await _context.UserGroups
            .Where(ug => ug.GroupId == groupId && userIds.Contains(ug.UserId))
            .Select(ug => ug.UserId)
            .ToListAsync();

        var newMemberships = userIds
            .Except(existingMemberships)
            .Select(userId => new UserGroup
            {
                GroupId = groupId,
                UserId = userId,
                RoleInGroup = roleInGroup,
                JoinedAt = DateTime.UtcNow
            });

        _context.UserGroups.AddRange(newMemberships);
        await _context.SaveChangesAsync();
    }

    public async Task RemoveMembersAsync(int groupId, IEnumerable<Guid> userIds)
    {
        var memberships = await _context.UserGroups
            .Where(ug => ug.GroupId == groupId && userIds.Contains(ug.UserId))
            .ToListAsync();

        _context.UserGroups.RemoveRange(memberships);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> IsUserInGroupAsync(int groupId, Guid userId)
    {
        return await _context.UserGroups
            .AnyAsync(ug => ug.GroupId == groupId && ug.UserId == userId);
    }
}