/**
 * Client Portal Routes
 * 
 * This module defines routes for the client portal functionality.
 */

import express from 'express';
import path from 'path';

const router = express.Router();

// Client portal route (no auth check)
router.get('/', (req, res) => {
  console.log('Serving client portal page from router');
  res.sendFile(path.resolve('./client/public/index.html'));
});

// Auto-login page route
router.get('/auto-login', (req, res) => {
  console.log('Serving auto-login page');
  res.sendFile(path.resolve('./client/public/auto-login.html'));
});

export default router;