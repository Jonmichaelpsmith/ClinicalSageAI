"""
Event Bus for WebSocket communication.

This module provides a simple event pub/sub system for WebSocket communication.
In a production environment, this would use Redis or another messaging system.
"""
import asyncio
import logging
from typing import Dict, Set, Callable, Any, Awaitable

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# In-memory subscribers dictionary
# Format: {channel: {callback_id: callback_func}}
_subscribers: Dict[str, Dict[str, Callable[[Dict[str, Any]], Awaitable[None]]]] = {}

# Event history for new subscribers
# Format: {channel: [event1, event2, ...]}
_event_history: Dict[str, Any] = {}

# Maximum number of events to keep in history
MAX_HISTORY_EVENTS = 100

async def subscribe(channel: str, callback_id: str, callback: Callable[[Dict[str, Any]], Awaitable[None]]) -> None:
    """
    Subscribe to a channel.
    
    Args:
        channel: Channel name
        callback_id: Unique identifier for the callback
        callback: Async function to call when an event is published to the channel
    """
    if channel not in _subscribers:
        _subscribers[channel] = {}
        logger.info(f"Created new channel: {channel}")
    
    _subscribers[channel][callback_id] = callback
    logger.info(f"Subscribed to channel {channel} with ID {callback_id}")
    
    # Send recent events to new subscriber
    if channel in _event_history:
        for event in _event_history[channel]:
            await callback(event)

async def unsubscribe(channel: str, callback_id: str) -> None:
    """
    Unsubscribe from a channel.
    
    Args:
        channel: Channel name
        callback_id: Callback identifier to remove
    """
    if channel in _subscribers and callback_id in _subscribers[channel]:
        del _subscribers[channel][callback_id]
        logger.info(f"Unsubscribed from channel {channel} with ID {callback_id}")
        
        # Clean up empty channels
        if not _subscribers[channel]:
            del _subscribers[channel]
            logger.info(f"Removed empty channel: {channel}")

async def publish_event(channel: str, event: Dict[str, Any]) -> None:
    """
    Publish an event to a channel.
    
    Args:
        channel: Channel name
        event: Event data to publish
    """
    logger.info(f"Publishing event to channel {channel}: {event}")
    
    # Store event in history
    if channel not in _event_history:
        _event_history[channel] = []
    
    _event_history[channel].append(event)
    
    # Trim history if needed
    if len(_event_history[channel]) > MAX_HISTORY_EVENTS:
        _event_history[channel] = _event_history[channel][-MAX_HISTORY_EVENTS:]
    
    # No subscribers for this channel
    if channel not in _subscribers:
        logger.info(f"No subscribers for channel {channel}")
        return
    
    # Call all subscriber callbacks
    for callback_id, callback in list(_subscribers[channel].items()):
        try:
            await callback(event)
        except Exception as e:
            logger.error(f"Error in subscriber callback {callback_id}: {e}")

def get_subscriber_count(channel: str) -> int:
    """
    Get the number of subscribers for a channel.
    
    Args:
        channel: Channel name
        
    Returns:
        Number of subscribers
    """
    if channel not in _subscribers:
        return 0
    
    return len(_subscribers[channel])