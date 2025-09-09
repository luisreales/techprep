using TechPrep.Application.DTOs.Common;
using TechPrep.Application.DTOs.Topic;

namespace TechPrep.Application.Interfaces;

public interface ITopicService
{
    Task<ApiResponse<IEnumerable<TopicDto>>> GetAllTopicsAsync();
    Task<ApiResponse<IEnumerable<TopicDto>>> GetActiveTopicsAsync();
    Task<ApiResponse<TopicDto>> GetTopicByIdAsync(int id);
    Task<ApiResponse<TopicDto>> CreateTopicAsync(CreateTopicDto createTopicDto);
    Task<ApiResponse<TopicDto>> UpdateTopicAsync(int id, UpdateTopicDto updateTopicDto);
    Task<ApiResponse<bool>> DeleteTopicAsync(int id);
}