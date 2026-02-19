# 📋 Configuración CORS para Railway Backend

Esta es la configuración CORS que necesitas en Railway para que tu frontend en Cloudflare Pages pueda comunicarse correctamente.

## 🔧 Variables de Entorno en Railway

Ve a tu servicio del backend en Railway > **Variables** y agrega:

### Variables CORS (REQUERIDAS):

```bash
# Dominio de Cloudflare Pages
CORS__ALLOWEDORIGINS__0=https://tu-app.pages.dev

# Localhost para desarrollo
CORS__ALLOWEDORIGINS__1=http://localhost:3004

# Si tienes dominio custom en Cloudflare
CORS__ALLOWEDORIGINS__2=https://app.tudominio.com
```

### Ejemplo Completo:

Si tu app en Cloudflare es `cornerapp-production.pages.dev`:

```bash
CORS__ALLOWEDORIGINS__0=https://cornerapp-production.pages.dev
CORS__ALLOWEDORIGINS__1=http://localhost:3004
CORS__ALLOWEDORIGINS__2=http://localhost:3000
```

---

## ⚠️ IMPORTANTE: Formato Correcto

Railway usa el formato de configuración de ASP.NET Core:
- Usa `__` (doble guión bajo) para separar secciones
- Usa `__0`, `__1`, `__2` para arrays
- Es case-sensitive

### ✅ Correcto:
```
CORS__ALLOWEDORIGINS__0=https://app.pages.dev
```

### ❌ Incorrecto:
```
CORS_ALLOWEDORIGINS_0=https://app.pages.dev  (guión bajo simple)
Cors__AllowedOrigins__0=https://app.pages.dev (case incorrecto)
```

---

## 🔄 Después de Agregar Variables

1. Railway redesplega automáticamente (1-2 minutos)
2. Verifica en los logs que el redeploy completó
3. Prueba tu frontend en Cloudflare
4. Debería poder comunicarse con Railway sin errores CORS

---

## ✅ Verificar CORS

### En el navegador:

1. Abre tu app en Cloudflare
2. F12 > Network tab
3. Haz una petición al backend (login, cargar productos, etc.)
4. Verifica la respuesta

**Headers de respuesta esperados:**
```
Access-Control-Allow-Origin: https://tu-app.pages.dev
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, ...
```

### Si ves error CORS:

```
Access to fetch at 'https://backend.railway.app/api/...' from origin 'https://app.pages.dev' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present.
```

**Solución:**
1. Verifica que agregaste el dominio en Railway
2. Verifica que el formato sea correcto (con `__`)
3. Verifica que Railway haya redesplegado
4. Limpia caché del navegador (Ctrl+Shift+R)

---

## 🧪 Testing CORS

Puedes probar CORS con curl:

```bash
curl -X OPTIONS https://tu-backend.up.railway.app/api/products \
  -H "Origin: https://tu-app.pages.dev" \
  -H "Access-Control-Request-Method: GET" \
  -v
```

Deberías ver headers CORS en la respuesta.

---

## 🌐 Múltiples Dominios

Si tienes múltiples dominios (staging, producción, custom):

```bash
# Cloudflare Pages production
CORS__ALLOWEDORIGINS__0=https://app.pages.dev

# Cloudflare Pages staging (preview branch)
CORS__ALLOWEDORIGINS__1=https://staging.app.pages.dev

# Dominio custom
CORS__ALLOWEDORIGINS__2=https://app.tudominio.com

# Desarrollo local
CORS__ALLOWEDORIGINS__3=http://localhost:3004
CORS__ALLOWEDORIGINS__4=http://localhost:3000

# Ngrok (si lo usas)
CORS__ALLOWEDORIGINS__5=https://tu-app.ngrok-free.dev
```

---

## 📝 Variables Completas Recomendadas

Aquí está la lista completa de variables que deberías tener en Railway:

```bash
# === DATABASE (ya configurado) ===
CONNECTION_STRING=Server=mysql.railway.internal;Port=3306;...

# === JWT (ya configurado) ===
JWT_SECRET_KEY=tu-clave-secreta
JWT_ISSUER=CornerApp
JWT_AUDIENCE=CornerApp

# === ASPNETCORE (ya configurado) ===
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080

# === SWAGGER (ya configurado) ===
EnableSwagger=true

# === CORS (NUEVO - agregar estas) ===
CORS__ALLOWEDORIGINS__0=https://tu-app.pages.dev
CORS__ALLOWEDORIGINS__1=http://localhost:3004
CORS__ALLOWEDORIGINS__2=http://localhost:3000
```

---

## 🚀 Auto-actualización

Cada vez que cambies las variables CORS en Railway:
1. Railway detecta el cambio
2. Redesplega automáticamente
3. El nuevo CORS toma efecto inmediatamente

No necesitas hacer nada más!

---

## 💡 Best Practices

### Producción:
- Solo incluye dominios de producción
- No incluyas `localhost`

### Desarrollo + Producción:
- Incluye tanto dominios de producción como localhost
- Railway puede manejar múltiples orígenes sin problema

### Seguridad:
- No uses `*` (todos los orígenes) en producción
- Especifica cada dominio explícitamente
- Usa HTTPS siempre que sea posible

---

**¿Necesitas más info?** Lee [DEPLOY_CLOUDFLARE.md](DEPLOY_CLOUDFLARE.md) para guía completa.
