using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace CornerApp.API.HealthChecks;

/// <summary>
/// Health check para verificar el estado del cache en memoria
/// </summary>
public class CacheHealthCheck : IHealthCheck
{
    private readonly IMemoryCache _cache;
    private readonly ILogger<CacheHealthCheck> _logger;

    public CacheHealthCheck(IMemoryCache cache, ILogger<CacheHealthCheck> logger)
    {
        _cache = cache;
        _logger = logger;
    }

    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Intentar escribir y leer del cache
            var testKey = $"health_check_{Guid.NewGuid()}";
            var testValue = DateTime.UtcNow.Ticks;

            // Usar MemoryCacheEntryOptions para especificar el tamaño cuando SizeLimit está configurado
            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(5),
                Size = 1 // Tamaño mínimo para el health check
            };
            
            _cache.Set(testKey, testValue, cacheOptions);
            
            if (_cache.TryGetValue(testKey, out long retrievedValue) && retrievedValue == testValue)
            {
                _cache.Remove(testKey);
                return Task.FromResult(HealthCheckResult.Healthy("Cache en memoria funcionando correctamente"));
            }

            return Task.FromResult(HealthCheckResult.Unhealthy("Cache en memoria no responde correctamente"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en health check de cache");
            return Task.FromResult(HealthCheckResult.Unhealthy("Error al verificar cache", ex));
        }
    }
}
