using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CornerApp.API.Migrations
{
    /// <inheritdoc />
    public partial class AddMultiTenantSupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Tables_IsActive_Status",
                table: "Tables");

            migrationBuilder.DropIndex(
                name: "IX_Tables_Number",
                table: "Tables");

            migrationBuilder.DropIndex(
                name: "IX_Spaces_Name",
                table: "Spaces");

            migrationBuilder.DropIndex(
                name: "IX_Products_CategoryId_IsAvailable_DisplayOrder",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Orders_CustomerId_IsArchived",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_DeliveryPersonId_Status",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_Status_CreatedAt",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_DeliveryPersons_Email",
                table: "DeliveryPersons");

            migrationBuilder.DropIndex(
                name: "IX_DeliveryPersons_Username",
                table: "DeliveryPersons");

            migrationBuilder.DropIndex(
                name: "IX_Customers_Email",
                table: "Customers");

            migrationBuilder.DropIndex(
                name: "IX_Categories_IsActive_DisplayOrder",
                table: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_Categories_Name",
                table: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_CashRegisters_IsOpen_OpenedAt",
                table: "CashRegisters");

            migrationBuilder.DropIndex(
                name: "IX_Admins_Email",
                table: "Admins");

            migrationBuilder.DropIndex(
                name: "IX_Admins_Username",
                table: "Admins");

            migrationBuilder.AddColumn<int>(
                name: "RestaurantId",
                table: "Tables",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "RestaurantId",
                table: "Spaces",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "RestaurantId",
                table: "Products",
                type: "int",
                nullable: false,
                defaultValue: 0);

            // Nota: Los campos POSRefund* ya fueron agregados por la migración SQL 20260116000000_AddPOSRefundFieldsToOrder.sql
            // No se agregan aquí para evitar duplicados

            migrationBuilder.AddColumn<int>(
                name: "RestaurantId",
                table: "Orders",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "RestaurantId",
                table: "DeliveryPersons",
                type: "int",
                nullable: false,
                defaultValue: 0);

            // Nota: DocumentType y DocumentNumber ya fueron agregados por la migración SQL AddDocumentFieldsToCustomer.sql
            // No se agregan aquí para evitar duplicados

            migrationBuilder.AddColumn<int>(
                name: "RestaurantId",
                table: "Customers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RestaurantId",
                table: "Categories",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "RestaurantId",
                table: "CashRegisters",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "RestaurantId",
                table: "Admins",
                type: "int",
                nullable: false,
                defaultValue: 0);

            // Nota: DeliveryCashRegisters ya existe, no se crea aquí
            /*
            migrationBuilder.CreateTable(
                name: "DeliveryCashRegisters",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DeliveryPersonId = table.Column<int>(type: "int", nullable: false),
                    OpenedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ClosedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsOpen = table.Column<bool>(type: "bit", nullable: false),
                    InitialAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    FinalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TotalSales = table.Column<decimal>(type: "decimal(18,2)", nullable: false, defaultValue: 0m),
                    TotalCash = table.Column<decimal>(type: "decimal(18,2)", nullable: false, defaultValue: 0m),
                    TotalPOS = table.Column<decimal>(type: "decimal(18,2)", nullable: false, defaultValue: 0m),
                    TotalTransfer = table.Column<decimal>(type: "decimal(18,2)", nullable: false, defaultValue: 0m),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeliveryCashRegisters", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DeliveryCashRegisters_DeliveryPersons_DeliveryPersonId",
                        column: x => x.DeliveryPersonId,
                        principalTable: "DeliveryPersons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });
            */

            migrationBuilder.CreateTable(
                name: "Restaurants",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    BusinessInfoId = table.Column<int>(type: "int", nullable: true),
                    DeliveryZoneConfigId = table.Column<int>(type: "int", nullable: true),
                    EmailConfigId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Restaurants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Restaurants_BusinessInfo_BusinessInfoId",
                        column: x => x.BusinessInfoId,
                        principalTable: "BusinessInfo",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Restaurants_DeliveryZoneConfigs_DeliveryZoneConfigId",
                        column: x => x.DeliveryZoneConfigId,
                        principalTable: "DeliveryZoneConfigs",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Restaurants_EmailConfigs_EmailConfigId",
                        column: x => x.EmailConfigId,
                        principalTable: "EmailConfigs",
                        principalColumn: "Id");
                });

            // Crear restaurante por defecto y actualizar registros existentes antes de agregar foreign keys
            migrationBuilder.Sql(@"
                -- Crear restaurante por defecto
                IF NOT EXISTS (SELECT 1 FROM Restaurants WHERE Id = 1)
                BEGIN
                    SET IDENTITY_INSERT Restaurants ON;
                    INSERT INTO Restaurants (Id, Name, Description, IsActive, CreatedAt)
                    VALUES (1, 'Restaurante Principal', 'Restaurante principal del sistema', 1, GETUTCDATE());
                    SET IDENTITY_INSERT Restaurants OFF;
                END

                -- Actualizar todos los registros existentes para que apunten al restaurante por defecto
                UPDATE Admins SET RestaurantId = 1 WHERE RestaurantId = 0 OR RestaurantId IS NULL;
                UPDATE Orders SET RestaurantId = 1 WHERE RestaurantId = 0 OR RestaurantId IS NULL;
                UPDATE Products SET RestaurantId = 1 WHERE RestaurantId = 0 OR RestaurantId IS NULL;
                UPDATE Categories SET RestaurantId = 1 WHERE RestaurantId = 0 OR RestaurantId IS NULL;
                UPDATE Tables SET RestaurantId = 1 WHERE RestaurantId = 0 OR RestaurantId IS NULL;
                UPDATE Spaces SET RestaurantId = 1 WHERE RestaurantId = 0 OR RestaurantId IS NULL;
                UPDATE DeliveryPersons SET RestaurantId = 1 WHERE RestaurantId = 0 OR RestaurantId IS NULL;
                UPDATE CashRegisters SET RestaurantId = 1 WHERE RestaurantId = 0 OR RestaurantId IS NULL;
            ");

            migrationBuilder.CreateIndex(
                name: "IX_Tables_RestaurantId",
                table: "Tables",
                column: "RestaurantId");

            migrationBuilder.CreateIndex(
                name: "IX_Tables_RestaurantId_IsActive_Status",
                table: "Tables",
                columns: new[] { "RestaurantId", "IsActive", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Tables_RestaurantId_Number",
                table: "Tables",
                columns: new[] { "RestaurantId", "Number" });

            migrationBuilder.CreateIndex(
                name: "IX_Spaces_RestaurantId",
                table: "Spaces",
                column: "RestaurantId");

            migrationBuilder.CreateIndex(
                name: "IX_Spaces_RestaurantId_Name",
                table: "Spaces",
                columns: new[] { "RestaurantId", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_Products_RestaurantId",
                table: "Products",
                column: "RestaurantId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_RestaurantId_CategoryId_IsAvailable_DisplayOrder",
                table: "Products",
                columns: new[] { "RestaurantId", "CategoryId", "IsAvailable", "DisplayOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_Orders_RestaurantId",
                table: "Orders",
                column: "RestaurantId");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_RestaurantId_CustomerId_IsArchived",
                table: "Orders",
                columns: new[] { "RestaurantId", "CustomerId", "IsArchived" });

            migrationBuilder.CreateIndex(
                name: "IX_Orders_RestaurantId_DeliveryPersonId_Status",
                table: "Orders",
                columns: new[] { "RestaurantId", "DeliveryPersonId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Orders_RestaurantId_Status_CreatedAt",
                table: "Orders",
                columns: new[] { "RestaurantId", "Status", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryPersons_RestaurantId",
                table: "DeliveryPersons",
                column: "RestaurantId");

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryPersons_RestaurantId_Email",
                table: "DeliveryPersons",
                columns: new[] { "RestaurantId", "Email" },
                unique: true,
                filter: "[Email] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryPersons_RestaurantId_Username",
                table: "DeliveryPersons",
                columns: new[] { "RestaurantId", "Username" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Customers_Email",
                table: "Customers",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_RestaurantId",
                table: "Customers",
                column: "RestaurantId");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_RestaurantId_Email",
                table: "Customers",
                columns: new[] { "RestaurantId", "Email" });

            migrationBuilder.CreateIndex(
                name: "IX_Categories_RestaurantId",
                table: "Categories",
                column: "RestaurantId");

            migrationBuilder.CreateIndex(
                name: "IX_Categories_RestaurantId_IsActive_DisplayOrder",
                table: "Categories",
                columns: new[] { "RestaurantId", "IsActive", "DisplayOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_Categories_RestaurantId_Name",
                table: "Categories",
                columns: new[] { "RestaurantId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CashRegisters_RestaurantId",
                table: "CashRegisters",
                column: "RestaurantId");

            migrationBuilder.CreateIndex(
                name: "IX_CashRegisters_RestaurantId_IsOpen_OpenedAt",
                table: "CashRegisters",
                columns: new[] { "RestaurantId", "IsOpen", "OpenedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Admins_RestaurantId",
                table: "Admins",
                column: "RestaurantId");

            migrationBuilder.CreateIndex(
                name: "IX_Admins_RestaurantId_Email",
                table: "Admins",
                columns: new[] { "RestaurantId", "Email" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Admins_RestaurantId_Username",
                table: "Admins",
                columns: new[] { "RestaurantId", "Username" },
                unique: true);

            // Nota: Índices de DeliveryCashRegisters ya existen, no se crean aquí
            /*
            migrationBuilder.CreateIndex(
                name: "IX_DeliveryCashRegisters_DeliveryPersonId",
                table: "DeliveryCashRegisters",
                column: "DeliveryPersonId");

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryCashRegisters_DeliveryPersonId_IsOpen",
                table: "DeliveryCashRegisters",
                columns: new[] { "DeliveryPersonId", "IsOpen" });

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryCashRegisters_IsOpen",
                table: "DeliveryCashRegisters",
                column: "IsOpen");

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryCashRegisters_OpenedAt",
                table: "DeliveryCashRegisters",
                column: "OpenedAt");
            */

            migrationBuilder.CreateIndex(
                name: "IX_Restaurants_BusinessInfoId",
                table: "Restaurants",
                column: "BusinessInfoId");

            migrationBuilder.CreateIndex(
                name: "IX_Restaurants_DeliveryZoneConfigId",
                table: "Restaurants",
                column: "DeliveryZoneConfigId");

            migrationBuilder.CreateIndex(
                name: "IX_Restaurants_EmailConfigId",
                table: "Restaurants",
                column: "EmailConfigId");

            migrationBuilder.CreateIndex(
                name: "IX_Restaurants_IsActive",
                table: "Restaurants",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Restaurants_Name",
                table: "Restaurants",
                column: "Name");

            // Usar NO ACTION para todas las foreign keys a Restaurant para evitar múltiples rutas de cascada
            migrationBuilder.AddForeignKey(
                name: "FK_Admins_Restaurants_RestaurantId",
                table: "Admins",
                column: "RestaurantId",
                principalTable: "Restaurants",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_CashRegisters_Restaurants_RestaurantId",
                table: "CashRegisters",
                column: "RestaurantId",
                principalTable: "Restaurants",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_Categories_Restaurants_RestaurantId",
                table: "Categories",
                column: "RestaurantId",
                principalTable: "Restaurants",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_Customers_Restaurants_RestaurantId",
                table: "Customers",
                column: "RestaurantId",
                principalTable: "Restaurants",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_DeliveryPersons_Restaurants_RestaurantId",
                table: "DeliveryPersons",
                column: "RestaurantId",
                principalTable: "Restaurants",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Restaurants_RestaurantId",
                table: "Orders",
                column: "RestaurantId",
                principalTable: "Restaurants",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Restaurants_RestaurantId",
                table: "Products",
                column: "RestaurantId",
                principalTable: "Restaurants",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_Spaces_Restaurants_RestaurantId",
                table: "Spaces",
                column: "RestaurantId",
                principalTable: "Restaurants",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_Tables_Restaurants_RestaurantId",
                table: "Tables",
                column: "RestaurantId",
                principalTable: "Restaurants",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Admins_Restaurants_RestaurantId",
                table: "Admins");

            migrationBuilder.DropForeignKey(
                name: "FK_CashRegisters_Restaurants_RestaurantId",
                table: "CashRegisters");

            migrationBuilder.DropForeignKey(
                name: "FK_Categories_Restaurants_RestaurantId",
                table: "Categories");

            migrationBuilder.DropForeignKey(
                name: "FK_Customers_Restaurants_RestaurantId",
                table: "Customers");

            migrationBuilder.DropForeignKey(
                name: "FK_DeliveryPersons_Restaurants_RestaurantId",
                table: "DeliveryPersons");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Restaurants_RestaurantId",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK_Products_Restaurants_RestaurantId",
                table: "Products");

            migrationBuilder.DropForeignKey(
                name: "FK_Spaces_Restaurants_RestaurantId",
                table: "Spaces");

            migrationBuilder.DropForeignKey(
                name: "FK_Tables_Restaurants_RestaurantId",
                table: "Tables");

            // Nota: DeliveryCashRegisters no se elimina aquí porque ya existía antes
            // migrationBuilder.DropTable(
            //     name: "DeliveryCashRegisters");

            migrationBuilder.DropTable(
                name: "Restaurants");

            migrationBuilder.DropIndex(
                name: "IX_Tables_RestaurantId",
                table: "Tables");

            migrationBuilder.DropIndex(
                name: "IX_Tables_RestaurantId_IsActive_Status",
                table: "Tables");

            migrationBuilder.DropIndex(
                name: "IX_Tables_RestaurantId_Number",
                table: "Tables");

            migrationBuilder.DropIndex(
                name: "IX_Spaces_RestaurantId",
                table: "Spaces");

            migrationBuilder.DropIndex(
                name: "IX_Spaces_RestaurantId_Name",
                table: "Spaces");

            migrationBuilder.DropIndex(
                name: "IX_Products_RestaurantId",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_RestaurantId_CategoryId_IsAvailable_DisplayOrder",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Orders_RestaurantId",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_RestaurantId_CustomerId_IsArchived",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_RestaurantId_DeliveryPersonId_Status",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_RestaurantId_Status_CreatedAt",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_DeliveryPersons_RestaurantId",
                table: "DeliveryPersons");

            migrationBuilder.DropIndex(
                name: "IX_DeliveryPersons_RestaurantId_Email",
                table: "DeliveryPersons");

            migrationBuilder.DropIndex(
                name: "IX_DeliveryPersons_RestaurantId_Username",
                table: "DeliveryPersons");

            migrationBuilder.DropIndex(
                name: "IX_Customers_Email",
                table: "Customers");

            migrationBuilder.DropIndex(
                name: "IX_Customers_RestaurantId",
                table: "Customers");

            migrationBuilder.DropIndex(
                name: "IX_Customers_RestaurantId_Email",
                table: "Customers");

            migrationBuilder.DropIndex(
                name: "IX_Categories_RestaurantId",
                table: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_Categories_RestaurantId_IsActive_DisplayOrder",
                table: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_Categories_RestaurantId_Name",
                table: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_CashRegisters_RestaurantId",
                table: "CashRegisters");

            migrationBuilder.DropIndex(
                name: "IX_CashRegisters_RestaurantId_IsOpen_OpenedAt",
                table: "CashRegisters");

            migrationBuilder.DropIndex(
                name: "IX_Admins_RestaurantId",
                table: "Admins");

            migrationBuilder.DropIndex(
                name: "IX_Admins_RestaurantId_Email",
                table: "Admins");

            migrationBuilder.DropIndex(
                name: "IX_Admins_RestaurantId_Username",
                table: "Admins");

            migrationBuilder.DropColumn(
                name: "RestaurantId",
                table: "Tables");

            migrationBuilder.DropColumn(
                name: "RestaurantId",
                table: "Spaces");

            migrationBuilder.DropColumn(
                name: "RestaurantId",
                table: "Products");

            // Nota: Los campos POSRefund* no se eliminan aquí porque fueron agregados por migración SQL separada

            migrationBuilder.DropColumn(
                name: "RestaurantId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "RestaurantId",
                table: "DeliveryPersons");

            // Nota: DocumentType y DocumentNumber no se eliminan aquí porque fueron agregados por migración SQL separada

            migrationBuilder.DropColumn(
                name: "RestaurantId",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "RestaurantId",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "RestaurantId",
                table: "CashRegisters");

            migrationBuilder.DropColumn(
                name: "RestaurantId",
                table: "Admins");

            migrationBuilder.CreateIndex(
                name: "IX_Tables_IsActive_Status",
                table: "Tables",
                columns: new[] { "IsActive", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Tables_Number",
                table: "Tables",
                column: "Number");

            migrationBuilder.CreateIndex(
                name: "IX_Spaces_Name",
                table: "Spaces",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Products_CategoryId_IsAvailable_DisplayOrder",
                table: "Products",
                columns: new[] { "CategoryId", "IsAvailable", "DisplayOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_Orders_CustomerId_IsArchived",
                table: "Orders",
                columns: new[] { "CustomerId", "IsArchived" });

            migrationBuilder.CreateIndex(
                name: "IX_Orders_DeliveryPersonId_Status",
                table: "Orders",
                columns: new[] { "DeliveryPersonId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Orders_Status_CreatedAt",
                table: "Orders",
                columns: new[] { "Status", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryPersons_Email",
                table: "DeliveryPersons",
                column: "Email",
                unique: true,
                filter: "[Email] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryPersons_Username",
                table: "DeliveryPersons",
                column: "Username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Customers_Email",
                table: "Customers",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Categories_IsActive_DisplayOrder",
                table: "Categories",
                columns: new[] { "IsActive", "DisplayOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_Categories_Name",
                table: "Categories",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CashRegisters_IsOpen_OpenedAt",
                table: "CashRegisters",
                columns: new[] { "IsOpen", "OpenedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Admins_Email",
                table: "Admins",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Admins_Username",
                table: "Admins",
                column: "Username",
                unique: true);
        }
    }
}
