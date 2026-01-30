# Script PowerShell para aplicar la migración de campos DocumentType y DocumentNumber
# Ejecutar desde PowerShell como administrador si es necesario

$connectionString = "Server=localhost;Database=CornerAppDb;Trusted_Connection=True;TrustServerCertificate=true;"

$sqlScript = @"
USE CornerAppDb;
GO

-- Add DocumentType column
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Customers]') AND name = 'DocumentType')
BEGIN
    ALTER TABLE [dbo].[Customers] ADD [DocumentType] NVARCHAR(MAX) NULL;
    PRINT 'DocumentType column added successfully';
END
ELSE
BEGIN
    PRINT 'DocumentType column already exists';
END
GO

-- Add DocumentNumber column
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Customers]') AND name = 'DocumentNumber')
BEGIN
    ALTER TABLE [dbo].[Customers] ADD [DocumentNumber] NVARCHAR(MAX) NULL;
    PRINT 'DocumentNumber column added successfully';
END
ELSE
BEGIN
    PRINT 'DocumentNumber column already exists';
END
GO
"@

try {
    Write-Host "Conectando a la base de datos..." -ForegroundColor Yellow
    
    # Intentar usar sqlcmd si está disponible
    $sqlcmdPath = Get-Command sqlcmd -ErrorAction SilentlyContinue
    if ($sqlcmdPath) {
        Write-Host "Usando sqlcmd..." -ForegroundColor Green
        $sqlScript | sqlcmd -S localhost -d CornerAppDb -E -Q $sqlScript
        Write-Host "Migración aplicada exitosamente!" -ForegroundColor Green
    } else {
        Write-Host "sqlcmd no está disponible. Por favor, ejecuta el script manualmente en SQL Server Management Studio." -ForegroundColor Red
        Write-Host "Script SQL guardado en: Scripts\ApplyDocumentFieldsMigration.sql" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "O instala sqlcmd desde:" -ForegroundColor Yellow
        Write-Host "https://learn.microsoft.com/en-us/sql/tools/sqlcmd-utility" -ForegroundColor Cyan
    }
} catch {
    Write-Host "Error al ejecutar el script: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, ejecuta el script SQL manualmente en SQL Server Management Studio:" -ForegroundColor Yellow
    Write-Host "Scripts\ApplyDocumentFieldsMigration.sql" -ForegroundColor Cyan
}
