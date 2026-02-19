# 🆓 Guía de Despliegue 100% Gratuito

Esta guía te muestra cómo levantar tu aplicación **completamente gratis** usando servicios gratuitos.

---

## 🎯 Opción 1: Railway (Recomendado - Todo Gratis)

Railway ofrece un plan gratuito generoso que incluye:
- ✅ Servicios web gratis (backend y frontend)
- ✅ MySQL/PostgreSQL gratis (500 MB)
- ✅ Redis gratis (25 MB)
- ✅ No se duermen los servicios
- ✅ $5 de crédito gratis al mes

### Pasos para Railway:

1. **Crear cuenta en Railway**: https://railway.app
2. **Conectar repositorio** desde GitHub
3. **Crear servicios**:
   - Backend (.NET) → New → GitHub Repo → Seleccionar Dockerfile
   - Frontend (React) → New → GitHub Repo → Seleccionar Dockerfile
   - MySQL → New → Database → MySQL
   - Redis → New → Database → Redis

4. **Configurar variables de entorno** en cada servicio

---

## 🎯 Opción 2: Render + Bases de Datos Gratuitas Externas

### Render (Gratis):
- ✅ Backend y Frontend gratis
- ⚠️ Se duermen después de 15 min de inactividad
- ⚠️ Bases de datos cuestan $7/mes cada una

### Bases de Datos Gratuitas Externas:

