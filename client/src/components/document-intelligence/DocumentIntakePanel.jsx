import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { CheckCircle2, FileText, AlertTriangle, ArrowRight, RotateCw } from 'lucide-react';
import { documentIntelligenceService } from '@/services/DocumentIntelligenceService';
import { useToast } from '@/hooks/use-toast';
import { DocumentUploader } from './DocumentUploader';
import { Progress } from '@/components/ui/progress';

/**
 * Document Intake Panel component for uploading and extracting data from
 * regulatory documents.
 */
export const DocumentIntakePanel = ({ 
  onDataExtracted,
  onDocumentsProcessed,
  deviceId,
  regulatoryContext = '510k'
}) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [processedDocuments, setProcessedDocuments] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractedData, setExtractedData] = useState(null);
  const { toast } = useToast();
  
  /**
   * Handle when documents have been processed by the uploader
   */
  const handleDocumentsProcessed = (documents) => {
    setProcessedDocuments(documents);
    setActiveTab('review');
    
    if (onDocumentsProcessed) {
      onDocumentsProcessed(documents);
    }
  };
  
  /**
   * Extract data from the processed documents
   */
  const handleExtractData = async () => {
    if (!processedDocuments.length) return;
    
    setIsExtracting(true);
    setExtractionProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setExtractionProgress((prev) => {
        const newProgress = Math.min(prev + Math.random() * 5, 90);
        return newProgress;
      });
    }, 300);
    
    try {
      const extractionParams = {
        documents: processedDocuments,
        regulatoryContext,
        extractionMode: 'comprehensive', // Options could be: basic, standard, comprehensive
        confidenceThreshold: 0.7
      };
      
      const response = await documentIntelligenceService.extractDocumentData(extractionParams);
      
      // Stop the progress simulation
      clearInterval(progressInterval);
      setExtractionProgress(100);
      
      // Small delay to show 100% completion before showing results
      setTimeout(() => {
        setIsExtracting(false);
        setExtractedData(response.extractedData);
        setActiveTab('results');
        
        toast({
          title: 'Data Extraction Complete',
          description: `Successfully extracted ${Object.keys(response.extractedData || {}).length} data fields from documents`,
          variant: 'success',
        });
        
        if (onDataExtracted) {
          onDataExtracted(response.extractedData);
        }
      }, 500);
      
    } catch (error) {
      console.error('Error extracting data:', error);
      clearInterval(progressInterval);
      setIsExtracting(false);
      setExtractionProgress(0);
      
      toast({
        title: 'Extraction Failed',
        description: error.message || 'Failed to extract data from documents. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  /**
   * Apply the extracted data to a device profile
   */
  const handleApplyData = async () => {
    if (!extractedData || !deviceId) return;
    
    try {
      const response = await documentIntelligenceService.applyDataToDeviceProfile(deviceId, extractedData);
      
      toast({
        title: 'Data Applied',
        description: 'Device profile has been updated with the extracted data',
        variant: 'success',
      });
      
    } catch (error) {
      console.error('Error applying data to device profile:', error);
      
      toast({
        title: 'Application Failed',
        description: error.message || 'Failed to apply data to device profile. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  /**
   * Reset the entire process
   */
  const handleReset = () => {
    setProcessedDocuments([]);
    setIsExtracting(false);
    setExtractionProgress(0);
    setExtractedData(null);
    setActiveTab('upload');
  };
  
  /**
   * Render the document review list
   */
  const renderDocumentList = () => {
    return (
      <div className="space-y-4 mt-4">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <h3 className="text-sm font-medium">Processed Documents ({processedDocuments.length})</h3>
        </div>
        <div className="space-y-2">
          {processedDocuments.map((doc) => (
            <Card key={doc.id} className="overflow-hidden">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                          {doc.recognizedType || 'Unknown document type'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Confidence: {Math.round(doc.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  {doc.confidence < 0.7 && (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" title="Low confidence in document type recognition" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };
  
  /**
   * Render the extraction results
   */
  const renderExtractionResults = () => {
    if (!extractedData) return null;
    
    // Group data by categories for better organization
    const dataCategories = {
      'Device Information': ['deviceName', 'manufacturer', 'modelNumber', 'deviceType', 'deviceClass'],
      'Regulatory': ['regulatoryClass', 'productCode', 'regulationNumber'],
      'Technical': ['specifications', 'dimensions', 'materials', 'sterilization'],
      'Clinical': ['intendedUse', 'indications', 'contraindications', 'warnings']
    };
    
    return (
      <div className="space-y-6 mt-4">
        {Object.entries(dataCategories).map(([category, fields]) => {
          const categoryData = fields.filter(field => extractedData[field]).map(field => ({
            field,
            value: extractedData[field]
          }));
          
          if (!categoryData.length) return null;
          
          return (
            <div key={category} className="space-y-2">
              <h3 className="text-sm font-medium">{category}</h3>
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {categoryData.map(({ field, value }) => (
                      <div key={field} className="grid grid-cols-3 gap-2 text-sm">
                        <div className="font-medium text-muted-foreground">
                          {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </div>
                        <div className="col-span-2">{value}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
        
        {Object.keys(extractedData).length === 0 && (
          <div className="text-center p-6">
            <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
            <h3 className="text-lg font-medium">No Data Extracted</h3>
            <p className="text-sm text-muted-foreground mt-1">
              The system couldn't extract any data from the provided documents.
              Try uploading different documents or contact support for assistance.
            </p>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Document Intelligence</CardTitle>
        <CardDescription>
          Upload regulatory documents to automatically extract device data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" disabled={isExtracting}>Upload</TabsTrigger>
            <TabsTrigger 
              value="review" 
              disabled={!processedDocuments.length || isExtracting}
            >
              Review
            </TabsTrigger>
            <TabsTrigger 
              value="results" 
              disabled={!extractedData || isExtracting}
            >
              Results
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="pt-4">
            <DocumentUploader 
              onDocumentsProcessed={handleDocumentsProcessed}
              regulatoryContext={regulatoryContext}
            />
          </TabsContent>
          
          <TabsContent value="review" className="pt-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Document Review</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Review the processed documents and extract device data
                </p>
              </div>
              
              {renderDocumentList()}
              
              {isExtracting ? (
                <div className="space-y-4 mt-6">
                  <div className="flex items-center space-x-2">
                    <RotateCw className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-sm font-medium">Extracting data from documents...</span>
                  </div>
                  <Progress 
                    value={extractionProgress} 
                    max={100} 
                    className="h-2" 
                    variant={extractionProgress < 100 ? "primary" : "success"} 
                  />
                  <p className="text-xs text-muted-foreground">
                    This may take a minute or two depending on the volume and complexity of the documents
                  </p>
                </div>
              ) : (
                <div className="flex justify-between items-center mt-6">
                  <Button variant="outline" onClick={handleReset}>
                    Start Over
                  </Button>
                  <Button onClick={handleExtractData}>
                    Extract Data <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="pt-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Extraction Results</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Review and apply the extracted device data
                </p>
              </div>
              
              {renderExtractionResults()}
              
              <div className="flex justify-between items-center mt-6">
                <Button variant="outline" onClick={handleReset}>
                  Start Over
                </Button>
                <Button onClick={handleApplyData} disabled={!deviceId}>
                  Apply to Device Profile <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="justify-end border-t pt-4 bg-slate-50">
        <div className="text-xs text-muted-foreground">
          Document Intelligence v2.0 | Powered by GPT-4o
        </div>
      </CardFooter>
    </Card>
  );
};