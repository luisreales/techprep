using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using TechPrep.Core.Entities;
using TechPrep.Core.Enums;

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
    
    // Session Builder
    public DbSet<SessionTemplate> SessionTemplates { get; set; } = null!;
    public DbSet<SessionTemplateItem> SessionTemplateItems { get; set; } = null!;
    public DbSet<SessionTemplateTopic> SessionTemplateTopics { get; set; } = null!;
    public DbSet<PracticeSession> PracticeSessions { get; set; } = null!;
    public DbSet<PracticeSessionItem> PracticeSessionItems { get; set; } = null!;

    // Settings
    public DbSet<AppSetting> AppSettings { get; set; } = null!;
    
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
            entity.Property(e => e.UpdatedAt);
            
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
            entity.Property(e => e.Color).HasMaxLength(20);
            entity.Property(e => e.CreatedAt).IsRequired();
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
        
        // Session Builder configuration
        builder.Entity<SessionTemplate>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Mode).IsRequired();
            entity.Property(e => e.TopicsJson).IsRequired().HasDefaultValue("[]");
            entity.Property(e => e.LevelsJson).IsRequired().HasDefaultValue("[]");
            entity.Property(e => e.RandomOrder).IsRequired().HasDefaultValue(true);
            entity.Property(e => e.ThresholdWritten).IsRequired().HasDefaultValue(80);
            entity.Property(e => e.Status).IsRequired().HasDefaultValue(TemplateStatus.Draft);
            entity.Property(e => e.QuestionsConfigJson).IsRequired().HasDefaultValue("{}");
            entity.Property(e => e.ChallengesConfigJson).IsRequired().HasDefaultValue("{}");
            entity.Property(e => e.CreatedAt).IsRequired();
            
            entity.HasMany(e => e.TemplateItems)
                  .WithOne(ti => ti.Template)
                  .HasForeignKey(ti => ti.TemplateId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<SessionTemplateTopic>(entity =>
        {
            entity.HasKey(e => new { e.TemplateId, e.TopicId });
            entity.Property(e => e.TemplateId).IsRequired();
            entity.Property(e => e.TopicId).IsRequired();
            entity.HasIndex(e => e.TemplateId);
            entity.HasOne(e => e.Template)
                .WithMany()
                .HasForeignKey(e => e.TemplateId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Topic)
                .WithMany()
                .HasForeignKey(e => e.TopicId)
                .OnDelete(DeleteBehavior.Restrict);
        });
        
        builder.Entity<SessionTemplateItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TemplateId).IsRequired();
            entity.Property(e => e.ItemType).IsRequired();
            entity.Property(e => e.ItemId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.OrderIndex).IsRequired();
            entity.HasIndex(e => e.TemplateId);
            entity.HasIndex(e => new { e.TemplateId, e.OrderIndex }).IsUnique();
        });
        
        builder.Entity<PracticeSession>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.Mode).IsRequired();
            entity.Property(e => e.RandomOrder).IsRequired();
            entity.Property(e => e.ThresholdWritten).IsRequired();
            entity.Property(e => e.StartedAt).IsRequired();
            entity.Property(e => e.TotalItems).IsRequired();
            entity.Property(e => e.CorrectCount).IsRequired();
            entity.Property(e => e.IncorrectCount).IsRequired();
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.StartedAt);
            
            entity.HasOne(e => e.Template)
                  .WithMany()
                  .HasForeignKey(e => e.TemplateId)
                  .OnDelete(DeleteBehavior.SetNull);
                  
            entity.HasMany(e => e.SessionItems)
                  .WithOne(si => si.Session)
                  .HasForeignKey(si => si.SessionId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
        
        builder.Entity<PracticeSessionItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SessionId).IsRequired();
            entity.Property(e => e.OrderIndex).IsRequired();
            entity.Property(e => e.ItemType).IsRequired();
            entity.Property(e => e.ItemId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Level).IsRequired().HasMaxLength(50);
            entity.Property(e => e.TopicId).IsRequired();
            entity.Property(e => e.TimeMs).IsRequired();
            entity.Property(e => e.ChosenOptionsJson).HasMaxLength(1000);
            entity.Property(e => e.GivenText).HasMaxLength(2000);
            entity.HasIndex(e => e.SessionId);
            entity.HasIndex(e => new { e.SessionId, e.OrderIndex }).IsUnique();
            
            entity.HasOne(e => e.Topic)
                  .WithMany()
                  .HasForeignKey(e => e.TopicId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Settings configuration
        builder.Entity<AppSetting>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Key).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Value).HasMaxLength(1000);
            entity.Property(e => e.Type).HasMaxLength(50);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.UpdatedAt).IsRequired();
            entity.Property(e => e.UpdatedBy).HasMaxLength(100);
            entity.HasIndex(e => e.Key).IsUnique();
        });
    }
}
