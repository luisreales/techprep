using Microsoft.EntityFrameworkCore;
using TechPrep.Core.Entities;

namespace TechPrep.Infrastructure.Data;

// TODO: Minimal DbContext for startup testing
public class TechPrepDbContext(DbContextOptions<TechPrepDbContext> options) : DbContext(options)
{
    public DbSet<Topic> Topics { get; set; } = null!;
    public DbSet<Question> Questions { get; set; } = null!;
    public DbSet<QuestionOption> QuestionOptions { get; set; } = null!;
    public DbSet<LearningResource> LearningResources { get; set; } = null!;
    
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        
        // Minimal configuration - just basic properties, no complex relationships
        builder.Entity<Topic>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Ignore(e => e.Questions);
            entity.Ignore(e => e.InterviewSessions);
        });
        
        builder.Entity<Question>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Text).IsRequired();
            entity.Property(e => e.TopicId).IsRequired();
            entity.Property(e => e.Type).IsRequired();
            entity.Property(e => e.Level).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();
            entity.Ignore(e => e.Topic);
            entity.Ignore(e => e.Options);
            entity.Ignore(e => e.InterviewAnswers);
            entity.Ignore(e => e.LearningResources);
            entity.HasIndex(e => e.TopicId);
        });
        
        builder.Entity<QuestionOption>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Text).IsRequired();
            entity.Property(e => e.QuestionId).IsRequired();
            entity.Property(e => e.IsCorrect).IsRequired();
            entity.Property(e => e.OrderIndex).IsRequired();
            entity.Ignore(e => e.Question);
            entity.HasIndex(e => e.QuestionId);
        });
        
        builder.Entity<LearningResource>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.QuestionId).IsRequired();
            entity.Property(e => e.Url).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Ignore(e => e.Question);
            entity.HasIndex(e => e.QuestionId);
        });
    }
}