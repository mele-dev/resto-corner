# 🔧 Solución: Error 500 Internal Server Error

## 🔍 Diagnóstico

Estás viendo errores **500 Internal Server Error** cuando intentas hacer login o acceder a endpoints del backend a través de ngrok.

### Posibles Causas:

1. **ngrok del backend apunta al puerto incorrecto**
   - Tu backend está en el puerto **5002**
   - ngrok del backend puede estar apuntando a **8080** u otro puerto

2. **Backend no está completamente iniciado**
   - El backend puede estar iniciando
   - Puede tener problemas con la base de datos
   - Puede tener problemas con Redis/RabbitMQ

3. **Problemas de CORS**
   - El backend puede no estar permitiendo requests desde la URL de ngrok del frontend

4. **Problemas de conexión a la base de datos**
   - MySQL puede no estar corriendo
   - Connection string puede estar incorrecto

---

## ✅ Solución Paso a Paso

### Paso 1: Verificar que el Backend esté Corriendo

El backend debería estar en el puerto **5002** según los logs.

Verifica:
```powershell
# Ver si el backend está escuchando
netstat -ano | Select-String "5002"
```

### Paso 2: Verificar ngrok del Backend

Necesitas **dos instancias de ngrok corriendo**:
1. **ngrok para el frontend** (puerto 3002) ✅ Ya configurado
2. **ngrok para el backend** (puerto 5002) ⚠️ Necesita verificación

Para verificar si ngrok del backend está corriendo:
- Busca otra ventana de PowerShell con ngrok
- O ejecuta: `Get-Process ngrok` para ver cuántas instancias hay

### Paso 3: Iniciar/Actualizar ngrok del Backend

Si ngrok del backend no está corriendo o apunta al puerto incorrecto:

```powershell
# Detener ngrok del backend si está corriendo
Get-Process ngrok | Where-Object { $_.CommandLine -like "*8080*" -or $_.CommandLine -like "*5002*" } | Stop-Process

# Iniciar ngrok para el backend (puerto 5002)
cd C:\Users\senis\ngrok
.\ngrok.exe http 5002 --request-header-add "ngrok-skip-browser-warning: true"
```

### Paso 4: Actualizar la URL del Backend en el Frontend

Una vez que tengas la URL de ngrok del backend, actualiza:

**Archivo**: `frontend/src/api/client.ts` (línea 9)
```typescript
const API_BASE_URL = isNgrok ? 'https://NUEVA_URL_BACKEND.ngrok-free.dev' : '';
```

**Archivo**: `frontend/vite.config.ts` (target del proxy)
```typescript
target: 'https://NUEVA_URL_BACKEND.ngrok-free.dev',
```

### Paso 5: Verificar que el Backend Responda Correctamente

Prueba acceder directamente al backend:
```
https://michele-comfiest-soo.ngrok-free.dev/health
```

Deberías ver una respuesta JSON, no un error 500.

---

## 🔍 Verificar Logs del Backend

Para ver qué está causando el error 500:

1. **Si el backend está en Docker**:
   ```cmd
   docker-compose logs -f api
   ```

2. **Si el backend está corriendo con `dotnet run`**:
   - Revisa la terminal donde está corriendo
   - Busca mensajes de error en rojo

3. **Revisar logs del backend**:
   - Archivos en `backend-csharp/CornerApp.API/logs/`

---

## 🎯 Configuración Correcta

### ngrok del Frontend:
```
Forwarding  https://xxxxx.ngrok-free.dev -> http://localhost:3002
```

### ngrok del Backend:
```
Forwarding  https://yyyyy.ngrok-free.dev -> http://localhost:5002
```

### Frontend configurado para usar:
- URL del backend de ngrok cuando accedes desde ngrok
- Proxy local cuando accedes desde localhost

---

## ⚠️ Problemas Comunes

### Error 503 (Servidor no disponible)
- El backend está iniciando
- Espera unos segundos y vuelve a intentar
- Verifica que MySQL, Redis estén corriendo

### Error 500 (Internal Server Error)
- Revisa los logs del backend
- Verifica la conexión a la base de datos
- Verifica que todas las dependencias estén corriendo

### Error de CORS
- Verifica que el backend permita la URL de ngrok del frontend
- Revisa la configuración de CORS en `Program.cs`

---

## 📋 Checklist

- [ ] Backend corriendo en puerto 5002
- [ ] ngrok del backend corriendo y apuntando a puerto 5002
- [ ] Frontend configurado con URL correcta del backend de ngrok
- [ ] MySQL/Base de datos corriendo y accesible
- [ ] Redis corriendo (si está habilitado)
- [ ] CORS configurado correctamente en el backend
- [ ] Logs del backend revisados para errores

---

## 🆘 Si el Problema Persiste

1. **Revisa los logs del backend** para ver el error específico
2. **Verifica que la base de datos esté accesible**
3. **Prueba acceder directamente al backend** desde el navegador:
   ```
   https://michele-comfiest-soo.ngrok-free.dev/health
   ```
4. **Verifica CORS** - el backend debe permitir la URL de ngrok del frontend
