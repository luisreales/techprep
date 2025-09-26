using Microsoft.EntityFrameworkCore;
using TechPrep.Infrastructure.Data;
using TechPrep.Core.Entities;
using Microsoft.AspNetCore.Identity;
using Serilog;
using TechPrep.Core.Interfaces;
using TechPrep.Infrastructure.Repositories;
using TechPrep.Application.Interfaces;
using TechPrep.Application.Services;
using TechPrep.Application.Mappings;
using TechPrep.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();
builder.Host.UseSerilog();

// Controllers
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// DI
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<ITopicService, TopicService>();
builder.Services.AddScoped<IQuestionService, QuestionService>();
builder.Services.AddScoped<ICodeChallengeService, CodeChallengeService>();
builder.Services.AddScoped<ITagService, TagService>();
builder.Services.AddScoped<IUserAdminService, UserAdminService>();
builder.Services.AddScoped<ISettingsService, SettingsService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IEvaluationService, EvaluationService>();

// Practice Interview System Services
builder.Services.AddScoped<IInterviewTemplateRepository, InterviewTemplateRepository>();
builder.Services.AddScoped<IGroupRepository, GroupRepository>();
builder.Services.AddScoped<ISessionAssignmentRepository, SessionAssignmentRepository>();
builder.Services.AddScoped<IPracticeSessionRepository, PracticeSessionRepository>();
builder.Services.AddScoped<IInterviewSessionNewRepository, InterviewSessionNewRepository>();
builder.Services.AddScoped<ICreditLedgerRepository, CreditLedgerRepository>();

builder.Services.AddScoped<IInterviewTemplateService, InterviewTemplateService>();
builder.Services.AddScoped<ISessionAssignmentService, SessionAssignmentService>();
builder.Services.AddScoped<IGroupService, GroupService>();
builder.Services.AddScoped<IPracticeSessionService, PracticeSessionService>();
builder.Services.AddScoped<IInterviewSessionService, InterviewSessionService>();
builder.Services.AddScoped<ICreditService, CreditService>();

// Add memory cache for settings
builder.Services.AddMemoryCache();

builder.Services.AddAutoMapper(typeof(MappingProfile), typeof(PracticeInterviewMappingProfile));

// DB (SQLite)
// Build absolute path for the SQLite file so reads/writes go to a stable location
var connStr = builder.Configuration.GetConnectionString("DefaultConnection");
if (!string.IsNullOrWhiteSpace(connStr))
{
    try
    {
        // If connection string is relative like "Data Source=Data/techprep.db",
        // rewrite to absolute: Data Source={ContentRoot}/Data/techprep.db
        var parts = connStr.Split('=', 2, StringSplitOptions.TrimEntries);
        if (parts.Length == 2 && parts[0].Equals("Data Source", StringComparison.OrdinalIgnoreCase))
        {
            var rawPath = parts[1];
            var absPath = System.IO.Path.IsPathRooted(rawPath)
                ? rawPath
                : System.IO.Path.Combine(builder.Environment.ContentRootPath, rawPath);
            var dir = System.IO.Path.GetDirectoryName(absPath);
            if (!string.IsNullOrEmpty(dir) && !System.IO.Directory.Exists(dir))
            {
                System.IO.Directory.CreateDirectory(dir);
            }
            connStr = $"Data Source={absPath}";
        }
    }
    catch { /* fallback to original */ }
}

builder.Services.AddDbContext<TechPrepDbContext>(options => options.UseSqlite(connStr));

// Identity (User con Guid y Roles)
builder.Services
    .AddIdentityCore<User>(options =>
    {
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequiredLength = 6;
        options.User.RequireUniqueEmail = true;
        options.SignIn.RequireConfirmedEmail = true;
    })
    .AddRoles<IdentityRole<Guid>>()
    .AddEntityFrameworkStores<TechPrepDbContext>()
    .AddDefaultTokenProviders()
    .AddSignInManager();

