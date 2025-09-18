namespace TechPrep.Application.DTOs;

public record UserProfileDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string? AvatarUrl,
    string Language,
    string Theme
);