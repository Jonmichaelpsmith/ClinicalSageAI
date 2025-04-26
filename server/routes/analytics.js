/**
 * TrialSage Enterprise Analytics API Routes
 * 
 * This module implements the REST API endpoints for accessing the advanced analytics
 * capabilities of the platform, including:
 * - Hypercube dimensional data access
 * - Multi-dimensional analytical views
 * - Predictive analytics and AI insights
 * - Regulatory intelligence
 * - Real-time monitoring
 */

import express from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import advancedAnalyticsService from '../services/advancedAnalyticsService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Authentication and authorization middleware
const requireAuth = (req, res, next) => {
  // Check authentication 
  if (!req.isAuthenticated() && !req.user) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      error: 'Authentication required'
    });
  }
  next();
};

// Role-based authorization middleware
const requireRole = (roles) => (req, res, next) => {
  if (!req.user || !req.user.roles || !req.user.roles.some(role => roles.includes(role))) {
    return res.status(StatusCodes.FORBIDDEN).json({
      error: 'Insufficient permissions'
    });
  }
  next();
};

/**
 * @route GET /api/analytics/dashboard/:type
 * @description Get dashboard configuration and data for a specific dashboard type
 * @access Private
 */
router.get('/dashboard/:type', 
  requireAuth,
  param('type').isString().isIn(['overview', 'submission', 'regulatory', 'user', 'system', 'predictive']),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
      }
      
      const { type } = req.params;
      const userId = req.user.id;
      
      const dashboardData = await advancedAnalyticsService.getDashboardData(userId, type);
      
      res.status(StatusCodes.OK).json(dashboardData);
    } catch (error) {
      logger.error(`Error fetching dashboard: ${error.message}`, error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to fetch dashboard data',
        message: error.message
      });
    }
  }
);

/**
 * @route POST /api/analytics/dashboard
 * @description Save a custom dashboard configuration
 * @access Private
 */
router.post('/dashboard',
  requireAuth,
  body('dashboardType').isString().isIn(['overview', 'submission', 'regulatory', 'user', 'system', 'predictive']),
  body('name').isString().notEmpty(),
  body('layout').isString(),
  body('widgets').isArray(),
  body('isDefault').isBoolean().optional(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
      }
      
      const userId = req.user.id;
      const config = req.body;
      
      const result = await advancedAnalyticsService.saveDashboardConfiguration(userId, config);
      
      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      logger.error(`Error saving dashboard: ${error.message}`, error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to save dashboard configuration',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /api/analytics/submission/:id
 * @description Get detailed analytics for a specific submission
 * @access Private
 */
router.get('/submission/:id',
  requireAuth,
  param('id').isUUID(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
      }
      
      const { id } = req.params;
      
      const submissionAnalytics = await advancedAnalyticsService.getSubmissionAnalytics(id);
      
      res.status(StatusCodes.OK).json(submissionAnalytics);
    } catch (error) {
      logger.error(`Error fetching submission analytics: ${error.message}`, error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to fetch submission analytics',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /api/analytics/user/:id
 * @description Get detailed analytics for a specific user
 * @access Private (Admin or Self)
 */
router.get('/user/:id',
  requireAuth,
  param('id').isUUID(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
      }
      
      const { id } = req.params;
      
      // Security check: User can only access their own data unless they're an admin
      const isAdmin = req.user.roles && req.user.roles.includes('admin');
      if (id !== req.user.id && !isAdmin) {
        return res.status(StatusCodes.FORBIDDEN).json({
          error: 'Insufficient permissions to access this user data'
        });
      }
      
      const userAnalytics = await advancedAnalyticsService.getUserProductivityAnalytics(id);
      
      res.status(StatusCodes.OK).json(userAnalytics);
    } catch (error) {
      logger.error(`Error fetching user analytics: ${error.message}`, error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to fetch user analytics',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /api/analytics/regulatory
 * @description Get regulatory intelligence and performance analytics
 * @access Private
 */
router.get('/regulatory',
  requireAuth,
  query('days').optional().isInt({ min: 1, max: 3650 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
      }
      
      const days = req.query.days ? parseInt(req.query.days) : 90;
      
      const regulatoryAnalytics = await advancedAnalyticsService.getRegulatoryAnalytics(days);
      
      res.status(StatusCodes.OK).json(regulatoryAnalytics);
    } catch (error) {
      logger.error(`Error fetching regulatory analytics: ${error.message}`, error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to fetch regulatory analytics',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /api/analytics/system
 * @description Get system performance analytics
 * @access Private (Admin)
 */
router.get('/system',
  requireAuth,
  requireRole(['admin', 'system_manager']),
  query('days').optional().isInt({ min: 1, max: 3650 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
      }
      
      const days = req.query.days ? parseInt(req.query.days) : 30;
      
      const systemAnalytics = await advancedAnalyticsService.getSystemAnalytics(days);
      
      res.status(StatusCodes.OK).json(systemAnalytics);
    } catch (error) {
      logger.error(`Error fetching system analytics: ${error.message}`, error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to fetch system analytics',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /api/analytics/regulatory-intelligence/search
 * @description Search regulatory intelligence
 * @access Private
 */
router.get('/regulatory-intelligence/search',
  requireAuth,
  query('query').isString().notEmpty(),
  query('authority_id').optional().isInt(),
  query('therapeutic_area_id').optional().isInt(),
  query('impact_level').optional().isInt({ min: 1, max: 5 }),
  query('after_date').optional().isDate(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
      }
      
      const { query: searchQuery, ...filters } = req.query;
      
      const searchResults = await advancedAnalyticsService.searchRegulatoryIntelligence(searchQuery, filters);
      
      res.status(StatusCodes.OK).json(searchResults);
    } catch (error) {
      logger.error(`Error searching regulatory intelligence: ${error.message}`, error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to search regulatory intelligence',
        message: error.message
      });
    }
  }
);

/**
 * @route POST /api/analytics/prediction/submission-success
 * @description Get AI prediction for submission success probability
 * @access Private
 */
router.post('/prediction/submission-success',
  requireAuth,
  body('submission_id').isUUID(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
      }
      
      const { submission_id } = req.body;
      
      const prediction = await advancedAnalyticsService.predictSubmissionSuccess(submission_id);
      
      res.status(StatusCodes.OK).json(prediction);
    } catch (error) {
      logger.error(`Error getting submission success prediction: ${error.message}`, error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to get submission success prediction',
        message: error.message
      });
    }
  }
);

/**
 * @route POST /api/analytics/prediction/review-timeline
 * @description Get AI prediction for submission review timeline
 * @access Private
 */
router.post('/prediction/review-timeline',
  requireAuth,
  body('submission_id').isUUID(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
      }
      
      const { submission_id } = req.body;
      
      const prediction = await advancedAnalyticsService.predictReviewTimeline(submission_id);
      
      res.status(StatusCodes.OK).json(prediction);
    } catch (error) {
      logger.error(`Error getting review timeline prediction: ${error.message}`, error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to get review timeline prediction',
        message: error.message
      });
    }
  }
);

/**
 * @route POST /api/analytics/content-quality
 * @description Analyze content quality for a submission section
 * @access Private
 */
router.post('/content-quality',
  requireAuth,
  body('submission_id').isUUID(),
  body('section_code').isString().notEmpty(),
  body('content').isString().notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
      }
      
      const { submission_id, section_code, content } = req.body;
      
      const analysis = await advancedAnalyticsService.analyzeContentQuality(
        submission_id,
        section_code,
        content
      );
      
      res.status(StatusCodes.OK).json(analysis);
    } catch (error) {
      logger.error(`Error analyzing content quality: ${error.message}`, error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to analyze content quality',
        message: error.message
      });
    }
  }
);

