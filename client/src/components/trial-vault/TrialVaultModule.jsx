/**
 * Trial Vault Module
 * 
 * This component provides the main interface for the Trial Vault module,
 * which handles document management with blockchain verification.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  FileText, 
  Upload, 
  Shield, 
  Search, 
  FolderPlus, 
  File, 
  FileCheck, 
  Lock,
  Share2,
  Filter,
  Grid,
  List as ListIcon
} from 'lucide-react';
import { useIntegration } from '../integration/ModuleIntegrationLayer';

const TrialVaultModule = () => {
  const { registerModule, blockchainService, docuShareService } = useIntegration();
  const [section, setSection] = useState('documents');
  const [viewType, setViewType] = useState('grid');
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [blockchainStatus, setBlockchainStatus] = useState(null);
  
  // Register this module with the integration layer
  useEffect(() => {
    registerModule('trial-vault', { 
      name: 'Trial Vault™',
      version: '1.0.0',
      capabilities: ['document-management', 'blockchain-verification', 'secure-sharing']
    });
    
    // Get documents and blockchain status
    const loadDocumentsAndStatus = async () => {
      try {
        setIsLoading(true);
        
        // Get documents from DocuShare service
        if (docuShareService) {
          const docs = await docuShareService.getDocuments();
          setDocuments(docs || []);
        }
        
        // Get blockchain status
        if (blockchainService) {
          const status = blockchainService.getNetworkStatus();
          setBlockchainStatus(status);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading documents or blockchain status:', error);
        setIsLoading(false);
      }
    };
    
    loadDocumentsAndStatus();
  }, [registerModule, blockchainService, docuShareService]);
  
  // Animation variants for page transitions
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };
  
  // Render different sections based on state
  const renderSection = () => {
    switch (section) {
      case 'documents':
        return <DocumentSection 
          documents={documents} 
          isLoading={isLoading} 
          viewType={viewType} 
          blockchainStatus={blockchainStatus}
        />;
      case 'upload':
        return <UploadSection />;
      case 'security':
        return <SecuritySection blockchainStatus={blockchainStatus} />;
      case 'sharing':
        return <SharingSection />;
      default:
        return <DocumentSection 
          documents={documents} 
          isLoading={isLoading} 
          viewType={viewType}
          blockchainStatus={blockchainStatus}
        />;
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Module header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Trial Vault™</h1>
          
          <div className="flex items-center space-x-4">
            <button
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors"
              onClick={() => setSection('upload')}
            >
              Upload Document
            </button>
            
            <button
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center"
              onClick={() => setSection('security')}
            >
              <Shield size={16} className="mr-2" />
              Blockchain Verification
            </button>
          </div>
        </div>
        
        {/* Module navigation */}
        <nav className="flex mt-4 space-x-1">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              section === 'documents' 
                ? 'bg-gray-100 text-gray-900' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            } flex items-center`}
            onClick={() => setSection('documents')}
          >
            <FileText size={16} className="mr-2" />
            Documents
          </button>
          
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              section === 'upload' 
                ? 'bg-gray-100 text-gray-900' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            } flex items-center`}
            onClick={() => setSection('upload')}
          >
            <Upload size={16} className="mr-2" />
            Upload
          </button>
          
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              section === 'security' 
                ? 'bg-gray-100 text-gray-900' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            } flex items-center`}
            onClick={() => setSection('security')}
          >
            <Shield size={16} className="mr-2" />
            Security
          </button>
          
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              section === 'sharing' 
                ? 'bg-gray-100 text-gray-900' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            } flex items-center`}
            onClick={() => setSection('sharing')}
          >
            <Share2 size={16} className="mr-2" />
            Sharing
          </button>
        </nav>
      </header>
      
      {/* Module content with animation */}
      <motion.div 
        className="flex-1 overflow-auto bg-gray-50 p-6"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={{ duration: 0.3 }}
      >
        {renderSection()}
      </motion.div>
    </div>
  );
};

