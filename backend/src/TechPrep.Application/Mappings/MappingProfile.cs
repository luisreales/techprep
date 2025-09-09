using AutoMapper;
using TechPrep.Application.DTOs.Question;
using TechPrep.Application.DTOs.Session;
using TechPrep.Application.DTOs.Topic;
using TechPrep.Application.DTOs.User;
using TechPrep.Core.Entities;

namespace TechPrep.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // User mappings
        CreateMap<User, UserDto>();
        CreateMap<RegisterDto, User>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Email))
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()));
        CreateMap<UpdateUserProfileDto, User>()
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

        // Topic mappings  
        CreateMap<Topic, TopicDto>()
            .ForMember(dest => dest.QuestionCount, opt => opt.MapFrom(src => 0));
        CreateMap<CreateTopicDto, Topic>();
        CreateMap<UpdateTopicDto, Topic>();

        // Question mappings
        CreateMap<Question, QuestionDto>()
            .ForMember(dest => dest.TopicName, opt => opt.MapFrom(src => ""))
            .ForMember(dest => dest.Options, opt => opt.MapFrom(src => new List<QuestionOption>()))
            .ForMember(dest => dest.LearningResources, opt => opt.MapFrom(src => new List<LearningResource>()));

        CreateMap<CreateQuestionDto, Question>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

        CreateMap<QuestionOption, QuestionOptionDto>();
        CreateMap<CreateQuestionOptionDto, QuestionOption>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()));

        CreateMap<LearningResource, LearningResourceDto>();
        CreateMap<CreateLearningResourceDto, LearningResource>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

        // Session mappings
        CreateMap<InterviewSession, InterviewSessionDto>()
            .ForMember(dest => dest.TopicName, opt => opt.MapFrom(src => ""))
            .ForMember(dest => dest.Answers, opt => opt.MapFrom(src => new List<InterviewAnswer>()));

        CreateMap<StartSessionDto, InterviewSession>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
            .ForMember(dest => dest.StartedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.TotalQuestions, opt => opt.MapFrom(src => src.QuestionCount));

        CreateMap<InterviewAnswer, InterviewAnswerDto>()
            .ForMember(dest => dest.QuestionText, opt => opt.MapFrom(src => ""))
            .ForMember(dest => dest.SelectedOptions, opt => opt.Ignore());

        CreateMap<SubmitAnswerDto, InterviewAnswer>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
            .ForMember(dest => dest.GivenAnswer, opt => opt.MapFrom(src => src.WrittenAnswer))
            .ForMember(dest => dest.SelectedOptionsJson, opt => opt.Ignore())
            .ForMember(dest => dest.AnsweredAt, opt => opt.MapFrom(src => DateTime.UtcNow));
    }
}