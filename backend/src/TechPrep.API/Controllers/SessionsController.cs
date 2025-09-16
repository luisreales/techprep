using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TechPrep.Core.Entities;
using TechPrep.Core.Enums;
using TechPrep.Infrastructure.Data;

namespace TechPrep.API.Controllers;

[ApiController]
[Route("api/sessions")]
[Authorize]
public class SessionsController : ControllerBase
{
    private readonly TechPrepDbContext _db;

    public SessionsController(TechPrepDbContext db)
    {
        _db = db;
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var id) ? id : Guid.Empty;
    }

    [HttpPost("from-template/{templateId:int}")]
    public async Task<IActionResult> CreateFromTemplate(int templateId)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { success = false, message = "Invalid user token" });
        }

        var template = await _db.SessionTemplates
            .Include(t => t.TemplateItems)
            .FirstOrDefaultAsync(t => t.Id == templateId);

        if (template == null)
        {
            return NotFound(new { success = false, message = "Template not found" });
        }

        // For MVP, support manual items only. Auto selection to be added later.
        var items = template.TemplateItems
            .OrderBy(i => i.OrderIndex)
            .ToList();

        if (items.Count == 0)
        {
            return BadRequest(new { success = false, message = "Template has no manual items. Auto selection not implemented yet." });
        }

        var session = new PracticeSession
        {
            UserId = userId,
            TemplateId = template.Id,
            Mode = template.Mode,
            RandomOrder = template.RandomOrder,
            TimeLimitMin = template.TimeLimitMin,
            ThresholdWritten = template.ThresholdWritten,
            StartedAt = DateTime.UtcNow,
            TotalItems = items.Count,
            CorrectCount = 0,
            IncorrectCount = 0,
        };

        _db.PracticeSessions.Add(session);
        await _db.SaveChangesAsync();

        int order = 1;
        foreach (var it in items)
        {
            // Determine TopicId/Level if needed. For MVP, default to 0/"basic" (caller will load actual content by ItemId).
            _db.PracticeSessionItems.Add(new PracticeSessionItem
            {
                SessionId = session.Id,
                OrderIndex = order++,
                ItemType = it.ItemType,
                ItemId = it.ItemId,
                Level = "basic",
                TopicId = 0,
                TimeMs = 0,
            });
        }

        await _db.SaveChangesAsync();

        return Ok(new { success = true, data = new { sessionId = session.Id } });
    }
}

