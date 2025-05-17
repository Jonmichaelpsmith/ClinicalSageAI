/**
 * DocumentIntelligencePanel Component
 * 
 * A component for the CERV2 interface that provides document intelligence features
 * including document upload, type recognition, and data extraction.
 */

import React, { useState, useCallback } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Upload, 
  Database, 
  Layers, 
  CheckCircle, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import DocumentUploader from './DocumentUploader';
import { documentIntelligenceService } from '@/services/DocumentIntelligenceService';

/**
 * Document Intelligence Panel Component for CERV2
 * 
 * @param {Object} props Component properties
 * @param {Object} props.deviceProfile Current device profile data
 * @param {Function} props.onDeviceProfileUpdate Callback when device profile data is updated from documents
 * @param {string} props.documentId The document ID for the current submission
 */
const DocumentIntelligencePanel = ({ 
  deviceProfile, 
  onDeviceProfileUpdate,
  documentId
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('document-extraction');
  const [extractedData, setExtractedData] = useState(null);
  const [extractionHistory, setExtractionHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.75);
  const [hasAppliedData, setHasAppliedData] = useState(false);

  // Handle extracted data from the document uploader
  const handleExtractedData = useCallback((data) => {
    setExtractedData(data);
    setHasAppliedData(false);
    
    // Add to extraction history
    const historyEntry = {
      id: `extraction-${Date.now()}`,
      timestamp: new Date().toISOString(),
      documentTypes: data.documentTypes || ['Unknown'],
      confidence: data.overallConfidence || 0,
      fieldCount: data.extractedFields?.length || 0
    };
    
    setExtractionHistory(prev => [historyEntry, ...prev]);
    
    // Automatically switch to the data review tab
    setActiveTab('data-review');
    
    toast({
      title: "Document Extraction Complete",
      description: `Successfully extracted ${data.extractedFields?.length || 0} fields from document(s)`,
      variant: "default",
    });
  }, [toast]);

  // Handle extraction errors
  const handleExtractionError = useCallback((error) => {
    console.error("Document extraction error:", error);
    toast({
      title: "Document Extraction Failed",
      description: error.message || "Failed to extract data from document. Please try again.",
      variant: "destructive",
    });
  }, [toast]);

  // Apply extracted data to device profile
  const applyExtractedData = useCallback(() => {
    if (!extractedData || !extractedData.extractedFields) {
      toast({
        title: "No Data to Apply",
        description: "There is no extracted data available to apply.",
        variant: "warning",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Map extracted fields to device profile format
      const mappedData = documentIntelligenceService.mapExtractedFieldsToFormData(
        extractedData.extractedFields
      );
      
      // Call the callback to update the device profile
      onDeviceProfileUpdate(mappedData);
      
      setHasAppliedData(true);
      
      toast({
        title: "Device Profile Updated",
        description: "Successfully applied extracted data to device profile.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error applying extracted data:", error);
      toast({
        title: "Update Failed",
        description: "Failed to apply extracted data to device profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [extractedData, onDeviceProfileUpdate, toast]);

  // Calculate field application metrics for visualization
  const getMetrics = useCallback(() => {
    if (!extractedData || !extractedData.extractedFields) {
      return { totalFields: 0, highConfidence: 0, mediumConfidence: 0, lowConfidence: 0 };
    }
    
    const totalFields = extractedData.extractedFields.length;
    const highConfidence = extractedData.extractedFields.filter(f => f.confidence >= 0.8).length;
    const mediumConfidence = extractedData.extractedFields.filter(f => f.confidence >= 0.6 && f.confidence < 0.8).length;
    const lowConfidence = extractedData.extractedFields.filter(f => f.confidence < 0.6).length;
    
    return { totalFields, highConfidence, mediumConfidence, lowConfidence };
  }, [extractedData]);

  // Render extraction history
  const renderExtractionHistory = () => {
    if (extractionHistory.length === 0) {
      return (
        <div className="text-center p-8 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p>No document extraction history available</p>
          <p className="text-sm mt-1">Upload a document to begin extraction</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {extractionHistory.map(entry => (
          <Card key={entry.id} className="overflow-hidden border border-gray-200">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium">
                  Document Extraction
                </CardTitle>
                <div className="text-xs text-gray-500">
                  {new Date(entry.timestamp).toLocaleString()}
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {entry.documentTypes.map((type, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {type}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className="pb-3 pt-0">
              <div className="flex justify-between text-sm">
                <div>Fields Extracted: <span className="font-medium">{entry.fieldCount}</span></div>
                <div>
                  Confidence: 
                  <span className={`ml-1 font-medium ${
                    entry.confidence >= 0.8 ? 'text-green-600' : 
                    entry.confidence >= 0.6 ? 'text-amber-600' : 
                    'text-red-600'
                  }`}>
                    {Math.round(entry.confidence * 100)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="document-intelligence-panel">
      <Card className="border-blue-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl text-blue-800 flex items-center">
            <Layers className="mr-2 h-5 w-5 text-blue-700" />
            Document Intelligence
          </CardTitle>
          <CardDescription>
            Upload and extract structured data from device-related regulatory documents
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="document-extraction" className="flex items-center">
                <Upload className="mr-1.5 h-4 w-4" />
                Document Extraction
              </TabsTrigger>
              <TabsTrigger value="data-review" className="flex items-center">
                <FileText className="mr-1.5 h-4 w-4" />
                Data Review
              </TabsTrigger>
              <TabsTrigger value="document-history" className="flex items-center">
                <Database className="mr-1.5 h-4 w-4" />
                Document History
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="document-extraction" className="mt-0 p-0">
              <div className="space-y-4">
                <DocumentUploader 
                  onExtractedData={handleExtractedData}
                  onError={handleExtractionError}
                  documentType="regulatory"
                  confidenceThreshold={confidenceThreshold}
                  showResults={false}
                  maxFiles={5}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="data-review" className="mt-0 p-0">
              {!extractedData ? (
                <div className="text-center p-8 text-gray-500 border border-dashed rounded-md">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No extracted data available for review</p>
                  <p className="text-sm mt-1">Upload a document to extract data</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => setActiveTab('document-extraction')}
                  >
                    Go to Document Extraction
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-medium">Extracted Data Review</h3>
                      <p className="text-sm text-gray-600">
                        Review and apply extracted data to your device profile
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={hasAppliedData ? "outline" : "default"}
                        onClick={applyExtractedData}
                        disabled={isLoading || !extractedData}
                        className={hasAppliedData ? "border-green-200 text-green-700" : ""}
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="mr-1.5 h-4 w-4 animate-spin" />
                            Applying...
                          </>
                        ) : hasAppliedData ? (
                          <>
                            <CheckCircle className="mr-1.5 h-4 w-4" />
                            Applied
                          </>
                        ) : (
                          "Apply to Device Profile"
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <Card className="border border-blue-100">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-md">Document Analysis Summary</CardTitle>
                        <Badge variant="outline" className={`
                          px-2 py-1 ${
                            extractedData.overallConfidence >= 0.8 ? 'border-green-200 text-green-700 bg-green-50' : 
                            extractedData.overallConfidence >= 0.6 ? 'border-amber-200 text-amber-700 bg-amber-50' : 
                            'border-red-200 text-red-700 bg-red-50'
                          }
                        `}>
                          {extractedData.overallConfidence >= 0.8 ? (
                            <>
                              <CheckCircle className="inline mr-1 h-3 w-3" />
                              High Confidence
                            </>
                          ) : extractedData.overallConfidence >= 0.6 ? (
                            'Medium Confidence'
                          ) : (
                            <>
                              <AlertCircle className="inline mr-1 h-3 w-3" />
                              Low Confidence
                            </>
                          )}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3 pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-2">
                        <div className="bg-blue-50 p-3 rounded-md">
                          <div className="text-sm text-blue-700">Document Type</div>
                          <div className="font-medium">
                            {extractedData.documentTypes?.map((type, i) => (
                              <Badge key={i} variant="outline" className="mr-1 mt-1">
                                {type}
                              </Badge>
                            )) || 'Unknown'}
                          </div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-md">
                          <div className="text-sm text-blue-700">Detected Fields</div>
                          <div className="font-medium">{extractedData.extractedFields?.length || 0} fields</div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-md">
                          <div className="text-sm text-blue-700">Overall Confidence</div>
                          <div className="font-medium">
                            {Math.round((extractedData.overallConfidence || 0) * 100)}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Extracted Fields Preview</h4>
                        <div className="border rounded-md divide-y max-h-[400px] overflow-y-auto">
                          {!extractedData.extractedFields || extractedData.extractedFields.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                              No fields were extracted from the document
                            </div>
                          ) : (
                            extractedData.extractedFields.map((field, index) => (
                              <div key={index} className="p-3 flex justify-between hover:bg-gray-50">
                                <div>
                                  <div className="font-medium">{field.name}</div>
                                  <div className="text-sm text-gray-600 truncate max-w-[300px]">
                                    {field.value}
                                  </div>
                                </div>
                                <Badge variant="outline" className={`
                                  h-fit ${
                                    field.confidence >= 0.8 ? 'border-green-200 text-green-700 bg-green-50' : 
                                    field.confidence >= 0.6 ? 'border-amber-200 text-amber-700 bg-amber-50' : 
                                    'border-red-200 text-red-700 bg-red-50'
                                  }
                                `}>
                                  {Math.round(field.confidence * 100)}%
                                </Badge>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="document-history" className="mt-0 p-0">
              {renderExtractionHistory()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentIntelligencePanel;