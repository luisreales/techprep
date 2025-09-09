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

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container.
builder.Services.AddControllers();

builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<ITopicService, TopicService>();
builder.Services.AddScoped<IQuestionService, QuestionService>();

builder.Services.AddAutoMapper(typeof(MappingProfile));

builder.Services.AddDbContext<TechPrepDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// TODO: Add Identity - temporarily disabled to test startup
// builder.Services.AddIdentity<User, IdentityRole<Guid>>(options =>
// {
//     options.Password.RequireDigit = true;
//     options.Password.RequireLowercase = true;
//     options.Password.RequireUppercase = true;
//     options.Password.RequireNonAlphanumeric = false;
//     options.Password.RequiredLength = 8;
//     options.User.RequireUniqueEmail = true;
// })
// .AddEntityFrameworkStores<TechPrepDbContext>()
// .AddDefaultTokenProviders();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// TODO: Temporarily disable seed data to test startup
// using (var scope = app.Services.CreateScope())
// {
//     var context = scope.ServiceProvider.GetRequiredService<TechPrepDbContext>();
//     await SeedData.SeedAsync(context, null!);
// }

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
// TODO: Temporarily disabled authentication
// app.UseAuthentication();
// app.UseAuthorization();

app.MapControllers();

app.Run();

// Make Program class accessible for integration tests
public partial class Program { }
