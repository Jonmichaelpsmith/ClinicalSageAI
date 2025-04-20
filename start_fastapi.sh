#!/bin/bash
# Script to start the FastAPI server in the background
nohup python main.py > fastapi.log 2>&1 &
echo "FastAPI server started in background. Check fastapi.log for output."