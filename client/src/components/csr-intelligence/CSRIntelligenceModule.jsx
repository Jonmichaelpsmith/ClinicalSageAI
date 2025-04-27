import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Upload, 
  Sparkles, 
  BarChart3, 
  FileBarChart, 
  Network, 
  BookOpen,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { useModuleIntegration } from '../integration/ModuleIntegrationLayer';

// Simple tab component
const Tab = ({ label, active, icon: Icon, onClick }) => (
  <button
    className={`flex items-center px-4 py-2.5 border-b-2 font-medium text-sm ${
      active
        ? 'border-pink-500 text-pink-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`}
    onClick={onClick}
  >
    {Icon && <Icon size={18} className="mr-2" />}
    {label}
  </button>
);

const CSRIntelligenceModule = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCSR, setSelectedCSR] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const integration = useModuleIntegration();
  
  // Mock CSR data
  const csrData = [
    {
      id: 1,
      title: 'Clinical Study Report XYZ-123',
      sponsor: 'Concept2Cures',
      indication: 'Advanced Solid Tumors',
      status: 'Analyzed',
      date: '2025-03-15',
      insights: {
        adverseEvents: 32,
        seriousEvents: 5,
        efficacyHighlights: ['ORR: 42%', 'mPFS: 8.2 months'],
        safetyHighlights: ['Most common AE: Fatigue (28%)', 'No treatment-related deaths']
      }
    },
    {
      id: 2,
      title: 'Clinical Study Report ABC-456',
      sponsor: 'BioPharma Solutions',
      indication: 'Heart Failure',
      status: 'Processing',
      date: '2025-02-10',
      insights: null
    },
    {
      id: 3,
      title: 'Clinical Study Report DEF-789',
      sponsor: 'Concept2Cures',
      indication: 'NSCLC',
      status: 'Analyzed',
      date: '2025-01-05',
      insights: {
        adverseEvents: 45,
        seriousEvents: 8,
        efficacyHighlights: ['ORR: 38%', 'mPFS: 7.5 months', 'OS: 18.2 months'],
        safetyHighlights: ['Most common AE: Nausea (32%)', 'Treatment discontinuation rate: 12%']
      }
    }
  ];
  
  // Filter CSRs by search query
  const filteredCSRs = csrData.filter(csr => 
    csr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    csr.sponsor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    csr.indication.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleCSRSelect = (csr) => {
    setSelectedCSR(csr);
    
    // Share selected CSR with other modules
    integration.updateSharedData('selectedCSR', csr);
    integration.triggerEvent('csr-selected', { csrId: csr.id });
  };
  
  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
            <FileText size={24} className="text-purple-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Total CSRs</div>
            <div className="text-2xl font-semibold">24</div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
            <Sparkles size={24} className="text-pink-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Analyzed</div>
            <div className="text-2xl font-semibold">18</div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Network size={24} className="text-blue-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Indications</div>
            <div className="text-2xl font-semibold">12</div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <FileBarChart size={24} className="text-green-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Insights</div>
            <div className="text-2xl font-semibold">412</div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Recent CSRs</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search CSRs..."
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sponsor</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Indication</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCSRs.map(csr => (
                <tr key={csr.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleCSRSelect(csr)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText size={16} className="text-purple-500 mr-2" />
                      <div className="text-sm font-medium text-gray-900">{csr.title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{csr.sponsor}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{csr.indication}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{csr.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      csr.status === 'Analyzed' 
                        ? 'bg-green-100 text-green-800' 
                        : csr.status === 'Processing'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {csr.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button 
                      className="text-blue-600 hover:text-blue-800 mr-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCSRSelect(csr);
                        setActiveTab('insights');
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredCSRs.length === 0 && (
          <div className="p-8 text-center">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No CSRs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or upload a new CSR
            </p>
          </div>
        )}
      </div>
      
      <div className="flex justify-end">
        <button className="bg-pink-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-pink-700 transition-colors">
          <Upload size={16} className="mr-2" />
          Upload New CSR
        </button>
      </div>
    </div>
  );
  
  const renderAnalyze = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Upload Clinical Study Report</h2>
        <p className="text-gray-600 mb-4">
          Upload your Clinical Study Report (CSR) to extract key insights using our AI-powered analysis.
          We support PDF, DOC, and DOCX formats.
        </p>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-sm text-gray-500 mb-4">
            Drag and drop your CSR file here, or click to browse
          </p>
          <input type="file" className="hidden" id="csr-upload" />
          <label 
            htmlFor="csr-upload" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
          >
            Select File
          </label>
        </div>
        
        <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div className="text-sm text-gray-500 mb-2 sm:mb-0">
            Max file size: 100MB. Supported formats: PDF, DOC, DOCX
          </div>
          <button className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors sm:ml-auto disabled:opacity-50 disabled:cursor-not-allowed" disabled>
            Analyze Document
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Analysis Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Analysis Type
            </label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500">
              <option>Comprehensive Analysis</option>
              <option>Safety Analysis</option>
              <option>Efficacy Analysis</option>
              <option>Custom Analysis</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Regulatory Framework
            </label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500">
              <option>FDA (United States)</option>
              <option>EMA (European Union)</option>
              <option>PMDA (Japan)</option>
              <option>NMPA (China)</option>
              <option>Multiple Regions</option>
            </select>
          </div>
          
          <div>
            <label className="flex items-center">
              <input type="checkbox" className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded" />
              <span className="ml-2 text-sm text-gray-700">Enable deep comparative analysis with similar studies</span>
            </label>
          </div>
          
          <div>
            <label className="flex items-center">
              <input type="checkbox" className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded" />
              <span className="ml-2 text-sm text-gray-700">Generate regulatory submission-ready reports</span>
            </label>
          </div>
          
          <div>
            <label className="flex items-center">
              <input type="checkbox" className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded" checked />
              <span className="ml-2 text-sm text-gray-700">Share analysis with team members</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderInsights = () => {
    if (!selectedCSR) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No CSR Selected</h3>
          <p className="mt-1 text-sm text-gray-500">
            Select a CSR from the dashboard to view insights
          </p>
          <button 
            className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
            onClick={() => setActiveTab('dashboard')}
          >
            Go to Dashboard
          </button>
        </div>
      );
    }
    
    if (selectedCSR.status !== 'Analyzed') {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Analysis in Progress</h3>
          <p className="mt-1 text-sm text-gray-500">
            The analysis for this CSR is still being processed. Please check back later.
          </p>
          <div className="mt-4 w-full max-w-md mx-auto bg-gray-200 rounded-full h-2.5">
            <div className="bg-pink-600 h-2.5 rounded-full w-2/3"></div>
          </div>
          <p className="mt-2 text-sm text-gray-500">Estimated completion: 20 minutes</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold">{selectedCSR.title}</h2>
              <div className="flex items-center mt-1 text-sm text-gray-500">
                <span className="mr-3">{selectedCSR.sponsor}</span>
                <span className="mr-3">•</span>
                <span>{selectedCSR.indication}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center">
                <FileBarChart size={16} className="mr-1" />
                <span>View PDF</span>
              </button>
              <button className="px-3 py-1.5 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors flex items-center">
                <BarChart3 size={16} className="mr-1" />
                <span>Export Report</span>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="flex items-center mb-2">
                <CheckCircle size={20} className="text-green-600 mr-2" />
                <h3 className="font-medium">Efficacy Highlights</h3>
              </div>
              <ul className="space-y-2 text-sm">
                {selectedCSR.insights.efficacyHighlights.map((highlight, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
              <div className="flex items-center mb-2">
                <AlertTriangle size={20} className="text-yellow-600 mr-2" />
                <h3 className="font-medium">Safety Highlights</h3>
              </div>
              <ul className="space-y-2 text-sm">
                {selectedCSR.insights.safetyHighlights.map((highlight, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 pt-3 border-t border-yellow-200 flex items-center justify-between text-sm">
                <div>Adverse Events: {selectedCSR.insights.adverseEvents}</div>
                <div>Serious: {selectedCSR.insights.seriousEvents}</div>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center mb-2">
                <Info size={20} className="text-blue-600 mr-2" />
                <h3 className="font-medium">Study Overview</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Study Phase:</span>
                  <span className="font-medium">Phase 2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subjects Enrolled:</span>
                  <span className="font-medium">128</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Study Design:</span>
                  <span className="font-medium">Randomized, Double-blind</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Primary Endpoint:</span>
                  <span className="font-medium">Objective Response Rate</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-medium mb-2">AI-Generated Summary</h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-sm">
              <p>
                This Phase 2 study evaluated the efficacy and safety of XYZ-123 in patients with advanced solid tumors. 
                The study met its primary endpoint with an objective response rate (ORR) of 42% (95% CI: 33.5-50.8%). 
                Median progression-free survival was 8.2 months (95% CI: 6.9-9.7 months).
              </p>
              <p className="mt-2">
                The safety profile was consistent with previous studies. The most common treatment-related adverse events 
                included fatigue (28%), nausea (21%), and diarrhea (18%). Grade 3-4 adverse events occurred in 15% of patients, 
                with neutropenia (5%) being the most common. No treatment-related deaths were reported.
              </p>
              <p className="mt-2">
                Based on these results, the benefit-risk profile of XYZ-123 appears favorable for the indicated population, 
                supporting further development in a Phase 3 study.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-medium mb-4">Key Data Visualizations</h3>
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <BarChart3 size={48} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">Visualizations would appear here</p>
          </div>
        </div>
      </div>
    );
  };
  
  const renderReports = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Generated Reports</h2>
        <p className="text-gray-600 mb-6">
          View and download reports generated from your CSR analyses
        </p>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source CSR</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Generated</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FileBarChart size={16} className="text-pink-500 mr-2" />
                    <div className="text-sm font-medium text-gray-900">
                      Efficacy Analysis Report - XYZ-123
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">Clinical Study Report XYZ-123</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">2025-03-16</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Efficacy
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button className="text-blue-600 hover:text-blue-800 mr-3">View</button>
                  <button className="text-green-600 hover:text-green-800">Download</button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FileBarChart size={16} className="text-pink-500 mr-2" />
                    <div className="text-sm font-medium text-gray-900">
                      Safety Analysis Report - XYZ-123
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">Clinical Study Report XYZ-123</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">2025-03-16</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Safety
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button className="text-blue-600 hover:text-blue-800 mr-3">View</button>
                  <button className="text-green-600 hover:text-green-800">Download</button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FileBarChart size={16} className="text-pink-500 mr-2" />
                    <div className="text-sm font-medium text-gray-900">
                      Executive Summary - DEF-789
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">Clinical Study Report DEF-789</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">2025-01-06</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    Summary
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button className="text-blue-600 hover:text-blue-800 mr-3">View</button>
                  <button className="text-green-600 hover:text-green-800">Download</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Generate New Report</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source CSR
            </label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500">
              <option>Select a CSR</option>
              <option>Clinical Study Report XYZ-123</option>
              <option>Clinical Study Report DEF-789</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500">
              <option>Comprehensive Analysis</option>
              <option>Efficacy Analysis</option>
              <option>Safety Analysis</option>
              <option>Executive Summary</option>
              <option>Regulatory Submission</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Output Format
            </label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500">
              <option>PDF</option>
              <option>Word Document (DOCX)</option>
              <option>PowerPoint (PPTX)</option>
              <option>HTML</option>
            </select>
          </div>
          
          <div className="pt-4">
            <button className="w-full sm:w-auto px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors flex items-center justify-center">
              <Sparkles size={16} className="mr-2" />
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">CSR Intelligence™</h1>
      </div>
      
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px space-x-8">
          <Tab 
            label="Dashboard" 
            icon={BarChart3}
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <Tab 
            label="Analyze" 
            icon={Sparkles}
            active={activeTab === 'analyze'} 
            onClick={() => setActiveTab('analyze')} 
          />
          <Tab 
            label="Insights" 
            icon={BookOpen}
            active={activeTab === 'insights'} 
            onClick={() => setActiveTab('insights')} 
          />
          <Tab 
            label="Reports" 
            icon={FileBarChart}
            active={activeTab === 'reports'} 
            onClick={() => setActiveTab('reports')} 
          />
        </nav>
      </div>
      
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'analyze' && renderAnalyze()}
      {activeTab === 'insights' && renderInsights()}
      {activeTab === 'reports' && renderReports()}
    </div>
  );
};

export default CSRIntelligenceModule;