# 🚀 Cómo Usar ngrok (Ya Configurado)

Tu authtoken ya está configurado ✅. Ahora puedes usar ngrok.

---

## ⚠️ Problema: ngrok no funciona desde System32

Si ejecutas `ngrok` desde `C:\Windows\System32>`, no funcionará porque ngrok no está en esa ubicación.

### Soluciones:

#### Opción 1: Usar la ruta completa (Funciona siempre)
```cmd
C:\Users\senis\ngrok\ngrok.exe http 8080
```

#### Opción 2: Cambiar de directorio primero
```cmd
cd C:\Users\senis\ngrok
ngrok.exe http 8080
```

#### Opción 3: Usar PowerShell (Recomendado)
Abre PowerShell (no CMD) y ejecuta:
```powershell
ngrok http 8080
```

---

## 🎯 Comandos para tu Proyecto CornerApp

### Backend (.NET en puerto 8080):
```cmd
C:\Users\senis\ngrok\ngrok.exe http 8080
```

### Frontend (React en puerto 3000):
```cmd
C:\Users\senis\ngrok\ngrok.exe http 3000
```

### Backend con Docker (puerto 8080):
```cmd
C:\Users\senis\ngrok\ngrok.exe http 8080
```

---

## 📋 Ejemplo Completo

1. **Inicia tu backend** (en otra terminal):
   ```cmd
   cd C:\Users\senis\OneDrive\Escritorio\RestauranteNW\Restaurante\CornerApp
   docker compose up
   ```

2. **En otra terminal, inicia ngrok**:
   ```cmd
   C:\Users\senis\ngrok\ngrok.exe http 8080
   ```

3. **Verás algo como**:
   ```
   Forwarding  https://abc123.ngrok-free.app -> http://localhost:8080
   ```

4. **Usa la URL** `https://abc123.ngrok-free.app` para acceder a tu backend desde internet

---

## 🔍 Ver Interfaz Web de ngrok

Mientras ngrok está corriendo, abre en tu navegador:
```
http://localhost:4040
```

Verás:
- Todas las requests que pasan por el túnel
- Estadísticas
- Logs en tiempo real

---

## 💡 Atajos Útiles

### Crear un archivo `.bat` para facilitar el uso:

Crea un archivo `ngrok-backend.bat` en tu escritorio con:
```batch
@echo off
C:\Users\senis\ngrok\ngrok.exe http 8080
pause
```

Luego solo haz doble clic para iniciar ngrok para el backend.

### O crear `ngrok-frontend.bat`:
```batch
@echo off
C:\Users\senis\ngrok\ngrok.exe http 3000
pause
```

---

## ✅ Verificar que Funciona

1. Inicia ngrok:
   ```cmd
   C:\Users\senis\ngrok\ngrok.exe http 8080
   ```

2. Deberías ver:
   ```
   Session Status                online
   Account                       tu-email@ejemplo.com
   Forwarding                    https://xxx.ngrok-free.app -> http://localhost:8080
   ```

3. Abre la URL en tu navegador o móvil

---

## 🆘 Solución Definitiva: Agregar al PATH del Sistema

Si quieres usar `ngrok` desde cualquier lugar sin la ruta completa:

1. Presiona `Win + R`
2. Escribe: `sysdm.cpl` y Enter
3. Ve a **"Opciones avanzadas"** → **"Variables de entorno"**
4. En **"Variables del sistema"**, busca `Path` → **"Editar"**
5. Click en **"Nuevo"** y agrega: `C:\Users\senis\ngrok`
6. Click **"Aceptar"** en todas las ventanas
7. **Cierra y vuelve a abrir** CMD/PowerShell

Después de esto, podrás usar `ngrok` desde cualquier lugar.

---

## 🎉 ¡Listo!

Tu ngrok está configurado y listo para usar. Solo recuerda usar la ruta completa desde CMD o cambiar a PowerShell.
