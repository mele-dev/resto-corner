using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using CornerApp.API.Models;
using CornerApp.API.Data;
using CornerApp.API.DTOs;
using CornerApp.API.Helpers;
using CornerApp.API.Services;

namespace CornerApp.API.Controllers;

[ApiController]
[Route("api/products")]
[Tags("Productos")]
public class ProductsController : ControllerBase
{
    private readonly ILogger<ProductsController> _logger;
    private readonly ApplicationDbContext _context;
    private readonly ICacheService _cache;
    private readonly IMetricsService? _metricsService;
    private const string PRODUCTS_CACHE_KEY = "products_list";
    private static readonly TimeSpan CACHE_DURATION = TimeSpan.FromMinutes(5);

    public ProductsController(ILogger<ProductsController> logger, ApplicationDbContext context, ICacheService cache, IMetricsService? metricsService = null)
    {
        _logger = logger;
        _context = context;
        _cache = cache;
        _metricsService = metricsService;
    }

    /// <summary>
    /// Obtiene todos los productos disponibles.
    /// - Para clientes: devuelve productos de todos los restaurantes que tengan productos disponibles
    /// - Para admins/empleados: devuelve productos solo del restaurante del usuario autenticado
    /// </summary>
    [HttpGet]
    [ResponseCache(Duration = 300, Location = ResponseCacheLocation.Any, VaryByQueryKeys = new[] { "*" })]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts([FromQuery] bool? forceRefresh = false)
    {
        try
        {
            // Determinar si el usuario es un cliente (no tiene rol) o admin/empleado (tiene rol)
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var isCustomer = string.IsNullOrEmpty(userRole);
            
            int? restaurantId = null;
            
            // Si es admin/empleado, usar el RestaurantId del token para filtrar
            // Si es cliente, ignorar el RestaurantId y devolver productos de todos los restaurantes
            if (!isCustomer)
            {
                restaurantId = RestaurantHelper.GetRestaurantIdOrNull(User);
            }
            // Si es cliente, restaurantId permanece null para obtener productos de todos los restaurantes
            
            _logger.LogInformation("GetProducts - Usuario: {UserType}, RestaurantId: {RestaurantId}, TieneRol: {HasRole}", 
                isCustomer ? "Cliente" : "Admin/Empleado", 
                restaurantId?.ToString() ?? "null (todos los restaurantes)",
                !string.IsNullOrEmpty(userRole));
            
            // Usar una clave de cache específica por restaurante o "all" si es null
            var cacheKey = restaurantId.HasValue 
                ? $"{PRODUCTS_CACHE_KEY}_{restaurantId.Value}" 
                : $"{PRODUCTS_CACHE_KEY}_all";

            // Si se fuerza la recarga, saltar el cache
            if (forceRefresh == true)
            {
                await _cache.RemoveAsync(cacheKey);
                _logger.LogInformation("Cache invalidado por forceRefresh=true para clave: {CacheKey}", cacheKey);
            }

            // Intentar obtener desde cache
            var cachedProducts = await _cache.GetAsync<List<object>>(cacheKey);
            if (cachedProducts != null && forceRefresh != true)
            {
                // Registrar cache hit
                _metricsService?.RecordCacheHit(cacheKey);
                
                // Generar ETag para productos cacheados
                var cachedETag = ETagHelper.GenerateETag(cachedProducts);
                
                // Verificar si el cliente tiene el mismo ETag (304 Not Modified)
                var cachedClientETag = Request.Headers["If-None-Match"].ToString();
                if (!string.IsNullOrEmpty(cachedClientETag) && ETagHelper.IsETagValid(cachedClientETag, cachedETag))
                {
                    _logger.LogInformation("Productos no han cambiado (ETag match desde cache) para restaurante {RestaurantId}: {Count}", restaurantId?.ToString() ?? "all", cachedProducts.Count);
                    return StatusCode(304); // Not Modified
                }

                // Agregar ETag al header de respuesta
                Response.Headers.Append("ETag", cachedETag);
                
                _logger.LogInformation("Productos obtenidos desde cache para restaurante {RestaurantId}: {Count}", restaurantId?.ToString() ?? "all", cachedProducts.Count);
                return Ok(cachedProducts);
            }
            
            // Registrar cache miss
            _metricsService?.RecordCacheMiss(cacheKey);

            // Obtener productos de la base de datos con categorías y restaurantes
            // Si restaurantId es null (cliente), devolver productos de todos los restaurantes
            // Si restaurantId tiene valor (admin/empleado), filtrar por ese restaurante
            var query = _context.Products
                .AsNoTracking()
                .Include(p => p.Category)
                .Include(p => p.Restaurant)
                .Where(p => p.IsAvailable && p.RestaurantId > 0)
                .AsQueryable();

            if (restaurantId.HasValue)
            {
                // Filtrar por restaurante específico (solo para admins/empleados)
                query = query.Where(p => p.RestaurantId == restaurantId.Value);
            }
            // Si restaurantId es null (cliente), no filtrar (devolver todos los productos de todos los restaurantes)

            var products = await query
                .OrderBy(p => p.RestaurantId) // Agrupar por restaurante primero
                .ThenBy(p => p.DisplayOrder)
                .ThenBy(p => p.CreatedAt)
                .ToListAsync();

            // Mapear a formato simple para el frontend (evitar referencias circulares)
            // Incluir restaurantId y restaurantName en la respuesta para que el frontend pueda agrupar por restaurante
            var productsResponse = products.Select(p => new
            {
                id = p.Id,
                name = p.Name ?? string.Empty,
                category = p.Category?.Name ?? string.Empty,
                categoryId = p.CategoryId,
                description = p.Description ?? string.Empty,
                price = p.Price,
                image = p.Image ?? string.Empty,
                restaurantId = p.RestaurantId, // Incluir restaurantId para agrupar en el frontend
                restaurantName = p.Restaurant?.Name ?? string.Empty, // Incluir nombre del restaurante
                isAvailable = p.IsAvailable,
                displayOrder = p.DisplayOrder,
                isRecommended = p.IsRecommended
            }).ToList<object>();

            // Guardar en cache con clave específica por restaurante o "all"
            await _cache.SetAsync(cacheKey, productsResponse, CACHE_DURATION);

            // Generar ETag
            var etag = ETagHelper.GenerateETag(productsResponse);
            
            // Verificar si el cliente tiene el mismo ETag (304 Not Modified)
            var clientETag = Request.Headers["If-None-Match"].ToString();
            if (!string.IsNullOrEmpty(clientETag) && ETagHelper.IsETagValid(clientETag, etag))
            {
                _logger.LogInformation("Productos no han cambiado (ETag match) para restaurante {RestaurantId}: {Count}", restaurantId?.ToString() ?? "all", productsResponse.Count);
                return StatusCode(304); // Not Modified
            }

            // Agregar ETag al header de respuesta
            Response.Headers.Append("ETag", etag);
            
            _logger.LogInformation("Productos obtenidos de BD y guardados en cache para restaurante {RestaurantId} (Usuario: {UserType}): {Count}", 
                restaurantId?.ToString() ?? "all", 
                isCustomer ? "Cliente" : "Admin/Empleado",
                productsResponse.Count);
            return Ok(productsResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener productos: {Message}", ex.Message);
            _logger.LogError(ex, "Stack trace: {StackTrace}", ex.StackTrace);
            return StatusCode(500, new { 
                error = "Error al obtener productos", 
                message = ex.Message,
                details = ex.InnerException?.Message 
            });
        }
    }

    // NOTA: Los métodos InitializeDatabaseAsync y CreateInitialProductsAsync fueron eliminados
    // porque cada restaurante debe crear sus propias categorías y productos.
    // No se deben crear datos globales en un sistema multi-tenant.

    /// <summary>
    /// Obtiene un producto por ID (solo del restaurante del usuario)
    /// </summary>
    [HttpGet("{id}")]
    [ResponseCache(Duration = 300, Location = ResponseCacheLocation.Any, VaryByHeader = "Accept")]
    public async Task<ActionResult<Product>> GetProduct(int id)
    {
        var restaurantId = RestaurantHelper.GetRestaurantId(User);
        
        // Usar AsNoTracking para operaciones de solo lectura
        // Filtrar por RestaurantId para multi-tenant
        var product = await _context.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id && p.RestaurantId == restaurantId);
        
        if (product == null)
        {
            return NotFound(new { error = "Producto no encontrado o no pertenece a tu restaurante" });
        }
        
        return Ok(product);
    }

