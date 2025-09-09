using AutoMapper;
using TechPrep.Application.DTOs.Common;
using TechPrep.Application.DTOs.Topic;
using TechPrep.Application.Interfaces;
using TechPrep.Core.Entities;
using TechPrep.Core.Interfaces;

namespace TechPrep.Application.Services;

public class TopicService : ITopicService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public TopicService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ApiResponse<IEnumerable<TopicDto>>> GetAllTopicsAsync()
    {
        try
        {
            var topics = await _unitOfWork.Topics.GetAllAsync();
            var topicDtos = _mapper.Map<IEnumerable<TopicDto>>(topics);
            
            return ApiResponse<IEnumerable<TopicDto>>.SuccessResponse(topicDtos);
        }
        catch (Exception ex)
        {
            return ApiResponse<IEnumerable<TopicDto>>.ErrorResponse(
                "GET_TOPICS_FAILED", 
                "Failed to retrieve topics", 
                ex.Message);
        }
    }

    public async Task<ApiResponse<IEnumerable<TopicDto>>> GetActiveTopicsAsync()
    {
        try
        {
            var topics = await _unitOfWork.Topics.GetActiveTopicsAsync();
            var topicDtos = _mapper.Map<IEnumerable<TopicDto>>(topics);
            
            return ApiResponse<IEnumerable<TopicDto>>.SuccessResponse(topicDtos);
        }
        catch (Exception ex)
        {
            return ApiResponse<IEnumerable<TopicDto>>.ErrorResponse(
                "GET_ACTIVE_TOPICS_FAILED", 
                "Failed to retrieve active topics", 
                ex.Message);
        }
    }

    public async Task<ApiResponse<TopicDto>> GetTopicByIdAsync(int id)
    {
        try
        {
            var topic = await _unitOfWork.Topics.GetByIdAsync(id);
            
            if (topic == null)
            {
                return ApiResponse<TopicDto>.ErrorResponse(
                    "TOPIC_NOT_FOUND", 
                    "Topic not found");
            }

            var topicDto = _mapper.Map<TopicDto>(topic);
            return ApiResponse<TopicDto>.SuccessResponse(topicDto);
        }
        catch (Exception ex)
        {
            return ApiResponse<TopicDto>.ErrorResponse(
                "GET_TOPIC_FAILED", 
                "Failed to retrieve topic", 
                ex.Message);
        }
    }

    public async Task<ApiResponse<TopicDto>> CreateTopicAsync(CreateTopicDto createTopicDto)
    {
        try
        {
            // Check if topic with same name already exists
            var existingTopic = await _unitOfWork.Topics.GetByNameAsync(createTopicDto.Name);
            if (existingTopic != null)
            {
                return ApiResponse<TopicDto>.ErrorResponse(
                    "TOPIC_EXISTS", 
                    "A topic with this name already exists");
            }

            var topic = _mapper.Map<Topic>(createTopicDto);
            await _unitOfWork.Topics.AddAsync(topic);
            await _unitOfWork.SaveChangesAsync();

            var topicDto = _mapper.Map<TopicDto>(topic);
            return ApiResponse<TopicDto>.SuccessResponse(topicDto, "Topic created successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<TopicDto>.ErrorResponse(
                "CREATE_TOPIC_FAILED", 
                "Failed to create topic", 
                ex.Message);
        }
    }

    public async Task<ApiResponse<TopicDto>> UpdateTopicAsync(int id, UpdateTopicDto updateTopicDto)
    {
        try
        {
            var topic = await _unitOfWork.Topics.GetByIdAsync(id);
            
            if (topic == null)
            {
                return ApiResponse<TopicDto>.ErrorResponse(
                    "TOPIC_NOT_FOUND", 
                    "Topic not found");
            }

            // Check if another topic with same name exists
            var existingTopic = await _unitOfWork.Topics.GetByNameAsync(updateTopicDto.Name);
            if (existingTopic != null && existingTopic.Id != id)
            {
                return ApiResponse<TopicDto>.ErrorResponse(
                    "TOPIC_EXISTS", 
                    "A topic with this name already exists");
            }

            _mapper.Map(updateTopicDto, topic);
            _unitOfWork.Topics.Update(topic);
            await _unitOfWork.SaveChangesAsync();

            var topicDto = _mapper.Map<TopicDto>(topic);
            return ApiResponse<TopicDto>.SuccessResponse(topicDto, "Topic updated successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<TopicDto>.ErrorResponse(
                "UPDATE_TOPIC_FAILED", 
                "Failed to update topic", 
                ex.Message);
        }
    }

    public async Task<ApiResponse<bool>> DeleteTopicAsync(int id)
    {
        try
        {
            var topic = await _unitOfWork.Topics.GetByIdAsync(id);
            
            if (topic == null)
            {
                return ApiResponse<bool>.ErrorResponse(
                    "TOPIC_NOT_FOUND", 
                    "Topic not found");
            }

            // Check if topic has questions
            var hasQuestions = await _unitOfWork.Questions.ExistsAsync(q => q.TopicId == id);
            if (hasQuestions)
            {
                return ApiResponse<bool>.ErrorResponse(
                    "TOPIC_HAS_QUESTIONS", 
                    "Cannot delete topic that has questions");
            }

            _unitOfWork.Topics.Delete(topic);
            await _unitOfWork.SaveChangesAsync();

            return ApiResponse<bool>.SuccessResponse(true, "Topic deleted successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<bool>.ErrorResponse(
                "DELETE_TOPIC_FAILED", 
                "Failed to delete topic", 
                ex.Message);
        }
    }
}