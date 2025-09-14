using AutoMapper;
using TechPrep.Application.DTOs.Challenges;
using TechPrep.Application.Interfaces;
using TechPrep.Core.Entities;
using TechPrep.Core.Enums;
using TechPrep.Core.Interfaces;

namespace TechPrep.Application.Services;

public class CodeChallengeService : ICodeChallengeService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CodeChallengeService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<List<ChallengeListItemDto>> GetChallengesAsync(
        ChallengeLanguage? language = null,
        ChallengeDifficulty? difficulty = null,
        string? searchTerm = null,
        IEnumerable<int>? tagIds = null,
        IEnumerable<int>? topicIds = null,
        int page = 1,
        int limit = 25)
    {
        try
        {
            var skip = (page - 1) * limit;
            var challenges = await _unitOfWork.CodeChallenges.GetByFiltersAsync(
                language, difficulty, searchTerm, tagIds, topicIds, skip, limit);

            return _mapper.Map<List<ChallengeListItemDto>>(challenges);
        }
        catch (Exception)
        {
            return new List<ChallengeListItemDto>();
        }
    }

    public async Task<ChallengeDetailDto?> GetChallengeByIdAsync(int id)
    {
        try
        {
            var challenge = await _unitOfWork.CodeChallenges.GetWithDetailsAsync(id);
            
            if (challenge == null)
                return null;

            return _mapper.Map<ChallengeDetailDto>(challenge);
        }
        catch (Exception)
        {
            return null;
        }
    }

    public async Task<ChallengeDetailDto> CreateChallengeAsync(ChallengeCreateDto createDto)
    {
        try
        {
            // Parse enums from string values
            if (!Enum.TryParse<ChallengeLanguage>(createDto.Language, true, out var language))
            {
                throw new ArgumentException($"Invalid language: {createDto.Language}");
            }

            if (!Enum.TryParse<ChallengeDifficulty>(createDto.Difficulty, true, out var difficulty))
            {
                throw new ArgumentException($"Invalid difficulty: {createDto.Difficulty}");
            }

            var challenge = new CodeChallenge
            {
                Title = createDto.Title,
                Language = language,
                Difficulty = difficulty,
                Prompt = createDto.Prompt,
                OfficialSolution = createDto.OfficialSolution,
                TestsJson = createDto.TestsJson,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.CodeChallenges.AddAsync(challenge);
            await _unitOfWork.SaveChangesAsync();

            // Handle tags
            if (createDto.Tags?.Any() == true)
            {
                await HandleTagsAsync(challenge.Id, createDto.Tags);
            }

            // Handle topics
            if (createDto.TopicIds?.Any() == true)
            {
                await HandleTopicsAsync(challenge.Id, createDto.TopicIds);
            }

            await _unitOfWork.SaveChangesAsync();

            // Return the complete challenge with relationships
            var createdChallenge = await _unitOfWork.CodeChallenges.GetWithDetailsAsync(challenge.Id);
            return _mapper.Map<ChallengeDetailDto>(createdChallenge);
        }
        catch (Exception)
        {
            throw;
        }
    }

    public async Task<ChallengeDetailDto?> UpdateChallengeAsync(int id, ChallengeUpdateDto updateDto)
    {
        try
        {
            var challenge = await _unitOfWork.CodeChallenges.GetWithDetailsAsync(id);
            
            if (challenge == null)
                return null;

            // Parse enums from string values
            if (!Enum.TryParse<ChallengeLanguage>(updateDto.Language, true, out var language))
            {
                throw new ArgumentException($"Invalid language: {updateDto.Language}");
            }

            if (!Enum.TryParse<ChallengeDifficulty>(updateDto.Difficulty, true, out var difficulty))
            {
                throw new ArgumentException($"Invalid difficulty: {updateDto.Difficulty}");
            }

            // Update basic properties
            challenge.Title = updateDto.Title;
            challenge.Language = language;
            challenge.Difficulty = difficulty;
            challenge.Prompt = updateDto.Prompt;
            challenge.OfficialSolution = updateDto.OfficialSolution;
            challenge.TestsJson = updateDto.TestsJson;
            challenge.UpdatedAt = DateTime.UtcNow;

            // Clear existing relationships
            if (challenge.Tags.Any())
            {
                _unitOfWork.Repository<ChallengeTag>().DeleteRange(challenge.Tags);
            }

            if (challenge.Topics.Any())
            {
                _unitOfWork.Repository<ChallengeTopic>().DeleteRange(challenge.Topics);
            }

            _unitOfWork.CodeChallenges.Update(challenge);
            await _unitOfWork.SaveChangesAsync();

            // Handle tags
            if (updateDto.Tags?.Any() == true)
            {
                await HandleTagsAsync(challenge.Id, updateDto.Tags);
            }

            // Handle topics
            if (updateDto.TopicIds?.Any() == true)
            {
                await HandleTopicsAsync(challenge.Id, updateDto.TopicIds);
            }

            await _unitOfWork.SaveChangesAsync();

            // Return the updated challenge with relationships
            var updatedChallenge = await _unitOfWork.CodeChallenges.GetWithDetailsAsync(challenge.Id);
            return _mapper.Map<ChallengeDetailDto>(updatedChallenge);
        }
        catch (Exception)
        {
            throw;
        }
    }

    public async Task<bool> DeleteChallengeAsync(int id)
    {
        try
        {
            var challenge = await _unitOfWork.CodeChallenges.GetByIdAsync(id);
            
            if (challenge == null)
                return false;

            _unitOfWork.CodeChallenges.Delete(challenge);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }
        catch (Exception)
        {
            return false;
        }
    }

    public async Task<int> GetChallengesCountAsync(
        ChallengeLanguage? language = null,
        ChallengeDifficulty? difficulty = null,
        string? searchTerm = null,
        IEnumerable<int>? tagIds = null,
        IEnumerable<int>? topicIds = null)
    {
        try
        {
            return await _unitOfWork.CodeChallenges.GetCountByFiltersAsync(
                language, difficulty, searchTerm, tagIds, topicIds);
        }
        catch (Exception)
        {
            return 0;
        }
    }

    public async Task<AttemptDto> SubmitAttemptAsync(int challengeId, Guid userId, AttemptCreateDto attemptDto)
    {
        try
        {
            // Validate challenge exists
            var challenge = await _unitOfWork.CodeChallenges.GetByIdAsync(challengeId);
            if (challenge == null)
            {
                throw new ArgumentException("Challenge not found");
            }

            var attempt = new ChallengeAttempt
            {
                CodeChallengeId = challengeId,
                UserId = userId,
                SubmittedCode = attemptDto.SubmittedCode,
                MarkedSolved = attemptDto.MarkSolved,
                Score = attemptDto.Score,
                Notes = attemptDto.Notes,
                StartedAt = DateTime.UtcNow,
                FinishedAt = attemptDto.MarkSolved.HasValue ? DateTime.UtcNow : null
            };

            await _unitOfWork.Repository<ChallengeAttempt>().AddAsync(attempt);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<AttemptDto>(attempt);
        }
        catch (Exception)
        {
            throw;
        }
    }

    public async Task<List<AttemptDto>> GetUserAttemptsAsync(Guid userId, int page = 1, int limit = 25)
    {
        try
        {
            var skip = (page - 1) * limit;
            var attempts = await _unitOfWork.ChallengeAttempts.GetUserAttemptsAsync(userId, skip, limit);

            return _mapper.Map<List<AttemptDto>>(attempts);
        }
        catch (Exception)
        {
            return new List<AttemptDto>();
        }
    }

    public async Task<AttemptDto?> GetLatestAttemptAsync(int challengeId, Guid userId)
    {
        try
        {
            var latestAttempt = await _unitOfWork.ChallengeAttempts.GetLatestAttemptAsync(challengeId, userId);
            
            if (latestAttempt == null)
                return null;

            return _mapper.Map<AttemptDto>(latestAttempt);
        }
        catch (Exception)
        {
            return null;
        }
    }

    private async Task HandleTagsAsync(int challengeId, List<string> tagNames)
    {
        var challengeTags = new List<ChallengeTag>();

        foreach (var tagName in tagNames.Distinct())
        {
            // Try to find existing tag
            var existingTag = await _unitOfWork.Tags.GetByNameAsync(tagName);
            
            Tag tag;
            if (existingTag != null)
            {
                tag = existingTag;
            }
            else
            {
                // Create new tag if it doesn't exist
                tag = new Tag { Name = tagName };
                await _unitOfWork.Tags.AddAsync(tag);
                await _unitOfWork.SaveChangesAsync();
            }

            challengeTags.Add(new ChallengeTag
            {
                CodeChallengeId = challengeId,
                TagId = tag.Id
            });
        }

        if (challengeTags.Any())
        {
            await _unitOfWork.Repository<ChallengeTag>().AddRangeAsync(challengeTags);
        }
    }

    private async Task HandleTopicsAsync(int challengeId, List<int> topicIds)
    {
        var challengeTopics = new List<ChallengeTopic>();

        foreach (var topicId in topicIds.Distinct())
        {
            // Validate topic exists
            var topic = await _unitOfWork.Topics.GetByIdAsync(topicId);
            if (topic != null)
            {
                challengeTopics.Add(new ChallengeTopic
                {
                    CodeChallengeId = challengeId,
                    TopicId = topicId
                });
            }
        }

        if (challengeTopics.Any())
        {
            await _unitOfWork.Repository<ChallengeTopic>().AddRangeAsync(challengeTopics);
        }
    }
}