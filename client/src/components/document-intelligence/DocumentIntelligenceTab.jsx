import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, FileCheck, Database, ArrowRight } from 'lucide-react';
import DocumentUploader from './DocumentUploader';
import DocumentAnalyzer from './DocumentAnalyzer';
import DocumentIntakeForm from './DocumentIntakeForm';
import { useToast } from '@/hooks/use-toast';

/**
 * Document Intelligence Tab
 * 
 * This component serves as the main container for the document intelligence functionality.
 * It includes three sub-tabs:
 * 1. Upload - For uploading documents
 * 2. Analyze - For analyzing and extracting data from documents
 * 3. Data Review - For reviewing and applying extracted data
 * 
 * @param {Object} props
 * @param {string} props.deviceType - The type of device (510k, cer, etc.)
 * @param {Function} props.onDataExtracted - Callback for when data is extracted and ready to apply
 */
const DocumentIntelligenceTab = ({ deviceType = '510k', onDataExtracted }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [processedDocuments, setProcessedDocuments] = useState([]);
  const [extractedData, setExtractedData] = useState(null);
  const [extractionMode, setExtractionMode] = useState('comprehensive');
  const { toast } = useToast();

  // Handler for when documents are uploaded and processed
  const handleDocumentsProcessed = (documents) => {
    setProcessedDocuments(documents);
    
    // Show success toast
    toast({
      title: "Documents Processed",
      description: `Successfully processed ${documents.length} document(s).`,
      variant: "success"
    });
    
    // Switch to analyze tab
    setActiveTab('analyze');
  };

  // Handler for when data is extracted from documents
  const handleDataExtracted = (data) => {
    setExtractedData(data);
    
    // Show success toast
    toast({
      title: "Data Extracted",
      description: "Successfully extracted data from documents.",
      variant: "success"
    });
    
    // Switch to data review tab
    setActiveTab('data-review');
  };

  // Handler for applying data to device profile
  const handleApplyData = (data) => {
    if (onDataExtracted) {
      onDataExtracted(data, true);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Document Intelligence</CardTitle>
          <CardDescription>
            Upload, analyze, and extract data from regulatory documents to streamline your submission process.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>1. Upload Documents</span>
              </TabsTrigger>
              <TabsTrigger 
                value="analyze" 
                className="flex items-center gap-2"
                disabled={processedDocuments.length === 0}
              >
                <FileCheck className="h-4 w-4" />
                <span>2. Analyze Content</span>
              </TabsTrigger>
              <TabsTrigger 
                value="data-review" 
                className="flex items-center gap-2"
                disabled={!extractedData}
              >
                <Database className="h-4 w-4" />
                <span>3. Data Review</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4">
              <DocumentUploader 
                regulatoryContext={deviceType}
                onDocumentsProcessed={handleDocumentsProcessed}
                extractionMode={extractionMode}
                onExtractionModeChange={setExtractionMode}
              />
            </TabsContent>
            
            <TabsContent value="analyze" className="space-y-4">
              <DocumentAnalyzer 
                processedDocuments={processedDocuments}
                regulatoryContext={deviceType}
                onDataExtracted={handleDataExtracted}
                extractionMode={extractionMode}
              />
            </TabsContent>
            
            <TabsContent value="data-review" className="space-y-4">
              <DocumentIntakeForm 
                extractedData={extractedData}
                regulatoryContext={deviceType}
                onApplyData={handleApplyData}
              />
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => {
                const prevTab = activeTab === 'analyze' ? 'upload' : 
                  activeTab === 'data-review' ? 'analyze' : null;
                
                if (prevTab) {
                  setActiveTab(prevTab);
                }
              }}
              disabled={activeTab === 'upload'}
            >
              Back
            </Button>
            
            <Button
              onClick={() => {
                const nextTab = activeTab === 'upload' ? 'analyze' : 
                  activeTab === 'analyze' ? 'data-review' : null;
                
                if (nextTab === 'analyze' && processedDocuments.length === 0) {
                  toast({
                    title: "No Documents",
                    description: "Please upload and process documents first.",
                    variant: "warning"
                  });
                  return;
                }
                
                if (nextTab === 'data-review' && !extractedData) {
                  toast({
                    title: "No Data Extracted",
                    description: "Please extract data from documents first.",
                    variant: "warning"
                  });
                  return;
                }
                
                if (nextTab) {
                  setActiveTab(nextTab);
                }
              }}
              disabled={
                (activeTab === 'upload' && processedDocuments.length === 0) ||
                (activeTab === 'analyze' && !extractedData) ||
                activeTab === 'data-review'
              }
              className="flex items-center gap-2"
            >
              <span>Next Step</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentIntelligenceTab;