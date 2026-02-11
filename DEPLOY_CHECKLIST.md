# ✅ Checklist de Deploy

Usa esta lista antes de deployar para asegurarte de que todo esté configurado correctamente.

## 📋 Pre-Deploy (Local)

- [ ] El código compila sin errores
  ```bash
  cd CornerApp/backend-csharp/CornerApp.API
  dotnet build
  ```

- [ ] Los tests pasan (si los hay)
  ```bash
  dotnet test
  ```

- [ ] El Dockerfile funciona localmente
  ```bash
  cd CornerApp/backend-csharp
  docker build -t cornerapp-api -f CornerApp.API/Dockerfile .
  docker run -p 8080:8080 -e CONNECTION_STRING="tu-connection-string" -e JWT_SECRET_KEY="test-key-32-characters-long-xyz" cornerapp-api
  ```

- [ ] El código está pusheado a GitHub
  ```bash
  git add .
  git commit -m "Preparar para deploy"
  git push origin main
  ```

## 🏗️ Configuración en Railway/Render

- [ ] **Cuenta creada** y GitHub conectado
- [ ] **Repositorio conectado** al servicio
- [ ] **Root Directory** configurado correctamente
  - Railway/Render: `CornerApp/backend-csharp`
- [ ] **Dockerfile Path** configurado
  - `CornerApp.API/Dockerfile`

## 🗄️ Base de Datos

- [ ] **MySQL agregado** (Railway) o configurado (Render con servicio externo)
- [ ] **Connection String** obtenido
- [ ] **Formato correcto** del Connection String:
  ```
  Server=HOST;Port=3306;Database=DBNAME;User=USER;Password=PASSWORD;SslMode=None;AllowPublicKeyRetrieval=true;Connection Timeout=30;
  ```

## 🔐 Variables de Entorno (MÍNIMO REQUERIDO)

En el dashboard de tu servicio, configura estas variables:

- [ ] `CONNECTION_STRING`
  - Ejemplo: `Server=mysql.railway.internal;Port=3306;Database=railway;User=root;Password=xxxxx;SslMode=None;AllowPublicKeyRetrieval=true;`
  
- [ ] `JWT_SECRET_KEY`
  - ⚠️ **IMPORTANTE**: Debe tener al menos 32 caracteres
  - Genera una aquí: https://generate-secret.vercel.app/32
  - Ejemplo: `a8f5f167f44f4964e6c998dee827110c4c6789abcdefghij`
  
- [ ] `JWT_ISSUER`
  - Valor: `CornerApp`
  
- [ ] `JWT_AUDIENCE`
  - Valor: `CornerApp`
  
- [ ] `ASPNETCORE_ENVIRONMENT`
  - Valor: `Production`
  
- [ ] `ASPNETCORE_URLS`
  - Railway: `http://+:8080`
  - Render: `http://+:10000`

## 🌐 Variables Opcionales (pero recomendadas)

- [ ] `EnableSwagger=true` (para ver la documentación de la API)
- [ ] CORS configurado (si tienes frontend):
  ```
  CORS__ALLOWEDORIGINS__0=https://tu-frontend.vercel.app
  CORS__ALLOWEDORIGINS__1=http://localhost:3000
  ```

## 🚀 Deploy

- [ ] **Build iniciado** automáticamente
- [ ] **Build completado** exitosamente (sin errores)
- [ ] **Logs revisados** para verificar que no hay warnings críticos

## ✅ Post-Deploy (Verificación)

- [ ] **Health check funciona**
  - Abre: `https://tu-url/health`
  - Debería responder: Status 200 con JSON
  
- [ ] **Swagger funciona** (si habilitaste EnableSwagger)
  - Abre: `https://tu-url/swagger`
  - Deberías ver la documentación de la API
  
- [ ] **Base de datos conectada**
  - Los logs deberían mostrar: "Base de datos ya existía, esquema verificado" o similar
  - Los datos hardcodeados deberían estar creados
  
- [ ] **Autenticación funciona**
  - Prueba login en Swagger:
    - Endpoint: `POST /admin/api/auth/login`
    - Body: `{ "username": "corner", "password": "password123" }`
    - Debería devolver un token JWT
  
- [ ] **API responde correctamente**
  - Prueba algún endpoint público:
    - `GET /api/products` (si está público)
    - `GET /api/categories`

## 🔄 Auto-Deploy

- [ ] **Branch configurado** en el servicio (usualmente `main`)
- [ ] **Auto-deploy habilitado**
- [ ] **Prueba**: Haz un cambio pequeño, haz commit, push y verifica que se redespliegue automáticamente

## 📝 Documentación

- [ ] **URL del backend guardada** en un lugar seguro
- [ ] **Credenciales de prueba documentadas**:
  - Admin: `corner` / `password123`
  - Repartidor: `juan_delivery` / `delivery123`
- [ ] **Variables de entorno documentadas** (sin valores sensibles)

## 🎯 Dominio Custom (Opcional)

Si quieres agregar tu propio dominio:

- [ ] Dominio comprado
- [ ] DNS configurado:
  - Railway: CNAME apuntando a Railway
  - Render: CNAME apuntando a Render
- [ ] SSL/TLS certificado generado automáticamente
- [ ] Dominio verificado y funcionando

## 🆘 Troubleshooting

Si algo falla, verifica:

1. **Build Error**
   - [ ] Revisa los logs de build
   - [ ] Verifica que el Dockerfile Path sea correcto
   - [ ] Verifica que el Root Directory sea correcto

2. **Runtime Error**
   - [ ] Revisa los logs de runtime
   - [ ] Verifica que todas las variables de entorno estén configuradas
   - [ ] Verifica el CONNECTION_STRING

3. **Database Connection Error**
   - [ ] Verifica que MySQL esté running
   - [ ] Verifica el connection string
   - [ ] En Railway, usa `mysql.railway.internal` como host

4. **JWT Error**
   - [ ] Verifica que JWT_SECRET_KEY tenga al menos 32 caracteres
   - [ ] Verifica que JWT_ISSUER y JWT_AUDIENCE estén configurados

## 📊 Monitoreo Post-Deploy

Una vez todo funciona:

- [ ] Configura alertas (si el servicio lo ofrece)
- [ ] Revisa los logs regularmente
- [ ] Monitorea el uso de recursos
- [ ] Configura backups de la base de datos (si es crítico)

---

## 🎉 ¡Listo!

Si todos los checkboxes están marcados, tu backend está correctamente deployado y funcionando.

**Próximos pasos:**
1. Documenta la URL de tu API
2. Actualiza tu frontend para usar esta URL
3. Configura CORS para permitir tu frontend
4. Considera agregar monitoring/logging más avanzado (opcional)

---

**¿Necesitas ayuda?** Revisa:
- `QUICK_START.md` para guías rápidas
- `DEPLOY_RAILWAY.md` para instrucciones detalladas de Railway
- `.env.railway.example` para ver todas las variables disponibles
