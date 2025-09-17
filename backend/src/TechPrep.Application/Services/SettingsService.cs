using Microsoft.Extensions.Caching.Memory;
using TechPrep.Application.Interfaces;
using TechPrep.Core.Entities;
using TechPrep.Core.Interfaces;

namespace TechPrep.Application.Services;

public class SettingsService : ISettingsService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMemoryCache _cache;
    private const string CacheKeyPrefix = "AppSetting_";
    private const string AllSettingsCacheKey = "AllAppSettings";
    private static readonly TimeSpan CacheExpiry = TimeSpan.FromMinutes(5);

    public SettingsService(IUnitOfWork unitOfWork, IMemoryCache cache)
    {
        _unitOfWork = unitOfWork;
        _cache = cache;
    }

    public async Task<Dictionary<string, string?>> GetAllAsync()
    {
        try
        {
            if (_cache.TryGetValue(AllSettingsCacheKey, out Dictionary<string, string?> cachedSettings))
            {
                return cachedSettings;
            }

            var allSettings = await _unitOfWork.Repository<AppSetting>().GetAllAsync();
            var settings = allSettings.ToDictionary(s => s.Key, s => s.Value);

            _cache.Set(AllSettingsCacheKey, settings, CacheExpiry);
            return settings;
        }
        catch (Exception)
        {
            return new Dictionary<string, string?>();
        }
    }

    public async Task<string?> GetAsync(string key)
    {
        try
        {
            var cacheKey = CacheKeyPrefix + key;
            if (_cache.TryGetValue(cacheKey, out string? cachedValue))
            {
                return cachedValue;
            }

            var allSettings = await _unitOfWork.Repository<AppSetting>().GetAllAsync();
            var setting = allSettings.FirstOrDefault(s => s.Key == key);

            var value = setting?.Value;
            _cache.Set(cacheKey, value, CacheExpiry);
            return value;
        }
        catch (Exception)
        {
            return null;
        }
    }

    public async Task UpsertAsync(string key, string? value, string? type, string? description, string updatedBy)
    {
        try
        {
            var allSettings = await _unitOfWork.Repository<AppSetting>().GetAllAsync();
            var setting = allSettings.FirstOrDefault(s => s.Key == key);

            if (setting != null)
            {
                setting.Value = value;
                setting.Type = type ?? setting.Type;
                setting.Description = description ?? setting.Description;
                setting.UpdatedAt = DateTime.UtcNow;
                setting.UpdatedBy = updatedBy;
                _unitOfWork.Repository<AppSetting>().Update(setting);
            }
            else
            {
                setting = new AppSetting
                {
                    Key = key,
                    Value = value,
                    Type = type,
                    Description = description,
                    UpdatedAt = DateTime.UtcNow,
                    UpdatedBy = updatedBy
                };
                await _unitOfWork.Repository<AppSetting>().AddAsync(setting);
            }

            await _unitOfWork.SaveChangesAsync();

            // Clear cache entries
            var cacheKey = CacheKeyPrefix + key;
            _cache.Remove(cacheKey);
            _cache.Remove(AllSettingsCacheKey);
        }
        catch (Exception)
        {
            throw;
        }
    }

    public async Task SeedDefaultSettingsAsync()
    {
        try
        {
            var defaultSettings = new[]
            {
                new { Key = "Practice.ThresholdWritten.Default", Value = "80", Type = "int", Description = "Default threshold percentage for written questions" },
                new { Key = "Practice.Interview.RequiredPercent", Value = "100", Type = "int", Description = "Required percentage for interview mode" },
                new { Key = "Import.MaxFileSizeInMB", Value = "10", Type = "int", Description = "Maximum file size for Excel imports" },
                new { Key = "Import.MaxQuestionsPerImport", Value = "1000", Type = "int", Description = "Maximum number of questions per import" }
            };

            var existingSettings = await _unitOfWork.Repository<AppSetting>().GetAllAsync();

            foreach (var defaultSetting in defaultSettings)
            {
                var exists = existingSettings.Any(s => s.Key == defaultSetting.Key);

                if (!exists)
                {
                    await _unitOfWork.Repository<AppSetting>().AddAsync(new AppSetting
                    {
                        Key = defaultSetting.Key,
                        Value = defaultSetting.Value,
                        Type = defaultSetting.Type,
                        Description = defaultSetting.Description,
                        UpdatedAt = DateTime.UtcNow,
                        UpdatedBy = "System"
                    });
                }
            }

            await _unitOfWork.SaveChangesAsync();
        }
        catch (Exception)
        {
            // Silently fail seed operation to not break app startup
        }
    }
}