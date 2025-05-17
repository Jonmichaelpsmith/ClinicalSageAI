import React, { useState, useCallback } from 'react';
// Using manual file input instead of react-dropzone due to dependency issues
// import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { X, FileText, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { documentIntelligenceService } from '@/services/DocumentIntelligenceService';

const DocumentUploader = ({ onDocumentsProcessed, regulatoryContext = '510k' }) => {
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

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to upload first.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + (100 - prev) * 0.1;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 300);

      // Create FormData
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('regulatoryContext', regulatoryContext);

      // Use the service to upload files
      const response = await documentIntelligenceService.uploadDocuments(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Notify success
      toast({
        title: "Upload Complete",
        description: `${files.length} document${files.length !== 1 ? 's' : ''} processed successfully.`,
      });

      // Pass processed documents to parent
      if (onDocumentsProcessed && response.processedDocuments) {
        onDocumentsProcessed(response.processedDocuments);
      }

      // Reset files after successful upload
      setFiles([]);
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className={`border-2 ${isDragActive ? 'border-primary border-dashed' : 'border-dashed'}`}>
        <CardContent className="p-6">
          <div 
            {...getRootProps()} 
            className="flex flex-col items-center justify-center p-6 rounded-md cursor-pointer"
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mb-4 text-gray-400" />
            <p className="mb-2 text-lg font-medium">Drag and drop files here</p>
            <p className="mb-4 text-sm text-gray-500">
              or click to select files
            </p>
            <Button type="button" variant="outline" size="sm">
              Select Files
            </Button>
            <p className="mt-4 text-xs text-gray-400">
              Supports PDF, Word, Excel, images, and other document formats (max 50MB per file)
            </p>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Selected Files ({files.length})</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFiles} 
                disabled={uploading}
              >
                Clear All
              </Button>
            </div>
            
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
              {files.map((file, i) => (
                <div key={`${file.name}-${i}`} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="flex-shrink-0 w-5 h-5 text-gray-500" />
                    <span className="truncate">{file.name}</span>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeFile(file)} 
                    disabled={uploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {uploading && (
              <div className="mt-4">
                <div className="flex justify-between mb-1 text-sm">
                  <span>Uploading...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} max={100} />
              </div>
            )}

            <div className="flex justify-end mt-4 gap-2">
              <Button 
                variant="outline" 
                onClick={clearFiles} 
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button 
                onClick={uploadFiles} 
                disabled={files.length === 0 || uploading}
              >
                {uploading ? 'Uploading...' : 'Upload and Process'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentUploader;