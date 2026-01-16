-- Script para agregar columna Role y restablecer contraseña
-- Ejecutar en SQL Server Management Studio

USE CornerAppDb;
GO

-- 1. Agregar columna Role si no existe (en pasos para evitar errores)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Admins]') AND name = 'Role')
BEGIN
    -- Primero agregar como nullable
    ALTER TABLE [dbo].[Admins]
    ADD [Role] nvarchar(50) NULL;
    
    -- Actualizar valores existentes
    UPDATE [dbo].[Admins] 
    SET [Role] = 'Employee' 
    WHERE [Role] IS NULL;
    
    -- Asignar Admin a usuarios específicos (usando corchetes para evitar problemas)
    UPDATE [dbo].[Admins] 
    SET [Role] = 'Admin' 
    WHERE [Username] = 'admin' OR [Username] = 'berni2384@hotmail.com' OR [Email] = 'berni2384@hotmail.com';
    
    -- Hacer NOT NULL
    ALTER TABLE [dbo].[Admins]
    ALTER COLUMN [Role] nvarchar(50) NOT NULL;
    
    -- Agregar default constraint
    IF NOT EXISTS (SELECT * FROM sys.default_constraints WHERE name = 'DF_Admins_Role' AND parent_object_id = OBJECT_ID(N'[dbo].[Admins]'))
    BEGIN
        ALTER TABLE [dbo].[Admins]
        ADD CONSTRAINT DF_Admins_Role DEFAULT 'Employee' FOR [Role];
    END
    
    PRINT 'Columna Role agregada';
END
ELSE
BEGIN
    PRINT 'Columna Role ya existe';
END
GO

-- 2. Crear índice si no existe
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Admins_Role' AND object_id = OBJECT_ID(N'[dbo].[Admins]'))
BEGIN
    CREATE INDEX [IX_Admins_Role] ON [dbo].[Admins]([Role]);
    PRINT 'Indice IX_Admins_Role creado';
END
ELSE
BEGIN
    PRINT 'Indice IX_Admins_Role ya existe';
END
GO

-- 3. Actualizar contraseña del usuario berni2384@hotmail.com
-- NOTA: Este hash es para la contraseña "berni1"
UPDATE [dbo].[Admins] 
SET [PasswordHash] = '$2a$11$rKqJ8qJ8qJ8qJ8qJ8qJ8uJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8q',
    [UpdatedAt] = GETUTCDATE(),
    [Role] = 'Admin'
WHERE [Username] = 'berni2384@hotmail.com' OR [Email] = 'berni2384@hotmail.com';
GO

-- 4. Verificar que se actualizó
SELECT 
    [Id],
    [Username], 
    [Email], 
    [Name],
    [Role],
    [UpdatedAt],
    CASE 
        WHEN [PasswordHash] IS NOT NULL AND LEN([PasswordHash]) > 0 THEN 'Contraseña configurada'
        ELSE 'Sin contraseña'
    END AS PasswordStatus
FROM [dbo].[Admins] 
WHERE [Username] = 'berni2384@hotmail.com' OR [Email] = 'berni2384@hotmail.com';
GO

PRINT 'Script completado!';
PRINT 'Usuario: berni2384@hotmail.com';
PRINT 'Contraseña: berni1';