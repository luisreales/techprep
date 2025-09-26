using TechPrep.Core.Enums;

namespace TechPrep.Application.DTOs.PracticeInterview;

public class TemplateDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TemplateKind Kind { get; set; }
    public VisibilityType VisibilityDefault { get; set; }
    public SelectionCriteriaDto Selection { get; set; } = new();
    public TimersDto Timers { get; set; } = new();
    public NavigationDto Navigation { get; set; } = new();
    public FeedbackDto Feedback { get; set; } = new();
    public AidsDto Aids { get; set; } = new();
    public AttemptsDto Attempts { get; set; } = new();
    public IntegrityDto Integrity { get; set; } = new();
    public CertificationDto Certification { get; set; } = new();
    public CreditsDto Credits { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateTemplateDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TemplateKind Kind { get; set; }
    public VisibilityType VisibilityDefault { get; set; } = VisibilityType.Public;
    public SelectionCriteriaDto Selection { get; set; } = new();
    public TimersDto Timers { get; set; } = new();
    public NavigationDto Navigation { get; set; } = new();
    public FeedbackDto Feedback { get; set; } = new();
    public AidsDto Aids { get; set; } = new();
    public AttemptsDto Attempts { get; set; } = new();
    public IntegrityDto Integrity { get; set; } = new();
    public CertificationDto Certification { get; set; } = new();
    public CreditsDto Credits { get; set; } = new();
}

public class UpdateTemplateDto : CreateTemplateDto
{
    public int Id { get; set; }
}

public class UserAssignedTemplateDto : TemplateDto
{
    public int AssignmentId { get; set; }
}

public class SelectionCriteriaDto
{
    public List<int> ByTopics { get; set; } = new();
    public List<string> Levels { get; set; } = new();
    public int CountSingle { get; set; } = 0;
    public int CountMulti { get; set; } = 0;
    public int CountWritten { get; set; } = 0;
}

public class TimersDto
{
    public int? TotalSec { get; set; }
    public int? PerQuestionSec { get; set; }
}

public class NavigationDto
{
    public NavigationMode Mode { get; set; } = NavigationMode.Free;
    public bool AllowPause { get; set; } = true;
    public int? MaxBacktracks { get; set; }
}

public class FeedbackDto
{
    public FeedbackMode Mode { get; set; } = FeedbackMode.Immediate;
}

public class AidsDto
{
    public bool ShowHints { get; set; } = true;
    public bool ShowSources { get; set; } = true;
    public bool ShowGlossary { get; set; } = true;
}

public class AttemptsDto
{
    public int Max { get; set; } = 0; // 0 = unlimited
    public int CooldownHours { get; set; } = 0;
}

public class IntegrityDto
{
    public bool RequireFullscreen { get; set; } = false;
    public bool BlockCopyPaste { get; set; } = false;
    public bool TrackFocusLoss { get; set; } = true;
    public bool Proctoring { get; set; } = false;
}

public class CertificationDto
{
    public bool Enabled { get; set; } = false;
}

public class CreditsDto
{
    public int InterviewCost { get; set; } = 1;
}