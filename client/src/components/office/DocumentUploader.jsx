import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  File, 
  FileText, 
  AlertTriangle, 
  Check, 
  X, 
  UploadCloud,
  Folder
} from 'lucide-react';

/**
 * Document Uploader Component
 * 
 * This component allows users to upload documents to the ClinicalSageAI platform,
 * supporting multiple file formats including Word, PDF, and Excel. It includes
 * validation, progress tracking, and regulatory categorization for eCTD compliance.
 *
 * The uploader integrates with the tenant management system to ensure documents
 * are stored in the appropriate tenant space with correct permissions.
 */
const DocumentUploader = ({ 
  onUploadComplete,
  acceptedFileTypes = ['.docx', '.doc', '.pdf', '.xlsx', '.xls', '.pptx', '.ppt', '.txt'],
  maxFileSize = 50, // in MB
  allowMultiple = false,
  ctdModules = true, // Allow eCTD module categorization
  tenantId = null // Current tenant ID
}) => {
  // State for file upload process
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  // State for eCTD module categorization
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedSubmodule, setSelectedSubmodule] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  
  // Reference to the file input
  const fileInputRef = useRef(null);
  
  // Access toast for notifications
  const { toast } = useToast();
  
  // eCTD modules and submodules
  const eCTDModules = [
    { id: 'm1', name: 'Module 1 - Administrative Information' },
    { id: 'm2', name: 'Module 2 - CTD Summaries' },
    { id: 'm3', name: 'Module 3 - Quality' },
    { id: 'm4', name: 'Module 4 - Nonclinical Study Reports' },
    { id: 'm5', name: 'Module 5 - Clinical Study Reports' }
  ];
  
  const eCTDSubmodules = {
    m1: [
      { id: 'm1.1', name: '1.1 Forms and Cover Letters' },
      { id: 'm1.2', name: '1.2 Administrative Information' },
      { id: 'm1.3', name: '1.3 Product Information' },
      { id: 'm1.4', name: '1.4 Reference Standards' }
    ],
    m2: [
      { id: 'm2.1', name: '2.1 CTD Table of Contents' },
      { id: 'm2.2', name: '2.2 CTD Introduction' },
      { id: 'm2.3', name: '2.3 Quality Overall Summary' },
      { id: 'm2.4', name: '2.4 Nonclinical Overview' },
      { id: 'm2.5', name: '2.5 Clinical Overview' },
      { id: 'm2.6', name: '2.6 Nonclinical Written and Tabulated Summaries' },
      { id: 'm2.7', name: '2.7 Clinical Summary' }
    ],
    m3: [
      { id: 'm3.1', name: '3.1 Table of Contents Module 3' },
      { id: 'm3.2', name: '3.2 Body of Data' },
      { id: 'm3.3', name: '3.3 Literature References' }
    ],
    m4: [
      { id: 'm4.1', name: '4.1 Table of Contents Module 4' },
      { id: 'm4.2', name: '4.2 Study Reports' },
      { id: 'm4.3', name: '4.3 Literature References' }
    ],
    m5: [
      { id: 'm5.1', name: '5.1 Table of Contents Module 5' },
      { id: 'm5.2', name: '5.2 Tabular Listing of Studies' },
      { id: 'm5.3', name: '5.3 Clinical Study Reports' },
      { id: 'm5.4', name: '5.4 Literature References' }
    ]
  };
  
  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setUploadError(null);
    setUploadSuccess(false);
    
    // Validate files
    const validFiles = files.filter(file => {
      // Check file type
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      const isValidType = acceptedFileTypes.includes(fileExtension);
      
      // Check file size
      const isValidSize = file.size <= maxFileSize * 1024 * 1024; // Convert to bytes
      
      if (!isValidType) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: `${file.name} is not an accepted file type. Please upload ${acceptedFileTypes.join(', ')} files.`
        });
      }
      
      if (!isValidSize) {
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: `${file.name} exceeds the maximum file size of ${maxFileSize}MB.`
        });
      }
      
      return isValidType && isValidSize;
    });
    
    // Store valid files
    if (!allowMultiple && validFiles.length > 1) {
      setSelectedFiles([validFiles[0]]);
      toast({
        variant: "default",
        title: "Single File Only",
        description: "Only the first file has been selected as multiple file upload is disabled."
      });
    } else {
      setSelectedFiles(validFiles);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle file upload
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        variant: "destructive",
        title: "No Files Selected",
        description: "Please select files to upload."
      });
      return;
    }
    
    // Validate eCTD metadata if required
    if (ctdModules && (!selectedModule || !documentTitle)) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select an eCTD module and enter a document title."
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(false);
    
    try {
      // Create form data
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      
      // Add metadata
      formData.append('documentTitle', documentTitle);
      formData.append('eCTDModule', selectedModule);
      formData.append('eCTDSubmodule', selectedSubmodule);
      
      // Add tenant information if available
      if (tenantId) {
        formData.append('tenantId', tenantId);
      }
      
      // Upload files with progress tracking
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      });
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // Success
          setUploadSuccess(true);
          setSelectedFiles([]);
          setDocumentTitle('');
          
          toast({
            title: "Upload Complete",
            description: `${selectedFiles.length} file(s) uploaded successfully.`,
          });
          
          // Call callback with result
          if (onUploadComplete) {
            try {
              const response = JSON.parse(xhr.responseText);
              onUploadComplete(response);
            } catch (e) {
              onUploadComplete({
                success: true,
                count: selectedFiles.length,
                files: selectedFiles.map(f => f.name)
              });
            }
          }
        } else {
          // Error
          let errorMessage = "An error occurred during upload.";
          try {
            const response = JSON.parse(xhr.responseText);
            errorMessage = response.message || errorMessage;
          } catch (e) {
            console.error('Error parsing error response:', e);
          }
          
          setUploadError(errorMessage);
          
          toast({
            variant: "destructive",
            title: "Upload Failed",
            description: errorMessage,
          });
        }
        
        setIsUploading(false);
      };
      
      xhr.onerror = () => {
        setUploadError("Network error occurred during upload.");
        setIsUploading(false);
        
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: "A network error occurred. Please try again.",
        });
      };
      
      // Open connection and send data
      xhr.open('POST', '/api/documents/upload');
      xhr.send(formData);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message || "An error occurred during upload.");
      setIsUploading(false);
      
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "An error occurred during upload.",
      });
    }
  };
  
  // Remove a file from selection
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  // Handle module selection
  const handleModuleChange = (value) => {
    setSelectedModule(value);
    setSelectedSubmodule('');
  };
  
  // Render file list
  const renderFileList = () => {
    if (selectedFiles.length === 0) {
      return (
        <div className="py-8 text-center text-gray-500">
          <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2">Drag and drop files here, or click to browse</p>
          <p className="mt-1 text-sm">Accepted formats: {acceptedFileTypes.join(', ')}</p>
          <p className="mt-1 text-sm">Maximum file size: {maxFileSize}MB</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-2 py-4">
        {selectedFiles.map((file, index) => (
          <div 
            key={`${file.name}-${index}`}
            className="flex items-center justify-between rounded-md border p-3"
          >
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeFile(index)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="mr-2 h-5 w-5" />
          Document Upload
        </CardTitle>
        <CardDescription>
          Upload regulatory documents to the ClinicalSageAI platform
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* File Uploader */}
        <div 
          className={`border-2 border-dashed rounded-md ${
            selectedFiles.length > 0 ? 'border-gray-300' : 'border-gray-200 hover:border-gray-300'
          } transition-colors cursor-pointer`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={allowMultiple}
            onChange={handleFileSelect}
            className="hidden"
            accept={acceptedFileTypes.join(',')}
          />
          {renderFileList()}
        </div>
        
        {/* Upload Progress */}
        {isUploading && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Uploading...</span>
              <span className="text-sm">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}
        
        {/* Upload Error */}
        {uploadError && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Upload Failed</AlertTitle>
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}
        
        {/* Upload Success */}
        {uploadSuccess && (
          <Alert className="mt-4">
            <Check className="h-4 w-4" />
            <AlertTitle>Upload Complete</AlertTitle>
            <AlertDescription>
              {selectedFiles.length > 0 
                ? `${selectedFiles.length} file(s) uploaded successfully.`
                : "Files uploaded successfully."}
            </AlertDescription>
          </Alert>
        )}
        
        {/* eCTD Module Selection */}
        {ctdModules && (
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="document-title">Document Title</Label>
              <Input
                id="document-title"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="Enter document title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ectd-module">eCTD Module</Label>
              <Select value={selectedModule} onValueChange={handleModuleChange}>
                <SelectTrigger id="ectd-module">
                  <SelectValue placeholder="Select eCTD module" />
                </SelectTrigger>
                <SelectContent>
                  {eCTDModules.map(module => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedModule && (
              <div className="space-y-2">
                <Label htmlFor="ectd-submodule">eCTD Submodule</Label>
                <Select 
                  value={selectedSubmodule} 
                  onValueChange={setSelectedSubmodule}
                >
                  <SelectTrigger id="ectd-submodule">
                    <SelectValue placeholder="Select eCTD submodule" />
                  </SelectTrigger>
                  <SelectContent>
                    {eCTDSubmodules[selectedModule]?.map(submodule => (
                      <SelectItem key={submodule.id} value={submodule.id}>
                        {submodule.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => {
            setSelectedFiles([]);
            setDocumentTitle('');
            setSelectedModule('');
            setSelectedSubmodule('');
            setUploadError(null);
            setUploadSuccess(false);
          }}
          disabled={isUploading || selectedFiles.length === 0}
        >
          Clear
        </Button>
        <Button
          onClick={handleUpload}
          disabled={isUploading || selectedFiles.length === 0}
        >
          {isUploading ? (
            <>Uploading...</>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DocumentUploader;