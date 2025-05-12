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
    
    // Simulate connecting to Vault DMS to load documents
    console.log("Fetching documents from Vault DMS...");
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
  
  // Render the UI
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
                      value={documentContent}
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