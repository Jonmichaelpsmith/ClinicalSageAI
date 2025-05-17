import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  FileUp, 
  RotateCw,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { documentIntelligenceService } from '@/services/DocumentIntelligenceService';

/**
 * Document Uploader Component
 * 
 * This component handles file uploads for document intelligence processing.
 * 
 * @param {Object} props
 * @param {string} props.regulatoryContext - The regulatory context (510k, cer, etc.)
 * @param {Function} props.onDocumentsProcessed - Callback for when documents are processed
 */
const DocumentUploader = ({
  regulatoryContext = '510k',
  onDocumentsProcessed
}) => {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processedDocuments, setProcessedDocuments] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  // Handle file selection from input
  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    
    // Validate file types
    const validFiles = selectedFiles.filter(file => {
      const fileType = file.type;
      return (
        fileType === 'application/pdf' ||
        fileType === 'application/msword' ||
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileType === 'text/plain'
      );
    });

    // Check for invalid files
    if (validFiles.length < selectedFiles.length) {
      toast({
        title: 'Invalid File Types',
        description: 'Only PDF, Word, and text files are supported.',
        variant: 'warning',
      });
    }

    // Add valid files to the list
    if (validFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...validFiles]);
    }
  };

  // Open file dialog
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Remove a file from the list
  const handleRemoveFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  // Process the uploaded files
  const handleProcessFiles = async () => {
    if (files.length === 0) {
      toast({
        title: 'No Files Selected',
        description: 'Please select at least one file to process.',
        variant: 'warning',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setProcessedDocuments([]);
    setDocumentTypes([]);

    try {
      // Process documents
      const processed = await documentIntelligenceService.processDocuments(
        files,
        regulatoryContext,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      // Identify document types
      const types = await documentIntelligenceService.identifyDocumentTypes(
        processed,
        regulatoryContext
      );

      // Update state
      setProcessedDocuments(processed);
      setDocumentTypes(types);

      // Notify parent component
      if (onDocumentsProcessed) {
        onDocumentsProcessed(processed, types);
      }

      toast({
        title: 'Processing Complete',
        description: `Successfully processed ${files.length} document(s).`,
        variant: 'success',
      });
    } catch (error) {
      console.error('Error processing files:', error);
      
      toast({
        title: 'Processing Failed',
        description: error.message || 'An error occurred during document processing.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Clear all files and reset state
  const handleClearAll = () => {
    setFiles([]);
    setProcessedDocuments([]);
    setDocumentTypes([]);
    
    // Notify parent component
    if (onDocumentsProcessed) {
      onDocumentsProcessed([], []);
    }
  };

  // Get file type icon component
  const getFileTypeIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    
    if (extension === 'pdf') {
      return <FileText className="h-4 w-4 text-red-500" />;
    } else if (['doc', 'docx'].includes(extension)) {
      return <FileText className="h-4 w-4 text-blue-500" />;
    } else if (extension === 'txt') {
      return <FileText className="h-4 w-4 text-gray-500" />;
    } else {
      return <FileText className="h-4 w-4" />;
    }
  };

  // Get file size string
  const getFileSizeString = (size) => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  // Get document processing status badge
  const getStatusBadge = (document) => {
    const typeInfo = documentTypes.find(type => type.documentId === document.id);
    
    if (!document.processed) {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
          Pending
        </Badge>
      );
    }
    
    if (typeInfo) {
      const confidence = typeInfo.confidence || 0;
      
      if (confidence >= 0.8) {
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Processed - High Confidence
          </Badge>
        );
      } else if (confidence >= 0.5) {
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
            Processed - Medium Confidence
          </Badge>
        );
      } else {
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700">
            Processed - Low Confidence
          </Badge>
        );
      }
    }
    
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700">
        Processed
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Document Upload
          </CardTitle>
          <CardDescription>
            Upload documents for intelligent extraction and analysis.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Drop Zone */}
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center
              ${files.length === 0 ? 'border-primary/20' : 'border-primary/40 bg-primary/5'}
              transition-colors duration-200
            `}
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <FileUp className="h-8 w-8 text-primary/80" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-lg font-medium">Upload Documents</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Drag and drop your documents here, or click the button below to browse files.
                  <br />
                  Supported formats: PDF, Word, and plain text.
                </p>
              </div>
              
              <div className="space-x-2">
                <Button onClick={handleBrowseClick} disabled={isUploading}>
                  Browse Files
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleClearAll}
                  disabled={isUploading || files.length === 0}
                >
                  Clear All
                </Button>
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt"
                multiple
              />
            </div>
          </div>
          
          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Selected Files ({files.length})</h3>
                {processedDocuments.length > 0 && (
                  <div className="flex items-center">
                    <Info className="h-4 w-4 mr-1 text-blue-500" />
                    <span className="text-xs text-muted-foreground">
                      Processed {processedDocuments.length} of {files.length} files
                    </span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {files.map((file, index) => {
                  const processed = processedDocuments.find(doc => doc.filename === file.name);
                  
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/40 rounded-md"
                    >
                      <div className="flex items-center space-x-3">
                        {getFileTypeIcon(file.name)}
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {getFileSizeString(file.size)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {processed && getStatusBadge(processed)}
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFile(index)}
                          disabled={isUploading}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Progress Bar */}
          {isUploading && (
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Processing documents...</span>
                <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {uploadProgress < 30 ? 'Uploading documents...' :
                 uploadProgress < 60 ? 'Extracting content...' :
                 uploadProgress < 90 ? 'Identifying document types...' :
                 'Finalizing processing...'}
              </p>
            </div>
          )}
          
          {/* Information Messages */}
          {files.length > 0 && !isUploading && (
            <div className="mt-6">
              {processedDocuments.length === 0 ? (
                <div className="flex items-start p-3 bg-blue-50 rounded-md">
                  <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700">
                    Click the "Process Documents" button to extract content and identify document types.
                  </p>
                </div>
              ) : processedDocuments.length === files.length ? (
                <div className="flex items-start p-3 bg-green-50 rounded-md">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-700">
                    All documents have been processed successfully. You can now proceed to document analysis.
                  </p>
                </div>
              ) : (
                <div className="flex items-start p-3 bg-yellow-50 rounded-md">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-700">
                    Some documents have not been processed yet. Click "Process Documents" to continue.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            {regulatoryContext === '510k' ? 'FDA 510(k) Context' : 'CER Context'}
          </p>
          
          <Button
            onClick={handleProcessFiles}
            disabled={isUploading || files.length === 0}
          >
            {isUploading ? (
              <>
                <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : processedDocuments.length === files.length && files.length > 0 ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Reprocess Documents
              </>
            ) : (
              <>Process Documents</>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DocumentUploader;