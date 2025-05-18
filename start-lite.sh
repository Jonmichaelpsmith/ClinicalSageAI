#!/bin/bash
# Start script with minimal configuration to run the application

echo "Starting TrialSage application in lite mode..."
NODE_OPTIONS="--trace-warnings --max-old-space-size=${NODE_MEMORY_LIMIT:-512}" node_modules/.bin/tsx --inspect server/lite-index.ts
