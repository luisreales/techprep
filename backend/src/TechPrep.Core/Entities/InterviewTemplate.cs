using System.Text.Json;
using TechPrep.Core.Enums;

namespace TechPrep.Core.Entities;

public class InterviewTemplate
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TemplateKind Kind { get; set; }
    public VisibilityType VisibilityDefault { get; set; } = VisibilityType.Public;

    // Selection criteria
    public string SelectionCriteriaJson { get; set; } = "{}";

    // Timers
    public int? TotalTimeSec { get; set; }
    public int? PerQuestionTimeSec { get; set; }

    // Navigation
    public NavigationMode NavigationMode { get; set; } = NavigationMode.Free;
    public bool AllowPause { get; set; } = true;
    public int? MaxBacktracks { get; set; }

    // Feedback
    public FeedbackMode FeedbackMode { get; set; } = FeedbackMode.Immediate;

    // Aids
    public bool ShowHints { get; set; } = true;
    public bool ShowSources { get; set; } = true;
    public bool ShowGlossary { get; set; } = true;

    // Attempts
    public int MaxAttempts { get; set; } = 0; // 0 = unlimited
    public int CooldownHours { get; set; } = 0;

    // Integrity
    public bool RequireFullscreen { get; set; } = false;
    public bool BlockCopyPaste { get; set; } = false;
    public bool TrackFocusLoss { get; set; } = true;
    public bool ProctoringEnabled { get; set; } = false;

    // Certification
    public bool CertificationEnabled { get; set; } = false;

    // Credits
    public int InterviewCost { get; set; } = 1;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ICollection<SessionAssignment> Assignments { get; set; } = new List<SessionAssignment>();

    // Helper methods for JSON serialization
    public SelectionCriteria GetSelectionCriteria()
    {
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
        return JsonSerializer.Deserialize<SelectionCriteria>(SelectionCriteriaJson, options) ?? new SelectionCriteria();
    }

    public void SetSelectionCriteria(SelectionCriteria criteria)
    {
        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
        SelectionCriteriaJson = JsonSerializer.Serialize(criteria, options);
    }
}

public class SelectionCriteria
{
    public List<int> ByTopics { get; set; } = new();
    public List<string> Levels { get; set; } = new();
    public int CountSingle { get; set; } = 0;
    public int CountMulti { get; set; } = 0;
    public int CountWritten { get; set; } = 0;
}