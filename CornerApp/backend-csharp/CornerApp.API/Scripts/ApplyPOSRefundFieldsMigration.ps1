# Script PowerShell para aplicar la migración de campos de devolución POS
# Ejecutar desde PowerShell como administrador si es necesario

$connectionString = "Server=localhost;Database=CornerAppDb;Trusted_Connection=True;TrustServerCertificate=true;"

$sqlScript = @"
USE CornerAppDb;
GO

-- Verificar si las columnas ya existen antes de agregarlas
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Orders]') AND name = 'POSRefundTransactionId')
BEGIN
    ALTER TABLE [dbo].[Orders]
    ADD [POSRefundTransactionId] bigint NULL;
    PRINT 'Columna POSRefundTransactionId agregada exitosamente';
END
ELSE
BEGIN
    PRINT 'Columna POSRefundTransactionId ya existe';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Orders]') AND name = 'POSRefundTransactionIdString')
BEGIN
    ALTER TABLE [dbo].[Orders]
    ADD [POSRefundTransactionIdString] nvarchar(max) NULL;
    PRINT 'Columna POSRefundTransactionIdString agregada exitosamente';
END
ELSE
BEGIN
    PRINT 'Columna POSRefundTransactionIdString ya existe';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Orders]') AND name = 'POSRefundTransactionDateTime')
BEGIN
    ALTER TABLE [dbo].[Orders]
    ADD [POSRefundTransactionDateTime] nvarchar(max) NULL;
    PRINT 'Columna POSRefundTransactionDateTime agregada exitosamente';
END
ELSE
BEGIN
    PRINT 'Columna POSRefundTransactionDateTime ya existe';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Orders]') AND name = 'POSRefundResponse')
BEGIN
    ALTER TABLE [dbo].[Orders]
    ADD [POSRefundResponse] nvarchar(max) NULL;
    PRINT 'Columna POSRefundResponse agregada exitosamente';
END
ELSE
BEGIN
    PRINT 'Columna POSRefundResponse ya existe';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Orders]') AND name = 'POSRefundedAt')
BEGIN
    ALTER TABLE [dbo].[Orders]
    ADD [POSRefundedAt] datetime2 NULL;
    PRINT 'Columna POSRefundedAt agregada exitosamente';
END
ELSE
BEGIN
    PRINT 'Columna POSRefundedAt ya existe';
END
GO

PRINT 'Migración completada exitosamente';
GO
"@

try {
    Write-Host "Conectando a la base de datos..." -ForegroundColor Yellow
    
    # Intentar usar sqlcmd si está disponible
    $sqlcmdPath = Get-Command sqlcmd -ErrorAction SilentlyContinue
    if ($sqlcmdPath) {
        Write-Host "Usando sqlcmd..." -ForegroundColor Green
        # Usar -C para confiar en el certificado del servidor
        $sqlScript | sqlcmd -S localhost -d CornerAppDb -E -C -Q $sqlScript
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Migración aplicada exitosamente!" -ForegroundColor Green
        } else {
            Write-Host "Error al ejecutar sqlcmd. Código de salida: $LASTEXITCODE" -ForegroundColor Red
            throw "Error en sqlcmd"
        }
    } else {
        Write-Host "sqlcmd no está disponible. Intentando con Invoke-Sqlcmd..." -ForegroundColor Yellow
        
        # Intentar con Invoke-Sqlcmd (SQL Server PowerShell module)
        if (Get-Module -ListAvailable -Name SqlServer) {
            Import-Module SqlServer -ErrorAction SilentlyContinue
            Invoke-Sqlcmd -ServerInstance localhost -Database CornerAppDb -Query $sqlScript -TrustServerCertificate
            Write-Host "Migración aplicada exitosamente!" -ForegroundColor Green
        } else {
            Write-Host "sqlcmd no está disponible. Por favor, ejecuta el script manualmente en SQL Server Management Studio." -ForegroundColor Red
            Write-Host "Script SQL guardado en: Migrations\20260116000000_AddPOSRefundFieldsToOrder.sql" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "O instala sqlcmd desde:" -ForegroundColor Yellow
            Write-Host "https://learn.microsoft.com/en-us/sql/tools/sqlcmd-utility" -ForegroundColor Cyan
        }
    }
} catch {
    Write-Host "Error al ejecutar el script: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, ejecuta el script SQL manualmente en SQL Server Management Studio:" -ForegroundColor Yellow
    Write-Host "Migrations\20260116000000_AddPOSRefundFieldsToOrder.sql" -ForegroundColor Cyan
}
