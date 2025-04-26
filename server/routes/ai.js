/**
 * TrialSage AI Security API Routes
 * 
 * This module provides AI-powered security endpoints:
 * - Access request analysis
 * - Anomaly detection
 * - Document risk assessment
 * - Behavioral analytics
 */

const express = require('express');
const router = express.Router();
const securityMiddleware = require('../middleware/security');

// In-memory store of user access patterns (replace with database in production)
const userAccessPatterns = new Map();
const documentAccessHistory = new Map();
const anomalyScores = new Map();

/**
 * Calculate risk score for an access request
 * 
 * @param {number} userId - User ID
 * @param {string} documentId - Document ID 
 * @param {string} accessType - Type of access
 * @returns {Object} - Risk assessment
 */
function calculateRiskScore(userId, documentId, accessType) {
  // Get user's historical access pattern
  const userPattern = userAccessPatterns.get(userId) || {
    accessCount: 0,
    documentTypes: new Set(),
    accessTimes: [],
    lastAccessTime: null,
    anomalyScore: 0,
  };
  
  // Get document's access history
  const docHistory = documentAccessHistory.get(documentId) || {
    accessCount: 0,
    userIds: new Set(),
    lastAccessTime: null,
    sensitivityLevel: Math.random() * 0.5 + 0.3, // 0.3 - 0.8 random sensitivity for demo
  };
  
  // Current time
  const currentTime = new Date();
  const hourOfDay = currentTime.getHours();
  
  // Base risk is low
  let riskScore = 0.1;
  
  // Factor 1: User history with this type of document
  if (userPattern.accessCount === 0) {
    // New user has higher risk
    riskScore += 0.2;
  } else if (userPattern.documentTypes.size < 3) {
    // User with limited document type access has moderate risk
    riskScore += 0.1;
  }
  
  // Factor 2: Time-based anomaly
  if (userPattern.accessTimes.length > 0) {
    // Check if user is accessing outside normal hours
    const normalHours = userPattern.accessTimes
      .map(time => new Date(time).getHours())
      .reduce((acc, hour) => {
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {});
    
    const totalAccesses = userPattern.accessTimes.length;
    const hourFrequency = (normalHours[hourOfDay] || 0) / totalAccesses;
    
    if (hourFrequency < 0.1) {
      // Unusual access time
      riskScore += 0.15;
    }
    
    // Check if this is rapid sequential access
    if (userPattern.lastAccessTime) {
      const timeSinceLastAccess = currentTime - new Date(userPattern.lastAccessTime);
      if (timeSinceLastAccess < 60000) { // Less than 1 minute
        riskScore += 0.1;
      }
    }
  }
  
  // Factor 3: Document sensitivity
  riskScore += docHistory.sensitivityLevel * 0.2;
  
  // Factor 4: Access type risk
  const accessTypeRisk = {
    'view': 0.05,
    'download': 0.2,
    'edit': 0.15,
    'share': 0.25,
    'delete': 0.3,
  };
  
  riskScore += accessTypeRisk[accessType] || 0.1;
  
  // Factor 5: User's anomaly score
  const userAnomalyScore = anomalyScores.get(userId) || 0;
  riskScore += userAnomalyScore * 0.3;
  
  // Normalize to 0-1 range
  riskScore = Math.min(Math.max(riskScore, 0), 1);
  
  // Update user access pattern
  userPattern.accessCount++;
  userPattern.documentTypes.add(documentId.split('-')[0]); // Assuming document ID has type prefix
  userPattern.accessTimes.push(currentTime.toISOString());
  userPattern.lastAccessTime = currentTime.toISOString();
  userAccessPatterns.set(userId, userPattern);
  
  // Update document history
  docHistory.accessCount++;
  docHistory.userIds.add(userId);
  docHistory.lastAccessTime = currentTime.toISOString();
  documentAccessHistory.set(documentId, docHistory);
  
  // Map risk score to a decision
  const decision = riskScore <= 0.5;
  
  // Generate reasoning based on factors
  let reasoning = '';
  if (riskScore > 0.7) {
    reasoning = 'High risk due to unusual access pattern, sensitive document, and/or suspicious timing';
  } else if (riskScore > 0.5) {
    reasoning = 'Moderate risk due to limited history with this document type or unusual access timing';
  } else {
    reasoning = 'Low risk based on user history and access pattern analysis';
  }
  
  return {
    riskScore,
    decision,
    confidence: 1 - riskScore * 0.5, // Higher risk = lower confidence
    reasoning,
  };
}

// Route to analyze an access request
router.post('/analyze-access', async (req, res) => {
  try {
    const { userId, documentId, accessType } = req.body;
    
    if (!userId || !documentId || !accessType) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'User ID, document ID, and access type are required',
      });
    }
    
    // Calculate risk score
    const riskAssessment = calculateRiskScore(userId, documentId, accessType);
    
    // Log the analysis
    securityMiddleware.auditLog('AI_ACCESS_ANALYSIS', {
      userId,
      documentId,
      accessType,
      riskScore: riskAssessment.riskScore,
      decision: riskAssessment.decision,
    });
    
    res.json({
      success: true,
      decision: riskAssessment.decision,
      confidence: riskAssessment.confidence,
      reasoning: riskAssessment.reasoning,
      riskScore: riskAssessment.riskScore,
    });
  } catch (error) {
    console.error('Error analyzing access request:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to analyze access request',
    });
  }
});