#### MySQL Gratuito:
1. **PlanetScale** (https://planetscale.com)
   - MySQL gratis
   - 1 base de datos gratis
   - 1 GB de almacenamiento
   - Sin límite de requests

2. **Aiven** (https://aiven.io)
   - MySQL gratis (trial)
   - PostgreSQL gratis (trial)

#### Redis Gratuito:
1. **Upstash** (https://upstash.com)
   - Redis gratis
   - 10,000 comandos/día
   - Sin límite de tiempo

2. **Redis Cloud** (https://redis.com/try-free/)
   - 30 MB gratis
   - Sin expiración

---

## 🎯 Opción 3: Supabase (PostgreSQL Gratuito)

Si puedes cambiar de MySQL a PostgreSQL:

1. **Supabase** (https://supabase.com)
   - PostgreSQL gratis
   - 500 MB de almacenamiento
   - 2 GB de ancho de banda
   - API REST automática

2. **Render** para backend y frontend (gratis)

---

## 🎯 Opción 4: Fly.io (Todo Gratiso)

Fly.io ofrece:
- ✅ Servicios web gratis
- ✅ Bases de datos gratis (con límites)
- ✅ No se duermen
- ✅ 3 VMs compartidas gratis

---

## 📋 Comparación Rápida

| Servicio | Backend/Frontend | MySQL | Redis | Se Duerme | Mejor Para |
|----------|------------------|-------|-------|----------|------------|
| **Railway** | ✅ Gratis | ✅ Gratis | ✅ Gratis | ❌ No | **Recomendado** |
| **Render** | ✅ Gratis | ❌ $7/mes | ❌ $7/mes | ⚠️ Sí (15 min) | Solo apps web |
| **Fly.io** | ✅ Gratis | ✅ Gratis | ✅ Gratis | ❌ No | Apps pequeñas |
| **PlanetScale** | ❌ No | ✅ Gratis | ❌ No | - | Solo MySQL |
| **Upstash** | ❌ No | ❌ No | ✅ Gratis | - | Solo Redis |

---

## 🚀 Guía Paso a Paso: Railway (La Más Fácil)

### 1. Crear Cuenta en Railway

1. Ve a https://railway.app
2. Click en "Start a New Project"
3. Conecta tu cuenta de GitHub
4. Selecciona tu repositorio `Restaurante`

### 2. Desplegar Backend

1. Click en "New" → "GitHub Repo"
2. Selecciona tu repositorio
3. Railway detectará automáticamente el Dockerfile
4. Si no lo detecta:
   - **Root Directory**: `CornerApp/backend-csharp`
   - **Dockerfile Path**: `CornerApp.API/Dockerfile`

5. **Variables de Entorno**:
   ```
   ASPNETCORE_ENVIRONMENT=Production
   ASPNETCORE_URLS=http://+:${PORT}
   ConnectionStrings__DefaultConnection=${MYSQL_URL}  # Se configurará después
   ConnectionStrings__Redis=${REDIS_URL}  # Se configurará después
   Redis__InstanceName=CornerApp:
   Redis__Enabled=true
   RabbitMQ__Enabled=false
   JWT_SECRET_KEY=TU_CLAVE_SECRETA_MUY_LARGA_AQUI
   JWT_ISSUER=CornerApp
   JWT_AUDIENCE=CornerApp
   EnableSwagger=false
   ```

### 3. Crear Base de Datos MySQL

1. En Railway Dashboard → "New" → "Database" → "MySQL"
2. Railway creará automáticamente:
   - Base de datos MySQL
   - Variable de entorno `MYSQL_URL` con el connection string
3. **Copiar el connection string** y actualizarlo en el backend:
   - Formato: `mysql://user:password@host:port/database`
   - Necesitas convertirlo al formato de .NET:
   ```
   Server=host;Port=port;Database=database;User=user;Password=password;SslMode=Required;
   ```

### 4. Crear Redis

1. En Railway Dashboard → "New" → "Database" → "Redis"
2. Railway creará automáticamente la variable `REDIS_URL`
3. El backend ya está configurado para usarla

### 5. Desplegar Frontend

1. Click en "New" → "GitHub Repo"
2. Selecciona tu repositorio
3. **Root Directory**: `CornerApp/frontend`
4. **Dockerfile Path**: `Dockerfile`
5. **Variables de Entorno**:
   ```
   VITE_API_URL=https://tu-backend.railway.app
   ```

### 6. Conectar Servicios

Railway permite conectar servicios automáticamente:
- En el servicio backend → "Variables" → "Reference"
- Selecciona `MYSQL_URL` y `REDIS_URL` de las bases de datos
- Railway los inyectará automáticamente

---

## 🔧 Ajustar Connection String para Railway

Railway proporciona `MYSQL_URL` en formato URI. Necesitas convertirlo:

**Formato Railway**: `mysql://user:password@host:port/database`

**Formato .NET**: `Server=host;Port=port;Database=database;User=user;Password=password;SslMode=Required;`

Puedes crear un script o usar esta lógica en tu backend para convertir automáticamente.

---

## 🎯 Opción Alternativa: Render + PlanetScale + Upstash

Si prefieres Render para los servicios web:

### 1. Render (Backend y Frontend)
- Crear servicios web manualmente (sin Blueprint)
- Plan Starter (gratis)
- Se duermen después de 15 min

### 2. PlanetScale (MySQL Gratuito)
1. Crear cuenta en https://planetscale.com
2. Crear base de datos
3. Obtener connection string
4. Configurarlo en Render como variable de entorno

### 3. Upstash (Redis Gratuito)
1. Crear cuenta en https://upstash.com
2. Crear base de datos Redis
3. Obtener connection string
4. Configurarlo en Render

---

## 💡 Recomendación Final

**Para empezar gratis y fácil**: Usa **Railway**
- Todo en un solo lugar
- Configuración automática
- No se duermen los servicios
- $5 de crédito gratis al mes

**Si ya estás usando Render**: Combina Render + PlanetScale + Upstash
- Render para servicios web (gratis)
- PlanetScale para MySQL (gratis)
- Upstash para Redis (gratis)

---

## ⚠️ Limitaciones de Planes Gratuitos

### Railway:
- 500 MB MySQL/PostgreSQL
- 25 MB Redis
- $5 crédito/mes (se consume con uso)
- Después del crédito, puede costar ~$5-10/mes

### Render:
- Servicios se duermen después de 15 min
- Bases de datos cuestan $7/mes cada una

### PlanetScale:
- 1 base de datos gratis
- 1 GB almacenamiento
- Sin límite de requests

### Upstash:
- 10,000 comandos Redis/día
- Sin límite de tiempo

---

## 📝 Checklist de Despliegue Gratuito

- [ ] Elegir plataforma (Railway recomendado)
- [ ] Crear cuenta
- [ ] Conectar repositorio GitHub
- [ ] Desplegar backend
- [ ] Crear base de datos MySQL (Railway o PlanetScale)
- [ ] Crear Redis (Railway o Upstash)
- [ ] Configurar variables de entorno
- [ ] Desplegar frontend
- [ ] Probar la aplicación
- [ ] Configurar CORS con URLs de producción

---

## 🆘 ¿Necesitas Ayuda?

Si tienes problemas con alguna opción, puedo ayudarte a:
1. Configurar Railway paso a paso
2. Ajustar el connection string para .NET
3. Configurar Render + bases de datos externas
4. Migrar de MySQL a PostgreSQL si es necesario
