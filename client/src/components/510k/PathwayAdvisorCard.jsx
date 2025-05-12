import React, { useState, useEffect } from 'react';
import { FDA510kService } from '../../services/FDA510kService';

/**
 * PathwayAdvisorCard Component
 * 
 * This component provides a UI for displaying regulatory pathway
 * recommendations based on device characteristics and predicates.
 */
const PathwayAdvisorCard = ({
  deviceProfile,
  predicateDevices = [],
  onPathwaySelect,
  selectedPathway = null,
  organizationId = null
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // Get pathway recommendation when device profile or predicates change
  useEffect(() => {
    if (deviceProfile && deviceProfile.name) {
      analyzePathway();
    }
  }, [deviceProfile, predicateDevices]);
  
  // Analyze regulatory pathway based on device profile and predicates
  const analyzePathway = async () => {
    if (!deviceProfile) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the FDA510kService to analyze regulatory pathway
      const result = await FDA510kService.analyzeRegulatoryPathway({
        ...deviceProfile,
        predicates: predicateDevices
      }, organizationId);
      
      if (result && result.recommendation) {
        setRecommendation(result.recommendation);
      } else {
        setRecommendation(null);
        if (result && result.error) {
          setError(result.error);
        }
      }
    } catch (error) {
      console.error('Error analyzing regulatory pathway:', error);
      setError('Failed to analyze regulatory pathway. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle pathway selection
  const handlePathwaySelect = (pathway) => {
    if (onPathwaySelect) {
      onPathwaySelect(pathway);
    }
  };
  
  // Get confidence level color based on confidence score
  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-700 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-700 bg-yellow-100';
    return 'text-red-700 bg-red-100';
  };
  
  // Get severity color for risk severity
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-700 bg-red-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100';
      case 'low': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <h3 className="text-lg font-medium mb-4">Regulatory Pathway Advisor</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {!recommendation && !isLoading && !error && (
        <div className="bg-yellow-50 border border-yellow-100 text-yellow-800 px-4 py-3 rounded mb-4">
          No pathway recommendation available. Please ensure your device profile is complete and try again.
        </div>
      )}
      
      {isLoading && (
        <div className="flex justify-center items-center h-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}
      
      {recommendation && !isLoading && (
        <>
          <div className="border border-gray-200 rounded-md p-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-semibold">{recommendation.recommendedPathway}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getConfidenceColor(recommendation.confidenceLevel)}`}>
                    {Math.round(recommendation.confidenceLevel * 100)}% confidence
                  </span>
                </div>
                <p className="text-gray-700 mt-1">{recommendation.rationale}</p>
              </div>
              <button
                onClick={() => handlePathwaySelect(recommendation.recommendedPathway)}
                className={`px-3 py-1.5 rounded-md text-white ${
                  selectedPathway === recommendation.recommendedPathway
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {selectedPathway === recommendation.recommendedPathway
                  ? 'Pathway Selected'
                  : 'Confirm Pathway'
                }
              </button>
            </div>
            
            <div className="mt-3">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                {showDetails ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
          </div>
          
          {showDetails && (
            <div className="space-y-4">
              {/* Alternative Pathways */}
              {recommendation.alternativePathways && recommendation.alternativePathways.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">Alternative Pathways</h5>
                  <div className="space-y-2">
                    {recommendation.alternativePathways.map((alternative, index) => (
                      <div key={index} className="border border-gray-200 rounded p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h6 className="font-medium">{alternative.pathway}</h6>
                            <p className="text-sm text-gray-600">{alternative.rationale}</p>
                          </div>
                          <button
                            onClick={() => handlePathwaySelect(alternative.pathway)}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Documentation Requirements */}
              {recommendation.additionalDocumentationNeeded && recommendation.additionalDocumentationNeeded.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">Required Documentation</h5>
                  <ul className="list-disc list-inside space-y-1">
                    {recommendation.additionalDocumentationNeeded.map((doc, index) => (
                      <li key={index} className="text-sm text-gray-700">{doc}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Regulatory Risks */}
              {recommendation.regulatoryRisks && recommendation.regulatoryRisks.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">Regulatory Risks</h5>
                  <div className="space-y-2">
                    {recommendation.regulatoryRisks.map((risk, index) => (
                      <div key={index} className="border border-gray-100 rounded p-2">
                        <div className="flex items-start gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityColor(risk.severity)}`}>
                            {risk.severity}
                          </span>
                          <div>
                            <p className="text-sm font-medium">{risk.risk}</p>
                            <p className="text-xs text-gray-600">{risk.mitigationStrategy}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Estimated Timeline */}
              {recommendation.estimatedTimeline && (
                <div>
                  <h5 className="font-medium mb-2">Estimated Timeline</h5>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-500">Preparation</p>
                      <p className="font-medium">{recommendation.estimatedTimeline.preparation}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-500">FDA Review</p>
                      <p className="font-medium">{recommendation.estimatedTimeline.review}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="font-medium">{recommendation.estimatedTimeline.total}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
      
      <div className="mt-4 pt-3 border-t border-gray-200">
        <button
          onClick={analyzePathway}
          disabled={isLoading || !deviceProfile}
          className={`w-full py-2 text-center rounded-md ${
            isLoading || !deviceProfile
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
          }`}
        >
          Refresh Analysis
        </button>
      </div>
    </div>
  );
};

export default PathwayAdvisorCard;