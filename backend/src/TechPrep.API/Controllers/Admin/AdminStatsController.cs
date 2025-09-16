using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TechPrep.Core.Entities;
using TechPrep.Infrastructure.Data;

namespace TechPrep.API.Controllers.Admin;

[ApiController]
[Route("api/admin/stats")]
// Relaxed for testing; switch to [Authorize(Roles = "Admin")] when ready
[AllowAnonymous]
public class AdminStatsController : ControllerBase
{
    private readonly TechPrepDbContext _db;
    private readonly UserManager<User> _userManager;

    public AdminStatsController(TechPrepDbContext db, UserManager<User> userManager)
    {
        _db = db;
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var users = await _userManager.Users.CountAsync();
        var questions = await _db.Questions.CountAsync();
        var topics = await _db.Topics.CountAsync();
        var sessions = await _db.PracticeSessions.CountAsync();
        var sessionTemplates = await _db.SessionTemplates.CountAsync();

        return Ok(new
        {
            success = true,
            data = new
            {
                users,
                questions,
                topics,
                sessions,
                sessionTemplates
            }
        });
    }
}

