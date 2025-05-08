/**
 * CER-QMP Integration API
 * 
 * This module provides endpoints that integrate Quality Management Plan (QMP) data
 * with the Clinical Evaluation Report (CER) validation and compliance engine.
 * It enables:
 * 
 * 1. Scoped validation based on QMP objectives
 * 2. Compliance checking against specific sections defined in objectives
 * 3. Dashboard metrics for QMP objective status and completion tracking
 * 
 * Version: 1.0.0
 * Last Updated: May 8, 2025
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Cache for QMP data to avoid redundant API calls
let qmpDataCache = null;
let qmpCacheTimestamp = null;
const CACHE_TTL = 30000; // 30 seconds cache lifetime

/**
 * Fetch and cache QMP data from QMP API
 */
async function getQmpData() {
  // Return cached data if still fresh
  if (qmpDataCache && qmpCacheTimestamp && Date.now() - qmpCacheTimestamp < CACHE_TTL) {
    return qmpDataCache;
  }
  
  try {
    // Fetch fresh data from QMP API
    const response = await fetch('http://localhost:5000/api/qmp-api/data');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch QMP data: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Update cache
    qmpDataCache = data;
    qmpCacheTimestamp = Date.now();
    
    return data;
  } catch (error) {
    logger.error('Error fetching QMP data for integration', {
      module: 'cer-qmp-integration',
      error: error.message
    });
    
    throw error;
  }
}

/**
 * GET /api/cer/qmp-integration/dashboard-metrics
 * Get enhanced dashboard metrics with QMP objective information
 */
router.get('/dashboard-metrics', async (req, res) => {
  try {
    const qmpData = await getQmpData();
    
    // Calculate enhanced metrics
    const enhancedMetrics = {
      ...qmpData.metrics,
      objectivesByStatus: qmpData.metrics.objectivesByStatus,
      objectivesBreakdown: {
        total: qmpData.objectives.length,
        complete: qmpData.metrics.objectivesByStatus.complete,
        inProgress: qmpData.metrics.objectivesByStatus.inProgress,
        planned: qmpData.metrics.objectivesByStatus.planned,
        blocked: qmpData.metrics.objectivesByStatus.blocked
      },
      completionPercentage: qmpData.metrics.overallCompletion,
      cerSectionCoverage: {
        percentage: qmpData.metrics.sectionCoverage,
        coveredSections: getCoveredSections(qmpData.objectives),
        uncoveredCriticalSections: getUncoveredCriticalSections(qmpData.objectives)
      },
      objectiveCompletionTimeline: generateCompletionTimeline(qmpData.objectives),
      highPriorityObjectives: getHighPriorityObjectives(qmpData.objectives)
    };
    
    logger.info('Generated enhanced QMP dashboard metrics', {
      module: 'cer-qmp-integration'
    });
    
    res.json(enhancedMetrics);
  } catch (error) {
    logger.error('Error generating enhanced dashboard metrics', {
      module: 'cer-qmp-integration',
      error: error.message
    });
    
    res.status(500).json({
      error: 'Failed to generate enhanced dashboard metrics',
      message: error.message
    });
  }
});

/**
 * POST /api/cer/qmp-integration/validate-scoped
 * Validate CER document with compliance scope defined by QMP objectives
 */
router.post('/validate-scoped', async (req, res) => {
  try {
    const { documentId, framework = 'mdr' } = req.body;
    
    if (!documentId) {
      return res.status(400).json({
        error: 'Document ID is required'
      });
    }
    
    // Get QMP data for scoping
    const qmpData = await getQmpData();
    
    // Extract scoped sections from QMP objectives
    const scopedSections = extractScopedSections(qmpData.objectives);
    
    // Get document from storage
    // In a real implementation, you would fetch the document from the database
    // For now, we'll simulate with a mock document
    
    // Call validation with the scoped sections
    // In a real implementation, you would make an actual call to the validation service
    // For now, we'll simulate the validation results
    const validationResults = await performScopedValidation(documentId, framework, scopedSections);
    
    // Add QMP-specific validation context
    const enhancedResults = enhanceWithQmpContext(validationResults, qmpData);
    
    logger.info('Performed QMP-scoped validation', {
      module: 'cer-qmp-integration',
      documentId,
      framework,
      scopedSectionCount: scopedSections.length
    });
    
    res.json(enhancedResults);
  } catch (error) {
    logger.error('Error performing QMP-scoped validation', {
      module: 'cer-qmp-integration',
      error: error.message
    });
    
    res.status(500).json({
      error: 'Failed to perform QMP-scoped validation',
      message: error.message
    });
  }
});

/**
 * POST /api/cer/qmp-integration/objective-compliance
 * Check compliance for a specific objective
 */
