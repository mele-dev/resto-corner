# Guía de Despliegue en Render

## ⚠️ Importante: Render NO soporta docker-compose

Render **NO ejecuta docker-compose**. Cada servicio debe desplegarse por separado usando Dockerfiles individuales.

## 📋 Arquitectura en Render

En Render necesitas crear los siguientes servicios:

1. **MySQL** → Servicio gestionado de Render (MySQL)
2. **Redis** → Servicio gestionado de Render (Redis)
3. **RabbitMQ** → Servicio Web con Docker (opcional, si lo necesitas)
4. **Backend (.NET)** → Servicio Web con Docker
5. **Frontend (React)** → Servicio Web con Docker

---

## 🚀 Pasos para Desplegar

### 1. Preparar el Repositorio

Asegúrate de que tu código esté en GitHub, GitLab o Bitbucket.

### 2. Crear Servicios Gestionados (Bases de Datos)

#### MySQL
1. En Render Dashboard → **New** → **PostgreSQL** (o busca MySQL si está disponible)
2. Si solo hay PostgreSQL disponible, puedes usarlo cambiando el connection string
3. O crea un **Private Service** con MySQL usando Docker
4. Guarda las credenciales de conexión

#### Redis
1. En Render Dashboard → **New** → **Redis**
2. Guarda la URL de conexión (formato: `redis://...`)

### 3. Desplegar Backend (.NET)

1. **New** → **Web Service**
2. Conecta tu repositorio
3. Configuración:
   - **Name**: `cornerapp-backend`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `backend-csharp/CornerApp.API/Dockerfile`
   - **Docker Context**: `backend-csharp`
   - **Build Command**: (dejar vacío, Render usa el Dockerfile)
   - **Start Command**: (dejar vacío, Render usa el Dockerfile)

4. **Variables de Entorno** (Environment Variables):
   ```
   ASPNETCORE_ENVIRONMENT=Production
   ASPNETCORE_URLS=http://+:${PORT}
   ConnectionStrings__DefaultConnection=Server=<MYSQL_HOST>;Port=3306;Database=<DB_NAME>;User=<DB_USER>;Password=<DB_PASSWORD>;SslMode=Required;Connection Timeout=30;
   ConnectionStrings__Redis=<REDIS_URL>
   Redis__InstanceName=CornerApp:
   Redis__Enabled=true
   RabbitMQ__Enabled=true
   RabbitMQ__HostName=<RABBITMQ_HOST>
   RabbitMQ__Port=5672
   RabbitMQ__UserName=<RABBITMQ_USER>
   RabbitMQ__Password=<RABBITMQ_PASS>
   JWT_SECRET_KEY=<TU_SECRET_KEY_MUY_LARGO>
   JWT_ISSUER=CornerApp
   JWT_AUDIENCE=CornerApp
   Cors__AllowedOrigins__0=https://tu-frontend.onrender.com
   EnableSwagger=false
   ```

   ⚠️ **IMPORTANTE**: 
   - Render inyecta la variable `PORT` automáticamente
   - Configura `ASPNETCORE_URLS=http://+:${PORT}` para que el backend escuche en el puerto correcto
   - El Dockerfile ya está configurado para usar PORT automáticamente

5. **Health Check Path**: `/health`

### 4. Desplegar Frontend (React)

1. **New** → **Web Service**
2. Conecta tu repositorio
3. Configuración:
   - **Name**: `cornerapp-frontend`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `frontend/Dockerfile`
   - **Docker Context**: `frontend`
   - **Build Command**: (dejar vacío)
   - **Start Command**: (dejar vacío)

4. **Variables de Entorno**:
   ```
   VITE_API_URL=https://cornerapp-backend.onrender.com
   ```

5. **Health Check Path**: `/nginx-health` (si está configurado)

### 5. Desplegar RabbitMQ (Opcional)

Si necesitas RabbitMQ:

1. **New** → **Web Service**
2. Configuración:
   - **Name**: `cornerapp-rabbitmq`
   - **Environment**: `Docker`
   - **Dockerfile Path**: (crear uno nuevo, ver abajo)
   - O usar imagen directa: `rabbitmq:3-management-alpine`

---

