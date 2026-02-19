# 🚀 Guía Rápida: Frontend en Cloudflare + Backend en Railway

## ⚡ Quick Start (10 minutos)

### 1️⃣ Obtén la URL de Railway

```bash
# En Railway Dashboard > Tu servicio backend > Settings > Networking
# Copia la URL: https://tu-backend.up.railway.app
```

### 2️⃣ Crea cuenta en Cloudflare

- Ve a [cloudflare.com](https://cloudflare.com)
- Regístrate (gratis)
- Ve a **Workers & Pages**

### 3️⃣ Conecta GitHub

- **Create application** → **Pages** → **Connect to Git**
- Conecta GitHub y selecciona tu repositorio

### 4️⃣ Configura Build

**Build command:**
```bash
cd CornerApp/frontend && npm install && npm run build
```

**Build output directory:**
```
CornerApp/frontend/dist
```

**Environment variables:**
```
VITE_API_URL = https://tu-backend.up.railway.app
```
(Reemplaza con tu URL real de Railway)

### 5️⃣ Deploy

- Haz clic en **"Save and Deploy"**
- Espera 2-5 minutos

### 6️⃣ Configura CORS en Railway

En Railway > Variables, agrega:

```
CORS__ALLOWEDORIGINS__0=https://tu-app.pages.dev
```
(Reemplaza con tu URL de Cloudflare)

---

## ✅ Verificar

1. Abre: `https://tu-app.pages.dev`
2. F12 > Console
3. Intenta hacer login o cargar productos
4. Verifica que las peticiones vayan a Railway (sin errores CORS)

---

## 🎯 Resultado Final

```
Frontend (Cloudflare Pages)  →  Backend (Railway)  →  MySQL (Railway)
https://app.pages.dev       →  https://backend.up  →  Internal DB
```

**Auto-deploy:** Push a `main` → Cloudflare y Railway redesplegan automáticamente.

---

## 📚 Documentación Completa

- [DEPLOY_CLOUDFLARE.md](DEPLOY_CLOUDFLARE.md) - Guía detallada con troubleshooting

---

## 🆘 Problemas Comunes

### CORS Error
```bash
# En Railway > Variables
CORS__ALLOWEDORIGINS__0=https://tu-dominio.pages.dev
```

### Frontend no encuentra backend
```bash
# Verifica en Cloudflare > Settings > Environment variables
VITE_API_URL=https://tu-backend.up.railway.app
```

### Build falla
```bash
# Verifica el build command
cd CornerApp/frontend && npm install && npm run build
```

---

**¡Listo! Tu frontend estará en Cloudflare comunicándose con Railway.** 🎉
