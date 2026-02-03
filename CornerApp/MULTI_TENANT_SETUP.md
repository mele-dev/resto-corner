# Guía de Configuración Multi-Tenant (Múltiples Restaurantes)

## ✅ Cambios Realizados

Se ha modificado la aplicación para soportar múltiples restaurantes en una sola instancia. Los cambios principales incluyen:

### Backend

1. **Modelo Restaurant creado** (`Models/Restaurant.cs`)
   - Cada restaurante tiene su propia configuración
   - Relaciones con todas las entidades principales

2. **RestaurantId agregado a todas las entidades principales:**
   - Admin
   - Order
   - Product
   - Category
   - Table
   - Space
   - DeliveryPerson
   - Customer (opcional)
   - CashRegister

3. **Login modificado:**
   - Ahora requiere `restaurantId`, `username` y `password`
   - El token JWT incluye el `RestaurantId`
   - Verifica que el restaurante exista y esté activo

4. **ApplicationDbContext actualizado:**
   - Agregado `DbSet<Restaurant>`
   - Configuradas todas las relaciones con índices optimizados
   - Índices únicos ahora son por restaurante (ej: username único por restaurante)

### Frontend

1. **Login actualizado:**
   - Campo nuevo para "ID Restaurante"
   - Validación del ID del restaurante
   - Envío del `restaurantId` al backend

2. **AuthContext actualizado:**
   - Método `login` ahora acepta `restaurantId`
   - Interfaz `User` incluye `restaurantId` y `restaurantName`

## 📋 Pasos Siguientes Necesarios

### 1. Crear Migración de Base de Datos

```bash
cd backend-csharp/CornerApp.API
dotnet ef migrations add AddMultiTenantSupport
dotnet ef database update
```

**⚠️ IMPORTANTE:** Esta migración agregará `RestaurantId` a todas las tablas. Si ya tienes datos, necesitarás:

1. Crear un restaurante por defecto primero
2. Asignar todos los registros existentes a ese restaurante
3. O crear un script de migración personalizado

### 2. Crear Restaurante Inicial

Necesitas crear al menos un restaurante en la base de datos antes de poder hacer login. Puedes hacerlo de dos formas:

#### Opción A: Script SQL

```sql
-- Insertar restaurante por defecto
INSERT INTO Restaurants (Name, Description, IsActive, CreatedAt)
VALUES ('Restaurante Principal', 'Restaurante principal del sistema', 1, GETUTCDATE());

-- Obtener el ID del restaurante creado (ajustar según tu caso)
DECLARE @RestaurantId INT = SCOPE_IDENTITY();

-- Asignar todos los registros existentes al restaurante por defecto
UPDATE Admins SET RestaurantId = @RestaurantId WHERE RestaurantId IS NULL OR RestaurantId = 0;
UPDATE Orders SET RestaurantId = @RestaurantId WHERE RestaurantId IS NULL OR RestaurantId = 0;
UPDATE Products SET RestaurantId = @RestaurantId WHERE RestaurantId IS NULL OR RestaurantId = 0;
UPDATE Categories SET RestaurantId = @RestaurantId WHERE RestaurantId IS NULL OR RestaurantId = 0;
-- ... repetir para todas las tablas
```

#### Opción B: Endpoint de Creación

Crear un controlador para gestionar restaurantes (ver siguiente paso).

### 3. Crear Controlador de Restaurantes

Necesitas crear un controlador para gestionar restaurantes (CRUD). Ejemplo básico:

**`Controllers/RestaurantsController.cs`** (crear nuevo archivo):

```csharp
[ApiController]
[Route("admin/api/restaurants")]
[Authorize(Roles = "Admin")]
public class RestaurantsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    
    [HttpPost]
    public async Task<ActionResult> CreateRestaurant([FromBody] CreateRestaurantRequest request)
    {
        var restaurant = new Restaurant
        {
            Name = request.Name,
            Description = request.Description,
            Address = request.Address,
            Phone = request.Phone,
            Email = request.Email,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        
        _context.Restaurants.Add(restaurant);
        await _context.SaveChangesAsync();
        
        return Ok(restaurant);
    }
    
    [HttpGet]
    public async Task<ActionResult> GetRestaurants()
    {
        var restaurants = await _context.Restaurants
            .Where(r => r.IsActive)
            .Select(r => new { r.Id, r.Name, r.Description })
            .ToListAsync();
        
        return Ok(restaurants);
    }
}
```

