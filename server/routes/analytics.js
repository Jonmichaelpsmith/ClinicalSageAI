/**
 * Analytics Routes for IND Wizard
 * 
 * API routes for:
 * - Submission analytics
 * - User productivity metrics
 * - Regulatory performance
 * - System-wide statistics
 * - Dashboard preferences
 */

import { Router } from 'express';
import { verifyJwt } from '../middleware/auth.js';
import { 
  getSubmissionAnalytics, 
  getUserAnalytics, 
  getSystemAnalytics,
  saveDashboardPreference,
  getDashboardPreferences,
  trackUserActivity
} from '../services/analyticsService.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * Get analytics for a submission
 * 
 * GET /api/analytics/submissions/:id
 */
router.get('/submissions/:id', verifyJwt, async (req, res) => {
  try {
    const analytics = await getSubmissionAnalytics(req.params.id);
    
    // Track this view as user activity
    trackUserActivity(
      req.user.id, 
      req.params.id, 
      'view_analytics', 
      { view_type: 'submission' }
    ).catch(err => logger.warn(`Error tracking analytics view: ${err.message}`));
    
    res.json(analytics);
  } catch (error) {
    logger.error(`Error getting submission analytics: ${error.message}`, error);
    res.status(500).json({ message: `Error getting submission analytics: ${error.message}` });
  }
});

/**
 * Get user productivity analytics
 * 
 * GET /api/analytics/users/:id
 */
router.get('/users/:id', verifyJwt, async (req, res) => {
  try {
    // Only allow users to view their own analytics or admins to view anyone's
    if (req.params.id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: you can only view your own analytics' });
    }
    
    const analytics = await getUserAnalytics(req.params.id);
    res.json(analytics);
  } catch (error) {
    logger.error(`Error getting user analytics: ${error.message}`, error);
    res.status(500).json({ message: `Error getting user analytics: ${error.message}` });
  }
});

/**
 * Get user's own analytics (shorthand route)
 * 
 * GET /api/analytics/me
 */
router.get('/me', verifyJwt, async (req, res) => {
  try {
    const analytics = await getUserAnalytics(req.user.id);
    res.json(analytics);
  } catch (error) {
    logger.error(`Error getting user analytics: ${error.message}`, error);
    res.status(500).json({ message: `Error getting user analytics: ${error.message}` });
  }
});

/**
 * Get system-wide analytics
 * 
 * GET /api/analytics/system
 */
router.get('/system', verifyJwt, async (req, res) => {
  try {
    // This should be restricted to admin/regulatory users
    if (!['admin', 'regulatory'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: system analytics restricted to admin users' });
    }
    
    const days = req.query.days ? parseInt(req.query.days, 10) : 30;
    const analytics = await getSystemAnalytics(days);
    res.json(analytics);
  } catch (error) {
    logger.error(`Error getting system analytics: ${error.message}`, error);
    res.status(500).json({ message: `Error getting system analytics: ${error.message}` });
  }
});

/**
 * Get regulatory analytics
 * 
 * GET /api/analytics/regulatory
 */
router.get('/regulatory', verifyJwt, async (req, res) => {
  try {
    // This should be restricted to admin/regulatory users
    if (!['admin', 'regulatory'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: regulatory analytics restricted to admin/regulatory users' });
    }
    
    // Regulatory analytics is a subset of system analytics focused on FDA submissions
    const days = req.query.days ? parseInt(req.query.days, 10) : 90;
    const analytics = await getSystemAnalytics(days);
    
    // Extract and format the regulatory-specific data
    const regulatoryData = {
      submissions: analytics.submissions.filter(s => s.submission_status === 'submitted' || s.submission_status === 'approved'),
      regulatory: analytics.regulatory,
      summary: {
        total_submissions: analytics.summary.total_submissions,
        completed_submissions: analytics.summary.completed_submissions,
        total_esg_submissions: analytics.summary.total_esg_submissions,
        avg_ack1_time: analytics.summary.avg_ack1_time,
        avg_ack3_time: analytics.summary.avg_ack3_time
      },
      esg_trend: analytics.usage.map(u => ({
        date: u.date,
        esg_submissions: u.esg_submissions || 0
      }))
    };
    
    res.json(regulatoryData);
  } catch (error) {
    logger.error(`Error getting regulatory analytics: ${error.message}`, error);
    res.status(500).json({ message: `Error getting regulatory analytics: ${error.message}` });
  }
});

/**
 * Save dashboard preference
 * 
 * POST /api/analytics/dashboards
 */
router.post('/dashboards', verifyJwt, async (req, res) => {
  try {
    const { type, name, widgets, layout, theme, is_default } = req.body;
    
    if (!type || !name || !widgets) {
      return res.status(400).json({ message: 'Missing required fields: type, name, widgets' });
    }
    
    const dashboard = await saveDashboardPreference(req.user.id, {
      type,
      name,
      widgets,
      layout,
      theme,
      is_default
    });
    
    res.status(201).json(dashboard);
  } catch (error) {
    logger.error(`Error saving dashboard preference: ${error.message}`, error);
    res.status(500).json({ message: `Error saving dashboard preference: ${error.message}` });
  }
});

/**
 * Get dashboard preferences
 * 
 * GET /api/analytics/dashboards
 */
router.get('/dashboards', verifyJwt, async (req, res) => {
  try {
    const dashboards = await getDashboardPreferences(req.user.id);
    res.json(dashboards);
  } catch (error) {
    logger.error(`Error getting dashboard preferences: ${error.message}`, error);
    res.status(500).json({ message: `Error getting dashboard preferences: ${error.message}` });
  }
});

/**
 * Delete dashboard preference
 * 
 * DELETE /api/analytics/dashboards/:id
 */
router.delete('/dashboards/:id', verifyJwt, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('analytics_dashboard_preferences')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);
    
    if (error) {
      throw new Error(`Error deleting dashboard: ${error.message}`);
    }
    
    res.status(204).end();
  } catch (error) {
    logger.error(`Error deleting dashboard preference: ${error.message}`, error);
    res.status(500).json({ message: `Error deleting dashboard preference: ${error.message}` });
  }
});

export default router;