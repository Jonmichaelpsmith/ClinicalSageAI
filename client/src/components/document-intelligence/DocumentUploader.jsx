import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * DocumentUploader Component
 * 
 * This component handles document uploading and initial processing for the document
 * intelligence system. It supports:
 * 1. Drag-and-drop file uploads
 * 2. Multiple file selection
 * 3. File type validation for regulatory documents
 * 4. Initial processing state management
 */
const DocumentUploader = ({ onUploadComplete, isProcessing, documentType, deviceProfileId }) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const isValidType = file.type === 'application/pdf' || 
                          file.type === 'application/msword' || 
                          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      
      if (!isValidType) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not a supported document type. Please use PDF or Word documents.`,
          variant: "destructive"
        });
      }
      
      return isValidType;
    });
    
    setSelectedFiles(prevFiles => [...prevFiles, ...validFiles]);
  };

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
    }
  };

  // Remove a file from the selection
  const handleRemoveFile = (index) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  // Process the selected files
  const handleProcessFiles = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select documents to analyze.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // In a real implementation, we would upload files to the server here
      // For now, we'll simulate a successful upload
      
      // Create document records to pass back to parent
      const processedDocuments = selectedFiles.map((file, index) => ({
        id: `doc-${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        deviceId: deviceProfileId,
        documentType
      }));
      
      // Simulate network delay
      setTimeout(() => {
        onUploadComplete(processedDocuments);
        setIsUploading(false);
        setSelectedFiles([]);
      }, 1500);
    } catch (error) {
      console.error('Error processing files:', error);
      toast({
        title: "Upload Failed",
        description: "There was an error processing your documents. Please try again.",
        variant: "destructive"
      });
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
          isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <Upload className="h-12 w-12 text-blue-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Documents</h3>
          <p className="text-sm text-gray-500 mb-4">
            Drag & drop regulatory documents or click to browse
          </p>
          <Button type="button" variant="outline" className="mt-2">
            Select Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
            accept=".pdf,.doc,.docx"
          />
          <p className="text-xs text-gray-400 mt-4">
            Supported formats: PDF, DOC, DOCX
          </p>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-3">Selected Documents</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center p-2 bg-gray-50 rounded-md">
                  <FileText className="h-5 w-5 text-blue-600 mr-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(index);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleProcessFiles}
                disabled={isUploading || isProcessing}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isUploading || isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Process Documents
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentUploader;