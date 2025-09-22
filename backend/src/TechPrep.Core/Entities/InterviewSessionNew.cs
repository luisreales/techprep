using TechPrep.Core.Enums;

namespace TechPrep.Core.Entities;

public class InterviewSessionNew
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public int AssignmentId { get; set; }
    public SessionStatus Status { get; set; } = SessionStatus.NotStarted;
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? SubmittedAt { get; set; }
    public int TotalScore { get; set; } = 0;
    public int TotalTimeSec { get; set; } = 0;
    public int CurrentQuestionIndex { get; set; } = 0;
    public bool CertificateIssued { get; set; } = false;
    public Guid? ConsumedCreditLedgerId { get; set; }

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual SessionAssignment Assignment { get; set; } = null!;
    public virtual ICollection<InterviewAnswerNew> Answers { get; set; } = new List<InterviewAnswerNew>();
    public virtual ICollection<SessionAuditEvent> AuditEvents { get; set; } = new List<SessionAuditEvent>();
    public virtual InterviewCertificate? Certificate { get; set; }
    public virtual CreditLedger? ConsumedCredit { get; set; }
}