router.post('/objective-compliance', async (req, res) => {
  try {
    const { objectiveId, documentId, framework = 'mdr' } = req.body;
    
    if (!objectiveId) {
      return res.status(400).json({
        error: 'Objective ID is required'
      });
    }
    
    if (!documentId) {
      return res.status(400).json({
        error: 'Document ID is required'
      });
    }
    
    // Get QMP data
    const qmpData = await getQmpData();
    
    // Find the specific objective
    const objective = qmpData.objectives.find(obj => obj.id === objectiveId);
    
    if (!objective) {
      return res.status(404).json({
        error: 'Objective not found'
      });
    }
    
    // Extract sections for the objective
    const objectiveSections = objective.scopeSections || [];
    
    // Perform validation for just these sections
    const validationResults = await performScopedValidation(documentId, framework, objectiveSections);
    
    // Calculate objective-specific compliance score
    const complianceScore = calculateObjectiveComplianceScore(validationResults, objective);
    
    logger.info('Checked objective compliance', {
      module: 'cer-qmp-integration',
      objectiveId,
      documentId,
      framework,
      complianceScore
    });
    
    res.json({
      objectiveId,
      title: objective.title,
      sections: objectiveSections,
      complianceScore,
      issues: validationResults.issues.filter(issue => 
        objectiveSections.some(section => issue.location.includes(section))
      ),
      recommendations: validationResults.recommendations.filter(rec => 
        objectiveSections.some(section => rec.location?.includes(section))
      )
    });
  } catch (error) {
    logger.error('Error checking objective compliance', {
      module: 'cer-qmp-integration',
      error: error.message
    });
    
    res.status(500).json({
      error: 'Failed to check objective compliance',
      message: error.message
    });
  }
});

/**
 * GET /api/cer/qmp-integration/section-objectives/:section
 * Get objectives that cover a specific CER section
 */
router.get('/section-objectives/:section', async (req, res) => {
  try {
    const { section } = req.params;
    
    if (!section) {
      return res.status(400).json({
        error: 'Section name is required'
      });
    }
    
    // Get QMP data
    const qmpData = await getQmpData();
    
    // Find objectives that cover this section
    const relevantObjectives = qmpData.objectives.filter(obj => 
      obj.scopeSections && obj.scopeSections.includes(section)
    );
    
    logger.info('Retrieved section objectives', {
      module: 'cer-qmp-integration',
      section,
      objectiveCount: relevantObjectives.length
    });
    
    res.json({
      section,
      objectives: relevantObjectives,
      count: relevantObjectives.length
    });
  } catch (error) {
    logger.error('Error retrieving section objectives', {
      module: 'cer-qmp-integration',
      error: error.message
    });
    
    res.status(500).json({
      error: 'Failed to retrieve section objectives',
      message: error.message
    });
  }
});

/**
 * Helper function to extract all sections covered by objectives
 */
function extractScopedSections(objectives) {
  const sections = new Set();
  
  objectives.forEach(objective => {
    if (objective.scopeSections && Array.isArray(objective.scopeSections)) {
      objective.scopeSections.forEach(section => sections.add(section));
    }
  });
  
  return Array.from(sections);
}

/**
 * Helper function to get all sections covered by objectives
 */
function getCoveredSections(objectives) {
  const coveredSections = new Set();
  
  objectives.forEach(objective => {
    if (objective.scopeSections && Array.isArray(objective.scopeSections)) {
      objective.scopeSections.forEach(section => coveredSections.add(section));
    }
  });
  
  return Array.from(coveredSections);
}

/**
 * Helper function to get critical sections not covered by any objective
 */
function getUncoveredCriticalSections(objectives) {
  const criticalSections = [
    'Clinical Data',
    'Safety',
    'State of the Art',
    'Risk Management',
    'Benefit-Risk Analysis'
  ];
  
  const coveredSections = getCoveredSections(objectives);
  
  return criticalSections.filter(section => !coveredSections.includes(section));
}

/**
 * Helper function to generate completion timeline for objectives
 */
function generateCompletionTimeline(objectives) {
  // In a real implementation, you would generate a timeline based on objective dates
  // For now, we'll return a simple object with counts by month
  return {
    'May 2025': 2,
    'June 2025': 1,
    'July 2025': 1
  };
}

/**
 * Helper function to get high priority objectives
 */
function getHighPriorityObjectives(objectives) {
  // In a real implementation, you would determine priority based on objective attributes
  // For now, we'll return objectives with blocked status or with critical sections
  const criticalSections = [
    'Clinical Data',
    'Safety',
    'State of the Art',
    'Risk Management',
    'Benefit-Risk Analysis'
  ];
  
  return objectives.filter(obj => 
    obj.status === 'blocked' || 
    (obj.scopeSections && obj.scopeSections.some(section => criticalSections.includes(section)))
  );
}

