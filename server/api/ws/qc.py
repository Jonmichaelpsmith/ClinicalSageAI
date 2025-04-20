"""
QC Status WebSocket API

This module provides WebSocket endpoints for real-time QC status updates.
"""
import json
import logging
import asyncio
import sys
import os
from typing import Dict, List, Set, Any, Optional, Callable, Awaitable, Coroutine
from uuid import uuid4
import time

# Fix path for absolute imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

try:
    from fastapi import WebSocket, WebSocketDisconnect, APIRouter
except ImportError:
    print("Error importing FastAPI. Installing required packages...")
    os.system("pip install fastapi websockets")
    from fastapi import WebSocket, WebSocketDisconnect, APIRouter
    
# Import utilities
from utils.event_bus import global_event_bus, EventBus

# Create router
router = APIRouter(prefix="/ws", tags=["WebSockets"])

# Setup logging
logger = logging.getLogger(__name__)

class ConnectionManager:
    """
    Manages WebSocket connections for QC status updates
    """
    def __init__(self):
        """Initialize the connection manager"""
        self.active_connections: Dict[str, WebSocket] = {}
        self.document_subscriptions: Dict[str, Set[str]] = {}
        self.connection_subscriptions: Dict[str, Set[str]] = {}
        
    async def connect(self, websocket: WebSocket) -> str:
        """
        Accept a new WebSocket connection and return a unique connection ID
        
        Args:
            websocket: The WebSocket connection
            
        Returns:
            str: A unique connection ID
        """
        # Generate a unique connection ID
        connection_id = str(uuid4())
        
        # Accept the connection
        await websocket.accept()
        
        # Store the connection
        self.active_connections[connection_id] = websocket
        self.connection_subscriptions[connection_id] = set()
        
        logger.info(f"WebSocket connection established: {connection_id}")
        return connection_id
        
    def disconnect(self, connection_id: str):
        """
        Remove a WebSocket connection
        
        Args:
            connection_id: The ID of the connection to remove
        """
        if connection_id in self.active_connections:
            # Clean up document subscriptions
            for document_id in list(self.connection_subscriptions.get(connection_id, set())):
                if document_id in self.document_subscriptions:
                    self.document_subscriptions[document_id].discard(connection_id)
                    if not self.document_subscriptions[document_id]:
                        del self.document_subscriptions[document_id]
            
            # Clean up connection data
            if connection_id in self.connection_subscriptions:
                del self.connection_subscriptions[connection_id]
                
            # Remove the connection
            del self.active_connections[connection_id]
            logger.info(f"WebSocket connection closed: {connection_id}")
        
    def subscribe_to_document(self, connection_id: str, document_id: str):
        """
        Subscribe a connection to updates for a specific document
        
        Args:
            connection_id: The ID of the connection
            document_id: The ID of the document to subscribe to
        """
        if connection_id not in self.active_connections:
            return
            
        # Initialize document subscriptions if needed
        if document_id not in self.document_subscriptions:
            self.document_subscriptions[document_id] = set()
            
        # Add connection to document subscriptions
        self.document_subscriptions[document_id].add(connection_id)
        
        # Add document to connection subscriptions for cleanup
        self.connection_subscriptions[connection_id].add(document_id)
        logger.debug(f"Connection {connection_id} subscribed to document {document_id}")
        
    def unsubscribe_from_document(self, connection_id: str, document_id: str):
        """
        Unsubscribe a connection from updates for a specific document
        
        Args:
            connection_id: The ID of the connection
            document_id: The ID of the document to unsubscribe from
        """
        # Remove connection from document subscriptions
        if document_id in self.document_subscriptions:
            self.document_subscriptions[document_id].discard(connection_id)
            if not self.document_subscriptions[document_id]:
                del self.document_subscriptions[document_id]
                
        # Remove document from connection subscriptions
        if connection_id in self.connection_subscriptions:
            self.connection_subscriptions[connection_id].discard(document_id)
            
    async def broadcast_to_document(self, document_id: str, message: Dict[str, Any]):
        """
        Send a message to all connections subscribed to a document
        
        Args:
            document_id: The ID of the document
            message: The message to send
        """
        if document_id not in self.document_subscriptions:
            return
            
        disconnected_connections = []
        
        # Send message to each connection subscribed to this document
        for connection_id in self.document_subscriptions[document_id]:
            if connection_id not in self.active_connections:
                disconnected_connections.append(connection_id)
                continue
                
            try:
                # Convert the message to JSON
                json_message = json.dumps(message)
                
                # Send the message
                await self.active_connections[connection_id].send_text(json_message)
            except Exception as e:
                logger.error(f"Error sending message to connection {connection_id}: {e}")
                disconnected_connections.append(connection_id)
                
        # Clean up disconnected connections
        for connection_id in disconnected_connections:
            self.disconnect(connection_id)
            
    async def broadcast_to_all(self, message: Dict[str, Any]):
        """
        Send a message to all active connections
        
        Args:
            message: The message to send
        """
        disconnected_connections = []
        
        # Send message to each active connection
        for connection_id, websocket in self.active_connections.items():
            try:
                # Convert the message to JSON
                json_message = json.dumps(message)
                
                # Send the message
                await websocket.send_text(json_message)
            except Exception as e:
                logger.error(f"Error sending message to connection {connection_id}: {e}")
                disconnected_connections.append(connection_id)
                
        # Clean up disconnected connections
        for connection_id in disconnected_connections:
            self.disconnect(connection_id)

