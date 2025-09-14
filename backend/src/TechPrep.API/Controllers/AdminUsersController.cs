using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TechPrep.Application.DTOs;
using TechPrep.Application.Interfaces;

namespace TechPrep.API.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = "Admin")]
public class AdminUsersController : ControllerBase
{
    private readonly IUserAdminService _userAdminService;
    private readonly ILogger<AdminUsersController> _logger;

    public AdminUsersController(IUserAdminService userAdminService, ILogger<AdminUsersController> logger)
    {
        _userAdminService = userAdminService;
        _logger = logger;
    }

    /// <summary>
    /// Get paginated list of users with optional filters
    /// </summary>
    /// <param name="q">Search query (email/name)</param>
    /// <param name="role">Filter by role (Admin/Student)</param>
    /// <param name="status">Filter by status (Active/Blocked/Inactive)</param>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 20)</param>
    /// <param name="sort">Sort field (email/firstname/lastname/createdat)</param>
    /// <returns>Paginated list of users</returns>
    [HttpGet]
    public async Task<ActionResult<AdminUsersListDto>> GetUsers(
        [FromQuery] string? q = null,
        [FromQuery] string? role = null,
        [FromQuery] string? status = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string sort = "createdat")
    {
        try
        {
            // If the caller is an Admin and did not explicitly pass filters,
            // return all users by default. If Admin provided role/status, honor them.
            var isAdmin = User.IsInRole("Admin");
            if (isAdmin)
            {
                var query = HttpContext?.Request?.Query;
                var hasExplicitRole = query?.ContainsKey("role") == true;
                var hasExplicitStatus = query?.ContainsKey("status") == true;
                if (!hasExplicitRole) role = null;
                if (!hasExplicitStatus) status = null;
            }

            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            var result = await _userAdminService.SearchAsync(q, role, status, page, pageSize, sort);
            return Ok(new { success = true, data = result, message = "Users retrieved successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving users");
            return StatusCode(500, new { success = false, message = "Internal server error", error = new { code = "INTERNAL_ERROR", message = ex.Message } });
        }
    }

    /// <summary>
    /// Get detailed information about a specific user
    /// </summary>
    /// <param name="id">User ID</param>
    /// <returns>User details</returns>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AdminUserDetailDto>> GetUser(Guid id)
    {
        try
        {
            var user = await _userAdminService.GetAsync(id);
            if (user == null)
            {
                return NotFound(new { success = false, message = "User not found", error = new { code = "USER_NOT_FOUND", message = "The specified user was not found" } });
            }

            return Ok(new { success = true, data = user, message = "User retrieved successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user {UserId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error", error = new { code = "INTERNAL_ERROR", message = ex.Message } });
        }
    }

    /// <summary>
    /// Update user roles
    /// </summary>
    /// <param name="id">User ID</param>
    /// <param name="request">Role update request</param>
    /// <returns>Success status</returns>
    [HttpPut("{id:guid}/roles")]
    public async Task<IActionResult> SetUserRoles(Guid id, [FromBody] SetRolesDto request)
    {
        try
        {
            var adminUserId = GetCurrentUserId();
            if (adminUserId == Guid.Empty)
            {
                return Unauthorized(new { success = false, message = "Invalid user token", error = new { code = "INVALID_TOKEN", message = "Unable to identify the current user" } });
            }

            if (request.Roles == null || !request.Roles.Any())
            {
                return BadRequest(new { success = false, message = "At least one role must be specified", error = new { code = "INVALID_ROLES", message = "Roles array cannot be empty" } });
            }

            var validRoles = new[] { "Admin", "Student" };
            var invalidRoles = request.Roles.Where(r => !validRoles.Contains(r)).ToList();
            if (invalidRoles.Any())
            {
                return BadRequest(new { success = false, message = $"Invalid roles: {string.Join(", ", invalidRoles)}", error = new { code = "INVALID_ROLES", message = "Only Admin and Student roles are allowed" } });
            }

            var success = await _userAdminService.SetRolesAsync(id, request.Roles, adminUserId);
            if (!success)
            {
                return BadRequest(new { success = false, message = "Failed to update user roles", error = new { code = "UPDATE_FAILED", message = "Cannot update roles. User may not exist or you may be trying to remove the last admin." } });
            }

            return Ok(new { success = true, message = "User roles updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating roles for user {UserId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error", error = new { code = "INTERNAL_ERROR", message = ex.Message } });
        }
    }

    /// <summary>
    /// Block or unblock a user
    /// </summary>
    /// <param name="id">User ID</param>
    /// <param name="request">Block/unblock request</param>
    /// <returns>Success status</returns>
    [HttpPut("{id:guid}/block")]
    public async Task<IActionResult> BlockUser(Guid id, [FromBody] BlockUserDto request)
    {
        try
        {
            var adminUserId = GetCurrentUserId();
            if (adminUserId == Guid.Empty)
            {
                return Unauthorized(new { success = false, message = "Invalid user token", error = new { code = "INVALID_TOKEN", message = "Unable to identify the current user" } });
            }

            var success = await _userAdminService.SetBlockedAsync(id, request.Blocked, request.Reason, adminUserId);
            if (!success)
            {
                return BadRequest(new { success = false, message = "Failed to update user status", error = new { code = "UPDATE_FAILED", message = "Cannot update user status. User may not exist or you may be trying to block yourself." } });
            }

            var action = request.Blocked ? "blocked" : "unblocked";
            return Ok(new { success = true, message = $"User {action} successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating block status for user {UserId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error", error = new { code = "INTERNAL_ERROR", message = ex.Message } });
        }
    }

    /// <summary>
    /// Generate password reset token for a user
    /// </summary>
    /// <param name="id">User ID</param>
    /// <returns>Reset token</returns>
    [HttpPost("{id:guid}/reset-password")]
    public async Task<ActionResult<ResetPasswordTokenDto>> ResetPassword(Guid id)
    {
        try
        {
            var adminUserId = GetCurrentUserId();
            if (adminUserId == Guid.Empty)
            {
                return Unauthorized(new { success = false, message = "Invalid user token", error = new { code = "INVALID_TOKEN", message = "Unable to identify the current user" } });
            }

            var result = await _userAdminService.GenerateResetTokenAsync(id, adminUserId);
            return Ok(new { success = true, data = result, message = "Password reset token generated successfully" });
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { success = false, message = "User not found", error = new { code = "USER_NOT_FOUND", message = ex.Message } });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating reset token for user {UserId}", id);
            return StatusCode(500, new { success = false, message = "Internal server error", error = new { code = "INTERNAL_ERROR", message = ex.Message } });
        }
    }

