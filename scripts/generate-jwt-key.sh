#!/bin/bash

# Script para generar una clave JWT segura de 32+ caracteres

echo "🔐 Generador de JWT Secret Key"
echo "================================"
echo ""

# Generar clave aleatoria de 64 caracteres
JWT_KEY=$(openssl rand -hex 32)

echo "✅ Clave JWT generada:"
echo ""
echo "$JWT_KEY"
echo ""
echo "Longitud: ${#JWT_KEY} caracteres"
echo ""
echo "📋 Copia esta clave y úsala en tus variables de entorno:"
echo "   JWT_SECRET_KEY=$JWT_KEY"
echo ""
echo "⚠️  IMPORTANTE: Guarda esta clave en un lugar seguro."
echo "   No la compartas ni la subas a git."
