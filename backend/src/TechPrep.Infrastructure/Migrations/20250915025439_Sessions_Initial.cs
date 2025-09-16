using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechPrep.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Sessions_Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SessionTemplates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Mode = table.Column<int>(type: "INTEGER", nullable: false),
                    TopicsJson = table.Column<string>(type: "TEXT", nullable: false, defaultValue: "[]"),
                    LevelsJson = table.Column<string>(type: "TEXT", nullable: false, defaultValue: "[]"),
                    RandomOrder = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: true),
                    TimeLimitMin = table.Column<int>(type: "INTEGER", nullable: true),
                    ThresholdWritten = table.Column<int>(type: "INTEGER", nullable: false, defaultValue: 80),
                    Status = table.Column<int>(type: "INTEGER", nullable: false, defaultValue: 1),
                    QuestionsConfigJson = table.Column<string>(type: "TEXT", nullable: false, defaultValue: "{}"),
                    ChallengesConfigJson = table.Column<string>(type: "TEXT", nullable: false, defaultValue: "{}"),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SessionTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PracticeSessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    TemplateId = table.Column<int>(type: "INTEGER", nullable: true),
                    Mode = table.Column<int>(type: "INTEGER", nullable: false),
                    RandomOrder = table.Column<bool>(type: "INTEGER", nullable: false),
                    TimeLimitMin = table.Column<int>(type: "INTEGER", nullable: true),
                    ThresholdWritten = table.Column<int>(type: "INTEGER", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    FinishedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    TotalItems = table.Column<int>(type: "INTEGER", nullable: false),
                    CorrectCount = table.Column<int>(type: "INTEGER", nullable: false),
                    IncorrectCount = table.Column<int>(type: "INTEGER", nullable: false)
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
                name: "SessionTemplateItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    TemplateId = table.Column<int>(type: "INTEGER", nullable: false),
                    ItemType = table.Column<int>(type: "INTEGER", nullable: false),
                    ItemId = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    OrderIndex = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SessionTemplateItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SessionTemplateItems_SessionTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "SessionTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PracticeSessionItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    SessionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    OrderIndex = table.Column<int>(type: "INTEGER", nullable: false),
                    ItemType = table.Column<int>(type: "INTEGER", nullable: false),
                    ItemId = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Level = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    TopicId = table.Column<int>(type: "INTEGER", nullable: false),
                    TimeMs = table.Column<int>(type: "INTEGER", nullable: false),
                    IsCorrect = table.Column<bool>(type: "INTEGER", nullable: true),
                    MatchPercent = table.Column<int>(type: "INTEGER", nullable: true),
                    ChosenOptionsJson = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    GivenText = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    ChallengeSolved = table.Column<bool>(type: "INTEGER", nullable: true),
                    AnsweredAt = table.Column<DateTime>(type: "TEXT", nullable: true)
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

            migrationBuilder.CreateIndex(
                name: "IX_SessionTemplateItems_TemplateId",
                table: "SessionTemplateItems",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_SessionTemplateItems_TemplateId_OrderIndex",
                table: "SessionTemplateItems",
                columns: new[] { "TemplateId", "OrderIndex" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PracticeSessionItems");

            migrationBuilder.DropTable(
                name: "SessionTemplateItems");

            migrationBuilder.DropTable(
                name: "PracticeSessions");

            migrationBuilder.DropTable(
                name: "SessionTemplates");
        }
    }
}
