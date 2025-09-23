namespace TechPrep.Core.Entities;

public class CertificateTemplate
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsDefault { get; set; } = false;
    public bool IsActive { get; set; } = true;

    // Template configuration
    public string HeaderHtml { get; set; } = string.Empty; // HTML template for header
    public string BodyHtml { get; set; } = string.Empty; // HTML template for body
    public string FooterHtml { get; set; } = string.Empty; // HTML template for footer
    public string CssStyles { get; set; } = string.Empty; // Custom CSS

    // Colors and branding
    public string PrimaryColor { get; set; } = "#1E40AF";
    public string SecondaryColor { get; set; } = "#64748B";
    public string LogoUrl { get; set; } = string.Empty;
    public string CompanyName { get; set; } = "TechPrep";

    // Layout settings
    public string PageSize { get; set; } = "A4"; // A4, Letter, etc.
    public string Orientation { get; set; } = "Portrait"; // Portrait, Landscape
    public string FontFamily { get; set; } = "Arial, sans-serif";

    // Content settings
    public bool ShowScore { get; set; } = true;
    public bool ShowDuration { get; set; } = true;
    public bool ShowTopicBreakdown { get; set; } = true;
    public bool ShowIntegrityStatus { get; set; } = true;
    public bool ShowQrCode { get; set; } = true;
    public bool ShowVerificationUrl { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public virtual ICollection<InterviewCertificate> Certificates { get; set; } = new List<InterviewCertificate>();
}