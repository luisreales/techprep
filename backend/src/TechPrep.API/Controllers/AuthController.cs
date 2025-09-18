
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TechPrep.Core.Entities;
using TechPrep.Core.Enums;
using TechPrep.API.Models.Auth;
using Microsoft.AspNetCore.Authorization;
using TechPrep.Application.Services;

namespace TechPrep.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly IConfiguration _config;
    private readonly ILogger<AuthController> _logger;
    private readonly IEmailService _emailService;

    public AuthController(UserManager<User> userManager, SignInManager<User> signInManager, IConfiguration config, ILogger<AuthController> logger, IEmailService emailService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _config = config;
        _logger = logger;
        _emailService = emailService;
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        var email = User.FindFirstValue(JwtRegisteredClaimNames.Email) ?? User.FindFirstValue(ClaimTypes.Email) ?? string.Empty;
        var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).Distinct().ToList();
        var customRoles = User.FindAll("role").Select(c => c.Value).Distinct().ToList();
        return Ok(new
        {
            success = true,
            data = new
            {
                userId,
                email,
                roles,
                customRoles
            }
        });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        _logger.LogInformation("User registration attempt for email: {Email} from IP: {RemoteIpAddress}",
            request.Email, HttpContext.Connection.RemoteIpAddress);

        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            _logger.LogWarning("Registration failed - email already exists: {Email} from IP: {RemoteIpAddress}",
                request.Email, HttpContext.Connection.RemoteIpAddress);
            return BadRequest(new { message = "Email already registered." });
        }

        var user = new User
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            _logger.LogError("User registration failed for email: {Email} - Errors: {Errors} from IP: {RemoteIpAddress}",
                request.Email, string.Join("; ", result.Errors.Select(e => e.Description)), HttpContext.Connection.RemoteIpAddress);
            return BadRequest(new { message = string.Join("; ", result.Errors.Select(e => e.Description)) });
        }

        // Assign Student role to new users
        await _userManager.AddToRoleAsync(user, "Student");

        // Generate email confirmation token
        var emailConfirmationToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var encodedToken = System.Web.HttpUtility.UrlEncode(emailConfirmationToken);
        var encodedEmail = System.Web.HttpUtility.UrlEncode(user.Email!);
        var frontendBaseUrl = _config["Frontend:BaseUrl"];
        var confirmationLink = $"{frontendBaseUrl}/confirm-email?token={encodedToken}&email={encodedEmail}";

        // Send confirmation email
        try
        {
            await _emailService.SendEmailConfirmationAsync(user.Email!, confirmationLink);
            _logger.LogInformation("User registration successful for: {Email} (ID: {UserId}) - Email confirmation sent from IP: {RemoteIpAddress}",
                user.Email, user.Id, HttpContext.Connection.RemoteIpAddress);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send confirmation email for user: {Email} (ID: {UserId}) from IP: {RemoteIpAddress}",
                user.Email, user.Id, HttpContext.Connection.RemoteIpAddress);
        }

        return Ok(new {
            message = "Registration successful. Please check your email to confirm your account before logging in."
        });
    }

    [HttpGet("confirm-email")]
    public async Task<IActionResult> ConfirmEmail([FromQuery] string token, [FromQuery] string email)
    {
        if (string.IsNullOrEmpty(token) || string.IsNullOrEmpty(email))
        {
            return BadRequest(new { message = "Token and email are required." });
        }

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            return BadRequest(new { message = "Invalid email." });
        }

        var result = await _userManager.ConfirmEmailAsync(user, token);
        if (!result.Succeeded)
        {
            _logger.LogWarning("Email confirmation failed for user: {Email} (ID: {UserId}) - Errors: {Errors} from IP: {RemoteIpAddress}",
                user.Email, user.Id, string.Join("; ", result.Errors.Select(e => e.Description)), HttpContext.Connection.RemoteIpAddress);
            return BadRequest(new { message = "Email confirmation failed. The token may be invalid or expired." });
        }

        // Send welcome email
        try
        {
            await _emailService.SendWelcomeEmailAsync(user.Email!, user.FirstName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send welcome email for user: {Email} (ID: {UserId})", user.Email, user.Id);
        }

        _logger.LogInformation("Email confirmed successfully for user: {Email} (ID: {UserId}) from IP: {RemoteIpAddress}",
            user.Email, user.Id, HttpContext.Connection.RemoteIpAddress);

        return Ok(new { message = "Email confirmed successfully. You can now log in." });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        _logger.LogInformation("Login attempt for email: {Email} from IP: {RemoteIpAddress}",
            request.Email, HttpContext.Connection.RemoteIpAddress);

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            _logger.LogWarning("Failed login attempt - user not found for email: {Email} from IP: {RemoteIpAddress}",
                request.Email, HttpContext.Connection.RemoteIpAddress);
            return Unauthorized(new { message = "Invalid credentials." });
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
        if (!result.Succeeded)
        {
            _logger.LogWarning("Failed login attempt - invalid password for user: {Email} (ID: {UserId}) from IP: {RemoteIpAddress}",
                user.Email, user.Id, HttpContext.Connection.RemoteIpAddress);
            return Unauthorized(new { message = "Invalid credentials." });
        }

        var token = await GenerateJwtTokenAsync(user);
        var response = new AuthResponse
        {
            Token = token,
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = user.Role == UserRole.Admin ? "Admin" : "Student"
        };

        _logger.LogInformation("Successful login for user: {Email} (ID: {UserId}, Role: {Role}) from IP: {RemoteIpAddress}",
            user.Email, user.Id, user.Role, HttpContext.Connection.RemoteIpAddress);

        return Ok(response);
    }


    [HttpPost("refresh")]
    public IActionResult Refresh([FromBody] RefreshRequest request)
    {
        // For demo: always return 501. Implement persistent refresh tokens for production.
        return NotImplemented();
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            // Always return success to prevent email enumeration
            return Ok(new { message = "If the email exists, a reset link will be sent." });
        }

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var encodedToken = System.Web.HttpUtility.UrlEncode(token);
        var encodedEmail = System.Web.HttpUtility.UrlEncode(user.Email!);
        var frontendBaseUrl = _config["Frontend:BaseUrl"];
        var resetLink = $"{frontendBaseUrl}/reset-password?token={encodedToken}&email={encodedEmail}";

        try
        {
            await _emailService.SendPasswordResetAsync(user.Email!, resetLink);
            _logger.LogInformation("Password reset email sent for user: {Email} (ID: {UserId}) from IP: {RemoteIpAddress}",
                user.Email, user.Id, HttpContext.Connection.RemoteIpAddress);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send password reset email for user: {Email} (ID: {UserId}) from IP: {RemoteIpAddress}",
                user.Email, user.Id, HttpContext.Connection.RemoteIpAddress);
        }

        return Ok(new { message = "If the email exists, a reset link will be sent." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        // For demo: require email in query string or body (frontend should provide it)
        var email = Request.Query["email"].ToString();
        if (string.IsNullOrEmpty(email))
            return BadRequest(new { message = "Email is required as query parameter." });

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
            return BadRequest(new { message = "Invalid email." });

        var result = await _userManager.ResetPasswordAsync(user, request.Token, request.Password);
        if (!result.Succeeded)
            return BadRequest(new { message = string.Join("; ", result.Errors.Select(e => e.Description)) });

        return Ok(new { message = "Password has been reset." });
    }

    private async Task<string> GenerateJwtTokenAsync(User user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new Claim("firstName", user.FirstName ?? string.Empty),
            new Claim("lastName", user.LastName ?? string.Empty)
        };
        
        // Add role claims from Identity (preferred over user.Role enum)
        foreach (var role in roles)
        {
            claims.Add(new Claim("role", role));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JwtSettings:Key"] ?? "dev_secret_key"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _config["JwtSettings:Issuer"],
            audience: _config["JwtSettings:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private IActionResult NotImplemented() => StatusCode(501, new { message = "Not implemented" });
}
