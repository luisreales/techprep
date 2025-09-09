namespace TechPrep.Application.DTOs.Topic;

public class TopicDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int QuestionCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateTopicDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class UpdateTopicDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}