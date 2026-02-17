# 🔧 Configurar ngrok Correctamente

## ⚠️ Problema Actual

- **Frontend corriendo en**: Puerto 3005
- **ngrok apuntando a**: Puerto 3004 ❌
- **Backend corriendo en**: Puerto 5002
- **ngrok backend**: ✅ Correcto

## ✅ Solución: Reiniciar ngrok del Frontend

### Paso 1: Detener ngrok del Frontend

En la consola donde tienes ngrok apuntando a `localhost:3004`:
1. Presiona `Ctrl + C` para detenerlo

### Paso 2: Reiniciar ngrok del Frontend con el Puerto Correcto

```bash
cd C:\Users\senis\ngrok
.\ngrok.exe http 3005 --request-header-add "ngrok-skip-browser-warning: true"
```

**Nota**: Si quieres usar la misma URL de ngrok (`michele-comfiest-soo.ngrok-free.dev`), agrega el flag `--pooling-enabled`:

```bash
.\ngrok.exe http 3005 --request-header-add "ngrok-skip-browser-warning: true" --pooling-enabled
```

### Paso 3: Verificar

Después de reiniciar, deberías ver:
```
Forwarding    https://michele-comfiest-soo.ngrok-free.dev -> http://localhost:3005
```

## 📋 Resumen de Comandos

### Terminal 1: Frontend (Puerto 3005)
```bash
cd C:\Users\senis\ngrok
.\ngrok.exe http 3005 --request-header-add "ngrok-skip-browser-warning: true" --pooling-enabled
```

### Terminal 2: Backend (Puerto 5002)
```bash
cd C:\Users\senis\ngrok
.\ngrok.exe http 5002 --request-header-add "ngrok-skip-browser-warning: true" --pooling-enabled
```

## 🔍 Verificar que Todo Funciona

1. **Frontend ngrok**: Abre `https://michele-comfiest-soo.ngrok-free.dev` en el navegador
2. **Debería cargar**: La aplicación React
3. **Verificar API**: Intenta hacer login o cualquier acción que requiera comunicación con el backend
4. **Backend ngrok**: Las peticiones API deberían funcionar automáticamente porque `client.ts` detecta ngrok y usa la URL correcta

## ⚙️ Configuración Actual

- **Frontend local**: http://localhost:3005/
- **Backend local**: http://localhost:5002
- **Frontend ngrok**: https://michele-comfiest-soo.ngrok-free.dev (después de reiniciar)
- **Backend ngrok**: https://michele-comfiest-soo.ngrok-free.dev (ya configurado)
- **Client API**: Detecta automáticamente ngrok y usa la URL correcta ✓

## 💡 Nota sobre Pooling

Si usas `--pooling-enabled`, ngrok distribuirá las peticiones entre ambos servicios (frontend y backend) usando la misma URL. Esto funciona porque:
- Las peticiones a `/api/*` van al backend
- Las demás peticiones van al frontend

Si prefieres URLs diferentes, no uses `--pooling-enabled` y actualiza `client.ts` con la nueva URL del backend.
