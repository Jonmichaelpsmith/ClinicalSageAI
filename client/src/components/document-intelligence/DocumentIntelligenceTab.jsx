import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BrainCircuit, FileUp, ChevronRight, Microscope, Database } from "lucide-react";
import DocumentUploader from './DocumentUploader';
import DocumentAnalyzer from './DocumentAnalyzer';
import DocumentIntakeForm from './DocumentIntakeForm';

/**
 * DocumentIntelligenceTab Component
 * 
 * This component serves as the main container for the document intelligence workflow,
 * providing tabs for document upload, processing, and results integration into the
 * regulatory submission workflow.
 */
const DocumentIntelligenceTab = ({ deviceType = '510k', onDataExtracted }) => {
  const [currentStep, setCurrentStep] = useState('upload');
  const [processedDocuments, setProcessedDocuments] = useState([]);
  const [extractedData, setExtractedData] = useState(null);
  
  // Handle document selection/upload
  const handleDocumentsSelected = (documents) => {
    setProcessedDocuments(documents);
    setCurrentStep('analyze');
  };
  
  // Handle document analysis completion
  const handleExtractionComplete = (data) => {
    setExtractedData(data);
    
    // If parent component needs the extracted data
    if (onDataExtracted) {
      onDataExtracted(data);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm overflow-hidden bg-white">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
          <CardTitle className="flex items-center text-blue-800">
            <BrainCircuit className="h-5 w-5 mr-2 text-blue-600" />
            Document Intelligence
          </CardTitle>
          <CardDescription>
            Process regulatory documents with AI-powered document intelligence to
            automatically extract and validate device information.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                <FileUp className="h-4 w-4" />
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'analyze' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                <Microscope className="h-4 w-4" />
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'integrate' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                <Database className="h-4 w-4" />
              </div>
            </div>
          </div>
          
          <Tabs value={currentStep} onValueChange={setCurrentStep} className="w-full">
            <TabsList className="hidden">
              <TabsTrigger value="upload">Document Upload</TabsTrigger>
              <TabsTrigger value="analyze">Document Analysis</TabsTrigger>
              <TabsTrigger value="integrate">Data Integration</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="m-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DocumentIntakeForm 
                  documentType={deviceType}
                  onDocumentProcessed={(doc) => {
                    setProcessedDocuments([doc]);
                    setCurrentStep('analyze');
                  }}
                />
                
                <DocumentUploader 
                  deviceType={deviceType}
                  onDocumentsSelected={handleDocumentsSelected}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="analyze" className="m-0">
              <DocumentAnalyzer 
                documents={processedDocuments}
                documentType={deviceType}
                onExtractionComplete={handleExtractionComplete}
              />
              
              <div className="mt-4 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('upload')}
                >
                  Back to Upload
                </Button>
                
                {extractedData && (
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setCurrentStep('integrate')}
                  >
                    Continue to Integration
                  </Button>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="integrate" className="m-0">
              {extractedData && (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <h3 className="text-lg font-medium text-green-800 mb-2">Data Extraction Complete</h3>
                    <p className="text-sm text-green-700">
                      The document intelligence system has successfully extracted and validated device information.
                      This data can now be integrated into your device profile.
                    </p>
                  </div>
                  
                  <Card className="border border-gray-200">
                    <CardHeader className="bg-gray-50 pb-3">
                      <CardTitle className="text-lg">Device Information</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(extractedData).map(([key, value]) => (
                          <div key={key} className="border-b pb-2">
                            <p className="text-sm font-medium text-gray-600 capitalize">
                              {key.replace(/([A-Z])/g, ' $1')}:
                            </p>
                            <p className="text-sm">{value}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep('analyze')}
                    >
                      Back to Analysis
                    </Button>
                    
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => {
                        if (onDataExtracted) {
                          onDataExtracted(extractedData, true);
                        }
                      }}
                    >
                      Apply to Device Profile
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentIntelligenceTab;