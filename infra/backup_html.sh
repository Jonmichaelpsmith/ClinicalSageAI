#!/bin/bash
# Create a timestamped backup of TrialSage HTML files

# Create backup directory with timestamp
TIMESTAMP=$(date +%Y%m%d%H%M%S)
BACKUP_DIR="infra/backups/trialsage-html-$TIMESTAMP"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Copy all HTML files to backup
cp -R trialsage-html/ "$BACKUP_DIR"

echo "✅ HTML files backed up to $BACKUP_DIR"