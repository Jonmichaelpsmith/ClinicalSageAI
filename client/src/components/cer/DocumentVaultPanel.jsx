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
  
  // Download file handler - creates an HTML file with document content for demo
  const handleDownloadFile = (doc) => {
    try {
      // Create content based on document type
      let content = '';
      
      // Generate HTML content from the document's sections
      if (doc.content?.sections && doc.content.sections.length > 0) {
        content = doc.content.sections.map(section => {
          return `
            <div style="margin-bottom: 20px;">
              <h2 style="color: #333; margin-top: 20px;">${section.title}</h2>
              <p style="margin-bottom: 10px;">${section.content}</p>
            </div>
          `;
        }).join('');
      } else {
        // Fallback if no sections are available
        content = `
          <div style="margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 20px;">${doc.name}</h2>
            <p style="margin-bottom: 10px;">${doc.description}</p>
          </div>
        `;
      }
      
      // Create full HTML document
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${doc.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 30px; }
            h1 { color: #0F6CBD; }
            h2 { color: #333; margin-top: 20px; }
            .header { display: flex; justify-content: space-between; align-items: center; }
            .metadata { color: #666; font-size: 12px; margin-bottom: 30px; border: 1px solid #eee; padding: 10px; background: #f9f9f9; }
            .content { margin-bottom: 20px; }
            .footer { border-top: 1px solid #eee; padding-top: 10px; font-size: 10px; color: #999; }
            .watermark { position: fixed; top: 50%; left: 0; width: 100%; text-align: center; opacity: 0.1; transform: rotate(-45deg); font-size: 120px; z-index: -1; }
            .status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
            .status-approved { background: #e6f4ea; color: #137333; }
            .status-draft { background: #fff8e6; color: #b06000; }
          </style>
        </head>
        <body>
          ${doc.status === 'draft' ? '<div class="watermark">DRAFT</div>' : ''}
          
          <div class="header">
            <h1>${doc.name}</h1>
            <div class="status ${doc.status === 'approved' ? 'status-approved' : 'status-draft'}">
              ${doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
            </div>
          </div>
          
          <div class="metadata">
            <p><strong>Author:</strong> ${doc.author} | <strong>Version:</strong> ${doc.version} | <strong>Modified:</strong> ${formatDate(doc.dateModified)}</p>
            <p><strong>Category:</strong> ${doc.category} | <strong>Tags:</strong> ${doc.tags.join(', ')}</p>
            ${doc.content?.metadata?.standard ? `<p><strong>Standard:</strong> ${doc.content.metadata.standard}</p>` : ''}
            ${doc.content?.metadata?.complianceScore ? `<p><strong>Compliance Score:</strong> ${doc.content.metadata.complianceScore}%</p>` : ''}
          </div>
          
          <div class="content">
            ${content}
          </div>
          
          <div class="footer">
            <p>Document ID: ${doc.id} | Generated: ${new Date().toLocaleString()}</p>
            <p>TrialSage Document Management System | Confidential</p>
          </div>
        </body>
        </html>
      `;
      
      // Create blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.name.replace(/\s+/g, '_').toLowerCase()}.html`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
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
        <DialogContent className="bg-white border-none">
          <DialogHeader>
            <DialogTitle className="text-[#323130] text-lg font-semibold">Upload Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="border-2 border-dashed border-[#0F6CBD] rounded-lg p-6 text-center bg-white">
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
        <DialogContent className="bg-white border-none">
          <DialogHeader>
            <DialogTitle className="text-[#323130] text-lg font-semibold">Share Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            {selectedDocument && (
              <div className="flex items-start space-x-3 p-3 rounded-md border border-[#0F6CBD] border-opacity-30">
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