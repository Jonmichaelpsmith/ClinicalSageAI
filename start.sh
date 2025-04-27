#!/bin/bash
# Main startup script for TrialSage - Triple redundant with failsafes

echo "============================================================="
echo "             TrialSage™ Production Startup                   "
echo "             (c) Concept2Cures, Inc. 2025                    "
echo "============================================================="

# Create necessary directories
mkdir -p logs uploads

# Set environment variables if they don't exist
export NODE_ENV=${NODE_ENV:-"production"}
export SESSION_SECRET=${SESSION_SECRET:-"trialsage-production-session-$(openssl rand -hex 8)"}

echo "Checking startup options..."

# Primary start method - node workflows
if [[ "$1" == "--workflows" || -z "$1" ]]; then
  echo "Starting with Replit workflows (recommended)..."
  node -e "console.log('Verifying Node.js is operational...')"
  
  # Check for workflow runner
  (cd . && echo "Starting workflow..." && bash -c "npm run dev") &
  
  # Record PID
  echo $! > ./server.pid
  echo "Server started via workflow. Check logs for details."
  exit 0
fi

# Secondary start method - run-server.sh (watchdog monitor with fallbacks)
if [[ "$1" == "--industrial" ]]; then
  echo "Starting in industrial-grade mode with watchdog monitoring..."
  ./run-server.sh &
  
  # Record PID
  echo $! > ./server.pid
  echo "Server started in industrial-grade mode with watchdog."
  exit 0
fi

# Tertiary fallback - direct server files with auto-detection
if [[ "$1" == "--direct" ]]; then
  echo "Starting with direct execution (fallback mode)..."
  
  # Try ES module server first
  if [ -f "server-esm.js" ]; then
    echo "Starting ESM server..."
    node server-esm.js > logs/server.log 2>&1 &
    echo $! > ./server.pid
    echo "ESM server started. Check logs/server.log for details."
    exit 0
  fi
  
  # Try CommonJS server next
  if [ -f "server-cjs.js" ]; then
    echo "Starting CommonJS server..."
    node server-cjs.js > logs/server.log 2>&1 &
    echo $! > ./server.pid
    echo "CommonJS server started. Check logs/server.log for details."
    exit 0
  fi
  
  # Legacy server as last resort
  if [ -f "trialsage-server.mjs" ]; then
    echo "Starting legacy server..."
    node trialsage-server.mjs > logs/server.log 2>&1 &
    echo $! > ./server.pid
    echo "Legacy server started. Check logs/server.log for details."
    exit 0
  fi
  
  echo "ERROR: No valid server implementation found!"
  exit 1
fi

# Show help if invalid option
echo "Usage: ./start.sh [OPTION]"
echo ""
echo "Options:"
echo "  --workflows    Start using Replit workflows (default)"
echo "  --industrial   Start in industrial-grade mode with watchdog"
echo "  --direct       Start by directly executing server files"
echo ""
echo "Example: ./start.sh --industrial"