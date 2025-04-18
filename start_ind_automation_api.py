#!/usr/bin/env python3
"""
Start script for IND Automation FastAPI Service

This script starts the FastAPI service for generating FDA IND application forms.
"""

import os
import sys
import uvicorn

def main():
    print("Starting IND Automation API Service...")
    # Run the FastAPI app with Uvicorn
    uvicorn.run(
        "ind_automation.main:app",
        host="0.0.0.0",
        port=8001,
        reload=True
    )

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nService stopped")
    except Exception as e:
        print(f"Error starting service: {str(e)}")
        sys.exit(1)