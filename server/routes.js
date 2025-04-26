/**
 * Main API Routes Configuration
 * 
 * This file registers all the API routes for the TrialSage application.
 */

const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const searchRoutes = require('./routes/search');
const aiDocumentRoutes = require('./routes/ai-document');
const recommendationRoutes = require('./routes/recommendations');
const autoLinkRoutes = require('./routes/autolink');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const auditRoutes = require('./routes/audit');

// Register routes
router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);
router.use('/search', searchRoutes);
router.use('/ai', aiDocumentRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/autolink', autoLinkRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/audit', auditRoutes);

module.exports = router;