    /// <summary>
    /// Crea un nuevo producto (asignado automáticamente al restaurante del usuario)
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct([FromBody] CreateProductRequest request)
    {
        try
        {
            var restaurantId = RestaurantHelper.GetRestaurantId(User);
            
            // Validar que la categoría existe y pertenece al mismo restaurante
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == request.CategoryId && c.RestaurantId == restaurantId);
            
            if (category == null)
            {
                return BadRequest(new { error = $"La categoría con ID {request.CategoryId} no existe o no pertenece a tu restaurante" });
            }

            var product = new Product
            {
                RestaurantId = restaurantId,
                Name = request.Name,
                Description = request.Description ?? string.Empty,
                Price = request.Price,
                Image = request.Image ?? string.Empty,
                CategoryId = request.CategoryId,
                IsAvailable = request.IsAvailable,
                CreatedAt = DateTime.UtcNow
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // Invalidar cache de productos para este restaurante Y el cache "all" para clientes
            var cacheKey = $"{PRODUCTS_CACHE_KEY}_{restaurantId}";
            var cacheKeyAll = $"{PRODUCTS_CACHE_KEY}_all";
            await _cache.RemoveAsync(cacheKey);
            await _cache.RemoveAsync(cacheKeyAll);

            // Cargar la categoría para la respuesta
            await _context.Entry(product).Reference(p => p.Category).LoadAsync();

            _logger.LogInformation("Producto creado: {ProductId} - {ProductName}", product.Id, product.Name);
            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear producto");
            return StatusCode(500, new { error = "Error al crear el producto", details = ex.Message });
        }
    }

