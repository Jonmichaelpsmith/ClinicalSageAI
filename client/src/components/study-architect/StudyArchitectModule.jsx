/**
 * Study Architect Module Component
 * 
 * This component provides the Study Architect interface for the TrialSage platform,
 * allowing users to design and manage clinical trial study protocols.
 */

import React, { useState } from 'react';
import { 
  FileSymlink, 
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Download,
  Copy,
  Edit,
  Trash2
} from 'lucide-react';
import { useIntegration } from '../integration/ModuleIntegrationLayer';

const StudyArchitectModule = () => {
  const { docuShareService } = useIntegration();
  const [activeTab, setActiveTab] = useState('protocols');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock protocols data
  const protocols = [
    {
      id: 'protocol-001',
      title: 'Phase II Study of XYZ-123 in Advanced Solid Tumors',
      status: 'Draft',
      version: '1.2',
      updatedAt: '2025-04-20T14:30:00Z',
      updatedBy: 'John Smith',
      studyPhase: 'Phase II',
      indication: 'Oncology'
    },
    {
      id: 'protocol-002',
      title: 'Phase III Study of ABC-456 in Type 2 Diabetes',
      status: 'Final',
      version: '2.0',
      updatedAt: '2025-04-15T10:15:00Z',
      updatedBy: 'Jane Doe',
      studyPhase: 'Phase III',
      indication: 'Diabetes'
    },
    {
      id: 'protocol-003',
      title: 'Phase I Study of DEF-789 in Healthy Volunteers',
      status: 'In Review',
      version: '0.9',
      updatedAt: '2025-04-22T09:45:00Z',
      updatedBy: 'Robert Chen',
      studyPhase: 'Phase I',
      indication: 'Healthy Volunteers'
    }
  ];
  
  // Tabs configuration
  const tabs = [
    { id: 'protocols', label: 'Study Protocols' },
    { id: 'templates', label: 'Protocol Templates' },
    { id: 'endpoints', label: 'Endpoint Library' },
    { id: 'statistics', label: 'Statistical Analysis' }
  ];
  
  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Filter protocols based on search query
  const filteredProtocols = protocols.filter(protocol => 
    protocol.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    protocol.indication.toLowerCase().includes(searchQuery.toLowerCase()) ||
    protocol.studyPhase.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Draft':
        return 'bg-blue-100 text-blue-800';
      case 'In Review':
        return 'bg-amber-100 text-amber-800';
      case 'Final':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'protocols':
        return renderProtocols();
      case 'templates':
        return renderTemplates();
      case 'endpoints':
        return renderEndpoints();
      case 'statistics':
        return renderStatistics();
      default:
        return renderProtocols();
    }
  };
  
  // Protocols tab content
  const renderProtocols = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="font-medium">Study Protocols</h3>
            <button className="py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center text-sm">
              <Plus className="h-4 w-4 mr-1" />
              New Protocol
            </button>
          </div>
          
          <div className="p-6">
            <div className="flex justify-between mb-4">
              <div className="relative max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="Search protocols..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              
              <button className="flex items-center text-sm text-gray-600">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Protocol Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phase
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Version
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProtocols.map((protocol) => (
                    <tr key={protocol.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <FileSymlink className="h-5 w-5 text-primary mr-3" />
                          <div>
                            <div className="font-medium text-gray-900">{protocol.title}</div>
                            <div className="text-xs text-gray-500">{protocol.indication}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(protocol.status)}`}>
                          {protocol.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {protocol.studyPhase}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        v{protocol.version}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(protocol.updatedAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          by {protocol.updatedBy}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button className="text-gray-500 hover:text-gray-700">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-gray-500 hover:text-gray-700">
                            <Copy className="h-4 w-4" />
                          </button>
                          <button className="text-gray-500 hover:text-gray-700">
                            <Download className="h-4 w-4" />
                          </button>
                          <button className="text-red-500 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredProtocols.length === 0 && (
              <div className="text-center py-8">
                <div className="bg-gray-100 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <FileSymlink className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No protocols found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search or create a new protocol</p>
                <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
                  Create Protocol
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Templates tab content
  const renderTemplates = () => {
    return (
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-medium mb-4">Protocol Templates</h3>
        <p className="text-gray-500">This tab will contain protocol templates for different therapeutic areas and study phases.</p>
      </div>
    );
  };
  
  // Endpoints tab content
  const renderEndpoints = () => {
    return (
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-medium mb-4">Endpoint Library</h3>
        <p className="text-gray-500">This tab will contain a library of standard endpoints for different therapeutic areas.</p>
      </div>
    );
  };
  
  // Statistics tab content
  const renderStatistics = () => {
    return (
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-medium mb-4">Statistical Analysis</h3>
        <p className="text-gray-500">This tab will provide statistical analysis plan templates and guidance.</p>
      </div>
    );
  };
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Study Architect™</h1>
        <p className="text-gray-500 mt-1">
          Design and manage clinical trial protocols with ease
        </p>
      </div>
      
      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => handleTabChange(tab.id)}
              >
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

export default StudyArchitectModule;