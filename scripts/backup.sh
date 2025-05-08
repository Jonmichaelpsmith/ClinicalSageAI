#!/bin/bash

# TrialSage Backup Script
# Creates timestamped backups of critical project files

# Set the backup directory
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/trialsage_backup_${TIMESTAMP}.tar.gz"

# Ensure backup directory exists
mkdir -p $BACKUP_DIR

# List of critical directories to backup
CRITICAL_DIRS=(
  "client/src/components/cer"
  "client/src/services"
  "server/routes"
  "shared"
)

# Create the backup
echo "Creating backup at ${BACKUP_FILE}"
tar -czf $BACKUP_FILE ${CRITICAL_DIRS[@]}

if [ $? -eq 0 ]; then
  echo "Backup created successfully!"
  echo "To restore, use: tar -xzf ${BACKUP_FILE}"
else
  echo "Backup failed!"
fi

# Create a file list for reference
FILE_LIST="${BACKUP_DIR}/backup_contents_${TIMESTAMP}.txt"
echo "Files included in backup:" > $FILE_LIST
for dir in "${CRITICAL_DIRS[@]}"; do
  find $dir -type f -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" >> $FILE_LIST
done

echo "Backup inventory saved to ${FILE_LIST}"
echo "Total files: $(wc -l < $FILE_LIST)"