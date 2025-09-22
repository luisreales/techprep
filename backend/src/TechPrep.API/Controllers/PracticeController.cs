using Microsoft.AspNetCore.Mvc;
using TechPrep.Application.DTOs.Common;
using TechPrep.Application.DTOs.PracticeInterview;
using TechPrep.Application.Interfaces;
using TechPrep.Core.Enums;
using System.Security.Claims;

namespace TechPrep.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PracticeController : ControllerBase
{
    private readonly IPracticeSessionService _practiceSessionService;
    private readonly ISessionAssignmentService _assignmentService;

    public PracticeController(
        IPracticeSessionService practiceSessionService,
        ISessionAssignmentService assignmentService)
    {
        _practiceSessionService = practiceSessionService;
        _assignmentService = assignmentService;
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim ?? throw new UnauthorizedAccessException("User not authenticated"));
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PaginatedResponse<AssignmentDto>>>> GetAvailablePractices(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var userId = GetCurrentUserId();
        var result = await _assignmentService.GetMyAssignmentsAsync(userId, TemplateKind.Practice, page, pageSize);
        return Ok(result);
    }

    [HttpPost("start")]
    public async Task<ActionResult<ApiResponse<PracticeSessionDto>>> StartPractice([FromBody] StartPracticeDto startDto)
    {
        var userId = GetCurrentUserId();
        var result = await _practiceSessionService.StartPracticeAsync(userId, startDto);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPost("{sessionId}/answer")]
    public async Task<ActionResult<ApiResponse<PracticeAnswerDto>>> SubmitAnswer(
        Guid sessionId,
        [FromBody] SubmitAnswerDto answerDto)
    {
        var result = await _practiceSessionService.SubmitAnswerAsync(sessionId, answerDto);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPatch("{sessionId}/state")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateSessionState(
        Guid sessionId,
        [FromBody] SessionStateDto stateDto)
    {
        var result = await _practiceSessionService.UpdateSessionStateAsync(sessionId, stateDto);
        return Ok(result);
    }

    [HttpPost("{sessionId}/submit")]
    public async Task<ActionResult<ApiResponse<PracticeSessionDto>>> SubmitPractice(Guid sessionId)
    {
        var result = await _practiceSessionService.SubmitPracticeAsync(sessionId);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpGet("{sessionId}")]
    public async Task<ActionResult<ApiResponse<PracticeSessionDto>>> GetSession(Guid sessionId)
    {
        var result = await _practiceSessionService.GetSessionAsync(sessionId);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    [HttpPost("{sessionId}/pause")]
    public async Task<ActionResult<ApiResponse<PracticeSessionDto>>> PauseSession(Guid sessionId)
    {
        var result = await _practiceSessionService.PauseSessionAsync(sessionId);
        return Ok(result);
    }

    [HttpPost("{sessionId}/resume")]
    public async Task<ActionResult<ApiResponse<PracticeSessionDto>>> ResumeSession(Guid sessionId)
    {
        var result = await _practiceSessionService.ResumeSessionAsync(sessionId);
        return Ok(result);
    }

    [HttpGet("my-sessions")]
    public async Task<ActionResult<ApiResponse<PaginatedResponse<PracticeSessionDto>>>> GetMySessions(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var userId = GetCurrentUserId();
        var result = await _practiceSessionService.GetMySessionsAsync(userId, page, pageSize);
        return Ok(result);
    }
}