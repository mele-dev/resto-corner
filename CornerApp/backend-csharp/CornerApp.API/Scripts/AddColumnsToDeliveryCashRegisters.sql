-- Script para agregar las nuevas columnas a la tabla DeliveryCashRegisters
-- Ejecutar este script si la tabla ya existe pero no tiene las nuevas columnas

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[DeliveryCashRegisters]') AND type in (N'U'))
BEGIN
    -- Agregar InitialAmount
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[DeliveryCashRegisters]') AND name = 'InitialAmount')
    BEGIN
        ALTER TABLE [dbo].[DeliveryCashRegisters] ADD [InitialAmount] decimal(18,2) NOT NULL DEFAULT 0;
        PRINT 'Columna InitialAmount agregada';
    END
    ELSE
        PRINT 'Columna InitialAmount ya existe';

    -- Agregar FinalAmount
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[DeliveryCashRegisters]') AND name = 'FinalAmount')
    BEGIN
        ALTER TABLE [dbo].[DeliveryCashRegisters] ADD [FinalAmount] decimal(18,2) NULL;
        PRINT 'Columna FinalAmount agregada';
    END
    ELSE
        PRINT 'Columna FinalAmount ya existe';

    -- Agregar TotalSales
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[DeliveryCashRegisters]') AND name = 'TotalSales')
    BEGIN
        ALTER TABLE [dbo].[DeliveryCashRegisters] ADD [TotalSales] decimal(18,2) NOT NULL DEFAULT 0;
        PRINT 'Columna TotalSales agregada';
    END
    ELSE
        PRINT 'Columna TotalSales ya existe';

    -- Agregar TotalCash
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[DeliveryCashRegisters]') AND name = 'TotalCash')
    BEGIN
        ALTER TABLE [dbo].[DeliveryCashRegisters] ADD [TotalCash] decimal(18,2) NOT NULL DEFAULT 0;
        PRINT 'Columna TotalCash agregada';
    END
    ELSE
        PRINT 'Columna TotalCash ya existe';

    -- Agregar TotalPOS
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[DeliveryCashRegisters]') AND name = 'TotalPOS')
    BEGIN
        ALTER TABLE [dbo].[DeliveryCashRegisters] ADD [TotalPOS] decimal(18,2) NOT NULL DEFAULT 0;
        PRINT 'Columna TotalPOS agregada';
    END
    ELSE
        PRINT 'Columna TotalPOS ya existe';

    -- Agregar TotalTransfer
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[DeliveryCashRegisters]') AND name = 'TotalTransfer')
    BEGIN
        ALTER TABLE [dbo].[DeliveryCashRegisters] ADD [TotalTransfer] decimal(18,2) NOT NULL DEFAULT 0;
        PRINT 'Columna TotalTransfer agregada';
    END
    ELSE
        PRINT 'Columna TotalTransfer ya existe';
END
ELSE
    PRINT 'La tabla DeliveryCashRegisters no existe';
