import { useEffect } from "react";

/**
 * Custom hook for connecting to the QC WebSocket endpoint
 * 
 * @param {function} onMessage - Callback function to handle incoming WebSocket messages
 */
export const useQcSocket = (onMessage) => {
  useEffect(() => {
    // Create WebSocket connection with appropriate protocol
    const ws = new WebSocket(`${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws/qc`);
    
    // Handle incoming messages
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        onMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    // Handle connection open
    ws.onopen = () => {
      console.log('QC WebSocket connection established');
    };
    
    // Handle errors
    ws.onerror = (error) => {
      console.error('QC WebSocket error:', error);
    };
    
    // Handle connection close
    ws.onclose = () => {
      console.log('QC WebSocket connection closed');
    };
    
    // Clean up WebSocket on unmount
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [onMessage]);
};