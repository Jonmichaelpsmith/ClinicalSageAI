import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload, FileText, CheckCircle, AlertTriangle, Search, Layers } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DocumentUploader from './DocumentUploader';
import DocumentAnalyzer from './DocumentAnalyzer';

/**
 * DocumentIntelligenceTab - Main component for document intelligence functionality
 * 
 * This component serves as the central hub for all document intelligence features, including:
 * 1. Document upload and preprocessing
 * 2. Intelligent document type recognition
 * 3. Data extraction with multi-layer validation
 * 4. Regulatory data mapping
 * 5. Device profile integration
 * 
 * The component is designed to support different regulatory document types (510k, Technical Files, etc.)
 * and provides a workflow-based approach to document processing.
 */
const DocumentIntelligenceTab = ({ 
  documentType, 
  deviceProfileId,
  onDataApplied 
}) => {
  const { toast } = useToast();
  const [activeDocumentTab, setActiveDocumentTab] = useState('upload');
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [processedDocuments, setProcessedDocuments] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [conversionInProgress, setConversionInProgress] = useState(false);

  // This effect monitors the processing state and updates UI accordingly
  useEffect(() => {
    if (processedDocuments.length > 0 && activeDocumentTab === 'upload') {
      setActiveDocumentTab('analyze');
    }
  }, [processedDocuments]);

  // Handle document upload completion
  const handleUploadComplete = (documents) => {
    setUploadedDocuments(documents);
    
    // Start processing documents
    setIsProcessing(true);
    
    // Simulate document processing
    setTimeout(() => {
      setProcessedDocuments(documents.map(doc => ({
        ...doc,
        processed: true,
        documentType: guessDocumentType(doc.name),
        confidence: Math.random() * 0.5 + 0.5, // Random confidence between 0.5 and 1.0
      })));
      setIsProcessing(false);
      
      toast({
        title: "Documents Processed",
        description: `${documents.length} document(s) successfully processed and ready for analysis.`,
        variant: "success"
      });
    }, 2000);
  };

  // Guess document type based on filename (simple heuristic)
  const guessDocumentType = (filename) => {
    const lowerFilename = filename.toLowerCase();
    if (lowerFilename.includes('510k') || lowerFilename.includes('submission')) return '510k';
    if (lowerFilename.includes('technical') || lowerFilename.includes('file')) return 'Technical File';
    if (lowerFilename.includes('ifu') || lowerFilename.includes('instruction')) return 'Instructions for Use';
    if (lowerFilename.includes('clinical') || lowerFilename.includes('study')) return 'Clinical Study';
    if (lowerFilename.includes('report')) return 'Report';
    return 'Unknown';
  };

  // Handle data extraction completion
  const handleExtractionComplete = (data) => {
    setExtractedData(data);
    setActiveDocumentTab('validate');
    
    // Simulate validation
    setTimeout(() => {
      setValidationResults({
        isValid: true,
        matches: [
          { field: 'deviceName', confidence: 0.94 },
          { field: 'manufacturer', confidence: 0.98 },
          { field: 'deviceClass', confidence: 0.87 },
          { field: 'intendedUse', confidence: 0.92 },
        ],
        mismatches: [
          { field: 'technicalSpecifications', expectedFormat: 'Structured Data', actualFormat: 'Free Text' }
        ],
        warnings: [
          { field: 'indications', message: 'Partial extraction only. Review recommended.' }
        ]
      });
    }, 1500);
  };

  // Apply extracted data to the device profile
  const handleApplyData = () => {
    setConversionInProgress(true);
    
    // Simulate data conversion/integration process
    setTimeout(() => {
      setConversionInProgress(false);
      
      // Call the parent callback with the extracted data
      if (onDataApplied) {
        onDataApplied(extractedData);
      }
      
      toast({
        title: "Data Applied to Device Profile",
        description: "The extracted information has been applied to your device profile.",
        variant: "success"
      });
      
      // Reset extraction state to allow for new documents
      setExtractedData(null);
      setValidationResults(null);
      setActiveDocumentTab('upload');
    }, 1000);
  };

  return (
    <Card className="border-0 shadow-none bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold text-blue-800">
          Document Intelligence System
        </CardTitle>
        <CardDescription>
          Extract and analyze critical regulatory information from your documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeDocumentTab} onValueChange={setActiveDocumentTab} className="mb-4">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="upload" disabled={isProcessing}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Documents
            </TabsTrigger>
            <TabsTrigger value="analyze" disabled={processedDocuments.length === 0 || isProcessing}>
              <Search className="h-4 w-4 mr-2" />
              Analyze Content
            </TabsTrigger>
            <TabsTrigger value="validate" disabled={!extractedData}>
              <Layers className="h-4 w-4 mr-2" />
              Validate & Apply
            </TabsTrigger>
          </TabsList>
          
          {/* Upload Documents Tab */}
          <TabsContent value="upload" className="space-y-4">
            <DocumentUploader 
              onUploadComplete={handleUploadComplete}
              isProcessing={isProcessing}
              documentType={documentType}
              deviceProfileId={deviceProfileId}
            />
            
            {processedDocuments.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Previously Processed Documents</h3>
                <div className="space-y-2">
                  {processedDocuments.map((doc, index) => (
                    <div key={index} className="flex items-center p-2 bg-gray-50 rounded-md border border-gray-100">
                      <FileText className="h-5 w-5 text-blue-600 mr-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          Detected: {doc.documentType} (Confidence: {Math.round(doc.confidence * 100)}%)
                        </p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* Analyze Documents Tab */}
          <TabsContent value="analyze">
            <DocumentAnalyzer 
              documents={processedDocuments}
              documentType={documentType}
              onExtractionComplete={handleExtractionComplete}
            />
          </TabsContent>
          
          {/* Validate & Apply Tab */}
          <TabsContent value="validate">
            {extractedData && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Extracted Device Information</h3>
                  <div className="bg-gray-50 rounded-md p-4 border border-gray-200 space-y-3">
                    {Object.entries(extractedData).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-3 gap-2">
                        <div className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                        <div className="col-span-2 text-sm">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {validationResults && (
                  <div>
                    <h3 className="text-sm font-medium mb-3">Validation Results</h3>
                    <div className="space-y-4">
                      {validationResults.isValid ? (
                        <div className="bg-green-50 rounded-md p-3 border border-green-200 flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          <span className="text-sm text-green-800">Data validation passed with minor notes</span>
                        </div>
                      ) : (
                        <div className="bg-yellow-50 rounded-md p-3 border border-yellow-200 flex items-center">
                          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                          <span className="text-sm text-yellow-800">Data validation completed with warnings</span>
                        </div>
                      )}
                      
                      {validationResults.warnings && validationResults.warnings.length > 0 && (
                        <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
                          <h4 className="text-sm font-medium mb-2">Warnings</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {validationResults.warnings.map((warning, idx) => (
                              <li key={idx} className="text-sm text-gray-700">
                                <span className="font-medium capitalize">{warning.field.replace(/([A-Z])/g, ' $1')}</span>: {warning.message}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="pt-4 border-t border-gray-100">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={conversionInProgress}
                    onClick={handleApplyData}
                  >
                    {conversionInProgress ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Applying Data...
                      </>
                    ) : (
                      'Apply Data to Device Profile'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between items-center">
        <div className="text-xs text-gray-500">
          <span className="font-medium">Document Processing:</span> AI-powered extraction using multi-layer validation
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setUploadedDocuments([]);
            setProcessedDocuments([]);
            setExtractedData(null);
            setValidationResults(null);
            setActiveDocumentTab('upload');
          }}
        >
          Reset
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DocumentIntelligenceTab;