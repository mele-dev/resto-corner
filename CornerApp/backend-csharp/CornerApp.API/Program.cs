using CornerApp.API.Services;
using CornerApp.API.Controllers;
using CornerApp.API.Data;
using CornerApp.API.Models;
using CornerApp.API.Middleware;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using HealthChecks.UI.Client;
using AspNetCoreRateLimit;
using Serilog;
using Serilog.Events;
using Prometheus;

// Configurar Serilog antes de crear el builder
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
    .MinimumLevel.Override("System", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .Enrich.WithEnvironmentName()
    .Enrich.WithMachineName()
    .Enrich.WithThreadId()
    .WriteTo.Console(
        outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}")
    .WriteTo.File(
        path: "logs/cornerapp-.log",
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 30,
        outputTemplate: "[{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}",
        shared: true)
    .CreateLogger();

try
{
    Log.Information("Iniciando CornerApp API");

var builder = WebApplication.CreateBuilder(args);
    
    // Usar Serilog en lugar del logger por defecto
    builder.Host.UseSerilog();

// Agregar compresión de respuestas
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<Microsoft.AspNetCore.ResponseCompression.BrotliCompressionProvider>();
    options.Providers.Add<Microsoft.AspNetCore.ResponseCompression.GzipCompressionProvider>();
    options.MimeTypes = Microsoft.AspNetCore.ResponseCompression.ResponseCompressionDefaults.MimeTypes.Concat(
        new[] { "application/json", "text/json", "application/problem+json" });
});

builder.Services.Configure<Microsoft.AspNetCore.ResponseCompression.BrotliCompressionProviderOptions>(options =>
{
    options.Level = System.IO.Compression.CompressionLevel.Optimal;
});

builder.Services.Configure<Microsoft.AspNetCore.ResponseCompression.GzipCompressionProviderOptions>(options =>
{
    options.Level = System.IO.Compression.CompressionLevel.Optimal;
});

// Configurar límites de request para protección
var maxRequestBodySize = builder.Configuration.GetValue<long>("RequestLimits:MaxRequestBodySize", 10 * 1024 * 1024);
var maxRequestHeadersSize = builder.Configuration.GetValue<int>("RequestLimits:MaxRequestHeadersTotalSize", 32 * 1024);
var maxRequestHeaderCount = builder.Configuration.GetValue<int>("RequestLimits:MaxRequestHeaderCount", 100);
var keepAliveTimeout = builder.Configuration.GetValue<int>("RequestLimits:KeepAliveTimeoutSeconds", 120);
var requestHeadersTimeout = builder.Configuration.GetValue<int>("RequestLimits:RequestHeadersTimeoutSeconds", 30);

builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = maxRequestBodySize;
    options.Limits.MaxRequestHeadersTotalSize = maxRequestHeadersSize;
    options.Limits.MaxRequestHeaderCount = maxRequestHeaderCount;
    options.Limits.KeepAliveTimeout = TimeSpan.FromSeconds(keepAliveTimeout);
    options.Limits.RequestHeadersTimeout = TimeSpan.FromSeconds(requestHeadersTimeout);
});

// Agregar servicios con Content Negotiation mejorado
builder.Services.AddControllers(options =>
{
    // Configurar Content Negotiation
    options.RespectBrowserAcceptHeader = true;
    options.ReturnHttpNotAcceptable = true; // Retornar 406 si el formato no es aceptable
    
    // Agregar formatters personalizados si es necesario
    // Por defecto, ASP.NET Core soporta JSON y XML
})
    .AddJsonOptions(options =>
    {
        // Evitar referencias circulares en JSON (Category -> Products -> Category)
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = true;
        
        // Configuración adicional de JSON
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DictionaryKeyPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    })
    .AddXmlSerializerFormatters() // Soporte para XML si el cliente lo solicita
    .ConfigureApiBehaviorOptions(options =>
    {
        // Personalizar respuestas de validación
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState
                .Where(x => x.Value?.Errors.Count > 0)
                .SelectMany(x => x.Value!.Errors.Select(e => new CornerApp.API.Middleware.ValidationError
                {
                    Field = x.Key,
                    Message = e.ErrorMessage ?? "Error de validación",
                    AttemptedValue = x.Value.AttemptedValue
                }))
                .ToList();

            var response = new CornerApp.API.Middleware.ErrorResponse
            {
                Success = false,
                Message = "Error de validación en los datos enviados",
                ErrorCode = "VALIDATION_ERROR",
                ValidationErrors = errors
            };

            return new Microsoft.AspNetCore.Mvc.BadRequestObjectResult(response);
        };
    });
builder.Services.AddEndpointsApiExplorer();

// Configurar Swagger solo si está habilitado
var enableSwaggerConfig = builder.Configuration.GetValue<bool>("EnableSwagger", false);
if (builder.Environment.IsDevelopment() || enableSwaggerConfig)
{
    builder.Services.AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
        {
            Title = "CornerApp API",
            Version = "v1.0",
            Description = @"
API REST para la gestión completa de pedidos de CornerApp.

## Características principales:
- Gestión de productos y categorías
- Creación y seguimiento de pedidos
- Autenticación JWT para clientes y repartidores
- Dashboard administrativo
- Sistema de puntos y recompensas
- Tracking de entregas en tiempo real

## Autenticación:
La mayoría de los endpoints requieren autenticación JWT. Obtén un token usando los endpoints de autenticación y luego inclúyelo en el header:
```
Authorization: Bearer {tu_token}
```

## Rate Limiting:
La API implementa rate limiting para proteger contra abuso. Los límites varían según el endpoint.
",
            Contact = new Microsoft.OpenApi.Models.OpenApiContact
            {
                Name = "Soporte CornerApp",
                Email = "soporte@cornerapp.com"
            },
            License = new Microsoft.OpenApi.Models.OpenApiLicense
            {
                Name = "Propietario",
                Url = new Uri("https://cornerapp.com/license")
            },
            TermsOfService = new Uri("https://cornerapp.com/terms")
        });
        
        // Habilitar comentarios XML para documentación
        var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
        var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
        if (File.Exists(xmlPath))
        {
            options.IncludeXmlComments(xmlPath);
        }
        
        // Agregar seguridad JWT a Swagger
        options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
        {
            Description = @"JWT Authorization header usando el esquema Bearer. 
Ingresa 'Bearer' [espacio] y luego tu token en el campo de abajo.
Ejemplo: 'Bearer 12345abcdef'",
            Name = "Authorization",
            In = Microsoft.OpenApi.Models.ParameterLocation.Header,
            Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
            Scheme = "Bearer",
            BearerFormat = "JWT"
        });
        
        options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
        {
            {
                new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Reference = new Microsoft.OpenApi.Models.OpenApiReference
                    {
                        Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });
        
        // Agregar tags para agrupar endpoints
        options.TagActionsBy(api => new[] { api.GroupName ?? api.ActionDescriptor.RouteValues["controller"] ?? "Default" });
        options.DocInclusionPredicate((name, api) => true);
        
        // Personalizar esquemas
        options.CustomSchemaIds(type => type.FullName?.Replace("+", "."));
        
        // Agregar ejemplos y descripciones mejoradas
        options.SupportNonNullableReferenceTypes();
        options.UseAllOfToExtendReferenceSchemas();
        options.SupportNonNullableReferenceTypes();
    });
}

// Registrar servicio de secretos
builder.Services.AddSingleton<ISecretsService, SecretsService>();

// Configurar Entity Framework Core
// Prioridad: SecretsService > Variable de entorno CONNECTION_STRING > appsettings.json
// Nota: Usamos Task.Run para evitar deadlocks en la inicialización
var tempServiceProvider = builder.Services.BuildServiceProvider();
var secretsService = tempServiceProvider.GetRequiredService<ISecretsService>();

// configurar connection string - mysql
Log.Information("=== INICIO CONFIGURACIÓN BASE DE DATOS (MySQL) ===");
Log.Information("Environment: {Environment}", builder.Environment.EnvironmentName);
Log.Information("IsProduction: {IsProduction}", builder.Environment.IsProduction());

// Configurar connection string - Prioridad: Variable de entorno > SecretsService > appsettings.json
string? connectionString = Task.Run(async () => await secretsService.GetSecretAsync("ConnectionStrings:DefaultConnection")).Result
    ?? Environment.GetEnvironmentVariable("CONNECTION_STRING")
    ?? builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string no configurado. Configure la variable de entorno CONNECTION_STRING o el valor en appsettings.json");

Log.Information("Connection string obtenido desde: {Source}", 
    Environment.GetEnvironmentVariable("CONNECTION_STRING") != null ? "Variable de entorno" :
    builder.Configuration.GetConnectionString("DefaultConnection") != null ? "appsettings.json" : "SecretsService");

Log.Information("Connection String configurado (longitud: {Length})", connectionString?.Length ?? 0);

// configurar entity framework para mysql (pomelo)
Log.Information("Configurando Entity Framework para MySQL");

// validar el connection string
try
{
    var builderTest = new MySqlConnector.MySqlConnectionStringBuilder(connectionString);
    Log.Information("Connection string validado correctamente. Server: {Server}, Database: {Database}, User: {User}", 
        builderTest.Server, 
        builderTest.Database, 
        builderTest.UserID);
}
catch (Exception ex)
{
    Log.Warning(ex, "Advertencia: No se pudo validar el connection string. Continuando de todas formas.");
}

