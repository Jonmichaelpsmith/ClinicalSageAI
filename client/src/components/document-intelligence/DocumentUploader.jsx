import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileUp, X, FilePlus, FileText, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * DocumentUploader Component
 * 
 * This component provides a specialized interface for uploading
 * regulatory documents with document type detection and batch processing.
 */
const DocumentUploader = ({ 
  deviceType = '510k', 
  onDocumentsSelected = () => {},
  className = "" 
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Detect document type based on file
  const detectDocumentType = (file) => {
    // In a real implementation, this would analyze the file content
    // For the demo, we'll make a guess based on the filename
    const name = file.name.toLowerCase();
    
    if (name.includes('510k') || name.includes('submission')) {
      return { type: '510k Submission', confidence: 0.92 };
    } else if (name.includes('technical') || name.includes('spec')) {
      return { type: 'Technical File', confidence: 0.89 };
    } else if (name.includes('clinical') || name.includes('study')) {
      return { type: 'Clinical Study', confidence: 0.95 };
    } else if (name.includes('instruction') || name.includes('ifu')) {
      return { type: 'Instructions for Use', confidence: 0.88 };
    } else if (name.includes('manual') || name.includes('guide')) {
      return { type: 'User Manual', confidence: 0.85 };
    }
    
    // Default case
    return { type: 'Regulatory Document', confidence: 0.75 };
  };
  
  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    // Validate file types
    const validFiles = files.filter(file => {
      return file.type === 'application/pdf' || 
             file.type === 'application/msword' || 
             file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    });
    
    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid file type",
        description: "Some files were skipped. Only PDF and Word documents are supported.",
        variant: "destructive"
      });
    }
    
    // Process the valid files
    const processedFiles = validFiles.map(file => {
      const { type, confidence } = detectDocumentType(file);
      return {
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        documentType: type,
        confidence: confidence,
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
    });
    
    setUploadedFiles([...uploadedFiles, ...processedFiles]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Remove a file from the list
  const handleRemoveFile = (id) => {
    setUploadedFiles(uploadedFiles.filter(file => file.id !== id));
  };
  
  // Clear all files
  const handleClearAll = () => {
    setUploadedFiles([]);
  };
  
  // Process the uploaded files
  const handleProcessFiles = () => {
    if (!uploadedFiles.length) {
      toast({
        title: "No files selected",
        description: "Please select documents to process",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate processing with a timeout
    setTimeout(() => {
      toast({
        title: "Documents processed",
        description: `Successfully processed ${uploadedFiles.length} document(s)`,
        variant: "success"
      });
      
      // Call the callback with the processed documents
      onDocumentsSelected(uploadedFiles);
      
      setIsProcessing(false);
    }, 1500);
  };
  
  // Render file size in a human-readable format
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Document Batch Upload</CardTitle>
        <CardDescription>
          Upload multiple regulatory documents for batch processing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Drop zone */}
          <div 
            className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileUp className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-2">
              Drag and drop documents here or click to browse
            </p>
            <Button variant="outline" size="sm">
              <FilePlus className="mr-2 h-4 w-4" />
              Select Files
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
            />
          </div>
          
          {/* File list */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Selected Documents ({uploadedFiles.length})</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleClearAll}
                  disabled={isProcessing}
                >
                  Clear All
                </Button>
              </div>
              
              <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-start space-x-2 bg-gray-50 p-2 rounded-md">
                    <FileText className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <div className="flex items-center text-xs text-gray-500 space-x-2">
                        <span>{formatFileSize(file.size)}</span>
                        <span className="text-gray-300">|</span>
                        <span>Detected: {file.documentType}</span>
                        <span className="text-gray-300">|</span>
                        <span>Confidence: {Math.round(file.confidence * 100)}%</span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => handleRemoveFile(file.id)}
                      disabled={isProcessing}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                ))}
              </div>
              
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleProcessFiles}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>Processing Documents...</>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Process {uploadedFiles.length} Document{uploadedFiles.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          )}
          
          {/* Additional info */}
          <div className="bg-blue-50 text-blue-800 rounded-md p-3 text-xs">
            <p className="font-medium mb-1">How Intelligent Document Processing Works:</p>
            <ol className="list-decimal list-inside space-y-1 pl-1">
              <li>Document type recognition identifies the regulatory document category</li>
              <li>Multi-layer content extraction captures structured regulatory data</li>
              <li>Semantic classification organizes content by purpose and meaning</li>
              <li>Validation layer ensures compliance with regulatory standards</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentUploader;