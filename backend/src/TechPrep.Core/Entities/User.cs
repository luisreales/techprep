using Microsoft.AspNetCore.Identity;
using TechPrep.Core.Enums;

namespace TechPrep.Core.Entities;

public class User : IdentityUser<Guid>
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Student;
    public string? Specialization { get; set; }
    public int? YearsOfExperience { get; set; }
    public decimal MatchingThreshold { get; set; } = 80.0m;
    public string Language { get; set; } = "en";
    public string Theme { get; set; } = "light";
    public string? AvatarUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public int PracticeStreakDays { get; set; }
    public int PracticeTotalQuestions { get; set; }
    public int PracticeCorrectAnswers { get; set; }
    public DateTime? LastPracticeDate { get; set; }
    public string PracticeRank { get; set; } = "Beginner";
    
    // Navigation properties
}
