"""
QC WebSocket Server

This module implements a WebSocket server for real-time QC status updates.
"""

import asyncio
import json
import logging
import sys
import os
import uuid
from datetime import datetime
from typing import List, Dict, Any, Set, Optional, Callable

# Add parent path to allow imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# FastAPI imports
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query, HTTPException
from fastapi.responses import JSONResponse

# Import event bus
from utils.event_bus import event_bus

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/ws", tags=["websocket"])

# Track active connections
active_connections: Dict[str, WebSocket] = {}
# Track document subscriptions per connection
connection_subscriptions: Dict[str, Set[str]] = {}

async def send_keepalive_pings(websocket: WebSocket, connection_id: str):
    """
    Send periodic ping messages to keep the WebSocket connection alive
    
    Replit drops idle WebSocket connections after ~60 seconds, so we send
    a ping every 45 seconds to keep the connection alive.
    
    Args:
        websocket: The WebSocket connection
        connection_id: The unique ID for this connection
    """
    # Commented out for debugging - cause of disconnection issue
    logger.warning(f"Keepalive ping task started but will not run (debugging)")
    
    # Just sleep indefinitely to keep the task alive but not send pings
    while connection_id in active_connections:
        await asyncio.sleep(10)
        
    # Original implementation below
    """
    try:
        while connection_id in active_connections:
            # Send a ping message
            await websocket.send_text(json.dumps({
                "type": "ping",
                "timestamp": datetime.utcnow().isoformat()
            }))
            
            logger.debug(f"Sent keepalive ping to connection: {connection_id}")
            
            # Wait 45 seconds before sending another ping
            # This is below Replit's 60-second idle timeout
            await asyncio.sleep(45)
    except Exception as e:
        logger.error(f"Error in keepalive ping task for {connection_id}: {str(e)}")
        # The main WebSocket handler will cleanup on disconnect
    """

