using Microsoft.AspNetCore.Mvc;
using TechPrep.Application.DTOs.Common;
using TechPrep.Application.DTOs.PracticeInterview;
using TechPrep.Application.Interfaces;

namespace TechPrep.API.Controllers.Admin;

[ApiController]
[Route("api/[controller]")]
public class AdminAssignmentsController : ControllerBase
{
    private readonly ISessionAssignmentService _assignmentService;

    public AdminAssignmentsController(ISessionAssignmentService assignmentService)
    {
        _assignmentService = assignmentService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PaginatedResponse<AssignmentDto>>>> GetAssignments(
        [FromQuery] int? templateId = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _assignmentService.GetAssignmentsAsync(templateId, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<AssignmentDto>>> GetAssignment(int id)
    {
        var result = await _assignmentService.GetAssignmentByIdAsync(id);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<AssignmentDto>>> CreateAssignment([FromBody] CreateAssignmentDto createDto)
    {
        var result = await _assignmentService.CreateAssignmentAsync(createDto);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return CreatedAtAction(nameof(GetAssignment), new { id = result.Data!.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<AssignmentDto>>> UpdateAssignment(int id, [FromBody] UpdateAssignmentDto updateDto)
    {
        updateDto.Id = id;
        var result = await _assignmentService.UpdateAssignmentAsync(id, updateDto);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteAssignment(int id)
    {
        var result = await _assignmentService.DeleteAssignmentAsync(id);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }
}