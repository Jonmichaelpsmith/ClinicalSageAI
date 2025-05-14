/**
 * CER Compliance Service
 * 
 * This service handles the interactions with the compliance engine API
 * for objective compliance status and dashboard metrics.
 */

import axios from 'axios';

/**
 * Get compliance metrics for dashboard displays
 */
export const getComplianceMetrics = async (documentId = 'current', framework = 'mdr') => {
  try {
    const response = await axios.get(`/api/cer/qmp-integration/compliance-metrics`, {
      params: { documentId, framework }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching compliance metrics:', error);
    throw error;
  }
};

/**
 * Get objective-specific compliance score
 */
export const getObjectiveCompliance = async (objectiveId, documentId = 'current', framework = 'mdr') => {
  try {
    const response = await axios.post(`/api/cer/qmp-integration/objective-compliance`, {
      objectiveId,
      documentId,
      framework
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching objective compliance:', error);
    throw error;
  }
};

/**
 * Get all QMP objectives that cover a specific CER section
 */
export const getSectionObjectives = async (sectionName) => {
  try {
    const response = await axios.get(`/api/cer/qmp-integration/section-objectives/${encodeURIComponent(sectionName)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching section objectives:', error);
    throw error;
  }
};

/**
 * Validate CER document with scope defined by QMP objectives
 */
export const validateCerWithQmpScope = async (documentId, framework = 'mdr') => {
  try {
    const response = await axios.post(`/api/cer/qmp-integration/validate-scoped`, {
      documentId,
      framework
    });
    return response.data;
  } catch (error) {
    console.error('Error validating CER with QMP scope:', error);
    throw error;
  }
};

/**
 * Get enhanced dashboard metrics
 */
export const getDashboardMetrics = async () => {
  try {
    const response = await axios.get(`/api/cer/qmp-integration/dashboard-metrics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    throw error;
  }
};

/**
 * Validate literature review for regulatory compliance
 * 
 * @param {Object} literatureReview - The literature review object to validate
 * @param {Array} selectedArticles - The selected articles used in the review
 * @param {string} deviceName - The name of the device being evaluated
 * @param {string} framework - The regulatory framework to check against (default: 'mdr')
 * @returns {Promise<Object>} Validation results with issues and status
 */
export const validateLiteratureReview = async (literatureReview, selectedArticles, deviceName, framework = 'mdr') => {
  try {
    console.log(`Validating literature review for ${deviceName} against ${framework} requirements`);
    
    // Initialize validation results structure
    const validationResults = {
      valid: false,
      passedChecks: [],
      failedChecks: [],
      warnings: [],
      suggestions: [],
      complianceScore: 0,
      criticalIssues: [],
      majorIssues: [],
      minorIssues: []
    };
    
    // Run the validation
    try {
      const response = await axios.post('/api/cer/compliance/validate-literature-review', {
        literatureReview,
        selectedArticles,
        deviceName,
        framework
      });
      
      // Merge the server response with our results structure
      Object.assign(validationResults, response.data);
      
      return validationResults;
    } catch (error) {
      console.error('Server-side validation failed, falling back to client-side checks:', error);
      
      // Perform client-side validation as fallback
      return performClientSideLiteratureReviewValidation(literatureReview, selectedArticles, deviceName, framework);
    }
  } catch (error) {
    console.error('Error validating literature review:', error);
    throw error;
  }
};

/**
 * Client-side validation for literature reviews when server validation is unavailable
 * 
 * @param {Object} literatureReview - The literature review to validate
 * @param {Array} selectedArticles - The selected articles
 * @param {string} deviceName - The device name
 * @param {string} framework - Regulatory framework
 * @returns {Object} Validation results
 */
const performClientSideLiteratureReviewValidation = (literatureReview, selectedArticles, deviceName, framework) => {
  const results = {
    valid: false,
    passedChecks: [],
    failedChecks: [],
    warnings: [],
    suggestions: [],
    complianceScore: 0,
    criticalIssues: [],
    majorIssues: [],
    minorIssues: []
  };
  
  // Check 1: Minimum number of articles
  if (selectedArticles.length < 3) {
    results.failedChecks.push('minimum_articles');
    results.criticalIssues.push({
      type: 'insufficient_articles',
      message: 'Literature review must include at least 3 relevant articles',
      details: `Currently only ${selectedArticles.length} articles are included`
    });
  } else {
    results.passedChecks.push('minimum_articles');
  }
  
  // Check 2: Peer-reviewed content
  const peerReviewedCount = selectedArticles.filter(article => article.peerReviewed).length;
  const peerReviewedPercentage = (peerReviewedCount / selectedArticles.length) * 100;
  
  if (peerReviewedPercentage < 50) {
    results.failedChecks.push('peer_reviewed_percentage');
    results.majorIssues.push({
      type: 'insufficient_peer_reviewed',
      message: 'Less than 50% of articles are from peer-reviewed sources',
      details: `Only ${peerReviewedPercentage.toFixed(1)}% of selected articles are peer-reviewed`
    });
  } else {
    results.passedChecks.push('peer_reviewed_percentage');
  }
  
  // Check 3: Device name presence
  if (literatureReview.content && deviceName) {
    if (!literatureReview.content.includes(deviceName)) {
      results.warnings.push({
        type: 'missing_device_reference',
        message: 'Literature review does not explicitly reference the device',
        details: `Device name "${deviceName}" not found in review content`
      });
    }
  }
  
  // Check 4: Citation format
  const citationRegex = /\[\d+\]|\(\w+\s+et\s+al\.,\s+\d{4}\)|\(\w+,\s+\d{4}\)/g;
  const hasCitations = citationRegex.test(literatureReview.content || '');
  
  if (!hasCitations) {
    results.failedChecks.push('citation_format');
    results.majorIssues.push({
      type: 'missing_citations',
      message: 'Literature review lacks properly formatted citations',
      details: 'No standard citation format detected in review content'
    });
  } else {
    results.passedChecks.push('citation_format');
  }
  
  // Check 5: Methodology section
  const hasMethodology = /methodology|literature search|search strategy|inclusion criteria|exclusion criteria/i.test(literatureReview.content || '');
  
  if (!hasMethodology) {
    results.failedChecks.push('methodology_section');
    results.minorIssues.push({
      type: 'missing_methodology',
      message: 'Literature review should include search methodology discussion',
      details: 'No description of search methodology, inclusion/exclusion criteria found'
    });
  } else {
    results.passedChecks.push('methodology_section');
  }
  
  // Check 6: Recently published articles
  const currentYear = new Date().getFullYear();
  const recentArticles = selectedArticles.filter(article => 
    article.year && (currentYear - article.year) <= 5
  );
  
  if (recentArticles.length < 1) {
    results.warnings.push({
      type: 'no_recent_articles',
      message: 'Literature review does not include recent articles',
      details: 'No articles published within the last 5 years were included'
    });
  }
  
  // Calculate compliance score
  const totalChecks = 5; // Total number of critical/major checks
  const passedCount = results.passedChecks.length;
  results.complianceScore = Math.floor((passedCount / totalChecks) * 100);
  
  // Determine overall validity
  results.valid = results.criticalIssues.length === 0 && results.majorIssues.length <= 1;
  
  return results;
};

export default {
  getComplianceMetrics,
  getObjectiveCompliance,
  getSectionObjectives,
  validateCerWithQmpScope,
  getDashboardMetrics,
  validateLiteratureReview
};