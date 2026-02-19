# 🌐 Configuración Completa: Frontend y Backend con ngrok

## ✅ Estado Actual

### Backend (ngrok):
- **URL**: `https://michele-comfiest-soo.ngrok-free.dev`
- **Puerto local**: `8080`
- **Estado**: ✅ Activo

### Frontend (ngrok):
- **URL**: (Ver en la ventana de PowerShell que se abrió)
- **Puerto local**: `3000`
- **Estado**: ✅ Activo

---

## 🔧 Configuración Realizada

### 1. Backend expuesto con ngrok
```cmd
C:\Users\senis\ngrok\ngrok.exe http 8080
```

### 2. Frontend expuesto con ngrok
```cmd
C:\Users\senis\ngrok\ngrok.exe http 3000
```

### 3. Frontend configurado para usar backend de ngrok

**Archivo actualizado**: `frontend/src/api/client.ts`
- Detecta automáticamente si accedes desde ngrok
- Usa la URL del backend de ngrok cuando accedes desde ngrok
- Usa proxy local cuando accedes desde `localhost`

**Archivo actualizado**: `frontend/vite.config.ts`
- Proxy configurado para usar backend de ngrok en desarrollo

---

## 📱 Cómo Acceder

### Desde tu móvil o cualquier dispositivo:

1. **Obtén la URL del frontend de ngrok**:
   - Abre la ventana de PowerShell que se abrió
   - Busca la línea que dice: `Forwarding https://xxxxx.ngrok-free.dev -> http://localhost:3000`
   - Esa es tu URL del frontend

2. **Abre esa URL en tu navegador móvil o dispositivo**

3. **El frontend se conectará automáticamente al backend** a través de ngrok

---

## 🔄 Flujo de Comunicación

```
Dispositivo Externo
    ↓
Frontend (ngrok) → https://xxxxx.ngrok-free.dev:3000
    ↓
Backend (ngrok) → https://michele-comfiest-soo.ngrok-free.dev:8080
    ↓
Base de Datos Local → localhost:3306 (MySQL)
```

---

## ⚙️ Configuración Automática

El frontend detecta automáticamente si estás accediendo desde:
- **ngrok**: Usa `https://michele-comfiest-soo.ngrok-free.dev` como backend
- **localhost**: Usa proxy local (vite.config.ts)

No necesitas cambiar nada manualmente.

---

## 🔍 Verificar que Funciona

### 1. Ver URL del frontend en ngrok:
- Abre la ventana de PowerShell donde corre ngrok del frontend
- Verás algo como:
  ```
  Forwarding  https://abc123.ngrok-free.dev -> http://localhost:3000
  ```

### 2. Probar desde tu móvil:
- Abre la URL de ngrok del frontend en tu navegador móvil
- Deberías ver la aplicación
- Intenta hacer login o cualquier acción
- Debería conectarse al backend correctamente

### 3. Ver requests en ngrok:
- Abre `http://localhost:4040` en tu navegador (interfaz web de ngrok del backend)
- Verás todas las requests que pasan por el túnel

---

## ⚠️ Notas Importantes

### URLs Temporales
- Las URLs de ngrok cambian cada vez que reinicias ngrok
- Si reinicias ngrok del frontend, obtendrás una nueva URL
- Si reinicias ngrok del backend, necesitarás actualizar:
  - `frontend/src/api/client.ts` (línea con la URL del backend)
  - `frontend/vite.config.ts` (proxy)

### Mantener ngrok Corriendo
- **No cierres** las ventanas de PowerShell donde corre ngrok
- Si cierras ngrok, perderás acceso desde internet
- Para detener: Presiona `Ctrl+C` en la ventana de ngrok

### CORS
- Asegúrate de que tu backend tenga configurado CORS para permitir:
  - La URL de ngrok del frontend
  - `https://michele-comfiest-soo.ngrok-free.dev` (backend)
  - Cualquier URL de ngrok que uses

---

## 🔧 Solución Rápida: Actualizar URL del Backend

Si reinicias ngrok del backend y obtienes una nueva URL:

1. **Actualiza `frontend/src/api/client.ts`**:
   ```typescript
   const API_BASE_URL = isNgrok ? 'https://NUEVA_URL_BACKEND.ngrok-free.dev' : '';
   ```

2. **Actualiza `frontend/vite.config.ts`**:
   ```typescript
   target: 'https://NUEVA_URL_BACKEND.ngrok-free.dev',
   ```

3. **Reinicia el servidor de desarrollo**:
   ```cmd
   # Detén el servidor (Ctrl+C)
   npm run dev
   ```

---

## 🎯 Resumen

✅ **Backend expuesto**: `https://michele-comfiest-soo.ngrok-free.dev`  
✅ **Frontend expuesto**: (Ver en ventana de PowerShell)  
✅ **Comunicación**: Frontend → Backend (ambos por ngrok)  
✅ **Base de datos**: Local (accesible desde backend local)  
✅ **Detección automática**: El frontend detecta si accedes desde ngrok  

---

## 🆘 Si Algo No Funciona

1. **Verifica que ambos ngrok estén corriendo**
2. **Verifica las URLs en las ventanas de PowerShell**
3. **Abre la consola del navegador** (F12) para ver errores
4. **Verifica CORS** en el backend
5. **Revisa los logs** en `http://localhost:4040` (ngrok web interface)

---

## 📝 Próximos Pasos

1. ✅ Obtén la URL del frontend de ngrok
2. ✅ Prueba acceder desde tu móvil
3. ✅ Verifica que todo funcione correctamente
4. ✅ Si necesitas URLs estables, considera el plan de pago de ngrok
