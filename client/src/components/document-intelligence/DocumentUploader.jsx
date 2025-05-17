import { useState } from 'react';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { FileUploader } from '@/components/ui/file-uploader';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { documentIntelligenceService } from '@/services/DocumentIntelligenceService';

/**
 * DocumentUploader component that handles uploading and processing
 * documents for the document intelligence system.
 */
export const DocumentUploader = ({ 
  onDocumentsProcessed, 
  maxFiles = 10,
  regulatoryContext = '510k',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState(null);
  const { toast } = useToast();
  
  /**
   * Handle file selection and upload
   * @param {File[]} files - Array of selected files
   */
  const handleFilesSelected = async (files) => {
    if (!files.length) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setProcessingStatus('Uploading documents...');
    
    try {
      // Create FormData object for file upload
      const formData = new FormData();
      
      // Add files to the FormData object
      files.forEach((file, index) => {
        formData.append('files', file);
      });
      
      // Add metadata - regulatory context helps with document recognition
      formData.append('regulatoryContext', regulatoryContext);
      
      // Simulate upload progress (in a real implementation, you could use XMLHttpRequest or fetch with progress tracking)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = Math.min(prev + Math.random() * 10, 90);
          return newProgress;
        });
      }, 300);
      
      // Upload files
      setProcessingStatus('Uploading documents...');
      const response = await documentIntelligenceService.uploadDocuments(formData);
      
      // Stop the progress simulation
      clearInterval(progressInterval);
      setUploadProgress(100);
      setProcessingStatus('Processing documents...');
      
      // Allow the 100% progress state to render before proceeding
      setTimeout(() => {
        setIsUploading(false);
        setProcessingStatus(null);
        setUploadProgress(0);
        
        // Pass processed documents back to parent component
        if (response.processedDocuments && response.processedDocuments.length) {
          onDocumentsProcessed(response.processedDocuments);
          
          toast({
            title: 'Documents Processed',
            description: `Successfully processed ${response.processedDocuments.length} document(s)`,
            variant: 'success',
          });
        } else {
          toast({
            title: 'Processing Complete',
            description: 'No documents were successfully processed',
            variant: 'warning',
          });
        }
      }, 500);
      
    } catch (error) {
      console.error('Error uploading documents:', error);
      setIsUploading(false);
      setProcessingStatus(null);
      setUploadProgress(0);
      
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload documents. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Document Upload</CardTitle>
        <CardDescription>
          Upload regulatory documents to extract device data automatically
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isUploading ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              {uploadProgress < 100 ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
              <span className="text-sm font-medium">{processingStatus}</span>
            </div>
            <Progress value={uploadProgress} max={100} className="h-2" variant={uploadProgress < 100 ? "primary" : "success"} />
            <p className="text-xs text-muted-foreground">
              {uploadProgress < 100 ? 'Please wait while your documents are being uploaded and processed' : 'Documents uploaded, processing content...'}
            </p>
          </div>
        ) : (
          <FileUploader
            onFilesSelected={handleFilesSelected}
            maxFiles={maxFiles}
            multiple={true}
            acceptedFileTypesMessage="PDF, Word, Excel, Images, Text, and XML files are supported"
          />
        )}
        
        <div className="mt-4 text-xs text-muted-foreground flex items-start">
          <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
          <p>
            Upload regulatory documents such as technical files, 510(k) submissions, instructions for use, 
            or test reports to automatically extract device information and specifications.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};