namespace TechPrep.Core.Entities;

public class ProctoringPolicy
{
    public int Id { get; set; }
    public int TemplateId { get; set; }

    // Fullscreen requirements
    public bool RequireFullscreen { get; set; } = false;
    public int MaxFullscreenViolations { get; set; } = 3;
    public bool AutoSubmitOnFullscreenViolations { get; set; } = false;

    // Focus monitoring
    public bool TrackFocusLoss { get; set; } = true;
    public int MaxFocusLossViolations { get; set; } = 5;
    public bool AutoSubmitOnFocusViolations { get; set; } = false;

    // Copy/paste restrictions
    public bool BlockCopyPaste { get; set; } = false;
    public bool TrackCopyPasteAttempts { get; set; } = true;

    // Tab switching
    public bool TrackTabSwitching { get; set; } = true;
    public int MaxTabSwitchViolations { get; set; } = 3;

    // Right-click and developer tools
    public bool BlockRightClick { get; set; } = false;
    public bool BlockDevTools { get; set; } = true;

    // Screen recording/screenshot detection
    public bool DetectScreenRecording { get; set; } = false;
    public bool WarnOnScreenRecording { get; set; } = true;

    // Navigation restrictions
    public bool BlockNavigation { get; set; } = true;
    public bool AllowRefresh { get; set; } = false;

    // Timing
    public int ViolationGracePeriodSec { get; set; } = 10;

    // Actions
    public bool EmailNotifyOnViolations { get; set; } = true;
    public string? ViolationNotificationEmails { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public virtual SessionTemplate Template { get; set; } = null!;
    public virtual ICollection<IntegrityEvent> IntegrityEvents { get; set; } = new List<IntegrityEvent>();
}