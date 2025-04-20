/**
 * useQcSocket - React hook for QC WebSocket connection
 * 
 * This hook provides a connection to the QC WebSocket server for real-time 
 * updates on document QC status. It handles connection management, reconnection,
 * and event subscription.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface QcUpdate {
  type: string;
  document_id: string;
  status: string;
  timestamp: string;
  details?: any;
}

interface UseQcSocketOptions {
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onMessage?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export function useQcSocket(options: UseQcSocketOptions = {}) {
  const {
    autoConnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<QcUpdate | null>(null);
  const [documentUpdates, setDocumentUpdates] = useState<Record<string, QcUpdate>>({});
  
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get WebSocket URL based on current location
  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws/qc`;
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    // Clean up any existing connection
    if (socketRef.current) {
      socketRef.current.close();
    }

    try {
      const socket = new WebSocket(getWebSocketUrl());
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('QC WebSocket connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        onConnect?.();
      };

      socket.onclose = (event) => {
        console.log('QC WebSocket disconnected', event);
        setIsConnected(false);
        onDisconnect?.();

        // Try to reconnect if not closed cleanly
        if (!event.wasClean && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
          
          // Exponential backoff
          const delay = reconnectInterval * Math.pow(1.5, reconnectAttemptsRef.current - 1);
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        }
      };

      socket.onerror = (error) => {
        console.error('QC WebSocket error:', error);
        onError?.(error);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Update our state based on message type
          if (data.type === 'qc_update') {
            // Store the update in our document updates
            setDocumentUpdates(prev => ({
              ...prev,
              [data.document_id]: data
            }));
            
            // Set as last message
            setLastMessage(data);
          }
          
          // Call the custom message handler
          onMessage?.(data);
          
        } catch (err) {
          console.error('Error parsing QC WebSocket message:', err);
        }
      };
    } catch (error) {
      console.error('Error connecting to QC WebSocket:', error);
    }
  }, [getWebSocketUrl, maxReconnectAttempts, onConnect, onDisconnect, onError, onMessage, reconnectInterval]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  }, []);

  // Subscribe to a document's QC updates
  const subscribeToDocument = useCallback((documentId: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'subscribe',
        document_id: documentId
      }));
      return true;
    }
    return false;
  }, []);

  // Unsubscribe from a document's QC updates
  const unsubscribeFromDocument = useCallback((documentId: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'unsubscribe',
        document_id: documentId
      }));
      return true;
    }
    return false;
  }, []);

  // Send a ping to keep the connection alive
  const sendPing = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'ping',
        timestamp: new Date().toISOString()
      }));
      return true;
    }
    return false;
  }, []);

  // Auto connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Clean up on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Handle window focus/blur to reconnect when tab becomes active
  useEffect(() => {
    const handleFocus = () => {
      if (!isConnected && autoConnect) {
        connect();
      }
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [autoConnect, connect, isConnected]);

  // Send a ping every 30 seconds to keep the connection alive
  useEffect(() => {
    if (!isConnected) return;
    
    const pingInterval = setInterval(() => {
      sendPing();
    }, 30000);
    
    return () => {
      clearInterval(pingInterval);
    };
  }, [isConnected, sendPing]);

  // Return the connection state and methods
  return {
    isConnected,
    connect,
    disconnect,
    subscribeToDocument,
    unsubscribeFromDocument,
    lastMessage,
    documentUpdates,
    sendPing,
  };
}

export default useQcSocket;