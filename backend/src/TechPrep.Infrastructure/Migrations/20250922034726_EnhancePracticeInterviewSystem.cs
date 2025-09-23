using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechPrep.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EnhancePracticeInterviewSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_InterviewCertificates_CertificateNumber",
                table: "InterviewCertificates");

            migrationBuilder.DropColumn(
                name: "RoleInGroup",
                table: "UserGroups");

            migrationBuilder.RenameColumn(
                name: "CertificateNumber",
                table: "InterviewCertificates",
                newName: "SessionId");

            migrationBuilder.RenameColumn(
                name: "OrgId",
                table: "Groups",
                newName: "OrganizationId");

            migrationBuilder.AddColumn<Guid>(
                name: "AddedByUserId",
                table: "UserGroups",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "UserGroups",
                type: "TEXT",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "InterviewCertificates",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "TEXT")
                .Annotation("Sqlite:Autoincrement", true);

            migrationBuilder.AddColumn<string>(
                name: "CertificateId",
                table: "InterviewCertificates",
                type: "TEXT",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedAt",
                table: "InterviewCertificates",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "DurationMinutes",
                table: "InterviewCertificates",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "HasIntegrityViolations",
                table: "InterviewCertificates",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "IntegrityNotes",
                table: "InterviewCertificates",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "IntegrityViolationsCount",
                table: "InterviewCertificates",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "IssuedByUserId",
                table: "InterviewCertificates",
                type: "TEXT",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<int>(
                name: "MaxScore",
                table: "InterviewCertificates",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "PdfFileName",
                table: "InterviewCertificates",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PdfFilePath",
                table: "InterviewCertificates",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "PdfFileSize",
                table: "InterviewCertificates",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RevocationReason",
                table: "InterviewCertificates",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RevokedAt",
                table: "InterviewCertificates",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "ScorePercentage",
                table: "InterviewCertificates",
                type: "REAL",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "SkillsAssessedJson",
                table: "InterviewCertificates",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "TemplateId",
                table: "InterviewCertificates",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TemplateName",
                table: "InterviewCertificates",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TopicsJson",
                table: "InterviewCertificates",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "TotalScore",
                table: "InterviewCertificates",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "InterviewCertificates",
                type: "TEXT",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "UserName",
                table: "InterviewCertificates",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "VerificationHash",
                table: "InterviewCertificates",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "Groups",
                type: "TEXT",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Groups",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "OrganizationId",
                table: "AspNetUsers",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CertificateTemplate",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    IsDefault = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    HeaderHtml = table.Column<string>(type: "TEXT", nullable: false),
                    BodyHtml = table.Column<string>(type: "TEXT", nullable: false),
                    FooterHtml = table.Column<string>(type: "TEXT", nullable: false),
                    CssStyles = table.Column<string>(type: "TEXT", nullable: false),
                    PrimaryColor = table.Column<string>(type: "TEXT", nullable: false),
                    SecondaryColor = table.Column<string>(type: "TEXT", nullable: false),
                    LogoUrl = table.Column<string>(type: "TEXT", nullable: false),
                    CompanyName = table.Column<string>(type: "TEXT", nullable: false),
                    PageSize = table.Column<string>(type: "TEXT", nullable: false),
                    Orientation = table.Column<string>(type: "TEXT", nullable: false),
                    FontFamily = table.Column<string>(type: "TEXT", nullable: false),
                    ShowScore = table.Column<bool>(type: "INTEGER", nullable: false),
                    ShowDuration = table.Column<bool>(type: "INTEGER", nullable: false),
                    ShowTopicBreakdown = table.Column<bool>(type: "INTEGER", nullable: false),
                    ShowIntegrityStatus = table.Column<bool>(type: "INTEGER", nullable: false),
                    ShowQrCode = table.Column<bool>(type: "INTEGER", nullable: false),
                    ShowVerificationUrl = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CertificateTemplate", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Organization",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Domain = table.Column<string>(type: "TEXT", nullable: true),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Organization", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserGroups_AddedByUserId",
                table: "UserGroups",
                column: "AddedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewCertificates_CertificateId",
                table: "InterviewCertificates",
                column: "CertificateId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InterviewCertificates_IssuedByUserId",
                table: "InterviewCertificates",
                column: "IssuedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewCertificates_TemplateId",
                table: "InterviewCertificates",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewCertificates_UserId",
                table: "InterviewCertificates",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Groups_CreatedByUserId",
                table: "Groups",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Groups_OrganizationId",
                table: "Groups",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_OrganizationId",
                table: "AspNetUsers",
                column: "OrganizationId");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_Organization_OrganizationId",
                table: "AspNetUsers",
                column: "OrganizationId",
                principalTable: "Organization",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Groups_AspNetUsers_CreatedByUserId",
                table: "Groups",
                column: "CreatedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Groups_Organization_OrganizationId",
                table: "Groups",
                column: "OrganizationId",
                principalTable: "Organization",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_InterviewCertificates_AspNetUsers_IssuedByUserId",
                table: "InterviewCertificates",
                column: "IssuedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_InterviewCertificates_AspNetUsers_UserId",
                table: "InterviewCertificates",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_InterviewCertificates_CertificateTemplate_TemplateId",
                table: "InterviewCertificates",
                column: "TemplateId",
                principalTable: "CertificateTemplate",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_UserGroups_AspNetUsers_AddedByUserId",
                table: "UserGroups",
                column: "AddedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_Organization_OrganizationId",
                table: "AspNetUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_Groups_AspNetUsers_CreatedByUserId",
                table: "Groups");

            migrationBuilder.DropForeignKey(
                name: "FK_Groups_Organization_OrganizationId",
                table: "Groups");

            migrationBuilder.DropForeignKey(
                name: "FK_InterviewCertificates_AspNetUsers_IssuedByUserId",
                table: "InterviewCertificates");

            migrationBuilder.DropForeignKey(
                name: "FK_InterviewCertificates_AspNetUsers_UserId",
                table: "InterviewCertificates");

            migrationBuilder.DropForeignKey(
                name: "FK_InterviewCertificates_CertificateTemplate_TemplateId",
                table: "InterviewCertificates");

            migrationBuilder.DropForeignKey(
                name: "FK_UserGroups_AspNetUsers_AddedByUserId",
                table: "UserGroups");

            migrationBuilder.DropTable(
                name: "CertificateTemplate");

            migrationBuilder.DropTable(
                name: "Organization");

            migrationBuilder.DropIndex(
                name: "IX_UserGroups_AddedByUserId",
                table: "UserGroups");

            migrationBuilder.DropIndex(
                name: "IX_InterviewCertificates_CertificateId",
                table: "InterviewCertificates");

            migrationBuilder.DropIndex(
                name: "IX_InterviewCertificates_IssuedByUserId",
                table: "InterviewCertificates");

            migrationBuilder.DropIndex(
                name: "IX_InterviewCertificates_TemplateId",
                table: "InterviewCertificates");

            migrationBuilder.DropIndex(
                name: "IX_InterviewCertificates_UserId",
                table: "InterviewCertificates");

            migrationBuilder.DropIndex(
                name: "IX_Groups_CreatedByUserId",
                table: "Groups");

            migrationBuilder.DropIndex(
                name: "IX_Groups_OrganizationId",
                table: "Groups");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_OrganizationId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "AddedByUserId",
                table: "UserGroups");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "UserGroups");

            migrationBuilder.DropColumn(
                name: "CertificateId",
                table: "InterviewCertificates");

            migrationBuilder.DropColumn(
                name: "CompletedAt",
                table: "InterviewCertificates");

            migrationBuilder.DropColumn(
                name: "DurationMinutes",
                table: "InterviewCertificates");

            migrationBuilder.DropColumn(
                name: "HasIntegrityViolations",
                table: "InterviewCertificates");

            migrationBuilder.DropColumn(
                name: "IntegrityNotes",
                table: "InterviewCertificates");

            migrationBuilder.DropColumn(
                name: "IntegrityViolationsCount",
                table: "InterviewCertificates");

            migrationBuilder.DropColumn(
                name: "IssuedByUserId",
                table: "InterviewCertificates");

            migrationBuilder.DropColumn(
                name: "MaxScore",
                table: "InterviewCertificates");

            migrationBuilder.DropColumn(
                name: "PdfFileName",
                table: "InterviewCertificates");

            migrationBuilder.DropColumn(
                name: "PdfFilePath",
                table: "InterviewCertificates");

            migrationBuilder.DropColumn(
                name: "PdfFileSize",
                table: "InterviewCertificates");

            migrationBuilder.DropColumn(
                name: "RevocationReason",
                table: "InterviewCertificates");

            migrationBuilder.DropColumn(
                name: "RevokedAt",
                table: "InterviewCertificates");

            migrationBuilder.DropColumn(
                name: "ScorePercentage",
                table: "InterviewCertificates");

            migrationBuilder.DropColumn(
                name: "SkillsAssessedJson",
                table: "InterviewCertificates");

            migrationBuilder.DropColumn(
                name: "TemplateId",
                table: "InterviewCertificates");

            migrationBuilder.DropColumn(
                name: "TemplateName",
                table: "InterviewCertificates");

            migrationBuilder.DropColumn(
                name: "TopicsJson",
                table: "InterviewCertificates");

            migrationBuilder.DropColumn(
                name: "TotalScore",
                table: "InterviewCertificates");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "InterviewCertificates");

            migrationBuilder.DropColumn(
                name: "UserName",
                table: "InterviewCertificates");

            migrationBuilder.DropColumn(
                name: "VerificationHash",
                table: "InterviewCertificates");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Groups");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Groups");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "AspNetUsers");

            migrationBuilder.RenameColumn(
                name: "SessionId",
                table: "InterviewCertificates",
                newName: "CertificateNumber");

            migrationBuilder.RenameColumn(
                name: "OrganizationId",
                table: "Groups",
                newName: "OrgId");

            migrationBuilder.AddColumn<string>(
                name: "RoleInGroup",
                table: "UserGroups",
                type: "TEXT",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "InterviewCertificates",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .OldAnnotation("Sqlite:Autoincrement", true);

            migrationBuilder.CreateIndex(
                name: "IX_InterviewCertificates_CertificateNumber",
                table: "InterviewCertificates",
                column: "CertificateNumber",
                unique: true);
        }
    }
}
