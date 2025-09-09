using TechPrep.Application.DTOs.Common;
using TechPrep.Application.DTOs.Question;

namespace TechPrep.Application.Interfaces;

public interface IQuestionService
{
    Task<PaginatedResponse<QuestionDto>> GetQuestionsAsync(QuestionFilterDto filter);
    Task<ApiResponse<QuestionDto>> GetQuestionByIdAsync(Guid id);
    Task<ApiResponse<QuestionDto>> CreateQuestionAsync(CreateQuestionDto createQuestionDto);
    Task<ApiResponse<QuestionDto>> UpdateQuestionAsync(Guid id, CreateQuestionDto updateQuestionDto);
    Task<ApiResponse<bool>> DeleteQuestionAsync(Guid id);
}