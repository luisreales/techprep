using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechPrep.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePracticeSessionSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PracticeSessionTopics_Topics_TopicId",
                table: "PracticeSessionTopics");

            migrationBuilder.DropIndex(
                name: "IX_PracticeSessionTopics_TopicId",
                table: "PracticeSessionTopics");

            migrationBuilder.AlterColumn<string>(
                name: "TopicId",
                table: "PracticeSessionTopics",
                type: "TEXT",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AddColumn<string>(
                name: "Levels",
                table: "PracticeSessionTopics",
                type: "TEXT",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "TopicId1",
                table: "PracticeSessionTopics",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "PracticeSessionsNew",
                type: "TEXT",
                maxLength: 80,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_PracticeSessionTopics_TopicId1",
                table: "PracticeSessionTopics",
                column: "TopicId1");

            migrationBuilder.AddForeignKey(
                name: "FK_PracticeSessionTopics_Topics_TopicId1",
                table: "PracticeSessionTopics",
                column: "TopicId1",
                principalTable: "Topics",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PracticeSessionTopics_Topics_TopicId1",
                table: "PracticeSessionTopics");

            migrationBuilder.DropIndex(
                name: "IX_PracticeSessionTopics_TopicId1",
                table: "PracticeSessionTopics");

            migrationBuilder.DropColumn(
                name: "Levels",
                table: "PracticeSessionTopics");

            migrationBuilder.DropColumn(
                name: "TopicId1",
                table: "PracticeSessionTopics");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "PracticeSessionsNew");

            migrationBuilder.AlterColumn<int>(
                name: "TopicId",
                table: "PracticeSessionTopics",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 50);

            migrationBuilder.CreateIndex(
                name: "IX_PracticeSessionTopics_TopicId",
                table: "PracticeSessionTopics",
                column: "TopicId");

            migrationBuilder.AddForeignKey(
                name: "FK_PracticeSessionTopics_Topics_TopicId",
                table: "PracticeSessionTopics",
                column: "TopicId",
                principalTable: "Topics",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
