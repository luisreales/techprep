using Microsoft.AspNetCore.Mvc;
using TechPrep.Application.DTOs.Topic;
using TechPrep.Application.Interfaces;

namespace TechPrep.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TopicsController : ControllerBase
{
    private readonly ITopicService _topicService;

    public TopicsController(ITopicService topicService)
    {
        _topicService = topicService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllTopics()
    {
        var result = await _topicService.GetAllTopicsAsync();
        
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActiveTopics()
    {
        var result = await _topicService.GetActiveTopicsAsync();
        
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetTopicById(int id)
    {
        var result = await _topicService.GetTopicByIdAsync(id);
        
        if (!result.Success)
        {
            return result.Error?.Code == "TOPIC_NOT_FOUND" ? NotFound(result) : BadRequest(result);
        }

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateTopic([FromBody] CreateTopicDto createTopicDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _topicService.CreateTopicAsync(createTopicDto);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return CreatedAtAction(nameof(GetTopicById), new { id = result.Data!.Id }, result);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateTopic(int id, [FromBody] UpdateTopicDto updateTopicDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _topicService.UpdateTopicAsync(id, updateTopicDto);
        
        if (!result.Success)
        {
            return result.Error?.Code == "TOPIC_NOT_FOUND" ? NotFound(result) : BadRequest(result);
        }

        return Ok(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteTopic(int id)
    {
        var result = await _topicService.DeleteTopicAsync(id);
        
        if (!result.Success)
        {
            return result.Error?.Code == "TOPIC_NOT_FOUND" ? NotFound(result) : BadRequest(result);
        }

        return Ok(result);
    }
}