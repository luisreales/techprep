using AutoMapper;
using TechPrep.Application.DTOs;
using TechPrep.Application.DTOs.Topic;
using TechPrep.Application.DTOs.Challenges;
using TechPrep.Core.Entities;

namespace TechPrep.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Question mappings
        CreateMap<Question, QuestionDto>()
            .ForMember(dest => dest.TopicName, opt => opt.MapFrom(src => src.Topic != null ? src.Topic.Name : ""));
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
    }
}