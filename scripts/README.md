# 🛠️ Scripts de Utilidad

Scripts útiles para facilitar el deploy y configuración del proyecto.

## 📜 Scripts Disponibles

### 1. `generate-jwt-key.sh`

Genera una clave JWT segura de 64 caracteres para usar en tus variables de entorno.

**Uso:**
```bash
./scripts/generate-jwt-key.sh
```

**Output:**
```
🔐 Generador de JWT Secret Key
================================

✅ Clave JWT generada:

a8f5f167f44f4964e6c998dee827110c4c6789abcdefghijklmnopqrstuvwxyz

Longitud: 64 caracteres

📋 Copia esta clave y úsala en tus variables de entorno:
   JWT_SECRET_KEY=a8f5f167f44f4964e6c998dee827110c4c6789abcdefghijklmnopqrstuvwxyz
```

---

### 2. `verify-ready-for-deploy.sh`

Verifica que tu proyecto esté listo para deployar. Hace checks de:
- ✅ Estructura del proyecto (Dockerfile, .csproj, etc.)
- ✅ Compilación del proyecto
- ✅ Configuración de Docker
- ✅ Archivos de documentación
- ✅ Configuración de git

**Uso:**
```bash
./scripts/verify-ready-for-deploy.sh
```

**Output exitoso:**
```
🔍 Verificando que el proyecto está listo para deploy...
========================================================

1️⃣  Verificando estructura del proyecto...
-------------------------------------------
✅ Dockerfile existe
✅ .dockerignore existe
✅ CornerApp.API.csproj existe
✅ Program.cs existe

2️⃣  Verificando que el proyecto compila...
-------------------------------------------
✅ dotnet CLI encontrado
✅ Proyecto compila correctamente

... (más checks)

======================================================
📊 RESUMEN
======================================================

Checks exitosos: 15
Checks fallidos: 0

🎉 ¡Todo listo para deploy!

Próximos pasos:
1. Lee QUICK_START.md para instrucciones rápidas
2. Crea una cuenta en Railway (https://railway.app)
3. Conecta tu repositorio de GitHub
4. Sigue las instrucciones en QUICK_START.md
```

---

## 🚀 Flujo de Trabajo Recomendado

Antes de deployar por primera vez:

```bash
# 1. Genera una clave JWT
./scripts/generate-jwt-key.sh

# 2. Guarda la clave generada (la necesitarás para las variables de entorno)

# 3. Verifica que todo está listo
./scripts/verify-ready-for-deploy.sh

# 4. Si todos los checks pasan, procede con el deploy siguiendo QUICK_START.md
```

---

## 🔧 Requisitos

Ambos scripts requieren:
- Bash shell (macOS, Linux, Windows con WSL/Git Bash)
- Git instalado

El script `verify-ready-for-deploy.sh` además requiere (opcional):
- .NET SDK (para verificar compilación)
- Docker (para verificar configuración de contenedores)

Si no tienes estos instalados, el script mostrará warnings pero no fallará.

---

## 📝 Notas

- Los scripts están diseñados para ejecutarse desde la raíz del proyecto
- Son seguros de ejecutar múltiples veces
- No modifican ningún archivo, solo verifican y generan información
- Los scripts son multiplataforma (macOS, Linux, Windows con Git Bash)

---

## 💡 Tips

### Generar múltiples claves JWT

Si necesitas diferentes claves para diferentes ambientes:

```bash
# Desarrollo
echo "DEV_JWT_KEY=$(./scripts/generate-jwt-key.sh | grep -A1 'Clave JWT' | tail -1)"

# Staging
echo "STAGING_JWT_KEY=$(./scripts/generate-jwt-key.sh | grep -A1 'Clave JWT' | tail -1)"

# Producción
echo "PROD_JWT_KEY=$(./scripts/generate-jwt-key.sh | grep -A1 'Clave JWT' | tail -1)"
```

### Integrar en CI/CD

Puedes usar `verify-ready-for-deploy.sh` en tu pipeline de CI/CD:

```yaml
# .github/workflows/deploy.yml
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Verify ready for deploy
        run: ./scripts/verify-ready-for-deploy.sh
```

---

## 🆘 Troubleshooting

### "Permission denied" al ejecutar scripts

```bash
chmod +x scripts/*.sh
```

### Scripts no funcionan en Windows

Usa Git Bash, WSL, o ejecuta directamente los comandos manualmente:

```bash
# Generar JWT key en PowerShell
$bytes = New-Object byte[] 32
[Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

---

## 📚 Más Información

- [QUICK_START.md](../QUICK_START.md) - Guía rápida de deploy
- [DEPLOY_RAILWAY.md](../DEPLOY_RAILWAY.md) - Guía detallada Railway
- [DEPLOY_CHECKLIST.md](../DEPLOY_CHECKLIST.md) - Checklist completo