# Create a connection manager
manager = ConnectionManager()

async def publish_qc_status(document_id: str, status: str, details: Optional[Dict[str, Any]] = None):
    """
    Publish a QC status update for a document
    
    Args:
        document_id: The ID of the document
        status: The QC status (e.g., "in_progress", "success", "failed")
        details: Optional details about the QC result
    """
    message = {
        "type": "qc_status",
        "document_id": document_id,
        "status": status,
    }
    
    # Add details if provided
    if details:
        message["details"] = details
        
    # Broadcast the message
    await manager.broadcast_to_document(document_id, message)
    
    # Also broadcast to clients watching "all" documents
    await manager.broadcast_to_document("all", message)

@router.websocket("/qc")
async def qc_websocket(websocket: WebSocket):
    """WebSocket endpoint for QC status updates"""
    connection_id = None
    
    try:
        # Accept the connection
        connection_id = await manager.connect(websocket)
        
        # Subscribe to all documents by default
        manager.subscribe_to_document(connection_id, "all")
        
        # Send an initial status message
        await websocket.send_text(json.dumps({
            "type": "connection_status",
            "status": "connected",
            "connection_id": connection_id
        }))
        
        # Process messages
        while True:
            # Wait for a message
            data = await websocket.receive_text()
            
            try:
                # Parse the message
                message = json.loads(data)
                
                # Handle different message types
                if message.get("type") == "subscribe":
                    document_id = message.get("document_id")
                    if document_id:
                        manager.subscribe_to_document(connection_id, document_id)
                        
                        # Acknowledge the subscription
                        await websocket.send_text(json.dumps({
                            "type": "subscription_status",
                            "status": "subscribed",
                            "document_id": document_id
                        }))
                elif message.get("type") == "unsubscribe":
                    document_id = message.get("document_id")
                    if document_id:
                        manager.unsubscribe_from_document(connection_id, document_id)
                        
                        # Acknowledge the unsubscription
                        await websocket.send_text(json.dumps({
                            "type": "subscription_status",
                            "status": "unsubscribed",
                            "document_id": document_id
                        }))
                elif message.get("type") == "ping":
                    # Respond to ping messages to keep the connection alive
                    await websocket.send_text(json.dumps({
                        "type": "pong",
                        "timestamp": time.time()
                    }))
            except json.JSONDecodeError:
                # Invalid JSON
                logger.warning(f"Received invalid JSON from connection {connection_id}")
            except Exception as e:
                # Other errors
                logger.error(f"Error processing message from connection {connection_id}: {e}")
                
    except WebSocketDisconnect:
        # Connection closed
        if connection_id:
            manager.disconnect(connection_id)
    except Exception as e:
        # Other errors
        logger.error(f"WebSocket error: {e}")
        if connection_id:
            manager.disconnect(connection_id)

# Register event handler for QC events
async def on_qc_event(document_id: str, status: str, details: Optional[Dict[str, Any]] = None):
    """
    Handler for QC events to forward to WebSocket clients
    
    This function should be called whenever a document's QC status changes.
    
    Args:
        document_id: The ID of the document
        status: The QC status (e.g., "in_progress", "success", "failed")
        details: Optional details about the QC result
    """
    # Forward the event to WebSocket clients
    await publish_qc_status(document_id, status, details)

# Register with the event bus
event_bus = global_event_bus
event_bus.register("qc_status_update", on_qc_event)