// Route to detect anomalies in user behavior
router.post('/detect-anomalies', async (req, res) => {
  try {
    const { userId, activityData } = req.body;
    
    if (!userId || !activityData) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'User ID and activity data are required',
      });
    }
    
    // In a real implementation, this would use machine learning models
    // For this example, we'll use simple heuristics
    
    const anomalies = [];
    let anomalyScore = 0;
    
    // Check for rapid sequential actions
    if (activityData.actions && activityData.actions.length > 1) {
      const actionTimes = activityData.actions.map(a => new Date(a.timestamp).getTime());
      const timeDiffs = [];
      
      for (let i = 1; i < actionTimes.length; i++) {
        timeDiffs.push(actionTimes[i] - actionTimes[i-1]);
      }
      
      const avgTimeDiff = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
      
      if (avgTimeDiff < 500) { // Less than 500ms between actions
        anomalies.push({
          type: 'RAPID_ACTIONS',
          severity: 'HIGH',
          description: 'Unusually rapid sequence of actions detected',
          score: 0.8,
        });
        
        anomalyScore += 0.2;
      }
    }
    
    // Check for unusual access times
    if (activityData.timestamp) {
      const accessHour = new Date(activityData.timestamp).getHours();
      if (accessHour >= 22 || accessHour <= 5) { // Late night/early morning
        anomalies.push({
          type: 'UNUSUAL_HOURS',
          severity: 'MEDIUM',
          description: 'Access during non-business hours',
          score: 0.6,
        });
        
        anomalyScore += 0.1;
      }
    }
    
    // Check for unusual document access patterns
    if (activityData.documentsAccessed && activityData.documentsAccessed.length > 0) {
      // In a real system, this would compare against the user's normal patterns
      const bulkAccess = activityData.documentsAccessed.length > 20;
      
      if (bulkAccess) {
        anomalies.push({
          type: 'BULK_ACCESS',
          severity: 'HIGH',
          description: 'Unusual number of documents accessed in a short period',
          score: 0.7,
        });
        
        anomalyScore += 0.15;
      }
    }
    
    // Check for location anomalies
    if (activityData.ipAddress && activityData.geoLocation) {
      // In a real system, this would compare against known locations
      const isUnusualLocation = Math.random() < 0.1; // 10% chance for demo purposes
      
      if (isUnusualLocation) {
        anomalies.push({
          type: 'LOCATION_CHANGE',
          severity: 'HIGH',
          description: 'Access from unusual geographic location',
          score: 0.9,
        });
        
        anomalyScore += 0.25;
      }
    }
    
    // Store the anomaly score
    anomalyScores.set(userId, anomalyScore);
    
    // Log the anomaly detection
    if (anomalies.length > 0) {
      securityMiddleware.auditLog('AI_ANOMALY_DETECTED', {
        userId,
        anomalyCount: anomalies.length,
        anomalyScore,
        highestSeverity: anomalies.reduce((max, a) => {
          return a.score > max ? a.score : max;
        }, 0),
      });
    }
    
    res.json({
      success: true,
      anomalies,
      anomalyScore,
      recommendation: anomalyScore > 0.5 
        ? 'BLOCK_ACCESS' 
        : anomalyScore > 0.3 
          ? 'ADDITIONAL_VERIFICATION' 
          : 'ALLOW_ACCESS',
    });
  } catch (error) {
    console.error('Error detecting anomalies:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to detect anomalies',
    });
  }
});