    /// <summary>
    /// Actualiza un producto completo (solo del restaurante del usuario)
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<Product>> UpdateProduct(int id, [FromBody] UpdateProductRequest request)
    {
        try
        {
            var restaurantId = RestaurantHelper.GetRestaurantId(User);
            
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == id && p.RestaurantId == restaurantId);
            
            if (product == null)
            {
                return NotFound(new { error = "Producto no encontrado o no pertenece a tu restaurante" });
            }

            // Validar que la categoría existe y pertenece al mismo restaurante
            if (request.CategoryId.HasValue)
            {
                var category = await _context.Categories
                    .FirstOrDefaultAsync(c => c.Id == request.CategoryId.Value && c.RestaurantId == restaurantId);
                
                if (category == null)
                {
                    return BadRequest(new { error = $"La categoría con ID {request.CategoryId.Value} no existe o no pertenece a tu restaurante" });
                }
                product.CategoryId = request.CategoryId.Value;
            }

            product.Name = request.Name ?? product.Name;
            product.Description = request.Description ?? product.Description;
            product.Price = request.Price ?? product.Price;
            product.Image = request.Image ?? product.Image;
            product.IsAvailable = request.IsAvailable ?? product.IsAvailable;
            product.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Invalidar cache de productos para este restaurante Y el cache "all" para clientes
            var cacheKey = $"{PRODUCTS_CACHE_KEY}_{restaurantId}";
            var cacheKeyAll = $"{PRODUCTS_CACHE_KEY}_all";
            await _cache.RemoveAsync(cacheKey);
            await _cache.RemoveAsync(cacheKeyAll);

            // Cargar la categoría para la respuesta
            await _context.Entry(product).Reference(p => p.Category).LoadAsync();

            _logger.LogInformation("Producto actualizado: {ProductId}", product.Id);
            return Ok(product);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar producto {ProductId}", id);
            return StatusCode(500, new { error = "Error al actualizar el producto", details = ex.Message });
        }
    }

    /// <summary>
    /// Actualiza parcialmente un producto (solo del restaurante del usuario)
    /// </summary>
    [HttpPatch("{id}")]
    public async Task<ActionResult<Product>> PatchProduct(int id, [FromBody] PatchProductRequest request)
    {
        try
        {
            var restaurantId = RestaurantHelper.GetRestaurantId(User);
            
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == id && p.RestaurantId == restaurantId);
            
            if (product == null)
            {
                return NotFound(new { error = "Producto no encontrado o no pertenece a tu restaurante" });
            }

            // Validar categoría si se proporciona y que pertenezca al mismo restaurante
            if (request.CategoryId.HasValue)
            {
                var category = await _context.Categories
                    .FirstOrDefaultAsync(c => c.Id == request.CategoryId.Value && c.RestaurantId == restaurantId);
                
                if (category == null)
                {
                    return BadRequest(new { error = $"La categoría con ID {request.CategoryId.Value} no existe o no pertenece a tu restaurante" });
                }
                product.CategoryId = request.CategoryId.Value;
            }

            if (request.Name != null) product.Name = request.Name;
            if (request.Description != null) product.Description = request.Description;
            if (request.Price.HasValue) product.Price = request.Price.Value;
            if (request.Image != null) product.Image = request.Image;
            if (request.IsAvailable.HasValue) product.IsAvailable = request.IsAvailable.Value;
            product.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Invalidar cache de productos para este restaurante Y el cache "all" para clientes
            var cacheKey = $"{PRODUCTS_CACHE_KEY}_{restaurantId}";
            var cacheKeyAll = $"{PRODUCTS_CACHE_KEY}_all";
            await _cache.RemoveAsync(cacheKey);
            await _cache.RemoveAsync(cacheKeyAll);

            // Cargar la categoría para la respuesta
            await _context.Entry(product).Reference(p => p.Category).LoadAsync();

            _logger.LogInformation("Producto actualizado (patch): {ProductId}", product.Id);
            return Ok(product);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar producto {ProductId}", id);
            return StatusCode(500, new { error = "Error al actualizar el producto", details = ex.Message });
        }
    }

    /// <summary>
    /// Elimina un producto permanentemente (solo del restaurante del usuario)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteProduct(int id)
    {
        try
        {
            var restaurantId = RestaurantHelper.GetRestaurantId(User);
            
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == id && p.RestaurantId == restaurantId);
            
            if (product == null)
            {
                return NotFound(new { error = "Producto no encontrado o no pertenece a tu restaurante" });
            }

            // Eliminar permanentemente el producto
            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            // Invalidar cache de productos para este restaurante Y el cache "all" para clientes
            var cacheKey = $"{PRODUCTS_CACHE_KEY}_{restaurantId}";
            var cacheKeyAll = $"{PRODUCTS_CACHE_KEY}_all";
            await _cache.RemoveAsync(cacheKey);
            await _cache.RemoveAsync(cacheKeyAll);

            _logger.LogInformation("Producto eliminado permanentemente: {ProductId}", id);
            return Ok(new { message = "Producto eliminado permanentemente" });
        }
        catch (DbUpdateException dbEx)
        {
            _logger.LogError(dbEx, "Error de base de datos al eliminar producto {ProductId}", id);
            // Verificar si el error es por restricción de clave foránea
            if (dbEx.InnerException?.Message.Contains("FOREIGN KEY") == true || 
                dbEx.InnerException?.Message.Contains("REFERENCE") == true)
            {
                return BadRequest(new { error = "No se puede eliminar el producto porque está asociado a pedidos existentes." });
            }
            return StatusCode(500, new { error = "Error al eliminar el producto", details = dbEx.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar producto {ProductId}", id);
            return StatusCode(500, new { error = "Error al eliminar el producto", details = ex.Message });
        }
    }

    /// <summary>
    /// Elimina permanentemente un producto (solo del restaurante del usuario)
    /// </summary>
    [HttpDelete("{id}/permanent")]
    public async Task<ActionResult> DeleteProductPermanent(int id)
    {
        try
        {
            var restaurantId = RestaurantHelper.GetRestaurantId(User);
            
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == id && p.RestaurantId == restaurantId);
            
            if (product == null)
            {
                return NotFound(new { error = "Producto no encontrado o no pertenece a tu restaurante" });
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Producto eliminado permanentemente: {ProductId}", id);
            return Ok(new { message = "Producto eliminado permanentemente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar producto permanentemente {ProductId}", id);
            return StatusCode(500, new { error = "Error al eliminar el producto", details = ex.Message });
        }
    }
}


