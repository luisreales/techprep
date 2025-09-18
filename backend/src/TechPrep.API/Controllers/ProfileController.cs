using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TechPrep.Application.DTOs;
using TechPrep.Core.Entities;

namespace TechPrep.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly ILogger<ProfileController> _logger;
    private readonly IWebHostEnvironment _environment;

    public ProfileController(UserManager<User> userManager, ILogger<ProfileController> logger, IWebHostEnvironment environment)
    {
        _userManager = userManager;
        _logger = logger;
        _environment = environment;
    }

    [HttpGet("me")]
    public async Task<ActionResult<UserProfileDto>> GetProfile()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return NotFound(new { success = false, message = "User not found" });
        }

        var profileDto = new UserProfileDto(
            user.Id,
            user.Email ?? string.Empty,
            user.FirstName,
            user.LastName,
            user.AvatarUrl,
            user.Language,
            user.Theme
        );

        return Ok(new { success = true, data = profileDto });
    }

    [HttpPut("me")]
    public async Task<ActionResult<UserProfileDto>> UpdateProfile([FromBody] UpdateProfileDto updateDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new {
                success = false,
                message = "Invalid data",
                error = new { code = "VALIDATION_ERROR", details = ModelState }
            });
        }

        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return NotFound(new { success = false, message = "User not found" });
        }

        user.FirstName = updateDto.FirstName;
        user.LastName = updateDto.LastName;
        user.Language = updateDto.Language;
        user.Theme = updateDto.Theme;
        user.UpdatedAt = DateTime.UtcNow;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return BadRequest(new {
                success = false,
                message = "Failed to update profile",
                error = new { code = "UPDATE_ERROR", details = result.Errors }
            });
        }

        _logger.LogInformation("Profile updated for user {UserId} ({Email})", user.Id, user.Email);

        var profileDto = new UserProfileDto(
            user.Id,
            user.Email ?? string.Empty,
            user.FirstName,
            user.LastName,
            user.AvatarUrl,
            user.Language,
            user.Theme
        );

        return Ok(new { success = true, data = profileDto });
    }

    [HttpPost("avatar")]
    public async Task<ActionResult<UserProfileDto>> UploadAvatar(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new {
                success = false,
                message = "No file provided",
                error = new { code = "NO_FILE", message = "File is required" }
            });
        }

        // Validate file type and size
        var allowedTypes = new[] { "image/png", "image/jpg", "image/jpeg", "image/webp" };
        if (!allowedTypes.Contains(file.ContentType.ToLowerInvariant()))
        {
            return BadRequest(new {
                success = false,
                message = "Invalid file type. Only PNG, JPG, JPEG, and WEBP are allowed.",
                error = new { code = "INVALID_FILE_TYPE", message = "Only image files are allowed" }
            });
        }

        if (file.Length > 2 * 1024 * 1024) // 2MB limit
        {
            return BadRequest(new {
                success = false,
                message = "File size exceeds 2MB limit",
                error = new { code = "FILE_TOO_LARGE", message = "Maximum file size is 2MB" }
            });
        }

        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return NotFound(new { success = false, message = "User not found" });
        }

        try
        {
            // Create uploads directory if it doesn't exist
            var uploadsPath = Path.Combine(_environment.WebRootPath, "uploads", "avatars");
            Directory.CreateDirectory(uploadsPath);

            // Generate safe filename
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            var fileName = $"{user.Id}{extension}";
            var filePath = Path.Combine(uploadsPath, fileName);

            // Delete existing avatar if it exists
            if (!string.IsNullOrEmpty(user.AvatarUrl))
            {
                var existingPath = Path.Combine(_environment.WebRootPath, user.AvatarUrl.TrimStart('/'));
                if (System.IO.File.Exists(existingPath))
                {
                    System.IO.File.Delete(existingPath);
                }
            }

            // Save new file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Update user avatar URL
            user.AvatarUrl = $"/uploads/avatars/{fileName}";
            user.UpdatedAt = DateTime.UtcNow;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(new {
                    success = false,
                    message = "Failed to update avatar",
                    error = new { code = "UPDATE_ERROR", details = result.Errors }
                });
            }

            _logger.LogInformation("Avatar uploaded for user {UserId} ({Email})", user.Id, user.Email);

            var profileDto = new UserProfileDto(
                user.Id,
                user.Email ?? string.Empty,
                user.FirstName,
                user.LastName,
                user.AvatarUrl,
                user.Language,
                user.Theme
            );

            return Ok(new { success = true, data = profileDto });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading avatar for user {UserId}", user.Id);
            return StatusCode(500, new {
                success = false,
                message = "Internal server error",
                error = new { code = "UPLOAD_ERROR", message = "Failed to upload file" }
            });
        }
    }
}