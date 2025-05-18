#!/bin/bash
# Ultra-minimal startup script for resource-constrained environments

# Aggressively reduce resource usage
export UV_THREADPOOL_SIZE=2
export NODE_OPTIONS="--max-old-space-size=${NODE_MEMORY_LIMIT:-256} --trace-warnings --no-warnings"

# Start server with minimal features
echo "Starting with minimal configuration..."
node --max-old-space-size=${NODE_MEMORY_LIMIT:-256} server/lean-server.js
