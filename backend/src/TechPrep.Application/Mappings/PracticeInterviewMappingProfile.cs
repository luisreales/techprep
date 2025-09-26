using AutoMapper;
using System.Linq;
using TechPrep.Application.DTOs.PracticeInterview;
using TechPrep.Core.Entities;

namespace TechPrep.Application.Mappings;

public class PracticeInterviewMappingProfile : Profile
{
    public PracticeInterviewMappingProfile()
    {
        // Template mappings
        CreateMap<InterviewTemplate, TemplateDto>()
            .ForMember(dest => dest.Selection, opt => opt.Ignore())
            .ForMember(dest => dest.Timers, opt => opt.MapFrom(src => new TimersDto
            {
                TotalSec = src.TotalTimeSec,
                PerQuestionSec = src.PerQuestionTimeSec
            }))
            .ForMember(dest => dest.Navigation, opt => opt.MapFrom(src => new NavigationDto
            {
                Mode = src.NavigationMode,
                AllowPause = src.AllowPause,
                MaxBacktracks = src.MaxBacktracks
            }))
            .ForMember(dest => dest.Feedback, opt => opt.MapFrom(src => new FeedbackDto
            {
                Mode = src.FeedbackMode
            }))
            .ForMember(dest => dest.Aids, opt => opt.MapFrom(src => new AidsDto
            {
                ShowHints = src.ShowHints,
                ShowSources = src.ShowSources,
                ShowGlossary = src.ShowGlossary
            }))
            .ForMember(dest => dest.Attempts, opt => opt.MapFrom(src => new AttemptsDto
            {
                Max = src.MaxAttempts,
                CooldownHours = src.CooldownHours
            }))
            .ForMember(dest => dest.Integrity, opt => opt.MapFrom(src => new IntegrityDto
            {
                RequireFullscreen = src.RequireFullscreen,
                BlockCopyPaste = src.BlockCopyPaste,
                TrackFocusLoss = src.TrackFocusLoss,
                Proctoring = src.ProctoringEnabled
            }))
            .ForMember(dest => dest.Certification, opt => opt.MapFrom(src => new CertificationDto
            {
                Enabled = src.CertificationEnabled
            }))
            .ForMember(dest => dest.Credits, opt => opt.MapFrom(src => new CreditsDto
            {
                InterviewCost = src.InterviewCost
            }))
            .AfterMap((src, dest) =>
            {
                var selection = src.GetSelectionCriteria();
                dest.Selection = new SelectionCriteriaDto
                {
                    ByTopics = selection.ByTopics.ToList(),
                    Levels = selection.Levels.ToList(),
                    CountSingle = selection.CountSingle,
                    CountMulti = selection.CountMulti,
                    CountWritten = selection.CountWritten
                };
            });

        CreateMap<CreateTemplateDto, InterviewTemplate>()
            .ForMember(dest => dest.SelectionCriteriaJson, opt => opt.MapFrom(src => System.Text.Json.JsonSerializer.Serialize(src.Selection, (System.Text.Json.JsonSerializerOptions?)null)))
            .ForMember(dest => dest.TotalTimeSec, opt => opt.MapFrom(src => src.Timers.TotalSec))
            .ForMember(dest => dest.PerQuestionTimeSec, opt => opt.MapFrom(src => src.Timers.PerQuestionSec))
            .ForMember(dest => dest.NavigationMode, opt => opt.MapFrom(src => src.Navigation.Mode))
            .ForMember(dest => dest.AllowPause, opt => opt.MapFrom(src => src.Navigation.AllowPause))
            .ForMember(dest => dest.MaxBacktracks, opt => opt.MapFrom(src => src.Navigation.MaxBacktracks))
            .ForMember(dest => dest.FeedbackMode, opt => opt.MapFrom(src => src.Feedback.Mode))
            .ForMember(dest => dest.ShowHints, opt => opt.MapFrom(src => src.Aids.ShowHints))
            .ForMember(dest => dest.ShowSources, opt => opt.MapFrom(src => src.Aids.ShowSources))
            .ForMember(dest => dest.ShowGlossary, opt => opt.MapFrom(src => src.Aids.ShowGlossary))
            .ForMember(dest => dest.MaxAttempts, opt => opt.MapFrom(src => src.Attempts.Max))
            .ForMember(dest => dest.CooldownHours, opt => opt.MapFrom(src => src.Attempts.CooldownHours))
            .ForMember(dest => dest.RequireFullscreen, opt => opt.MapFrom(src => src.Integrity.RequireFullscreen))
            .ForMember(dest => dest.BlockCopyPaste, opt => opt.MapFrom(src => src.Integrity.BlockCopyPaste))
            .ForMember(dest => dest.TrackFocusLoss, opt => opt.MapFrom(src => src.Integrity.TrackFocusLoss))
            .ForMember(dest => dest.ProctoringEnabled, opt => opt.MapFrom(src => src.Integrity.Proctoring))
            .ForMember(dest => dest.CertificationEnabled, opt => opt.MapFrom(src => src.Certification.Enabled))
            .ForMember(dest => dest.InterviewCost, opt => opt.MapFrom(src => src.Credits.InterviewCost));

        CreateMap<UpdateTemplateDto, InterviewTemplate>()
            .IncludeBase<CreateTemplateDto, InterviewTemplate>();

        CreateMap<InterviewTemplate, UserAssignedTemplateDto>()
            .IncludeBase<InterviewTemplate, TemplateDto>()
            .ForMember(dest => dest.AssignmentId, opt => opt.Ignore());

        // Assignment mappings
        CreateMap<SessionAssignment, AssignmentDto>()
            .ForMember(dest => dest.TemplateName, opt => opt.MapFrom(src => src.Template.Name))
            .ForMember(dest => dest.TemplateKind, opt => opt.MapFrom(src => src.Template.Kind))
            .ForMember(dest => dest.GroupName, opt => opt.MapFrom(src => src.Group != null ? src.Group.Name : null))
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User != null ? src.User.UserName : null));

        CreateMap<CreateAssignmentDto, SessionAssignment>();
        CreateMap<UpdateAssignmentDto, SessionAssignment>();

        // Group mappings
        CreateMap<Group, GroupDto>()
            .ForMember(dest => dest.MemberCount, opt => opt.MapFrom(src => src.UserGroups.Count));

        CreateMap<Group, GroupDetailDto>()
            .IncludeBase<Group, GroupDto>()
            .ForMember(dest => dest.Members, opt => opt.MapFrom(src => src.UserGroups));

        CreateMap<UserGroup, GroupMemberDto>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.UserName))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User.Email));

        CreateMap<CreateGroupDto, Group>();
        CreateMap<UpdateGroupDto, Group>();

        // Session mappings
        CreateMap<PracticeSessionNew, PracticeSessionDto>()
            .ForMember(dest => dest.AssignmentName, opt => opt.MapFrom(src => src.Assignment != null ? src.Assignment.Template.Name : null));

        CreateMap<InterviewSessionNew, InterviewSessionDto>()
            .ForMember(dest => dest.AssignmentName, opt => opt.MapFrom(src => "Interview Template")); // Placeholder

        CreateMap<PracticeAnswer, PracticeAnswerDto>()
            .ForMember(dest => dest.QuestionText, opt => opt.MapFrom(src => src.Question.Text))
            .ForMember(dest => dest.SelectedOptionIds, opt => opt.MapFrom(src =>
                !string.IsNullOrEmpty(src.SelectedOptionIds) ?
                System.Text.Json.JsonSerializer.Deserialize<List<Guid>>(src.SelectedOptionIds, (System.Text.Json.JsonSerializerOptions?)null) :
                null));

        CreateMap<InterviewAnswerNew, InterviewAnswerDto>()
            .ForMember(dest => dest.QuestionText, opt => opt.MapFrom(src => "Question Text")) // Placeholder
            .ForMember(dest => dest.SelectedOptionIds, opt => opt.MapFrom(src =>
                !string.IsNullOrEmpty(src.ChosenOptionIdsJson) ?
                System.Text.Json.JsonSerializer.Deserialize<List<Guid>>(src.ChosenOptionIdsJson, (System.Text.Json.JsonSerializerOptions?)null) :
                null));

        // Credit mappings
        CreateMap<CreditLedger, CreditLedgerDto>();

        // Certificate mappings
        CreateMap<InterviewCertificate, CertificateDto>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.UserName))
            .ForMember(dest => dest.TemplateName, opt => opt.MapFrom(src => src.TemplateName))
            .ForMember(dest => dest.TotalScore, opt => opt.MapFrom(src => src.TotalScore))
            .ForMember(dest => dest.CompletedAt, opt => opt.MapFrom(src => src.CompletedAt));
    }
}
