"""
FastAPI application runner script

This script launches the RegIntel validation API service.
"""
import logging
import uvicorn
from app.main import app

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    logger.info("Starting RegIntel API server on port 8000")
    try:
        uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
        logger.info("RegIntel API started")
    except Exception as e:
        logger.error(f"Error starting RegIntel API: {str(e)}")