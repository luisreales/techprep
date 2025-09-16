using Microsoft.EntityFrameworkCore.Migrations;

namespace TechPrep.Infrastructure.Migrations
{
    [Migration("20250915040000_Add_SessionTemplateTopics")]
    public partial class Add_SessionTemplateTopics : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SessionTemplateTopics",
                columns: table => new
                {
                    TemplateId = table.Column<int>(type: "INTEGER", nullable: false),
                    TopicId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SessionTemplateTopics", x => new { x.TemplateId, x.TopicId });
                    table.ForeignKey(
                        name: "FK_SessionTemplateTopics_SessionTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "SessionTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SessionTemplateTopics_Topics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "Topics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SessionTemplateTopics_TopicId",
                table: "SessionTemplateTopics",
                column: "TopicId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SessionTemplateTopics");
        }
    }
}
