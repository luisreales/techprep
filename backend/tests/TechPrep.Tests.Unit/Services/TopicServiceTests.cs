using AutoMapper;
using FluentAssertions;
using Moq;
using TechPrep.Application.DTOs.Topic;
using TechPrep.Application.Mappings;
using TechPrep.Application.Services;
using TechPrep.Core.Entities;
using TechPrep.Core.Interfaces;
using TechPrep.Tests.Unit.Helpers;

namespace TechPrep.Tests.Unit.Services;

public class TopicServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly IMapper _mapper;
    private readonly TopicService _topicService;

    public TopicServiceTests()
    {
        _mockUnitOfWork = MockHelper.CreateMockUnitOfWork();
        
        var config = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>());
        _mapper = config.CreateMapper();
        
        _topicService = new TopicService(_mockUnitOfWork.Object, _mapper);
    }

    [Fact]
    public async Task GetAllTopicsAsync_ShouldReturnSuccess_WhenTopicsExist()
    {
        // Arrange
        var topics = TestDataHelper.CreateTestTopics(3);
        _mockUnitOfWork.Setup(u => u.Topics.GetAllAsync())
            .ReturnsAsync(topics);

        // Act
        var result = await _topicService.GetAllTopicsAsync();

        // Assert
        result.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Should().HaveCount(3);
        result.Data!.First().Name.Should().Be("Topic 1");
    }

    [Fact]
    public async Task GetAllTopicsAsync_ShouldReturnError_WhenExceptionThrown()
    {
        // Arrange
        _mockUnitOfWork.Setup(u => u.Topics.GetAllAsync())
            .ThrowsAsync(new Exception("Database error"));

        // Act
        var result = await _topicService.GetAllTopicsAsync();

        // Assert
        result.Success.Should().BeFalse();
        result.Error.Should().NotBeNull();
        result.Error!.Code.Should().Be("GET_TOPICS_FAILED");
    }

    [Fact]
    public async Task GetActiveTopicsAsync_ShouldReturnActiveTopics()
    {
        // Arrange
        var activeTopics = TestDataHelper.CreateTestTopics(2);
        _mockUnitOfWork.Setup(u => u.Topics.GetActiveTopicsAsync())
            .ReturnsAsync(activeTopics);

        // Act
        var result = await _topicService.GetActiveTopicsAsync();

        // Assert
        result.Success.Should().BeTrue();
        result.Data.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetTopicByIdAsync_ShouldReturnTopic_WhenTopicExists()
    {
        // Arrange
        var topic = TestDataHelper.CreateTestTopic(1, "Existing Topic");
        _mockUnitOfWork.Setup(u => u.Topics.GetByIdAsync(1))
            .ReturnsAsync(topic);

        // Act
        var result = await _topicService.GetTopicByIdAsync(1);

        // Assert
        result.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Name.Should().Be("Existing Topic");
    }

    [Fact]
    public async Task GetTopicByIdAsync_ShouldReturnNotFound_WhenTopicDoesNotExist()
    {
        // Arrange
        _mockUnitOfWork.Setup(u => u.Topics.GetByIdAsync(999))
            .ReturnsAsync((Topic?)null);

        // Act
        var result = await _topicService.GetTopicByIdAsync(999);

        // Assert
        result.Success.Should().BeFalse();
        result.Error!.Code.Should().Be("TOPIC_NOT_FOUND");
    }

    [Fact]
    public async Task CreateTopicAsync_ShouldCreateTopic_WhenTopicNameIsUnique()
    {
        // Arrange
        var createTopicDto = new CreateTopicDto
        {
            Name = "New Topic",
            Description = "New topic description"
        };

        _mockUnitOfWork.Setup(u => u.Topics.GetByNameAsync(createTopicDto.Name))
            .ReturnsAsync((Topic?)null);

        _mockUnitOfWork.Setup(u => u.Topics.AddAsync(It.IsAny<Topic>()))
            .ReturnsAsync((Topic t) => t);

        // Act
        var result = await _topicService.CreateTopicAsync(createTopicDto);

        // Assert
        result.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Name.Should().Be("New Topic");
        result.Message.Should().Be("Topic created successfully");

        _mockUnitOfWork.Verify(u => u.Topics.AddAsync(It.IsAny<Topic>()), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task CreateTopicAsync_ShouldReturnError_WhenTopicNameExists()
    {
        // Arrange
        var existingTopic = TestDataHelper.CreateTestTopic(1, "Existing Topic");
        var createTopicDto = new CreateTopicDto
        {
            Name = "Existing Topic",
            Description = "Description"
        };

        _mockUnitOfWork.Setup(u => u.Topics.GetByNameAsync(createTopicDto.Name))
            .ReturnsAsync(existingTopic);

        // Act
        var result = await _topicService.CreateTopicAsync(createTopicDto);

        // Assert
        result.Success.Should().BeFalse();
        result.Error!.Code.Should().Be("TOPIC_EXISTS");
        _mockUnitOfWork.Verify(u => u.Topics.AddAsync(It.IsAny<Topic>()), Times.Never);
    }

    [Fact]
    public async Task UpdateTopicAsync_ShouldUpdateTopic_WhenTopicExists()
    {
        // Arrange
        var existingTopic = TestDataHelper.CreateTestTopic(1, "Original Name");
        var updateTopicDto = new UpdateTopicDto
        {
            Name = "Updated Name",
            Description = "Updated description"
        };

        _mockUnitOfWork.Setup(u => u.Topics.GetByIdAsync(1))
            .ReturnsAsync(existingTopic);

        _mockUnitOfWork.Setup(u => u.Topics.GetByNameAsync(updateTopicDto.Name))
            .ReturnsAsync((Topic?)null);

        // Act
        var result = await _topicService.UpdateTopicAsync(1, updateTopicDto);

        // Assert
        result.Success.Should().BeTrue();
        result.Data!.Name.Should().Be("Updated Name");
        result.Message.Should().Be("Topic updated successfully");

        _mockUnitOfWork.Verify(u => u.Topics.Update(It.IsAny<Topic>()), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task UpdateTopicAsync_ShouldReturnError_WhenTopicNotFound()
    {
        // Arrange
        var updateTopicDto = new UpdateTopicDto { Name = "New Name" };

        _mockUnitOfWork.Setup(u => u.Topics.GetByIdAsync(999))
            .ReturnsAsync((Topic?)null);

        // Act
        var result = await _topicService.UpdateTopicAsync(999, updateTopicDto);

        // Assert
        result.Success.Should().BeFalse();
        result.Error!.Code.Should().Be("TOPIC_NOT_FOUND");
    }

    [Fact]
    public async Task DeleteTopicAsync_ShouldDeleteTopic_WhenNoQuestionsExist()
    {
        // Arrange
        var topic = TestDataHelper.CreateTestTopic(1);
        
        _mockUnitOfWork.Setup(u => u.Topics.GetByIdAsync(1))
            .ReturnsAsync(topic);

        _mockUnitOfWork.Setup(u => u.Questions.ExistsAsync(It.IsAny<System.Linq.Expressions.Expression<Func<Question, bool>>>()))
            .ReturnsAsync(false);

        // Act
        var result = await _topicService.DeleteTopicAsync(1);

        // Assert
        result.Success.Should().BeTrue();
        result.Data.Should().BeTrue();
        result.Message.Should().Be("Topic deleted successfully");

        _mockUnitOfWork.Verify(u => u.Topics.Delete(It.IsAny<Topic>()), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task DeleteTopicAsync_ShouldReturnError_WhenTopicHasQuestions()
    {
        // Arrange
        var topic = TestDataHelper.CreateTestTopic(1);
        
        _mockUnitOfWork.Setup(u => u.Topics.GetByIdAsync(1))
            .ReturnsAsync(topic);

        _mockUnitOfWork.Setup(u => u.Questions.ExistsAsync(It.IsAny<System.Linq.Expressions.Expression<Func<Question, bool>>>()))
            .ReturnsAsync(true);

        // Act
        var result = await _topicService.DeleteTopicAsync(1);

        // Assert
        result.Success.Should().BeFalse();
        result.Error!.Code.Should().Be("TOPIC_HAS_QUESTIONS");
        _mockUnitOfWork.Verify(u => u.Topics.Delete(It.IsAny<Topic>()), Times.Never);
    }
}