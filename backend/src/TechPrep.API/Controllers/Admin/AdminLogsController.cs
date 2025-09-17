using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;

namespace TechPrep.API.Controllers.Admin;

[ApiController]
[Route("api/admin/logs")]
// Relaxed for testing; switch back to Admin when ready
[AllowAnonymous]
public class AdminLogsController : ControllerBase
{
    private readonly IWebHostEnvironment _env;

    public AdminLogsController(IWebHostEnvironment env)
    {
        _env = env;
    }

    public record LogEntry(DateTime Timestamp, string Level, string Message, string? Exception);

    [HttpGet]
    public IActionResult Get(
        [FromQuery] string? level = null,
        [FromQuery] string? q = null,
        [FromQuery] DateTime? dateFrom = null,
        [FromQuery] DateTime? dateTo = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        // Locate log files (Serilog File sink)
        var logsDir = Path.Combine(_env.ContentRootPath, "logs");
        if (!Directory.Exists(logsDir))
        {
            return Ok(new { success = true, data = new { items = Array.Empty<LogEntry>(), page, pageSize, total = 0 } });
        }

        var files = Directory.GetFiles(logsDir, "techprep-*.log", SearchOption.TopDirectoryOnly)
                              .OrderByDescending(f => f)
                              .ToList();
        var all = new List<LogEntry>(capacity: 2048);

        // Example line format from appsettings outputTemplate:
        // 2025-09-10 09:38:59.858 -05:00 [INF] Message text
        var rx = new Regex(@"^(?<ts>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} [\+\-]\d{2}:\d{2}) \[(?<lvl>\w{3})\] (?<msg>.*)$", RegexOptions.Compiled);

        foreach (var file in files)
        {
            // Read safely (large files could be heavy; we could tail in future)
            IEnumerable<string> lines;
            try { lines = System.IO.File.ReadLines(file); } catch { continue; }
            foreach (var line in lines)
            {
                var m = rx.Match(line);
                if (!m.Success) continue;
                if (!DateTime.TryParse(m.Groups["ts"].Value, out var ts)) continue;
                var lvl = m.Groups["lvl"].Value; // e.g., INF/WRN/ERR
                var fullMsg = m.Groups["msg"].Value;
                string? ex = null;

                // If next line(s) contain exception (Serilog writes exception on next line), attach only first
                // For simplicity, skip multi-line aggregation here.

                var entry = new LogEntry(ts, lvl, fullMsg, ex);
                all.Add(entry);
            }
        }

        // Apply filters
        if (!string.IsNullOrWhiteSpace(level))
        {
            var norm = level.Trim().ToUpperInvariant(); // accept Information/INF etc
            if (norm.StartsWith("INF")) all = all.Where(e => e.Level.Equals("INF", StringComparison.OrdinalIgnoreCase)).ToList();
            else if (norm.StartsWith("WRN")) all = all.Where(e => e.Level.Equals("WRN", StringComparison.OrdinalIgnoreCase)).ToList();
            else if (norm.StartsWith("ERR")) all = all.Where(e => e.Level.Equals("ERR", StringComparison.OrdinalIgnoreCase)).ToList();
            else if (norm.StartsWith("DBG")) all = all.Where(e => e.Level.Equals("DBG", StringComparison.OrdinalIgnoreCase)).ToList();
            else if (norm.StartsWith("FAT")) all = all.Where(e => e.Level.Equals("FTL", StringComparison.OrdinalIgnoreCase)).ToList();
        }

        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim();
            all = all.Where(e => e.Message.Contains(term, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        if (dateFrom.HasValue) all = all.Where(e => e.Timestamp >= dateFrom.Value).ToList();
        if (dateTo.HasValue) all = all.Where(e => e.Timestamp <= dateTo.Value).ToList();

        // Sort newest first
        all = all.OrderByDescending(e => e.Timestamp).ToList();

        var total = all.Count;
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 50;
        var items = all.Skip((page - 1) * pageSize).Take(pageSize).ToList();

        return Ok(new
        {
            success = true,
            data = new
            {
                items,
                page,
                pageSize,
                total
            }
        });
    }

    [HttpGet("download")]
    public IActionResult Download([FromQuery] string date)
    {
        if (string.IsNullOrWhiteSpace(date))
        {
            return BadRequest(new { success = false, message = "Query param 'date' is required (YYYY-MM-DD)" });
        }

        if (!DateTime.TryParse(date, out var dt))
        {
            return BadRequest(new { success = false, message = "Invalid date format. Expected YYYY-MM-DD" });
        }

        var yyyymmdd = dt.ToString("yyyyMMdd");
        var logsDir = Path.Combine(_env.ContentRootPath, "logs");
        var filePath = Path.Combine(logsDir, $"techprep-{yyyymmdd}.log");

        if (!System.IO.File.Exists(filePath))
        {
            return NotFound(new { success = false, message = $"Log file not found for {date}" });
        }

        var stream = System.IO.File.OpenRead(filePath);
        return File(stream, "text/plain", Path.GetFileName(filePath));
    }
}
