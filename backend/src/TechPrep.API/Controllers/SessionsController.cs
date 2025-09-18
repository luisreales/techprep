using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TechPrep.Core.Entities;
using TechPrep.Core.Enums;
using TechPrep.Infrastructure.Data;

namespace TechPrep.API.Controllers;

public class CreateSessionRequest
{
    public int? TopicId { get; set; }
    public string? Level { get; set; }
    public PracticeMode Mode { get; set; }
    public int QuestionCount { get; set; } = 10;
}

public class SubmitAnswerRequest
{
    public string QuestionId { get; set; } = default!;
    public string Answer { get; set; } = default!;
    public int TimeSpentMs { get; set; }
    public int? MatchPercentage { get; set; }
}

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

    [HttpPost]
    public async Task<IActionResult> CreateSession([FromBody] CreateSessionRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { success = false, message = "Invalid user token" });
        }

        // Fetch questions based on the request parameters
        var questionsQuery = _db.Questions
            .Include(q => q.Options)
            .AsQueryable();

        if (request.TopicId.HasValue)
        {
            questionsQuery = questionsQuery.Where(q => q.TopicId == request.TopicId.Value);
        }

        if (!string.IsNullOrEmpty(request.Level))
        {
            questionsQuery = questionsQuery.Where(q => q.Level.ToString().ToLower() == request.Level.ToLower());
        }

        var questions = await questionsQuery
            .Take(request.QuestionCount)
            .ToListAsync();

        if (questions.Count == 0)
        {
            return BadRequest(new { success = false, message = "No questions found matching the criteria" });
        }

        // Create the practice session
        var session = new PracticeSession
        {
            UserId = userId,
            Mode = request.Mode,
            RandomOrder = false,
            TimeLimitMin = null,
            ThresholdWritten = 70, // Default threshold
            StartedAt = DateTime.UtcNow,
            TotalItems = questions.Count,
            CorrectCount = 0,
            IncorrectCount = 0,
        };

        _db.PracticeSessions.Add(session);
        await _db.SaveChangesAsync();

        // Create session items for each question
        int order = 1;
        foreach (var question in questions)
        {
            _db.PracticeSessionItems.Add(new PracticeSessionItem
            {
                SessionId = session.Id,
                OrderIndex = order++,
                ItemType = SessionItemType.Question,
                ItemId = question.Id.ToString(),
                Level = question.Level.ToString().ToLower(),
                TopicId = question.TopicId,
                TimeMs = 0,
            });
        }

        await _db.SaveChangesAsync();

        return Ok(new { success = true, data = new { sessionId = session.Id, questionCount = questions.Count } });
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

    [HttpPost("{sessionId:guid}/answers")]
    public async Task<IActionResult> SubmitAnswer(Guid sessionId, [FromBody] SubmitAnswerRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { success = false, message = "Invalid user token" });
        }

        // Find the session and verify ownership
        var session = await _db.PracticeSessions
            .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId);

        if (session == null)
        {
            return NotFound(new { success = false, message = "Session not found" });
        }

        // Find the session item
        var sessionItem = await _db.PracticeSessionItems
            .FirstOrDefaultAsync(si => si.SessionId == sessionId && si.ItemId == request.QuestionId);

        if (sessionItem == null)
        {
            return BadRequest(new { success = false, message = "Question not found in session" });
        }

        // Update the session item with the answer
        sessionItem.GivenText = request.Answer;
        sessionItem.TimeMs = request.TimeSpentMs;
        sessionItem.AnsweredAt = DateTime.UtcNow;

        // For written answers, we would calculate match percentage here
        // For now, we'll just mark it as submitted
        if (request.MatchPercentage.HasValue)
        {
            sessionItem.MatchPercent = request.MatchPercentage.Value;
            sessionItem.IsCorrect = request.MatchPercentage.Value >= session.ThresholdWritten;
        }

        await _db.SaveChangesAsync();

        return Ok(new { success = true, message = "Answer submitted successfully" });
    }

    [HttpPost("{sessionId:guid}/finish")]
    public async Task<IActionResult> FinishSession(Guid sessionId)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { success = false, message = "Invalid user token" });
        }

        // Find the session and verify ownership
        var session = await _db.PracticeSessions
            .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId);

        if (session == null)
        {
            return NotFound(new { success = false, message = "Session not found" });
        }

        // Mark session as finished
        session.FinishedAt = DateTime.UtcNow;

        // Calculate correct/incorrect counts based on session items
        var sessionItems = await _db.PracticeSessionItems
            .Where(si => si.SessionId == sessionId)
            .ToListAsync();

        session.CorrectCount = sessionItems.Count(si => si.MatchPercent >= session.ThresholdWritten);
        session.IncorrectCount = sessionItems.Count(si => si.MatchPercent < session.ThresholdWritten);

        await _db.SaveChangesAsync();

        return Ok(new { success = true, message = "Session finished successfully" });
    }
}

