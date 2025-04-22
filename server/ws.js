/**
 * WebSocket Server Configuration
 * 
 * This module initializes and exports WebSocket namespaces for different features:
 * - ioGuidance: For regulatory intelligence updates
 * - ioRTC: For live review room WebRTC signaling
 */

import { Server } from "socket.io";

export let ioGuidance;
export let ioRTC;

/**
 * Initialize WebSocket namespaces with the HTTP server
 * @param {Server} server - HTTP server instance
 */
export function initWs(server) {
  const io = new Server(server);
  
  // Create namespace for regulatory guidance
  ioGuidance = io.of(process.env.WS_REG_INTEL_PATH || '/ws-guidance');
  ioGuidance.on('connection', (socket) => {
    console.log('Regulatory guidance client connected:', socket.id);
    
    socket.on('disconnect', () => {
      console.log('Regulatory guidance client disconnected:', socket.id);
    });
  });
  
  // Create namespace for WebRTC signaling
  ioRTC = io.of(process.env.REVIEW_RTC_SIGNAL || '/rtc-signal');
  ioRTC.on('connection', (socket) => {
    console.log('WebRTC client connected:', socket.id);
    
    socket.on('join', (roomId) => {
      socket.join(roomId);
      console.log(`Client ${socket.id} joined room: ${roomId}`);
    });
    
    socket.on('signal', (data) => {
      const { room, d } = data;
      socket.to(room).emit('signal', { d });
    });
    
    socket.on('disconnect', () => {
      console.log('WebRTC client disconnected:', socket.id);
    });
  });
  
  console.log('WebSocket server initialized with namespaces:', 
    Object.keys(io._nsps).join(', '));
  
  return io;
}