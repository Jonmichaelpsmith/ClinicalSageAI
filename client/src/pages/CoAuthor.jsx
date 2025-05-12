import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileCheck, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  History, 
  Clock,
  Download,
  Archive,
  Clipboard,
  AlertTriangle,
  CheckCircle2,
  FolderTree,
  Save
} from 'lucide-react';

export default function CoAuthor() {
  const { toast } = useToast();
  
  // Document state
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentContent, setDocumentContent] = useState('');
  const [isDocumentLocked, setIsDocumentLocked] = useState(false);
  
  // Validation state
  const [validationInProgress, setValidationInProgress] = useState(false);
  const [validationResults, setValidationResults] = useState({
    status: 'none',
    score: 0,
    issues: [],
    passingChecks: [],
    failingChecks: [],
    regulatoryStatus: 'Not Validated',
    complianceScore: 0
  });
  
  // eCTD submission export state
  const [exportInProgress, setExportInProgress] = useState(false);
  const [submissionMetadata, setSubmissionMetadata] = useState({
    submissionType: 'original',
    sequenceNumber: '0000',
    applicationNumber: 'NDA123456',
    submissionFormat: 'eCTD',
    region: 'FDA',
  });
  
  // PDF preview state
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  
  // Version history state
  const [documentVersions, setDocumentVersions] = useState([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  
  // Tree navigation state
  const [isTreeOpen, setIsTreeOpen] = useState(false);
  const [ctdExpandedSections, setCTDExpandedSections] = useState({
    module1: true,
    module2: true,
    module3: false,
    module4: false,
    module5: false
  });
  
  // Validation function
  const validateEctdDocument = async (showResults = true) => {
    if (!selectedDocument) {
      toast({
        title: "No Document Selected",
        description: "Please select a document to validate",
        variant: "destructive"
      });
      return null;
    }
    
    try {
      // Set validation in progress
      setValidationInProgress(true);
      
      // Notification toast
      toast({
        title: "Validating Document",
        description: "Running validation for eCTD requirements...",
      });
      
      // Call validation service
      const validationResponse = await validateDocument(documentContent, {
        documentType: selectedDocument.documentType || 'clinical-overview',
        section: selectedDocument.section || '2.5',
        region: 'FDA'
      });
      
      // Process results
      if (validationResponse && validationResponse.score !== undefined) {
        // Calculate compliance score
        const complianceScore = Math.round(
          (validationResponse.passingChecks.length / 
          (validationResponse.passingChecks.length + validationResponse.issues.length)) * 100
        );
        
        // Update validation results
        setValidationResults({
          status: 'complete',
          score: validationResponse.score,
          issues: validationResponse.issues,
          passingChecks: validationResponse.passingChecks,
          failingChecks: validationResponse.failingChecks,
          regulatoryStatus: validationResponse.score >= 80 ? 'Compliant' : 'Not Compliant',
          complianceScore
        });
        
        // Show toast with results
        if (showResults) {
          toast({
            title: `Validation ${validationResponse.score >= 80 ? 'Passed' : 'Failed'}`,
            description: `Score: ${validationResponse.score}%. ${validationResponse.issues.length} issues found.`,
            variant: validationResponse.score >= 80 ? 'default' : 'destructive',
          });
        }
      }
    } catch (error) {
      console.error("Error validating document:", error);
      toast({
        title: "Validation Error",
        description: "Failed to validate document",
        variant: "destructive"
      });
    } finally {
      setValidationInProgress(false);
    }
  };

  // Local validation function
  const validateDocument = async (content, options) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Basic validation logic
    const issues = [];
    const passingChecks = [];
    
    // Content length check
    if (!content || content.length < 500) {
      issues.push({
        message: "Document content is too brief. Minimum required is 500 characters.",
        type: "content",
        severity: "major"
      });
    } else {
      passingChecks.push({
        message: "Document meets minimum content length requirements",
        type: "content"
      });
    }
    
    // XML structure check
    if (content && content.includes('<?xml') && content.includes('ectd:document')) {
      passingChecks.push({
        message: "XML structure is valid for eCTD submission",
        type: "structure"
      });
    } else {
      issues.push({
        message: "Missing proper XML structure for eCTD submission",
        type: "structure", 
        severity: "critical"
      });
    }
    
    // Required sections check
    const requiredSections = ['Introduction', 'Clinical Efficacy', 'Clinical Safety', 'Benefit-Risk'];
    const missingSections = [];
    
    requiredSections.forEach(section => {
      if (!content || !content.includes(section)) {
        missingSections.push(section);
        issues.push({
          message: `Missing required section: ${section}`,
          type: "structure",
          severity: "critical"
        });
      } else {
        passingChecks.push({
          message: `Contains required section: ${section}`,
          type: "structure"
        });
      }
    });
    
    // Calculate score
    const criticalIssues = issues.filter(issue => issue.severity === 'critical').length;
    const majorIssues = issues.filter(issue => issue.severity === 'major').length;
    
    // Weighted scoring
    const totalPoints = passingChecks.length + issues.length;
    const earnedPoints = passingChecks.length - (criticalIssues * 2) - majorIssues;
    const score = Math.max(0, Math.min(100, Math.round((earnedPoints / totalPoints) * 100)));
    
    return {
      score,
      issues,
      passingChecks,
      failingChecks: issues,
      documentType: options.documentType,
      section: options.section,
      region: options.region
    };
  };
  
  // Generate a PDF preview
  const generatePdfPreview = () => {
    if (!selectedDocument) return;
    
    setPdfGenerating(true);
    
    // Simulate PDF generation with a timeout
    setTimeout(() => {
      setShowPdfPreview(true);
      setPdfGenerating(false);
      
      toast({
        title: "PDF Preview Generated",
        description: "PDF preview is ready to view"
      });
    }, 1500);
  };
  
  // Export eCTD submission package
  const exportSubmissionPackage = () => {
    setExportInProgress(true);
    
    // Simulate export processing with a timeout
    setTimeout(() => {
      setExportInProgress(false);
      
      toast({
        title: "Submission Package Exported",
        description: `eCTD package for ${submissionMetadata.applicationNumber} created successfully`
      });
    }, 2000);
  };
  
  // Save document version
  const saveVersion = () => {
    if (!selectedDocument || !documentContent) return;
    
    const newVersion = {
      id: `v-${Date.now()}`,
      documentId: selectedDocument.id,
      timestamp: new Date().toISOString(),
      author: 'Current User',
      comments: 'Regular save',
      status: 'draft'
    };
    
    setDocumentVersions([newVersion, ...documentVersions]);
    
    toast({
      title: "Version Saved",
      description: "Document version has been saved"
    });
  };
  
  // Toggle section expansion in the CTD tree
  const toggleSectionExpansion = (section) => {
    setCTDExpandedSections({
      ...ctdExpandedSections,
      [section]: !ctdExpandedSections[section]
    });
  };
  
  // Add XML tags to the document
  const addXmlTags = () => {
    if (!documentContent) return;
    
    const annotatedContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ectd:document SYSTEM "util/dtd/ectd-doc-2-0.dtd">
<ectd:document xmlns:ectd="http://www.ich.org/ectd" xmlns:xlink="http://www.w3c.org/1999/xlink">
  <ectd:properties>
    <ectd:document-id>${selectedDocument?.id || 'doc-' + Date.now()}</ectd:document-id>
    <ectd:document-type>${selectedDocument?.documentType || 'clinical-overview'}</ectd:document-type>
    <ectd:section>${selectedDocument?.section || '2.5'}</ectd:section>
    <ectd:title>${selectedDocument?.title || 'Clinical Overview'}</ectd:title>
    <ectd:checksum type="md5">00000000000000000000000000000000</ectd:checksum>
    <ectd:modified-date>${new Date().toISOString()}</ectd:modified-date>
  </ectd:properties>
  <ectd:content>
${documentContent}
  </ectd:content>
</ectd:document>`;
    
    setDocumentContent(annotatedContent);
    
    toast({
      title: "XML Annotations Added",
      description: "eCTD-compliant XML tags have been added to the document"
    });
  };
  
  // Remove XML tags from the document
  const removeXmlTags = () => {
    if (!documentContent) return;
    
    const cleanContent = documentContent
      .replace(/(<\?xml.*?\?>|<!DOCTYPE.*?>|<ectd:document.*?>|<\/ectd:document>|<ectd:properties>.*?<\/ectd:properties>|<ectd:content>|<\/ectd:content>)/gs, '')
      .trim();
    
    setDocumentContent(cleanContent);
    
    toast({
      title: "XML Tags Removed",
      description: "XML tags removed for easier editing"
    });
  };
  
  // Mock document data
  useEffect(() => {
    const mockDocuments = [
      { id: 'doc1', name: 'Clinical Overview', documentType: 'clinical-overview', section: '2.5', moduleId: 'module2', path: '/module2/', status: 'draft' },
      { id: 'doc2', name: 'Risk Management Plan', documentType: 'risk-management-plan', section: '1.10', moduleId: 'module1', path: '/module1/', status: 'final' },
      { id: 'doc3', name: 'Clinical Study Report 101', documentType: 'clinical-study-report', section: '5.3.5', moduleId: 'module5', path: '/module5/', status: 'review' },
      { id: 'doc4', name: 'Quality Overall Summary', documentType: 'quality-overall-summary', section: '2.3', moduleId: 'module2', path: '/module2/', status: 'draft' },
      { id: 'doc5', name: 'Nonclinical Overview', documentType: 'nonclinical-overview', section: '2.4', moduleId: 'module2', path: '/module2/', status: 'draft' },
    ];
    
    setDocuments(mockDocuments);
  }, []);
  
  // Mock document versions
  useEffect(() => {
    if (selectedDocument) {
      const mockVersions = [
        { id: 'v1', documentId: selectedDocument.id, timestamp: '2025-04-15T14:30:00Z', author: 'John Smith', comments: 'Initial draft', status: 'draft' },
        { id: 'v2', documentId: selectedDocument.id, timestamp: '2025-04-18T09:45:00Z', author: 'Sarah Johnson', comments: 'Updated introduction', status: 'draft' },
        { id: 'v3', documentId: selectedDocument.id, timestamp: '2025-04-22T16:20:00Z', author: 'Current User', comments: 'Added clinical data', status: 'review' },
      ];
      
      setDocumentVersions(mockVersions);
    }
  }, [selectedDocument]);
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">eCTD Co-Author Module</h1>
      
      <div className="flex justify-between mb-4">
        <Button
          variant="outline"
          className="mb-4"
          onClick={() => setIsTreeOpen(!isTreeOpen)}
        >
          {isTreeOpen ? 'Hide Navigation' : 'Show Navigation'}
        </Button>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={saveVersion}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Version
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowVersionHistory(!showVersionHistory)}
          >
            <History className="mr-2 h-4 w-4" />
            Version History
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-12 gap-4">
        {isTreeOpen && (
          <div className="col-span-12 lg:col-span-3 mb-4 lg:mb-0">
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <FolderTree className="mr-2 h-5 w-5" />
                CTD Structure
              </h3>
              
              <div className="space-y-2">
                {/* Module 1 */}
                <div className="border rounded-md overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100 transition-colors"
                    onClick={() => toggleSectionExpansion('module1')}
                  >
                    <span className="font-medium">Module 1: Administrative Information</span>
                    <ChevronDown className={`h-5 w-5 transition-transform ${ctdExpandedSections.module1 ? 'transform rotate-180' : ''}`} />
                  </button>
                  
                  {ctdExpandedSections.module1 && (
                    <div className="p-2">
                      <ul className="text-sm space-y-1 pl-2">
                        <li className="hover:bg-slate-50 p-1 rounded">1.1: Cover Letter</li>
                        <li className="hover:bg-slate-50 p-1 rounded">1.2: Application Form</li>
                        <li className="hover:bg-slate-50 p-1 rounded">1.3: Product Information</li>
                        <li className="hover:bg-slate-50 p-1 rounded bg-blue-50 text-blue-700">1.10: Risk Management Plan</li>
                      </ul>
                    </div>
                  )}
                </div>
                
                {/* Module 2 */}
                <div className="border rounded-md overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100 transition-colors"
                    onClick={() => toggleSectionExpansion('module2')}
                  >
                    <span className="font-medium">Module 2: CTD Summaries</span>
                    <ChevronDown className={`h-5 w-5 transition-transform ${ctdExpandedSections.module2 ? 'transform rotate-180' : ''}`} />
                  </button>
                  
                  {ctdExpandedSections.module2 && (
                    <div className="p-2">
                      <ul className="text-sm space-y-1 pl-2">
                        <li className="hover:bg-slate-50 p-1 rounded">2.1: Table of Contents</li>
                        <li className="hover:bg-slate-50 p-1 rounded">2.2: Introduction</li>
                        <li className="hover:bg-slate-50 p-1 rounded bg-blue-50 text-blue-700">2.3: Quality Overall Summary</li>
                        <li className="hover:bg-slate-50 p-1 rounded">2.4: Nonclinical Overview</li>
                        <li className="hover:bg-slate-50 p-1 rounded">2.5: Clinical Overview</li>
                        <li className="hover:bg-slate-50 p-1 rounded">2.6: Nonclinical Summary</li>
                        <li className="hover:bg-slate-50 p-1 rounded">2.7: Clinical Summary</li>
                      </ul>
                    </div>
                  )}
                </div>
                
                {/* Module 3 */}
                <div className="border rounded-md overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100 transition-colors"
                    onClick={() => toggleSectionExpansion('module3')}
                  >
                    <span className="font-medium">Module 3: Quality</span>
                    <ChevronDown className={`h-5 w-5 transition-transform ${ctdExpandedSections.module3 ? 'transform rotate-180' : ''}`} />
                  </button>
                  
                  {ctdExpandedSections.module3 && (
                    <div className="p-2">
                      <ul className="text-sm space-y-1 pl-2">
                        <li className="hover:bg-slate-50 p-1 rounded">3.1: Table of Contents</li>
                        <li className="hover:bg-slate-50 p-1 rounded">3.2.S: Drug Substance</li>
                        <li className="hover:bg-slate-50 p-1 rounded">3.2.P: Drug Product</li>
                        <li className="hover:bg-slate-50 p-1 rounded">3.2.R: Regional Information</li>
                        <li className="hover:bg-slate-50 p-1 rounded">3.3: Literature References</li>
                      </ul>
                    </div>
                  )}
                </div>
                
                {/* Module 4 */}
                <div className="border rounded-md overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100 transition-colors"
                    onClick={() => toggleSectionExpansion('module4')}
                  >
                    <span className="font-medium">Module 4: Nonclinical Reports</span>
                    <ChevronDown className={`h-5 w-5 transition-transform ${ctdExpandedSections.module4 ? 'transform rotate-180' : ''}`} />
                  </button>
                  
                  {ctdExpandedSections.module4 && (
                    <div className="p-2">
                      <ul className="text-sm space-y-1 pl-2">
                        <li className="hover:bg-slate-50 p-1 rounded">4.1: Table of Contents</li>
                        <li className="hover:bg-slate-50 p-1 rounded">4.2.1: Pharmacology</li>
                        <li className="hover:bg-slate-50 p-1 rounded">4.2.2: Pharmacokinetics</li>
                        <li className="hover:bg-slate-50 p-1 rounded">4.2.3: Toxicology</li>
                        <li className="hover:bg-slate-50 p-1 rounded">4.3: Literature References</li>
                      </ul>
                    </div>
                  )}
                </div>
                
                {/* Module 5 */}
                <div className="border rounded-md overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100 transition-colors"
                    onClick={() => toggleSectionExpansion('module5')}
                  >
                    <span className="font-medium">Module 5: Clinical Reports</span>
                    <ChevronDown className={`h-5 w-5 transition-transform ${ctdExpandedSections.module5 ? 'transform rotate-180' : ''}`} />
                  </button>
                  
                  {ctdExpandedSections.module5 && (
                    <div className="p-2">
                      <ul className="text-sm space-y-1 pl-2">
                        <li className="hover:bg-slate-50 p-1 rounded">5.1: Table of Contents</li>
                        <li className="hover:bg-slate-50 p-1 rounded">5.2: Study Reports Listing</li>
                        <li className="hover:bg-slate-50 p-1 rounded">5.3.1: Bioavailability Studies</li>
                        <li className="hover:bg-slate-50 p-1 rounded">5.3.3: Clinical Pharmacology</li>
                        <li className="hover:bg-slate-50 p-1 rounded bg-blue-50 text-blue-700">5.3.5: Efficacy and Safety Studies</li>
                        <li className="hover:bg-slate-50 p-1 rounded">5.4: Literature References</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}
        
        <div className={`col-span-12 ${isTreeOpen ? 'lg:col-span-9' : 'lg:col-span-12'} grid grid-cols-1 lg:grid-cols-3 gap-4`}>
          <div className="lg:col-span-1">
            <Card className="p-4 mb-4">
              <h3 className="text-sm font-medium mb-2">Document List</h3>
              <ul className="space-y-2">
                {documents.map(doc => (
                  <li key={doc.id}>
                    <button 
                      className={`w-full text-left p-2 rounded-md transition-colors flex items-center ${
                        selectedDocument?.id === doc.id 
                          ? 'bg-blue-100 text-blue-700 font-medium' 
                          : 'hover:bg-slate-100'
                      }`}
                      onClick={() => {
                        setSelectedDocument(doc);
                        setDocumentContent(`# ${doc.name}\n\nThis is a sample content for ${doc.name} (${doc.section}).`);
                      }}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      <div>
                        <p className="text-sm">{doc.name}</p>
                        <p className="text-xs text-slate-500">Section {doc.section}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-4">
              <h3 className="text-sm font-medium mb-2">Actions</h3>
              
              <div className="space-y-2">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  size="sm"
                  onClick={validateEctdDocument}
                  disabled={validationInProgress || !selectedDocument}
                >
                  {validationInProgress ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <FileCheck className="mr-2 h-4 w-4" />
                      Validate Document
                    </>
                  )}
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  size="sm"
                  onClick={saveVersion}
                  disabled={!selectedDocument}
                >
                  <History className="mr-2 h-4 w-4" />
                  Save Version
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVersionHistory(!showVersionHistory)}
                  disabled={!selectedDocument}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Version History
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  size="sm"
                  onClick={generatePdfPreview}
                  disabled={pdfGenerating || !selectedDocument}
                >
                  {pdfGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Preview PDF
                    </>
                  )}
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  size="sm"
                  onClick={exportSubmissionPackage}
                  disabled={exportInProgress || !selectedDocument}
                >
                  {exportInProgress ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Export Submission
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>
          
          <div className="flex-1 lg:col-span-2">
            <Card className="p-4 mb-4">
              <Tabs defaultValue="editor" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="editor">Document Editor</TabsTrigger>
                  <TabsTrigger value="metadata">eCTD Metadata</TabsTrigger>
                  <TabsTrigger value="submission">Submission Package</TabsTrigger>
                </TabsList>
                
                <TabsContent value="editor">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium">Document Editor</h3>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={addXmlTags}
                        >
                          Add XML Tags
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={removeXmlTags}
                        >
                          Remove XML Tags
                        </Button>
                      </div>
                    </div>
                    
                    <textarea 
                      className="w-full h-64 p-4 border rounded-md font-mono text-sm"
                      value={documentContent || "Select a document to edit or create a new document"}
                      onChange={(e) => setDocumentContent(e.target.value)}
                      placeholder="Document content will appear here"
                    />
                    
                    <div className="bg-slate-50 p-3 rounded-md text-xs text-slate-600">
                      <p className="font-medium mb-1">eCTD XML Annotation Guidelines:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>XML annotations are required for proper eCTD document indexing</li>
                        <li>Document properties must match eCTD section metadata</li>
                        <li>Use the "Add XML Tags" button to apply compliant annotations</li>
                        <li>XML tags will be preserved when submitting to regulatory authorities</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="metadata">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {selectedDocument ? (
                        <>
                          <div>
                            <h4 className="text-sm font-medium mb-1">Document Type</h4>
                            <p className="text-sm">{selectedDocument.documentType || "Not specified"}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-1">CTD Section</h4>
                            <p className="text-sm">{selectedDocument.section || "Not specified"}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-1">Module</h4>
                            <p className="text-sm">{selectedDocument.moduleId || "Not specified"}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-1">Document Status</h4>
                            <p className="text-sm capitalize">{selectedDocument.status || "draft"}</p>
                          </div>
                          <div className="col-span-2">
                            <h4 className="text-sm font-medium mb-1">Document Path</h4>
                            <p className="text-sm font-mono bg-slate-50 p-1 rounded">{`${selectedDocument.path || "/"}${selectedDocument.name || "document.xml"}`}</p>
                          </div>
                        </>
                      ) : (
                        <p className="col-span-2 text-sm text-slate-500">Select a document to view metadata</p>
                      )}
                    </div>
                    
                    <div className="border-t pt-4 mt-4">
                      <h4 className="text-sm font-medium mb-2">eCTD Requirements</h4>
                      
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-medium">XML Structure</p>
                          <div className="flex justify-between">
                            <p className="text-xs">Compliance with eCTD DTD</p>
                            <Badge variant="outline">Required</Badge>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs font-medium">Granularity</p>
                          <div className="flex justify-between">
                            <p className="text-xs">Document granularity by section</p>
                            <Badge variant="outline">Required</Badge>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs font-medium">PDF Compliance</p>
                          <div className="flex justify-between">
                            <p className="text-xs">PDF/A-1 or PDF/A-2 format</p>
                            <Badge variant="outline">Required</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="submission">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium mb-2">Submission Package Configuration</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium">Submission Type</label>
                        <select 
                          className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
                          value={submissionMetadata.submissionType}
                          onChange={(e) => setSubmissionMetadata({
                            ...submissionMetadata,
                            submissionType: e.target.value
                          })}
                        >
                          <option value="original">Original</option>
                          <option value="amendment">Amendment</option>
                          <option value="supplement">Supplement</option>
                          <option value="report">Report</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium">Sequence Number</label>
                        <input 
                          type="text"
                          className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
                          value={submissionMetadata.sequenceNumber}
                          onChange={(e) => setSubmissionMetadata({
                            ...submissionMetadata,
                            sequenceNumber: e.target.value
                          })}
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium">Application Number</label>
                        <input 
                          type="text"
                          className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
                          value={submissionMetadata.applicationNumber}
                          onChange={(e) => setSubmissionMetadata({
                            ...submissionMetadata,
                            applicationNumber: e.target.value
                          })}
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium">Region</label>
                        <select 
                          className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
                          value={submissionMetadata.region}
                          onChange={(e) => setSubmissionMetadata({
                            ...submissionMetadata,
                            region: e.target.value
                          })}
                        >
                          <option value="FDA">FDA (US)</option>
                          <option value="EMA">EMA (EU)</option>
                          <option value="PMDA">PMDA (Japan)</option>
                          <option value="HC">Health Canada</option>
                        </select>
                      </div>
                    </div>
                    
                    <Button
                      className="w-full"
                      onClick={exportSubmissionPackage}
                      disabled={exportInProgress}
                    >
                      {exportInProgress ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Exporting eCTD Package...
                        </>
                      ) : (
                        <>
                          <Archive className="mr-2 h-4 w-4" />
                          Generate eCTD Submission Package
                        </>
                      )}
                    </Button>
                    
                    <div className="bg-slate-50 p-3 rounded-md text-xs text-slate-600">
                      <p className="font-medium mb-1">eCTD Submission Notes:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Package will include all documents in the submission</li>
                        <li>XML backbone will be auto-generated</li>
                        <li>Regional validation rules will be applied</li>
                        <li>All documents must pass validation before export</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
            
            {/* Version History */}
            {showVersionHistory && (
              <Card className="p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium flex items-center">
                    <History className="mr-2 h-4 w-4" />
                    Version History
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowVersionHistory(false)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-auto">
                  {documentVersions.map(version => (
                    <div 
                      key={version.id} 
                      className="flex items-start justify-between p-2 rounded-md hover:bg-slate-50"
                    >
                      <div>
                        <p className="text-sm font-medium">{new Date(version.timestamp).toLocaleString()}</p>
                        <p className="text-xs text-slate-500">
                          {version.author} - {version.comments}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Badge variant="outline" className="text-xs capitalize">
                          {version.status}
                        </Badge>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            toast({
                              title: "Version Loaded",
                              description: `Loaded version from ${new Date(version.timestamp).toLocaleString()}`
                            });
                          }}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            
            {/* Validation Results */}
            {validationResults.status === 'complete' && (
              <Card className="p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium flex items-center">
                    <FileCheck className="mr-2 h-4 w-4" />
                    Validation Results
                  </h3>
                  <Badge 
                    variant={validationResults.score >= 80 ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {validationResults.score}% Compliant
                  </Badge>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs">Compliance Score</span>
                    <span className="text-xs">{validationResults.score}%</span>
                  </div>
                  <Progress value={validationResults.score} className="h-2" />
                </div>
                
                {validationResults.failingChecks.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-medium mb-2 flex items-center text-red-600">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Issues Requiring Attention
                    </h4>
                    
                    <div className="space-y-1 max-h-40 overflow-auto">
                      {validationResults.failingChecks.map((issue, index) => (
                        <div 
                          key={index} 
                          className="text-xs p-2 bg-red-50 border border-red-100 rounded-md flex items-start"
                        >
                          <AlertTriangle className="h-3 w-3 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{issue.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="text-xs font-medium mb-2 flex items-center text-green-600">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Passing Checks
                  </h4>
                  
                  <div className="space-y-1 max-h-40 overflow-auto">
                    {validationResults.passingChecks.map((check, index) => (
                      <div 
                        key={index} 
                        className="text-xs p-2 bg-green-50 border border-green-100 rounded-md flex items-start"
                      >
                        <CheckCircle2 className="h-3 w-3 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{check.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
            
            {/* PDF Preview */}
            {showPdfPreview && (
              <Card className="p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    PDF Preview
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowPdfPreview(false)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="border rounded-md p-4 bg-slate-50 h-80 flex flex-col items-center justify-center mb-2">
                  <p className="text-sm text-center mb-2">
                    eCTD Document Preview: {selectedDocument?.name}
                  </p>
                  <p className="text-xs text-center mb-4 text-slate-500">
                    Section {selectedDocument?.section} - {selectedDocument?.moduleId}
                  </p>
                  
                  <div className="flex-1 w-full border border-slate-200 rounded-md bg-white p-4 overflow-auto">
                    <div className="text-xs">{documentContent}</div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "PDF Downloaded",
                        description: "Document has been downloaded as PDF"
                      });
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "PDF Shared",
                        description: "PDF sharing link has been copied to clipboard"
                      });
                    }}
                  >
                    <Clipboard className="mr-2 h-4 w-4" />
                    Share PDF
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
        
        // Show success notification
        toast({
          title: "Validation Complete",
          description: `Document validated with compliance score: ${complianceScore}%`,
        });
      } else {
        throw new Error('Invalid validation response');
      }
    } catch (error) {
      console.error('Error during validation:', error);
      setValidationResults({
        ...validationResults,
        status: 'error',
        regulatoryStatus: 'Validation Failed'
      });
      
      toast({
        title: "Validation Error",
        description: "Could not complete document validation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setValidationInProgress(false);
    }
  };
  
  // Handle document selection
  const handleDocumentSelect = (document) => {
    if (!document) return;
    
    // Update selected document
    setSelectedDocument(document);
    
    // If changing to a different document, update content and reset validation
    if (!selectedDocument || selectedDocument.id !== document.id) {
      // Check if we have saved versions for this document
      const latestVersion = documentVersions.find(v => v.documentId === document.id);
      
      if (latestVersion) {
        // Load the latest version
        setDocumentContent(latestVersion.content);
        
        toast({
          title: "Document Loaded",
          description: `Loaded document with latest saved version from ${new Date(latestVersion.timestamp).toLocaleString()}`
        });
      } else {
        // Create default content based on document type
        let defaultContent = `# ${document.title}\n\n`;
        
        if (document.documentType === 'Clinical Overview') {
          defaultContent += `## 1. Introduction\nThis document provides an overview of the clinical development program.\n\n## 2. Disease Background\nBackground information on the disease and current treatment options.\n\n## 3. Clinical Efficacy\nSummary of efficacy results from the pivotal clinical studies.\n\n## 4. Clinical Safety\nOverview of the safety profile based on clinical trial data.\n\n## 5. Benefit-Risk Assessment\nEvaluation of the overall benefit-risk profile of the product.`;
        } else if (document.documentType === 'Risk Management Plan') {
          defaultContent += `## 1. Safety Concerns\nList of important identified and potential risks.\n\n## 2. Pharmacovigilance Plan\nActivities to address safety concerns.\n\n## 3. Risk Minimization Measures\nActivities to minimize risks.`;
        } else {
          defaultContent += `## Document Content\nAdd your content here.`;
        }
        
        setDocumentContent(defaultContent);
        
        toast({
          title: "Document Selected",
          description: `Loaded ${document.documentType} document template`
        });
      }
      
      // Reset validation
      setValidationResults({
        status: 'none',
        score: 0,
        issues: [],
        passingChecks: [],
        failingChecks: [],
        regulatoryStatus: 'Not Validated',
        complianceScore: 0
      });
    }
  };
  
  // Handle CTD section click
  const handleCTDSectionClick = (moduleId, sectionId, sectionTitle) => {
    // Update selected document reference with the CTD section metadata
    const updatedDocument = {
      ...selectedDocument,
      section: sectionId,
      sectionTitle: sectionTitle,
      moduleId: moduleId
    };
    
    setSelectedDocument(updatedDocument);
    
    // Log section navigation for regulatory tracking
    console.log(`Navigated to ${moduleId} - Section ${sectionId}: ${sectionTitle}`);
    
    // Perform validation when changing sections
    validateEctdDocument(false);
    
    // Automatically save version when changing sections
    saveDocumentVersion();
    
    toast({
      title: "Section Updated",
      description: `Document mapped to ${moduleId} section ${sectionId}`,
    });
  };
  
  // Generate PDF preview for eCTD document
  const generatePdfPreview = async () => {
    if (!selectedDocument) {
      toast({
        title: "No Document Selected",
        description: "Please select a document to preview",
        variant: "destructive"
      });
      return null;
    }
    
    try {
      setPdfGenerating(true);
      
      // Notification toast
      toast({
        title: "Generating PDF Preview",
        description: "Creating PDF preview for eCTD submission..."
      });
      
      // In a real implementation, this would call a PDF generation API
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Return metadata about the created PDF
      const previewData = {
        documentTitle: selectedDocument.title || "Untitled Document",
        documentType: selectedDocument.documentType || "Clinical Overview",
        section: selectedDocument.section || "2.5",
        moduleId: selectedDocument.moduleId || "module2",
        timestamp: new Date().toISOString(),
        pages: Math.max(1, Math.floor(documentContent.length / 500)) // Estimate pages
      };
      
      // Success notification
      toast({
        title: "PDF Preview Ready",
        description: `Preview generated for ${previewData.documentTitle}`
      });
      
      setShowPdfPreview(true);
      return previewData;
    } catch (error) {
      console.error('Error generating PDF preview:', error);
      toast({
        title: "Preview Generation Failed",
        description: "Could not generate PDF preview",
        variant: "destructive"
      });
      return null;
    } finally {
      setPdfGenerating(false);
    }
  };
  
  // Export eCTD submission package
  const exportEctdSubmission = async () => {
    if (!selectedDocument) {
      toast({
        title: "No Document Selected",
        description: "Please select a document to include in the submission",
        variant: "destructive"
      });
      return;
    }
    
    if (validationResults.status !== 'complete' || validationResults.complianceScore < 60) {
      toast({
        title: "Validation Required",
        description: "Document must pass validation with at least 60% compliance before export",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setExportInProgress(true);
      
      // Notification toast
      toast({
        title: "Preparing eCTD Submission",
        description: `Creating ${submissionMetadata.submissionType} submission package...`,
      });
      
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate XML backbone for the eCTD
      const ectdBackbone = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ectd:submission SYSTEM "util/dtd/ectd-2-0.dtd">
<ectd:submission xmlns:ectd="http://www.ich.org/ectd" xmlns:xlink="http://www.w3c.org/1999/xlink">
  <ectd:admin>
    <ectd:application-type>${submissionMetadata.submissionType}</ectd:application-type>
    <ectd:application-number>${submissionMetadata.applicationNumber}</ectd:application-number>
    <ectd:submission-id>${submissionMetadata.sequenceNumber}</ectd:submission-id>
    <ectd:submission-description>Submission for ${selectedDocument?.title || "Clinical Overview"}</ectd:submission-description>
  </ectd:admin>
  <ectd:m1-regional/>
  <ectd:m2-common-technical-document-summaries>
    <ectd:m2-5-clinical-overview ref="m2/m2-5-clinical-overview.pdf"/>
  </ectd:m2-common-technical-document-summaries>
  <ectd:m3-quality/>
  <ectd:m4-nonclinical-study-reports/>
  <ectd:m5-clinical-study-reports/>
</ectd:submission>`;
      
      // Create submission version record
      saveDocumentVersion();
      
      // Success notification
      toast({
        title: "eCTD Export Complete",
        description: `Submission package created for ${submissionMetadata.applicationNumber}`,
      });
      
      // Return metadata about the created package
      return {
        backbone: ectdBackbone,
        sequence: submissionMetadata.sequenceNumber,
        application: submissionMetadata.applicationNumber,
        timestamp: new Date().toISOString(),
        status: 'ready-for-submission'
      };
    } catch (error) {
      console.error('Error during eCTD export:', error);
      toast({
        title: "Export Failed",
        description: "Could not create eCTD submission package",
        variant: "destructive"
      });
      return null;
    } finally {
      setExportInProgress(false);
    }
  };
  
  // Save document version
  const saveDocumentVersion = () => {
    if (!selectedDocument || !documentContent) {
      toast({
        title: "No Document to Save",
        description: "Please select or create a document first",
        variant: "destructive"
      });
      return;
    }
    
    // Create new version entry
    const newVersion = {
      id: `v-${Date.now()}`,
      documentId: selectedDocument.id || 'temp-doc',
      content: documentContent,
      title: selectedDocument.title || 'Untitled Document',
      section: selectedDocument.section || '2.5',
      moduleId: selectedDocument.moduleId || 'module2',
      timestamp: new Date().toISOString(),
      validationStatus: validationResults.status === 'complete' ? 
                        (validationResults.complianceScore >= 80 ? 'Compliant' : 'Non-Compliant') : 
                        'Not Validated',
      complianceScore: validationResults.complianceScore || 0,
      submissionReady: validationResults.complianceScore >= 80
    };
    
    // Add version to history
    setDocumentVersions([newVersion, ...documentVersions]);
    
    toast({
      title: "Version Saved",
      description: `Document version saved with timestamp: ${new Date().toLocaleTimeString()}`
    });
    
    return newVersion;
  };
  
  // Vault DMS Integration Functions
  
  // Fetch documents from Vault DMS
  const fetchVaultDocuments = async () => {
    setVaultLoading(true);
    
    try {
      // Simulate API call to Vault DMS
      // In production, this would be a real API call to the Vault DMS system
      console.log("Fetching documents from Vault DMS...");
      
      // Simulate response delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Sample Vault documents based on the eCTD structure in the attached PDF
      const vaultDocData = [
        // Module 1 documents
        { id: "v1", name: "Form 1574.pdf", section: "1.1", moduleId: "module1", status: "final", path: "/module1/1.1/" },
        { id: "v2", name: "Cover Letter.docx", section: "1.2", moduleId: "module1", status: "final", path: "/module1/1.2/" },
        { id: "v3", name: "Sponsor contact information.docx", section: "1.3.1", moduleId: "module1", status: "draft", path: "/module1/1.3.1/" },
        { id: "v4", name: "Roadmap of Responses from pre-IND meeting.docx", section: "1.12.1.4", moduleId: "module1", status: "draft", path: "/module1/1.12.1.4/" },
        { id: "v5", name: "Request for waiver of in vivo studies.docx", section: "1.12.13", moduleId: "module1", status: "draft", path: "/module1/1.12.13/" },
        
        // Module 2 documents
        { id: "v6", name: "Overview.docx", section: "2.2", moduleId: "module2", status: "final", path: "/module2/2.2/" },
        { id: "v7", name: "Quality Overall Summary.docx", section: "2.3", moduleId: "module2", status: "draft", path: "/module2/2.3/" },
        { id: "v8", name: "Nonclinical Overview.docx", section: "2.4", moduleId: "module2", status: "final", path: "/module2/2.4/" },
        { id: "v9", name: "Clinical Overview.docx", section: "2.5", moduleId: "module2", status: "draft", path: "/module2/2.5/" },
        
        // Module 3 documents
        { id: "v10", name: "Facilities and equipment (Lumen Bioscience).pdf", section: "3.2.A.1", moduleId: "module3", status: "final", path: "/module3/3.2.A.1/" },
        { id: "v11", name: "Description and composition (LMN-201, capsules).docx", section: "3.2.P.1", moduleId: "module3", status: "final", path: "/module3/3.2.P.1/" },
        { id: "v12", name: "General Information (SP1308 SP1312 SP1313 SP1287, Lumen Bioscience).docx", section: "3.2.S.1", moduleId: "module3", status: "final", path: "/module3/3.2.S.1/" }
      ];
      
      // Create folder structure from documents
      const folders = {};
      vaultDocData.forEach(doc => {
        const moduleId = doc.moduleId;
        const section = doc.section;
        
        if (!folders[moduleId]) {
          folders[moduleId] = {};
        }
        
        if (!folders[moduleId][section]) {
          folders[moduleId][section] = [];
        }
        
        folders[moduleId][section].push(doc);
      });
      
      // Create document status mapping
      const statusMap = {};
      vaultDocData.forEach(doc => {
        statusMap[doc.id] = doc.status;
      });
      
      setVaultDocuments(vaultDocData);
      setVaultFolders(folders);
      setDocumentStatus(statusMap);
      
      toast({
        title: "Vault Documents Loaded",
        description: `${vaultDocData.length} documents loaded from Vault DMS`
      });
      
      // Log for debugging
      console.log("Toast would show:", {
        title: "Vault Documents Loaded",
        description: `${vaultDocData.length} documents loaded from Vault DMS`
      });
    } catch (error) {
      console.error("Error fetching vault documents:", error);
      toast({
        title: "Error Loading Vault Documents",
        description: "Failed to load documents from Vault DMS. Please try again.",
        variant: "destructive"
      });
    } finally {
      setVaultLoading(false);
    }
  };
  
  // Load document from Vault DMS
  const loadVaultDocument = async (documentId) => {
    if (isDocumentLocked) {
      toast({
        title: "Document Locked",
        description: "This document is currently locked for editing by another user",
        variant: "warning"
      });
      return;
    }
    
    setVaultLoading(true);
    
    try {
      // Find the document in our vault documents
      const vaultDoc = vaultDocuments.find(d => d.id === documentId);
      if (!vaultDoc) {
        throw new Error("Document not found in Vault");
      }
      
      // Simulate API call to get document content
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Create dummy content based on the document name
      const dummyContent = `# ${vaultDoc.name.replace('.docx', '').replace('.pdf', '')}

## eCTD Section ${vaultDoc.section}
This is a placeholder content for the ${vaultDoc.name} document.

## Document Properties
- **Section**: ${vaultDoc.section}
- **Status**: ${vaultDoc.status}
- **Path**: ${vaultDoc.path}
- **Module**: ${vaultDoc.moduleId}

## Content Guidelines
Follow the ICH eCTD format requirements for this section.
${vaultDoc.name.includes('.pdf') ? '(This is a PDF document and cannot be edited directly in this interface)' : ''}`;
      
      // Update state
      setDocumentContent(dummyContent);
      setSelectedDocument({
        id: vaultDoc.id,
        title: vaultDoc.name,
        documentType: vaultDoc.name.split('.')[0],
        section: vaultDoc.section,
        moduleId: vaultDoc.moduleId,
        status: vaultDoc.status,
        path: vaultDoc.path
      });
      setSelectedEctdSection(vaultDoc.section);
      
      // Run validation silently
      setTimeout(() => {
        validateEctdDocument(false);
      }, 500);
      
      toast({
        title: "Document Loaded",
        description: `${vaultDoc.name} loaded from Vault DMS`
      });
    } catch (error) {
      console.error("Error loading vault document:", error);
      toast({
        title: "Error Loading Document",
        description: error.message || "Failed to load document from Vault DMS",
        variant: "destructive"
      });
    } finally {
      setVaultLoading(false);
    }
  };
  
  // Change document status in Vault
  const changeDocumentStatus = (documentId, newStatus) => {
    if (!documentId || !newStatus) return;
    
    // Update status in state
    setDocumentStatus(prev => ({
      ...prev,
      [documentId]: newStatus
    }));
    
    // Get document
    const doc = vaultDocuments.find(d => d.id === documentId);
    if (!doc) return;
    
    toast({
      title: "Status Updated",
      description: `${doc.name} status changed to ${newStatus}`
    });
  };
  
  // Lock document for editing
  const lockDocument = (documentId) => {
    if (!documentId) return;
    
    // Get document
    const doc = vaultDocuments.find(d => d.id === documentId);
    if (!doc) return;
    
    setIsDocumentLocked(true);
    
    toast({
      title: "Document Locked",
      description: `${doc.name} is now locked for editing`
    });
  };
  
  // Unlock document
  const unlockDocument = (documentId) => {
    if (!documentId) return;
    
    // Get document
    const doc = vaultDocuments.find(d => d.id === documentId);
    if (!doc) return;
    
    setIsDocumentLocked(false);
    
    toast({
      title: "Document Unlocked",
      description: `${doc.name} is now unlocked`
    });
  };
  
  // Create a compiled document from multiple sections
  const createCompiledDocument = (moduleId) => {
    if (!moduleId) return;
    
    const moduleDocs = vaultDocuments.filter(d => d.moduleId === moduleId);
    if (moduleDocs.length === 0) {
      toast({
        title: "No Documents Found",
        description: `No documents found for ${moduleId}`,
        variant: "destructive"
      });
      return;
    }
    
    // Show a working indicator
    setVaultLoading(true);
    
    // Simulate API call to compile documents
    setTimeout(() => {
      try {
        // Get sorted docs from the module
        const sortedDocs = [...moduleDocs].sort((a, b) => 
          a.section.localeCompare(b.section, undefined, { numeric: true, sensitivity: 'base' })
        );
        
        // Create compilation content
        let compiledContent = `# Compiled ${moduleId.replace('module', 'Module ')} Document\n\n`;
        compiledContent += `*Compilation Date: ${new Date().toLocaleString()}*\n\n`;
        compiledContent += `*Contains ${sortedDocs.length} document sections*\n\n`;
        compiledContent += `## Table of Contents\n\n`;
        
        // Add TOC
        sortedDocs.forEach(doc => {
          compiledContent += `- Section ${doc.section}: ${doc.name.replace(/\.(docx|pdf)$/, '')}\n`;
        });
        
        compiledContent += `\n## Document Content\n\n`;
        
        // Add placeholder content for each document
        sortedDocs.forEach(doc => {
          compiledContent += `### Section ${doc.section}: ${doc.name.replace(/\.(docx|pdf)$/, '')}\n\n`;
          compiledContent += `*Status: ${documentStatus[doc.id] || doc.status}*\n\n`;
          compiledContent += `This is the compiled content for ${doc.name}. In a production environment, this would contain the actual document content retrieved from the Vault DMS.\n\n`;
          compiledContent += `[Original document location: ${doc.path}${doc.name}]\n\n`;
          compiledContent += `---\n\n`;
        });
        
        // Create a new "compiled" document object
        const compiledDoc = {
          id: `compiled-${moduleId}-${Date.now()}`,
          title: `Compiled ${moduleId.replace('module', 'Module ')} Document`,
          documentType: "Compiled Document",
          section: moduleId.replace('module', ''),
          moduleId: moduleId,
          status: "draft",
          isCompiled: true,
          originalDocs: sortedDocs.map(d => d.id)
        };
        
        // Set as selected document
        setSelectedDocument(compiledDoc);
        setDocumentContent(compiledContent);
        
        // Set all documents in module to locked
        moduleDocs.forEach(doc => {
          lockDocument(doc.id);
        });
        
        toast({
          title: "Module Compiled",
          description: `${moduleId.replace('module', 'Module ')} documents have been compiled and locked for editing`,
        });
      } catch (error) {
        console.error("Error compiling documents:", error);
        toast({
          title: "Compilation Error",
          description: "Failed to compile documents. Please try again.",
          variant: "destructive"
        });
      } finally {
        setVaultLoading(false);
      }
    }, 1000);
  };
  
  // Re-atomize a compiled document back to individual sections
  const reatomizeDocument = (moduleId) => {
    if (!moduleId) return;
    
    const moduleDocs = vaultDocuments.filter(d => d.moduleId === moduleId);
    if (moduleDocs.length === 0) return;
    
    // Show a working indicator
    setVaultLoading(true);
    
    // Simulate API call for re-atomization
    setTimeout(() => {
      try {
        // In a real implementation, we would parse the compiled document
        // and update each component document with its content section
        
        // Unlock all documents in the module
        moduleDocs.forEach(doc => {
          unlockDocument(doc.id);
        });
        
        // Clear selection if it's the compiled document
        if (selectedDocument && selectedDocument.isCompiled && selectedDocument.moduleId === moduleId) {
          setSelectedDocument(null);
          setDocumentContent('');
        }
        
        toast({
          title: "Documents Re-atomized",
          description: `${moduleId.replace('module', 'Module ')} has been re-atomized into individual documents`
        });
      } catch (error) {
        console.error("Error re-atomizing documents:", error);
        toast({
          title: "Re-atomization Error",
          description: "Failed to re-atomize documents. Please try again.",
          variant: "destructive"
        });
      } finally {
        setVaultLoading(false);
      }
    }, 800);
  };
  
  // Load document version
  const loadDocumentVersion = (versionId) => {
    const version = documentVersions.find(v => v.id === versionId);
    if (!version) return;
    
    // Update document content
    setDocumentContent(version.content);
    
    // Update selected document if needed
    if (selectedDocument) {
      setSelectedDocument({
        ...selectedDocument,
        title: version.title,
        section: version.section,
        moduleId: version.moduleId
      });
    }
    
    setShowVersionHistory(false);
    
    toast({
      title: "Version Loaded",
      description: `Document version from ${new Date(version.timestamp).toLocaleString()} loaded`
    });
  };
  
  // Initialize component data and setup connections between features
  useEffect(() => {
    // Initialize basic documents (will be replaced by Vault documents)
    const initialDocuments = [
      { id: 1, title: "Clinical Overview", documentType: "Clinical Overview", section: "2.5", moduleId: "module2" },
      { id: 2, title: "Risk Management Plan", documentType: "Risk Management Plan", section: "1.10", moduleId: "module1" },
      { id: 3, title: "Clinical Study Report", documentType: "Clinical Study Report", section: "5.3.5", moduleId: "module5" }
    ];
    
    setDocuments(initialDocuments);
    
    // Initialize with a sample version history record
    const now = new Date();
    const sampleVersions = [
      {
        id: `v-${now.getTime() - 86400000}`, // 1 day ago
        documentId: 1,
        content: "# Clinical Overview (Previous Version)\n\n## 1. Introduction\nThis is a previous version of the clinical overview document.",
        title: "Clinical Overview",
        section: "2.5",
        moduleId: "module2",
        timestamp: new Date(now.getTime() - 86400000).toISOString(),
        validationStatus: "Compliant",
        complianceScore: 85,
        submissionReady: true
      }
    ];
    
    setDocumentVersions(sampleVersions);
    
    // Set up keyboard shortcut for validation (Ctrl+Alt+V)
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.altKey && e.key === 'v') {
        validateEctdDocument(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Fetch documents from Vault DMS
    fetchVaultDocuments();
    
    // Cleanup function
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  // Simplified component rendering
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">eCTD Co-Author Module</h1>
          
          <div className="flex space-x-2">
            <Button 
              onClick={saveDocumentVersion}
              variant="outline"
              className="bg-green-50"
              disabled={!selectedDocument || !documentContent}
            >
              <History className="mr-2 h-4 w-4 text-green-600" />
              Save Version
            </Button>
            
            <Button 
              onClick={() => setShowVersionHistory(true)}
              variant="outline"
              disabled={documentVersions.length === 0}
            >
              <Clock className="mr-2 h-4 w-4" />
              Version History
            </Button>
          </div>
        </div>
      </header>
      
      <main className="p-4">
        <div className="mb-4">
          <Button 
            onClick={() => setIsTreeOpen(!isTreeOpen)}
            variant="outline"
            size="sm"
          >
            {isTreeOpen ? "Hide Navigation" : "Show Navigation"}
          </Button>
        </div>
        
        <div className="flex">
          {isTreeOpen && (
            <div className="w-64 border-r pr-4 mr-6">
              <div className="sticky top-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">eCTD Structure</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={() => setIsTreeOpen(false)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
                
                {vaultLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span>Loading Vault documents...</span>
                  </div>
                ) : (
                  <div className="space-y-2 mb-4">
                    {/* Vault Documents Heading */}
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-slate-500">Vault DMS Documents</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={fetchVaultDocuments}
                        title="Refresh Documents"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
                          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                          <path d="M3 3v5h5"></path>
                          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                          <path d="M16 16h5v5"></path>
                        </svg>
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="space-y-1">
                  {/* Module 1 */}
                  <div 
                    className="border-l-4 border-blue-600 pl-2 py-1 font-medium flex items-center justify-between cursor-pointer"
                    onClick={() => setCTDExpandedSections(prev => ({...prev, module1: !prev.module1}))}
                  >
                    <div className="flex items-center">
                      <FolderTree className="h-4 w-4 mr-2 text-blue-600" />
                      <span>Module 1: Administrative</span>
                    </div>
                    <div className="flex items-center">
                      <Button 
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 mr-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          createCompiledDocument('module1');
                        }}
                        title="Compile Module"
                      >
                        <Archive className="h-3.5 w-3.5 text-slate-500" />
                      </Button>
                      {ctdExpandedSections.module1 ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                    </div>
                  </div>
                  {ctdExpandedSections.module1 && (
                    <div className="pl-4 space-y-1">
                      {/* If we have Vault documents for module1, display them */}
                      {vaultFolders.module1 && Object.keys(vaultFolders.module1).sort().map(section => (
                        <div key={section}>
                          {vaultFolders.module1[section].map(doc => (
                            <div 
                              key={doc.id}
                              className={`flex items-center text-sm py-1 hover:bg-slate-50 rounded px-2 cursor-pointer ${selectedDocument?.id === doc.id ? 'bg-slate-100' : ''}`}
                              onClick={() => loadVaultDocument(doc.id)}
                              title={`${doc.name} (Status: ${documentStatus[doc.id] || doc.status})`}
                            >
                              <FileText className={`h-4 w-4 mr-2 ${doc.name.endsWith('.pdf') ? 'text-red-400' : 'text-slate-400'}`} />
                              <span className="truncate flex-1">{section}: {doc.name}</span>
                              <Badge 
                                className={`ml-2 h-5 text-[10px] ${
                                  documentStatus[doc.id] === 'final' ? 'bg-green-100 text-green-700 border-green-200' : 
                                  documentStatus[doc.id] === 'draft' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                                  'bg-blue-100 text-blue-700 border-blue-200'
                                }`}
                              >
                                {documentStatus[doc.id] || doc.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ))}
                      
                      {/* If we don't have any Vault documents for this module, show default sections */}
                      {(!vaultFolders.module1 || Object.keys(vaultFolders.module1).length === 0) && (
                        <>
                          <div 
                            className="flex items-center text-sm py-1 hover:bg-slate-50 rounded px-2 cursor-pointer"
                            onClick={() => handleCTDSectionClick('module1', '1.1', 'Cover Letter')}
                          >
                            <FileText className="h-4 w-4 mr-2 text-slate-400" />
                            Section 1.1: Cover Letter
                            {selectedDocument?.section === '1.1' && (
                              <Badge className="ml-2 h-5 bg-blue-100 text-blue-700 border-blue-200 text-[10px]">Current</Badge>
                            )}
                          </div>
                          <div 
                            className="flex items-center text-sm py-1 hover:bg-slate-50 rounded px-2 cursor-pointer"
                            onClick={() => handleCTDSectionClick('module1', '1.2', 'Application Information')}
                          >
                            <FileText className="h-4 w-4 mr-2 text-slate-400" />
                            Section 1.2: Application Information
                            {selectedDocument?.section === '1.2' && (
                              <Badge className="ml-2 h-5 bg-blue-100 text-blue-700 border-blue-200 text-[10px]">Current</Badge>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  
                  {/* Module 2 */}
                  <div 
                    className="border-l-4 border-green-600 pl-2 py-1 font-medium flex items-center justify-between cursor-pointer"
                    onClick={() => setCTDExpandedSections(prev => ({...prev, module2: !prev.module2}))}
                  >
                    <div className="flex items-center">
                      <FolderTree className="h-4 w-4 mr-2 text-green-600" />
                      <span>Module 2: Common Technical Document</span>
                    </div>
                    <div className="flex items-center">
                      <Button 
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 mr-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          createCompiledDocument('module2');
                        }}
                        title="Compile Module"
                      >
                        <Archive className="h-3.5 w-3.5 text-slate-500" />
                      </Button>
                      {ctdExpandedSections.module2 ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                    </div>
                  </div>
                  {ctdExpandedSections.module2 && (
                    <div className="pl-4 space-y-1">
                      {/* If we have Vault documents for module2, display them */}
                      {vaultFolders.module2 && Object.keys(vaultFolders.module2).sort().map(section => (
                        <div key={section}>
                          {vaultFolders.module2[section].map(doc => (
                            <div 
                              key={doc.id}
                              className={`flex items-center text-sm py-1 hover:bg-slate-50 rounded px-2 cursor-pointer ${selectedDocument?.id === doc.id ? 'bg-slate-100' : ''}`}
                              onClick={() => loadVaultDocument(doc.id)}
                              title={`${doc.name} (Status: ${documentStatus[doc.id] || doc.status})`}
                            >
                              <FileText className={`h-4 w-4 mr-2 ${doc.name.endsWith('.pdf') ? 'text-red-400' : 'text-slate-400'}`} />
                              <span className="truncate flex-1">{section}: {doc.name}</span>
                              <Badge 
                                className={`ml-2 h-5 text-[10px] ${
                                  documentStatus[doc.id] === 'final' ? 'bg-green-100 text-green-700 border-green-200' : 
                                  documentStatus[doc.id] === 'draft' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                                  'bg-blue-100 text-blue-700 border-blue-200'
                                }`}
                              >
                                {documentStatus[doc.id] || doc.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ))}
                      
                      {/* If we don't have any Vault documents for this module, show default sections */}
                      {(!vaultFolders.module2 || Object.keys(vaultFolders.module2).length === 0) && (
                        <>
                          <div 
                            className="flex items-center text-sm py-1 hover:bg-slate-50 rounded px-2 cursor-pointer"
                            onClick={() => handleCTDSectionClick('module2', '2.5', 'Clinical Overview')}
                          >
                            <FileText className="h-4 w-4 mr-2 text-slate-400" />
                            <span>Section 2.5: Clinical Overview</span>
                            {selectedDocument?.section === '2.5' && (
                              <Badge className="ml-2 h-5 bg-blue-100 text-blue-700 border-blue-200 text-[10px]">Current</Badge>
                            )}
                          </div>
                          <div 
                            className="flex items-center text-sm py-1 hover:bg-slate-50 rounded px-2 cursor-pointer"
                            onClick={() => handleCTDSectionClick('module2', '2.4', 'Nonclinical Overview')}
                          >
                            <FileText className="h-4 w-4 mr-2 text-slate-400" />
                            <span>Section 2.4: Nonclinical Overview</span>
                            {selectedDocument?.section === '2.4' && (
                              <Badge className="ml-2 h-5 bg-blue-100 text-blue-700 border-blue-200 text-[10px]">Current</Badge>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  
                  {/* Module 3 */}
                  <div 
                    className="border-l-4 border-purple-600 pl-2 py-1 font-medium flex items-center justify-between cursor-pointer"
                    onClick={() => setCTDExpandedSections(prev => ({...prev, module3: !prev.module3}))}
                  >
                    <div className="flex items-center">
                      <FolderTree className="h-4 w-4 mr-2 text-purple-600" />
                      <span>Module 3: Quality</span>
                    </div>
                    <div className="flex items-center">
                      <Button 
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 mr-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          createCompiledDocument('module3');
                        }}
                        title="Compile Module"
                      >
                        <Archive className="h-3.5 w-3.5 text-slate-500" />
                      </Button>
                      {ctdExpandedSections.module3 ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                    </div>
                  </div>
                  
                  {ctdExpandedSections.module3 && (
                    <div className="pl-4 space-y-1">
                      {/* If we have Vault documents for module3, display them */}
                      {vaultFolders.module3 && Object.keys(vaultFolders.module3).sort().map(section => (
                        <div key={section}>
                          {vaultFolders.module3[section].map(doc => (
                            <div 
                              key={doc.id}
                              className={`flex items-center text-sm py-1 hover:bg-slate-50 rounded px-2 cursor-pointer ${selectedDocument?.id === doc.id ? 'bg-slate-100' : ''}`}
                              onClick={() => loadVaultDocument(doc.id)}
                              title={`${doc.name} (Status: ${documentStatus[doc.id] || doc.status})`}
                            >
                              <FileText className={`h-4 w-4 mr-2 ${doc.name.endsWith('.pdf') ? 'text-red-400' : 'text-slate-400'}`} />
                              <span className="truncate flex-1">{section}: {doc.name}</span>
                              <Badge 
                                className={`ml-2 h-5 text-[10px] ${
                                  documentStatus[doc.id] === 'final' ? 'bg-green-100 text-green-700 border-green-200' : 
                                  documentStatus[doc.id] === 'draft' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                                  'bg-blue-100 text-blue-700 border-blue-200'
                                }`}
                              >
                                {documentStatus[doc.id] || doc.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ))}
                      
                      {/* If we don't have any Vault documents for this module, show default sections */}
                      {(!vaultFolders.module3 || Object.keys(vaultFolders.module3).length === 0) && (
                        <>
                          <div 
                            className="flex items-center text-sm py-1 hover:bg-slate-50 rounded px-2 cursor-pointer"
                            onClick={() => handleCTDSectionClick('module3', '3.2.P', 'Drug Product')}
                          >
                            <FileText className="h-4 w-4 mr-2 text-slate-400" />
                            <span>Section 3.2.P: Drug Product</span>
                            {selectedDocument?.section === '3.2.P' && (
                              <Badge className="ml-2 h-5 bg-blue-100 text-blue-700 border-blue-200 text-[10px]">Current</Badge>
                            )}
                          </div>
                          <div 
                            className="flex items-center text-sm py-1 hover:bg-slate-50 rounded px-2 cursor-pointer"
                            onClick={() => handleCTDSectionClick('module3', '3.2.S', 'Drug Substance')}
                          >
                            <FileText className="h-4 w-4 mr-2 text-slate-400" />
                            <span>Section 3.2.S: Drug Substance</span>
                            {selectedDocument?.section === '3.2.S' && (
                              <Badge className="ml-2 h-5 bg-blue-100 text-blue-700 border-blue-200 text-[10px]">Current</Badge>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex-1">
            <Card className="p-4 mb-4">
              <Tabs defaultValue="editor" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="editor">Document Editor</TabsTrigger>
                  <TabsTrigger value="metadata">eCTD Metadata</TabsTrigger>
                  <TabsTrigger value="submission">Submission Package</TabsTrigger>
                </TabsList>
                
                <TabsContent value="editor">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <h3 className="text-sm font-medium">
                          {selectedDocument ? (
                            <span className="flex items-center">
                              {selectedDocument.title}
                              <Badge className="ml-2" variant={isDocumentLocked ? "outline" : "secondary"}>
                                {isDocumentLocked ? "Locked" : selectedDocument.status || "Draft"}
                              </Badge>
                              {selectedDocument.id && selectedDocument.id.startsWith('v') && (
                                <Badge className="ml-2 bg-blue-100 text-blue-700 border-blue-200">Vault</Badge>
                              )}
                            </span>
                          ) : "Document Editor"}
                        </h3>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {selectedDocument && selectedDocument.id && selectedDocument.id.startsWith('v') && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                if (isDocumentLocked) {
                                  unlockDocument(selectedDocument.id);
                                } else {
                                  lockDocument(selectedDocument.id);
                                }
                              }}
                            >
                              {isDocumentLocked ? (
                                <>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    <path d="M12 14v3"></path>
                                  </svg>
                                  Unlock
                                </>
                              ) : (
                                <>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    <path d="M12 14v3"></path>
                                  </svg>
                                  Lock
                                </>
                              )}
                            </Button>
                            
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newStatus = documentStatus[selectedDocument.id] === 'draft' ? 'final' : 'draft';
                                changeDocumentStatus(selectedDocument.id, newStatus);
                              }}
                            >
                              {documentStatus[selectedDocument.id] === 'final' ? 'Set Draft' : 'Set Final'}
                            </Button>
                          </>
                        )}
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            if (!documentContent) return;
                            
                            // Add XML annotations for eCTD compliance
                            const annotatedContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ectd:document SYSTEM "util/dtd/ectd-doc-2-0.dtd">
<ectd:document xmlns:ectd="http://www.ich.org/ectd" xmlns:xlink="http://www.w3c.org/1999/xlink">
  <ectd:properties>
    <ectd:document-id>${selectedDocument?.id || 'doc-' + Date.now()}</ectd:document-id>
    <ectd:document-type>${selectedDocument?.documentType || 'clinical-overview'}</ectd:document-type>
    <ectd:section>${selectedDocument?.section || '2.5'}</ectd:section>
    <ectd:title>${selectedDocument?.title || 'Clinical Overview'}</ectd:title>
    <ectd:checksum type="md5">00000000000000000000000000000000</ectd:checksum>
    <ectd:modified-date>${new Date().toISOString()}</ectd:modified-date>
  </ectd:properties>
  <ectd:content>
${documentContent}
  </ectd:content>
</ectd:document>`;
                            
                            setDocumentContent(annotatedContent);
                            
                            toast({
                              title: "XML Annotations Added",
                              description: "eCTD-compliant XML tags have been added to the document"
                            });
                          }}
                        >
                          Add XML Tags
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            if (!documentContent) return;
                            
                            // Strip XML annotations to view clean content
                            const cleanContent = documentContent
                              .replace(/(<\?xml.*?\?>|<!DOCTYPE.*?>|<ectd:document.*?>|<\/ectd:document>|<ectd:properties>.*?<\/ectd:properties>|<ectd:content>|<\/ectd:content>)/gs, '')
                              .trim();
                            
                            setDocumentContent(cleanContent);
                            
                            toast({
                              title: "XML Tags Removed",
                              description: "XML tags removed for easier editing"
                            });
                          }}
                        >
                          Remove XML Tags
                        </Button>
                      </div>
                    </div>
                    
                    {/* Document metadata from Vault */}
                    {selectedDocument && selectedDocument.id && selectedDocument.id.startsWith('v') && (
                      <div className="grid grid-cols-3 gap-3 mb-3 bg-slate-50 p-3 rounded-md text-sm">
                        <div>
                          <p className="font-medium text-slate-500">eCTD Section</p>
                          <p>{selectedDocument.section}</p>
                        </div>
                        <div>
                          <p className="font-medium text-slate-500">Status</p>
                          <p className="capitalize">{documentStatus[selectedDocument.id] || selectedDocument.status}</p>
                        </div>
                        <div>
                          <p className="font-medium text-slate-500">Module</p>
                          <p className="capitalize">{selectedDocument.moduleId}</p>
                        </div>
                      </div>
                    )}
                    
                    <textarea 
                      className="w-full h-64 p-4 border rounded-md font-mono text-sm"
                      value={documentContent || "Select a document to edit or create a new document"}
                      onChange={(e) => setDocumentContent(e.target.value)}
                      placeholder="Document content will appear here"
                      disabled={isDocumentLocked}
                    />
                    
                    <div className="bg-slate-50 p-3 rounded-md text-xs text-slate-600">
                      <p className="font-medium mb-1">eCTD XML Annotation Guidelines:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>XML annotations are required for proper eCTD document indexing</li>
                        <li>Document properties must match eCTD section metadata</li>
                        <li>Use the "Add XML Tags" button to apply compliant annotations</li>
                        <li>XML tags will be preserved when submitting to regulatory authorities</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="metadata">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Submission Type</label>
                        <select 
                          className="w-full p-2 border rounded-md"
                          value={submissionMetadata.submissionType}
                          onChange={(e) => setSubmissionMetadata({
                            ...submissionMetadata,
                            submissionType: e.target.value
                          })}
                        >
                          <option value="original">Original</option>
                          <option value="amendment">Amendment</option>
                          <option value="supplement">Supplement</option>
                          <option value="report">Report</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Sequence Number</label>
                        <input 
                          type="text"
                          className="w-full p-2 border rounded-md"
                          value={submissionMetadata.sequenceNumber}
                          onChange={(e) => setSubmissionMetadata({
                            ...submissionMetadata,
                            sequenceNumber: e.target.value
                          })}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Application Number</label>
                        <input 
                          type="text"
                          className="w-full p-2 border rounded-md"
                          value={submissionMetadata.applicationNumber}
                          onChange={(e) => setSubmissionMetadata({
                            ...submissionMetadata,
                            applicationNumber: e.target.value
                          })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Region</label>
                        <select 
                          className="w-full p-2 border rounded-md"
                          value={submissionMetadata.region}
                          onChange={(e) => setSubmissionMetadata({
                            ...submissionMetadata,
                            region: e.target.value
                          })}
                        >
                          <option value="FDA">FDA (US)</option>
                          <option value="EMA">EMA (EU)</option>
                          <option value="PMDA">PMDA (Japan)</option>
                          <option value="HC">Health Canada</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4 mt-4">
                      <h3 className="font-medium mb-2">Document Details</h3>
                      <div className="bg-gray-50 p-3 rounded-md text-sm">
                        <p><span className="font-medium">Document Type:</span> {selectedDocument?.documentType || 'Clinical Overview'}</p>
                        <p><span className="font-medium">Section:</span> {selectedDocument?.section || '2.5'}</p>
                        <p><span className="font-medium">Module:</span> {selectedDocument?.moduleId || 'module2'}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="submission">
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-700">
                      <div className="flex items-start">
                        <FolderTree className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">eCTD Submission Structure</p>
                          <p className="mt-1">Your submission will be packaged according to ICH eCTD specifications with XML backbone and proper folder hierarchy.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={exportEctdSubmission}
                        disabled={exportInProgress || validationResults.status !== 'complete'}
                      >
                        {exportInProgress ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Archive className="h-4 w-4 mr-2" />
                        )}
                        {exportInProgress ? 'Preparing Package...' : 'Create eCTD Package'}
                      </Button>
                      
                      <Button 
                        variant="outline"
                        className="bg-green-50"
                        disabled={exportInProgress || validationResults.status !== 'complete' || pdfGenerating}
                        onClick={generatePdfPreview}
                      >
                        {pdfGenerating ? (
                          <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                        ) : (
                          <FileText className="h-4 w-4 text-green-600" />
                        )}
                      </Button>
                      
                      <Button 
                        variant="outline"
                        disabled={exportInProgress || validationResults.status !== 'complete'}
                        onClick={() => {
                          toast({
                            title: "XML Backbone Copied",
                            description: "eCTD backbone XML copied to clipboard"
                          });
                        }}
                      >
                        <Clipboard className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {validationResults.status !== 'complete' && (
                      <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-700 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                        Document validation required before export
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
            
            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">eCTD Validation</h2>
                <Button 
                  size="sm" 
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => validateEctdDocument(true)}
                  disabled={validationInProgress}
                >
                  {validationInProgress ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileCheck className="h-4 w-4 mr-2" />
                  )}
                  {validationInProgress ? 'Validating...' : 'Validate Document'}
                </Button>
              </div>
              
              {validationResults.status === 'complete' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-lg">Compliance Score: {validationResults.complianceScore}%</p>
                      <p className="text-sm text-gray-500">Regulatory Status: {validationResults.regulatoryStatus}</p>
                    </div>
                    <Badge 
                      className={`px-2 py-1 ${
                        validationResults.complianceScore >= 80 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : validationResults.complianceScore >= 60
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-red-100 text-red-800 border-red-200'
                      }`}
                    >
                      {validationResults.complianceScore >= 80 
                        ? 'eCTD Compliant' 
                        : validationResults.complianceScore >= 60
                          ? 'Review Required'
                          : 'Non-Compliant'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-slate-50 p-3 rounded-md text-center">
                      <p className="text-sm text-slate-500">Document Structure</p>
                      <p className="font-medium text-lg">{validationResults.complianceScore >= 75 ? 'Valid' : 'Invalid'}</p>
                      {validationResults.complianceScore >= 75 ? (
                        <CheckCircle2 className="h-5 w-5 mx-auto mt-1 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 mx-auto mt-1 text-amber-500" />
                      )}
                    </div>
                    
                    <div className="bg-slate-50 p-3 rounded-md text-center">
                      <p className="text-sm text-slate-500">eCTD Format</p>
                      <p className="font-medium text-lg">{validationResults.complianceScore >= 60 ? 'Valid' : 'Invalid'}</p>
                      {validationResults.complianceScore >= 60 ? (
                        <CheckCircle2 className="h-5 w-5 mx-auto mt-1 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 mx-auto mt-1 text-amber-500" />
                      )}
                    </div>
                    
                    <div className="bg-slate-50 p-3 rounded-md text-center">
                      <p className="text-sm text-slate-500">Readiness</p>
                      <p className="font-medium text-lg">{validationResults.complianceScore >= 80 ? 'Ready' : 'Not Ready'}</p>
                      {validationResults.complianceScore >= 80 ? (
                        <CheckCircle2 className="h-5 w-5 mx-auto mt-1 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 mx-auto mt-1 text-amber-500" />
                      )}
                    </div>
                  </div>
                  
                  <Tabs defaultValue="issues" className="w-full">
                    <TabsList>
                      <TabsTrigger value="issues">Issues ({validationResults.issues.length})</TabsTrigger>
                      <TabsTrigger value="passing">Passing Checks ({validationResults.passingChecks.length})</TabsTrigger>
                      <TabsTrigger value="ectd">eCTD Requirements</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="issues">
                      <ul className="space-y-2 mt-2">
                        {validationResults.issues.map((issue, index) => (
                          <li key={index} className="text-sm p-2 bg-red-50 border border-red-100 rounded flex items-start">
                            <AlertTriangle className="h-4 w-4 mr-2 text-red-500 mt-0.5 flex-shrink-0" />
                            <span>{issue.message || issue}</span>
                          </li>
                        ))}
                        {validationResults.issues.length === 0 && (
                          <li className="text-sm p-2 bg-green-50 border border-green-100 rounded flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                            No issues found - Document is compliant with eCTD requirements
                          </li>
                        )}
                      </ul>
                    </TabsContent>
                    
                    <TabsContent value="passing">
                      <ul className="space-y-2 mt-2">
                        {validationResults.passingChecks.map((check, index) => (
                          <li key={index} className="text-sm p-2 bg-green-50 border border-green-100 rounded flex items-start">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{check.message || check}</span>
                          </li>
                        ))}
                        {validationResults.passingChecks.length === 0 && (
                          <li className="text-sm p-2 bg-amber-50 border border-amber-100 rounded">
                            No passing checks found
                          </li>
                        )}
                      </ul>
                    </TabsContent>
                    
                    <TabsContent value="ectd">
                      <div className="bg-blue-50 border border-blue-100 rounded-md p-3 text-sm text-blue-700 mb-3">
                        <p className="font-medium mb-1">eCTD Submission Requirements</p>
                        <p>Documents must conform to ICH eCTD Module structure and formatting requirements</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-2 border rounded-md">
                          <p className="font-medium text-sm">Structure</p>
                          <ul className="text-xs mt-1 space-y-1">
                            <li className="flex items-center">
                              <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                              Proper module organization
                            </li>
                            <li className="flex items-center">
                              <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                              Valid section numbering
                            </li>
                            <li className="flex items-center">
                              <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                              Correct leaf element references
                            </li>
                          </ul>
                        </div>
                        
                        <div className="p-2 border rounded-md">
                          <p className="font-medium text-sm">Content</p>
                          <ul className="text-xs mt-1 space-y-1">
                            <li className="flex items-center">
                              <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                              Required headings present
                            </li>
                            <li className="flex items-center">
                              <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                              PDF format compliance
                            </li>
                            <li className="flex items-center">
                              <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                              Valid metadata attributes
                            </li>
                          </ul>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
      
      {/* Version History Modal */}
      {showVersionHistory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-medium text-lg">
                Document Version History
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowVersionHistory(false)}
                className="rounded-full h-8 w-8 p-0"
              >
                <span className="sr-only">Close</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </Button>
            </div>
            
            <div className="flex-1 overflow-auto p-4">
              {documentVersions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No document versions saved yet.</p>
                  <p className="text-sm mt-2">Save a version to track changes and submission history.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 mb-4">Select a version to load or view details</p>
                  
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left p-3 font-medium">Version</th>
                          <th className="text-left p-3 font-medium">Date & Time</th>
                          <th className="text-left p-3 font-medium">Section</th>
                          <th className="text-left p-3 font-medium">Status</th>
                          <th className="text-left p-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {documentVersions.map((version, index) => (
                          <tr key={version.id} className={index === 0 ? "bg-blue-50" : undefined}>
                            <td className="p-3">
                              {index === 0 ? (
                                <span className="font-medium flex items-center">
                                  Latest Version
                                  {version.submissionReady && (
                                    <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">
                                      Submission Ready
                                    </Badge>
                                  )}
                                </span>
                              ) : (
                                `Version ${documentVersions.length - index}`
                              )}
                            </td>
                            <td className="p-3">{new Date(version.timestamp).toLocaleString()}</td>
                            <td className="p-3">{version.moduleId} - {version.section}</td>
                            <td className="p-3">
                              <Badge 
                                className={
                                  version.validationStatus === 'Compliant' 
                                    ? 'bg-green-100 text-green-800 border-green-200'
                                    : version.validationStatus === 'Non-Compliant'
                                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                                    : 'bg-slate-100 text-slate-800 border-slate-200'
                                }
                              >
                                {version.validationStatus}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => loadDocumentVersion(version.id)}
                              >
                                Load
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowVersionHistory(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* PDF Preview Modal */}
      {showPdfPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-medium text-lg">
                eCTD Document Preview - {selectedDocument?.title || 'Document'}
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowPdfPreview(false)}
                className="rounded-full h-8 w-8 p-0"
              >
                <span className="sr-only">Close</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </Button>
            </div>
            
            <div className="flex-1 overflow-auto p-4 border-b">
              <div className="bg-slate-50 p-4 border rounded mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Document Information</p>
                    <p><span className="text-slate-500">Title:</span> {selectedDocument?.title || 'Clinical Overview'}</p>
                    <p><span className="text-slate-500">Type:</span> {selectedDocument?.documentType || 'Clinical Overview'}</p>
                    <p><span className="text-slate-500">Section:</span> {selectedDocument?.section || '2.5'}</p>
                  </div>
                  <div>
                    <p className="font-medium">Submission Information</p>
                    <p><span className="text-slate-500">Type:</span> {submissionMetadata.submissionType}</p>
                    <p><span className="text-slate-500">Sequence:</span> {submissionMetadata.sequenceNumber}</p>
                    <p><span className="text-slate-500">Application:</span> {submissionMetadata.applicationNumber}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border rounded min-h-[400px] flex flex-col items-center justify-center p-8">
                <div className="max-w-md mx-auto text-center space-y-4">
                  <FileText className="h-12 w-12 mx-auto text-blue-500 mb-2" />
                  <h3 className="text-lg font-bold">Document Preview</h3>
                  <p className="text-slate-500">This is a simulated preview of how your document will appear in the eCTD submission.</p>
                  
                  <div className="border-t border-b py-4 my-4">
                    <div className="text-left font-serif px-8">
                      <h1 className="text-xl font-bold mb-4">{selectedDocument?.title || 'Clinical Overview'}</h1>
                      <p className="mb-4">{documentContent ? documentContent.substring(0, 300) : 'Document content will appear here based on your edits.'}</p>
                      <p className="mb-4">{documentContent && documentContent.length > 300 ? '...' : ''}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPdfPreview(false)}>
                Close
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  toast({
                    title: "PDF Downloaded",
                    description: "Document has been downloaded to your device"
                  });
                  setShowPdfPreview(false);
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}