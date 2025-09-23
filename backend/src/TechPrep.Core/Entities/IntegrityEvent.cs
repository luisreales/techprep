using TechPrep.Core.Enums;

namespace TechPrep.Core.Entities;

public class IntegrityEvent
{
    public int Id { get; set; }
    public string SessionId { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public IntegrityViolationType Type { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string? Details { get; set; } // JSON metadata
    public int ViolationCount { get; set; } // Running count for this violation type
    public bool WasWarningShown { get; set; } = false;
    public bool CausedAutoSubmit { get; set; } = false;

    // Browser/environment info
    public string? UserAgent { get; set; }
    public string? IpAddress { get; set; }
    public string? WindowSize { get; set; }
    public string? ScreenSize { get; set; }

    // Navigation properties
    public virtual InterviewSessionNew Session { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}