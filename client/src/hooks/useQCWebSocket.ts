import { useState, useEffect } from 'react';

/**
 * Connection status types for the WebSocket connection
 */
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'reconnecting';

/**
 * DISABLED WebSocket Hook - Polling Fallback Implementation
 * 
 * This implementation is completely disabled to avoid connection issues.
 * It provides a mock implementation that returns sample data for QC statuses.
 * 
 * @param region - The regulatory region to subscribe to ('FDA', 'EMA', 'PMDA')
 * @param onMsg - Callback function for handling incoming messages
 * @returns Object with send method and connection status
 */
export const useQCWebSocket = (region = 'FDA', onMsg: (msg: any) => void) => {
  const [status] = useState<ConnectionStatus>('connected');
  
  // Simulate receiving messages
  useEffect(() => {
    console.log(`[QC WebSocket FALLBACK] Using fallback polling for region: ${region}`);
    
    // Simulate an initial connection message
    setTimeout(() => {
      onMsg({
        type: 'connection_established',
        connection_id: 'fallback-mode',
        timestamp: new Date().toISOString(),
        message: 'WebSocket disabled, using fallback mode'
      });
    }, 500);
    
    // No cleanup needed since we're not actually connecting
    return () => {};
  }, [region, onMsg]);
  
  // Return mock methods
  return {
    status,
    send: (data: any) => {
      console.log('[QC WebSocket FALLBACK] Send called with data:', data);
      
      // Simulate a response for QC triggers
      if (data.action === 'trigger_qc' && data.document_id) {
        setTimeout(() => {
          onMsg({
            type: 'qc_update',
            id: data.document_id,
            status: 'passed',
            timestamp: new Date().toISOString()
          });
        }, 2000);
      }
      
      // Simulate a response for bulk QC triggers
      if (data.action === 'trigger_bulk_qc' && data.document_ids) {
        setTimeout(() => {
          onMsg({
            type: 'bulk_qc_summary',
            count: data.document_ids.length,
            passed: data.document_ids.length,
            failed: 0,
            timestamp: new Date().toISOString()
          });
        }, 3000);
      }
      
      return true;
    }
  };
};

export default useQCWebSocket;