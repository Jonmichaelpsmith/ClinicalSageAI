// /server/controllers/analyticsController.js

// Dummy analytics metrics for now (later connect to database)
const analyticsMetrics = {
  submissions: {
    last90Days: 12,
    previousPeriod: 8,
    percentChange: 50
  },
  reviewTime: {
    average: 34, // days
    previousPeriod: 41,
    percentChange: -17
  },
  successRate: {
    current: 92, // percent
    previousPeriod: 88,
    percentChange: 4.5
  },
  riskLevel: "low" // low, medium, high
};

// GET /api/analytics/metrics
const getAnalyticsMetrics = (req, res) => {
  try {
    // In a real application, we would filter by user ID and organization
    const userId = req.query.userId || '1';
    const orgId = req.query.orgId || '1';
    
    res.status(200).json({
      success: true,
      data: analyticsMetrics
    });
  } catch (error) {
    console.error('Error fetching analytics metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics metrics',
    });
  }
};

module.exports = {
  getAnalyticsMetrics,
};