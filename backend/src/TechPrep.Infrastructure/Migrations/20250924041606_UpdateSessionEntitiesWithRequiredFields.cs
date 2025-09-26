using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechPrep.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSessionEntitiesWithRequiredFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CorrectCount",
                table: "PracticeSessionsNew",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "FinishedAt",
                table: "PracticeSessionsNew",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "IncorrectCount",
                table: "PracticeSessionsNew",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalItems",
                table: "PracticeSessionsNew",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "GivenAnswer",
                table: "PracticeAnswers",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "MatchPercentage",
                table: "PracticeAnswers",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TimeMs",
                table: "PracticeAnswers",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CorrectCount",
                table: "InterviewSessionsNew",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "FinishedAt",
                table: "InterviewSessionsNew",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "IncorrectCount",
                table: "InterviewSessionsNew",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalItems",
                table: "InterviewSessionsNew",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CorrectCount",
                table: "PracticeSessionsNew");

            migrationBuilder.DropColumn(
                name: "FinishedAt",
                table: "PracticeSessionsNew");

            migrationBuilder.DropColumn(
                name: "IncorrectCount",
                table: "PracticeSessionsNew");

            migrationBuilder.DropColumn(
                name: "TotalItems",
                table: "PracticeSessionsNew");

            migrationBuilder.DropColumn(
                name: "GivenAnswer",
                table: "PracticeAnswers");

            migrationBuilder.DropColumn(
                name: "MatchPercentage",
                table: "PracticeAnswers");

            migrationBuilder.DropColumn(
                name: "TimeMs",
                table: "PracticeAnswers");

            migrationBuilder.DropColumn(
                name: "CorrectCount",
                table: "InterviewSessionsNew");

            migrationBuilder.DropColumn(
                name: "FinishedAt",
                table: "InterviewSessionsNew");

            migrationBuilder.DropColumn(
                name: "IncorrectCount",
                table: "InterviewSessionsNew");

            migrationBuilder.DropColumn(
                name: "TotalItems",
                table: "InterviewSessionsNew");
        }
    }
}
