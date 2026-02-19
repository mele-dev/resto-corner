namespace CornerApp.API.DTOs;

/// <summary>
/// DTO para crear un restaurante
/// </summary>
public class CreateRestaurantRequest
{
    [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "El nombre del restaurante es requerido")]
    public string Name { get; set; } = string.Empty;

    // Identifier es opcional - se generará automáticamente si no se proporciona
    public string? Identifier { get; set; }

    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }

    // Datos del usuario admin inicial
    [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "El nombre del usuario admin es requerido")]
    public string AdminName { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "El username del usuario admin es requerido")]
    public string AdminUsername { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "La contraseña del usuario admin es requerida")]
    public string AdminPassword { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "El email del usuario admin es requerido")]
    [System.ComponentModel.DataAnnotations.EmailAddress(ErrorMessage = "El email debe ser válido")]
    public string AdminEmail { get; set; } = string.Empty;
}

/// <summary>
/// DTO para actualizar un restaurante
/// </summary>
public class UpdateRestaurantRequest
{
    public string? Name { get; set; }
    public string? Identifier { get; set; }
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public bool? IsActive { get; set; }
}
