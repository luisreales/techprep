using AutoMapper;
using TechPrep.Application.DTOs.Challenges;
using TechPrep.Application.Interfaces;
using TechPrep.Core.Entities;
using TechPrep.Core.Interfaces;

namespace TechPrep.Application.Services;

public class TagService : ITagService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public TagService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<List<TagDto>> GetAllTagsAsync()
    {
        try
        {
            var tags = await _unitOfWork.Tags.GetAllAsync();
            return _mapper.Map<List<TagDto>>(tags);
        }
        catch (Exception)
        {
            return new List<TagDto>();
        }
    }

    public async Task<TagDto?> GetTagByIdAsync(int id)
    {
        try
        {
            var tag = await _unitOfWork.Tags.GetByIdAsync(id);
            
            if (tag == null)
                return null;

            return _mapper.Map<TagDto>(tag);
        }
        catch (Exception)
        {
            return null;
        }
    }

    public async Task<TagDto> CreateTagAsync(TagCreateDto createDto)
    {
        try
        {
            var tag = _mapper.Map<Tag>(createDto);
            
            await _unitOfWork.Tags.AddAsync(tag);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<TagDto>(tag);
        }
        catch (Exception)
        {
            throw;
        }
    }

    public async Task<TagDto?> UpdateTagAsync(int id, TagUpdateDto updateDto)
    {
        try
        {
            var tag = await _unitOfWork.Tags.GetByIdAsync(id);
            
            if (tag == null)
                return null;

            // Update properties
            tag.Name = updateDto.Name;
            // Note: Tag entity doesn't have Color property in the entity I saw, 
            // but the DTO has it. If Tag entity has Color, uncomment the line below:
            // tag.Color = updateDto.Color;

            _unitOfWork.Tags.Update(tag);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<TagDto>(tag);
        }
        catch (Exception)
        {
            throw;
        }
    }

    public async Task<bool> DeleteTagAsync(int id)
    {
        try
        {
            var tag = await _unitOfWork.Tags.GetByIdAsync(id);
            
            if (tag == null)
                return false;

            _unitOfWork.Tags.Delete(tag);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }
        catch (Exception)
        {
            return false;
        }
    }

    public async Task<List<TagDto>> GetTagsByNamesAsync(IEnumerable<string> names)
    {
        try
        {
            var tags = await _unitOfWork.Tags.GetByNamesAsync(names);
            return _mapper.Map<List<TagDto>>(tags);
        }
        catch (Exception)
        {
            return new List<TagDto>();
        }
    }

    public async Task<TagDto?> GetTagByNameAsync(string name)
    {
        try
        {
            var tag = await _unitOfWork.Tags.GetByNameAsync(name);
            
            if (tag == null)
                return null;

            return _mapper.Map<TagDto>(tag);
        }
        catch (Exception)
        {
            return null;
        }
    }
}