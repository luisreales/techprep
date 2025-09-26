namespace TechPrep.Core.Entities;

public class InterviewSessionNew
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public int AssignmentId { get; set; }
    public string Status { get; set; } = "Assigned"; // Assigned → InProgress → Submitted → Finalized
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? SubmittedAt { get; set; }
    public DateTime? FinalizedAt { get; set; }

    public int TotalScore { get; set; }
    public int TotalTimeSec { get; set; }
    public int CurrentQuestionIndex { get; set; }
    public bool CertificateIssued { get; set; }
    public int? ConsumedCreditLedgerId { get; set; }

    public int CorrectCount { get; set; }
    public int IncorrectCount { get; set; }
    public int TotalItems { get; set; }
    public int AttemptNumber { get; set; } = 1;
    public Guid? ParentSessionId { get; set; } // For tracking retakes

    // Navigation properties
    public virtual ICollection<InterviewAnswerNew> Answers { get; set; } = new List<InterviewAnswerNew>();
}