
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TechPrep.Core.Entities;
using TechPrep.API.Models.Auth;

namespace TechPrep.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly IConfiguration _config;

    public AuthController(UserManager<User> userManager, SignInManager<User> signInManager, IConfiguration config)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _config = config;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
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
            return BadRequest(new { message = string.Join("; ", result.Errors.Select(e => e.Description)) });
        }

        var token = GenerateJwtToken(user);
        var response = new AuthResponse
        {
            Token = token,
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName
        };
        return Ok(response);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            return Unauthorized(new { message = "Invalid credentials." });
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
        if (!result.Succeeded)
        {
            return Unauthorized(new { message = "Invalid credentials." });
        }

        var token = GenerateJwtToken(user);
        var response = new AuthResponse
        {
            Token = token,
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName
        };
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
            return Ok(new { message = "If the email exists, a reset link will be sent." });

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        // TODO: Send token via email. For now, return it in response for testing.
        return Ok(new { message = "Password reset link sent.", token });
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

    private string GenerateJwtToken(User user)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new Claim("firstName", user.FirstName ?? string.Empty),
            new Claim("lastName", user.LastName ?? string.Empty)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? "dev_secret_key"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private IActionResult NotImplemented() => StatusCode(501, new { message = "Not implemented" });
}
