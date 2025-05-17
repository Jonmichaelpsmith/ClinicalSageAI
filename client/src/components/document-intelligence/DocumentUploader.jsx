import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Upload, FileX, FileCheck, X, Info, File, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { documentIntelligenceService } from '@/services/DocumentIntelligenceService';

/**
 * Document Uploader Component
 * 
 * This component handles uploading and initial processing of documents
 * for the document intelligence system.
 * 
 * @param {Object} props
 * @param {string} props.regulatoryContext - The regulatory context (510k, cer, etc.)
 * @param {Function} props.onProcessingComplete - Callback when processing is complete
 */
const DocumentUploader = ({
  regulatoryContext = '510k',
  onProcessingComplete
}) => {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processedDocuments, setProcessedDocuments] = useState([]);
  const [compatibleTypes, setCompatibleTypes] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  // Load compatible document types when component mounts
  React.useEffect(() => {
    const loadCompatibleTypes = async () => {
      try {
        const types = await documentIntelligenceService.getCompatibleDocumentTypes(regulatoryContext);
        setCompatibleTypes(types);
      } catch (error) {
        console.error('Error loading compatible document types:', error);
      }
    };
    
    loadCompatibleTypes();
  }, [regulatoryContext]);

  // Handle file selection via button click
  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    
    if (selectedFiles.length === 0) return;
    
    // Add files to state
    setFiles(prev => [...prev, ...selectedFiles]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  // Remove a file from the list
  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Clear all files
  const clearFiles = () => {
    setFiles([]);
  };

  // Process the uploaded files
  const processFiles = async () => {
    if (files.length === 0) {
      toast({
        title: 'No Files Selected',
        description: 'Please select at least one document to process.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(uploadInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);
      
      // Process the documents
      const processed = await documentIntelligenceService.processDocuments(
        files,
        regulatoryContext,
        (progress) => {
          if (progress >= 0 && progress <= 100) {
            setUploadProgress(progress);
          }
        }
      );
      
      clearInterval(uploadInterval);
      setUploadProgress(100);
      
      // Update state with processed documents
      setProcessedDocuments(processed);
      
      // Show success message
      toast({
        title: 'Processing Complete',
        description: `Successfully processed ${processed.length} document(s).`,
        variant: 'success',
      });
      
      // Call callback with processed documents
      if (onProcessingComplete) {
        onProcessingComplete(processed);
      }
    } catch (error) {
      console.error('Error processing documents:', error);
      
      toast({
        title: 'Processing Failed',
        description: error.message || 'An error occurred during document processing.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Reset the upload process
  const resetUpload = () => {
    setFiles([]);
    setUploadProgress(0);
    setProcessedDocuments([]);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Document Upload</CardTitle>
          <CardDescription>
            Upload your regulatory documents for intelligent analysis and data extraction.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Document Type Info */}
          {compatibleTypes.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Compatible Document Types</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {compatibleTypes.map((type, index) => (
                  <div key={index} className="bg-muted rounded-md p-2 text-sm">
                    <div className="font-medium">{type.name}</div>
                    <div className="text-xs text-muted-foreground">{type.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* File Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center ${
              dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center space-y-3">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-medium">Drop your documents here</h3>
              <p className="text-sm text-muted-foreground">
                or click the button below to select files
              </p>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.xml"
                  onChange={handleFileSelect}
                />
                <Button 
                  onClick={() => fileInputRef.current.click()}
                  disabled={isUploading}
                >
                  Select Files
                </Button>
              </div>
            </div>
          </div>
          
          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Selected Files ({files.length})</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFiles}
                  disabled={isUploading}
                  className="h-8 px-2 text-xs"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              </div>
              
              <div className="max-h-40 overflow-auto">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <File className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-sm truncate" style={{ maxWidth: '200px' }}>
                        {file.name}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={isUploading}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {uploadProgress === 100 ? 'Processing Complete' : 'Processing Documents...'}
                </span>
                <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
          
          {/* Processing Success Message */}
          {processedDocuments.length > 0 && !isUploading && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 flex">
              <FileCheck className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-green-800">Processing Complete</h4>
                <p className="text-xs text-green-700 mt-1">
                  Successfully processed {processedDocuments.length} document(s). You can now proceed to analyzing the documents.
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={resetUpload}
            disabled={isUploading || (files.length === 0 && processedDocuments.length === 0)}
          >
            Reset
          </Button>
          <Button
            onClick={processFiles}
            disabled={isUploading || files.length === 0}
          >
            Process Documents
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DocumentUploader;