/**
 * @route POST /api/analytics/anomaly-detection
 * @description Detect anomalies in submissions or user activity
 * @access Private (Admin)
 */
router.post('/anomaly-detection',
  requireAuth,
  requireRole(['admin', 'compliance_officer']),
  body('entity_type').isString().isIn(['submission', 'user']),
  body('entity_id').isUUID(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
      }
      
      const { entity_type, entity_id } = req.body;
      
      const anomalies = await advancedAnalyticsService.detectAnomalies(entity_type, entity_id);
      
      res.status(StatusCodes.OK).json(anomalies);
    } catch (error) {
      logger.error(`Error detecting anomalies: ${error.message}`, error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to detect anomalies',
        message: error.message
      });
    }
  }
);

/**
 * @route POST /api/analytics/export
 * @description Export analytics data to CSV
 * @access Private
 */
router.post('/export',
  requireAuth,
  body('data_type').isString().notEmpty(),
  body('filters').optional().isObject(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
      }
      
      const { data_type, filters = {} } = req.body;
      
      const exportResult = await advancedAnalyticsService.exportAnalyticsData(data_type, filters);
      
      // Stream the file to the client
      res.download(exportResult.file_path, `${data_type}_export.csv`, (err) => {
        if (err) {
          logger.error(`Error sending file: ${err.message}`);
        }
        
        // Delete the temporary file after sending
        try {
          fs.unlinkSync(exportResult.file_path);
        } catch (deleteErr) {
          logger.error(`Error deleting temporary file: ${deleteErr.message}`);
        }
      });
    } catch (error) {
      logger.error(`Error exporting analytics data: ${error.message}`, error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to export analytics data',
        message: error.message
      });
    }
  }
);

/**
 * @route POST /api/analytics/event
 * @description Track an analytics event
 * @access Private
 */
router.post('/event',
  requireAuth,
  body('event_type').isString().notEmpty(),
  body('payload').isObject(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
      }
      
      const { event_type, payload } = req.body;
      
      // Track the event
      advancedAnalyticsService.trackEvent(event_type, {
        ...payload,
        userId: req.user.id,
        timestamp: new Date().toISOString()
      });
      
      res.status(StatusCodes.OK).json({ success: true });
    } catch (error) {
      logger.error(`Error tracking analytics event: ${error.message}`, error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to track analytics event',
        message: error.message
      });
    }
  }
);

