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
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual ICollection<InterviewSession> InterviewSessions { get; set; } = new List<InterviewSession>();
}