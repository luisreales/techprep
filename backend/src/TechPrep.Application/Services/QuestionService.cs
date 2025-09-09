using AutoMapper;
using TechPrep.Application.DTOs.Common;
using TechPrep.Application.DTOs.Question;
using TechPrep.Application.Interfaces;
using TechPrep.Core.Entities;
using TechPrep.Core.Interfaces;

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

    public async Task<PaginatedResponse<QuestionDto>> GetQuestionsAsync(QuestionFilterDto filter)
    {
        try
        {
            var skip = (filter.Page - 1) * filter.PageSize;
            var questions = await _unitOfWork.Questions.GetByFiltersAsync(
                filter.TopicId, filter.Type, filter.Level, skip, filter.PageSize);
            
            var totalCount = await _unitOfWork.Questions.GetCountByFiltersAsync(
                filter.TopicId, filter.Type, filter.Level);

            var questionDtos = _mapper.Map<IEnumerable<QuestionDto>>(questions);
            
            var totalPages = (int)Math.Ceiling((double)totalCount / filter.PageSize);

            return new PaginatedResponse<QuestionDto>
            {
                Success = true,
                Data = questionDtos,
                Pagination = new PaginationInfo
                {
                    Page = filter.Page,
                    PageSize = filter.PageSize,
                    TotalItems = totalCount,
                    TotalPages = totalPages,
                    HasNext = filter.Page < totalPages,
                    HasPrevious = filter.Page > 1
                }
            };
        }
        catch (Exception)
        {
            return new PaginatedResponse<QuestionDto>
            {
                Success = false,
                Data = new List<QuestionDto>(),
                Pagination = new PaginationInfo()
            };
        }
    }

    public async Task<ApiResponse<QuestionDto>> GetQuestionByIdAsync(Guid id)
    {
        try
        {
            var question = await _unitOfWork.Questions.GetWithOptionsAsync(id);
            
            if (question == null)
            {
                return ApiResponse<QuestionDto>.ErrorResponse(
                    "QUESTION_NOT_FOUND", 
                    "Question not found");
            }

            var questionDto = _mapper.Map<QuestionDto>(question);
            return ApiResponse<QuestionDto>.SuccessResponse(questionDto);
        }
        catch (Exception ex)
        {
            return ApiResponse<QuestionDto>.ErrorResponse(
                "GET_QUESTION_FAILED", 
                "Failed to retrieve question", 
                ex.Message);
        }
    }

    public async Task<ApiResponse<QuestionDto>> CreateQuestionAsync(CreateQuestionDto createQuestionDto)
    {
        try
        {
            // Validate topic exists
            var topic = await _unitOfWork.Topics.GetByIdAsync(createQuestionDto.TopicId);
            if (topic == null)
            {
                return ApiResponse<QuestionDto>.ErrorResponse(
                    "TOPIC_NOT_FOUND", 
                    "Topic not found");
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

            // Set learning resources
            if (createQuestionDto.LearningResources.Any())
            {
                foreach (var resourceDto in createQuestionDto.LearningResources)
                {
                    var resource = _mapper.Map<LearningResource>(resourceDto);
                    resource.QuestionId = question.Id;
                    question.LearningResources.Add(resource);
                }
            }

            await _unitOfWork.Questions.AddAsync(question);
            await _unitOfWork.SaveChangesAsync();

            var questionDto = _mapper.Map<QuestionDto>(question);
            return ApiResponse<QuestionDto>.SuccessResponse(questionDto, "Question created successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<QuestionDto>.ErrorResponse(
                "CREATE_QUESTION_FAILED", 
                "Failed to create question", 
                ex.Message);
        }
    }

    public async Task<ApiResponse<QuestionDto>> UpdateQuestionAsync(Guid id, CreateQuestionDto updateQuestionDto)
    {
        try
        {
            var question = await _unitOfWork.Questions.GetWithOptionsAsync(id);
            
            if (question == null)
            {
                return ApiResponse<QuestionDto>.ErrorResponse(
                    "QUESTION_NOT_FOUND", 
                    "Question not found");
            }

            // Validate topic exists
            var topic = await _unitOfWork.Topics.GetByIdAsync(updateQuestionDto.TopicId);
            if (topic == null)
            {
                return ApiResponse<QuestionDto>.ErrorResponse(
                    "TOPIC_NOT_FOUND", 
                    "Topic not found");
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
            
            if (question.LearningResources.Any())
            {
                _unitOfWork.Repository<LearningResource>().DeleteRange(question.LearningResources);
            }

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

            // Add new learning resources
            if (updateQuestionDto.LearningResources.Any())
            {
                var newResources = new List<LearningResource>();
                foreach (var resourceDto in updateQuestionDto.LearningResources)
                {
                    var resource = _mapper.Map<LearningResource>(resourceDto);
                    resource.QuestionId = question.Id;
                    newResources.Add(resource);
                }
                await _unitOfWork.Repository<LearningResource>().AddRangeAsync(newResources);
            }

            _unitOfWork.Questions.Update(question);
            await _unitOfWork.SaveChangesAsync();

            var questionDto = _mapper.Map<QuestionDto>(question);
            return ApiResponse<QuestionDto>.SuccessResponse(questionDto, "Question updated successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<QuestionDto>.ErrorResponse(
                "UPDATE_QUESTION_FAILED", 
                "Failed to update question", 
                ex.Message);
        }
    }

    public async Task<ApiResponse<bool>> DeleteQuestionAsync(Guid id)
    {
        try
        {
            var question = await _unitOfWork.Questions.GetByIdAsync(id);
            
            if (question == null)
            {
                return ApiResponse<bool>.ErrorResponse(
                    "QUESTION_NOT_FOUND", 
                    "Question not found");
            }

            _unitOfWork.Questions.Delete(question);
            await _unitOfWork.SaveChangesAsync();

            return ApiResponse<bool>.SuccessResponse(true, "Question deleted successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<bool>.ErrorResponse(
                "DELETE_QUESTION_FAILED", 
                "Failed to delete question", 
                ex.Message);
        }
    }
}