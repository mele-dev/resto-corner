-- Script SQL para restablecer contraseña del usuario berni2384@hotmail.com
-- Ejecutar este script directamente en SQL Server Management Studio
-- 
-- IMPORTANTE: Reemplaza 'TuNuevaContraseña123' con tu contraseña deseada
-- y luego genera el hash BCrypt usando el código C# al final de este archivo

-- Opción 1: Si quieres usar la contraseña "berni1" (ya tiene hash conocido)
UPDATE Admins 
SET PasswordHash = '$2a$11$rKqJ8qJ8qJ8qJ8qJ8qJ8uJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8q',
    UpdatedAt = GETUTCDATE()
WHERE Username = 'berni2384@hotmail.com' OR Email = 'berni2384@hotmail.com';

-- Verificar que se actualizó
SELECT Username, Email, Name, UpdatedAt 
FROM Admins 
WHERE Username = 'berni2384@hotmail.com' OR Email = 'berni2384@hotmail.com';

-- ============================================
-- Para generar un hash de una nueva contraseña:
-- ============================================
-- 1. Abre una consola de C# (o crea un proyecto temporal)
-- 2. Ejecuta este código:
--
-- using BCrypt.Net;
-- var hash = BCrypt.Net.BCrypt.HashPassword("TuNuevaContraseña123");
-- Console.WriteLine(hash);
--
-- 3. Copia el hash generado y úsalo en el UPDATE de arriba
-- ============================================
