using Microsoft.AspNetCore.Mvc;
using TechPrep.Application.DTOs.Question;
using TechPrep.Application.Interfaces;

namespace TechPrep.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuestionsController : ControllerBase
{
    private readonly IQuestionService _questionService;

    public QuestionsController(IQuestionService questionService)
    {
        _questionService = questionService;
    }

    [HttpGet]
    public async Task<IActionResult> GetQuestions([FromQuery] QuestionFilterDto filter)
    {
        var result = await _questionService.GetQuestionsAsync(filter);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetQuestionById(Guid id)
    {
        var result = await _questionService.GetQuestionByIdAsync(id);
        
        if (!result.Success)
        {
            return result.Error?.Code == "QUESTION_NOT_FOUND" ? NotFound(result) : BadRequest(result);
        }

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateQuestion([FromBody] CreateQuestionDto createQuestionDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _questionService.CreateQuestionAsync(createQuestionDto);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return CreatedAtAction(nameof(GetQuestionById), new { id = result.Data!.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateQuestion(Guid id, [FromBody] CreateQuestionDto updateQuestionDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _questionService.UpdateQuestionAsync(id, updateQuestionDto);
        
        if (!result.Success)
        {
            return result.Error?.Code == "QUESTION_NOT_FOUND" ? NotFound(result) : BadRequest(result);
        }

        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteQuestion(Guid id)
    {
        var result = await _questionService.DeleteQuestionAsync(id);
        
        if (!result.Success)
        {
            return result.Error?.Code == "QUESTION_NOT_FOUND" ? NotFound(result) : BadRequest(result);
        }

        return Ok(result);
    }
}