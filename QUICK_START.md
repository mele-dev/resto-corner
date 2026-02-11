# 🚀 Guía Rápida de Deploy

## Opción 1: Railway (RECOMENDADO - Más Fácil)

### ⏱️ Tiempo estimado: 10 minutos

1. **Crear cuenta en Railway**
   - Ve a [railway.app](https://railway.app)
   - Conecta tu GitHub

2. **Crear proyecto**
   - New Project → Deploy from GitHub repo
   - Selecciona tu repositorio

3. **Configurar Root Directory y Dockerfile**
   - Settings → Build & Deploy
   - Root Directory: `CornerApp/backend-csharp`
   - Dockerfile Path: `CornerApp.API/Dockerfile`

4. **Agregar MySQL**
   - + New → Database → Add MySQL

5. **Configurar Variables de Entorno**
   - Ve a tu servicio API → Variables
   - Copia los valores de ejemplo de `.env.railway.example`
   - Variables MÍNIMAS requeridas:
     ```
     CONNECTION_STRING=Server=mysql.railway.internal;Port=3306;Database=railway;User=root;Password=XXXXX;SslMode=None;
     JWT_SECRET_KEY=clave-de-al-menos-32-caracteres-aqui
     ASPNETCORE_URLS=http://+:8080
     ASPNETCORE_ENVIRONMENT=Production
     EnableSwagger=true
     ```

6. **Obtener URL**
   - Settings → Networking → Generate Domain
   - Tu URL será algo como: `https://tuapp.up.railway.app`

7. **Verificar**
   - Abre: `https://tuapp.up.railway.app/health`
   - Abre: `https://tuapp.up.railway.app/swagger`

**✅ LISTO! Auto-deploy configurado en push a main**

---

## Opción 2: Render

### ⏱️ Tiempo estimado: 15 minutos

1. **Crear cuenta en Render**
   - Ve a [render.com](https://render.com)
   - Conecta tu GitHub

2. **Crear Web Service**
   - Dashboard → New + → Web Service
   - Conecta tu repositorio

3. **Configurar Build**
   - Root Directory: `CornerApp/backend-csharp`
   - Runtime: Docker
   - Dockerfile Path: `CornerApp.API/Dockerfile` (relativo al Root Directory)

4. **Nota sobre MySQL**
   - ⚠️ Render NO incluye MySQL gratis
   - Opciones:
     - Usar PostgreSQL de Render (gratis, pero necesitas cambiar el código)
     - Usar MySQL externo:
       - [Aiven](https://aiven.io) (free tier)
       - [PlanetScale](https://planetscale.com) (free tier)
       - [Railway](https://railway.app) MySQL standalone

5. **Configurar Variables de Entorno**
   - Environment → Add Environment Variable
   - Variables MÍNIMAS:
     ```
     CONNECTION_STRING=tu-connection-string-aqui
     JWT_SECRET_KEY=clave-de-al-menos-32-caracteres
     ASPNETCORE_URLS=http://+:10000
     ASPNETCORE_ENVIRONMENT=Production
     EnableSwagger=true
     ```
   - ⚠️ IMPORTANTE: Render usa puerto 10000 por defecto

6. **Deploy**
   - Render automáticamente hará build y deploy
   - Tu URL será: `https://tuapp.onrender.com`

**✅ Auto-deploy configurado en push a main**

---

## Opción 3: Fly.io (Avanzado)

### ⏱️ Tiempo estimado: 20-30 minutos

1. **Instalar Fly CLI**
   ```bash
   # macOS
   brew install flyctl
   
   # O con curl
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login y crear app**
   ```bash
   cd CornerApp/backend-csharp/CornerApp.API
   fly auth login
   fly launch --no-deploy
   ```

3. **Configurar fly.toml**
   - Fly generará automáticamente un `fly.toml`
   - Verifica que el puerto sea 8080

4. **Agregar MySQL**
   - Opción A: Usar PlanetScale (más fácil)
   - Opción B: Fly Postgres (gratis pero es PostgreSQL)

5. **Configurar Secretos**
   ```bash
   fly secrets set CONNECTION_STRING="tu-connection-string"
   fly secrets set JWT_SECRET_KEY="tu-clave-secreta"
   fly secrets set ASPNETCORE_ENVIRONMENT="Production"
   ```

6. **Deploy**
   ```bash
   fly deploy
   ```

7. **Auto-deploy con GitHub Actions**
   - Fly puede configurar GitHub Actions automáticamente
   - Sigue las instrucciones en la documentación de Fly

---

## 📊 Comparación Rápida

| Característica | Railway | Render | Fly.io |
|---------------|---------|---------|--------|
| Facilidad | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| MySQL incluido | ✅ Sí | ❌ No | ❌ No |
| Free tier | $5 crédito | 750h/mes | 3 VMs |
| Auto-deploy | ✅ Sí | ✅ Sí | ⚙️ Manual* |
| Dominio custom | ✅ Sí | ✅ Sí | ✅ Sí |
| Configuración | 10 min | 15 min | 30 min |

*Fly.io requiere configurar GitHub Actions manualmente para auto-deploy

---

## 🎯 Mi Recomendación

**Usa Railway** porque:
- ✅ Es la más rápida de configurar (literalmente 10 minutos)
- ✅ MySQL incluido (no necesitas servicio externo)
- ✅ Auto-deploy funciona out-of-the-box
- ✅ Dashboard intuitivo
- ✅ Logs en tiempo real fáciles de ver
- ✅ $5 de crédito gratis es suficiente para empezar

**Cuando escalar:**
- Si necesitas más control: Fly.io
- Si necesitas más estabilidad empresarial: Azure App Service
- Si tu app crece mucho: Kubernetes (GKE, EKS, AKS)

---

## 🆘 ¿Problemas?

### El build falla
- Verifica que el Root Directory esté correcto
- Revisa los logs de build en el dashboard
- Asegúrate de que el Dockerfile esté en el Root Directory

### No se conecta a MySQL
- Verifica el CONNECTION_STRING
- En Railway, usa `mysql.railway.internal` como host
- Verifica que el puerto sea 3306

### JWT Error
- Asegúrate de que JWT_SECRET_KEY tenga al menos 32 caracteres

### Timeout o 502 Error
- Verifica que el puerto en ASPNETCORE_URLS coincida con el puerto expuesto
- Railway: 8080
- Render: 10000

---

## 📚 Documentación Completa

- Railway: Ver `DEPLOY_RAILWAY.md`
- Variables de entorno: Ver `.env.railway.example` o `.env.render.example`

---

## 🚀 Siguiente Paso

Una vez deployado el backend:
1. Guarda la URL de tu API
2. Actualiza el frontend para usar esta URL
3. Configura CORS en las variables de entorno para permitir tu frontend
