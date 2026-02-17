# 📊 Estado Actual de los Servicios

## ✅ Servicios Corriendo

### Frontend
- **Puerto**: 3005 (3004 estaba ocupado)
- **Local**: http://localhost:3005/
- **Red Local**: http://192.168.1.36:3005/
- **Estado**: ✅ Corriendo

### Backend
- **Puerto**: 5002
- **URL**: http://localhost:5002
- **Swagger**: http://localhost:5002/swagger
- **Estado**: ✅ Corriendo

## 🔧 Configuración Actual

### Vite (Frontend)
- **Proxy configurado**: `http://localhost:5002` ✓
- **Puerto configurado**: 3004 (pero usa 3005 porque 3004 está ocupado)
- **Auto-guardado**: Deshabilitado en `.vscode/settings.json`

### API Client (Frontend)
- **Detección automática de ngrok**: ✓
- **Si accedes desde ngrok**: Usa `https://michele-comfiest-soo.ngrok-free.dev`
- **Si accedes localmente**: Usa el proxy de Vite (`http://localhost:5002`)

## 🌐 Para Exponer con ngrok

### Opción 1: Solo Frontend (Recomendado)
Si solo necesitas exponer el frontend y que se comunique con el backend local:

```bash
# Terminal 1: ngrok para frontend
cd C:\Users\senis\ngrok
.\ngrok.exe http 3005 --request-header-add "ngrok-skip-browser-warning: true"
```

**URL pública del frontend**: Se mostrará en la consola de ngrok (ej: `https://xxxx-xxxx.ngrok-free.dev`)

**Nota**: El frontend detectará automáticamente que estás accediendo desde ngrok y usará la URL de ngrok del backend para las peticiones API.

### Opción 2: Frontend + Backend
Si necesitas exponer ambos servicios:

```bash
# Terminal 1: ngrok para frontend
cd C:\Users\senis\ngrok
.\ngrok.exe http 3005 --request-header-add "ngrok-skip-browser-warning: true"

# Terminal 2: ngrok para backend (con pooling si usas la misma URL)
cd C:\Users\senis\ngrok
.\ngrok.exe http 5002 --request-header-add "ngrok-skip-browser-warning: true" --pooling-enabled
```

**Importante**: 
- Si usas la misma URL de ngrok para ambos, necesitas `--pooling-enabled`
- Si usas URLs diferentes, actualiza `client.ts` con la nueva URL del backend

## 🔍 Verificar que Todo Funciona

1. **Frontend local**: Abre http://localhost:3005/
2. **Backend local**: Abre http://localhost:5002/swagger
3. **Frontend desde ngrok**: Abre la URL de ngrok del frontend
4. **Verificar comunicación**: Intenta hacer login o cualquier acción que requiera API

## ⚠️ Problemas Comunes

### El frontend no se comunica con el backend desde ngrok
- Verifica que `client.ts` tenga la URL correcta de ngrok del backend
- Verifica que el backend esté corriendo en el puerto 5002
- Verifica que ngrok del backend esté activo

### Error 403 en ngrok
- Agrega el flag `--request-header-add "ngrok-skip-browser-warning: true"`
- O haz clic en "Visit Site" en la página de advertencia de ngrok

### El servidor se reinicia constantemente
- Verifica que `.vscode/settings.json` tenga `"files.autoSave": "off"`
- Recarga la ventana de Cursor (Ctrl + Shift + P → "Reload Window")
- Verifica que OneDrive no esté sincronizando activamente

## 📝 URLs Actuales

- **Frontend Local**: http://localhost:3005/
- **Backend Local**: http://localhost:5002
- **Swagger**: http://localhost:5002/swagger
- **ngrok Backend**: https://michele-comfiest-soo.ngrok-free.dev (si está activo)
