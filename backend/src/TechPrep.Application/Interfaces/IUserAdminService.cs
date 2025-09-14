using TechPrep.Application.DTOs;

namespace TechPrep.Application.Interfaces;

public interface IUserAdminService
{
    Task<AdminUsersListDto> SearchAsync(string? query = null, string? role = null, string? status = null, 
        int page = 1, int pageSize = 20, string sort = "CreatedAt");
    
    Task<AdminUserDetailDto?> GetAsync(Guid id);
    
    Task<bool> SetRolesAsync(Guid id, List<string> roles, Guid adminUserId);
    
    Task<bool> SetBlockedAsync(Guid id, bool blocked, string? reason, Guid adminUserId);
    
    Task<ResetPasswordTokenDto> GenerateResetTokenAsync(Guid id, Guid adminUserId);
    
    Task<bool> InviteAsync(InviteUserDto inviteDto, Guid adminUserId);
}