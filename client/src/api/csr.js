/**
 * CSR API - Client-side API helper for CSR Deep Intelligence module
 */

/**
 * Generate a patient case narrative
 * 
 * @param {Object} narrativeData Input data for narrative generation
 * @returns {Promise<Object>} Generated narrative
 */
export const generateNarrative = async (narrativeData) => {
  const response = await fetch('/api/csr/generate-narrative', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(narrativeData)
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate narrative');
  }
  
  return response.json();
};

/**
 * Detect adverse event signals
 * 
 * @param {Object} signalData Input data for signal detection
 * @returns {Promise<Object>} Detected signals
 */
export const detectSignals = async (signalData) => {
  const response = await fetch('/api/csr/detect-signals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(signalData)
  });
  
  if (!response.ok) {
    throw new Error('Failed to detect signals');
  }
  
  return response.json();
};

/**
 * Analyze benefit-risk profile
 * 
 * @param {Object} benefitRiskData Input data for benefit-risk analysis
 * @returns {Promise<Object>} Benefit-risk analysis results
 */
export const analyzeBenefitRisk = async (benefitRiskData) => {
  const response = await fetch('/api/csr/analyze-benefit-risk', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(benefitRiskData)
  });
  
  if (!response.ok) {
    throw new Error('Failed to analyze benefit-risk profile');
  }
  
  return response.json();
};