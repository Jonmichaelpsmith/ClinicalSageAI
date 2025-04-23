"""
FastAPI application runner script

This script launches the RegIntel validation API service.
"""
import uvicorn
import os
import logging

if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler("validator_api.log")
        ]
    )
    logger = logging.getLogger(__name__)
    
    # Get port from environment or use default
    port = int(os.getenv("PORT", 8000))
    
    # Start server
    logger.info(f"Starting RegIntel API server on port {port}")
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)