var serverVersion = ServerVersion.AutoDetect(connectionString);
Log.Information("MySQL Server Version detectada: {Version}", serverVersion);

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseMySql(connectionString, serverVersion, mysqlOptions =>
    {
        mysqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(5),
            errorNumbersToAdd: null);
        mysqlOptions.CommandTimeout(30);
    });
    
    // Habilitar sensitive data logging solo en desarrollo
    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();
        options.EnableDetailedErrors();
    }
});

// Configurar CORS con optimizaciones
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() 
    ?? new[] { "http://localhost:3000", "http://localhost:19006", "exp://localhost:19000" };
var allowCredentials = builder.Configuration.GetValue<bool>("Cors:AllowCredentials", false);
var maxAge = builder.Configuration.GetValue<int>("Cors:MaxAge", 3600); // 1 hora por defecto

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactNative", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            // En desarrollo, permitir cualquier origen para facilitar pruebas desde móviles
            // Usamos SetIsOriginAllowed para permitir cualquier origen incluso con AllowCredentials
            policy.SetIsOriginAllowed(_ => true)
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials() // Necesario para SignalR
                  .WithExposedHeaders("X-Request-Id", "ETag", "Content-Length", "Content-Type");
        }
        else
        {
            // En producción, solo orígenes específicos con configuración optimizada
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials() // Necesario para SignalR
                  .WithExposedHeaders("X-Request-Id", "ETag", "Content-Length", "Content-Type")
                  .SetPreflightMaxAge(TimeSpan.FromSeconds(maxAge));
        }
    });
    
    // Política adicional para APIs públicas (sin autenticación)
    options.AddPolicy("PublicApi", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader()
              .WithExposedHeaders("X-Request-Id", "ETag");
    });
});

// Configurar JWT Authentication
// Prioridad: SecretsService > Variable de entorno > appsettings.json > valor por defecto (solo desarrollo)
// Nota: Usamos Task.Run para evitar deadlocks en la inicialización
var jwtKey = Task.Run(async () => await secretsService.GetSecretAsync("JWT_SECRET_KEY")).Result
    ?? builder.Configuration["JWT_SECRET_KEY"] 
    ?? builder.Configuration["Jwt:Key"] 
    ?? (builder.Environment.IsDevelopment() 
        ? "your-secret-key-that-is-at-least-32-characters-long-for-security-development-only" 
        : throw new InvalidOperationException("JWT Secret Key no configurado. Configure la variable de entorno JWT_SECRET_KEY o el valor en appsettings.json"));

var jwtIssuer = builder.Configuration["JWT_ISSUER"] 
    ?? builder.Configuration["Jwt:Issuer"] 
    ?? "CornerApp";

var jwtAudience = builder.Configuration["JWT_AUDIENCE"] 
    ?? builder.Configuration["Jwt:Audience"] 
    ?? "CornerApp";

// Validar que la clave tenga al menos 32 caracteres en producción
if (!builder.Environment.IsDevelopment() && (jwtKey == null || jwtKey.Length < 32))
{
    throw new InvalidOperationException("JWT Secret Key debe tener al menos 32 caracteres en producción.");
}

builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
        // Permitir peticiones sin token (para endpoints AllowAnonymous)
        options.Events = new Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                // Si no hay token, no es un error para endpoints AllowAnonymous
                var endpoint = context.HttpContext.GetEndpoint();
                if (endpoint?.Metadata.GetMetadata<Microsoft.AspNetCore.Authorization.AllowAnonymousAttribute>() != null)
                {
                    context.NoResult();
                    return Task.CompletedTask;
                }
                return Task.CompletedTask;
            },
            OnChallenge = context =>
            {
                // Si el endpoint tiene AllowAnonymous, no desafiar la autenticación
                var endpoint = context.HttpContext.GetEndpoint();
                if (endpoint?.Metadata.GetMetadata<Microsoft.AspNetCore.Authorization.AllowAnonymousAttribute>() != null)
                {
                    context.HandleResponse();
                    return Task.CompletedTask;
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization(options =>
{
    // Política para administradores
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    
    // Por defecto, requerir autenticación para endpoints admin
    options.FallbackPolicy = null; // No requerir autenticación por defecto (solo donde se especifique)
});

// Configurar Response Caching (HTTP Cache Headers)
builder.Services.AddResponseCaching(options =>
{
    options.MaximumBodySize = 64 * 1024 * 1024; // 64 MB
    options.SizeLimit = 100 * 1024 * 1024; // 100 MB
    options.UseCaseSensitivePaths = false;
});

// Configurar Cache: Redis (Distributed Cache) si está disponible, sino Memory Cache
var redisConnectionString = builder.Configuration.GetConnectionString("Redis")
    ?? builder.Configuration["Redis:ConnectionString"];

if (!string.IsNullOrEmpty(redisConnectionString))
{
    // Usar Redis como Distributed Cache
    builder.Services.AddStackExchangeRedisCache(options =>
    {
        options.Configuration = redisConnectionString;
        options.InstanceName = builder.Configuration["Redis:InstanceName"] ?? "CornerApp:";
    });
    
    // También mantener Memory Cache como fallback
    builder.Services.AddMemoryCache(options =>
    {
        options.SizeLimit = 1024;
    });
    
    Log.Information("Redis configurado como Distributed Cache: {ConnectionString}", 
        redisConnectionString.Replace("password=", "password=***"));
}
else
{
    // Solo Memory Cache si Redis no está configurado
    builder.Services.AddMemoryCache(options =>
    {
        options.SizeLimit = 1024; // Límite de tamaño en MB
    });
    
    Log.Information("Usando Memory Cache (Redis no configurado)");
}

// Registrar CacheService unificado
builder.Services.AddSingleton<ICacheService, CacheService>();

// Agregar servicios de Background Jobs/Tasks
builder.Services.AddSingleton<IBackgroundTaskQueue, BackgroundTaskQueue>();
builder.Services.AddHostedService<QueuedHostedService>();

// Registrar Message Queue (RabbitMQ)
var rabbitMQEnabled = builder.Configuration.GetValue<bool>("RabbitMQ:Enabled", false);
if (rabbitMQEnabled)
{
    builder.Services.AddSingleton<IMessageQueueService, RabbitMQService>();
    builder.Services.AddHostedService<OrderMessageConsumer>();
    Log.Information("RabbitMQ habilitado y servicios registrados");
}
else
{
    // Implementación dummy para cuando RabbitMQ está deshabilitado
    builder.Services.AddSingleton<IMessageQueueService, DummyMessageQueueService>();
    Log.Information("RabbitMQ deshabilitado, usando DummyMessageQueueService");
}

// Cache Cleanup Service (solo si está habilitado)
var enableBackgroundJobs = builder.Configuration.GetValue<bool>("BackgroundJobs:EnableBackgroundJobs", true);
var enableCacheCleanup = builder.Configuration.GetValue<bool>("BackgroundJobs:CacheCleanup:Enabled", true);
if (enableBackgroundJobs && enableCacheCleanup)
{
    builder.Services.AddHostedService<CacheCleanupService>();
}

// Database Backup Service
var enableBackup = builder.Configuration.GetValue<bool>("Backup:Enabled", false);
if (enableBackup)
{
    builder.Services.AddSingleton<IDatabaseBackupService, DatabaseBackupService>();
    builder.Services.AddHostedService<DatabaseBackupBackgroundService>();
    Log.Information("Database Backup Service habilitado");
}

// Servicio de procesamiento de pedidos
builder.Services.AddScoped<OrderProcessingService>();

// Servicio de horarios de negocio (Scoped porque necesita DbContext)
builder.Services.AddScoped<IBusinessHoursService, BusinessHoursService>();

// Servicio de dashboard de administración
builder.Services.AddScoped<IAdminDashboardService, AdminDashboardService>();

// Servicio de subida de archivos
builder.Services.AddScoped<IFileUploadService, FileUploadService>();

// Servicio de email
builder.Services.AddScoped<IEmailService, EmailService>();

// SignalR para notificaciones en tiempo real
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = builder.Environment.IsDevelopment();
    options.KeepAliveInterval = TimeSpan.FromSeconds(15);
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
})
.AddJsonProtocol(options =>
{
    // Usar la misma configuración de serialización JSON que los controllers
    options.PayloadSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    options.PayloadSerializerOptions.DictionaryKeyPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    options.PayloadSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    options.PayloadSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
});
builder.Services.AddSingleton<CornerApp.API.Hubs.IOrderNotificationService, CornerApp.API.Hubs.OrderNotificationService>();

// Circuit Breaker Factory
builder.Services.AddSingleton<CircuitBreakerFactory>();

// Feature Flags Service
builder.Services.AddSingleton<IFeatureFlagsService, FeatureFlagsService>();

// Retry Policy Factory
builder.Services.AddSingleton<RetryPolicyFactory>();

// Audit Service
builder.Services.AddScoped<IAuditService, AuditService>();

// Webhook Service
builder.Services.AddHttpClient(); // Para webhooks
builder.Services.AddScoped<IWebhookService, WebhookService>();

// Configurar Rate Limiting
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
builder.Services.AddSingleton<IIpPolicyStore, MemoryCacheIpPolicyStore>();
builder.Services.AddSingleton<IRateLimitCounterStore, MemoryCacheRateLimitCounterStore>();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();
builder.Services.AddSingleton<IProcessingStrategy, AsyncKeyLockProcessingStrategy>();
builder.Services.AddInMemoryRateLimiting();

// Registrar servicio de métricas
builder.Services.AddSingleton<IMetricsService, MetricsService>();

