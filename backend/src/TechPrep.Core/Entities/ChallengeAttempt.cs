namespace TechPrep.Core.Entities;

public class ChallengeAttempt
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public int CodeChallengeId { get; set; }
    public string? SubmittedCode { get; set; }
    public bool? MarkedSolved { get; set; }
    public int? Score { get; set; } // Future (if we evaluate)
    public string? Notes { get; set; }
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? FinishedAt { get; set; }
    
    // Navigation properties
    public CodeChallenge CodeChallenge { get; set; } = default!;
}