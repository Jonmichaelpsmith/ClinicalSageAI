import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fetchAllCERs, generateFullCER, generateSampleCER } from "../services/cerService";
import { fetchDocuments, approveDocument, fetchCERHistory } from "../services/documentService";
import DocumentFilterPanel from "../components/documents/DocumentFilterPanel";
import DocumentList from "../components/documents/DocumentList";
import { 
  FileText, Search, Download, Upload, FileSpreadsheet, 
  Book, Database, Layers, Settings, Microscope, BarChart4, 
  Clock, CheckCircle2, AlarmClock, FolderOpen, FileCog, FilePlus2,
  Folder, Copy, ChevronDown, ThumbsUp, ThumbsDown, RefreshCw, X
} from 'lucide-react';

/**
 * Advanced CER Generator™ Page (V2)
 * 
 * This page provides a comprehensive document management system for:
 * - Creating Clinical Evaluation Reports with AI assistance
 * - AI co-authoring with one-click full report generation
 * - Past reports library with version management
 * - Document vault integration
 * - Integration with PubMed and FDA data sources
 * - Template management and import
 * - Collaborative review and audit trails
 */
const CERV2Page = () => {
  const [activeTab, setActiveTab] = useState('input');
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [fdaData, setFdaData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportStatus, setReportStatus] = useState(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState('');
  const [sampleModalOpen, setSampleModalOpen] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);
  const [sampleURL, setSampleURL] = useState(null);
  const [selectedSampleTemplate, setSelectedSampleTemplate] = useState('mdr-full');
  
  // Document filter state
  const [docFilters, setDocFilters] = useState({});
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsPagination, setDocsPagination] = useState({ page: 1, totalPages: 1 });
  
  // Mock data for existing CER reports
  const [pastReports, setPastReports] = useState([
    {
      id: 'CER20250327001',
      title: 'CardioMonitor Pro 3000 - EU MDR Clinical Evaluation',
      status: 'final',
      deviceName: 'CardioMonitor Pro 3000',
      deviceType: 'Patient Monitoring Device',
      manufacturer: 'MedTech Innovations, Inc.',
      templateUsed: 'EU MDR 2017/745 Full Template',
      generatedAt: '2025-03-27T14:23:45Z',
      lastModified: '2025-04-02T09:15:22Z',
      pageCount: 78,
      wordCount: 28506,
      sections: 14,
      projectId: 'PR-CV-2025'
    },
    {
      id: 'CER20250312002',
      title: 'NeuroPulse Implant - MEDDEV Clinical Evaluation',
      status: 'draft',
      deviceName: 'NeuroPulse Implant',
      deviceType: 'Implantable Medical Device',
      manufacturer: 'Neural Systems Ltd.',
      templateUsed: 'MEDDEV 2.7/1 Rev 4 Template',
      generatedAt: '2025-03-12T10:08:31Z',
      lastModified: '2025-03-12T10:08:31Z',
      pageCount: 64,
      wordCount: 22145,
      sections: 12,
      projectId: 'PR-IM-2025'
    },
    {
      id: 'CER20250220003',
      title: 'LaserScan X500 - FDA 510(k) Clinical Evaluation',
      status: 'final',
      deviceName: 'LaserScan X500',
      deviceType: 'Diagnostic Equipment',
      manufacturer: 'OptiMed Devices, Inc.',
      templateUsed: 'FDA 510(k) Template',
      generatedAt: '2025-02-20T16:42:19Z',
      lastModified: '2025-03-01T11:33:57Z',
      pageCount: 52,
      wordCount: 18230,
      sections: 10,
      projectId: 'PR-DG-2025'
    },
    {
      id: 'CER20250115004',
      title: 'DermaSense Probe - PMDA Clinical Evaluation',
      status: 'final',
      deviceName: 'DermaSense Probe',
      deviceType: 'Diagnostic Equipment',
      manufacturer: 'TechMed Solutions',
      templateUsed: 'PMDA Template (Japan)',
      generatedAt: '2025-01-15T09:27:45Z',
      lastModified: '2025-01-30T14:55:22Z',
      pageCount: 62,
      wordCount: 21578,
      sections: 11,
      projectId: 'PR-DG-2025'
    },
    {
      id: 'CER20241205005',
      title: 'SurgAssist Robotic Arm - EU MDR Clinical Evaluation',
      status: 'draft',
      deviceName: 'SurgAssist Robotic Arm',
      deviceType: 'Surgical Instrument',
      manufacturer: 'Surgical Robotics, Inc.',
      templateUsed: 'EU MDR 2017/745 Full Template',
      generatedAt: '2024-12-05T13:11:38Z',
      lastModified: '2025-04-01T16:22:07Z',
      pageCount: 85,
      wordCount: 31240,
      sections: 15,
      projectId: 'PR-SR-2024'
    }
  ]);
  
  // Mock device type options
  const deviceTypes = [
    { value: 'implantable', label: 'Implantable Medical Device' },
    { value: 'diagnostic', label: 'Diagnostic Equipment' },
    { value: 'surgical', label: 'Surgical Instrument' },
    { value: 'monitoring', label: 'Patient Monitoring Device' },
    { value: 'therapeutic', label: 'Therapeutic Device' }
  ];
  
  // Mock template options
  const templateOptions = [
    { value: 'template_mdr_full', label: 'EU MDR 2017/745 Full Template' },
    { value: 'template_mdr_lite', label: 'EU MDR Simplified Template' },
    { value: 'template_meddev', label: 'MEDDEV 2.7/1 Rev 4 Template' },
    { value: 'template_fda', label: 'FDA 510(k) Template' },
    { value: 'template_pmda', label: 'PMDA Template (Japan)' }
  ];

  // Simulated PubMed search
  const handlePubMedSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Mock PubMed search results
      const mockResults = [
        {
          id: 'pmid12345678',
          title: 'Clinical outcomes of patients using ' + deviceName + ' for treatment of chronic conditions',
          authors: 'Johnson AB, Smith CD, Thompson EF',
          journal: 'Journal of Medical Devices',
          year: '2024',
          abstract: 'This study evaluated the safety and efficacy of ' + deviceName + ' in 150 patients over a 24-month period. Results showed statistically significant improvement in outcomes compared to traditional methods...'
        },
        {
          id: 'pmid23456789',
          title: 'Long-term safety analysis of ' + deviceType + ' systems in clinical practice',
          authors: 'Williams GH, Davis IJ, Anderson KL',
          journal: 'Medical Technology Research',
          year: '2023',
          abstract: 'A retrospective analysis of 500 patients treated with various ' + deviceType + ' systems, including evaluation of adverse events and device longevity. The study found overall complication rates of 3.2%...'
        },
        {
          id: 'pmid34567890',
          title: 'Comparing performance metrics between leading ' + deviceType + ' manufacturers',
          authors: 'Chen M, Rodriguez P, Kim SJ',
          journal: 'European Journal of Medical Engineering',
          year: '2024',
          abstract: 'This comparative study examined five leading ' + deviceType + ' systems from different manufacturers, assessing performance, reliability, and user satisfaction. Results indicated that devices from ' + (manufacturer || 'leading manufacturers') + ' performed consistently better in usability metrics...'
        },
        {
          id: 'pmid45678901',
          title: 'Risk assessment framework for ' + deviceType + ' systems in clinical environments',
          authors: 'Taylor RB, Collins LM, Martinez NO',
          journal: 'International Safety Journal',
          year: '2022',
          abstract: 'This paper proposes a standardized risk assessment framework specific to ' + deviceType + ' systems, with validation across 12 clinical sites. The framework identified previously overlooked risk factors and suggests mitigation strategies...'
        },
        {
          id: 'pmid56789012',
          title: 'Post-market surveillance data analysis for ' + deviceType + ' systems',
          authors: 'Brown VP, Wilson ST, Lee JH',
          journal: 'Regulatory Affairs in Medicine',
          year: '2023',
          abstract: 'Analysis of 5 years of post-market surveillance data for ' + deviceType + ' systems, covering over 10,000 device-years. The study identified trends in device-related incidents and suggested improvements to surveillance methodologies...'
        }
      ];
      
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 1500);
  };
  
  // Add/remove article to selection
  const toggleArticleSelection = (article) => {
    if (selectedArticles.some(a => a.id === article.id)) {
      setSelectedArticles(selectedArticles.filter(a => a.id !== article.id));
    } else {
      setSelectedArticles([...selectedArticles, article]);
    }
  };
  
  // Fetch FDA data
  const fetchFDAData = async () => {
    if (!deviceName.trim()) return;
    
    setIsSearching(true);
    
    try {
      // Call our API route which wraps the OpenFDA API
      const response = await fetch(`/api/openfda/events?device=${encodeURIComponent(deviceName)}&limit=10`);
      const data = await response.json();
      
      if (data.success) {
        setFdaData({
          searchTerm: data.searchTerm,
          results: data.results,
          summary: {
            totalEvents: data.results.length,
            severeCases: data.results.filter(event => event.severity === 'Severe').length,
            moderateCases: data.results.filter(event => event.severity === 'Moderate').length,
            mildCases: data.results.filter(event => event.severity === 'Mild').length,
            commonOutcomes: ['Resolved without intervention', 'Outpatient treatment', 'Hospitalization']
          }
        });
      } else {
        console.error("Error fetching FDA data:", data.error);
      }
    } catch (error) {
      console.error("Failed to fetch FDA data:", error);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Load documents with filtering
  const loadDocuments = async (filters = {}, page = 1) => {
    setDocsLoading(true);
    try {
      // Set module to 'cer' by default if not specified to only show CER documents
      const cerFilters = { 
        ...filters,
        module: filters.module || 'cer'
      };
      
      const result = await fetchDocuments(cerFilters, page);
      setDocuments(result.documents);
      setDocsPagination({
        page: result.pagination.page,
        totalPages: result.pagination.totalPages
      });
    } catch (error) {
      console.error('Error fetching documents:', error);
      // You could add toast notification here
    } finally {
      setDocsLoading(false);
    }
  };
  
  // Handle filter apply
  const handleFilterApply = (filters) => {
    setDocFilters(filters);
    loadDocuments(filters, 1); // Reset to page 1 when filters change
  };
  
  // Handle page change
  const handlePageChange = (newPage) => {
    loadDocuments(docFilters, newPage);
  };
  
  // Handle document approval
  const handleApproveDocument = async (doc) => {
    try {
      await approveDocument(doc.id);
      // Refresh document list after approval
      loadDocuments(docFilters, docsPagination.page);
      // You could add toast notification here for success
    } catch (error) {
      console.error('Error approving document:', error);
      // You could add toast notification here for error
    }
  };
  
  // Load documents when filter tab is selected
  useEffect(() => {
    if (activeTab === 'history') {
      loadDocuments(docFilters, 1);
    }
  }, [activeTab]);
  
  // Generate CER report
  const generateCERReport = () => {
    if (!deviceName || !deviceType || !manufacturer || !selectedTemplate) {
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate report generation with timeout
    setTimeout(() => {
      setReportStatus({
        id: 'CER' + Date.now().toString().substring(7),
        status: 'completed',
        generatedAt: new Date().toISOString(),
        templateUsed: templateOptions.find(t => t.value === selectedTemplate)?.label,
        deviceName,
        deviceType: deviceTypes.find(t => t.value === deviceType)?.label,
        manufacturer,
        includedArticles: selectedArticles.length,
        includedFDAEvents: fdaData?.results.length || 0,
        pageCount: Math.floor(Math.random() * 30) + 50, // Random between 50-80 pages
        wordCount: Math.floor(Math.random() * 10000) + 20000 // Random between 20k-30k words
      });
      
      setIsGenerating(false);
      setActiveTab('report');
    }, 3000);
  };
  
  return (
    <div className="cerv2-page p-6">
      {/* Sample CER Modal */}
      <Dialog open={sampleModalOpen} onOpenChange={setSampleModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Generate Sample CER</DialogTitle>
            <DialogDescription>
              Preview a sample Clinical Evaluation Report based on selected template
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sample-template">Select Template</Label>
              <Select
                value={selectedSampleTemplate}
                onValueChange={setSelectedSampleTemplate}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent id="sample-template">
                  <SelectItem value="mdr-full">EU MDR 2017/745 Full Template</SelectItem>
                  <SelectItem value="mdr-lite">EU MDR Simplified Template</SelectItem>
                  <SelectItem value="meddev">MEDDEV 2.7/1 Rev 4 Template</SelectItem>
                  <SelectItem value="fda-510k">FDA 510(k) Template</SelectItem>
                  <SelectItem value="pmda">PMDA Template (Japan)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {sampleURL ? (
              <div className="border rounded-md overflow-hidden h-[400px]">
                <iframe 
                  src={sampleURL} 
                  className="w-full h-full"
                  title="Sample CER Preview" 
                />
              </div>
            ) : (
              <div className="border rounded-md bg-gray-50 h-[400px] flex items-center justify-center">
                <div className="text-center p-6">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Select a template and click "Generate Sample" to preview
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              disabled={loadingSample}
              onClick={() => {
                setLoadingSample(true);
                setSampleURL(null);
                
                // Call the API to get a sample CER
                fetch('/api/cer/sample', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ template: selectedSampleTemplate })
                })
                  .then(response => response.json())
                  .then(data => {
                    setSampleURL(data.url);
                    setLoadingSample(false);
                  })
                  .catch(error => {
                    console.error('Error fetching sample CER:', error);
                    alert('Failed to generate sample CER.');
                    setLoadingSample(false);
                  });
              }}
              className="flex items-center gap-2 sm:flex-1"
            >
              {loadingSample ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Generate Sample
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setSampleModalOpen(false)}
              className="sm:flex-1"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Advanced CER Generator™</h1>
          <p className="text-muted-foreground">Create EU MDR 2017/745 compliant Clinical Evaluation Reports with AI assistance</p>
        </div>
        <div className="flex gap-3 items-center">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setSampleModalOpen(true)}
          >
            <FileText className="h-4 w-4" />
            Generate Sample CER
          </Button>
          
          <Button 
            className="flex items-center" 
            size="lg"
            disabled={!deviceName || !deviceType || !manufacturer || !selectedTemplate}
            onClick={() => {
              setActiveTab('generating');
              // Call API: POST /api/cer/generate-full
              setGenerationProgress(0);
              setGenerationStep('Initializing template structure');
              
              // Set up a progress simulation
              const progressInterval = setInterval(() => {
                setGenerationProgress(prev => {
                  const newProgress = prev + Math.random() * 5;
                  
                  // Update the generation step based on progress
                  if (newProgress > 20 && newProgress <= 40) {
                    setGenerationStep('Processing clinical literature data');
                  } else if (newProgress > 40 && newProgress <= 60) {
                    setGenerationStep('Analyzing FDA adverse events');
                  } else if (newProgress > 60 && newProgress <= 80) {
                    setGenerationStep('Generating risk-benefit analysis');
                  } else if (newProgress > 80) {
                    setGenerationStep('Compiling final document');
                  }
                  
                  return newProgress > 95 ? 95 : newProgress;
                });
              }, 300);
              
              // Make the actual API call
              fetch('/api/cer/generate-full', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  deviceInfo: {
                    name: deviceName,
                    type: deviceTypes.find(t => t.value === deviceType)?.label,
                    manufacturer
                  },
                  literature: selectedArticles,
                  fdaData: fdaData?.results || [],
                  templateId: selectedTemplate
                })
              })
                .then(response => response.json())
                .then(data => {
                  clearInterval(progressInterval);
                  setGenerationProgress(100);
                  setReportStatus({
                    id: data.id,
                    status: data.status,
                    generatedAt: data.generatedAt,
                    templateUsed: templateOptions.find(t => t.value === selectedTemplate)?.label,
                    deviceName,
                    deviceType: deviceTypes.find(t => t.value === deviceType)?.label,
                    manufacturer,
                    includedArticles: data.metadata.includedLiterature || selectedArticles.length,
                    includedFDAEvents: data.metadata.includedAdverseEvents || (fdaData?.results?.length || 0),
                    pageCount: data.metadata.pageCount,
                    wordCount: data.metadata.wordCount,
                    url: data.url
                  });
                  setTimeout(() => {
                    setActiveTab('report');
                  }, 500);
                })
                .catch(error => {
                  clearInterval(progressInterval);
                  console.error('Error generating report:', error);
                  alert('Failed to generate report. Please try again.');
                  setActiveTab('input');
                });
            }}
          >
            <FileText className="h-5 w-5 mr-2" />
            Generate Full CER Report
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-5">
          <TabsTrigger value="input">
            <Layers className="h-4 w-4 mr-2" />
            Input Data
          </TabsTrigger>
          <TabsTrigger value="literature" disabled={!deviceName || !deviceType}>
            <Book className="h-4 w-4 mr-2" />
            Literature Review
          </TabsTrigger>
          <TabsTrigger value="report" disabled={!reportStatus}>
            <FileText className="h-4 w-4 mr-2" />
            Generated Report
          </TabsTrigger>
          <TabsTrigger value="library">
            <FolderOpen className="h-4 w-4 mr-2" />
            Report Library
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="generating" className="mt-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Generating Clinical Evaluation Report</CardTitle>
              <CardDescription>
                AI is processing data and generating your report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span className="text-muted-foreground">{Math.round(generationProgress)}%</span>
                </div>
                <Progress value={generationProgress} className="h-2" />
              </div>
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Processing Steps</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Initializing template structure</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Retrieving device information</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="animate-pulse">
                      <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                    </span>
                    <span className="text-sm font-medium">Processing clinical literature data</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-muted"></span>
                    <span className="text-sm text-muted-foreground">Analyzing FDA adverse events</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-muted"></span>
                    <span className="text-sm text-muted-foreground">Generating risk-benefit analysis</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-muted"></span>
                    <span className="text-sm text-muted-foreground">Compiling final document</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 mt-4 border rounded-md bg-blue-50">
                <Database className="h-5 w-5 text-blue-600" />
                <div className="text-sm text-blue-600">
                  <p>Leveraging data from 12 clinical articles and 8 FDA reports</p>
                  <p>Integrating regulatory updates from MDR 2017/745</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setActiveTab('input');
                }}
              >
                Cancel Generation
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="library" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Report Library</CardTitle>
                  <CardDescription>Browse past CER reports</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search reports..." className="pl-8" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Project Folders</h4>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                    <div className="space-y-1 pl-1">
                      <div className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                        <Folder className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">PR-CV-2025 (Cardiovascular)</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                        <Folder className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">PR-IM-2025 (Implantables)</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                        <Folder className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">PR-DG-2025 (Diagnostics)</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                        <Folder className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">PR-SR-2024 (Surgical)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Report Status</h4>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                    <div className="space-y-2 pl-1">
                      <div className="flex items-center gap-2">
                        <div className="flex h-4 w-4 items-center justify-center">
                          <div className="h-3 w-3 rounded-sm border border-primary"></div>
                        </div>
                        <span className="text-sm">Draft (2)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-4 w-4 items-center justify-center">
                          <div className="h-3 w-3 rounded-sm border border-primary bg-primary"></div>
                        </div>
                        <span className="text-sm">Final (3)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Template Type</h4>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                    <div className="space-y-2 pl-1">
                      <div className="flex items-center gap-2">
                        <div className="flex h-4 w-4 items-center justify-center">
                          <div className="h-3 w-3 rounded-sm border border-primary"></div>
                        </div>
                        <span className="text-sm">EU MDR (2)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-4 w-4 items-center justify-center">
                          <div className="h-3 w-3 rounded-sm border border-primary"></div>
                        </div>
                        <span className="text-sm">MEDDEV (1)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-4 w-4 items-center justify-center">
                          <div className="h-3 w-3 rounded-sm border border-primary"></div>
                        </div>
                        <span className="text-sm">FDA 510(k) (1)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-4 w-4 items-center justify-center">
                          <div className="h-3 w-3 rounded-sm border border-primary"></div>
                        </div>
                        <span className="text-sm">PMDA (1)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button className="w-full flex items-center gap-2">
                    <FilePlus2 className="h-4 w-4" />
                    Create New Report
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="lg:col-span-3 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Your CER Reports</h3>
                <div className="flex items-center gap-2">
                  <Select defaultValue="newest">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="az">Name (A-Z)</SelectItem>
                      <SelectItem value="za">Name (Z-A)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {pastReports.map(report => (
                  <Card key={report.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-3/4 p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-lg">{report.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <span>{report.id}</span>
                              <span>•</span>
                              <span>{new Date(report.generatedAt).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{report.deviceType}</span>
                            </div>
                          </div>
                          <Badge variant={report.status === 'final' ? 'default' : 'outline'}>
                            {report.status === 'final' ? 'Final' : 'Draft'}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm mt-4">
                          <div>
                            <div className="text-muted-foreground">Manufacturer</div>
                            <div>{report.manufacturer}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Template</div>
                            <div>{report.templateUsed}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Project ID</div>
                            <div>{report.projectId}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Last Modified</div>
                            <div>{new Date(report.lastModified).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="md:w-1/4 bg-gray-50 p-4 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-1 text-sm">
                            <div className="text-muted-foreground">Pages:</div>
                            <div className="text-right">{report.pageCount}</div>
                            
                            <div className="text-muted-foreground">Words:</div>
                            <div className="text-right">{report.wordCount.toLocaleString()}</div>
                            
                            <div className="text-muted-foreground">Sections:</div>
                            <div className="text-right">{report.sections}</div>
                          </div>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <Button className="w-full flex items-center justify-center" size="sm">
                            <FileCog className="h-4 w-4 mr-2" />
                            Open in Editor
                          </Button>
                          <Button variant="outline" className="w-full flex items-center justify-center" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </Button>
                          <Button variant="ghost" className="w-full flex items-center justify-center" size="sm">
                            <Copy className="h-4 w-4 mr-2" />
                            Clone Report
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="input" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Information</CardTitle>
                <CardDescription>Enter details about the medical device</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deviceName">Device Name</Label>
                  <Input 
                    id="deviceName" 
                    placeholder="e.g., CardioMonitor Pro 3000"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="deviceType">Device Type</Label>
                  <Select value={deviceType} onValueChange={setDeviceType}>
                    <SelectTrigger id="deviceType">
                      <SelectValue placeholder="Select device type" />
                    </SelectTrigger>
                    <SelectContent>
                      {deviceTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input 
                    id="manufacturer" 
                    placeholder="e.g., MedTech Innovations, Inc."
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                  />
                </div>
                
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center"
                    onClick={() => {}}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import Device Data
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1 text-center">
                    Upload existing device documentation to pre-fill fields
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>CER Configuration</CardTitle>
                <CardDescription>Customize the report generation process</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template">Report Template</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger id="template">
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templateOptions.map(template => (
                        <SelectItem key={template.value} value={template.value}>{template.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="scope">Evaluation Scope</Label>
                  <Textarea 
                    id="scope" 
                    placeholder="Describe the scope of this clinical evaluation..."
                    rows={3}
                  />
                </div>
                
                <div className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Microscope className="h-5 w-5 text-blue-600" />
                    <div className="text-sm">
                      <p className="font-medium">AI-Enhanced Literature Review</p>
                      <p className="text-muted-foreground">Automatic synthesis of published clinical data</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-amber-600" />
                    <div className="text-sm">
                      <p className="font-medium">FDA MAUDE Database Integration</p>
                      <p className="text-muted-foreground">Incorporates post-market surveillance data</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => setActiveTab('literature')} 
                  className="w-full"
                  disabled={!deviceName || !deviceType || !manufacturer || !selectedTemplate}
                >
                  Continue to Literature Review
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="literature" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>PubMed Search</CardTitle>
                  <CardDescription>Find relevant clinical literature</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search PubMed..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handlePubMedSearch()}
                    />
                  </div>
                  
                  <Button 
                    onClick={handlePubMedSearch} 
                    disabled={isSearching || !searchTerm.trim()}
                    className="w-full"
                  >
                    {isSearching ? (
                      <>
                        <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-opacity-50 border-t-transparent rounded-full"></span>
                        Searching...
                      </>
                    ) : (
                      <>
                        <Book className="h-4 w-4 mr-2" />
                        Search PubMed
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>FDA Adverse Events</CardTitle>
                  <CardDescription>Retrieve safety data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">
                    Fetch adverse event reports for {deviceName || "your device"} from the FDA MAUDE database.
                  </p>
                  
                  <Button 
                    onClick={fetchFDAData} 
                    disabled={isSearching || !deviceName.trim()}
                    className="w-full"
                  >
                    {isSearching ? (
                      <>
                        <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-opacity-50 border-t-transparent rounded-full"></span>
                        Fetching...
                      </>
                    ) : (
                      <>
                        <Database className="h-4 w-4 mr-2" />
                        Get FDA Data
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Selected Items</CardTitle>
                  <CardDescription>
                    {selectedArticles.length} articles and {fdaData?.results?.length || 0} FDA reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm mb-4">
                    <p>{selectedArticles.length} clinical articles selected</p>
                    <p>{fdaData?.results?.length || 0} FDA adverse events included</p>
                    <p className="text-muted-foreground mt-2">
                      Selected content will be synthesized in the generated report
                    </p>
                  </div>
                  
                  <Button 
                    onClick={generateCERReport} 
                    className="w-full"
                    disabled={
                      !deviceName || 
                      !deviceType || 
                      !manufacturer || 
                      !selectedTemplate || 
                      (selectedArticles.length === 0 && !fdaData) ||
                      isGenerating
                    }
                  >
                    {isGenerating ? (
                      <>
                        <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-opacity-50 border-t-transparent rounded-full"></span>
                        Generating Report...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Generate CER Report
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <div className="col-span-1 lg:col-span-2 space-y-6">
              <Tabs defaultValue="search_results" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="search_results">PubMed Results</TabsTrigger>
                  <TabsTrigger value="fda_data" disabled={!fdaData}>FDA Data</TabsTrigger>
                </TabsList>
                
                <TabsContent value="search_results">
                  <Card>
                    <CardHeader>
                      <CardTitle>Literature Search Results</CardTitle>
                      <CardDescription>
                        {searchResults.length > 0 
                          ? `${searchResults.length} articles found` 
                          : "Search PubMed for relevant articles"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-[600px] overflow-y-auto">
                      {searchResults.length > 0 ? (
                        <div className="space-y-4">
                          {searchResults.map(article => (
                            <div 
                              key={article.id} 
                              className={`p-4 border rounded-md ${
                                selectedArticles.some(a => a.id === article.id) 
                                  ? 'border-blue-300 bg-blue-50' 
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex justify-between">
                                <h3 className="font-medium">{article.title}</h3>
                                <Button 
                                  variant={selectedArticles.some(a => a.id === article.id) ? "default" : "outline"} 
                                  size="sm"
                                  onClick={() => toggleArticleSelection(article)}
                                >
                                  {selectedArticles.some(a => a.id === article.id) ? "Selected" : "Select"}
                                </Button>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{article.authors} • {article.journal} • {article.year}</p>
                              <p className="text-sm mt-2">{article.abstract}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-8 text-center text-muted-foreground">
                          <Book className="h-12 w-12 mx-auto mb-3 opacity-20" />
                          <p>Enter search terms and click "Search PubMed" to find relevant articles</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="fda_data">
                  <Card>
                    <CardHeader>
                      <CardTitle>FDA Adverse Events</CardTitle>
                      <CardDescription>
                        {fdaData ? `${fdaData.results.length} reports for "${fdaData.searchTerm}"` : 'No FDA data loaded'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-[600px] overflow-y-auto">
                      {fdaData ? (
                        <div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <Card className="bg-red-50">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-red-700">Severe Cases</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-bold text-red-700">{fdaData.summary.severeCases}</div>
                              </CardContent>
                            </Card>
                            <Card className="bg-amber-50">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-amber-700">Moderate Cases</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-bold text-amber-700">{fdaData.summary.moderateCases}</div>
                              </CardContent>
                            </Card>
                            <Card className="bg-green-50">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-green-700">Mild Cases</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-bold text-green-700">{fdaData.summary.mildCases}</div>
                              </CardContent>
                            </Card>
                          </div>
                          
                          <div className="space-y-4">
                            {fdaData.results.map((event, index) => (
                              <div key={index} className="p-4 border rounded-md hover:bg-gray-50">
                                <div className="flex justify-between">
                                  <h3 className="font-medium">{event.report_id}</h3>
                                  <Badge 
                                    variant="outline" 
                                    className={
                                      event.severity === 'Severe' 
                                        ? 'bg-red-50 text-red-700 border-red-200' 
                                        : event.severity === 'Moderate'
                                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                                          : 'bg-green-50 text-green-700 border-green-200'
                                    }
                                  >
                                    {event.severity}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {event.event_date} • {event.manufacturer}
                                </p>
                                <p className="text-sm mt-2">{event.event_description}</p>
                                <p className="text-sm font-medium mt-2">
                                  Outcome: <span className="font-normal">{event.patient_outcome}</span>
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="py-8 text-center text-muted-foreground">
                          <Database className="h-12 w-12 mx-auto mb-3 opacity-20" />
                          <p>Click "Get FDA Data" to retrieve adverse event reports</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="report" className="mt-6">
          {reportStatus && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Report Details</CardTitle>
                  <CardDescription>Generated report information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Report ID</div>
                    <div className="font-medium">{reportStatus.id}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    <div className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                      <span className="font-medium">Complete</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground">Generated On</div>
                    <div className="font-medium">
                      {new Date(reportStatus.generatedAt).toLocaleString()}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground">Template</div>
                    <div className="font-medium">{reportStatus.templateUsed}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground">Device Name</div>
                    <div className="font-medium">{reportStatus.deviceName}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground">Device Type</div>
                    <div className="font-medium">{reportStatus.deviceType}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground">Manufacturer</div>
                    <div className="font-medium">{reportStatus.manufacturer}</div>
                  </div>
                  
                  <div className="p-4 border rounded-md">
                    <h4 className="text-sm font-medium mb-2">Report Statistics</h4>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="text-muted-foreground">Page Count:</div>
                      <div className="text-right">{reportStatus.pageCount} pages</div>
                      
                      <div className="text-muted-foreground">Word Count:</div>
                      <div className="text-right">{reportStatus.wordCount.toLocaleString()} words</div>
                      
                      <div className="text-muted-foreground">Articles Referenced:</div>
                      <div className="text-right">{reportStatus.includedArticles} articles</div>
                      
                      <div className="text-muted-foreground">FDA Events:</div>
                      <div className="text-right">{reportStatus.includedFDAEvents} reports</div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button className="flex-1 flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline" className="flex items-center">
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">Options</span>
                  </Button>
                </CardFooter>
              </Card>
              
              <div className="col-span-1 lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>CER PDF Preview</CardTitle>
                    <CardDescription>Generated Clinical Evaluation Report</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {reportStatus.url ? (
                      <iframe 
                        src={reportStatus.url} 
                        className="border rounded-md w-full aspect-[1/1.4] min-h-[700px]"
                        title={`Clinical Evaluation Report - ${reportStatus.deviceName}`}
                      />
                    ) : (
                      <div className="border rounded-md bg-gray-50 aspect-[1/1.4] min-h-[700px] flex items-center justify-center">
                        <div className="text-center p-6">
                          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                          <p className="font-medium">Clinical Evaluation Report</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {reportStatus.deviceName}
                          </p>
                          <p className="text-sm text-muted-foreground mt-4">
                            PDF preview would be displayed here
                          </p>
                          <div className="flex justify-center gap-4 mt-6">
                            <Button variant="outline" size="sm" className="flex items-center">
                              <FileText className="h-4 w-4 mr-2" />
                              View Full Report
                            </Button>
                            <Button variant="outline" size="sm" className="flex items-center">
                              <BarChart4 className="h-4 w-4 mr-2" />
                              View Analytics
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Compliance Status</CardTitle>
                      <CardDescription>Regulatory checks completed</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>MDR 2017/745 Annex XIV, Part A compliant</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>MEDDEV 2.7/1 Rev. 4 format adherence</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>Literature search methodology validated</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>Post-market surveillance data integrated</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>Risk-benefit analysis completed</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Schedule Review</CardTitle>
                      <CardDescription>Recommended follow-up</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 border rounded-md bg-blue-50">
                          <AlarmClock className="h-5 w-5 text-blue-600" />
                          <div>
                            <div className="font-medium">CER Update Required</div>
                            <div className="text-sm text-blue-600">April 29, 2026</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 border rounded-md">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Literature Review</div>
                            <div className="text-sm text-muted-foreground">October 29, 2025</div>
                          </div>
                        </div>
                        
                        <Button variant="outline" className="w-full">
                          Schedule Reminder
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CERV2Page;