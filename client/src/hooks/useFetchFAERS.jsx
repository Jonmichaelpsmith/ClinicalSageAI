import { useState } from 'react';
import axios from 'axios';

/**
 * Custom hook for fetching FDA Adverse Event Reporting System (FAERS) data
 * 
 * @param {string} productName - The product name to search for
 * @param {string} cerId - The CER ID to associate the FAERS data with
 * @returns {Object} - FAERS data and fetching state
 */
export function useFetchFAERS(initialProductName = '', initialCerId = '') {
  const [productName, setProductName] = useState(initialProductName);
  const [cerId, setCerId] = useState(initialCerId);
  const [reports, setReports] = useState([]);
  const [riskScore, setRiskScore] = useState(0);
  const [riskAssessment, setRiskAssessment] = useState('Unknown');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [summary, setSummary] = useState(null);
  
  /**
   * Fetch FAERS data for the given product and CER ID
   */
  const fetchFaersData = async (productToFetch = productName, cerIdToUse = cerId) => {
    if (!productToFetch || !cerIdToUse) {
      setError('Product name and CER ID are required');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);
      
      const response = await axios.post('/api/cer/fetch-faers', {
        productName: productToFetch,
        cerId: cerIdToUse
      });
      
      // Update state with the response data
      if (response.data && response.data.success) {
        setSuccess(true);
        setSummary(response.data.summary);
        setRiskScore(response.data.summary.riskScore);
        setRiskAssessment(response.data.summary.severityAssessment);
        
        // Get detailed reports if needed
        await fetchDetailedReports(productToFetch);
      } else {
        setError('FAERS data fetch successful but no data returned');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch FAERS data');
      console.error('FAERS data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Fetch detailed FAERS reports for display in UI
   */
  const fetchDetailedReports = async (productToFetch) => {
    try {
      const detailResponse = await axios.get(`/api/cer/faers/data?productName=${encodeURIComponent(productToFetch)}`);
      
      if (detailResponse.data && detailResponse.data.reports) {
        setReports(detailResponse.data.reports);
      }
    } catch (err) {
      console.warn('Could not fetch detailed FAERS reports:', err);
      // Not setting error as this is secondary data
    }
  };
  
  /**
   * Reset all data and state
   */
  const resetFaersData = () => {
    setReports([]);
    setRiskScore(0);
    setRiskAssessment('Unknown');
    setError(null);
    setSuccess(false);
    setSummary(null);
  };
  
  /**
   * Prepare the data for inclusion in a CER
   */
  const prepareForCerInclusion = async () => {
    if (!productName) {
      setError('Product name is required for CER inclusion');
      return null;
    }
    
    try {
      const analysisResponse = await axios.get(`/api/cer/faers/analysis?productName=${encodeURIComponent(productName)}`);
      return analysisResponse.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to prepare FAERS data for CER inclusion');
      console.error('FAERS analysis error:', err);
      return null;
    }
  };
  
  return {
    // State
    productName,
    cerId,
    reports,
    riskScore,
    riskAssessment,
    isLoading,
    error,
    success,
    summary,
    
    // Actions
    setProductName,
    setCerId,
    fetchFaersData,
    resetFaersData,
    prepareForCerInclusion
  };
}
