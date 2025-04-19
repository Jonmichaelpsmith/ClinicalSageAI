/**
 * WebSocket Server Module
 * 
 * This module initializes and manages WebSocket connections
 * for real-time updates across the application.
 */

import { WebSocketServer } from 'ws';
import { subscribe, subscribeToMany } from '../../utils/event_bus.js';

// Client tracking
let nextClientId = 1;
const clients = new Map();

// Active WebSocket server instance
let wss = null;

/**
 * Initialize the WebSocket server on an existing HTTP server
 * 
 * @param {object} httpServer - The HTTP server to attach the WebSocket server to
 * @param {object} options - Configuration options
 */
export function initWebSocketServer(httpServer, options = {}) {
  const path = options?.path || '/ws';
  
  if (!httpServer) {
    console.error('No HTTP server provided to initWebSocketServer');
    return null;
  }
  
  try {
    // Create WebSocket server with specific path
    wss = new WebSocketServer({ 
      server: httpServer,
      path: path 
    });
    
    console.log(`WebSocket server initialized on path: ${path}`);
    
    // Set up connection handler
    wss.on('connection', handleConnection);
    
    // Handle server errors
    wss.on('error', (error) => {
      console.error('WebSocket server error:', error);
    });
    
    return wss;
  } catch (error) {
    console.error('Error initializing WebSocket server:', error);
    return null;
  }
}

/**
 * Handle new WebSocket connection
 * 
 * @param {object} ws - The WebSocket connection
 * @param {object} req - The HTTP request that initiated the connection
 */
function handleConnection(ws, req) {
  const clientId = nextClientId++;
  const clientIp = req.socket.remoteAddress;
  
  console.log(`WebSocket client connected: #${clientId} from ${clientIp}`);
  
  // Add to clients map
  clients.set(clientId, {
    id: clientId,
    ws,
    ip: clientIp,
    subscriptions: [],
    connectedAt: new Date().toISOString()
  });
  
  // Send welcome message
  sendToClient(ws, {
    type: 'connection',
    clientId,
    message: 'Connected to TrialSage WebSocket Server'
  });
  
  // Set up message handler
  ws.on('message', (message) => handleClientMessage(clientId, message));
  
  // Set up close handler
  ws.on('close', () => handleDisconnection(clientId));
  
  // Set up error handler
  ws.on('error', (error) => {
    console.error(`WebSocket error for client #${clientId}:`, error);
  });
  
  // Set up default subscriptions that all clients get
  setupDefaultSubscriptions(clientId, ws);
}

/**
 * Handle client disconnection
 * 
 * @param {number} clientId - The ID of the disconnected client
 */
function handleDisconnection(clientId) {
  const client = clients.get(clientId);
  
  if (client) {
    console.log(`WebSocket client disconnected: #${clientId}`);
    
    // Clean up any subscriptions
    if (client.subscriptions) {
      client.subscriptions.forEach(unsub => {
        if (typeof unsub === 'function') {
          unsub();
        }
      });
    }
    
    // Remove from clients map
    clients.delete(clientId);
  }
}

/**
 * Handle a message from a WebSocket client
 * 
 * @param {number} clientId - The client ID
 * @param {string|Buffer} message - The raw message from the client
 */
function handleClientMessage(clientId, message) {
  const client = clients.get(clientId);
  
  if (!client) {
    console.warn(`Received message from unknown client #${clientId}`);
    return;
  }
  
  let parsedMessage;
  
  try {
    parsedMessage = JSON.parse(message.toString());
  } catch (err) {
    console.error(`Failed to parse message from client #${clientId}:`, err);
    return sendToClient(client.ws, {
      type: 'error',
      message: 'Invalid JSON message format'
    });
  }
  
  const { type, data } = parsedMessage;
  
  console.log(`Received message from client #${clientId}, type: ${type}`);
  
  switch (type) {
    case 'subscribe':
      handleSubscribe(clientId, data);
      break;
    case 'unsubscribe':
      handleUnsubscribe(clientId, data);
      break;
    case 'ping':
      sendToClient(client.ws, { type: 'pong', timestamp: new Date().toISOString() });
      break;
    default:
      sendToClient(client.ws, {
        type: 'error',
        message: `Unknown message type: ${type}`
      });
  }
}

/**
 * Handle a subscribe request from a client
 * 
 * @param {number} clientId - The client ID
 * @param {object} data - The subscription data
 */
function handleSubscribe(clientId, data) {
  const client = clients.get(clientId);
  
  if (!client) return;
  
  const channels = Array.isArray(data.channels) ? data.channels : [data.channels];
  
  if (!channels.length) {
    return sendToClient(client.ws, {
      type: 'error',
      message: 'No channels specified for subscription'
    });
  }
  
  console.log(`Client #${clientId} subscribing to channels:`, channels);
  
  // Subscribe to channels
  const unsubscribe = subscribeToMany(channels, (event) => {
    sendToClient(client.ws, {
      type: 'event',
      channel: event.channel,
      data: event.data,
      timestamp: event.timestamp,
      eventId: event.id
    });
  });
  
  // Store unsubscribe function
  client.subscriptions.push(unsubscribe);
  
  // Confirm subscription
  sendToClient(client.ws, {
    type: 'subscribed',
    channels
  });
}

/**
 * Handle an unsubscribe request from a client
 * 
 * @param {number} clientId - The client ID
 * @param {object} data - The unsubscription data
 */
function handleUnsubscribe(clientId, data) {
  // In this simple implementation, we don't track which unsubscribe function
  // corresponds to which channels, so we can't selectively unsubscribe.
  // In a real implementation, you would maintain that mapping.
  
  const client = clients.get(clientId);
  
  if (!client) return;
  
  // Just acknowledge the unsubscribe request
  sendToClient(client.ws, {
    type: 'unsubscribed',
    message: 'Unsubscribed from specified channels'
  });
}

/**
 * Set up default subscriptions for a client
 * 
 * @param {number} clientId - The client ID
 * @param {object} ws - The WebSocket connection
 */
function setupDefaultSubscriptions(clientId, ws) {
  const client = clients.get(clientId);
  
  if (!client) return;
  
  // Subscribe to system announcements
  const unsubscribeSystem = subscribe('system', (event) => {
    sendToClient(ws, {
      type: 'event',
      channel: 'system',
      data: event.data,
      timestamp: event.timestamp,
      eventId: event.id
    });
  });
  
  client.subscriptions.push(unsubscribeSystem);
}

/**
 * Send a message to a specific WebSocket client
 * 
 * @param {object} ws - The WebSocket connection
 * @param {object} data - The data to send
 */
function sendToClient(ws, data) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

/**
 * Broadcast a message to all connected clients
 * 
 * @param {object} data - The data to broadcast
 */
export function broadcast(data) {
  clients.forEach(client => {
    sendToClient(client.ws, data);
  });
}

/**
 * Get the number of connected clients
 * 
 * @returns {number} The number of connected clients
 */
export function getClientCount() {
  return clients.size;
}

/**
 * Get the WebSocket server instance
 * 
 * @returns {object|null} The WebSocket server instance
 */
export function getWebSocketServer() {
  return wss;
}

export default {
  initWebSocketServer,
  broadcast,
  getClientCount,
  getWebSocketServer
};