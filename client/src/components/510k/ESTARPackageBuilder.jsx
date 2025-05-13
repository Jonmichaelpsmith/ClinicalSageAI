import React, { useState, useEffect } from 'react';
import { FileCheck, Upload, ArrowRight, FileX, FileText, AlertTriangle, HelpCircle } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import PackagePreview from './PackagePreview';

/**
 * eSTAR Package Builder Component
 * 
 * This component allows users to assemble, validate, and generate eSTAR packages
 * for FDA 510(k) submissions. It provides a guided workflow from document assembly
 * through validation and final submission.
 */
const ESTARPackageBuilder = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState('assembly');
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  
  // State for document assembly
  const [documents, setDocuments] = useState([]);
  const [packageData, setPackageData] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  
  // Query to fetch project documents
  const { data: projectDocuments, isLoading: isLoadingDocuments } = useQuery({
    queryKey: ['/api/510k/project-documents', projectId],
    enabled: !!projectId,
  });
  
  // Query to fetch project details
  const { data: projectDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['/api/510k/project-details', projectId],
    enabled: !!projectId,
  });
  
  // Mutation to validate package
  const validateMutation = useMutation({
    mutationFn: async (packageData) => {
      // In a real implementation, this would call an API endpoint
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            valid: true,
            issues: [
              { 
                severity: 'warning', 
                message: 'Substantial equivalence statement could be more detailed', 
                section: 'Section 12.3' 
              },
              { 
                severity: 'info', 
                message: 'Consider adding more comparative data to strengthen your claim', 
                section: 'Section 12.4' 
              }
            ]
          });
        }, 2000);
      });
    },
    onSuccess: (data) => {
      setValidationResults(data);
      setProgress(75);
      toast({
        title: 'Validation Complete',
        description: data.valid 
          ? 'Your eSTAR package has been validated successfully with minor suggestions.'
          : 'Your eSTAR package has validation issues that need to be addressed.',
      });
    }
  });
  
  // Mutation to build package
  const buildMutation = useMutation({
    mutationFn: async (data) => {
      // In a real implementation, this would call an API endpoint
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            packageId: 'estar-pkg-' + Math.random().toString(36).substring(2, 10),
            fileName: 'eSTAR_Package_' + new Date().toISOString().split('T')[0] + '.xml',
            size: '24.3 MB',
            sections: 15,
            documents: 23,
            downloadUrl: '#'
          });
        }, 3000);
      });
    },
    onSuccess: (data) => {
      setPackageData(data);
      setProgress(100);
      toast({
        title: 'Package Generation Complete',
        description: `Your eSTAR package "${data.fileName}" is ready for download.`,
      });
      setActiveTab('preview');
    }
  });
  
  // Effect to initialize documents when projectDocuments loads
  useEffect(() => {
    if (projectDocuments) {
      // In a real implementation, filter documents based on requirements
      setDocuments(projectDocuments);
      setProgress(25); // Initial progress
    }
  }, [projectDocuments]);
  
  // Handler to advance to validation
  const handleAdvanceToValidation = () => {
    setActiveTab('validation');
    setProgress(50);
  };
  
  // Handler to validate package
  const handleValidatePackage = () => {
    validateMutation.mutate({ 
      projectId, 
      documents: documents.filter(doc => doc.selected).map(doc => doc.id)
    });
  };
  
  // Handler to build package
  const handleBuildPackage = () => {
    buildMutation.mutate({ 
      projectId, 
      documents: documents.filter(doc => doc.selected).map(doc => doc.id)
    });
  };
  
  // Handler to toggle document selection
  const handleToggleDocument = (id) => {
    setDocuments(prevDocs => 
      prevDocs.map(doc => 
        doc.id === id ? { ...doc, selected: !doc.selected } : doc
      )
    );
  };
  
  // Mock documents if none provided
  useEffect(() => {
    if (!isLoadingDocuments && !projectDocuments) {
      // Demo documents
      setDocuments([
        { id: 'doc1', name: 'Device Description', type: 'PDF', size: '2.3 MB', required: true, selected: true },
        { id: 'doc2', name: 'Substantial Equivalence Statement', type: 'DOCX', size: '1.1 MB', required: true, selected: true },
        { id: 'doc3', name: 'Performance Testing Data', type: 'PDF', size: '4.7 MB', required: true, selected: true },
        { id: 'doc4', name: 'Software Documentation', type: 'PDF', size: '3.2 MB', required: false, selected: false },
        { id: 'doc5', name: 'Biocompatibility Reports', type: 'PDF', size: '5.6 MB', required: true, selected: true },
        { id: 'doc6', name: 'Sterilization Validation', type: 'PDF', size: '2.8 MB', required: true, selected: true },
        { id: 'doc7', name: 'Shelf Life Studies', type: 'XLSX', size: '1.4 MB', required: false, selected: true },
        { id: 'doc8', name: 'Electrical Safety Testing', type: 'PDF', size: '3.7 MB', required: true, selected: true }
      ]);
      setProgress(25);
    }
  }, [isLoadingDocuments, projectDocuments]);
  
  return (
    <div className="space-y-8">
      {/* Progress Indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Progress</span>
          <span>{progress}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      {/* Main Builder Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="assembly">Document Assembly</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="preview">Package Preview</TabsTrigger>
        </TabsList>
        
        {/* Document Assembly Tab */}
        <TabsContent value="assembly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Required Documents</CardTitle>
              <CardDescription>
                Select all required documents for your eSTAR package submission.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingDocuments ? (
                <div className="flex items-center justify-center p-6">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {documents
                    .filter(doc => doc.required)
                    .map(doc => (
                      <div key={doc.id} className="flex items-center p-3 border rounded-md bg-muted/50">
                        <input
                          type="checkbox"
                          id={`doc-${doc.id}`}
                          checked={doc.selected}
                          onChange={() => handleToggleDocument(doc.id)}
                          className="h-4 w-4 mr-3"
                        />
                        <label htmlFor={`doc-${doc.id}`} className="flex-1 cursor-pointer">
                          <div className="font-medium">{doc.name}</div>
                          <div className="text-sm text-muted-foreground">{doc.type} · {doc.size}</div>
                        </label>
                        {doc.required && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Required</span>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
            <CardHeader className="pt-6 pb-0">
              <CardTitle>Optional Supporting Documents</CardTitle>
              <CardDescription>
                Select any additional documents you'd like to include in your eSTAR package.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingDocuments ? (
                <div className="flex items-center justify-center p-6">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {documents
                    .filter(doc => !doc.required)
                    .map(doc => (
                      <div key={doc.id} className="flex items-center p-3 border rounded-md">
                        <input
                          type="checkbox"
                          id={`doc-${doc.id}`}
                          checked={doc.selected}
                          onChange={() => handleToggleDocument(doc.id)}
                          className="h-4 w-4 mr-3"
                        />
                        <label htmlFor={`doc-${doc.id}`} className="flex-1 cursor-pointer">
                          <div className="font-medium">{doc.name}</div>
                          <div className="text-sm text-muted-foreground">{doc.type} · {doc.size}</div>
                        </label>
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Optional</span>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => document.getElementById('file-upload').click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Additional Documents
                <input id="file-upload" type="file" multiple className="hidden" />
              </Button>
              <Button onClick={handleAdvanceToValidation}>
                Continue to Validation
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Validation Tab */}
        <TabsContent value="validation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>eSTAR Package Validation</CardTitle>
              <CardDescription>
                Validate your eSTAR package to ensure it meets FDA requirements before submission.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {validateMutation.isPending ? (
                <div className="flex flex-col items-center justify-center p-8 space-y-4">
                  <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                  <p className="text-center text-muted-foreground">
                    Validating your package against FDA eSTAR requirements...
                  </p>
                </div>
              ) : validationResults ? (
                <div className="space-y-6">
                  <Alert variant={validationResults.valid ? "default" : "destructive"}>
                    <FileCheck className="h-4 w-4" />
                    <AlertTitle>Validation {validationResults.valid ? "Successful" : "Failed"}</AlertTitle>
                    <AlertDescription>
                      {validationResults.valid
                        ? "Your eSTAR package meets the essential FDA requirements for submission."
                        : "Your eSTAR package has critical issues that must be resolved before submission."}
                    </AlertDescription>
                  </Alert>
                  
                  {validationResults.issues.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Validation Issues</h3>
                      {validationResults.issues.map((issue, index) => (
                        <Alert key={index} variant={issue.severity === "warning" ? "warning" : "default"}>
                          {issue.severity === "warning" ? (
                            <AlertTriangle className="h-4 w-4" />
                          ) : (
                            <HelpCircle className="h-4 w-4" />
                          )}
                          <AlertTitle className="flex items-center gap-2">
                            {issue.section}
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              issue.severity === "warning" 
                                ? "bg-yellow-100 text-yellow-800" 
                                : "bg-blue-100 text-blue-800"
                            }`}>
                              {issue.severity === "warning" ? "Warning" : "Suggestion"}
                            </span>
                          </AlertTitle>
                          <AlertDescription>{issue.message}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 space-y-4 border-2 border-dashed rounded-md">
                  <FileCheck className="h-12 w-12 text-muted-foreground" />
                  <div className="text-center">
                    <h3 className="font-medium">Ready to Validate</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Click the button below to validate your eSTAR package against FDA requirements.
                    </p>
                  </div>
                  <Button onClick={handleValidatePackage}>
                    Validate Package
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-end">
              {validationResults && (
                <Button 
                  onClick={handleBuildPackage}
                  disabled={buildMutation.isPending || !validationResults.valid}
                >
                  Build eSTAR Package
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Package Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>eSTAR Package Preview</CardTitle>
              <CardDescription>
                Preview and download your validated eSTAR package.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {buildMutation.isPending ? (
                <div className="flex flex-col items-center justify-center p-8 space-y-4">
                  <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                  <p className="text-center text-muted-foreground">
                    Building your eSTAR package...
                  </p>
                </div>
              ) : packageData ? (
                <div className="space-y-6">
                  <div className="flex items-center p-4 border rounded-md bg-muted/30">
                    <FileText className="h-8 w-8 mr-4 text-blue-600" />
                    <div className="flex-1">
                      <h3 className="font-medium">{packageData.fileName}</h3>
                      <div className="text-sm text-muted-foreground">
                        {packageData.size} · {packageData.sections} sections · {packageData.documents} documents
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => window.open(packageData.downloadUrl)}>
                      Download
                    </Button>
                  </div>
                  
                  {/* Package preview component */}
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-muted p-3 font-medium">Package Preview</div>
                    <div className="p-4">
                      <PackagePreview packageId={packageData.packageId} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 space-y-4 border-2 border-dashed rounded-md">
                  <FileX className="h-12 w-12 text-muted-foreground" />
                  <div className="text-center">
                    <h3 className="font-medium">No Package Generated</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      First validate your documents and then build an eSTAR package to preview it here.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
            {packageData && (
              <CardFooter className="justify-between">
                <Button variant="outline" onClick={() => window.open('https://www.fda.gov/industry/electronic-submissions-gateway')}>
                  Go to FDA ESG Portal
                </Button>
                <Button variant="secondary" onClick={() => window.open(packageData.downloadUrl)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Download Package
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// FAQ Component as a static property
ESTARPackageBuilder.FAQ = () => (
  <Card className="mt-8">
    <CardHeader>
      <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
    </CardHeader>
    <CardContent>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>What is an eSTAR package?</AccordionTrigger>
          <AccordionContent>
            An eSTAR (electronic Submission Template And Resource) package is the FDA's standardized format for 510(k) submissions. 
            It provides a structured template for medical device manufacturers to submit their applications in a consistent format, 
            which streamlines the review process and helps ensure all required information is included.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>What documents are required for an eSTAR package?</AccordionTrigger>
          <AccordionContent>
            Required documents typically include: Device Description, Indications for Use, Substantial Equivalence Discussion, 
            Performance Testing Data, Biocompatibility Reports (if applicable), Software Documentation (if applicable), 
            Sterilization Validation (if applicable), and Electrical Safety Testing (if applicable). The exact requirements 
            vary based on your specific device type and classification.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>How do I submit my eSTAR package to the FDA?</AccordionTrigger>
          <AccordionContent>
            Once your eSTAR package is validated and generated, you'll submit it through the FDA's Electronic Submissions Gateway (ESG). 
            You'll need an ESG account and digital certificate for submission. Our system helps prepare your package in the correct 
            format, but the actual submission must be done through the FDA's official portal.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4">
          <AccordionTrigger>What are common reasons for eSTAR submission rejections?</AccordionTrigger>
          <AccordionContent>
            Common rejection reasons include: incomplete information in required sections, inadequate substantial equivalence 
            justification, inconsistent information across different sections, missing or inadequate performance testing data, 
            and technical issues with the eSTAR format itself. Our validation system helps catch these issues before submission.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-5">
          <AccordionTrigger>How long does the FDA review process take for eSTAR submissions?</AccordionTrigger>
          <AccordionContent>
            The FDA aims to review eSTAR 510(k) submissions within 90 days, but the actual time can vary based on the complexity 
            of your device and the completeness of your submission. Using the eSTAR format typically results in faster reviews 
            compared to traditional paper submissions, with some submissions completed in as little as 30-60 days.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </CardContent>
  </Card>
);

export default ESTARPackageBuilder;