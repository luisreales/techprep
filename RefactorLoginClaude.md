# Task for Claude.ai

## Goal
Refactor my **ASP.NET Core 8 Web API project (TechPrep)** so that:

1. All **new users created through the public `/auth/register` endpoint** are automatically assigned the role **`Student`**.
2. On application startup, ensure that:
   - Roles **`Admin`** and **`Student`** exist.
   - A default Admin user is seeded:
     - **Email:** `admin@techprep.com`
     - **Password:** `Nojoda123*`
     - **Role:** `Admin`

We are using **ASP.NET Core Identity with EF Core (SQLite)** and `User : IdentityUser<Guid>`.

---

## Detailed Instructions

### 1. Ensure Identity with Roles is configured
In `Program.cs`, confirm Identity is added like this:

```csharp
builder.Services
  .AddIdentity<User, IdentityRole<Guid>>(options =>
  {
      options.Password.RequireDigit = true;
      options.Password.RequireLowercase = true;
      options.Password.RequireUppercase = true;
      options.Password.RequireNonAlphanumeric = false;
      options.Password.RequiredLength = 6;
      options.User.RequireUniqueEmail = true;
  })
  .AddEntityFrameworkStores<TechPrepDbContext>()
  .AddDefaultTokenProviders();
2. Create Seeder Class
Create a static class Infrastructure/Seed/AppSeeder.cs:

csharp
Copiar código
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TechPrep.Core.Entities;
using TechPrep.Infrastructure.Data;

namespace TechPrep.Infrastructure.Seed;

public static class AppSeeder
{
    public static async Task SeedAsync(IServiceProvider sp)
    {
        using var scope = sp.CreateScope();
        var services = scope.ServiceProvider;

        var db = services.GetRequiredService<TechPrepDbContext>();
        await db.Database.MigrateAsync();

        var userMgr = services.GetRequiredService<UserManager<User>>();
        var roleMgr = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();

        // Ensure roles exist
        string[] roles = { "Admin", "Student" };
        foreach (var r in roles)
            if (!await roleMgr.RoleExistsAsync(r))
                await roleMgr.CreateAsync(new IdentityRole<Guid>(r));

        // Ensure default Admin exists
        const string adminEmail = "admin@techprep.com";
        const string adminPass = "Nojoda123*";

        var admin = await userMgr.FindByEmailAsync(adminEmail);
        if (admin == null)
        {
            admin = new User
            {
                Id = Guid.NewGuid(),
                UserName = adminEmail,
                Email = adminEmail,
                FirstName = "Tech",
                LastName = "Admin",
                EmailConfirmed = true
            };

            var result = await userMgr.CreateAsync(admin, adminPass);
            if (!result.Succeeded)
            {
                var msg = string.Join("; ", result.Errors.Select(e => e.Description));
                throw new Exception($"Admin creation failed: {msg}");
            }

            await userMgr.AddToRoleAsync(admin, "Admin");
        }
    }
}
3. Call Seeder on Startup
In Program.cs after app = builder.Build();:

csharp
Copiar código
using TechPrep.Infrastructure.Seed;

using (var scope = app.Services.CreateScope())
{
    await AppSeeder.SeedAsync(scope.ServiceProvider);
}
4. Modify Register Endpoint
In your AuthController, after successfully creating a user, assign the Student role:

csharp
Copiar código
[HttpPost("register")]
public async Task<IActionResult> Register([FromBody] RegisterRequest dto)
{
    var user = new User
    {
        Id = Guid.NewGuid(),
        Email = dto.Email,
        UserName = dto.Email,
        FirstName = dto.FirstName,
        LastName = dto.LastName,
        EmailConfirmed = true
    };

    var result = await _userManager.CreateAsync(user, dto.Password);
    if (!result.Succeeded)
        return BadRequest(new { message = string.Join("; ", result.Errors.Select(e => e.Description)) });

    // Always assign Student role
    if (!await _roleManager.RoleExistsAsync("Student"))
        await _roleManager.CreateAsync(new IdentityRole<Guid>("Student"));

    await _userManager.AddToRoleAsync(user, "Student");

    return Created("", new { email = user.Email, firstName = user.FirstName, lastName = user.LastName });
}
5. Run Migrations
Make sure your Identity tables and roles are up to date:

bash
Copiar código
dotnet ef migrations add IdentityWithRoles -p TechPrep.Infrastructure -s TechPrep.API -c TechPrepDbContext
dotnet ef database update -p TechPrep.Infrastructure -s TechPrep.API -c TechPrepDbContext
Acceptance Criteria
When the API starts, roles Admin and Student exist in the DB.

A seeded user admin@techprep.com exists with role Admin.

Any user registered through /api/auth/register gets role Student automatically.

Admin cannot be created through the public register endpoint.