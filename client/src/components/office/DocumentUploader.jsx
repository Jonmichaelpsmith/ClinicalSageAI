import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

import { 
  Upload, 
  FileText, 
  File, 
  Image as FileImage, 
  Archive as FileArchive,
  FileSpreadsheet,
  Cloud as CloudUpload,
  FolderPlus,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';

// Import SharePoint service for file upload to Microsoft 365
import * as SharePointService from '../../services/sharePointService';
import * as MsOfficeVaultBridge from '../../services/msOfficeVaultBridge';
import * as MicrosoftAuthService from '../../services/microsoftAuthService';

/**
 * Document Uploader Component
 * 
 * This component allows users to upload documents from their desktop to the Vault,
 * SharePoint, or OneDrive. It supports various document types including PDFs and
 * Microsoft Office documents.
 */
const DocumentUploader = ({ 
  onUploadComplete = () => {}, 
  defaultEctdSection = '',
  targetLocation = 'vault' // 'vault', 'sharepoint', or 'onedrive'
}) => {
  // Upload state
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadLocation, setUploadLocation] = useState(targetLocation);
  const [ectdSection, setEctdSection] = useState(defaultEctdSection);
  
  // File input ref
  const fileInputRef = useRef(null);
  
  // Common eCTD sections
  const ectdSections = [
    { value: 'm1.1', label: 'Module 1.1 - Forms and Administrative Info' },
    { value: 'm1.2', label: 'Module 1.2 - Cover Letters' },
    { value: 'm1.3', label: 'Module 1.3 - Administrative Information' },
    { value: 'm2.2', label: 'Module 2.2 - Introduction' },
    { value: 'm2.3', label: 'Module 2.3 - Quality Overall Summary' },
    { value: 'm2.4', label: 'Module 2.4 - Nonclinical Overview' },
    { value: 'm2.5', label: 'Module 2.5 - Clinical Overview' },
    { value: 'm2.6', label: 'Module 2.6 - Nonclinical Written and Tabulated Summaries' },
    { value: 'm2.7', label: 'Module 2.7 - Clinical Summary' },
    { value: 'm3.2.p', label: 'Module 3.2.P - Drug Product' },
    { value: 'm3.2.s', label: 'Module 3.2.S - Drug Substance' },
    { value: 'm4.2.1', label: 'Module 4.2.1 - Pharmacology' },
    { value: 'm4.2.2', label: 'Module 4.2.2 - Pharmacokinetics' },
    { value: 'm4.2.3', label: 'Module 4.2.3 - Toxicology' },
    { value: 'm5.2', label: 'Module 5.2 - Tabular Listing of Clinical Studies' },
    { value: 'm5.3.1', label: 'Module 5.3.1 - Reports of Biopharmaceutic Studies' },
    { value: 'm5.3.3', label: 'Module 5.3.3 - Reports of Human PK Studies' },
    { value: 'm5.3.5', label: 'Module 5.3.5 - Reports of Efficacy and Safety Studies' }
  ];
  
  // Upload locations
  const uploadLocations = [
    { value: 'vault', label: 'Document Vault' },
    { value: 'sharepoint', label: 'SharePoint' },
    { value: 'onedrive', label: 'OneDrive' }
  ];
  
  /**
   * Handle file selection via the file input
   */
  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    
    // Check file types and sizes
    const validFiles = selectedFiles.filter(file => {
      // Check file type
      const validTypes = [
        'application/pdf', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-powerpoint',
        'text/plain'
      ];
      
      const isValidType = validTypes.includes(file.type);
      
      // Check file size (max 100MB)
      const isValidSize = file.size <= 100 * 1024 * 1024;
      
      if (!isValidType) {
        toast({
          title: 'Invalid File Type',
          description: `${file.name} is not a supported document type.`,
          variant: 'destructive'
        });
      }
      
      if (!isValidSize) {
        toast({
          title: 'File Too Large',
          description: `${file.name} exceeds the maximum size limit of 100MB.`,
          variant: 'destructive'
        });
      }
      
      return isValidType && isValidSize;
    });
    
    // Add files to the list with status
    setFiles(prevFiles => [
      ...prevFiles,
      ...validFiles.map(file => ({
        file,
        status: 'pending', // 'pending', 'uploading', 'success', 'error'
        progress: 0,
        id: `file-${Date.now()}-${file.name}`
      }))
    ]);
    
    // Reset the file input
    event.target.value = null;
  };
  
  /**
   * Get file icon based on MIME type
   */
  const getFileIcon = (mimeType) => {
    if (mimeType === 'application/pdf') {
      return <FileText className="text-red-500" />;
    } else if (mimeType.includes('word')) {
      return <FileText className="text-blue-500" />;
    } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
      return <FileSpreadsheet className="text-green-500" />;
    } else if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
      return <FileText className="text-orange-500" />;
    } else if (mimeType.includes('image')) {
      return <FileImage className="text-purple-500" />;
    } else if (mimeType.includes('zip') || mimeType.includes('archive')) {
      return <FileArchive className="text-yellow-500" />;
    } else {
      return <File className="text-gray-500" />;
    }
  };
  
  /**
   * Remove a file from the list
   */
  const handleRemoveFile = (fileId) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
  };
  
  /**
   * Handle file upload to the selected location
   */
  const handleUpload = async () => {
    try {
      if (files.length === 0) {
        toast({
          title: 'No Files Selected',
          description: 'Please select at least one file to upload.',
          variant: 'destructive'
        });
        return;
      }
      
      // Check if eCTD section is selected when uploading to Vault
      if (uploadLocation === 'vault' && !ectdSection) {
        toast({
          title: 'Missing Information',
          description: 'Please select an eCTD section for the document(s).',
          variant: 'destructive'
        });
        return;
      }
      
      // Start uploading
      setUploading(true);
      setUploadProgress(0);
      setUploadComplete(false);
      
      // Update file statuses to uploading
      setFiles(prevFiles => 
        prevFiles.map(file => ({
          ...file,
          status: 'uploading',
          progress: 0
        }))
      );
      
      // Track overall progress
      let totalFiles = files.length;
      let completedFiles = 0;
      
      // Process each file
      for (let i = 0; i < files.length; i++) {
        const fileObj = files[i];
        const file = fileObj.file;
        
        try {
          // Update current file status
          setFiles(prevFiles => {
            const newFiles = [...prevFiles];
            newFiles[i] = {
              ...newFiles[i],
              status: 'uploading',
              progress: 0
            };
            return newFiles;
          });
          
          // Read file content
          const fileContent = await readFileAsArrayBuffer(file);
          
          // Upload based on selected location
          let uploadResult;
          
          if (uploadLocation === 'vault') {
            // Upload to document vault
            uploadResult = await uploadToVault(file, fileContent, ectdSection);
          } else if (uploadLocation === 'sharepoint') {
            // Upload to SharePoint
            uploadResult = await uploadToSharePoint(file, fileContent);
          } else if (uploadLocation === 'onedrive') {
            // Upload to OneDrive
            uploadResult = await uploadToOneDrive(file, fileContent);
          }
          
          // Simulate upload progress
          await simulateUploadProgress(i);
          
          // Update file status to success
          setFiles(prevFiles => {
            const newFiles = [...prevFiles];
            newFiles[i] = {
              ...newFiles[i],
              status: 'success',
              progress: 100,
              resultId: uploadResult.id || '',
              resultUrl: uploadResult.webUrl || ''
            };
            return newFiles;
          });
          
          // Update overall progress
          completedFiles++;
          const overallProgress = Math.round((completedFiles / totalFiles) * 100);
          setUploadProgress(overallProgress);
          
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          
          // Update file status to error
          setFiles(prevFiles => {
            const newFiles = [...prevFiles];
            newFiles[i] = {
              ...newFiles[i],
              status: 'error',
              progress: 0,
              error: error.message || 'Upload failed'
            };
            return newFiles;
          });
          
          // Update overall progress
          completedFiles++;
          const overallProgress = Math.round((completedFiles / totalFiles) * 100);
          setUploadProgress(overallProgress);
          
          // Show error toast
          toast({
            title: 'Upload Error',
            description: `Failed to upload ${file.name}: ${error.message || 'Unknown error'}`,
            variant: 'destructive'
          });
        }
      }
      
      // All files processed
      setUploading(false);
      setUploadComplete(true);
      
      // Check if all files were successful
      const allSuccess = files.every(file => file.status === 'success');
      
      if (allSuccess) {
        toast({
          title: 'Upload Complete',
          description: `Successfully uploaded ${files.length} file(s).`,
          variant: 'default'
        });
        
        // Notify parent component
        onUploadComplete(files.map(file => ({
          name: file.file.name,
          id: file.resultId,
          url: file.resultUrl,
          ectdSection
        })));
      } else {
        const successCount = files.filter(file => file.status === 'success').length;
        const errorCount = files.filter(file => file.status === 'error').length;
        
        toast({
          title: 'Upload Partially Complete',
          description: `${successCount} file(s) uploaded successfully. ${errorCount} file(s) failed.`,
          variant: 'default'
        });
        
        // Notify parent component with successful files only
        const successfulFiles = files.filter(file => file.status === 'success');
        onUploadComplete(successfulFiles.map(file => ({
          name: file.file.name,
          id: file.resultId,
          url: file.resultUrl,
          ectdSection
        })));
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
      
      toast({
        title: 'Upload Error',
        description: error.message || 'An error occurred during upload.',
        variant: 'destructive'
      });
    }
  };
  
  /**
   * Read a file as ArrayBuffer
   */
  const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        resolve(reader.result);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  };
  
  /**
   * Simulate progress updates for a file upload
   */
  const simulateUploadProgress = async (fileIndex) => {
    // Simulate upload progress steps
    const steps = [10, 30, 50, 70, 90, 100];
    
    for (const progress of steps) {
      // Update progress for this file
      setFiles(prevFiles => {
        const newFiles = [...prevFiles];
        if (newFiles[fileIndex]) {
          newFiles[fileIndex] = {
            ...newFiles[fileIndex],
            progress
          };
        }
        return newFiles;
      });
      
      // Wait a bit to simulate network activity
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  };
  
  /**
   * Upload a file to the Vault
   */
  const uploadToVault = async (file, fileContent, ectdSection) => {
    // Simulate actual vault upload
    console.log(`Uploading ${file.name} to Vault (${ectdSection})`);
    
    // In a real implementation, this would call your Vault API
    // For now, simulate a response after a delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      id: `vault-doc-${Date.now()}`,
      name: file.name,
      webUrl: `#/vault/documents/${Date.now()}`,
      ectdSection
    };
  };
  
  /**
   * Upload a file to SharePoint
   */
  const uploadToSharePoint = async (file, fileContent) => {
    try {
      // Check if authenticated with Microsoft
      const isAuth = await MicrosoftAuthService.isAuthenticated();
      
      if (!isAuth) {
        await MicrosoftAuthService.signInWithMicrosoft();
      }
      
      console.log(`Uploading ${file.name} to SharePoint`);
      
      // In a real implementation, this would use the SharePoint API
      // via the Microsoft Graph service
      
      // Get SharePoint site ID from configuration
      const siteId = 'site-id-1'; // In real app, get from SharePointService.getSharePointSiteId()
      const driveId = 'drive-1'; // In real app, get from SharePointService.getSharePointLibraries()
      const folderPath = 'Regulatory';
      
      // Upload the file to SharePoint
      const uploadedFile = await SharePointService.uploadSharePointFile(
        siteId,
        driveId,
        folderPath,
        file.name,
        fileContent
      );
      
      return uploadedFile;
    } catch (error) {
      console.error('Error uploading to SharePoint:', error);
      throw new Error(`SharePoint upload failed: ${error.message}`);
    }
  };
  
  /**
   * Upload a file to OneDrive
   */
  const uploadToOneDrive = async (file, fileContent) => {
    try {
      // Check if authenticated with Microsoft
      const isAuth = await MicrosoftAuthService.isAuthenticated();
      
      if (!isAuth) {
        await MicrosoftAuthService.signInWithMicrosoft();
      }
      
      console.log(`Uploading ${file.name} to OneDrive`);
      
      // In a real implementation, this would use the OneDrive API
      // via the Microsoft Graph service
      
      // For now, simulate a response after a delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        id: `onedrive-doc-${Date.now()}`,
        name: file.name,
        webUrl: `https://onedrive.live.com/edit.aspx?resid=${Date.now()}`
      };
    } catch (error) {
      console.error('Error uploading to OneDrive:', error);
      throw new Error(`OneDrive upload failed: ${error.message}`);
    }
  };
  
  /**
   * Reset the uploader
   */
  const handleReset = () => {
    setFiles([]);
    setUploadProgress(0);
    setUploadComplete(false);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CloudUpload className="mr-2 h-5 w-5" />
          Document Uploader
        </CardTitle>
        <CardDescription>
          Upload documents from your computer to the regulatory document repository
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Upload location selector */}
        <div className="space-y-2">
          <Label htmlFor="upload-location">Upload Location</Label>
          <Select 
            value={uploadLocation}
            onValueChange={setUploadLocation}
            disabled={uploading}
          >
            <SelectTrigger id="upload-location">
              <SelectValue placeholder="Select upload location" />
            </SelectTrigger>
            <SelectContent>
              {uploadLocations.map(location => (
                <SelectItem key={location.value} value={location.value}>
                  {location.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* eCTD section selector (only for Vault uploads) */}
        {uploadLocation === 'vault' && (
          <div className="space-y-2">
            <Label htmlFor="ectd-section">eCTD Section</Label>
            <Select 
              value={ectdSection}
              onValueChange={setEctdSection}
              disabled={uploading}
            >
              <SelectTrigger id="ectd-section">
                <SelectValue placeholder="Select eCTD section" />
              </SelectTrigger>
              <SelectContent>
                {ectdSections.map(section => (
                  <SelectItem key={section.value} value={section.value}>
                    {section.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* File selection area */}
        <div 
          className={`border-2 border-dashed rounded-md p-6 text-center transition-colors ${
            uploading ? 'bg-muted cursor-not-allowed' : 'hover:bg-muted cursor-pointer'
          }`}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={handleFileSelect}
            disabled={uploading}
          />
          
          <div className="flex flex-col items-center justify-center space-y-2">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <h3 className="text-lg font-medium">Drag and drop files here</h3>
            <p className="text-sm text-muted-foreground">
              or click to select files
            </p>
            <p className="text-xs text-muted-foreground">
              Supports PDF, Word, Excel, PowerPoint, and text files (max 100MB)
            </p>
          </div>
        </div>
        
        {/* Selected files list */}
        {files.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Selected Files ({files.length})</h4>
            <ul className="space-y-2">
              {files.map((fileObj) => (
                <li key={fileObj.id} className="flex items-center p-2 border rounded-md">
                  <div className="mr-2">
                    {getFileIcon(fileObj.file.type)}
                  </div>
                  
                  <div className="flex-grow text-sm">
                    <div className="font-medium truncate" title={fileObj.file.name}>
                      {fileObj.file.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(fileObj.file.size / 1024).toFixed(0)} KB
                    </div>
                  </div>
                  
                  {fileObj.status === 'uploading' && (
                    <div className="w-24">
                      <Progress value={fileObj.progress} className="h-2" />
                    </div>
                  )}
                  
                  {fileObj.status === 'success' && (
                    <div className="w-6 h-6 flex items-center justify-center text-green-500">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                  
                  {fileObj.status === 'error' && (
                    <div className="w-6 h-6 flex items-center justify-center text-red-500" title={fileObj.error}>
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                  )}
                  
                  {fileObj.status === 'pending' && !uploading && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(fileObj.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Overall upload progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleReset}
          disabled={uploading || (files.length === 0)}
        >
          Reset
        </Button>
        
        <Button 
          onClick={handleUpload}
          disabled={uploading || (files.length === 0)}
        >
          {uploadComplete ? 'Upload More Files' : 'Upload Files'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DocumentUploader;