// Configurar Health Checks
var healthChecksBuilder = builder.Services.AddHealthChecks()
    .AddDbContextCheck<ApplicationDbContext>(
        name: "database",
        failureStatus: Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Unhealthy,
        tags: new[] { "db", "sql", "ready" })
    .AddCheck("self", () => Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy("API is healthy"), tags: new[] { "self" });

// Agregar health checks personalizados
var enableCacheHealthCheck = builder.Configuration.GetValue<bool>("HealthChecks:Cache:Enabled", true);
if (enableCacheHealthCheck)
{
    healthChecksBuilder.AddCheck<CornerApp.API.HealthChecks.CacheHealthCheck>(
        "cache",
        failureStatus: Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Degraded,
        tags: new[] { "cache", "memory" });
}

var enableDiskSpaceHealthCheck = builder.Configuration.GetValue<bool>("HealthChecks:DiskSpace:Enabled", true);
if (enableDiskSpaceHealthCheck)
{
    healthChecksBuilder.AddCheck<CornerApp.API.HealthChecks.DiskSpaceHealthCheck>(
        "disk_space",
        failureStatus: Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Degraded,
        tags: new[] { "disk", "storage" });
}

var enableMemoryHealthCheck = builder.Configuration.GetValue<bool>("HealthChecks:Memory:Enabled", true);
if (enableMemoryHealthCheck)
{
    healthChecksBuilder.AddCheck<CornerApp.API.HealthChecks.MemoryHealthCheck>(
        "memory",
        failureStatus: Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Degraded,
        tags: new[] { "memory", "resources" });
}

var enableExternalApiHealthCheck = builder.Configuration.GetValue<bool>("HealthChecks:ExternalApi:Enabled", false);
if (enableExternalApiHealthCheck)
{
    builder.Services.AddHttpClient<CornerApp.API.HealthChecks.ExternalApiHealthCheck>();
    healthChecksBuilder.AddCheck<CornerApp.API.HealthChecks.ExternalApiHealthCheck>(
        "external_api",
        failureStatus: Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Degraded,
        tags: new[] { "external", "api" });
}

// Configurar opciones de DeliveryZone desde appsettings.json
builder.Services.Configure<DeliveryZoneOptions>(
    builder.Configuration.GetSection("DeliveryZone"));

// Registrar HttpClient y servicio de DeliveryZone para geocodificación
builder.Services.AddHttpClient<IDeliveryZoneService, DeliveryZoneService>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(10); // Timeout de 10 segundos para geocodificación
});

var app = builder.Build();

// Configurar pipeline HTTP
// Swagger solo en desarrollo o si está explícitamente habilitado en configuración
var enableSwagger = app.Configuration.GetValue<bool>("EnableSwagger", false);
if (app.Environment.IsDevelopment() || enableSwagger)
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "CornerApp API v1");
        
        // En producción, proteger Swagger con autenticación básica si está habilitado
        if (!app.Environment.IsDevelopment())
        {
            // Opcional: Agregar protección adicional aquí si es necesario
            // Por ejemplo, requerir autenticación para acceder a Swagger
        }
    });
}

// Middleware de Security Headers (debe ir temprano para aplicar a todas las respuestas)
app.UseMiddleware<SecurityHeadersMiddleware>();

// Middleware de transformación de respuestas (debe ir antes de otros middlewares que escriben respuestas)
app.UseMiddleware<ResponseTransformationMiddleware>();

// Middleware de versionado de API (debe ir temprano, antes de routing)
app.UseMiddleware<ApiVersioningMiddleware>();

// Middleware de validación de headers y request (debe ir temprano)
app.UseMiddleware<RequestValidationMiddleware>();

// Middleware de validación de tamaño de request (debe ir muy temprano)
app.UseMiddleware<RequestSizeLimitMiddleware>();

// Middleware de logging de requests/responses (debe ir temprano para capturar todo)
app.UseMiddleware<RequestLoggingMiddleware>();

// Middleware de manejo de errores global (debe ir después del logging)
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Rate Limiting (solo en producción o si está habilitado)
var enableRateLimit = !app.Environment.IsDevelopment() || 
    app.Configuration.GetValue<bool>("IpRateLimiting:EnableEndpointRateLimiting", false);
if (enableRateLimit)
{
    app.UseIpRateLimiting();
}

// CORS debe ir ANTES de UseAuthorization y UseHttpsRedirection
// El middleware de optimización CORS maneja preflight requests de manera eficiente
app.UseMiddleware<CorsOptimizationMiddleware>();
app.UseCors("AllowReactNative");

// Compresión de respuestas (debe ir antes de otros middlewares que escriben respuestas)
app.UseResponseCompression();

// Response Caching (HTTP Cache Headers)
app.UseResponseCaching();

// Prometheus HTTP Metrics (debe ir antes de UseRouting)
var enablePrometheus = builder.Configuration.GetValue<bool>("Metrics:Prometheus:Enabled", true);
if (enablePrometheus)
{
    app.UseHttpMetrics(); // Métricas HTTP automáticas
    Log.Information("Prometheus HTTP metrics habilitado");
}

