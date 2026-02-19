using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CornerApp.API.Migrations
{
    /// <inheritdoc />
    public partial class AddDollarExchangeRateToBusinessInfo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "DollarExchangeRate",
                table: "BusinessInfo",
                type: "decimal(65,30)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DollarExchangeRate",
                table: "BusinessInfo");
        }
    }
}
