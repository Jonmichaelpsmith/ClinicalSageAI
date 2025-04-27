/**
 * TrialSage Vault Module
 * 
 * This component provides the TrialSage Vault™ module for the platform,
 * offering document management with blockchain verification.
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  FolderOpen, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle,
  Share2,
  Lock,
  Shield,
  Clock,
  Download,
  RefreshCw,
  UserPlus,
  Trash2,
  FileSymlink
} from 'lucide-react';
import { useIntegration } from '../integration/ModuleIntegrationLayer';

const TrialVaultModule = () => {
  const { docuShareService, blockchainService } = useIntegration();
  const [activeTab, setActiveTab] = useState('documents');
  const [documents, setDocuments] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifying, setVerifying] = useState(false);
  
  // Load documents
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoading(true);
        
        // Get all documents
        const allDocuments = docuShareService.getAllDocuments();
        setDocuments(allDocuments);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading documents:', error);
        setLoading(false);
      }
    };
    
    loadDocuments();
  }, [docuShareService]);
  
  // Filter documents based on category and search query
  const filteredDocuments = documents.filter(doc => {
    // Filter by category
    if (selectedCategory !== 'All' && doc.category !== selectedCategory) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !doc.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Group documents by category
  const documentsByCategory = documents.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {});
  
  // Get all available categories
  const availableCategories = ['All', ...docuShareService.getSupportedCategories()];
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };
  
  // Handle document selection
  const handleSelectDocument = (document) => {
    setSelectedDocument(document);
  };
  
  // Open document verification modal
  const openVerifyModal = (e, document) => {
    e.stopPropagation();
    setSelectedDocument(document);
    setShowVerifyModal(true);
  };
  
  // Close document verification modal
  const closeVerifyModal = () => {
    setShowVerifyModal(false);
    setVerifying(false);
  };
  
  // Verify document on blockchain
  const verifyDocument = async () => {
    if (!selectedDocument) return;
    
    try {
      setVerifying(true);
      
      // Simulate document verification
      const result = await blockchainService.verifyDocument(selectedDocument);
      
      if (result.success) {
        // Update document with verification status
        const updatedDocument = await docuShareService.verifyDocument(selectedDocument.id, {
          hash: result.hash,
          verifiedBy: 'John Smith'
        });
        
        // Update documents list
        setDocuments(prev => 
          prev.map(doc => doc.id === updatedDocument.id ? updatedDocument : doc)
        );
        
        // Close modal after a delay
        setTimeout(() => {
          closeVerifyModal();
          setSelectedDocument(updatedDocument);
        }, 1500);
      }
    } catch (error) {
      console.error('Error verifying document:', error);
      setVerifying(false);
    }
  };
  
  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'documents':
        return (
          <div className="p-6">
            <div className="flex justify-between mb-6">
              <h2 className="text-2xl font-bold">Document Repository</h2>
              
              <button className="flex items-center bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark">
                <Upload size={16} className="mr-2" />
                Upload Document
              </button>
            </div>
            
            {/* Filters and search */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-500 mr-1">Category:</span>
                {availableCategories.map(category => (
                  <button
                    key={category}
                    className={`px-3 py-1 text-sm rounded-full ${
                      selectedCategory === category
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
              
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {/* Documents Grid/List */}
            <div className="bg-white rounded-lg border overflow-hidden">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : filteredDocuments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Updated
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Size
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Verified
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredDocuments.map((document) => (
                        <tr 
                          key={document.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleSelectDocument(document)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 text-gray-400">
                                <FileText size={20} />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {document.title}
                                </div>
                                <div className="text-xs text-gray-500">
                                  By: {document.createdBy}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {document.category}
                            </div>
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(document.updatedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatFileSize(document.size)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {document.verified ? (
                              <div className="text-green-500" title="Verified on Blockchain">
                                <CheckCircle size={16} />
                              </div>
                            ) : (
                              <div className="text-gray-400" title="Not Verified">
                                <XCircle size={16} />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex space-x-2">
                              <button 
                                className="text-blue-600 hover:text-blue-800" 
                                title="Download"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Download size={16} />
                              </button>
                              <button 
                                className="text-green-600 hover:text-green-800" 
                                title="Share"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Share2 size={16} />
                              </button>
                              {!document.verified && (
                                <button 
                                  className="text-purple-600 hover:text-purple-800" 
                                  title="Verify on Blockchain"
                                  onClick={(e) => openVerifyModal(e, document)}
                                >
                                  <Shield size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FolderOpen size={48} className="mx-auto mb-3 text-gray-400" />
                  <p>No documents found matching your criteria.</p>
                  <button className="mt-2 text-primary hover:text-primary-dark">
                    Upload a document
                  </button>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'blockchain':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Blockchain Verification</h2>
            
            <div className="bg-white rounded-lg border p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">How Blockchain Verification Works</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center mr-3">
                      1
                    </div>
                    <h4 className="font-medium">Document Hashing</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    The system creates a unique cryptographic hash of your document, which
                    serves as a digital fingerprint.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center mr-3">
                      2
                    </div>
                    <h4 className="font-medium">Blockchain Storage</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    This hash is recorded on the blockchain, creating an immutable
                    timestamp and proof of existence.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center mr-3">
                      3
                    </div>
                    <h4 className="font-medium">Verification</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    At any time, the document can be re-hashed and compared to the
                    blockchain record to verify authenticity.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border overflow-hidden">
                <div className="bg-primary-light px-4 py-3 border-b">
                  <h3 className="font-semibold text-primary">Recently Verified Documents</h3>
                </div>
                
                <div className="p-4">
                  {documents.filter(doc => doc.verified).length > 0 ? (
                    <div className="space-y-4">
                      {documents.filter(doc => doc.verified).slice(0, 5).map(doc => (
                        <div key={doc.id} className="border rounded-md p-3 hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-start">
                            <div className="mr-3 text-green-500">
                              <Shield size={20} />
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">{doc.title}</h4>
                              <div className="text-xs text-gray-500 mt-1">
                                Verified on {formatDate(doc.verifiedAt || doc.updatedAt)} by {doc.verifiedBy || doc.createdBy}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Shield size={40} className="mx-auto mb-2 text-gray-400" />
                      <p>No verified documents yet</p>
                      <button className="mt-2 text-primary hover:text-primary-dark text-sm">
                        Verify a Document
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-white rounded-lg border overflow-hidden">
                <div className="bg-primary-light px-4 py-3 border-b">
                  <h3 className="font-semibold text-primary">Verification Statistics</h3>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-md p-4">
                      <h4 className="text-sm text-gray-500 mb-1">Total Documents</h4>
                      <div className="text-2xl font-bold">{documents.length}</div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h4 className="text-sm text-gray-500 mb-1">Verified Documents</h4>
                      <div className="text-2xl font-bold">{documents.filter(doc => doc.verified).length}</div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h4 className="text-sm text-gray-500 mb-1">Verification Rate</h4>
                      <div className="text-2xl font-bold">
                        {documents.length > 0 
                          ? Math.round((documents.filter(doc => doc.verified).length / documents.length) * 100) 
                          : 0}%
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h4 className="text-sm text-gray-500 mb-1">Last Verification</h4>
                      <div className="text-lg font-medium">
                        {documents.filter(doc => doc.verified).length > 0 
                          ? formatDate(documents.filter(doc => doc.verified)[0].verifiedAt || documents.filter(doc => doc.verified)[0].updatedAt)
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'sharing':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Document Sharing</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg border overflow-hidden">
                  <div className="bg-primary-light px-4 py-3 border-b">
                    <h3 className="font-semibold text-primary">Shared Documents</h3>
                  </div>
                  
                  <div className="p-4">
                    <div className="mb-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                      <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                          placeholder="Search shared documents..."
                        />
                      </div>
                      
                      <button className="flex items-center bg-primary text-white px-3 py-2 rounded text-sm hover:bg-primary-dark">
                        <Share2 size={16} className="mr-2" />
                        Share New Document
                      </button>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Document
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Shared With
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Access
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date Shared
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {documents.filter(doc => doc.id === 'doc-002' || doc.id === 'doc-003').map(doc => {
                            const shareInfo = docuShareService.getDocumentSharingInfo(doc.id)[0];
                            if (!shareInfo) return null;
                            
                            return (
                              <tr key={doc.id} className="hover:bg-gray-50 cursor-pointer">
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 text-gray-400">
                                      <FileText size={18} />
                                    </div>
                                    <div className="ml-3">
                                      <div className="text-sm font-medium text-gray-900">
                                        {doc.title}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {doc.verified && (
                                          <div className="flex items-center text-green-500">
                                            <Shield size={12} className="mr-1" />
                                            <span>Blockchain Verified</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {shareInfo.sharedWith}
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                    {shareInfo.accessType}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(shareInfo.sharedAt)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    {shareInfo.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="bg-white rounded-lg border overflow-hidden">
                  <div className="bg-primary-light px-4 py-3 border-b">
                    <h3 className="font-semibold text-primary">Sharing Options</h3>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    <div className="border rounded-md p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-md text-blue-600 mr-3">
                          <UserPlus size={18} />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">Direct Share</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            Share directly with individuals or teams
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-md text-purple-600 mr-3">
                          <FileSymlink size={18} />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">Secure Link</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            Create time-limited secure access links
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-md text-green-600 mr-3">
                          <Lock size={18} />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">Permissions</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            Manage access levels and permissions
                          </p>
                        </div>
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
            activeTab === 'documents'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('documents')}
        >
          Documents
        </button>
        
        <button
          className={`py-4 border-b-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'blockchain'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('blockchain')}
        >
          Blockchain Verification
        </button>
        
        <button
          className={`py-4 border-b-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'sharing'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('sharing')}
        >
          Document Sharing
        </button>
        
        <button
          className={`py-4 border-b-2 font-medium text-sm whitespace-nowrap ${
            activeTab === 'versions'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('versions')}
        >
          Version Control
        </button>
      </div>
      
      {/* Tab content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        {renderTabContent()}
      </div>
      
      {/* Document verification modal */}
      {showVerifyModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Blockchain Verification</h3>
              <button 
                className="text-gray-400 hover:text-gray-500"
                onClick={closeVerifyModal}
                disabled={verifying}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="px-6 py-6">
              <div className="text-center">
                {verifying ? (
                  <>
                    <div className="mx-auto mb-4 w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                    <h4 className="font-semibold mb-2">Verifying Document</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Creating hash and recording on blockchain...
                    </p>
                    <div className="text-xs text-gray-500">
                      This may take a moment
                    </div>
                  </>
                ) : (
                  <>
                    <Shield size={48} className="mx-auto mb-4 text-primary" />
                    <h4 className="font-semibold mb-2">Verify Document on Blockchain</h4>
                    <p className="text-sm text-gray-600 mb-6">
                      This will create a cryptographic hash of "{selectedDocument.title}" and record it on the blockchain to establish proof of existence and authenticity.
                    </p>
                    
                    <div className="p-3 bg-blue-50 rounded-md text-sm text-blue-800 mb-6">
                      <div className="font-medium mb-1">Benefits:</div>
                      <ul className="list-disc list-inside text-xs space-y-1">
                        <li>Tamper-proof verification of document authenticity</li>
                        <li>Immutable timestamp of document existence</li>
                        <li>Enhanced regulatory compliance with audit trail</li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-end">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors mr-3"
                onClick={closeVerifyModal}
                disabled={verifying}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors flex items-center"
                onClick={verifyDocument}
                disabled={verifying}
              >
                {verifying ? (
                  <>
                    <RefreshCw size={16} className="mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield size={16} className="mr-2" />
                    Verify Document
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrialVaultModule;