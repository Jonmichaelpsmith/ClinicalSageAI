#!/bin/bash

# TrialSage Optimized Startup Script
# This script launches the application with optimized resource settings
# to prevent "pthread_create: Resource temporarily unavailable" errors

echo "Starting TrialSage with optimized settings..."

# 1. Set resource limits
export UV_THREADPOOL_SIZE=4
export NODE_OPTIONS="--max-old-space-size=${NODE_MEMORY_LIMIT:-512} --trace-warnings"

# 2. Clean up any unnecessary resource usage
echo "Clearing temporary files and caches..."
rm -rf ./.vite 2>/dev/null
rm -rf ./tmp/*.tmp 2>/dev/null

# 3. Create logs directory if it doesn't exist
mkdir -p ./logs

# 4. Start the application with controlled resource usage
echo "Launching TrialSage..."
npm run dev

# Exit with the same code as the application
exit $?