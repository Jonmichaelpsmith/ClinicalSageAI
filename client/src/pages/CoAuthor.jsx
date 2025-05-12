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
  Clock 
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
              <h2 className="text-lg font-medium mb-4">Document Editor</h2>
              <textarea 
                className="w-full h-64 p-4 border rounded-md"
                value={documentContent || "Select a document to edit or create a new document"}
                onChange={(e) => setDocumentContent(e.target.value)}
                placeholder="Document content will appear here"
              />
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
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}
                    >
                      {validationResults.complianceScore >= 80 ? 'Compliant' : 'Issues Found'}
                    </Badge>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Issues ({validationResults.issues.length})</h3>
                    <ul className="space-y-2">
                      {validationResults.issues.map((issue, index) => (
                        <li key={index} className="text-sm p-2 bg-red-50 border border-red-100 rounded">
                          {issue.message || issue}
                        </li>
                      ))}
                      {validationResults.issues.length === 0 && (
                        <li className="text-sm p-2 bg-green-50 border border-green-100 rounded">
                          No issues found
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}