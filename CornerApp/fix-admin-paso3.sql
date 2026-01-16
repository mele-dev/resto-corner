-- PASO 3: Actualizar contraseña
-- Ejecuta este bloque después del paso 2
-- Contraseña: berni1

USE CornerAppDb;
GO

UPDATE [dbo].[Admins] 
SET [PasswordHash] = '$2a$11$rKqJ8qJ8qJ8qJ8qJ8qJ8uJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8q',
    [UpdatedAt] = GETUTCDATE(),
    [Role] = 'Admin'
WHERE [Username] = 'berni2384@hotmail.com' OR [Email] = 'berni2384@hotmail.com';
GO

-- Verificar
SELECT [Id], [Username], [Email], [Name], [Role], [UpdatedAt]
FROM [dbo].[Admins] 
WHERE [Username] = 'berni2384@hotmail.com' OR [Email] = 'berni2384@hotmail.com';
GO
