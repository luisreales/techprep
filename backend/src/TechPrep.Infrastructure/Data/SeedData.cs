using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TechPrep.Core.Entities;
using TechPrep.Core.Enums;

namespace TechPrep.Infrastructure.Data;

public static class SeedData
{
    public static async Task SeedAsync(TechPrepDbContext context, UserManager<User> userManager)
    {
        // Seed Topics
    if (!await context.Topics.AnyAsync())
        {
            var topics = new List<Topic>
            {
                new Topic { Name = "JavaScript", Description = "JavaScript programming language fundamentals" },
                new Topic { Name = "React", Description = "React library for building user interfaces" },
                new Topic { Name = "Node.js", Description = "Node.js runtime environment" },
                new Topic { Name = ".NET", Description = ".NET framework and C# programming" },
                new Topic { Name = "Python", Description = "Python programming language" },
                new Topic { Name = "SQL", Description = "Structured Query Language and database concepts" },
                new Topic { Name = "System Design", Description = "System architecture and design principles" },
                new Topic { Name = "Algorithms", Description = "Data structures and algorithms" },
                new Topic { Name = "Web Development", Description = "General web development concepts" },
                new Topic { Name = "DevOps", Description = "Development operations and deployment" }
            };
            
            await context.Topics.AddRangeAsync(topics);
            await context.SaveChangesAsync();
        }
        
        // TODO: Seed Admin User - temporarily disabled for startup testing
        // if (!await context.Users.AnyAsync(u => u.Role == UserRole.Admin))
        // {
        //     var adminUser = new User { ... };
        //     await userManager.CreateAsync(adminUser, "Admin123!");
        // }
        
        // Seed Sample Questions
        if (!await context.Questions.AnyAsync())
        {
            var jsTopic = await context.Topics.FirstOrDefaultAsync(t => t.Name == "JavaScript");
            var reactTopic = await context.Topics.FirstOrDefaultAsync(t => t.Name == "React");
            
            if (jsTopic != null && reactTopic != null)
            {
                var questions = new List<Question>
                {
                    new Question
                    {
                        Id = Guid.NewGuid(),
                        TopicId = jsTopic.Id,
                        Text = "What is the difference between 'let' and 'var' in JavaScript?",
                        Type = QuestionType.Written,
                        Level = DifficultyLevel.Basic,
                        OfficialAnswer = "let has block scope while var has function scope. let prevents redeclaration in same scope and has temporal dead zone."
                    },
                    new Question
                    {
                        Id = Guid.NewGuid(),
                            TopicId = jsTopic.Id,
                        Text = "Which of the following is NOT a primitive type in JavaScript?",
                        Type = QuestionType.SingleChoice,
                        Level = DifficultyLevel.Basic
                    },
                    new Question
                    {
                        Id = Guid.NewGuid(),
                        TopicId = reactTopic.Id,
                        Text = "What is JSX in React?",
                        Type = QuestionType.Written,
                        Level = DifficultyLevel.Basic,
                        OfficialAnswer = "JSX is a syntax extension for JavaScript that allows writing HTML-like code in React components. It gets transpiled to React.createElement calls."
                    }
                };
                
                await context.Questions.AddRangeAsync(questions);
                await context.SaveChangesAsync();
                
                var singleChoiceQuestion = questions.FirstOrDefault(q => q.Type == QuestionType.SingleChoice);
                if (singleChoiceQuestion != null)
                {
                    var options = new List<QuestionOption>
                    {
                        new QuestionOption { Id = Guid.NewGuid(), QuestionId = singleChoiceQuestion.Id, Text = "string", IsCorrect = false, OrderIndex = 1 },
                        new QuestionOption { Id = Guid.NewGuid(), QuestionId = singleChoiceQuestion.Id, Text = "number", IsCorrect = false, OrderIndex = 2 },
                        new QuestionOption { Id = Guid.NewGuid(), QuestionId = singleChoiceQuestion.Id, Text = "object", IsCorrect = true, OrderIndex = 3 },
                        new QuestionOption { Id = Guid.NewGuid(), QuestionId = singleChoiceQuestion.Id, Text = "boolean", IsCorrect = false, OrderIndex = 4 }
                    };
                    
                    await context.QuestionOptions.AddRangeAsync(options);
                    await context.SaveChangesAsync();
                }
            }
        }
    }
}