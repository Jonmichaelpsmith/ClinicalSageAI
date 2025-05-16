import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  FolderOpen,
  Search,
  UploadCloud,
  Download,
  FileText,
  File,
  FileLock2,
  FileArchive,
  Share2,
  Trash2,
  CalendarDays,
  Info,
  Grid3X3,
  LayoutList,
  User,
  ChevronRight,
  Folder,
  ArrowLeft,
  X,
  FileBox,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Sample documents for demo purposes
const sampleDocuments = [
  {
    id: '1',
    name: 'Sample Clinical Evaluation Report',
    type: 'cer',
    category: 'Clinical Evaluation',
    status: 'final',
    description: 'Comprehensive CER for class II medical device following MEDDEV 2.7/1 Rev 4 guidance',
    author: 'John Smith, MD',
    tags: ['CER', 'MEDDEV', 'Final'],
    dateCreated: '2025-02-15T12:00:00Z',
    dateModified: '2025-05-01T09:30:00Z',
    size: 4582912,
    path: '/Clinical Evaluation/CERs',
    filePath: '/attached_assets/CER REPORT EXAMPLE OUTPUT.pdf'
  },
  {
    id: '2',
    name: 'Literature Search Results',
    type: 'literature',
    category: 'Literature',
    status: 'final',
    description: 'Literature review of 45 papers from PubMed and Google Scholar for cardiac devices',
    author: 'Emma Johnson, PhD',
    tags: ['Literature', 'Research', 'PubMed'],
    dateCreated: '2025-01-20T10:15:00Z',
    dateModified: '2025-04-28T14:45:00Z',
    size: 2345678,
    path: '/Clinical Evaluation/Literature',
    filePath: '/attached_assets/7.19.13.Miller-Clinical-Trials.pdf'
  },
  {
    id: '3',
    name: 'Risk Management Report',
    type: 'risk',
    category: 'Risk Management',
    status: 'draft',
    description: 'ISO 14971 compliant risk analysis and evaluation for the device',
    author: 'Robert Chen',
    tags: ['Risk', 'ISO 14971', 'Draft'],
    dateCreated: '2025-03-05T09:00:00Z',
    dateModified: '2025-05-10T11:20:00Z',
    size: 1867234,
    path: '/Risk Management',
    filePath: '/attached_assets/AO_2508_2023_1-3.pdf'
  },
  {
    id: '4',
    name: '510(k) Summary',
    type: '510k',
    category: 'Regulatory',
    status: 'final',
    description: 'FDA 510(k) Summary document for submission',
    author: 'Sarah Miller, RAC',
    tags: ['510k', 'FDA', 'Submission'],
    dateCreated: '2025-04-12T13:30:00Z',
    dateModified: '2025-05-08T16:15:00Z',
    size: 3156289,
    path: '/510k/Submission',
    filePath: '/attached_assets/449782ff-f6b4-4fc2-82e1-9f4740b8ec7e_23135_-_ayesha_siddiqui_v2.pdf'
  },
  {
    id: '5',
    name: 'Substantial Equivalence Report',
    type: '510k',
    category: 'Regulatory',
    status: 'final',
    description: 'Comparison to predicate devices demonstrating substantial equivalence',
    author: 'Thomas Lee, MD',
    tags: ['510k', 'FDA', 'Equivalence'],
    dateCreated: '2025-03-28T11:45:00Z',
    dateModified: '2025-05-05T10:10:00Z',
    size: 2873456,
    path: '/510k/Equivalence',
    filePath: '/attached_assets/2022-JCS-MediaPack.pdf'
  },
  {
    id: '6',
    name: 'Test Report - Biocompatibility',
    type: 'data',
    category: 'Testing',
    status: 'final',
    description: 'Biocompatibility testing results per ISO 10993',
    author: 'Lisa Wong, PhD',
    tags: ['Testing', 'Biocompatibility', 'ISO 10993'],
    dateCreated: '2025-02-08T14:20:00Z',
    dateModified: '2025-04-15T09:30:00Z',
    size: 5241869,
    path: '/Testing/Biocompatibility',
    filePath: '/attached_assets/ICER_Acute-Pain_Evidence-Report_For-Publication_020525.pdf'
  },
  {
    id: '7',
    name: 'Clinical Trial Protocol',
    type: 'pms',
    category: 'Clinical',
    status: 'approved',
    description: 'Protocol for post-market surveillance clinical study',
    author: 'Michael Brown, MD',
    tags: ['Clinical', 'Protocol', 'PMS'],
    dateCreated: '2025-01-15T10:00:00Z',
    dateModified: '2025-03-20T15:45:00Z',
    size: 1958762,
    path: '/Clinical/Protocols',
    filePath: '/attached_assets/DNDi-Clinical-Trial-Protocol-BENDITA-V5.pdf'
  },
  {
    id: '8',
    name: 'Software Validation Report',
    type: '510k',
    category: 'Software',
    status: 'final',
    description: 'Software validation and verification documentation',
    author: 'James Wilson',
    tags: ['Software', 'Validation', '510k'],
    dateCreated: '2025-02-25T09:15:00Z',
    dateModified: '2025-04-10T14:30:00Z',
    size: 3674125,
    path: '/510k/Software',
    filePath: '/attached_assets/48_161.pdf'
  },
  {
    id: '9',
    name: 'ICH Quality Implementation Report',
    type: 'data',
    category: 'Quality',
    status: 'approved',
    description: 'Implementation status of ICH quality guidelines',
    author: 'David Garcia',
    tags: ['ICH', 'Quality', 'Implementation'],
    dateCreated: '2025-03-10T12:45:00Z',
    dateModified: '2025-05-02T11:30:00Z',
    size: 2154738,
    path: '/Quality/Reports',
    filePath: '/attached_assets/ICHImplementationPublicReport_2022_0107.pdf'
  },
  {
    id: '10',
    name: 'Post-Market Surveillance Plan',
    type: 'pms',
    category: 'PMS',
    status: 'approved',
    description: 'Post-market surveillance plan as required by MDR',
    author: 'Jennifer Taylor',
    tags: ['PMS', 'MDR', 'Surveillance'],
    dateCreated: '2025-02-05T11:20:00Z',
    dateModified: '2025-04-20T10:15:00Z',
    size: 1432587,
    path: '/PMS',
    filePath: '/attached_assets/7_structure_and_content_of_clinical_study_reports.pdf'
  }
];

// Sample folder structure for demo
const folderStructure = [
  {
    id: 'folder-1',
    name: 'Clinical Evaluation',
    path: '/Clinical Evaluation',
    children: [
      {
        id: 'folder-1-1',
        name: 'CERs',
        path: '/Clinical Evaluation/CERs',
        children: []
      },
      {
        id: 'folder-1-2',
        name: 'Literature',
        path: '/Clinical Evaluation/Literature',
        children: []
      }
    ]
  },
  {
    id: 'folder-2',
    name: 'Risk Management',
    path: '/Risk Management',
    children: []
  },
  {
    id: 'folder-3',
    name: '510k',
    path: '/510k',
    children: [
      {
        id: 'folder-3-1',
        name: 'Submission',
        path: '/510k/Submission',
        children: []
      },
      {
        id: 'folder-3-2',
        name: 'Equivalence',
        path: '/510k/Equivalence',
        children: []
      },
      {
        id: 'folder-3-3',
        name: 'Software',
        path: '/510k/Software',
        children: []
      }
    ]
  },
  {
    id: 'folder-4',
    name: 'Testing',
    path: '/Testing',
    children: [
      {
        id: 'folder-4-1',
        name: 'Biocompatibility',
        path: '/Testing/Biocompatibility',
        children: []
      }
    ]
  }
];

