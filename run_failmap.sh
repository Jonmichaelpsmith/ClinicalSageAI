#!/bin/bash
# Script to run the FailMap application with EMA API integration

# Make script executable: chmod +x run_failmap.sh
# Run with: ./run_failmap.sh

# Display startup message
echo "Starting FailMap with EMA API integration..."
echo "Setting up environment..."

# Ensure the application has necessary directories
mkdir -p uploads
mkdir -p downloaded_csrs

# Check if database exists, initialize if needed
if [ ! -f failmap.db ]; then
    echo "Initializing database..."
    python3 -c "from fail_map_app import init_db; init_db()"
fi

# Set environment variables for EMA API if not already set
if [ -z "$EMA_CLIENT_ID" ]; then
    export EMA_CLIENT_ID="e1f0c100-17f0-445d-8989-3e43cdc6e741"
    echo "Set EMA_CLIENT_ID from default value"
fi

if [ -z "$EMA_CLIENT_SECRET" ]; then
    export EMA_CLIENT_SECRET="AyX8Q~KS0HRcGDoAFw~6PnK3us5WUS8eWxLF8cav"
    echo "Set EMA_CLIENT_SECRET from default value"
fi

# Check if Python modules are installed
echo "Checking required Python modules..."
python3 -c "import flask" 2>/dev/null || { echo "Error: Flask not installed. Please install required packages."; exit 1; }
python3 -c "import pandas" 2>/dev/null || { echo "Error: Pandas not installed. Please install required packages."; exit 1; }
python3 -c "import plotly" 2>/dev/null || { echo "Error: Plotly not installed. Please install required packages."; exit 1; }

# Run the FailMap application
echo "Starting FailMap application on port 8080..."
python3 failmap.py