# Script PowerShell para limpiar espacios en blanco de usernames y emails de repartidores
# Ejecutar desde PowerShell: .\Scripts\CleanDeliveryPersonsUsernames.ps1

$connectionString = "Server=localhost;Database=CornerAppDb;Trusted_Connection=True;TrustServerCertificate=true;"

Write-Host "🧹 Limpiando espacios en blanco de repartidores..." -ForegroundColor Cyan

try {
    # Crear conexión SQL
    $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
    $connection.Open()
    
    Write-Host "✅ Conectado a la base de datos" -ForegroundColor Green
    
    # Script SQL para limpiar
    $sql = @"
USE CornerAppDb;
GO

-- Limpiar espacios en blanco de usernames
UPDATE DeliveryPersons 
SET Username = LTRIM(RTRIM(Username))
WHERE Username IS NOT NULL;

-- Limpiar espacios en blanco de emails
UPDATE DeliveryPersons 
SET Email = LTRIM(RTRIM(Email))
WHERE Email IS NOT NULL;

-- Convertir usernames a minúsculas
UPDATE DeliveryPersons 
SET Username = LOWER(LTRIM(RTRIM(Username)))
WHERE Username IS NOT NULL;

-- Convertir emails a minúsculas
UPDATE DeliveryPersons 
SET Email = LOWER(LTRIM(RTRIM(Email)))
WHERE Email IS NOT NULL;
"@
    
    # Dividir el script en comandos individuales (separados por GO)
    $commands = $sql -split "GO" | Where-Object { $_.Trim() -ne "" }
    
    foreach ($command in $commands) {
        if ($command.Trim() -ne "") {
            $cmd = New-Object System.Data.SqlClient.SqlCommand($command.Trim(), $connection)
            $rowsAffected = $cmd.ExecuteNonQuery()
            Write-Host "   ✓ Ejecutado: $($command.Trim().Substring(0, [Math]::Min(50, $command.Trim().Length)))..." -ForegroundColor Gray
        }
    }
    
    # Mostrar los resultados
    $query = "SELECT Id, Name, Username, Email, IsActive, CreatedAt FROM DeliveryPersons ORDER BY CreatedAt DESC;"
    $cmd = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
    $reader = $cmd.ExecuteReader()
    
    Write-Host "`n📊 Repartidores actualizados:" -ForegroundColor Yellow
    Write-Host ("{0,-5} {1,-20} {2,-20} {3,-30} {4,-10}" -f "ID", "Nombre", "Username", "Email", "Activo") -ForegroundColor Cyan
    Write-Host ("-" * 85") -ForegroundColor Gray
    
    while ($reader.Read()) {
        $id = $reader["Id"]
        $name = $reader["Name"]
        $username = if ($reader["Username"] -ne [DBNull]::Value) { $reader["Username"] } else { "N/A" }
        $email = if ($reader["Email"] -ne [DBNull]::Value) { $reader["Email"] } else { "N/A" }
        $isActive = if ($reader["IsActive"]) { "Sí" } else { "No" }
        
        Write-Host ("{0,-5} {1,-20} {2,-20} {3,-30} {4,-10}" -f $id, $name, $username, $email, $isActive)
    }
    
    $reader.Close()
    $connection.Close()
    
    Write-Host "`n✅ Usernames y emails de repartidores limpiados exitosamente" -ForegroundColor Green
}
catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Verifica que:" -ForegroundColor Yellow
    Write-Host "   1. SQL Server esté ejecutándose" -ForegroundColor Yellow
    Write-Host "   2. La base de datos 'CornerAppDb' exista" -ForegroundColor Yellow
    Write-Host "   3. Tengas permisos para modificar la tabla DeliveryPersons" -ForegroundColor Yellow
    exit 1
}
