import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  FolderOpen, File, ChevronRight, ChevronDown, 
  FilePlus, FolderPlus, Download, FileText, 
  X, Search, FolderTree, AlertCircle, Info,
  Database, Shield, Folder, Copy, RefreshCw
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import docuShareService from "@/services/DocuShareService";

/**
 * Document Tree Panel
 * 
 * A sliding panel that displays a hierarchical tree of documents in the vault.
 */
const DocumentTreePanel = ({ isOpen, onClose, documentId }) => {
  const [documents, setDocuments] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const { toast } = useToast();

  // Mock document structure to demonstrate the tree
  const mockDocuments = [
    {
      id: 'folder-1',
      name: '510(k) Submission Documents',
      type: 'folder',
      children: [
        {
          id: 'folder-1-1',
          name: 'Device Information',
          type: 'folder',
          children: [
            { id: 'doc-1-1-1', name: 'Device Description.docx', type: 'document', format: 'docx' },
            { id: 'doc-1-1-2', name: 'Technical Specifications.pdf', type: 'document', format: 'pdf' },
            { id: 'doc-1-1-3', name: 'Design Drawings.pdf', type: 'document', format: 'pdf' }
          ]
        },
        {
          id: 'folder-1-2',
          name: 'Predicate Devices',
          type: 'folder',
          children: [
            { id: 'doc-1-2-1', name: 'Predicate Device Summary.docx', type: 'document', format: 'docx' },
            { id: 'doc-1-2-2', name: 'Substantial Equivalence Analysis.pdf', type: 'document', format: 'pdf' }
          ]
        },
        {
          id: 'folder-1-3',
          name: 'Testing Reports',
          type: 'folder',
          children: [
            { id: 'doc-1-3-1', name: 'Performance Testing.pdf', type: 'document', format: 'pdf' },
            { id: 'doc-1-3-2', name: 'Biocompatibility Testing.pdf', type: 'document', format: 'pdf' },
            { id: 'doc-1-3-3', name: 'Sterilization Validation.pdf', type: 'document', format: 'pdf' }
          ]
        }
      ]
    },
    {
      id: 'folder-2',
      name: 'Regulatory Documentation',
      type: 'folder',
      children: [
        { id: 'doc-2-1', name: 'FDA Guidance Documents.pdf', type: 'document', format: 'pdf' },
        { id: 'doc-2-2', name: 'FDA Submission Checklist.docx', type: 'document', format: 'docx' },
        {
          id: 'folder-2-1',
          name: 'eSTAR Templates',
          type: 'folder',
          children: [
            { id: 'doc-2-1-1', name: 'eSTAR Template - Class II.docx', type: 'document', format: 'docx' },
            { id: 'doc-2-1-2', name: 'eSTAR Instructions.pdf', type: 'document', format: 'pdf' }
          ]
        }
      ]
    },
    {
      id: 'folder-3',
      name: 'Clinical Resources',
      type: 'folder',
      children: [
        { id: 'doc-3-1', name: 'Clinical Literature Review.pdf', type: 'document', format: 'pdf' },
        { id: 'doc-3-2', name: 'Clinical Study Protocol.docx', type: 'document', format: 'docx' },
        { id: 'doc-3-3', name: 'Clinical Data Summary.pdf', type: 'document', format: 'pdf' }
      ]
    },
    {
      id: 'folder-4',
      name: 'Quality System Documents',
      type: 'folder',
      children: [
        { id: 'doc-4-1', name: 'Quality Manual.pdf', type: 'document', format: 'pdf' },
        { id: 'doc-4-2', name: 'Risk Management Report.pdf', type: 'document', format: 'pdf' },
        { id: 'doc-4-3', name: 'Design Controls Documentation.pdf', type: 'document', format: 'pdf' }
      ]
    },
    {
      id: 'folder-5',
      name: 'Generated FDA 510(k) Submissions',
      type: 'folder',
      children: [
        { id: 'doc-5-1', name: 'FDA 510(k) Submission Package (DRAFT).pdf', type: 'document', format: 'pdf', status: 'draft', date: '2025-05-10T12:30:00Z' },
        { id: 'doc-5-2', name: 'FDA 510(k) Submission Package v1.pdf', type: 'document', format: 'pdf', status: 'final', date: '2025-05-14T09:15:00Z' }
      ]
    }
  ];
  
  // Load documents from DocuShare (Vault)
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      
      const fetchDocuments = async () => {
        try {
          // Attempt to fetch documents from the DocuShare Vault service
          const response = await docuShareService.getDocuments({
            category: '510k',
            documentId: documentId
          });
          
          // Transform the response into a hierarchical structure if needed
          if (response && response.documents) {
            let transformedDocs = [];
            
            // Group documents by collection/folder
            const groupedDocs = response.documents.reduce((acc, doc) => {
              const collection = doc.collection || 'Ungrouped';
              if (!acc[collection]) {
                acc[collection] = [];
              }
              acc[collection].push(doc);
              return acc;
            }, {});
            
            // Create folder structure
            Object.entries(groupedDocs).forEach(([folderName, docs], index) => {
              transformedDocs.push({
                id: `folder-${index}`,
                name: folderName,
                type: 'folder',
                children: docs.map(doc => ({
                  id: doc.id,
                  name: doc.name || doc.title || `Document ${doc.id}`,
                  type: 'document',
                  format: doc.format || doc.fileType || 'unknown',
                  status: doc.status,
                  date: doc.updatedAt || doc.createdAt
                }))
              });
            });
            
            setDocuments(transformedDocs);
          } else {
            // If API fetch fails or returns unexpected structure, fall back to mock data
            console.warn('Using mock document data as API returned unexpected structure');
            setDocuments(mockDocuments);
          }
        } catch (error) {
          console.error('Error fetching documents from Vault:', error);
          console.warn('Falling back to mock document data');
          setDocuments(mockDocuments);
          
          toast({
            title: "Connection Error",
            description: "Could not connect to DocuShare Vault. Using cached documents.",
            variant: "warning"
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchDocuments();
    }
  }, [isOpen, documentId]);
  
  // Toggle a folder's expanded state
  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };
  
  // Handle document click
  const handleDocumentClick = async (document) => {
    setSelectedDocument(document);
    
    // If this is a real document from the Vault, try to fetch more details
    if (document.id && !document.id.startsWith('doc-')) {
      try {
        const docDetails = await docuShareService.getDocument(document.id);
        setSelectedDocument({
          ...document,
          ...docDetails
        });
      } catch (error) {
        console.error('Error fetching document details:', error);
        // Continue with the document we already have
      }
    }
    
    setShowDocumentPreview(true);
  };
  
  // Filter documents based on search term
  const filterDocuments = (docs, term) => {
    if (!term.trim()) return docs;
    
    return docs.filter(doc => {
      if (doc.name.toLowerCase().includes(term.toLowerCase())) {
        return true;
      }
      
      if (doc.type === 'folder' && doc.children) {
        const filteredChildren = filterDocuments(doc.children, term);
        if (filteredChildren.length > 0) {
          // If this folder has matching children, expand it
          setExpandedFolders(prev => ({
            ...prev,
            [doc.id]: true
          }));
          
          // Return a new folder object with only the matching children
          return {
            ...doc,
            children: filteredChildren
          };
        }
      }
      
      return false;
    });
  };
  
  // Render a document icon based on format
  const renderDocumentIcon = (format) => {
    switch (format) {
      case 'pdf':
        return <FileText size={16} className="text-red-500" />;
      case 'docx':
        return <FileText size={16} className="text-blue-500" />;
      case 'xlsx':
        return <FileText size={16} className="text-green-500" />;
      default:
        return <File size={16} className="text-gray-500" />;
    }
  };
  
  // Render document status badge if present
  const renderStatusBadge = (status) => {
    if (!status) return null;
    
    return (
      <Badge className={
        status === 'draft' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' :
        status === 'final' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
        'bg-gray-100 text-gray-800 hover:bg-gray-100'
      }>
        {status === 'draft' ? 'Draft' : status === 'final' ? 'Final' : status}
      </Badge>
    );
  };
  
  // Render a document item (document or folder)
  const renderDocumentItem = (doc, depth = 0) => {
    const isFolder = doc.type === 'folder';
    const isExpanded = expandedFolders[doc.id];
    
    return (
      <div key={doc.id} className="document-tree-item">
        <div 
          className={`flex items-center py-1 px-2 rounded-md cursor-pointer hover:bg-gray-100 ${
            depth > 0 ? 'ml-' + (depth * 4) : ''
          }`}
          onClick={() => isFolder ? toggleFolder(doc.id) : handleDocumentClick(doc)}
        >
          {isFolder ? (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 mr-1 p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(doc.id);
              }}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </Button>
          ) : (
            <span className="ml-7 mr-1">{renderDocumentIcon(doc.format)}</span>
          )}
          
          {isFolder ? (
            <FolderOpen size={16} className="text-yellow-500 mr-1.5" />
          ) : null}
          
          <span className="text-sm truncate flex-grow">{doc.name}</span>
          
          {doc.status && renderStatusBadge(doc.status)}
          
          {isFolder && (
            <span className="text-xs text-gray-500 ml-1">
              ({doc.children?.length || 0})
            </span>
          )}
        </div>
        
        {isFolder && isExpanded && doc.children && (
          <div className="mt-1">
            {doc.children.map(child => renderDocumentItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };
  
  // Filtered documents based on search
  const filteredDocuments = searchTerm ? filterDocuments([...documents], searchTerm) : documents;
  
  return (
    <div className={`
      fixed top-0 right-0 h-full bg-white border-l shadow-xl z-50 transition-all duration-300
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}
    `} style={{ width: '350px' }}>
      <div className="h-full flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center">
            <FolderTree className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="font-semibold text-lg">Document Vault</h2>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8"
          >
            <X size={18} />
          </Button>
        </div>
        
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
            {searchTerm && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-0 top-0 h-9 w-9"
                onClick={() => setSearchTerm('')}
              >
                <X size={14} />
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex-grow overflow-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p>Loading documents...</p>
            </div>
          ) : filteredDocuments.length > 0 ? (
            <ScrollArea className="h-full">
              <div className="p-2">
                {filteredDocuments.map(doc => renderDocumentItem(doc))}
              </div>
            </ScrollArea>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>No documents found</p>
              {searchTerm && (
                <p className="text-sm mt-1">Try adjusting your search terms</p>
              )}
            </div>
          )}
        </div>
        
        <div className="p-3 border-t flex justify-between">
          <Button variant="outline" size="sm">
            <FolderPlus size={14} className="mr-1" />
            New Folder
          </Button>
          <Button variant="outline" size="sm">
            <FilePlus size={14} className="mr-1" />
            Upload
          </Button>
        </div>
      </div>
      
      {/* Document Preview Dialog */}
      <Dialog open={showDocumentPreview} onOpenChange={setShowDocumentPreview}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.name}</DialogTitle>
            <DialogDescription>
              Document preview
            </DialogDescription>
          </DialogHeader>
          
          <div className="border rounded-md p-4 text-center my-4">
            {selectedDocument?.format === 'pdf' ? (
              <div className="text-center">
                <FileText size={48} className="text-red-500 mx-auto mb-2" />
                <p className="text-gray-700 mb-2">PDF Document Preview</p>
                <p className="text-sm text-gray-500">
                  PDF preview is not available in this version.
                </p>
              </div>
            ) : selectedDocument?.format === 'docx' ? (
              <div className="text-center">
                <FileText size={48} className="text-blue-500 mx-auto mb-2" />
                <p className="text-gray-700 mb-2">Word Document Preview</p>
                <p className="text-sm text-gray-500">
                  Word document preview is not available in this version.
                </p>
              </div>
            ) : (
              <div className="text-center">
                <FileText size={48} className="text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Preview not available</p>
              </div>
            )}
          </div>
          
          <div className="flex flex-col space-y-2 text-sm mb-2">
            <div className="flex justify-between">
              <span className="text-gray-500">File Type:</span>
              <span className="font-medium">
                {selectedDocument?.format === 'pdf' ? 'PDF Document' : 
                 selectedDocument?.format === 'docx' ? 'Word Document' : 
                 'Unknown'}
              </span>
            </div>
            
            {selectedDocument?.date && (
              <div className="flex justify-between">
                <span className="text-gray-500">Last Modified:</span>
                <span className="font-medium">
                  {new Date(selectedDocument.date).toLocaleString()}
                </span>
              </div>
            )}
            
            {selectedDocument?.status && (
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span>
                  {renderStatusBadge(selectedDocument.status)}
                </span>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowDocumentPreview(false)}>
              Close
            </Button>
            <Button size="sm">
              <Download size={14} className="mr-1" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentTreePanel;