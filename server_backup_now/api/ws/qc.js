/**
 * WebSocket QC Updates Module
 * 
 * This module provides WebSocket-based real-time QC status updates
 * for documents in the submission builder.
 */

import { WebSocketServer } from 'ws';
import http from 'http';

/**
 * Initialize the QC WebSocket server
 * 
 * @param {http.Server} server - HTTP server instance
 * @returns {WebSocketServer} WebSocket server instance
 */
export function initQcWebSocketServer(server) {
  const wss = new WebSocketServer({ 
    server, 
    path: '/ws/qc',
    // Allow proper client identification
    clientTracking: true
  });

  console.log('QC WebSocket server initialized on path: /ws/qc');

  wss.on('connection', (ws) => {
    console.log('QC WebSocket client connected');
    
    // Send initial connection confirmation
    ws.send(JSON.stringify({
      type: 'connection_status',
      status: 'connected',
      timestamp: new Date().toISOString()
    }));
    
    // Handle client messages
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        console.log('QC WebSocket message received:', data);
        
        // Handle specific message types
        if (data.type === 'subscribe') {
          ws.documentIds = data.documentIds || [];
          ws.send(JSON.stringify({
            type: 'subscription_status',
            status: 'subscribed',
            documentIds: ws.documentIds
          }));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    // Handle client disconnect
    ws.on('close', () => {
      console.log('QC WebSocket client disconnected');
    });
  });

  // Heart beat to keep connections alive
  setInterval(() => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ 
          type: 'heartbeat',
          timestamp: new Date().toISOString()
        }));
      }
    });
  }, 30000);

  return wss;
}

/**
 * Broadcast a QC status update to all connected clients
 * 
 * @param {WebSocketServer} wss - WebSocket server instance
 * @param {number} documentId - ID of the document
 * @param {string} status - New QC status ('passed', 'failed', etc.)
 */
export function broadcastQcUpdate(wss, documentId, status) {
  if (!wss || !wss.clients) {
    console.error('WebSocket server not initialized');
    return;
  }
  
  const message = JSON.stringify({
    type: 'qc_status',
    documentId,
    status,
    timestamp: new Date().toISOString()
  });
  
  let clientCount = 0;
  
  wss.clients.forEach((client) => {
    // Check if client is connected and subscribed to this document (or all docs)
    if (client.readyState === WebSocket.OPEN && 
        (!client.documentIds || client.documentIds.length === 0 || client.documentIds.includes(documentId))) {
      client.send(message);
      clientCount++;
    }
  });
  
  console.log(`QC update for document ${documentId} broadcasted to ${clientCount} clients`);
}

export default {
  initQcWebSocketServer,
  broadcastQcUpdate
};