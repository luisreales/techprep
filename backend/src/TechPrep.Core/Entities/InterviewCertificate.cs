namespace TechPrep.Core.Entities;

public class InterviewCertificate
{
    public int Id { get; set; }
    public string CertificateId { get; set; } = Guid.NewGuid().ToString(); // Public ID for verification
    public Guid InterviewSessionId { get; set; } // Foreign key
    public string SessionId { get; set; } = string.Empty; // String representation for external use
    public Guid UserId { get; set; }
    public int? TemplateId { get; set; }

    // Certificate content
    public string UserName { get; set; } = string.Empty;
    public string TemplateName { get; set; } = string.Empty;
    public int TotalScore { get; set; }
    public int MaxScore { get; set; }
    public double ScorePercentage { get; set; }
    public DateTime CompletedAt { get; set; }
    public int DurationMinutes { get; set; }

    // Topics and performance
    public string TopicsJson { get; set; } = string.Empty; // Serialized topic scores
    public string SkillsAssessedJson { get; set; } = string.Empty; // Skills demonstrated

    // Integrity information
    public bool HasIntegrityViolations { get; set; }
    public int IntegrityViolationsCount { get; set; }
    public string? IntegrityNotes { get; set; }

    // Metadata
    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
    public Guid IssuedByUserId { get; set; }
    public bool IsValid { get; set; } = true;
    public DateTime? RevokedAt { get; set; }
    public string? RevocationReason { get; set; }

    // File information
    public string? PdfFileName { get; set; }
    public string? PdfFilePath { get; set; }
    public long? PdfFileSize { get; set; }

    // Verification
    public string VerificationHash { get; set; } = string.Empty; // Hash for tamper detection
    public string VerificationUrl { get; set; } = string.Empty;
    public string QrCodeData { get; set; } = string.Empty;

    // Navigation properties
    public virtual InterviewSessionNew Session { get; set; } = null!;
    public virtual User User { get; set; } = null!;
    public virtual User IssuedByUser { get; set; } = null!;
    public virtual CertificateTemplate? Template { get; set; }
}