/**
 * Helper function to perform scoped validation
 */
async function performScopedValidation(documentId, framework, sections) {
  // In a real implementation, you would call the actual validation service
  // For now, we'll simulate validation results
  
  // Generate mock issues based on the sections
  const issues = [];
  const recommendations = [];
  
  // Add section-specific issues and recommendations
  sections.forEach(section => {
    if (section === 'Clinical Data') {
      issues.push({
        type: 'incomplete_section',
        message: `${section} section is incomplete`,
        severity: 'major',
        location: `section:${section.toLowerCase().replace(/\s+/g, '_')}`,
        regulatoryReference: 'EU MDR Annex XIV, Part A, Section 3'
      });
      
      recommendations.push({
        id: `rec-${section.toLowerCase().replace(/\s+/g, '_')}-1`,
        type: 'update_section',
        message: `Include statistical analysis methods in ${section} section`,
        location: `section:${section.toLowerCase().replace(/\s+/g, '_')}`
      });
    }
    
    if (section === 'State of the Art') {
      issues.push({
        type: 'outdated_references',
        message: `${section} contains outdated references`,
        severity: 'minor',
        location: `section:${section.toLowerCase().replace(/\s+/g, '_')}`,
        regulatoryReference: 'EU MDR Annex XIV, Part A, Section 2'
      });
      
      recommendations.push({
        id: `rec-${section.toLowerCase().replace(/\s+/g, '_')}-1`,
        type: 'update_references',
        message: `Update references in ${section} to include publications from the last 3 years`,
        location: `section:${section.toLowerCase().replace(/\s+/g, '_')}`
      });
    }
  });
  
  // Calculate score based on issues
  const criticalIssues = issues.filter(i => i.severity === 'critical').length;
  const majorIssues = issues.filter(i => i.severity === 'major').length;
  const minorIssues = issues.filter(i => i.severity === 'minor').length;
  
  // Calculate score: deduct 10 for critical, 5 for major, 2 for minor
  const score = Math.max(0, 100 - (criticalIssues * 10) - (majorIssues * 5) - (minorIssues * 2));
  
  return {
    documentId,
    framework,
    timestamp: new Date().toISOString(),
    validationResults: {
      summary: {
        overallScore: score,
        criticalIssues,
        majorIssues,
        minorIssues,
        recommendations: recommendations.length
      },
      issues,
      recommendations
    }
  };
}

/**
 * Helper function to enhance validation results with QMP context
 */
function enhanceWithQmpContext(validationResults, qmpData) {
  // Map issues to objectives
  const issuesWithObjectives = validationResults.validationResults.issues.map(issue => {
    // Extract section from location (e.g., 'section:clinical_data' -> 'clinical_data')
    const sectionMatch = issue.location.match(/section:([a-z_]+)/);
    const section = sectionMatch ? 
      // Convert back to title case for matching with objectives
      sectionMatch[1].split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') 
      : null;
    
    // Find objectives that cover this section
    const relatedObjectives = section ? 
      qmpData.objectives.filter(obj => 
        obj.scopeSections && obj.scopeSections.includes(section)
      ) : [];
    
    return {
      ...issue,
      relatedObjectives: relatedObjectives.map(obj => ({
        id: obj.id,
        title: obj.title,
        status: obj.status
      }))
    };
  });
  
  // Replace original issues with enhanced ones
  validationResults.validationResults.issues = issuesWithObjectives;
  
  // Add QMP metadata context
  validationResults.qmpContext = {
    planName: qmpData.metadata.planName,
    version: qmpData.metadata.version,
    lastValidated: qmpData.metrics.lastValidatedDate,
    objectivesCount: qmpData.objectives.length,
    completionPercentage: qmpData.metrics.overallCompletion
  };
  
  return validationResults;
}

/**
 * Helper function to calculate objective-specific compliance score
 */
function calculateObjectiveComplianceScore(validationResults, objective) {
  // Extract issues related to the objective's sections
  const relevantIssues = validationResults.issues.filter(issue => 
    objective.scopeSections.some(section => issue.location.includes(section))
  );
  
  // Calculate score: start with 100 and deduct based on issues
  const criticalIssues = relevantIssues.filter(i => i.severity === 'critical').length;
  const majorIssues = relevantIssues.filter(i => i.severity === 'major').length;
  const minorIssues = relevantIssues.filter(i => i.severity === 'minor').length;
  
  // More severe deductions for objective-specific score
  return Math.max(0, 100 - (criticalIssues * 20) - (majorIssues * 10) - (minorIssues * 3));
}

export default router;