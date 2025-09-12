using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TechPrep.Core.Entities;

namespace TechPrep.API.Controllers.Admin;

[ApiController]
[Route("api/admin/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly UserManager<User> _userManager;

    public UsersController(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        try
        {
            var users = _userManager.Users
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new 
                {
                    u.Id,
                    u.Email,
                    u.FirstName,
                    u.LastName,
                    u.Role,
                    u.CreatedAt,
                    u.EmailConfirmed
                })
                .ToList();

            var totalUsers = _userManager.Users.Count();

            return Ok(new
            {
                success = true,
                data = new 
                {
                    users,
                    totalUsers,
                    currentPage = page,
                    pageSize,
                    totalPages = (int)Math.Ceiling((double)totalUsers / pageSize)
                },
                message = "Users retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = "Failed to retrieve users",
                error = new { code = "FETCH_ERROR", message = ex.Message }
            });
        }
    }

    [HttpPost("{id}/block")]
    public async Task<IActionResult> BlockUser(string id)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound(new
                {
                    Success = false,
                    Message = "User not found"
                });
            }

            await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue);
            
            return Ok(new
            {
                success = true,
                message = "User blocked successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = "Failed to block user",
                Error = new { code = "BLOCK_ERROR", message = ex.Message }
            });
        }
    }

    [HttpPost("{id}/unblock")]
    public async Task<IActionResult> UnblockUser(string id)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound(new
                {
                    Success = false,
                    Message = "User not found"
                });
            }

            await _userManager.SetLockoutEndDateAsync(user, null);
            
            return Ok(new
            {
                success = true,
                message = "User unblocked successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = "Failed to unblock user",
                Error = new { code = "UNBLOCK_ERROR", message = ex.Message }
            });
        }
    }
}