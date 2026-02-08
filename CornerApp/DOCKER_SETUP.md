# Docker Setup – CornerApp

Guía completa para construir, levantar y desplegar CornerApp usando Docker y Docker Compose.

---

## Índice

1. [Requisitos previos](#requisitos-previos)
2. [Arquitectura de servicios](#arquitectura-de-servicios)
3. [Inicio rápido (Desarrollo)](#inicio-rápido-desarrollo)
4. [Despliegue en Producción](#despliegue-en-producción)
5. [Comandos útiles](#comandos-útiles)
6. [Variables de entorno](#variables-de-entorno)
7. [Decisiones de configuración](#decisiones-de-configuración)
8. [Solución de problemas](#solución-de-problemas)

---

## Requisitos previos

| Herramienta        | Versión mínima | Verificar                    |
|--------------------|----------------|------------------------------|
| Docker Engine      | 24.0+          | `docker --version`           |
| Docker Compose     | 2.20+          | `docker compose version`     |
| Espacio en disco   | ~3 GB          | Para imágenes y volúmenes    |
| RAM disponible     | ~2 GB          | MySQL necesita ~512 MB       |

---

## Arquitectura de servicios

```
┌─────────────────────────────────────────────────────────────┐
│                      Docker Network                         │
│                   (cornerapp-network)                       │
│                                                             │
│  ┌──────────┐     ┌──────────┐     ┌──────────────────┐    │
│  │ Frontend  │────▶│ Backend  │────▶│     MySQL 8.0    │    │
│  │ (Nginx)   │     │ (.NET 8) │     │     :3306        │    │
│  │ :80       │     │ :8080    │     └──────────────────┘    │
│  └──────────┘     └────┬─────┘                              │
│                        │                                    │
│                   ┌────┴────┐                               │
│              ┌────┴───┐ ┌───┴────────┐                      │
│              │ Redis  │ │ RabbitMQ   │                      │
│              │ :6379  │ │ :5672      │                      │
│              └────────┘ │ :15672 (UI)│                      │
│                         └────────────┘                      │
└─────────────────────────────────────────────────────────────┘

Punto de entrada: http://localhost (puerto 80)
```

**Flujo de peticiones:**
1. El usuario accede al Frontend (Nginx) en el puerto 80
2. Nginx sirve los archivos estáticos del panel admin (React)
3. Las peticiones a `/api/*`, `/admin/api/*`, `/hubs/*` e `/images/*` son proxeadas al Backend
4. El Backend se conecta a MySQL, Redis y RabbitMQ internamente

---

## Inicio rápido (Desarrollo)

### 1. Configurar variables de entorno

```bash
cd CornerApp
cp .env.example .env
```

Para desarrollo, los valores por defecto del `.env.example` funcionan directamente. No necesitás cambiar nada.

### 2. Construir y levantar

```bash
docker compose up -d --build
```

Este comando:
- Descarga las imágenes base (MySQL, Redis, RabbitMQ, .NET SDK, Node, Nginx)
- Construye las imágenes del backend y frontend
- Levanta todos los servicios en el orden correcto (respetando dependencias y healthchecks)
- Crea automáticamente la base de datos y todas las tablas
- Genera datos de demostración (restaurante, admin, productos, mesas)

La primera ejecución puede tardar **5-10 minutos** dependiendo de la velocidad de internet.

### 3. Verificar que todo funcione

```bash
# Ver estado de los contenedores
docker compose ps

# Ver logs en tiempo real
docker compose logs -f

# Solo logs del backend
docker compose logs -f backend
```

Esperá a que todos los servicios aparezcan como `healthy`:

```
NAME                    STATUS                  PORTS
cornerapp-mysql         Up (healthy)            0.0.0.0:3306->3306/tcp
cornerapp-redis         Up (healthy)            0.0.0.0:6379->6379/tcp
cornerapp-rabbitmq      Up (healthy)            0.0.0.0:5672->5672/tcp
cornerapp-backend       Up (healthy)            0.0.0.0:8080->8080/tcp
cornerapp-frontend      Up (healthy)            0.0.0.0:80->80/tcp
```

### 4. Acceder a la aplicación

| Servicio              | URL                                    |
|-----------------------|----------------------------------------|
| **Frontend (Admin)**  | http://localhost                        |
| **Backend API**       | http://localhost:8080                   |
| **Swagger (API docs)**| http://localhost:8080/swagger           |
| **Health Check**      | http://localhost:8080/health            |
| **RabbitMQ UI**       | http://localhost:15672 (guest/guest)    |

> **Nota:** En producción, el backend crea datos de demostración (restaurante ID 12, admin `corner/password123`, productos de ejemplo, mesas, etc.).

### 5. Detener los servicios

```bash
# Detener contenedores (preserva datos)
docker compose down

# Detener y eliminar volúmenes (BORRA datos de la base)
docker compose down -v
```

---

## Despliegue en Producción

### 1. Preparar el servidor

Requisitos del servidor:
- Docker Engine 24+ y Docker Compose v2+
- Mínimo 2 GB RAM / 2 vCPU
- Puerto 80 (o 443 si usás HTTPS con reverse proxy externo)

```bash
# Clonar el repositorio
git clone <url-del-repo> /opt/cornerapp
cd /opt/cornerapp/CornerApp
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
nano .env  # o vim .env
```

**Valores a cambiar obligatoriamente para producción:**

```env
# Contraseña segura para MySQL
MYSQL_ROOT_PASSWORD=TuContraseñ@MuySegura2024!

# Clave JWT segura y única (mínimo 32 caracteres)
JWT_SECRET_KEY=genera-una-clave-aleatoria-de-al-menos-32-caracteres

# Puerto público
FRONTEND_PORT=80

# Orígenes CORS (tu dominio real)
CORS_ORIGIN_0=https://tu-dominio.com
CORS_ORIGIN_1=https://www.tu-dominio.com

# RabbitMQ con credenciales seguras
RABBITMQ_USER=cornerapp
RABBITMQ_PASS=UnaContraseñ@Segura

# Deshabilitar Swagger en producción
ENABLE_SWAGGER=false
```

### 3. Construir y levantar

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 4. Verificar el despliegue

```bash
# Estado de los servicios
docker compose -f docker-compose.prod.yml ps

# Logs del backend
docker compose -f docker-compose.prod.yml logs -f backend

# Health check
curl http://localhost/api/health
```

### 5. Configurar HTTPS (recomendado)

Para HTTPS, se recomienda usar un reverse proxy externo como **Caddy** o **Nginx** con Let's Encrypt:

**Opción A – Caddy (más simple):**

```bash
# Instalar Caddy en el servidor
sudo apt install caddy

# Configurar /etc/caddy/Caddyfile
tu-dominio.com {
    reverse_proxy localhost:80
}

# Reiniciar Caddy (obtiene certificado SSL automáticamente)
sudo systemctl restart caddy
```

**Opción B – Nginx + Certbot:**

```bash
sudo apt install nginx certbot python3-certbot-nginx

# Configurar /etc/nginx/sites-available/cornerapp
server {
    server_name tu-dominio.com;
    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

sudo ln -s /etc/nginx/sites-available/cornerapp /etc/nginx/sites-enabled/
sudo certbot --nginx -d tu-dominio.com
sudo systemctl restart nginx
```

### 6. Actualizar la aplicación

```bash
cd /opt/cornerapp/CornerApp

# Obtener últimos cambios
git pull origin main

# Reconstruir y reiniciar (sin downtime de la DB)
docker compose -f docker-compose.prod.yml up -d --build backend frontend

# Verificar
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f backend --tail=50
```

---

## Comandos útiles

### Gestión de servicios

```bash
# Levantar todo
docker compose up -d --build

# Detener todo
docker compose down

# Reiniciar un servicio específico
docker compose restart backend

# Reconstruir solo el backend
docker compose up -d --build backend

# Ver logs en tiempo real
docker compose logs -f

# Ver logs de un servicio
docker compose logs -f backend --tail=100
```

### Base de datos (MySQL)

```bash
# Conectarse a MySQL
docker exec -it cornerapp-mysql mysql -u root -p CornerAppDb

# Backup de la base de datos
docker exec cornerapp-mysql mysqldump -u root -p'TuPassword' \
  --single-transaction CornerAppDb > backup_$(date +%Y%m%d).sql

# Restaurar un backup
docker exec -i cornerapp-mysql mysql -u root -p'TuPassword' \
  CornerAppDb < backup_20260208.sql

# Ver tablas
docker exec -it cornerapp-mysql mysql -u root -p'TuPassword' \
  -e "USE CornerAppDb; SHOW TABLES;"
```

### Monitoreo

```bash
# Estado de salud de todos los servicios
docker compose ps

# Uso de recursos
docker stats

# Inspeccionar un contenedor
docker inspect cornerapp-backend

# Ver redes
docker network inspect cornerapp_cornerapp-network
```

### Limpieza

```bash
# Eliminar contenedores y volúmenes (BORRA todos los datos)
docker compose down -v

# Eliminar imágenes locales de CornerApp
docker rmi cornerapp-backend:dev cornerapp-frontend:dev

# Limpieza general de Docker (imágenes, caché, etc.)
docker system prune -af
```

---

## Variables de entorno

| Variable              | Descripción                                         | Valor por defecto (dev)                    | Requerido en prod |
|-----------------------|-----------------------------------------------------|--------------------------------------------|:------------------:|
| `MYSQL_ROOT_PASSWORD` | Contraseña del usuario `root` de MySQL               | `Root@12345`                               | Sí                |
| `MYSQL_DATABASE`      | Nombre de la base de datos                           | `CornerAppDb`                              | No                |
| `JWT_SECRET_KEY`      | Clave secreta para tokens JWT (≥ 32 chars)           | `your-super-secret-key-min-32-char...`     | Sí                |
| `JWT_ISSUER`          | Emisor del token JWT                                 | `CornerApp`                                | No                |
| `JWT_AUDIENCE`        | Audiencia del token JWT                              | `CornerApp`                                | No                |
| `BACKEND_PORT`        | Puerto expuesto del backend                          | `8080`                                     | No                |
| `FRONTEND_PORT`       | Puerto expuesto del frontend                         | `80`                                       | No                |
| `CORS_ORIGIN_0`       | Primer origen CORS permitido                         | `http://localhost`                         | Sí                |
| `CORS_ORIGIN_1`       | Segundo origen CORS permitido                        | `http://localhost:3000`                    | No                |
| `REDIS_ENABLED`       | Habilitar Redis como cache distribuido               | `true`                                     | No                |
| `RABBITMQ_ENABLED`    | Habilitar RabbitMQ como cola de mensajes             | `true`                                     | No                |
| `RABBITMQ_USER`       | Usuario de RabbitMQ                                  | `guest`                                    | Sí (si habilitado)|
| `RABBITMQ_PASS`       | Contraseña de RabbitMQ                               | `guest`                                    | Sí (si habilitado)|
| `ENABLE_SWAGGER`      | Habilitar documentación Swagger                      | `true`                                     | No                |

---

## Decisiones de configuración

### MySQL en lugar de SQL Server

El proyecto usa **MySQL 8.0** como base de datos principal:
- **Imagen liviana:** MySQL 8.0 usa ~500 MB de RAM vs ~2 GB de SQL Server
- **Compatibilidad ARM:** Funciona nativamente en Apple Silicon (M1/M2/M3) sin emulación
- **Amplia adopción:** Amplio soporte en hosting y servicios cloud (PlanetScale, AWS RDS, etc.)
- **Gratuito:** Sin restricciones de licencia

### Nginx como reverse proxy del frontend

El frontend (React SPA) se construye como archivos estáticos y se sirve con Nginx. En lugar de exponer el backend en un puerto separado y configurar `VITE_API_URL`, **Nginx actúa como reverse proxy**: las peticiones a `/api/*`, `/admin/api/*`, `/hubs/*` e `/images/*` se reenvían automáticamente al backend.

**Ventajas:**
- No hay problemas de CORS entre frontend y backend (misma origin)
- Un solo punto de entrada (puerto 80) para toda la aplicación
- Simplifica la configuración de HTTPS (un solo certificado)

### EnsureCreated para esquema de base de datos

En el arranque, el backend usa `EnsureCreated()` de Entity Framework Core para crear automáticamente todas las tablas según el modelo. Esto significa:
- **Docker fresh start:** Un simple `docker compose up` crea todo desde cero
- **Sin migraciones:** No se necesitan archivos de migración para el setup inicial
- **Idempotente:** Si las tablas ya existen, no hace nada

Para evolución futura del esquema, se pueden generar migraciones con:
```bash
dotnet ef migrations add NombreDeMigracion --project CornerApp.API
```

### Redis y RabbitMQ

Ambos servicios están incluidos pero son **opcionales**:
- **Redis:** Mejora el rendimiento con cache distribuido. Si `Redis__Enabled=false`, el backend usa Memory Cache
- **RabbitMQ:** Permite procesamiento asíncrono de pedidos. Si `RabbitMQ__Enabled=false`, el backend usa un servicio dummy

---

## Solución de problemas

### MySQL no inicia

**Síntoma:** El contenedor `cornerapp-mysql` reinicia constantemente.

**Causas comunes:**
1. **Puerto en uso:** Otro MySQL o proceso ocupa el puerto 3306. Verificá con `lsof -i :3306`
2. **Volumen corrupto:** Eliminá el volumen: `docker compose down -v && docker compose up -d`

```bash
# Ver logs de MySQL
docker compose logs mysql
```

### El backend no conecta a la base de datos

**Síntoma:** Error `Unable to connect` o `Authentication failed` en los logs del backend.

**Soluciones:**
1. Verificá que MySQL esté healthy: `docker compose ps`
2. Verificá que la contraseña en `MYSQL_ROOT_PASSWORD` sea correcta
3. Esperá a que MySQL termine de iniciar (30-60 segundos)

```bash
# Probar conexión manualmente
docker exec -it cornerapp-mysql mysql -u root -p'TuPassword' -e "SELECT 1"
```

### El frontend no carga la API

**Síntoma:** La interfaz carga pero las peticiones a la API fallan.

**Soluciones:**
1. Verificá que el backend esté healthy: `docker compose ps`
2. Probá acceder directamente: `curl http://localhost:8080/health`
3. Revisá los logs de Nginx: `docker compose logs frontend`

### Puertos en uso

**Síntoma:** `Bind for 0.0.0.0:80: address already in use`

**Soluciones:**
1. Cambiá el puerto en `.env` (ej: `FRONTEND_PORT=8081`)
2. O detené el servicio que usa el puerto: `sudo lsof -i :80`
