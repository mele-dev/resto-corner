# 🚇 Guía de Instalación de ngrok en Windows

ngrok permite exponer tu aplicación local a internet creando un túnel seguro.

---

## 📥 Método 1: Descarga Directa (Recomendado)

### Paso 1: Descargar ngrok

1. Ve a https://ngrok.com/download
2. Descarga la versión para Windows (64-bit)
3. O descarga directamente: https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip

### Paso 2: Extraer y Configurar

1. **Extrae el archivo ZIP** en una carpeta (ej: `C:\ngrok`)
2. **Copia el ejecutable** `ngrok.exe` a una ubicación permanente

### Paso 3: Agregar al PATH (Opcional pero Recomendado)

Para poder usar `ngrok` desde cualquier lugar:

1. **Copia `ngrok.exe`** a una carpeta permanente:
   ```
   C:\Program Files\ngrok\ngrok.exe
   ```

2. **Agregar al PATH**:
   - Presiona `Win + R`
   - Escribe: `sysdm.cpl` y presiona Enter
   - Ve a la pestaña **"Opciones avanzadas"**
   - Click en **"Variables de entorno"**
   - En **"Variables del sistema"**, busca `Path` y click en **"Editar"**
   - Click en **"Nuevo"** y agrega: `C:\Program Files\ngrok`
   - Click en **"Aceptar"** en todas las ventanas

3. **Cierra y vuelve a abrir** PowerShell/CMD para que tome efecto

### Paso 4: Verificar Instalación

Abre una nueva terminal y ejecuta:
```powershell
ngrok version
```

Deberías ver la versión de ngrok instalada.

---

## 🔑 Paso 5: Configurar Autenticación (Opcional pero Recomendado)

Para usar ngrok sin límites, necesitas una cuenta gratuita:

1. **Crear cuenta** en https://dashboard.ngrok.com/signup
2. **Obtener tu authtoken** desde https://dashboard.ngrok.com/get-started/your-authtoken
3. **Configurar ngrok**:
   ```powershell
   ngrok config add-authtoken TU_AUTHTOKEN_AQUI
   ```

Sin authtoken, ngrok funciona pero con limitaciones (sesiones de 2 horas, URLs aleatorias).

---

## 🚀 Uso Básico de ngrok

### Exponer un puerto local:

```powershell
# Exponer puerto 5000 (tu backend .NET)
ngrok http 5000

# Exponer puerto 80 (tu frontend)
ngrok http 80

# Exponer puerto 8080
ngrok http 8080
```

### Exponer con dominio personalizado (requiere cuenta):

```powershell
ngrok http 5000 --domain=tu-dominio.ngrok-free.app
```

---

## 📋 Ejemplos para CornerApp

### Backend (.NET):
```powershell
# Si tu backend corre en puerto 5000
ngrok http 5000

# Si tu backend corre en puerto 8080
ngrok http 8080
```

### Frontend (React):
```powershell
# Si tu frontend corre en puerto 3000
ngrok http 3000

# Si tu frontend corre en puerto 80
ngrok http 80
```

### Docker Compose (todos los servicios):
```powershell
# Exponer el backend
ngrok http 8080

# En otra terminal, exponer el frontend
ngrok http 80
```

---

## 🎯 Uso Avanzado

### Configuración con archivo `ngrok.yml`:

Crea un archivo `ngrok.yml` en `C:\Users\TU_USUARIO\.ngrok2\` o `C:\Users\TU_USUARIO\AppData\Local\ngrok\`:

```yaml
version: "2"
authtoken: TU_AUTHTOKEN_AQUI
tunnels:
  backend:
    addr: 8080
    proto: http
  frontend:
    addr: 80
    proto: http
```

Luego ejecuta:
```powershell
ngrok start backend
# o
ngrok start --all  # Inicia todos los túneles
```

---

## 🔍 Verificar que Funciona

1. **Inicia ngrok**:
   ```powershell
   ngrok http 5000
   ```

2. **Verás algo como**:
   ```
   Forwarding  https://abc123.ngrok-free.app -> http://localhost:5000
   ```

3. **Abre la URL** `https://abc123.ngrok-free.app` en tu navegador
4. **Deberías ver** tu aplicación local

---

## ⚠️ Notas Importantes

1. **URLs temporales**: Sin cuenta, las URLs cambian cada vez que reinicias ngrok
2. **Límite de tiempo**: Sin cuenta, las sesiones duran 2 horas
3. **Límite de conexiones**: Sin cuenta, hay límites de requests
4. **Con cuenta gratuita**: URLs más estables, sin límite de tiempo

---

## 🆘 Solución de Problemas

### "ngrok no se reconoce como comando"
- Verifica que agregaste ngrok al PATH
- Reinicia la terminal
- Verifica la ruta: `where ngrok` (debería mostrar la ubicación)

### "Error: authtoken required"
- Crea una cuenta en ngrok.com
- Obtén tu authtoken
- Ejecuta: `ngrok config add-authtoken TU_TOKEN`

### "Address already in use"
- El puerto ya está en uso
- Cambia el puerto o detén el servicio que lo usa

---

## 📝 Comandos Útiles

```powershell
# Ver versión
ngrok version

# Ver configuración
ngrok config check

# Ver túneles activos
# Abre http://localhost:4040 en tu navegador (interfaz web de ngrok)

# Detener ngrok
# Presiona Ctrl+C en la terminal donde está corriendo
```

---

## 🎁 Alternativas a ngrok (Gratuitas)

Si ngrok no te funciona, puedes usar:

1. **Cloudflare Tunnel** (gratis, ilimitado)
2. **LocalTunnel** (gratis, npm install -g localtunnel)
3. **Serveo** (gratis, sin instalación)
4. **localtunnel** (gratis, npm)

¿Necesitas ayuda con alguno de estos pasos?
