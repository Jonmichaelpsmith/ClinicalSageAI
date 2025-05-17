/**
 * Client Portal Routes
 * 
 * This module defines routes for the client portal functionality.
 */

import express from 'express';
import { checkAuth } from '../controllers/auth.js';
import { serveClientPortalPage, serveAutoLoginPage } from '../controllers/clientPortal.js';

const router = express.Router();

// Secure client portal route (with auth check)
router.get('/client-portal', checkAuth, serveClientPortalPage);

// Auto-login page route
router.get('/auto-login', serveAutoLoginPage);

export default router;