app.UseRouting();

// Forzar HTTPS en producción
if (!app.Environment.IsDevelopment())
{
app.UseHttpsRedirection();
    
    // Agregar headers de optimización (Security Headers se manejan en SecurityHeadersMiddleware)
    app.Use(async (context, next) =>
    {
        // Request ID ya se agrega en RequestLoggingMiddleware, pero asegurarse de que esté presente
        if (!context.Response.Headers.ContainsKey("X-Request-Id") && context.Items.ContainsKey("RequestId"))
        {
            context.Response.Headers.Append("X-Request-Id", context.Items["RequestId"]?.ToString() ?? string.Empty);
        }
        
        // Vary header para cache correcto con Content Negotiation
        if (!context.Response.Headers.ContainsKey("Vary"))
        {
            context.Response.Headers.Append("Vary", "Accept, Accept-Encoding, Accept-Language");
        }
        
        await next();
    });
}
else
{
    // En desarrollo, permitir HTTP
    app.UseHttpsRedirection();
}

// Configurar archivos estáticos para servir el logo y las imágenes
// Incluir configuración para WebP con Content-Type correcto
var staticFileOptions = new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        var path = ctx.File.Name.ToLowerInvariant();
        if (path.EndsWith(".webp"))
        {
            ctx.Context.Response.Headers.Append("Content-Type", "image/webp");
        }
    }
};
app.UseStaticFiles(staticFileOptions);

// Configurar carpeta de imágenes de productos
var imagesPath = Path.Combine(builder.Environment.ContentRootPath, "wwwroot", "images", "products");
if (!Directory.Exists(imagesPath))
{
    Directory.CreateDirectory(imagesPath);
}

app.UseAuthentication(); // Debe ir antes de UseAuthorization
app.UseAuthorization();

// Health Checks endpoints
app.MapHealthChecks("/health", new HealthCheckOptions
{
    Predicate = _ => true,
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse,
    AllowCachingResponses = false
});

// Health check detallado con información de todos los checks
app.MapHealthChecks("/health/detailed", new HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var result = System.Text.Json.JsonSerializer.Serialize(new
        {
            status = report.Status.ToString(),
            totalDuration = report.TotalDuration.TotalMilliseconds,
            entries = report.Entries.Select(e => new
            {
                name = e.Key,
                status = e.Value.Status.ToString(),
                description = e.Value.Description,
                duration = e.Value.Duration.TotalMilliseconds,
                data = e.Value.Data,
                tags = e.Value.Tags,
                exception = e.Value.Exception?.Message
            })
        }, new System.Text.Json.JsonSerializerOptions { WriteIndented = true });
        await context.Response.WriteAsync(result);
    },
    AllowCachingResponses = false
});

app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready"),
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse,
    AllowCachingResponses = false
});

app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("self"),
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse,
    AllowCachingResponses = false
});

app.MapControllers();

// SignalR Hub para notificaciones en tiempo real de pedidos
app.MapHub<CornerApp.API.Hubs.OrdersHub>("/hubs/orders");
Log.Information("SignalR Hub habilitado en /hubs/orders");

// Prometheus Metrics Endpoint (debe ir después de MapControllers)
if (enablePrometheus)
{
    app.MapMetrics("/metrics"); // Endpoint de Prometheus
    Log.Information("Prometheus metrics endpoint habilitado en /metrics");
}

// crear/actualizar esquema de base de datos (mysql)
// ensurecreated crea todas las tablas basándose en el modelo de applicationdbcontext
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        Log.Information("Verificando esquema de base de datos MySQL...");
        Log.Information("Proveedor: {ProviderName}", dbContext.Database.ProviderName);
        
        var created = await dbContext.Database.EnsureCreatedAsync();
        if (created)
        {
            Log.Information("Base de datos y esquema creados exitosamente");
        }
        else
        {
            Log.Information("Base de datos ya existía, esquema verificado");
        }
    }
    catch (Exception ex)
    {
        Log.Error(ex, "Error al crear/verificar esquema de base de datos: {Message}", ex.Message);
    }
}

