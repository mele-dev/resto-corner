-- Script para agregar el campo RestaurantId a la tabla BusinessInfo
-- Ejecutar este script en la base de datos MySQL

-- Verificar si la columna ya existe antes de agregarla
SET @dbname = DATABASE();
SET @tablename = 'BusinessInfo';
SET @columnname = 'RestaurantId';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1', -- Si existe, no hacer nada
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT NOT NULL DEFAULT 1 COMMENT ''ID del restaurante (multi-tenant)'' AFTER Id')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Si ya hay registros en BusinessInfo sin RestaurantId, asignarles el restaurante 1 por defecto
-- (Solo si la columna no existía antes)
UPDATE BusinessInfo SET RestaurantId = 1 WHERE RestaurantId = 0 OR RestaurantId IS NULL;

-- Agregar índice único para asegurar que cada restaurante solo tenga una configuración
-- Primero eliminar el índice si existe
SET @indexname = 'IX_BusinessInfo_RestaurantId';
SET @preparedStatement2 = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (INDEX_NAME = @indexname)
  ) > 0,
  'SELECT 1', -- Si existe, no hacer nada
  CONCAT('CREATE UNIQUE INDEX ', @indexname, ' ON ', @tablename, ' (RestaurantId)')
));
PREPARE createIndexIfNotExists FROM @preparedStatement2;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;

-- Agregar foreign key constraint
SET @fkname = 'FK_BusinessInfo_Restaurants';
SET @preparedStatement3 = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (CONSTRAINT_NAME = @fkname)
  ) > 0,
  'SELECT 1', -- Si existe, no hacer nada
  CONCAT('ALTER TABLE ', @tablename, ' ADD CONSTRAINT ', @fkname, ' FOREIGN KEY (RestaurantId) REFERENCES Restaurants(Id) ON DELETE CASCADE')
));
PREPARE createFKIfNotExists FROM @preparedStatement3;
EXECUTE createFKIfNotExists;
DEALLOCATE PREPARE createFKIfNotExists;