    /// <summary>
    /// Invite a new user
    /// </summary>
    /// <param name="request">Invitation details</param>
    /// <returns>Success status</returns>
    [HttpPost("invite")]
    public async Task<IActionResult> InviteUser([FromBody] InviteUserDto request)
    {
        try
        {
            var adminUserId = GetCurrentUserId();
            if (adminUserId == Guid.Empty)
            {
                return Unauthorized(new { success = false, message = "Invalid user token", error = new { code = "INVALID_TOKEN", message = "Unable to identify the current user" } });
            }

            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(new { success = false, message = "Email is required", error = new { code = "INVALID_EMAIL", message = "Email address must be provided" } });
            }

            if (string.IsNullOrWhiteSpace(request.FirstName))
            {
                return BadRequest(new { success = false, message = "First name is required", error = new { code = "INVALID_NAME", message = "First name must be provided" } });
            }

            if (request.Roles == null || !request.Roles.Any())
            {
                request.Roles = new List<string> { "Student" }; // Default to Student role
            }

            var success = await _userAdminService.InviteAsync(request, adminUserId);
            if (!success)
            {
                return BadRequest(new { success = false, message = "Failed to invite user", error = new { code = "INVITE_FAILED", message = "User may already exist or invalid roles specified" } });
            }

            return Ok(new { success = true, message = "User invited successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error inviting user {Email}", request.Email);
            return StatusCode(500, new { success = false, message = "Internal server error", error = new { code = "INTERNAL_ERROR", message = ex.Message } });
        }
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(userIdClaim, out var userId))
        {
            return userId;
        }
        return Guid.Empty;
    }
}
