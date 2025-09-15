using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TechPrep.API.Controllers.Admin;

[ApiController]
[Route("api/admin/[controller]")]
// [Authorize(Roles = "Admin")] // Temporarily disabled for testing
public class TopicsController : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            // Mock topics data for now until the service is implemented
            var mockTopics = new[]
            {
                new { id = 1, name = "Software Engineering", description = "General software engineering principles and practices" },
                new { id = 2, name = "Best Practices", description = "Industry best practices for software development" },
                new { id = 3, name = "JavaScript", description = "JavaScript programming language and frameworks" },
                new { id = 4, name = "Programming", description = "General programming concepts and techniques" },
                new { id = 5, name = "React", description = "React framework for frontend development" },
                new { id = 6, name = "Frontend Development", description = "Frontend web development technologies" },
                new { id = 7, name = "System Design", description = "Large-scale system design and architecture" },
                new { id = 8, name = "Architecture", description = "Software architecture patterns and principles" }
            };

            return Ok(new
            {
                success = true,
                data = mockTopics,
                message = "Topics retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                error = new
                {
                    code = "GET_TOPICS_ERROR",
                    message = "An error occurred while retrieving topics",
                    details = ex.Message
                }
            });
        }
    }
}