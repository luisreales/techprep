using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechPrep.Infrastructure.Data;

namespace TechPrep.API.Controllers.Admin;

[ApiController]
[Route("api/admin/[controller]")]
[Authorize(Roles = "Admin")]
public class HealthController : ControllerBase
{
    private readonly ILogger<HealthController> _logger;
    private readonly TechPrepDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public HealthController(ILogger<HealthController> logger, TechPrepDbContext context, IWebHostEnvironment environment)
    {
        _logger = logger;
        _context = context;
        _environment = environment;
    }

    [HttpGet]
    public async Task<IActionResult> GetHealthStatus()
    {
        try
        {
            var healthStatus = await GenerateHealthStatus();

            return Ok(new
            {
                success = true,
                data = healthStatus,
                message = "Health status retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve health status");
            return StatusCode(500, new
            {
                success = false,
                message = "Failed to retrieve health status",
                error = new
                {
                    code = "HEALTH_CHECK_ERROR",
                    message = ex.Message
                }
            });
        }
    }

    private async Task<object> GenerateHealthStatus()
    {
        bool dbOk = false;
        int pendingMigrations = 0;
        long dbSizeBytes = 0;

        try
        {
            // Connectivity
            dbOk = await _context.Database.CanConnectAsync();

            // Pending migrations
            var pending = await _context.Database.GetPendingMigrationsAsync();
            pendingMigrations = pending?.Count() ?? 0;

            // DB size (SQLite): parse Data Source from connection string
            var connStr = _context.Database.GetDbConnection().ConnectionString;
            var parts = connStr.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            var dataSource = parts.FirstOrDefault(p => p.StartsWith("Data Source", StringComparison.OrdinalIgnoreCase))?.Split('=', 2)[1];
            if (!string.IsNullOrWhiteSpace(dataSource))
            {
                var path = Path.IsPathRooted(dataSource) ? dataSource : Path.Combine(_environment.ContentRootPath, dataSource);
                if (System.IO.File.Exists(path))
                {
                    dbSizeBytes = new FileInfo(path).Length;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Database health check failed");
            dbOk = false;
        }

        // Check disk space
        long freeDiskBytes = 0;
        try
        {
            var root = Path.GetPathRoot(_environment.ContentRootPath);
            var drive = DriveInfo.GetDrives().FirstOrDefault(d => string.Equals(d.Name, root, StringComparison.OrdinalIgnoreCase))
                       ?? DriveInfo.GetDrives().FirstOrDefault(d => d.IsReady);
            freeDiskBytes = drive?.AvailableFreeSpace ?? 0;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Disk space check failed");
            freeDiskBytes = 0;
        }

        // Determine overall status
        string overallStatus = "Healthy";
        if (!dbOk)
        {
            overallStatus = "Unhealthy";
        }
        else if (freeDiskBytes < 1024L * 1024 * 1024) // Less than 1GB
        {
            overallStatus = "Degraded";
        }

        DateTime? lastErrorAt = null;

        return new
        {
            status = overallStatus,
            environment = _environment.EnvironmentName,
            dbOk,
            pendingMigrations,
            dbSizeBytes,
            freeDiskBytes,
            lastErrorAt = lastErrorAt?.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
            timestamp = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        };
    }
}
