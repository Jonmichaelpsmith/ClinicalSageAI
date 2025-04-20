import { useEffect, useRef, useState } from 'react';
import getWsUrl from '../utils/getWsUrl';

/**
 * Connection status types for the WebSocket connection
 */
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'reconnecting';

/**
 * Region-aware Quality Control WebSocket hook
 * 
 * Provides a stable WebSocket connection with automatic reconnection
 * for receiving quality control updates from specific regulatory regions
 * 
 * @param region - The regulatory region to subscribe to ('FDA', 'EMA', 'PMDA')
 * @param onMsg - Callback function for handling incoming messages
 * @returns Object with send method and connection status
 */
export const useQCWebSocket = (region = 'FDA', onMsg: (msg: any) => void) => {
  const ws = useRef<WebSocket>();
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const retryCount = useRef(0);
  
  useEffect(() => {
    const maxRetryDelay = 30000; // Max retry delay of 30 seconds
    let isComponentMounted = true;
    let pingInterval: number | null = null;
    
    const connect = () => {
      // Update status to connecting or reconnecting based on retry count
      setStatus(retryCount.current === 0 ? 'connecting' : 'reconnecting');
      
      // Use our utility function to get a reliable WebSocket URL
      const wsUrl = getWsUrl(`/ws/qc?region=${region}`);
      console.log(`[QC WebSocket] Connecting to: ${wsUrl}`);
      
      try {
        ws.current = new WebSocket(wsUrl);
        
        ws.current.onopen = () => {
          console.log(`QC WebSocket connected for region: ${region}`);
          retryCount.current = 0; // Reset retry counter on successful connection
          setStatus('connected');
          
          // Send an initial registration message to the server
          if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
              type: 'REGISTER',
              region: region
            }));
          }
          
          // Set up keepalive ping to prevent Replit from closing idle connections
          // Send a ping every 45 seconds (Replit closes after 60s)
          if (pingInterval) {
            clearInterval(pingInterval);
          }
          
          pingInterval = window.setInterval(() => {
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
              console.log('[QC WebSocket] Sending keepalive ping');
              ws.current.send(JSON.stringify({ type: 'PING' }));
            }
          }, 45000); // 45 seconds
        };
        
        ws.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Handle ping messages with a pong response
            if (data.type === 'ping') {
              console.debug('[QC WebSocket] Received ping, sending pong');
              if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                ws.current.send(JSON.stringify({ 
                  type: 'pong',
                  timestamp: new Date().toISOString() 
                }));
              }
              return; // Don't forward ping messages to the application
            }
            
            // Forward other messages to the application
            onMsg(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        ws.current.onclose = () => {
          // Only attempt reconnection if component is still mounted
          if (isComponentMounted) {
            console.log(`QC WebSocket closed for region: ${region}, attempting reconnect...`);
            setStatus('disconnected');
            
            // Exponential backoff strategy
            const delay = Math.min(1000 * Math.pow(1.5, retryCount.current), maxRetryDelay);
            retryCount.current++;
            
            setTimeout(connect, delay);
          }
        };
        
        ws.current.onerror = (error) => {
          console.error(`QC WebSocket error for region: ${region}`, error);
          setStatus('disconnected');
          
          // No need to attempt reconnect here as onclose will be triggered after onerror
        };
        
      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        setStatus('disconnected');
        
        if (isComponentMounted) {
          const delay = Math.min(1000 * Math.pow(1.5, retryCount.current), maxRetryDelay);
          retryCount.current++;
          setTimeout(connect, delay);
        }
      }
    };
    
    // Initial connection
    connect();
    
    // Cleanup function
    return () => {
      isComponentMounted = false;
      
      // Clear the keepalive ping interval
      if (pingInterval) {
        clearInterval(pingInterval);
        pingInterval = null;
      }
      
      if (ws.current) {
        ws.current.onclose = null; // Prevent onclose from triggering reconnect
        ws.current.close();
      }
    };
  }, [region, onMsg]);
  
  // Return methods to interact with the WebSocket and the current status
  return {
    status,
    send: (data: any) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(data));
        return true;
      } else {
        console.warn('Cannot send message, WebSocket is not connected');
        return false;
      }
    }
  };
};

export default useQCWebSocket;