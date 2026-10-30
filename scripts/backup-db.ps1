# VORTEX GAMING — Automated Database & Data Store Backup Script (PowerShell)
# Backs up PostgreSQL database and local persistent JSON data store with timestamping and 7-day retention.

param (
    [string]$BackupDir = "backups",
    [int]$RetentionDays = 7
)

$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$targetDir = Join-Path $PSScriptRoot "..\$BackupDir"

if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    Write-Host "[INFO] Created backup directory: $targetDir"
}

Write-Host "=========================================="
Write-Host "VORTEX GAMING BACKUP PROCESS: $timestamp"
Write-Host "=========================================="

# 1. Backup Local Persistent Store (.data/)
$dataDir = Join-Path $PSScriptRoot "..\.data"
if (Test-Path $dataDir) {
    $dataArchive = Join-Path $targetDir "vortex_data_$timestamp.zip"
    Write-Host "[INFO] Archiving local data store to $dataArchive..."
    Compress-Archive -Path "$dataDir\*" -DestinationPath $dataArchive -Force
    Write-Host "[SUCCESS] Local data backup completed: $dataArchive"
}

# 2. Backup PostgreSQL Database if pg_dump is available and DATABASE_URL is set
$dbUrl = $env:DATABASE_URL
if ($dbUrl -and (Get-Command pg_dump -ErrorAction SilentlyContinue)) {
    $sqlDump = Join-Path $targetDir "vortex_db_$timestamp.sql"
    Write-Host "[INFO] Exporting PostgreSQL database via pg_dump..."
    try {
        & pg_dump $dbUrl -F c -b -v -f $sqlDump
        Write-Host "[SUCCESS] PostgreSQL dump completed: $sqlDump"
    } catch {
        Write-Host "[WARN] pg_dump failed: $_"
    }
} else {
    Write-Host "[NOTICE] PostgreSQL dump skipped (pg_dump not in PATH or DATABASE_URL not set). Data store archive generated."
}

# 3. Retention Cleanup (Remove archives older than $RetentionDays)
Write-Host "[INFO] Pruning backups older than $RetentionDays days..."
$cutoffDate = (Get-Date).AddDays(-$RetentionDays)
$oldFiles = Get-ChildItem -Path $targetDir -File | Where-Object { $_.CreationTime -lt $cutoffDate }

foreach ($file in $oldFiles) {
    Write-Host "[REMOVED] Pruning expired backup: $($file.Name)"
    Remove-Item $file.FullName -Force
}

Write-Host "=========================================="
Write-Host "VORTEX GAMING BACKUP FINISHED SUCCESSFULLY"
Write-Host "=========================================="
