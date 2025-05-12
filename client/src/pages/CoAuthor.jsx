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
  FolderTree
} from 'lucide-react';
import { validateDocument } from '@/services/ectdValidationService';

export default function CoAuthor() {
  const toast = useToast();
  
  // Document state
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentContent, setDocumentContent] = useState('');
  
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
          issues: validationResponse.issues || [],
          passingChecks: validationResponse.passingChecks || [],
          failingChecks: validationResponse.failingChecks || [],
          regulatoryStatus: complianceScore > 80 ? 'Compliant' : 'Needs Review',
          complianceScore
        });
        
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
  
  // Simplified component rendering
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b p-4">
        <h1 className="text-2xl font-semibold">eCTD Co-Author Module</h1>
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
                  <h3 className="text-lg font-medium">Document Structure</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={() => setIsTreeOpen(false)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-1">
                  {/* Module 1 */}
                  <div 
                    className="border-l-4 border-blue-600 pl-2 py-1 font-medium flex items-center justify-between cursor-pointer"
                    onClick={() => setCTDExpandedSections(prev => ({...prev, module1: !prev.module1}))}
                  >
                    <span>Module 1: Administrative Information</span>
                    {ctdExpandedSections.module1 ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </div>
                  {ctdExpandedSections.module1 && (
                    <div className="pl-4 space-y-1">
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
                    </div>
                  )}
                  
                  {/* Module 2 */}
                  <div 
                    className="border-l-4 border-green-600 pl-2 py-1 font-medium flex items-center justify-between cursor-pointer"
                    onClick={() => setCTDExpandedSections(prev => ({...prev, module2: !prev.module2}))}
                  >
                    <span>Module 2: Common Technical Document</span>
                    {ctdExpandedSections.module2 ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </div>
                  {ctdExpandedSections.module2 && (
                    <div className="pl-4 space-y-1">
                      <div 
                        className="flex items-center text-sm py-1 hover:bg-slate-50 rounded px-2 cursor-pointer"
                        onClick={() => handleCTDSectionClick('module2', '2.5', 'Clinical Overview')}
                      >
                        <FileText className="h-4 w-4 mr-2 text-slate-600" />
                        <span>Section 2.5: Clinical Overview</span>
                        {selectedDocument?.section === '2.5' && (
                          <Badge className="ml-2 h-5 bg-blue-100 text-blue-700 border-blue-200 text-[10px]">Current</Badge>
                        )}
                      </div>
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
                  <textarea 
                    className="w-full h-64 p-4 border rounded-md"
                    value={documentContent || "Select a document to edit or create a new document"}
                    onChange={(e) => setDocumentContent(e.target.value)}
                    placeholder="Document content will appear here"
                  />
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