/**
 * @route GET /api/analytics/data
 * @description Get analytics data for a specific dashboard type
 * @access Private
 */
router.get('/data',
  requireAuth,
  query('type').isString().isIn(['overview', 'submission', 'regulatory', 'user', 'system', 'predictive']),
  query('start_date').optional().isDate(),
  query('end_date').optional().isDate(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
      }
      
      const { type, start_date, end_date } = req.query;
      const dateRange = start_date && end_date ? { start: start_date, end: end_date } : null;
      
      let data;
      
      // Get data based on dashboard type
      switch (type) {
        case 'overview':
          // Top-level KPIs and summary data
          data = {
            user_activity: await advancedAnalyticsService.getUserProductivityAnalytics(req.user.id),
            regulatory_status: await advancedAnalyticsService.getRegulatoryAnalytics(30),
            // More data based on dashboard type...
          };
          break;
          
        case 'submission':
          // Get data for all submissions in date range
          // In a production system, this would filter and aggregate data
          data = {
            completion_summary: {
              total_submissions: 45,
              complete: 18,
              in_progress: 22,
              not_started: 5,
              avg_completion: 68.5,
              avg_quality: 85.2
            },
            submissions_by_status: [
              { status: "Draft", count: 12 },
              { status: "In Review", count: 10 },
              { status: "Approved", count: 15 },
              { status: "Submitted", count: 8 }
            ],
            sections_by_module: [
              { module: "Module 1", complete: 56, in_progress: 12, not_started: 5 },
              { module: "Module 2", complete: 43, in_progress: 18, not_started: 7 },
              { module: "Module 3", complete: 38, in_progress: 24, not_started: 12 },
              { module: "Module 4", complete: 25, in_progress: 15, not_started: 8 },
              { module: "Module 5", complete: 30, in_progress: 20, not_started: 10 }
            ],
            recent_activity: [
              // Recent activity data
            ]
          };
          break;
          
        case 'regulatory':
          data = await advancedAnalyticsService.getRegulatoryAnalytics(90);
          break;
          
        case 'user':
          data = await advancedAnalyticsService.getUserProductivityAnalytics(req.user.id);
          break;
          
        case 'system':
          // Only provide system data to admins
          if (req.user.roles && (req.user.roles.includes('admin') || req.user.roles.includes('system_manager'))) {
            data = await advancedAnalyticsService.getSystemAnalytics(30);
          } else {
            return res.status(StatusCodes.FORBIDDEN).json({
              error: 'Insufficient permissions to access system analytics'
            });
          }
          break;
          
        case 'predictive':
          // Mock predictive analytics for demonstration
          // In production, this would return real ML predictions
          data = {
            success_probability: {
              overall: 0.82,
              by_authority: [
                { authority: "FDA", probability: 0.85 },
                { authority: "EMA", probability: 0.79 },
                { authority: "PMDA", probability: 0.88 }
              ],
              key_factors: [
                { name: "Quality Score", impact: 0.35, direction: "positive" },
                { name: "Completeness", impact: 0.25, direction: "positive" },
                { name: "Protocol Alignment", impact: 0.18, direction: "positive" },
                { name: "Missing Safety Data", impact: 0.12, direction: "negative" },
                { name: "Formatting Issues", impact: 0.10, direction: "negative" }
              ]
            },
            timeline_predictions: [
              { submission_type: "IND", authority: "FDA", avg_days: 30, confidence: 0.9 },
              { submission_type: "NDA", authority: "FDA", avg_days: 180, confidence: 0.85 },
              { submission_type: "BLA", authority: "FDA", avg_days: 190, confidence: 0.8 },
              { submission_type: "MAA", authority: "EMA", avg_days: 210, confidence: 0.75 }
            ],
            optimization_opportunities: [
              { area: "Content Quality", potential_gain: 15, difficulty: "medium" },
              { area: "Process Efficiency", potential_gain: 22, difficulty: "high" },
              { area: "Cross-References", potential_gain: 8, difficulty: "low" },
              { area: "Regulatory Alignment", potential_gain: 18, difficulty: "medium" }
            ]
          };
          break;
          
        default:
          return res.status(StatusCodes.BAD_REQUEST).json({
            error: 'Unsupported dashboard type'
          });
      }
      
      res.status(StatusCodes.OK).json({
        type,
        date_range: dateRange,
        timestamp: new Date().toISOString(),
        data
      });
    } catch (error) {
      logger.error(`Error fetching analytics data: ${error.message}`, error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to fetch analytics data',
        message: error.message
      });
    }
  }
);

// Initialize analytics service when the module is loaded
(async () => {
  try {
    await advancedAnalyticsService.initAdvancedAnalytics();
    logger.info('Advanced analytics service initialized successfully');
  } catch (error) {
    logger.error(`Failed to initialize advanced analytics service: ${error.message}`, error);
  }
})();

export default router;