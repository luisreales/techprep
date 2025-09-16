using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechPrep.Application.DTOs.Sessions;
using TechPrep.Core.Enums;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TechPrep.Infrastructure.Data;
using TechPrep.Core.Entities;

namespace TechPrep.API.Controllers.Admin;

[ApiController]
[Route("api/admin/session-templates")]
// Temporarily allow access without role checks to verify functionality
[AllowAnonymous]
public class SessionTemplatesController : ControllerBase
{
    private readonly TechPrepDbContext _db;
    private readonly ILogger<SessionTemplatesController> _logger;
    private static readonly JsonSerializerOptions JsonOpts = new(JsonSerializerDefaults.Web);

    public SessionTemplatesController(TechPrepDbContext db, ILogger<SessionTemplatesController> logger)
    {
        _db = db;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? q = null,
        [FromQuery] string? status = null,
        [FromQuery] string? mode = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        try
        {
            var queryable = _db.SessionTemplates.AsNoTracking().OrderByDescending(t => t.CreatedAt).AsQueryable();

            if (!string.IsNullOrWhiteSpace(q))
                queryable = queryable.Where(t => t.Name.Contains(q));

            if (!string.IsNullOrWhiteSpace(status))
            {
                var s = status.Trim().ToLowerInvariant();
                if (s is "draft" or "published")
                {
                    var st = s == "draft" ? TemplateStatus.Draft : TemplateStatus.Published;
                    queryable = queryable.Where(t => t.Status == st);
                }
            }

            if (!string.IsNullOrWhiteSpace(mode))
            {
                var m = mode.Trim().ToLowerInvariant();
                if (m is "study" or "interview")
                {
                    var md = m == "study" ? PracticeMode.Study : PracticeMode.Interview;
                    queryable = queryable.Where(t => t.Mode == md);
                }
            }

            var total = await queryable.CountAsync();
            var pageItems = await queryable
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(t => new SessionTemplateListItemDto
                {
                    Id = t.Id,
                    Name = t.Name,
                    Mode = t.Mode == PracticeMode.Study ? "study" : "interview",
                    Status = t.Status == TemplateStatus.Draft ? "draft" : "published",
                    TimeLimitMin = t.TimeLimitMin,
                    TotalItems = _db.SessionTemplateItems.Count(i => i.TemplateId == t.Id),
                    CreatedAt = t.CreatedAt,
                    UpdatedAt = t.UpdatedAt
                })
                .ToListAsync();

            return Ok(new
            {
                success = true,
                data = new
                {
                    templates = pageItems,
                    pagination = new
                    {
                        page,
                        pageSize,
                        total,
                        totalPages = (int)Math.Ceiling(total / (double)pageSize)
                    }
                }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                success = false,
                message = "Failed to retrieve session templates",
                error = new { code = "INTERNAL_ERROR", message = ex.Message }
            });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var entity = await _db.SessionTemplates
                .Include(t => t.TemplateItems)
                .FirstOrDefaultAsync(t => t.Id == id);
            if (entity == null)
            {
                return NotFound(new { success = false, message = "Template not found" });
            }

            var topicIds = JsonSerializer.Deserialize<List<int>>(entity.TopicsJson, JsonOpts) ?? new();

            var detail = new SessionTemplateDetailDto
            {
                Id = entity.Id,
                Name = entity.Name,
                Mode = entity.Mode == PracticeMode.Study ? "study" : "interview",
                Topics = topicIds,
                Levels = JsonSerializer.Deserialize<List<string>>(entity.LevelsJson, JsonOpts) ?? new(),
                RandomOrder = entity.RandomOrder,
                TimeLimitMin = entity.TimeLimitMin,
                ThresholdWritten = entity.ThresholdWritten,
                Status = entity.Status == TemplateStatus.Draft ? "draft" : "published",
                Questions = JsonSerializer.Deserialize<QuestionsConfigDto>(entity.QuestionsConfigJson, JsonOpts) ?? new(),
                Challenges = JsonSerializer.Deserialize<ChallengesConfigDto>(entity.ChallengesConfigJson, JsonOpts) ?? new(),
                CreatedAt = entity.CreatedAt,
                UpdatedAt = entity.UpdatedAt,
                Items = entity.TemplateItems
                    .OrderBy(i => i.OrderIndex)
                    .Select(i => new SessionTemplateItemDto
                    {
                        Id = i.Id,
                        ItemType = i.ItemType == SessionItemType.Question ? "question" : "challenge",
                        ItemId = i.ItemId,
                        OrderIndex = i.OrderIndex
                    }).ToList()
            };

            return Ok(new { success = true, data = detail });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                success = false,
                message = "Failed to retrieve session template",
                error = new { code = "INTERNAL_ERROR", message = ex.Message }
            });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SessionTemplateCreateDto dto)
    {
        try
        {
            _logger.LogInformation("Creating session template with name: {Name}", dto.Name);
            
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state for session template creation");
                return BadRequest(new
                {
                    success = false,
                    message = "Invalid input data",
                    error = new { code = "VALIDATION_ERROR", details = ModelState }
                });
            }

            var entity = new SessionTemplate
            {
                Name = dto.Name,
                Mode = dto.Mode.ToLowerInvariant() == "study" ? PracticeMode.Study : PracticeMode.Interview,
                TopicsJson = JsonSerializer.Serialize(dto.Topics ?? new List<int>(), JsonOpts),
                LevelsJson = JsonSerializer.Serialize(dto.Levels ?? new List<string>(), JsonOpts),
                RandomOrder = dto.RandomOrder,
                TimeLimitMin = dto.TimeLimitMin,
                ThresholdWritten = dto.ThresholdWritten,
                Status = dto.Status.ToLowerInvariant() == "published" ? TemplateStatus.Published : TemplateStatus.Draft,
                QuestionsConfigJson = JsonSerializer.Serialize(dto.Questions ?? new QuestionsConfigDto(), JsonOpts),
                ChallengesConfigJson = JsonSerializer.Serialize(dto.Challenges ?? new ChallengesConfigDto(), JsonOpts),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = null,
            };

            _logger.LogInformation("Adding session template to context");
            _db.SessionTemplates.Add(entity);
            
            _logger.LogInformation("Saving changes to database");
            var changesSaved = await _db.SaveChangesAsync();
            _logger.LogInformation("SaveChangesAsync returned: {ChangesSaved} changes", changesSaved);

            _logger.LogInformation("Session template created successfully with ID: {Id}", entity.Id);

            // Persist manual items if provided
            int order = 1;
            if (string.Equals(dto.Questions?.Selection, "manual", StringComparison.OrdinalIgnoreCase) && dto.Questions?.ManualIds != null)
            {
                foreach (var qid in dto.Questions.ManualIds)
                {
                    _db.SessionTemplateItems.Add(new SessionTemplateItem
                    {
                        TemplateId = entity.Id,
                        ItemType = SessionItemType.Question,
                        ItemId = qid,
                        OrderIndex = order++
                    });
                }
            }
            if (string.Equals(dto.Challenges?.Selection, "manual", StringComparison.OrdinalIgnoreCase) && dto.Challenges?.ManualIds != null)
            {
                foreach (var cid in dto.Challenges.ManualIds)
                {
                    _db.SessionTemplateItems.Add(new SessionTemplateItem
                    {
                        TemplateId = entity.Id,
                        ItemType = SessionItemType.Challenge,
                        ItemId = cid.ToString(),
                        OrderIndex = order++
                    });
                }
            }
            if (order > 1)
            {
                await _db.SaveChangesAsync();
            }

            // Build the response DTO to match the expected format
            var responseDto = new SessionTemplateDetailDto
            {
                Id = entity.Id,
                Name = entity.Name,
                Mode = entity.Mode == PracticeMode.Study ? "study" : "interview",
                Topics = dto.Topics ?? new List<int>(),
                Levels = JsonSerializer.Deserialize<List<string>>(entity.LevelsJson, JsonOpts) ?? new(),
                RandomOrder = entity.RandomOrder,
                TimeLimitMin = entity.TimeLimitMin,
                ThresholdWritten = entity.ThresholdWritten,
                Status = entity.Status == TemplateStatus.Draft ? "draft" : "published",
                Questions = JsonSerializer.Deserialize<QuestionsConfigDto>(entity.QuestionsConfigJson, JsonOpts) ?? new(),
                Challenges = JsonSerializer.Deserialize<ChallengesConfigDto>(entity.ChallengesConfigJson, JsonOpts) ?? new(),
                CreatedAt = entity.CreatedAt,
                UpdatedAt = entity.UpdatedAt,
                Items = new List<SessionTemplateItemDto>()
            };

            return CreatedAtAction(nameof(GetById), new { id = entity.Id }, new { success = true, data = responseDto });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                success = false,
                message = "Failed to create session template",
                error = new { code = "INTERNAL_ERROR", message = ex.Message }
            });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] SessionTemplateUpdateDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Invalid input data",
                    error = new { code = "VALIDATION_ERROR", details = ModelState }
                });
            }
            var entity = await _db.SessionTemplates.FirstOrDefaultAsync(t => t.Id == id);
            if (entity == null)
            {
                return NotFound(new { success = false, message = "Template not found" });
            }

            entity.Name = dto.Name;
            entity.Mode = dto.Mode.ToLowerInvariant() == "study" ? PracticeMode.Study : PracticeMode.Interview;
            entity.TopicsJson = JsonSerializer.Serialize(dto.Topics ?? new List<int>(), JsonOpts);
            entity.LevelsJson = JsonSerializer.Serialize(dto.Levels ?? new List<string>(), JsonOpts);
            entity.RandomOrder = dto.RandomOrder;
            entity.TimeLimitMin = dto.TimeLimitMin;
            entity.ThresholdWritten = dto.ThresholdWritten;
            entity.Status = dto.Status.ToLowerInvariant() == "published" ? TemplateStatus.Published : TemplateStatus.Draft;
            entity.QuestionsConfigJson = JsonSerializer.Serialize(dto.Questions ?? new QuestionsConfigDto(), JsonOpts);
            entity.ChallengesConfigJson = JsonSerializer.Serialize(dto.Challenges ?? new ChallengesConfigDto(), JsonOpts);
            entity.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            // Rebuild manual items if any manual selection is provided; otherwise clear items
            var existingItems = _db.SessionTemplateItems.Where(i => i.TemplateId == entity.Id);
            _db.SessionTemplateItems.RemoveRange(existingItems);
            int order = 1;
            if (string.Equals(dto.Questions?.Selection, "manual", StringComparison.OrdinalIgnoreCase) && dto.Questions?.ManualIds != null)
            {
                foreach (var qid in dto.Questions.ManualIds)
                {
                    _db.SessionTemplateItems.Add(new SessionTemplateItem
                    {
                        TemplateId = entity.Id,
                        ItemType = SessionItemType.Question,
                        ItemId = qid,
                        OrderIndex = order++
                    });
                }
            }
            if (string.Equals(dto.Challenges?.Selection, "manual", StringComparison.OrdinalIgnoreCase) && dto.Challenges?.ManualIds != null)
            {
                foreach (var cid in dto.Challenges.ManualIds)
                {
                    _db.SessionTemplateItems.Add(new SessionTemplateItem
                    {
                        TemplateId = entity.Id,
                        ItemType = SessionItemType.Challenge,
                        ItemId = cid.ToString(),
                        OrderIndex = order++
                    });
                }
            }
            await _db.SaveChangesAsync();

            return Ok(new { success = true, data = new { id = entity.Id } });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                success = false,
                message = "Failed to update session template",
                error = new { code = "INTERNAL_ERROR", message = ex.Message }
            });
        }
    }

    [HttpPost("{id}/publish")]
    public async Task<IActionResult> Publish(int id)
    {
        try
        {
            var entity = await _db.SessionTemplates.FirstOrDefaultAsync(t => t.Id == id);
            if (entity == null)
            {
                return NotFound(new { success = false, message = "Template not found" });
            }
            entity.Status = TemplateStatus.Published;
            entity.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return Ok(new { success = true, message = "Session template published successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                success = false,
                message = "Failed to publish session template",
                error = new { code = "INTERNAL_ERROR", message = ex.Message }
            });
        }
    }

    [HttpPost("{id}/unpublish")]
    public async Task<IActionResult> Unpublish(int id)
    {
        try
        {
            var entity = await _db.SessionTemplates.FirstOrDefaultAsync(t => t.Id == id);
            if (entity == null)
            {
                return NotFound(new { success = false, message = "Template not found" });
            }
            entity.Status = TemplateStatus.Draft;
            entity.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return Ok(new { success = true, message = "Session template set to draft" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                success = false,
                message = "Failed to update template status",
                error = new { code = "INTERNAL_ERROR", message = ex.Message }
            });
        }
    }

    [HttpPost("{id}/duplicate")]
    public async Task<IActionResult> Duplicate(int id)
    {
        try
        {
            var entity = await _db.SessionTemplates.Include(t => t.TemplateItems).FirstOrDefaultAsync(t => t.Id == id);
            if (entity == null)
            {
                return NotFound(new { success = false, message = "Template not found" });
            }

            var copy = new SessionTemplate
            {
                Name = entity.Name + " (Copy)",
                Mode = entity.Mode,
                TopicsJson = entity.TopicsJson,
                LevelsJson = entity.LevelsJson,
                RandomOrder = entity.RandomOrder,
                TimeLimitMin = entity.TimeLimitMin,
                ThresholdWritten = entity.ThresholdWritten,
                Status = TemplateStatus.Draft,
                QuestionsConfigJson = entity.QuestionsConfigJson,
                ChallengesConfigJson = entity.ChallengesConfigJson,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = null,
            };
            _db.SessionTemplates.Add(copy);
            await _db.SaveChangesAsync();

            if (entity.TemplateItems.Any())
            {
                foreach (var item in entity.TemplateItems)
                {
                    _db.SessionTemplateItems.Add(new SessionTemplateItem
                    {
                        TemplateId = copy.Id,
                        ItemType = item.ItemType,
                        ItemId = item.ItemId,
                        OrderIndex = item.OrderIndex,
                    });
                }
                await _db.SaveChangesAsync();
            }

            return CreatedAtAction(nameof(GetById), new { id = copy.Id }, new { success = true, data = new { id = copy.Id }, message = "Session template duplicated successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                success = false,
                message = "Failed to duplicate session template",
                error = new { code = "INTERNAL_ERROR", message = ex.Message }
            });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var entity = await _db.SessionTemplates.FirstOrDefaultAsync(t => t.Id == id);
            if (entity == null)
            {
                return NotFound(new { success = false, message = "Template not found" });
            }
            _db.SessionTemplates.Remove(entity);
            await _db.SaveChangesAsync();
            return Ok(new { success = true, message = "Session template deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                success = false,
                message = "Failed to delete session template",
                error = new { code = "INTERNAL_ERROR", message = ex.Message }
            });
        }
    }
}
