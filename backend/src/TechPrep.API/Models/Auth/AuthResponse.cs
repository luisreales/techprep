namespace TechPrep.API.Models.Auth;

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public string? RefreshToken { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
}
