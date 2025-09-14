using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TechPrep.Application.DTOs.Challenges;
using TechPrep.Application.Interfaces;
using TechPrep.Core.Enums;

namespace TechPrep.API.Controllers;

[ApiController]
[Route("api/code-challenges")]
[Authorize] // Requires authentication but not admin role
public class CodeChallengesController : ControllerBase
{
    private readonly ICodeChallengeService _codeChallengeService;

    public CodeChallengesController(ICodeChallengeService codeChallengeService)
    {
        _codeChallengeService = codeChallengeService;
    }

    [HttpGet]
    public async Task<IActionResult> GetChallenges(
        [FromQuery] ChallengeLanguage? language = null,
        [FromQuery] ChallengeDifficulty? difficulty = null,
        [FromQuery] string? search = null,
        [FromQuery] int[]? tagIds = null,
        [FromQuery] int[]? topicIds = null,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 25)
    {
        try
        {
            var challenges = await _codeChallengeService.GetChallengesAsync(
                language, difficulty, search, tagIds, topicIds, page, limit);
            var totalCount = await _codeChallengeService.GetChallengesCountAsync(
                language, difficulty, search, tagIds, topicIds);
            var totalPages = (int)Math.Ceiling((double)totalCount / limit);

            // Remove solution field for public access - this would be handled by the service 
            // returning ChallengeListItemDto which should not include solution

            return Ok(new
            {
                success = true,
                data = new
                {
                    challenges = challenges,
                    total = totalCount,
                    page = page,
                    totalPages = totalPages
                },
                message = "Challenges retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = "Failed to retrieve challenges",
                error = new { code = "FETCH_ERROR", message = ex.Message }
            });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var challenge = await _codeChallengeService.GetChallengeByIdAsync(id);
            if (challenge == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Challenge not found",
                    error = new { code = "NOT_FOUND", message = "Challenge with the specified ID was not found" }
                });
            }

            // For public access, we would need a different method or DTO that excludes solution
            // The service should return appropriate DTO without solution for non-admin users

            return Ok(new
            {
                success = true,
                data = challenge,
                message = "Challenge retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = "Failed to retrieve challenge",
                error = new { code = "FETCH_ERROR", message = ex.Message }
            });
        }
    }

    [HttpPost("{id}/attempts")]
    public async Task<IActionResult> SubmitAttempt(int id, [FromBody] AttemptCreateDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Validation failed",
                    error = new { code = "VALIDATION_ERROR", message = "Invalid input data", details = ModelState }
                });
            }

            var userId = GetCurrentUserId();
            var attempt = await _codeChallengeService.SubmitAttemptAsync(id, userId, dto);
            
            return Ok(new
            {
                success = true,
                data = attempt,
                message = "Attempt submitted successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = "Failed to submit attempt",
                error = new { code = "SUBMIT_ERROR", message = ex.Message }
            });
        }
    }

    [HttpGet("attempts")]
    public async Task<IActionResult> GetUserAttempts(
        [FromQuery] int page = 1,
        [FromQuery] int limit = 25)
    {
        try
        {
            var userId = GetCurrentUserId();
            var attempts = await _codeChallengeService.GetUserAttemptsAsync(userId, page, limit);
            
            return Ok(new
            {
                success = true,
                data = attempts,
                message = "User attempts retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = "Failed to retrieve user attempts",
                error = new { code = "FETCH_ERROR", message = ex.Message }
            });
        }
    }

    [HttpGet("{id}/attempts/latest")]
    public async Task<IActionResult> GetLatestAttempt(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var attempt = await _codeChallengeService.GetLatestAttemptAsync(id, userId);
            
            if (attempt == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "No attempt found",
                    error = new { code = "NOT_FOUND", message = "No attempt found for this challenge and user" }
                });
            }

            return Ok(new
            {
                success = true,
                data = attempt,
                message = "Latest attempt retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = "Failed to retrieve latest attempt",
                error = new { code = "FETCH_ERROR", message = ex.Message }
            });
        }
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) 
                         ?? User.FindFirst("sub") 
                         ?? User.FindFirst("userId");
        
        if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
        {
            return userId;
        }
        
        throw new UnauthorizedAccessException("User ID not found in token");
    }
}
