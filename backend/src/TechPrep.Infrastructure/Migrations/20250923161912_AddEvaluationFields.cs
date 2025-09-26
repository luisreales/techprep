using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechPrep.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEvaluationFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GivenAnswer",
                table: "InterviewAnswersNew",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "MatchPercentage",
                table: "InterviewAnswersNew",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SelectedOptionsJson",
                table: "InterviewAnswersNew",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TimeMs",
                table: "InterviewAnswersNew",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TimeMs",
                table: "InterviewAnswer",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GivenAnswer",
                table: "InterviewAnswersNew");

            migrationBuilder.DropColumn(
                name: "MatchPercentage",
                table: "InterviewAnswersNew");

            migrationBuilder.DropColumn(
                name: "SelectedOptionsJson",
                table: "InterviewAnswersNew");

            migrationBuilder.DropColumn(
                name: "TimeMs",
                table: "InterviewAnswersNew");

            migrationBuilder.DropColumn(
                name: "TimeMs",
                table: "InterviewAnswer");
        }
    }
}
