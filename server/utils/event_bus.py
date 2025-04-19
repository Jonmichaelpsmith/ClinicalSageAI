"""
Event Bus System

This module provides a simple event publication/subscription system
for application-wide event distribution. It enables components to:

1. Subscribe to specific event types
2. Publish events to all subscribed listeners
3. Unsubscribe from events when no longer needed

Used primarily for WebSocket real-time updates.
"""
import json
from typing import Dict, List, Callable, Any


# Event subscribers registry: event_type -> list of callback functions
_subscribers: Dict[str, List[Callable]] = {}


def subscribe(event_type: str, callback: Callable) -> None:
    """
    Subscribe to an event type
    
    Args:
        event_type: The event type to subscribe to
        callback: Function to call when event is published
    """
    if event_type not in _subscribers:
        _subscribers[event_type] = []
    
    if callback not in _subscribers[event_type]:
        _subscribers[event_type].append(callback)


def unsubscribe(event_type: str, callback: Callable) -> None:
    """
    Unsubscribe from an event type
    
    Args:
        event_type: The event type to unsubscribe from
        callback: Function to remove from subscribers
    """
    if event_type in _subscribers and callback in _subscribers[event_type]:
        _subscribers[event_type].remove(callback)
        
        # Clean up empty lists
        if not _subscribers[event_type]:
            del _subscribers[event_type]


def publish(event_type: str, data: Any) -> int:
    """
    Publish an event to all subscribers
    
    Args:
        event_type: The type of event to publish
        data: The event data (will be JSON serialized if not a string)
        
    Returns:
        int: Number of subscribers the event was sent to
    """
    if event_type not in _subscribers:
        return 0
    
    # Prepare the data as a JSON string if it's not already a string
    if not isinstance(data, str):
        data = json.dumps(data)
    
    # Dispatch to all subscribers
    count = 0
    for callback in _subscribers[event_type]:
        try:
            callback(data)
            count += 1
        except Exception as e:
            print(f"Error in event subscriber: {str(e)}")
    
    return count


def get_subscriber_count(event_type: str = None) -> Dict[str, int]:
    """
    Get count of subscribers, optionally for a specific event type
    
    Args:
        event_type: Optional specific event type
        
    Returns:
        Dict mapping event types to subscriber counts
    """
    if event_type:
        return {event_type: len(_subscribers.get(event_type, []))}
    
    return {k: len(v) for k, v in _subscribers.items()}