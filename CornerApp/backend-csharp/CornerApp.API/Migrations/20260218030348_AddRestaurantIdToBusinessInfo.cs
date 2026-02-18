using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CornerApp.API.Migrations
{
    /// <inheritdoc />
    public partial class AddRestaurantIdToBusinessInfo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Eliminar foreign key solo si existe
            migrationBuilder.Sql(@"
                SET @fk_exists = (
                    SELECT COUNT(*) 
                    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                    WHERE CONSTRAINT_NAME = 'FK_Restaurants_BusinessInfo_BusinessInfoId' 
                    AND TABLE_SCHEMA = DATABASE()
                );
                
                SET @sql = IF(@fk_exists > 0,
                    'ALTER TABLE Restaurants DROP FOREIGN KEY FK_Restaurants_BusinessInfo_BusinessInfoId',
                    'SELECT 1'
                );
                
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
            ");

            // Eliminar índice solo si existe
            migrationBuilder.Sql(@"
                SET @idx_exists = (
                    SELECT COUNT(*) 
                    FROM INFORMATION_SCHEMA.STATISTICS 
                    WHERE INDEX_NAME = 'IX_Restaurants_BusinessInfoId' 
                    AND TABLE_SCHEMA = DATABASE()
                );
                
                SET @sql = IF(@idx_exists > 0,
                    'ALTER TABLE Restaurants DROP INDEX IX_Restaurants_BusinessInfoId',
                    'SELECT 1'
                );
                
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
            ");

            // Eliminar columna solo si existe
            migrationBuilder.Sql(@"
                SET @col_exists = (
                    SELECT COUNT(*) 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE COLUMN_NAME = 'BusinessInfoId' 
                    AND TABLE_NAME = 'Restaurants'
                    AND TABLE_SCHEMA = DATABASE()
                );
                
                SET @sql = IF(@col_exists > 0,
                    'ALTER TABLE Restaurants DROP COLUMN BusinessInfoId',
                    'SELECT 1'
                );
                
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
            ");

            migrationBuilder.AlterColumn<decimal>(
                name: "MinimumOrderAmount",
                table: "BusinessInfo",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(65,30)");

            migrationBuilder.AlterColumn<decimal>(
                name: "DollarExchangeRate",
                table: "BusinessInfo",
                type: "decimal(18,2)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(65,30)",
                oldNullable: true);

            // Verificar si la columna ya existe antes de agregarla
            migrationBuilder.Sql(@"
                SET @col_exists = (
                    SELECT COUNT(*) 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE COLUMN_NAME = 'RestaurantId' 
                    AND TABLE_NAME = 'BusinessInfo'
                    AND TABLE_SCHEMA = DATABASE()
                );
                
                SET @sql = IF(@col_exists = 0,
                    'ALTER TABLE BusinessInfo ADD COLUMN RestaurantId INT NULL',
                    'SELECT 1'
                );
                
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
            ");

            // Actualizar registros existentes: asignar el primer restaurante disponible
            // Primero, actualizar los NULL
            migrationBuilder.Sql(@"
                UPDATE BusinessInfo 
                SET RestaurantId = COALESCE(
                    (SELECT MIN(Id) FROM Restaurants WHERE IsActive = 1 LIMIT 1),
                    (SELECT MIN(Id) FROM Restaurants LIMIT 1),
                    1
                )
                WHERE RestaurantId IS NULL;
            ");

            // Luego, actualizar los que tienen valores inválidos (que no existen en Restaurants)
            migrationBuilder.Sql(@"
                UPDATE BusinessInfo
                SET RestaurantId = COALESCE(
                    (SELECT MIN(Id) FROM Restaurants WHERE IsActive = 1 LIMIT 1),
                    (SELECT MIN(Id) FROM Restaurants LIMIT 1),
                    1
                )
                WHERE RestaurantId NOT IN (SELECT Id FROM Restaurants)
                   OR RestaurantId IS NULL;
            ");

            // Hacer la columna NOT NULL ahora que todos los registros tienen un valor (solo si es nullable)
            migrationBuilder.Sql(@"
                SET @is_nullable = (
                    SELECT IS_NULLABLE 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE COLUMN_NAME = 'RestaurantId' 
                    AND TABLE_NAME = 'BusinessInfo'
                    AND TABLE_SCHEMA = DATABASE()
                );
                
                SET @sql = IF(@is_nullable = 'YES',
                    'ALTER TABLE BusinessInfo MODIFY COLUMN RestaurantId INT NOT NULL',
                    'SELECT 1'
                );
                
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
            ");

            // Crear índice único solo si no existe
            migrationBuilder.Sql(@"
                SET @idx_exists = (
                    SELECT COUNT(*) 
                    FROM INFORMATION_SCHEMA.STATISTICS 
                    WHERE INDEX_NAME = 'IX_BusinessInfo_RestaurantId' 
                    AND TABLE_NAME = 'BusinessInfo'
                    AND TABLE_SCHEMA = DATABASE()
                );
                
                SET @sql = IF(@idx_exists = 0,
                    'CREATE UNIQUE INDEX IX_BusinessInfo_RestaurantId ON BusinessInfo (RestaurantId)',
                    'SELECT 1'
                );
                
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
            ");

            // Agregar foreign key solo si no existe
            migrationBuilder.Sql(@"
                SET @fk_exists = (
                    SELECT COUNT(*) 
                    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                    WHERE CONSTRAINT_NAME = 'FK_BusinessInfo_Restaurants_RestaurantId' 
                    AND TABLE_NAME = 'BusinessInfo'
                    AND TABLE_SCHEMA = DATABASE()
                );
                
                SET @sql = IF(@fk_exists = 0,
                    'ALTER TABLE BusinessInfo ADD CONSTRAINT FK_BusinessInfo_Restaurants_RestaurantId FOREIGN KEY (RestaurantId) REFERENCES Restaurants(Id) ON DELETE CASCADE',
                    'SELECT 1'
                );
                
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BusinessInfo_Restaurants_RestaurantId",
                table: "BusinessInfo");

            migrationBuilder.DropIndex(
                name: "IX_BusinessInfo_RestaurantId",
                table: "BusinessInfo");

            migrationBuilder.DropColumn(
                name: "RestaurantId",
                table: "BusinessInfo");

            migrationBuilder.AddColumn<int>(
                name: "BusinessInfoId",
                table: "Restaurants",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "MinimumOrderAmount",
                table: "BusinessInfo",
                type: "decimal(65,30)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");

            migrationBuilder.AlterColumn<decimal>(
                name: "DollarExchangeRate",
                table: "BusinessInfo",
                type: "decimal(65,30)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Restaurants_BusinessInfoId",
                table: "Restaurants",
                column: "BusinessInfoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Restaurants_BusinessInfo_BusinessInfoId",
                table: "Restaurants",
                column: "BusinessInfoId",
                principalTable: "BusinessInfo",
                principalColumn: "Id");
        }
    }
}
