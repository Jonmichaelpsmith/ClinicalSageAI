#!/bin/bash

# TrialSage Optimized Startup Script
# This script configures the environment and starts the application
# with proper resource limits to prevent thread exhaustion

echo "Starting TrialSage with optimized resource configuration..."

# Set resource limits
export UV_THREADPOOL_SIZE=4
export NODE_OPTIONS="--max-old-space-size=512 --trace-warnings"

# Clean up any resources that might cause issues
echo "Cleaning environment..."
rm -rf ./.vite 2>/dev/null
find ./tmp -name "*.tmp" -delete 2>/dev/null 2>/dev/null

# Create directories if they don't exist
mkdir -p logs
mkdir -p tmp

# Run the application
echo "Launching application..."
node cleanup-toastify.js && NODE_OPTIONS="--trace-warnings" node server/index.js