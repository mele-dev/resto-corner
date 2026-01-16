# Script para restablecer contraseña del usuario admin
# Ejecutar: .\reset-password.ps1

$email = "berni2384@hotmail.com"
$newPassword = Read-Host "Ingresa tu nueva contraseña" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($newPassword))

Write-Host "Restableciendo contraseña para: $email" -ForegroundColor Yellow

$body = @{
    Email = $email
    Password = $passwordPlain
    Name = "Berni"
} | ConvertTo-Json

# Intentar diferentes puertos comunes
$ports = @(5000, 5001, 7000, 7001, 3000)
$baseUrl = $null

foreach ($port in $ports) {
    try {
        $testUrl = "http://localhost:$port/api/auth/admin/create-user"
        Write-Host "Probando conexión en puerto $port..." -ForegroundColor Gray
        $testResponse = Invoke-WebRequest -Uri $testUrl -Method OPTIONS -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($testResponse) {
            $baseUrl = "http://localhost:$port"
            Write-Host "✅ Backend encontrado en puerto $port" -ForegroundColor Green
            break
        }
    }
    catch {
        # Continuar probando otros puertos
    }
}

if ($null -eq $baseUrl) {
    Write-Host "⚠️  No se pudo detectar el puerto del backend automáticamente." -ForegroundColor Yellow
    Write-Host "Intentando con puerto 5000 por defecto..." -ForegroundColor Yellow
    $baseUrl = "http://localhost:5000"
}

$url = "$baseUrl/api/auth/admin/create-user"
Write-Host "Usando URL: $url" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $url `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -ErrorAction Stop
    
    Write-Host "✅ Contraseña restablecida exitosamente!" -ForegroundColor Green
    Write-Host "Mensaje: $($response.message)" -ForegroundColor Cyan
    Write-Host "Usuario: $($response.username)" -ForegroundColor Cyan
    Write-Host "Email: $($response.email)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Ahora puedes iniciar sesión con tu nueva contraseña." -ForegroundColor Yellow
}
catch {
    Write-Host "❌ Error al restablecer contraseña:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Respuesta del servidor: $responseBody" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Asegúrate de que el backend esté corriendo." -ForegroundColor Yellow
    Write-Host "Si el backend está en otro puerto, modifica el script." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternativa: Ejecuta el script SQL directamente en la base de datos:" -ForegroundColor Yellow
    Write-Host "  reset-password-sql.sql" -ForegroundColor Cyan
}
