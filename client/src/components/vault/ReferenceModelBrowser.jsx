import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ScrollArea
} from '@/components/ui';
// Import icons from a simple custom component since we may have issues with lucide-react
// This is a temporary solution until we properly set up the icon library
// Add some CSS for the emoji icons
const iconStyles = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.2em',
  lineHeight: 1,
  verticalAlign: 'middle'
};

// Add a keyframes animation for the loader
const keyframesStyle = `
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

// We'll move the useEffect inside the component function instead

const IconComponents = {
  FolderTree: (props) => <span style={iconStyles} className={`icon ${props.className || ''}`}>📁</span>,
  Search: (props) => <span style={iconStyles} className={`icon ${props.className || ''}`}>🔍</span>,
  Filter: (props) => <span style={iconStyles} className={`icon ${props.className || ''}`}>🔧</span>,
  ShieldCheck: (props) => <span style={iconStyles} className={`icon ${props.className || ''}`}>🔒</span>,
  FileText: (props) => <span style={iconStyles} className={`icon ${props.className || ''}`}>📄</span>,
  Clock: (props) => <span style={iconStyles} className={`icon ${props.className || ''}`}>🕒</span>,
  Calendar: (props) => <span style={iconStyles} className={`icon ${props.className || ''}`}>📅</span>,
  Trash2: (props) => <span style={iconStyles} className={`icon ${props.className || ''}`}>🗑️</span>,
  Archive: (props) => <span style={iconStyles} className={`icon ${props.className || ''}`}>📦</span>,
  ChevronRight: (props) => <span style={iconStyles} className={`icon ${props.className || ''}`}>▶️</span>,
  PlusCircle: (props) => <span style={iconStyles} className={`icon ${props.className || ''}`}>➕</span>,
  CircleAlert: (props) => <span style={iconStyles} className={`icon ${props.className || ''}`}>⚠️</span>,
  Loader2: (props) => <span style={{...iconStyles, animation: props.className?.includes('animate-spin') ? 'pulse 1s infinite' : 'none'}} className={`icon ${props.className || ''}`}>⏳</span>,
  CheckSquare: (props) => <span style={iconStyles} className={`icon ${props.className || ''}`}>✅</span>,
  BookOpen: (props) => <span style={iconStyles} className={`icon ${props.className || ''}`}>📖</span>,
  FileCheck: (props) => <span style={iconStyles} className={`icon ${props.className || ''}`}>📋</span>,
};

export function ReferenceModelBrowser({ onSelectDocument, selectedDocument }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [expandedFolders, setExpandedFolders] = useState([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Add the animation to the document head
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = keyframesStyle;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Fetch document types
  const typesQuery = useQuery({
    queryKey: ['/api/reference-model/types']
  });
  
  // Fetch document subtypes
  const subtypesQuery = useQuery({
    queryKey: ['/api/reference-model/subtypes'],
    enabled: !!typesQuery.data
  });
  
  // Fetch folder structure
  const foldersQuery = useQuery({
    queryKey: ['/api/reference-model/folders']
  });
  
  // Fetch documents (with optional filter)
  const documentsQuery = useQuery({
    queryKey: ['/api/reference-model/documents', { type: filterType, search: searchTerm }]
  });
  
  // Filter and search documents
  const filteredDocuments = React.useMemo(() => {
    if (!documentsQuery.data) return [];
    
    let docs = documentsQuery.data;
    
    // Apply type filter
    if (filterType) {
      docs = docs.filter(doc => doc.document_type_id === filterType);
    }
    
    // Apply search term
    if (searchTerm && searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      docs = docs.filter(doc => 
        doc.name.toLowerCase().includes(term) || 
        doc.description?.toLowerCase().includes(term)
      );
    }
    
    return docs;
  }, [documentsQuery.data, filterType, searchTerm]);
  
  // Handle folder click
  const handleFolderClick = (folderId) => {
    if (expandedFolders.includes(folderId)) {
      setExpandedFolders(expandedFolders.filter(id => id !== folderId));
    } else {
      setExpandedFolders([...expandedFolders, folderId]);
    }
  };
  
  // Handle document selection
  const handleDocumentSelect = (document) => {
    if (onSelectDocument) {
      onSelectDocument(document);
    }
  };
  
  // Get document type name
  const getDocumentTypeName = (typeId) => {
    if (!typesQuery.data) return 'Unknown Type';
    const type = typesQuery.data.find(t => t.id === typeId);
    return type ? type.name : 'Unknown Type';
  };
  
  // Get document subtype name
  const getDocumentSubtypeName = (subtypeId) => {
    if (!subtypesQuery.data) return 'Unknown Subtype';
    const subtype = subtypesQuery.data.find(s => s.id === subtypeId);
    return subtype ? subtype.name : 'Unknown Subtype';
  };
  
  // Get document status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      case 'In Review':
        return <Badge className="bg-blue-100 text-blue-800">In Review</Badge>;
      case 'Current':
        return <Badge className="bg-green-100 text-green-800">Current</Badge>;
      case 'Superseded':
        return <Badge className="bg-gray-100 text-gray-800">Superseded</Badge>;
      case 'Archived':
        return <Badge className="bg-purple-100 text-purple-800">Archived</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status || 'Unknown'}</Badge>;
    }
  };
  
  // Render folder structure recursively
  const renderFolders = (folders, parentId = null, level = 0) => {
    if (!folders) return null;
    
    const filteredFolders = folders.filter(folder => folder.parent_id === parentId);
    
    if (filteredFolders.length === 0) return null;
    
    return filteredFolders.map(folder => {
      const hasChildren = folders.some(f => f.parent_id === folder.id);
      const isExpanded = expandedFolders.includes(folder.id);
      
      return (
        <div key={folder.id} style={{ marginLeft: `${level * 16}px` }}>
          <div 
            className="flex items-center py-2 px-2 hover:bg-gray-50 rounded cursor-pointer"
            onClick={() => handleFolderClick(folder.id)}
          >
            <div className="mr-2">
              {hasChildren ? (
                <IconComponents.ChevronRight 
                  className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                />
              ) : (
                <div className="w-4"></div>
              )}
            </div>
            <IconComponents.FolderTree className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-sm font-medium">{folder.name}</span>
          </div>
          
          {isExpanded && hasChildren && (
            <div className="ml-4">
              {renderFolders(folders, folder.id, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };
  
  // Render document list
  const renderDocuments = () => {
    if (documentsQuery.isLoading) {
      return (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-3 border rounded-md">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      );
    }
    
    if (documentsQuery.error) {
      return (
        <div className="p-4 text-center">
          <IconComponents.CircleAlert className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p>Error loading documents</p>
          <p className="text-sm text-gray-500">{documentsQuery.error.message}</p>
        </div>
      );
    }
    
    if (filteredDocuments.length === 0) {
      return (
        <div className="p-4 text-center">
          <IconComponents.FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No documents found</p>
          {searchTerm && (
            <p className="text-sm text-gray-500">Try a different search term</p>
          )}
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        {filteredDocuments.map(doc => (
          <div 
            key={doc.id}
            className={`p-3 border rounded-md hover:bg-gray-50 cursor-pointer ${
              selectedDocument?.id === doc.id ? 'border-hotpink-500 bg-hotpink-50' : ''
            }`}
            onClick={() => handleDocumentSelect(doc)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-medium text-sm">{doc.name}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {getDocumentTypeName(doc.document_type_id)} &middot; {getDocumentSubtypeName(doc.document_subtype_id)}
                </p>
              </div>
              <div>
                {getStatusBadge(doc.status)}
              </div>
            </div>
            {doc.description && (
              <p className="text-xs text-gray-600 mt-2 line-clamp-2">{doc.description}</p>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  // Render retention info
  const renderRetentionInfo = (document) => {
    if (!document || !subtypesQuery.data) return null;
    
    const subtype = subtypesQuery.data.find(s => s.id === document.document_subtype_id);
    if (!subtype) return null;
    
    return (
      <div className="grid grid-cols-3 gap-4 mt-4">
        {subtype.review_interval && (
          <div className="border rounded-md p-3">
            <div className="flex items-center text-blue-600 mb-1">
              <IconComponents.Calendar className="h-4 w-4 mr-1" />
              <span className="text-xs font-medium">Periodic Review</span>
            </div>
            <p className="text-sm">{subtype.review_interval} months</p>
          </div>
        )}
        
        {subtype.archive_after && (
          <div className="border rounded-md p-3">
            <div className="flex items-center text-purple-600 mb-1">
              <IconComponents.Archive className="h-4 w-4 mr-1" />
              <span className="text-xs font-medium">Archive After</span>
            </div>
            <p className="text-sm">{subtype.archive_after} months</p>
          </div>
        )}
        
        {subtype.delete_after && (
          <div className="border rounded-md p-3">
            <div className="flex items-center text-red-600 mb-1">
              <IconComponents.Trash2 className="h-4 w-4 mr-1" />
              <span className="text-xs font-medium">Delete After</span>
            </div>
            <p className="text-sm">{subtype.delete_after} months</p>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">
              <IconComponents.FolderTree className="h-4 w-4 mr-2" />
              Browse
            </TabsTrigger>
            <TabsTrigger value="search">
              <IconComponents.Search className="h-4 w-4 mr-2" />
              Search
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <TabsContent value="browse" className="flex-1 overflow-hidden">
        <div className="grid grid-cols-3 gap-4 h-full">
          <Card className="col-span-1 h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Reference Model</CardTitle>
              <CardDescription>Browse the document structure</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-2">
              {foldersQuery.isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <IconComponents.Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : foldersQuery.error ? (
                <div className="p-4 text-center">
                  <IconComponents.CircleAlert className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p>Error loading folder structure</p>
                  <p className="text-sm text-gray-500">Database connection may be unavailable</p>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-240px)]">
                  {renderFolders(foldersQuery.data)}
                </ScrollArea>
              )}
            </CardContent>
          </Card>
          
          <Card className="col-span-2 h-full flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-base">Documents</CardTitle>
                  <CardDescription>
                    {filterType 
                      ? `Documents in category: ${getDocumentTypeName(filterType)}` 
                      : 'All documents'}
                  </CardDescription>
                </div>
                
                <div className="flex items-center gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Document Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Document Types</SelectItem>
                      {typesQuery.data?.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    size="sm" 
                    className="gap-1"
                    onClick={() => setShowUploadDialog(true)}
                  >
                    <IconComponents.PlusCircle className="h-4 w-4" />
                    Upload
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto pb-6">
              {renderDocuments()}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="search" className="flex-1 overflow-hidden">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Search Documents</CardTitle>
            <CardDescription>Search by name, description, or content</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex gap-2 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Search for documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Clear
              </Button>
            </div>
            
            <div className="mb-4">
              <Label className="mb-2 block">Filter by Document Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Document Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Document Types</SelectItem>
                  {typesQuery.data?.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-1 mb-2">
              <h3 className="text-sm font-medium">Search Results</h3>
              <p className="text-xs text-gray-500">
                {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} found
              </p>
            </div>
            
            <ScrollArea className="h-[calc(100vh-340px)]">
              {renderDocuments()}
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>
      
      {selectedDocument && (
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{selectedDocument.name}</CardTitle>
                <CardDescription>
                  {getDocumentTypeName(selectedDocument.document_type_id)} &middot; {getDocumentSubtypeName(selectedDocument.document_subtype_id)}
                </CardDescription>
              </div>
              <div>
                {getStatusBadge(selectedDocument.status)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm">{selectedDocument.description || 'No description provided'}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center">
                <IconComponents.Clock className="h-4 w-4 text-gray-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-sm">
                    {new Date(selectedDocument.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {selectedDocument.updated_at && (
                <div className="flex items-center">
                  <IconComponents.Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <div>
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="text-sm">
                      {new Date(selectedDocument.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {renderRetentionInfo(selectedDocument)}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => onSelectDocument(null)}>
              Close
            </Button>
            <Button onClick={() => window.location.href = `/document/${selectedDocument.id}`}>
              <IconComponents.FileText className="h-4 w-4 mr-2" />
              Open Document
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload New Document</DialogTitle>
            <DialogDescription>
              Upload a new document to the reference model
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="docName">Document Name</Label>
              <Input id="docName" placeholder="Enter document name" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="docType">Document Type</Label>
              <Select>
                <SelectTrigger id="docType">
                  <SelectValue placeholder="Select Document Type" />
                </SelectTrigger>
                <SelectContent>
                  {typesQuery.data?.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="docSubtype">Document Subtype</Label>
              <Select>
                <SelectTrigger id="docSubtype">
                  <SelectValue placeholder="Select Document Subtype" />
                </SelectTrigger>
                <SelectContent>
                  {subtypesQuery.data?.map(subtype => (
                    <SelectItem key={subtype.id} value={subtype.id}>
                      {subtype.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="docFile">Document File</Label>
              <Input id="docFile" type="file" />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button>
              Upload Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ReferenceModelBrowser;