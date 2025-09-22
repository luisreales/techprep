using Microsoft.AspNetCore.Mvc;
using TechPrep.Application.DTOs.Common;
using TechPrep.Application.DTOs.PracticeInterview;
using TechPrep.Application.Interfaces;
using TechPrep.Core.Enums;

namespace TechPrep.API.Controllers.Admin;

[ApiController]
[Route("api/templates")]
public class AdminTemplatesController : ControllerBase
{
    private readonly IInterviewTemplateService _templateService;

    public AdminTemplatesController(IInterviewTemplateService templateService)
    {
        _templateService = templateService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PaginatedResponse<TemplateDto>>>> GetTemplates(
        [FromQuery] string? kind = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        TemplateKind? templateKind = null;
        if (!string.IsNullOrWhiteSpace(kind))
        {
            if (!Enum.TryParse(kind, true, out TemplateKind parsedKind))
            {
                return BadRequest(ApiResponse<PaginatedResponse<TemplateDto>>.ErrorResponse(
                    "INVALID_KIND",
                    "Invalid template kind specified"));
            }

            templateKind = parsedKind;
        }

        var result = await _templateService.GetTemplatesAsync(templateKind, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<TemplateDto>>> GetTemplate(int id)
    {
        var result = await _templateService.GetTemplateByIdAsync(id);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<TemplateDto>>> CreateTemplate([FromBody] CreateTemplateDto createDto)
    {
        var result = await _templateService.CreateTemplateAsync(createDto);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return CreatedAtAction(nameof(GetTemplate), new { id = result.Data!.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<TemplateDto>>> UpdateTemplate(int id, [FromBody] UpdateTemplateDto updateDto)
    {
        updateDto.Id = id;
        var result = await _templateService.UpdateTemplateAsync(id, updateDto);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteTemplate(int id)
    {
        var result = await _templateService.DeleteTemplateAsync(id);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPost("{id}/clone")]
    public async Task<ActionResult<ApiResponse<TemplateDto>>> CloneTemplate(int id, [FromBody] string newName)
    {
        var result = await _templateService.CloneTemplateAsync(id, newName);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return CreatedAtAction(nameof(GetTemplate), new { id = result.Data!.Id }, result);
    }

    [HttpGet("{id}/preview")]
    public async Task<ActionResult<ApiResponse<int>>> GetTemplatePreview(int id)
    {
        var result = await _templateService.GetEligibleQuestionsCountAsync(id);
        return Ok(result);
    }
}
