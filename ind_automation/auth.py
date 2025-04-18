"""
Authentication Module for IND Automation APIs

This module provides authentication and authorization functionality
for securing IND Automation API endpoints.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import logging
import os
import jwt
from datetime import datetime, timedelta
from typing import Dict, Optional

# Configure logging
logger = logging.getLogger(__name__)

# Security scheme for Swagger docs
security = HTTPBearer()

# JWT settings
JWT_SECRET = os.getenv("JWT_SECRET_KEY", "development_secret_key")
JWT_ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# --- User Authentication ---

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Validate JWT token and return the user
    
    This is a dependency that can be used in FastAPI route functions
    """
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        
        # Check if token has expired
        if datetime.fromtimestamp(payload.get("exp", 0)) < datetime.now():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        # Return user from payload
        return {
            "user_id": payload.get("sub"),
            "username": payload.get("username"),
            "roles": payload.get("roles", []),
        }
    except jwt.PyJWTError as e:
        logger.error(f"JWT validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication error",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_admin_user(user: Dict = Depends(get_current_user)):
    """
    Check if current user has admin privileges
    
    This is a dependency that can be used in FastAPI route functions
    that require admin access
    """
    if "admin" not in user.get("roles", []):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return user

# --- Token Generation ---

def create_token(data: Dict, expires_delta: Optional[timedelta] = None):
    """
    Create a new JWT token
    
    Args:
        data: Dictionary containing token data (sub, username, etc.)
        expires_delta: Optional expiration time delta
        
    Returns:
        Encoded JWT token
    """
    to_encode = data.copy()
    
    # Set expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
        
    to_encode.update({"exp": expire})
    
    # Encode and return token
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)