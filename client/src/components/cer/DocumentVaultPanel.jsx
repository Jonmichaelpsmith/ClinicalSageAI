import React, { useState } from 'react';
import { cerApiService } from '@/services/CerAPIService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
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
  Filter,
  PlusCircle,
  UploadCloud,
  Download,
  FileText,
  File,
  FileLock2,
  FileArchive,
  Share2,
  Trash2,
  CalendarDays,
  Tag,
  Users,
  Info,
  CheckCircle2,
  Folder,
  Grid3X3,
  LayoutList,
  User
} from 'lucide-react';

export default function DocumentVaultPanel({ jobId }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState('all-documents');
  const [viewMode, setViewMode] = useState('list');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  
  // Mock document data
  const documents = [
    {
      id: 'doc-001',
      name: 'Enzymex Forte CER v1.0.5',
      type: 'cer',
      category: 'Clinical Evaluation',
      version: '1.0.5',
      author: 'Michael Chen',
      dateCreated: '2025-04-28T15:30:00Z',
      dateModified: '2025-04-28T15:30:00Z',
      size: '2.3 MB',
      status: 'approved',
      tags: ['EU MDR', 'Enzymex Forte', 'Final'],
      description: 'Final Clinical Evaluation Report for Enzymex Forte submission',
      thumbnail: null
    },
    {
      id: 'doc-002',
      name: 'Literature Review Report - Enzymex Forte',
      type: 'literature',
      category: 'Literature Review',
      version: '1.0.2',
      author: 'Sarah Johnson',
      dateCreated: '2025-04-20T12:45:00Z',
      dateModified: '2025-04-25T09:15:00Z',
      size: '1.8 MB',
      status: 'approved',
      tags: ['Literature', 'Enzymex Forte', 'Research'],
      description: 'Comprehensive literature review supporting the CER for Enzymex Forte',
      thumbnail: null
    },
    {
      id: 'doc-003',
      name: 'Clinical Data Summary - Enzymex Studies',
      type: 'data',
      category: 'Clinical Data',
      version: '1.1.0',
      author: 'John Smith',
      dateCreated: '2025-04-15T14:20:00Z',
      dateModified: '2025-04-22T11:30:00Z',
      size: '4.7 MB',
      status: 'approved',
      tags: ['Clinical Data', 'Enzymex Forte', 'Studies'],
      description: 'Summary of clinical data from all Enzymex Forte studies',
      thumbnail: null
    },
    {
      id: 'doc-004',
      name: 'Risk Assessment Report',
      type: 'risk',
      category: 'Risk Management',
      version: '2.0.1',
      author: 'Emily Williams',
      dateCreated: '2025-04-05T09:00:00Z',
      dateModified: '2025-04-18T16:45:00Z',
      size: '3.2 MB',
      status: 'approved',
      tags: ['Risk', 'Safety', 'Enzymex Forte'],
      description: 'Comprehensive risk assessment for Enzymex Forte',
      thumbnail: null
    },
    {
      id: 'doc-005',
      name: 'Post-Market Surveillance Plan',
      type: 'pms',
      category: 'Post-Market',
      version: '1.0.0',
      author: 'David Lee',
      dateCreated: '2025-04-10T10:30:00Z',
      dateModified: '2025-04-10T10:30:00Z',
      size: '1.5 MB',
      status: 'draft',
      tags: ['PMS', 'Surveillance', 'Draft'],
      description: 'Draft post-market surveillance plan for Enzymex Forte',
      thumbnail: null
    },
    {
      id: jobId,
      name: 'Enzymex Forte CER v1.1.0 (Latest)',
      type: 'cer',
      category: 'Clinical Evaluation',
      version: '1.1.0',
      author: 'TrialSage AI',
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      size: '2.5 MB',
      status: 'draft',
      tags: ['EU MDR', 'Enzymex Forte', 'Latest', 'AI-Generated'],
      description: 'Latest AI-generated Clinical Evaluation Report for Enzymex Forte',
      thumbnail: null,
      isLatest: true
    }
  ].filter(doc => doc.id !== undefined);
  
  // Filter documents based on current tab and search query
  const filteredDocuments = documents
    .filter(doc => {
      // Filter by tab
      if (currentTab === 'all-documents') {
        return true;
      } else if (currentTab === 'cer-documents') {
        return doc.type === 'cer';
      } else if (currentTab === 'supporting-documents') {
        return doc.type !== 'cer';
      } else if (currentTab === 'draft-documents') {
        return doc.status === 'draft';
      }
      return true;
    })
    .filter(doc => {
      // Filter by search query if present
      if (!searchQuery) return true;
      
      const query = searchQuery.toLowerCase();
      return (
        doc.name.toLowerCase().includes(query) ||
        doc.author.toLowerCase().includes(query) ||
        doc.description.toLowerCase().includes(query) ||
        doc.tags.some(tag => tag.toLowerCase().includes(query))
      );
    });
  
  // Open file handler
  const handleOpenFile = (doc) => {
    console.log('Opening document:', doc);
    // In a real app, this would open the document in a viewer
    window.open(`/api/documents/${doc.id}/view`, '_blank');
  };
  
  // Download file handler
  const handleDownloadFile = async (doc) => {
    console.log('Downloading document:', doc);
    try {
      // For CER documents, use the CerAPIService to create and download a PDF
      if (doc.type === 'cer') {
        // Mock data for CER export - in a real app, this would be fetched based on doc.id
        const mockCerData = {
          title: doc.name,
          sections: [
            { id: 'sec1', title: 'Executive Summary', content: 'This is a sample CER document.' },
            { id: 'sec2', title: 'Device Description', content: 'Device description content would appear here.' },
            { id: 'sec3', title: 'Clinical Evaluation', content: 'Clinical evaluation data would be presented here.' }
          ],
          faers: [],
          comparators: [],
          metadata: {
            author: doc.author,
            version: doc.version,
            category: doc.category
          }
        };
        
        // Generate PDF using the CerAPIService
        const pdfBlob = await cerApiService.exportToPDF(mockCerData);
        
        // Initiate download of the generated PDF
        const url = window.URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${doc.name.replace(/\s+/g, '_').toLowerCase()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // For non-CER documents, simulate a standard file download
        // Create a mock PDF blob (this would normally be fetched from the server)
        const response = await fetch('/api/cer/export-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: doc.name,
            documentType: doc.type,
            metadata: {
              author: doc.author,
              category: doc.category,
              version: doc.version,
              created: doc.dateCreated,
              tags: doc.tags
            }
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Download failed: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        cerApiService.downloadBlob(blob, `${doc.name.replace(/\s+/g, '_').toLowerCase()}.pdf`);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Download failed. Please try again later.');
    }
  };
  
  // Share file handler
  const handleShareFile = (doc) => {
    setSelectedDocument(doc);
    setShowShareDialog(true);
  };
  
  // Delete file handler
  const handleDeleteFile = (doc) => {
    if (confirm(`Are you sure you want to delete "${doc.name}"?`)) {
      console.log('Deleting document:', doc);
      // In a real app, this would delete the document
    }
  };
  
  // Get file icon based on type
  const getFileIcon = (type) => {
    switch (type) {
      case 'cer':
        return <FileText className="h-6 w-6 text-blue-500" />;
      case 'literature':
        return <FileText className="h-6 w-6 text-purple-500" />;
      case 'data':
        return <FileArchive className="h-6 w-6 text-green-500" />;
      case 'risk':
        return <FileLock2 className="h-6 w-6 text-red-500" />;
      case 'pms':
        return <FileText className="h-6 w-6 text-amber-500" />;
      default:
        return <File className="h-6 w-6 text-gray-500" />;
    }
  };
  
  // Format date string
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };
  
  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800">Archived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Render grid view
  const renderGridView = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredDocuments.map(doc => (
          <Card 
            key={doc.id}
            className={`cursor-pointer transition-shadow hover:shadow-md ${
              doc.isLatest ? 'border-blue-500 shadow-sm' : ''
            }`}
            onClick={() => handleOpenFile(doc)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-center h-32 bg-gray-50 rounded-md mb-3">
                {getFileIcon(doc.type)}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-sm line-clamp-2" title={doc.name}>
                    {doc.name}
                  </h3>
                  {doc.isLatest && (
                    <Badge className="bg-blue-100 text-blue-800 text-xs">New</Badge>
                  )}
                </div>
                
                <div className="flex items-center text-xs text-gray-500">
                  <CalendarDays className="h-3 w-3 mr-1" />
                  <span>{formatDate(doc.dateModified).split(',')[0]}</span>
                </div>
                
                <div className="flex items-center text-xs text-gray-500">
                  <User className="h-3 w-3 mr-1" />
                  <span>{doc.author}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  {getStatusBadge(doc.status)}
                  <span className="text-xs text-gray-500">{doc.size}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  // Render list view
  const renderListView = () => {
    return (
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[350px]">Document Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Modified</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No documents found
                </TableCell>
              </TableRow>
            ) : (
              filteredDocuments.map(doc => (
                <TableRow key={doc.id} className={doc.isLatest ? 'bg-blue-50' : ''}>
                  <TableCell>
                    <div className="flex items-center space-x-3" onClick={() => handleOpenFile(doc)}>
                      {getFileIcon(doc.type)}
                      <div>
                        <div className="font-medium">{doc.name}</div>
                        <div className="text-xs text-gray-500 max-w-md truncate">
                          {doc.description}
                        </div>
                        <div className="flex items-center space-x-1 mt-1">
                          {doc.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
                              {tag}
                            </Badge>
                          ))}
                          {doc.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0">
                              +{doc.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{doc.category}</TableCell>
                  <TableCell>v{doc.version}</TableCell>
                  <TableCell>{doc.author}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{formatDate(doc.dateModified).split(',')[0]}</span>
                      <span className="text-xs text-gray-500">
                        {formatDate(doc.dateModified).split(',')[1]}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(doc.status)}</TableCell>
                  <TableCell>{doc.size}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex space-x-1 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleOpenFile(doc)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDownloadFile(doc)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleShareFile(doc)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      {doc.status !== 'approved' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteFile(doc)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    );
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold flex items-center">
              <FolderOpen className="mr-2 h-5 w-5 text-blue-600" />
              Document Vault
            </h3>
            <div className="mt-3 sm:mt-0 flex space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="px-2"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-2"
              >
                <LayoutList className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUploadDialog(true)}
              >
                <UploadCloud className="mr-2 h-4 w-4" />
                Upload
              </Button>
              <Button 
                size="sm"
                onClick={() => setShowUploadDialog(true)}
                className="bg-[#0F6CBD] hover:bg-[#115EA3] text-white"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Document
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
            <div className="w-full md:w-2/3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search documents..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-1/3 flex space-x-2">
              <Button variant="outline" className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" className="w-full">
                <Tag className="mr-2 h-4 w-4" />
                Tags
              </Button>
            </div>
          </div>
          
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="all-documents" className="flex items-center">
                <Folder className="mr-2 h-4 w-4" />
                All Documents
              </TabsTrigger>
              <TabsTrigger value="cer-documents" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                CERs
              </TabsTrigger>
              <TabsTrigger value="supporting-documents" className="flex items-center">
                <FileArchive className="mr-2 h-4 w-4" />
                Supporting Docs
              </TabsTrigger>
              <TabsTrigger value="draft-documents" className="flex items-center">
                <File className="mr-2 h-4 w-4" />
                Drafts
              </TabsTrigger>
            </TabsList>
            
            <div className="min-h-[400px]">
              {/* Display count and sorting options */}
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-500">
                  {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
                </div>
                {jobId && (
                  <div className="flex items-center">
                    <Badge variant="outline" className="bg-blue-50 border-blue-200">
                      <Info className="mr-1 h-3.5 w-3.5 text-blue-500" />
                      New document generated
                    </Badge>
                  </div>
                )}
              </div>
              
              {/* Display documents in selected view mode */}
              {viewMode === 'grid' ? renderGridView() : renderListView()}
            </div>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="bg-white border-none shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-[#323130] text-lg font-semibold">Upload Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="border-2 border-dashed border-[#E1DFDD] rounded-lg p-6 text-center bg-[#FAF9F8]">
              <UploadCloud className="h-10 w-10 text-[#0F6CBD] mx-auto mb-4" />
              <h3 className="font-medium mb-1 text-[#323130]">Drag and drop files</h3>
              <p className="text-sm text-[#616161] mb-3">or click to browse</p>
              <Button className="bg-[#0F6CBD] hover:bg-[#115EA3] text-white">
                Select Files
              </Button>
            </div>
            <div className="text-sm text-[#616161]">
              <p className="mb-1">Supported file types: PDF, DOCX, XLSX, PPTX</p>
              <p>Maximum file size: 50MB</p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowUploadDialog(false)}
              className="border-[#E1DFDD] text-[#616161]"
            >
              Cancel
            </Button>
            <Button className="bg-[#0F6CBD] hover:bg-[#115EA3] text-white">
              Upload Files
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="bg-white border-none shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-[#323130] text-lg font-semibold">Share Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            {selectedDocument && (
              <div className="flex items-start space-x-3 p-3 bg-[#FAF9F8] rounded-md border border-[#E1DFDD]">
                {getFileIcon(selectedDocument.type)}
                <div>
                  <div className="font-medium text-[#323130]">{selectedDocument.name}</div>
                  <div className="text-sm text-[#616161]">v{selectedDocument.version} • {selectedDocument.size}</div>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-[#323130]">Share with People</h4>
              <div className="flex space-x-2">
                <Input placeholder="Enter email addresses" className="flex-1 border-[#E1DFDD] focus:border-[#0F6CBD] focus:ring-1 focus:ring-[#0F6CBD]" />
                <Button variant="outline" className="border-[#E1DFDD]">
                  <Users className="h-4 w-4 text-[#0F6CBD]" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-[#323130]">Permission Settings</h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="view-only"
                    name="permission"
                    defaultChecked
                    className="text-[#0F6CBD] focus:ring-[#0F6CBD]"
                  />
                  <label htmlFor="view-only" className="text-sm text-[#323130]">View Only</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="view-download"
                    name="permission"
                    className="text-[#0F6CBD] focus:ring-[#0F6CBD]"
                  />
                  <label htmlFor="view-download" className="text-sm text-[#323130]">View & Download</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="edit"
                    name="permission"
                    className="text-[#0F6CBD] focus:ring-[#0F6CBD]"
                  />
                  <label htmlFor="edit" className="text-sm text-[#323130]">Edit</label>
                </div>
              </div>
            </div>
            
            <div className="bg-[#E5F2FF] p-3 rounded-md border border-[#0F6CBD] border-opacity-30">
              <div className="flex items-start text-sm text-[#0F6CBD]">
                <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-[#0F6CBD] flex-shrink-0" />
                <p>An email with access instructions will be sent to all recipients.</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowShareDialog(false)}
              className="border-[#E1DFDD] text-[#616161]"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => setShowShareDialog(false)}
              className="bg-[#0F6CBD] hover:bg-[#115EA3] text-white"
            >
              Share Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}