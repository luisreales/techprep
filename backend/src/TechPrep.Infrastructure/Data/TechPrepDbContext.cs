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

    // Practice Interview System
    public DbSet<Group> Groups { get; set; } = null!;
    public DbSet<UserGroup> UserGroups { get; set; } = null!;
    public DbSet<InterviewTemplate> InterviewTemplates { get; set; } = null!;
    public DbSet<SessionAssignment> SessionAssignments { get; set; } = null!;
    public DbSet<PracticeSessionNew> PracticeSessionsNew { get; set; } = null!;
    public DbSet<PracticeSessionTopic> PracticeSessionTopics { get; set; } = null!;
    public DbSet<InterviewSessionNew> InterviewSessionsNew { get; set; } = null!;
    public DbSet<PracticeAnswer> PracticeAnswers { get; set; } = null!;
    public DbSet<InterviewAnswerNew> InterviewAnswersNew { get; set; } = null!;
    public DbSet<SessionAuditEvent> SessionAuditEvents { get; set; } = null!;
    public DbSet<SubscriptionPlan> SubscriptionPlans { get; set; } = null!;
    public DbSet<UserSubscription> UserSubscriptions { get; set; } = null!;
    public DbSet<CreditTopUp> CreditTopUps { get; set; } = null!;
    public DbSet<CreditLedger> CreditLedgers { get; set; } = null!;
    public DbSet<InterviewCertificate> InterviewCertificates { get; set; } = null!;
    public DbSet<QuestionKeyword> QuestionKeywords { get; set; } = null!;

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

        // Practice Interview System configurations
        ConfigurePracticeInterviewEntities(builder);
    }

    private void ConfigurePracticeInterviewEntities(ModelBuilder builder)
    {
        // Group configuration
        builder.Entity<Group>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();

            entity.HasMany(e => e.UserGroups)
                  .WithOne(ug => ug.Group)
                  .HasForeignKey(ug => ug.GroupId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // UserGroup configuration
        builder.Entity<UserGroup>(entity =>
        {
            entity.HasKey(e => new { e.GroupId, e.UserId });
            entity.Property(e => e.Role).HasConversion<string>().HasMaxLength(50);
            entity.Property(e => e.JoinedAt).IsRequired();

            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // InterviewTemplate configuration
        builder.Entity<InterviewTemplate>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Kind).IsRequired();
            entity.Property(e => e.VisibilityDefault).IsRequired();
            entity.Property(e => e.SelectionCriteriaJson).IsRequired().HasDefaultValue("{}");
            entity.Property(e => e.NavigationMode).IsRequired();
            entity.Property(e => e.FeedbackMode).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();
        });

        // SessionAssignment configuration
        builder.Entity<SessionAssignment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TemplateId).IsRequired();
            entity.Property(e => e.Visibility).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();

            entity.HasOne(e => e.Template)
                  .WithMany(t => t.Assignments)
                  .HasForeignKey(e => e.TemplateId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Group)
                  .WithMany(g => g.SessionAssignments)
                  .HasForeignKey(e => e.GroupId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // PracticeSessionNew configuration
        builder.Entity<PracticeSessionNew>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.Name).HasMaxLength(80).IsRequired();
            entity.Property(e => e.Status).IsRequired();
            entity.Property(e => e.StartedAt).IsRequired();
            entity.Property(e => e.CurrentQuestionState).HasMaxLength(2000);

            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Assignment)
                  .WithMany(a => a.PracticeSessions)
                  .HasForeignKey(e => e.AssignmentId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // PracticeSessionTopic configuration
        builder.Entity<PracticeSessionTopic>(entity =>
        {
            entity.HasKey(e => new { e.PracticeSessionId, e.TopicId });
            entity.Property(e => e.PracticeSessionId).IsRequired();
            entity.Property(e => e.TopicId).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Levels).HasMaxLength(100);

            entity.HasOne(e => e.PracticeSession)
                  .WithMany(ps => ps.Topics)
                  .HasForeignKey(e => e.PracticeSessionId)
                  .OnDelete(DeleteBehavior.Cascade);

            // No foreign key relationship with Topic since TopicId is now a string
            // that can contain comma-separated topic IDs or other values
        });

        // InterviewSessionNew configuration
        builder.Entity<InterviewSessionNew>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.AssignmentId).IsRequired();
            entity.Property(e => e.Status).IsRequired().HasDefaultValue("Assigned");
            entity.Property(e => e.StartedAt).IsRequired();
            entity.Property(e => e.FinalizedAt);
            entity.Property(e => e.TotalScore).HasDefaultValue(0);
            entity.Property(e => e.TotalTimeSec).HasDefaultValue(0);
            entity.Property(e => e.CurrentQuestionIndex).HasDefaultValue(0);
            entity.Property(e => e.CertificateIssued).HasDefaultValue(false);
            entity.Property(e => e.CorrectCount).HasDefaultValue(0);
            entity.Property(e => e.IncorrectCount).HasDefaultValue(0);
            entity.Property(e => e.TotalItems).HasDefaultValue(0);
            entity.Property(e => e.AttemptNumber).IsRequired().HasDefaultValue(1);
            entity.Property(e => e.ParentSessionId);
        });

        // PracticeAnswer configuration
        builder.Entity<PracticeAnswer>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.PracticeSessionId).IsRequired();
            entity.Property(e => e.QuestionId).IsRequired();
            entity.Property(e => e.SelectedOptionIds).HasMaxLength(1000);
            entity.Property(e => e.GivenText).HasMaxLength(2000);
            entity.Property(e => e.AnsweredAt).IsRequired();

            entity.HasOne(e => e.PracticeSession)
                  .WithMany(ps => ps.Answers)
                  .HasForeignKey(e => e.PracticeSessionId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Question)
                  .WithMany()
                  .HasForeignKey(e => e.QuestionId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // InterviewAnswerNew configuration
        builder.Entity<InterviewAnswerNew>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.InterviewSessionId).IsRequired();
            entity.Property(e => e.QuestionId).IsRequired();
            entity.Property(e => e.Type).IsRequired().HasDefaultValue("single");
            entity.Property(e => e.GivenText).HasMaxLength(2000);
            entity.Property(e => e.ChosenOptionIdsJson).HasMaxLength(1000);
            entity.Property(e => e.IsCorrect).IsRequired().HasDefaultValue(false);
            entity.Property(e => e.TimeMs).IsRequired().HasDefaultValue(0);
            entity.Property(e => e.AttemptNumber).IsRequired().HasDefaultValue(1);
            entity.Property(e => e.CreatedAt).IsRequired();

            entity.HasOne(e => e.InterviewSession)
                  .WithMany(ses => ses.Answers)
                  .HasForeignKey(e => e.InterviewSessionId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // SessionAuditEvent configuration
        builder.Entity<SessionAuditEvent>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SessionType).IsRequired().HasMaxLength(50);
            entity.Property(e => e.SessionId).IsRequired();
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.EventType).IsRequired();
            entity.Property(e => e.MetaJson).HasMaxLength(2000);
            entity.Property(e => e.CreatedAt).IsRequired();

            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.SessionType, e.SessionId });
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.CreatedAt);
        });

        // SubscriptionPlan configuration
        builder.Entity<SubscriptionPlan>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Price).HasPrecision(10, 2);
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();
        });

        // UserSubscription configuration
        builder.Entity<UserSubscription>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.SubscriptionPlanId).IsRequired();
            entity.Property(e => e.Status).IsRequired();
            entity.Property(e => e.StartDate).IsRequired();
            entity.Property(e => e.EndDate).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();

            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.SubscriptionPlan)
                  .WithMany(sp => sp.UserSubscriptions)
                  .HasForeignKey(e => e.SubscriptionPlanId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // CreditTopUp configuration
        builder.Entity<CreditTopUp>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.Amount).HasPrecision(10, 2);
            entity.Property(e => e.CreatedAt).IsRequired();

            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // CreditLedger configuration
        builder.Entity<CreditLedger>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.TransactionType).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).IsRequired();

            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.SourceTopUp)
                  .WithMany(ct => ct.CreditEntries)
                  .HasForeignKey(e => e.SourceTopUpId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.InterviewSession)
                  .WithMany()
                  .HasForeignKey(e => e.InterviewSessionId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.CreatedAt);
        });

        // InterviewCertificate configuration
        builder.Entity<InterviewCertificate>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SessionId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.CertificateId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.VerificationUrl).IsRequired().HasMaxLength(500);
            entity.Property(e => e.QrCodeData).IsRequired().HasMaxLength(1000);
            entity.Property(e => e.IssuedAt).IsRequired();

            // Relationship will be configured when certificate functionality is fully implemented
            // entity.HasOne(e => e.Session)
            //       .WithOne(s => s.Certificate)
            //       .HasForeignKey<InterviewCertificate>(e => e.InterviewSessionId)
            //       .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.CertificateId).IsUnique();
        });

        // QuestionKeyword configuration
        builder.Entity<QuestionKeyword>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.QuestionId).IsRequired();
            entity.Property(e => e.Text).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Weight).HasPrecision(5, 2);

            entity.HasOne(e => e.Question)
                  .WithMany(q => q.Keywords)
                  .HasForeignKey(e => e.QuestionId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Update Question entity with new fields
        builder.Entity<Question>(entity =>
        {
            entity.Property(e => e.UsableInPractice).IsRequired().HasDefaultValue(true);
            entity.Property(e => e.UsableInInterview).IsRequired().HasDefaultValue(true);
            entity.Property(e => e.Difficulty).HasMaxLength(50);
            entity.Property(e => e.EstimatedTimeSec).HasDefaultValue(60);
            entity.Property(e => e.InterviewCooldownDays).HasDefaultValue(0);

            entity.HasIndex(e => e.UsableInPractice);
            entity.HasIndex(e => e.UsableInInterview);
            entity.HasIndex(e => e.LastUsedInInterviewAt);
        });
    }
}
