/**
 * CER API - Client-side API helper for Clinical Evaluation Report Generator
 */

/**
 * Generate a clinical evaluation report
 * 
 * @param {Object} cerData Input data for CER generation
 * @returns {Promise<Object>} Generated CER data
 */
export const generateCER = async (cerData) => {
  const response = await fetch('/api/cer/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(cerData)
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate CER');
  }
  
  return response.json();
};