if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        try
        {
            // Limpiar datos huérfanos (categorías y productos sin RestaurantId válido)
            var orphanedCategoriesCount = await dbContext.Categories
                .Where(c => c.RestaurantId <= 0)
                .CountAsync();
            
            var orphanedProductsCount = await dbContext.Products
                .Where(p => p.RestaurantId <= 0)
                .CountAsync();

            if (orphanedCategoriesCount > 0 || orphanedProductsCount > 0)
            {
                var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
                logger.LogWarning("Encontrados datos huérfanos: {CategoriesCount} categorías y {ProductsCount} productos sin RestaurantId válido. Limpiando...", 
                    orphanedCategoriesCount, orphanedProductsCount);

                var orphanedCategories = await dbContext.Categories
                    .Where(c => c.RestaurantId <= 0).ToListAsync();
                if (orphanedCategories.Any())
                    dbContext.Categories.RemoveRange(orphanedCategories);

                var orphanedProducts = await dbContext.Products
                    .Where(p => p.RestaurantId <= 0).ToListAsync();
                if (orphanedProducts.Any())
                    dbContext.Products.RemoveRange(orphanedProducts);

                await dbContext.SaveChangesAsync();
                logger.LogInformation("Limpieza completada");
            }
            
            Log.Information("Limpiando espacios en blanco de usernames y emails de repartidores...");
            await dbContext.Database.ExecuteSqlRawAsync(@"
                UPDATE DeliveryPersons 
                SET Username = LOWER(TRIM(Username))
                WHERE Username IS NOT NULL;
                
                UPDATE DeliveryPersons 
                SET Email = LOWER(TRIM(Email))
                WHERE Email IS NOT NULL;
            ");
            Log.Information("Usernames y emails de repartidores limpiados exitosamente");
        }
        catch (Exception ex)
        {
            Log.Warning(ex, "Advertencia en limpieza de datos de desarrollo (no crítico)");
        }
    }
}

