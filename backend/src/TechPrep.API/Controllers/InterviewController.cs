using Microsoft.AspNetCore.Mvc;
using TechPrep.Application.DTOs.Common;
using TechPrep.Application.DTOs.PracticeInterview;
using TechPrep.Application.DTOs;
using TechPrep.Application.Interfaces;
using TechPrep.Core.Enums;
using System.Security.Claims;

namespace TechPrep.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InterviewController : ControllerBase
{
    private readonly IInterviewSessionService _interviewSessionService;
    private readonly ISessionAssignmentService _assignmentService;
    private readonly ICreditService _creditService;

    public InterviewController(
        IInterviewSessionService interviewSessionService,
        ISessionAssignmentService assignmentService,
        ICreditService creditService)
    {
        _interviewSessionService = interviewSessionService;
        _assignmentService = assignmentService;
        _creditService = creditService;
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim ?? throw new UnauthorizedAccessException("User not authenticated"));
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PaginatedResponse<AssignmentDto>>>> GetAvailableInterviews(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var userId = GetCurrentUserId();
        var result = await _assignmentService.GetMyAssignmentsAsync(userId, TemplateKind.Interview, page, pageSize);
        return Ok(result);
    }

    [HttpGet("credits")]
    public async Task<ActionResult<ApiResponse<UserCreditsDto>>> GetMyCredits()
    {
        var userId = GetCurrentUserId();
        var result = await _creditService.GetUserCreditsAsync(userId);
        return Ok(result);
    }

    [HttpPost("start")]
    public async Task<ActionResult<ApiResponse<InterviewSessionDto>>> StartInterview([FromBody] StartInterviewDto startDto)
    {
        var userId = GetCurrentUserId();

        // Check if user has sufficient credits
        var creditsCheck = await _creditService.HasSufficientCreditsAsync(userId, 1);
        if (!creditsCheck.Success || !creditsCheck.Data)
        {
            return StatusCode(402, ApiResponse<object>.ErrorResponse(
                "INSUFFICIENT_CREDITS",
                "Insufficient credits to start interview",
                "Please purchase more credits to continue"));
        }

        var result = await _interviewSessionService.StartInterviewAsync(userId, startDto);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPost("{sessionId}/answer")]
    public async Task<ActionResult<ApiResponse<object>>> SubmitAnswer(
        Guid sessionId,
        [FromBody] SubmitAnswerDto answerDto)
    {
        var result = await _interviewSessionService.SubmitAnswerAsync(sessionId, answerDto);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPost("{sessionId}/submit")]
    public async Task<ActionResult<ApiResponse<InterviewSessionDto>>> SubmitInterview(Guid sessionId)
    {
        var result = await _interviewSessionService.SubmitInterviewAsync(sessionId);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpGet("{sessionId}")]
    public async Task<ActionResult<ApiResponse<InterviewSessionDto>>> GetSession(Guid sessionId)
    {
        var result = await _interviewSessionService.GetSessionAsync(sessionId);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    [HttpPost("{sessionId}/events")]
    public async Task<ActionResult<ApiResponse<object>>> RecordAuditEvent(
        Guid sessionId,
        [FromBody] AuditEventDto eventDto)
    {
        var result = await _interviewSessionService.RecordAuditEventAsync(sessionId, eventDto);
        return Ok(result);
    }

    [HttpGet("{sessionId}/certificate")]
    public async Task<ActionResult<ApiResponse<CertificateDto>>> GetCertificate(Guid sessionId)
    {
        var result = await _interviewSessionService.GetCertificateAsync(sessionId);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    [HttpGet("my-sessions")]
    public async Task<ActionResult<ApiResponse<PaginatedResponse<InterviewSessionDto>>>> GetMySessions(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var userId = GetCurrentUserId();
        var result = await _interviewSessionService.GetMySessionsAsync(userId, page, pageSize);
        return Ok(result);
    }

    // New interview state management endpoints
    [HttpPost("sessions/{sessionId}/finish")]
    public async Task<ActionResult<ApiResponse<InterviewSessionDto>>> FinishInterview(Guid sessionId)
    {
        var result = await _interviewSessionService.FinishInterviewAsync(sessionId);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPost("sessions/{sessionId}/finalize")]
    public async Task<ActionResult<ApiResponse<InterviewSessionDto>>> FinalizeInterview(Guid sessionId)
    {
        var result = await _interviewSessionService.FinalizeInterviewAsync(sessionId);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpGet("sessions/{sessionId}/summary")]
    public async Task<ActionResult<ApiResponse<InterviewSummaryDto>>> GetInterviewSummary(Guid sessionId)
    {
        var result = await _interviewSessionService.GetInterviewSummaryAsync(sessionId);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    [HttpGet("sessions/mine")]
    public async Task<ActionResult<ApiResponse<List<InterviewSessionListDto>>>> GetMyInterviewSessions()
    {
        var userId = GetCurrentUserId();
        var result = await _interviewSessionService.GetMyInterviewSessionsAsync(userId);
        return Ok(result);
    }

    [HttpPost("sessions/{sessionId}/retake")]
    public async Task<ActionResult<ApiResponse<InterviewRetakeDto>>> RetakeInterview(Guid sessionId)
    {
        var result = await _interviewSessionService.RetakeInterviewAsync(sessionId);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }
}