## 🔧 Ajustes Necesarios en los Dockerfiles

### Backend: Ajustar para Render PORT

Render inyecta la variable `PORT` automáticamente. Tu backend debe usarla:

**Problema actual**: El Dockerfile usa `EXPOSE 8080` y `ASPNETCORE_URLS=http://+:8080`

**Solución**: Render inyecta `PORT`, pero tu app debe escucharlo. Asegúrate de que tu `Program.cs` o configuración use `PORT` si está disponible:

```csharp
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://+:{port}");
```

O simplemente usa:
```csharp
builder.WebHost.UseUrls($"http://+:{Environment.GetEnvironmentVariable("PORT") ?? "8080"}");
```

### Frontend: Ajustar Dockerfile para Render

El Dockerfile del frontend está bien, pero asegúrate de que:
- El build se hace correctamente con `VITE_API_URL`
- Nginx está configurado para escuchar en el puerto que Render asigne (normalmente 80, que Render mapea automáticamente)

---

## 📝 Archivo render.yaml (Opcional - Blueprint)

### ¿Qué es un Blueprint?

Un **Blueprint** es un archivo `render.yaml` que define **todos tus servicios en código**. En lugar de crear cada servicio manualmente en el dashboard de Render (hacer clic, llenar formularios, etc.), defines todo en un archivo YAML y Render crea todos los servicios automáticamente.

### Ventajas de usar render.yaml:

✅ **Automatización**: Un solo clic crea todos los servicios  
✅ **Versionado**: El archivo está en tu repositorio Git  
✅ **Reproducible**: Puedes recrear todo el stack fácilmente  
✅ **Menos errores**: No olvidas configurar variables de entorno  
✅ **Infraestructura como código**: Todo está documentado en código  

### Método Manual vs Blueprint:

**Método Manual** (lo que expliqué arriba):
1. Ir a Render Dashboard
2. Click en "New" → "Web Service"
3. Llenar formulario (nombre, Dockerfile path, etc.)
4. Configurar variables de entorno una por una
5. Repetir para cada servicio (backend, frontend, MySQL, Redis...)
6. ⏱️ Tiempo: ~15-20 minutos

**Método Blueprint** (con render.yaml):
1. Crear archivo `render.yaml` en la raíz del proyecto
2. Ir a Render Dashboard → "New" → "Blueprint"
3. Conectar repositorio
4. Render lee el archivo y crea TODO automáticamente
5. ⏱️ Tiempo: ~2 minutos

### Ejemplo de render.yaml:

Puedes crear un archivo `render.yaml` en la raíz para definir todos los servicios:

```yaml
services:
  - type: web
    name: cornerapp-backend
    env: docker
    dockerfilePath: ./backend-csharp/CornerApp.API/Dockerfile
    dockerContext: ./backend-csharp
    envVars:
      - key: ASPNETCORE_ENVIRONMENT
        value: Production
      - key: ASPNETCORE_URLS
        value: http://+:${PORT}
      - key: ConnectionStrings__DefaultConnection
        fromDatabase:
          name: cornerapp-mysql
          property: connectionString
      - key: ConnectionStrings__Redis
        fromService:
          type: redis
          name: cornerapp-redis
          property: connectionString

  - type: web
    name: cornerapp-frontend
    env: docker
    dockerfilePath: ./frontend/Dockerfile
    dockerContext: ./frontend
    envVars:
      - key: VITE_API_URL
        value: https://cornerapp-backend.onrender.com

databases:
  - name: cornerapp-mysql
    databaseName: CornerAppDb
    user: cornerapp_user
    plan: starter

  - name: cornerapp-redis
    plan: starter
```

### Cómo usar el render.yaml:

1. **El archivo ya está creado** en la raíz del proyecto: `render.yaml`

2. **Sube el archivo a tu repositorio Git** (si aún no lo has hecho):
   ```bash
   git add render.yaml
   git commit -m "Agregar Render Blueprint"
   git push
   ```

3. **En Render Dashboard**:
   - Click en **"New"** → **"Blueprint"**
   - Conecta tu repositorio (GitHub, GitLab o Bitbucket)
   - Render detectará automáticamente el archivo `render.yaml`
   - Click en **"Apply"**

