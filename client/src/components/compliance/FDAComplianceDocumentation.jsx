import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  Calendar, 
  Filter,
  Tag,
  User,
  ChevronRight,
  ChevronDown,
  Info,
  Check
} from 'lucide-react';

/**
 * FDA Compliance Documentation Component
 * 
 * Provides access to critical compliance documentation required for FDA audits:
 * - Validation documentation
 * - Standard Operating Procedures (SOPs)
 * - Training records
 * - System specifications
 * - Risk assessments
 * - Compliance certificates
 */
export default function FDAComplianceDocumentation() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentCategory, setCurrentCategory] = useState('all');
  const [expandedDocument, setExpandedDocument] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    type: [],
    date: 'all'
  });

  // Document categories
  const categories = [
    { id: 'all', name: 'All Documents' },
    { id: 'validation', name: 'Validation Documents' },
    { id: 'sop', name: 'Standard Operating Procedures' },
    { id: 'training', name: 'Training Records' },
    { id: 'specification', name: 'System Specifications' },
    { id: 'risk', name: 'Risk Assessments' },
    { id: 'certificate', name: 'Compliance Certificates' }
  ];

  // Filter options
  const filterOptions = {
    status: [
      { id: 'current', name: 'Current' },
      { id: 'archived', name: 'Archived' },
      { id: 'draft', name: 'Draft' }
    ],
    type: [
      { id: 'pdf', name: 'PDF' },
      { id: 'docx', name: 'Word' },
      { id: 'xlsx', name: 'Excel' }
    ],
    date: [
      { id: 'all', name: 'All Time' },
      { id: 'month', name: 'Past Month' },
      { id: 'quarter', name: 'Past Quarter' },
      { id: 'year', name: 'Past Year' }
    ]
  };

  // Sample documents
  const documents = [
    {
      id: 'vmp-v2.3',
      title: 'Validation Master Plan',
      category: 'validation',
      version: '2.3',
      status: 'current',
      type: 'pdf',
      author: 'John Smith',
      updatedAt: '2025-04-15T10:30:00Z',
      description: 'Overall validation approach and methodology for TrialSage system validation.',
      tags: ['FDA', '21 CFR Part 11', 'Validation'],
      requiredByRegulation: '21 CFR Part 11.10(a)',
      regulatoryReference: 'Computer systems that create, modify, maintain, or transmit electronic records shall be validated to ensure accuracy, reliability, and consistent intended performance.',
      sections: [
        'Validation Policy',
        'Roles and Responsibilities',
        'Validation Approach',
        'Validation Lifecycle',
        'Risk Management',
        'Change Control',
        'Validation Maintenance',
        'Appendices'
      ]
    },
    {
      id: 'srs-v3.1',
      title: 'System Requirements Specification',
      category: 'specification',
      version: '3.1',
      status: 'current',
      type: 'docx',
      author: 'Mary Johnson',
      updatedAt: '2025-03-28T14:25:00Z',
      description: 'Detailed functional and non-functional requirements for the TrialSage system.',
      tags: ['Requirements', '21 CFR Part 11', 'System Design'],
      requiredByRegulation: '21 CFR Part 11.10(a)',
      regulatoryReference: 'Computer systems that create, modify, maintain, or transmit electronic records shall be validated to ensure accuracy, reliability, and consistent intended performance.',
      sections: [
        'Introduction',
        'System Overview',
        'Functional Requirements',
        'Data Requirements',
        'Security Requirements',
        'Performance Requirements',
        'Compliance Requirements',
        'Traceability Matrix'
      ]
    },
    {
      id: 'tm-v2.4',
      title: 'Traceability Matrix',
      category: 'validation',
      version: '2.4',
      status: 'current',
      type: 'xlsx',
      author: 'Robert Wilson',
      updatedAt: '2025-04-20T09:15:00Z',
      description: 'Mapping of system requirements to test cases and validation evidence.',
      tags: ['Validation', '21 CFR Part 11', 'Documentation'],
      requiredByRegulation: '21 CFR Part 11.10(a)',
      regulatoryReference: 'Computer systems that create, modify, maintain, or transmit electronic records shall be validated to ensure accuracy, reliability, and consistent intended performance.',
      sections: [
        'Requirement Traceability',
        'Test Case Mapping',
        'Validation Evidence',
        'Coverage Analysis',
        'Gap Analysis'
      ]
    },
    {
      id: 'vsr-v1.2',
      title: 'Validation Summary Report',
      category: 'validation',
      version: '1.2',
      status: 'current',
      type: 'pdf',
      author: 'Sarah Chen',
      updatedAt: '2025-04-22T16:40:00Z',
      description: 'Summary of validation activities and results for the TrialSage system.',
      tags: ['Validation', '21 CFR Part 11', 'Report'],
      requiredByRegulation: '21 CFR Part 11.10(a)',
      regulatoryReference: 'Computer systems that create, modify, maintain, or transmit electronic records shall be validated to ensure accuracy, reliability, and consistent intended performance.',
      sections: [
        'Executive Summary',
        'Validation Scope',
        'Validation Activities',
        'Test Summary',
        'Discrepancies and Resolutions',
        'Conclusion',
        'Approval'
      ]
    },
    {
      id: 'sop-001',
      title: 'Electronic Signature Use',
      category: 'sop',
      version: '1.5',
      status: 'current',
      type: 'pdf',
      author: 'Michael Davis',
      updatedAt: '2025-03-12T11:20:00Z',
      description: 'Standard operating procedure for the use of electronic signatures in the TrialSage system.',
      tags: ['SOP', '21 CFR Part 11', 'Electronic Signatures'],
      requiredByRegulation: '21 CFR Part 11.100',
      regulatoryReference: 'Electronic signatures shall employ at least two distinct identification components.',
      sections: [
        'Purpose',
        'Scope',
        'Responsibilities',
        'Procedure',
        'Signature Components',
        'Signature Meaning',
        'Verification Process',
        'References'
      ]
    },
    {
      id: 'sop-002',
      title: 'System Access Control',
      category: 'sop',
      version: '2.1',
      status: 'current',
      type: 'pdf',
      author: 'Jennifer Lee',
      updatedAt: '2025-04-05T13:45:00Z',
      description: 'Standard operating procedure for controlling access to the TrialSage system.',
      tags: ['SOP', '21 CFR Part 11', 'Security'],
      requiredByRegulation: '21 CFR Part 11.10(d)',
      regulatoryReference: 'Limiting system access to authorized individuals.',
      sections: [
        'Purpose',
        'Scope',
        'Responsibilities',
        'User Management',
        'Role-Based Access',
        'Password Management',
        'Access Review',
        'References'
      ]
    },
    {
      id: 'sop-003',
      title: 'Audit Trail Review',
      category: 'sop',
      version: '1.3',
      status: 'current',
      type: 'pdf',
      author: 'David Smith',
      updatedAt: '2025-03-28T09:30:00Z',
      description: 'Standard operating procedure for reviewing audit trails in the TrialSage system.',
      tags: ['SOP', '21 CFR Part 11', 'Audit Trails'],
      requiredByRegulation: '21 CFR Part 11.10(e)',
      regulatoryReference: 'Use of secure, computer-generated, time-stamped audit trails to independently record the date and time of operator entries and actions that create, modify, or delete electronic records.',
      sections: [
        'Purpose',
        'Scope',
        'Responsibilities',
        'Review Frequency',
        'Review Process',
        'Issue Management',
        'Documentation',
        'References'
      ]
    },
    {
      id: 'tr-001',
      title: '21 CFR Part 11 Training',
      category: 'training',
      version: '3.0',
      status: 'current',
      type: 'pdf',
      author: 'Emily Rodriguez',
      updatedAt: '2025-02-18T14:15:00Z',
      description: 'Training materials and records for 21 CFR Part 11 compliance.',
      tags: ['Training', '21 CFR Part 11', 'Compliance'],
      requiredByRegulation: '21 CFR Part 11.10(i)',
      regulatoryReference: 'Determination that persons who develop, maintain, or use electronic record/electronic signature systems have the education, training, and experience to perform their assigned tasks.',
      sections: [
        'Training Objectives',
        'Regulatory Overview',
        'System Controls',
        'Electronic Signatures',
        'Documentation',
        'Responsibilities',
        'Assessment',
        'Certification'
      ]
    },
    {
      id: 'ra-001',
      title: 'System Risk Assessment',
      category: 'risk',
      version: '2.2',
      status: 'current',
      type: 'pdf',
      author: 'Thomas Wilson',
      updatedAt: '2025-04-10T11:20:00Z',
      description: 'Risk assessment for the TrialSage system identifying and evaluating potential risks.',
      tags: ['Risk', 'Assessment', 'Security'],
      requiredByRegulation: '21 CFR Part 11.10(a)',
      regulatoryReference: 'Computer systems that create, modify, maintain, or transmit electronic records shall be validated to ensure accuracy, reliability, and consistent intended performance.',
      sections: [
        'Risk Assessment Methodology',
        'System Overview',
        'Identified Risks',
        'Risk Analysis',
        'Risk Mitigation',
        'Residual Risk',
        'Conclusions',
        'Approval'
      ]
    },
    {
      id: 'cert-001',
      title: 'SOC 2 Type II Compliance Certificate',
      category: 'certificate',
      version: '1.0',
      status: 'current',
      type: 'pdf',
      author: 'External Auditor',
      updatedAt: '2025-01-15T10:00:00Z',
      description: 'SOC 2 Type II compliance certificate for the TrialSage system.',
      tags: ['Compliance', 'Certificate', 'Security'],
      requiredByRegulation: 'Not directly required by 21 CFR Part 11, but supports compliance',
      regulatoryReference: 'Supports overall system security and reliability requirements.',
      sections: [
        'Certification Scope',
        'Assessment Criteria',
        'Assessment Results',
        'Compliance Statement',
        'Validity Period',
        'Auditor Information'
      ]
    }
  ];

  // Filter documents based on search term, category, and filters
  const filteredDocuments = documents.filter(doc => {
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
    // Filter by category
    const matchesCategory = currentCategory === 'all' || doc.category === currentCategory;
    
    // Filter by status
    const matchesStatus = selectedFilters.status.length === 0 || 
      selectedFilters.status.includes(doc.status);
    
    // Filter by type
    const matchesType = selectedFilters.type.length === 0 || 
      selectedFilters.type.includes(doc.type);
    
    // Filter by date
    let matchesDate = true;
    const docDate = new Date(doc.updatedAt);
    const now = new Date();
    
    if (selectedFilters.date === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      matchesDate = docDate >= oneMonthAgo;
    } else if (selectedFilters.date === 'quarter') {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      matchesDate = docDate >= threeMonthsAgo;
    } else if (selectedFilters.date === 'year') {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      matchesDate = docDate >= oneYearAgo;
    }
    
    return matchesSearch && matchesCategory && matchesStatus && matchesType && matchesDate;
  });

  // Toggle filter selection
  const toggleFilter = (type, value) => {
    setSelectedFilters(prev => {
      if (type === 'date') {
        return { ...prev, date: value };
      }
      
      const newFilters = [...prev[type]];
      const index = newFilters.indexOf(value);
      
      if (index === -1) {
        newFilters.push(value);
      } else {
        newFilters.splice(index, 1);
      }
      
      return { ...prev, [type]: newFilters };
    });
  };

  // Toggle document expansion
  const toggleDocumentExpansion = (docId) => {
    setExpandedDocument(expandedDocument === docId ? null : docId);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-hotpink-600 to-hotpink-800 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          FDA Compliance Documentation
        </h2>
        <p className="text-hotpink-100 text-sm mt-1">
          Complete documentation required for FDA 21 CFR Part 11 compliance
        </p>
      </div>
      
      {/* Search and filters */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-hotpink-500 focus:border-hotpink-500 sm:text-sm"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2">
            <div className="relative inline-block text-left">
              <div>
                <button
                  type="button"
                  className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink-500"
                  id="filter-menu"
                  aria-expanded="true"
                  aria-haspopup="true"
                >
                  <Filter className="mr-2 h-5 w-5 text-gray-400" />
                  Filters
                </button>
              </div>
            </div>
            
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-hotpink-600 hover:bg-hotpink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink-500"
            >
              <Download className="mr-2 -ml-1 h-5 w-5" />
              Export
            </button>
          </div>
        </div>
        
        {/* Filter selections */}
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="bg-gray-100 rounded-md px-3 py-1 text-sm font-medium text-gray-800 flex items-center">
            Status:
            {selectedFilters.status.length === 0 ? (
              <span className="ml-2 text-gray-500">Any</span>
            ) : (
              <div className="flex gap-1 ml-2">
                {selectedFilters.status.map(status => (
                  <span key={status} className="bg-white rounded-full px-2 py-0.5 text-xs flex items-center">
                    {status}
                    <button
                      className="ml-1 text-gray-400 hover:text-gray-600"
                      onClick={() => toggleFilter('status', status)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-gray-100 rounded-md px-3 py-1 text-sm font-medium text-gray-800 flex items-center">
            Type:
            {selectedFilters.type.length === 0 ? (
              <span className="ml-2 text-gray-500">Any</span>
            ) : (
              <div className="flex gap-1 ml-2">
                {selectedFilters.type.map(type => (
                  <span key={type} className="bg-white rounded-full px-2 py-0.5 text-xs flex items-center">
                    {type}
                    <button
                      className="ml-1 text-gray-400 hover:text-gray-600"
                      onClick={() => toggleFilter('type', type)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-gray-100 rounded-md px-3 py-1 text-sm font-medium text-gray-800 flex items-center">
            Date:
            <span className="ml-2 text-gray-500">
              {filterOptions.date.find(d => d.id === selectedFilters.date)?.name}
            </span>
          </div>
          
          {(selectedFilters.status.length > 0 || selectedFilters.type.length > 0 || selectedFilters.date !== 'all') && (
            <button
              className="text-hotpink-600 hover:text-hotpink-800 text-sm font-medium"
              onClick={() => setSelectedFilters({ status: [], type: [], date: 'all' })}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
      
      {/* Categories */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-3 overflow-x-auto">
          <nav className="-mb-px flex space-x-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setCurrentCategory(category.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  currentCategory === category.id
                    ? 'border-hotpink-500 text-hotpink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Document list */}
      <div className="overflow-hidden">
        {filteredDocuments.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredDocuments.map((document) => (
              <li key={document.id}>
                <div 
                  className={`px-6 py-4 ${expandedDocument === document.id ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                >
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleDocumentExpansion(document.id)}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                        <FileText className={`h-5 w-5 ${
                          document.type === 'pdf' ? 'text-red-600' :
                          document.type === 'docx' ? 'text-blue-600' :
                          document.type === 'xlsx' ? 'text-green-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center">
                          <h3 className="text-sm font-medium text-gray-900">{document.title}</h3>
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            v{document.version}
                          </span>
                          {document.status === 'current' && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Current
                            </span>
                          )}
                          {document.status === 'draft' && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Draft
                            </span>
                          )}
                          {document.status === 'archived' && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Archived
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex text-xs text-gray-500">
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {document.author}
                          </div>
                          <span className="mx-2">•</span>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(document.updatedAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex items-center">
                      <span className="text-gray-500">
                        {expandedDocument === document.id ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                      </span>
                    </div>
                  </div>
                  
                  {expandedDocument === document.id && (
                    <div className="mt-4 pl-14">
                      <div className="text-sm text-gray-500 mb-4">
                        <p>{document.description}</p>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                          Tags
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {document.tags.map((tag) => (
                            <span 
                              key={tag} 
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-hotpink-100 text-hotpink-800"
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                          Regulatory Reference
                        </h4>
                        <div className="bg-blue-50 rounded-md p-3 flex">
                          <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
                          <div className="ml-3">
                            <p className="text-xs font-medium text-blue-800 mb-1">
                              {document.requiredByRegulation}
                            </p>
                            <p className="text-xs text-blue-700">
                              {document.regulatoryReference}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                          Document Sections
                        </h4>
                        <ul className="space-y-2">
                          {document.sections.map((section) => (
                            <li key={section} className="flex items-center text-sm text-gray-700">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              {section}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-hotpink-600 hover:bg-hotpink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink-500"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download Document
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria to find what you're looking for.
            </p>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Showing {filteredDocuments.length} of {documents.length} documents
        </div>
        <div className="flex items-center text-sm text-gray-700">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check className="mr-1 h-3 w-3" />
            FDA 21 CFR Part 11 Compliant
          </span>
        </div>
      </div>
    </div>
  );
}