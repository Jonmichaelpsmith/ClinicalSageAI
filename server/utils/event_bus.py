"""
Event Bus Utility

This module provides a unified event bus for publishing events across services.
It supports both Redis pub/sub and in-process event management with auto-fallback.
"""

import json
import logging
import threading
from typing import Dict, Any, Callable, List, Optional

# Setup logging
logger = logging.getLogger(__name__)

# Try to import Redis, but provide fallback if not available
try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    logger.warning("Redis not available - using in-process event bus")

# Redis connection (if available)
REDIS_CLIENT = None
REDIS_PREFIX = "trialsage:events:"

# In-process subscribers (fallback)
LOCAL_SUBSCRIBERS: Dict[str, List[Callable]] = {}

# Thread-safety lock for local subscribers
LOCAL_LOCK = threading.Lock()

def setup_redis(host="localhost", port=6379, db=0, password=None):
    """Set up Redis connection for event bus"""
    global REDIS_CLIENT, REDIS_AVAILABLE
    
    if not REDIS_AVAILABLE:
        logger.warning("Redis not available - skipping setup")
        return False
    
    try:
        REDIS_CLIENT = redis.Redis(
            host=host, 
            port=port, 
            db=db, 
            password=password,
            socket_timeout=1,
            socket_connect_timeout=1,
            health_check_interval=5
        )
        REDIS_CLIENT.ping()  # Test connection
        logger.info("Redis event bus configured successfully")
        return True
    except (redis.ConnectionError, redis.RedisError) as e:
        logger.warning(f"Redis connection failed: {str(e)} - using in-process event bus")
        REDIS_AVAILABLE = False
        REDIS_CLIENT = None
        return False

def publish(channel: str, message: Dict[str, Any]) -> bool:
    """
    Publish an event to subscribers
    
    Args:
        channel: Event channel name
        message: Event data (must be JSON-serializable)
        
    Returns:
        Success status
    """
    # Validate inputs
    if not isinstance(channel, str) or not channel:
        logger.error("Invalid channel name")
        return False
    
    # Try to publish to Redis first if available
    redis_success = False
    if REDIS_AVAILABLE and REDIS_CLIENT is not None:
        try:
            serialized = json.dumps(message)
            redis_success = REDIS_CLIENT.publish(f"{REDIS_PREFIX}{channel}", serialized) > 0
        except Exception as e:
            logger.error(f"Redis publish error: {str(e)}")
    
    # Publish to local subscribers
    local_success = False
    with LOCAL_LOCK:
        if channel in LOCAL_SUBSCRIBERS and LOCAL_SUBSCRIBERS[channel]:
            for callback in LOCAL_SUBSCRIBERS[channel]:
                try:
                    callback(message)
                    local_success = True
                except Exception as e:
                    logger.error(f"Local subscriber error: {str(e)}")
    
    # If published via either method, consider it a success
    return redis_success or local_success

def subscribe(channel: str, callback: Callable[[Dict[str, Any]], None]) -> bool:
    """
    Subscribe to a channel with a callback for local events
    
    Args:
        channel: Channel name to subscribe to
        callback: Function to call when event is received
        
    Returns:
        Success status
    """
    if not callable(callback):
        logger.error("Invalid callback function")
        return False
    
    with LOCAL_LOCK:
        if channel not in LOCAL_SUBSCRIBERS:
            LOCAL_SUBSCRIBERS[channel] = []
        LOCAL_SUBSCRIBERS[channel].append(callback)
    
    logger.debug(f"Subscribed to local events on channel: {channel}")
    return True

def unsubscribe(channel: str, callback: Optional[Callable] = None) -> bool:
    """
    Unsubscribe from a channel
    
    Args:
        channel: Channel name to unsubscribe from
        callback: Specific callback to remove (if None, removes all)
        
    Returns:
        Success status
    """
    with LOCAL_LOCK:
        if channel not in LOCAL_SUBSCRIBERS:
            return False
        
        if callback is None:
            LOCAL_SUBSCRIBERS[channel] = []
            return True
        
        try:
            LOCAL_SUBSCRIBERS[channel].remove(callback)
            return True
        except ValueError:
            logger.warning(f"Callback not found in channel: {channel}")
            return False

# Try to configure Redis on module import
try:
    setup_redis()
except Exception as e:
    logger.warning(f"Redis setup failed: {str(e)}")