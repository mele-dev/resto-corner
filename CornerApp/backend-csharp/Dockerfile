FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["CornerApp.API/CornerApp.API.csproj", "CornerApp.API/"]
RUN dotnet restore "CornerApp.API/CornerApp.API.csproj"

COPY . .

WORKDIR "/src/CornerApp.API"
RUN dotnet build "CornerApp.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "CornerApp.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

RUN groupadd -r appuser && useradd -r -g appuser appuser

COPY --from=publish /app/publish .

RUN mkdir -p /app/logs && chown -R appuser:appuser /app

USER appuser

EXPOSE 8080
EXPOSE 8081

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl --fail http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "CornerApp.API.dll"]
