# Agregar Campo DollarExchangeRate a BusinessInfo

Este script agrega el campo `DollarExchangeRate` a la tabla `BusinessInfo` para permitir la configuración del tipo de cambio del dólar.

## Instrucciones

### Opción 1: Ejecutar Script SQL Directamente (Recomendado)

1. Conectarse a la base de datos MySQL:
   ```bash
   mysql -u usuario -p nombre_base_datos
   ```

2. Ejecutar el script:
   ```sql
   source Scripts/AddDollarExchangeRateToBusinessInfo.sql
   ```

   O copiar y pegar el contenido del archivo `AddDollarExchangeRateToBusinessInfo.sql` directamente en la consola de MySQL.

### Opción 2: Usar Entity Framework Migrations

Si prefieres usar migraciones de Entity Framework:

```bash
cd CornerApp/backend-csharp/CornerApp.API
dotnet ef migrations add AddDollarExchangeRateToBusinessInfo
dotnet ef database update
```

### Verificación

Después de ejecutar el script, verificar que la columna fue agregada:

```sql
DESCRIBE BusinessInfo;
```

O:

```sql
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'BusinessInfo' 
AND COLUMN_NAME = 'DollarExchangeRate';
```

La columna `DollarExchangeRate` debería aparecer como `DECIMAL(18,2)` y `NULL`.

## Notas

- El campo es opcional (nullable), por lo que los registros existentes no se verán afectados.
- El tipo de cambio se puede configurar desde la interfaz de administración en Configuración → Información del Negocio.
- Si el tipo de cambio no está configurado, solo se permitirán pagos en pesos (UYU).
