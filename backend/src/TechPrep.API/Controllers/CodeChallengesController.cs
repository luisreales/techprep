using Microsoft.AspNetCore.Mvc;

namespace TechPrep.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CodeChallengesController : ControllerBase
{
    [HttpGet]
    public IActionResult GetChallenges() => NotImplemented();

    private IActionResult NotImplemented() => StatusCode(501, new { message = "Not implemented" });
}
