/**
 * CSR Intelligence Module
 * 
 * This component provides the CSR Intelligence™ module for the TrialSage platform,
 * helping users manage and create Clinical Study Reports.
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  FilePlus, 
  Search, 
  BookOpen, 
  BarChart2, 
  ArrowRight,
  CheckCircle,
  Clock,
  Calendar,
  Layers,
  AlertCircle,
  BookOpen as Report,
  FileSearch,
  BarChart,
  Shuffle,
  PieChart,
  ChevronDown,
  ChevronUp,
  Zap,
  Lightbulb
} from 'lucide-react';
import { useIntegration } from '../integration/ModuleIntegrationLayer';

const CSRIntelligenceModule = () => {
  const { docuShareService, regulatoryCore } = useIntegration();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [csrDocuments, setCSRDocuments] = useState([]);
  const [insightsPanelOpen, setInsightsPanelOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  
  // Load module data
  useEffect(() => {
    const loadModuleData = async () => {
      try {
        setLoading(true);
        
        // Get CSR documents
        const documents = docuShareService.getDocumentsByCategory('CSR');
        setCSRDocuments(documents);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading CSR Intelligence data:', error);
        setLoading(false);
      }
    };
    
    loadModuleData();
  }, [docuShareService]);
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Toggle insights panel
  const toggleInsightsPanel = () => {
    setInsightsPanelOpen(!insightsPanelOpen);
  };
  
  // Mock examples of CSR insights
  const csrInsights = [
    {
      id: 'insight-1',
      type: 'compliance',
      title: 'ICH E3 Compliance',
      description: 'CSR structure follows ICH E3 guidelines. All required sections are present.',
      score: 95,
      recommendation: 'Consider adding more detail to the study objectives section for improved clarity.'
    },
    {
      id: 'insight-2',
      type: 'structure',
      title: 'Structural Consistency',
      description: 'Section headings and numbering format are consistent throughout the document.',
      score: 90,
      recommendation: 'Standardize table and figure numbering formats for better consistency.'
    },
    {
      id: 'insight-3',
      type: 'content',
      title: 'Statistical Analysis',
      description: 'Statistical methods are well-documented with appropriate references.',
      score: 85,
      recommendation: 'Include more detailed explanation of outlier handling methodology.'
    }
  ];
  
  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Main content area */}
            <div className="xl:col-span-3 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">CSR Intelligence™ Dashboard</h2>
                
                <button className="flex items-center bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark">
                  <FilePlus size={16} className="mr-2" />
                  Create New CSR
                </button>
              </div>
              
              {/* Recent CSRs */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-primary-light px-4 py-3 border-b">
                  <h3 className="font-semibold text-primary">Recent Clinical Study Reports</h3>
                </div>
                
                <div className="p-4">
                  {loading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : csrDocuments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Study ID
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Compliance
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Last Updated
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {csrDocuments.map((document) => (
                            <tr key={document.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 text-gray-400">
                                    <FileText size={18} />
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">
                                      {document.title}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Author: {document.createdBy}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                XYZ-123
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  document.status === 'Final' 
                                    ? 'bg-green-100 text-green-800' 
                                    : document.status === 'Draft'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {document.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '95%' }}></div>
                                  </div>
                                  <span className="text-xs text-gray-600">95%</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(document.updatedAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <button className="text-primary hover:text-primary-dark flex items-center">
                                  <span>Open</span>
                                  <ArrowRight size={14} className="ml-1" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText size={40} className="mx-auto mb-2 text-gray-400" />
                      <p>No CSR documents found</p>
                      <button className="mt-2 text-primary hover:text-primary-dark text-sm">
                        Create your first CSR
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Statistics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center mb-3">
                    <div className="p-2 bg-blue-100 rounded-md text-blue-600 mr-3">
                      <BookOpen size={20} />
                    </div>
                    <h3 className="font-semibold">CSR Metrics</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Total CSRs</span>
                        <span className="font-medium">{csrDocuments.length}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Completed</span>
                        <span className="font-medium">{csrDocuments.filter(d => d.status === 'Final').length}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">In Progress</span>
                        <span className="font-medium">{csrDocuments.filter(d => d.status !== 'Final').length}</span>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${csrDocuments.filter(d => d.status === 'Final').length / Math.max(csrDocuments.length, 1) * 100}%` }}></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 text-right">
                        {Math.round(csrDocuments.filter(d => d.status === 'Final').length / Math.max(csrDocuments.length, 1) * 100)}% Completion Rate
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center mb-3">
                    <div className="p-2 bg-green-100 rounded-md text-green-600 mr-3">
                      <CheckCircle size={20} />
                    </div>
                    <h3 className="font-semibold">Compliance</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">ICH E3 Compliance</span>
                      <span className="text-sm font-medium">95%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '95%' }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-500">Structural Integrity</span>
                      <span className="text-sm font-medium">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-500">Content Completeness</span>
                      <span className="text-sm font-medium">88%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '88%' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center mb-3">
                    <div className="p-2 bg-purple-100 rounded-md text-purple-600 mr-3">
                      <Clock size={20} />
                    </div>
                    <h3 className="font-semibold">Timelines</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Avg. Completion Time</span>
                        <span className="font-medium">45 days</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Fastest Completion</span>
                        <span className="font-medium">28 days</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Currently In Progress</span>
                        <span className="font-medium">3 CSRs</span>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <div className="text-xs text-gray-500 flex items-center">
                        <Calendar size={14} className="mr-1" />
                        <span>Next due: May 15, 2025</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-primary-light px-4 py-3 border-b">
                  <h3 className="font-semibold text-primary">Recent Activity</h3>
                </div>
                
                <div className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="p-2 bg-blue-100 rounded-full text-blue-600 mr-3">
                        <FileText size={16} />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">CSR XYZ-123 Updated</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Robert Chen updated Statistical Analysis section
                        </p>
                        <div className="text-xs text-gray-400 mt-1">
                          Today at 10:30 AM
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="p-2 bg-green-100 rounded-full text-green-600 mr-3">
                        <CheckCircle size={16} />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">CSR ABC-456 Completed</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Final version approved by Jane Doe
                        </p>
                        <div className="text-xs text-gray-400 mt-1">
                          Yesterday at 3:45 PM
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="p-2 bg-purple-100 rounded-full text-purple-600 mr-3">
                        <AlertCircle size={16} />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Compliance Alert</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Missing safety information in CSR DEF-789
                        </p>
                        <div className="text-xs text-gray-400 mt-1">
                          April 24, 2025 at 9:20 AM
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Insights panel */}
            <div className="xl:col-span-1 bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-primary-light px-4 py-3 border-b flex items-center justify-between">
                <h3 className="font-semibold text-primary flex items-center">
                  <Lightbulb size={16} className="mr-2" />
                  CSR Insights
                </h3>
                <button 
                  className="text-gray-500 hover:text-gray-700" 
                  onClick={toggleInsightsPanel}
                >
                  {insightsPanelOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
              
              {insightsPanelOpen && (
                <div className="p-4">
                  <div className="space-y-4">
                    {csrInsights.map((insight) => (
                      <div key={insight.id} className="border rounded-md p-3">
                        <div className="flex items-center mb-2">
                          <div className={`p-1.5 rounded-full mr-2 ${
                            insight.type === 'compliance' 
                              ? 'bg-blue-100 text-blue-600' 
                              : insight.type === 'structure'
                                ? 'bg-purple-100 text-purple-600'
                                : 'bg-green-100 text-green-600'
                          }`}>
                            {insight.type === 'compliance' 
                              ? <BookOpen size={14} /> 
                              : insight.type === 'structure'
                                ? <Layers size={14} />
                                : <BarChart size={14} />
                            }
                          </div>
                          <h4 className="text-sm font-medium">{insight.title}</h4>
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-2">
                          {insight.description}
                        </p>
                        
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">Score</span>
                          <span className="text-xs font-medium">{insight.score}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                          <div 
                            className={`h-1.5 rounded-full ${
                              insight.score >= 90 
                                ? 'bg-green-500' 
                                : insight.score >= 80 
                                  ? 'bg-yellow-500' 
                                  : 'bg-red-500'
                            }`} 
                            style={{ width: `${insight.score}%` }}
                          ></div>
                        </div>
                        
                        <div className="text-xs bg-gray-50 p-2 rounded border border-gray-100">
                          <div className="font-medium text-gray-700 mb-1 flex items-center">
                            <Zap size={12} className="text-primary mr-1" />
                            Recommendation
                          </div>
                          <div className="text-gray-600">
                            {insight.recommendation}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button className="mt-4 w-full text-center text-xs text-primary hover:text-primary-dark font-medium py-2 border border-primary border-dashed rounded-md">
                    View All Insights
                  </button>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'templates':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">CSR Templates</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Template 1 */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-2 bg-blue-500"></div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-2">ICH E3 Standard Template</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Complete CSR template following ICH E3 guidelines. Includes all required sections and appendices.
                  </p>
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <Clock size={14} className="mr-1" />
                    <span>Updated April 2025</span>
                  </div>
                  <button className="w-full bg-blue-50 text-blue-600 font-medium py-2 rounded hover:bg-blue-100 transition-colors">
                    Use Template
                  </button>
                </div>
              </div>
              
              {/* Template 2 */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-2 bg-purple-500"></div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-2">Abbreviated CSR Template</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Streamlined CSR template for abbreviated reports. Focuses on essential elements for faster completion.
                  </p>
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <Clock size={14} className="mr-1" />
                    <span>Updated March 2025</span>
                  </div>
                  <button className="w-full bg-purple-50 text-purple-600 font-medium py-2 rounded hover:bg-purple-100 transition-colors">
                    Use Template
                  </button>
                </div>
              </div>
              
              {/* Template 3 */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-2 bg-green-500"></div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-2">Pediatric Study Template</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Specialized CSR template for pediatric clinical trials. Includes sections specific to pediatric studies.
                  </p>
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <Clock size={14} className="mr-1" />
                    <span>Updated February 2025</span>
                  </div>
                  <button className="w-full bg-green-50 text-green-600 font-medium py-2 rounded hover:bg-green-100 transition-colors">
                    Use Template
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Section Templates</h3>
              
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Template Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Updated
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">Statistical Analysis Section</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">Comprehensive statistical analysis template with standard tables and figures</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        April 5, 2025
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-primary hover:text-primary-dark">Use Template</button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">Safety Assessment Section</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">Detailed safety and pharmacovigilance reporting template</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        March 22, 2025
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-primary hover:text-primary-dark">Use Template</button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">Study Design Section</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">Detailed study design section with diagrams and schedules</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        February 18, 2025
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-primary hover:text-primary-dark">Use Template</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
        
      case 'analytics':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">CSR Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-gray-500 text-sm">Total CSRs</div>
                  <div className="p-1.5 bg-blue-100 rounded-md text-blue-500">
                    <FileText size={16} />
                  </div>
                </div>
                <div className="text-2xl font-bold">24</div>
                <div className="text-xs text-green-500 flex items-center mt-1">
                  <span>↑ 12% from last quarter</span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-gray-500 text-sm">Avg. Completion Time</div>
                  <div className="p-1.5 bg-purple-100 rounded-md text-purple-500">
                    <Clock size={16} />
                  </div>
                </div>
                <div className="text-2xl font-bold">45 days</div>
                <div className="text-xs text-green-500 flex items-center mt-1">
                  <span>↓ 5 days improvement</span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-gray-500 text-sm">Compliance Score</div>
                  <div className="p-1.5 bg-green-100 rounded-md text-green-500">
                    <CheckCircle size={16} />
                  </div>
                </div>
                <div className="text-2xl font-bold">92%</div>
                <div className="text-xs text-green-500 flex items-center mt-1">
                  <span>↑ 3% improvement</span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-gray-500 text-sm">AI-Assisted Edits</div>
                  <div className="p-1.5 bg-yellow-100 rounded-md text-yellow-500">
                    <Zap size={16} />
                  </div>
                </div>
                <div className="text-2xl font-bold">358</div>
                <div className="text-xs text-green-500 flex items-center mt-1">
                  <span>Saved ~120 hours</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center">
                  <BarChart2 size={18} className="text-primary mr-2" />
                  CSR Completion Statistics
                </h3>
                
                <div className="h-64 flex items-center justify-center border rounded">
                  <div className="text-center text-gray-500">
                    <BarChart size={32} className="mx-auto mb-2 text-gray-400" />
                    <p>Bar chart visualization would appear here</p>
                    <p className="text-xs mt-1">Showing monthly CSR completions</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center">
                  <PieChart size={18} className="text-primary mr-2" />
                  CSR Status Distribution
                </h3>
                
                <div className="h-64 flex items-center justify-center border rounded">
                  <div className="text-center text-gray-500">
                    <PieChart size={32} className="mx-auto mb-2 text-gray-400" />
                    <p>Pie chart visualization would appear here</p>
                    <p className="text-xs mt-1">Showing status distribution of CSRs</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
                <h3 className="font-semibold text-lg mb-4 flex items-center">
                  <Shuffle size={18} className="text-primary mr-2" />
                  CSR Compliance Trends
                </h3>
                
                <div className="h-64 flex items-center justify-center border rounded">
                  <div className="text-center text-gray-500">
                    <BarChart size={32} className="mx-auto mb-2 text-gray-400" />
                    <p>Line chart visualization would appear here</p>
                    <p className="text-xs mt-1">Showing compliance score trends over time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'guidance':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Regulatory Guidance</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                  <div className="bg-primary-light px-4 py-3 border-b">
                    <h3 className="font-semibold text-primary">ICH E3 Guidance</h3>
                  </div>
                  
                  <div className="p-4">
                    <div className="prose max-w-none">
                      <p>
                        The ICH E3 guideline provides guidance on the structure and content of clinical study reports (CSRs).
                        Below are key elements that should be included in compliant CSRs:
                      </p>
                      
                      <h4 className="text-lg font-medium mt-4 mb-2">Synopsis</h4>
                      <p>
                        A brief overview of the study and its results, typically limited to 3-5 pages.
                        Should include study objectives, methodology, results, and conclusions.
                      </p>
                      
                      <h4 className="text-lg font-medium mt-4 mb-2">Ethics</h4>
                      <p>
                        Description of ethical considerations, including IRB/EC approval and informed consent procedures.
                      </p>
                      
                      <h4 className="text-lg font-medium mt-4 mb-2">Investigators and Study Administration</h4>
                      <p>
                        Information on study investigators, administrative structure, and investigator responsibilities.
                      </p>
                      
                      <h4 className="text-lg font-medium mt-4 mb-2">Study Objectives</h4>
                      <p>
                        Clear statement of the primary and secondary objectives of the study.
                      </p>
                      
                      <h4 className="text-lg font-medium mt-4 mb-2">Investigational Plan</h4>
                      <p>
                        Detailed description of study design, treatments, selection of study population, 
                        and methods of observation and analysis.
                      </p>
                      
                      <h4 className="text-lg font-medium mt-4 mb-2">Study Patients</h4>
                      <p>
                        Description of patient disposition, protocol deviations, and demographic and baseline characteristics.
                      </p>
                      
                      <h4 className="text-lg font-medium mt-4 mb-2">Efficacy and Safety Evaluations</h4>
                      <p>
                        Comprehensive analysis of efficacy and safety data, including statistical analyses and individual responses.
                      </p>
                      
                      <h4 className="text-lg font-medium mt-4 mb-2">References</h4>
                      <p>
                        List of publications and unpublished reports referenced in the CSR.
                      </p>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <a href="#" className="text-primary hover:text-primary-dark font-medium">
                        Download Full ICH E3 Guidelines
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-primary-light px-4 py-3 border-b">
                    <h3 className="font-semibold text-primary">CSR Checklist</h3>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input type="checkbox" className="h-4 w-4 text-primary border-gray-300 rounded" checked readOnly />
                        <label className="ml-2 text-sm text-gray-700">Title page includes protocol title, dates, sponsor name, and appropriate signatures</label>
                      </div>
                      
                      <div className="flex items-center">
                        <input type="checkbox" className="h-4 w-4 text-primary border-gray-300 rounded" checked readOnly />
                        <label className="ml-2 text-sm text-gray-700">Synopsis provides concise summary of study methods and results</label>
                      </div>
                      
                      <div className="flex items-center">
                        <input type="checkbox" className="h-4 w-4 text-primary border-gray-300 rounded" checked readOnly />
                        <label className="ml-2 text-sm text-gray-700">Table of contents lists all sections, tables, figures, and appendices</label>
                      </div>
                      
                      <div className="flex items-center">
                        <input type="checkbox" className="h-4 w-4 text-primary border-gray-300 rounded" checked readOnly />
                        <label className="ml-2 text-sm text-gray-700">Ethics section describes IRB/EC approval and informed consent</label>
                      </div>
                      
                      <div className="flex items-center">
                        <input type="checkbox" className="h-4 w-4 text-primary border-gray-300 rounded" checked readOnly />
                        <label className="ml-2 text-sm text-gray-700">Study objectives clearly stated and aligned with protocol</label>
                      </div>
                      
                      <div className="flex items-center">
                        <input type="checkbox" className="h-4 w-4 text-primary border-gray-300 rounded" checked readOnly />
                        <label className="ml-2 text-sm text-gray-700">Investigational plan details study design, treatments, and methods</label>
                      </div>
                      
                      <div className="flex items-center">
                        <input type="checkbox" className="h-4 w-4 text-primary border-gray-300 rounded" />
                        <label className="ml-2 text-sm text-gray-700">Statistical methods described and appropriate</label>
                      </div>
                      
                      <div className="flex items-center">
                        <input type="checkbox" className="h-4 w-4 text-primary border-gray-300 rounded" />
                        <label className="ml-2 text-sm text-gray-700">Efficacy results include all primary and secondary endpoints</label>
                      </div>
                      
                      <div className="flex items-center">
                        <input type="checkbox" className="h-4 w-4 text-primary border-gray-300 rounded" />
                        <label className="ml-2 text-sm text-gray-700">Safety results include all adverse events and appropriate analyses</label>
                      </div>
                      
                      <div className="flex items-center">
                        <input type="checkbox" className="h-4 w-4 text-primary border-gray-300 rounded" />
                        <label className="ml-2 text-sm text-gray-700">Discussion and conclusions accurately reflect study results</label>
                      </div>
                    </div>
                    
                    <button className="mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm">
                      Download Printable Checklist
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                  <div className="bg-primary-light px-4 py-3 border-b">
                    <h3 className="font-semibold text-primary">Recent Regulatory Updates</h3>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-4">
                      <div className="border-b pb-3">
                        <h4 className="font-medium text-sm">FDA's Modern Approach to CSRs</h4>
                        <p className="text-xs text-gray-600 my-1">
                          FDA has updated guidelines for electronic submission of CSRs with new technical specifications.
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar size={12} className="mr-1" />
                          <span>April 15, 2025</span>
                        </div>
                      </div>
                      
                      <div className="border-b pb-3">
                        <h4 className="font-medium text-sm">EMA's Transparency Initiative</h4>
                        <p className="text-xs text-gray-600 my-1">
                          EMA has expanded requirements for transparency in clinical trial reporting and CSR publications.
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar size={12} className="mr-1" />
                          <span>March 22, 2025</span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm">ICH E3(R1) Draft Published</h4>
                        <p className="text-xs text-gray-600 my-1">
                          ICH has released a draft revision to the E3 guideline, open for public comment until June 2025.
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar size={12} className="mr-1" />
                          <span>February 28, 2025</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-primary-light px-4 py-3 border-b">
                    <h3 className="font-semibold text-primary">Resources</h3>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-3">
                      <a href="#" className="flex items-center p-2 hover:bg-gray-50 rounded">
                        <div className="p-1.5 bg-red-100 rounded-md text-red-600 mr-3">
                          <FileText size={16} />
                        </div>
                        <div>
                          <div className="text-sm font-medium">ICH E3 Guidelines (PDF)</div>
                          <div className="text-xs text-gray-500">Official ICH document</div>
                        </div>
                      </a>
                      
                      <a href="#" className="flex items-center p-2 hover:bg-gray-50 rounded">
                        <div className="p-1.5 bg-blue-100 rounded-md text-blue-600 mr-3">
                          <FileText size={16} />
                        </div>
                        <div>
                          <div className="text-sm font-medium">FDA CSR Guidance</div>
                          <div className="text-xs text-gray-500">FDA-specific guidelines</div>
                        </div>
                      </a>
                      
                      <a href="#" className="flex items-center p-2 hover:bg-gray-50 rounded">
                        <div className="p-1.5 bg-purple-100 rounded-md text-purple-600 mr-3">
                          <BookOpen size={16} />
                        </div>
                        <div>
                          <div className="text-sm font-medium">CSR Writing Best Practices</div>
                          <div className="text-xs text-gray-500">Industry best practices guide</div>
                        </div>
                      </a>
                      
                      <a href="#" className="flex items-center p-2 hover:bg-gray-50 rounded">
                        <div className="p-1.5 bg-green-100 rounded-md text-green-600 mr-3">
                          <FileSearch size={16} />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Common Deficiencies in CSRs</div>
                          <div className="text-xs text-gray-500">Review by regulatory authorities</div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="p-6 text-center text-gray-500">
            <p>Tab content not found.</p>
          </div>
        );
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Module navigation tabs */}
      <div className="bg-white border-b px-6 flex space-x-6 overflow-x-auto">
        <button
          className={`py-4 border-b-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        
        <button
          className={`py-4 border-b-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'templates'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('templates')}
        >
          Templates
        </button>
        
        <button
          className={`py-4 border-b-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
        
        <button
          className={`py-4 border-b-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'guidance'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('guidance')}
        >
          Regulatory Guidance
        </button>
        
        <button
          className={`py-4 border-b-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'editor'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('editor')}
        >
          CSR Editor
        </button>
      </div>
      
      {/* Tab content */}
      <div className="flex-1 overflow-auto bg-gray-50 px-6 py-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CSRIntelligenceModule;