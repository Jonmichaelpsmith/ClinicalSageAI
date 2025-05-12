import React, { useState, useEffect } from 'react';
import { FDA510kService } from '../../services/FDA510kService';

/**
 * PredicateFinderCard Component
 * 
 * This component provides a UI for searching and displaying potential
 * predicate devices that could be used in a 510(k) submission.
 */
const PredicateFinderCard = ({ 
  deviceProfile,
  onPredicateSelect,
  selectedPredicates = [],
  organizationId = null
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [predicates, setPredicates] = useState([]);
  const [searchError, setSearchError] = useState(null);
  const [searchKeywords, setSearchKeywords] = useState('');
  
  // Load predicates when device profile changes
  useEffect(() => {
    if (deviceProfile && (deviceProfile.name || deviceProfile.productCode)) {
      searchPredicates();
    }
  }, [deviceProfile]);
  
  // Search for predicates based on device profile
  const searchPredicates = async () => {
    if (!deviceProfile) return;
    
    setIsLoading(true);
    setSearchError(null);
    
    try {
      // Convert comma-separated keywords to array
      const keywordsArray = searchKeywords
        ? searchKeywords.split(',').map(k => k.trim()).filter(Boolean)
        : [];
      
      // Call the FDA510kService to find predicates
      const result = await FDA510kService.findPredicateDevices({
        deviceName: deviceProfile.name,
        manufacturer: deviceProfile.manufacturer,
        productCode: deviceProfile.productCode,
        intendedUse: deviceProfile.intendedUse,
        keywords: keywordsArray,
        limit: 5
      }, organizationId);
      
      if (result && result.predicates) {
        setPredicates(result.predicates);
      } else {
        setPredicates([]);
        if (result && result.error) {
          setSearchError(result.error);
        }
      }
    } catch (error) {
      console.error('Error searching for predicates:', error);
      setSearchError('Failed to search for predicate devices. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle keyword search input changes
  const handleKeywordsChange = (e) => {
    setSearchKeywords(e.target.value);
  };
  
  // Handle predicate selection
  const handlePredicateSelect = (predicate) => {
    if (onPredicateSelect) {
      onPredicateSelect(predicate);
    }
  };
  
  // Check if a predicate is already selected
  const isPredicateSelected = (predicateId) => {
    return selectedPredicates.some(p => p.id === predicateId);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <h3 className="text-lg font-medium mb-4">Predicate Device Finder</h3>
      
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Additional search keywords (comma-separated)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            value={searchKeywords}
            onChange={handleKeywordsChange}
          />
          <button
            onClick={searchPredicates}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-white ${
              isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Searching predicates for: {deviceProfile?.name || 'Unknown device'}
        </p>
      </div>
      
      {searchError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
          {searchError}
        </div>
      )}
      
      {predicates.length === 0 && !isLoading && !searchError && (
        <div className="bg-yellow-50 border border-yellow-100 text-yellow-800 px-4 py-3 rounded mb-4">
          No predicate devices found. Try adding more keywords or broadening your search criteria.
        </div>
      )}
      
      <div className="space-y-3 max-h-72 overflow-y-auto">
        {predicates.map((predicate) => (
          <div 
            key={predicate.id} 
            className={`border rounded-md p-3 ${
              isPredicateSelected(predicate.id) 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50'
            }`}
          >
            <div className="flex justify-between">
              <div>
                <h4 className="font-medium">{predicate.name}</h4>
                <p className="text-sm text-gray-600">{predicate.manufacturer}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {predicate.id}
                  </span>
                  {predicate.productCode && (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {predicate.productCode}
                    </span>
                  )}
                  {predicate.deviceClass && (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      Class {predicate.deviceClass}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Clearance Date: {predicate.clearanceDate || 'Unknown'}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handlePredicateSelect(predicate)}
                  className={`text-xs px-2 py-1 rounded ${
                    isPredicateSelected(predicate.id)
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                  }`}
                >
                  {isPredicateSelected(predicate.id) ? 'Selected' : 'Select'}
                </button>
                {predicate.decisionSummaryURL && (
                  <a
                    href={predicate.decisionSummaryURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  >
                    View Summary
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {isLoading && (
        <div className="flex justify-center items-center h-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}
    </div>
  );
};

export default PredicateFinderCard;