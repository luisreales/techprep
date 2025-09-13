using AutoMapper;
using FluentAssertions;
using Moq;
using TechPrep.Application.DTOs.Question;
using TechPrep.Application.Mappings;
using TechPrep.Application.Services;
using TechPrep.Core.Entities;
using TechPrep.Core.Enums;
using TechPrep.Core.Interfaces;
using TechPrep.Tests.Unit.Helpers;

namespace TechPrep.Tests.Unit.Services;

public class QuestionServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly IMapper _mapper;
    private readonly QuestionService _questionService;

    public QuestionServiceTests()
    {
        _mockUnitOfWork = MockHelper.CreateMockUnitOfWork();
        
        var config = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>());
        _mapper = config.CreateMapper();
        
        _questionService = new QuestionService(_mockUnitOfWork.Object, _mapper);
    }

    [Fact]
    public async Task GetQuestionsAsync_ShouldReturnPaginatedQuestions()
    {
        // Arrange
        var questions = TestDataHelper.CreateTestQuestions(1, 5);
        var filter = new QuestionFilterDto
        {
            Page = 1,
            PageSize = 10,
            TopicId = 1
        };

        _mockUnitOfWork.Setup(u => u.Questions.GetByFiltersAsync(
            filter.TopicId, filter.Type, filter.Level, 0, filter.PageSize))
            .ReturnsAsync(questions);

        _mockUnitOfWork.Setup(u => u.Questions.GetCountByFiltersAsync(
            filter.TopicId, filter.Type, filter.Level))
            .ReturnsAsync(5);

        // Act
        var result = await _questionService.GetQuestionsAsync(filter);

        // Assert
        result.Success.Should().BeTrue();
        result.Data.Should().HaveCount(5);
        result.Pagination.TotalItems.Should().Be(5);
        result.Pagination.Page.Should().Be(1);
        result.Pagination.PageSize.Should().Be(10);
        result.Pagination.TotalPages.Should().Be(1);
    }

    [Fact]
    public async Task GetQuestionByIdAsync_ShouldReturnQuestion_WhenQuestionExists()
    {
        // Arrange
        var questionId = Guid.NewGuid();
        var question = TestDataHelper.CreateTestQuestion(questionId);
        question.Topic = TestDataHelper.CreateTestTopic();

        _mockUnitOfWork.Setup(u => u.Questions.GetWithOptionsAsync(questionId))
            .ReturnsAsync(question);

        // Act
        var result = await _questionService.GetQuestionByIdAsync(questionId);

        // Assert
        result.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Id.Should().Be(questionId);
    }

    [Fact]
    public async Task GetQuestionByIdAsync_ShouldReturnNotFound_WhenQuestionDoesNotExist()
    {
        // Arrange
        var questionId = Guid.NewGuid();
        _mockUnitOfWork.Setup(u => u.Questions.GetWithOptionsAsync(questionId))
            .ReturnsAsync((Question?)null);

        // Act
        var result = await _questionService.GetQuestionByIdAsync(questionId);

        // Assert
        result.Success.Should().BeFalse();
        result.Error!.Code.Should().Be("QUESTION_NOT_FOUND");
    }

    [Fact]
    public async Task CreateQuestionAsync_ShouldCreateQuestion_WhenTopicExists()
    {
        // Arrange
        var topic = TestDataHelper.CreateTestTopic();
        var createQuestionDto = new CreateQuestionDto
        {
            TopicId = 1,
            Text = "What is a test question?",
            Type = QuestionType.Written,
            Level = DifficultyLevel.Basic,
            OfficialAnswer = "This is a test answer",
            Options = new List<CreateQuestionOptionDto>(),
            LearningResources = new List<CreateLearningResourceDto>()
        };

        _mockUnitOfWork.Setup(u => u.Topics.GetByIdAsync(1))
            .ReturnsAsync(topic);

        _mockUnitOfWork.Setup(u => u.Questions.AddAsync(It.IsAny<Question>()))
            .ReturnsAsync((Question q) => q);

        // Act
        var result = await _questionService.CreateQuestionAsync(createQuestionDto);

        // Assert
        result.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Text.Should().Be("What is a test question?");
        result.Message.Should().Be("Question created successfully");

        _mockUnitOfWork.Verify(u => u.Questions.AddAsync(It.IsAny<Question>()), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task CreateQuestionAsync_ShouldReturnError_WhenTopicNotFound()
    {
        // Arrange
        var createQuestionDto = new CreateQuestionDto
        {
            TopicId = 999,
            Text = "Test question",
            Type = QuestionType.Written,
            Level = DifficultyLevel.Basic
        };

        _mockUnitOfWork.Setup(u => u.Topics.GetByIdAsync(999))
            .ReturnsAsync((Topic?)null);

        // Act
        var result = await _questionService.CreateQuestionAsync(createQuestionDto);

        // Assert
        result.Success.Should().BeFalse();
        result.Error!.Code.Should().Be("TOPIC_NOT_FOUND");
        _mockUnitOfWork.Verify(u => u.Questions.AddAsync(It.IsAny<Question>()), Times.Never);
    }

    [Fact]
    public async Task CreateQuestionAsync_ShouldCreateQuestionWithOptions()
    {
        // Arrange
        var topic = TestDataHelper.CreateTestTopic();
        var createQuestionDto = new CreateQuestionDto
        {
            TopicId = 1,
            Text = "What is the capital of France?",
            Type = QuestionType.SingleChoice,
            Level = DifficultyLevel.Basic,
            Options = new List<CreateQuestionOptionDto>
            {
                new() { Text = "London", IsCorrect = false, OrderIndex = 1 },
                new() { Text = "Paris", IsCorrect = true, OrderIndex = 2 },
                new() { Text = "Berlin", IsCorrect = false, OrderIndex = 3 }
            },
            LearningResources = new List<CreateLearningResourceDto>
            {
                new() { Title = "Geography Guide", Url = "https://example.com", Description = "Learn geography" }
            }
        };

        _mockUnitOfWork.Setup(u => u.Topics.GetByIdAsync(1))
            .ReturnsAsync(topic);

        _mockUnitOfWork.Setup(u => u.Questions.AddAsync(It.IsAny<Question>()))
            .ReturnsAsync((Question q) => q);

        // Act
        var result = await _questionService.CreateQuestionAsync(createQuestionDto);

        // Assert
        result.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();

        _mockUnitOfWork.Verify(u => u.Questions.AddAsync(It.Is<Question>(q => 
            q.Options.Count == 3 && 
            q.LearningResources.Count == 1)), Times.Once);
    }

    [Fact]
    public async Task UpdateQuestionAsync_ShouldUpdateQuestion_WhenQuestionExists()
    {
        // Arrange
        var questionId = Guid.NewGuid();
        var existingQuestion = TestDataHelper.CreateTestQuestion(questionId);
        var topic = TestDataHelper.CreateTestTopic();

        var updateQuestionDto = new CreateQuestionDto
        {
            TopicId = 1,
            Text = "Updated question text",
            Type = QuestionType.Written,
            Level = DifficultyLevel.Intermediate,
            OfficialAnswer = "Updated answer",
            Options = new List<CreateQuestionOptionDto>(),
            LearningResources = new List<CreateLearningResourceDto>()
        };

        _mockUnitOfWork.Setup(u => u.Questions.GetWithOptionsAsync(questionId))
            .ReturnsAsync(existingQuestion);

        _mockUnitOfWork.Setup(u => u.Topics.GetByIdAsync(1))
            .ReturnsAsync(topic);

        var mockGenericRepo = new Mock<IGenericRepository<QuestionOption>>();
        _mockUnitOfWork.Setup(u => u.Repository<QuestionOption>())
            .Returns(mockGenericRepo.Object);

        var mockResourceRepo = new Mock<IGenericRepository<LearningResource>>();
        _mockUnitOfWork.Setup(u => u.Repository<LearningResource>())
            .Returns(mockResourceRepo.Object);

        // Act
        var result = await _questionService.UpdateQuestionAsync(questionId, updateQuestionDto);

        // Assert
        result.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Message.Should().Be("Question updated successfully");

        _mockUnitOfWork.Verify(u => u.Questions.Update(It.IsAny<Question>()), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task DeleteQuestionAsync_ShouldDeleteQuestion_WhenQuestionExists()
    {
        // Arrange
        var questionId = Guid.NewGuid();
        var question = TestDataHelper.CreateTestQuestion(questionId);

        _mockUnitOfWork.Setup(u => u.Questions.GetByIdAsync(questionId))
            .ReturnsAsync(question);

        // Act
        var result = await _questionService.DeleteQuestionAsync(questionId);

        // Assert
        result.Success.Should().BeTrue();
        result.Data.Should().BeTrue();
        result.Message.Should().Be("Question deleted successfully");

        _mockUnitOfWork.Verify(u => u.Questions.Delete(It.IsAny<Question>()), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task DeleteQuestionAsync_ShouldReturnError_WhenQuestionNotFound()
    {
        // Arrange
        var questionId = Guid.NewGuid();
        _mockUnitOfWork.Setup(u => u.Questions.GetByIdAsync(questionId))
            .ReturnsAsync((Question?)null);

        // Act
        var result = await _questionService.DeleteQuestionAsync(questionId);

        // Assert
        result.Success.Should().BeFalse();
        result.Error!.Code.Should().Be("QUESTION_NOT_FOUND");
        _mockUnitOfWork.Verify(u => u.Questions.Delete(It.IsAny<Question>()), Times.Never);
    }
}