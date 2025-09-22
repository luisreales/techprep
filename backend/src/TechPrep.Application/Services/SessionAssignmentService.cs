using AutoMapper;
using TechPrep.Application.DTOs.Common;
using TechPrep.Application.DTOs.PracticeInterview;
using TechPrep.Application.Interfaces;
using TechPrep.Core.Entities;
using TechPrep.Core.Enums;
using TechPrep.Core.Interfaces;

namespace TechPrep.Application.Services;

public class SessionAssignmentService : ISessionAssignmentService
{
    private readonly ISessionAssignmentRepository _assignmentRepository;
    private readonly IInterviewTemplateRepository _templateRepository;
    private readonly IGroupRepository _groupRepository;
    private readonly IMapper _mapper;

    public SessionAssignmentService(
        ISessionAssignmentRepository assignmentRepository,
        IInterviewTemplateRepository templateRepository,
        IGroupRepository groupRepository,
        IMapper mapper)
    {
        _assignmentRepository = assignmentRepository;
        _templateRepository = templateRepository;
        _groupRepository = groupRepository;
        _mapper = mapper;
    }

    public async Task<ApiResponse<PaginatedResponse<AssignmentDto>>> GetAssignmentsAsync(
        int? templateId = null,
        int page = 1,
        int pageSize = 10)
    {
        try
        {
            var assignments = templateId.HasValue
                ? await _assignmentRepository.GetByTemplateIdAsync(templateId.Value)
                : await _assignmentRepository.GetAllAsync();

            var totalCount = assignments.Count();
            var pagedAssignments = assignments
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var assignmentDtos = _mapper.Map<List<AssignmentDto>>(pagedAssignments);

            var response = new PaginatedResponse<AssignmentDto>
            {
                Data = assignmentDtos,
                Pagination = new PaginationInfo
                {
                    Page = page,
                    PageSize = pageSize,
                    TotalItems = totalCount,
                    TotalPages = (int)Math.Ceiling((double)totalCount / pageSize),
                    HasNext = page < (int)Math.Ceiling((double)totalCount / pageSize),
                    HasPrevious = page > 1
                }
            };

            return ApiResponse<PaginatedResponse<AssignmentDto>>.SuccessResponse(response);
        }
        catch (Exception ex)
        {
            return ApiResponse<PaginatedResponse<AssignmentDto>>.ErrorResponse(
                "ASSIGNMENT_FETCH_ERROR",
                "Failed to fetch assignments",
                ex.Message);
        }
    }

    public async Task<ApiResponse<AssignmentDto>> GetAssignmentByIdAsync(int id)
    {
        try
        {
            var assignment = await _assignmentRepository.GetWithDetailsAsync(id);
            if (assignment == null)
            {
                return ApiResponse<AssignmentDto>.ErrorResponse(
                    "ASSIGNMENT_NOT_FOUND",
                    $"Assignment with ID {id} not found");
            }

            var assignmentDto = _mapper.Map<AssignmentDto>(assignment);
            return ApiResponse<AssignmentDto>.SuccessResponse(assignmentDto);
        }
        catch (Exception ex)
        {
            return ApiResponse<AssignmentDto>.ErrorResponse(
                "ASSIGNMENT_FETCH_ERROR",
                "Failed to fetch assignment",
                ex.Message);
        }
    }

    public async Task<ApiResponse<AssignmentDto>> CreateAssignmentAsync(CreateAssignmentDto createDto)
    {
        try
        {
            // Validate assignment
            var validationResult = await ValidateAssignmentAsync(createDto);
            if (!validationResult.Success)
                return validationResult;

            var assignment = _mapper.Map<SessionAssignment>(createDto);
            assignment.CreatedAt = DateTime.UtcNow;
            assignment.UpdatedAt = DateTime.UtcNow;

            await _assignmentRepository.AddAsync(assignment);

            var assignmentDto = _mapper.Map<AssignmentDto>(assignment);
            return ApiResponse<AssignmentDto>.SuccessResponse(assignmentDto, "Assignment created successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<AssignmentDto>.ErrorResponse(
                "ASSIGNMENT_CREATE_ERROR",
                "Failed to create assignment",
                ex.Message);
        }
    }

    public async Task<ApiResponse<AssignmentDto>> UpdateAssignmentAsync(int id, UpdateAssignmentDto updateDto)
    {
        try
        {
            var assignment = await _assignmentRepository.GetByIdAsync(id);
            if (assignment == null)
            {
                return ApiResponse<AssignmentDto>.ErrorResponse(
                    "ASSIGNMENT_NOT_FOUND",
                    $"Assignment with ID {id} not found");
            }

            // Validate assignment
            var validationResult = await ValidateAssignmentAsync(updateDto);
            if (!validationResult.Success)
                return validationResult;

            _mapper.Map(updateDto, assignment);
            assignment.UpdatedAt = DateTime.UtcNow;

            _assignmentRepository.Update(assignment);

            var assignmentDto = _mapper.Map<AssignmentDto>(assignment);
            return ApiResponse<AssignmentDto>.SuccessResponse(assignmentDto, "Assignment updated successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<AssignmentDto>.ErrorResponse(
                "ASSIGNMENT_UPDATE_ERROR",
                "Failed to update assignment",
                ex.Message);
        }
    }

