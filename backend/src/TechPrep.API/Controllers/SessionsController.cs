using Microsoft.AspNetCore.Mvc;

namespace TechPrep.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SessionsController : ControllerBase
{
    [HttpPost]
    public IActionResult StartSession([FromBody] object payload) => NotImplemented();

    [HttpPost("{sessionId}/answers")]
    public IActionResult SubmitAnswer(string sessionId, [FromBody] object payload) => NotImplemented();

    [HttpGet("{sessionId}/summary")]
    public IActionResult GetSessionSummary(string sessionId) => NotImplemented();

    private IActionResult NotImplemented() => StatusCode(501, new { message = "Not implemented" });
}
