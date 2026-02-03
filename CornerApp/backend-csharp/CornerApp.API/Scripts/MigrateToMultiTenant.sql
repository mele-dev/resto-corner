-- Script de migración para Multi-Tenant
-- IMPORTANTE: Ejecutar ANTES de aplicar la migración AddMultiTenantSupport
-- Este script asume que ya existe la tabla Restaurants (creada por la migración)

-- Paso 1: Crear restaurante por defecto si no existe
IF NOT EXISTS (SELECT 1 FROM Restaurants WHERE Id = 1)
BEGIN
    INSERT INTO Restaurants (Name, Description, IsActive, CreatedAt)
    VALUES ('Restaurante Principal', 'Restaurante principal del sistema', 1, GETUTCDATE());
    
    -- Si la tabla tiene IDENTITY, obtener el ID real
    DECLARE @DefaultRestaurantId INT;
    SET @DefaultRestaurantId = SCOPE_IDENTITY();
    
    -- Si SCOPE_IDENTITY() es NULL, usar el ID 1
    IF @DefaultRestaurantId IS NULL
        SET @DefaultRestaurantId = 1;
END
ELSE
BEGIN
    SET @DefaultRestaurantId = 1;
END

-- Paso 2: Asignar todos los registros existentes al restaurante por defecto
-- (Estos UPDATEs se ejecutarán después de que la migración agregue las columnas RestaurantId)

-- Nota: Estos comandos deben ejecutarse DESPUÉS de aplicar la migración
-- ya que las columnas RestaurantId aún no existen

/*
-- Ejecutar DESPUÉS de aplicar la migración:

DECLARE @DefaultRestaurantId INT = 1; -- Ajustar si el ID es diferente

-- Actualizar Admins
UPDATE Admins 
SET RestaurantId = @DefaultRestaurantId 
WHERE RestaurantId IS NULL OR RestaurantId = 0;

-- Actualizar Orders
UPDATE Orders 
SET RestaurantId = @DefaultRestaurantId 
WHERE RestaurantId IS NULL OR RestaurantId = 0;

-- Actualizar Products
UPDATE Products 
SET RestaurantId = @DefaultRestaurantId 
WHERE RestaurantId IS NULL OR RestaurantId = 0;

-- Actualizar Categories
UPDATE Categories 
SET RestaurantId = @DefaultRestaurantId 
WHERE RestaurantId IS NULL OR RestaurantId = 0;

-- Actualizar Tables
UPDATE Tables 
SET RestaurantId = @DefaultRestaurantId 
WHERE RestaurantId IS NULL OR RestaurantId = 0;

-- Actualizar Spaces
UPDATE Spaces 
SET RestaurantId = @DefaultRestaurantId 
WHERE RestaurantId IS NULL OR RestaurantId = 0;

-- Actualizar DeliveryPersons
UPDATE DeliveryPersons 
SET RestaurantId = @DefaultRestaurantId 
WHERE RestaurantId IS NULL OR RestaurantId = 0;

-- Actualizar CashRegisters
UPDATE CashRegisters 
SET RestaurantId = @DefaultRestaurantId 
WHERE RestaurantId IS NULL OR RestaurantId = 0;

-- Customer es opcional (puede ser NULL)
-- UPDATE Customers SET RestaurantId = @DefaultRestaurantId WHERE RestaurantId IS NULL;
*/
