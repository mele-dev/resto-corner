# 🔍 Verificación de Servicios

## ✅ Estado Actual

### Servicios Locales:
- **Frontend**: ✅ Corriendo en puerto 3004
- **Backend**: ⚠️ Verificando...
- **ngrok**: ✅ 2 procesos corriendo

---

## 📋 Cómo Verificar Todo

### 1. Verificar URLs de ngrok

**Opción A: Interfaz Web de ngrok**
1. Abre en tu navegador: `http://localhost:4040`
2. Verás todas las URLs de ngrok activas
3. Busca las URLs que apuntan a:
   - `http://localhost:3004` (Frontend)
   - `http://localhost:5002` (Backend)

**Opción B: Ventanas de PowerShell**
- Busca las ventanas de PowerShell donde corre ngrok
- Cada una mostrará una línea como:
  ```
  Forwarding https://xxxxx.ngrok-free.dev -> http://localhost:XXXX
  ```

### 2. Verificar que el Backend esté Corriendo

**Desde PowerShell:**
```powershell
# Verificar si el puerto 5002 está en uso
netstat -ano | Select-String ":5002"
```

**O intenta acceder:**
```powershell
Invoke-WebRequest -Uri "http://localhost:5002/api/restaurants" -UseBasicParsing
```

### 3. Verificar que el Frontend esté Corriendo

**Desde PowerShell:**
```powershell
# Verificar si el puerto 3004 está en uso
netstat -ano | Select-String ":3004"
```

**O abre en tu navegador:**
- `http://localhost:3004`

---

## 🌐 URLs de ngrok

Una vez que tengas las URLs de ngrok:

**Frontend (ngrok):**
- URL: `https://xxxxx.ngrok-free.dev` (apunta a puerto 3004)

**Backend (ngrok):**
- URL: `https://yyyyy.ngrok-free.dev` (apunta a puerto 5002)

---

## ⚙️ Configuración Actual

### Frontend (`frontend/src/api/client.ts`):
- Detecta automáticamente si accedes desde ngrok
- Si accedes desde ngrok: usa `https://michele-comfiest-soo.ngrok-free.dev`
- Si accedes desde localhost: usa proxy local

**⚠️ IMPORTANTE**: Si la URL de ngrok del backend cambió, actualiza:
```typescript
const API_BASE_URL = isNgrok ? 'https://NUEVA_URL_BACKEND.ngrok-free.dev' : '';
```

---

## 🆘 Si No Puedes Acceder desde ngrok

### Problema 1: ngrok no está corriendo
**Solución:**
```powershell
cd C:\Users\senis\ngrok
.\ngrok.exe http 3004 --pooling-enabled
.\ngrok.exe http 5002 --pooling-enabled
```

### Problema 2: Backend no está corriendo
**Solución:**
```powershell
cd C:\Users\senis\OneDrive\Escritorio\RestauranteNW\Restaurante\CornerApp\backend-csharp\CornerApp.API
dotnet run
```

### Problema 3: URLs de ngrok cambiaron
**Solución:**
1. Obtén las nuevas URLs desde `http://localhost:4040`
2. Actualiza `frontend/src/api/client.ts` con la nueva URL del backend

---

## 🎯 Pasos para Levantar Todo

1. **Backend:**
   ```powershell
   cd C:\Users\senis\OneDrive\Escritorio\RestauranteNW\Restaurante\CornerApp\backend-csharp\CornerApp.API
   dotnet run
   ```

2. **Frontend:**
   ```powershell
   cd C:\Users\senis\OneDrive\Escritorio\RestauranteNW\Restaurante\CornerApp\frontend
   npm run dev
   ```

3. **ngrok Frontend:**
   ```powershell
   cd C:\Users\senis\ngrok
   .\ngrok.exe http 3004 --pooling-enabled
   ```

4. **ngrok Backend:**
   ```powershell
   cd C:\Users\senis\ngrok
   .\ngrok.exe http 5002 --pooling-enabled
   ```

5. **Obtén las URLs** desde `http://localhost:4040` o las ventanas de PowerShell

6. **Actualiza** `frontend/src/api/client.ts` con la URL del backend de ngrok
