"""
Update EMA API Credentials
--------------------------
This script updates the environment variables for EMA API authentication
based on the credentials provided in the screenshots.
"""

import os
from dotenv import load_dotenv, set_key
import logging
import sys

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('update_credentials')

# New credentials from the screenshot
NEW_CLIENT_ID = "e1f0c100-17f0-445d-8989-3e43cdc6e741"
NEW_CLIENT_SECRET = "AyX8Q~KS0HRcGDoAFw~6PnK3us5WUS8eWxLF8cav"

# OAuth 2.0 Endpoints from the screenshot
NEW_TOKEN_ENDPOINT = "https://login.microsoftonline.com/bc9dc15c-61bc-4f03-b60b-e5b6d8922839/oauth2/v2.0/token"
NEW_API_SCOPE = "api://euema.onmicrosoft.com/upd-apim-secured/.default"

def update_environment_variables():
    """Update environment variables for EMA API authentication"""
    # Set environment variables for the current process
    os.environ["EMA_CLIENT_ID"] = NEW_CLIENT_ID
    os.environ["EMA_CLIENT_SECRET"] = NEW_CLIENT_SECRET
    
    logger.info("Environment variables updated for current process")
    
    # Also update the .env file if it exists
    if os.path.exists(".env"):
        load_dotenv(".env")
        set_key(".env", "EMA_CLIENT_ID", NEW_CLIENT_ID)
        set_key(".env", "EMA_CLIENT_SECRET", NEW_CLIENT_SECRET)
        logger.info(".env file updated")
    else:
        # Create a new .env file
        with open(".env", "w") as env_file:
            env_file.write(f"EMA_CLIENT_ID={NEW_CLIENT_ID}\n")
            env_file.write(f"EMA_CLIENT_SECRET={NEW_CLIENT_SECRET}\n")
        logger.info("Created new .env file with credentials")
    
    logger.info("✅ EMA API credentials have been updated successfully")

def update_api_constants():
    """Update the API constants in ema_api.py if needed"""
    try:
        # Read the current ema_api.py file
        with open("ema_api.py", "r") as file:
            content = file.read()
        
        # Check if we need to update the endpoints
        token_endpoint_updated = False
        api_scope_updated = False
        
        if "TOKEN_ENDPOINT = " in content and NEW_TOKEN_ENDPOINT not in content:
            content = content.replace(
                'TOKEN_ENDPOINT = "https://login.microsoftonline.com/bc9dc15c-61bc-4f03-b60b-e5b6d8922839/oauth2/v2.0/token"', 
                f'TOKEN_ENDPOINT = "{NEW_TOKEN_ENDPOINT}"'
            )
            token_endpoint_updated = True
        
        if "API_SCOPE = " in content and NEW_API_SCOPE not in content:
            content = content.replace(
                'API_SCOPE = "api://euema.onmicrosoft.com/upd-apim-secured/.default"',
                f'API_SCOPE = "{NEW_API_SCOPE}"'
            )
            api_scope_updated = True
        
        # Only write back if we made changes
        if token_endpoint_updated or api_scope_updated:
            with open("ema_api.py", "w") as file:
                file.write(content)
            
            logger.info("Updated API constants in ema_api.py")
            if token_endpoint_updated:
                logger.info(f"- TOKEN_ENDPOINT updated to {NEW_TOKEN_ENDPOINT}")
            if api_scope_updated:
                logger.info(f"- API_SCOPE updated to {NEW_API_SCOPE}")
        else:
            logger.info("API constants in ema_api.py are already up to date")
    
    except Exception as e:
        logger.error(f"Error updating API constants: {str(e)}")

if __name__ == "__main__":
    logger.info("Updating EMA API credentials...")
    update_environment_variables()
    update_api_constants()
    logger.info("Done!")