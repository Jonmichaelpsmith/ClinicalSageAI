/**
 * CERV2Page Protection API routes
 * 
 * This module provides API endpoints for the JavaScript client
 * to validate and recover the CERV2Page.jsx file
 */

import express from 'express';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// Constants
const PROTECTED_DIR = path.resolve('./locked_files/cerv2_protected');
const VALIDATION_SCRIPT = path.resolve('./locked_files/cerv2_protected/ultra_fast_validate.sh');
const RECOVERY_SCRIPT = path.resolve('./locked_files/cerv2_protected/ultra_fast_recovery.sh');
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// In-memory cache for validation results
const validationCache = {
  timestamp: 0,
  status: null
};

/**
 * Validate CERV2Page.jsx integrity
 * @returns {Promise<{status: string, timestamp: number, cacheTTL: number}>}
 */
function validateCERV2() {
  return new Promise((resolve, reject) => {
    // Check cache first
    const now = Date.now();
    if (now - validationCache.timestamp < CACHE_TTL) {
      return resolve({
        status: validationCache.status,
        timestamp: validationCache.timestamp,
        cacheTTL: CACHE_TTL,
        cached: true
      });
    }

    // Execute validation script
    const validation = spawn(VALIDATION_SCRIPT);
    let output = '';
    
    validation.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    validation.stderr.on('data', (data) => {
      console.error(`Validation stderr: ${data}`);
    });
    
    validation.on('close', (code) => {
      // Update cache
      validationCache.timestamp = now;
      
      if (code === 0) {
        validationCache.status = 'valid';
        resolve({
          status: 'valid',
          timestamp: now,
          cacheTTL: CACHE_TTL,
          output
        });
      } else {
        validationCache.status = 'invalid';
        resolve({
          status: 'invalid',
          timestamp: now,
          cacheTTL: CACHE_TTL,
          code,
          output
        });
      }
    });
    
    validation.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Recover CERV2Page.jsx from backup
 * @returns {Promise<{success: boolean, timestamp: number}>}
 */
function recoverCERV2() {
  return new Promise((resolve, reject) => {
    // Execute recovery script
    const recovery = spawn(RECOVERY_SCRIPT);
    let output = '';
    
    recovery.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    recovery.stderr.on('data', (data) => {
      console.error(`Recovery stderr: ${data}`);
    });
    
    recovery.on('close', (code) => {
      // Clear validation cache
      validationCache.timestamp = 0;
      validationCache.status = null;
      
      if (code === 0) {
        resolve({
          success: true,
          timestamp: Date.now(),
          output
        });
      } else {
        resolve({
          success: false,
          timestamp: Date.now(),
          code,
          output
        });
      }
    });
    
    recovery.on('error', (err) => {
      reject(err);
    });
  });
}

// Routes

/**
 * GET /api/cerv2/validate
 * Validate CERV2Page.jsx integrity
 */
router.get('/validate', async (req, res) => {
  try {
    const result = await validateCERV2();
    res.json(result);
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

/**
 * POST /api/cerv2/recover
 * Recover CERV2Page.jsx from backup
 */
router.post('/recover', async (req, res) => {
  try {
    const requestId = req.body.requestId || `recovery-${Date.now()}`;
    console.log(`Recovery requested: ${requestId}`);
    
    const result = await recoverCERV2();
    res.json(result);
  } catch (error) {
    console.error('Recovery error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/cerv2/status
 * Get current protection status
 */
router.get('/status', (req, res) => {
  const statusFile = path.join(PROTECTED_DIR, '.status_indicator');
  
  try {
    if (fs.existsSync(statusFile)) {
      const statusData = fs.readFileSync(statusFile, 'utf8').split('|');
      const timestamp = parseInt(statusData[0], 10);
      const status = statusData[1];
      
      res.json({
        status,
        timestamp,
        validationCache: {
          status: validationCache.status,
          timestamp: validationCache.timestamp,
          age: Date.now() - validationCache.timestamp
        }
      });
    } else {
      res.json({
        status: 'unknown',
        timestamp: 0,
        validationCache: {
          status: validationCache.status,
          timestamp: validationCache.timestamp,
          age: Date.now() - validationCache.timestamp
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

export default router;