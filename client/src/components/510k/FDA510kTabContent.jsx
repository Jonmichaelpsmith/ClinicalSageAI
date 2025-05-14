import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  FileUp, 
  FilePlus2, 
  Layers, 
  BarChart, 
  CheckSquare,
  ClipboardCheck,
  BookOpen,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

import OneClick510kDraft from './OneClick510kDraft';
import WorkflowEnabledReportGenerator from './WorkflowEnabledReportGenerator';
import FDA510kService from '../../services/FDA510kService';

const DEFAULT_DEVICE_DATA = {
  id: 'dev-sample-1',
  deviceName: 'HeartRhythm Monitor X1',
  deviceClass: 'Class II',
  manufacturer: 'MedTech Innovations, Inc.',
  regulatoryStatus: 'Pending',
  description: 'Advanced cardiac monitoring device with wireless connectivity',
  intendedUse: 'Continuous monitoring of heart rhythm and detection of arrhythmias',
  technicalSpecifications: {
    dimensions: '5.8 cm x 3.2 cm x 1.1 cm',
    weight: '45g',
    batteryLife: '168 hours (7 days)',
    connectivity: 'Bluetooth Low Energy 5.0',
    waterResistance: 'IP67'
  }
};

const DEFAULT_PREDICATE_DATA = {
  id: 'pred-sample-1',
  deviceName: 'CardioTrack Pro',
  k510Number: 'K123456',
  manufacturer: 'Cardiac Systems, LLC',
  clearanceDate: '2023-06-15',
  deviceClass: 'Class II',
  productCode: 'DPS',
  regulationNumber: '870.2920'
};

const FDA510kTabContent = ({
  organizationId,
  userId,
  activeTab = 'drafting',
  onTabChange,
  className = ''
}) => {
  const [activeSection, setActiveSection] = useState(activeTab);
  const [deviceData, setDeviceData] = useState(DEFAULT_DEVICE_DATA);
  const [predicateData, setPredicateData] = useState(DEFAULT_PREDICATE_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [hasDraftedDocument, setHasDraftedDocument] = useState(false);
  const [draftDocumentId, setDraftDocumentId] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const [strictValidation, setStrictValidation] = useState(false);
  
  // Notify parent component when tab changes
  useEffect(() => {
    if (onTabChange && activeSection !== activeTab) {
      onTabChange(activeSection);
    }
  }, [activeSection, activeTab, onTabChange]);
  
  // Fetch device and predicate data if available
  useEffect(() => {
    const fetchDeviceData = async () => {
      if (!organizationId) return;
      
      setIsLoading(true);
      try {
        // API call to fetch device data
        const response = await fetch(`/api/module-integration/device-data?organizationId=${organizationId}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.device) setDeviceData(data.device);
          if (data.predicate) setPredicateData(data.predicate);
        }
      } catch (error) {
        console.error('Error fetching device data:', error);
        // Fallback to default data is already set in state initialization
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDeviceData();
  }, [organizationId]);
  
  // Handle events from child components
  const handleDraftCreated = (draftId) => {
    setHasDraftedDocument(true);
    setDraftDocumentId(draftId);
    
    toast({
      title: 'Draft document created',
      description: 'Your 510(k) draft has been created successfully.',
    });
  };
  
  const handleReportGenerated = (reportId) => {
    console.log('Report generated:', reportId);
    
    toast({
      title: 'FDA 510(k) report generated',
      description: 'Your FDA-compliant 510(k) submission report has been generated successfully.',
    });
  };
  
  // Handle eSTAR package validation
  const handleValidateESTAR = async (strict = false) => {
    // Check if there's a draft document
    if (!draftDocumentId && !hasDraftedDocument) {
      toast({
        title: 'No document to validate',
        description: 'Please generate a 510(k) draft document first before validating.',
        variant: 'destructive',
      });
      return;
    }
    
    // Update UI state
    setIsValidating(true);
    setValidationProgress(10);
    setValidationResults(null);
    
    try {
      // Use the project ID from deviceData
      const projectId = deviceData?.id || 'dev-sample-1';
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setValidationProgress(prev => {
          const newProgress = prev + Math.floor(Math.random() * 10) + 1;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 500);
      
      // Call FDA510kService to validate the eSTAR package
      const results = await FDA510kService.validateESTARPackage(projectId, strict);
      
      // Clear progress interval
      clearInterval(progressInterval);
      setValidationProgress(100);
      
      // Store validation results
      setValidationResults(results);
      
      // Set strictValidation state based on the current operation
      setStrictValidation(strict);
      
      // Show toast based on validation results
      if (results.success) {
        if (results.valid) {
          toast({
            title: 'Validation Successful',
            description: `Your 510(k) document passed ${strict ? 'strict' : 'standard'} validation checks.`,
          });
        } else {
          const errorCount = results.issues?.filter(issue => issue.severity === 'error').length || 0;
          const warningCount = results.issues?.filter(issue => issue.severity === 'warning').length || 0;
          
          toast({
            title: errorCount > 0 ? 'Validation Failed' : 'Validation Completed with Warnings',
            description: `Found ${errorCount} critical issues and ${warningCount} warnings.`,
            variant: errorCount > 0 ? 'destructive' : 'warning',
          });
        }
      } else {
        toast({
          title: 'Validation Error',
          description: results.errorMessage || 'An error occurred during validation.',
          variant: 'destructive',
        });
      }
      
    } catch (error) {
      console.error('Error validating eSTAR package:', error);
      toast({
        title: 'Validation Error',
        description: error.message || 'An unexpected error occurred during validation.',
        variant: 'destructive',
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className={className}>
      <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="drafting">
            <FilePlus2 className="h-4 w-4 mr-2" /> 
            Drafting
          </TabsTrigger>
          <TabsTrigger value="submission">
            <FileUp className="h-4 w-4 mr-2" /> 
            Submission
          </TabsTrigger>
          <TabsTrigger value="testing">
            <CheckSquare className="h-4 w-4 mr-2" /> 
            Testing
          </TabsTrigger>
          <TabsTrigger value="documentation">
            <BookOpen className="h-4 w-4 mr-2" /> 
            Documentation
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="drafting">
            <OneClick510kDraft 
              organizationId={organizationId}
              userId={userId}
              deviceData={deviceData}
              predicateData={predicateData}
              onDraftCreated={handleDraftCreated}
            />
          </TabsContent>
          
          <TabsContent value="submission">
            <WorkflowEnabledReportGenerator
              organizationId={organizationId}
              userId={userId}
              deviceData={deviceData}
              predicateData={predicateData}
              reportType="510k"
              onReportGenerated={handleReportGenerated}
            />
          </TabsContent>
          
          <TabsContent value="testing">
            <Card>
              <CardHeader>
                <CardTitle>510(k) eSTAR Validation</CardTitle>
                <CardDescription>
                  Validate your 510(k) eSTAR package against FDA compliance requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {!hasDraftedDocument && !draftDocumentId ? (
                    <Alert variant="warning" className="bg-amber-50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>No document drafted</AlertTitle>
                      <AlertDescription>
                        Please generate a 510(k) draft document in the Drafting tab before proceeding with validation.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                          <CheckSquare className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-medium">eSTAR Package Validation</h3>
                        </div>
                        
                        <p className="text-muted-foreground">
                          Run validation checks on your 510(k) submission to ensure it meets FDA requirements. 
                          This will analyze your document for completeness, formatting issues, and regulatory compliance.
                        </p>
                        
                        <div className="flex flex-col gap-4 mt-4">
                          <div className="flex items-center gap-2">
                            <Input 
                              type="checkbox" 
                              id="strict-validation"
                              className="w-4 h-4"
                              checked={strictValidation}
                              onChange={(e) => setStrictValidation(e.target.checked)}
                            />
                            <Label htmlFor="strict-validation">Enable strict validation mode</Label>
                          </div>
                          <p className="text-sm text-muted-foreground pl-6">
                            Strict validation applies additional checks recommended for final submissions.
                          </p>
                        </div>
                        
                        {isValidating ? (
                          <div className="space-y-4 my-6">
                            <p className="text-sm text-center">
                              {validationProgress < 100 ? 'Validating your 510(k) submission...' : 'Validation complete'}
                            </p>
                            <Progress value={validationProgress} className="w-full h-2" />
                          </div>
                        ) : (
                          <div className="flex gap-4 mt-2">
                            <Button 
                              onClick={() => handleValidateESTAR(false)}
                              disabled={isLoading || isValidating}
                            >
                              <CheckSquare className="h-4 w-4 mr-2" />
                              Run Standard Validation
                            </Button>
                            <Button 
                              onClick={() => handleValidateESTAR(true)}
                              variant="outline" 
                              disabled={isLoading || isValidating}
                            >
                              <ShieldCheck className="h-4 w-4 mr-2" />
                              Run Strict Validation
                            </Button>
                          </div>
                        )}
                        
                        {/* Display validation results when available */}
                        {validationResults && !isValidating && (
                          <div className="mt-6 space-y-4">
                            <Separator />
                            
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-medium">Validation Results</h3>
                              <Badge variant={validationResults.valid ? "success" : "destructive"}>
                                {validationResults.valid ? "PASSED" : "FAILED"}
                              </Badge>
                            </div>
                            
                            {validationResults.issues && validationResults.issues.length > 0 ? (
                              <div className="space-y-3">
                                <p className="text-sm text-muted-foreground">
                                  Detected {validationResults.issues.filter(i => i.severity === 'error').length} critical issues 
                                  and {validationResults.issues.filter(i => i.severity === 'warning').length} warnings.
                                </p>
                                
                                <ScrollArea className="h-[200px] border rounded-md p-4">
                                  <div className="space-y-2">
                                    {validationResults.issues.map((issue, idx) => (
                                      <div 
                                        key={idx} 
                                        className={`p-3 rounded-md ${issue.severity === 'error' ? 'bg-red-50 border-red-200 border' : 'bg-yellow-50 border-yellow-200 border'}`}
                                      >
                                        <div className="flex items-start gap-2">
                                          {issue.severity === 'error' ? (
                                            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                                          ) : (
                                            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                                          )}
                                          <div>
                                            <p className="font-medium text-sm">
                                              {issue.section ? `${issue.section}: ` : ''}
                                              {issue.message}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </div>
                            ) : validationResults.valid ? (
                              <Alert className="bg-green-50">
                                <CheckSquare className="h-4 w-4 text-green-600" />
                                <AlertTitle>Validation Successful</AlertTitle>
                                <AlertDescription>
                                  Your 510(k) submission meets all FDA compliance requirements.
                                </AlertDescription>
                              </Alert>
                            ) : null}
                          </div>
                        )}
                      </div>
                      
                      <Separator />
                      
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-medium">FDA Compliance Guidelines</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                            <h4 className="font-medium mb-2">Required Content</h4>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                              <li>Device Description & Classification</li>
                              <li>Comparison to Predicate Devices</li>
                              <li>Substantial Equivalence Analysis</li>
                              <li>Performance Testing Documentation</li>
                              <li>Technical Specifications</li>
                            </ul>
                          </div>
                          
                          <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                            <h4 className="font-medium mb-2">Common Issues</h4>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                              <li>Missing predicate device comparisons</li>
                              <li>Incomplete performance testing data</li>
                              <li>Inconsistent device descriptions</li>
                              <li>Missing biocompatibility data</li>
                              <li>Unstructured clinical evaluation</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documentation">
            <Card>
              <CardHeader>
                <CardTitle>510(k) Documentation</CardTitle>
                <CardDescription>
                  Reference materials and guidelines for 510(k) submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium text-lg mb-2">FDA Guidelines</h3>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        <li>Format for Traditional and Abbreviated 510(k)s</li>
                        <li>Refuse to Accept Policy for 510(k)s</li>
                        <li>The 510(k) Program: Evaluating Substantial Equivalence</li>
                        <li>Special 510(k) Program</li>
                        <li>510(k) Third Party Review Program</li>
                      </ul>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-medium text-lg mb-2">Content Requirements</h3>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        <li>Device Description and Specification Documentation</li>
                        <li>Substantial Equivalence Comparison</li>
                        <li>Performance Testing Documentation</li>
                        <li>Sterilization and Shelf Life</li>
                        <li>Biocompatibility Documentation</li>
                        <li>Software Documentation</li>
                        <li>Electromagnetic Compatibility</li>
                        <li>Animal and Clinical Testing</li>
                      </ul>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-medium text-lg mb-2">Best Practices</h3>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        <li>Predicate Device Selection Guidance</li>
                        <li>Structuring a Clear Substantial Equivalence Argument</li>
                        <li>Addressing Differences in Technological Characteristics</li>
                        <li>Preparing for FDA Questions and Additional Information Requests</li>
                        <li>Common Rejection Reasons and How to Avoid Them</li>
                      </ul>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default FDA510kTabContent;