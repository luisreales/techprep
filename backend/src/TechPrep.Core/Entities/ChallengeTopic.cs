namespace TechPrep.Core.Entities;

public class ChallengeTopic
{
    public int CodeChallengeId { get; set; }
    public CodeChallenge CodeChallenge { get; set; } = default!;
    public int TopicId { get; set; }
    public Topic Topic { get; set; } = default!;
}