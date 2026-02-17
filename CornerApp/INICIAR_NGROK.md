# 🚀 Iniciar ngrok Manualmente

## ⚠️ Problema Actual

ngrok está intentando reutilizar la URL `https://michele-comfiest-soo.ngrok-free.dev` que ya está activa.

## ✅ Solución: Iniciar ngrok Manualmente

### Paso 1: Detener todos los ngrok

Abre PowerShell y ejecuta:
```powershell
Get-Process ngrok | Stop-Process -Force
```

### Paso 2: Iniciar ngrok para el Frontend

Abre una **nueva ventana de PowerShell** y ejecuta:
```powershell
cd C:\Users\senis\ngrok
.\ngrok.exe http 3002 --request-header-add "ngrok-skip-browser-warning: true"
```

**Espera 10-15 segundos** y verás algo como:
```
Forwarding  https://nueva-url-frontend.ngrok-free.dev -> http://localhost:3002
```

**Copia esa URL**: `https://nueva-url-frontend.ngrok-free.dev`

### Paso 3: Iniciar ngrok para el Backend

Abre **otra nueva ventana de PowerShell** y ejecuta:
```powershell
cd C:\Users\senis\ngrok
.\ngrok.exe http 5002 --request-header-add "ngrok-skip-browser-warning: true"
```

**Espera 10-15 segundos** y verás algo como:
```
Forwarding  https://nueva-url-backend.ngrok-free.dev -> http://localhost:5002
```

**Copia esa URL**: `https://nueva-url-backend.ngrok-free.dev`

### Paso 4: Actualizar Configuración del Frontend

Una vez que tengas la URL del backend, actualiza estos archivos:

**1. `frontend/src/api/client.ts` (línea 9):**
```typescript
const API_BASE_URL = isNgrok ? 'https://NUEVA_URL_BACKEND.ngrok-free.dev' : '';
```

**2. `frontend/vite.config.ts` (todas las referencias a `target`):**
```typescript
target: 'https://NUEVA_URL_BACKEND.ngrok-free.dev',
```

### Paso 5: Reiniciar el Frontend (si es necesario)

Si el frontend no detecta los cambios automáticamente:
```powershell
# Detén el servidor (Ctrl+C)
# Luego reinicia:
cd C:\Users\senis\OneDrive\Escritorio\RestauranteNW\Restaurante\CornerApp\frontend
npm run dev
```

---

## 📋 Resumen

- **Frontend local**: `http://localhost:3002`
- **Backend local**: `http://localhost:5002`
- **Frontend público**: URL de ngrok del frontend (ventana 1)
- **Backend público**: URL de ngrok del backend (ventana 2)

---

## 🆘 Si Sigue Dando Error

Si ngrok sigue intentando usar la misma URL:

1. **Ve al dashboard de ngrok**: https://dashboard.ngrok.com/status/tunnels
2. **Detén todos los túneles activos** desde el dashboard
3. **Vuelve a iniciar** ngrok desde PowerShell

O simplemente **espera unos minutos** y ngrok liberará la URL automáticamente.
