import React, { useState, useEffect } from 'react';
import { cerApiService } from '@/services/CerAPIService';
import { documentApiService } from '@/services/DocumentAPIService';
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
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadMetadata, setUploadMetadata] = useState({
    name: '',
    type: 'cer',
    category: 'Clinical Evaluation',
    status: 'draft',
    description: '',
    author: 'TrialSage AI',
    tags: ['CER']
  });
  
  // Fetch documents on component mount
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const docs = await documentApiService.getDocuments();
        
        // If there are no documents yet, we'll fall back to using the mock data
        if (docs && docs.length > 0) {
          setDocuments(docs);
        } else {
          // Mock document data with actual CER report content
          const mockDocuments = [
            {
              id: 'doc-001',
              name: 'Arthrosurface Shoulder Arthroplasty Systems CER v1.0.5',
              type: 'cer',
              category: 'Clinical Evaluation',
              version: '1.0.5',
              author: 'Michael Chen',
              dateCreated: '2025-04-18T15:30:00Z',
              dateModified: '2025-04-28T15:30:00Z',
              size: '2.3 MB',
              status: 'approved',
              tags: ['EU MDR', 'MEDDEV 2.7/1 Rev 4', 'Shoulder', 'Final'],
              description: 'Final Clinical Evaluation Report for Arthrosurface Shoulder Arthroplasty Systems',
              thumbnail: null,
              content: {
                title: 'Clinical Evaluation Report - Arthrosurface Shoulder Arthroplasty Systems',
                sections: [
                  { id: 'sec001', title: 'Executive Summary', content: 'This clinical evaluation report (CER) has been prepared in accordance with MEDDEV 2.7/1 Rev 4 and EU MDR 2017/745. The Arthrosurface Shoulder Arthroplasty System demonstrates a favorable benefit-risk profile and meets performance and safety requirements.' },
                  { id: 'sec002', title: 'Device Description', content: 'The Arthrosurface Shoulder Arthroplasty System is designed for the repair of focal chondral and osteochondral defects in the shoulder joint. It consists of articulating components that restore the articular surface geometry of the glenohumeral joint.' },
                  { id: 'sec003', title: 'Clinical Evaluation Scope', content: 'This evaluation covers the safety and performance of the device based on clinical data from multiple sources including clinical studies, post-market surveillance, and relevant literature.' }
                ],
                metadata: {
                  standard: 'MEDDEV 2.7/1 Rev 4',
                  complianceScore: 92,
                  reviewStatus: 'final'
                }
              }
            },
            {
              id: 'doc-002',
              name: 'Literature Review Report - Shoulder Arthroplasty',
              type: 'literature',
              category: 'Literature Review',
              version: '1.0.2',
              author: 'Sarah Johnson',
              dateCreated: '2025-04-20T12:45:00Z',
              dateModified: '2025-04-25T09:15:00Z',
              size: '1.8 MB',
              status: 'approved',
              tags: ['Literature', 'Arthrosurface', 'Research'],
              description: 'Comprehensive literature review supporting the CER for Arthrosurface Shoulder Arthroplasty Systems',
              thumbnail: null,
              content: {
                title: 'Literature Review Report - Shoulder Arthroplasty Systems',
                sections: [
                  { id: 'lit001', title: 'Introduction', content: 'This literature review was conducted to identify and evaluate published clinical data relevant to the Arthrosurface Shoulder Arthroplasty System and equivalent devices.' },
                  { id: 'lit002', title: 'Search Methodology', content: 'A systematic search was conducted in PubMed, Embase, and Cochrane databases covering the period from January 2010 to April 2025, using keywords including "shoulder arthroplasty", "focal shoulder resurfacing", and "partial shoulder replacement".' },
                  { id: 'lit003', title: 'Results Summary', content: 'The search identified 127 potentially relevant publications, of which 42 met the inclusion criteria for detailed review. These studies included a total of 2,845 patients with follow-up periods ranging from 2 to 10 years.' }
                ],
                metadata: {
                  searchDate: '2025-04-15',
                  databasesSearched: ['PubMed', 'Embase', 'Cochrane', 'MEDLINE'],
                  keywordCount: 18,
                  relevantStudies: 42
                }
              }
            },
            {
              id: 'doc-003',
              name: 'Clinical Data Summary - Arthrosurface Shoulder Studies',
              type: 'data',
              category: 'Clinical Data',
              version: '1.1.0',
              author: 'John Smith',
              dateCreated: '2025-04-15T14:20:00Z',
              dateModified: '2025-04-22T11:30:00Z',
              size: '4.7 MB',
              status: 'approved',
              tags: ['Clinical Data', 'Arthrosurface', 'Studies'],
              description: 'Summary of clinical data from all Arthrosurface Shoulder Arthroplasty System studies',
              thumbnail: null,
              content: {
                title: 'Clinical Data Summary - Arthrosurface Shoulder Arthroplasty Studies',
                sections: [
                  { id: 'dat001', title: 'Overview', content: 'This document summarizes the clinical data collected from three clinical studies of the Arthrosurface Shoulder Arthroplasty System conducted between 2018 and 2025.' },
                  { id: 'dat002', title: 'Study ASA-001', content: 'A prospective, multi-center study including 85 patients with focal chondral defects treated with the Arthrosurface system. The study demonstrated a 93% implant survival rate at 5 years with statistically significant improvements in pain and functional scores.' },
                  { id: 'dat003', title: 'Study ASA-002', content: 'A randomized controlled trial comparing the Arthrosurface system (n=64) with conventional total shoulder arthroplasty (n=68) in patients with glenohumeral osteoarthritis. Results showed comparable clinical outcomes with reduced bone loss and shorter recovery times in the Arthrosurface group.' }
                ],
                metadata: {
                  totalPatients: 217,
                  averageFollowUp: '4.7 years',
                  primaryEndpoints: ['Pain reduction', 'Function improvement', 'Range of motion', 'Implant survival']
                }
              }
            },
            {
              id: 'doc-004',
              name: 'Risk Assessment Report - Arthrosurface Shoulder System',
              type: 'risk',
              category: 'Risk Management',
              version: '2.0.1',
              author: 'Emily Williams',
              dateCreated: '2025-04-05T09:00:00Z',
              dateModified: '2025-04-18T16:45:00Z',
              size: '3.2 MB',
              status: 'approved',
              tags: ['Risk', 'Safety', 'Arthrosurface'],
              description: 'Comprehensive risk assessment for Arthrosurface Shoulder Arthroplasty System',
              thumbnail: null,
              content: {
                title: 'Risk Assessment Report - Arthrosurface Shoulder Arthroplasty System',
                sections: [
                  { id: 'risk001', title: 'Risk Assessment Methodology', content: 'This risk assessment follows ISO 14971:2019 and identifies, evaluates, and controls risks associated with the Arthrosurface Shoulder Arthroplasty System.' },
                  { id: 'risk002', title: 'Identified Risks', content: 'The assessment identified 27 potential risks, including infection, device loosening, biomaterial wear, and allergic reaction. Each risk was evaluated for severity, probability, and detectability.' },
                  { id: 'risk003', title: 'Risk Mitigation Measures', content: 'Control measures implemented include design optimizations, manufacturing controls, sterilization validation, surgical technique guidance, and post-market surveillance protocols.' }
                ],
                metadata: {
                  standard: 'ISO 14971:2019',
                  riskCount: 27,
                  residualRiskAcceptance: 'All residual risks determined to be acceptable',
                  reviewDate: '2025-04-15'
                }
              }
            },
            {
              id: 'doc-005',
              name: 'Post-Market Surveillance Plan - Arthrosurface',
              type: 'pms',
              category: 'Post-Market',
              version: '1.0.0',
              author: 'David Lee',
              dateCreated: '2025-04-10T10:30:00Z',
              dateModified: '2025-04-10T10:30:00Z',
              size: '1.5 MB',
              status: 'draft',
              tags: ['PMS', 'Surveillance', 'Draft'],
              description: 'Draft post-market surveillance plan for Arthrosurface Shoulder Arthroplasty System',
              thumbnail: null,
              content: {
                title: 'Post-Market Surveillance Plan - Arthrosurface Shoulder Arthroplasty System',
                sections: [
                  { id: 'pms001', title: 'Introduction', content: 'This PMS Plan outlines the strategy for systematically collecting and evaluating clinical experience with the Arthrosurface Shoulder Arthroplasty System in the post-market phase in accordance with EU MDR 2017/745.' },
                  { id: 'pms002', title: 'Surveillance Methods', content: 'The plan incorporates multiple data sources, including: registry data analysis, user feedback collection, literature monitoring, and an active follow-up study of 150 patients across 10 clinical sites.' },
                  { id: 'pms003', title: 'Data Analysis & Reporting', content: 'Data will be analyzed quarterly with comprehensive reviews annually. Findings will be incorporated into risk management, CERs, and reported to authorities as required. Trend analysis will use statistical methods to identify patterns requiring investigation.' }
                ],
                metadata: {
                  euMdrCompliant: true,
                  reviewCycle: 'Annual',
                  surveillanceDuration: 'Product lifetime plus 10 years',
                  draftStatus: 'Pending final approval'
                }
              }
            },
            {
              id: jobId,
              name: 'Arthrosurface Shoulder Arthroplasty Systems CER v1.1.0 (Latest)',
              type: 'cer',
              category: 'Clinical Evaluation',
              version: '1.1.0',
              author: 'TrialSage AI',
              dateCreated: new Date().toISOString(),
              dateModified: new Date().toISOString(),
              size: '2.5 MB',
              status: 'draft',
              tags: ['EU MDR', 'MEDDEV 2.7/1 Rev 4', 'Shoulder', 'Latest', 'AI-Generated'],
              description: 'Latest AI-generated Clinical Evaluation Report for Arthrosurface Shoulder Arthroplasty System with updated FAERS data and literature',
              thumbnail: null,
              isLatest: true,
              content: {
                title: 'Clinical Evaluation Report - Arthrosurface Shoulder Arthroplasty Systems',
                sections: [
                  { id: 'new001', title: 'Executive Summary', content: 'This clinical evaluation report (CER) has been prepared in accordance with MEDDEV 2.7/1 Rev 4 and EU MDR 2017/745. The Arthrosurface Shoulder Arthroplasty System demonstrates a favorable benefit-risk profile based on the latest clinical evidence and post-market surveillance data.' },
                  { id: 'new002', title: 'Device Description', content: 'The Arthrosurface Shoulder Arthroplasty System is designed for the repair of focal chondral and osteochondral defects in the shoulder joint, with recent enhancements to instrumentation and surgical technique.' },
                  { id: 'new003', title: 'Clinical Evaluation Methods', content: 'This evaluation follows a well-defined methodology, incorporating data from clinical investigations, post-market experience, comparable devices, and recent scientific literature published through April 2025.' },
                  { id: 'new004', title: 'Clinical Data Analysis', content: 'Updated analysis includes two new clinical studies and registry data from 485 additional patients, strengthening the evidence supporting device safety and performance.' },
                  { id: 'new005', title: 'State of the Art Review', content: 'The current state of the art in shoulder arthroplasty has been comprehensively reviewed, confirming that the Arthrosurface system meets or exceeds current standards for similar devices.' }
                ],
                metadata: {
                  standard: 'MEDDEV 2.7/1 Rev 4',
                  complianceScore: 88,
                  draftStatus: 'Pending final review',
                  generatedAt: new Date().toISOString(),
                  version: '1.1.0'
                }
              }
            }
          ].filter(doc => doc.id !== undefined);
          
          setDocuments(mockDocuments);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
        setError('Failed to load documents. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, [jobId]);
  
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
  
  // Handle file upload
  const handleUpload = async () => {
    try {
      if (!uploadFile) {
        alert('Please select a file to upload');
        return;
      }
      
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('data', JSON.stringify(uploadMetadata));
      
      const response = await documentApiService.uploadDocument(formData);
      
      // Add new document to the list
      setDocuments(prev => [response, ...prev]);
      
      // Reset form
      setUploadFile(null);
      setUploadMetadata({
        name: '',
        type: 'cer',
        category: 'Clinical Evaluation',
        status: 'draft',
        description: '',
        author: 'TrialSage AI',
        tags: ['CER']
      });
      
      // Close dialog
      setShowUploadDialog(false);
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document. Please try again.');
    }
  };
  
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
        (doc.author && doc.author.toLowerCase().includes(query)) ||
        (doc.description && doc.description.toLowerCase().includes(query)) ||
        (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    });
  
  // Open file handler
  const handleOpenFile = (doc) => {
    console.log('Opening document:', doc);
    // In a real app, this would open the document in a viewer
    window.open(`/api/documents/${doc.id}/view`, '_blank');
  };
  
  // Download file handler - creates an HTML file with document content for demo
  const handleDownloadFile = async (doc) => {
    try {
      await documentApiService.downloadDocument(doc.id, `${doc.name}.html`);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document. Please try again.');
    }
  };
  
  // Share document handler
  const handleShareDocument = (doc) => {
    setSelectedDocument(doc);
    setShowShareDialog(true);
  };
  
  // Delete document handler
  const handleDeleteDocument = async (doc) => {
    if (!confirm(`Are you sure you want to delete "${doc.name}"?`)) return;
    
    try {
      await documentApiService.deleteDocument(doc.id);
      setDocuments(prev => prev.filter(d => d.id !== doc.id));
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document. Please try again.');
    }
  };
  
  // Generate document icon based on type
  const getDocumentIcon = (type) => {
    switch (type) {
      case 'cer':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'risk':
        return <FileLock2 className="w-5 h-5 text-red-600" />;
      case 'literature':
        return <FileArchive className="w-5 h-5 text-purple-600" />;
      case 'data':
        return <File className="w-5 h-5 text-green-600" />;
      case 'pms':
        return <File className="w-5 h-5 text-orange-600" />;
      default:
        return <File className="w-5 h-5 text-gray-600" />;
    }
  };
  
  // Format date string
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-900">Document Vault</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? 
              <LayoutList className="h-4 w-4" /> : 
              <Grid3X3 className="h-4 w-4" />
            }
          </Button>
          <Button onClick={() => setShowUploadDialog(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Document
          </Button>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search documents..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <Button variant="outline" className="gap-1">
            <Filter className="h-4 w-4" /> Filter
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all-documents" value={currentTab} onValueChange={setCurrentTab} className="mb-4">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="all-documents">All Documents</TabsTrigger>
          <TabsTrigger value="cer-documents">CERs</TabsTrigger>
          <TabsTrigger value="supporting-documents">Supporting Docs</TabsTrigger>
          <TabsTrigger value="draft-documents">Drafts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all-documents" className="mt-0">
          {loading ? (
            <div className="text-center py-8">Loading documents...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-8">No documents found. Try adjusting your search or uploading a new document.</div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map(doc => (
                <Card key={doc.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          {getDocumentIcon(doc.type)}
                          <h3 className="ml-2 font-medium text-gray-900 line-clamp-1">{doc.name}</h3>
                        </div>
                        <Badge variant={doc.status === 'approved' ? 'default' : 'outline'} className="ml-2">
                          {doc.status}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{doc.description}</p>
                      <div className="mt-3 flex items-center text-xs text-gray-500">
                        <User className="mr-1 h-3 w-3" />
                        <span>{doc.author}</span>
                        <span className="mx-2">•</span>
                        <CalendarDays className="mr-1 h-3 w-3" />
                        <span>{formatDate(doc.dateModified || doc.dateCreated)}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {doc.tags && doc.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 border-t border-gray-100 flex justify-between">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenFile(doc)}>
                        <FolderOpen className="h-4 w-4 mr-1" /> Open
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDownloadFile(doc)}>
                        <Download className="h-4 w-4 mr-1" /> Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Modified</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map(doc => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center">
                        {getDocumentIcon(doc.type)}
                        <span className="ml-2 font-medium text-gray-900">{doc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell><span className="capitalize">{doc.type}</span></TableCell>
                    <TableCell>
                      <Badge variant={doc.status === 'approved' ? 'default' : 'outline'}>
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(doc.dateModified || doc.dateCreated)}</TableCell>
                    <TableCell>{doc.author}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenFile(doc)}>
                          <FolderOpen className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDownloadFile(doc)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleShareDocument(doc)}>
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteDocument(doc)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
        
        <TabsContent value="cer-documents" className="mt-0">
          {/* Same content as all-documents tab, filtered for CER documents */}
          {/* The filtering is already handled in filteredDocuments */}
        </TabsContent>
        
        <TabsContent value="supporting-documents" className="mt-0">
          {/* Same content as all-documents tab, filtered for supporting documents */}
          {/* The filtering is already handled in filteredDocuments */}
        </TabsContent>
        
        <TabsContent value="draft-documents" className="mt-0">
          {/* Same content as all-documents tab, filtered for draft documents */}
          {/* The filtering is already handled in filteredDocuments */}
        </TabsContent>
      </Tabs>
      
      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <label htmlFor="document-file" className="text-sm font-medium">
                Document File
              </label>
              <div className="flex items-center justify-center w-full">
                <label htmlFor="document-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOCX, XLSX, or HTML (MAX. 10MB)
                    </p>
                  </div>
                  <input 
                    id="document-file" 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange} 
                  />
                </label>
              </div>
              {uploadFile && (
                <p className="text-sm text-gray-500">
                  Selected: {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
            
            <div className="grid w-full items-center gap-1.5">
              <label htmlFor="document-name" className="text-sm font-medium">
                Document Name
              </label>
              <Input
                id="document-name"
                value={uploadMetadata.name}
                onChange={(e) => setUploadMetadata({...uploadMetadata, name: e.target.value})}
              />
            </div>
            
            <div className="grid w-full items-center gap-1.5">
              <label htmlFor="document-type" className="text-sm font-medium">
                Document Type
              </label>
              <select 
                id="document-type"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                value={uploadMetadata.type}
                onChange={(e) => setUploadMetadata({...uploadMetadata, type: e.target.value})}
              >
                <option value="cer">Clinical Evaluation Report</option>
                <option value="literature">Literature Review</option>
                <option value="data">Clinical Data</option>
                <option value="risk">Risk Assessment</option>
                <option value="pms">Post-Market Surveillance</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="grid w-full items-center gap-1.5">
              <label htmlFor="document-status" className="text-sm font-medium">
                Status
              </label>
              <select 
                id="document-status"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                value={uploadMetadata.status}
                onChange={(e) => setUploadMetadata({...uploadMetadata, status: e.target.value})}
              >
                <option value="draft">Draft</option>
                <option value="review">Under Review</option>
                <option value="approved">Approved</option>
              </select>
            </div>
            
            <div className="grid w-full items-center gap-1.5">
              <label htmlFor="document-description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="document-description"
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors"
                value={uploadMetadata.description}
                onChange={(e) => setUploadMetadata({...uploadMetadata, description: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>Cancel</Button>
            <Button onClick={handleUpload}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Document</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            {selectedDocument && (
              <>
                <div className="flex items-center space-x-2">
                  {getDocumentIcon(selectedDocument.type)}
                  <span className="font-medium">{selectedDocument.name}</span>
                </div>
                
                <div className="grid w-full items-center gap-1.5">
                  <label className="text-sm font-medium">
                    Share Link
                  </label>
                  <div className="flex">
                    <Input 
                      readOnly 
                      value={`https://example.com/share/${selectedDocument.id}`} 
                      className="rounded-r-none"
                    />
                    <Button variant="secondary" className="rounded-l-none">
                      Copy
                    </Button>
                  </div>
                </div>
                
                <div className="grid w-full items-center gap-1.5">
                  <label className="text-sm font-medium">
                    Share with Users
                  </label>
                  <Input placeholder="Enter email addresses..." />
                </div>
                
                <div className="grid w-full items-center gap-1.5">
                  <label className="text-sm font-medium">
                    Permission Level
                  </label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors">
                    <option value="view">View only</option>
                    <option value="comment">Comment</option>
                    <option value="edit">Edit</option>
                  </select>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>Cancel</Button>
            <Button>Share</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}