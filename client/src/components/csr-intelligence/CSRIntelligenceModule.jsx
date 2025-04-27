/**
 * CSR Intelligence Module Component
 * 
 * This component provides the CSR Intelligence interface for the TrialSage platform,
 * allowing users to generate, manage, and analyze Clinical Study Reports.
 */

import React, { useState } from 'react';
import { 
  FileText, 
  PlusCircle, 
  Search, 
  Filter, 
  BarChart3,
  Download,
  Upload,
  Edit,
  Eye,
  FileSymlink,
  Clock
} from 'lucide-react';
import { useIntegration } from '../integration/ModuleIntegrationLayer';

const CSRIntelligenceModule = () => {
  const { docuShareService, regulatoryIntelligenceCore } = useIntegration();
  const [activeTab, setActiveTab] = useState('reports');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock CSR data
  const reports = [
    {
      id: 'csr-001',
      title: 'Clinical Study Report: XYZ-123 Phase II',
      status: 'Draft',
      version: '0.5',
      updatedAt: '2025-04-18T11:30:00Z',
      updatedBy: 'John Smith',
      study: 'XYZ-123-001',
      indication: 'Oncology',
      completionPercent: 45
    },
    {
      id: 'csr-002',
      title: 'Clinical Study Report: ABC-456 Phase III',
      status: 'In Review',
      version: '1.2',
      updatedAt: '2025-04-10T14:15:00Z',
      updatedBy: 'Jane Doe',
      study: 'ABC-456-002',
      indication: 'Diabetes',
      completionPercent: 85
    },
    {
      id: 'csr-003',
      title: 'Clinical Study Report: DEF-789 Phase I',
      status: 'Final',
      version: '2.0',
      updatedAt: '2025-03-28T09:45:00Z',
      updatedBy: 'Robert Chen',
      study: 'DEF-789-001',
      indication: 'Cardiovascular',
      completionPercent: 100
    }
  ];
  
  // Tabs configuration
  const tabs = [
    { id: 'reports', label: 'CSR Reports' },
    { id: 'templates', label: 'Templates' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'guidance', label: 'Guidance' }
  ];
  
  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Filter reports based on search query
  const filteredReports = reports.filter(report => 
    report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.indication.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.study.toLowerCase().includes(searchQuery.toLowerCase())
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
      case 'reports':
        return renderReports();
      case 'templates':
        return renderTemplates();
      case 'analytics':
        return renderAnalytics();
      case 'guidance':
        return renderGuidance();
      default:
        return renderReports();
    }
  };
  
  // Reports tab content
  const renderReports = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="font-medium">Clinical Study Reports</h3>
            <div className="flex space-x-2">
              <button className="py-2 px-4 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center text-sm">
                <Upload className="h-4 w-4 mr-1" />
                Import
              </button>
              <button className="py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center text-sm">
                <PlusCircle className="h-4 w-4 mr-1" />
                New CSR
              </button>
            </div>
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
                  placeholder="Search reports..."
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
                      Report Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
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
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-primary mr-3" />
                          <div>
                            <div className="font-medium text-gray-900">{report.title}</div>
                            <div className="text-xs text-gray-500">{report.study} • {report.indication}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(report.status)}`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${report.completionPercent}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{report.completionPercent}% Complete</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        v{report.version}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(report.updatedAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          by {report.updatedBy}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button className="text-gray-500 hover:text-gray-700">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-gray-500 hover:text-gray-700">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-gray-500 hover:text-gray-700">
                            <Download className="h-4 w-4" />
                          </button>
                          <button className="text-gray-500 hover:text-gray-700">
                            <FileSymlink className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredReports.length === 0 && (
              <div className="text-center py-8">
                <div className="bg-gray-100 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No reports found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search or create a new report</p>
                <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
                  Create CSR
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
        <h3 className="text-lg font-medium mb-4">CSR Templates</h3>
        <p className="text-gray-500">This tab will contain templates for creating standardized Clinical Study Reports.</p>
      </div>
    );
  };
  
  // Analytics tab content
  const renderAnalytics = () => {
    return (
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-medium mb-4">CSR Analytics</h3>
        <p className="text-gray-500">This tab will provide analytics on CSR preparation metrics.</p>
      </div>
    );
  };
  
  // Guidance tab content
  const renderGuidance = () => {
    return (
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-medium mb-4">Regulatory Guidance</h3>
        <p className="text-gray-500">This tab will provide guidance on CSR preparation according to ICH E3 and other regulatory standards.</p>
      </div>
    );
  };
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">CSR Intelligence™</h1>
        <p className="text-gray-500 mt-1">
          Automated Clinical Study Report preparation and management
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

export default CSRIntelligenceModule;