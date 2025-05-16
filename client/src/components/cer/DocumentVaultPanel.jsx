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
  Loader2,
  BookOpen,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Sample documents for demo purposes with more professional examples
const sampleDocuments = [
  // CER Documents - European Regulatory Focus
  {
    id: '1',
    name: 'Clinical Evaluation Report - CardioStent Pro',
    type: 'cer',
    category: 'Clinical Evaluation',
    status: 'final',
    description: 'Comprehensive CER for class III cardiovascular stent following MEDDEV 2.7/1 Rev 4 guidance with clinical trial data analysis',
    author: 'Dr. Jonathan Blake, MD, FESC',
    tags: ['CER', 'MEDDEV', 'Class III', 'Cardiovascular'],
    dateCreated: '2025-03-15T12:00:00Z',
    dateModified: '2025-05-01T09:30:00Z',
    size: 4582912,
    path: '/Clinical Evaluation/CERs',
    filePath: '/attached_assets/CER REPORT EXAMPLE OUTPUT.pdf',
    reviewDate: '2025-06-01T00:00:00Z',
    reviewers: ['Dr. Emma Chen', 'Prof. Richard Williams'],
    version: '3.2.1',
    compliance: ['EU MDR 2017/745', 'MEDDEV 2.7/1 Rev 4']
  },
  {
    id: '2',
    name: 'Literature Search Protocol - DiabetMeter GLX',
    type: 'literature',
    category: 'Literature',
    status: 'final',
    description: 'Comprehensive literature review methodology including 78 papers from PubMed, EMBASE and Google Scholar for glucose monitoring device effectiveness',
    author: 'Dr. Emma Johnson, PhD',
    tags: ['Literature', 'Research', 'PubMed', 'Systematic Review'],
    dateCreated: '2025-02-20T10:15:00Z',
    dateModified: '2025-04-28T14:45:00Z',
    size: 2345678,
    path: '/Clinical Evaluation/Literature',
    filePath: '/attached_assets/7.19.13.Miller-Clinical-Trials.pdf',
    reviewDate: '2025-05-28T00:00:00Z',
    reviewers: ['Dr. Michael Chen'],
    version: '2.0.0',
    compliance: ['EU MDR 2017/745']
  },
  {
    id: '3',
    name: 'Risk Management Report - NeuroPace Model X220',
    type: 'risk',
    category: 'Risk Management',
    status: 'final',
    description: 'ISO 14971:2019 compliant risk analysis and evaluation for neurostimulation device with FMEA and risk mitigation strategy',
    author: 'Robert Chen, PhD, CCRP',
    tags: ['Risk', 'ISO 14971', 'FMEA', 'Class III'],
    dateCreated: '2025-03-05T09:00:00Z',
    dateModified: '2025-05-10T11:20:00Z',
    size: 1867234,
    path: '/Risk Management',
    filePath: '/attached_assets/AO_2508_2023_1-3.pdf',
    reviewDate: '2025-06-05T00:00:00Z',
    reviewers: ['Sarah Miller, RAC', 'Dr. James Peterson'],
    version: '4.1.2',
    compliance: ['ISO 14971:2019', 'EU MDR 2017/745']
  },
  
  // 510(k) Documents - US FDA Focus
  {
    id: '4',
    name: '510(k) Summary - OrthoFuse Spinal System',
    type: '510k',
    category: 'Regulatory',
    status: 'final',
    description: 'FDA 510(k) Summary document for submission with substantial equivalence justification to K201234 and K193456',
    author: 'Sarah Miller, MS, RAC',
    tags: ['510k', 'FDA', 'Submission', 'Orthopedic'],
    dateCreated: '2025-04-12T13:30:00Z',
    dateModified: '2025-05-08T16:15:00Z',
    size: 3156289,
    path: '/510k/Submission',
    filePath: '/attached_assets/449782ff-f6b4-4fc2-82e1-9f4740b8ec7e_23135_-_ayesha_siddiqui_v2.pdf',
    reviewDate: '2025-05-20T00:00:00Z',
    reviewers: ['Dr. Richard Thompson', 'Elizabeth Chen, RAC'],
    version: '1.3.0',
    compliance: ['21 CFR 807.92', 'FDA Guidance K1483']
  },
  {
    id: '5',
    name: 'Substantial Equivalence Demonstration - CardioMonitor X5',
    type: '510k',
    category: 'Regulatory',
    status: 'final',
    description: 'Comprehensive comparison to predicate devices (K192345 and K203456) demonstrating substantial equivalence with comparative testing results',
    author: 'Dr. Thomas Lee, MD, FACC',
    tags: ['510k', 'FDA', 'Equivalence', 'Cardiovascular'],
    dateCreated: '2025-03-28T11:45:00Z',
    dateModified: '2025-05-05T10:10:00Z',
    size: 2873456,
    path: '/510k/Equivalence',
    filePath: '/attached_assets/2022-JCS-MediaPack.pdf',
    reviewDate: '2025-05-15T00:00:00Z',
    reviewers: ['Dr. Jennifer Wu', 'Michael Harris, RAC'],
    version: '2.1.0',
    compliance: ['FDA Guidance for Industry and FDA Staff']
  },
  {
    id: '6',
    name: 'Biocompatibility Assessment Report - DermaPatch Pro',
    type: 'data',
    category: 'Testing',
    status: 'final',
    description: 'Comprehensive biocompatibility testing results per ISO 10993 series including cytotoxicity, sensitization, and irritation testing',
    author: 'Dr. Lisa Wong, PhD, DABT',
    tags: ['Testing', 'Biocompatibility', 'ISO 10993', 'Skin Contact'],
    dateCreated: '2025-02-08T14:20:00Z',
    dateModified: '2025-04-15T09:30:00Z',
    size: 5241869,
    path: '/Testing/Biocompatibility',
    filePath: '/attached_assets/ICER_Acute-Pain_Evidence-Report_For-Publication_020525.pdf',
    reviewDate: '2025-04-30T00:00:00Z',
    reviewers: ['Dr. James Wilson', 'Dr. Susan Chen, DABT'],
    version: '1.0.0',
    compliance: ['ISO 10993-1:2018', '21 CFR Part 58']
  },
  {
    id: '7',
    name: 'Post-Market Clinical Follow-up Protocol - GlucoMonitor G7',
    type: 'pms',
    category: 'Clinical',
    status: 'approved',
    description: 'Protocol for post-market surveillance clinical study tracking 500 patients over 24 months with quarterly interim analyses',
    author: 'Dr. Michael Brown, MD, PhD',
    tags: ['Clinical', 'Protocol', 'PMS', 'PMCF'],
    dateCreated: '2025-01-15T10:00:00Z',
    dateModified: '2025-03-20T15:45:00Z',
    size: 1958762,
    path: '/Clinical/Protocols',
    filePath: '/attached_assets/DNDi-Clinical-Trial-Protocol-BENDITA-V5.pdf',
    reviewDate: '2025-04-01T00:00:00Z',
    reviewers: ['Dr. Susan Chen', 'Dr. Robert Williams'],
    version: '2.0.0',
    compliance: ['EU MDR 2017/745 Annex XIV']
  },
  {
    id: '8',
    name: 'Software Validation Report - InsulinPump X3 Control System',
    type: '510k',
    category: 'Software',
    status: 'final',
    description: 'Software validation and verification documentation including unit, integration and system testing for Class III insulin pump control system',
    author: 'James Wilson, MS, CSQE',
    tags: ['Software', 'Validation', '510k', 'IEC 62304'],
    dateCreated: '2025-02-25T09:15:00Z',
    dateModified: '2025-04-10T14:30:00Z',
    size: 3674125,
    path: '/510k/Software',
    filePath: '/attached_assets/48_161.pdf',
    reviewDate: '2025-04-25T00:00:00Z',
    reviewers: ['Dr. Emily Johnson', 'Robert Chen, CSTE'],
    version: '3.4.0',
    compliance: ['IEC 62304:2015', 'FDA Guidance for SaMD']
  },
  {
    id: '9',
    name: 'FDA Pre-Submission Meeting Minutes - Neural Stim X100',
    type: '510k',
    category: 'Regulatory',
    status: 'final',
    description: 'Minutes from FDA pre-submission meeting regarding testing requirements for neurostimulation device with integrated AI features',
    author: 'Elizabeth Shaw, MS, RAC',
    tags: ['FDA', 'Pre-Sub', 'Meeting', 'Neurology'],
    dateCreated: '2025-03-05T13:00:00Z',
    dateModified: '2025-03-10T15:30:00Z',
    size: 1245678,
    path: '/510k/Regulatory',
    filePath: '/attached_assets/ICHImplementationPublicReport_2022_0107.pdf',
    reviewDate: '2025-04-01T00:00:00Z',
    reviewers: ['Michael Harris, RAC', 'Dr. Thomas Lee'],
    version: '1.0.0',
    compliance: ['FDA Q-Sub Guidance']
  },
  {
    id: '10',
    name: 'Electromagnetic Compatibility Test Report - HeartTrack 360',
    type: 'data',
    category: 'Testing',
    status: 'final',
    description: 'Comprehensive EMC testing per IEC 60601-1-2:2020 including emissions, immunity and environmental testing',
    author: 'Dr. Robert Williams, PhD',
    tags: ['EMC', 'IEC 60601', 'Testing', 'Electrical Safety'],
    dateCreated: '2025-01-20T14:30:00Z',
    dateModified: '2025-03-15T09:45:00Z',
    size: 4582910,
    path: '/Testing/EMC',
    filePath: '/attached_assets/AO_2508_2023_1-3.pdf',
    reviewDate: '2025-04-01T00:00:00Z',
    reviewers: ['Dr. James Peterson', 'Sarah Miller, RAC'],
    version: '1.2.0',
    compliance: ['IEC 60601-1-2:2020', '21 CFR Part 58']
  },
  {
    id: '11',
    name: 'EU Technical File - PainRelief Ultrasound Device',
    type: 'cer',
    category: 'Regulatory',
    status: 'final',
    description: 'Complete EU MDR Technical Documentation for Class IIb ultrasound therapy device with risk management and clinical evaluation',
    author: 'Dr. Rebecca Martinez, PhD, RAC',
    tags: ['EU MDR', 'Technical File', 'Class IIb', 'CE Mark'],
    dateCreated: '2025-02-10T10:00:00Z',
    dateModified: '2025-04-25T16:30:00Z',
    size: 7865321,
    path: '/Regulatory/EU',
    filePath: '/attached_assets/Clinical-Evaluation-Reports-How-To-Leverage-Published-Data-–-Pro-Te-Fall-2016.pdf',
    reviewDate: '2025-05-10T00:00:00Z',
    reviewers: ['Dr. Michael Chen', 'Sarah Miller, RAC'],
    version: '2.0.0',
    compliance: ['EU MDR 2017/745', 'MEDDEV 2.7/1 Rev 4']
  },
  {
    id: '12',
    name: 'Cybersecurity Risk Assessment - ConnectedHealth Platform',
    type: '510k',
    category: 'Software',
    status: 'final',
    description: 'Comprehensive cybersecurity threat modeling, risk assessment and mitigation strategy for connected medical device platform',
    author: 'David Garcia, CISSP, CEH',
    tags: ['Cybersecurity', 'NIST', 'Risk Assessment', 'Connected Device'],
    dateCreated: '2025-03-10T12:45:00Z',
    dateModified: '2025-05-02T11:30:00Z',
    size: 2154738,
    path: '/510k/Cybersecurity',
    filePath: '/attached_assets/ICHImplementationPublicReport_Final_2024_1001.pdf',
    reviewDate: '2025-05-15T00:00:00Z',
    reviewers: ['James Wilson, CISSP', 'Sarah Miller, RAC'],
    version: '1.5.0',
    compliance: ['FDA Cybersecurity Guidance', 'NIST SP 800-53']
  },
  {
    id: '13',
    name: 'Human Factors Validation Report - InsulinPen XRF',
    type: 'data',
    category: 'Testing',
    status: 'final',
    description: 'Human factors validation testing with 30 representative users including formative and summative usability studies',
    author: 'Dr. Jennifer Taylor, PhD, CHFP',
    tags: ['Human Factors', 'Usability', 'IEC 62366', 'User Studies'],
    dateCreated: '2025-02-05T11:20:00Z',
    dateModified: '2025-04-20T10:15:00Z',
    size: 3432587,
    path: '/Testing/Human Factors',
    filePath: '/attached_assets/Human-Factors-Studies-and-Related-Clinical-Study-Considerations-in-Combination-Product-Design-and-Development.pdf',
    reviewDate: '2025-05-01T00:00:00Z',
    reviewers: ['Dr. Lisa Wong', 'Thomas Lee, MD'],
    version: '2.0.0',
    compliance: ['IEC 62366-1:2015', 'FDA Human Factors Guidance']
  },
  {
    id: '14',
    name: 'eSTAR Submission Package - PainRelief Stimulator',
    type: '510k',
    category: 'Submission',
    status: 'final',
    description: 'Complete eSTAR electronic submission package for FDA 510(k) including all required elements and predicate comparison',
    author: 'Sarah Miller, MS, RAC',
    tags: ['510k', 'eSTAR', 'FDA', 'Submission'],
    dateCreated: '2025-04-05T14:30:00Z',
    dateModified: '2025-05-10T11:45:00Z',
    size: 15876543,
    path: '/510k/Submission',
    filePath: '/attached_assets/Format-and-Content-of-the-Clinical-and-Statistical-Sections-of-an-Application.pdf',
    reviewDate: '2025-05-20T00:00:00Z',
    reviewers: ['Dr. Thomas Lee', 'Elizabeth Shaw, RAC'],
    version: '1.0.0',
    compliance: ['FDA eSTAR Guidance', '21 CFR 807']
  },
  {
    id: '15',
    name: 'Post-Market Surveillance Plan - CardioStent Pro',
    type: 'pms',
    category: 'PMS',
    status: 'approved',
    description: 'Comprehensive post-market surveillance plan as required by EU MDR with trending analysis and periodic reporting schedule',
    author: 'Jennifer Taylor, MS, RAC',
    tags: ['PMS', 'MDR', 'Surveillance', 'PMCF'],
    dateCreated: '2025-02-05T11:20:00Z',
    dateModified: '2025-04-20T10:15:00Z',
    size: 1432587,
    path: '/PMS',
    filePath: '/attached_assets/7_structure_and_content_of_clinical_study_reports.pdf',
    reviewDate: '2025-05-01T00:00:00Z',
    reviewers: ['Dr. James Peterson', 'Dr. Emma Johnson'],
    version: '2.1.0',
    compliance: ['EU MDR 2017/745 Article 83', 'MDCG 2020-7']
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
  isOpen = true // Set default to true to ensure documents are visible
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
      
      {/* Enhanced Document metrics dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="shadow-sm border-blue-100 hover:shadow-md transition-shadow">
          <CardContent className="p-3 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-blue-600">{documentMetrics.total}</div>
            <p className="text-xs text-gray-600 font-medium mt-1 flex items-center">
              <FileText className="h-3 w-3 mr-1" />
              Total Documents
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-blue-100 hover:shadow-md transition-shadow">
          <CardContent className="p-3 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-blue-600">{documentMetrics.cer}</div>
            <p className="text-xs text-gray-600 font-medium mt-1 flex items-center">
              <FileText className="h-3 w-3 mr-1 text-blue-500" />
              CER Documents
            </p>
            <div className="mt-1 h-1 w-16 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full" 
                style={{ width: `${(documentMetrics.cer / documentMetrics.total) * 100}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-green-100 hover:shadow-md transition-shadow">
          <CardContent className="p-3 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-green-600">{documentMetrics.fivetenk}</div>
            <p className="text-xs text-gray-600 font-medium mt-1 flex items-center">
              <FileText className="h-3 w-3 mr-1 text-green-500" />
              510(k) Documents
            </p>
            <div className="mt-1 h-1 w-16 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full" 
                style={{ width: `${(documentMetrics.fivetenk / documentMetrics.total) * 100}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-amber-100 hover:shadow-md transition-shadow">
          <CardContent className="p-3 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-amber-600">{documentMetrics.literature}</div>
            <p className="text-xs text-gray-600 font-medium mt-1 flex items-center">
              <BookOpen className="h-3 w-3 mr-1 text-amber-500" />
              Literature
            </p>
            <div className="mt-1 h-1 w-16 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 rounded-full" 
                style={{ width: `${(documentMetrics.literature / documentMetrics.total) * 100}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-green-100 hover:shadow-md transition-shadow">
          <CardContent className="p-3 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-green-600">{documentMetrics.final}</div>
            <p className="text-xs text-gray-600 font-medium mt-1 flex items-center">
              <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
              Final
            </p>
            <div className="mt-1 h-1 w-16 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full" 
                style={{ width: `${(documentMetrics.final / documentMetrics.total) * 100}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-amber-100 hover:shadow-md transition-shadow">
          <CardContent className="p-3 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-amber-600">{documentMetrics.draft}</div>
            <p className="text-xs text-gray-600 font-medium mt-1 flex items-center">
              <FileBox className="h-3 w-3 mr-1 text-amber-500" />
              Draft
            </p>
            <div className="mt-1 h-1 w-16 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 rounded-full" 
                style={{ width: `${(documentMetrics.draft / documentMetrics.total) * 100}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Enhanced search interface with advanced filters */}
      <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-blue-500" />
            <Input
              type="search"
              placeholder="Search by title, author, or content..."
              className="pl-9 border-blue-100 focus:border-blue-300 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full md:w-auto">
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-auto">
              <TabsList className="bg-white border border-gray-200 p-1">
                <TabsTrigger value="all-documents" className="text-xs data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">All</TabsTrigger>
                <TabsTrigger value="cer-documents" className="text-xs data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">CER</TabsTrigger>
                <TabsTrigger value="510k-documents" className="text-xs data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">510(k)</TabsTrigger>
                <TabsTrigger value="literature" className="text-xs data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Literature</TabsTrigger>
                <TabsTrigger value="reports" className="text-xs data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Reports</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex border rounded-md overflow-hidden bg-white ml-auto shadow-sm">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className={`rounded-none ${viewMode === 'list' ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                className={`rounded-none ${viewMode === 'grid' ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Advanced filters - collapsible section */}
        <div className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Status</label>
              <Select defaultValue="all">
                <SelectTrigger className="h-8 text-xs border-gray-200">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="final">Final</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Date Modified</label>
              <Select defaultValue="all">
                <SelectTrigger className="h-8 text-xs border-gray-200">
                  <SelectValue placeholder="Any time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                  <SelectItem value="quarter">This quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Author</label>
              <Select defaultValue="all">
                <SelectTrigger className="h-8 text-xs border-gray-200">
                  <SelectValue placeholder="All authors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All authors</SelectItem>
                  <SelectItem value="sarah">Sarah Miller, RAC</SelectItem>
                  <SelectItem value="thomas">Dr. Thomas Lee</SelectItem>
                  <SelectItem value="james">James Wilson</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced breadcrumb navigation */}
      <div className="flex items-center mt-4 bg-white border rounded-md p-2 shadow-sm">
        <div className="flex items-center overflow-x-auto whitespace-nowrap scrollbar-hide text-sm">
          {getBreadcrumbs().map((crumb, index, arr) => (
            <React.Fragment key={crumb.path}>
              {index === 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 rounded-md text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  onClick={() => handleBreadcrumbClick(crumb.path)}
                >
                  <FolderOpen className="h-4 w-4 mr-1" />
                  {crumb.name}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 rounded-md text-gray-600 hover:text-blue-700 hover:bg-blue-50"
                  onClick={() => handleBreadcrumbClick(crumb.path)}
                >
                  {crumb.name}
                </Button>
              )}
              {index < arr.length - 1 && (
                <ChevronRight className="h-3 w-3 mx-1 text-gray-400" />
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
                        <Table className="border-collapse">
                          <TableHeader className="bg-gray-50">
                            <TableRow className="border-b-2 border-gray-200">
                              <TableHead className="py-3 font-semibold text-gray-700">Name</TableHead>
                              <TableHead className="py-3 font-semibold text-gray-700">Type</TableHead>
                              <TableHead className="py-3 font-semibold text-gray-700">Status</TableHead>
                              <TableHead className="py-3 font-semibold text-gray-700">Version</TableHead>
                              <TableHead className="py-3 font-semibold text-gray-700">Modified</TableHead>
                              <TableHead className="py-3 font-semibold text-gray-700">Size</TableHead>
                              <TableHead className="py-3 font-semibold text-gray-700 text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredDocuments.map((doc) => (
                              <TableRow 
                                key={doc.id}
                                className="cursor-pointer hover:bg-blue-50 border-b border-gray-100 transition-colors"
                                onClick={() => handleOpenDocument(doc)}
                              >
                                <TableCell className="font-medium py-3">
                                  <div className="flex items-center">
                                    {getDocumentIcon(doc.type)}
                                    <span className="ml-2 font-medium text-gray-900">{doc.name}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    variant="outline" 
                                    className={`capitalize ${
                                      doc.type === 'cer' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                      doc.type === '510k' ? 'bg-green-50 text-green-700 border-green-200' :
                                      doc.type === 'literature' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                      doc.type === 'risk' ? 'bg-red-50 text-red-700 border-red-200' :
                                      'bg-purple-50 text-purple-700 border-purple-200'
                                    }`}
                                  >
                                    {doc.type === '510k' ? '510(k)' : doc.type}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge className={
                                    doc.status === 'final' ? 'bg-green-100 text-green-800 hover:bg-green-100 border-0' :
                                    doc.status === 'approved' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100 border-0' :
                                    'bg-amber-100 text-amber-800 hover:bg-amber-100 border-0'
                                  }>
                                    {doc.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {doc.version || "N/A"}
                                </TableCell>
                                <TableCell className="text-gray-600">{formatDate(doc.dateModified)}</TableCell>
                                <TableCell className="text-gray-600">{formatFileSize(doc.size)}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-full hover:bg-blue-100 hover:text-blue-600"
                                      onClick={(e) => { e.stopPropagation(); handleOpenDocument(doc); }}
                                    >
                                      <FileText className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-full hover:bg-blue-100 hover:text-blue-600"
                                      onClick={(e) => { e.stopPropagation(); handleDownload(doc); }}
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-full hover:bg-blue-100 hover:text-blue-600"
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
                            className="cursor-pointer transition-all hover:shadow-md overflow-hidden border border-gray-200 hover:border-blue-300"
                            onClick={() => handleOpenDocument(doc)}
                          >
                            <CardContent className="p-0">
                              <div className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                  <div className="rounded-full p-2 bg-gray-50 border border-gray-100">
                                    {getDocumentIcon(doc.type)}
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <Badge className={
                                      doc.status === 'final' ? 'bg-green-100 text-green-800 hover:bg-green-100 border-0' :
                                      doc.status === 'approved' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100 border-0' :
                                      'bg-amber-100 text-amber-800 hover:bg-amber-100 border-0'
                                    }>
                                      {doc.status}
                                    </Badge>
                                    {doc.version && (
                                      <span className="text-xs text-gray-500 mt-1">v{doc.version}</span>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="mb-3">
                                  <h4 className="font-medium line-clamp-1 text-gray-900">{doc.name}</h4>
                                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{doc.description}</p>
                                </div>
                                
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {doc.tags?.slice(0, 3).map((tag, idx) => (
                                    <Badge key={idx} variant="outline" className="bg-gray-50 text-gray-700 text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {doc.tags?.length > 3 && (
                                    <Badge variant="outline" className="bg-gray-50 text-gray-700 text-xs">
                                      +{doc.tags.length - 3}
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <div className="flex items-center">
                                    <User className="h-3 w-3 mr-1" />
                                    <span className="truncate max-w-[120px]">{doc.author || 'Unknown'}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <CalendarDays className="h-3 w-3 mr-1" />
                                    <span>{formatDate(doc.dateModified)}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex justify-between p-2 border-t bg-gray-50">
                                <Badge variant="outline" className="bg-white capitalize border-gray-200">
                                  {doc.type === '510k' ? '510(k)' : doc.type}
                                </Badge>
                                
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-full hover:bg-blue-100 hover:text-blue-600"
                                    onClick={(e) => { e.stopPropagation(); handleDownload(doc); }}
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-full hover:bg-blue-100 hover:text-blue-600"
                                    onClick={(e) => { e.stopPropagation(); handleShare(doc); }}
                                  >
                                    <Share2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
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
  
  // Enhanced PDF viewer dialog with document details and metadata
  const renderPdfViewer = () => (
    <Dialog open={showPdfViewerDialog} onOpenChange={setShowPdfViewerDialog} className="z-50">
      <DialogContent className="max-w-6xl h-[85vh] max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-3 border-b">
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle className="text-xl flex items-center">
                {getDocumentIcon(selectedDocument?.type)}
                <span className="ml-2">{selectedDocument?.name || "Document Viewer"}</span>
              </DialogTitle>
              <DialogDescription className="flex items-center mt-1">
                <Badge className="mr-2" variant={selectedDocument?.status === "final" ? "default" : "outline"}>
                  {selectedDocument?.status === "final" ? "Final" : 
                   selectedDocument?.status === "approved" ? "Approved" : "Draft"}
                </Badge>
                {selectedDocument?.version && (
                  <Badge variant="outline" className="mr-2">v{selectedDocument.version}</Badge>
                )}
                <span className="text-xs text-gray-500">Last modified: {formatDate(selectedDocument?.dateModified)}</span>
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 gap-1"
                onClick={() => window.open(currentPdfUrl, '_blank')}
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 gap-1"
                onClick={() => setShowPdfViewerDialog(false)}
              >
                <X className="h-3.5 w-3.5" />
                Close
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Main PDF display area */}
          <div className="flex-grow overflow-hidden">
            <iframe 
              src={currentPdfUrl}
              className="w-full h-full border-r" 
              title="PDF Viewer"
            ></iframe>
          </div>
          
          {/* Document metadata sidebar */}
          <div className="w-80 bg-gray-50 p-4 overflow-y-auto">
            <h4 className="font-medium mb-3">Document Details</h4>
            <div className="space-y-4">
              <div>
                <h5 className="text-xs font-medium text-gray-500 mb-1">Author</h5>
                <div className="text-sm">{selectedDocument?.author || "Unknown"}</div>
              </div>
              
              <div>
                <h5 className="text-xs font-medium text-gray-500 mb-1">Category</h5>
                <div className="text-sm">{selectedDocument?.category || "Uncategorized"}</div>
              </div>
              
              <div>
                <h5 className="text-xs font-medium text-gray-500 mb-1">Description</h5>
                <div className="text-sm">{selectedDocument?.description || "No description available."}</div>
              </div>
              
              <div>
                <h5 className="text-xs font-medium text-gray-500 mb-1">Compliance</h5>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedDocument?.compliance?.map((standard, idx) => (
                    <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-600 hover:bg-blue-50">
                      {standard}
                    </Badge>
                  )) || <span className="text-sm text-gray-400">No standards specified</span>}
                </div>
              </div>
              
              <div>
                <h5 className="text-xs font-medium text-gray-500 mb-1">Tags</h5>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedDocument?.tags?.map((tag, idx) => (
                    <Badge key={idx} variant="outline">
                      {tag}
                    </Badge>
                  )) || <span className="text-sm text-gray-400">No tags</span>}
                </div>
              </div>
              
              <div>
                <h5 className="text-xs font-medium text-gray-500 mb-1">Reviewers</h5>
                <div className="text-sm">
                  {selectedDocument?.reviewers?.join(', ') || "None assigned"}
                </div>
              </div>
              
              <div>
                <h5 className="text-xs font-medium text-gray-500 mb-1">File Size</h5>
                <div className="text-sm">{selectedDocument?.size ? formatFileSize(selectedDocument.size) : "Unknown"}</div>
              </div>
              
              <div>
                <h5 className="text-xs font-medium text-gray-500 mb-1">Created</h5>
                <div className="text-sm">{formatDate(selectedDocument?.dateCreated)}</div>
              </div>
              
              <div>
                <h5 className="text-xs font-medium text-gray-500 mb-1">Next Review</h5>
                <div className="text-sm">{formatDate(selectedDocument?.reviewDate)}</div>
              </div>
              
              <div>
                <h5 className="text-xs font-medium text-gray-500 mb-1">Path</h5>
                <div className="text-sm font-mono text-xs">{selectedDocument?.path || "/"}</div>
              </div>
            </div>
          </div>
        </div>
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