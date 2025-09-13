using System.ComponentModel.DataAnnotations;

namespace TechPrep.Application.DTOs;

public class BulkDeleteDto
{
    [Required]
    [MinLength(1, ErrorMessage = "At least one ID must be provided")]
    public List<Guid> Ids { get; set; } = new();
}

public class ExportQuestionsDto
{
    public List<Guid>? Ids { get; set; }
}