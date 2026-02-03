-- Script para limpiar categorías y productos sin RestaurantId válido
-- Ejecutar este script en la base de datos para eliminar datos huérfanos

-- Eliminar categorías sin RestaurantId válido (RestaurantId <= 0)
DELETE FROM Categories WHERE RestaurantId <= 0;

-- Eliminar productos sin RestaurantId válido (RestaurantId <= 0)
DELETE FROM Products WHERE RestaurantId <= 0;

-- Verificar que se eliminaron correctamente
SELECT COUNT(*) as OrphanedCategories FROM Categories WHERE RestaurantId <= 0;
SELECT COUNT(*) as OrphanedProducts FROM Products WHERE RestaurantId <= 0;
