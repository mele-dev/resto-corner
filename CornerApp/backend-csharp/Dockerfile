# Dockerfile optimizado para Railway
# Este Dockerfile funciona cuando el contexto de build es CornerApp.API/

# Etapa 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar archivo de proyecto directamente (estamos en el directorio del proyecto)
COPY ["CornerApp.API.csproj", "./"]
RUN dotnet restore "CornerApp.API.csproj"

# Copiar todo el código fuente
COPY . .

# Build de la aplicación
RUN dotnet build "CornerApp.API.csproj" -c Release -o /app/build

# Etapa 2: Publish
FROM build AS publish
RUN dotnet publish "CornerApp.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Etapa 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Instalar curl para health checks (antes de cambiar usuario)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Crear usuario no-root para seguridad
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copiar archivos publicados
COPY --from=publish /app/publish .

# Crear directorio para logs con permisos correctos
RUN mkdir -p /app/logs && chown -R appuser:appuser /app

# Cambiar a usuario no-root
USER appuser

# Exponer puerto
EXPOSE 8080
EXPOSE 8081

# Variables de entorno por defecto
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl --fail http://localhost:8080/health || exit 1

# Punto de entrada
ENTRYPOINT ["dotnet", "CornerApp.API.dll"]
