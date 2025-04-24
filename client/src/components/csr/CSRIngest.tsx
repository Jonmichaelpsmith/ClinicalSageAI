import React, { useState } from 'react';
import { useDropzone, FileWithPath } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

export default function CSRIngest() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [rejectedFiles, setRejectedFiles] = useState<{name: string, reason: string}[]>([]);
  const { toast } = useToast();

  const onDrop = React.useCallback((acceptedFiles: FileWithPath[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  });

  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate progress updates
      const timer = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(timer);
            return prev;
          }
          return prev + 5;
        });
      }, 300);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      clearInterval(timer);
      setUploadProgress(100);
      
      const uploaded = files.map(f => f.name);
      setUploadedFiles(prev => [...prev, ...uploaded]);
      setFiles([]);
      
      toast({
        title: "Upload Complete",
        description: `Successfully processed ${uploaded.length} CSR documents`,
        variant: "success"
      });
      
      // Simulate rejection of a file randomly (for demo purposes)
      if (Math.random() > 0.7 && files.length > 1) {
        const rejectedIndex = Math.floor(Math.random() * files.length);
        const rejectedFile = files[rejectedIndex].name;
        setRejectedFiles(prev => [...prev, {
          name: rejectedFile,
          reason: "Invalid document format or content"
        }]);
        
        toast({
          title: "Warning",
          description: `${rejectedFile} couldn't be processed`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "There was an error uploading the CSR documents",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5" /> 
          CSR Document Ingestion
        </CardTitle>
        <CardDescription>
          Upload CSR documents for analysis and cross-study insights
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-6 cursor-pointer text-center transition-colors ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            {isDragActive
              ? "Drop the files here"
              : "Drag & drop CSR files here, or click to select files"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Supported formats: PDF, DOC, DOCX
          </p>
        </div>
        
        {files.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Files to upload ({files.length})</h3>
            <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {files.map((file, index) => (
                <li key={file.name + index} className="flex items-center justify-between text-sm py-1 px-2 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="truncate max-w-[200px]">{file.name}</span>
                    <span className="ml-2 text-gray-500">({Math.round(file.size / 1024)} KB)</span>
                  </div>
                  <button 
                    onClick={() => removeFile(index)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {uploading && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}
        
        {(uploadedFiles.length > 0 || rejectedFiles.length > 0) && (
          <div className="mt-4 border-t pt-3">
            <h3 className="text-sm font-medium mb-2">Processing results</h3>
            
            {uploadedFiles.length > 0 && (
              <div className="mb-3">
                <h4 className="text-xs font-medium text-green-700 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" /> Successfully processed
                </h4>
                <ul className="text-xs text-gray-600 ml-4 mt-1">
                  {uploadedFiles.slice(-5).map((file, i) => (
                    <li key={i} className="truncate">{file}</li>
                  ))}
                  {uploadedFiles.length > 5 && <li className="text-gray-500">+{uploadedFiles.length - 5} more</li>}
                </ul>
              </div>
            )}
            
            {rejectedFiles.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-red-700 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" /> Failed to process
                </h4>
                <ul className="text-xs text-gray-600 ml-4 mt-1">
                  {rejectedFiles.map((file, i) => (
                    <li key={i} className="truncate">
                      {file.name} - <span className="text-red-600">{file.reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          className="w-full"
        >
          {uploading ? 'Processing...' : `Upload ${files.length > 0 ? `(${files.length})` : ''}`}
        </Button>
      </CardFooter>
    </Card>
  );
}