using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TechPrep.API.Controllers.Admin;

[ApiController]
[Route("api/admin/[controller]")]
[Authorize(Roles = "Admin")]
public class ImportController : ControllerBase
{
    [HttpPost("excel")]
    public async Task<IActionResult> ImportExcel(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "No file provided"
                });
            }

            // Validate file type
            var allowedExtensions = new[] { ".xlsx", ".xls" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            
            if (!allowedExtensions.Contains(fileExtension))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Invalid file format. Only Excel files (.xlsx, .xls) are allowed."
                });
            }

            // Validate file size (10MB max)
            const long maxFileSize = 10 * 1024 * 1024; // 10MB
            if (file.Length > maxFileSize)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "File size exceeds maximum allowed size (10MB)."
                });
            }

            // TODO: Implement Excel import logic using EPPlus
            // This is a placeholder implementation
            var result = new
            {
                fileName = file.FileName,
                fileSize = file.Length,
                importedQuestions = 0,
                errors = new string[0]
            };

            return Ok(new
            {
                success = true,
                data = result,
                message = "Excel file processed successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = "Failed to import Excel file",
                error = new { code = "IMPORT_ERROR", message = ex.Message }
            });
        }
    }

    [HttpGet("template")]
    public IActionResult DownloadTemplate()
    {
        try
        {
            // TODO: Generate and return Excel template
            // This is a placeholder implementation
            return Ok(new
            {
                success = true,
                message = "Template download feature coming soon"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = "Failed to download template",
                error = new { code = "TEMPLATE_ERROR", message = ex.Message }
            });
        }
    }
}