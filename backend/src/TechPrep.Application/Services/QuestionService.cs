using AutoMapper;
using TechPrep.Application.DTOs;
using TechPrep.Application.Interfaces;
using TechPrep.Core.Entities;
using TechPrep.Core.Interfaces;
using TechPrep.Core.Enums;
using System.Linq;

namespace TechPrep.Application.Services;

public class QuestionService : IQuestionService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public QuestionService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<List<QuestionDto>> GetQuestionsAsync(
        int? topicId = null,
        QuestionType? type = null,
        DifficultyLevel? level = null,
        string? search = null,
        int page = 1,
        int limit = 25)
    {
        try
        {
            Console.WriteLine($"[QUESTION SERVICE] GetQuestionsAsync called with topicId: {topicId}, type: {type}, level: {level}, search: {search}, page: {page}, limit: {limit}");
            
            var skip = (page - 1) * limit;
            var questions = await _unitOfWork.Questions.GetByFiltersAsync(
                topicId, type, level, skip, limit);

            Console.WriteLine($"[QUESTION SERVICE] Repository returned {questions?.Count()} questions");
            
            var mappedQuestions = _mapper.Map<List<QuestionDto>>(questions);
            Console.WriteLine($"[QUESTION SERVICE] Mapped to {mappedQuestions?.Count} DTOs");
            
            return mappedQuestions;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[QUESTION SERVICE ERROR] GetQuestionsAsync failed: {ex.Message}");
            Console.WriteLine($"[QUESTION SERVICE ERROR] Stack trace: {ex.StackTrace}");
            return new List<QuestionDto>();
        }
    }

    public async Task<int> GetQuestionsCountAsync(
        int? topicId = null,
        QuestionType? type = null,
        DifficultyLevel? level = null,
        string? search = null,
        bool? usableInPractice = null,
        bool? usableInInterview = null,
        bool enforceInterviewCooldown = false)
    {
        try
        {
            Console.WriteLine($"[QUESTION SERVICE] GetQuestionsCountAsync called with topicId: {topicId}, type: {type}, level: {level}, search: {search}");
            
            var count = await _unitOfWork.Questions.GetCountByFiltersAsync(
                topicId,
                type,
                level,
                usableInPractice,
                usableInInterview,
                enforceInterviewCooldown);
                
            Console.WriteLine($"[QUESTION SERVICE] Repository returned count: {count}");
            return count;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[QUESTION SERVICE ERROR] GetQuestionsCountAsync failed: {ex.Message}");
            Console.WriteLine($"[QUESTION SERVICE ERROR] Stack trace: {ex.StackTrace}");
            return 0;
        }
    }

    public async Task<QuestionDto?> GetQuestionByIdAsync(Guid id)
    {
        try
        {
            var question = await _unitOfWork.Questions.GetWithOptionsAsync(id);
            
            if (question == null)
                return null;

            return _mapper.Map<QuestionDto>(question);
        }
        catch (Exception)
        {
            return null;
        }
    }

    public async Task<QuestionDto> CreateQuestionAsync(CreateQuestionDto createQuestionDto)
    {
        try
        {
            // Validate topic exists
            var topic = await _unitOfWork.Topics.GetByIdAsync(createQuestionDto.TopicId);
            if (topic == null)
            {
                throw new ArgumentException("Topic not found");
            }

            var question = _mapper.Map<Question>(createQuestionDto);
            
            // Set options for the question
            if (createQuestionDto.Options.Any())
            {
                foreach (var optionDto in createQuestionDto.Options)
                {
                    var option = _mapper.Map<QuestionOption>(optionDto);
                    option.QuestionId = question.Id;
                    question.Options.Add(option);
                }
            }

            // TODO: Set learning resources - will implement with new ResourceService
            // if (createQuestionDto.LearningResources.Any())
            // {
            //     foreach (var resourceDto in createQuestionDto.LearningResources)
            //     {
            //         var resource = _mapper.Map<LearningResource>(resourceDto);
            //         resource.QuestionId = question.Id;
            //         question.LearningResources.Add(resource);
            //     }
            // }

            await _unitOfWork.Questions.AddAsync(question);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<QuestionDto>(question);
        }
        catch (Exception)
        {
            throw;
        }
    }

    public async Task<QuestionDto?> UpdateQuestionAsync(Guid id, UpdateQuestionDto updateQuestionDto)
    {
        try
        {
            var question = await _unitOfWork.Questions.GetWithOptionsAsync(id);
            
            if (question == null)
                return null;

            // Validate topic exists
            var topic = await _unitOfWork.Topics.GetByIdAsync(updateQuestionDto.TopicId);
            if (topic == null)
            {
                throw new ArgumentException("Topic not found");
            }

            // Update basic properties
            question.TopicId = updateQuestionDto.TopicId;
            question.Text = updateQuestionDto.Text;
            question.Type = updateQuestionDto.Type;
            question.Level = updateQuestionDto.Level;
            question.OfficialAnswer = updateQuestionDto.OfficialAnswer;
            question.UpdatedAt = DateTime.UtcNow;

            // Remove existing options and resources
            if (question.Options.Any())
            {
                _unitOfWork.Repository<QuestionOption>().DeleteRange(question.Options);
            }
            
            // TODO: Handle learning resources - will implement with new ResourceService
            // if (question.LearningResources.Any())
            // {
            //     _unitOfWork.Repository<LearningResource>().DeleteRange(question.LearningResources);
            // }

            // Add new options
            if (updateQuestionDto.Options.Any())
            {
                var newOptions = new List<QuestionOption>();
                foreach (var optionDto in updateQuestionDto.Options)
                {
                    var option = _mapper.Map<QuestionOption>(optionDto);
                    option.QuestionId = question.Id;
                    newOptions.Add(option);
                }
                await _unitOfWork.Repository<QuestionOption>().AddRangeAsync(newOptions);
            }

            // TODO: Add new learning resources - will implement with new ResourceService
            // if (updateQuestionDto.LearningResources.Any())
            // {
            //     var newResources = new List<LearningResource>();
            //     foreach (var resourceDto in updateQuestionDto.LearningResources)
            //     {
            //         var resource = _mapper.Map<LearningResource>(resourceDto);
            //         resource.QuestionId = question.Id;
            //         newResources.Add(resource);
            //     }
            //     await _unitOfWork.Repository<LearningResource>().AddRangeAsync(newResources);
            // }

            _unitOfWork.Questions.Update(question);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<QuestionDto>(question);
        }
        catch (Exception)
        {
            throw;
        }
    }

    public async Task<QuestionDto?> DuplicateQuestionAsync(Guid id)
    {
        try
        {
            var originalQuestion = await _unitOfWork.Questions.GetWithOptionsAsync(id);

            if (originalQuestion == null)
            {
                originalQuestion = await _unitOfWork.Questions.GetByIdAsync(id);

                if (originalQuestion == null)
                    return null;

                var optionRepo = _unitOfWork.Repository<QuestionOption>();
                var resourceRepo = _unitOfWork.Repository<QuestionResource>();

                var originalOptions = await optionRepo.FindAsync(o => o.QuestionId == id);
                var originalResources = await resourceRepo.FindAsync(r => r.QuestionId == id);

                originalQuestion.Options = originalOptions.ToList();
                originalQuestion.ResourceLinks = originalResources.ToList();
            }

            var duplicateQuestion = new Question
            {
                Id = Guid.NewGuid(),
                TopicId = originalQuestion.TopicId,
                Text = GenerateDuplicatedText(originalQuestion.Text),
                Type = originalQuestion.Type,
                Level = originalQuestion.Level,
                OfficialAnswer = originalQuestion.OfficialAnswer,
                UsableInPractice = originalQuestion.UsableInPractice,
                UsableInInterview = originalQuestion.UsableInInterview,
                Difficulty = originalQuestion.Difficulty,
                EstimatedTimeSec = originalQuestion.EstimatedTimeSec,
                InterviewCooldownDays = originalQuestion.InterviewCooldownDays,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            if (originalQuestion.Options.Any())
            {
                foreach (var option in originalQuestion.Options.OrderBy(o => o.OrderIndex))
                {
                    duplicateQuestion.Options.Add(new QuestionOption
                    {
                        Id = Guid.NewGuid(),
                        QuestionId = duplicateQuestion.Id,
                        Text = option.Text,
                        IsCorrect = option.IsCorrect,
                        OrderIndex = option.OrderIndex
                    });
                }
            }

            if (originalQuestion.ResourceLinks.Any())
            {
                foreach (var link in originalQuestion.ResourceLinks)
                {
                    duplicateQuestion.ResourceLinks.Add(new QuestionResource
                    {
                        QuestionId = duplicateQuestion.Id,
                        ResourceId = link.ResourceId,
                        Note = link.Note
                    });
                }
            }

            await _unitOfWork.Questions.AddAsync(duplicateQuestion);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<QuestionDto>(duplicateQuestion);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[QUESTION SERVICE ERROR] DuplicateQuestionAsync failed: {ex.Message}");
            return null;
        }
    }

    private static string GenerateDuplicatedText(string originalText)
    {
        const string copySuffix = " (Copy)";
        if (string.IsNullOrWhiteSpace(originalText))
        {
            return $"Untitled Question{copySuffix}";
        }

        return originalText.EndsWith(copySuffix, StringComparison.OrdinalIgnoreCase)
            ? originalText
            : string.Concat(originalText, copySuffix);
    }

    public async Task<bool> DeleteQuestionAsync(Guid id)
    {
        try
        {
            var question = await _unitOfWork.Questions.GetByIdAsync(id);
            
            if (question == null)
                return false;

            _unitOfWork.Questions.Delete(question);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }
        catch (Exception)
        {
            return false;
        }
    }

    public async Task<int> BulkDeleteQuestionsAsync(List<Guid> ids)
    {
        try
        {
            var deletedCount = 0;
            foreach (var id in ids)
            {
                var question = await _unitOfWork.Questions.GetByIdAsync(id);
                if (question != null)
                {
                    _unitOfWork.Questions.Delete(question);
                    deletedCount++;
                }
            }

            await _unitOfWork.SaveChangesAsync();
            return deletedCount;
        }
        catch (Exception)
        {
            return 0;
        }
    }

    public async Task<byte[]> ExportQuestionsAsync(List<Guid>? ids = null)
    {
        try
        {
            List<Question> questions;
            
            if (ids?.Any() == true)
            {
                questions = new List<Question>();
                foreach (var id in ids)
                {
                    var question = await _unitOfWork.Questions.GetWithOptionsAsync(id);
                    if (question != null)
                        questions.Add(question);
                }
            }
            else
            {
                questions = (await _unitOfWork.Questions.GetByFiltersAsync(null, null, null, 0, int.MaxValue)).ToList();
            }

            // TODO: Implement Excel export logic using EPPlus
            // For now, return empty byte array
            return Array.Empty<byte>();
        }
        catch (Exception)
        {
            return Array.Empty<byte>();
        }
    }

    public async Task<QuestionDto?> GetQuestionByTextAsync(string questionText)
    {
        try
        {
            var question = await _unitOfWork.Questions.GetByTextAsync(questionText);
            return question != null ? _mapper.Map<QuestionDto>(question) : null;
        }
        catch (Exception)
        {
            return null;
        }
    }
}
