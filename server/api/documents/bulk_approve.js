/**
 * Document Bulk Approve API
 * 
 * This module provides endpoints for bulk approving documents
 * and emitting real-time QC events via WebSockets.
 */

import express from 'express';
import { setTimeout } from 'timers/promises';
import { WebSocket } from 'ws';

const router = express.Router();

// Access the QC WebSocket server for broadcasting updates
function getQcWebSocketServer() {
  return global.qcWebSocketServer;
}

/**
 * Broadcast a QC status update to all connected clients via WebSocket
 * 
 * @param {number} documentId - ID of the document
 * @param {string} status - New QC status ('passed', 'failed', etc.)
 */
async function broadcastQcUpdate(documentId, status) {
  const wss = getQcWebSocketServer();
  
  if (!wss || !wss.clients) {
    console.error('QC WebSocket server not initialized');
    return;
  }
  
  const message = JSON.stringify({
    type: 'qc_status',
    documentId,
    status,
    timestamp: new Date().toISOString()
  });
  
  let clientCount = 0;
  
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
      clientCount++;
    }
  });
  
  console.log(`QC update for document ${documentId} broadcasted to ${clientCount} clients`);
}

/**
 * Bulk approve and QC multiple documents
 * 
 * @route POST /api/documents/bulk-approve
 * @param {object} req.body.ids - Array of document IDs to approve
 * @returns {object} Success message
 */
router.post('/api/documents/bulk-approve', async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ 
        error: 'Invalid request format', 
        message: 'Expected "ids" array in request body' 
      });
    }
    
    console.log(`Bulk approve request for ${ids.length} documents: ${ids.join(', ')}`);
    
    // Send immediate response to client
    res.json({ 
      success: true, 
      message: `Bulk approval started for ${ids.length} documents`,
      processing: true
    });
    
    // Process documents in the background
    processDocuments(ids);
    
  } catch (error) {
    console.error('Error in bulk approve endpoint:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
});

/**
 * Process documents in the background and send WebSocket updates
 * 
 * @param {number[]} documentIds - Array of document IDs to process
 */
async function processDocuments(documentIds) {
  // Process each document with a delay to simulate asynchronous processing
  for (const id of documentIds) {
    try {
      // Simulate QC processing time (1-3 seconds per document)
      const processingTime = 1000 + Math.random() * 2000;
      await setTimeout(processingTime);
      
      // Determine success or failure (90% success rate)
      const status = Math.random() < 0.9 ? 'passed' : 'failed';
      
      // Send real-time update via WebSocket
      await broadcastQcUpdate(id, status);
      
      console.log(`Document ${id} QC ${status} after ${processingTime.toFixed(0)}ms`);
      
    } catch (error) {
      console.error(`Error processing document ${id}:`, error);
      // Still try to send an update, but mark as failed
      await broadcastQcUpdate(id, 'failed');
    }
  }
  
  console.log(`Completed bulk processing for ${documentIds.length} documents`);
}

export default router;