    public async Task<ApiResponse<object>> DeleteAssignmentAsync(int id)
    {
        try
        {
            var assignment = await _assignmentRepository.GetWithDetailsAsync(id);
            if (assignment == null)
            {
                return ApiResponse<object>.ErrorResponse(
                    "ASSIGNMENT_NOT_FOUND",
                    $"Assignment with ID {id} not found");
            }

            _assignmentRepository.Delete(assignment);

            return ApiResponse<object>.SuccessResponse(null, "Assignment deleted successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<object>.ErrorResponse(
                "ASSIGNMENT_DELETE_ERROR",
                "Failed to delete assignment",
                ex.Message);
        }
    }

    public async Task<ApiResponse<PaginatedResponse<AssignmentDto>>> GetMyAssignmentsAsync(
        Guid userId,
        TemplateKind kind,
        int page = 1,
        int pageSize = 10)
    {
        try
        {
            var assignments = await _assignmentRepository.GetByUserIdAsync(userId, kind);

            // Filter by assignment window if applicable
            var currentTime = DateTime.UtcNow;
            var validAssignments = assignments.Where(a =>
                (!a.WindowStart.HasValue || a.WindowStart <= currentTime) &&
                (!a.WindowEnd.HasValue || a.WindowEnd >= currentTime));

            var totalCount = validAssignments.Count();
            var pagedAssignments = validAssignments
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var assignmentDtos = _mapper.Map<List<AssignmentDto>>(pagedAssignments);

            var response = new PaginatedResponse<AssignmentDto>
            {
                Data = assignmentDtos,
                Pagination = new PaginationInfo
                {
                    Page = page,
                    PageSize = pageSize,
                    TotalItems = totalCount,
                    TotalPages = (int)Math.Ceiling((double)totalCount / pageSize),
                    HasNext = page < (int)Math.Ceiling((double)totalCount / pageSize),
                    HasPrevious = page > 1
                }
            };

            return ApiResponse<PaginatedResponse<AssignmentDto>>.SuccessResponse(response);
        }
        catch (Exception ex)
        {
            return ApiResponse<PaginatedResponse<AssignmentDto>>.ErrorResponse(
                "MY_ASSIGNMENTS_FETCH_ERROR",
                "Failed to fetch user assignments",
                ex.Message);
        }
    }

    private async Task<ApiResponse<AssignmentDto>> ValidateAssignmentAsync(CreateAssignmentDto assignment)
    {
        // Validate template exists
        var template = await _templateRepository.GetByIdAsync(assignment.TemplateId);
        if (template == null)
        {
            return ApiResponse<AssignmentDto>.ErrorResponse(
                "TEMPLATE_NOT_FOUND",
                "Referenced template does not exist");
        }

        // Business rule: Interviews should not be public by default
        if (template.Kind == TemplateKind.Interview && assignment.Visibility == VisibilityType.Public)
        {
            return ApiResponse<AssignmentDto>.ErrorResponse(
                "INVALID_INTERVIEW_VISIBILITY",
                "Interview assignments should not be public");
        }

        // Validate group exists if group visibility
        if (assignment.Visibility == VisibilityType.Group)
        {
            if (!assignment.GroupId.HasValue)
            {
                return ApiResponse<AssignmentDto>.ErrorResponse(
                    "GROUP_REQUIRED",
                    "Group ID is required for group visibility");
            }

            var group = await _groupRepository.GetByIdAsync(assignment.GroupId.Value);
            if (group == null)
            {
                return ApiResponse<AssignmentDto>.ErrorResponse(
                    "GROUP_NOT_FOUND",
                    "Referenced group does not exist");
            }
        }

        // Validate user exists if private visibility
        if (assignment.Visibility == VisibilityType.Private && !assignment.UserId.HasValue)
        {
            return ApiResponse<AssignmentDto>.ErrorResponse(
                "USER_REQUIRED",
                "User ID is required for private visibility");
        }

        // Validate time window
        if (assignment.WindowStart.HasValue && assignment.WindowEnd.HasValue &&
            assignment.WindowStart >= assignment.WindowEnd)
        {
            return ApiResponse<AssignmentDto>.ErrorResponse(
                "INVALID_TIME_WINDOW",
                "Window start time must be before end time");
        }

        return ApiResponse<AssignmentDto>.SuccessResponse(null!, "Validation passed");
    }
}