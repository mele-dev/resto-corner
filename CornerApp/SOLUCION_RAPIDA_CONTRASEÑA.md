# Solución Rápida para Restablecer Contraseña

## ⚡ Solución Más Rápida (Recomendada)

**El backend ya tiene código que restablece la contraseña automáticamente.**

1. **Reinicia el backend** (detén y vuelve a iniciar)
2. La contraseña se restablecerá automáticamente a: **`berni1`**
3. Inicia sesión con:
   - Usuario: `berni2384@hotmail.com`
   - Contraseña: `berni1`

---

## 🔧 Si Quieres Cambiar la Contraseña a Otra

### Opción A: Modificar Program.cs (Temporal)

1. Abre: `backend-csharp\CornerApp.API\Program.cs`
2. Ve a la línea ~957
3. Cambia `"berni1"` por tu nueva contraseña:
   ```csharp
   var newPassword = "TuNuevaContraseña123"; // ⚠️ CAMBIA ESTA CONTRASEÑA
   ```
4. Reinicia el backend
5. La contraseña se actualizará automáticamente

### Opción B: Usar el Endpoint HTTP

Si el backend está corriendo, ejecuta en PowerShell:

```powershell
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

**Nota**: Si el backend está en otro puerto, cambia `5000` por el puerto correcto.

### Opción C: Script SQL Directo

1. Abre SQL Server Management Studio
2. Conéctate a la base de datos `CornerAppDb`
3. Ejecuta el script: `reset-password-sql.sql`
4. (Necesitarás generar el hash BCrypt primero)

---

## ✅ Verificación

Después de restablecer, verifica que funcionó:
1. Cierra sesión si estás logueado
2. Intenta iniciar sesión con la nueva contraseña
3. Si no funciona, revisa los logs del backend para ver errores
