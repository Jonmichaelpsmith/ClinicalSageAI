// Toast notification system upgraded to SecureToast

// useQCWebSocket.tsx – Custom WebSocket hook for QC real-time updates
import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '../App';

interface QCWebSocketOptions {
  onMessage?: (data: any) => void;
  onStatusChange?: (status: string) => void;
  region?: string;
  documentIds?: number[];
}

/**
 * Custom hook for managing QC WebSocket connection
 * Provides real-time updates for document QC status
 */
export function useQCWebSocket({
  onMessage,
  onStatusChange,
  region = 'FDA',
  documentIds = []
}: QCWebSocketOptions = {}) {
  const [status, setStatus] = useState<string>('disconnected');
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const reconnectAttempt = useRef<number>(0);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;

  // Update status and notify parent component
  const updateStatus = useCallback((newStatus: string) => {
    setStatus(newStatus);
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
  }, [onStatusChange]);

  // Connect to the WebSocket server
  useEffect(() => {
    // Clear any existing reconnect timeout
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
    
    updateStatus('connecting');
    
    // Determine WebSocket URL based on current protocol
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/qc`;
    
    console.log(`Connecting to QC WebSocket: ${wsUrl}`);
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('QC WebSocket connected');
      updateStatus('connected');
      reconnectAttempt.current = 0;
      
      // Subscribe to specific document IDs if provided
      if (documentIds.length > 0) {
        ws.send(JSON.stringify({
          type: 'subscribe',
          documentIds,
          region
        }));
      }
      
      // Notify with toast
      useToast().showToast('QC WebSocket connected', "success");
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('QC WebSocket received:', data);
        
        // Handle specific message types
        switch (data.type) {
          case 'qc_status':
            // Show toast notification for QC status updates
            if (data.status === 'passed') {
              useToast().showToast(`Document #${data.documentId} passed QC`, "success");
            } else if (data.status === 'failed') {
              useToast().showToast(`Document #${data.documentId} failed QC: ${data.message || 'No details provided'}`, "error");
            }
            break;
            
          case 'heartbeat':
            // Heartbeat messages are just for keeping the connection alive
            console.log('Received WebSocket heartbeat');
            break;
        }
        
        // Call the message handler callback
        if (onMessage) {
          onMessage(data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('QC WebSocket error:', error);
      updateStatus('error');
    };
    
    ws.onclose = () => {
      console.log('QC WebSocket closed');
      updateStatus('disconnected');
      
      // Attempt to reconnect if not at max attempts
      if (reconnectAttempt.current < maxReconnectAttempts) {
        reconnectAttempt.current += 1;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempt.current), 30000);
        
        console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempt.current})`);
        updateStatus('reconnecting');
        
        reconnectTimeout.current = setTimeout(() => {
          // This will trigger the useEffect again
          setSocket(null);
        }, delay);
      } else {
        console.log('Max reconnect attempts reached, giving up');
        useToast().showToast('Unable to connect to QC WebSocket after multiple attempts', "error");
      }
    };
    
    // Store the WebSocket instance
    setSocket(ws);
    
    // Clean up function
    return () => {
      console.log('Cleaning up WebSocket connection');
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      
      if (ws) {
        // Properly close the WebSocket
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
      }
    };
  }, [region, documentIds, updateStatus, onMessage]);
  
  // Send message function
  const send = useCallback((data: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
      return true;
    }
    console.warn('WebSocket not connected, cannot send message');
    return false;
  }, [socket]);
  
  // Manually reconnect function
  const reconnect = useCallback(() => {
    if (socket) {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close();
      }
    }
    
    reconnectAttempt.current = 0;
    setSocket(null);  // This will trigger the useEffect to reconnect
  }, [socket]);
  
  return { 
    status, 
    send,
    reconnect,
    isConnected: status === 'connected'
  };
}

export default useQCWebSocket;