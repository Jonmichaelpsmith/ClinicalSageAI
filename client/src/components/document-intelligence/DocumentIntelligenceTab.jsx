import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, FileText, FilePlus } from 'lucide-react';
import DocumentIntakePanel from './DocumentIntakePanel';
import DocumentAnalyzer from './DocumentAnalyzer';

/**
 * Document Intelligence Tab Component
 * 
 * This component is the main container for the document intelligence workflow
 * and integrates directly into the CERV2Page component as a new tab.
 * 
 * @param {Object} props Component props
 * @param {string} props.documentType The document type ('510k', 'cer', etc.)
 * @param {string} props.deviceProfileId The ID of the current device profile
 * @param {Function} props.onDataApplied Callback when data is applied to the device profile
 */
const DocumentIntelligenceTab = ({ 
  documentType = '510k',
  deviceProfileId = '',
  onDataApplied
}) => {
  // State for workflow control
  const [workflowStep, setWorkflowStep] = useState('intake'); // intake, analysis, complete
  const [processedDocuments, setProcessedDocuments] = useState([]);
  const [extractedData, setExtractedData] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [hasAppliedData, setHasAppliedData] = useState(false);
  const { toast } = useToast();
  
  // Handle document intake completion
  const handleDataExtracted = (data) => {
    setProcessedDocuments(data);
    setWorkflowStep('analysis');
    
    toast({
      title: 'Documents Processed',
      description: `${data.length} document(s) are ready for analysis.`,
    });
  };
  
  // Handle document analysis completion
  const handleAnalysisComplete = (data, validation) => {
    setExtractedData(data);
    setValidationResults(validation);
    
    toast({
      title: 'Analysis Complete',
      description: 'Documents have been analyzed and data extracted.',
    });
  };
  
  // Apply the extracted data to the device profile
  const applyExtractedData = async () => {
    try {
      // This would normally call the API to update the device profile
      if (onDataApplied && extractedData) {
        onDataApplied(extractedData);
      }
      
      toast({
        title: 'Data Applied',
        description: 'Extracted data has been applied to the device profile.',
      });
      
      setHasAppliedData(true);
      setWorkflowStep('complete');
    } catch (error) {
      console.error('Error applying data:', error);
      
      toast({
        title: 'Application Failed',
        description: error.message || 'Failed to apply data to device profile.',
        variant: 'destructive'
      });
    }
  };
  
  // Reset the workflow to start over
  const handleReset = () => {
    setProcessedDocuments([]);
    setExtractedData(null);
    setValidationResults(null);
    setHasAppliedData(false);
    setWorkflowStep('intake');
  };
  
  // Cancel document analysis
  const handleCancelAnalysis = () => {
    setWorkflowStep('intake');
  };
  
  // Render the current workflow step
  const renderWorkflowStep = () => {
    switch (workflowStep) {
      case 'intake':
        return (
          <DocumentIntakePanel
            onDataExtracted={handleDataExtracted}
            regulatoryContext={documentType}
            deviceProfileId={deviceProfileId}
          />
        );
        
      case 'analysis':
        return (
          <DocumentAnalyzer
            documents={processedDocuments}
            regulatoryContext={documentType}
            onAnalysisComplete={handleAnalysisComplete}
            onCancel={handleCancelAnalysis}
          />
        );
        
      case 'complete':
        return (
          <Card className="w-full shadow-md">
            <CardHeader className="bg-green-50 border-b">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                <div>
                  <CardTitle className="text-xl font-medium">Data Extraction Complete</CardTitle>
                  <CardDescription>
                    The extracted data has been successfully applied to your device profile.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6">
                <h3 className="font-medium text-lg mb-3">Applied Data Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
                  <div>
                    <p className="text-sm font-medium">Device Name</p>
                    <p className="text-lg">{extractedData?.deviceName || 'Not available'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Manufacturer</p>
                    <p className="text-lg">{extractedData?.manufacturer || 'Not available'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Device Class</p>
                    <p className="text-lg">{extractedData?.deviceClass || 'Not available'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Model Number</p>
                    <p className="text-lg">{extractedData?.modelNumber || 'Not available'}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium text-lg mb-2">Intended Use</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                  {extractedData?.intendedUse || 'Not available'}
                </p>
              </div>
              
              {/* Show context-specific information based on document type */}
              {documentType === '510k' && extractedData?.predicateDevices && (
                <div className="mb-6">
                  <h3 className="font-medium text-lg mb-2">Predicate Devices</h3>
                  <div className="space-y-2">
                    {extractedData.predicateDevices.map((device, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-md">
                        <p className="font-medium">{device.name}</p>
                        <p className="text-sm">Manufacturer: {device.manufacturer}</p>
                        <p className="text-sm">K Number: {device.k_number}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {documentType === 'cer' && extractedData?.clinicalData && (
                <div className="mb-6">
                  <h3 className="font-medium text-lg mb-2">Clinical Data</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="font-medium">Clinical Investigations</p>
                    <p className="text-sm">{extractedData.clinicalData.clinicalInvestigations.summary}</p>
                    <p className="font-medium mt-2">Literature Review</p>
                    <p className="text-sm">{extractedData.clinicalData.literatureReview.summary}</p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex items-center"
                >
                  <FilePlus className="h-4 w-4 mr-2" />
                  Process More Documents
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Continue to Next Step
                </Button>
              </div>
            </CardContent>
          </Card>
        );
        
      default:
        return <div>Unknown workflow step</div>;
    }
  };
  
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Intelligence</h2>
        <p className="text-gray-600">
          Upload and analyze regulatory documents to automatically extract device data for your {documentType.toUpperCase()} submission.
        </p>
      </div>
      
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Document Processing Progress</span>
          <span className="text-sm font-medium text-gray-500">
            {workflowStep === 'intake' ? '25%' : workflowStep === 'analysis' ? '75%' : '100%'}
          </span>
        </div>
        <Progress 
          value={workflowStep === 'intake' ? 25 : workflowStep === 'analysis' ? 75 : 100} 
          className="h-2"
        />
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Document Upload</span>
          <span>Analysis</span>
          <span>Data Application</span>
        </div>
      </div>
      
      {renderWorkflowStep()}
    </div>
  );
};

export default DocumentIntelligenceTab;