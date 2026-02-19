# 🚀 Deploy Frontend en Cloudflare Pages

Guía rápida para deployar el frontend de CornerApp en Cloudflare Pages y conectarlo con tu backend en Railway.

## ⏱️ Tiempo estimado: 10 minutos

---

## 📋 Pre-requisitos

- ✅ Backend deployado en Railway (con URL pública)
- ✅ Repositorio en GitHub con el código del frontend
- ✅ Cuenta en Cloudflare (gratuita)

---

## 🚀 Paso 1: Obtener URL del Backend

1. Ve a tu proyecto en Railway
2. Haz clic en tu servicio del backend
3. En **Settings** > **Networking**, busca tu URL pública
4. Copia la URL completa (ejemplo: `https://cornerapp-production.up.railway.app`)

**Guarda esta URL**, la necesitarás en el Paso 4.

---

## 🌐 Paso 2: Crear cuenta en Cloudflare

1. Ve a [cloudflare.com](https://cloudflare.com)
2. Crea una cuenta gratuita
3. Ve a [dash.cloudflare.com](https://dash.cloudflare.com)
4. En el menú lateral izquierdo, haz clic en **"Workers & Pages"**

---

## 📦 Paso 3: Crear nuevo proyecto en Cloudflare Pages

1. Haz clic en **"Create application"**
2. Selecciona la pestaña **"Pages"**
3. Haz clic en **"Connect to Git"**
4. Conecta tu cuenta de GitHub
5. Selecciona tu repositorio **"Restaurante"**

---

## ⚙️ Paso 4: Configurar el Build

En la página de configuración del proyecto:

### Framework preset:
```
None (o Custom)
```

### Build configuration:

**Build command:**
```bash
cd CornerApp/frontend && npm install && npm run build
```

**Build output directory:**
```
CornerApp/frontend/dist
```

### Environment variables (IMPORTANTE):

Haz clic en **"Add variable"** y agrega:

| Variable | Valor |
|----------|-------|
| `VITE_API_URL` | `https://tu-backend.up.railway.app` |

**Reemplaza** `tu-backend.up.railway.app` con la URL real de Railway del Paso 1.

### Root directory (si aparece):
```
CornerApp/frontend
```

---

## 🎯 Paso 5: Iniciar Deploy

1. Revisa que todo esté configurado correctamente
2. Haz clic en **"Save and Deploy"**
3. Cloudflare comenzará el build automáticamente

El proceso tomará 2-5 minutos.

---

## ✅ Paso 6: Verificar el Deploy

Una vez completado:

1. Cloudflare te dará una URL como: `https://restaurante-xyz.pages.dev`
2. Abre la URL en tu navegador
3. Verifica que cargue correctamente

---

## 🔐 Paso 7: Configurar CORS en Railway

Tu backend necesita permitir peticiones desde Cloudflare.

### En Railway:

1. Ve a tu servicio del backend
2. Ve a **Variables**
3. Agrega estas variables (o edítalas si ya existen):

```
CORS__ALLOWEDORIGINS__0=https://tu-app.pages.dev
CORS__ALLOWEDORIGINS__1=http://localhost:3004
```

**Reemplaza** `tu-app.pages.dev` con tu dominio real de Cloudflare.

4. Guarda y espera a que Railway redespliegue (automático)

---

## 🎨 Paso 8: Dominio Custom (Opcional)

Si quieres usar tu propio dominio:

### En Cloudflare Pages:

1. Ve a tu proyecto en Pages
2. Haz clic en **"Custom domains"**
3. Haz clic en **"Set up a custom domain"**
4. Ingresa tu dominio (ejemplo: `app.tudominio.com`)
5. Cloudflare te dará instrucciones de DNS
6. Agrega el registro CNAME en tu proveedor de dominio
7. Espera propagación (1-24 horas, usualmente < 1 hora)

### Actualizar CORS en Railway:

Agrega tu dominio custom a las variables de entorno:

```
CORS__ALLOWEDORIGINS__2=https://app.tudominio.com
```

---

## 🔄 Auto-Deploy en Push

Cloudflare Pages automáticamente:
- ✅ Detecta pushes a `main`
- ✅ Ejecuta build automático
- ✅ Despliega nueva versión
- ✅ Actualiza URL automáticamente

No necesitas configurar nada adicional!

---

## 🧪 Verificar Conexión Backend

Para verificar que el frontend se comunica correctamente con Railway:

1. Abre tu app en Cloudflare: `https://tu-app.pages.dev`
2. Abre las DevTools del navegador (F12)
3. Ve a la pestaña **Console**
4. Ve a la pestaña **Network**
5. Intenta hacer login o cargar productos
6. Verifica que las peticiones vayan a tu URL de Railway
7. Verifica que no haya errores CORS

### Si ves errores CORS:
- Verifica que agregaste tu dominio de Cloudflare en las variables CORS de Railway
- Espera a que Railway redespliegue (puede tomar 1-2 minutos)
- Limpia caché del navegador (Ctrl+Shift+R o Cmd+Shift+R)

---

## 📊 Arquitectura Final

```
┌──────────────────┐
│   Usuario        │
│   (Navegador)    │
└────────┬─────────┘
         │ HTTPS
         ▼
┌──────────────────────────────────┐
│  Cloudflare Pages (Frontend)     │
│  https://tu-app.pages.dev        │
│  ├─ React + Vite SPA            │
│  ├─ Static assets (cached)      │
│  └─ Environment: VITE_API_URL   │
└────────┬─────────────────────────┘
         │ API calls (HTTPS)
         │ VITE_API_URL
         ▼
┌──────────────────────────────────┐
│  Railway (Backend)               │
│  https://backend.up.railway.app  │
│  ├─ ASP.NET Core API            │
│  ├─ CORS: Cloudflare domain    │
│  └─ MySQL Database              │
└──────────────────────────────────┘
```

---

## 💡 Tips

### Ver logs de build:
En Cloudflare Pages, cada deploy muestra logs completos del build.

### Preview deployments:
Cloudflare crea automáticamente un preview para cada branch y PR.

### Rollback:
Puedes hacer rollback a cualquier deploy anterior desde el dashboard.

### Cache:
Cloudflare cachea automáticamente assets estáticos (JS, CSS, imágenes).

---

## 🔧 Troubleshooting

### Build falla en Cloudflare

**Error: "Command not found: npm"**
- Verifica el build command
- Asegúrate de incluir `cd CornerApp/frontend &&`

**Error: "Module not found"**
- Verifica que `npm install` esté en el build command
- Revisa que todas las dependencias estén en `package.json`

### Frontend carga pero no se conecta al backend

**Verifica variables de entorno:**
```bash
# En Settings > Environment variables
VITE_API_URL debe estar configurado
```

**Verifica en el navegador:**
- F12 > Console
- Busca el log que imprime la API URL
- Debería mostrar tu URL de Railway, no localhost

### Errores CORS

**Error: "Access-Control-Allow-Origin"**

1. Verifica CORS en Railway:
   - Variables > `CORS__ALLOWEDORIGINS__0`
   - Debe incluir tu dominio de Cloudflare
   
2. Redespliegue Railway:
   - Railway debe redesplegar después de cambiar variables
   - Espera 1-2 minutos

3. Limpia caché:
   - Ctrl+Shift+R (o Cmd+Shift+R en Mac)

### Las imágenes no cargan

Si usas imágenes del backend:
- Verifica que Railway esté sirviendo `/images/*`
- Verifica CORS para imágenes
- Usa URLs absolutas: `${API_URL}/images/products/imagen.jpg`

---

## 🎉 ¡Listo!

Una vez completados todos los pasos:

- ✅ Frontend en Cloudflare Pages
- ✅ Backend en Railway
- ✅ CORS configurado
- ✅ Auto-deploy en push a main
- ✅ HTTPS automático

---

## 📚 Recursos

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Railway CORS Config](https://docs.railway.app)

---

## 🚀 Próximos Pasos Opcionales

1. **Agregar dominio custom** a Cloudflare Pages
2. **Configurar preview deployments** para branches de desarrollo
3. **Agregar analytics** (Cloudflare Web Analytics)
4. **Configurar CDN** para assets del backend (opcional)
5. **Agregar monitoring** (Sentry, LogRocket, etc.)

---

**¿Problemas?** Revisa la sección Troubleshooting o contacta soporte de Cloudflare.