// Inicializar datos hardcodeados para demostración en Render
if (app.Environment.IsProduction())
{
    using (var scope = app.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        try
        {
            Log.Information("🔧 Inicializando datos hardcodeados para demostración...");
            
            // 1. Crear restaurante con ID 12 si no existe
            var restaurant = await dbContext.Restaurants.FindAsync(12);
            if (restaurant == null)
            {
                restaurant = new Restaurant
                {
                    Id = 12,
                    Name = "Corner Restaurant",
                    Identifier = "corner",
                    Address = "Av. Principal 123, Montevideo",
                    Phone = "123456789",
                    Email = "corner@cornerapp.com",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                dbContext.Restaurants.Add(restaurant);
                await dbContext.SaveChangesAsync();
                Log.Information("✅ Restaurante creado: ID 12, Name: Corner Restaurant");
            }
            
            // 2. Crear usuario admin "corner" con password "password123" si no existe
            var admin = await dbContext.Admins.FirstOrDefaultAsync(a => a.RestaurantId == 12 && a.Username == "corner");
            if (admin == null)
            {
                var passwordHash = BCrypt.Net.BCrypt.HashPassword("password123");
                admin = new Admin
                {
                    RestaurantId = 12,
                    Username = "corner",
                    Email = "corner@cornerapp.com",
                    Name = "Corner Admin",
                    PasswordHash = passwordHash,
                    Role = "Admin",
                    CreatedAt = DateTime.UtcNow
                };
                dbContext.Admins.Add(admin);
                await dbContext.SaveChangesAsync();
                Log.Information("✅ Usuario admin creado: corner / password123");
            }
            
            // 3. Crear categoría si no existe
            var category = await dbContext.Categories.FirstOrDefaultAsync(c => c.RestaurantId == 12 && c.Name == "Bebidas");
            if (category == null)
            {
                category = new Category
                {
                    RestaurantId = 12,
                    Name = "Bebidas",
                    Description = "Categoría de bebidas refrescantes",
                    DisplayOrder = 1,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                dbContext.Categories.Add(category);
                await dbContext.SaveChangesAsync();
                Log.Information("✅ Categoría creada: Bebidas");
            }
            
            // 4. Crear productos si no existen
            var product1 = await dbContext.Products.FirstOrDefaultAsync(p => p.RestaurantId == 12 && p.Name == "Coca Cola");
            if (product1 == null)
            {
                product1 = new Product
                {
                    RestaurantId = 12,
                    Name = "Coca Cola",
                    Description = "Bebida gaseosa refrescante",
                    Price = 500,
                    CategoryId = category.Id,
                    DisplayOrder = 1,
                    IsAvailable = true,
                    CreatedAt = DateTime.UtcNow
                };
                dbContext.Products.Add(product1);
                await dbContext.SaveChangesAsync();
                Log.Information("✅ Producto creado: Coca Cola");
            }
            
            var product2 = await dbContext.Products.FirstOrDefaultAsync(p => p.RestaurantId == 12 && p.Name == "Pizza Margarita");
            if (product2 == null)
            {
                product2 = new Product
                {
                    RestaurantId = 12,
                    Name = "Pizza Margarita",
                    Description = "Pizza con tomate, mozzarella y albahaca",
                    Price = 1200,
                    CategoryId = category.Id,
                    DisplayOrder = 2,
                    IsAvailable = true,
                    CreatedAt = DateTime.UtcNow
                };
                dbContext.Products.Add(product2);
                await dbContext.SaveChangesAsync();
                Log.Information("✅ Producto creado: Pizza Margarita");
            }
            
            // 5. Crear subproductos si no existen
            var subProduct1 = await dbContext.SubProducts.FirstOrDefaultAsync(sp => sp.ProductId == product1.Id && sp.Name == "Tamaño Grande");
            if (subProduct1 == null)
            {
                subProduct1 = new SubProduct
                {
                    ProductId = product1.Id,
                    Name = "Tamaño Grande",
                    Description = "Vaso grande de 500ml",
                    Price = 100,
                    DisplayOrder = 1,
                    IsAvailable = true,
                    CreatedAt = DateTime.UtcNow
                };
                dbContext.SubProducts.Add(subProduct1);
                await dbContext.SaveChangesAsync();
                Log.Information("✅ Subproducto creado: Tamaño Grande");
            }
            
            var subProduct2 = await dbContext.SubProducts.FirstOrDefaultAsync(sp => sp.ProductId == product1.Id && sp.Name == "Tamaño Mediano");
            if (subProduct2 == null)
            {
                subProduct2 = new SubProduct
                {
                    ProductId = product1.Id,
                    Name = "Tamaño Mediano",
                    Description = "Vaso mediano de 350ml",
                    Price = 50,
                    DisplayOrder = 2,
                    IsAvailable = true,
                    CreatedAt = DateTime.UtcNow
                };
                dbContext.SubProducts.Add(subProduct2);
                await dbContext.SaveChangesAsync();
                Log.Information("✅ Subproducto creado: Tamaño Mediano");
            }
            
            // 6. Crear repartidor si no existe
            var deliveryPerson = await dbContext.DeliveryPersons.FirstOrDefaultAsync(d => d.Username == "juan_delivery");
            if (deliveryPerson == null)
            {
                var deliveryPasswordHash = BCrypt.Net.BCrypt.HashPassword("delivery123");
                deliveryPerson = new DeliveryPerson
                {
                    Name = "Juan Pérez",
                    Phone = "0987654321",
                    Email = "juan.perez@cornerapp.com",
                    Username = "juan_delivery",
                    PasswordHash = deliveryPasswordHash,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                dbContext.DeliveryPersons.Add(deliveryPerson);
                await dbContext.SaveChangesAsync();
                Log.Information("✅ Repartidor creado: Juan Pérez (juan_delivery / delivery123)");
            }
            
            // 7. Crear espacio si no existe
            var space = await dbContext.Spaces.FirstOrDefaultAsync(s => s.RestaurantId == 12 && s.Name == "Sala Principal");
            if (space == null)
            {
                space = new Space
                {
                    RestaurantId = 12,
                    Name = "Sala Principal",
                    Description = "Área principal del restaurante",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                dbContext.Spaces.Add(space);
                await dbContext.SaveChangesAsync();
                Log.Information("✅ Espacio creado: Sala Principal");
            }
            
            // 8. Crear mesas si no existen
            var table1 = await dbContext.Tables.FirstOrDefaultAsync(t => t.RestaurantId == 12 && t.Number == "1");
            if (table1 == null)
            {
                table1 = new Table
                {
                    RestaurantId = 12,
                    Number = "1",
                    Capacity = 4,
                    Location = "Frente",
                    Status = "Available",
                    SpaceId = space.Id,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                dbContext.Tables.Add(table1);
                await dbContext.SaveChangesAsync();
                Log.Information("✅ Mesa creada: Mesa 1");
            }
            
            var table2 = await dbContext.Tables.FirstOrDefaultAsync(t => t.RestaurantId == 12 && t.Number == "2");
            if (table2 == null)
            {
                table2 = new Table
                {
                    RestaurantId = 12,
                    Number = "2",
                    Capacity = 2,
                    Location = "Fondo",
                    Status = "Available",
                    SpaceId = space.Id,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                dbContext.Tables.Add(table2);
                await dbContext.SaveChangesAsync();
                Log.Information("✅ Mesa creado: Mesa 2");
            }
            
            var table3 = await dbContext.Tables.FirstOrDefaultAsync(t => t.RestaurantId == 12 && t.Number == "3");
            if (table3 == null)
            {
                table3 = new Table
                {
                    RestaurantId = 12,
                    Number = "3",
                    Capacity = 6,
                    Location = "Terraza",
                    Status = "Available",
                    SpaceId = space.Id,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                dbContext.Tables.Add(table3);
                await dbContext.SaveChangesAsync();
                Log.Information("✅ Mesa creada: Mesa 3");
            }
            
            Log.Information("🎉 Datos hardcodeados inicializados exitosamente para demostración.");
        }
        catch (Exception ex)
        {
            Log.Error(ex, "❌ Error al inicializar datos hardcodeados: {Message}", ex.Message);
            // No lanzar excepción, solo loguear el error para que la app pueda iniciar
        }
    }
}

app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Aplicación terminada inesperadamente");
}
finally
{
    Log.CloseAndFlush();
}

