/**
 * WebSocket QC Updates Endpoint
 * 
 * This module provides a WebSocket server endpoint for real-time QC status updates.
 * Clients can connect to receive live document QC status changes.
 */

import { WebSocketServer } from 'ws';
import { subscribe, unsubscribe } from '../../utils/event_bus.js';

let wss = null;
const clients = new Set();

/**
 * Initialize WebSocket server
 * 
 * @param {object} options Options object
 * @param {object} options.server HTTP server instance
 * @param {string} options.path WebSocket endpoint path
 */
export function init({ server, path = '/ws/qc' }) {
  if (wss) {
    console.warn('QC WebSocket server already initialized');
    return;
  }

  // Create WebSocket server
  wss = new WebSocketServer({ server, path });
  
  // Set up connection handler
  wss.on('connection', (ws) => {
    console.log('QC WebSocket client connected');
    clients.add(ws);
    
    ws.on('close', () => {
      console.log('QC WebSocket client disconnected');
      clients.delete(ws);
    });
    
    ws.on('error', (error) => {
      console.error('QC WebSocket client error:', error);
      clients.delete(ws);
    });
  });
  
  // Subscribe to QC events
  subscribe('qc', (data) => {
    const payload = JSON.stringify(data);
    for (const client of clients) {
      if (client.readyState === client.OPEN) {
        try {
          client.send(payload);
        } catch (error) {
          console.error('Failed to send QC update to client:', error);
          clients.delete(client);
        }
      }
    }
  });
  
  console.log(`QC WebSocket server listening at ${path}`);
  return wss;
}

/**
 * Shutdown WebSocket server
 */
export function shutdown() {
  if (!wss) return;
  
  // Unsubscribe from QC events
  unsubscribe('qc');
  
  // Close all client connections
  for (const client of clients) {
    client.terminate();
  }
  clients.clear();
  
  // Close server
  wss.close(() => {
    console.log('QC WebSocket server closed');
  });
  
  wss = null;
}

export default {
  init,
  shutdown
};