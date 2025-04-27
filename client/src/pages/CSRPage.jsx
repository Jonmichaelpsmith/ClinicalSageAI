import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'wouter';

const CSRPage = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('generation');

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">CSR Intelligence™</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-sm text-gray-700 hover:text-pink-600">
              Dashboard
            </Link>
            <span className="text-sm text-gray-700">
              {user?.username}
            </span>
            <button
              onClick={logout}
              className="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Clinical Study Report (CSR) Intelligence</h2>
          <p className="text-gray-600">
            AI-powered analysis, extraction, and generation of clinical study reports with regulatory compliance checks.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-8">
          <div className="flex border-b border-gray-200">
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'generation'
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('generation')}
            >
              CSR Generation
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'extraction'
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('extraction')}
            >
              Data Extraction
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'analysis'
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('analysis')}
            >
              Compliance Analysis
            </button>
          </div>
          
          <div className="p-6">
            {/* CSR Generation Tab */}
            {activeTab === 'generation' && (
              <div>
                <h3 className="text-lg font-medium mb-4">Generate Clinical Study Report</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Create compliant CSRs using AI-powered document generation based on your clinical trial data.
                </p>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Clinical Trial Data Source
                  </label>
                  <select className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500">
                    <option value="">Select a data source</option>
                    <option value="database">Clinical Database</option>
                    <option value="file">Data File Upload</option>
                    <option value="manual">Manual Entry</option>
                  </select>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CSR Template
                  </label>
                  <select className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500">
                    <option value="">Select a template</option>
                    <option value="ich">ICH E3 Standard Template</option>
                    <option value="fda">FDA-Focused Template</option>
                    <option value="ema">EMA-Focused Template</option>
                    <option value="custom">Custom Template</option>
                  </select>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Optional Sections
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="extended-pk"
                        className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                      />
                      <label htmlFor="extended-pk" className="ml-2 text-sm text-gray-700">
                        Extended Pharmacokinetics Analysis
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="safety-summary"
                        className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                      />
                      <label htmlFor="safety-summary" className="ml-2 text-sm text-gray-700">
                        Enhanced Safety Summary
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="biomarker"
                        className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                      />
                      <label htmlFor="biomarker" className="ml-2 text-sm text-gray-700">
                        Biomarker Analysis
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors mr-2">
                    Save Settings
                  </button>
                  <button className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors">
                    Generate CSR
                  </button>
                </div>
              </div>
            )}
            
            {/* Data Extraction Tab */}
            {activeTab === 'extraction' && (
              <div>
                <h3 className="text-lg font-medium mb-4">Extract Data from Existing CSRs</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Extract structured data from existing clinical study reports for analysis or reuse.
                </p>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload CSR Document
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mt-1 text-sm text-gray-600">
                      Drag and drop your CSR PDF or Word document, or{" "}
                      <button className="text-pink-600 hover:text-pink-800 font-medium">
                        browse
                      </button>
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Supports PDF, DOC, DOCX formats up to 50MB
                    </p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data to Extract
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="extract-efficacy"
                        className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                        defaultChecked
                      />
                      <label htmlFor="extract-efficacy" className="ml-2 text-sm text-gray-700">
                        Efficacy Results
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="extract-safety"
                        className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                        defaultChecked
                      />
                      <label htmlFor="extract-safety" className="ml-2 text-sm text-gray-700">
                        Safety Data
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="extract-demographics"
                        className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                        defaultChecked
                      />
                      <label htmlFor="extract-demographics" className="ml-2 text-sm text-gray-700">
                        Demographics
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="extract-methods"
                        className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                      />
                      <label htmlFor="extract-methods" className="ml-2 text-sm text-gray-700">
                        Study Methods
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="extract-tables"
                        className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                      />
                      <label htmlFor="extract-tables" className="ml-2 text-sm text-gray-700">
                        Tables and Figures
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="extract-conclusions"
                        className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                      />
                      <label htmlFor="extract-conclusions" className="ml-2 text-sm text-gray-700">
                        Conclusions
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors">
                    Extract Data
                  </button>
                </div>
              </div>
            )}
            
            {/* Compliance Analysis Tab */}
            {activeTab === 'analysis' && (
              <div>
                <h3 className="text-lg font-medium mb-4">Regulatory Compliance Analysis</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Check CSR compliance with global regulatory requirements and receive actionable recommendations.
                </p>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload CSR for Analysis
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="mt-1 text-sm text-gray-600">
                      Drag and drop your CSR document, or{" "}
                      <button className="text-pink-600 hover:text-pink-800 font-medium">
                        browse
                      </button>
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Supports PDF, DOC, DOCX formats up to 50MB
                    </p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Compliance Standards
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="std-ich-e3"
                        className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                        defaultChecked
                      />
                      <label htmlFor="std-ich-e3" className="ml-2 text-sm text-gray-700">
                        ICH E3
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="std-fda"
                        className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                        defaultChecked
                      />
                      <label htmlFor="std-fda" className="ml-2 text-sm text-gray-700">
                        FDA Guidelines
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="std-ema"
                        className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                      />
                      <label htmlFor="std-ema" className="ml-2 text-sm text-gray-700">
                        EMA Guidelines
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="std-pmda"
                        className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                      />
                      <label htmlFor="std-pmda" className="ml-2 text-sm text-gray-700">
                        PMDA (Japan)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="std-nmpa"
                        className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                      />
                      <label htmlFor="std-nmpa" className="ml-2 text-sm text-gray-700">
                        NMPA (China)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="std-custom"
                        className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                      />
                      <label htmlFor="std-custom" className="ml-2 text-sm text-gray-700">
                        Custom Standards
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors mr-2">
                    Save Settings
                  </button>
                  <button className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors">
                    Run Analysis
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Recent Activity Section */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-medium">Recent CSR Activities</h3>
          </div>
          <div className="divide-y divide-gray-200">
            <div className="px-6 py-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-900">Phase 2 Oncology CSR Generated</p>
                <p className="text-xs text-gray-500 mt-1">April 24, 2025</p>
              </div>
              <button className="text-pink-600 hover:text-pink-800 text-sm font-medium">
                View
              </button>
            </div>
            <div className="px-6 py-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-900">Safety Data Extracted from BT-473 CSR</p>
                <p className="text-xs text-gray-500 mt-1">April 22, 2025</p>
              </div>
              <button className="text-pink-600 hover:text-pink-800 text-sm font-medium">
                View
              </button>
            </div>
            <div className="px-6 py-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-900">Compliance Analysis Report - Protocol A2201</p>
                <p className="text-xs text-gray-500 mt-1">April 20, 2025</p>
              </div>
              <button className="text-pink-600 hover:text-pink-800 text-sm font-medium">
                View
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CSRPage;