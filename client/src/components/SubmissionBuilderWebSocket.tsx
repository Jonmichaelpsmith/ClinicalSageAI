import React, { useEffect, useState } from 'react';

interface WebSocketMessage {
  type: string;
  documentId: number;
  status: 'passed' | 'failed' | 'warning' | 'processing';
  timestamp?: string;
  message?: string;
}

interface SubmissionBuilderWebSocketProps {
  onQcUpdate: (update: WebSocketMessage) => void;
  region: string;
}

/**
 * WebSocket component for real-time QC badge updates
 * 
 * This component establishes a WebSocket connection to receive
 * real-time updates on document QC status, which allows the UI
 * to reflect validation results without requiring a page refresh.
 */
const SubmissionBuilderWebSocket: React.FC<SubmissionBuilderWebSocketProps> = ({ 
  onQcUpdate,
  region = 'FDA' 
}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [reconnectCount, setReconnectCount] = useState(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  useEffect(() => {
    // Create WebSocket connection
    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/qc`;
      
      console.log(`Connecting to WebSocket at ${wsUrl}`);
      const newSocket = new WebSocket(wsUrl);
      
      newSocket.onopen = () => {
        console.log('WebSocket connection established');
        setConnected(true);
        setReconnectCount(0);
        
        // Send region information to the server
        newSocket.send(JSON.stringify({ 
          type: 'subscribe',
          region 
        }));
      };
      
      newSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WebSocketMessage;
          console.log('Received WebSocket message:', data);
          
          // Only process QC status updates
          if (data.type === 'qc_status' && data.documentId) {
            console.log('Processing QC update:', data);
            onQcUpdate(data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      newSocket.onclose = (event) => {
        console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
        setConnected(false);
        
        // Attempt to reconnect
        if (reconnectCount < MAX_RECONNECT_ATTEMPTS) {
          console.log(`Attempting to reconnect (${reconnectCount + 1}/${MAX_RECONNECT_ATTEMPTS})...`);
          setTimeout(() => {
            setReconnectCount(prevCount => prevCount + 1);
            connectWebSocket();
          }, 3000);
        } else {
          console.error('Maximum reconnection attempts reached');
        }
      };
      
      newSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      setSocket(newSocket);
    };
    
    connectWebSocket();
    
    // Cleanup on unmount
    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        console.log('Closing WebSocket connection');
        socket.close();
      }
    };
  }, [region, reconnectCount, onQcUpdate]);

  return (
    <div className="websocket-status" style={{ display: 'none' }}>
      {connected ? 'Connected to QC updates' : 'Connecting to QC updates...'}
    </div>
  );
};

export default SubmissionBuilderWebSocket;