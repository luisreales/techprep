namespace TechPrep.Core.Entities;

public class ChallengeTag
{
    public int CodeChallengeId { get; set; }
    public CodeChallenge CodeChallenge { get; set; } = default!;
    public int TagId { get; set; }
    public Tag Tag { get; set; } = default!;
}