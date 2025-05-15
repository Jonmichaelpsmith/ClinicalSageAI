/**
 * eSTAR Assembly Component
 * 
 * This component provides tools to assemble a complete FDA eSTAR submission
 * including document assembly, verification, and generation of the final 
 * submission package.
 */

import React, { useState, useEffect } from 'react';
import { 
  FaFileAlt, 
  FaCheck, 
  FaFileDownload, 
  FaPaperPlane, 
  FaTimesCircle, 
  FaSpinner, 
  FaCogs,
  FaLightbulb, 
  FaListAlt,
  FaFileSignature,
  FaCloudUploadAlt
} from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Mock data for demonstration purposes
const mockSections = [
  { id: 'administrative', name: 'Administrative Information', complete: true, requiredDocs: 4, completedDocs: 4 },
  { id: 'device_info', name: 'Device Information', complete: true, requiredDocs: 3, completedDocs: 3 },
  { id: 'predicate', name: 'Predicate Device', complete: true, requiredDocs: 2, completedDocs: 2 },
  { id: 'classification', name: 'Classification', complete: true, requiredDocs: 1, completedDocs: 1 },
  { id: 'substantial_equivalence', name: 'Substantial Equivalence', complete: true, requiredDocs: 5, completedDocs: 5 },
  { id: 'performance_testing', name: 'Performance Testing', complete: false, requiredDocs: 7, completedDocs: 6 },
  { id: 'sterilization', name: 'Sterilization', complete: false, requiredDocs: 3, completedDocs: 2 },
  { id: 'labeling', name: 'Labeling Information', complete: false, requiredDocs: 4, completedDocs: 3 },
  { id: 'declarations', name: 'Declarations', complete: false, requiredDocs: 2, completedDocs: 1 }
];

const DocumentStatus = ({ status }) => {
  switch (status) {
    case 'complete':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><FaCheck className="mr-1" size={10} /> Complete</Badge>;
    case 'missing':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><FaTimesCircle className="mr-1" size={10} /> Missing</Badge>;
    case 'pending':
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200"><FaSpinner className="mr-1" size={10} /> Pending</Badge>;
    default:
      return null;
  }
};

