# Restablecer Contraseña de Admin

## Opción 1: Usar el Endpoint HTTP (Recomendado)

Si el backend está corriendo, puedes usar este endpoint para restablecer tu contraseña:

### Usando PowerShell:

```powershell
# Cambiar la contraseña del usuario berni2384@hotmail.com
$body = @{
    Email = "berni2384@hotmail.com"
    Password = "TuNuevaContraseña123"
    Name = "Berni"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/admin/create-user" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### Usando curl (si tienes Git Bash o WSL):

```bash
curl -X POST http://localhost:5000/api/auth/admin/create-user \
  -H "Content-Type: application/json" \
  -d '{
    "Email": "berni2384@hotmail.com",
    "Password": "TuNuevaContraseña123",
    "Name": "Berni"
  }'
```

### Usando Postman o cualquier cliente HTTP:

- **URL**: `POST http://localhost:5000/api/auth/admin/create-user`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "Email": "berni2384@hotmail.com",
  "Password": "TuNuevaContraseña123",
  "Name": "Berni"
}
```

## Opción 2: Script SQL Directo

Si el backend no está corriendo, puedes ejecutar este script SQL directamente en la base de datos:

**NOTA**: Necesitas generar el hash BCrypt de tu nueva contraseña primero. Puedes usar este código C#:

```csharp
using BCrypt.Net;
var hash = BCrypt.Net.BCrypt.HashPassword("TuNuevaContraseña123");
Console.WriteLine(hash);
```

Luego ejecuta en SQL Server:

```sql
UPDATE Admins 
SET PasswordHash = 'TU_HASH_AQUI',  -- Reemplaza con el hash generado
    UpdatedAt = GETUTCDATE()
WHERE Username = 'berni2384@hotmail.com' OR Email = 'berni2384@hotmail.com';
```

## Opción 3: Reiniciar el Backend

El `Program.cs` tiene código que crea/actualiza usuarios automáticamente. Si reinicias el backend, puedes modificar temporalmente el código en `Program.cs` (línea ~937) para actualizar tu contraseña.

---

**IMPORTANTE**: Después de restablecer la contraseña, cierra sesión y vuelve a iniciar sesión con tu nueva contraseña.
