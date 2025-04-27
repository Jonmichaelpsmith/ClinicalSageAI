#!/bin/bash
# Production server startup script for TrialSage

# Ensure required directories exist
mkdir -p uploads logs

# Set environment variables if not already set
export NODE_ENV=production
export PORT=5000

# Check/set session secret
if [ -z "$SESSION_SECRET" ]; then
  export SESSION_SECRET="trialsage-secure-session-key"
  echo "[WARN] Using default SESSION_SECRET. For production deployment, set a secure SESSION_SECRET."
fi

# Check for runtime issues
if ! command -v node &> /dev/null; then
  echo "[ERROR] Node.js is not installed or not in PATH."
  exit 1
fi

# Start the server
echo "[INFO] Starting TrialSage production server on port ${PORT}..."
node production-server.js | tee -a logs/server.log