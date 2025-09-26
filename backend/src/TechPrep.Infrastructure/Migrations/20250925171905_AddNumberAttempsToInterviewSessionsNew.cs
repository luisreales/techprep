using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechPrep.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNumberAttempsToInterviewSessionsNew : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InterviewAnswersNew_Questions_QuestionId",
                table: "InterviewAnswersNew");

            migrationBuilder.DropForeignKey(
                name: "FK_InterviewCertificates_InterviewSessionsNew_InterviewSessionId",
                table: "InterviewCertificates");

            migrationBuilder.DropForeignKey(
                name: "FK_InterviewSessionsNew_AspNetUsers_UserId",
                table: "InterviewSessionsNew");

            migrationBuilder.DropForeignKey(
                name: "FK_InterviewSessionsNew_CreditLedgers_ConsumedCreditLedgerId",
                table: "InterviewSessionsNew");

            migrationBuilder.DropForeignKey(
                name: "FK_InterviewSessionsNew_SessionAssignments_AssignmentId",
                table: "InterviewSessionsNew");

            migrationBuilder.DropForeignKey(
                name: "FK_SessionAuditEvents_InterviewSessionsNew_InterviewSessionNewId",
                table: "SessionAuditEvents");

            migrationBuilder.DropIndex(
                name: "IX_SessionAuditEvents_InterviewSessionNewId",
                table: "SessionAuditEvents");

            migrationBuilder.DropIndex(
                name: "IX_InterviewSessionsNew_AssignmentId",
                table: "InterviewSessionsNew");

            migrationBuilder.DropIndex(
                name: "IX_InterviewSessionsNew_ConsumedCreditLedgerId",
                table: "InterviewSessionsNew");

            migrationBuilder.DropIndex(
                name: "IX_InterviewSessionsNew_UserId",
                table: "InterviewSessionsNew");

            migrationBuilder.DropIndex(
                name: "IX_InterviewCertificates_InterviewSessionId",
                table: "InterviewCertificates");

            migrationBuilder.DropIndex(
                name: "IX_InterviewAnswersNew_QuestionId",
                table: "InterviewAnswersNew");

            migrationBuilder.DropColumn(
                name: "InterviewSessionNewId",
                table: "SessionAuditEvents");

            migrationBuilder.DropColumn(
                name: "FinishedAt",
                table: "InterviewSessionsNew");

            migrationBuilder.DropColumn(
                name: "GivenAnswer",
                table: "InterviewAnswersNew");

            migrationBuilder.DropColumn(
                name: "MatchPercentage",
                table: "InterviewAnswersNew");

            migrationBuilder.DropColumn(
                name: "Score",
                table: "InterviewAnswersNew");

            migrationBuilder.DropColumn(
                name: "SelectedOptionsJson",
                table: "InterviewAnswersNew");

            migrationBuilder.DropColumn(
                name: "TimeSpentSec",
                table: "InterviewAnswersNew");

            migrationBuilder.RenameColumn(
                name: "SelectedOptionIds",
                table: "InterviewAnswersNew",
                newName: "ChosenOptionIdsJson");

            migrationBuilder.RenameColumn(
                name: "AnsweredAt",
                table: "InterviewAnswersNew",
                newName: "CreatedAt");

            migrationBuilder.AlterColumn<int>(
                name: "TotalTimeSec",
                table: "InterviewSessionsNew",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<int>(
                name: "TotalScore",
                table: "InterviewSessionsNew",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<int>(
                name: "TotalItems",
                table: "InterviewSessionsNew",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "InterviewSessionsNew",
                type: "TEXT",
                nullable: false,
                defaultValue: "Active",
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<int>(
                name: "IncorrectCount",
                table: "InterviewSessionsNew",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<int>(
                name: "CurrentQuestionIndex",
                table: "InterviewSessionsNew",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<int>(
                name: "CorrectCount",
                table: "InterviewSessionsNew",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<int>(
                name: "ConsumedCreditLedgerId",
                table: "InterviewSessionsNew",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "CertificateIssued",
                table: "InterviewSessionsNew",
                type: "INTEGER",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "INTEGER");

            migrationBuilder.AddColumn<int>(
                name: "NumberAttemps",
                table: "InterviewSessionsNew",
                type: "INTEGER",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<int>(
                name: "SessionAssignmentId",
                table: "InterviewSessionsNew",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SessionId1",
                table: "InterviewCertificates",
                type: "TEXT",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AlterColumn<int>(
                name: "TimeMs",
                table: "InterviewAnswersNew",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<bool>(
                name: "IsCorrect",
                table: "InterviewAnswersNew",
                type: "INTEGER",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MatchPercent",
                table: "InterviewAnswersNew",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NumberAttemps",
                table: "InterviewAnswersNew",
                type: "INTEGER",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "InterviewAnswersNew",
                type: "TEXT",
                nullable: false,
                defaultValue: "single");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewSessionsNew_SessionAssignmentId",
                table: "InterviewSessionsNew",
                column: "SessionAssignmentId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewCertificates_SessionId1",
                table: "InterviewCertificates",
                column: "SessionId1");

            migrationBuilder.AddForeignKey(
                name: "FK_InterviewCertificates_InterviewSessionsNew_SessionId1",
                table: "InterviewCertificates",
                column: "SessionId1",
                principalTable: "InterviewSessionsNew",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_InterviewSessionsNew_SessionAssignments_SessionAssignmentId",
                table: "InterviewSessionsNew",
                column: "SessionAssignmentId",
                principalTable: "SessionAssignments",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InterviewCertificates_InterviewSessionsNew_SessionId1",
                table: "InterviewCertificates");

            migrationBuilder.DropForeignKey(
                name: "FK_InterviewSessionsNew_SessionAssignments_SessionAssignmentId",
                table: "InterviewSessionsNew");

            migrationBuilder.DropIndex(
                name: "IX_InterviewSessionsNew_SessionAssignmentId",
                table: "InterviewSessionsNew");

            migrationBuilder.DropIndex(
                name: "IX_InterviewCertificates_SessionId1",
                table: "InterviewCertificates");

            migrationBuilder.DropColumn(
                name: "NumberAttemps",
                table: "InterviewSessionsNew");

            migrationBuilder.DropColumn(
                name: "SessionAssignmentId",
                table: "InterviewSessionsNew");

            migrationBuilder.DropColumn(
                name: "SessionId1",
                table: "InterviewCertificates");

            migrationBuilder.DropColumn(
                name: "MatchPercent",
                table: "InterviewAnswersNew");

            migrationBuilder.DropColumn(
                name: "NumberAttemps",
                table: "InterviewAnswersNew");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "InterviewAnswersNew");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "InterviewAnswersNew",
                newName: "AnsweredAt");

            migrationBuilder.RenameColumn(
                name: "ChosenOptionIdsJson",
                table: "InterviewAnswersNew",
                newName: "SelectedOptionIds");

            migrationBuilder.AddColumn<Guid>(
                name: "InterviewSessionNewId",
                table: "SessionAuditEvents",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "TotalTimeSec",
                table: "InterviewSessionsNew",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldDefaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "TotalScore",
                table: "InterviewSessionsNew",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldDefaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "TotalItems",
                table: "InterviewSessionsNew",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldDefaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "InterviewSessionsNew",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldDefaultValue: "Active");

            migrationBuilder.AlterColumn<int>(
                name: "IncorrectCount",
                table: "InterviewSessionsNew",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldDefaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "CurrentQuestionIndex",
                table: "InterviewSessionsNew",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldDefaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "CorrectCount",
                table: "InterviewSessionsNew",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldDefaultValue: 0);

            migrationBuilder.AlterColumn<Guid>(
                name: "ConsumedCreditLedgerId",
                table: "InterviewSessionsNew",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "CertificateIssued",
                table: "InterviewSessionsNew",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "INTEGER",
                oldDefaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "FinishedAt",
                table: "InterviewSessionsNew",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "TimeMs",
                table: "InterviewAnswersNew",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldDefaultValue: 0);

            migrationBuilder.AlterColumn<bool>(
                name: "IsCorrect",
                table: "InterviewAnswersNew",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "INTEGER",
                oldDefaultValue: false);

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

            migrationBuilder.AddColumn<decimal>(
                name: "Score",
                table: "InterviewAnswersNew",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SelectedOptionsJson",
                table: "InterviewAnswersNew",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TimeSpentSec",
                table: "InterviewAnswersNew",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_SessionAuditEvents_InterviewSessionNewId",
                table: "SessionAuditEvents",
                column: "InterviewSessionNewId");

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
                name: "IX_InterviewCertificates_InterviewSessionId",
                table: "InterviewCertificates",
                column: "InterviewSessionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InterviewAnswersNew_QuestionId",
                table: "InterviewAnswersNew",
                column: "QuestionId");

            migrationBuilder.AddForeignKey(
                name: "FK_InterviewAnswersNew_Questions_QuestionId",
                table: "InterviewAnswersNew",
                column: "QuestionId",
                principalTable: "Questions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_InterviewCertificates_InterviewSessionsNew_InterviewSessionId",
                table: "InterviewCertificates",
                column: "InterviewSessionId",
                principalTable: "InterviewSessionsNew",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_InterviewSessionsNew_AspNetUsers_UserId",
                table: "InterviewSessionsNew",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_InterviewSessionsNew_CreditLedgers_ConsumedCreditLedgerId",
                table: "InterviewSessionsNew",
                column: "ConsumedCreditLedgerId",
                principalTable: "CreditLedgers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_InterviewSessionsNew_SessionAssignments_AssignmentId",
                table: "InterviewSessionsNew",
                column: "AssignmentId",
                principalTable: "SessionAssignments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SessionAuditEvents_InterviewSessionsNew_InterviewSessionNewId",
                table: "SessionAuditEvents",
                column: "InterviewSessionNewId",
                principalTable: "InterviewSessionsNew",
                principalColumn: "Id");
        }
    }
}
