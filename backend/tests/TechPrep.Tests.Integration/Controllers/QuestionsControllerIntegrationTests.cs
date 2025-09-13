using FluentAssertions;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using TechPrep.Application.DTOs.Common;
using TechPrep.Application.DTOs;
using TechPrep.Core.Enums;

namespace TechPrep.Tests.Integration.Controllers;

public class QuestionsControllerIntegrationTests : IClassFixture<TechPrepWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TechPrepWebApplicationFactory _factory;

    public QuestionsControllerIntegrationTests(TechPrepWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetQuestions_ShouldReturnOk_WithPaginatedQuestions()
    {
        // Act
        var response = await _client.GetAsync("/api/questions?page=1&pageSize=10");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var paginatedResponse = JsonSerializer.Deserialize<PaginatedResponse<QuestionDto>>(content, 
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        
        paginatedResponse.Should().NotBeNull();
        paginatedResponse!.Success.Should().BeTrue();
        paginatedResponse.Data.Should().NotBeNull();
        paginatedResponse.Pagination.Should().NotBeNull();
        paginatedResponse.Pagination.Page.Should().Be(1);
        paginatedResponse.Pagination.PageSize.Should().Be(10);
    }

    [Fact]
    public async Task GetQuestions_WithTopicFilter_ShouldReturnFilteredQuestions()
    {
        // Act
        var response = await _client.GetAsync("/api/questions?topicId=1&page=1&pageSize=10");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var paginatedResponse = JsonSerializer.Deserialize<PaginatedResponse<QuestionDto>>(content, 
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        
        paginatedResponse.Should().NotBeNull();
        paginatedResponse!.Success.Should().BeTrue();
        paginatedResponse.Data.Should().NotBeNull();
        
        // All returned questions should belong to topic 1
        paginatedResponse.Data!.Should().OnlyContain(q => q.TopicId == 1);
    }

    [Fact]
    public async Task CreateQuestion_ShouldReturnCreated_WhenQuestionIsValid()
    {
        // Arrange
        var createQuestionDto = new CreateQuestionDto
        {
            TopicId = 1, // JavaScript topic from seeded data
            Text = "What is a closure in JavaScript?",
            Type = QuestionType.Written,
            Level = DifficultyLevel.Intermediate,
            OfficialAnswer = "A closure is a function that has access to variables in its outer scope even after the outer function has returned.",
            Options = new List<CreateQuestionOptionDto>(),
            LearningResources = new List<CreateLearningResourceDto>
            {
                new()
                {
                    Title = "JavaScript Closures Guide",
                    Url = "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures",
                    Description = "MDN guide to JavaScript closures"
                }
            }
        };
        
        // Act
        var response = await _client.PostAsJsonAsync("/api/questions", createQuestionDto);
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var content = await response.Content.ReadAsStringAsync();
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<QuestionDto>>(content, 
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        
        apiResponse.Should().NotBeNull();
        apiResponse!.Success.Should().BeTrue();
        apiResponse.Data.Should().NotBeNull();
        apiResponse.Data!.Text.Should().Be("What is a closure in JavaScript?");
        apiResponse.Data.Type.Should().Be(QuestionType.Written);
        apiResponse.Data.Level.Should().Be(DifficultyLevel.Intermediate);
        apiResponse.Data.TopicName.Should().Be("JavaScript");
        apiResponse.Data.LearningResources.Should().HaveCount(1);
        
        // Verify location header
        response.Headers.Location.Should().NotBeNull();
        response.Headers.Location!.PathAndQuery.Should().Contain($"/api/questions/{apiResponse.Data.Id}");
    }

    [Fact]
    public async Task CreateQuestion_WithMultipleChoiceOptions_ShouldReturnCreated()
    {
        // Arrange
        var createQuestionDto = new CreateQuestionDto
        {
            TopicId = 2, // React topic from seeded data
            Text = "Which of the following are React hooks?",
            Type = QuestionType.MultiChoice,
            Level = DifficultyLevel.Basic,
            Options = new List<CreateQuestionOptionDto>
            {
                new() { Text = "useState", IsCorrect = true, OrderIndex = 1 },
                new() { Text = "useEffect", IsCorrect = true, OrderIndex = 2 },
                new() { Text = "componentDidMount", IsCorrect = false, OrderIndex = 3 },
                new() { Text = "useContext", IsCorrect = true, OrderIndex = 4 }
            },
            LearningResources = new List<CreateLearningResourceDto>()
        };
        
        // Act
        var response = await _client.PostAsJsonAsync("/api/questions", createQuestionDto);
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var content = await response.Content.ReadAsStringAsync();
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<QuestionDto>>(content, 
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        
        apiResponse.Should().NotBeNull();
        apiResponse!.Success.Should().BeTrue();
        apiResponse.Data.Should().NotBeNull();
        apiResponse.Data!.Options.Should().HaveCount(4);
        apiResponse.Data.Options.Where(o => o.IsCorrect).Should().HaveCount(3);
    }

    [Fact]
    public async Task CreateQuestion_ShouldReturnBadRequest_WhenTopicNotFound()
    {
        // Arrange
        var createQuestionDto = new CreateQuestionDto
        {
            TopicId = 999, // Non-existent topic
            Text = "Test question",
            Type = QuestionType.Written,
            Level = DifficultyLevel.Basic,
            OfficialAnswer = "Test answer",
            Options = new List<CreateQuestionOptionDto>(),
            LearningResources = new List<CreateLearningResourceDto>()
        };
        
        // Act
        var response = await _client.PostAsJsonAsync("/api/questions", createQuestionDto);
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        
        var content = await response.Content.ReadAsStringAsync();
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<QuestionDto>>(content, 
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        
        apiResponse.Should().NotBeNull();
        apiResponse!.Success.Should().BeFalse();
        apiResponse.Error.Should().NotBeNull();
        apiResponse.Error!.Code.Should().Be("TOPIC_NOT_FOUND");
    }

    [Fact]
    public async Task GetQuestionById_ShouldReturnNotFound_WhenQuestionDoesNotExist()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();
        
        // Act
        var response = await _client.GetAsync($"/api/questions/{nonExistentId}");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteQuestion_ShouldReturnNotFound_WhenQuestionDoesNotExist()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();
        
        // Act
        var response = await _client.DeleteAsync($"/api/questions/{nonExistentId}");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}