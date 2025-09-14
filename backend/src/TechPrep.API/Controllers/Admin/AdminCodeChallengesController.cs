using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechPrep.Application.DTOs.Challenges;
using TechPrep.Application.Interfaces;
using TechPrep.Core.Enums;

namespace TechPrep.API.Controllers.Admin;

[ApiController]
[Route("api/admin/code-challenges")]
// [Authorize(Roles = "Admin")] // Temporarily disabled for testing
public class AdminCodeChallengesController : ControllerBase
{
    private readonly ICodeChallengeService _codeChallengeService;
    private readonly ITagService _tagService;

    public AdminCodeChallengesController(ICodeChallengeService codeChallengeService, ITagService tagService)
    {
        _codeChallengeService = codeChallengeService;
        _tagService = tagService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
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

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ChallengeCreateDto dto)
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

            var challenge = await _codeChallengeService.CreateChallengeAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = challenge.Id }, new
            {
                success = true,
                data = challenge,
                message = "Challenge created successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = "Failed to create challenge",
                error = new { code = "CREATE_ERROR", message = ex.Message }
            });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ChallengeUpdateDto dto)
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

            var challenge = await _codeChallengeService.UpdateChallengeAsync(id, dto);
            if (challenge == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Challenge not found",
                    error = new { code = "NOT_FOUND", message = "Challenge with the specified ID was not found" }
                });
            }

            return Ok(new
            {
                success = true,
                data = challenge,
                message = "Challenge updated successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = "Failed to update challenge",
                error = new { code = "UPDATE_ERROR", message = ex.Message }
            });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var success = await _codeChallengeService.DeleteChallengeAsync(id);
            if (!success)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Challenge not found",
                    error = new { code = "NOT_FOUND", message = "Challenge with the specified ID was not found" }
                });
            }

            return Ok(new
            {
                success = true,
                message = "Challenge deleted successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = "Failed to delete challenge",
                error = new { code = "DELETE_ERROR", message = ex.Message }
            });
        }
    }

    // Tag management endpoints
    [HttpGet("tags")]
    public async Task<IActionResult> GetAllTags()
    {
        try
        {
            var tags = await _tagService.GetAllTagsAsync();
            return Ok(new
            {
                success = true,
                data = tags,
                message = "Tags retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = "Failed to retrieve tags",
                error = new { code = "FETCH_ERROR", message = ex.Message }
            });
        }
    }

    [HttpPost("tags")]
    public async Task<IActionResult> CreateTag([FromBody] TagCreateDto dto)
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

            var tag = await _tagService.CreateTagAsync(dto);
            return CreatedAtAction(nameof(GetTagById), new { id = tag.Id }, new
            {
                success = true,
                data = tag,
                message = "Tag created successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = "Failed to create tag",
                error = new { code = "CREATE_ERROR", message = ex.Message }
            });
        }
    }

    [HttpGet("tags/{id}")]
    public async Task<IActionResult> GetTagById(int id)
    {
        try
        {
            var tag = await _tagService.GetTagByIdAsync(id);
            if (tag == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Tag not found",
                    error = new { code = "NOT_FOUND", message = "Tag with the specified ID was not found" }
                });
            }

            return Ok(new
            {
                success = true,
                data = tag,
                message = "Tag retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = "Failed to retrieve tag",
                error = new { code = "FETCH_ERROR", message = ex.Message }
            });
        }
    }

    [HttpPut("tags/{id}")]
    public async Task<IActionResult> UpdateTag(int id, [FromBody] TagUpdateDto dto)
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

            var tag = await _tagService.UpdateTagAsync(id, dto);
            if (tag == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Tag not found",
                    error = new { code = "NOT_FOUND", message = "Tag with the specified ID was not found" }
                });
            }

            return Ok(new
            {
                success = true,
                data = tag,
                message = "Tag updated successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = "Failed to update tag",
                error = new { code = "UPDATE_ERROR", message = ex.Message }
            });
        }
    }

    [HttpDelete("tags/{id}")]
    public async Task<IActionResult> DeleteTag(int id)
    {
        try
        {
            var success = await _tagService.DeleteTagAsync(id);
            if (!success)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Tag not found",
                    error = new { code = "NOT_FOUND", message = "Tag with the specified ID was not found" }
                });
            }

            return Ok(new
            {
                success = true,
                message = "Tag deleted successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = "Failed to delete tag",
                error = new { code = "DELETE_ERROR", message = ex.Message }
            });
        }
    }
}