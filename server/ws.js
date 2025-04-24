/**
 * WebSocket Server Configuration
 * 
 * This module initializes and exports WebSocket namespaces for different features:
 * - ioGuidance: For regulatory intelligence updates
 * - ioRTC: For live review room WebRTC signaling
 * 
 * NOTE: This implementation includes fallbacks for when socket.io dependency
 * is not available, ensuring the application can run with reduced functionality.
 */

// Create mock/fallback objects for missing dependencies
// These allow the app to run even if socket.io is not available
class MockNamespace {
  constructor(path) {
    console.log(`[WS Mock] Created namespace: ${path}`);
    this.path = path;
    this.sockets = [];
  }

  on(event, callback) {
    console.log(`[WS Mock] Would register handler for namespace event: ${event} on ${this.path}`);
    return this;
  }

  emit(event, data) {
    console.log(`[WS Mock] Would emit event: ${event} on ${this.path} with data:`, 
      typeof data === 'object' ? JSON.stringify(data).substring(0, 100) : data);
    return this;
  }
}

class MockServer {
  constructor(httpServer, options) {
    console.log(`[WS Mock] Created server with options:`, options);
    this._nsps = {};
  }

  of(nsp) {
    if (!this._nsps[nsp]) {
      this._nsps[nsp] = new MockNamespace(nsp);
    }
    return this._nsps[nsp];
  }

  on(event, callback) {
    console.log(`[WS Mock] Would register handler for server event: ${event}`);
    return this;
  }
}

// Export namespace references - initially null
export let ioGuidance = null;
export let ioRTC = null;

/**
 * Initialize WebSocket namespaces with the HTTP server
 * @param {Server} server - HTTP server instance
 * @returns {object} Socket.io server instance or mock
 */
export async function initWs(server) {
  console.log('[WS] Initializing WebSocket server...');
  
  let Server;
  try {
    // Use dynamic import for ES modules
    const socketModule = await import('socket.io');
    Server = socketModule.Server;
    console.log('[WS] Socket.io successfully loaded');
  } catch (error) {
    console.warn(`[WS] Socket.io not available, using mock implementation:`, 
      error.message || String(error));
    Server = MockServer;
  }
  
  try {
    // Create server instance
    const io = new Server(server);
    
    // Create namespace for regulatory guidance
    ioGuidance = io.of(process.env.WS_REG_INTEL_PATH || '/ws-guidance');
    ioGuidance.on('connection', (socket) => {
      console.log('[WS] Regulatory guidance client connected:', socket.id);
      
      socket.on('disconnect', () => {
        console.log('[WS] Regulatory guidance client disconnected:', socket.id);
      });
    });
    
    // Create namespace for WebRTC signaling
    ioRTC = io.of(process.env.REVIEW_RTC_SIGNAL || '/rtc-signal');
    ioRTC.on('connection', (socket) => {
      console.log('[WS] WebRTC client connected:', socket.id);
      
      socket.on('join', (roomId) => {
        socket.join(roomId);
        console.log(`[WS] Client ${socket.id} joined room: ${roomId}`);
      });
      
      socket.on('signal', (data) => {
        const { room, d } = data;
        socket.to(room).emit('signal', { d });
      });
      
      socket.on('disconnect', () => {
        console.log('[WS] WebRTC client disconnected:', socket.id);
      });
    });
    
    console.log('[WS] WebSocket server initialized with namespaces:', 
      Object.keys(io._nsps || {}).join(', '));
    
    return io;
  } catch (error) {
    console.error('[WS] Error initializing WebSocket server:', 
      error.message || String(error));
    
    // Create mock namespaces as fallbacks
    ioGuidance = new MockNamespace('/ws-guidance');
    ioRTC = new MockNamespace('/rtc-signal');
    
    console.log('[WS] Created mock WebSocket namespaces for degraded operation');
    
    // Return a mock server that won't crash the application
    return {
      _nsps: { '/ws-guidance': ioGuidance, '/rtc-signal': ioRTC }
    };
  }
}