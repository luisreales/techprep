namespace TechPrep.Core.Entities;

public class QuestionKeyword
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid QuestionId { get; set; }
    public string Text { get; set; } = string.Empty;
    public decimal Weight { get; set; } = 1.0m;
    public bool IsRequired { get; set; } = false;

    // Navigation properties
    public virtual Question Question { get; set; } = null!;
}