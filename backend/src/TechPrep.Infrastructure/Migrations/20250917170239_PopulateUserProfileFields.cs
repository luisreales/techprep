using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechPrep.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class PopulateUserProfileFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Update existing users with default profile values if they are null or empty
            migrationBuilder.Sql(@"
                UPDATE AspNetUsers
                SET Language = 'en'
                WHERE Language IS NULL OR Language = '';
            ");

            migrationBuilder.Sql(@"
                UPDATE AspNetUsers
                SET Theme = 'light'
                WHERE Theme IS NULL OR Theme = '';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
