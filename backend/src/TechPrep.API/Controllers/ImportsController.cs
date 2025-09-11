using Microsoft.AspNetCore.Mvc;

namespace TechPrep.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImportsController : ControllerBase
{
    [HttpPost("questions/excel")]
    public IActionResult ImportQuestionsExcel() => NotImplemented();

    private IActionResult NotImplemented() => StatusCode(501, new { message = "Not implemented" });
}