@router.websocket("/qc")
async def websocket_qc_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for QC status updates
    
    Allows clients to subscribe to document QC status updates and
    receive real-time notifications when QC processes complete.
    """
    # Accept the connection
    await websocket.accept()
    
    # Generate a unique connection ID
    connection_id = str(uuid.uuid4())
    active_connections[connection_id] = websocket
    connection_subscriptions[connection_id] = set()
    
    logger.info(f"New WebSocket connection: {connection_id}")
    
    try:
        # Create the callback function for this connection
        async def send_update(event: Dict[str, Any]):
            """Send an update to this WebSocket client"""
            if connection_id in active_connections:
                await active_connections[connection_id].send_text(json.dumps(event))
        
        # Welcome message
        await websocket.send_text(json.dumps({
            "type": "connection_established",
            "connection_id": connection_id,
            "timestamp": datetime.utcnow().isoformat()
        }))
        
        # Create a task for sending keepalive pings
        keepalive_task = asyncio.create_task(send_keepalive_pings(websocket, connection_id))
        
        # Handle messages from client
        while True:
            try:
                # Wait for messages from the client
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Handle different message types
                if message.get("action") == "subscribe":
                    # Subscribe to document updates
                    document_ids = message.get("document_ids", [])
                    
                    # Validate input
                    if not isinstance(document_ids, list):
                        await websocket.send_text(json.dumps({
                            "type": "error",
                            "error": "document_ids must be a list"
                        }))
                        continue
                    
                    # Subscribe to each document
                    for doc_id in document_ids:
                        # Add to this connection's subscriptions
                        connection_subscriptions[connection_id].add(doc_id)
                        # Subscribe to events
                        event_bus.subscribe_to_document(doc_id, send_update)
                    
                    # Acknowledgment
                    await websocket.send_text(json.dumps({
                        "type": "subscription_confirmed",
                        "document_ids": list(connection_subscriptions[connection_id])
                    }))
                    
                    # Get and send current status for each document
                    for doc_id in document_ids:
                        status = event_bus.get_document_status(doc_id)
                        if status:
                            await websocket.send_text(json.dumps(status))
                
                elif message.get("action") == "unsubscribe":
                    # Unsubscribe from document updates
                    document_ids = message.get("document_ids", [])
                    
                    # Validate input
                    if not isinstance(document_ids, list):
                        await websocket.send_text(json.dumps({
                            "type": "error",
                            "error": "document_ids must be a list"
                        }))
                        continue
                    
                    # Unsubscribe from each document
                    for doc_id in document_ids:
                        if doc_id in connection_subscriptions[connection_id]:
                            connection_subscriptions[connection_id].remove(doc_id)
                            event_bus.unsubscribe_from_document(doc_id, send_update)
                    
                    # Acknowledgment
                    await websocket.send_text(json.dumps({
                        "type": "unsubscription_confirmed",
                        "document_ids": document_ids
                    }))
                
                elif message.get("action") == "get_status":
                    # Get current status for a document
                    document_id = message.get("document_id")
                    
                    if not document_id:
                        await websocket.send_text(json.dumps({
                            "type": "error",
                            "error": "document_id is required"
                        }))
                        continue
                    
                    # Get and send status
                    status = event_bus.get_document_status(document_id)
                    if status:
                        await websocket.send_text(json.dumps(status))
                    else:
                        await websocket.send_text(json.dumps({
                            "type": "status_response",
                            "id": document_id,
                            "status": "unknown"
                        }))
                
                elif message.get("action") == "trigger_qc":
                    # Manually trigger QC for a document
                    document_id = message.get("document_id")
                    
                    if not document_id:
                        await websocket.send_text(json.dumps({
                            "type": "error",
                            "error": "document_id is required"
                        }))
                        continue
                    
                    # Forward to QC service
                    await trigger_document_qc(document_id)
                    
                    # Acknowledge
                    await websocket.send_text(json.dumps({
                        "type": "qc_triggered",
                        "id": document_id
                    }))
                
                elif message.get("action") == "trigger_bulk_qc":
                    # Trigger QC for multiple documents
                    document_ids = message.get("document_ids", [])
                    
                    # Validate input
                    if not isinstance(document_ids, list):
                        await websocket.send_text(json.dumps({
                            "type": "error",
                            "error": "document_ids must be a list"
                        }))
                        continue
                    
                    # Trigger QC for each document
                    for doc_id in document_ids:
                        await trigger_document_qc(doc_id)
                    
                    # Acknowledge
                    await websocket.send_text(json.dumps({
                        "type": "bulk_qc_triggered",
                        "document_count": len(document_ids)
                    }))
                
                else:
                    # Unknown action
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "error": f"Unknown action: {message.get('action')}"
                    }))
            
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "error": "Invalid JSON"
                }))
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: {connection_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
    finally:
        # Cancel keepalive task
        if 'keepalive_task' in locals():
            keepalive_task.cancel()
            try:
                await keepalive_task
            except asyncio.CancelledError:
                pass  # Task successfully cancelled
        
        # Clean up subscriptions and connection
        if connection_id in connection_subscriptions:
            # Unsubscribe from all documents
            for doc_id in connection_subscriptions[connection_id]:
                try:
                    event_bus.unsubscribe_from_document(doc_id, send_update)
                except Exception as e:
                    logger.error(f"Error unsubscribing from document {doc_id}: {str(e)}")
            
            # Remove subscription record
            del connection_subscriptions[connection_id]
        
        # Remove from active connections
        if connection_id in active_connections:
            del active_connections[connection_id]
            logger.info(f"Cleaned up connection: {connection_id}")

async def trigger_document_qc(document_id: str) -> bool:
    """
    Trigger QC for a document
    
    Args:
        document_id: ID of document to trigger QC for
        
    Returns:
        bool: True if QC was triggered successfully
    """
    try:
        # Publish a 'running' event
        await event_bus.publish({
            "type": "qc_update",
            "id": document_id,
            "status": "running",
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # In a real implementation, this would call the actual QC service
        # For now, simulate QC with a delay and random result
        asyncio.create_task(simulate_qc_process(document_id))
        
        return True
    except Exception as e:
        logger.error(f"Error triggering QC for document {document_id}: {str(e)}")
        return False

async def simulate_qc_process(document_id: str) -> None:
    """
    Simulate a QC process for development/testing
    
    Args:
        document_id: ID of document to simulate QC for
    """
    try:
        # In a real implementation, this would run the actual QC process
        # For now, simulate a delay and random result
        await asyncio.sleep(2 + (hash(document_id) % 3))  # 2-5 second delay based on doc ID
        
        # Simulate a success result
        # In a real implementation, this would be the actual QC result
        await event_bus.publish({
            "type": "qc_update",
            "id": document_id,
            "status": "passed",  # Or 'failed' with errors in a real implementation
            "errors": [],
            "warnings": [],
            "timestamp": datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in simulated QC process for document {document_id}: {str(e)}")
        
        # Publish error event
        await event_bus.publish({
            "type": "qc_update",
            "id": document_id,
            "status": "failed",
            "errors": [f"QC process error: {str(e)}"],
            "warnings": [],
            "timestamp": datetime.utcnow().isoformat()
        })

@router.get("/qc/{document_id}/status")
async def get_document_qc_status(document_id: str):
    """
    HTTP endpoint to get QC status for a document
    
    Args:
        document_id: ID of document to get status for
        
    Returns:
        JSON response with document status
    """
    status = event_bus.get_document_status(document_id)
    
    if status:
        return status
    
    return {
        "type": "status_response",
        "id": document_id,
        "status": "unknown",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/qc/{document_id}/history")
async def get_document_qc_history(document_id: str, limit: int = Query(10, ge=1, le=100)):
    """
    HTTP endpoint to get QC history for a document
    
    Args:
        document_id: ID of document to get history for
        limit: Maximum number of history items to return
        
    Returns:
        JSON response with document history
    """
    history = event_bus.get_document_history(document_id, limit)
    
    return {
        "type": "history_response",
        "id": document_id,
        "history": history,
        "count": len(history)
    }