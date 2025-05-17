import React, { useState, useCallback } from 'react';
// Using manual file input instead of react-dropzone due to dependency issues
// import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { documentIntelligenceService } from '@/services/DocumentIntelligenceService';
import { X, Upload, FileText } from 'lucide-react';

/**
 * Document Uploader Component
 * 
 * This component provides an interface for uploading regulatory documents
 * and passing them to the document intelligence service for processing.
 * 
 * @param {Object} props Component props
 * @param {Function} props.onDocumentsProcessed Callback when documents are processed
 * @param {string} props.regulatoryContext The regulatory context for processing ('510k', 'cer', etc.)
 */
const DocumentUploader = ({ 
  onDocumentsProcessed, 
  regulatoryContext = '510k' 
}) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // Filter out any duplicate files
    const newFiles = selectedFiles.filter(
      newFile => !files.some(existingFile => 
        existingFile.name === newFile.name && 
        existingFile.size === newFile.size
      )
    );

    if (newFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  };

  const removeFile = (fileToRemove) => {
    setFiles(files.filter(file => file !== fileToRemove));
  };

  const clearFiles = () => {
    setFiles([]);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select files to upload.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Process documents through the document intelligence service
      const processedDocuments = await documentIntelligenceService.processDocuments(
        files,
        regulatoryContext,
        (progress) => {
          setUploadProgress(progress);
        }
      );
      
      // Display success notification
      toast({
        title: "Upload Successful",
        description: `${files.length} document(s) uploaded and processed successfully.`,
        variant: "default"
      });
      
      // Call the callback with processed documents
      if (onDocumentsProcessed) {
        // Add status and type information if not present
        const enhancedDocuments = processedDocuments.map((doc, index) => ({
          ...doc,
          // Use the original file object's properties if needed
          name: doc.name || files[index]?.name || `Document ${index + 1}`,
          size: doc.size || files[index]?.size || 0,
          type: doc.type || files[index]?.type || 'application/pdf',
          // Default status to 'processed' if not specified
          status: doc.status || 'processed',
          // Add a recognized type if not present
          recognizedType: doc.recognizedType || detectDocumentType(files[index], regulatoryContext)
        }));
        
        onDocumentsProcessed(enhancedDocuments);
      }
      
      // Clear the files list after successful upload
      clearFiles();
    } catch (error) {
      console.error('Error uploading documents:', error);
      
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload documents. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Simple heuristic to determine document type based on filename or content type
  const detectDocumentType = (file, context) => {
    const filename = file.name.toLowerCase();
    const type = file.type;
    
    if (context === '510k') {
      if (filename.includes('510') || filename.includes('k')) return '510k Submission';
      if (filename.includes('predicate')) return 'Predicate Device';
      if (filename.includes('test') || filename.includes('study')) return 'Test Report';
      if (filename.includes('spec') || filename.includes('technical')) return 'Technical Specifications';
    } else if (context === 'cer') {
      if (filename.includes('cer')) return 'Clinical Evaluation Report';
      if (filename.includes('clinical')) return 'Clinical Study';
      if (filename.includes('literature')) return 'Literature Review';
      if (filename.includes('post') || filename.includes('market')) return 'Post-Market Data';
    }
    
    // Default document types based on file extension
    if (filename.endsWith('.pdf')) return 'PDF Document';
    if (filename.endsWith('.docx') || filename.endsWith('.doc')) return 'Word Document';
    if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) return 'Excel Spreadsheet';
    if (filename.endsWith('.jpg') || filename.endsWith('.png')) return 'Image';
    
    return 'Unknown Document';
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="border-2 border-dashed">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center p-6 rounded-md">
            <Upload className="w-12 h-12 mb-4 text-gray-400" />
            <p className="mb-2 text-lg font-medium">Upload your documents</p>
            <p className="mb-4 text-sm text-gray-500">
              Select files for document intelligence processing
            </p>
            <label>
              <input 
                type="file" 
                multiple 
                className="hidden" 
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt,.rtf,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.xml,.json,.zip"
              />
              <Button type="button" variant="outline" size="sm" className="cursor-pointer">
                Select Files
              </Button>
            </label>
            <p className="mt-4 text-xs text-gray-400">
              Supports PDF, Word, Excel, images, and other document formats (max 50MB per file)
            </p>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Selected Files ({files.length})</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearFiles}
                disabled={uploading}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear All
              </Button>
            </div>
            
            <div className="space-y-2 max-h-[240px] overflow-y-auto p-1">
              {files.map((file, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-100"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">{file.name}</span>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file)}
                    disabled={uploading}
                    className="h-6 w-6 p-0 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            {uploading && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Uploading...</span>
                  <span className="text-sm text-gray-500">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
            
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleUpload}
                disabled={uploading || files.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {uploading ? 'Uploading...' : 'Process Documents'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentUploader;