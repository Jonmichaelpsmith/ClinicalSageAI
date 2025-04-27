/**
 * TrialSage Vault Module Component
 * 
 * This component provides the TrialSage Vault interface for the platform,
 * allowing users to manage clinical trial documents and metadata.
 */

import React, { useState } from 'react';
import { 
  FileText, 
  FolderPlus, 
  Search, 
  Filter, 
  Upload,
  Clock,
  CheckCircle,
  Download,
  Copy,
  Edit,
  Trash2,
  Shield,
  BarChart4
} from 'lucide-react';
import { useIntegration } from '../integration/ModuleIntegrationLayer';

const TrialVaultModule = () => {
  const { docuShareService, blockchainService } = useIntegration();
  const [activeTab, setActiveTab] = useState('documents');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock documents data
  const documents = [
    {
      id: 'doc-001',
      name: 'Protocol XYZ-123-001',
      type: 'Protocol',
      status: 'Final',
      version: '2.0',
      updatedAt: '2025-04-15T09:30:00Z',
      updatedBy: 'John Smith',
      size: '3.5 MB',
      verified: true,
      trial: 'XYZ-123'
    },
    {
      id: 'doc-002',
      name: 'Statistical Analysis Plan ABC-456',
      type: 'SAP',
      status: 'Draft',
      version: '0.8',
      updatedAt: '2025-04-20T14:15:00Z',
      updatedBy: 'Jane Doe',
      size: '2.1 MB',
      verified: true,
      trial: 'ABC-456'
    },
    {
      id: 'doc-003',
      name: 'Investigator Brochure DEF-789',
      type: 'Investigator Brochure',
      status: 'In Review',
      version: '1.5',
      updatedAt: '2025-04-18T11:45:00Z',
      updatedBy: 'Robert Chen',
      size: '5.8 MB',
      verified: false,
      trial: 'DEF-789'
    }
  ];
  
  // Tabs configuration
  const tabs = [
    { id: 'documents', label: 'Documents' },
    { id: 'trials', label: 'Clinical Trials' },
    { id: 'verification', label: 'Verification' },
    { id: 'audit', label: 'Audit Trail' }
  ];
  
  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Filter documents based on search query
  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.trial.toLowerCase().includes(searchQuery.toLowerCase())
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
  
  // Verify document
  const handleVerifyDocument = async (docId) => {
    const document = documents.find(d => d.id === docId);
    const user = { id: 'user-001', name: 'John Smith' };
    
    if (document) {
      try {
        const result = await blockchainService.verifyDocument(document, user);
        if (result.success) {
          console.log(`Document verified: ${docId}`);
          // In a real app, you would update the document status
        }
      } catch (error) {
        console.error('Verification error:', error);
      }
    }
  };
  
  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'documents':
        return renderDocuments();
      case 'trials':
        return renderTrials();
      case 'verification':
        return renderVerification();
      case 'audit':
        return renderAudit();
      default:
        return renderDocuments();
    }
  };
  
  // Documents tab content
  const renderDocuments = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="font-medium">Document Repository</h3>
            <div className="flex space-x-2">
              <button className="py-2 px-4 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center text-sm">
                <Upload className="h-4 w-4 mr-1" />
                Upload
              </button>
              <button className="py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center text-sm">
                <FolderPlus className="h-4 w-4 mr-1" />
                New Folder
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
                  placeholder="Search documents..."
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
                      Document
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Version
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Modified
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verified
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-primary mr-3" />
                          <div>
                            <div className="font-medium text-gray-900">{doc.name}</div>
                            <div className="text-xs text-gray-500">Trial: {doc.trial} • {doc.size}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(doc.status)}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doc.type}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        v{doc.version}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(doc.updatedAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          by {doc.updatedBy}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {doc.verified ? (
                          <span className="flex items-center text-green-700">
                            <Shield className="h-4 w-4 mr-1" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleVerifyDocument(doc.id)}
                            className="flex items-center text-blue-700 hover:text-blue-900"
                          >
                            <Shield className="h-4 w-4 mr-1" />
                            <span>Verify</span>
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button className="text-gray-500 hover:text-gray-700">
                            <Download className="h-4 w-4" />
                          </button>
                          <button className="text-gray-500 hover:text-gray-700">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-gray-500 hover:text-gray-700">
                            <Copy className="h-4 w-4" />
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
            
            {filteredDocuments.length === 0 && (
              <div className="text-center py-8">
                <div className="bg-gray-100 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No documents found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search or upload a new document</p>
                <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
                  Upload Document
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Trials tab content
  const renderTrials = () => {
    return (
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-medium mb-4">Clinical Trials</h3>
        <p className="text-gray-500">This tab will provide an overview of all clinical trials and their associated documents.</p>
      </div>
    );
  };
  
  // Verification tab content
  const renderVerification = () => {
    return (
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-medium mb-4">Blockchain Verification</h3>
        <p className="text-gray-500">This tab will provide tools for verifying document authenticity and tracking document history.</p>
      </div>
    );
  };
  
  // Audit tab content
  const renderAudit = () => {
    return (
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-medium mb-4">Audit Trail</h3>
        <p className="text-gray-500">This tab will provide a comprehensive audit trail of all document activities.</p>
      </div>
    );
  };
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">TrialSage Vault™</h1>
        <p className="text-gray-500 mt-1">
          Secure document management with blockchain verification
        </p>
      </div>
      
      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Documents</p>
              <p className="text-xl font-semibold mt-1">{documents.length}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-full">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Verified Documents</p>
              <p className="text-xl font-semibold mt-1">{documents.filter(d => d.verified).length}</p>
            </div>
            <div className="bg-green-100 p-2 rounded-full">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Trials</p>
              <p className="text-xl font-semibold mt-1">3</p>
            </div>
            <div className="bg-purple-100 p-2 rounded-full">
              <BarChart4 className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Recent Activity</p>
              <p className="text-xl font-semibold mt-1">12</p>
            </div>
            <div className="bg-amber-100 p-2 rounded-full">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>
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

export default TrialVaultModule;