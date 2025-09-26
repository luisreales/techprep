using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechPrep.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddInterviewSessionStateFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "NumberAttemps",
                table: "InterviewSessionsNew",
                newName: "AttemptNumber");

            migrationBuilder.RenameColumn(
                name: "NumberAttemps",
                table: "InterviewAnswersNew",
                newName: "AttemptNumber");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "InterviewSessionsNew",
                type: "TEXT",
                nullable: false,
                defaultValue: "Assigned",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldDefaultValue: "Active");

            migrationBuilder.AddColumn<DateTime>(
                name: "FinalizedAt",
                table: "InterviewSessionsNew",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ParentSessionId",
                table: "InterviewSessionsNew",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FinalizedAt",
                table: "InterviewSessionsNew");

            migrationBuilder.DropColumn(
                name: "ParentSessionId",
                table: "InterviewSessionsNew");

            migrationBuilder.RenameColumn(
                name: "AttemptNumber",
                table: "InterviewSessionsNew",
                newName: "NumberAttemps");

            migrationBuilder.RenameColumn(
                name: "AttemptNumber",
                table: "InterviewAnswersNew",
                newName: "NumberAttemps");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "InterviewSessionsNew",
                type: "TEXT",
                nullable: false,
                defaultValue: "Active",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldDefaultValue: "Assigned");
        }
    }
}