// JWT (lee JwtSettings del appsettings)
var jwtSection = builder.Configuration.GetSection("JwtSettings");
var jwtKey = jwtSection.GetValue<string>("Key") ?? "dev_secret_key";
var jwtIssuer = jwtSection.GetValue<string>("Issuer");
var jwtAudience = jwtSection.GetValue<string>("Audience");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = !string.IsNullOrWhiteSpace(jwtIssuer),
            ValidateAudience = !string.IsNullOrWhiteSpace(jwtAudience),
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.Zero,
            // Ensure role claims from JWT ("role") are recognized by [Authorize(Roles = ...)]
            // Accept role claims. We'll also mirror any 'role' claims into ClaimTypes.Role in events below
            RoleClaimType = System.Security.Claims.ClaimTypes.Role
        };
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = context =>
            {
                var identity = context.Principal?.Identity as System.Security.Claims.ClaimsIdentity;
                if (identity != null)
                {
                    // Mirror 'role' claims to ClaimTypes.Role so [Authorize(Roles=...)] works regardless of token claim type
                    var customRoleClaims = identity.FindAll("role");
                    foreach (var rc in customRoleClaims)
                    {
                        // Avoid duplicates
                        if (!identity.HasClaim(System.Security.Claims.ClaimTypes.Role, rc.Value))
                        {
                            identity.AddClaim(new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Role, rc.Value));
                        }
                    }
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
});

//Enable Cors
// 1) CORS policy
builder.Services.AddCors(o =>
{
    o.AddPolicy("FrontendDev", p =>
        p.WithOrigins(
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:5000"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        // add only if you actually send cookies/Authorization with credentials:
        //.AllowCredentials()
    );
});


// Swagger + JWT (opcional)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "TechPrep API", Version = "v1" });
    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Enter JWT Bearer token **_only_**",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Reference = new OpenApiReference
        {
            Type = ReferenceType.SecurityScheme,
            Id = "Bearer"
        }
    };
    c.AddSecurityDefinition("Bearer", securityScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { securityScheme, new string[] { } }
    });
});

var app = builder.Build();

// Migrar BD al inicio (crea techprep.db y tablas Identity)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<TechPrepDbContext>();
    db.Database.Migrate();

    // Safety net: ensure new normalized join table exists even if a migration was missed locally
    try
    {
        db.Database.ExecuteSqlRaw(@"
            CREATE TABLE IF NOT EXISTS SessionTemplateTopics (
                TemplateId INTEGER NOT NULL,
                TopicId INTEGER NOT NULL,
                CONSTRAINT PK_SessionTemplateTopics PRIMARY KEY (TemplateId, TopicId),
                CONSTRAINT FK_SessionTemplateTopics_SessionTemplates_TemplateId FOREIGN KEY (TemplateId) REFERENCES SessionTemplates (Id) ON DELETE CASCADE,
                CONSTRAINT FK_SessionTemplateTopics_Topics_TopicId FOREIGN KEY (TopicId) REFERENCES Topics (Id) ON DELETE RESTRICT
            );
            CREATE INDEX IF NOT EXISTS IX_SessionTemplateTopics_TopicId ON SessionTemplateTopics(TopicId);
        ");
    }
    catch { /* ignore - best effort fallback */ }

    // Seeder admin/roles
    await TechPrep.Infrastructure.Seed.AppSeeder.SeedAsync(scope.ServiceProvider);
    
    // Seeder topics/questions
    var userManager = scope.ServiceProvider.GetRequiredService<Microsoft.AspNetCore.Identity.UserManager<TechPrep.Core.Entities.User>>();
    await TechPrep.Infrastructure.Data.SeedData.SeedAsync(db, userManager);

    // Seed default settings
    var settingsService = scope.ServiceProvider.GetRequiredService<ISettingsService>();
    await ((SettingsService)settingsService).SeedDefaultSettingsAsync();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors("FrontendDev");          // <-- place CORS very early

//app.UseHttpsRedirection(); -- Remove HTTPS
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

// Para tests
public partial class Program { }
