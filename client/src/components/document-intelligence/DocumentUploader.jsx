import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, FileText, AlertTriangle, X, CheckCircle2 } from 'lucide-react';
import { documentIntelligenceService } from '@/services/DocumentIntelligenceService';
import { useToast } from '@/hooks/use-toast';

/**
 * Document Uploader Component
 * 
 * This component handles the uploading and initial processing of documents
 * for the document intelligence system.
 * 
 * @param {Object} props
 * @param {string} props.regulatoryContext - The regulatory context (510k, cer, etc.)
 * @param {Function} props.onDocumentsProcessed - Callback for when documents are processed
 * @param {string} props.extractionMode - The extraction mode to use
 * @param {Function} props.onExtractionModeChange - Callback when extraction mode changes
 */
const DocumentUploader = ({
  regulatoryContext = '510k',
  onDocumentsProcessed,
  extractionMode = 'comprehensive',
  onExtractionModeChange
}) => {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [compatibleTypes, setCompatibleTypes] = useState([]);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  // Handle file selection through the input element
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    setUploadError(null);
  };

  // Handle files dropped directly on the drop zone
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(droppedFiles);
    setUploadError(null);
  };

  // Prevent default behavior for drag events to allow drop
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Upload and process the selected documents
  const handleUpload = async () => {
    if (files.length === 0) {
      setUploadError('Please select at least one document to upload.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      // Progress callback to update upload progress
      const progressCallback = (progress) => {
        setUploadProgress(progress);
      };

      // Process the documents
      const processedDocs = await documentIntelligenceService.processDocuments(
        files,
        regulatoryContext,
        progressCallback,
        extractionMode
      );

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Call the callback with processed documents
      if (onDocumentsProcessed) {
        onDocumentsProcessed(processedDocs);
      }

      // Show success toast
      toast({
        title: 'Documents Uploaded',
        description: `Successfully uploaded ${files.length} document(s).`,
        variant: 'success',
      });

      // Reset files after successful upload
      setFiles([]);
    } catch (error) {
      console.error('Error uploading documents:', error);
      setUploadError(error.message || 'An error occurred while uploading documents.');
      
      // Show error toast
      toast({
        title: 'Upload Failed',
        description: error.message || 'An error occurred while uploading documents.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Get compatible document types on component mount
  React.useEffect(() => {
    const getCompatibleTypes = async () => {
      try {
        const types = await documentIntelligenceService.getCompatibleDocumentTypes(regulatoryContext);
        setCompatibleTypes(types);
      } catch (error) {
        console.error('Error fetching compatible document types:', error);
      }
    };

    getCompatibleTypes();
  }, [regulatoryContext]);

  // Remove a file from the selection
  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
          <CardDescription>
            Upload regulatory documents to extract device information and streamline your workflow.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Extraction Mode Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Extraction Mode</label>
            <Select 
              value={extractionMode} 
              onValueChange={(value) => {
                if (onExtractionModeChange) {
                  onExtractionModeChange(value);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select extraction mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic (Fast)</SelectItem>
                <SelectItem value="enhanced">Enhanced</SelectItem>
                <SelectItem value="regulatory">Regulatory Focus</SelectItem>
                <SelectItem value="comprehensive">Comprehensive (Detailed)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {extractionMode === 'basic' && 'Basic extraction provides quick results with essential information only.'}
              {extractionMode === 'enhanced' && 'Enhanced extraction balances speed and detail for most use cases.'}
              {extractionMode === 'regulatory' && 'Regulatory focus optimizes extraction for compliance data and requirements.'}
              {extractionMode === 'comprehensive' && 'Comprehensive extraction provides the most detailed results but takes longer to process.'}
            </p>
          </div>

          {/* File Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center hover:bg-accent/50 transition-colors ${
              isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              multiple
              accept=".pdf,.docx,.doc,.xml,.txt"
              disabled={isUploading}
            />
            <div className="flex flex-col items-center justify-center py-4">
              <Upload className="h-10 w-10 mb-2 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-1">Upload Documents</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop files here or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Accepted formats: PDF, DOCX, DOC, XML, TXT
              </p>
            </div>
          </div>

          {/* Compatible Document Types */}
          {compatibleTypes.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Compatible Document Types:</p>
              <ul className="list-disc list-inside">
                {compatibleTypes.map((type, index) => (
                  <li key={index}>{type.name} - {type.description}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Selected Files ({files.length})</h4>
              <ul className="divide-y">
                {files.map((file, index) => (
                  <li key={index} className="py-2 flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uploading...</span>
                <span className="text-sm">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {/* Upload Error */}
          {uploadError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Upload Error</AlertTitle>
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          {/* Upload Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleUpload}
              disabled={isUploading || files.length === 0}
              className="flex items-center gap-2"
            >
              {isUploading ? 'Uploading...' : 'Upload and Process'}
              {!isUploading && <CheckCircle2 className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentUploader;