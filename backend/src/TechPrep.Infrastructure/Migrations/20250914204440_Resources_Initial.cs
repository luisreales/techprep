using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechPrep.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Resources_Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LearningResources_Questions_QuestionId",
                table: "LearningResources");

            migrationBuilder.DropIndex(
                name: "IX_LearningResources_QuestionId",
                table: "LearningResources");

            migrationBuilder.DropColumn(
                name: "QuestionId",
                table: "LearningResources");

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "LearningResources",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "TEXT")
                .Annotation("Sqlite:Autoincrement", true);

            migrationBuilder.AddColumn<string>(
                name: "Author",
                table: "LearningResources",
                type: "TEXT",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Difficulty",
                table: "LearningResources",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "Duration",
                table: "LearningResources",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Kind",
                table: "LearningResources",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<double>(
                name: "Rating",
                table: "LearningResources",
                type: "REAL",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "LearningResources",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "QuestionResources",
                columns: table => new
                {
                    QuestionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ResourceId = table.Column<int>(type: "INTEGER", nullable: false),
                    Note = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionResources", x => new { x.QuestionId, x.ResourceId });
                    table.ForeignKey(
                        name: "FK_QuestionResources_LearningResources_ResourceId",
                        column: x => x.ResourceId,
                        principalTable: "LearningResources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_QuestionResources_Questions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "Questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ResourceTopics",
                columns: table => new
                {
                    ResourceId = table.Column<int>(type: "INTEGER", nullable: false),
                    TopicId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResourceTopics", x => new { x.ResourceId, x.TopicId });
                    table.ForeignKey(
                        name: "FK_ResourceTopics_LearningResources_ResourceId",
                        column: x => x.ResourceId,
                        principalTable: "LearningResources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ResourceTopics_Topics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "Topics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_QuestionResources_ResourceId",
                table: "QuestionResources",
                column: "ResourceId");

            migrationBuilder.CreateIndex(
                name: "IX_ResourceTopics_TopicId",
                table: "ResourceTopics",
                column: "TopicId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "QuestionResources");

            migrationBuilder.DropTable(
                name: "ResourceTopics");

            migrationBuilder.DropColumn(
                name: "Author",
                table: "LearningResources");

            migrationBuilder.DropColumn(
                name: "Difficulty",
                table: "LearningResources");

            migrationBuilder.DropColumn(
                name: "Duration",
                table: "LearningResources");

            migrationBuilder.DropColumn(
                name: "Kind",
                table: "LearningResources");

            migrationBuilder.DropColumn(
                name: "Rating",
                table: "LearningResources");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "LearningResources");

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "LearningResources",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .OldAnnotation("Sqlite:Autoincrement", true);

            migrationBuilder.AddColumn<Guid>(
                name: "QuestionId",
                table: "LearningResources",
                type: "TEXT",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_LearningResources_QuestionId",
                table: "LearningResources",
                column: "QuestionId");

            migrationBuilder.AddForeignKey(
                name: "FK_LearningResources_Questions_QuestionId",
                table: "LearningResources",
                column: "QuestionId",
                principalTable: "Questions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
