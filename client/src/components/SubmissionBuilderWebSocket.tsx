import React, { useEffect } from 'react';

interface SubmissionBuilderWebSocketProps {
  onQcUpdate: (update: any) => void;
  region: string;
}

/**
 * WebSocket component for the Submission Builder
 * 
 * Handles QC status updates and streams them to the parent component
 */
const SubmissionBuilderWebSocket: React.FC<SubmissionBuilderWebSocketProps> = ({ 
  onQcUpdate,
  region
}) => {
  useEffect(() => {
    // Create WebSocket connection
    let ws: WebSocket | null = null;
    
    try {
      // Determine protocol and create WS connection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws/qc`;
      
      console.log('Connecting to WebSocket at:', wsUrl);
      ws = new WebSocket(wsUrl);
      
      // Handle connection open
      ws.onopen = () => {
        console.log('WebSocket connection established');
        
        // Send region to server to get region-specific updates
        ws.send(JSON.stringify({ 
          type: 'subscribe', 
          region: region 
        }));
      };
      
      // Handle messages
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          if (data && onQcUpdate) {
            onQcUpdate(data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      // Handle connection close
      ws.onclose = (event) => {
        if (event.wasClean) {
          console.log(`WebSocket connection closed cleanly, code=${event.code}, reason=${event.reason}`);
        } else {
          console.error('WebSocket connection died');
        }
      };
      
      // Handle errors
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
    }
    
    // Clean up on unmount
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        console.log('Closing WebSocket connection');
        ws.close();
      }
    };
  }, [onQcUpdate, region]); // Re-connect when region changes
  
  // This is a connectivity-only component, it doesn't render anything
  return null;
};

export default SubmissionBuilderWebSocket;