using MySqlConnector;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using CornerApp.API.Data;
using System.Data;
using System.Diagnostics;

namespace CornerApp.API.Services;

/// <summary>
/// </summary>
public class DatabaseBackupService : IDatabaseBackupService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<DatabaseBackupService> _logger;
    private readonly string _backupDirectory;
    private readonly string _connectionString;

    public DatabaseBackupService(
        ApplicationDbContext context,
        IConfiguration configuration,
        ILogger<DatabaseBackupService> logger)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;
        
        // Obtener connection string
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        // Configurar directorio de backups
        var backupPath = configuration["Backup:Directory"] ?? "backups";
        _backupDirectory = Path.IsPathRooted(backupPath)
            ? backupPath
            : Path.Combine(Directory.GetCurrentDirectory(), backupPath);

        // Crear directorio si no existe
        if (!Directory.Exists(_backupDirectory))
        {
            Directory.CreateDirectory(_backupDirectory);
            _logger.LogInformation("Directorio de backups creado: {BackupDirectory}", _backupDirectory);
        }
    }

    public async Task<BackupResult> CreateBackupAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var databaseName = ExtractDatabaseName(_connectionString);
            var timestamp = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");
            var backupFileName = $"{databaseName}_backup_{timestamp}.sql";
            var backupFilePath = Path.Combine(_backupDirectory, backupFileName);

            _logger.LogInformation("Iniciando backup de base de datos MySQL: {DatabaseName}", databaseName);

            var csBuilder = new MySqlConnectionStringBuilder(_connectionString);

            // usar mysqldump para crear el backup
            var processStartInfo = new ProcessStartInfo
            {
                FileName = "mysqldump",
                Arguments = $"--host={csBuilder.Server} --port={csBuilder.Port} --user={csBuilder.UserID} --password={csBuilder.Password} --single-transaction --routines --triggers --databases {databaseName}",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var process = Process.Start(processStartInfo);
            if (process == null)
            {
                throw new InvalidOperationException("No se pudo iniciar mysqldump. Verificá que esté instalado.");
            }

            var output = await process.StandardOutput.ReadToEndAsync();
            var error = await process.StandardError.ReadToEndAsync();
            await process.WaitForExitAsync(cancellationToken);

            if (process.ExitCode != 0)
            {
                throw new InvalidOperationException($"mysqldump falló con código {process.ExitCode}: {error}");
            }

            await File.WriteAllTextAsync(backupFilePath, output, cancellationToken);

            var fileInfo = new FileInfo(backupFilePath);
            var result = new BackupResult
            {
                Success = true,
                BackupFilePath = backupFilePath,
                FileSizeBytes = fileInfo.Length,
                CreatedAt = DateTime.UtcNow
            };

            _logger.LogInformation(
                "Backup completado exitosamente: {BackupFilePath} ({FileSize} bytes)",
                backupFilePath,
                fileInfo.Length);

            // Limpiar backups antiguos si está configurado
            await CleanupOldBackupsAsync(cancellationToken);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear backup de base de datos");
            return new BackupResult
            {
                Success = false,
                ErrorMessage = ex.Message,
                CreatedAt = DateTime.UtcNow
            };
        }
    }

    public async Task<List<BackupInfo>> GetBackupHistoryAsync()
    {
        try
        {
            if (!Directory.Exists(_backupDirectory))
            {
                return new List<BackupInfo>();
            }

            var backupFiles = Directory.GetFiles(_backupDirectory, "*.sql")
                .Select(filePath =>
                {
                    var fileInfo = new FileInfo(filePath);
                    return new BackupInfo
                    {
                        FilePath = filePath,
                        FileSizeBytes = fileInfo.Length,
                        CreatedAt = fileInfo.CreationTimeUtc
                    };
                })
                .OrderByDescending(b => b.CreatedAt)
                .ToList();

            return await Task.FromResult(backupFiles);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener historial de backups");
            return new List<BackupInfo>();
        }
    }

    public async Task<bool> RestoreBackupAsync(string backupFilePath, CancellationToken cancellationToken = default)
    {
        try
        {
            if (!File.Exists(backupFilePath))
            {
                _logger.LogError("Archivo de backup no encontrado: {BackupFilePath}", backupFilePath);
                return false;
            }

            var databaseName = ExtractDatabaseName(_connectionString);
            
            _logger.LogWarning("Iniciando restauración de backup: {BackupFilePath} a base de datos: {DatabaseName}", 
                backupFilePath, databaseName);

            var csBuilder = new MySqlConnectionStringBuilder(_connectionString);

            var processStartInfo = new ProcessStartInfo
            {
                FileName = "mysql",
                Arguments = $"--host={csBuilder.Server} --port={csBuilder.Port} --user={csBuilder.UserID} --password={csBuilder.Password} {databaseName}",
                RedirectStandardInput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var process = Process.Start(processStartInfo);
            if (process == null)
            {
                throw new InvalidOperationException("No se pudo iniciar mysql client. Verificá que esté instalado.");
            }

            var sqlContent = await File.ReadAllTextAsync(backupFilePath, cancellationToken);
            await process.StandardInput.WriteAsync(sqlContent);
            process.StandardInput.Close();

            var error = await process.StandardError.ReadToEndAsync();
            await process.WaitForExitAsync(cancellationToken);

            if (process.ExitCode != 0)
            {
                throw new InvalidOperationException($"mysql restore falló con código {process.ExitCode}: {error}");
            }

            _logger.LogInformation("Backup restaurado exitosamente: {BackupFilePath}", backupFilePath);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al restaurar backup: {BackupFilePath}", backupFilePath);
            return false;
        }
    }

    private string ExtractDatabaseName(string connectionString)
    {
        var builder = new MySqlConnectionStringBuilder(connectionString);
        return builder.Database ?? "CornerAppDb";
    }

    private async Task CleanupOldBackupsAsync(CancellationToken cancellationToken)
    {
        try
        {
            var maxBackups = _configuration.GetValue<int>("Backup:MaxBackups", 10);
            var retentionDays = _configuration.GetValue<int>("Backup:RetentionDays", 30);

            if (!Directory.Exists(_backupDirectory))
            {
                return;
            }

            var backupFiles = Directory.GetFiles(_backupDirectory, "*.sql")
                .Select(f => new FileInfo(f))
                .OrderByDescending(f => f.CreationTimeUtc)
                .ToList();

            // Eliminar backups más antiguos que el límite de cantidad
            if (backupFiles.Count > maxBackups)
            {
                var filesToDelete = backupFiles.Skip(maxBackups).ToList();
                foreach (var file in filesToDelete)
                {
                    try
                    {
                        File.Delete(file.FullName);
                        _logger.LogInformation("Backup antiguo eliminado: {FilePath}", file.FullName);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "No se pudo eliminar backup antiguo: {FilePath}", file.FullName);
                    }
                }
            }

            // Eliminar backups más antiguos que el período de retención
            var cutoffDate = DateTime.UtcNow.AddDays(-retentionDays);
            var oldFiles = backupFiles
                .Where(f => f.CreationTimeUtc < cutoffDate)
                .ToList();

            foreach (var file in oldFiles)
            {
                try
                {
                    File.Delete(file.FullName);
                    _logger.LogInformation("Backup expirado eliminado: {FilePath} (creado: {CreatedAt})", 
                        file.FullName, file.CreationTimeUtc);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "No se pudo eliminar backup expirado: {FilePath}", file.FullName);
                }
            }

            await Task.CompletedTask;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al limpiar backups antiguos");
        }
    }
}
