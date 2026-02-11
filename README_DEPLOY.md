# 🚀 Deploy del Backend CornerApp

Este proyecto está listo para deployarse en plataformas BaaS/PaaS con auto-deploy desde GitHub.

## 📚 Documentación

- **[QUICK_START.md](QUICK_START.md)** - Guía rápida de 10 minutos para deploy en Railway (RECOMENDADO)
- **[DEPLOY_RAILWAY.md](DEPLOY_RAILWAY.md)** - Guía detallada paso a paso para Railway
- **[DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md)** - Checklist completo antes y después del deploy
- **[.env.railway.example](CornerApp/backend-csharp/.env.railway.example)** - Variables de entorno para Railway
- **[.env.render.example](CornerApp/backend-csharp/.env.render.example)** - Variables de entorno para Render

## ⚡ Quick Start (Railway)

1. **Crea una cuenta**: [railway.app](https://railway.app) y conecta GitHub
2. **Nuevo proyecto**: New Project → Deploy from GitHub repo
3. **Configuración**:
   - Root Directory: `CornerApp/backend-csharp`
   - Dockerfile Path: `CornerApp.API/Dockerfile`
4. **Agrega MySQL**: + New → Database → Add MySQL
5. **Variables de entorno** (mínimo):
   ```
   CONNECTION_STRING=Server=mysql.railway.internal;Port=3306;Database=railway;User=root;Password=XXXXX;SslMode=None;
   JWT_SECRET_KEY=clave-de-al-menos-32-caracteres
   ASPNETCORE_URLS=http://+:8080
   ASPNETCORE_ENVIRONMENT=Production
   EnableSwagger=true
   ```
6. **Genera dominio**: Settings → Generate Domain
7. **Verifica**: Abre `https://tu-url.up.railway.app/health`

**✅ Listo! Auto-deploy configurado en cada push a `main`**

## 🎯 Plataformas Soportadas

| Plataforma | Dificultad | MySQL incluido | Tiempo setup | Recomendado |
|------------|------------|----------------|--------------|-------------|
| **Railway** | ⭐ Fácil | ✅ Sí | 10 min | ✅ **SÍ** |
| Render | ⭐⭐ Media | ❌ No* | 15 min | ⚠️ Condicional |
| Fly.io | ⭐⭐⭐ Difícil | ❌ No | 30 min | ⚠️ Avanzado |

*Render requiere MySQL externo (Aiven, PlanetScale, etc.) o usar PostgreSQL

## 📋 Requisitos

- ✅ Cuenta en la plataforma (Railway/Render/Fly.io)
- ✅ Repositorio en GitHub
- ✅ MySQL (incluido en Railway, externo en otros)
- ✅ Variables de entorno configuradas

## 🔧 Tecnologías

- **Backend**: ASP.NET Core 8.0
- **Base de datos**: MySQL (Entity Framework Core)
- **Autenticación**: JWT
- **Docker**: Multi-stage build optimizado
- **Health checks**: `/health`, `/health/ready`, `/health/live`
- **Documentación**: Swagger (configurable)

## 🌐 Endpoints Principales

Una vez deployado:

- `GET /health` - Health check básico
- `GET /swagger` - Documentación interactiva (si EnableSwagger=true)
- `POST /admin/api/auth/login` - Login de administradores
- `POST /api/auth/delivery/login` - Login de repartidores
- `GET /api/products` - Listar productos
- `GET /api/categories` - Listar categorías

## 🔐 Credenciales de Demo

El sistema crea automáticamente estos usuarios en producción:

**Administrador:**
- Username: `corner`
- Password: `password123`

**Repartidor:**
- Username: `juan_delivery`
- Password: `delivery123`

**Restaurante:** ID 12 (Corner Restaurant)

⚠️ **IMPORTANTE**: Cambia estas credenciales en producción.

## 🛠️ Variables de Entorno

### Requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `CONNECTION_STRING` | Conexión a MySQL | `Server=...;Database=...` |
| `JWT_SECRET_KEY` | Clave JWT (32+ chars) | `a8f5f167f44f4964e6c998dee827110c...` |
| `ASPNETCORE_URLS` | URLs de escucha | `http://+:8080` |
| `ASPNETCORE_ENVIRONMENT` | Environment | `Production` |

### Opcionales

| Variable | Descripción | Default |
|----------|-------------|---------|
| `EnableSwagger` | Habilitar Swagger | `false` |
| `CORS__ALLOWEDORIGINS__0` | Origen CORS 1 | - |
| `JWT_ISSUER` | Emisor JWT | `CornerApp` |
| `JWT_AUDIENCE` | Audiencia JWT | `CornerApp` |

Ver archivos `.env.*.example` para lista completa.

## 📦 Estructura del Proyecto

```
Restaurante/
├── CornerApp/
│   ├── backend-csharp/
│   │   ├── CornerApp.API/           ← Código principal
│   │   │   ├── Dockerfile           ← Docker config
│   │   │   ├── Program.cs           ← Entry point
│   │   │   ├── Controllers/         ← API endpoints
│   │   │   ├── Services/            ← Business logic
│   │   │   ├── Data/                ← Database context
│   │   │   └── Models/              ← Data models
│   │   └── .env.railway.example     ← Variables ejemplo
│   └── frontend/                     ← Frontend (React Native)
├── QUICK_START.md                    ← Guía rápida ⚡
├── DEPLOY_RAILWAY.md                 ← Guía detallada Railway
├── DEPLOY_CHECKLIST.md               ← Checklist completo
└── README_DEPLOY.md                  ← Este archivo
```

## 🔄 Auto-Deploy

Una vez configurado, cada `git push` a `main`:
1. ✅ Detecta cambios automáticamente
2. ✅ Ejecuta build del Dockerfile
3. ✅ Ejecuta tests (si están configurados)
4. ✅ Despliega la nueva versión
5. ✅ Actualiza la URL automáticamente

## 🎨 Dominio Custom

Para agregar tu propio dominio:

1. Compra un dominio (Namecheap, GoDaddy, etc.)
2. En Railway/Render:
   - Settings → Networking → Custom Domain
   - Agrega tu dominio: `api.tudominio.com`
3. Configura DNS:
   - Tipo: `CNAME`
   - Nombre: `api` (o el subdominio que quieras)
   - Valor: URL proporcionada por Railway/Render
4. Espera propagación DNS (puede tomar hasta 48h, usualmente 1-2h)

## 🆘 Troubleshooting

### Build falla
```bash
# Verifica que el proyecto compile localmente
cd CornerApp/backend-csharp/CornerApp.API
dotnet build
```

### Connection refused (MySQL)
- Verifica el CONNECTION_STRING
- En Railway, usa `mysql.railway.internal` como host

### JWT Error
- Asegúrate de que JWT_SECRET_KEY tenga 32+ caracteres

### 502 Error / Timeout
- Verifica que el puerto sea correcto:
  - Railway: 8080
  - Render: 10000

Ver [DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md) para más troubleshooting.

## 📊 Monitoreo

Una vez deployado:

- **Logs en vivo**: Dashboard → View Logs
- **Métricas**: Dashboard → Metrics (CPU, RAM, requests)
- **Health checks**: `GET /health/detailed` para info completa
- **Prometheus** (opcional): `GET /metrics` si está habilitado

## 🚀 Próximos Pasos

1. ✅ Deploy del backend (esta guía)
2. 🔜 Deploy del frontend (React Native web/app)
3. 🔜 Configurar CI/CD avanzado (tests automáticos)
4. 🔜 Configurar monitoring (Sentry, LogRocket, etc.)
5. 🔜 Configurar backups automáticos de DB
6. 🔜 Agregar CDN para assets estáticos

## 💰 Costos Estimados

### Railway
- Free tier: $5 crédito/mes
- Después: ~$5-15/mes (backend + MySQL)
- Dominio custom: incluido

### Render
- Free tier: 750 horas/mes
- MySQL externo: $0-25/mes (según proveedor)
- Total: ~$10-30/mes

### Fly.io
- Free tier: 3 VMs pequeñas
- MySQL externo: $0-25/mes
- Total: ~$5-20/mes

## 📞 Soporte

- Railway: [discord.gg/railway](https://discord.gg/railway)
- Render: [render.com/docs](https://render.com/docs)
- Fly.io: [fly.io/docs](https://fly.io/docs)

## 📄 Licencia

Este proyecto es propietario de CornerApp.

---

**¿Listo para deployar?** → Empieza con [QUICK_START.md](QUICK_START.md)

**¿Necesitas más detalles?** → Lee [DEPLOY_RAILWAY.md](DEPLOY_RAILWAY.md)

**¿Quieres un checklist?** → Usa [DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md)
