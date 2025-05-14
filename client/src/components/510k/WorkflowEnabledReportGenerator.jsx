import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, FileText, Check, Info, ArrowRight, Download, Share2, Copy, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Import OneClick510kDraft for FDA-compliant formatting
import OneClick510kDraft from './OneClick510kDraft';
import { registerModuleDocument } from '../unified-workflow/registerModuleDocument';
import { getWorkflowTemplates } from '../unified-workflow/WorkflowTemplateService';

export default function WorkflowEnabledReportGenerator({
  deviceProfile,
  predicates = [],
  compliance,
  sections = [],
  documentType = '510k',
  organizationId,
  userId,
  onReportGenerated
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reportUrl, setReportUrl] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [selectedSections, setSelectedSections] = useState([
    'device_description',
    'intended_use',
    'substantial_equivalence',
    'standards',
    'performance_data',
    'conclusion'
  ]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [workflowTemplates, setWorkflowTemplates] = useState([]);
  const [selectedWorkflowTemplate, setSelectedWorkflowTemplate] = useState(null);
  const [workflowInitialized, setWorkflowInitialized] = useState(false);
  
  const { toast } = useToast();

  // Initialize component by loading available workflow templates
  React.useEffect(() => {
    async function loadWorkflowTemplates() {
      try {
        // Fetch workflow templates for this organization and module
        const templates = await getWorkflowTemplates(organizationId, documentType === '510k' ? 'medical_device' : 'cer');
        
        if (templates && templates.length > 0) {
          setWorkflowTemplates(templates);
          // Default to the first template
          setSelectedWorkflowTemplate(templates[0].id);
        }
      } catch (error) {
        console.error('Error loading workflow templates:', error);
        toast({
          title: 'Error Loading Workflows',
          description: 'Could not load available workflow templates. Using default workflow.',
          variant: 'destructive'
        });
        
        // Set a default workflow template to allow continuing
        setWorkflowTemplates([{
          id: 'default',
          name: 'Standard 510(k) Review',
          description: 'Default workflow for 510(k) submissions'
        }]);
        setSelectedWorkflowTemplate('default');
      }
    }
    
    loadWorkflowTemplates();
  }, [organizationId, documentType, toast]);

  // Toggle selected sections
  const toggleSection = (sectionId) => {
    if (selectedSections.includes(sectionId)) {
      setSelectedSections(selectedSections.filter(id => id !== sectionId));
    } else {
      setSelectedSections([...selectedSections, sectionId]);
    }
  };

  // Generate the 510k report
  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      setProgress(0);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 500);

      // Simulate generating the report - this would call the backend API in a real implementation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      clearInterval(progressInterval);
      setProgress(100);
      
      // Create a sample report URL (in a real implementation, this would be returned from the API)
      const url = selectedFormat === 'pdf' 
        ? '/api/510k/reports/sample_510k_submission.pdf' 
        : '/api/510k/reports/sample_510k_submission.docx';
      
      setReportUrl(url);
      
      // Create report data object for workflow integration
      const generatedReport = {
        id: `510k-${Date.now()}`,
        title: `${deviceProfile.deviceName || 'Device'} 510(k) Submission`,
        format: selectedFormat,
        url: url,
        generatedAt: new Date().toISOString(),
        sections: selectedSections
      };
      
      setReportData(generatedReport);
      
      if (onReportGenerated) {
        onReportGenerated(generatedReport);
      }
      
      setIsGenerating(false);
      
      toast({
        title: 'Report Generated',
        description: `Your 510(k) submission has been generated in ${selectedFormat.toUpperCase()} format.`,
        variant: 'success'
      });
      
    } catch (error) {
      console.error('Error generating report:', error);
      setIsGenerating(false);
      
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate the 510(k) submission. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Register the document in the workflow system
  const registerInWorkflow = async () => {
    if (!reportData || !selectedWorkflowTemplate) {
      toast({
        title: 'Missing Data',
        description: 'Please generate a report first and select a workflow template.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setIsRegistering(true);
      
      // Create document metadata
      const documentMetadata = {
        title: reportData.title,
        type: documentType === '510k' ? 'report_510k' : 'cer_report',
        format: reportData.format,
        url: reportData.url,
        sections: reportData.sections,
        deviceProfile: deviceProfile,
        status: 'draft'
      };
      
      // Register the document in the workflow system
      const registeredDocument = await registerModuleDocument(
        organizationId,
        userId,
        documentType === '510k' ? 'medical_device' : 'cer',
        documentMetadata,
        selectedWorkflowTemplate
      );
      
      setWorkflowInitialized(true);
      
      toast({
        title: 'Workflow Initialized',
        description: `Your 510(k) submission has been registered in the workflow system.`,
        variant: 'success'
      });
      
    } catch (error) {
      console.error('Error registering document in workflow:', error);
      
      toast({
        title: 'Workflow Registration Failed',
        description: 'Failed to register the document in the workflow system.',
        variant: 'destructive'
      });
      
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>510(k) Submission Generator</CardTitle>
        <CardDescription>
          Generate your FDA 510(k) submission with proper formatting and workflow integration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="workflow" disabled={!reportData}>Workflow</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Document Format</h3>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="format-pdf" 
                      checked={selectedFormat === 'pdf'} 
                      onCheckedChange={() => setSelectedFormat('pdf')}
                    />
                    <Label htmlFor="format-pdf">PDF</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="format-word" 
                      checked={selectedFormat === 'docx'} 
                      onCheckedChange={() => setSelectedFormat('docx')}
                    />
                    <Label htmlFor="format-word">MS Word</Label>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Document Sections</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="section-device" 
                      checked={selectedSections.includes('device_description')} 
                      onCheckedChange={() => toggleSection('device_description')}
                    />
                    <Label htmlFor="section-device">Device Description</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="section-intended" 
                      checked={selectedSections.includes('intended_use')} 
                      onCheckedChange={() => toggleSection('intended_use')}
                    />
                    <Label htmlFor="section-intended">Intended Use</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="section-equivalence" 
                      checked={selectedSections.includes('substantial_equivalence')} 
                      onCheckedChange={() => toggleSection('substantial_equivalence')}
                    />
                    <Label htmlFor="section-equivalence">Substantial Equivalence</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="section-standards" 
                      checked={selectedSections.includes('standards')} 
                      onCheckedChange={() => toggleSection('standards')}
                    />
                    <Label htmlFor="section-standards">Standards</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="section-performance" 
                      checked={selectedSections.includes('performance_data')} 
                      onCheckedChange={() => toggleSection('performance_data')}
                    />
                    <Label htmlFor="section-performance">Performance Data</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="section-conclusion" 
                      checked={selectedSections.includes('conclusion')} 
                      onCheckedChange={() => toggleSection('conclusion')}
                    />
                    <Label htmlFor="section-conclusion">Conclusion</Label>
                  </div>
                </div>
              </div>
            </div>
            
            {isGenerating ? (
              <div className="space-y-2 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Generating 510(k) Submission...</span>
                  <span className="text-sm font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            ) : (
              <div className="flex justify-end mt-4">
                <Button onClick={handleGenerateReport} className="space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Generate 510(k) Submission</span>
                </Button>
              </div>
            )}
            
            {reportUrl && (
              <Alert className="mt-4 bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Report Generated</AlertTitle>
                <AlertDescription className="text-green-700 flex justify-between items-center">
                  <span>Your 510(k) submission has been successfully generated.</span>
                  <div className="space-x-2">
                    <Button size="sm" variant="outline" asChild>
                      <a href={reportUrl} download target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </a>
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-4 mt-4">
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Preview Mode</AlertTitle>
              <AlertDescription className="text-blue-700">
                This is a preview of your 510(k) submission document. It will be formatted according to FDA guidelines.
              </AlertDescription>
            </Alert>
            
            <Card className="border border-gray-200">
              <CardHeader className="bg-gray-50 border-b py-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-md">Document Preview</CardTitle>
                  {reportUrl && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={reportUrl} download target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </a>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] w-full">
                  <div className="p-4">
                    <OneClick510kDraft 
                      deviceProfile={deviceProfile}
                      predicates={predicates}
                      selectedSections={selectedSections}
                    />
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="workflow" className="space-y-4 mt-4">
            <Alert className="bg-amber-50 border-amber-200">
              <Info className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Workflow Integration</AlertTitle>
              <AlertDescription className="text-amber-700">
                Register your 510(k) submission in the workflow system for organized review and approval.
              </AlertDescription>
            </Alert>
            
            {reportData && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md">Select Workflow Template</CardTitle>
                      <CardDescription>
                        Choose a workflow template for document review and approval
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {workflowTemplates.length > 0 ? (
                        <div className="space-y-2">
                          {workflowTemplates.map(template => (
                            <div key={template.id} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`template-${template.id}`} 
                                checked={selectedWorkflowTemplate === template.id} 
                                onCheckedChange={() => setSelectedWorkflowTemplate(template.id)}
                              />
                              <Label htmlFor={`template-${template.id}`}>
                                <span className="font-medium">{template.name}</span>
                                {template.description && (
                                  <p className="text-sm text-gray-500">{template.description}</p>
                                )}
                              </Label>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-4">
                          <p className="text-gray-500">Loading workflow templates...</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="pt-0 justify-end">
                      {workflowInitialized ? (
                        <Button variant="outline" className="space-x-2" disabled>
                          <Check className="h-4 w-4 text-green-600" />
                          <span>Registered in Workflow</span>
                        </Button>
                      ) : (
                        <Button 
                          onClick={registerInWorkflow} 
                          disabled={isRegistering || !selectedWorkflowTemplate}
                          className="space-x-2"
                        >
                          {isRegistering ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Registering...</span>
                            </>
                          ) : (
                            <>
                              <ArrowRight className="h-4 w-4" />
                              <span>Register in Workflow</span>
                            </>
                          )}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                  
                  {workflowInitialized && (
                    <Alert className="bg-green-50 border-green-200">
                      <Check className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800">Document Registered</AlertTitle>
                      <AlertDescription className="text-green-700">
                        Your 510(k) submission has been successfully registered in the workflow system.
                        Visit the Workflow tab to track approval status.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t bg-gray-50 flex justify-between">
        <div className="text-sm text-gray-500">
          {reportData ? 'Document ready for workflow integration' : 'Generate a document to begin'}
        </div>
        {reportData && !workflowInitialized && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              const tabTriggers = document.querySelectorAll('[role="tab"]');
              const workflowTab = Array.from(tabTriggers).find(tab => tab.getAttribute('value') === 'workflow');
              if (workflowTab) {
                workflowTab.click();
              }
            }}
          >
            <ArrowRight className="h-4 w-4 mr-1" />
            Continue to Workflow
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}