namespace TechPrep.Application.Interfaces;

public interface ISettingsService
{
    Task<Dictionary<string, string?>> GetAllAsync();
    Task<string?> GetAsync(string key);
    Task UpsertAsync(string key, string? value, string? type, string? description, string updatedBy);
}