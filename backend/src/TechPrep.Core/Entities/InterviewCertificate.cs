namespace TechPrep.Core.Entities;

public class InterviewCertificate
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid InterviewSessionId { get; set; }
    public string CertificateNumber { get; set; } = string.Empty;
    public string VerificationUrl { get; set; } = string.Empty;
    public string QrCodeData { get; set; } = string.Empty;
    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
    public bool IsValid { get; set; } = true;

    // Navigation properties
    public virtual InterviewSessionNew InterviewSession { get; set; } = null!;
}