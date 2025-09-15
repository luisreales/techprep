using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechPrep.Application.DTOs.Resources;
using TechPrep.Core.Enums;

namespace TechPrep.API.Controllers.Admin;

[ApiController]
[Route("api/admin/[controller]")]
// [Authorize(Roles = "Admin")] // Temporarily disabled for testing
public class ResourcesController : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search = null,
        [FromQuery] ResourceKind? kind = null,
        [FromQuery] ResourceDifficulty? difficulty = null,
        [FromQuery] int? topicId = null,
        [FromQuery] int? minRating = null,
        [FromQuery] string sort = "createdAt_desc",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        try
        {
            // Mock data for now until the service is implemented
            var mockResources = new List<ResourceListItemDto>
            {
                new(
                    Id: 1,
                    Kind: ResourceKind.Book.ToString(),
                    Title: "Clean Code: A Handbook of Agile Software Craftsmanship",
                    Url: "https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350884",
                    Author: "Robert C. Martin",
                    Rating: 4.8,
                    Difficulty: ResourceDifficulty.Medium.ToString(),
                    CreatedAt: DateTime.UtcNow.AddDays(-30),
                    Topics: new[] { "Software Engineering", "Best Practices" }
                ),
                new(
                    Id: 2,
                    Kind: ResourceKind.Video.ToString(),
                    Title: "JavaScript Fundamentals Course",
                    Url: "https://www.youtube.com/watch?v=W6NZfCO5SIk",
                    Author: "Programming with Mosh",
                    Rating: 4.5,
                    Difficulty: ResourceDifficulty.Basic.ToString(),
                    CreatedAt: DateTime.UtcNow.AddDays(-15),
                    Topics: new[] { "JavaScript", "Programming" }
                ),
                new(
                    Id: 3,
                    Kind: ResourceKind.Article.ToString(),
                    Title: "Understanding React Hooks",
                    Url: "https://reactjs.org/docs/hooks-intro.html",
                    Author: "React Team",
                    Rating: 4.2,
                    Difficulty: ResourceDifficulty.Medium.ToString(),
                    CreatedAt: DateTime.UtcNow.AddDays(-7),
                    Topics: new[] { "React", "Frontend Development" }
                ),
                new(
                    Id: 4,
                    Kind: ResourceKind.Book.ToString(),
                    Title: "System Design Interview",
                    Url: "https://www.amazon.com/System-Design-Interview-insiders-Second/dp/B08CMF2CQF",
                    Author: "Alex Xu",
                    Rating: 4.7,
                    Difficulty: ResourceDifficulty.Hard.ToString(),
                    CreatedAt: DateTime.UtcNow.AddDays(-3),
                    Topics: new[] { "System Design", "Architecture" }
                )
            };

            // Apply basic filtering
            var filteredResources = mockResources.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                filteredResources = filteredResources.Where(r => 
                    r.Title.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                    (r.Author != null && r.Author.Contains(search, StringComparison.OrdinalIgnoreCase)));
            }

            if (kind.HasValue)
            {
                filteredResources = filteredResources.Where(r => r.Kind == kind.Value.ToString());
            }

            if (difficulty.HasValue)
            {
                filteredResources = filteredResources.Where(r => r.Difficulty == difficulty.Value.ToString());
            }

            if (minRating.HasValue)
            {
                filteredResources = filteredResources.Where(r => r.Rating >= minRating.Value);
            }

            var totalResources = filteredResources.Count();
            var paginatedResources = filteredResources
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return Ok(new
            {
                success = true,
                data = new
                {
                    resources = paginatedResources,
                    total = totalResources,
                    page = page,
                    pageSize = pageSize,
                    totalPages = (int)Math.Ceiling((double)totalResources / pageSize)
                },
                message = "Resources retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                error = new
                {
                    code = "GET_RESOURCES_ERROR",
                    message = "An error occurred while retrieving resources",
                    details = ex.Message
                }
            });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            // Mock detailed resource data
            var mockResource = new ResourceDetailDto(
                Id: id,
                Kind: ResourceKind.Book.ToString(),
                Title: "Clean Code: A Handbook of Agile Software Craftsmanship",
                Url: "https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350884",
                Author: "Robert C. Martin",
                Duration: "08:00:00", // 8 hours reading time
                Rating: 4.8,
                Description: "A comprehensive guide to writing clean, maintainable code that any developer can understand and modify.",
                Difficulty: ResourceDifficulty.Medium.ToString(),
                QuestionIds: new[] { Guid.NewGuid(), Guid.NewGuid() },
                Topics: new[] { "Software Engineering", "Best Practices", "Clean Code" }
            );

            return Ok(new
            {
                success = true,
                data = mockResource,
                message = "Resource retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                error = new
                {
                    code = "GET_RESOURCE_ERROR",
                    message = "An error occurred while retrieving the resource",
                    details = ex.Message
                }
            });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ResourceCreateDto createDto)
    {
        try
        {
            // Mock creation - return a created resource
            var createdResource = new ResourceDetailDto(
                Id: new Random().Next(1000, 9999),
                Kind: createDto.Kind.ToString(),
                Title: createDto.Title,
                Url: createDto.Url,
                Author: createDto.Author,
                Duration: createDto.Duration?.ToString(),
                Rating: createDto.Rating,
                Description: createDto.Description,
                Difficulty: createDto.Difficulty?.ToString(),
                QuestionIds: createDto.QuestionIds ?? new List<Guid>(),
                Topics: new[] { "New Topic" }
            );

            return Ok(new
            {
                success = true,
                data = createdResource,
                message = "Resource created successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                error = new
                {
                    code = "CREATE_RESOURCE_ERROR",
                    message = "An error occurred while creating the resource",
                    details = ex.Message
                }
            });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ResourceUpdateDto updateDto)
    {
        try
        {
            // Mock update - return updated resource
            var updatedResource = new ResourceDetailDto(
                Id: id,
                Kind: updateDto.Kind.ToString(),
                Title: updateDto.Title,
                Url: updateDto.Url,
                Author: updateDto.Author,
                Duration: updateDto.Duration?.ToString(),
                Rating: updateDto.Rating,
                Description: updateDto.Description,
                Difficulty: updateDto.Difficulty?.ToString(),
                QuestionIds: updateDto.QuestionIds ?? new List<Guid>(),
                Topics: new[] { "Updated Topic" }
            );

            return Ok(new
            {
                success = true,
                data = updatedResource,
                message = "Resource updated successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                error = new
                {
                    code = "UPDATE_RESOURCE_ERROR",
                    message = "An error occurred while updating the resource",
                    details = ex.Message
                }
            });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            return Ok(new
            {
                success = true,
                data = new { id = id },
                message = "Resource deleted successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                error = new
                {
                    code = "DELETE_RESOURCE_ERROR",
                    message = "An error occurred while deleting the resource",
                    details = ex.Message
                }
            });
        }
    }

    [HttpDelete("bulk")]
    public async Task<IActionResult> BulkDelete([FromBody] BulkDeleteResourcesDto bulkDeleteDto)
    {
        try
        {
            return Ok(new
            {
                success = true,
                data = new { deletedCount = bulkDeleteDto.Ids.Count },
                message = $"Successfully deleted {bulkDeleteDto.Ids.Count} resources"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                error = new
                {
                    code = "BULK_DELETE_ERROR",
                    message = "An error occurred while deleting resources",
                    details = ex.Message
                }
            });
        }
    }
}