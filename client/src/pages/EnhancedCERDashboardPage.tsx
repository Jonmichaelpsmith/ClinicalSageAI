import React, { useState, useEffect } from 'react';
import '../components/CERGenerator';
import AdvancedDashboard from '../components/AdvancedDashboard';
import NLPQuery from '../components/NLPQuery';

export default function EnhancedCERDashboardPage() {
  const [ndcCodes, setNdcCodes] = useState<string[]>([]);
  const [inputNdc, setInputNdc] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    const cerAuth = localStorage.getItem('cer_auth');
    if (cerAuth) {
      setIsAuthenticated(true);
    }
  }, []);

  // Handle adding new NDC code
  const addNdcCode = () => {
    if (!inputNdc.trim()) {
      setError('Please enter an NDC code');
      return;
    }

    // Basic NDC code validation (simplified for this example)
    const ndcPattern = /^\d{4,5}-\d{3,4}-\d{1,2}$|^\d{5}-\d{4}-\d{2}$|^\d{1,5}$/;
    if (!ndcPattern.test(inputNdc)) {
      setError('Please enter a valid NDC code format (e.g., 12345-678-90, 12345-6789-01, or numeric)');
      return;
    }

    if (ndcCodes.includes(inputNdc)) {
      setError('This NDC code is already added');
      return;
    }

    setNdcCodes([...ndcCodes, inputNdc]);
    setInputNdc('');
    setError('');
  };

  // Handle removing an NDC code
  const removeNdcCode = (index: number) => {
    const updatedCodes = [...ndcCodes];
    updatedCodes.splice(index, 1);
    setNdcCodes(updatedCodes);
  };

  // Handle filtering data based on NLP query
  const handleFilteredData = (filteredData: any) => {
    setDashboardData(filteredData);
  };

  // Handle login
  const handleLogin = () => {
    localStorage.setItem('cer_auth', 'true');
    setIsAuthenticated(true);
  };

  // Render login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">CER Dashboard Login</h1>
        <p className="mb-6 text-gray-600 text-center">
          Access to the Clinical Evaluation Report Dashboard requires authentication.
        </p>
        <button
          onClick={handleLogin}
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
        >
          Authenticate & Access Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2">Enhanced CER Dashboard</h1>
        <p className="text-gray-600 mb-6">
          Compare and analyze data from multiple Clinical Evaluation Reports using advanced visualization and AI.
        </p>

        {/* NDC Code Input */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-grow">
            <label htmlFor="ndcInput" className="block text-sm font-medium text-gray-700 mb-1">
              Add NDC Code for Analysis
            </label>
            <input
              id="ndcInput"
              type="text"
              value={inputNdc}
              onChange={(e) => setInputNdc(e.target.value)}
              placeholder="Enter NDC code (e.g., 12345-678-90)"
              className="w-full p-2 border border-gray-300 rounded-md"
              onKeyPress={(e) => e.key === 'Enter' && addNdcCode()}
            />
          </div>
          <div className="self-end">
            <button
              onClick={addNdcCode}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add NDC
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md">
            <p>{error}</p>
          </div>
        )}

        {/* NDC Codes list */}
        {ndcCodes.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">NDC Codes for Analysis:</h3>
            <div className="flex flex-wrap gap-2">
              {ndcCodes.map((code, index) => (
                <div
                  key={index}
                  className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                >
                  <span>{code}</span>
                  <button
                    onClick={() => removeNdcCode(index)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warning if no NDC codes */}
        {ndcCodes.length === 0 && (
          <div className="p-4 mb-6 bg-yellow-100 text-yellow-800 rounded-md">
            <p>Please add at least one NDC code to analyze data.</p>
          </div>
        )}

        {/* NLP Query Component */}
        <NLPQuery onFilter={handleFilteredData} />

        {/* Comparative Dashboard */}
        {ndcCodes.length > 0 && (
          <AdvancedDashboard 
            ndcCodes={ndcCodes} 
            key={ndcCodes.join(',')} // Force re-render when codes change
          />
        )}

        {/* Additional features section */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 border border-gray-200 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">PDF Export</h3>
            <p className="text-gray-600 mb-4">
              Export comprehensive reports with all visualizations and analytics in PDF format.
            </p>
            <button 
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              disabled={ndcCodes.length === 0}
              onClick={() => {
                if (ndcCodes.length > 0) {
                  window.open(`/api/cer/export-pdf?ndc_codes=${ndcCodes.join(',')}`);
                }
              }}
            >
              Download PDF Report
            </button>
          </div>
          
          <div className="p-5 border border-gray-200 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Batch Processing</h3>
            <p className="text-gray-600 mb-4">
              Upload a CSV file with multiple NDC codes for batch processing.
            </p>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept=".csv"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Upload
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Resources section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Resources & Documentation</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-md">
            <h3 className="font-semibold mb-2">FAERS Documentation</h3>
            <p className="text-sm text-gray-600">Official FDA documentation on the Adverse Event Reporting System.</p>
            <a href="https://www.fda.gov/drugs/surveillance/questions-and-answers-fdas-adverse-event-reporting-system-faers" 
              className="text-blue-600 hover:underline text-sm" target="_blank" rel="noopener noreferrer">
              Learn More →
            </a>
          </div>
          <div className="p-4 border border-gray-200 rounded-md">
            <h3 className="font-semibold mb-2">NDC Directory</h3>
            <p className="text-sm text-gray-600">Search the FDA NDC directory to find valid NDC codes.</p>
            <a href="https://www.accessdata.fda.gov/scripts/cder/ndc/index.cfm" 
              className="text-blue-600 hover:underline text-sm" target="_blank" rel="noopener noreferrer">
              NDC Directory →
            </a>
          </div>
          <div className="p-4 border border-gray-200 rounded-md">
            <h3 className="font-semibold mb-2">Clinical Evaluation Report Guidelines</h3>
            <p className="text-sm text-gray-600">MEDDEV guidance on Clinical Evaluation Reports.</p>
            <a href="https://ec.europa.eu/health/medical-devices-sector/new-regulations/guidance-mdcg-endorsed-documents-and-other-guidance_en" 
              className="text-blue-600 hover:underline text-sm" target="_blank" rel="noopener noreferrer">
              View Guidelines →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}