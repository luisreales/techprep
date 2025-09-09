using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using TechPrep.Application.DTOs.Common;
using TechPrep.Application.DTOs.Topic;

namespace TechPrep.Tests.Integration.Controllers;

public class TopicsControllerIntegrationTests : IClassFixture<TechPrepWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TechPrepWebApplicationFactory _factory;

    public TopicsControllerIntegrationTests(TechPrepWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetAllTopics_ShouldReturnOk_WithTopicsList()
    {
        // Act
        var response = await _client.GetAsync("/api/topics");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<IEnumerable<TopicDto>>>(content, 
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        
        apiResponse.Should().NotBeNull();
        apiResponse!.Success.Should().BeTrue();
        apiResponse.Data.Should().NotBeNull();
        apiResponse.Data!.Should().HaveCountGreaterThan(0);
        
        var firstTopic = apiResponse.Data!.First();
        firstTopic.Name.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task GetActiveTopics_ShouldReturnOk_WithActiveTopicsList()
    {
        // Act
        var response = await _client.GetAsync("/api/topics/active");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<IEnumerable<TopicDto>>>(content, 
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        
        apiResponse.Should().NotBeNull();
        apiResponse!.Success.Should().BeTrue();
        apiResponse.Data.Should().NotBeNull();
    }

    [Fact]
    public async Task GetTopicById_ShouldReturnOk_WhenTopicExists()
    {
        // Arrange - Using topic ID 1 which should exist from seeded data
        var topicId = 1;
        
        // Act
        var response = await _client.GetAsync($"/api/topics/{topicId}");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<TopicDto>>(content, 
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        
        apiResponse.Should().NotBeNull();
        apiResponse!.Success.Should().BeTrue();
        apiResponse.Data.Should().NotBeNull();
        apiResponse.Data!.Id.Should().Be(topicId);
        apiResponse.Data.Name.Should().Be("JavaScript");
    }

    [Fact]
    public async Task GetTopicById_ShouldReturnNotFound_WhenTopicDoesNotExist()
    {
        // Arrange
        var nonExistentId = 999;
        
        // Act
        var response = await _client.GetAsync($"/api/topics/{nonExistentId}");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task CreateTopic_ShouldReturnCreated_WhenTopicIsValid()
    {
        // Arrange
        var createTopicDto = new CreateTopicDto
        {
            Name = "New Integration Test Topic",
            Description = "This is a test topic created during integration testing"
        };
        
        // Act
        var response = await _client.PostAsJsonAsync("/api/topics", createTopicDto);
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var content = await response.Content.ReadAsStringAsync();
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<TopicDto>>(content, 
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        
        apiResponse.Should().NotBeNull();
        apiResponse!.Success.Should().BeTrue();
        apiResponse.Data.Should().NotBeNull();
        apiResponse.Data!.Name.Should().Be("New Integration Test Topic");
        apiResponse.Data.Description.Should().Be("This is a test topic created during integration testing");
        
        // Verify location header
        response.Headers.Location.Should().NotBeNull();
        response.Headers.Location!.PathAndQuery.Should().Contain($"/api/topics/{apiResponse.Data.Id}");
    }

    [Fact]
    public async Task CreateTopic_ShouldReturnBadRequest_WhenTopicNameExists()
    {
        // Arrange - Using existing topic name from seeded data
        var createTopicDto = new CreateTopicDto
        {
            Name = "JavaScript", // This already exists in seeded data
            Description = "Duplicate topic"
        };
        
        // Act
        var response = await _client.PostAsJsonAsync("/api/topics", createTopicDto);
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        
        var content = await response.Content.ReadAsStringAsync();
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<TopicDto>>(content, 
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        
        apiResponse.Should().NotBeNull();
        apiResponse!.Success.Should().BeFalse();
        apiResponse.Error.Should().NotBeNull();
        apiResponse.Error!.Code.Should().Be("TOPIC_EXISTS");
    }

    [Fact]
    public async Task UpdateTopic_ShouldReturnOk_WhenTopicExists()
    {
        // Arrange
        var topicId = 1; // Using seeded data
        var updateTopicDto = new UpdateTopicDto
        {
            Name = "Updated JavaScript Topic",
            Description = "Updated description for JavaScript"
        };
        
        // Act
        var response = await _client.PutAsJsonAsync($"/api/topics/{topicId}", updateTopicDto);
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<TopicDto>>(content, 
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        
        apiResponse.Should().NotBeNull();
        apiResponse!.Success.Should().BeTrue();
        apiResponse.Data.Should().NotBeNull();
        apiResponse.Data!.Name.Should().Be("Updated JavaScript Topic");
        apiResponse.Data.Description.Should().Be("Updated description for JavaScript");
    }

    [Fact]
    public async Task UpdateTopic_ShouldReturnNotFound_WhenTopicDoesNotExist()
    {
        // Arrange
        var nonExistentId = 999;
        var updateTopicDto = new UpdateTopicDto
        {
            Name = "Non-existent Topic",
            Description = "This topic does not exist"
        };
        
        // Act
        var response = await _client.PutAsJsonAsync($"/api/topics/{nonExistentId}", updateTopicDto);
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteTopic_ShouldReturnBadRequest_WhenTopicHasQuestions()
    {
        // Arrange - Topic ID 1 has questions in seeded data
        var topicId = 1;
        
        // Act
        var response = await _client.DeleteAsync($"/api/topics/{topicId}");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        
        var content = await response.Content.ReadAsStringAsync();
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<bool>>(content, 
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        
        apiResponse.Should().NotBeNull();
        apiResponse!.Success.Should().BeFalse();
        apiResponse.Error.Should().NotBeNull();
        apiResponse.Error!.Code.Should().Be("TOPIC_HAS_QUESTIONS");
    }
}