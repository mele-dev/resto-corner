using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace CornerApp.API.Helpers;

/// <summary>
/// Helper para obtener información del restaurante desde el token JWT
/// </summary>
public static class RestaurantHelper
{
    /// <summary>
    /// Obtiene el RestaurantId del token JWT del usuario autenticado
    /// </summary>
    /// <param name="user">ClaimsPrincipal del usuario autenticado</param>
    /// <returns>RestaurantId del usuario, o lanza excepción si no se encuentra</returns>
    /// <exception cref="UnauthorizedAccessException">Si el RestaurantId no está en el token</exception>
    public static int GetRestaurantId(ClaimsPrincipal user)
    {
        var restaurantIdClaim = user.FindFirst("RestaurantId")?.Value;
        
        if (string.IsNullOrEmpty(restaurantIdClaim) || !int.TryParse(restaurantIdClaim, out int restaurantId))
        {
            throw new UnauthorizedAccessException("RestaurantId no encontrado en el token. Por favor, inicia sesión nuevamente.");
        }
        
        return restaurantId;
    }

    /// <summary>
    /// Obtiene el RestaurantId del token JWT del usuario autenticado (versión que retorna nullable)
    /// </summary>
    /// <param name="user">ClaimsPrincipal del usuario autenticado</param>
    /// <returns>RestaurantId del usuario, o null si no se encuentra</returns>
    public static int? GetRestaurantIdOrNull(ClaimsPrincipal user)
    {
        var restaurantIdClaim = user.FindFirst("RestaurantId")?.Value;
        
        if (string.IsNullOrEmpty(restaurantIdClaim) || !int.TryParse(restaurantIdClaim, out int restaurantId))
        {
            return null;
        }
        
        return restaurantId;
    }
}
