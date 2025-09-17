using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IO.Compression;
using System.Text;
using TechPrep.Infrastructure.Data;

namespace TechPrep.API.Controllers.Admin;

[ApiController]
[Route("api/admin/[controller]")]
[Authorize(Roles = "Admin")]
public class MaintenanceController : ControllerBase
{
    private readonly ILogger<MaintenanceController> _logger;
    private readonly IWebHostEnvironment _environment;
    private readonly TechPrepDbContext _db;

    public MaintenanceController(ILogger<MaintenanceController> logger, IWebHostEnvironment environment, TechPrepDbContext db)
    {
        _logger = logger;
        _environment = environment;
        _db = db;
    }

    [HttpPost("backup")]
    public async Task<IActionResult> CreateBackup()
    {
        try
        {
            var timestamp = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");
            var fileName = $"techprep_backup_{timestamp}.zip";

            // Resolve SQLite DB path from connection string
            var connStr = _db.Database.GetDbConnection().ConnectionString;
            var parts = connStr.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            var dataSource = parts.FirstOrDefault(p => p.StartsWith("Data Source", StringComparison.OrdinalIgnoreCase))?.Split('=', 2)[1];
            if (string.IsNullOrWhiteSpace(dataSource))
                return BadRequest(new { success = false, message = "Could not resolve database path from connection string" });

            var dbPath = Path.IsPathRooted(dataSource) ? dataSource : Path.Combine(_environment.ContentRootPath, dataSource);
            if (!System.IO.File.Exists(dbPath))
                return NotFound(new { success = false, message = $"Database file not found at {dbPath}" });

            var backupsDir = Path.Combine(_environment.ContentRootPath, "backups");
            Directory.CreateDirectory(backupsDir);
            var backupZipPath = Path.Combine(backupsDir, fileName);

            // Prepare related SQLite files (-wal, -shm) if present
            var walPath = dbPath + "-wal";
            var shmPath = dbPath + "-shm";

            using (var zipStream = new FileStream(backupZipPath, FileMode.Create, FileAccess.Write))
            using (var archive = new ZipArchive(zipStream, ZipArchiveMode.Create))
            {
                // Add DB file
                var dbEntry = archive.CreateEntry("database/techprep.db", CompressionLevel.Optimal);
                using (var entryStream = dbEntry.Open())
                using (var fileStream = new FileStream(dbPath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
                {
                    await fileStream.CopyToAsync(entryStream);
                }

                // Add -wal if exists
                if (System.IO.File.Exists(walPath))
                {
                    var walEntry = archive.CreateEntry("database/techprep.db-wal", CompressionLevel.Optimal);
                    using var walStream = walEntry.Open();
                    using var walFile = new FileStream(walPath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
                    await walFile.CopyToAsync(walStream);
                }

                // Add -shm if exists
                if (System.IO.File.Exists(shmPath))
                {
                    var shmEntry = archive.CreateEntry("database/techprep.db-shm", CompressionLevel.Optimal);
                    using var shmStream = shmEntry.Open();
                    using var shmFile = new FileStream(shmPath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
                    await shmFile.CopyToAsync(shmStream);
                }
            }

            var size = new FileInfo(backupZipPath).Length;
            _logger.LogInformation("Backup created successfully at {Path}", backupZipPath);

            return Ok(new
            {
                success = true,
                data = new
                {
                    fileName,
                    sizeBytes = size,
                    createdAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
                },
                message = "Backup created successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create backup");
            return BadRequest(new
            {
                success = false,
                message = "Failed to create backup",
                error = new
                {
                    code = "BACKUP_CREATION_ERROR",
                    message = ex.Message
                }
            });
        }
    }

    [HttpGet("backups")]
    public async Task<IActionResult> ListBackups()
    {
        try
        {
            var backupsDir = Path.Combine(_environment.ContentRootPath, "backups");
            Directory.CreateDirectory(backupsDir);
            var files = Directory.GetFiles(backupsDir, "techprep_backup_*.zip", SearchOption.TopDirectoryOnly)
                                 .OrderByDescending(f => f)
                                 .Select(f => new
                                 {
                                     fileName = Path.GetFileName(f),
                                     sizeBytes = new FileInfo(f).Length,
                                     createdAt = System.IO.File.GetCreationTimeUtc(f).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
                                 })
                                 .ToList();

            return Ok(new { success = true, data = files, message = "Backups retrieved successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to list backups");
            return BadRequest(new
            {
                success = false,
                message = "Failed to list backups",
                error = new
                {
                    code = "BACKUP_LIST_ERROR",
                    message = ex.Message
                }
            });
        }
    }

    [HttpGet("backups/{fileName}/download")]
    public async Task<IActionResult> DownloadBackup(string fileName)
    {
        try
        {
            var backupsDir = Path.Combine(_environment.ContentRootPath, "backups");
            var path = Path.Combine(backupsDir, fileName);
            if (!System.IO.File.Exists(path))
                return NotFound(new { success = false, message = "Backup file not found" });

            var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read);
            return File(stream, "application/zip", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to download backup {FileName}", fileName);
            return BadRequest(new
            {
                success = false,
                message = "Failed to download backup",
                error = new
                {
                    code = "BACKUP_DOWNLOAD_ERROR",
                    message = ex.Message
                }
            });
        }
    }

    [HttpPost("restore")]
    public async Task<IActionResult> RestoreBackup([FromForm] IFormFile backupFile)
    {
        try
        {
            if (backupFile == null || backupFile.Length == 0)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "No backup file provided",
                    error = new
                    {
                        code = "NO_FILE_PROVIDED",
                        message = "Please select a backup file to restore"
                    }
                });
            }

            if (!backupFile.FileName.EndsWith(".zip"))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Invalid file format",
                    error = new
                    {
                        code = "INVALID_FILE_FORMAT",
                        message = "Only ZIP files are supported"
                    }
                });
            }

            // Extract uploaded ZIP to temp
            var tempDir = Path.Combine(Path.GetTempPath(), $"techprep_restore_{Guid.NewGuid():N}");
            Directory.CreateDirectory(tempDir);
            var zipPath = Path.Combine(tempDir, backupFile.FileName);
            using (var fs = new FileStream(zipPath, FileMode.Create))
            {
                await backupFile.CopyToAsync(fs);
            }
            ZipFile.ExtractToDirectory(zipPath, tempDir);

            // Resolve DB destination path
            var connStr = _db.Database.GetDbConnection().ConnectionString;
            var parts = connStr.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            var dataSource = parts.FirstOrDefault(p => p.StartsWith("Data Source", StringComparison.OrdinalIgnoreCase))?.Split('=', 2)[1];
            if (string.IsNullOrWhiteSpace(dataSource))
                return BadRequest(new { success = false, message = "Could not resolve database path from connection string" });

            var dbPath = Path.IsPathRooted(dataSource) ? dataSource : Path.Combine(_environment.ContentRootPath, dataSource);

            // Copy restored DB files
            var restoredDb = Path.Combine(tempDir, "database", "techprep.db");
            var restoredWal = restoredDb + "-wal";
            var restoredShm = restoredDb + "-shm";

            if (!System.IO.File.Exists(restoredDb))
                return BadRequest(new { success = false, message = "Backup archive does not contain database file" });

            // Stop: In a real system, ensure no active connections here.
            System.IO.File.Copy(restoredDb, dbPath, overwrite: true);
            if (System.IO.File.Exists(restoredWal)) System.IO.File.Copy(restoredWal, dbPath + "-wal", overwrite: true);
            if (System.IO.File.Exists(restoredShm)) System.IO.File.Copy(restoredShm, dbPath + "-shm", overwrite: true);

            _logger.LogInformation("Database restored from backup: {FileName}", backupFile.FileName);

            return Ok(new
            {
                success = true,
                data = new { status = "Success", message = "Database restored. Restart application to ensure clean state." },
                message = "Restore completed successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to restore backup");
            return BadRequest(new
            {
                success = false,
                message = "Failed to restore backup",
                error = new
                {
                    code = "BACKUP_RESTORE_ERROR",
                    message = ex.Message
                }
            });
        }
    }

    // Removed mock backup generator; real backup implemented above
}
