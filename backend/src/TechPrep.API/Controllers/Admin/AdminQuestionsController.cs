using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechPrep.Application.DTOs;
using TechPrep.Application.Interfaces;
using TechPrep.Core.Enums;

namespace TechPrep.API.Controllers.Admin;

[ApiController]
[Route("api/admin/[controller]")]
// [Authorize(Roles = "Admin")] // Temporarily disabled for testing
public class QuestionsController : ControllerBase
{
    private readonly IQuestionService _questionService;

    public QuestionsController(IQuestionService questionService)
    {
        _questionService = questionService;
    }
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int? topicId = null,
        [FromQuery] QuestionType? type = null,
        [FromQuery] DifficultyLevel? level = null,
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 25)
    {
        try
        {
            var questions = await _questionService.GetQuestionsAsync(topicId, type, level, search, page, limit);
            var totalCount = await _questionService.GetQuestionsCountAsync(topicId, type, level, search);
            var totalPages = (int)Math.Ceiling((double)totalCount / limit);

            return Ok(new
            {
                success = true,
                data = new
                {
                    questions = questions,
                    total = totalCount,
                    page = page,
                    totalPages = totalPages
                },
                message = "Questions retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = "Failed to retrieve questions",
                error = new { code = "FETCH_ERROR", message = ex.Message }
            });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var question = await _questionService.GetQuestionByIdAsync(id);
            if (question == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Question not found",
                    error = new { code = "NOT_FOUND", message = "Question with the specified ID was not found" }
                });
            }

            return Ok(new
            {
                success = true,
                data = question,
                message = "Question retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = "Failed to retrieve question",
                error = new { code = "FETCH_ERROR", message = ex.Message }
            });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateQuestionDto dto)
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

            var question = await _questionService.CreateQuestionAsync(dto);
            return Ok(new
            {
                success = true,
                data = question,
                message = "Question created successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = "Failed to create question",
                error = new { code = "CREATE_ERROR", message = ex.Message }
            });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateQuestionDto dto)
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

            var question = await _questionService.UpdateQuestionAsync(id, dto);
            if (question == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Question not found",
                    error = new { code = "NOT_FOUND", message = "Question with the specified ID was not found" }
                });
            }

            return Ok(new
            {
                success = true,
                data = question,
                message = "Question updated successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = "Failed to update question",
                error = new { code = "UPDATE_ERROR", message = ex.Message }
            });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var success = await _questionService.DeleteQuestionAsync(id);
            if (!success)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Question not found",
                    error = new { code = "NOT_FOUND", message = "Question with the specified ID was not found" }
                });
            }

            return Ok(new
            {
                success = true,
                message = "Question deleted successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = "Failed to delete question",
                error = new { code = "DELETE_ERROR", message = ex.Message }
            });
        }
    }

    [HttpDelete("bulk")]
    public async Task<IActionResult> BulkDelete([FromBody] BulkDeleteDto dto)
    {
        try
        {
            if (!ModelState.IsValid || dto.Ids == null || !dto.Ids.Any())
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Invalid request",
                    error = new { code = "VALIDATION_ERROR", message = "At least one ID must be provided" }
                });
            }

            var deletedCount = await _questionService.BulkDeleteQuestionsAsync(dto.Ids);
            return Ok(new
            {
                success = true,
                message = $"{deletedCount} questions deleted successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = "Failed to delete questions",
                error = new { code = "DELETE_ERROR", message = ex.Message }
            });
        }
    }

    [HttpPost("export")]
    public async Task<IActionResult> Export([FromBody] ExportQuestionsDto? dto = null)
    {
        try
        {
            var fileBytes = await _questionService.ExportQuestionsAsync(dto?.Ids);
            var fileName = $"questions_export_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";
            return File(fileBytes, "text/csv", fileName);
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = "Failed to export questions",
                error = new { code = "EXPORT_ERROR", message = ex.Message }
            });
        }
    }
}