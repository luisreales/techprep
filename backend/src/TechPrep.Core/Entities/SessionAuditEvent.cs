using TechPrep.Core.Enums;

namespace TechPrep.Core.Entities;

public class SessionAuditEvent
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string SessionType { get; set; } = string.Empty; // "practice" or "interview"
    public Guid SessionId { get; set; }
    public Guid UserId { get; set; }
    public AuditEventType EventType { get; set; }
    public string? MetaJson { get; set; } // Additional event-specific data
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual User User { get; set; } = null!;
}