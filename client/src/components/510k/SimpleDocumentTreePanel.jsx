import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  FolderOpen, File, ChevronRight, ChevronDown, 
  FilePlus, FolderPlus, FileText, X, Search, FolderTree
} from 'lucide-react';
import { Input } from "@/components/ui/input";

/**
 * Document Tree Panel
 * 
 * A sliding panel that displays a hierarchical tree of documents in the vault.
 */
const SimpleDocumentTreePanel = ({ isOpen, onClose, documentId }) => {
  const [expandedFolders, setExpandedFolders] = useState({
    'folder-1': true, // Start with the first folder expanded
    'folder-2': false,
    'folder-3': false
  });
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // State to hold file tree structure
  const [vaultFiles, setVaultFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch document structure from API
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        // Get folders structure from the DocuShareService
        const response = await docuShareService.getFolderStructure();
        if (response?.folders) {
          setVaultFiles(response.folders);
        }
      } catch (error) {
        console.error('Error fetching document structure:', error);
        toast({
          title: "Error Loading Documents",
          description: "Could not load document structure. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDocuments();
  }, [documentId]);
      children: [
        { id: 'doc-3-1', name: 'FDA Guidelines.pdf', type: 'document', format: 'pdf' },
        { id: 'doc-3-2', name: 'Submission Checklist.docx', type: 'document', format: 'docx' }
      ]
    }
  ];
  
  // Toggle a folder's expanded state
  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };
  
  // Handle document click
  const handleDocumentClick = (document) => {
    toast({
      title: "Document Selected",
      description: `Opening ${document.name}`,
      variant: "default"
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
  
  // Log for debugging purposes only
  useEffect(() => {
    console.log("DocumentTreePanel mounted with isOpen:", isOpen);
    return () => console.log("DocumentTreePanel unmounted");
  }, [isOpen]);
  
  return (
    <div 
      className={`fixed inset-y-0 right-0 w-[350px] bg-white border-l shadow-xl z-[100] transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-gray-50">
          <div className="flex items-center">
            <FolderTree className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="font-semibold text-lg">Document Vault</h2>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X size={16} />
          </Button>
        </div>
        
        {/* Search Box */}
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search files..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* File Tree */}
        <div className="flex-grow overflow-auto">
          <ScrollArea className="h-full">
            <div className="p-3">
              {vaultFiles.map(file => renderDocumentItem(file))}
            </div>
          </ScrollArea>
        </div>
        
        {/* Footer */}
        <div className="p-3 border-t bg-gray-50 flex justify-between">
          <Button variant="outline" size="sm" className="text-xs">
            <FolderPlus size={14} className="mr-1" />
            New Folder
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            <FilePlus size={14} className="mr-1" />
            Upload File
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SimpleDocumentTreePanel;