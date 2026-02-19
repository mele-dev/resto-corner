# 🔧 Solución: URL de ngrok ya en uso

## ⚠️ Problema

ngrok está intentando usar la URL `https://michele-comfiest-soo.ngrok-free.dev` que ya está activa en tu cuenta.

## ✅ Soluciones

### Solución 1: Detener Túneles desde el Dashboard (Más Rápido)

1. **Ve al dashboard de ngrok**: https://dashboard.ngrok.com/status/tunnels
2. **Inicia sesión** con tu cuenta (senisabasso@gmail.com)
3. **Detén todos los túneles activos** (botón "Stop" en cada túnel)
4. **Espera 30 segundos**
5. **Vuelve a iniciar ngrok** desde PowerShell

### Solución 2: Usar Pooling (Compartir URL)

Si quieres que ambos servicios (frontend y backend) usen la misma URL con balanceo de carga:

**Frontend:**
```powershell
cd C:\Users\senis\ngrok
.\ngrok.exe http 3002 --pooling-enabled
```

**Backend:**
```powershell
cd C:\Users\senis\ngrok
.\ngrok.exe http 5002 --pooling-enabled
```

**⚠️ Nota**: Esto hará que ambos compartan la misma URL, lo cual NO es lo que queremos.

### Solución 3: Esperar y Reiniciar (Más Simple)

1. **Espera 5-10 minutos** (ngrok liberará la URL automáticamente)
2. **Detén todos los ngrok**:
   ```powershell
   Get-Process ngrok | Stop-Process -Force
   ```
3. **Inicia ngrok para el frontend**:
   ```powershell
   cd C:\Users\senis\ngrok
   .\ngrok.exe http 3002
   ```
4. **Espera 10 segundos** y verás una URL nueva
5. **Inicia ngrok para el backend** (en otra ventana):
   ```powershell
   cd C:\Users\senis\ngrok
   .\ngrok.exe http 5002
   ```
6. **Espera 10 segundos** y verás otra URL diferente

### Solución 4: Usar Dominio Personalizado (Requiere Plan de Pago)

Si tienes plan de pago de ngrok, puedes usar dominios personalizados estables.

---

## 🎯 Recomendación

**Usa la Solución 1** (Dashboard de ngrok):
- Es la más rápida
- Te da control total
- Evita conflictos

**Pasos:**
1. Abre: https://dashboard.ngrok.com/status/tunnels
2. Detén todos los túneles
3. Espera 30 segundos
4. Inicia ngrok desde PowerShell normalmente

---

## 📋 Después de Obtener las URLs

Una vez que tengas las URLs de ngrok:

1. **URL del Frontend**: `https://xxxxx.ngrok-free.dev` (puerto 3002)
2. **URL del Backend**: `https://yyyyy.ngrok-free.dev` (puerto 5002)

**Actualiza estos archivos:**

**`frontend/src/api/client.ts` (línea 9):**
```typescript
const API_BASE_URL = isNgrok ? 'https://yyyyy.ngrok-free.dev' : '';
```

**`frontend/vite.config.ts` (target del proxy):**
```typescript
target: 'https://yyyyy.ngrok-free.dev',
```

---

## 🆘 Si Nada Funciona

1. **Cierra todas las ventanas de PowerShell** con ngrok
2. **Espera 10 minutos**
3. **Ve al dashboard**: https://dashboard.ngrok.com/status/tunnels
4. **Detén manualmente** todos los túneles
5. **Vuelve a intentar**
