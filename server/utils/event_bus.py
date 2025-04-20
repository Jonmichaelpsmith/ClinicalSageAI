"""
Event Bus for WebSocket Communication

This module provides a simple event bus that supports both synchronous 
and asynchronous event publishing for real-time notifications via WebSockets.
"""
import asyncio
import threading
import logging
from typing import Any, Dict, List, Callable, Awaitable, Optional, Union

# Setup logging
logger = logging.getLogger(__name__)

# Event handler type
EventHandler = Callable[[str, Any], Union[None, Awaitable[None]]]

class EventBus:
    """
    Simple event bus with support for both sync and async callbacks
    
    This provides:
    - Event registration for both async and sync handlers
    - Synchronous event publishing
    - Asynchronous event publishing
    - Thread-safe operation
    """
    
    def __init__(self):
        """Initialize the event bus with an empty handler dictionary"""
        self._handlers: Dict[str, List[EventHandler]] = {}
        self._lock = threading.Lock()
        
    def register(self, event_type: str, handler: EventHandler) -> None:
        """
        Register a handler for an event type
        
        Args:
            event_type: The event type to listen for
            handler: Function or coroutine function that will handle the event
        """
        with self._lock:
            if event_type not in self._handlers:
                self._handlers[event_type] = []
            self._handlers[event_type].append(handler)
        
    def unregister(self, event_type: str, handler: EventHandler) -> None:
        """
        Unregister a handler from an event type
        
        Args:
            event_type: The event type to stop listening for
            handler: The handler to remove
        """
        with self._lock:
            if event_type in self._handlers:
                if handler in self._handlers[event_type]:
                    self._handlers[event_type].remove(handler)
    
    def publish(self, event_type: str, *args: Any, **kwargs: Any) -> None:
        """
        Synchronously publish an event
        
        Args:
            event_type: The type of event to publish
            *args: Positional arguments to pass to handlers
            **kwargs: Keyword arguments to pass to handlers
        """
        handlers = []
        with self._lock:
            if event_type in self._handlers:
                handlers = self._handlers[event_type].copy()
        
        for handler in handlers:
            try:
                if asyncio.iscoroutinefunction(handler):
                    # Create a future but don't await it - this is sync publish
                    asyncio.create_task(handler(*args, **kwargs))
                else:
                    handler(*args, **kwargs)
            except Exception as e:
                logger.error(f"Error in event handler for {event_type}: {e}")
    
    async def publish_async(self, event_type: str, *args: Any, **kwargs: Any) -> None:
        """
        Asynchronously publish an event, waiting for async handlers to complete
        
        Args:
            event_type: The type of event to publish
            *args: Positional arguments to pass to handlers
            **kwargs: Keyword arguments to pass to handlers
        """
        handlers = []
        with self._lock:
            if event_type in self._handlers:
                handlers = self._handlers[event_type].copy()
        
        for handler in handlers:
            try:
                if asyncio.iscoroutinefunction(handler):
                    await handler(*args, **kwargs)
                else:
                    handler(*args, **kwargs)
            except Exception as e:
                logger.error(f"Error in event handler for {event_type}: {e}")

# Create a global instance
global_event_bus = EventBus()