const eSTARAssembly = ({ 
  projectId,
  isWorkflowEnabled = false,
  onComplete = () => {},
  workflowData = {}
}) => {
  const [assemblyStatus, setAssemblyStatus] = useState('idle'); // idle, assembling, completed, failed
  const [sections, setSections] = useState(mockSections);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('documents');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [generatedPackageUrl, setGeneratedPackageUrl] = useState(null);
  const { toast } = useToast();

  // Calculate completion percentage
  useEffect(() => {
    if (sections) {
      const totalDocs = sections.reduce((acc, section) => acc + section.requiredDocs, 0);
      const completedDocs = sections.reduce((acc, section) => acc + section.completedDocs, 0);
      const percentage = Math.round((completedDocs / totalDocs) * 100);
      setProgress(percentage);
    }
  }, [sections]);

  // Assemble the eSTAR package
  const handleAssemble = () => {
    setAssemblyStatus('assembling');
    
    // Simulate assembly process
    let count = 0;
    const interval = setInterval(() => {
      count += 1;
      if (count === 3) {
        clearInterval(interval);
        setAssemblyStatus('completed');
        setGeneratedPackageUrl('https://example.com/estar-package.zip');
        toast({
          title: "eSTAR Package Generated",
          description: "Your 510(k) submission package has been successfully assembled",
        });
      }
    }, 1000);
  };

  // Validate the eSTAR package
  const handleValidate = () => {
    setIsValidating(true);
    
    // Simulate validation process
    setTimeout(() => {
      setIsValidating(false);
      setValidationResults({
        passed: true,
        issues: [
          { 
            severity: 'info', 
            message: 'Package is valid for FDA submission',
            section: 'Overall'
          }
        ]
      });
      
      toast({
        title: "Validation Complete",
        description: "Your 510(k) submission package has passed validation",
      });
    }, 2000);
  };

  // Submit to FDA
  const handleSubmit = () => {
    toast({
      title: "Submission Initiated",
      description: "Your 510(k) submission is being prepared for FDA submission. You'll receive confirmation once complete.",
      duration: 5000,
    });
    
    // In a workflow context, call the completion handler
    if (isWorkflowEnabled) {
      setTimeout(() => {
        onComplete({
          submissionDate: new Date().toISOString(),
          packageId: 'FDA-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
          sections: sections
        });
      }, 1500);
    }
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center">
          <FaFileAlt className="mr-2 text-blue-600" />
          eSTAR Assembly & Submission
        </CardTitle>
        <CardDescription>
          Finalize your 510(k) submission by assembling an FDA-compliant eSTAR package
        </CardDescription>
        
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Assembly Progress</span>
            <span>{progress}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent className="pb-0">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="documents">Required Documents</TabsTrigger>
            <TabsTrigger value="package">Package Assembly</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
          </TabsList>
          
          <TabsContent value="documents" className="p-0">
            <Accordion type="multiple" className="w-full">
              {sections.map((section) => (
                <AccordionItem key={section.id} value={section.id}>
                  <AccordionTrigger className="py-4">
                    <div className="flex justify-between w-full pr-4">
                      <span>{section.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {section.complete ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <FaCheck className="mr-1" size={10} /> Complete
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            {section.completedDocs}/{section.requiredDocs} Documents
                          </Badge>
                        )}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-2">
                    <ul className="space-y-3">
                      {Array.from({ length: section.requiredDocs }).map((_, idx) => {
                        const isComplete = idx < section.completedDocs;
                        return (
                          <li key={idx} className="flex items-center justify-between p-2 border rounded">
                            <span className="flex items-center">
                              <FaFileAlt className="mr-2 text-gray-600" />
                              Document {idx + 1} {idx === 0 ? `(${section.name} Overview)` : ''}
                            </span>
                            <DocumentStatus status={isComplete ? 'complete' : 'missing'} />
                          </li>
                        );
                      })}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
          
          <TabsContent value="package">
            <div className="flex flex-col space-y-4">
              <Alert className="mb-4">
                <FaLightbulb className="h-4 w-4" />
                <AlertTitle>About eSTAR Assembly</AlertTitle>
                <AlertDescription>
                  The eSTAR (electronic Submission Template And Resource) is FDA's new digital submission format.
                  Use this tool to assemble all your documents into a compliant package ready for submission.
                </AlertDescription>
              </Alert>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 p-4 border rounded-md">
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <FaCogs className="mr-2 text-blue-600" /> 
                    Assembly Options
                  </h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center">
                      <FaCheck className="text-green-600 mr-2" /> Automatic document organization
                    </li>
                    <li className="flex items-center">
                      <FaCheck className="text-green-600 mr-2" /> FDA-compliant folder structure
                    </li>
                    <li className="flex items-center">
                      <FaCheck className="text-green-600 mr-2" /> Document consistency verification
                    </li>
                    <li className="flex items-center">
                      <FaCheck className="text-green-600 mr-2" /> Auto-generated table of contents
                    </li>
                  </ul>
                </div>
                
                <div className="flex-1 p-4 border rounded-md">
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <FaListAlt className="mr-2 text-blue-600" /> 
                    Assembly Steps
                  </h3>
                  <ol className="space-y-3 text-sm list-decimal pl-5">
                    <li>Verify all required documents are present</li>
                    <li>Click "Assemble eSTAR Package" to generate submission</li>
                    <li>Review and validate the assembled package</li>
                    <li>Download package or submit directly to FDA</li>
                  </ol>
                </div>
              </div>
              
              <div className="mt-4 flex justify-center">
                {assemblyStatus === 'idle' && (
                  <Button 
                    size="lg" 
                    onClick={handleAssemble}
                    disabled={progress < 80}
                    className="w-full md:w-auto"
                  >
                    <FaFileSignature className="mr-2" />
                    Assemble eSTAR Package
                  </Button>
                )}
                
                {assemblyStatus === 'assembling' && (
                  <Button disabled className="w-full md:w-auto">
                    <FaSpinner className="mr-2 animate-spin" />
                    Assembling Package...
                  </Button>
                )}
                
                {assemblyStatus === 'completed' && (
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        toast({
                          title: "Download Started",
                          description: "Your eSTAR package download has started."
                        });
                      }}
                    >
                      <FaFileDownload className="mr-2" />
                      Download Package
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="flex-1" 
                      onClick={handleValidate}
                      disabled={isValidating}
                    >
                      {isValidating ? (
                        <>
                          <FaSpinner className="mr-2 animate-spin" />
                          Validating...
                        </>
                      ) : (
                        <>
                          <FaCheck className="mr-2" />
                          Validate Package
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="verification">
            <div className="flex flex-col space-y-4">
              {!validationResults ? (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    Package validation results will appear here after you validate your assembled eSTAR package.
                  </p>
                  <Button 
                    variant="outline" 
                    disabled={assemblyStatus !== 'completed'} 
                    onClick={handleValidate}
                  >
                    <FaCheck className="mr-2" />
                    Run Validation
                  </Button>
                </div>
              ) : (
                <>
                  <Alert className={validationResults.passed ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                    {validationResults.passed ? (
                      <>
                        <FaCheck className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-700">Validation Passed</AlertTitle>
                        <AlertDescription className="text-green-600">
                          Your eSTAR package meets all FDA submission requirements.
                        </AlertDescription>
                      </>
                    ) : (
                      <>
                        <FaTimesCircle className="h-4 w-4 text-red-600" />
                        <AlertTitle className="text-red-700">Validation Failed</AlertTitle>
                        <AlertDescription className="text-red-600">
                          There are issues with your eSTAR package that need to be addressed.
                        </AlertDescription>
                      </>
                    )}
                  </Alert>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2">Validation Results</h3>
                    <ul className="space-y-2">
                      {validationResults.issues.map((issue, idx) => (
                        <li key={idx} className="text-sm flex items-start">
                          {issue.severity === 'error' ? (
                            <FaTimesCircle className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                          ) : issue.severity === 'warning' ? (
                            <FaExclamationCircle className="text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                          ) : (
                            <FaCheck className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                          )}
                          <span>
                            <strong>{issue.section}:</strong> {issue.message}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-4 mt-4">
        <Alert>
          <FaPaperPlane className="h-4 w-4" />
          <AlertTitle>FDA Submission</AlertTitle>
          <AlertDescription>
            Once your eSTAR package is assembled and validated, you can submit it directly to the FDA.
            Make sure to review all sections and documents before final submission.
          </AlertDescription>
        </Alert>
        
        {isWorkflowEnabled && (
          <div className="flex justify-between mt-2">
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setActiveTab('documents')}
              >
                <FaFileAlt className="mr-2 h-4 w-4" />
                Review Documents
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={handleSubmit}
                disabled={!validationResults?.passed}
                className={!validationResults?.passed 
                  ? "bg-gray-400 hover:bg-gray-500 cursor-not-allowed" 
                  : "bg-green-600 hover:bg-green-700"
                }
              >
                <FaCloudUploadAlt className="mr-2 h-4 w-4" />
                Submit to FDA
              </Button>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default eSTARAssembly;