using Microsoft.AspNetCore.Mvc;
using TechPrep.Application.DTOs.Common;
using TechPrep.Application.DTOs.PracticeInterview;
using TechPrep.Application.Interfaces;

namespace TechPrep.API.Controllers.Admin;

[ApiController]
[Route("api/[controller]")]
public class AdminGroupsController : ControllerBase
{
    private readonly IGroupService _groupService;

    public AdminGroupsController(IGroupService groupService)
    {
        _groupService = groupService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PaginatedResponse<GroupDto>>>> GetGroups(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _groupService.GetGroupsAsync(page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<GroupDetailDto>>> GetGroup(int id)
    {
        var result = await _groupService.GetGroupByIdAsync(id);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<GroupDto>>> CreateGroup([FromBody] CreateGroupDto createDto)
    {
        var result = await _groupService.CreateGroupAsync(createDto);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return CreatedAtAction(nameof(GetGroup), new { id = result.Data!.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<GroupDto>>> UpdateGroup(int id, [FromBody] UpdateGroupDto updateDto)
    {
        updateDto.Id = id;
        var result = await _groupService.UpdateGroupAsync(id, updateDto);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteGroup(int id)
    {
        var result = await _groupService.DeleteGroupAsync(id);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPost("{id}/members")]
    public async Task<ActionResult<ApiResponse<object>>> AddMembers(int id, [FromBody] AddGroupMembersDto membersDto)
    {
        var result = await _groupService.AddMembersAsync(id, membersDto);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpDelete("{id}/members")]
    public async Task<ActionResult<ApiResponse<object>>> RemoveMembers(int id, [FromBody] RemoveGroupMembersDto membersDto)
    {
        var result = await _groupService.RemoveMembersAsync(id, membersDto);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }
}