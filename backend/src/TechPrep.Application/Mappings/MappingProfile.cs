using AutoMapper;
using TechPrep.Application.DTOs;
using TechPrep.Application.DTOs.Topic;
using TechPrep.Application.DTOs.Challenges;
using TechPrep.Application.DTOs.PracticeInterview;
using TechPrep.Core.Entities;
using TechPrep.Core.Enums;

namespace TechPrep.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Question mappings
        CreateMap<Question, QuestionDto>()
            .ForMember(dest => dest.TopicName, opt => opt.MapFrom(src => src.Topic != null ? src.Topic.Name : ""))
            .ForMember(dest => dest.Stats, opt => opt.MapFrom(src => new QuestionStatsDto
            {
                TotalAttempts = 0,
                CorrectAttempts = 0,
                AverageScore = 0,
                AverageTimeSpent = 0,
                DifficultyRating = src.Level == DifficultyLevel.Basic
                    ? 2.0
                    : src.Level == DifficultyLevel.Advanced
                        ? 4.0
                        : src.Level == DifficultyLevel.Intermediate
                            ? 3.0
                            : 3.0
            }));
            // Note: Options and LearningResources will be auto-mapped by convention

        CreateMap<CreateQuestionDto, Question>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

        CreateMap<QuestionOption, QuestionOptionDto>();
        CreateMap<CreateQuestionOptionDto, QuestionOption>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()));

        CreateMap<UpdateQuestionOptionDto, QuestionOption>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id ?? Guid.NewGuid()));

        CreateMap<LearningResource, LearningResourceDto>();
        CreateMap<CreateLearningResourceDto, LearningResource>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

        CreateMap<UpdateLearningResourceDto, LearningResource>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id ?? Guid.NewGuid()))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

        // Topic mappings
        CreateMap<Topic, TopicDto>()
            .ForMember(dest => dest.QuestionCount, opt => opt.MapFrom(src => src.Questions.Count));

        CreateMap<CreateTopicDto, Topic>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

        CreateMap<UpdateTopicDto, Topic>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore());

        // Code Challenge mappings
        CreateMap<CodeChallenge, ChallengeListItemDto>()
            .ForMember(dest => dest.Tags, opt => opt.MapFrom(src =>
                src.Tags != null ? src.Tags.Where(ct => ct != null && ct.Tag != null && ct.Tag.Name != null).Select(ct => ct.Tag.Name) : new List<string>()));

        CreateMap<CodeChallenge, ChallengeDetailDto>()
            .ForMember(dest => dest.Tags, opt => opt.MapFrom(src =>
                src.Tags != null ? src.Tags.Where(ct => ct != null && ct.Tag != null && ct.Tag.Name != null).Select(ct => ct.Tag.Name) : new List<string>()))
            .ForMember(dest => dest.Topics, opt => opt.MapFrom(src =>
                src.Topics != null ? src.Topics.Where(ct => ct != null && ct.Topic != null && ct.Topic.Name != null).Select(ct => ct.Topic.Name) : new List<string>()));

        CreateMap<ChallengeCreateDto, CodeChallenge>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.Tags, opt => opt.Ignore())
            .ForMember(dest => dest.Topics, opt => opt.Ignore())
            .ForMember(dest => dest.Attempts, opt => opt.Ignore());

        CreateMap<ChallengeUpdateDto, CodeChallenge>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.Tags, opt => opt.Ignore())
            .ForMember(dest => dest.Topics, opt => opt.Ignore())
            .ForMember(dest => dest.Attempts, opt => opt.Ignore());

        // Tag mappings
        CreateMap<Tag, TagDto>();
        
        CreateMap<TagCreateDto, Tag>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.ChallengeTag, opt => opt.Ignore());

        CreateMap<TagUpdateDto, Tag>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.ChallengeTag, opt => opt.Ignore());

        // Challenge Attempt mappings
        CreateMap<ChallengeAttempt, AttemptDto>();

        CreateMap<AttemptCreateDto, ChallengeAttempt>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
            .ForMember(dest => dest.StartedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.FinishedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.CodeChallengeId, opt => opt.Ignore())
            .ForMember(dest => dest.UserId, opt => opt.Ignore())
            .ForMember(dest => dest.CodeChallenge, opt => opt.Ignore());

        // Interview Template mappings
        CreateMap<InterviewTemplate, TemplateDto>()
            .ForMember(dest => dest.Selection, opt => opt.MapFrom(src => src.GetSelectionCriteria()))
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
            }));

        CreateMap<CreateTemplateDto, InterviewTemplate>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.SelectionCriteriaJson, opt => opt.MapFrom(src => SerializeSelectionCriteria(src.Selection)))
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
            .ForMember(dest => dest.InterviewCost, opt => opt.MapFrom(src => src.Credits.InterviewCost))
            .ForMember(dest => dest.Assignments, opt => opt.Ignore());

        CreateMap<UpdateTemplateDto, InterviewTemplate>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.SelectionCriteriaJson, opt => opt.MapFrom(src => SerializeSelectionCriteria(src.Selection)))
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
            .ForMember(dest => dest.InterviewCost, opt => opt.MapFrom(src => src.Credits.InterviewCost))
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Assignments, opt => opt.Ignore());

        // Selection Criteria mapping for DTO compatibility
        CreateMap<SelectionCriteria, SelectionCriteriaDto>();
        CreateMap<SelectionCriteriaDto, SelectionCriteria>();
    }

    private static string SerializeSelectionCriteria(SelectionCriteriaDto criteria)
    {
        return System.Text.Json.JsonSerializer.Serialize(criteria);
    }
}
