using TechPrep.Core.Enums;

namespace TechPrep.Core.Entities;

public class CodeChallenge
{
    public int Id { get; set; }
    public string Title { get; set; } = default!;
    public ChallengeLanguage Language { get; set; }
    public ChallengeDifficulty Difficulty { get; set; }
    public string Prompt { get; set; } = default!; // Markdown
    public string? OfficialSolution { get; set; } // Optional
    public string? TestsJson { get; set; } // JSON of tests (string)
    public bool HasSolution => !string.IsNullOrWhiteSpace(OfficialSolution);
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public ICollection<ChallengeTag> Tags { get; set; } = new List<ChallengeTag>();
    public ICollection<ChallengeTopic> Topics { get; set; } = new List<ChallengeTopic>();
    public ICollection<ChallengeAttempt> Attempts { get; set; } = new List<ChallengeAttempt>();
}