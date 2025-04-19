"""
Event Bus for Real-time Updates

This module provides a lightweight event bus implementation for publishing
and subscribing to events within the application. This enables WebSocket
real-time updates to be triggered from anywhere in the codebase.
"""
import json
import asyncio
from typing import Dict, List, Callable, Any

# Store for event subscribers
# Dict mapping event_name -> list of subscriber functions
subscribers: Dict[str, List[Callable]] = {}

def publish(event_name: str, data: Any) -> None:
    """
    Publish an event to all subscribers
    
    Args:
        event_name: Name of the event
        data: Event data (will be JSON-serialized)
    """
    # Serialize data to JSON string
    if not isinstance(data, str):
        data = json.dumps(data)
    
    # Notify subscribers
    for callback in subscribers.get(event_name, []):
        try:
            callback(data)
        except Exception as e:
            print(f"Error in {event_name} event subscriber: {str(e)}")

def subscribe(event_name: str, callback: Callable) -> None:
    """
    Subscribe to an event
    
    Args:
        event_name: Name of the event to subscribe to
        callback: Function to call when event is published
    """
    if event_name not in subscribers:
        subscribers[event_name] = []
    
    subscribers[event_name].append(callback)

def unsubscribe(event_name: str, callback: Callable) -> None:
    """
    Unsubscribe from an event
    
    Args:
        event_name: Name of the event to unsubscribe from
        callback: Function to remove from subscribers
    """
    if event_name in subscribers and callback in subscribers[event_name]:
        subscribers[event_name].remove(callback)