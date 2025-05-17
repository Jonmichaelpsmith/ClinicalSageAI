import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { documentIntelligenceService } from '@/services/DocumentIntelligenceService';
import { AlertCircle, CheckCircle, FileText, ArrowRight, Layers } from 'lucide-react';

/**
 * Document Intake Panel Component
 * 
 * This component displays uploaded documents and allows the user to
 * extract data from them using AI-powered document intelligence.
 * 
 * @param {Object} props Component props
 * @param {Array} props.processedDocuments Array of processed document metadata
 * @param {Function} props.onExtractedData Callback when data is extracted
 * @param {Function} props.onBack Callback to go back to document upload
 * @param {string} props.regulatoryContext The regulatory context for processing ('510k', 'cer', etc.)
 */
const DocumentIntakePanel = ({
  processedDocuments = [],
  onExtractedData,
  onBack,
  regulatoryContext = '510k',
  onExtractComplete, // Note: This is for compatibility with CERV2 usage
}) => {
  const [extracting, setExtracting] = useState(false);
  const [extractProgress, setExtractProgress] = useState(0);
  const [dataPreview, setDataPreview] = useState(null);
  const { toast } = useToast();

  // Update extraction progress with a simulated completion process
  useEffect(() => {
    let interval;
    if (extracting && extractProgress < 100) {
      interval = setInterval(() => {
        setExtractProgress(prev => {
          const increment = prev < 60 ? 2 : prev < 85 ? 1 : 0.5;
          const newProgress = Math.min(prev + increment, 99); // Hold at 99% until complete
          return newProgress;
        });
      }, 200);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [extracting, extractProgress]);

  // Start the extraction process
  const handleStartExtraction = async () => {
    if (processedDocuments.length === 0) {
      toast({
        title: "No Documents",
        description: "Please upload documents before starting extraction.",
        variant: "destructive"
      });
      return;
    }

    setExtracting(true);
    setExtractProgress(0);
    setDataPreview(null);

    try {
      // Start the actual extraction process
      const extractedData = await documentIntelligenceService.extractData(
        processedDocuments,
        regulatoryContext
      );
      
      // When complete, update progress to 100%
      setExtractProgress(100);
      setDataPreview(extractedData);
      
      // Notify through callbacks
      if (onExtractedData) onExtractedData(extractedData);
      if (onExtractComplete) onExtractComplete(extractedData);
      
      toast({
        title: "Extraction Complete",
        description: "Successfully extracted data from documents.",
      });
    } catch (error) {
      console.error('Error during extraction:', error);
      
      toast({
        title: "Extraction Failed",
        description: error.message || "Failed to extract data from documents.",
        variant: "destructive"
      });
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Layers className="mr-2 h-5 w-5 text-blue-600" />
            Document Intelligence Analysis
          </CardTitle>
          <CardDescription>
            Extract structured data from regulatory documents using AI
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {processedDocuments.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Processed Documents ({processedDocuments.length})</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {processedDocuments.map((doc, index) => (
                  <Card key={index} className="border border-gray-200">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-md">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{doc.name}</p>
                          <p className="text-xs text-gray-500">
                            {doc.recognizedType || 'Document'} • {(doc.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {doc.status === 'processed' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Ready
                            </span>
                          )}
                          {doc.status === 'error' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Error
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {extracting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Extracting data...</span>
                    <span className="text-sm text-gray-500">{extractProgress.toFixed(0)}%</span>
                  </div>
                  <Progress value={extractProgress} className="h-2" />
                </div>
              )}

              {dataPreview && (
                <Card className="bg-gray-50 border border-gray-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Extracted Data Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3 pt-0 text-xs">
                    <ul className="space-y-1">
                      {Object.entries(dataPreview).map(([key, value]) => (
                        <li key={key} className="flex">
                          <span className="font-medium mr-2 min-w-[120px]">{key}:</span>
                          <span className="text-gray-700 truncate">{
                            typeof value === 'string' 
                              ? value 
                              : typeof value === 'object' 
                                ? JSON.stringify(value).substring(0, 50) + '...'
                                : String(value)
                          }</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-gray-500">No documents have been processed yet.</p>
              <p className="text-sm text-gray-400 mt-1">Please upload documents to begin.</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={onBack}
            disabled={extracting}
          >
            Back to Upload
          </Button>
          
          <Button
            onClick={handleStartExtraction}
            disabled={extracting || processedDocuments.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {extracting ? 'Extracting...' : dataPreview ? 'Re-Extract Data' : 'Extract Data'}
            {!extracting && <ArrowRight className="ml-1.5 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DocumentIntakePanel;