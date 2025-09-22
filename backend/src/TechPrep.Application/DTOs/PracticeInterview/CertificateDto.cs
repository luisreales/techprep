namespace TechPrep.Application.DTOs.PracticeInterview;

public class CertificateDto
{
    public Guid Id { get; set; }
    public Guid InterviewSessionId { get; set; }
    public string CertificateNumber { get; set; } = string.Empty;
    public string VerificationUrl { get; set; } = string.Empty;
    public string QrCodeData { get; set; } = string.Empty;
    public DateTime IssuedAt { get; set; }
    public bool IsValid { get; set; }

    // Additional data for certificate display
    public string UserName { get; set; } = string.Empty;
    public string TemplateName { get; set; } = string.Empty;
    public int TotalScore { get; set; }
    public DateTime CompletedAt { get; set; }
}