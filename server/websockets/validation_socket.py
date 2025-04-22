"""
WebSocket Service for TrialSage™ Validation

This module provides WebSocket communication for real-time validation updates,
allowing frontend clients to receive immediate feedback on validation status.
"""

import json
import logging
import asyncio
from typing import Dict, List, Any, Optional, Set
from fastapi import WebSocket, WebSocketDisconnect, Depends, HTTPException

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ValidationConnectionManager:
    """
    WebSocket connection manager for validation updates
    
    This class manages active WebSocket connections and handles
    broadcasting validation updates to connected clients.
    """
    
    def __init__(self):
        """Initialize the connection manager"""
        self.active_connections: Dict[str, List[WebSocket]] = {
            "qc": [],           # Quality control updates
            "validation": [],   # Overall validation status updates
            "metrics": []       # Performance metrics
        }
        self.client_channels: Dict[WebSocket, Set[str]] = {}
    
    async def connect(self, websocket: WebSocket, channel: str = "qc"):
        """
        Connect a client to a specific channel
        
        Args:
            websocket: The WebSocket connection
            channel: The channel to connect to (qc, validation, metrics)
        """
        if channel not in self.active_connections:
            raise ValueError(f"Invalid channel: {channel}")
            
        await websocket.accept()
        self.active_connections[channel].append(websocket)
        
        if websocket not in self.client_channels:
            self.client_channels[websocket] = set()
            
        self.client_channels[websocket].add(channel)
        
        logger.info(f"Client connected to {channel} channel. Active connections: {len(self.active_connections[channel])}")
    
    def disconnect(self, websocket: WebSocket):
        """
        Disconnect a client from all channels
        
        Args:
            websocket: The WebSocket connection
        """
        for channel in self.client_channels.get(websocket, set()):
            if websocket in self.active_connections[channel]:
                self.active_connections[channel].remove(websocket)
                logger.info(f"Client disconnected from {channel} channel. Active connections: {len(self.active_connections[channel])}")
        
        if websocket in self.client_channels:
            del self.client_channels[websocket]
    
    async def broadcast(self, channel: str, message: Any):
        """
        Broadcast a message to all clients on a channel
        
        Args:
            channel: The channel to broadcast to
            message: The message to broadcast
        """
        if channel not in self.active_connections:
            logger.warning(f"Attempted to broadcast to invalid channel: {channel}")
            return
            
        if not self.active_connections[channel]:
            logger.debug(f"No active connections on channel {channel}")
            return
            
        # Convert message to JSON if it's not already a string
        if not isinstance(message, str):
            message_str = json.dumps(message)
        else:
            message_str = message
            
        # Send to all connections on the channel
        for connection in self.active_connections[channel]:
            try:
                await connection.send_text(message_str)
            except Exception as e:
                logger.error(f"Error sending message to client: {str(e)}")
                # Don't disconnect here, as the client might still be connected
                # We'll let the regular ping/pong mechanism handle disconnections
    
    async def send_personal_message(self, websocket: WebSocket, message: Any):
        """
        Send a message to a specific client
        
        Args:
            websocket: The client WebSocket
            message: The message to send
        """
        # Convert message to JSON if it's not already a string
        if not isinstance(message, str):
            message_str = json.dumps(message)
        else:
            message_str = message
            
        try:
            await websocket.send_text(message_str)
        except Exception as e:
            logger.error(f"Error sending personal message to client: {str(e)}")
            
    async def ping_clients(self):
        """Send periodic pings to keep connections alive"""
        while True:
            all_websockets = set()
            for connections in self.active_connections.values():
                all_websockets.update(connections)
                
            for websocket in all_websockets:
                try:
                    await websocket.send_text(json.dumps({"type": "ping"}))
                except Exception as e:
                    logger.warning(f"Error pinging client: {str(e)}")
                    try:
                        self.disconnect(websocket)
                    except Exception:
                        pass
                        
            await asyncio.sleep(30)  # Ping every 30 seconds

# Create global connection manager
manager = ValidationConnectionManager()

# Start ping task
async def start_ping_task():
    await manager.ping_clients()

# Create a task for pinging clients
def create_ping_task():
    asyncio.create_task(start_ping_task())

# WebSocket endpoint for validation updates
async def validation_websocket_endpoint(websocket: WebSocket, channel: str = "qc"):
    """
    WebSocket endpoint for validation updates
    
    Args:
        websocket: The WebSocket connection
        channel: The channel to connect to (qc, validation, metrics)
    """
    try:
        await manager.connect(websocket, channel)
        
        # Send welcome message
        await manager.send_personal_message(websocket, {
            "type": "connected",
            "channel": channel,
            "message": f"Connected to {channel} channel"
        })
        
        # Handle messages from the client
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Handle specific message types
                if message.get("type") == "subscribe":
                    # Subscribe to additional channel
                    new_channel = message.get("channel")
                    if new_channel and new_channel in manager.active_connections:
                        await manager.connect(websocket, new_channel)
                        await manager.send_personal_message(websocket, {
                            "type": "subscribed",
                            "channel": new_channel
                        })
                
                # Echo messages for testing
                await manager.send_personal_message(websocket, {
                    "type": "echo",
                    "data": message
                })
                
            except json.JSONDecodeError:
                # Ignore non-JSON messages
                pass
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        manager.disconnect(websocket)

# Function to publish a message to a channel
async def publish_message(channel: str, message: Any):
    """
    Publish a message to a channel
    
    Args:
        channel: The channel to publish to
        message: The message to publish
    """
    await manager.broadcast(channel, message)

# Function to setup WebSocket routes in FastAPI
def setup_websocket_routes(app):
    """
    Setup WebSocket routes in a FastAPI application
    
    Args:
        app: The FastAPI application
    """
    @app.websocket("/ws/qc")
    async def qc_socket(websocket: WebSocket):
        await validation_websocket_endpoint(websocket, "qc")
        
    @app.websocket("/ws/validation")
    async def validation_socket(websocket: WebSocket):
        await validation_websocket_endpoint(websocket, "validation")
        
    @app.websocket("/ws/metrics")
    async def metrics_socket(websocket: WebSocket):
        await validation_websocket_endpoint(websocket, "metrics")
        
    # Start the ping task
    asyncio.create_task(start_ping_task())