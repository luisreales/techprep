using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechPrep.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPracticeInterviewSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Difficulty",
                table: "Questions",
                type: "TEXT",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EstimatedTimeSec",
                table: "Questions",
                type: "INTEGER",
                nullable: false,
                defaultValue: 60);

            migrationBuilder.AddColumn<int>(
                name: "InterviewCooldownDays",
                table: "Questions",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastUsedInInterviewAt",
                table: "Questions",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "UsableInInterview",
                table: "Questions",
                type: "INTEGER",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "UsableInPractice",
                table: "Questions",
                type: "INTEGER",
                nullable: false,
                defaultValue: true);

            migrationBuilder.CreateTable(
                name: "CreditTopUps",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Credits = table.Column<int>(type: "INTEGER", nullable: false),
                    Amount = table.Column<decimal>(type: "TEXT", precision: 10, scale: 2, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CreditTopUps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CreditTopUps_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Groups",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    OrgId = table.Column<int>(type: "INTEGER", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Groups", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "InterviewTemplates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    Kind = table.Column<int>(type: "INTEGER", nullable: false),
                    VisibilityDefault = table.Column<int>(type: "INTEGER", nullable: false),
                    SelectionCriteriaJson = table.Column<string>(type: "TEXT", nullable: false, defaultValue: "{}"),
                    TotalTimeSec = table.Column<int>(type: "INTEGER", nullable: true),
                    PerQuestionTimeSec = table.Column<int>(type: "INTEGER", nullable: true),
                    NavigationMode = table.Column<int>(type: "INTEGER", nullable: false),
                    AllowPause = table.Column<bool>(type: "INTEGER", nullable: false),
                    MaxBacktracks = table.Column<int>(type: "INTEGER", nullable: true),
                    FeedbackMode = table.Column<int>(type: "INTEGER", nullable: false),
                    ShowHints = table.Column<bool>(type: "INTEGER", nullable: false),
                    ShowSources = table.Column<bool>(type: "INTEGER", nullable: false),
                    ShowGlossary = table.Column<bool>(type: "INTEGER", nullable: false),
                    MaxAttempts = table.Column<int>(type: "INTEGER", nullable: false),
                    CooldownHours = table.Column<int>(type: "INTEGER", nullable: false),
                    RequireFullscreen = table.Column<bool>(type: "INTEGER", nullable: false),
                    BlockCopyPaste = table.Column<bool>(type: "INTEGER", nullable: false),
                    TrackFocusLoss = table.Column<bool>(type: "INTEGER", nullable: false),
                    ProctoringEnabled = table.Column<bool>(type: "INTEGER", nullable: false),
                    CertificationEnabled = table.Column<bool>(type: "INTEGER", nullable: false),
                    InterviewCost = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InterviewTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QuestionKeywords",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    QuestionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Text = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Weight = table.Column<decimal>(type: "TEXT", precision: 5, scale: 2, nullable: false),
                    IsRequired = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionKeywords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuestionKeywords_Questions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "Questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SubscriptionPlans",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    Price = table.Column<decimal>(type: "TEXT", precision: 10, scale: 2, nullable: false),
                    InterviewCreditsPerMonth = table.Column<int>(type: "INTEGER", nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubscriptionPlans", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserGroups",
                columns: table => new
                {
                    GroupId = table.Column<int>(type: "INTEGER", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    RoleInGroup = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    JoinedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserGroups", x => new { x.GroupId, x.UserId });
                    table.ForeignKey(
                        name: "FK_UserGroups_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserGroups_Groups_GroupId",
                        column: x => x.GroupId,
                        principalTable: "Groups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SessionAssignments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    TemplateId = table.Column<int>(type: "INTEGER", nullable: false),
                    Visibility = table.Column<int>(type: "INTEGER", nullable: false),
                    GroupId = table.Column<int>(type: "INTEGER", nullable: true),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: true),
                    WindowStart = table.Column<DateTime>(type: "TEXT", nullable: true),
                    WindowEnd = table.Column<DateTime>(type: "TEXT", nullable: true),
                    MaxAttempts = table.Column<int>(type: "INTEGER", nullable: true),
                    CooldownHoursBetweenAttempts = table.Column<int>(type: "INTEGER", nullable: true),
                    CertificationEnabled = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SessionAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SessionAssignments_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SessionAssignments_Groups_GroupId",
                        column: x => x.GroupId,
                        principalTable: "Groups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SessionAssignments_InterviewTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "InterviewTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserSubscriptions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    SubscriptionPlanId = table.Column<int>(type: "INTEGER", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    StartDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    EndDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserSubscriptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserSubscriptions_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserSubscriptions_SubscriptionPlans_SubscriptionPlanId",
                        column: x => x.SubscriptionPlanId,
                        principalTable: "SubscriptionPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PracticeSessionsNew",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    AssignmentId = table.Column<int>(type: "INTEGER", nullable: true),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    PausedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    TotalScore = table.Column<int>(type: "INTEGER", nullable: false),
                    TotalTimeSec = table.Column<int>(type: "INTEGER", nullable: false),
                    CurrentQuestionState = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    CurrentQuestionIndex = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PracticeSessionsNew", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PracticeSessionsNew_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PracticeSessionsNew_SessionAssignments_AssignmentId",
                        column: x => x.AssignmentId,
                        principalTable: "SessionAssignments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "PracticeAnswers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    PracticeSessionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    QuestionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    SelectedOptionIds = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    GivenText = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    IsCorrect = table.Column<bool>(type: "INTEGER", nullable: false),
                    Score = table.Column<decimal>(type: "TEXT", nullable: false),
                    AnsweredAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    TimeSpentSec = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PracticeAnswers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PracticeAnswers_PracticeSessionsNew_PracticeSessionId",
                        column: x => x.PracticeSessionId,
                        principalTable: "PracticeSessionsNew",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PracticeAnswers_Questions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "Questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CreditLedgers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    TransactionType = table.Column<int>(type: "INTEGER", nullable: false),
                    Credits = table.Column<int>(type: "INTEGER", nullable: false),
                    BalanceAfter = table.Column<int>(type: "INTEGER", nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    SourceTopUpId = table.Column<Guid>(type: "TEXT", nullable: true),
                    InterviewSessionId = table.Column<Guid>(type: "TEXT", nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CreditLedgers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CreditLedgers_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CreditLedgers_CreditTopUps_SourceTopUpId",
                        column: x => x.SourceTopUpId,
                        principalTable: "CreditTopUps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "InterviewSessionsNew",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    AssignmentId = table.Column<int>(type: "INTEGER", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    TotalScore = table.Column<int>(type: "INTEGER", nullable: false),
                    TotalTimeSec = table.Column<int>(type: "INTEGER", nullable: false),
                    CurrentQuestionIndex = table.Column<int>(type: "INTEGER", nullable: false),
                    CertificateIssued = table.Column<bool>(type: "INTEGER", nullable: false),
                    ConsumedCreditLedgerId = table.Column<Guid>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InterviewSessionsNew", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InterviewSessionsNew_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InterviewSessionsNew_CreditLedgers_ConsumedCreditLedgerId",
                        column: x => x.ConsumedCreditLedgerId,
                        principalTable: "CreditLedgers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_InterviewSessionsNew_SessionAssignments_AssignmentId",
                        column: x => x.AssignmentId,
                        principalTable: "SessionAssignments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InterviewAnswersNew",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    InterviewSessionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    QuestionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    SelectedOptionIds = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    GivenText = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    IsCorrect = table.Column<bool>(type: "INTEGER", nullable: true),
                    Score = table.Column<decimal>(type: "TEXT", nullable: true),
                    AnsweredAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    TimeSpentSec = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InterviewAnswersNew", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InterviewAnswersNew_InterviewSessionsNew_InterviewSessionId",
                        column: x => x.InterviewSessionId,
                        principalTable: "InterviewSessionsNew",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InterviewAnswersNew_Questions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "Questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "InterviewCertificates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    InterviewSessionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    CertificateNumber = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    VerificationUrl = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    QrCodeData = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: false),
                    IssuedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    IsValid = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InterviewCertificates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InterviewCertificates_InterviewSessionsNew_InterviewSessionId",
                        column: x => x.InterviewSessionId,
                        principalTable: "InterviewSessionsNew",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SessionAuditEvents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    SessionType = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    SessionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    EventType = table.Column<int>(type: "INTEGER", nullable: false),
                    MetaJson = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    InterviewSessionNewId = table.Column<Guid>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SessionAuditEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SessionAuditEvents_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SessionAuditEvents_InterviewSessionsNew_InterviewSessionNewId",
                        column: x => x.InterviewSessionNewId,
                        principalTable: "InterviewSessionsNew",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Questions_LastUsedInInterviewAt",
                table: "Questions",
                column: "LastUsedInInterviewAt");

            migrationBuilder.CreateIndex(
                name: "IX_Questions_UsableInInterview",
                table: "Questions",
                column: "UsableInInterview");

            migrationBuilder.CreateIndex(
                name: "IX_Questions_UsableInPractice",
                table: "Questions",
                column: "UsableInPractice");

            migrationBuilder.CreateIndex(
                name: "IX_CreditLedgers_CreatedAt",
                table: "CreditLedgers",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_CreditLedgers_InterviewSessionId",
                table: "CreditLedgers",
                column: "InterviewSessionId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditLedgers_SourceTopUpId",
                table: "CreditLedgers",
                column: "SourceTopUpId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditLedgers_UserId",
                table: "CreditLedgers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditTopUps_UserId",
                table: "CreditTopUps",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewAnswersNew_InterviewSessionId",
                table: "InterviewAnswersNew",
                column: "InterviewSessionId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewAnswersNew_QuestionId",
                table: "InterviewAnswersNew",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewCertificates_CertificateNumber",
                table: "InterviewCertificates",
                column: "CertificateNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InterviewCertificates_InterviewSessionId",
                table: "InterviewCertificates",
                column: "InterviewSessionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InterviewSessionsNew_AssignmentId",
                table: "InterviewSessionsNew",
                column: "AssignmentId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewSessionsNew_ConsumedCreditLedgerId",
                table: "InterviewSessionsNew",
                column: "ConsumedCreditLedgerId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewSessionsNew_UserId",
                table: "InterviewSessionsNew",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_PracticeAnswers_PracticeSessionId",
                table: "PracticeAnswers",
                column: "PracticeSessionId");

            migrationBuilder.CreateIndex(
                name: "IX_PracticeAnswers_QuestionId",
                table: "PracticeAnswers",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_PracticeSessionsNew_AssignmentId",
                table: "PracticeSessionsNew",
                column: "AssignmentId");

            migrationBuilder.CreateIndex(
                name: "IX_PracticeSessionsNew_UserId",
                table: "PracticeSessionsNew",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionKeywords_QuestionId",
                table: "QuestionKeywords",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_SessionAssignments_GroupId",
                table: "SessionAssignments",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_SessionAssignments_TemplateId",
                table: "SessionAssignments",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_SessionAssignments_UserId",
                table: "SessionAssignments",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_SessionAuditEvents_CreatedAt",
                table: "SessionAuditEvents",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_SessionAuditEvents_InterviewSessionNewId",
                table: "SessionAuditEvents",
                column: "InterviewSessionNewId");

            migrationBuilder.CreateIndex(
                name: "IX_SessionAuditEvents_SessionType_SessionId",
                table: "SessionAuditEvents",
                columns: new[] { "SessionType", "SessionId" });

            migrationBuilder.CreateIndex(
                name: "IX_SessionAuditEvents_UserId",
                table: "SessionAuditEvents",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserGroups_UserId",
                table: "UserGroups",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserSubscriptions_SubscriptionPlanId",
                table: "UserSubscriptions",
                column: "SubscriptionPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_UserSubscriptions_UserId",
                table: "UserSubscriptions",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_CreditLedgers_InterviewSessionsNew_InterviewSessionId",
                table: "CreditLedgers",
                column: "InterviewSessionId",
                principalTable: "InterviewSessionsNew",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CreditLedgers_CreditTopUps_SourceTopUpId",
                table: "CreditLedgers");

            migrationBuilder.DropForeignKey(
                name: "FK_CreditLedgers_InterviewSessionsNew_InterviewSessionId",
                table: "CreditLedgers");

            migrationBuilder.DropTable(
                name: "InterviewAnswersNew");

            migrationBuilder.DropTable(
                name: "InterviewCertificates");

            migrationBuilder.DropTable(
                name: "PracticeAnswers");

            migrationBuilder.DropTable(
                name: "QuestionKeywords");

            migrationBuilder.DropTable(
                name: "SessionAuditEvents");

            migrationBuilder.DropTable(
                name: "UserGroups");

            migrationBuilder.DropTable(
                name: "UserSubscriptions");

            migrationBuilder.DropTable(
                name: "PracticeSessionsNew");

            migrationBuilder.DropTable(
                name: "SubscriptionPlans");

            migrationBuilder.DropTable(
                name: "CreditTopUps");

            migrationBuilder.DropTable(
                name: "InterviewSessionsNew");

            migrationBuilder.DropTable(
                name: "CreditLedgers");

            migrationBuilder.DropTable(
                name: "SessionAssignments");

            migrationBuilder.DropTable(
                name: "Groups");

            migrationBuilder.DropTable(
                name: "InterviewTemplates");

            migrationBuilder.DropIndex(
                name: "IX_Questions_LastUsedInInterviewAt",
                table: "Questions");

            migrationBuilder.DropIndex(
                name: "IX_Questions_UsableInInterview",
                table: "Questions");

            migrationBuilder.DropIndex(
                name: "IX_Questions_UsableInPractice",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "Difficulty",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "EstimatedTimeSec",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "InterviewCooldownDays",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "LastUsedInInterviewAt",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "UsableInInterview",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "UsableInPractice",
                table: "Questions");
        }
    }
}
