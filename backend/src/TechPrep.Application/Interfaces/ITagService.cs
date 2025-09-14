using TechPrep.Application.DTOs.Challenges;

namespace TechPrep.Application.Interfaces;

public interface ITagService
{
    Task<List<TagDto>> GetAllTagsAsync();
    Task<TagDto?> GetTagByIdAsync(int id);
    Task<TagDto> CreateTagAsync(TagCreateDto createDto);
    Task<TagDto?> UpdateTagAsync(int id, TagUpdateDto updateDto);
    Task<bool> DeleteTagAsync(int id);
    Task<List<TagDto>> GetTagsByNamesAsync(IEnumerable<string> names);
    Task<TagDto?> GetTagByNameAsync(string name);
}