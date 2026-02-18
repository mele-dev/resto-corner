-- Script para eliminar TODOS los datos y empezar desde cero
-- ⚠️ ADVERTENCIA: Este script eliminará TODOS los datos de la base de datos
-- Ejecutar con precaución. Hacer backup antes de ejecutar.

-- Deshabilitar temporalmente las verificaciones de foreign keys
SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar datos en orden (de tablas dependientes a principales)

-- 1. Eliminar historial de estados de pedidos
DELETE FROM OrderStatusHistory;

-- 2. Eliminar pedidos (esto también eliminará OrderItems y OrderItemSubProducts por cascada)
DELETE FROM Orders;

-- 3. Eliminar cajas de repartidores
DELETE FROM DeliveryCashRegisters;

-- 4. Eliminar cajas de mesas
DELETE FROM CashRegisters;

-- 5. Eliminar mesas
DELETE FROM Tables;

-- 6. Eliminar espacios
DELETE FROM Spaces;

-- 7. Eliminar subproductos (guarniciones)
DELETE FROM SubProducts;

-- 8. Eliminar productos
DELETE FROM Products;

-- 9. Eliminar categorías
DELETE FROM Categories;

-- 10. Eliminar clientes
DELETE FROM Customers;

-- 11. Eliminar repartidores
DELETE FROM DeliveryPersons;

-- 12. Eliminar administradores (admins y mozos)
DELETE FROM Admins;

-- 13. Eliminar información de negocio
DELETE FROM BusinessInfo;

-- 14. Eliminar configuración de zonas de entrega
DELETE FROM DeliveryZoneConfigs;

-- 15. Eliminar configuración de email
DELETE FROM EmailConfigs;

-- 16. Eliminar recompensas
DELETE FROM Rewards;

-- 17. Eliminar suscripciones de webhooks
DELETE FROM WebhookSubscriptions;

-- 18. Eliminar métodos de pago (opcional - comentar si quieres mantenerlos)
DELETE FROM PaymentMethods;

-- 19. Eliminar restaurantes (último, ya que todo depende de ellos)
DELETE FROM Restaurants;

-- Reiniciar auto-increment de las tablas principales
ALTER TABLE Restaurants AUTO_INCREMENT = 1;
ALTER TABLE Products AUTO_INCREMENT = 1;
ALTER TABLE Categories AUTO_INCREMENT = 1;
ALTER TABLE Orders AUTO_INCREMENT = 1;
ALTER TABLE Customers AUTO_INCREMENT = 1;
ALTER TABLE DeliveryPersons AUTO_INCREMENT = 1;
ALTER TABLE Admins AUTO_INCREMENT = 1;
ALTER TABLE Tables AUTO_INCREMENT = 1;
ALTER TABLE Spaces AUTO_INCREMENT = 1;
ALTER TABLE CashRegisters AUTO_INCREMENT = 1;
ALTER TABLE DeliveryCashRegisters AUTO_INCREMENT = 1;
ALTER TABLE SubProducts AUTO_INCREMENT = 1;
ALTER TABLE BusinessInfo AUTO_INCREMENT = 1;
ALTER TABLE DeliveryZoneConfigs AUTO_INCREMENT = 1;
ALTER TABLE EmailConfigs AUTO_INCREMENT = 1;
ALTER TABLE Rewards AUTO_INCREMENT = 1;
ALTER TABLE WebhookSubscriptions AUTO_INCREMENT = 1;
ALTER TABLE PaymentMethods AUTO_INCREMENT = 1;
ALTER TABLE OrderStatusHistory AUTO_INCREMENT = 1;

-- Rehabilitar las verificaciones de foreign keys
SET FOREIGN_KEY_CHECKS = 1;

-- Mensaje de confirmación
SELECT '✅ Todos los datos han sido eliminados. La base de datos está lista para empezar desde cero.' AS Resultado;
