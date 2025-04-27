import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  Download, 
  Share2, 
  Star, 
  StarOff,
  FolderPlus,
  Files,
  SortAsc,
  List,
  Grid3X3
} from 'lucide-react';
import { useModuleIntegration } from '../integration/ModuleIntegrationLayer';

const TrialVaultModule = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);
  
  const integration = useModuleIntegration();
  
  // Mock documents data
  const documents = [
    { 
      id: 1, 
      title: 'Clinical Study Report - XYZ-123', 
      type: 'CSR',
      sponsor: 'Concept2Cures',
      date: '2025-03-15',
      status: 'Final',
      starred: true,
      tags: ['Phase 2', 'Oncology', 'FDA']
    },
    { 
      id: 2, 
      title: 'Protocol Amendment 2 - Study ABC-456', 
      type: 'Protocol',
      sponsor: 'BioPharma Solutions',
      date: '2025-02-20',
      status: 'Draft',
      starred: false,
      tags: ['Phase 3', 'Cardiology', 'FDA', 'EMA']
    },
    { 
      id: 3, 
      title: 'Statistical Analysis Plan v2.0', 
      type: 'SAP',
      sponsor: 'Concept2Cures',
      date: '2025-01-10',
      status: 'Final',
      starred: true,
      tags: ['Phase 2', 'Oncology', 'FDA']
    },
    { 
      id: 4, 
      title: 'Investigator Brochure - Compound XYZ', 
      type: 'IB',
      sponsor: 'NextGen Therapeutics',
      date: '2024-12-05',
      status: 'Final',
      starred: false,
      tags: ['Preclinical', 'Neurology', 'FDA', 'PMDA']
    },
    { 
      id: 5, 
      title: 'Clinical Study Protocol v1.0 - Study DEF-789', 
      type: 'Protocol',
      sponsor: 'Concept2Cures',
      date: '2024-11-18',
      status: 'Final',
      starred: false,
      tags: ['Phase 1', 'Immunology', 'FDA', 'EMA', 'NMPA']
    },
    { 
      id: 6, 
      title: 'Module 2.5 Clinical Overview - NDA Submission', 
      type: 'CTD',
      sponsor: 'BioPharma Solutions',
      date: '2024-10-30',
      status: 'Draft',
      starred: true,
      tags: ['NDA', 'Cardiology', 'FDA']
    }
  ];
  
  // Filter documents based on search term
  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.sponsor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const toggleDocumentStar = (docId) => {
    // In a real implementation, this would update the document in the database
    console.log(`Toggling star for document ${docId}`);
  };
  
  const handleDocumentClick = (doc) => {
    setSelectedDocument(doc);
    
    // Update shared data in the integration layer
    integration.updateSharedData('selectedDocument', doc);
    integration.triggerEvent('document-selected', { documentId: doc.id });
  };
  
  // File type to icon color mapping
  const getTypeColor = (type) => {
    const typeMap = {
      'CSR': 'text-purple-500',
      'Protocol': 'text-blue-500',
      'SAP': 'text-green-500',
      'IB': 'text-orange-500',
      'CTD': 'text-pink-500'
    };
    
    return typeMap[type] || 'text-gray-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">TrialSage Vault™</h1>
        
        <div className="flex space-x-2">
          <button className="px-3 py-1.5 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors flex items-center">
            <Plus size={16} className="mr-1" />
            <span>Upload Document</span>
          </button>
          <button className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center">
            <FolderPlus size={16} className="mr-1" />
            <span>New Folder</span>
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Search and filters bar */}
        <div className="border-b border-gray-200 p-4 flex flex-wrap md:flex-nowrap gap-3 justify-between">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search documents..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => setFilterVisible(!filterVisible)}
              className={`px-3 py-2 border ${filterVisible ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-gray-300 text-gray-600'} rounded-md hover:bg-gray-50 transition-colors flex items-center`}
            >
              <Filter size={18} className="mr-1" />
              <span>Filters</span>
            </button>
            
            <button className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center">
              <SortAsc size={18} className="mr-1" />
              <span>Sort</span>
            </button>
            
            <div className="flex rounded-md overflow-hidden border border-gray-300">
              <button 
                onClick={() => setViewMode('list')}
                className={`px-2 py-2 ${viewMode === 'list' ? 'bg-gray-100' : 'bg-white'} hover:bg-gray-50 transition-colors`}
                title="List view"
              >
                <List size={18} />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`px-2 py-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'bg-white'} hover:bg-gray-50 transition-colors`}
                title="Grid view"
              >
                <Grid3X3 size={18} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Filters panel - conditionally rendered */}
        {filterVisible && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500">
                  <option value="">All Types</option>
                  <option value="CSR">Clinical Study Report</option>
                  <option value="Protocol">Protocol</option>
                  <option value="SAP">Statistical Analysis Plan</option>
                  <option value="IB">Investigator Brochure</option>
                  <option value="CTD">CTD Module</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sponsor</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500">
                  <option value="">All Sponsors</option>
                  <option value="Concept2Cures">Concept2Cures</option>
                  <option value="BioPharma Solutions">BioPharma Solutions</option>
                  <option value="NextGen Therapeutics">NextGen Therapeutics</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500">
                  <option value="">All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="In Review">In Review</option>
                  <option value="Final">Final</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="date" 
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                  />
                  <span>to</span>
                  <input 
                    type="date" 
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-4 space-x-2">
              <button className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors">
                Clear Filters
              </button>
              <button className="px-3 py-1.5 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors">
                Apply Filters
              </button>
            </div>
          </div>
        )}
        
        {/* Document list/grid */}
        {viewMode === 'grid' ? (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map(doc => (
              <div 
                key={doc.id}
                className={`border rounded-lg overflow-hidden hover:shadow-md transition-shadow ${
                  selectedDocument?.id === doc.id ? 'border-pink-500 ring-1 ring-pink-500' : 'border-gray-200'
                }`}
                onClick={() => handleDocumentClick(doc)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <FileText size={20} className={`${getTypeColor(doc.type)} mr-2`} />
                      <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">{doc.type}</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleDocumentStar(doc.id); }}
                      className="text-gray-400 hover:text-yellow-400"
                    >
                      {doc.starred ? <Star size={18} className="fill-yellow-400 text-yellow-400" /> : <StarOff size={18} />}
                    </button>
                  </div>
                  
                  <h3 className="font-medium mt-2 text-sm line-clamp-2">{doc.title}</h3>
                  
                  <div className="mt-3 flex flex-wrap gap-1">
                    {doc.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">{tag}</span>
                    ))}
                    {doc.tags.length > 3 && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">+{doc.tags.length - 3} more</span>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <div className="text-xs text-gray-500">{doc.date}</div>
                    <div className="flex space-x-1">
                      <button className="p-1 text-gray-400 hover:text-gray-600" title="Download">
                        <Download size={16} />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600" title="Share">
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredDocuments.map(doc => (
              <div 
                key={doc.id}
                className={`p-4 hover:bg-gray-50 transition-colors flex items-center ${
                  selectedDocument?.id === doc.id ? 'bg-pink-50' : ''
                }`}
                onClick={() => handleDocumentClick(doc)}
              >
                <div className="mr-4">
                  <FileText size={24} className={getTypeColor(doc.type)} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <h3 className="font-medium text-sm truncate mr-2">{doc.title}</h3>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">{doc.type}</span>
                    {doc.status === 'Draft' && (
                      <span className="ml-2 text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">Draft</span>
                    )}
                  </div>
                  
                  <div className="mt-1 flex items-center text-xs text-gray-500">
                    <span>{doc.sponsor}</span>
                    <span className="mx-2">•</span>
                    <span>{doc.date}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleDocumentStar(doc.id); }}
                    className="p-1 text-gray-400 hover:text-yellow-400"
                  >
                    {doc.starred ? <Star size={18} className="fill-yellow-400 text-yellow-400" /> : <StarOff size={18} />}
                  </button>
                  
                  <button className="p-1 text-gray-400 hover:text-gray-600" title="Download">
                    <Download size={18} />
                  </button>
                  
                  <button className="p-1 text-gray-400 hover:text-gray-600" title="Share">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Empty state */}
        {filteredDocuments.length === 0 && (
          <div className="p-8 text-center">
            <Files size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No documents found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria
            </p>
            <button className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors inline-flex items-center">
              <Plus size={16} className="mr-1" />
              <span>Upload New Document</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Selected document details panel - would be shown when a document is selected */}
      {selectedDocument && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <FileText size={24} className={`${getTypeColor(selectedDocument.type)} mr-2`} />
              <h2 className="text-xl font-medium">{selectedDocument.title}</h2>
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center">
                <Download size={16} className="mr-1" />
                <span>Download</span>
              </button>
              <button className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center">
                <Share2 size={16} className="mr-1" />
                <span>Share</span>
              </button>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Document Type</h3>
              <p>{selectedDocument.type}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Sponsor</h3>
              <p>{selectedDocument.sponsor}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Date</h3>
              <p>{selectedDocument.date}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <p>{selectedDocument.status}</p>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500">Tags</h3>
              <div className="mt-1 flex flex-wrap gap-1">
                {selectedDocument.tags.map((tag, index) => (
                  <span key={index} className="text-xs px-2 py-1 bg-gray-100 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Document preview would go here */}
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Document Preview</h3>
            <div className="bg-gray-100 rounded-md p-6 text-center">
              <p className="text-gray-500">Document preview would appear here...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrialVaultModule;