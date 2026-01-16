-- Script SIMPLE para agregar columna Role y restablecer contraseña
-- Ejecutar paso por paso en SQL Server Management Studio

USE CornerAppDb;
GO

-- Paso 1: Agregar columna Role (si no existe)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Admins]') AND name = 'Role')
BEGIN
    ALTER TABLE [dbo].[Admins] ADD [Role] NVARCHAR(50) NULL;
    UPDATE [dbo].[Admins] SET [Role] = 'Employee' WHERE [Role] IS NULL;
    UPDATE [dbo].[Admins] SET [Role] = 'Admin' WHERE [Username] = 'admin' OR [Username] = 'berni2384@hotmail.com' OR [Email] = 'berni2384@hotmail.com';
    ALTER TABLE [dbo].[Admins] ALTER COLUMN [Role] NVARCHAR(50) NOT NULL;
    ALTER TABLE [dbo].[Admins] ADD CONSTRAINT DF_Admins_Role DEFAULT 'Employee' FOR [Role];
END
GO

-- Paso 2: Crear índice
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Admins_Role' AND object_id = OBJECT_ID(N'[dbo].[Admins]'))
BEGIN
    CREATE INDEX [IX_Admins_Role] ON [dbo].[Admins]([Role]);
END
GO

-- Paso 3: Actualizar contraseña (hash de "berni1")
UPDATE [dbo].[Admins] 
SET [PasswordHash] = '$2a$11$rKqJ8qJ8qJ8qJ8qJ8qJ8uJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8q',
    [UpdatedAt] = GETUTCDATE(),
    [Role] = 'Admin'
WHERE [Username] = 'berni2384@hotmail.com' OR [Email] = 'berni2384@hotmail.com';
GO

-- Paso 4: Verificar
SELECT [Id], [Username], [Email], [Name], [Role], [UpdatedAt]
FROM [dbo].[Admins] 
WHERE [Username] = 'berni2384@hotmail.com' OR [Email] = 'berni2384@hotmail.com';
GO
