using AutoMapper;
using System.Linq;
using TechPrep.Application.DTOs.Common;
using TechPrep.Application.DTOs.PracticeInterview;
using TechPrep.Application.Interfaces;
using TechPrep.Core.Entities;
using TechPrep.Core.Enums;
using TechPrep.Core.Interfaces;

namespace TechPrep.Application.Services;

public class InterviewTemplateService : IInterviewTemplateService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IQuestionService _questionService;
    private readonly IMapper _mapper;

    public InterviewTemplateService(
        IUnitOfWork unitOfWork,
        IQuestionService questionService,
        IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _questionService = questionService;
        _mapper = mapper;
    }

    public async Task<ApiResponse<PaginatedResponse<TemplateDto>>> GetTemplatesAsync(
        TemplateKind? kind = null,
        int page = 1,
        int pageSize = 10)
    {
        try
        {
            var templates = kind.HasValue
                ? await _unitOfWork.InterviewTemplates.GetByKindAsync(kind.Value)
                : await _unitOfWork.InterviewTemplates.GetAllAsync();

            var totalCount = templates.Count();
            var pagedTemplates = templates
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var templateDtos = _mapper.Map<List<TemplateDto>>(pagedTemplates);

            var response = new PaginatedResponse<TemplateDto>
            {
                Data = templateDtos,
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

            return ApiResponse<PaginatedResponse<TemplateDto>>.SuccessResponse(response);
        }
        catch (Exception ex)
        {
            return ApiResponse<PaginatedResponse<TemplateDto>>.ErrorResponse(
                "TEMPLATE_FETCH_ERROR",
                "Failed to fetch templates",
                ex.Message);
        }
    }

    public async Task<ApiResponse<TemplateDto>> GetTemplateByIdAsync(int id)
    {
        try
        {
            var template = await _unitOfWork.InterviewTemplates.GetWithDetailsAsync(id);
            if (template == null)
            {
                return ApiResponse<TemplateDto>.ErrorResponse(
                    "TEMPLATE_NOT_FOUND",
                    $"Template with ID {id} not found");
            }

            var templateDto = _mapper.Map<TemplateDto>(template);
            return ApiResponse<TemplateDto>.SuccessResponse(templateDto);
        }
        catch (Exception ex)
        {
            return ApiResponse<TemplateDto>.ErrorResponse(
                "TEMPLATE_FETCH_ERROR",
                "Failed to fetch template",
                ex.Message);
        }
    }

    public async Task<ApiResponse<TemplateDto>> CreateTemplateAsync(CreateTemplateDto createDto)
    {
        try
        {
            // Validate template business rules
            var validationResult = ValidateTemplate(createDto);
            if (!validationResult.Success)
                return validationResult;

            var template = _mapper.Map<InterviewTemplate>(createDto);
            template.CreatedAt = DateTime.UtcNow;
            template.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.InterviewTemplates.AddAsync(template);
            await _unitOfWork.SaveChangesAsync();

            var templateDto = _mapper.Map<TemplateDto>(template);
            return ApiResponse<TemplateDto>.SuccessResponse(templateDto, "Template created successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<TemplateDto>.ErrorResponse(
                "TEMPLATE_CREATE_ERROR",
                "Failed to create template",
                ex.Message);
        }
    }

    public async Task<ApiResponse<TemplateDto>> UpdateTemplateAsync(int id, UpdateTemplateDto updateDto)
    {
        try
        {
            var template = await _unitOfWork.InterviewTemplates.GetByIdAsync(id);
            if (template == null)
            {
                return ApiResponse<TemplateDto>.ErrorResponse(
                    "TEMPLATE_NOT_FOUND",
                    $"Template with ID {id} not found");
            }

            // Validate template business rules
            var validationResult = ValidateTemplate(updateDto);
            if (!validationResult.Success)
                return validationResult;

            _mapper.Map(updateDto, template);
            template.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.InterviewTemplates.Update(template);
            await _unitOfWork.SaveChangesAsync();

            var templateDto = _mapper.Map<TemplateDto>(template);
            return ApiResponse<TemplateDto>.SuccessResponse(templateDto, "Template updated successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<TemplateDto>.ErrorResponse(
                "TEMPLATE_UPDATE_ERROR",
                "Failed to update template",
                ex.Message);
        }
    }

    public async Task<ApiResponse<object>> DeleteTemplateAsync(int id)
    {
        try
        {
            var template = await _unitOfWork.InterviewTemplates.GetWithDetailsAsync(id);
            if (template == null)
            {
                return ApiResponse<object>.ErrorResponse(
                    "TEMPLATE_NOT_FOUND",
                    $"Template with ID {id} not found");
            }

            // Check if template has active assignments
            if (template.Assignments.Any())
            {
                return ApiResponse<object>.ErrorResponse(
                    "TEMPLATE_IN_USE",
                    "Cannot delete template with active assignments");
            }

            _unitOfWork.InterviewTemplates.Delete(template);
            await _unitOfWork.SaveChangesAsync();

            return ApiResponse<object>.SuccessResponse(null, "Template deleted successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<object>.ErrorResponse(
                "TEMPLATE_DELETE_ERROR",
                "Failed to delete template",
                ex.Message);
        }
    }

    public async Task<ApiResponse<TemplateDto>> CloneTemplateAsync(int id, string newName)
    {
        try
        {
            var original = await _unitOfWork.InterviewTemplates.GetByIdAsync(id);
            if (original == null)
            {
                return ApiResponse<TemplateDto>.ErrorResponse(
                    "TEMPLATE_NOT_FOUND",
                    $"Template with ID {id} not found");
            }

            var cloned = _mapper.Map<InterviewTemplate>(original);
            cloned.Id = 0; // Reset ID for new entity
            cloned.Name = newName;
            cloned.CreatedAt = DateTime.UtcNow;
            cloned.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.InterviewTemplates.AddAsync(cloned);
            await _unitOfWork.SaveChangesAsync();

            var templateDto = _mapper.Map<TemplateDto>(cloned);
            return ApiResponse<TemplateDto>.SuccessResponse(templateDto, "Template cloned successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<TemplateDto>.ErrorResponse(
                "TEMPLATE_CLONE_ERROR",
                "Failed to clone template",
                ex.Message);
        }
    }

    public async Task<ApiResponse<int>> GetEligibleQuestionsCountAsync(int templateId)
    {
        try
        {
            var template = await _unitOfWork.InterviewTemplates.GetByIdAsync(templateId);
            if (template == null)
            {
                return ApiResponse<int>.ErrorResponse(
                    "TEMPLATE_NOT_FOUND",
                    $"Template with ID {templateId} not found");
            }

            var criteria = template.GetSelectionCriteria();

            // This would be implemented to count eligible questions based on criteria
            // For now, return a placeholder count
            var singlesAvailable = await CountQuestionsAsync(template, criteria, QuestionType.SingleChoice);
            var multiAvailable = await CountQuestionsAsync(template, criteria, QuestionType.MultiChoice);
            var writtenAvailable = await CountQuestionsAsync(template, criteria, QuestionType.Written);

            var totalEligible = Math.Min(criteria.CountSingle, singlesAvailable)
                + Math.Min(criteria.CountMulti, multiAvailable)
                + Math.Min(criteria.CountWritten, writtenAvailable);

            return ApiResponse<int>.SuccessResponse(totalEligible);
        }
        catch (Exception ex)
        {
            return ApiResponse<int>.ErrorResponse(
                "PREVIEW_ERROR",
                "Failed to calculate eligible questions",
                ex.Message);
        }
    }

    private ApiResponse<TemplateDto> ValidateTemplate(CreateTemplateDto template)
    {
        // Business rule: Interview templates should have restricted settings
        if (template.Kind == TemplateKind.Interview)
        {
            if (template.Aids.ShowHints || template.Aids.ShowSources || template.Aids.ShowGlossary)
            {
                return ApiResponse<TemplateDto>.ErrorResponse(
                    "INVALID_INTERVIEW_CONFIG",
                    "Interview templates cannot have aids enabled");
            }

            if (template.Feedback.Mode != FeedbackMode.End)
            {
                return ApiResponse<TemplateDto>.ErrorResponse(
                    "INVALID_INTERVIEW_CONFIG",
                    "Interview templates must have feedback mode set to 'End'");
            }

            if (template.Navigation.AllowPause)
            {
                return ApiResponse<TemplateDto>.ErrorResponse(
                    "INVALID_INTERVIEW_CONFIG",
                    "Interview templates cannot allow pause");
            }

            if (template.VisibilityDefault == VisibilityType.Public)
            {
                return ApiResponse<TemplateDto>.ErrorResponse(
                    "INVALID_INTERVIEW_VISIBILITY",
                    "Interview templates cannot be public by default");
            }
        }

        // Validate that selection criteria returns at least 1 item
        var totalQuestions = template.Selection.CountSingle + template.Selection.CountMulti + template.Selection.CountWritten;
        if (totalQuestions == 0)
        {
            return ApiResponse<TemplateDto>.ErrorResponse(
                "INVALID_SELECTION",
                "Template must select at least one question. Please set the number of Single Choice, Multiple Choice, or Written questions.");
        }

        if (template.Selection.CountSingle < 0 || template.Selection.CountMulti < 0 || template.Selection.CountWritten < 0)
        {
            return ApiResponse<TemplateDto>.ErrorResponse(
                "INVALID_SELECTION",
                "Question counts cannot be negative");
        }

        // Validate timer settings
        if (template.Timers.TotalSec.HasValue && template.Timers.TotalSec <= 0)
        {
            return ApiResponse<TemplateDto>.ErrorResponse(
                "INVALID_TIMER",
                "Total time must be greater than 0");
        }

        if (template.Timers.PerQuestionSec.HasValue && template.Timers.PerQuestionSec <= 0)
        {
            return ApiResponse<TemplateDto>.ErrorResponse(
                "INVALID_TIMER",
                "Per question time must be greater than 0");
        }

        if (template.Attempts.Max < 0)
        {
            return ApiResponse<TemplateDto>.ErrorResponse(
                "INVALID_ATTEMPTS",
                "Max attempts cannot be negative");
        }

        if (template.Attempts.CooldownHours < 0)
        {
            return ApiResponse<TemplateDto>.ErrorResponse(
                "INVALID_ATTEMPTS",
                "Cooldown hours cannot be negative");
        }

        if (template.Navigation.MaxBacktracks.HasValue && template.Navigation.MaxBacktracks < 0)
        {
            return ApiResponse<TemplateDto>.ErrorResponse(
                "INVALID_NAVIGATION",
                "Max backtracks cannot be negative");
        }

        if (template.Credits.InterviewCost < 0)
        {
            return ApiResponse<TemplateDto>.ErrorResponse(
                "INVALID_CREDITS",
                "Interview cost cannot be negative");
        }

        return ApiResponse<TemplateDto>.SuccessResponse(null!, "Validation passed");
    }

    private async Task<int> CountQuestionsAsync(InterviewTemplate template, SelectionCriteria criteria, QuestionType type)
    {
        var topicIds = criteria.ByTopics.Any()
            ? criteria.ByTopics.ConvertAll<int?>(id => id)
            : new List<int?> { null };

        var levelFilters = BuildLevelFilters(criteria.Levels);

        var total = 0;
        foreach (var topicId in topicIds)
        {
            foreach (var level in levelFilters)
            {
                total += await _questionService.GetQuestionsCountAsync(
                    topicId,
                    type,
                    level,
                    usableInPractice: template.Kind == TemplateKind.Practice ? true : null,
                    usableInInterview: template.Kind == TemplateKind.Interview ? true : null,
                    enforceInterviewCooldown: template.Kind == TemplateKind.Interview);
            }
        }

        return total;
    }

    private static List<DifficultyLevel?> BuildLevelFilters(IEnumerable<string> levelTokens)
    {
        var tokens = levelTokens?.Where(l => !string.IsNullOrWhiteSpace(l)).ToList() ?? new List<string>();
        if (!tokens.Any())
        {
            return new List<DifficultyLevel?> { null };
        }

        var levels = new List<DifficultyLevel?>();
        foreach (var token in tokens)
        {
            if (Enum.TryParse(token, true, out DifficultyLevel parsed))
            {
                levels.Add(parsed);
            }
        }

        return levels.Any() ? levels : new List<DifficultyLevel?> { null };
    }
}
