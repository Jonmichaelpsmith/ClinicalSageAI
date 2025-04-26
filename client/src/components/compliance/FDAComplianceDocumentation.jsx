import React, { useState } from 'react';
import {
  FileText,
  Download,
  BookOpen,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Search,
  Filter,
  Folder,
  FolderOpen,
  CheckCircle,
  AlertTriangle,
  Clock,
  UserCheck
} from 'lucide-react';

/**
 * FDA Compliance Documentation Component
 * 
 * This component provides access to FDA 21 CFR Part 11 compliance documentation,
 * including policies, SOPs, validation documents, and training records.
 * 
 * Features:
 * - Structured documentation library
 * - Document search and filtering
 * - Document preview and download
 * - Status tracking for reviews and approvals
 */
export default function FDAComplianceDocumentation() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedItem, setExpandedItem] = useState(null);
  const [expandedFolder, setExpandedFolder] = useState('policies');
  
  // Sample document categories
  const documentCategories = [
    { id: 'all', name: 'All Documents' },
    { id: 'policies', name: 'Policies' },
    { id: 'sops', name: 'SOPs' },
    { id: 'validation', name: 'Validation' },
    { id: 'training', name: 'Training' },
    { id: 'audits', name: 'Audits' }
  ];
  
  // Sample document structure
  const documentStructure = {
    policies: [
      {
        id: 'POL-001',
        name: 'Electronic Records and Signatures Policy',
        version: '2.1',
        date: '2025-03-15',
        status: 'APPROVED',
        owner: 'Jane Smith',
        description: 'Master policy for electronic records and electronic signatures compliance with 21 CFR Part 11',
        reviewDue: '2026-03-15'
      },
      {
        id: 'POL-002',
        name: 'System Security Policy',
        version: '1.8',
        date: '2025-02-10',
        status: 'APPROVED',
        owner: 'Michael Chen',
        description: 'Policy for system security controls and access management',
        reviewDue: '2026-02-10'
      },
      {
        id: 'POL-003',
        name: 'Audit Trail Policy',
        version: '2.0',
        date: '2025-01-20',
        status: 'APPROVED',
        owner: 'Jane Smith',
        description: 'Policy for audit trail management and review procedures',
        reviewDue: '2026-01-20'
      }
    ],
    sops: [
      {
        id: 'SOP-001',
        name: 'Electronic Signature Procedure',
        version: '3.2',
        date: '2025-04-02',
        status: 'APPROVED',
        owner: 'Robert Johnson',
        description: 'Standard operating procedure for creating and managing electronic signatures',
        reviewDue: '2025-10-02'
      },
      {
        id: 'SOP-002',
        name: 'System Access Control Procedure',
        version: '2.4',
        date: '2025-03-18',
        status: 'APPROVED',
        owner: 'Sarah Williams',
        description: 'Procedure for managing user access and privileges',
        reviewDue: '2025-09-18'
      },
      {
        id: 'SOP-003',
        name: 'Audit Trail Review Procedure',
        version: '2.1',
        date: '2025-03-05',
        status: 'APPROVED',
        owner: 'Michael Chen',
        description: 'Procedure for regular review of system audit trails',
        reviewDue: '2025-09-05'
      },
      {
        id: 'SOP-004',
        name: 'System Backup Procedure',
        version: '1.9',
        date: '2025-02-12',
        status: 'REVIEW_NEEDED',
        owner: 'David Wilson',
        description: 'Procedure for system backup and recovery',
        reviewDue: '2025-08-12'
      }
    ],
    validation: [
      {
        id: 'VAL-001',
        name: 'System Validation Master Plan',
        version: '2.0',
        date: '2025-03-20',
        status: 'APPROVED',
        owner: 'Lisa Thompson',
        description: 'Master validation plan for the TrialSage system',
        reviewDue: '2026-03-20'
      },
      {
        id: 'VAL-002',
        name: 'User Requirements Specification',
        version: '2.3',
        date: '2025-02-15',
        status: 'APPROVED',
        owner: 'Lisa Thompson',
        description: 'User requirements for the TrialSage system',
        reviewDue: '2026-02-15'
      },
      {
        id: 'VAL-003',
        name: 'Functional Specification',
        version: '2.2',
        date: '2025-02-10',
        status: 'APPROVED',
        owner: 'John Davis',
        description: 'Functional specification for the TrialSage system',
        reviewDue: '2026-02-10'
      },
      {
        id: 'VAL-004',
        name: 'Test Scripts - Electronic Signatures',
        version: '3.1',
        date: '2025-01-25',
        status: 'APPROVED',
        owner: 'Sarah Williams',
        description: 'Test scripts for electronic signature functionality',
        reviewDue: '2026-01-25'
      },
      {
        id: 'VAL-005',
        name: 'Test Scripts - Audit Trails',
        version: '3.0',
        date: '2025-01-20',
        status: 'APPROVED',
        owner: 'Michael Chen',
        description: 'Test scripts for audit trail functionality',
        reviewDue: '2026-01-20'
      },
      {
        id: 'VAL-006',
        name: 'System Validation Report',
        version: '1.0',
        date: '2025-04-25',
        status: 'APPROVED',
        owner: 'Lisa Thompson',
        description: 'Validation summary report for the TrialSage system',
        reviewDue: '2026-04-25'
      }
    ],
    training: [
      {
        id: 'TRN-001',
        name: '21 CFR Part 11 Training',
        version: '2.5',
        date: '2025-03-15',
        status: 'APPROVED',
        owner: 'Sarah Williams',
        description: 'Training materials for 21 CFR Part 11 requirements',
        reviewDue: '2026-03-15'
      },
      {
        id: 'TRN-002',
        name: 'Electronic Signature Training',
        version: '2.2',
        date: '2025-02-28',
        status: 'APPROVED',
        owner: 'Robert Johnson',
        description: 'Training materials for electronic signature procedures',
        reviewDue: '2026-02-28'
      },
      {
        id: 'TRN-003',
        name: 'System Administration Training',
        version: '1.8',
        date: '2025-02-10',
        status: 'APPROVED',
        owner: 'David Wilson',
        description: 'Training materials for system administrators',
        reviewDue: '2026-02-10'
      }
    ],
    audits: [
      {
        id: 'AUD-001',
        name: 'Internal Audit Report - Q1 2025',
        version: '1.0',
        date: '2025-04-15',
        status: 'APPROVED',
        owner: 'Jane Smith',
        description: 'Internal audit of 21 CFR Part 11 compliance',
        reviewDue: 'N/A'
      },
      {
        id: 'AUD-002',
        name: 'Security Assessment Report',
        version: '1.0',
        date: '2025-04-10',
        status: 'APPROVED',
        owner: 'Michael Chen',
        description: 'Assessment of system security controls',
        reviewDue: 'N/A'
      },
      {
        id: 'AUD-003',
        name: 'Penetration Test Report',
        version: '1.0',
        date: '2025-03-22',
        status: 'APPROVED',
        owner: 'External Vendor',
        description: 'External penetration testing of system security',
        reviewDue: 'N/A'
      }
    ]
  };

  // Format date
  const formatDate = (dateString) => {
    if (dateString === 'N/A') return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Toggle expanded item
  const toggleExpandItem = (itemId) => {
    if (expandedItem === itemId) {
      setExpandedItem(null);
    } else {
      setExpandedItem(itemId);
    }
  };

  // Toggle expanded folder
  const toggleExpandFolder = (folderId) => {
    if (expandedFolder === folderId) {
      setExpandedFolder(null);
    } else {
      setExpandedFolder(folderId);
    }
  };

  // Get all documents or filtered by category
  const getFilteredDocuments = () => {
    if (activeCategory === 'all') {
      // Flatten all document categories into a single array
      return Object.values(documentStructure).flat();
    } else {
      return documentStructure[activeCategory] || [];
    }
  };

  // Filter documents by search term
  const getSearchFilteredDocuments = () => {
    const documents = getFilteredDocuments();
    
    if (!searchTerm) {
      return documents;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return documents.filter(doc => 
      doc.id.toLowerCase().includes(searchLower) ||
      doc.name.toLowerCase().includes(searchLower) ||
      doc.description.toLowerCase().includes(searchLower) ||
      doc.owner.toLowerCase().includes(searchLower)
    );
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </span>
        );
      case 'REVIEW_NEEDED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Review Needed
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <FileText className="h-3 w-3 mr-1" />
            Draft
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          FDA Compliance Documentation
        </h2>
        <p className="text-blue-100 text-sm mt-1">
          21 CFR Part 11 Compliance Documentation Library
        </p>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Document Categories
            </h3>
            <div className="mt-2 space-y-1">
              {documentCategories.map(category => (
                <button
                  key={category.id}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                    activeCategory === category.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.id === 'all' ? (
                    <BookOpen className="mr-2 h-4 w-4" />
                  ) : category.id === 'policies' ? (
                    <FileText className="mr-2 h-4 w-4" />
                  ) : category.id === 'sops' ? (
                    <FileText className="mr-2 h-4 w-4" />
                  ) : category.id === 'validation' ? (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  ) : category.id === 'training' ? (
                    <UserCheck className="mr-2 h-4 w-4" />
                  ) : (
                    <Folder className="mr-2 h-4 w-4" />
                  )}
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Document Structure
            </h3>
            <div className="mt-2 space-y-1">
              {Object.entries(documentStructure).map(([key, documents]) => (
                <div key={key}>
                  <button
                    className="flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md w-full"
                    onClick={() => toggleExpandFolder(key)}
                  >
                    <div className="flex items-center">
                      {expandedFolder === key ? (
                        <FolderOpen className="mr-2 h-4 w-4 text-blue-500" />
                      ) : (
                        <Folder className="mr-2 h-4 w-4 text-gray-500" />
                      )}
                      <span className="capitalize">{key}</span>
                    </div>
                    <span>
                      {expandedFolder === key ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </span>
                  </button>
                  {expandedFolder === key && (
                    <div className="pl-10 space-y-1 mt-1">
                      {documents.map(doc => (
                        <button
                          key={doc.id}
                          className="flex items-center px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md w-full"
                          onClick={() => toggleExpandItem(doc.id)}
                        >
                          <FileText className="mr-2 h-4 w-4 text-gray-400" />
                          {doc.id}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {activeCategory === 'all' ? 'All Documents' : 
                  documentCategories.find(c => c.id === activeCategory)?.name || 'Documents'}
              </h3>
              <p className="text-sm text-gray-500">
                {getSearchFilteredDocuments().length} documents available
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </button>
              <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Download className="mr-2 h-4 w-4" />
                Export List
              </button>
            </div>
          </div>

          {/* Document List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {getSearchFilteredDocuments().map(document => (
                <li key={document.id}>
                  <div
                    className={`px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer ${
                      expandedItem === document.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => toggleExpandItem(document.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className={`h-5 w-5 ${
                          document.id.startsWith('POL') ? 'text-blue-500' :
                          document.id.startsWith('SOP') ? 'text-green-500' :
                          document.id.startsWith('VAL') ? 'text-purple-500' :
                          document.id.startsWith('TRN') ? 'text-orange-500' :
                          document.id.startsWith('AUD') ? 'text-red-500' :
                          'text-gray-500'
                        }`} />
                        <p className="ml-3 text-sm font-medium text-gray-900">{document.name}</p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        {getStatusBadge(document.status)}
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <span className="font-medium text-gray-700 mr-1">ID:</span> {document.id}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <span className="font-medium text-gray-700 mr-1">Version:</span> {document.version}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <p>
                          Last updated on <time dateTime={document.date}>{formatDate(document.date)}</time>
                        </p>
                      </div>
                    </div>
                    
                    {expandedItem === document.id && (
                      <div className="mt-4 border-t border-gray-200 pt-4">
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900">Document Details</h4>
                          <p className="mt-1 text-sm text-gray-600">{document.description}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                          <div>
                            <div className="text-sm font-medium text-gray-500">Document Owner</div>
                            <div className="mt-1 text-sm text-gray-900">{document.owner}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-500">Review Due</div>
                            <div className="mt-1 text-sm text-gray-900">{formatDate(document.reviewDue)}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-500">Category</div>
                            <div className="mt-1 text-sm text-gray-900 capitalize">
                              {Object.entries(documentStructure).find(([_, docs]) => 
                                docs.some(d => d.id === document.id)
                              )?.[0] || 'Unknown'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex space-x-3">
                          <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <BookOpen className="mr-2 h-4 w-4" />
                            View Document
                          </button>
                          <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* FDA Compliance Note */}
          <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-blue-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">FDA 21 CFR Part 11 Compliance</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    All documentation in this library is maintained in compliance with FDA 21 CFR Part 11 requirements.
                    This includes controlled document management, electronic signatures for approvals, version control,
                    and complete audit trails of all document activities.
                  </p>
                  <p className="mt-2">
                    <a href="#" className="font-medium text-blue-600 hover:text-blue-500 flex items-center">
                      <span>Learn more about our documentation controls</span>
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}