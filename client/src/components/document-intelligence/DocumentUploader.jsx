/**
 * DocumentUploader Component
 * 
 * A component for uploading and extracting structured data from regulatory documents.
 * Supports PDF, DOCX, DOC, and TXT files with AI-assisted extraction.
 */

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  FileText, 
  File, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  X 
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * Document Uploader Component
 * 
 * @param {Object} props Component properties
 * @param {function} props.onExtractedData Callback function to receive extracted data
 * @param {function} props.onError Callback function for errors
 * @param {string[]} props.acceptedTypes Array of accepted file extensions (default: ['.pdf', '.docx', '.doc', '.txt'])
 * @param {string} props.documentType Type of document being uploaded (default: 'technical')
 * @param {boolean} props.showResults Whether to display extraction results (default: true)
 * @param {number} props.confidenceThreshold Minimum confidence threshold for field extraction (default: 0.7)
 * @param {number} props.maxFiles Maximum number of files allowed (default: 5)
 * @param {number} props.maxSize Maximum file size in MB (default: 20)
 */
const DocumentUploader = ({ 
  onExtractedData, 
  onError,
  acceptedTypes = ['.pdf', '.docx', '.doc', '.txt'],
  documentType = 'technical',
  showResults = true,
  confidenceThreshold = 0.7,
  maxFiles = 5,
  maxSize = 20
}) => {
  // Component state
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedFields, setExtractedFields] = useState([]);
  const [error, setError] = useState(null);
  const [selectedDocType, setSelectedDocType] = useState(documentType);
  const fileInputRef = useRef(null);
  const { toast } = useToast();
  
  // Format file size for display
  const formatFileSize = (size) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };
  
  // Check if file type is allowed
  const isValidFileType = (file) => {
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    return acceptedTypes.includes(fileExt);
  };
  
  // Check file size
  const isValidFileSize = (file) => {
    return file.size <= maxSize * 1024 * 1024;
  };
  
  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Check number of files
    if (selectedFiles.length > maxFiles) {
      setError(`You can only upload up to ${maxFiles} files at once.`);
      toast({
        variant: "destructive",
        title: "Too many files",
        description: `You can only upload up to ${maxFiles} files at once.`
      });
      return;
    }
    
    // Validate each file
    const validFiles = selectedFiles.filter(file => {
      // Check file type
      if (!isValidFileType(file)) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: `${file.name} is not a supported file type. Please upload ${acceptedTypes.join(', ')} files.`
        });
        return false;
      }
      
      // Check file size
      if (!isValidFileSize(file)) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: `${file.name} exceeds the maximum file size of ${maxSize}MB.`
        });
        return false;
      }
      
      return true;
    });
    
    // Update files state
    setFiles(validFiles);
    setError(null);
    setExtractedFields([]);
    
    // Clear file input
    e.target.value = null;
  };
  
  // Handle file removal
  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
    setExtractedFields([]);
  };
  
  // Handle document type selection
  const handleDocTypeChange = (value) => {
    setSelectedDocType(value);
  };
  
  // Handle file upload and processing
  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please select at least one file to upload.");
      toast({
        variant: "destructive",
        title: "No files selected",
        description: "Please select at least one file to upload."
      });
      return;
    }
    
    setUploading(true);
    setProcessing(true);
    setUploadProgress(0);
    setError(null);
    
    try {
      // Create form data for upload
      const formData = new FormData();
      
      // Add files to form data
      files.forEach(file => {
        formData.append('documents', file);
      });
      
      // Add document type and confidence threshold
      formData.append('documentType', selectedDocType);
      formData.append('confidenceThreshold', confidenceThreshold.toString());
      
      // Create fake progress updates (since we can't track actual progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);
      
      // Send the files to the backend
      const response = await fetch('/api/document-intelligence/process', {
        method: 'POST',
        body: formData,
      });
      
      // Clear progress interval
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Process response
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error processing documents');
      }
      
      // Parse response data
      const data = await response.json();
      
      // Update state with extracted fields
      setExtractedFields(data.extractedFields || []);
      
      // Notify parent component
      if (onExtractedData) {
        onExtractedData(data.extractedFields);
      }
      
      // Show success toast
      toast({
        title: "Processing complete",
        description: `Successfully extracted ${data.extractedFields.length} fields from your document${files.length > 1 ? 's' : ''}.`,
        variant: "default"
      });
    } catch (error) {
      console.error('Document processing error:', error);
      setError(error.message || 'Error processing document');
      
      if (onError) {
        onError(error);
      }
      
      toast({
        variant: "destructive",
        title: "Processing failed",
        description: error.message || 'Error processing document'
      });
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };
  
  // Trigger file selection dialog
  const triggerFileSelection = () => {
    fileInputRef.current.click();
  };
  
  return (
    <div className="w-full">
      {/* Document type selector */}
      <div className="mb-4">
        <Label htmlFor="document-type">Document Type</Label>
        <Select 
          value={selectedDocType} 
          onValueChange={handleDocTypeChange}
          disabled={uploading || processing}
        >
          <SelectTrigger id="document-type" className="w-full">
            <SelectValue placeholder="Select document type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="technical">Technical File/Technical Documentation</SelectItem>
            <SelectItem value="510k">510(k) Submission</SelectItem>
            <SelectItem value="clinical">Clinical Study Report</SelectItem>
            <SelectItem value="instructions">Instructions for Use (IFU)</SelectItem>
            <SelectItem value="risk">Risk Analysis Document</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* File input (hidden) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept={acceptedTypes.join(',')}
        className="hidden"
        disabled={uploading || processing}
      />
      
      {/* File upload area */}
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center mb-4 cursor-pointer transition-colors ${
          uploading || processing ? 'bg-gray-100 border-gray-300' : 'hover:border-primary hover:bg-gray-50'
        }`}
        onClick={!uploading && !processing ? triggerFileSelection : undefined}
      >
        <Upload className="h-12 w-12 mx-auto mb-2 text-gray-400" />
        <h3 className="text-lg font-medium mb-1">Upload Documents</h3>
        <p className="text-sm text-gray-500 mb-2">
          Drag and drop your documents here or click to browse
        </p>
        <p className="text-xs text-gray-400">
          Supported formats: {acceptedTypes.join(', ')} · Max file size: {maxSize}MB · Max files: {maxFiles}
        </p>
      </div>
      
      {/* Selected files list */}
      {files.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium mb-2">Selected Documents ({files.length})</h4>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(index);
                  }}
                  disabled={uploading || processing}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Upload progress */}
      {uploading && (
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm">Uploading and processing...</span>
            <span className="text-sm">{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
      
      {/* Process button */}
      <Button 
        onClick={handleUpload} 
        disabled={files.length === 0 || uploading || processing}
        className="w-full mb-4"
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing
          </>
        ) : (
          <>
            <FileText className="mr-2 h-4 w-4" />
            Extract Data
          </>
        )}
      </Button>
      
      {/* Error message */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Extraction results */}
      {showResults && extractedFields.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium mb-2">Extraction Results</h4>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {extractedFields.map((field, index) => (
                  <div key={index} className="border-b pb-2 last:border-0">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-sm">{field.name}</div>
                      <Badge variant={field.confidence >= 0.8 ? "default" : "outline"}>
                        {Math.round(field.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    <div className="text-sm">{field.value}</div>
                    {field.source && (
                      <div className="text-xs text-gray-500 mt-1">Source: {field.source}</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DocumentUploader;