### 4. Modificar Todos los Controladores

**⚠️ CRÍTICO:** Todos los controladores que consultan datos deben filtrar por `RestaurantId`. Necesitas:

1. Obtener el `RestaurantId` del token JWT en cada controlador
2. Filtrar todas las consultas por ese `RestaurantId`

Ejemplo de helper para obtener RestaurantId del token:

```csharp
private int GetRestaurantId()
{
    var restaurantIdClaim = User.FindFirst("RestaurantId")?.Value;
    if (string.IsNullOrEmpty(restaurantIdClaim) || !int.TryParse(restaurantIdClaim, out int restaurantId))
    {
        throw new UnauthorizedAccessException("RestaurantId no encontrado en el token");
    }
    return restaurantId;
}
```

Luego en cada consulta:

```csharp
var restaurantId = GetRestaurantId();
var products = await _context.Products
    .Where(p => p.RestaurantId == restaurantId)
    .ToListAsync();
```

### 5. Actualizar el Frontend para Mostrar Restaurante

Puedes mostrar el nombre del restaurante en el header o sidebar:

```tsx
const { user } = useAuth();
// Mostrar: user?.restaurantName
```

### 6. Consideraciones de Seguridad

- ✅ El `RestaurantId` está en el token JWT (no se puede falsificar fácilmente)
- ✅ Todas las consultas deben filtrar por `RestaurantId`
- ⚠️ Asegúrate de que ningún endpoint permita acceso cruzado entre restaurantes
- ⚠️ Los índices únicos ahora son por restaurante (mismo username puede existir en diferentes restaurantes)

### 7. Migración de Datos Existentes

Si ya tienes datos en producción:

1. **Backup completo de la base de datos**
2. Crear restaurante por defecto
3. Ejecutar script SQL para asignar todos los registros al restaurante por defecto
4. Verificar que todos los `RestaurantId` estén asignados
5. Aplicar la migración

### 8. Testing

Antes de poner en producción:

1. ✅ Probar login con diferentes `restaurantId`
2. ✅ Verificar que cada restaurante solo ve sus propios datos
3. ✅ Probar creación de productos, pedidos, etc. (deben asignarse al restaurante correcto)
4. ✅ Verificar que no se puede acceder a datos de otros restaurantes

## 🚀 Despliegue en Servidor

### Requisitos

1. **Base de datos:** SQL Server (recomendado para producción)
2. **Backend:** .NET 8.0 Runtime
3. **Frontend:** Node.js para build, luego servir archivos estáticos

### Pasos

1. **Backend:**
   ```bash
   cd backend-csharp/CornerApp.API
   dotnet publish -c Release -o ./publish
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm run build
   ```

3. **Configurar appsettings.json:**
   - Connection string a SQL Server
   - JWT Secret Key (variable de entorno recomendado)
   - CORS para permitir el frontend

4. **Variables de entorno recomendadas:**
   ```
   JWT_SECRET_KEY=tu-clave-secreta-muy-segura
   JWT_ISSUER=CornerApp
   JWT_AUDIENCE=CornerApp
   ConnectionStrings__DefaultConnection=Server=...;Database=...;...
   ```

## 📝 Notas Importantes

- **Usuarios existentes:** Necesitarán saber su `RestaurantId` para hacer login
- **Nuevos restaurantes:** Deben crearse primero antes de poder crear usuarios
- **Índices únicos:** Ahora son compuestos con `RestaurantId` (ej: username único por restaurante)
- **Performance:** Los índices están optimizados para consultas por restaurante

## 🔧 Próximas Mejoras Sugeridas

1. Panel de administración para crear/gestionar restaurantes
2. Selector de restaurante en el login (si un usuario tiene acceso a múltiples)
3. Dashboard super-admin para ver estadísticas de todos los restaurantes
4. Facturación por restaurante
5. Configuraciones específicas por restaurante (BusinessInfo, EmailConfig, etc.)
