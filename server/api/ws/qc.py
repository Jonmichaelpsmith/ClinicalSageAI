"""
QC WebSocket API

This module provides a WebSocket endpoint for real-time QC status updates.
It includes:
1. Authentication via Bearer token
2. WebSocket connection management
3. Event subscription for QC updates
4. Heartbeat ping/pong for connection health
"""
import json
import asyncio
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends, HTTPException
from server.utils.event_bus import subscribe, unsubscribe

# Create router
router = APIRouter()

# Active connections
active_connections: Dict[str, WebSocket] = {}

# QC WebSocket endpoint
@router.websocket("/ws/qc")
async def websocket_qc_endpoint(
    websocket: WebSocket,
    token: Optional[str] = Query(None, description="Bearer authentication token"),
):
    """
    WebSocket endpoint for real-time QC status updates
    
    Features:
    - Authentication via Bearer token in query parameter
    - JSON message format: {type: "qc", id: "doc123", status: "pass"}
    - Heartbeat ping every 25 seconds: {type: "ping"}
    
    Args:
        websocket: WebSocket connection
        token: Bearer authentication token (optional during development)
    """
    # Generate a unique connection ID
    connection_id = f"conn_{id(websocket)}"
    
    # Verify authentication (simplified for now)
    # In production, decode and verify JWT token
    if token:
        print(f"WebSocket connection with token: {token[:10]}...")
        # This is where you'd verify the token
        # if not verify_token(token):
        #     await websocket.close(code=1008)  # Policy violation
        #     return
    else:
        # For development only - remove this allowance in production
        print("Warning: WebSocket connection without authentication token")
    
    try:
        # Accept the connection
        await websocket.accept()
        active_connections[connection_id] = websocket
        
        # Subscribe to QC events
        def on_qc_event(data: str):
            asyncio.create_task(send_message(websocket, data))
        
        subscribe("qc_update", on_qc_event)
        
        # Send welcome message
        await websocket.send_text(json.dumps({
            "type": "connected",
            "message": "Connected to QC updates"
        }))
        
        # Start heartbeat task
        heartbeat_task = asyncio.create_task(send_heartbeat(websocket))
        
        # Handle incoming messages 
        try:
            while True:
                data = await websocket.receive_text()
                try:
                    message = json.loads(data)
                    # Handle pong responses
                    if message.get("type") == "pong":
                        continue
                    # Other message types can be handled here
                except json.JSONDecodeError:
                    pass
        except WebSocketDisconnect:
            # Clean disconnection handling in the outer exception block
            pass
        finally:
            # Cancel heartbeat when the loop exits
            heartbeat_task.cancel()
            
    except WebSocketDisconnect:
        # Handle disconnection
        if connection_id in active_connections:
            del active_connections[connection_id]
        unsubscribe("qc_update", on_qc_event)
        print(f"WebSocket client {connection_id} disconnected")
    except Exception as e:
        print(f"WebSocket error: {str(e)}")
        # Handle any other exceptions
        if connection_id in active_connections:
            del active_connections[connection_id]
        try:
            unsubscribe("qc_update", on_qc_event)
        except:
            pass

async def send_message(websocket: WebSocket, data: str):
    """Send a message to the WebSocket client"""
    try:
        await websocket.send_text(data)
    except Exception as e:
        print(f"Error sending message: {str(e)}")

async def send_heartbeat(websocket: WebSocket):
    """Send periodic heartbeat pings"""
    try:
        while True:
            await asyncio.sleep(25)  # 25 second interval
            try:
                await websocket.send_text(json.dumps({"type": "ping"}))
            except:
                # If sending fails, the connection handler will clean up
                break
    except asyncio.CancelledError:
        # Task was cancelled, exit cleanly
        pass