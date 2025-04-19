"""
QC WebSocket Stream Handler

Provides a reliable WebSocket stream for QC events with:
- Structured JSON payloads with type information
- Heartbeat pings to keep connections alive through proxies
- Graceful handling of disconnects
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
import asyncio
import json
from utils.event_bus import subscribe

router = APIRouter(prefix="/ws", tags=["ws"])

PING_INTERVAL = 25  # seconds

@router.websocket("/qc")
async def qc_stream(ws: WebSocket):
    """
    WebSocket endpoint for QC status updates
    
    Provides real-time updates on document validation status
    with support for region-specific validation profiles.
    """
    await ws.accept(subprotocol="json")
    loop = asyncio.get_event_loop()
    cancel = asyncio.Event()
    
    # Store client's region preference if provided in initial connection
    region = None
    
    async def ping():
        """Send periodic heartbeats to keep connection alive"""
        while not cancel.is_set():
            await asyncio.sleep(PING_INTERVAL)
            try:
                await ws.send_json({"type": "ping"})
            except WebSocketDisconnect:
                cancel.set()
                break

    async def push(msg: str):
        """Push QC update to the client"""
        try:
            # Parse the message and convert to a properly typed JSON object
            data = json.loads(msg)
            
            # Add the message type for client-side routing
            payload = {"type": "qc", **data}
            
            # Only send region-specific updates if client has subscribed to a region
            if region and "region" in data and data["region"] != region:
                return
                
            await ws.send_json(payload)
        except WebSocketDisconnect:
            cancel.set()

    # Subscribe to in-process/redis event bus for QC updates
    # This allows the QC validation system to push updates as they happen
    subscribe("qc_status", lambda m: loop.create_task(push(m)))
    subscribe("bulk_qc_summary", lambda m: loop.create_task(push(m)))
    subscribe("bulk_qc_error", lambda m: loop.create_task(push(m)))
    
    # Start heartbeat task
    loop.create_task(ping())

    try:
        # Handle incoming messages (region selection, etc.)
        while not cancel.is_set():
            # Receive client messages (could be region preference)
            data = await ws.receive_json()
            
            # Handle subscription to specific region
            if data.get("type") == "subscribe" and "region" in data:
                region = data["region"]
                await ws.send_json({
                    "type": "subscribed", 
                    "region": region,
                    "message": f"Subscribed to {region} QC updates"
                })
    except WebSocketDisconnect:
        # Handle client disconnect gracefully
        pass
    finally:
        # Ensure the ping task is cancelled
        cancel.set()