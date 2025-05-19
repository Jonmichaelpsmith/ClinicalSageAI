#!/bin/bash
# Memory-optimized start script for TrialSage
# This addresses the "pthread_create: Resource temporarily unavailable" error

# Reduce thread pool size
export UV_THREADPOOL_SIZE=4

# Set memory limits
export NODE_OPTIONS="--max-old-space-size=512 --trace-warnings"

# Run the application
echo "Starting application with memory optimizations..."
node cleanup-toastify.js && tsx --inspect server/index.ts
