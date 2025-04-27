/**
 * IND Wizard Module
 * 
 * This component provides the IND Wizard™ module for the TrialSage platform,
 * helping users manage and prepare Investigational New Drug applications.
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Layers, 
  CheckCircle, 
  Clock, 
  Calendar, 
  ArrowRight,
  FileSearch,
  Settings,
  Users,
  Database
} from 'lucide-react';
import { useIntegration } from '../integration/ModuleIntegrationLayer';

const INDWizardModule = () => {
  const { workflowService, docuShareService } = useIntegration();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [recentINDs, setRecentINDs] = useState([]);
  const [activeWorkflows, setActiveWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Load module data
  useEffect(() => {
    const loadModuleData = async () => {
      try {
        setLoading(true);
        
        // Get recent IND documents
        const documents = docuShareService.getDocumentsByCategory('IND');
        setRecentINDs(documents);
        
        // Get active IND workflows
        const workflows = workflowService.getWorkflowsByModule('ind-wizard');
        setActiveWorkflows(workflows);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading IND Wizard data:', error);
        setLoading(false);
      }
    };
    
    loadModuleData();
  }, [docuShareService, workflowService]);
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Calculate progress bar width
  const getProgressWidth = (progress) => {
    return `${Math.round(progress * 100)}%`;
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">IND Wizard™ Dashboard</h2>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active IND Submissions */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-primary-light px-4 py-3 border-b">
                    <h3 className="font-semibold text-primary">Active IND Submissions</h3>
                  </div>
                  
                  <div className="p-4">
                    {activeWorkflows.length > 0 ? (
                      <div className="space-y-5">
                        {activeWorkflows.map((workflow) => (
                          <div key={workflow.id} className="border rounded-md p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-semibold">{workflow.name}</h4>
                                <p className="text-sm text-gray-500">
                                  Started: {formatDate(workflow.startDate)}
                                </p>
                              </div>
                              <span className={`text-sm px-2 py-1 rounded ${
                                workflow.status === 'Completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : workflow.status === 'In Progress'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                              }`}>
                                {workflow.status}
                              </span>
                            </div>
                            
                            <div className="mb-2">
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="bg-primary h-2.5 rounded-full" 
                                  style={{ width: getProgressWidth(workflow.progress) }}
                                ></div>
                              </div>
                            </div>
                            
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>
                                {Math.round(workflow.progress * 100)}% Complete
                              </span>
                              <span>
                                Target: {formatDate(workflow.targetCompletionDate)}
                              </span>
                            </div>
                            
                            <button className="mt-3 flex items-center text-sm text-primary hover:text-primary-dark">
                              <span>View Details</span>
                              <ArrowRight size={14} className="ml-1" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <FileText size={40} className="mx-auto mb-2 text-gray-400" />
                        <p>No active IND submissions</p>
                        <button className="mt-2 text-primary hover:text-primary-dark text-sm">
                          Start a New IND Submission
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Recent IND Documents */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-primary-light px-4 py-3 border-b">
                    <h3 className="font-semibold text-primary">Recent IND Documents</h3>
                  </div>
                  
                  <div className="p-4">
                    {recentINDs.length > 0 ? (
                      <div className="space-y-3">
                        {recentINDs.map((document) => (
                          <div 
                            key={document.id} 
                            className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                          >
                            <div className="mr-3 text-gray-400">
                              <FileText size={20} />
                            </div>
                            
                            <div className="flex-1">
                              <h4 className="font-medium">{document.title}</h4>
                              <div className="flex items-center text-xs text-gray-500">
                                <span className="mr-3">
                                  Updated: {formatDate(document.updatedAt)}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded ${
                                  document.status === 'Final' 
                                    ? 'bg-green-100 text-green-800' 
                                    : document.status === 'Draft'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {document.status}
                                </span>
                              </div>
                            </div>
                            
                            {document.verified && (
                              <div className="ml-2 text-green-500" title="Blockchain Verified">
                                <CheckCircle size={16} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <Layers size={40} className="mx-auto mb-2 text-gray-400" />
                        <p>No recent IND documents</p>
                        <button className="mt-2 text-primary hover:text-primary-dark text-sm">
                          Create a New IND Document
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      
      case 'forms':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">FDA Forms</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* FDA Form 1571 */}
              <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start">
                  <div className="p-2 bg-blue-100 rounded-md text-blue-700 mr-3">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">FDA Form 1571</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Investigational New Drug Application (IND) Cover Sheet
                    </p>
                  </div>
                </div>
              </div>
              
              {/* FDA Form 1572 */}
              <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start">
                  <div className="p-2 bg-blue-100 rounded-md text-blue-700 mr-3">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">FDA Form 1572</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Statement of Investigator
                    </p>
                  </div>
                </div>
              </div>
              
              {/* FDA Form 3926 */}
              <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start">
                  <div className="p-2 bg-blue-100 rounded-md text-blue-700 mr-3">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">FDA Form 3926</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Individual Patient Expanded Access IND Application
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Recent Forms</h3>
              
              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Form Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Updated
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">FDA Form 1571</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">Project XYZ</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Draft
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        April 15, 2025
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">FDA Form 1572</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">Project ABC</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Completed
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        April 10, 2025
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
        
      case 'templates':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">IND Templates</h2>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">IND Module Templates</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Template 1 */}
                <div className="border rounded-lg p-4 hover:border-primary hover:bg-primary-light/20 cursor-pointer transition-colors">
                  <h4 className="font-medium mb-2">Module 1: Administrative Information</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Templates for FDA forms and administrative documents required for IND submission.
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock size={14} className="mr-1" />
                    <span>Updated April 2025</span>
                  </div>
                </div>
                
                {/* Template 2 */}
                <div className="border rounded-lg p-4 hover:border-primary hover:bg-primary-light/20 cursor-pointer transition-colors">
                  <h4 className="font-medium mb-2">Module 2: Clinical Protocol</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Templates for clinical protocol development according to ICH guidelines.
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock size={14} className="mr-1" />
                    <span>Updated March 2025</span>
                  </div>
                </div>
                
                {/* Template 3 */}
                <div className="border rounded-lg p-4 hover:border-primary hover:bg-primary-light/20 cursor-pointer transition-colors">
                  <h4 className="font-medium mb-2">Module 3: CMC</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Templates for Chemistry, Manufacturing, and Controls section.
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock size={14} className="mr-1" />
                    <span>Updated February 2025</span>
                  </div>
                </div>
                
                {/* Template 4 */}
                <div className="border rounded-lg p-4 hover:border-primary hover:bg-primary-light/20 cursor-pointer transition-colors">
                  <h4 className="font-medium mb-2">Module 4: Nonclinical</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Templates for nonclinical pharmacology and toxicology reports.
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock size={14} className="mr-1" />
                    <span>Updated January 2025</span>
                  </div>
                </div>
                
                {/* Template 5 */}
                <div className="border rounded-lg p-4 hover:border-primary hover:bg-primary-light/20 cursor-pointer transition-colors">
                  <h4 className="font-medium mb-2">Module 5: Clinical</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Templates for clinical study reports and case report forms.
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock size={14} className="mr-1" />
                    <span>Updated March 2025</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Workflow Templates</h3>
              
              <div className="space-y-4">
                {/* Workflow Template 1 */}
                <div className="border rounded-lg p-4 hover:border-primary cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">IND Submission Workflow</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Comprehensive workflow for preparing and submitting an IND application.
                      </p>
                    </div>
                    <button className="text-primary hover:text-primary-dark text-sm">
                      Use Template
                    </button>
                  </div>
                </div>
                
                {/* Workflow Template 2 */}
                <div className="border rounded-lg p-4 hover:border-primary cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">IND Amendment Workflow</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Workflow for preparing and submitting amendments to an existing IND.
                      </p>
                    </div>
                    <button className="text-primary hover:text-primary-dark text-sm">
                      Use Template
                    </button>
                  </div>
                </div>
                
                {/* Workflow Template 3 */}
                <div className="border rounded-lg p-4 hover:border-primary cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">Pre-IND Meeting Workflow</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Workflow for preparing and conducting pre-IND meetings with FDA.
                      </p>
                    </div>
                    <button className="text-primary hover:text-primary-dark text-sm">
                      Use Template
                    </button>
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
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-primary-light px-4 py-3 border-b">
                    <h3 className="font-semibold text-primary">FDA Guidance Documents</h3>
                  </div>
                  
                  <div className="p-4">
                    <div className="mb-4">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FileSearch size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                          placeholder="Search guidance documents..."
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Guidance Document 1 */}
                      <div className="border rounded-md p-4">
                        <h4 className="font-medium">IND Application Guidelines</h4>
                        <p className="text-sm text-gray-600 mt-1 mb-2">
                          Guidelines for preparing and submitting Investigational New Drug (IND) applications.
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar size={14} className="mr-1" />
                            <span>January 15, 2024</span>
                          </div>
                          <a 
                            href="https://www.fda.gov/regulatory-information/search-fda-guidance-documents" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary-dark text-sm"
                          >
                            View Document
                          </a>
                        </div>
                      </div>
                      
                      {/* Guidance Document 2 */}
                      <div className="border rounded-md p-4">
                        <h4 className="font-medium">ICH E6(R3) Good Clinical Practice</h4>
                        <p className="text-sm text-gray-600 mt-1 mb-2">
                          Updated guidelines for the conduct of clinical trials of investigational products.
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar size={14} className="mr-1" />
                            <span>December 1, 2023</span>
                          </div>
                          <a 
                            href="https://www.fda.gov/regulatory-information/search-fda-guidance-documents" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary-dark text-sm"
                          >
                            View Document
                          </a>
                        </div>
                      </div>
                      
                      {/* Guidance Document 3 */}
                      <div className="border rounded-md p-4">
                        <h4 className="font-medium">Clinical Trial Application Process</h4>
                        <p className="text-sm text-gray-600 mt-1 mb-2">
                          Guidance on the Clinical Trials Information System (CTIS) and application process.
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar size={14} className="mr-1" />
                            <span>February 10, 2024</span>
                          </div>
                          <a 
                            href="https://www.ema.europa.eu/en/human-regulatory/research-development/clinical-trials" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary-dark text-sm"
                          >
                            View Document
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-primary-light px-4 py-3 border-b">
                    <h3 className="font-semibold text-primary">Regulatory Updates</h3>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    {/* Update 1 */}
                    <div className="border-b pb-3">
                      <h4 className="font-medium text-sm">FDA Announces New Fast Track Process</h4>
                      <p className="text-xs text-gray-600 my-1">
                        FDA has introduced a streamlined fast track review process for certain indications.
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar size={12} className="mr-1" />
                        <span>April 10, 2025</span>
                      </div>
                    </div>
                    
                    {/* Update 2 */}
                    <div className="border-b pb-3">
                      <h4 className="font-medium text-sm">EMA Guidance on Clinical Trial Design</h4>
                      <p className="text-xs text-gray-600 my-1">
                        New guidance on adaptive clinical trial designs published by EMA.
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar size={12} className="mr-1" />
                        <span>March 25, 2025</span>
                      </div>
                    </div>
                    
                    {/* Update 3 */}
                    <div>
                      <h4 className="font-medium text-sm">ICH E6(R3) Implementation Timeline</h4>
                      <p className="text-xs text-gray-600 my-1">
                        Updated timeline for implementation of ICH E6(R3) Good Clinical Practice.
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar size={12} className="mr-1" />
                        <span>March 15, 2025</span>
                      </div>
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
            activeTab === 'forms'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('forms')}
        >
          FDA Forms
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
            activeTab === 'submissions'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('submissions')}
        >
          Submissions
        </button>
      </div>
      
      {/* Tab content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default INDWizardModule;