4. **Render creará automáticamente**:
   - ✅ Servicio Backend (cornerapp-backend)
   - ✅ Servicio Frontend (cornerapp-frontend)
   - ✅ Base de datos MySQL (cornerapp-mysql)
   - ✅ Base de datos Redis (cornerapp-redis)
   - ✅ Todas las variables de entorno configuradas
   - ✅ Conexiones entre servicios

5. **Después del despliegue**:
   - Actualiza `Cors__AllowedOrigins__0` en el backend con la URL real del frontend
   - Verifica que `VITE_API_URL` en el frontend apunte al backend correcto
   - Cambia `JWT_SECRET_KEY` por una clave segura (Render la genera automáticamente, pero puedes cambiarla)

### ⚠️ Ajustes necesarios después del despliegue:

1. **CORS**: Ve al servicio backend → Environment → Actualiza `Cors__AllowedOrigins__0` con la URL real del frontend
2. **VITE_API_URL**: Verifica que el frontend tenga la URL correcta del backend
3. **RabbitMQ**: Si lo necesitas, crea un servicio web adicional (Render no ofrece RabbitMQ gestionado)

---

## ⚠️ Problemas Comunes y Soluciones

### 1. Backend no escucha en el puerto correcto

**Error**: `Connection refused` o el servicio no inicia

**Solución**: 
- Asegúrate de que la variable de entorno `ASPNETCORE_URLS=http://+:${PORT}` esté configurada en Render
- El Dockerfile ya está configurado para usar PORT automáticamente
- ASP.NET Core leerá PORT automáticamente si ASPNETCORE_URLS incluye ${PORT}

### 2. Frontend no puede conectar con Backend

**Error**: CORS o conexión rechazada

**Solución**: 
- Configura CORS en el backend con la URL del frontend
- Usa HTTPS en las URLs (Render usa HTTPS automáticamente)
- Verifica que `VITE_API_URL` esté correctamente configurada

### 3. MySQL Connection String

Render puede usar PostgreSQL en lugar de MySQL. Si es así:
- Cambia el connection string a PostgreSQL
- O usa un servicio privado con MySQL

### 4. RabbitMQ no disponible

Si Render no ofrece RabbitMQ como servicio gestionado:
- Despliega RabbitMQ como un servicio web adicional
- O desactívalo si no es crítico: `RabbitMQ__Enabled=false`

---

## 🔐 Variables de Entorno Importantes

### Backend
- `PORT` - Render lo inyecta automáticamente
- `ConnectionStrings__DefaultConnection` - Desde servicio MySQL
- `ConnectionStrings__Redis` - Desde servicio Redis
- `JWT_SECRET_KEY` - Genera uno seguro (mínimo 32 caracteres)
- `Cors__AllowedOrigins__0` - URL de tu frontend en Render

### Frontend
- `VITE_API_URL` - URL completa del backend (con https://)

---

## 📊 Monitoreo y Logs

- **Logs**: Render Dashboard → Tu servicio → **Logs**
- **Health Checks**: Render verifica automáticamente `/health` (backend) y `/nginx-health` (frontend)
- **Métricas**: Disponibles en el dashboard de cada servicio

---

## 💰 Costos

- **Servicios Web**: Gratis con limitaciones (se duermen después de 15 min de inactividad)
- **Bases de Datos**: MySQL/PostgreSQL Starter desde $7/mes
- **Redis**: Starter desde $7/mes

Para producción, considera planes pagos para evitar que los servicios se duerman.

---

## ✅ Checklist de Despliegue

- [ ] Repositorio conectado a Render
- [ ] Servicio MySQL/PostgreSQL creado
- [ ] Servicio Redis creado
- [ ] Backend desplegado con variables de entorno correctas
- [ ] Frontend desplegado con `VITE_API_URL` apuntando al backend
- [ ] CORS configurado en backend con URL del frontend
- [ ] Health checks funcionando
- [ ] URLs de producción guardadas
- [ ] Variables de entorno sensibles configuradas (JWT_SECRET_KEY, etc.)

---

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs en Render Dashboard
2. Verifica que los health checks respondan
3. Confirma que las variables de entorno estén correctas
4. Verifica que los Dockerfiles estén en las rutas correctas
