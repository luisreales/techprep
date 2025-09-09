using Microsoft.EntityFrameworkCore;
using Moq;
using TechPrep.Core.Interfaces;
using TechPrep.Infrastructure.Data;

namespace TechPrep.Tests.Unit.Helpers;

public static class MockHelper
{
    public static Mock<IUnitOfWork> CreateMockUnitOfWork()
    {
        var mockUnitOfWork = new Mock<IUnitOfWork>();
        mockUnitOfWork.Setup(u => u.Topics).Returns(new Mock<ITopicRepository>().Object);
        mockUnitOfWork.Setup(u => u.Questions).Returns(new Mock<IQuestionRepository>().Object);
        mockUnitOfWork.Setup(u => u.InterviewSessions).Returns(new Mock<IInterviewSessionRepository>().Object);
        mockUnitOfWork.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);
        return mockUnitOfWork;
    }

    public static Mock<T> CreateMockRepository<T>() where T : class
    {
        return new Mock<T>();
    }

    public static TechPrepDbContext CreateInMemoryDbContext(string? databaseName = null)
    {
        var options = new DbContextOptionsBuilder<TechPrepDbContext>()
            .UseInMemoryDatabase(databaseName ?? Guid.NewGuid().ToString())
            .Options;

        return new TechPrepDbContext(options);
    }

    public static async Task<TechPrepDbContext> CreateSeededInMemoryDbContext(string? databaseName = null)
    {
        var context = CreateInMemoryDbContext(databaseName);
        
        // Seed with test data
        var topics = TestDataHelper.CreateTestTopics(3);
        await context.Topics.AddRangeAsync(topics);
        await context.SaveChangesAsync();

        foreach (var topic in topics)
        {
            var questions = TestDataHelper.CreateTestQuestions(topic.Id, 2);
            await context.Questions.AddRangeAsync(questions);
        }
        await context.SaveChangesAsync();

        return context;
    }
}