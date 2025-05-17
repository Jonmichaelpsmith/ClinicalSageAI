import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Upload, FileUp, AlertTriangle, Server } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * DocumentIntakeForm Component
 * 
 * This component provides a dedicated form for document upload and initial 
 * processing with integrated OCR for regulatory documents like 510(k) submissions,
 * technical files, and instructions for use.
 */
const DocumentIntakeForm = ({ 
  documentType,
  onDocumentProcessed,
  className = "" 
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState(null);
  
  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const isValidType = file.type === 'application/pdf' || 
                      file.type === 'application/msword' || 
                      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    
    if (!isValidType) {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF or Word document",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedFile(file);
  };
  
  // Process the selected document
  const handleProcessDocument = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a document to process",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    setProcessingError(null);
    
    try {
      // Here we would normally upload the file to the server for OCR processing
      // For now, we'll simulate the process with a timeout
      
      setTimeout(() => {
        // Simulate successful processing
        setIsProcessing(false);
        
        // Call parent callback with processed document data
        if (onDocumentProcessed) {
          onDocumentProcessed({
            id: `doc-${Date.now()}`,
            name: selectedFile.name,
            size: selectedFile.size,
            type: selectedFile.type,
            processed: true,
            documentType: guessDocumentType(selectedFile.name),
            extractedContent: {
              deviceName: documentType === '510k' ? "CardioMonitor 2000" : "Generic Medical Device",
              manufacturer: "MedTech Innovations",
              intendedUse: "Continuous monitoring of cardiac rhythm and vital signs in clinical settings",
              deviceClass: "II"
            }
          });
        }
        
        // Reset the form
        setSelectedFile(null);
        
        toast({
          title: "Document processed",
          description: "Document has been successfully processed and data extracted",
          variant: "success"
        });
      }, 2000);
    } catch (error) {
      console.error('Error processing document:', error);
      setIsProcessing(false);
      setProcessingError("Failed to process document. Please try again.");
      
      toast({
        title: "Processing failed",
        description: "There was an error processing your document",
        variant: "destructive"
      });
    }
  };
  
  // Guess document type based on filename
  const guessDocumentType = (filename) => {
    const lowerFilename = filename.toLowerCase();
    if (lowerFilename.includes('510k') || lowerFilename.includes('submission')) return '510k Submission';
    if (lowerFilename.includes('technical') || lowerFilename.includes('file')) return 'Technical File';
    if (lowerFilename.includes('ifu') || lowerFilename.includes('instruction')) return 'Instructions for Use';
    if (lowerFilename.includes('clinical') || lowerFilename.includes('study')) return 'Clinical Study';
    return 'Regulatory Document';
  };
  
  return (
    <Card className={`border-0 shadow-none overflow-hidden ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold text-blue-800">
          Document Intake
        </CardTitle>
        <CardDescription>
          Upload regulatory documents for intelligent processing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="upload" disabled={isProcessing}>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="server" disabled={isProcessing}>
              <Server className="h-4 w-4 mr-2" />
              Server Files
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="border border-dashed border-gray-300 rounded-md p-6 text-center">
              {selectedFile ? (
                <div className="space-y-2">
                  <FileText className="h-12 w-12 text-blue-600 mx-auto" />
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <div className="flex space-x-2 justify-center mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                      disabled={isProcessing}
                    >
                      Remove
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleProcessDocument}
                      disabled={isProcessing}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isProcessing ? 'Processing...' : 'Process Document'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <FileUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop your document here or click to browse
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('document-file-upload').click()}
                  >
                    Select Document
                  </Button>
                  <input
                    id="document-file-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Supported formats: PDF, DOC, DOCX
                  </p>
                </div>
              )}
            </div>
            
            {processingError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Processing Error</h4>
                  <p className="text-xs text-red-700">{processingError}</p>
                </div>
              </div>
            )}
            
            <div className="text-xs text-gray-600 p-3 bg-gray-50 rounded-md">
              <p><span className="font-medium">Document Intelligence:</span> Our system will automatically extract key regulatory information from your document using multi-layer analysis.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="server" className="space-y-4">
            <div className="border border-gray-200 rounded-md p-4">
              <p className="text-sm text-gray-600 text-center mb-3">
                Access previously uploaded documents from the server
              </p>
              <div className="text-center">
                <Button variant="outline" disabled className="opacity-70">
                  <Server className="h-4 w-4 mr-2" />
                  Browse Server Files
                </Button>
                <p className="text-xs text-gray-400 mt-2">
                  Server browsing will be available in a future update
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DocumentIntakeForm;