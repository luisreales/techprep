using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechPrep.Application.Interfaces;
using System.Security.Claims;

namespace TechPrep.API.Controllers.Admin;

[ApiController]
[Route("api/admin/[controller]")]
[Authorize(Roles = "Admin")]
public class SettingsController : ControllerBase
{
    private readonly ISettingsService _settingsService;

    public SettingsController(ISettingsService settingsService)
    {
        _settingsService = settingsService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var settings = await _settingsService.GetAllAsync();

            return Ok(new
            {
                success = true,
                data = settings,
                message = "Settings retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = "Failed to retrieve settings",
                error = new
                {
                    code = "SETTINGS_RETRIEVAL_ERROR",
                    message = ex.Message
                }
            });
        }
    }

    [HttpPut]
    public async Task<IActionResult> Upsert([FromBody] List<SettingUpdateDto> settings)
    {
        try
        {
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? "Unknown";

            foreach (var setting in settings)
            {
                await _settingsService.UpsertAsync(
                    setting.Key,
                    setting.Value,
                    setting.Type,
                    setting.Description,
                    userEmail
                );
            }

            return Ok(new
            {
                success = true,
                message = "Settings updated successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = "Failed to update settings",
                error = new
                {
                    code = "SETTINGS_UPDATE_ERROR",
                    message = ex.Message
                }
            });
        }
    }
}

public record SettingUpdateDto(
    string Key,
    string? Value,
    string? Type = null,
    string? Description = null
);