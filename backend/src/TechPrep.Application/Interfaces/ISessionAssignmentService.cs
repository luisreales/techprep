using TechPrep.Application.DTOs.Common;
using TechPrep.Application.DTOs.PracticeInterview;
using TechPrep.Core.Enums;

namespace TechPrep.Application.Interfaces;

public interface ISessionAssignmentService
{
    Task<ApiResponse<PaginatedResponse<AssignmentDto>>> GetAssignmentsAsync(int? templateId = null, int page = 1, int pageSize = 10);
    Task<ApiResponse<AssignmentDto>> GetAssignmentByIdAsync(int id);
    Task<ApiResponse<AssignmentDto>> CreateAssignmentAsync(CreateAssignmentDto createDto);
    Task<ApiResponse<AssignmentDto>> UpdateAssignmentAsync(int id, UpdateAssignmentDto updateDto);
    Task<ApiResponse<object>> DeleteAssignmentAsync(int id);
    Task<ApiResponse<PaginatedResponse<AssignmentDto>>> GetMyAssignmentsAsync(Guid userId, TemplateKind kind, int page = 1, int pageSize = 10);
}