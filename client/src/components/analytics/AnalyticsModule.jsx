/**
 * Analytics Module Component
 * 
 * This component provides analytics and reporting capabilities for the TrialSage platform.
 */

import React, { useState } from 'react';
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  Calendar, 
  Download,
  Filter,
  Printer,
  RefreshCw
} from 'lucide-react';
import { useIntegration } from '../integration/ModuleIntegrationLayer';

const AnalyticsModule = () => {
  const { workflowService, docuShareService } = useIntegration();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Tabs configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
    { id: 'submissions', label: 'Submissions', icon: <PieChart size={16} /> },
    { id: 'workflows', label: 'Workflows', icon: <LineChart size={16} /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar size={16} /> }
  ];
  
  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };
  
  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'submissions':
        return renderSubmissions();
      case 'workflows':
        return renderWorkflows();
      case 'calendar':
        return renderCalendar();
      default:
        return renderOverview();
    }
  };
  
  // Overview tab content
  const renderOverview = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-5 border">
            <h3 className="font-medium text-gray-700 mb-3">Total Documents</h3>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-semibold">{docuShareService.getAllDocuments().length}</p>
              <div className="bg-blue-100 p-2 rounded-full">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-5 border">
            <h3 className="font-medium text-gray-700 mb-3">Active Workflows</h3>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-semibold">{workflowService.getActiveWorkflows().length}</p>
              <div className="bg-green-100 p-2 rounded-full">
                <LineChart className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-5 border">
            <h3 className="font-medium text-gray-700 mb-3">Completion Rate</h3>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-semibold">72%</p>
              <div className="bg-amber-100 p-2 rounded-full">
                <PieChart className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="font-medium">Activity Summary</h3>
            <div className="flex items-center space-x-2">
              <button className="p-1 rounded text-gray-500 hover:bg-gray-100">
                <RefreshCw size={16} />
              </button>
              <button className="p-1 rounded text-gray-500 hover:bg-gray-100">
                <Filter size={16} />
              </button>
              <button className="p-1 rounded text-gray-500 hover:bg-gray-100">
                <Download size={16} />
              </button>
              <button className="p-1 rounded text-gray-500 hover:bg-gray-100">
                <Printer size={16} />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="aspect-[2/1] bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Analytics chart will be displayed here</p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Submissions tab content
  const renderSubmissions = () => {
    return (
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-medium mb-4">Submissions Analytics</h3>
        <div className="aspect-[2/1] bg-gray-100 rounded-md flex items-center justify-center">
          <p className="text-gray-500">Submissions analytics chart will be displayed here</p>
        </div>
      </div>
    );
  };
  
  // Workflows tab content
  const renderWorkflows = () => {
    return (
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-medium mb-4">Workflow Analytics</h3>
        <div className="aspect-[2/1] bg-gray-100 rounded-md flex items-center justify-center">
          <p className="text-gray-500">Workflow analytics chart will be displayed here</p>
        </div>
      </div>
    );
  };
  
  // Calendar tab content
  const renderCalendar = () => {
    return (
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-medium mb-4">Calendar View</h3>
        <div className="aspect-[4/3] bg-gray-100 rounded-md flex items-center justify-center">
          <p className="text-gray-500">Calendar view will be displayed here</p>
        </div>
      </div>
    );
  };
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">
          Insights and reporting for your regulatory activities
        </p>
      </div>
      
      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => handleTabChange(tab.id)}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Tab content */}
      <div>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AnalyticsModule;