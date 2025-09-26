using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechPrep.Application.Interfaces;
using TechPrep.Core.Enums;
using TechPrep.Infrastructure.Data;

namespace TechPrep.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuestionsController : ControllerBase
{
    private readonly IQuestionService _questionService;
    private readonly TechPrepDbContext _context;

    public QuestionsController(IQuestionService questionService, TechPrepDbContext context)
    {
        _questionService = questionService;
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetQuestions(
        [FromQuery] string? topics = null,
        [FromQuery] string? levels = null,
        [FromQuery] int countSingle = 0,
        [FromQuery] int countMulti = 0,
        [FromQuery] int countWritten = 0)
    {
        try
        {
            var questions = new List<object>();

            // Parse topics and levels
            var topicIds = string.IsNullOrEmpty(topics) ? new List<int>() :
                topics.Split(',').Select(int.Parse).ToList();
            var levelNames = string.IsNullOrEmpty(levels) ? new List<string>() :
                levels.Split(',').ToList();

            // Build base query
            var baseQuery = _context.Questions
                .Include(q => q.Options)
                .Include(q => q.Topic)
                .AsQueryable();

            // Filter by topics if specified
            if (topicIds.Any())
            {
                baseQuery = baseQuery.Where(q => topicIds.Contains(q.TopicId));
            }

            // Filter by levels if specified
            if (levelNames.Any())
            {
                var parsedLevels = levelNames.Select(level => Enum.Parse<DifficultyLevel>(level, true)).ToList();
                baseQuery = baseQuery.Where(q => parsedLevels.Contains(q.Level));
            }

            // Fetch single choice questions
            if (countSingle > 0)
            {
                var singleQuestions = await baseQuery
                    .Where(q => q.Type == QuestionType.SingleChoice)
                    .Take(countSingle * 3) // Get more questions to randomize from
                    .Select(q => new
                    {
                        id = q.Id.ToString(),
                        text = q.Text,
                        type = "single",
                        level = q.Level.ToString().ToLower(),
                        topicId = q.TopicId,
                        topicName = q.Topic != null ? q.Topic.Name : "Unknown",
                        officialAnswer = q.OfficialAnswer,
                        options = q.Options.Select(o => new
                        {
                            id = o.Id.ToString(),
                            text = o.Text,
                            isCorrect = o.IsCorrect
                        }).ToList()
                    })
                    .ToListAsync();

                // Randomize and take the requested count
                var randomSingleQuestions = singleQuestions.OrderBy(q => Random.Shared.Next()).Take(countSingle);
                questions.AddRange(randomSingleQuestions);
            }

            // Fetch multiple choice questions
            if (countMulti > 0)
            {
                var multiQuestions = await baseQuery
                    .Where(q => q.Type == QuestionType.MultiChoice)
                    .Take(countMulti * 3) // Get more questions to randomize from
                    .Select(q => new
                    {
                        id = q.Id.ToString(),
                        text = q.Text,
                        type = "multi",
                        level = q.Level.ToString().ToLower(),
                        topicId = q.TopicId,
                        topicName = q.Topic != null ? q.Topic.Name : "Unknown",
                        officialAnswer = q.OfficialAnswer,
                        options = q.Options.Select(o => new
                        {
                            id = o.Id.ToString(),
                            text = o.Text,
                            isCorrect = o.IsCorrect
                        }).ToList()
                    })
                    .ToListAsync();

                // Randomize and take the requested count
                var randomMultiQuestions = multiQuestions.OrderBy(q => Random.Shared.Next()).Take(countMulti);
                questions.AddRange(randomMultiQuestions);
            }

            // Fetch written questions
            if (countWritten > 0)
            {
                var writtenQuestions = await baseQuery
                    .Where(q => q.Type == QuestionType.Written)
                    .Take(countWritten * 3) // Get more questions to randomize from
                    .Select(q => new
                    {
                        id = q.Id.ToString(),
                        text = q.Text,
                        type = "written",
                        level = q.Level.ToString().ToLower(),
                        topicId = q.TopicId,
                        topicName = q.Topic != null ? q.Topic.Name : "Unknown",
                        officialAnswer = q.OfficialAnswer,
                        options = new List<object>()
                    })
                    .ToListAsync();

                // Randomize and take the requested count
                var randomWrittenQuestions = writtenQuestions.OrderBy(q => Random.Shared.Next()).Take(countWritten);
                questions.AddRange(randomWrittenQuestions);
            }

            // Shuffle the final list to mix question types
            questions = questions.OrderBy(q => Random.Shared.Next()).ToList();

            return Ok(new
            {
                success = true,
                data = questions,
                message = $"Retrieved {questions.Count} questions successfully"
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