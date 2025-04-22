import { useState, useEffect } from 'react';
import { useDocuShare } from '@/hooks/useDocuShare';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  FileText, 
  Upload, 
  RefreshCw, 
  Filter, 
  ChevronRight 
} from 'lucide-react';

/**
 * Document Browser Component
 * 
 * This component implements a regulatory document browser with:
 * - Document listing with filtering and sorting
 * - Document upload with metadata
 * - Integration with Part 11 compliant DocuShare system
 */
export function DocumentBrowser({ 
  collectionId = 'regulatory',
  onSelectDocument,
  defaultView = 'list'
}) {
  const {
    isAuthenticated,
    isLoading,
    documents,
    error,
    authenticate,
    loadDocuments,
    uploadDocument
  } = useDocuShare();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState(defaultView);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadMetadata, setUploadMetadata] = useState({
    documentType: '',
    regulatoryPhase: '',
    controlStatus: 'Draft',
    confidentiality: 'Confidential'
  });
  
  // Document types for regulatory submissions
  const documentTypes = [
    { value: 'protocol', label: 'Clinical Protocol' },
    { value: 'csr', label: 'Clinical Study Report' },
    { value: 'ib', label: 'Investigator Brochure' },
    { value: 'cta', label: 'Clinical Trial Application' },
    { value: 'ind', label: 'IND Application' },
    { value: 'nda', label: 'NDA Submission' },
    { value: 'ctd', label: 'Common Technical Document' },
    { value: 'dsp', label: 'Development Safety Update Report' },
    { value: 'sop', label: 'Standard Operating Procedure' },
    { value: 'iqoq', label: 'IQ/OQ Protocol' }
  ];
  
  // Regulatory phases
  const regulatoryPhases = [
    { value: 'preclinical', label: 'Preclinical' },
    { value: 'phase1', label: 'Phase 1' },
    { value: 'phase2', label: 'Phase 2' },
    { value: 'phase3', label: 'Phase 3' },
    { value: 'phase4', label: 'Phase 4' },
    { value: 'submission', label: 'Submission' },
    { value: 'postApproval', label: 'Post-Approval' }
  ];
  
  // Control status options (21 CFR Part 11 relevant)
  const controlStatusOptions = [
    { value: 'Draft', label: 'Draft' },
    { value: 'In-Review', label: 'In Review' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Effective', label: 'Effective' },
    { value: 'Superseded', label: 'Superseded' },
    { value: 'Obsolete', label: 'Obsolete' }
  ];
  
  // Confidentiality levels
  const confidentialityLevels = [
    { value: 'Public', label: 'Public' },
    { value: 'Confidential', label: 'Confidential' },
    { value: 'Restricted', label: 'Restricted' },
    { value: 'HighlyConfidential', label: 'Highly Confidential' }
  ];
  
  // Load documents on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadDocuments(collectionId);
    }
  }, [isAuthenticated, collectionId, loadDocuments]);
  
  // Handle authentication if not already authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      // In a real implementation, this would prompt for credentials or use stored tokens
      // For this example, we'll authenticate with default values
      authenticate('regulatory_user', 'secure_password');
    }
  }, [isAuthenticated, authenticate]);
  
  // Handle file upload selection
  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setUploadFile(event.target.files[0]);
    }
  };
  
  // Handle document upload
  const handleUpload = async () => {
    if (!uploadFile) return;
    
    // Prepare metadata for regulatory document
    const metadata = {
      ...uploadMetadata,
      filename: uploadFile.name,
      uploadDate: new Date().toISOString(),
      fileSize: uploadFile.size,
      mimeType: uploadFile.type
    };
    
    await uploadDocument(collectionId, uploadFile, metadata);
    setShowUploadDialog(false);
    setUploadFile(null);
    setUploadMetadata({
      documentType: '',
      regulatoryPhase: '',
      controlStatus: 'Draft',
      confidentiality: 'Confidential'
    });
    
    // Reload documents after upload
    loadDocuments(collectionId);
  };
  
  // Filter documents based on search term and filter type
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterType === 'all') return matchesSearch;
    return matchesSearch && doc.documentType === filterType;
  });
  
  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'type') {
      return a.documentType.localeCompare(b.documentType);
    } else if (sortBy === 'status') {
      return a.controlStatus.localeCompare(b.controlStatus);
    } else {
      // Default sort by date (newest first)
      return new Date(b.uploadDate) - new Date(a.uploadDate);
    }
  });
  
  // Handle document selection
  const handleSelectDocument = (document) => {
    if (onSelectDocument) {
      onSelectDocument(document);
    }
  };
  
  // Render file size in a human-readable format
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  // Get document type label from value
  const getDocumentTypeLabel = (value) => {
    const docType = documentTypes.find(type => type.value === value);
    return docType ? docType.label : value;
  };
  
  // Render document icon based on type
  const getDocumentIcon = (documentType) => {
    // In a real implementation, this would return different icons based on document type
    return <FileText className="h-5 w-5" />;
  };
  
  // Render list view of documents
  const renderListView = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[300px]">Document Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Modified</TableHead>
          <TableHead>Size</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedDocuments.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
              {isLoading ? (
                <div className="flex justify-center items-center">
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Loading documents...
                </div>
              ) : (
                'No documents found. Upload a new document to get started.'
              )}
            </TableCell>
          </TableRow>
        ) : (
          sortedDocuments.map((doc) => (
            <TableRow key={doc.id} onClick={() => handleSelectDocument(doc)} className="cursor-pointer hover:bg-muted">
              <TableCell className="font-medium flex items-center">
                {getDocumentIcon(doc.documentType)}
                <span className="ml-2">{doc.name}</span>
              </TableCell>
              <TableCell>{getDocumentTypeLabel(doc.documentType)}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  doc.controlStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                  doc.controlStatus === 'In-Review' ? 'bg-blue-100 text-blue-800' :
                  doc.controlStatus === 'Draft' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {doc.controlStatus}
                </span>
              </TableCell>
              <TableCell>{formatDate(doc.uploadDate)}</TableCell>
              <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={(e) => {
                  e.stopPropagation();
                  handleSelectDocument(doc);
                }}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
  
  // Render grid view of documents
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedDocuments.length === 0 ? (
        <div className="col-span-full text-center py-8 text-muted-foreground">
          {isLoading ? (
            <div className="flex justify-center items-center">
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Loading documents...
            </div>
          ) : (
            'No documents found. Upload a new document to get started.'
          )}
        </div>
      ) : (
        sortedDocuments.map((doc) => (
          <Card key={doc.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSelectDocument(doc)}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  {getDocumentIcon(doc.documentType)}
                  <CardTitle className="ml-2 text-base truncate">{doc.name}</CardTitle>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  doc.controlStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                  doc.controlStatus === 'In-Review' ? 'bg-blue-100 text-blue-800' :
                  doc.controlStatus === 'Draft' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {doc.controlStatus}
                </span>
              </div>
              <CardDescription className="truncate">
                {getDocumentTypeLabel(doc.documentType)}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-2">
              {doc.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {doc.description}
                </p>
              )}
            </CardContent>
            <CardFooter className="flex justify-between pt-0">
              <span className="text-xs text-muted-foreground">{formatDate(doc.uploadDate)}</span>
              <span className="text-xs text-muted-foreground">{formatFileSize(doc.fileSize)}</span>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  );
  
  return (
    <div className="space-y-4">
      {/* Search and Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search documents..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => loadDocuments(collectionId)}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Upload Regulatory Document</DialogTitle>
                <DialogDescription>
                  Upload a document to the regulatory document management system.
                  All documents are tracked for 21 CFR Part 11 compliance.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="file">Document File</Label>
                  <Input 
                    id="file" 
                    type="file" 
                    onChange={handleFileChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="documentType">Document Type</Label>
                  <Select 
                    value={uploadMetadata.documentType} 
                    onValueChange={(value) => setUploadMetadata({...uploadMetadata, documentType: value})}
                  >
                    <SelectTrigger id="documentType">
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="regulatoryPhase">Regulatory Phase</Label>
                  <Select 
                    value={uploadMetadata.regulatoryPhase} 
                    onValueChange={(value) => setUploadMetadata({...uploadMetadata, regulatoryPhase: value})}
                  >
                    <SelectTrigger id="regulatoryPhase">
                      <SelectValue placeholder="Select regulatory phase" />
                    </SelectTrigger>
                    <SelectContent>
                      {regulatoryPhases.map((phase) => (
                        <SelectItem key={phase.value} value={phase.value}>
                          {phase.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="controlStatus">Control Status</Label>
                  <Select 
                    value={uploadMetadata.controlStatus}
                    onValueChange={(value) => setUploadMetadata({...uploadMetadata, controlStatus: value})}
                  >
                    <SelectTrigger id="controlStatus">
                      <SelectValue placeholder="Select control status" />
                    </SelectTrigger>
                    <SelectContent>
                      {controlStatusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="confidentiality">Confidentiality</Label>
                  <Select 
                    value={uploadMetadata.confidentiality} 
                    onValueChange={(value) => setUploadMetadata({...uploadMetadata, confidentiality: value})}
                  >
                    <SelectTrigger id="confidentiality">
                      <SelectValue placeholder="Select confidentiality level" />
                    </SelectTrigger>
                    <SelectContent>
                      {confidentialityLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={!uploadFile || !uploadMetadata.documentType}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Filters and View Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="filterType" className="text-sm font-medium">
            Filter by:
          </Label>
          <Select 
            value={filterType} 
            onValueChange={setFilterType}
          >
            <SelectTrigger id="filterType" className="w-[180px]">
              <SelectValue placeholder="Select filter type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Document Types</SelectItem>
              {documentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Label htmlFor="sortBy" className="text-sm font-medium ml-2">
            Sort by:
          </Label>
          <Select 
            value={sortBy} 
            onValueChange={setSortBy}
          >
            <SelectTrigger id="sortBy" className="w-[150px]">
              <SelectValue placeholder="Select sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date Modified</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="type">Document Type</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center">
          <Label className="text-sm font-medium mr-2">View:</Label>
          <div className="bg-muted rounded-md p-1 flex">
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className="px-2"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              className="px-2"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
          </div>
        </div>
      </div>
      
      {/* Document List */}
      <ScrollArea className="h-[calc(100vh-220px)]">
        {error ? (
          <div className="p-4 rounded-md bg-destructive/10 text-destructive">
            <p className="font-medium">Error loading documents</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : viewMode === 'list' ? renderListView() : renderGridView()}
      </ScrollArea>
    </div>
  );
}