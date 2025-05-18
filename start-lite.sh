#!/bin/bash
# Start script with minimal configuration to run the application

echo "Starting TrialSage application in lite mode..."
NODE_OPTIONS="--trace-warnings --max-old-space-size=512" node_modules/.bin/tsx --inspect server/lite-index.ts