export default function DocumentVaultPanel({ 
  documentType = 'all', // 'all', 'cer', '510k'
  onDocumentSelect = null,
  jobId = null,
  position = 'left', // 'left', 'right', 'dialog', 'full'
  onClose = null,
  isOpen = false
}) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState(documentType === 'cer' ? 'cer-documents' : documentType === '510k' ? '510k-documents' : 'all-documents');
  const [viewMode, setViewMode] = useState('list');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showPdfViewerDialog, setShowPdfViewerDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documents, setDocuments] = useState(sampleDocuments);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [currentPath, setCurrentPath] = useState('/');
  const [currentPdfUrl, setCurrentPdfUrl] = useState('');
  
  const [uploadMetadata, setUploadMetadata] = useState({
    name: '',
    type: documentType === 'cer' ? 'cer' : documentType === '510k' ? '510k' : 'data',
    category: documentType === 'cer' ? 'Clinical Evaluation' : 'Regulatory',
    status: 'draft',
    description: '',
    author: 'TrialSage AI',
    tags: documentType === 'cer' ? ['CER'] : ['510k']
  });
  
  // Filter documents based on search query, document type, and current path
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = searchQuery === '' || 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesType = currentTab === 'all-documents' || 
      (currentTab === 'cer-documents' && doc.type === 'cer') ||
      (currentTab === '510k-documents' && doc.type === '510k') ||
      (currentTab === 'literature' && doc.type === 'literature') ||
      (currentTab === 'reports' && ['data', 'risk', 'pms'].includes(doc.type));
    
    const matchesPath = doc.path === currentPath || 
      (currentPath === '/' && doc.path.split('/').length === 2); // Show root level files
    
    return matchesSearch && matchesType && matchesPath;
  });
  
  // Get current folder based on path
  const currentFolders = currentPath === '/' 
    ? folderStructure 
    : folderStructure.flatMap(f => getAllSubfolders(f)).filter(f => f.path.startsWith(currentPath) && f.path !== currentPath && f.path.split('/').length === currentPath.split('/').length + 1);
  
  // Helper to get all subfolders
  function getAllSubfolders(folder) {
    const result = [folder];
    if (folder.children && folder.children.length > 0) {
      folder.children.forEach(child => {
        result.push(...getAllSubfolders(child));
      });
    }
    return result;
  }
  
  // Metrics for document dashboard
  const documentMetrics = {
    total: documents.length,
    cer: documents.filter(d => d.type === 'cer').length,
    fivetenk: documents.filter(d => d.type === '510k').length,
    literature: documents.filter(d => d.type === 'literature').length,
    final: documents.filter(d => d.status === 'final').length,
    draft: documents.filter(d => d.status === 'draft').length,
    approved: documents.filter(d => d.status === 'approved').length
  };
  
  // Handle file selection for upload
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setUploadFile(selectedFile);
      setUploadMetadata({
        ...uploadMetadata,
        name: selectedFile.name.split('.')[0], // Use filename as document name
        fileSize: selectedFile.size,
      });
    }
  };
  
  // Handle document upload
  const handleUpload = async () => {
    if (!uploadFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, we would upload the file to the server here
    // For demo, we'll just add it to our local state
    const newDocument = {
      id: Date.now().toString(),
      name: uploadMetadata.name,
      type: uploadMetadata.type,
      category: uploadMetadata.category,
      status: uploadMetadata.status,
      description: uploadMetadata.description,
      author: uploadMetadata.author,
      tags: uploadMetadata.tags,
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      size: uploadFile.size,
      path: currentPath
    };
    
    setDocuments([newDocument, ...documents]);
    setShowUploadDialog(false);
    
    toast({
      title: "Document Uploaded",
      description: `${uploadMetadata.name} was successfully uploaded`,
      variant: "default"
    });
    
    // Reset upload form
    setUploadFile(null);
    setUploadMetadata({
      name: '',
      type: documentType === 'cer' ? 'cer' : documentType === '510k' ? '510k' : 'data',
      category: documentType === 'cer' ? 'Clinical Evaluation' : 'Regulatory',
      status: 'draft',
      description: '',
      author: 'TrialSage AI',
      tags: documentType === 'cer' ? ['CER'] : ['510k']
    });
  };
  
  // Handle document download
  const handleDownload = (doc) => {
    // In a real app, we would download the actual file
    // For demo, let's just show a toast
    toast({
      title: "Download Started",
      description: `Downloading ${doc.name}...`,
      variant: "default"
    });
  };
  
  // Handle document sharing
  const handleShare = (doc) => {
    setSelectedDocument(doc);
    setShowShareDialog(true);
  };
  
  // Handle sharing submit
  const handleShareSubmit = () => {
    toast({
      title: "Document Shared",
      description: `${selectedDocument.name} has been shared successfully`,
      variant: "default"
    });
    setShowShareDialog(false);
  };
  
  // Handle document open
  const handleOpenDocument = (doc) => {
    if (onDocumentSelect) {
      onDocumentSelect(doc);
    } else if (doc.filePath) {
      // Open PDF viewer for demo
      setCurrentPdfUrl(doc.filePath);
      setSelectedDocument(doc);
      setShowPdfViewerDialog(true);
    }
  };
  
  // Handle folder navigation
  const handleFolderClick = (folder) => {
    setCurrentPath(folder.path);
  };
  
  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (path) => {
    setCurrentPath(path);
  };
  
  // Generate breadcrumbs from current path
  const getBreadcrumbs = () => {
    const segments = currentPath.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Root', path: '/' }];
    
    let currentSegmentPath = '';
    for (const segment of segments) {
      currentSegmentPath += '/' + segment;
      breadcrumbs.push({
        name: segment,
        path: currentSegmentPath
      });
    }
    
    return breadcrumbs;
  };
  
  // Document type icon mapping
  const getDocumentIcon = (type) => {
    switch (type) {
      case 'cer':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case '510k':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'literature':
        return <File className="h-5 w-5 text-amber-500" />;
      case 'data':
        return <FileArchive className="h-5 w-5 text-purple-500" />;
      case 'risk':
        return <FileLock2 className="h-5 w-5 text-red-500" />;
      case 'pms':
        return <FileText className="h-5 w-5 text-teal-500" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };
  
  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Determine the style based on position prop
  const getContainerStyle = () => {
    switch (position) {
      case 'left':
        return "w-80 border-r bg-white h-screen fixed left-0 top-0 overflow-y-auto z-50";
      case 'right':
        return "w-80 border-l bg-white h-screen fixed right-0 top-0 overflow-y-auto z-50";
      case 'dialog':
        return ""; // Will be handled by Dialog component
      default:
        return ""; // Full width (default)
    }
  };
  
  const containerStyle = getContainerStyle();
  
  // Main content of the document vault
  const renderContent = () => (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Document Vault</h2>
          <p className="text-sm text-gray-500">
            {documentType === 'cer' 
              ? 'Manage all your clinical evaluation reports and related documents' 
              : documentType === '510k' 
                ? 'Manage all your FDA 510(k) submissions and related documents' 
                : 'Manage all your regulatory documents and files'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => setShowUploadDialog(true)}
            className="gap-1 bg-blue-600 hover:bg-blue-700"
          >
            <UploadCloud className="h-4 w-4" />
            Upload
          </Button>
          <Button
            variant="outline"
            className="gap-1"
          >
            <FolderOpen className="h-4 w-4" />
            New Folder
          </Button>
          {(position === 'left' || position === 'right') && (
            <Button 
              variant="ghost" 
              className="gap-1"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
              Close
            </Button>
          )}
        </div>
      </div>
      
      {/* Document metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-3 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold">{documentMetrics.total}</div>
            <p className="text-xs text-gray-500">Total Documents</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold">{documentMetrics.cer}</div>
            <p className="text-xs text-gray-500">CER Documents</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold">{documentMetrics.fivetenk}</div>
            <p className="text-xs text-gray-500">510(k) Documents</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold">{documentMetrics.literature}</div>
            <p className="text-xs text-gray-500">Literature</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold">{documentMetrics.final}</div>
            <p className="text-xs text-gray-500">Final</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold">{documentMetrics.draft}</div>
            <p className="text-xs text-gray-500">Draft</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search documents..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 items-center">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-auto">
            <TabsList>
              <TabsTrigger value="all-documents">All</TabsTrigger>
              <TabsTrigger value="cer-documents">CER</TabsTrigger>
              <TabsTrigger value="510k-documents">510(k)</TabsTrigger>
              <TabsTrigger value="literature">Literature</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-none"
              onClick={() => setViewMode('list')}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-none"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm">
        <div className="flex items-center overflow-x-auto whitespace-nowrap scrollbar-hide">
          {getBreadcrumbs().map((crumb, index, arr) => (
            <React.Fragment key={crumb.path}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => handleBreadcrumbClick(crumb.path)}
              >
                {index === 0 ? <FolderOpen className="h-4 w-4 mr-1" /> : null}
                {crumb.name}
              </Button>
              {index < arr.length - 1 && (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Main content */}
      <Card>
        <CardContent className="p-0">
          <div className="p-6">
            {loading ? (
              <div className="py-24 flex justify-center">
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
                  <p>Loading documents...</p>
                </div>
              </div>
            ) : error ? (
              <div className="py-12 text-center text-red-600">
                <Info className="h-12 w-12 mx-auto mb-2" />
                <p>{error}</p>
              </div>
            ) : currentFolders.length === 0 && filteredDocuments.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <FileBox className="h-12 w-12 mx-auto mb-2" />
                <p className="mb-2">No documents found</p>
                <Button 
                  variant="outline" 
                  onClick={() => setShowUploadDialog(true)}
                  className="mx-auto"
                >
                  Upload Document
                </Button>
              </div>
            ) : (
              <>
                {/* Folders */}
                {currentFolders.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-medium mb-3">Folders</h3>
                    <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : ''}>
                      {currentFolders.map(folder => (
                        viewMode === 'grid' ? (
                          <Card
                            key={folder.id}
                            className="cursor-pointer transition-all hover:shadow-md"
                            onClick={() => handleFolderClick(folder)}
                          >
                            <CardContent className="p-4 flex flex-col items-center">
                              <Folder className="h-12 w-12 text-amber-500 mb-2" />
                              <span className="text-center font-medium">{folder.name}</span>
                            </CardContent>
                          </Card>
                        ) : (
                          <div
                            key={folder.id}
                            className="flex items-center p-3 rounded-md hover:bg-gray-100 cursor-pointer mb-1"
                            onClick={() => handleFolderClick(folder)}
                          >
                            <Folder className="h-5 w-5 text-amber-500 mr-3" />
                            <span className="font-medium">{folder.name}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Documents */}
                {filteredDocuments.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3">Documents</h3>
                    {viewMode === 'list' ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Modified</TableHead>
                              <TableHead>Size</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredDocuments.map((doc) => (
                              <TableRow 
                                key={doc.id}
                                className="cursor-pointer"
                                onClick={() => handleOpenDocument(doc)}
                              >
                                <TableCell className="font-medium">
                                  <div className="flex items-center">
                                    {getDocumentIcon(doc.type)}
                                    <span className="ml-2">{doc.name}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="capitalize">
                                    {doc.type === '510k' ? '510(k)' : doc.type}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge className={
                                    doc.status === 'final' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                                    doc.status === 'approved' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                                    'bg-amber-100 text-amber-800 hover:bg-amber-100'
                                  }>
                                    {doc.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>{formatDate(doc.dateModified)}</TableCell>
                                <TableCell>{formatFileSize(doc.size)}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={(e) => { e.stopPropagation(); handleDownload(doc); }}
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={(e) => { e.stopPropagation(); handleShare(doc); }}
                                    >
                                      <Share2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredDocuments.map((doc) => (
                          <Card 
                            key={doc.id}
                            className="cursor-pointer transition-all hover:shadow-md overflow-hidden"
                            onClick={() => handleOpenDocument(doc)}
                          >
                            <CardContent className="p-0">
                              <div className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  {getDocumentIcon(doc.type)}
                                  <Badge className={
                                    doc.status === 'final' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                                    doc.status === 'approved' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                                    'bg-amber-100 text-amber-800 hover:bg-amber-100'
                                  }>
                                    {doc.status}
                                  </Badge>
                                </div>
                                <h4 className="font-medium line-clamp-1">{doc.name}</h4>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{doc.description}</p>
                                <div className="flex items-center text-xs text-muted-foreground mt-2">
                                  <User className="h-3 w-3 mr-1" />
                                  <span className="truncate">{doc.author || 'Unknown'}</span>
                                  <span className="mx-1">•</span>
                                  <CalendarDays className="h-3 w-3 mr-1" />
                                  <span>{formatDate(doc.dateModified)}</span>
                                </div>
                              </div>
                              <div className="p-2 border-t flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => { e.stopPropagation(); handleDownload(doc); }}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => { e.stopPropagation(); handleShare(doc); }}
                                >
                                  <Share2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  // Render PDF viewer dialog
  const renderPdfViewer = () => (
    <Dialog open={showPdfViewerDialog} onOpenChange={setShowPdfViewerDialog}>
      <DialogContent className="max-w-5xl h-[80vh] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{selectedDocument?.name || "Document Viewer"}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <iframe 
            src={currentPdfUrl}
            className="w-full h-full border rounded" 
            title="PDF Viewer"
          ></iframe>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowPdfViewerDialog(false)}>
            Close
          </Button>
          <Button onClick={() => window.open(currentPdfUrl, '_blank')}>
            Open in New Tab
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
  
  // Render upload dialog
  const renderUploadDialog = () => (
    <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="file">File</label>
            <Input id="file" type="file" onChange={handleFileChange} />
          </div>
          <div className="grid gap-2">
            <label htmlFor="name">Document Name</label>
            <Input
              id="name"
              value={uploadMetadata.name}
              onChange={(e) => setUploadMetadata({...uploadMetadata, name: e.target.value})}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="type">Document Type</label>
            <select
              id="type"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={uploadMetadata.type}
              onChange={(e) => setUploadMetadata({...uploadMetadata, type: e.target.value})}
            >
              <option value="cer">Clinical Evaluation Report</option>
              <option value="510k">510(k) Document</option>
              <option value="literature">Literature</option>
              <option value="data">Data/Test Report</option>
              <option value="risk">Risk Management</option>
              <option value="pms">Post-Market Surveillance</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="description">Description</label>
            <Input
              id="description"
              value={uploadMetadata.description}
              onChange={(e) => setUploadMetadata({...uploadMetadata, description: e.target.value})}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={uploadMetadata.status}
              onChange={(e) => setUploadMetadata({...uploadMetadata, status: e.target.value})}
            >
              <option value="draft">Draft</option>
              <option value="final">Final</option>
              <option value="approved">Approved</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpload}>Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
  
  // Render share dialog
  const renderShareDialog = () => (
    <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {selectedDocument && (
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <div className="flex items-center">
                {getDocumentIcon(selectedDocument.type)}
                <span className="ml-2 font-medium">{selectedDocument.name}</span>
              </div>
            </div>
          )}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="recipients">Recipients (Email)</label>
              <Input id="recipients" placeholder="Enter email addresses" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="message">Message</label>
              <Input
                id="message"
                placeholder="Add a message (optional)"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="access">Access Level</label>
              <select
                id="access"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="view">View only</option>
                <option value="edit">Can edit</option>
                <option value="admin">Full access</option>
              </select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowShareDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleShareSubmit}>Share</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Render based on position prop
  if (position === 'dialog') {
    return (
      <>
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Document Vault</DialogTitle>
              <DialogDescription>
                Browse and manage all your regulatory documents
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[70vh]">
              {renderContent()}
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {renderPdfViewer()}
        {renderUploadDialog()}
        {renderShareDialog()}
      </>
    );
  }
  
  // For left or right position
  if (position === 'left' || position === 'right') {
    if (!isOpen) return null;
    
    return (
      <>
        <div className={containerStyle}>
          <ScrollArea className="h-full p-4">
            {renderContent()}
          </ScrollArea>
        </div>
        {renderPdfViewer()}
        {renderUploadDialog()}
        {renderShareDialog()}
      </>
    );
  }
  
  // Default full view
  return (
    <>
      {renderContent()}
      {renderPdfViewer()}
      {renderUploadDialog()}
      {renderShareDialog()}
    </>
  );
}