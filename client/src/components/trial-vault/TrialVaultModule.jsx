/**
 * TrialSage Vault Module Component
 * 
 * This component provides the document management interface for the TrialSage platform,
 * featuring blockchain verification and secure document storage.
 */

import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Filter,
  Upload,
  Download,
  File,
  FolderOpen,
  Shield,
  ChevronRight,
  Clock,
  Plus,
  ExternalLink,
  Lock,
  FileText,
  FileCheck
} from 'lucide-react';
import { useIntegration } from '../integration/ModuleIntegrationLayer';

const TrialVaultModule = () => {
  const { securityService } = useIntegration();
  const [activeView, setActiveView] = useState('documents');
  const [activeFolder, setActiveFolder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sample folders (in a real app, would come from API)
  const folders = [
    {
      id: 'folder-001',
      name: 'Regulatory Documents',
      documentCount: 47,
      updatedAt: '2025-04-22T10:30:00Z',
      createdBy: 'Jane Doe'
    },
    {
      id: 'folder-002',
      name: 'Clinical Trial Protocols',
      documentCount: 25,
      updatedAt: '2025-04-20T15:45:00Z',
      createdBy: 'John Smith'
    },
    {
      id: 'folder-003',
      name: 'Study Reports',
      documentCount: 18,
      updatedAt: '2025-04-18T09:15:00Z',
      createdBy: 'Robert Chen'
    },
    {
      id: 'folder-004',
      name: 'Investigator Brochures',
      documentCount: 12,
      updatedAt: '2025-04-15T14:20:00Z',
      createdBy: 'Jane Doe'
    },
    {
      id: 'folder-005',
      name: 'Safety Reports',
      documentCount: 30,
      updatedAt: '2025-04-10T11:30:00Z',
      createdBy: 'John Smith'
    }
  ];
  
  // Sample documents (in a real app, would come from API)
  const documents = [
    {
      id: 'doc-001',
      name: 'Protocol_XYZ-123_v2.1.pdf',
      type: 'pdf',
      size: 3400000,
      verified: true,
      createdAt: '2025-04-20T09:30:00Z',
      updatedAt: '2025-04-22T14:15:00Z',
      createdBy: 'Jane Doe',
      tags: ['Protocol', 'XYZ-123', 'Phase 1'],
      folderId: 'folder-002',
      verificationHash: '0x7f38e9de0bff2e9ed26a4a4c80ba5e54',
      verificationStatus: 'verified'
    },
    {
      id: 'doc-002',
      name: 'Investigator_Brochure_ABC-456_2025.docx',
      type: 'docx',
      size: 5200000,
      verified: true,
      createdAt: '2025-04-18T11:45:00Z',
      updatedAt: '2025-04-18T11:45:00Z',
      createdBy: 'John Smith',
      tags: ['Investigator Brochure', 'ABC-456'],
      folderId: 'folder-004',
      verificationHash: '0x3f82a6c94de0bf5e9ed26a4a4c80ba546',
      verificationStatus: 'verified'
    },
    {
      id: 'doc-003',
      name: 'Safety_Report_DEF-789_Q1_2025.pdf',
      type: 'pdf',
      size: 2800000,
      verified: false,
      createdAt: '2025-04-15T16:20:00Z',
      updatedAt: '2025-04-15T16:20:00Z',
      createdBy: 'Robert Chen',
      tags: ['Safety', 'DEF-789', 'Quarterly'],
      folderId: 'folder-005',
      verificationHash: null,
      verificationStatus: 'pending'
    },
    {
      id: 'doc-004',
      name: 'Regulatory_Submission_XYZ-123_FDA.zip',
      type: 'zip',
      size: 15600000,
      verified: true,
      createdAt: '2025-04-10T08:30:00Z',
      updatedAt: '2025-04-10T08:30:00Z',
      createdBy: 'Jane Doe',
      tags: ['Regulatory', 'XYZ-123', 'FDA', 'Submission'],
      folderId: 'folder-001',
      verificationHash: '0x9a45b3d2c6e8f0a47b5d9c8e1f2a3b4c',
      verificationStatus: 'verified'
    },
    {
      id: 'doc-005',
      name: 'CSR_ABC-456_Phase2_Final.pdf',
      type: 'pdf',
      size: 8900000,
      verified: true,
      createdAt: '2025-04-05T14:50:00Z',
      updatedAt: '2025-04-05T14:50:00Z',
      createdBy: 'John Smith',
      tags: ['CSR', 'ABC-456', 'Phase 2', 'Final'],
      folderId: 'folder-003',
      verificationHash: '0x5e72a8b9c0d6f3e1a8b7c6d5e4f3a2b1',
      verificationStatus: 'verified'
    }
  ];
  
  // Filter documents based on active folder and search query
  const filteredDocuments = documents.filter(doc => {
    // Filter by folder if one is selected
    if (activeFolder && doc.folderId !== activeFolder.id) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      return doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    return true;
  });
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle folder selection
  const handleFolderSelect = (folder) => {
    setActiveFolder(folder);
    setActiveView('documents');
  };
  
  // Handle document view
  const handleDocumentView = (document) => {
    // In a real app, this would open the document viewer
    console.log('View document:', document);
  };
  
  // Handle clear folder filter
  const handleClearFolderFilter = () => {
    setActiveFolder(null);
  };
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    } else if (bytes < 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    } else {
      return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    }
  };
  
  // Get file icon based on type
  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-600" />;
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'zip':
        return <File className="h-5 w-5 text-amber-600" />;
      default:
        return <File className="h-5 w-5 text-gray-600" />;
    }
  };
  
  // Render folders view
  const renderFoldersView = () => {
    return (
      <div>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Document Folders</h2>
            <button className="py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center text-sm">
              <Plus className="h-4 w-4 mr-1" />
              New Folder
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="bg-white rounded-lg shadow border hover:shadow-md cursor-pointer"
                onClick={() => handleFolderSelect(folder)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <FolderOpen className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{folder.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {folder.documentCount} {folder.documentCount === 1 ? 'document' : 'documents'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                  
                  <div className="mt-4 text-xs text-gray-500">
                    Last updated: {new Date(folder.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add new folder card */}
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary hover:bg-gray-100 flex flex-col items-center justify-center p-6 cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">New Folder</h3>
              <p className="text-sm text-gray-500 text-center">
                Create a new document folder
              </p>
            </div>
          </div>
        </div>
        
        {/* Recent Documents */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Documents</h2>
          <div className="bg-white rounded-lg shadow border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Modified
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {documents.slice(0, 5).map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getFileIcon(doc.type)}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 cursor-pointer hover:text-primary"
                                 onClick={() => handleDocumentView(doc)}>
                              {doc.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              By {doc.createdBy}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 uppercase">{doc.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(doc.updatedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatFileSize(doc.size)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {doc.verified ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center w-fit">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800 flex items-center w-fit">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="text-gray-400 hover:text-gray-500">
                            <Download className="h-4 w-4" />
                          </button>
                          <button className="text-gray-400 hover:text-gray-500">
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t text-center">
              <button 
                className="text-primary hover:text-primary-dark text-sm font-medium"
                onClick={() => setActiveView('documents')}
              >
                View All Documents
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render documents view
  const renderDocumentsView = () => {
    return (
      <div>
        {activeFolder && (
          <div className="mb-6">
            <button
              onClick={handleClearFolderFilter}
              className="flex items-center text-primary hover:text-primary-dark"
            >
              <ChevronRight className="h-4 w-4 mr-1 transform rotate-180" />
              <span>Back to All Documents</span>
            </button>
            
            <h2 className="text-xl font-medium text-gray-900 mt-4 flex items-center">
              <FolderOpen className="h-5 w-5 text-blue-600 mr-2" />
              {activeFolder.name}
            </h2>
          </div>
        )}
        
        <div className="mb-6">
          <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </button>
              
              <button className="py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center text-sm">
                <Plus className="h-4 w-4 mr-1" />
                New Document
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Modified
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getFileIcon(doc.type)}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 cursor-pointer hover:text-primary"
                                 onClick={() => handleDocumentView(doc)}>
                              {doc.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              By {doc.createdBy}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 uppercase">{doc.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(doc.updatedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatFileSize(doc.size)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {doc.verified ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center w-fit">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800 flex items-center w-fit">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="text-gray-400 hover:text-gray-500" title="Download">
                            <Download className="h-4 w-4" />
                          </button>
                          <button className="text-gray-400 hover:text-gray-500" title="View">
                            <ExternalLink className="h-4 w-4" />
                          </button>
                          {doc.verified && (
                            <button className="text-gray-400 hover:text-gray-500" title="Verification Details">
                              <Lock className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {filteredDocuments.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-10 text-center">
                        <div className="bg-gray-100 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                          <File className="h-6 w-6 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No documents found</h3>
                        <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render verification view (placeholder)
  const renderVerificationView = () => {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Blockchain Verification Status</h2>
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Verification System Online</h3>
                <p className="text-sm text-gray-500">All blockchain verification services are operational</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="text-xl font-bold text-gray-900 mb-1">286</div>
                <div className="text-sm text-gray-500">Verified Documents</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="text-xl font-bold text-gray-900 mb-1">14</div>
                <div className="text-sm text-gray-500">Pending Verification</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="text-xl font-bold text-gray-900 mb-1">100%</div>
                <div className="text-sm text-gray-500">Verification Success Rate</div>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4">
              This view would display detailed blockchain verification statistics and audit logs.
            </p>
            <p className="text-sm text-gray-500">
              Coming soon in the next development iteration.
            </p>
          </div>
        </div>
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
      
      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="border-b">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'folders'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveView('folders')}
            >
              Folders
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'documents'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => { setActiveView('documents'); setActiveFolder(null); }}
            >
              Documents
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'verification'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveView('verification')}
            >
              Verification Status
            </button>
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      {activeView === 'folders' && renderFoldersView()}
      {activeView === 'documents' && renderDocumentsView()}
      {activeView === 'verification' && renderVerificationView()}
    </div>
  );
};

export default TrialVaultModule;