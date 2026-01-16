-- PASO 2: Crear índice
-- Ejecuta este bloque después del paso 1

USE CornerAppDb;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Admins_Role' AND object_id = OBJECT_ID(N'[dbo].[Admins]'))
BEGIN
    CREATE INDEX [IX_Admins_Role] ON [dbo].[Admins]([Role]);
END
GO
