import { useEffect, useRef } from 'react';

/**
 * Region-aware Quality Control WebSocket hook
 * 
 * Provides a stable WebSocket connection with automatic reconnection
 * for receiving quality control updates from specific regulatory regions
 * 
 * @param region - The regulatory region to subscribe to ('FDA', 'EMA', 'PMDA')
 * @param onMsg - Callback function for handling incoming messages
 */
export const useQCWebSocket = (region = 'FDA', onMsg: (msg: any) => void) => {
  const ws = useRef<WebSocket>();
  
  useEffect(() => {
    let retry = 0;
    const maxRetryDelay = 30000; // Max retry delay of 30 seconds
    let isComponentMounted = true;
    
    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws/qc?region=${region}`;
      
      try {
        ws.current = new WebSocket(wsUrl);
        
        ws.current.onopen = () => {
          console.log(`QC WebSocket connected for region: ${region}`);
          retry = 0; // Reset retry counter on successful connection
        };
        
        ws.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            onMsg(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        ws.current.onclose = () => {
          // Only attempt reconnection if component is still mounted
          if (isComponentMounted) {
            console.log(`QC WebSocket closed for region: ${region}, attempting reconnect...`);
            // Exponential backoff strategy
            const delay = Math.min(1000 * Math.pow(2, retry), maxRetryDelay);
            retry++;
            setTimeout(connect, delay);
          }
        };
        
        ws.current.onerror = (error) => {
          console.error(`QC WebSocket error for region: ${region}`, error);
        };
        
      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        if (isComponentMounted) {
          setTimeout(connect, Math.min(1000 * Math.pow(2, retry++), maxRetryDelay));
        }
      }
    };
    
    connect();
    
    // Cleanup function
    return () => {
      isComponentMounted = false;
      if (ws.current) {
        ws.current.onclose = null; // Prevent onclose from triggering reconnect
        ws.current.close();
      }
    };
  }, [region, onMsg]);
  
  // Return methods to interact with the WebSocket
  return {
    send: (data: any) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(data));
      } else {
        console.warn('Cannot send message, WebSocket is not connected');
      }
    }
  };
};

export default useQCWebSocket;