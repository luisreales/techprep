using System.ComponentModel.DataAnnotations;

namespace TechPrep.Application.DTOs;

public class UpdateProfileDto
{
    [Required]
    [StringLength(50)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [RegularExpression("^(en|es)$", ErrorMessage = "Language must be 'en' or 'es'")]
    public string Language { get; set; } = string.Empty;

    [Required]
    [RegularExpression("^(light|dark|blue)$", ErrorMessage = "Theme must be 'light', 'dark', or 'blue'")]
    public string Theme { get; set; } = string.Empty;
}