"""
Dependencies for the RegIntel API

This module provides dependency injection functions for the FastAPI routes.
"""
import jwt
from fastapi import Header, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
import logging

# Configure logging
logger = logging.getLogger(__name__)

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET_KEY", "regintel_development_secret")
JWT_ALGORITHM = "HS256"

# Security scheme
security = HTTPBearer()

async def get_token_header(authorization: HTTPAuthorizationCredentials = Depends(security)):
    """
    Validate JWT token from Authorization header
    
    Args:
        authorization: Authorization credentials with the JWT token
        
    Returns:
        dict: The decoded token payload
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        token = authorization.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("Token has expired")
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        logger.warning("Invalid token")
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(status_code=401, detail="Authentication error")