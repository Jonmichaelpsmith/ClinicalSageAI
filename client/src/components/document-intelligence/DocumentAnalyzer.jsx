import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { FileText, ArrowRight, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { documentIntelligenceService } from '@/services/DocumentIntelligenceService';

/**
 * Document Analyzer Component
 * 
 * This component handles the detailed analysis of processed documents,
 * showing the extraction process, confidence levels, and validation of
 * extracted information against regulatory requirements.
 * 
 * @param {Object} props Component props
 * @param {Array} props.documents The processed documents to analyze
 * @param {string} props.regulatoryContext The regulatory context for extraction
 * @param {Function} props.onAnalysisComplete Callback when analysis is complete
 * @param {Function} props.onCancel Optional callback to cancel analysis
 */
const DocumentAnalyzer = ({ 
  documents,
  regulatoryContext,
  onAnalysisComplete,
  onCancel
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [analysisState, setAnalysisState] = useState('preparing'); // preparing, analyzing, validating, complete, error
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [extractedData, setExtractedData] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [processingStages, setProcessingStages] = useState([]);
  const [currentStage, setCurrentStage] = useState(0);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  // Fetch processing stages on component mount
  useEffect(() => {
    async function fetchProcessingStages() {
      try {
        const stages = await documentIntelligenceService.getProcessingStages();
        setProcessingStages(stages);
      } catch (error) {
        console.error("Error fetching processing stages:", error);
      }
    }
    
    fetchProcessingStages();
  }, []);

  // Start analysis process when component mounts
  useEffect(() => {
    if (documents && documents.length > 0) {
      startAnalysis();
    }
  }, [documents]);

  // Update progress based on current stage
  useEffect(() => {
    if (processingStages.length > 0) {
      const progressPerStage = 100 / processingStages.length;
      setAnalysisProgress(Math.min(Math.round(currentStage * progressPerStage), 100));
    }
  }, [currentStage, processingStages]);

  // Function to start the document analysis process
  const startAnalysis = async () => {
    if (!documents || documents.length === 0) {
      setError("No documents provided for analysis");
      setAnalysisState('error');
      return;
    }

    try {
      setAnalysisState('analyzing');
      setAnalysisProgress(5);
      
      // Simulate advancing through processing stages
      const stageSimulation = async () => {
        for (let i = 0; i < processingStages.length; i++) {
          setCurrentStage(i);
          // Simulate processing time for each stage
          await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
        }
      };
      
      // Start the stage simulation
      await stageSimulation();
      
      // Extract data from documents
      const extractedData = await documentIntelligenceService.extractData(
        documents, 
        regulatoryContext,
        'comprehensive'
      );
      
      setExtractedData(extractedData);
      setAnalysisState('validating');
      
      // Validate the extracted data
      const validationResults = await documentIntelligenceService.validateExtractedData(
        extractedData,
        regulatoryContext
      );
      
      setValidationResults(validationResults);
      setAnalysisState('complete');
      
      toast({
        title: 'Analysis Complete',
        description: 'Document intelligence analysis has been completed successfully.',
      });
      
      // Call the completion callback with the extracted data
      if (onAnalysisComplete) {
        onAnalysisComplete(extractedData, validationResults);
      }
    } catch (error) {
      console.error('Error during document analysis:', error);
      setError(error.message || 'An error occurred during document analysis');
      setAnalysisState('error');
      
      toast({
        title: 'Analysis Error',
        description: error.message || 'An error occurred during document analysis',
        variant: 'destructive'
      });
    }
  };

  // Handle cancellation of analysis
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // Render the current stage of analysis
  const renderAnalysisStage = () => {
    switch (analysisState) {
      case 'preparing':
        return (
          <div className="text-center py-6">
            <Info className="h-12 w-12 mx-auto text-blue-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Preparing Analysis</h3>
            <p className="text-gray-600 mb-4">Preparing to analyze {documents.length} document(s)</p>
          </div>
        );
        
      case 'analyzing':
      case 'validating':
        const currentStageName = processingStages[currentStage]?.name || 'Processing';
        return (
          <div className="py-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium mb-2">
                {analysisState === 'analyzing' ? 'Analyzing Documents' : 'Validating Data'}
              </h3>
              <p className="text-gray-600 mb-4">
                {analysisState === 'analyzing' 
                  ? `Extracting data from ${documents.length} document(s)`
                  : 'Validating extracted data against regulatory requirements'}
              </p>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Processing: {currentStageName}</span>
                <span className="text-sm text-gray-500">{analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
            </div>
            
            <div className="space-y-3 mt-8">
              {processingStages.map((stage, index) => (
                <div 
                  key={stage.id} 
                  className={`flex items-center p-2 rounded ${
                    index < currentStage 
                      ? 'bg-green-50' 
                      : index === currentStage 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'bg-gray-50'
                  }`}
                >
                  {index < currentStage ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  ) : index === currentStage ? (
                    <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mr-3" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border border-gray-300 mr-3" />
                  )}
                  <div>
                    <p className={`font-medium ${index === currentStage ? 'text-blue-700' : 'text-gray-700'}`}>
                      {stage.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {index < currentStage 
                        ? 'Complete' 
                        : index === currentStage 
                          ? 'In Progress' 
                          : 'Pending'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'complete':
        return (
          <div className="py-4">
            <div className="text-center mb-6">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">Analysis Complete</h3>
              <p className="text-gray-600 mb-2">
                Successfully analyzed {documents.length} document(s) and extracted data
              </p>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                {validationResults?.isValid ? 'Valid Data' : 'Review Recommended'}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 gap-4 mb-6">
              {validationResults?.validatedFields?.map((field) => (
                <div key={field.field} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center">
                    {field.valid ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                    )}
                    <span className="text-sm font-medium">{field.field.charAt(0).toUpperCase() + field.field.slice(1).replace(/([A-Z])/g, ' $1')}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs mr-2">Confidence:</span>
                    <Badge className={`${
                      field.score >= 0.9 
                        ? 'bg-green-100 text-green-800' 
                        : field.score >= 0.7 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {Math.round(field.score * 100)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            
            {validationResults?.suggestions?.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">Suggestions</h4>
                <div className="space-y-2">
                  {validationResults.suggestions.map((suggestion, index) => (
                    <div key={index} className="p-2 bg-blue-50 rounded text-sm">
                      <span className="font-medium">{suggestion.field}: </span>
                      {suggestion.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
        
      case 'error':
        return (
          <div className="text-center py-6">
            <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Analysis Error</h3>
            <p className="text-red-600 mb-4">{error || 'An unexpected error occurred during analysis'}</p>
            <Button variant="outline" onClick={startAnalysis}>
              Retry Analysis
            </Button>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Render document details tab content
  const renderDocumentDetails = () => {
    return (
      <div className="space-y-4 py-4">
        <h3 className="font-medium text-gray-800 mb-3">Processed Documents</h3>
        
        {documents.map((doc) => (
          <Card key={doc.id} className="overflow-hidden">
            <CardHeader className="bg-gray-50 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{doc.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {doc.recognizedType} • {(doc.size / 1024).toFixed(1)} KB
                  </CardDescription>
                </div>
                <Badge className="bg-blue-100 text-blue-800">
                  {doc.status === 'processed' ? 'Processed' : doc.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="py-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Content Statistics</p>
                  <ul className="space-y-1 text-gray-800">
                    <li className="flex justify-between">
                      <span>Total Pages:</span>
                      <span className="font-medium">{doc.contentStatistics?.totalPages || 'N/A'}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Tables:</span>
                      <span className="font-medium">{doc.contentStatistics?.tableCount || 'N/A'}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Figures:</span>
                      <span className="font-medium">{doc.contentStatistics?.figureCount || 'N/A'}</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <p className="text-gray-500 mb-1">Processing Metrics</p>
                  <ul className="space-y-1 text-gray-800">
                    <li className="flex justify-between">
                      <span>Confidence:</span>
                      <span className="font-medium">
                        {doc.processingMetrics?.confidenceScore 
                          ? `${Math.round(doc.processingMetrics.confidenceScore * 100)}%` 
                          : 'N/A'}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span>Completeness:</span>
                      <span className="font-medium">
                        {doc.processingMetrics?.extractionCompleteness 
                          ? `${Math.round(doc.processingMetrics.extractionCompleteness * 100)}%` 
                          : 'N/A'}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  // Render extracted data preview
  const renderExtractedDataPreview = () => {
    if (!extractedData) {
      return (
        <div className="text-center py-12">
          <Info className="h-8 w-8 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">Extracted data will appear here once analysis is complete</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-6 py-4">
        <h3 className="font-medium text-gray-800 mb-3">Extracted Data Preview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700 border-b pb-1">Basic Information</h4>
            <div className="space-y-3">
              {['deviceName', 'manufacturer', 'modelNumber', 'deviceClass', 'regulatoryStatus'].map((field) => (
                <div key={field} className="grid grid-cols-2 gap-2">
                  <span className="text-sm text-gray-500">
                    {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}:
                  </span>
                  <span className="text-sm font-medium">{extractedData[field] || 'Not available'}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700 border-b pb-1">Additional Details</h4>
            <div className="space-y-4">
              <div>
                <span className="text-sm text-gray-500 block mb-1">Intended Use:</span>
                <p className="text-sm">{extractedData.intendedUse || 'Not available'}</p>
              </div>
              
              {extractedData.regulatoryControls && (
                <div>
                  <span className="text-sm text-gray-500 block mb-1">Regulatory Controls:</span>
                  <div className="text-sm bg-gray-50 p-2 rounded">
                    <p><span className="font-medium">Regulation:</span> {extractedData.regulatoryControls.regulationNumber}</p>
                    <p><span className="font-medium">Classification:</span> {extractedData.regulatoryControls.classificationName}</p>
                  </div>
                </div>
              )}
              
              {extractedData.predicateDevices && extractedData.predicateDevices.length > 0 && (
                <div>
                  <span className="text-sm text-gray-500 block mb-1">Predicate Devices:</span>
                  <ul className="text-sm list-disc list-inside pl-2">
                    {extractedData.predicateDevices.map((device, index) => (
                      <li key={index}>
                        {device.name} ({device.manufacturer}) - {device.k_number}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Show content based on regulatory context */}
        {regulatoryContext === '510k' && extractedData.testingData && (
          <div className="pt-4 border-t">
            <h4 className="font-medium text-gray-700 mb-3">Testing Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(extractedData.testingData).map(([key, value]) => (
                <div key={key} className="bg-gray-50 p-3 rounded">
                  <p className="font-medium mb-1">{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</p>
                  <div className="text-sm">
                    <p><span className="text-gray-500">Performed:</span> {value.performed ? 'Yes' : 'No'}</p>
                    {value.standards && (
                      <p>
                        <span className="text-gray-500">Standards:</span> {value.standards.join(', ')}
                      </p>
                    )}
                    {value.results && (
                      <p>
                        <span className="text-gray-500">Results:</span> {value.results}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {regulatoryContext === 'cer' && extractedData.clinicalData && (
          <div className="pt-4 border-t">
            <h4 className="font-medium text-gray-700 mb-3">Clinical Data</h4>
            <div className="grid grid-cols-1 gap-4">
              {Object.entries(extractedData.clinicalData).map(([key, value]) => (
                <div key={key} className="bg-gray-50 p-3 rounded">
                  <p className="font-medium mb-1">{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</p>
                  <div className="text-sm">
                    {typeof value === 'object' ? (
                      Object.entries(value).map(([subKey, subValue]) => (
                        <p key={subKey}>
                          <span className="text-gray-500">{subKey.charAt(0).toUpperCase() + subKey.slice(1).replace(/([A-Z])/g, ' $1')}:</span> {subValue}
                        </p>
                      ))
                    ) : (
                      <p>{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="text-xs text-gray-500 mt-4">
          <p>Extraction Confidence: {Math.round(extractedData.extractionConfidence * 100)}%</p>
          <p>Extracted on: {new Date(extractedData.extractionTimestamp).toLocaleString()}</p>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-gray-50 border-b">
        <CardTitle className="text-xl font-medium">Document Intelligence Analysis</CardTitle>
        <CardDescription>
          Analyzing {documents.length} document(s) in {regulatoryContext.toUpperCase()} regulatory context
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full border-b rounded-none p-0">
            <TabsTrigger 
              value="overview"
              className="flex-1 rounded-none border-r data-[state=active]:border-b-2 data-[state=active]:border-b-blue-600"
            >
              Analysis
            </TabsTrigger>
            <TabsTrigger 
              value="documents"
              className="flex-1 rounded-none border-r data-[state=active]:border-b-2 data-[state=active]:border-b-blue-600"
              disabled={analysisState === 'analyzing' || analysisState === 'preparing'}
            >
              Documents
            </TabsTrigger>
            <TabsTrigger 
              value="data"
              className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-b-blue-600"
              disabled={!extractedData}
            >
              Extracted Data
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="p-6">
            {renderAnalysisStage()}
          </TabsContent>
          
          <TabsContent value="documents" className="p-6">
            {renderDocumentDetails()}
          </TabsContent>
          
          <TabsContent value="data" className="p-6">
            {renderExtractedDataPreview()}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="border-t px-6 py-4 bg-gray-50 flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleCancel}
          disabled={analysisState === 'complete'}
        >
          {analysisState === 'complete' ? 'Close' : 'Cancel'}
        </Button>
        
        {analysisState === 'complete' && (
          <Button 
            onClick={() => onAnalysisComplete(extractedData, validationResults)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Apply Data <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default DocumentAnalyzer;