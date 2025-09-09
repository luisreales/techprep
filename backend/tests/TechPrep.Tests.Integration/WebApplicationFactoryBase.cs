using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TechPrep.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using TechPrep.Core.Entities;

namespace TechPrep.Tests.Integration;

public class TechPrepWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remove existing database registration
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<TechPrepDbContext>));
            
            if (descriptor != null)
                services.Remove(descriptor);

            // Add In-Memory database for testing
            services.AddDbContext<TechPrepDbContext>(options =>
            {
                options.UseInMemoryDatabase("TestDatabase" + Guid.NewGuid());
            });

            // Build service provider and seed database
            var serviceProvider = services.BuildServiceProvider();
            
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<TechPrepDbContext>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
            
            // Ensure database is created
            context.Database.EnsureCreated();
            
            // Seed test data
            SeedTestData(context, userManager).GetAwaiter().GetResult();
        });
    }

    private static async Task SeedTestData(TechPrepDbContext context, UserManager<User> userManager)
    {
        if (await context.Topics.AnyAsync())
            return; // Already seeded

        // Seed topics
        var topics = new List<Topic>
        {
            new() { Id = 1, Name = "JavaScript", Description = "JavaScript programming" },
            new() { Id = 2, Name = "React", Description = "React framework" },
            new() { Id = 3, Name = "C#", Description = "C# programming language" }
        };

        await context.Topics.AddRangeAsync(topics);
        await context.SaveChangesAsync();

        // Seed questions
        var questions = new List<Question>
        {
            new()
            {
                Id = Guid.NewGuid(),
                TopicId = 1,
                Text = "What is JavaScript?",
                Type = Core.Enums.QuestionType.Written,
                Level = Core.Enums.DifficultyLevel.Basic,
                OfficialAnswer = "JavaScript is a programming language"
            },
            new()
            {
                Id = Guid.NewGuid(),
                TopicId = 2,
                Text = "What is React?",
                Type = Core.Enums.QuestionType.SingleChoice,
                Level = Core.Enums.DifficultyLevel.Basic
            }
        };

        await context.Questions.AddRangeAsync(questions);

        // Add options for the single choice question
        var singleChoiceQuestion = questions.First(q => q.Type == Core.Enums.QuestionType.SingleChoice);
        var options = new List<QuestionOption>
        {
            new() { Id = Guid.NewGuid(), QuestionId = singleChoiceQuestion.Id, Text = "A library", IsCorrect = true, OrderIndex = 1 },
            new() { Id = Guid.NewGuid(), QuestionId = singleChoiceQuestion.Id, Text = "A database", IsCorrect = false, OrderIndex = 2 },
            new() { Id = Guid.NewGuid(), QuestionId = singleChoiceQuestion.Id, Text = "A server", IsCorrect = false, OrderIndex = 3 }
        };

        await context.QuestionOptions.AddRangeAsync(options);
        await context.SaveChangesAsync();

        // Seed test user
        var testUser = new User
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            UserName = "test@example.com",
            FirstName = "Test",
            LastName = "User",
            Role = Core.Enums.UserRole.Student,
            EmailConfirmed = true
        };

        await userManager.CreateAsync(testUser, "Test123!");
    }
}