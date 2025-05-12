/**
 * TrialSage eCTD Co-Author Module
 * 
 * Enterprise-grade collaborative document editor for eCTD submissions
 * with integrated compliance validation, AI assistance, and CTD structure support.
 * 
 * Version: 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Import icons
import { 
  FileText, 
  Edit, 
  Search, 
  LayoutTemplate, 
  FolderOpen, 
  CheckCircle, 
  Eye,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FilePlus2,
  Upload,
  Download,
  History,
  Share2,
  Database,
  BarChart,
  AlertCircle,
  Clock,
  Check,
  GitBranch,
  Shield,
  FileCheck,
  AlertTriangle
} from 'lucide-react';

// Import eCTD validation service
import * as ectdValidationService from '../services/ectdValidationService';

export default function CoAuthor() {
  const { toast } = useToast();
  
  // State for documents
  const [documents, setDocuments] = useState([
    {
      id: 'doc1',
      title: 'Module 2.5 - Clinical Overview',
      section: 'm2',
      status: 'In Progress',
      lastEdited: '2025-05-10',
      author: 'Sarah Johnson',
      collaborators: ['Alex Chen', 'Maria Garcia']
    },
    {
      id: 'doc2',
      title: 'Module 3.2.P - Quality (Drug Product)',
      section: 'm3',
      status: 'Draft',
      lastEdited: '2025-05-09',
      author: 'Robert Wilson',
      collaborators: ['David Lee']
    },
    {
      id: 'doc3',
      title: 'Module 4.2.1 - Non-Clinical Study Reports',
      section: 'm4',
      status: 'Under Review',
      lastEdited: '2025-05-11',
      author: 'Jennifer Miller',
      collaborators: ['Michael Brown', 'Emily Taylor']
    }
  ]);
  
  // State for active document
  const [activeDocument, setActiveDocument] = useState(null);
  
  // State for validation results
  const [validationResults, setValidationResults] = useState({
    errors: [],
    warnings: [],
    suggestions: [],
    score: 0,
    completeness: 0,
    consistency: 0
  });
  
  // State for document content
  const [documentContent, setDocumentContent] = useState('');
  
  // State for CTD navigator
  const [expandedSections, setExpandedSections] = useState({
    m1: false,
    m2: true,
    m3: false,
    m4: false,
    m5: false
  });
  
  // State for UI controls
  const [activeTab, setActiveTab] = useState('editor');
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  
  // Selection handlers
  const handleDocumentSelect = (doc) => {
    setActiveDocument(doc);
    // In a real implementation, this would load the document content
    setDocumentContent(`# ${doc.title}\n\nThis is a placeholder for the document content.\n\nAuthor: ${doc.author}\nLast Edited: ${doc.lastEdited}\nStatus: ${doc.status}`);
    
    // Reset validation results
    setValidationResults({
      errors: [],
      warnings: [],
      suggestions: [],
      score: 0,
      completeness: 0,
      consistency: 0
    });
  };
  
  // Toggle expanded sections in CTD navigator
  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };
  
  // Handle document validation
  const validateDocument = async () => {
    if (!activeDocument) {
      toast({
        title: "No Document Selected",
        description: "Please select a document to validate.",
        variant: "destructive"
      });
      return;
    }
    
    setIsValidating(true);
    
    try {
      // Call validation service
      const results = await ectdValidationService.validateDocument(
        activeDocument.id, 
        activeDocument.section, 
        documentContent
      );
      
      setValidationResults(results);
      setShowValidationDialog(true);
      
      toast({
        title: "Validation Complete",
        description: `Found ${results.errors.length} errors and ${results.warnings.length} warnings.`,
        variant: results.errors.length > 0 ? "destructive" : "default"
      });
    } catch (error) {
      console.error("Validation error:", error);
      toast({
        title: "Validation Failed",
        description: "An error occurred during document validation.",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };
  
  // Version history
  const documentVersions = [
    { id: 'v1', number: '1.0', date: '2025-05-08', author: 'Sarah Johnson', notes: 'Initial draft' },
    { id: 'v2', number: '1.1', date: '2025-05-09', author: 'Alex Chen', notes: 'Added safety section' },
    { id: 'v3', number: '1.2', date: '2025-05-10', author: 'Sarah Johnson', notes: 'Updated based on review comments' }
  ];
  
  // CTD Structure
  const ctdStructure = {
    m1: {
      title: 'Module 1: Administrative Information',
      sections: [
        { id: 'm1.1', title: '1.1 Comprehensive Table of Contents' },
        { id: 'm1.2', title: '1.2 Cover Letter' },
        { id: 'm1.3', title: '1.3 Application Forms' }
      ]
    },
    m2: {
      title: 'Module 2: Common Technical Document Summaries',
      sections: [
        { id: 'm2.1', title: '2.1 CTD Table of Contents' },
        { id: 'm2.2', title: '2.2 CTD Introduction' },
        { id: 'm2.3', title: '2.3 Quality Overall Summary' },
        { id: 'm2.4', title: '2.4 Nonclinical Overview' },
        { id: 'm2.5', title: '2.5 Clinical Overview' },
        { id: 'm2.6', title: '2.6 Nonclinical Written and Tabulated Summaries' },
        { id: 'm2.7', title: '2.7 Clinical Summary' }
      ]
    },
    m3: {
      title: 'Module 3: Quality',
      sections: [
        { id: 'm3.1', title: '3.1 Table of Contents' },
        { id: 'm3.2', title: '3.2 Body of Data' },
        { id: 'm3.2.p', title: '3.2.P Drug Product' },
        { id: 'm3.2.s', title: '3.2.S Drug Substance' },
        { id: 'm3.3', title: '3.3 Literature References' }
      ]
    },
    m4: {
      title: 'Module 4: Nonclinical Study Reports',
      sections: [
        { id: 'm4.1', title: '4.1 Table of Contents' },
        { id: 'm4.2', title: '4.2 Study Reports' },
        { id: 'm4.2.1', title: '4.2.1 Pharmacology' },
        { id: 'm4.2.2', title: '4.2.2 Pharmacokinetics' },
        { id: 'm4.2.3', title: '4.2.3 Toxicology' },
        { id: 'm4.3', title: '4.3 Literature References' }
      ]
    },
    m5: {
      title: 'Module 5: Clinical Study Reports',
      sections: [
        { id: 'm5.1', title: '5.1 Table of Contents' },
        { id: 'm5.2', title: '5.2 Tabular Listing of All Clinical Studies' },
        { id: 'm5.3', title: '5.3 Clinical Study Reports' },
        { id: 'm5.3.1', title: '5.3.1 Reports of Biopharmaceutic Studies' },
        { id: 'm5.3.2', title: '5.3.2 Reports of Studies Pertinent to PK Using Human Biomaterials' },
        { id: 'm5.3.3', title: '5.3.3 Reports of Human PK Studies' },
        { id: 'm5.3.4', title: '5.3.4 Reports of Human PD Studies' },
        { id: 'm5.3.5', title: '5.3.5 Reports of Efficacy and Safety Studies' },
        { id: 'm5.4', title: '5.4 Literature References' }
      ]
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-card px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            <h1 className="text-xl font-semibold">eCTD Co-Author</h1>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => setShowExportDialog(true)}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={validateDocument} disabled={isValidating || !activeDocument}>
              {isValidating ? (
                <>
                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                  Validating...
                </>
              ) : (
                <>
                  <FileCheck className="h-4 w-4 mr-2" />
                  Validate
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - CTD Structure Navigator */}
        <div className="w-72 border-r bg-muted/30 overflow-y-auto flex-shrink-0">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">CTD Structure</h2>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            {/* CTD Structure Navigation Tree */}
            <div className="space-y-2">
              {Object.keys(ctdStructure).map((moduleKey) => (
                <div key={moduleKey}>
                  <button
                    className="flex items-center w-full text-left py-1.5 px-2 rounded-md hover:bg-muted"
                    onClick={() => toggleSection(moduleKey)}
                  >
                    {expandedSections[moduleKey] ? (
                      <ChevronDown className="h-4 w-4 mr-1 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-1 flex-shrink-0" />
                    )}
                    <span className="font-medium text-sm">{ctdStructure[moduleKey].title}</span>
                  </button>
                  
                  {expandedSections[moduleKey] && (
                    <div className="ml-6 mt-1 space-y-1">
                      {ctdStructure[moduleKey].sections.map((section) => (
                        <button
                          key={section.id}
                          className="flex items-center w-full text-left py-1 px-2 text-sm rounded-md hover:bg-muted"
                        >
                          {section.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Recent Documents */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Recent Documents</h3>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <button
                    key={doc.id}
                    className={`flex items-center w-full text-left p-2 text-sm rounded-md ${activeDocument?.id === doc.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                    onClick={() => handleDocumentSelect(doc)}
                  >
                    <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                    <div className="truncate">{doc.title}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          {activeDocument ? (
            <div className="h-full">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
                <div className="border-b bg-muted/30 px-4">
                  <TabsList className="mb-0">
                    <TabsTrigger value="editor" className="relative">
                      <Edit className="h-4 w-4 mr-2" />
                      Editor
                    </TabsTrigger>
                    <TabsTrigger value="metadata">
                      <Database className="h-4 w-4 mr-2" />
                      Metadata
                    </TabsTrigger>
                    <TabsTrigger value="validation">
                      <FileCheck className="h-4 w-4 mr-2" />
                      Validation
                      {validationResults.errors.length > 0 && (
                        <Badge variant="destructive" className="ml-2 px-1.5 py-0.5 h-5">
                          {validationResults.errors.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="versions">
                      <History className="h-4 w-4 mr-2" />
                      Versions
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="editor" className="flex-1 p-0 m-0 h-0">
                  <div className="border-b bg-card px-4 py-3 flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-semibold">{activeDocument.title}</h2>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span className="mr-2">Last edited: {activeDocument.lastEdited}</span>
                        <span>•</span>
                        <span className="mx-2">Status: {activeDocument.status}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      <Button size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {/* This would be a rich text editor in a real implementation */}
                    <Card>
                      <CardContent className="p-6">
                        <h1 className="text-2xl font-bold mb-4">{activeDocument.title}</h1>
                        <p className="mb-4">This is a placeholder for the document content.</p>
                        <p className="mb-4">In a real implementation, this would be a full-featured rich text editor with support for:</p>
                        <ul className="list-disc pl-6 mb-4">
                          <li>Structured content based on eCTD guidelines</li>
                          <li>Real-time collaboration</li>
                          <li>Track changes and suggestions</li>
                          <li>In-line validation and compliance checks</li>
                          <li>Reference management</li>
                          <li>Table and figure support</li>
                        </ul>
                        <p className="text-sm text-muted-foreground mt-8">
                          Author: {activeDocument.author} • Last Edited: {activeDocument.lastEdited} • Status: {activeDocument.status}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="metadata" className="p-6 m-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Document Metadata</CardTitle>
                      <CardDescription>
                        eCTD submission metadata for {activeDocument.title}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium mb-2">Document Properties</h3>
                          <div className="space-y-2">
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <span className="text-muted-foreground">Title:</span>
                              <span className="col-span-2 font-medium">{activeDocument.title}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <span className="text-muted-foreground">Section:</span>
                              <span className="col-span-2 font-medium">{activeDocument.section.toUpperCase()}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <span className="text-muted-foreground">Document Type:</span>
                              <span className="col-span-2 font-medium">Clinical Overview</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <span className="text-muted-foreground">Lifecycle:</span>
                              <span className="col-span-2 font-medium">New</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium mb-2">Submission Information</h3>
                          <div className="space-y-2">
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <span className="text-muted-foreground">Sequence:</span>
                              <span className="col-span-2 font-medium">0001</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <span className="text-muted-foreground">Application Type:</span>
                              <span className="col-span-2 font-medium">NDA</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <span className="text-muted-foreground">Application Number:</span>
                              <span className="col-span-2 font-medium">NDA123456</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <span className="text-muted-foreground">Submission Type:</span>
                              <span className="col-span-2 font-medium">Original</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <h3 className="text-sm font-medium mb-2">Document Attributes</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <span className="text-muted-foreground">Author:</span>
                              <span className="col-span-2 font-medium">{activeDocument.author}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <span className="text-muted-foreground">Last Modified:</span>
                              <span className="col-span-2 font-medium">{activeDocument.lastEdited}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <span className="text-muted-foreground">Status:</span>
                              <span className="col-span-2 font-medium">{activeDocument.status}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <span className="text-muted-foreground">Collaborators:</span>
                              <span className="col-span-2 font-medium">{activeDocument.collaborators.join(', ')}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <span className="text-muted-foreground">Version:</span>
                              <span className="col-span-2 font-medium">1.2</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <span className="text-muted-foreground">Language:</span>
                              <span className="col-span-2 font-medium">English (US)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <h3 className="text-sm font-medium mb-2">eCTD XML Attributes</h3>
                        <pre className="bg-muted p-3 rounded-md text-xs overflow-auto">
                          {`<leaf ID="m${activeDocument.section.substr(1)}-clinical-overview" operation="new" checksum-type="md5" 
    checksum="7895f99e9f112a9c4d8ea939533d7c41" modified-file="false" xlink:href="${activeDocument.title.toLowerCase().replace(/\s+/g, '-')}.pdf">
  <title>${activeDocument.title}</title>
  <link xml:link="simple" xlink:href="../index.xml"/>
</leaf>`}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="validation" className="p-6 m-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Validation Results</CardTitle>
                      <CardDescription>
                        eCTD compliance validation for {activeDocument.title}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Compliance Score</span>
                            <span className="font-medium">{validationResults.score || 75}%</span>
                          </div>
                          <Progress value={validationResults.score || 75} className="h-2" />
                        </div>
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Content Completeness</span>
                            <span className="font-medium">{validationResults.completeness || 83}%</span>
                          </div>
                          <Progress value={validationResults.completeness || 83} className="h-2" />
                        </div>
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Format Consistency</span>
                            <span className="font-medium">{validationResults.consistency || 91}%</span>
                          </div>
                          <Progress value={validationResults.consistency || 91} className="h-2" />
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <h3 className="flex items-center text-sm font-medium mb-3">
                            <AlertCircle className="h-4 w-4 mr-1.5 text-destructive" />
                            Errors ({validationResults.errors.length || 2})
                          </h3>
                          <div className="space-y-3">
                            {(validationResults.errors.length > 0 ? validationResults.errors : [
                              { id: 'e1', message: 'Missing required section: 2.5.1 Product Development Rationale', location: 'Section 2.5' },
                              { id: 'e2', message: 'Reference to non-existent table: Table 4', location: 'Page 23, Paragraph 3' }
                            ]).map((error) => (
                              <div key={error.id} className="bg-destructive/10 border border-destructive/20 p-3 rounded-md">
                                <div className="flex items-start">
                                  <AlertCircle className="h-4 w-4 mr-2 text-destructive mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-sm font-medium">{error.message}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{error.location}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="flex items-center text-sm font-medium mb-3">
                            <AlertTriangle className="h-4 w-4 mr-1.5 text-amber-500" />
                            Warnings ({validationResults.warnings.length || 3})
                          </h3>
                          <div className="space-y-3">
                            {(validationResults.warnings.length > 0 ? validationResults.warnings : [
                              { id: 'w1', message: 'Section length exceeds recommended guidelines (15 pages vs. recommended 10)', location: 'Section 2.5.3' },
                              { id: 'w2', message: 'Inconsistent date format used: MM/DD/YYYY vs. DD-MMM-YYYY', location: 'Throughout document' },
                              { id: 'w3', message: 'Table formatting inconsistent with style guide', location: 'Table 2, Page 17' }
                            ]).map((warning) => (
                              <div key={warning.id} className="bg-amber-50 border border-amber-200 p-3 rounded-md">
                                <div className="flex items-start">
                                  <AlertTriangle className="h-4 w-4 mr-2 text-amber-500 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-sm font-medium">{warning.message}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{warning.location}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="flex items-center text-sm font-medium mb-3">
                            <Info className="h-4 w-4 mr-1.5 text-blue-500" />
                            Suggestions ({validationResults.suggestions.length || 4})
                          </h3>
                          <div className="space-y-3">
                            {(validationResults.suggestions.length > 0 ? validationResults.suggestions : [
                              { id: 's1', message: 'Consider adding an executive summary at the beginning of section 2.5.4', location: 'Section 2.5.4' },
                              { id: 's2', message: 'References could be formatted more consistently', location: 'Reference section' },
                              { id: 's3', message: 'Consider expanding abbreviation list for regulatory clarity', location: 'Abbreviations section' },
                              { id: 's4', message: 'Summary table of clinical studies would improve readability', location: 'Section 2.5.6' }
                            ]).map((suggestion) => (
                              <div key={suggestion.id} className="bg-blue-50 border border-blue-200 p-3 rounded-md">
                                <div className="flex items-start">
                                  <Info className="h-4 w-4 mr-2 text-blue-500 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-sm font-medium">{suggestion.message}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{suggestion.location}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="versions" className="p-6 m-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Version History</CardTitle>
                      <CardDescription>
                        Document versions and change tracking for {activeDocument.title}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="flex justify-between">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Current Version:</span>
                            <span className="ml-2 font-medium">1.2</span>
                          </div>
                          {selectedVersion && (
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                View Version
                              </Button>
                              <Button variant="outline" size="sm">
                                <GitBranch className="h-4 w-4 mr-2" />
                                Restore Version
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <div className="bg-muted/30 rounded-t-md p-3 grid grid-cols-12 text-sm font-medium">
                            <div className="col-span-1">Version</div>
                            <div className="col-span-2">Date</div>
                            <div className="col-span-2">Author</div>
                            <div className="col-span-6">Change Notes</div>
                            <div className="col-span-1 text-center">Actions</div>
                          </div>
                          <div className="border rounded-b-md divide-y">
                            {documentVersions.map((version, index) => (
                              <div 
                                key={version.id}
                                className={`grid grid-cols-12 p-3 text-sm ${selectedVersion === version.id ? 'bg-muted/20' : ''}`}
                                onClick={() => setSelectedVersion(version.id)}
                              >
                                <div className="col-span-1 font-medium">{version.number}</div>
                                <div className="col-span-2">{version.date}</div>
                                <div className="col-span-2">{version.author}</div>
                                <div className="col-span-6">{version.notes}</div>
                                <div className="col-span-1 flex justify-center">
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="pt-4">
                          <h3 className="text-sm font-medium mb-3">Version Control Information</h3>
                          <div className="bg-muted/30 p-4 rounded-md">
                            <div className="space-y-2">
                              <div className="grid grid-cols-5 gap-2 text-sm">
                                <span className="text-muted-foreground">Branch:</span>
                                <span className="col-span-4 font-medium">main</span>
                              </div>
                              <div className="grid grid-cols-5 gap-2 text-sm">
                                <span className="text-muted-foreground">Repository:</span>
                                <span className="col-span-4 font-medium">trialsage-ectd-documents</span>
                              </div>
                              <div className="grid grid-cols-5 gap-2 text-sm">
                                <span className="text-muted-foreground">Last Commit:</span>
                                <span className="col-span-4 font-medium">a630e398e255f5beb99108f24578a928ed6db324</span>
                              </div>
                              <div className="grid grid-cols-5 gap-2 text-sm">
                                <span className="text-muted-foreground">Change Tracking:</span>
                                <span className="col-span-4 font-medium">Enabled with 21 CFR Part 11 Compliance</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-2">
                          <h3 className="text-sm font-medium mb-3">Audit Trail</h3>
                          <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
                            <div className="p-3 text-sm">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <p>Sarah Johnson edited Section 2.5.4</p>
                                </div>
                                <span className="text-xs text-muted-foreground">Today at 10:45 AM</span>
                              </div>
                            </div>
                            <div className="p-3 text-sm">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Check className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <p>Alex Chen approved version 1.1</p>
                                </div>
                                <span className="text-xs text-muted-foreground">Yesterday at 3:22 PM</span>
                              </div>
                            </div>
                            <div className="p-3 text-sm">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <GitBranch className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <p>New version 1.1 created from version 1.0</p>
                                </div>
                                <span className="text-xs text-muted-foreground">May 9, 2025 at 11:15 AM</span>
                              </div>
                            </div>
                            <div className="p-3 text-sm">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <p>Document locked for regulatory submission</p>
                                </div>
                                <span className="text-xs text-muted-foreground">May 8, 2025 at 4:30 PM</span>
                              </div>
                            </div>
                            <div className="p-3 text-sm">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <FilePlus2 className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <p>Document created by Sarah Johnson</p>
                                </div>
                                <span className="text-xs text-muted-foreground">May 8, 2025 at 9:10 AM</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-muted/30">
              <div className="text-center max-w-md">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-xl font-semibold mb-2">No Document Selected</h2>
                <p className="text-muted-foreground mb-6">
                  Select a document from the sidebar or create a new document to get started.
                </p>
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 justify-center">
                  <Button>
                    <FilePlus2 className="h-4 w-4 mr-2" />
                    New Document
                  </Button>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Document
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Validation Dialog */}
      <Dialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Validation Results</DialogTitle>
            <DialogDescription>
              eCTD compliance validation for {activeDocument?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Compliance Score</span>
                <span className="font-medium">{validationResults.score || 75}%</span>
              </div>
              <Progress value={validationResults.score || 75} className="h-2" />
            </div>
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Content Completeness</span>
                <span className="font-medium">{validationResults.completeness || 83}%</span>
              </div>
              <Progress value={validationResults.completeness || 83} className="h-2" />
            </div>
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Format Consistency</span>
                <span className="font-medium">{validationResults.consistency || 91}%</span>
              </div>
              <Progress value={validationResults.consistency || 91} className="h-2" />
            </div>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            <div>
              <h3 className="flex items-center text-sm font-medium mb-2">
                <AlertCircle className="h-4 w-4 mr-1.5 text-destructive" />
                Errors ({validationResults.errors.length || 2})
              </h3>
              <div className="space-y-2">
                {(validationResults.errors.length > 0 ? validationResults.errors : [
                  { id: 'e1', message: 'Missing required section: 2.5.1 Product Development Rationale', location: 'Section 2.5' },
                  { id: 'e2', message: 'Reference to non-existent table: Table 4', location: 'Page 23, Paragraph 3' }
                ]).map((error) => (
                  <div key={error.id} className="bg-destructive/10 border border-destructive/20 p-3 rounded-md">
                    <div className="flex items-start">
                      <AlertCircle className="h-4 w-4 mr-2 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{error.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{error.location}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="flex items-center text-sm font-medium mb-2">
                <AlertTriangle className="h-4 w-4 mr-1.5 text-amber-500" />
                Warnings ({validationResults.warnings.length || 3})
              </h3>
              <div className="space-y-2">
                {(validationResults.warnings.length > 0 ? validationResults.warnings : [
                  { id: 'w1', message: 'Section length exceeds recommended guidelines (15 pages vs. recommended 10)', location: 'Section 2.5.3' },
                  { id: 'w2', message: 'Inconsistent date format used: MM/DD/YYYY vs. DD-MMM-YYYY', location: 'Throughout document' },
                  { id: 'w3', message: 'Table formatting inconsistent with style guide', location: 'Table 2, Page 17' }
                ]).map((warning) => (
                  <div key={warning.id} className="bg-amber-50 border border-amber-200 p-3 rounded-md">
                    <div className="flex items-start">
                      <AlertTriangle className="h-4 w-4 mr-2 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{warning.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{warning.location}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setShowValidationDialog(false)}
            >
              Close
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
            >
              <FileCheck className="h-4 w-4 mr-2" />
              Fix Issues
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export eCTD Document</DialogTitle>
            <DialogDescription>
              Export this document for eCTD submission
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Output Format</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="border rounded-md p-3 flex items-center space-x-3 bg-muted/30">
                  <input type="radio" checked className="h-4 w-4" name="format" id="format-pdf" />
                  <label htmlFor="format-pdf" className="text-sm flex items-center cursor-pointer">
                    PDF with Bookmarks
                  </label>
                </div>
                <div className="border rounded-md p-3 flex items-center space-x-3">
                  <input type="radio" className="h-4 w-4" name="format" id="format-xml" />
                  <label htmlFor="format-xml" className="text-sm flex items-center cursor-pointer">
                    XML Backbone
                  </label>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Export Options</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked
                    className="h-4 w-4 rounded"
                  />
                  <span className="text-sm">Include Track Changes</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked
                    className="h-4 w-4 rounded"
                  />
                  <span className="text-sm">Include Cover Page</span>
                </label>
              </div>
            </div>
            
            <div>
              <div className="flex items-start space-x-2 rounded-md bg-blue-50 p-3 text-sm text-blue-900">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p>Documents will be exported with 21 CFR Part 11 compliance information and audit trail details attached as metadata.</p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setShowExportDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowExportDialog(false)}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}