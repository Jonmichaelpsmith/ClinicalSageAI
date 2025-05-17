import { useState, useEffect } from 'react';
import { DocumentIntakePanel } from '@/components/document-intelligence/DocumentIntakePanel';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentCheck, FileUp, FileSearch } from 'lucide-react';

/**
 * Main Document Intelligence Panel that integrates document processing capabilities
 * within TrialSage.
 */
export const DocumentIntelligencePanel = ({ 
  deviceId,
  onDataExtracted,
  regulatoryContext = '510k'
}) => {
  const [activeMode, setActiveMode] = useState('intake');
  const [processedDocuments, setProcessedDocuments] = useState([]);
  const [extractedData, setExtractedData] = useState(null);
  
  /**
   * Handle documents processed by the document uploader
   */
  const handleDocumentsProcessed = (documents) => {
    setProcessedDocuments(documents);
  };
  
  /**
   * Handle data extracted from documents
   */
  const handleDataExtracted = (data) => {
    setExtractedData(data);
    
    if (onDataExtracted) {
      onDataExtracted(data);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <DocumentCheck className="h-6 w-6 mr-2 text-primary" />
          Document Intelligence
        </CardTitle>
        <CardDescription>
          Upload and process regulatory documents to extract device data automatically
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeMode} onValueChange={setActiveMode} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="intake" className="flex items-center">
              <FileUp className="h-4 w-4 mr-2" /> 
              Document Intake
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center">
              <FileSearch className="h-4 w-4 mr-2" /> 
              Document Search
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="intake">
            <DocumentIntakePanel 
              deviceId={deviceId}
              onDocumentsProcessed={handleDocumentsProcessed}
              onDataExtracted={handleDataExtracted}
              regulatoryContext={regulatoryContext}
            />
          </TabsContent>
          
          <TabsContent value="search">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-xl">Document Search</CardTitle>
                <CardDescription>
                  Search for and import data from existing regulatory documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <FileSearch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Document Search</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-md">
                      Search functionality is coming soon. This will allow you to find and reuse 
                      regulatory documents from your organization's document repository.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};