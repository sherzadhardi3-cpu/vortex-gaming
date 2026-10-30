#!/usr/bin/env bash
# VORTEX GAMING — Automated Database & Data Store Backup Script (Bash)
# Backs up PostgreSQL database and local persistent JSON store with timestamping and 7-day retention.

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-backups}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_DIR="${ROOT_DIR}/${BACKUP_DIR}"

mkdir -p "${TARGET_DIR}"

echo "=========================================="
echo "VORTEX GAMING BACKUP PROCESS: ${TIMESTAMP}"
echo "=========================================="

# 1. Backup Local Persistent Store (.data/)
DATA_DIR="${ROOT_DIR}/.data"
if [ -d "${DATA_DIR}" ]; then
  ARCHIVE_FILE="${TARGET_DIR}/vortex_data_${TIMESTAMP}.tar.gz"
  echo "[INFO] Archiving local data store to ${ARCHIVE_FILE}..."
  tar -czf "${ARCHIVE_FILE}" -C "${ROOT_DIR}" .data
  echo "[SUCCESS] Local data backup completed: ${ARCHIVE_FILE}"
fi

# 2. Backup PostgreSQL Database if pg_dump is available and DATABASE_URL is set
if [ -n "${DATABASE_URL:-}" ] && command -v pg_dump >/dev/null 2>&1; then
  SQL_DUMP="${TARGET_DIR}/vortex_db_${TIMESTAMP}.dump"
  echo "[INFO] Exporting PostgreSQL database via pg_dump..."
  pg_dump "${DATABASE_URL}" -F c -b -v -f "${SQL_DUMP}"
  echo "[SUCCESS] PostgreSQL dump completed: ${SQL_DUMP}"
else
  echo "[NOTICE] PostgreSQL dump skipped (pg_dump not available or DATABASE_URL not set)."
fi

# 3. Retention Cleanup (Remove archives older than RETENTION_DAYS)
echo "[INFO] Pruning backups older than ${RETENTION_DAYS} days..."
find "${TARGET_DIR}" -type f -mtime +"${RETENTION_DAYS}" -name "vortex_*" -delete
echo "[SUCCESS] Retention cleanup completed."

echo "=========================================="
echo "VORTEX GAMING BACKUP FINISHED SUCCESSFULLY"
echo "=========================================="
