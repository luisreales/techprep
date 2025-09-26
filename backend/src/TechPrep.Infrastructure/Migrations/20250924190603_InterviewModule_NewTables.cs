using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechPrep.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InterviewModule_NewTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InterviewAnswer");

            migrationBuilder.DropTable(
                name: "PracticeSessionItems");

            migrationBuilder.DropTable(
                name: "InterviewSession");

            migrationBuilder.DropTable(
                name: "PracticeSessions");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "InterviewSession",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    TopicId = table.Column<int>(type: "INTEGER", nullable: true),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    CorrectAnswers = table.Column<int>(type: "INTEGER", nullable: false),
                    FinishedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsCompleted = table.Column<bool>(type: "INTEGER", nullable: false),
                    Level = table.Column<int>(type: "INTEGER", nullable: true),
                    Mode = table.Column<int>(type: "INTEGER", nullable: false),
                    Score = table.Column<decimal>(type: "TEXT", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    TotalQuestions = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InterviewSession", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InterviewSession_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InterviewSession_Topics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "Topics",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "PracticeSessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    TemplateId = table.Column<int>(type: "INTEGER", nullable: true),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    CorrectCount = table.Column<int>(type: "INTEGER", nullable: false),
                    FinishedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IncorrectCount = table.Column<int>(type: "INTEGER", nullable: false),
                    Mode = table.Column<int>(type: "INTEGER", nullable: false),
                    RandomOrder = table.Column<bool>(type: "INTEGER", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ThresholdWritten = table.Column<int>(type: "INTEGER", nullable: false),
                    TimeLimitMin = table.Column<int>(type: "INTEGER", nullable: true),
                    TotalItems = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PracticeSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PracticeSessions_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PracticeSessions_SessionTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "SessionTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "InterviewAnswer",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    QuestionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    SessionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    AnsweredAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    GivenAnswer = table.Column<string>(type: "TEXT", nullable: true),
                    IsCorrect = table.Column<bool>(type: "INTEGER", nullable: false),
                    MatchPercentage = table.Column<decimal>(type: "TEXT", nullable: true),
                    SelectedOptionsJson = table.Column<string>(type: "TEXT", nullable: true),
                    TimeMs = table.Column<int>(type: "INTEGER", nullable: false),
                    TimeSpentSeconds = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InterviewAnswer", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InterviewAnswer_InterviewSession_SessionId",
                        column: x => x.SessionId,
                        principalTable: "InterviewSession",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InterviewAnswer_Questions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "Questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PracticeSessionItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    SessionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    TopicId = table.Column<int>(type: "INTEGER", nullable: false),
                    AnsweredAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ChallengeSolved = table.Column<bool>(type: "INTEGER", nullable: true),
                    ChosenOptionsJson = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    GivenText = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    IsCorrect = table.Column<bool>(type: "INTEGER", nullable: true),
                    ItemId = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    ItemType = table.Column<int>(type: "INTEGER", nullable: false),
                    Level = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    MatchPercent = table.Column<int>(type: "INTEGER", nullable: true),
                    OrderIndex = table.Column<int>(type: "INTEGER", nullable: false),
                    TimeMs = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PracticeSessionItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PracticeSessionItems_PracticeSessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "PracticeSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PracticeSessionItems_Topics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "Topics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_InterviewAnswer_QuestionId",
                table: "InterviewAnswer",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewAnswer_SessionId",
                table: "InterviewAnswer",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewSession_TopicId",
                table: "InterviewSession",
                column: "TopicId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewSession_UserId",
                table: "InterviewSession",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_PracticeSessionItems_SessionId",
                table: "PracticeSessionItems",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_PracticeSessionItems_SessionId_OrderIndex",
                table: "PracticeSessionItems",
                columns: new[] { "SessionId", "OrderIndex" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PracticeSessionItems_TopicId",
                table: "PracticeSessionItems",
                column: "TopicId");

            migrationBuilder.CreateIndex(
                name: "IX_PracticeSessions_StartedAt",
                table: "PracticeSessions",
                column: "StartedAt");

            migrationBuilder.CreateIndex(
                name: "IX_PracticeSessions_TemplateId",
                table: "PracticeSessions",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_PracticeSessions_UserId",
                table: "PracticeSessions",
                column: "UserId");
        }
    }
}
