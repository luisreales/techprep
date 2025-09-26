using TechPrep.Core.Entities;
using TechPrep.Core.Enums;

namespace TechPrep.Tests.Unit.Helpers;

public static class TestDataHelper
{
    public static Topic CreateTestTopic(int id = 1, string name = "Test Topic")
    {
        return new Topic
        {
            Id = id,
            Name = name,
            Description = $"Description for {name}",
            CreatedAt = DateTime.UtcNow
        };
    }

    public static Question CreateTestQuestion(Guid? id = null, int topicId = 1, QuestionType type = QuestionType.Written)
    {
        return new Question
        {
            Id = id ?? Guid.NewGuid(),
            TopicId = topicId,
            Text = "What is the test question?",
            Type = type,
            Level = DifficultyLevel.Basic,
            OfficialAnswer = type == QuestionType.Written ? "This is the official answer" : null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public static QuestionOption CreateTestQuestionOption(Guid questionId, bool isCorrect = false, int orderIndex = 1)
    {
        return new QuestionOption
        {
            Id = Guid.NewGuid(),
            QuestionId = questionId,
            Text = $"Option {orderIndex}",
            IsCorrect = isCorrect,
            OrderIndex = orderIndex
        };
    }

    public static User CreateTestUser(Guid? id = null, string email = "test@example.com", UserRole role = UserRole.Student)
    {
        return new User
        {
            Id = id ?? Guid.NewGuid(),
            Email = email,
            UserName = email,
            FirstName = "Test",
            LastName = "User",
            Role = role,
            MatchingThreshold = 80.0m,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public static InterviewSessionNew CreateTestInterviewSession(Guid userId, int assignmentId = 1)
    {
        return new InterviewSessionNew
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            AssignmentId = assignmentId,
            Status = Core.Enums.SessionStatus.InProgress,
            TotalItems = 10,
            CorrectCount = 0,
            IncorrectCount = 0,
            TotalScore = 0,
            StartedAt = DateTime.UtcNow
        };
    }

    public static InterviewAnswerNew CreateTestInterviewAnswer(Guid sessionId, Guid questionId)
    {
        return new InterviewAnswerNew
        {
            Id = Guid.NewGuid(),
            InterviewSessionId = sessionId,
            QuestionId = questionId,
            GivenAnswer = "Test answer",
            GivenText = "Test answer",
            IsCorrect = true,
            MatchPercentage = 85.0m,
            TimeMs = 30000,
            TimeSpentSec = 30,
            AnsweredAt = DateTime.UtcNow
        };
    }

    public static LearningResource CreateTestLearningResource(Guid questionId)
    {
        return new LearningResource
        {
            Id = 1, // Changed from Guid to int
            Kind = Core.Enums.ResourceKind.Article,
            Title = "Test Resource",
            Url = "https://example.com/resource",
            Description = "Test learning resource description",
            CreatedAt = DateTime.UtcNow
            // Note: QuestionId removed - associations handled by QuestionResource junction table
        };
    }

    public static List<Topic> CreateTestTopics(int count = 3)
    {
        var topics = new List<Topic>();
        for (int i = 1; i <= count; i++)
        {
            topics.Add(CreateTestTopic(i, $"Topic {i}"));
        }
        return topics;
    }

    public static List<Question> CreateTestQuestions(int topicId, int count = 5)
    {
        var questions = new List<Question>();
        for (int i = 0; i < count; i++)
        {
            var type = (i % 3) switch
            {
                0 => QuestionType.Written,
                1 => QuestionType.SingleChoice,
                _ => QuestionType.MultiChoice
            };
            
            questions.Add(CreateTestQuestion(null, topicId, type));
        }
        return questions;
    }
}