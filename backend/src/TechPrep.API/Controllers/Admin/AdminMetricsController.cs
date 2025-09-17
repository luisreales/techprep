using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechPrep.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace TechPrep.API.Controllers.Admin;

[ApiController]
[Route("api/admin/[controller]")]
[Authorize(Roles = "Admin")]
public class MetricsController : ControllerBase
{
    private readonly ILogger<MetricsController> _logger;
    private readonly TechPrepDbContext _context;

    public MetricsController(ILogger<MetricsController> logger, TechPrepDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    [HttpGet("global")]
    public async Task<IActionResult> GetGlobalMetrics()
    {
        try
        {
            var metrics = await GenerateGlobalMetrics();

            return Ok(new
            {
                success = true,
                data = metrics,
                message = "Global metrics retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve global metrics");
            return BadRequest(new
            {
                success = false,
                message = "Failed to retrieve global metrics",
                error = new
                {
                    code = "METRICS_RETRIEVAL_ERROR",
                    message = ex.Message
                }
            });
        }
    }

    private async Task<object> GenerateGlobalMetrics()
    {
        // Get actual counts from database
        var totalUsers = await _context.Users.CountAsync();
        var totalQuestions = await _context.Questions.CountAsync();
        var totalTopics = await _context.Topics.CountAsync();

        // Mock session data (since sessions might not be fully implemented)
        var totalSessions = 0;

        // Generate mock performance metrics
        var avgAccuracy = Random.Shared.NextDouble() * 30 + 65; // 65-95%
        var completionRate = Random.Shared.NextDouble() * 20 + 75; // 75-95%
        var activeUsers = Math.Max(1, totalUsers - Random.Shared.Next(0, Math.Max(1, totalUsers / 3)));
        var avgSessionDuration = Random.Shared.NextDouble() * 20 + 15; // 15-35 minutes

        // Generate mock activity data for the last 7 days
        var activityData = new List<object>();
        for (int i = 6; i >= 0; i--)
        {
            var date = DateTime.Now.Date.AddDays(-i);
            var value = Random.Shared.Next(5, 50); // Mock daily session count
            activityData.Add(new
            {
                date = date.ToString("yyyy-MM-dd"),
                value
            });
        }

        // Generate mock topic accuracy data
        var topics = await _context.Topics.Take(10).ToListAsync();
        var topicAccuracy = topics.Select(topic => new
        {
            topicName = topic.Name,
            accuracy = Random.Shared.NextDouble() * 40 + 55, // 55-95%
            totalQuestions = Random.Shared.Next(5, 25)
        }).OrderByDescending(t => t.accuracy).ToList();

        return new
        {
            totalUsers,
            totalQuestions,
            totalTopics,
            totalSessions,
            avgAccuracy,
            completionRate,
            activeUsers,
            avgSessionDuration,
            activityData,
            topicAccuracy,
            lastUpdated = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        };
    }
}