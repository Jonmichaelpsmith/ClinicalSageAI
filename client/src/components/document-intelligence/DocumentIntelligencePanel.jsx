import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { documentIntelligenceService } from '@/services/DocumentIntelligenceService';

// Import components with dynamic import to avoid startup issues with react-dropzone
const DocumentUploader = React.lazy(() => import('./DocumentUploader'));
const DocumentIntakePanel = React.lazy(() => import('./DocumentIntakePanel'));

/**
 * Document Intelligence Panel Component
 * 
 * This component provides a unified interface for document intelligence features:
 * 1. Upload and process documents
 * 2. Extract data from documents
 * 3. Apply extracted data to device profiles
 * 
 * It uses tabs to organize the workflow and maintains state between steps.
 */
const DocumentIntelligencePanel = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [processedDocuments, setProcessedDocuments] = useState([]);
  const [extractedData, setExtractedData] = useState(null);
  const [regulatoryContext, setRegulatoryContext] = useState('510k');
  const { toast } = useToast();

  // Handle the documents after they are processed
  const handleDocumentsProcessed = (documents) => {
    setProcessedDocuments(documents);
    
    // Switch to the intake tab after documents are processed
    if (documents && documents.length > 0) {
      setActiveTab('intake');
      
      // Display types of documents detected
      const documentTypes = [...new Set(documents.map(doc => doc.recognizedType))];
      const typesMessage = documentTypes.length > 1 
        ? `${documentTypes.length} document types detected: ${documentTypes.join(', ')}`
        : `${documentTypes[0]} documents detected`;
        
      toast({
        title: "Documents Processed",
        description: typesMessage,
      });
    }
  };

  // Handle the extracted data
  const handleExtractedData = (data) => {
    setExtractedData(data);
  };

  // Go back to the upload tab
  const handleBackToUpload = () => {
    setActiveTab('upload');
  };

  // Handle regulatory context change
  const handleContextChange = (context) => {
    setRegulatoryContext(context);
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Document Intelligence</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload Documents</TabsTrigger>
              <TabsTrigger 
                value="intake" 
                disabled={processedDocuments.length === 0}
              >
                Document Analysis
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="mt-4">
              <React.Suspense fallback={<div>Loading document uploader...</div>}>
                <DocumentUploader 
                  onDocumentsProcessed={handleDocumentsProcessed} 
                  regulatoryContext={regulatoryContext} 
                />
              </React.Suspense>
            </TabsContent>
            
            <TabsContent value="intake" className="mt-4">
              {processedDocuments.length > 0 ? (
                <React.Suspense fallback={<div>Loading document intake panel...</div>}>
                  <DocumentIntakePanel 
                    processedDocuments={processedDocuments}
                    onExtractedData={handleExtractedData}
                    onBack={handleBackToUpload}
                    regulatoryContext={regulatoryContext}
                  />
                </React.Suspense>
              ) : (
                <div className="text-center p-6">
                  <p>No documents processed yet. Please upload and process documents first.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentIntelligencePanel;