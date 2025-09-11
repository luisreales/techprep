using Microsoft.AspNetCore.Mvc;

namespace TechPrep.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ResourcesController : ControllerBase
{
    [HttpGet]
    public IActionResult GetResources() => NotImplemented();

    private IActionResult NotImplemented() => StatusCode(501, new { message = "Not implemented" });
}
