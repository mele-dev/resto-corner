# 🌐 Acceso Público al Frontend con ngrok

## ✅ Configuración Actual

- **Frontend local**: `http://localhost:3001`
- **Frontend red local**: `http://192.168.1.36:3001`
- **Frontend público (ngrok)**: Ver en la ventana de PowerShell que se abrió
- **Backend (ngrok)**: `https://michele-comfiest-soo.ngrok-free.dev`

---

## 🚀 Cómo Obtener la URL Pública

1. **Busca la ventana de PowerShell** que se abrió automáticamente
2. **Busca la línea** que dice:
   ```
   Forwarding  https://xxxxx.ngrok-free.dev -> http://localhost:3001
   ```
3. **Esa URL** (`https://xxxxx.ngrok-free.dev`) es tu URL pública del frontend

---

## 📱 Cómo Acceder desde Cualquier Lugar

### Opción 1: Desde tu móvil
1. Abre el navegador en tu móvil
2. Ingresa la URL de ngrok del frontend
3. Deberías ver tu aplicación

### Opción 2: Desde otra computadora
1. Abre un navegador en otra computadora
2. Ingresa la URL de ngrok del frontend
3. Funcionará igual que desde tu móvil

---

## 🔄 Flujo de Comunicación

```
Dispositivo Externo (Móvil/PC)
    ↓
Frontend (ngrok) → https://xxxxx.ngrok-free.dev
    ↓ (detecta automáticamente que es ngrok)
Backend (ngrok) → https://michele-comfiest-soo.ngrok-free.dev
    ↓
Base de Datos Local → MySQL en tu computadora
```

---

## ⚙️ Configuración Automática

El frontend está configurado para:

1. **Detectar automáticamente** si accedes desde ngrok
2. **Usar el backend de ngrok** cuando accedes desde ngrok
3. **Usar proxy local** cuando accedes desde localhost

**No necesitas cambiar nada manualmente.**

---

## 🔍 Verificar que Funciona

### 1. Obtén la URL de ngrok
- Abre la ventana de PowerShell donde corre ngrok
- Copia la URL que aparece después de "Forwarding"

### 2. Prueba desde tu móvil
- Abre esa URL en el navegador de tu móvil
- Deberías ver la aplicación funcionando
- Intenta hacer login o cualquier acción
- Debería conectarse al backend correctamente

### 3. Ver requests en tiempo real
- Abre `http://localhost:4040` en tu navegador
- Verás todas las requests que pasan por ngrok del backend
- Útil para debugging

---

## ⚠️ Notas Importantes

### URLs Temporales
- Las URLs de ngrok **cambian cada vez que reinicias ngrok**
- Si reinicias ngrok del frontend, obtendrás una nueva URL
- Si reinicias ngrok del backend, necesitarás actualizar:
  - `frontend/src/api/client.ts` (línea 9)

### Mantener ngrok Corriendo
- **No cierres** la ventana de PowerShell donde corre ngrok
- Si cierras ngrok, perderás acceso público
- Para detener: Presiona `Ctrl+C` en la ventana de ngrok

### CORS
- Tu backend ya debería tener configurado CORS
- Si hay problemas de CORS, verifica que el backend permita:
  - La URL de ngrok del frontend
  - `https://michele-comfiest-soo.ngrok-free.dev`

---

## 🔧 Si Reinicias ngrok del Backend

Si reinicias ngrok del backend y obtienes una nueva URL:

1. **Actualiza `frontend/src/api/client.ts`** (línea 9):
   ```typescript
   const API_BASE_URL = isNgrok ? 'https://NUEVA_URL_BACKEND.ngrok-free.dev' : '';
   ```

2. **Actualiza `frontend/vite.config.ts`** (target del proxy):
   ```typescript
   target: 'https://NUEVA_URL_BACKEND.ngrok-free.dev',
   ```

3. **Reinicia el servidor de desarrollo** (si es necesario):
   ```cmd
   # Detén el servidor (Ctrl+C)
   npm run dev
   ```

---

## 📋 Resumen

✅ **Frontend local**: `http://localhost:3001`  
✅ **Frontend red local**: `http://192.168.1.36:3001`  
✅ **Frontend público**: `https://xxxxx.ngrok-free.dev` (ver en PowerShell)  
✅ **Backend público**: `https://michele-comfiest-soo.ngrok-free.dev`  
✅ **Detección automática**: El frontend detecta ngrok y usa el backend correcto  

---

## 🆘 Solución de Problemas

### No puedo ver la URL de ngrok
- Busca la ventana de PowerShell que se abrió
- Debería mostrar la URL después de "Forwarding"

### El frontend no se conecta al backend
- Verifica que ngrok del backend esté corriendo
- Verifica la URL en `frontend/src/api/client.ts`
- Abre la consola del navegador (F12) para ver errores

### Error de CORS
- Verifica que el backend permita la URL de ngrok del frontend
- Revisa la configuración de CORS en el backend

---

## 🎯 Próximos Pasos

1. ✅ Obtén la URL de ngrok del frontend (en la ventana de PowerShell)
2. ✅ Prueba acceder desde tu móvil
3. ✅ Verifica que todo funcione correctamente
4. ✅ Si necesitas URLs estables, considera el plan de pago de ngrok
