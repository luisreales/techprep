using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using TechPrep.Application.DTOs;
using TechPrep.Application.Interfaces;
using TechPrep.Core.Entities;

namespace TechPrep.Application.Services;

public class UserAdminService : IUserAdminService
{
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    private readonly ILogger<UserAdminService> _logger;
    private readonly List<string> _validRoles = new() { "Admin", "Student" };

    public UserAdminService(UserManager<User> userManager, RoleManager<IdentityRole<Guid>> roleManager, ILogger<UserAdminService> logger)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _logger = logger;
    }

    public async Task<AdminUsersListDto> SearchAsync(string? query = null, string? role = null, string? status = null, 
        int page = 1, int pageSize = 20, string sort = "CreatedAt")
    {
        var queryable = _userManager.Users.AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(query))
        {
            queryable = queryable.Where(u => 
                u.Email!.Contains(query) || 
                u.FirstName.Contains(query) || 
                u.LastName.Contains(query));
        }

        // Apply sorting
        queryable = sort.ToLower() switch
        {
            "email" => queryable.OrderBy(u => u.Email),
            "firstname" => queryable.OrderBy(u => u.FirstName),
            "lastname" => queryable.OrderBy(u => u.LastName),
            "createdat" => queryable.OrderByDescending(u => u.CreatedAt),
            _ => queryable.OrderByDescending(u => u.CreatedAt)
        };

        var total = queryable.Count();
        var users = queryable
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        // Normalize status filter to support synonyms ("active"|"inactive"|"blocked")
        string? normalizedStatus = null;
        if (!string.IsNullOrWhiteSpace(status))
        {
            var s = status.Trim().ToLowerInvariant();
            if (s == "active") normalizedStatus = "Active";
            else if (s == "inactive" || s == "blocked") normalizedStatus = "Blocked";
            else normalizedStatus = status; // fallback to raw input
        }

        var result = new List<AdminUserListItemDto>();

        foreach (var user in users)
        {
            var userRoles = await _userManager.GetRolesAsync(user);
            var userStatus = GetUserStatus(user);

            // Apply role filter if specified
            if (!string.IsNullOrWhiteSpace(role) && !userRoles.Contains(role))
                continue;

            // Apply status filter if specified (after normalization)
            if (!string.IsNullOrWhiteSpace(normalizedStatus) && userStatus != normalizedStatus)
                continue;

            result.Add(new AdminUserListItemDto
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Roles = userRoles.ToList(),
                Status = userStatus,
                CreatedAt = user.CreatedAt
            });
        }

        // If filters were applied, adjust total count
        if (!string.IsNullOrWhiteSpace(role) || !string.IsNullOrWhiteSpace(status))
        {
            total = result.Count;
        }

        return new AdminUsersListDto
        {
            Items = result,
            Page = page,
            PageSize = pageSize,
            Total = total
        };
    }

    public async Task<AdminUserDetailDto?> GetAsync(Guid id)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null)
            return null;

        var roles = await _userManager.GetRolesAsync(user);

        return new AdminUserDetailDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Roles = roles.ToList(),
            Status = GetUserStatus(user),
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
            LockoutEnabled = user.LockoutEnabled,
            LockoutEnd = user.LockoutEnd,
            Specialization = user.Specialization,
            YearsOfExperience = user.YearsOfExperience,
            MatchingThreshold = user.MatchingThreshold
        };
    }

    public async Task<bool> SetRolesAsync(Guid id, List<string> roles, Guid adminUserId)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null)
            return false;

        // Validate roles
        foreach (var roleName in roles)
        {
            if (!_validRoles.Contains(roleName))
            {
                _logger.LogWarning("Invalid role attempted: {Role} by admin {AdminId}", roleName, adminUserId);
                return false;
            }

            if (!await _roleManager.RoleExistsAsync(roleName))
            {
                _logger.LogWarning("Role does not exist: {Role}", roleName);
                return false;
            }
        }

        var currentRoles = await _userManager.GetRolesAsync(user);

        // Check if admin is trying to remove their own Admin role and they're the last admin
        if (id == adminUserId && currentRoles.Contains("Admin") && !roles.Contains("Admin"))
        {
            var adminUsers = await _userManager.GetUsersInRoleAsync("Admin");
            if (adminUsers.Count <= 1)
            {
                _logger.LogWarning("Admin {AdminId} attempted to remove their own Admin role as the last admin", adminUserId);
                return false;
            }
        }

        var toRemove = currentRoles.Except(roles).ToList();
        var toAdd = roles.Except(currentRoles).ToList();

        if (toRemove.Any())
        {
            var removeResult = await _userManager.RemoveFromRolesAsync(user, toRemove);
            if (!removeResult.Succeeded)
            {
                _logger.LogError("Failed to remove roles {Roles} from user {UserId}: {Errors}", 
                    string.Join(", ", toRemove), id, string.Join("; ", removeResult.Errors.Select(e => e.Description)));
                return false;
            }
        }

        if (toAdd.Any())
        {
            var addResult = await _userManager.AddToRolesAsync(user, toAdd);
            if (!addResult.Succeeded)
            {
                _logger.LogError("Failed to add roles {Roles} to user {UserId}: {Errors}", 
                    string.Join(", ", toAdd), id, string.Join("; ", addResult.Errors.Select(e => e.Description)));
                return false;
            }
        }

        _logger.LogInformation("Admin {AdminId} updated roles for user {UserId}. Added: {Added}, Removed: {Removed}", 
            adminUserId, id, string.Join(", ", toAdd), string.Join(", ", toRemove));

        return true;
    }

    public async Task<bool> SetBlockedAsync(Guid id, bool blocked, string? reason, Guid adminUserId)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null)
            return false;

        // Prevent admin from blocking themselves
        if (id == adminUserId)
        {
            _logger.LogWarning("Admin {AdminId} attempted to block themselves", adminUserId);
            return false;
        }

        if (blocked)
        {
            user.LockoutEnabled = true;
            user.LockoutEnd = DateTimeOffset.UtcNow.AddYears(100);
        }
        else
        {
            user.LockoutEnd = DateTimeOffset.UtcNow.AddSeconds(-1);
        }

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            _logger.LogError("Failed to update lockout status for user {UserId}: {Errors}", 
                id, string.Join("; ", result.Errors.Select(e => e.Description)));
            return false;
        }

        var action = blocked ? "block" : "unblock";
        var logMessage = $"Admin {adminUserId} {action}ed user {id}";
        if (!string.IsNullOrWhiteSpace(reason))
            logMessage += $" with reason: {reason}";

        _logger.LogInformation(logMessage);

        return true;
    }

    public async Task<ResetPasswordTokenDto> GenerateResetTokenAsync(Guid id, Guid adminUserId)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null)
            throw new ArgumentException("User not found", nameof(id));

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);

        _logger.LogInformation("Admin {AdminId} generated password reset token for user {UserId}", adminUserId, id);

        return new ResetPasswordTokenDto
        {
            ResetToken = token
        };
    }

    public async Task<bool> InviteAsync(InviteUserDto inviteDto, Guid adminUserId)
    {
        // Check if user already exists
        var existingUser = await _userManager.FindByEmailAsync(inviteDto.Email);
        if (existingUser != null)
        {
            _logger.LogWarning("Admin {AdminId} attempted to invite existing user {Email}", adminUserId, inviteDto.Email);
            return false;
        }

        // Validate roles
        foreach (var roleName in inviteDto.Roles)
        {
            if (!_validRoles.Contains(roleName) || !await _roleManager.RoleExistsAsync(roleName))
            {
                _logger.LogWarning("Invalid role in invitation: {Role} by admin {AdminId}", roleName, adminUserId);
                return false;
            }
        }

        // Create user with temporary password
        var tempPassword = GenerateTemporaryPassword();
        var newUser = new User
        {
            UserName = inviteDto.Email,
            Email = inviteDto.Email,
            FirstName = inviteDto.FirstName,
            LastName = inviteDto.LastName,
            EmailConfirmed = false // Require email confirmation
        };

        var createResult = await _userManager.CreateAsync(newUser, tempPassword);
        if (!createResult.Succeeded)
        {
            _logger.LogError("Failed to create invited user {Email}: {Errors}", 
                inviteDto.Email, string.Join("; ", createResult.Errors.Select(e => e.Description)));
            return false;
        }

        // Assign roles
        if (inviteDto.Roles.Any())
        {
            var addRolesResult = await _userManager.AddToRolesAsync(newUser, inviteDto.Roles);
            if (!addRolesResult.Succeeded)
            {
                _logger.LogError("Failed to assign roles to invited user {Email}: {Errors}", 
                    inviteDto.Email, string.Join("; ", addRolesResult.Errors.Select(e => e.Description)));
                // Clean up - delete the user
                await _userManager.DeleteAsync(newUser);
                return false;
            }
        }

        _logger.LogInformation("Admin {AdminId} invited user {Email} with roles {Roles}", 
            adminUserId, inviteDto.Email, string.Join(", ", inviteDto.Roles));

        // TODO: Send invitation email with temporary password or reset link
        // For MVP, this is just logged

        return true;
    }

    private static string GetUserStatus(User user)
    {
        if (user.LockoutEnabled && user.LockoutEnd.HasValue && user.LockoutEnd > DateTimeOffset.UtcNow)
            return "Blocked";
        
        return "Active";
    }

    private static string GenerateTemporaryPassword()
    {
        // Generate a temporary password that meets the requirements
        var random = new Random();
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const string special = "!@#$%^&*";
        
        var password = new char[12];
        password[0] = chars[random.Next(26)]; // Uppercase
        password[1] = chars[random.Next(26, 52)]; // Lowercase
        password[2] = chars[random.Next(52, 62)]; // Digit
        password[3] = special[random.Next(special.Length)]; // Special char
        
        for (int i = 4; i < 12; i++)
        {
            password[i] = chars[random.Next(chars.Length)];
        }
        
        // Shuffle the password
        for (int i = password.Length - 1; i > 0; i--)
        {
            int j = random.Next(i + 1);
            (password[i], password[j]) = (password[j], password[i]);
        }
        
        return new string(password);
    }
}
