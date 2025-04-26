#!/bin/bash
# Combined backup and deployment script for protected directories
set -e

# Timestamp for backup folders
TIMESTAMP=$(date +%Y%m%d%H%M%S)

echo "📦 Creating backups of protected directories..."

# 1. Snapshot landing directory
if [ -d "landing" ]; then
  echo "- Backing up landing/"
  mkdir -p infra/backups/landing-$TIMESTAMP
  cp -R landing/ infra/backups/landing-$TIMESTAMP
fi

# 2. Snapshot TrialSage HTML directory
if [ -d "trialsage-html" ]; then
  echo "- Backing up trialsage-html/"
  mkdir -p infra/backups/trialsage-html-$TIMESTAMP
  cp -R trialsage-html/ infra/backups/trialsage-html-$TIMESTAMP
fi

# 3. Verify integrity before deployment
echo "🔍 Verifying file integrity..."
bash infra/verify_integrity.sh

# 4. Install backend dependencies
if [ -d "backend" ]; then
  echo "🔧 Installing backend dependencies..."
  if [ -f "backend/package.json" ]; then
    npm install --prefix backend
  else
    echo "⚠️ No package.json found in backend/ directory, skipping dependency installation"
  fi
fi

echo "✅ Backup and pre-deployment steps completed successfully"
echo "🔒 Protected directories are safe and verified"
echo "📂 Backups created at:"
echo "   - infra/backups/landing-$TIMESTAMP"
echo "   - infra/backups/trialsage-html-$TIMESTAMP"