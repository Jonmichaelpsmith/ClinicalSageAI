import React, { useState, useEffect } from 'react';
import { useDocuShare } from '@/hooks/useDocuShare';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FileText,
  FolderOpen,
  Search,
  Upload,
  Filter,
  Download,
  ClipboardList,
  Filter as FilterIcon,
  Grid3X3,
  List,
  Plus,
  ChevronRight,
  ChevronDown,
  ArrowDownAZ,
  ArrowUpZA,
  Calendar,
  AlignLeft,
} from 'lucide-react';

/**
 * DocumentBrowser Component
 * 
 * This component provides a browsing interface for the DocuShare document management system.
 * It displays documents in either a list or grid view, with filtering, sorting, and search capabilities.
 */
export default function DocumentBrowser({ onSelectDocument }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentFolder, setCurrentFolder] = useState('/');
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  
  const {
    documents,
    folders,
    isLoading,
    error,
    fetchDocuments,
    uploadDocument,
    downloadDocument,
  } = useDocuShare();
  
  // Load documents when component mounts or when folder/filters change
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments, currentFolder]);
  
  // Handle document selection
  const handleSelectDocument = (doc) => {
    setSelectedDocumentId(doc.id);
    if (onSelectDocument) {
      onSelectDocument(doc);
    }
  };
  
  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadDocument(file, currentFolder, activeTab !== 'all' ? activeTab : 'document');
    }
  };
  
  // Handle folder navigation
  const handleFolderClick = (folder) => {
    setCurrentFolder(folder.path);
  };
  
  // Filter documents based on search query and active tab
  const filteredDocuments = React.useMemo(() => {
    if (!documents) return [];
    
    return documents.filter((doc) => {
      // Apply search filter
      const matchesSearch = 
        searchQuery === '' || 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.documentId.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Apply tab filter
      const matchesTab = 
        activeTab === 'all' || 
        doc.type === activeTab;
      
      return matchesSearch && matchesTab;
    });
  }, [documents, searchQuery, activeTab]);
  
  // Sort documents based on sort criteria
  const sortedDocuments = React.useMemo(() => {
    if (!filteredDocuments) return [];
    
    return [...filteredDocuments].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          comparison = new Date(b.modifiedDate) - new Date(a.modifiedDate);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'status':
          comparison = a.controlStatus.localeCompare(b.controlStatus);
          break;
        default:
          comparison = new Date(b.modifiedDate) - new Date(a.modifiedDate);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredDocuments, sortBy, sortOrder]);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  // Get document status badge class
  const getStatusBadgeClass = (status) => {
    const classes = {
      'Approved': 'bg-green-100 text-green-800',
      'In-Review': 'bg-blue-100 text-blue-800',
      'Draft': 'bg-gray-100 text-gray-800',
      'Submitted': 'bg-amber-100 text-amber-800',
      'Active': 'bg-purple-100 text-purple-800',
    };
    
    return classes[status] || 'bg-gray-100 text-gray-800';
  };
  
  // Get document type icon
  const getDocumentTypeIcon = (type) => {
    switch (type) {
      case 'protocol':
        return <ClipboardList className="h-5 w-5 text-blue-600" />;
      case 'report':
        return <FileText className="h-5 w-5 text-green-600" />;
      case 'form':
        return <AlignLeft className="h-5 w-5 text-purple-600" />;
      case 'submission':
        return <FileText className="h-5 w-5 text-amber-600" />;
      case 'correspondence':
        return <FileText className="h-5 w-5 text-sky-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };
  
  // Render folder path breadcrumbs
  const renderBreadcrumbs = () => {
    if (currentFolder === '/') {
      return (
        <div className="flex items-center text-sm text-muted-foreground">
          <span className="font-medium">Root</span>
        </div>
      );
    }
    
    const parts = currentFolder.split('/').filter(Boolean);
    
    return (
      <div className="flex items-center text-sm text-muted-foreground overflow-x-auto">
        <span 
          className="cursor-pointer hover:text-foreground"
          onClick={() => setCurrentFolder('/')}
        >
          Root
        </span>
        
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span 
              className={`cursor-pointer ${index === parts.length - 1 ? 'font-medium text-foreground' : 'hover:text-foreground'}`}
              onClick={() => setCurrentFolder('/' + parts.slice(0, index + 1).join('/'))}
            >
              {part}
            </span>
          </React.Fragment>
        ))}
      </div>
    );
  };
  
  return (
    <Card className="w-full border-teal-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-semibold flex items-center">
              <FileText className="h-5 w-5 mr-2 text-teal-600" />
              DocuShare Document Repository
            </CardTitle>
            <CardDescription>
              21 CFR Part 11 compliant document management system
            </CardDescription>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="h-9">
              <label className="cursor-pointer flex items-center">
                <Upload className="h-4 w-4 mr-1" />
                Upload
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </Button>
            
            <Button variant="default" size="sm" className="h-9 bg-teal-600 hover:bg-teal-700">
              <Plus className="h-4 w-4 mr-1" />
              New Document
            </Button>
          </div>
        </div>
        
        <div className="mt-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search documents..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            {renderBreadcrumbs()}
            
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <FilterIcon className="h-3.5 w-3.5" />
                    <span className="text-xs">Filter</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setActiveTab('all')}>
                    All Documents
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('protocol')}>
                    Protocols Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('report')}>
                    Reports Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('submission')}>
                    Submissions Only
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    {sortOrder === 'asc' ? (
                      <ArrowUpZA className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowDownAZ className="h-3.5 w-3.5" />
                    )}
                    <span className="text-xs">Sort</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => { setSortBy('date'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                    By Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('name'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                    By Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('type'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                    By Type {sortBy === 'type' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('status'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                    By Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <div className="border rounded-md flex">
                <Button 
                  variant={viewMode === 'list' ? 'subtle' : 'ghost'} 
                  size="sm" 
                  className="h-8 px-2 rounded-r-none"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === 'grid' ? 'subtle' : 'ghost'} 
                  size="sm" 
                  className="h-8 px-2 rounded-l-none"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 border-t">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b px-4">
            <TabsList className="mb-px">
              <TabsTrigger value="all" className="text-xs">All Documents</TabsTrigger>
              <TabsTrigger value="protocol" className="text-xs">Protocols</TabsTrigger>
              <TabsTrigger value="report" className="text-xs">Reports</TabsTrigger>
              <TabsTrigger value="submission" className="text-xs">Submissions</TabsTrigger>
              <TabsTrigger value="form" className="text-xs">Forms</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value={activeTab} className="m-0 pt-0">
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin h-8 w-8 border-2 border-teal-500 border-t-transparent rounded-full"></div>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <p className="text-red-500 mb-2">Error loading documents</p>
                <Button variant="outline" onClick={() => fetchDocuments()}>Retry</Button>
              </div>
            ) : (
              <div className="px-4 py-3">
                {/* Folders Section */}
                {currentFolder === '/' && folders && folders.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2 text-muted-foreground">Folders</h3>
                    <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3' : 'space-y-1'}>
                      {folders.map((folder) => (
                        <div
                          key={folder.id}
                          className={`
                            border rounded-md cursor-pointer hover:bg-muted/40 transition-colors
                            ${viewMode === 'grid' ? 'p-3' : 'p-2 flex items-center'}
                          `}
                          onClick={() => handleFolderClick(folder)}
                        >
                          <div className={viewMode === 'grid' ? 'flex items-center mb-1' : 'flex items-center'}>
                            <FolderOpen className={`text-amber-500 ${viewMode === 'grid' ? 'h-5 w-5 mr-2' : 'h-5 w-5 mr-3'}`} />
                            <div>
                              <div className="font-medium text-sm">{folder.name}</div>
                              {viewMode === 'grid' && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {folder.documentCount} document{folder.documentCount !== 1 ? 's' : ''}
                                </div>
                              )}
                            </div>
                            {viewMode === 'list' && (
                              <div className="ml-auto text-xs text-muted-foreground">
                                {folder.documentCount} document{folder.documentCount !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t my-4"></div>
                  </div>
                )}
                
                {/* Documents Section */}
                <div>
                  <h3 className="text-sm font-medium mb-2 text-muted-foreground">
                    Documents {filteredDocuments.length > 0 && `(${filteredDocuments.length})`}
                  </h3>
                  
                  {filteredDocuments.length === 0 ? (
                    <div className="py-8 text-center border rounded-md bg-muted/20">
                      <FileText className="h-8 w-8 text-muted-foreground/60 mx-auto mb-3" />
                      <p className="text-muted-foreground">No documents found</p>
                      {searchQuery && (
                        <Button 
                          variant="link" 
                          className="mt-1 text-teal-600"
                          onClick={() => setSearchQuery('')}
                        >
                          Clear search
                        </Button>
                      )}
                    </div>
                  ) : viewMode === 'grid' ? (
                    // Grid View
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {sortedDocuments.map((doc) => (
                        <Card
                          key={doc.id}
                          className={`overflow-hidden cursor-pointer transition-all hover:border-teal-300 hover:shadow-md ${selectedDocumentId === doc.id ? 'border-teal-500 ring-1 ring-teal-500/30' : ''}`}
                          onClick={() => handleSelectDocument(doc)}
                        >
                          <CardContent className="p-3">
                            <div className="mb-2">
                              {getDocumentTypeIcon(doc.type)}
                            </div>
                            <h4 className="font-medium text-sm mb-1 line-clamp-2">{doc.title}</h4>
                            <div className="flex justify-between items-center mt-2">
                              <Badge className={getStatusBadgeClass(doc.controlStatus)}>
                                {doc.controlStatus}
                              </Badge>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatDate(doc.modifiedDate)}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                              {doc.documentId} • v{doc.version}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    // List View
                    <div className="rounded-md border overflow-hidden">
                      <div className="bg-muted/30 px-4 py-2 text-xs font-medium text-muted-foreground grid grid-cols-12 gap-3">
                        <div className="col-span-6">Name</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2">Type</div>
                        <div className="col-span-2">Modified</div>
                      </div>
                      
                      <ScrollArea className="h-[calc(100vh-21rem)]">
                        <div className="divide-y">
                          {sortedDocuments.map((doc) => (
                            <div
                              key={doc.id}
                              className={`px-4 py-3 grid grid-cols-12 gap-3 cursor-pointer hover:bg-muted/30 transition-colors ${
                                selectedDocumentId === doc.id ? 'bg-teal-50 border-l-2 border-l-teal-600' : ''
                              }`}
                              onClick={() => handleSelectDocument(doc)}
                            >
                              <div className="col-span-6 flex items-center">
                                {getDocumentTypeIcon(doc.type)}
                                <div className="ml-3 min-w-0">
                                  <div className="font-medium text-sm truncate">{doc.title}</div>
                                  <div className="text-xs text-muted-foreground">{doc.documentId} • v{doc.version}</div>
                                </div>
                              </div>
                              
                              <div className="col-span-2 flex items-center">
                                <Badge className={getStatusBadgeClass(doc.controlStatus)}>
                                  {doc.controlStatus}
                                </Badge>
                              </div>
                              
                              <div className="col-span-2 flex items-center text-sm">
                                {doc.documentType || doc.type}
                              </div>
                              
                              <div className="col-span-2 flex items-center text-xs text-muted-foreground">
                                {formatDate(doc.modifiedDate)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="py-3 px-4 border-t flex justify-between items-center bg-muted/10">
        <div className="text-xs text-muted-foreground">
          Connected to DocuShare server: <span className="font-mono">TrialSAGE-DS7</span>
        </div>
        {selectedDocumentId && (
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8"
            onClick={() => downloadDocument(selectedDocumentId)}
          >
            <Download className="h-3 w-3 mr-1" />
            Download Selected
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}