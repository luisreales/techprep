using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using TechPrep.Core.Entities;

namespace TechPrep.Infrastructure.Data;

// TODO: Minimal DbContext for startup testing
public class TechPrepDbContext(DbContextOptions<TechPrepDbContext> options) : IdentityDbContext<User, IdentityRole<Guid>, Guid>(options)
{
    public DbSet<Topic> Topics { get; set; } = null!;
    public DbSet<Question> Questions { get; set; } = null!;
    public DbSet<QuestionOption> QuestionOptions { get; set; } = null!;
    public DbSet<LearningResource> LearningResources { get; set; } = null!;
    public DbSet<QuestionResource> QuestionResources { get; set; } = null!;
    public DbSet<ResourceTopic> ResourceTopics { get; set; } = null!;
    
    // Code Challenges
    public DbSet<CodeChallenge> CodeChallenges { get; set; } = null!;
    public DbSet<Tag> Tags { get; set; } = null!;
    public DbSet<ChallengeTag> ChallengeTags { get; set; } = null!;
    public DbSet<ChallengeTopic> ChallengeTopics { get; set; } = null!;
    public DbSet<ChallengeAttempt> ChallengeAttempts { get; set; } = null!;
    
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
            entity.Ignore(e => e.InterviewAnswers);
            entity.HasIndex(e => e.TopicId);
            
            // Configure relationships
            entity.HasOne(e => e.Topic)
                  .WithMany()
                  .HasForeignKey(e => e.TopicId)
                  .OnDelete(DeleteBehavior.Restrict);
                  
            entity.HasMany(e => e.Options)
                  .WithOne(o => o.Question)
                  .HasForeignKey(o => o.QuestionId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            entity.HasMany(e => e.ResourceLinks)
                  .WithOne(qr => qr.Question)
                  .HasForeignKey(qr => qr.QuestionId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
        
        builder.Entity<QuestionOption>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Text).IsRequired();
            entity.Property(e => e.QuestionId).IsRequired();
            entity.Property(e => e.IsCorrect).IsRequired();
            entity.Property(e => e.OrderIndex).IsRequired();
            entity.HasIndex(e => e.QuestionId);
        });
        
        builder.Entity<LearningResource>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Kind).IsRequired();
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Url).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Author).HasMaxLength(100);
            entity.Property(e => e.Duration);
            entity.Property(e => e.Rating);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Difficulty);
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt);
            
            entity.HasMany(e => e.QuestionLinks)
                  .WithOne(qr => qr.Resource)
                  .HasForeignKey(qr => qr.ResourceId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            entity.HasMany(e => e.TopicLinks)
                  .WithOne(rt => rt.Resource)
                  .HasForeignKey(rt => rt.ResourceId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
        
        builder.Entity<QuestionResource>(entity =>
        {
            entity.HasKey(e => new { e.QuestionId, e.ResourceId });
            entity.Property(e => e.QuestionId).IsRequired();
            entity.Property(e => e.ResourceId).IsRequired();
            entity.Property(e => e.Note).HasMaxLength(500);
        });
        
        builder.Entity<ResourceTopic>(entity =>
        {
            entity.HasKey(e => new { e.ResourceId, e.TopicId });
            entity.Property(e => e.ResourceId).IsRequired();
            entity.Property(e => e.TopicId).IsRequired();
            
            entity.HasOne(e => e.Topic)
                  .WithMany()
                  .HasForeignKey(e => e.TopicId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
        
        // Code Challenges configuration
        builder.Entity<CodeChallenge>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Language).IsRequired();
            entity.Property(e => e.Difficulty).IsRequired();
            entity.Property(e => e.Prompt).IsRequired();
            entity.Property(e => e.OfficialSolution).HasMaxLength(10000);
            entity.Property(e => e.TestsJson).HasMaxLength(5000);
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();
            
            entity.HasMany(e => e.Tags)
                  .WithOne(ct => ct.CodeChallenge)
                  .HasForeignKey(ct => ct.CodeChallengeId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            entity.HasMany(e => e.Topics)
                  .WithOne(ct => ct.CodeChallenge)
                  .HasForeignKey(ct => ct.CodeChallengeId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            entity.HasMany(e => e.Attempts)
                  .WithOne(a => a.CodeChallenge)
                  .HasForeignKey(a => a.CodeChallengeId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
        
        builder.Entity<Tag>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => e.Name).IsUnique();
            
            entity.HasMany(e => e.ChallengeTag)
                  .WithOne(ct => ct.Tag)
                  .HasForeignKey(ct => ct.TagId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
        
        builder.Entity<ChallengeTag>(entity =>
        {
            entity.HasKey(e => new { e.CodeChallengeId, e.TagId });
            entity.Property(e => e.CodeChallengeId).IsRequired();
            entity.Property(e => e.TagId).IsRequired();
        });
        
        builder.Entity<ChallengeTopic>(entity =>
        {
            entity.HasKey(e => new { e.CodeChallengeId, e.TopicId });
            entity.Property(e => e.CodeChallengeId).IsRequired();
            entity.Property(e => e.TopicId).IsRequired();
            
            entity.HasOne(e => e.Topic)
                  .WithMany()
                  .HasForeignKey(e => e.TopicId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
        
        builder.Entity<ChallengeAttempt>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CodeChallengeId).IsRequired();
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.StartedAt).IsRequired();
            entity.Property(e => e.SubmittedCode).HasMaxLength(10000);
            entity.Property(e => e.Notes).HasMaxLength(1000);
            entity.HasIndex(e => new { e.CodeChallengeId, e.UserId });
            entity.HasIndex(e => e.StartedAt);
        });
    }
}