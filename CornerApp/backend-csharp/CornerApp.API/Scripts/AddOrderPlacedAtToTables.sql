-- Script para agregar la columna OrderPlacedAt a la tabla Tables
-- Ejecutar este script si la migración no se aplica automáticamente

-- Agregar columna OrderPlacedAt si no existe
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Tables]') AND name = 'OrderPlacedAt')
BEGIN
    ALTER TABLE [Tables] ADD [OrderPlacedAt] datetime2 NULL;
    PRINT 'Columna OrderPlacedAt agregada exitosamente';
END
ELSE
BEGIN
    PRINT 'La columna OrderPlacedAt ya existe';
END

-- Agregar columna PositionX si no existe
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Tables]') AND name = 'PositionX')
BEGIN
    ALTER TABLE [Tables] ADD [PositionX] float NULL;
    PRINT 'Columna PositionX agregada exitosamente';
END
ELSE
BEGIN
    PRINT 'La columna PositionX ya existe';
END

-- Agregar columna PositionY si no existe
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Tables]') AND name = 'PositionY')
BEGIN
    ALTER TABLE [Tables] ADD [PositionY] float NULL;
    PRINT 'Columna PositionY agregada exitosamente';
END
ELSE
BEGIN
    PRINT 'La columna PositionY ya existe';
END

