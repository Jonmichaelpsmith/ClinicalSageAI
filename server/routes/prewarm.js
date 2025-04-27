/**
 * Server Pre-warming Routes
 * 
 * This file contains routes used to pre-warm the server and prevent Replit hibernation.
 */

import express from 'express';

const router = express.Router();

/**
 * Pre-warm endpoint
 * Simple endpoint to wake up the server when called from the client
 */
router.get('/', (req, res) => {
  console.log('[PREWARM] Server pre-warmed successfully at', new Date().toISOString());
  
  // Return a simple success response
  res.json({
    success: true,
    timestamp: Date.now(),
    message: 'Server pre-warmed successfully'
  });
});

export default router;