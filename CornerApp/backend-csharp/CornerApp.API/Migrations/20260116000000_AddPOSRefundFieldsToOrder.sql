-- Migración: AddPOSRefundFieldsToOrder
-- Fecha: 2026-01-16
-- Descripción: Agrega campos para almacenar información de devoluciones POS en la tabla Orders

-- Verificar si las columnas ya existen antes de agregarlas
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Orders]') AND name = 'POSRefundTransactionId')
BEGIN
    ALTER TABLE [dbo].[Orders]
    ADD [POSRefundTransactionId] bigint NULL;
    PRINT 'Columna POSRefundTransactionId agregada exitosamente';
END
ELSE
BEGIN
    PRINT 'Columna POSRefundTransactionId ya existe';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Orders]') AND name = 'POSRefundTransactionIdString')
BEGIN
    ALTER TABLE [dbo].[Orders]
    ADD [POSRefundTransactionIdString] nvarchar(max) NULL;
    PRINT 'Columna POSRefundTransactionIdString agregada exitosamente';
END
ELSE
BEGIN
    PRINT 'Columna POSRefundTransactionIdString ya existe';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Orders]') AND name = 'POSRefundTransactionDateTime')
BEGIN
    ALTER TABLE [dbo].[Orders]
    ADD [POSRefundTransactionDateTime] nvarchar(max) NULL;
    PRINT 'Columna POSRefundTransactionDateTime agregada exitosamente';
END
ELSE
BEGIN
    PRINT 'Columna POSRefundTransactionDateTime ya existe';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Orders]') AND name = 'POSRefundResponse')
BEGIN
    ALTER TABLE [dbo].[Orders]
    ADD [POSRefundResponse] nvarchar(max) NULL;
    PRINT 'Columna POSRefundResponse agregada exitosamente';
END
ELSE
BEGIN
    PRINT 'Columna POSRefundResponse ya existe';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Orders]') AND name = 'POSRefundedAt')
BEGIN
    ALTER TABLE [dbo].[Orders]
    ADD [POSRefundedAt] datetime2 NULL;
    PRINT 'Columna POSRefundedAt agregada exitosamente';
END
ELSE
BEGIN
    PRINT 'Columna POSRefundedAt ya existe';
END
GO

PRINT 'Migración completada exitosamente';
