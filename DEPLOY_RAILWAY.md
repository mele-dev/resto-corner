# 🚀 Deploy del Backend en Railway

## Paso 1: Preparar el proyecto (HECHO ✅)

Tu proyecto ya está listo con:
- ✅ Dockerfile configurado
- ✅ .dockerignore configurado
- ✅ Variables de entorno soportadas

## Paso 2: Crear cuenta en Railway

1. Ve a [railway.app](https://railway.app)
2. Haz clic en "Start a New Project"
3. Conecta tu cuenta de GitHub

## Paso 3: Crear nuevo proyecto

1. Haz clic en "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Busca y selecciona tu repositorio `Restaurante`
4. Railway detectará automáticamente el Dockerfile

## Paso 4: Configurar el Root Directory y Dockerfile

Como tu backend está en una subcarpeta, necesitas configurar el Root Directory:

1. En el proyecto de Railway, haz clic en tu servicio
2. Ve a **Settings**
3. En **Build & Deploy**, busca las siguientes configuraciones:
   - **Root Directory**: `CornerApp/backend-csharp`
   - **Dockerfile Path**: `CornerApp.API/Dockerfile`
4. Guarda los cambios

**NOTA**: El Root Directory es `backend-csharp` (no `CornerApp.API`) porque el Dockerfile necesita acceso a ambas carpetas para el build.

## Paso 5: Agregar MySQL

1. En el dashboard del proyecto, haz clic en "+ New"
2. Selecciona "Database"
3. Elige "Add MySQL"
4. Railway creará automáticamente una base de datos MySQL

## Paso 6: Configurar Variables de Entorno

1. En tu servicio de la API, ve a la pestaña **Variables**
2. Agrega las siguientes variables:

### Variables REQUERIDAS:

```bash
# Connection String (Railway te da esto automáticamente)
# Ve al servicio MySQL -> Variables -> Busca MYSQL_URL
# Cópiala y modifícala para que tenga este formato:
CONNECTION_STRING=Server=mysql.railway.internal;Port=3306;Database=railway;User=root;Password=TU_PASSWORD;SslMode=None;AllowPublicKeyRetrieval=true;Connection Timeout=30;

# JWT Secret (genera una clave segura)
JWT_SECRET_KEY=tu-clave-super-secreta-de-al-menos-32-caracteres-aqui

# Issuer y Audience
JWT_ISSUER=CornerApp
JWT_AUDIENCE=CornerApp

# Habilitar Swagger (opcional, útil para ver la API)
EnableSwagger=true
```

### Variables OPCIONALES (pero recomendadas):

```bash
# CORS - Agrega tus dominios del frontend cuando los tengas
CORS__ALLOWEDORIGINS__0=https://tu-frontend.railway.app
CORS__ALLOWEDORIGINS__1=http://localhost:3000

# Environment
ASPNETCORE_ENVIRONMENT=Production

# Configuración de Kestrel
ASPNETCORE_URLS=http://+:8080
```

## Paso 7: Conectar MySQL con la API

Para conectar tu API con MySQL en Railway:

1. Ve al servicio de MySQL
2. En la pestaña **Variables**, busca los valores:
   - `MYSQL_HOST` (o `MYSQLHOST`)
   - `MYSQL_PORT` (o `MYSQLPORT`)
   - `MYSQL_DATABASE` (o `MYSQLDATABASE`)
   - `MYSQL_USER` (o `MYSQLUSER`)
   - `MYSQL_PASSWORD` (o `MYSQLPASSWORD`)

3. Construye tu CONNECTION_STRING:
   ```
   Server=MYSQL_HOST;Port=MYSQL_PORT;Database=MYSQL_DATABASE;User=MYSQL_USER;Password=MYSQL_PASSWORD;SslMode=None;AllowPublicKeyRetrieval=true;Connection Timeout=30;
   ```

O más fácil, Railway te da una variable `MYSQL_URL` que puedes usar directamente, pero necesitas convertirla al formato de Entity Framework:

Si `MYSQL_URL` es algo como:
```
mysql://root:password@hostname:3306/railway
```

Conviértelo a:
```
Server=hostname;Port=3306;Database=railway;User=root;Password=password;SslMode=None;AllowPublicKeyRetrieval=true;Connection Timeout=30;
```

## Paso 8: Deploy Automático en Push

1. En **Settings** del servicio
2. Busca **Deployment Triggers**
3. Asegúrate de que esté habilitado **Watch Paths** (opcional)
4. Branch: `main` (o el branch que uses)

Railway automáticamente detectará cambios en tu branch `main` y hará redeploy.

## Paso 9: Obtener tu URL

1. Una vez deployado, ve a **Settings**
2. En **Networking**, busca **Public Networking**
3. Haz clic en **Generate Domain**
4. Railway te dará una URL como: `https://tu-app-production.up.railway.app`

## Paso 10: Configurar Dominio Custom (Opcional)

1. Ve a **Settings** > **Networking** > **Custom Domain**
2. Haz clic en **+ Add Custom Domain**
3. Ingresa tu dominio (ejemplo: `api.tudominio.com`)
4. Railway te dará los registros DNS que necesitas agregar en tu proveedor de dominio
5. Agrega un registro CNAME apuntando a Railway

## ✅ Verificar que funciona

1. Accede a: `https://tu-url.up.railway.app/health`
   - Debería responder con status 200

2. Accede a: `https://tu-url.up.railway.app/swagger`
   - Deberías ver la documentación de tu API

## 🔄 Auto-deploy en Push

Una vez configurado, cada vez que hagas `git push` a la rama `main`, Railway automáticamente:
1. Detecta el cambio
2. Hace build de tu Dockerfile
3. Despliega la nueva versión
4. Actualiza la URL

## 💡 Tips Adicionales

### Ver logs en tiempo real:
```bash
# En el dashboard de Railway, ve al servicio y haz clic en "View Logs"
```

### Costo estimado:
- Free tier: $5 de crédito gratis por mes
- Después: ~$5-10/mes para una app pequeña
- MySQL: incluido en el plan

### Agregar Redis (opcional):
Si quieres usar cache con Redis:
1. Haz clic en "+ New" > "Database" > "Redis"
2. Agrega la variable `Redis__ConnectionString` con el valor de `REDIS_URL`

## 🚨 Troubleshooting

### Error: "Connection refused" al conectar a MySQL
- Asegúrate de usar el hostname interno: `mysql.railway.internal` en lugar de localhost

### Error: "JWT Secret Key no configurado"
- Verifica que `JWT_SECRET_KEY` tenga al menos 32 caracteres

### Error: "No se puede crear el esquema de base de datos"
- Verifica que el connection string esté correcto
- Revisa los logs en Railway para ver el error específico

### El health check falla
- Verifica que el puerto sea 8080
- Asegúrate de que `ASPNETCORE_URLS=http://+:8080`

## 📚 Recursos

- [Railway Docs](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway) - Soporte de la comunidad
- [Railway Status](https://status.railway.app) - Estado del servicio

---

## Alternativas a Railway

Si Railway no te convence, estas son otras opciones similares:

### 1. **Render** (muy similar a Railway)
- [render.com](https://render.com)
- Free tier con 750 horas/mes
- Auto-deploy desde GitHub
- PostgreSQL incluido (pero no MySQL gratis, necesitarías External Database)

### 2. **Fly.io**
- [fly.io](https://fly.io)
- Más complejo pero muy potente
- Free tier: 3 VMs pequeñas
- Necesitas CLI para configurar

### 3. **Azure App Service**
- [azure.microsoft.com](https://azure.microsoft.com)
- Ideal para .NET
- Free tier limitado
- Más complejo de configurar

Mi recomendación: Empieza con **Railway** porque es la más rápida de configurar (literalmente 10 minutos).
