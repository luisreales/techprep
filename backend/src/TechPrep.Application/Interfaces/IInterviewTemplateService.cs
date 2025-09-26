using TechPrep.Application.DTOs.Common;
using TechPrep.Application.DTOs.PracticeInterview;
using TechPrep.Core.Enums;

namespace TechPrep.Application.Interfaces;

public interface IInterviewTemplateService
{
    Task<ApiResponse<PaginatedResponse<TemplateDto>>> GetTemplatesAsync(TemplateKind? kind = null, int page = 1, int pageSize = 10);
    Task<ApiResponse<PaginatedResponse<UserAssignedTemplateDto>>> GetTemplatesByUserAsync(Guid userId, TemplateKind? kind = null, int page = 1, int pageSize = 10);
    Task<ApiResponse<TemplateDto>> GetTemplateByIdAsync(int id);
    Task<ApiResponse<TemplateDto>> CreateTemplateAsync(CreateTemplateDto createDto);
    Task<ApiResponse<TemplateDto>> UpdateTemplateAsync(int id, UpdateTemplateDto updateDto);
    Task<ApiResponse<object>> DeleteTemplateAsync(int id);
    Task<ApiResponse<TemplateDto>> CloneTemplateAsync(int id, string newName);
    Task<ApiResponse<int>> GetEligibleQuestionsCountAsync(int templateId);
}