import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, FileText, FlaskConical, Library, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Import sub-components
import DocumentUploader from './DocumentUploader';
import DocumentAnalyzer from './DocumentAnalyzer';
import DocumentIntakeForm from './DocumentIntakeForm';

/**
 * Document Intelligence Tab Component
 * 
 * This component serves as the main container for the document intelligence
 * functionality, coordinating the workflow between document upload, analysis,
 * and data application.
 * 
 * @param {Object} props
 * @param {string} props.deviceType - The type of device (510k, cer, etc.)
 * @param {Object} props.deviceProfile - The current device profile
 * @param {Function} props.onUpdateDeviceProfile - Callback for updating the device profile
 */
const DocumentIntelligenceTab = ({
  deviceType = '510k',
  deviceProfile = null,
  onUpdateDeviceProfile = null
}) => {
  const [activeStep, setActiveStep] = useState('upload');
  const [processedDocuments, setProcessedDocuments] = useState([]);
  const [extractedData, setExtractedData] = useState(null);
  const [regulatoryContext, setRegulatoryContext] = useState(deviceType || '510k');
  const { toast } = useToast();

  // Update regulatory context when device type changes
  useEffect(() => {
    setRegulatoryContext(deviceType || '510k');
  }, [deviceType]);

  // Handle completion of document processing
  const handleProcessingComplete = (documents) => {
    setProcessedDocuments(documents);
    setActiveStep('analyze');
    
    toast({
      title: 'Documents Processed',
      description: 'Your documents are ready for analysis.',
      variant: 'success',
    });
  };

  // Handle completion of document analysis
  const handleAnalysisComplete = (data) => {
    setExtractedData(data);
    setActiveStep('apply');
    
    toast({
      title: 'Analysis Complete',
      description: 'Data has been extracted and is ready for review.',
      variant: 'success',
    });
  };

  // Handle application of extracted data to device profile
  const handleApplyData = (data) => {
    // Create updated device profile with the extracted data
    const updatedProfile = {
      ...deviceProfile,
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    // Call the callback with the updated profile
    if (onUpdateDeviceProfile) {
      onUpdateDeviceProfile(updatedProfile);
    }
    
    toast({
      title: 'Data Applied',
      description: 'The extracted data has been applied to your device profile.',
      variant: 'success',
    });
    
    // Reset for new document processing
    setTimeout(() => {
      setActiveStep('upload');
      setProcessedDocuments([]);
      setExtractedData(null);
    }, 2000);
  };

  // Handle resetting the document intelligence workflow
  const handleReset = () => {
    setActiveStep('upload');
    setProcessedDocuments([]);
    setExtractedData(null);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Document Intelligence</h2>
        <p className="text-muted-foreground">
          Upload and analyze regulatory documents to automatically extract structured data.
        </p>
      </div>

      <Separator className="my-6" />
      
      {/* Step Progress Tabs */}
      <Tabs value={activeStep} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger 
            value="upload" 
            onClick={() => setActiveStep('upload')}
            disabled={false}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <FileText className="h-4 w-4 mr-2" />
            Document Upload
          </TabsTrigger>
          <TabsTrigger 
            value="analyze" 
            onClick={() => setActiveStep('analyze')}
            disabled={processedDocuments.length === 0}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <FlaskConical className="h-4 w-4 mr-2" />
            Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="apply" 
            onClick={() => setActiveStep('apply')}
            disabled={!extractedData}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <CheckCircleIcon className="h-4 w-4 mr-2" />
            Apply Data
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="upload" className="mt-0">
            <DocumentUploader
              regulatoryContext={regulatoryContext}
              onProcessingComplete={handleProcessingComplete}
            />
            
            {/* Educational Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LibraryIcon className="h-5 w-5 mr-2" />
                  About Document Intelligence
                </CardTitle>
                <CardDescription>
                  Learn how the document intelligence system can accelerate your regulatory workflow.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="text-base font-medium">Key Features</h3>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        <li>Automatically extract device data from regulatory documents</li>
                        <li>Multiple extraction modes for different document types</li>
                        <li>High accuracy document type recognition</li>
                        <li>Regulatory validation of extracted data</li>
                        <li>Seamless integration with device profiles</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-base font-medium">Supported Document Types</h3>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        <li>510(k) Submissions</li>
                        <li>Clinical Evaluation Reports (CER)</li>
                        <li>Technical Documentation</li>
                        <li>Instructions for Use (IFU)</li>
                        <li>Classification Documents</li>
                        <li>Predicate Device Information</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analyze" className="mt-0">
            <DocumentAnalyzer
              processedDocuments={processedDocuments}
              regulatoryContext={regulatoryContext}
              onAnalysisComplete={handleAnalysisComplete}
              onReset={handleReset}
            />
          </TabsContent>
          
          <TabsContent value="apply" className="mt-0">
            <DocumentIntakeForm
              extractedData={extractedData}
              regulatoryContext={regulatoryContext}
              onApplyData={handleApplyData}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default DocumentIntelligenceTab;