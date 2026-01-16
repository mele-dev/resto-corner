-- PASO 1: Agregar columna Role
-- Ejecuta solo este bloque primero

USE CornerAppDb;
GO

-- Primero agregar la columna como NULL
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Admins]') AND name = 'Role')
BEGIN
    ALTER TABLE [dbo].[Admins] ADD [Role] NVARCHAR(50) NULL;
END
GO

-- Luego actualizar los valores
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Admins]') AND name = 'Role')
BEGIN
    UPDATE [dbo].[Admins] SET [Role] = 'Employee' WHERE [Role] IS NULL;
    UPDATE [dbo].[Admins] SET [Role] = 'Admin' WHERE [Username] = 'admin' OR [Username] = 'berni2384@hotmail.com' OR [Email] = 'berni2384@hotmail.com';
    ALTER TABLE [dbo].[Admins] ALTER COLUMN [Role] NVARCHAR(50) NOT NULL;
    
    IF NOT EXISTS (SELECT * FROM sys.default_constraints WHERE name = 'DF_Admins_Role' AND parent_object_id = OBJECT_ID(N'[dbo].[Admins]'))
    BEGIN
        ALTER TABLE [dbo].[Admins] ADD CONSTRAINT DF_Admins_Role DEFAULT 'Employee' FOR [Role];
    END
END
GO