// Document Section
const DocumentSection = ({ documents, isLoading, viewType, blockchainStatus }) => {
  // Mock documents if none provided
  const docsToDisplay = documents.length > 0 ? documents : [
    { 
      id: 'doc-001', 
      title: 'Protocol v1.2', 
      type: 'protocol', 
      status: 'verified',
      dateAdded: '2024-03-15',
      lastModified: '2024-03-20',
      size: '2.4 MB',
      verifiedAt: '2024-03-21',
      owner: 'John Smith'
    },
    { 
      id: 'doc-002', 
      title: 'Informed Consent Form', 
      type: 'form', 
      status: 'verified',
      dateAdded: '2024-03-10',
      lastModified: '2024-03-12',
      size: '0.8 MB',
      verifiedAt: '2024-03-13',
      owner: 'Sarah Johnson'
    },
    { 
      id: 'doc-003', 
      title: 'Statistical Analysis Plan', 
      type: 'analysis', 
      status: 'pending',
      dateAdded: '2024-03-22',
      lastModified: '2024-03-22',
      size: '1.5 MB',
      verifiedAt: null,
      owner: 'Michael Lee'
    },
    { 
      id: 'doc-004', 
      title: 'IB v2.0', 
      type: 'investigator-brochure', 
      status: 'verified',
      dateAdded: '2024-02-28',
      lastModified: '2024-03-05',
      size: '3.7 MB',
      verifiedAt: '2024-03-06',
      owner: 'Emily Davis'
    },
    { 
      id: 'doc-005', 
      title: 'Case Report Form Templates', 
      type: 'form', 
      status: 'verified',
      dateAdded: '2024-03-01',
      lastModified: '2024-03-08',
      size: '1.2 MB',
      verifiedAt: '2024-03-09',
      owner: 'John Smith'
    },
    { 
      id: 'doc-006', 
      title: 'FDA Meeting Minutes', 
      type: 'correspondence', 
      status: 'pending',
      dateAdded: '2024-03-25',
      lastModified: '2024-03-25',
      size: '0.5 MB',
      verifiedAt: null,
      owner: 'Sarah Johnson'
    }
  ];
  
  return (
    <div className="space-y-6">
      {/* Search and filter */}
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            placeholder="Search documents..."
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
            <Filter size={16} className="mr-2 text-gray-500" />
            Filters
          </button>
          
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button 
              className={`p-2 ${viewType === 'grid' ? 'bg-gray-200' : 'bg-white hover:bg-gray-50'}`}
              onClick={() => setViewType('grid')}
            >
              <Grid size={16} className="text-gray-700" />
            </button>
            <button 
              className={`p-2 ${viewType === 'list' ? 'bg-gray-200' : 'bg-white hover:bg-gray-50'}`}
              onClick={() => setViewType('list')}
            >
              <ListIcon size={16} className="text-gray-700" />
            </button>
          </div>
          
          <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
            <FolderPlus size={16} className="mr-2 text-gray-500" />
            New Folder
          </button>
        </div>
      </div>
      
      {/* Blockchain status */}
      {blockchainStatus && (
        <div className={`flex items-center px-4 py-3 rounded-md text-sm ${
          blockchainStatus.connected ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'
        }`}>
          <Shield size={16} className="mr-2" />
          <span>
            Blockchain Verification: {blockchainStatus.connected ? 'Active' : 'Inactive'} • 
            Last synced: {blockchainStatus.lastUpdated ? new Date(blockchainStatus.lastUpdated).toLocaleTimeString() : 'N/A'}
          </span>
        </div>
      )}
      
      {/* Documents */}
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : viewType === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {docsToDisplay.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modified</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {docsToDisplay.map((doc) => (
                <DocumentRow key={doc.id} document={doc} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Upload Section
const UploadSection = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
      <p className="text-gray-500 mb-6">
        Upload your clinical or regulatory document to the secure Trial Vault™ platform.
        All documents are automatically verified using blockchain technology.
      </p>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mb-4">
          <Upload size={24} className="text-primary" />
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Drag and drop your document here, or click to browse
        </p>
        <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors">
          Select Document
        </button>
        <p className="text-xs text-gray-400 mt-3">
          Supported file types: PDF, DOCX, XLSX, PPTX, XML
        </p>
      </div>
      
      <div className="mt-8">
        <h3 className="font-medium mb-4">Document Metadata</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Title
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="Enter document title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Type
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary">
              <option value="">Select document type</option>
              <option value="protocol">Protocol</option>
              <option value="form">Form</option>
              <option value="analysis">Analysis Plan</option>
              <option value="investigator-brochure">Investigator Brochure</option>
              <option value="correspondence">Correspondence</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Version
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="e.g., v1.0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Access Level
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary">
              <option value="private">Private</option>
              <option value="team">Team Only</option>
              <option value="organization">Organization</option>
              <option value="public">Public</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            rows={3}
            placeholder="Add a description for this document"
          ></textarea>
        </div>
      </div>
      
      <div className="mt-8 flex justify-end space-x-3">
        <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors">
          Upload Document
        </button>
      </div>
    </div>
  );
};

// Security Section
const SecuritySection = ({ blockchainStatus }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Shield size={24} className="text-primary mr-3" />
          <h2 className="text-xl font-semibold">Blockchain Verification</h2>
        </div>
        
        <p className="text-gray-500 mb-6">
          Trial Vault™ uses blockchain technology to verify the authenticity and
          integrity of all documents. Each document is hashed and recorded on the
          blockchain, providing an immutable audit trail.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="font-medium mb-2">Network Status</div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                blockchainStatus?.connected ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <span>
                {blockchainStatus?.connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="font-medium mb-2">Last Sync</div>
            <div>
              {blockchainStatus?.lastUpdated ? 
                new Date(blockchainStatus.lastUpdated).toLocaleString() : 
                'N/A'}
            </div>
          </div>
          
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="font-medium mb-2">Verified Documents</div>
            <div>152 / 165 (92%)</div>
          </div>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b font-medium">
            Recent Blockchain Transactions
          </div>
          <div className="divide-y">
            <div className="px-4 py-3 flex justify-between items-center">
              <div>
                <div className="font-medium">Protocol v1.2 Verification</div>
                <div className="text-sm text-gray-500">
                  Hash: 7e9f...3a2d
                </div>
              </div>
              <div className="text-sm text-gray-500">
                2024-03-21 14:32
              </div>
            </div>
            
            <div className="px-4 py-3 flex justify-between items-center">
              <div>
                <div className="font-medium">Informed Consent Form Verification</div>
                <div className="text-sm text-gray-500">
                  Hash: 3c5a...8f1e
                </div>
              </div>
              <div className="text-sm text-gray-500">
                2024-03-13 09:17
              </div>
            </div>
            
            <div className="px-4 py-3 flex justify-between items-center">
              <div>
                <div className="font-medium">IB v2.0 Verification</div>
                <div className="text-sm text-gray-500">
                  Hash: 9d2b...6c4f
                </div>
              </div>
              <div className="text-sm text-gray-500">
                2024-03-06 11:45
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Lock size={24} className="text-primary mr-3" />
          <h2 className="text-xl font-semibold">Security & Compliance</h2>
        </div>
        
        <p className="text-gray-500 mb-6">
          Trial Vault™ ensures your documents are stored securely and comply with
          regulatory requirements. Our platform uses industry-standard encryption
          and access controls.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Compliance Status</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <FileCheck size={16} className="text-green-500 mr-2" />
                <span>21 CFR Part 11 Compliant</span>
              </div>
              <div className="flex items-center">
                <FileCheck size={16} className="text-green-500 mr-2" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center">
                <FileCheck size={16} className="text-green-500 mr-2" />
                <span>GDPR Compliant</span>
              </div>
              <div className="flex items-center">
                <FileCheck size={16} className="text-green-500 mr-2" />
                <span>ISO 27001 Certified</span>
              </div>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Security Features</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <FileCheck size={16} className="text-green-500 mr-2" />
                <span>End-to-End Encryption</span>
              </div>
              <div className="flex items-center">
                <FileCheck size={16} className="text-green-500 mr-2" />
                <span>Role-Based Access Control</span>
              </div>
              <div className="flex items-center">
                <FileCheck size={16} className="text-green-500 mr-2" />
                <span>Two-Factor Authentication</span>
              </div>
              <div className="flex items-center">
                <FileCheck size={16} className="text-green-500 mr-2" />
                <span>Audit Trail</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sharing Section
const SharingSection = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <Share2 size={24} className="text-primary mr-3" />
        <h2 className="text-xl font-semibold">Document Sharing</h2>
      </div>
      
      <p className="text-gray-500 mb-6">
        Securely share documents with team members, reviewers, or regulatory authorities.
        Control access with expiration dates and permission levels.
      </p>
      
      <div className="mt-6 border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Recently Shared Documents</h3>
        
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">Protocol v1.2</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Shared with: Sarah Johnson, Michael Lee, FDA Review Team
                </p>
              </div>
              <button className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary-dark transition-colors">
                Manage Access
              </button>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Expires: April 30, 2024
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">Informed Consent Form</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Shared with: IRB Committee, Site Coordinators
                </p>
              </div>
              <button className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary-dark transition-colors">
                Manage Access
              </button>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Expires: May 15, 2024
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">Statistical Analysis Plan</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Shared with: Biostatistics Team, CRO
                </p>
              </div>
              <button className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary-dark transition-colors">
                Manage Access
              </button>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Expires: June 1, 2024
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Share a Document</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Document
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary">
              <option value="">Select a document</option>
              <option value="1">Protocol v1.2</option>
              <option value="2">Informed Consent Form</option>
              <option value="3">Statistical Analysis Plan</option>
              <option value="4">IB v2.0</option>
              <option value="5">Case Report Form Templates</option>
              <option value="6">FDA Meeting Minutes</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Share With
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="Enter email addresses (separated by commas)"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Level
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary">
                <option value="view">View Only</option>
                <option value="comment">Comment</option>
                <option value="edit">Edit</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiration Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message (Optional)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              rows={3}
              placeholder="Add a message to the recipients"
            ></textarea>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors">
            Share Document
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const DocumentCard = ({ document }) => {
  const getDocumentIcon = (type) => {
    switch (type) {
      case 'protocol':
        return <FileText size={24} className="text-blue-500" />;
      case 'form':
        return <File size={24} className="text-green-500" />;
      case 'analysis':
        return <FileText size={24} className="text-purple-500" />;
      case 'investigator-brochure':
        return <File size={24} className="text-orange-500" />;
      case 'correspondence':
        return <File size={24} className="text-red-500" />;
      default:
        return <File size={24} className="text-gray-500" />;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-center mb-3">
          {getDocumentIcon(document.type)}
          {document.status === 'verified' && (
            <div className="ml-auto">
              <Shield size={16} className="text-green-500" />
            </div>
          )}
        </div>
        <h3 className="font-medium truncate">{document.title}</h3>
        <div className="text-xs text-gray-500 mt-1">
          Modified: {document.lastModified}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Size: {document.size}
        </div>
      </div>
      <div className="px-4 py-3 bg-gray-50 rounded-b-lg flex justify-between items-center border-t">
        <span className="text-xs text-gray-500">
          {document.owner}
        </span>
        <div className="flex space-x-2">
          <button className="p-1 text-gray-400 hover:text-gray-600">
            <Share2 size={16} />
          </button>
          <button className="p-1 text-gray-400 hover:text-gray-600">
            <Download size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const DocumentRow = ({ document }) => {
  const getDocumentIcon = (type) => {
    switch (type) {
      case 'protocol':
        return <FileText size={16} className="text-blue-500" />;
      case 'form':
        return <File size={16} className="text-green-500" />;
      case 'analysis':
        return <FileText size={16} className="text-purple-500" />;
      case 'investigator-brochure':
        return <File size={16} className="text-orange-500" />;
      case 'correspondence':
        return <File size={16} className="text-red-500" />;
      default:
        return <File size={16} className="text-gray-500" />;
    }
  };
  
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {getDocumentIcon(document.type)}
          <span className="ml-2 font-medium">{document.title}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {document.owner}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {document.lastModified}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {document.size}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {document.status === 'verified' ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Shield size={12} className="mr-1" />
            Verified
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex space-x-2">
          <button className="p-1 text-gray-400 hover:text-gray-600">
            <Share2 size={16} />
          </button>
          <button className="p-1 text-gray-400 hover:text-gray-600">
            <Download size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default TrialVaultModule;