/**
 * Health Check Routes
 * 
 * This module provides endpoints for checking the health of various
 * system components including the database connection.
 */

import express from 'express';
import { testConnection } from '../db.js';

const router = express.Router();

/**
 * Basic health check endpoint
 * Returns simple status and timestamp
 */
router.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString()
  });
});

/**
 * Deep health check
 * Performs comprehensive checks on all dependencies including database connection
 */
router.get('/deep', async (req, res) => {
  try {
    // Start time for performance measurement
    const startTime = Date.now();
    
    // Database checks
    let databaseResult;
    try {
      const dbStartTime = Date.now();
      const dbStatus = await testConnection();
      const dbLatency = Date.now() - dbStartTime;
      
      databaseResult = {
        status: dbStatus ? 'ok' : 'error',
        latency: dbLatency
      };
    } catch (error) {
      databaseResult = {
        status: 'error',
        error: error.message,
        latency: 0
      };
    }
    
    // Get total execution time for health check
    const totalTime = Date.now() - startTime;
    
    res.json({
      status: databaseResult.status === 'ok' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      totalTime,
      components: {
        database: databaseResult
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;