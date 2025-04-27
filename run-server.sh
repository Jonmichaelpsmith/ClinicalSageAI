#!/bin/bash

# TrialSage™ Industrial-Grade Server Runner Script
# This script provides a fault-tolerant mechanism for starting the TrialSage server
# with automatic fallback mechanisms, robust error recovery, and detailed logging.

# Set up variables
LOG_DIR="./logs"
MAIN_LOG="$LOG_DIR/server-runner.log"
ERROR_LOG="$LOG_DIR/server-error.log"
WATCHDOG_LOG="$LOG_DIR/watchdog.log"
PID_FILE="./trialsage-server.pid"
RESTART_COUNT=0
MAX_RESTARTS=5

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Function to log messages
log() {
  echo "[$(date +"%Y-%m-%d %H:%M:%S")] $1" | tee -a "$MAIN_LOG"
}

error_log() {
  echo "[$(date +"%Y-%m-%d %H:%M:%S")] ERROR: $1" | tee -a "$ERROR_LOG"
}

# Banner
echo "============================================================="
echo "             TrialSage™ Industrial-Grade Server               "
echo "============================================================="
log "Starting TrialSage server runtime environment"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  error_log "Node.js is not installed or not in PATH. Exiting."
  exit 1
fi

# Print Node.js version
NODE_VERSION=$(node -v)
log "Using Node.js version: $NODE_VERSION"

# Verify critical files exist
log "Verifying system integrity..."
CRITICAL_FILES=("server-runner.js" "server-esm.js" "server-cjs.js" "trialsage-server.mjs")
MISSING_FILES=0

for file in "${CRITICAL_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    error_log "Critical file missing: $file"
    MISSING_FILES=$((MISSING_FILES+1))
  fi
done

if [ $MISSING_FILES -gt 0 ]; then
  log "Warning: $MISSING_FILES critical files are missing. Continuing with available components."
fi

# Set up environment variables
export NODE_ENV=${NODE_ENV:-"production"}
export PORT=${PORT:-5000}
export LOG_LEVEL=${LOG_LEVEL:-"info"}

log "Environment: NODE_ENV=$NODE_ENV, PORT=$PORT"

# Check for SESSION_SECRET and generate if missing
if [ -z "$SESSION_SECRET" ]; then
  export SESSION_SECRET="trialsage-$(date +%s)-$(openssl rand -hex 8)"
  log "Generated temporary SESSION_SECRET. For production use, please set a permanent value."
fi

# Function to check if server is running
is_server_running() {
  if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null; then
      return 0  # Running
    fi
  fi
  return 1  # Not running
}

# Function to stop server if running
stop_server() {
  if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    log "Stopping previous server instance (PID: $PID)..."
    kill "$PID" 2>/dev/null || kill -9 "$PID" 2>/dev/null
    rm -f "$PID_FILE"
    sleep 2
  fi
}

# Function to start server
start_server() {
  log "Starting TrialSage server..."
  
  # Try using the runner first
  node server-runner.js > "$LOG_DIR/server-stdout.log" 2> "$LOG_DIR/server-stderr.log" &
  SERVER_PID=$!
  echo $SERVER_PID > "$PID_FILE"
  log "Server started with PID: $SERVER_PID"
  
  # Verify server started successfully
  sleep 5
  if ! is_server_running; then
    error_log "Server failed to start using server-runner.js. Trying direct approach."
    
    # Try ESM version
    log "Attempting to start ESM server directly..."
    node server-esm.js > "$LOG_DIR/server-esm-stdout.log" 2> "$LOG_DIR/server-esm-stderr.log" &
    SERVER_PID=$!
    echo $SERVER_PID > "$PID_FILE"
    
    sleep 3
    if ! is_server_running; then
      error_log "ESM server failed to start. Trying CommonJS version."
      
      # Try CommonJS version
      log "Attempting to start CommonJS server directly..."
      node server-cjs.js > "$LOG_DIR/server-cjs-stdout.log" 2> "$LOG_DIR/server-cjs-stderr.log" &
      SERVER_PID=$!
      echo $SERVER_PID > "$PID_FILE"
      
      sleep 3
      if ! is_server_running; then
        error_log "CommonJS server failed to start. Trying legacy server as last resort."
        
        # Try legacy server as last resort
        log "Attempting to start legacy server as last resort..."
        node trialsage-server.mjs > "$LOG_DIR/legacy-stdout.log" 2> "$LOG_DIR/legacy-stderr.log" &
        SERVER_PID=$!
        echo $SERVER_PID > "$PID_FILE"
        
        sleep 3
        if ! is_server_running; then
          error_log "All server versions failed to start. Please check logs for details."
          return 1
        else
          log "Legacy server started successfully with PID: $SERVER_PID"
        fi
      else
        log "CommonJS server started successfully with PID: $SERVER_PID"
      fi
    else
      log "ESM server started successfully with PID: $SERVER_PID"
    fi
  else
    log "Server started successfully with PID: $SERVER_PID"
  fi
  
  return 0
}

# Function to run watchdog
run_watchdog() {
  log "Starting watchdog process..."
  
  while true; do
    sleep 30  # Check every 30 seconds
    
    if ! is_server_running; then
      error_log "Server process died unexpectedly. Attempting restart..."
      
      RESTART_COUNT=$((RESTART_COUNT+1))
      if [ $RESTART_COUNT -le $MAX_RESTARTS ]; then
        echo "[$(date +"%Y-%m-%d %H:%M:%S")] Restarting server (attempt $RESTART_COUNT of $MAX_RESTARTS)" >> "$WATCHDOG_LOG"
        start_server
      else
        error_log "Maximum restart attempts ($MAX_RESTARTS) reached. Watchdog giving up."
        echo "[$(date +"%Y-%m-%d %H:%M:%S")] Maximum restart attempts reached. Manual intervention required." >> "$WATCHDOG_LOG"
        break
      fi
    else
      # Reset restart count if server has been running for at least 5 minutes
      if [ $RESTART_COUNT -gt 0 ]; then
        UPTIME=$(ps -o etimes= -p $(cat "$PID_FILE"))
        if [ $UPTIME -gt 300 ]; then  # 5 minutes = 300 seconds
          RESTART_COUNT=0
          echo "[$(date +"%Y-%m-%d %H:%M:%S")] Server stable, reset restart counter" >> "$WATCHDOG_LOG"
        fi
      fi
    fi
  done
}

# Stop any existing server
stop_server

# Start the server
start_server

# Run watchdog in background
run_watchdog &
WATCHDOG_PID=$!

log "Watchdog started with PID: $WATCHDOG_PID"
log "TrialSage server initialization complete"
log "Use the following API to check server health: http://localhost:$PORT/api/health"
log "Access the application at: http://localhost:$PORT"

# Output helpful information
echo ""
echo "TrialSage™ Server is now running"
echo "--------------------------------"
echo "- Server Port: $PORT"
echo "- Log Files: $LOG_DIR/"
echo "- Health Check: http://localhost:$PORT/api/health"
echo "- Server PID: $(cat $PID_FILE)"
echo "- Watchdog PID: $WATCHDOG_PID"
echo ""
echo "To stop the server: kill $(cat $PID_FILE) $WATCHDOG_PID"
echo "To view logs: tail -f $LOG_DIR/server-stdout.log"
echo "