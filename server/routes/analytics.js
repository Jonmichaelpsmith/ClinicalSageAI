// /server/routes/analytics.js

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Route: GET /api/analytics/metrics
router.get('/metrics', analyticsController.getAnalyticsMetrics);

module.exports = router;