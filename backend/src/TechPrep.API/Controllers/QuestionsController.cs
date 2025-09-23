using Microsoft.AspNetCore.Mvc;
using TechPrep.Application.Interfaces;
using TechPrep.Core.Enums;

namespace TechPrep.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuestionsController : ControllerBase
{
    private readonly IQuestionService _questionService;

    public QuestionsController(IQuestionService questionService)
    {
        _questionService = questionService;
    }

    [HttpGet("difficulties")]
    public async Task<IActionResult> GetDifficulties()
    {
        try
        {
            // Return the difficulty levels enum as a list
            var difficulties = Enum.GetValues<DifficultyLevel>()
                .Select(d => new
                {
                    id = (int)d,
                    name = d.ToString().ToLower(),
                    level = (int)d,
                    description = d switch
                    {
                        DifficultyLevel.Basic => "Fundamental concepts and basic understanding",
                        DifficultyLevel.Intermediate => "Applied knowledge and problem-solving",
                        DifficultyLevel.Advanced => "Complex scenarios and expert-level thinking",
                        _ => ""
                    },
                    color = d switch
                    {
                        DifficultyLevel.Basic => "#10B981",      // green
                        DifficultyLevel.Intermediate => "#F59E0B", // yellow
                        DifficultyLevel.Advanced => "#EF4444",    // red
                        _ => "#6B7280"                             // gray
                    }
                })
                .ToList();

            return Ok(new
            {
                success = true,
                data = difficulties,
                message = "Difficulties retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = "Failed to retrieve difficulties",
                error = new { code = "FETCH_ERROR", message = ex.Message }
            });
        }
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        try
        {
            // Get basic question statistics
            var totalQuestions = await _questionService.GetQuestionsCountAsync();

            var stats = new
            {
                totalQuestions = totalQuestions,
                totalCategories = 10, // Placeholder - you might want to implement this
                averageDifficulty = 2.1, // Placeholder
                lastUpdated = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),

                // Distribution by type
                byType = new
                {
                    single_choice = await _questionService.GetQuestionsCountAsync(type: QuestionType.SingleChoice),
                    multi_choice = await _questionService.GetQuestionsCountAsync(type: QuestionType.MultiChoice),
                    written = await _questionService.GetQuestionsCountAsync(type: QuestionType.Written)
                },

                // Distribution by difficulty
                byDifficulty = new
                {
                    basic = await _questionService.GetQuestionsCountAsync(level: DifficultyLevel.Basic),
                    intermediate = await _questionService.GetQuestionsCountAsync(level: DifficultyLevel.Intermediate),
                    advanced = await _questionService.GetQuestionsCountAsync(level: DifficultyLevel.Advanced)
                }
            };

            return Ok(new
            {
                success = true,
                data = stats,
                message = "Statistics retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = "Failed to retrieve statistics",
                error = new { code = "FETCH_ERROR", message = ex.Message }
            });
        }
    }

    [HttpGet("categories")]
    public IActionResult GetCategories()
    {
        try
        {
            // Return sample categories for now
            var categories = new[]
            {
                new { id = 1, name = "JavaScript", description = "JavaScript programming language", parentCategoryId = (int?)null, subcategories = new object[0], isActive = true },
                new { id = 2, name = "React", description = "React library", parentCategoryId = (int?)null, subcategories = new object[0], isActive = true },
                new { id = 3, name = "Python", description = "Python programming language", parentCategoryId = (int?)null, subcategories = new object[0], isActive = true },
                new { id = 4, name = "SQL", description = "Database queries", parentCategoryId = (int?)null, subcategories = new object[0], isActive = true },
                new { id = 5, name = "Algorithms", description = "Data structures and algorithms", parentCategoryId = (int?)null, subcategories = new object[0], isActive = true }
            };

            return Ok(new
            {
                success = true,
                data = categories,
                message = "Categories retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = "Failed to retrieve categories",
                error = new { code = "FETCH_ERROR", message = ex.Message }
            });
        }
    }

    [HttpGet("tags")]
    public IActionResult GetTags()
    {
        try
        {
            // Return some sample tags for now
            var tags = new[]
            {
                new { id = 1, name = "Frontend", color = "#3B82F6", category = "Technology" },
                new { id = 2, name = "Backend", color = "#10B981", category = "Technology" },
                new { id = 3, name = "Database", color = "#F59E0B", category = "Technology" },
                new { id = 4, name = "Algorithms", color = "#EF4444", category = "Computer Science" },
                new { id = 5, name = "System Design", color = "#8B5CF6", category = "Architecture" }
            };

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

    [HttpGet("sources")]
    public IActionResult GetSources()
    {
        try
        {
            // Return some sample sources for now
            var sources = new[]
            {
                new { id = 1, name = "MDN Web Docs", url = "https://developer.mozilla.org", type = "documentation", credibility = 5 },
                new { id = 2, name = "Stack Overflow", url = "https://stackoverflow.com", type = "article", credibility = 4 },
                new { id = 3, name = "JavaScript: The Good Parts", url = "", type = "book", credibility = 5 },
                new { id = 4, name = "React Documentation", url = "https://react.dev", type = "documentation", credibility = 5 }
            };

            return Ok(new
            {
                success = true,
                data = sources,
                message = "Sources retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = "Failed to retrieve sources",
                error = new { code = "FETCH_ERROR", message = ex.Message }
            });
        }
    }

    [HttpPost("validate")]
    public IActionResult ValidateQuestion([FromBody] object questionData)
    {
        try
        {
            // Basic validation - you can enhance this
            return Ok(new
            {
                success = true,
                data = new { isValid = true, errors = new string[0] },
                message = "Question validated successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = "Failed to validate question",
                error = new { code = "VALIDATION_ERROR", message = ex.Message }
            });
        }
    }

    [HttpPost("check-duplicates")]
    public IActionResult CheckDuplicates([FromBody] object questionData)
    {
        try
        {
            // Basic duplicate check - you can enhance this
            return Ok(new
            {
                success = true,
                data = new { isDuplicate = false, similarQuestions = new object[0] },
                message = "Duplicate check completed"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = "Failed to check duplicates",
                error = new { code = "CHECK_ERROR", message = ex.Message }
            });
        }
    }
}