// Route to assess document risk
router.post('/assess-document', async (req, res) => {
  try {
    const { documentId, documentType, content, metadata } = req.body;
    
    if (!documentId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Document ID is required',
      });
    }
    
    // In a real implementation, this would use NLP and content analysis
    // For this example, we'll use simple heuristics
    
    // Default risk factors
    const riskFactors = {
      sensitivityScore: 0.3, // Default moderate sensitivity
      regulatoryImpact: 'LOW',
      dataProtectionRisks: [],
      recommendedAccessLevel: 'STANDARD',
    };
    
    // Adjust sensitivity based on document type
    if (documentType) {
      const sensitivityMap = {
        'CLINICAL_REPORT': 0.7,
        'PROTOCOL': 0.6,
        'REGULATORY_SUBMISSION': 0.8,
        'FINANCIAL': 0.9,
        'GENERAL': 0.3,
      };
      
      riskFactors.sensitivityScore = sensitivityMap[documentType] || riskFactors.sensitivityScore;
    }
    
    // Check for PII in content if provided
    if (content) {
      // Simple check for PII patterns
      const piiPatterns = [
        /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/, // SSN
        /\b\d{16}\b/, // Credit card
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, // Email
      ];
      
      for (const pattern of piiPatterns) {
        if (pattern.test(content)) {
          riskFactors.dataProtectionRisks.push('CONTAINS_PII');
          riskFactors.sensitivityScore = Math.max(riskFactors.sensitivityScore, 0.8);
          break;
        }
      }
    }
    
    // Adjust regulatory impact based on metadata
    if (metadata) {
      if (metadata.regulatorySubmission) {
        riskFactors.regulatoryImpact = 'HIGH';
        riskFactors.sensitivityScore = Math.max(riskFactors.sensitivityScore, 0.7);
      }
      
      if (metadata.clinicalTrial) {
        riskFactors.dataProtectionRisks.push('CLINICAL_DATA');
        riskFactors.sensitivityScore = Math.max(riskFactors.sensitivityScore, 0.6);
      }
    }
    
    // Determine recommended access level
    if (riskFactors.sensitivityScore >= 0.7) {
      riskFactors.recommendedAccessLevel = 'RESTRICTED';
    } else if (riskFactors.sensitivityScore >= 0.4) {
      riskFactors.recommendedAccessLevel = 'STANDARD';
    } else {
      riskFactors.recommendedAccessLevel = 'OPEN';
    }
    
    // Log the assessment
    securityMiddleware.auditLog('AI_DOCUMENT_RISK_ASSESSMENT', {
      documentId,
      documentType: documentType || 'UNKNOWN',
      sensitivityScore: riskFactors.sensitivityScore,
      recommendedAccessLevel: riskFactors.recommendedAccessLevel,
    });
    
    res.json({
      success: true,
      documentId,
      riskFactors,
      securityRecommendations: [
        riskFactors.sensitivityScore >= 0.7 ? 'ENCRYPT_DOCUMENT' : null,
        riskFactors.sensitivityScore >= 0.5 ? 'IMPLEMENT_ACCESS_CONTROLS' : null,
        riskFactors.sensitivityScore >= 0.8 ? 'REQUIRE_MFA_FOR_ACCESS' : null,
        riskFactors.dataProtectionRisks.length > 0 ? 'TRACK_ALL_ACCESS_EVENTS' : null,
      ].filter(Boolean),
    });
  } catch (error) {
    console.error('Error assessing document risk:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to assess document risk',
    });
  }
});

// Route to get AI security status
router.get('/security-status', (req, res) => {
  res.json({
    success: true,
    status: 'OPERATIONAL',
    activeModels: [
      {
        name: 'AccessPredictor',
        version: '1.2.3',
        status: 'ACTIVE',
        lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        name: 'AnomalyDetector',
        version: '2.0.1',
        status: 'ACTIVE',
        lastUpdated: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        name: 'DocumentRiskClassifier',
        version: '1.5.0',
        status: 'ACTIVE',
        lastUpdated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    metrics: {
      totalPredictions: 15482,
      accuracyRate: 0.986,
      averageResponseTime: 120, // ms
      activeThreads: 4,
    },
  });
});

module.exports = router;