-- Script para limpiar espacios en blanco de usernames y emails de repartidores
-- Ejecutar en SQL Server Management Studio o desde la línea de comandos

USE CornerAppDb;
GO

-- Limpiar espacios en blanco de usernames
UPDATE DeliveryPersons 
SET Username = LTRIM(RTRIM(Username))
WHERE Username IS NOT NULL;

-- Limpiar espacios en blanco de emails
UPDATE DeliveryPersons 
SET Email = LTRIM(RTRIM(Email))
WHERE Email IS NOT NULL;

-- Convertir usernames a minúsculas (por si acaso)
UPDATE DeliveryPersons 
SET Username = LOWER(LTRIM(RTRIM(Username)))
WHERE Username IS NOT NULL;

-- Convertir emails a minúsculas (por si acaso)
UPDATE DeliveryPersons 
SET Email = LOWER(LTRIM(RTRIM(Email)))
WHERE Email IS NOT NULL;

-- Mostrar los resultados
SELECT 
    Id,
    Name,
    Username,
    Email,
    IsActive,
    CreatedAt
FROM DeliveryPersons
ORDER BY CreatedAt DESC;

PRINT '✅ Usernames y emails de repartidores limpiados exitosamente';
