#!/bin/bash

# Script para verificar que el proyecto está listo para deployar

echo "🔍 Verificando que el proyecto está listo para deploy..."
echo "========================================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de checks
PASSED=0
FAILED=0

# Función para check exitoso
check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED++))
}

# Función para check fallido
check_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED++))
}

# Función para warning
check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Cambiar al directorio del backend
cd "$(dirname "$0")/../CornerApp/backend-csharp/CornerApp.API" || exit 1

echo "1️⃣  Verificando estructura del proyecto..."
echo "-------------------------------------------"

# Verificar que existe Dockerfile
if [ -f "Dockerfile" ]; then
    check_pass "Dockerfile existe"
else
    check_fail "Dockerfile no encontrado"
fi

# Verificar que existe .dockerignore
if [ -f "../.dockerignore" ]; then
    check_pass ".dockerignore existe"
else
    check_warn ".dockerignore no encontrado (recomendado pero no crítico)"
fi

# Verificar que existe .csproj
if [ -f "CornerApp.API.csproj" ]; then
    check_pass "CornerApp.API.csproj existe"
else
    check_fail "CornerApp.API.csproj no encontrado"
fi

# Verificar que existe Program.cs
if [ -f "Program.cs" ]; then
    check_pass "Program.cs existe"
else
    check_fail "Program.cs no encontrado"
fi

echo ""
echo "2️⃣  Verificando que el proyecto compila..."
echo "-------------------------------------------"

# Verificar que dotnet está instalado
if command -v dotnet &> /dev/null; then
    check_pass "dotnet CLI encontrado"
    
    # Intentar compilar
    if dotnet build -c Release > /dev/null 2>&1; then
        check_pass "Proyecto compila correctamente"
    else
        check_fail "Proyecto no compila (ejecuta 'dotnet build' para ver errores)"
    fi
else
    check_warn "dotnet CLI no encontrado (solo necesario para verificar localmente)"
fi

echo ""
echo "3️⃣  Verificando configuración de Docker..."
echo "-------------------------------------------"

# Verificar que Docker está instalado
if command -v docker &> /dev/null; then
    check_pass "Docker encontrado"
else
    check_warn "Docker no encontrado (solo necesario para probar localmente)"
fi

# Verificar que el Dockerfile expone puerto 8080
if grep -q "EXPOSE 8080" Dockerfile; then
    check_pass "Dockerfile expone puerto 8080"
else
    check_fail "Dockerfile no expone puerto 8080"
fi

# Verificar que el Dockerfile usa ASPNETCORE_URLS correcto
if grep -q "ASPNETCORE_URLS=http://+:8080" Dockerfile; then
    check_pass "Dockerfile configura ASPNETCORE_URLS correctamente"
else
    check_warn "Dockerfile podría no tener ASPNETCORE_URLS configurado"
fi

echo ""
echo "4️⃣  Verificando archivos de documentación..."
echo "-------------------------------------------"

cd "$(dirname "$0")/.." || exit 1

if [ -f "QUICK_START.md" ]; then
    check_pass "QUICK_START.md existe"
else
    check_fail "QUICK_START.md no encontrado"
fi

if [ -f "DEPLOY_RAILWAY.md" ]; then
    check_pass "DEPLOY_RAILWAY.md existe"
else
    check_fail "DEPLOY_RAILWAY.md no encontrado"
fi

if [ -f "DEPLOY_CHECKLIST.md" ]; then
    check_pass "DEPLOY_CHECKLIST.md existe"
else
    check_fail "DEPLOY_CHECKLIST.md no encontrado"
fi

if [ -f "CornerApp/backend-csharp/.env.railway.example" ]; then
    check_pass ".env.railway.example existe"
else
    check_fail ".env.railway.example no encontrado"
fi

echo ""
echo "5️⃣  Verificando configuración de git..."
echo "-------------------------------------------"

# Verificar que estamos en un repo git
if git rev-parse --git-dir > /dev/null 2>&1; then
    check_pass "Repositorio git inicializado"
    
    # Verificar que hay commits
    if [ "$(git log --oneline 2>/dev/null | wc -l)" -gt 0 ]; then
        check_pass "Repositorio tiene commits"
    else
        check_fail "Repositorio no tiene commits"
    fi
    
    # Verificar que no hay cambios sin commitear (warning, no error)
    if [ -z "$(git status --porcelain)" ]; then
        check_pass "No hay cambios sin commitear"
    else
        check_warn "Hay cambios sin commitear (recuerda hacer commit y push)"
    fi
    
    # Verificar que hay un remote configurado
    if git remote -v | grep -q "origin"; then
        check_pass "Remote 'origin' configurado"
    else
        check_fail "No hay remote 'origin' configurado"
    fi
else
    check_fail "No es un repositorio git"
fi

echo ""
echo "======================================================"
echo "📊 RESUMEN"
echo "======================================================"
echo ""
echo -e "${GREEN}Checks exitosos: $PASSED${NC}"
echo -e "${RED}Checks fallidos: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡Todo listo para deploy!${NC}"
    echo ""
    echo "Próximos pasos:"
    echo "1. Lee QUICK_START.md para instrucciones rápidas"
    echo "2. Crea una cuenta en Railway (https://railway.app)"
    echo "3. Conecta tu repositorio de GitHub"
    echo "4. Sigue las instrucciones en QUICK_START.md"
    echo ""
    exit 0
else
    echo -e "${RED}⚠️  Hay algunos problemas que debes resolver antes de deployar.${NC}"
    echo ""
    echo "Revisa los checks fallidos arriba y corrígelos."
    echo ""
    exit 1
fi
