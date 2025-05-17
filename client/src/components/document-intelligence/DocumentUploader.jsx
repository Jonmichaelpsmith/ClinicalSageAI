import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Progress 
} from '@/components/ui/progress';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  AlertCircle,
  CheckCircle, 
  FileText, 
  FilePlus, 
  FileX,
  Info,
  Upload,
  Layers,
  Loader2,
  RefreshCw,
  RotateCw,
  Briefcase
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * Advanced document upload component with intelligent extraction capabilities
 * for medical device regulatory documents.
 */
const DocumentUploader = ({ 
  onExtractedData, 
  onProcessingComplete,
  allowedFileTypes = ['.pdf', '.docx', '.doc', '.txt'],
  maxFileSize = 10, // in MB
  extractionEndpoint = '/api/document-intelligence/extract',
  documentTypes = [
    { value: 'technical', label: 'Technical File' },
    { value: '510k', label: '510(k) Submission' },
    { value: 'ifu', label: 'Instructions for Use' },
    { value: 'dhf', label: 'Design History File' }
  ]
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('idle'); // idle, uploading, extracting, complete, error
  const [documentType, setDocumentType] = useState('technical');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7);
  const [extractedFields, setExtractedFields] = useState([]);
  const [activeTab, setActiveTab] = useState('upload');
  
  // Format file size for display
  const formatFileSize = (sizeInBytes) => {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };
  
  // Check if file type is allowed
  const isFileTypeAllowed = (fileName) => {
    const fileExtension = '.' + fileName.split('.').pop().toLowerCase();
    return allowedFileTypes.includes(fileExtension);
  };
  
  // Check if file size is within limits
  const isFileSizeAllowed = (fileSize) => {
    return fileSize <= maxFileSize * 1024 * 1024; // Convert MB to bytes
  };
  
  // Handle file selection
  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const validFiles = [];
    
    // Validate each file
    selectedFiles.forEach(file => {
      if (!isFileTypeAllowed(file.name)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not supported. Please upload ${allowedFileTypes.join(', ')} files.`,
          variant: "destructive"
        });
        return;
      }
      
      if (!isFileSizeAllowed(file.size)) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the ${maxFileSize}MB limit.`,
          variant: "destructive"
        });
        return;
      }
      
      validFiles.push({
        file,
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'pending', // pending, uploading, complete, error
        progress: 0
      });
    });
    
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      toast({
        title: "Files added",
        description: `Added ${validFiles.length} file(s) for processing.`,
        variant: "default"
      });
    }
    
    // Reset file input for a better UX
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Remove a file from the list
  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const event = { target: { files: droppedFiles } };
      handleFileSelect(event);
    }
  };
  
  // Process files for document extraction
  const processFiles = async () => {
    if (files.length === 0) {
      toast({
        title: "No files to process",
        description: "Please add documents to extract data from.",
        variant: "destructive"
      });
      return;
    }
    
    setProcessingStatus('uploading');
    setUploadProgress(0);
    setExtractionProgress(0);
    setExtractedFields([]);
    
    // Simulate file upload progress
    const uploadInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
    
    // Prepare FormData with all files
    const formData = new FormData();
    files.forEach(fileObj => {
      formData.append('files', fileObj.file);
      // Update file status
      setFiles(prev => prev.map(f => 
        f.id === fileObj.id ? { ...f, status: 'uploading', progress: 50 } : f
      ));
    });
    
    // Add extraction settings
    formData.append('documentType', documentType);
    formData.append('confidenceThreshold', confidenceThreshold);
    
    try {
      // Simulate API call delay since we don't have the backend yet
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful upload
      clearInterval(uploadInterval);
      setUploadProgress(100);
      
      // Mark all files as complete
      setFiles(prev => prev.map(f => ({ ...f, status: 'complete', progress: 100 })));
      
      // Begin extraction process
      setProcessingStatus('extracting');
      
      // Simulate extraction progress
      const extractionInterval = setInterval(() => {
        setExtractionProgress(prev => {
          if (prev >= 100) {
            clearInterval(extractionInterval);
            return 100;
          }
          return prev + 2;
        });
      }, 150);
      
      // Simulate extraction completion
      setTimeout(() => {
        clearInterval(extractionInterval);
        setExtractionProgress(100);
        setProcessingStatus('complete');
        
        // Generate example extracted fields based on document type
        // In a real implementation, this would come from the backend
        const exampleExtractedFields = generateExampleExtractedFields(documentType);
        setExtractedFields(exampleExtractedFields);
        
        // Notify parent component
        if (onExtractedData) {
          onExtractedData(exampleExtractedFields);
        }
        
        if (onProcessingComplete) {
          onProcessingComplete(exampleExtractedFields);
        }
        
        toast({
          title: "Processing complete",
          description: `Successfully extracted ${exampleExtractedFields.length} fields from your documents.`,
          variant: "success"
        });
        
        // Switch to results tab
        setActiveTab('results');
      }, 3000);
    } catch (error) {
      console.error("Error processing documents:", error);
      setProcessingStatus('error');
      
      toast({
        title: "Processing failed",
        description: "There was an error extracting data from your documents. Please try again.",
        variant: "destructive"
      });
      
      // Mark affected files as failed
      setFiles(prev => prev.map(f => ({ ...f, status: 'error', progress: 0 })));
    }
  };
  
  // Restart the process
  const restartProcess = () => {
    setFiles([]);
    setUploadProgress(0);
    setExtractionProgress(0);
    setProcessingStatus('idle');
    setExtractedFields([]);
    setActiveTab('upload');
  };
  
  // Apply extracted data to form
  const applyExtractedData = () => {
    if (onExtractedData && extractedFields.length > 0) {
      onExtractedData(extractedFields);
      
      toast({
        title: "Data applied",
        description: "The extracted information has been applied to your form.",
        variant: "success"
      });
    }
  };
  
  // Generate example extracted fields based on document type (for demo)
  // In a real implementation, this would come from the AI processing backend
  const generateExampleExtractedFields = (docType) => {
    // This is just for demonstration purposes
    // The real system would extract this data from actual documents
    const fields = [
      { 
        name: 'deviceName', 
        value: 'DiagnoMed 500 Imaging System', 
        confidence: 0.95,
        source: 'technical_specs.pdf (page 1)',
        matches: 2
      },
      { 
        name: 'manufacturer', 
        value: 'MedTech Innovations, Inc.', 
        confidence: 0.98,
        source: 'technical_specs.pdf (page 1)',
        matches: 3
      },
      { 
        name: 'productCode', 
        value: 'LLZ', 
        confidence: 0.87,
        source: '510k_summary.pdf (page 2)',
        matches: 1
      },
      { 
        name: 'deviceClass', 
        value: 'II', 
        confidence: 0.92,
        source: '510k_summary.pdf (page 3)',
        matches: 1
      },
      { 
        name: 'intendedUse', 
        value: 'For diagnostic imaging applications in clinical settings, used by trained healthcare professionals to visualize internal structures.', 
        confidence: 0.85,
        source: 'user_manual.pdf (page 4)',
        matches: 1
      },
      { 
        name: 'deviceDescription', 
        value: 'The DiagnoMed 500 is a computer-based imaging system that processes and displays medical images. It includes specialized hardware and software components for image acquisition, processing, and storage.', 
        confidence: 0.88,
        source: 'technical_specs.pdf (page 2)',
        matches: 1
      },
      { 
        name: 'regulationNumber', 
        value: '892.1750', 
        confidence: 0.79,
        source: '510k_submission.pdf (page 7)',
        matches: 1
      },
      { 
        name: 'materials', 
        value: 'Medical-grade plastics, aluminum housing, electronic components compliant with IEC 60601-1', 
        confidence: 0.81,
        source: 'materials_list.pdf (page 1)',
        matches: 2
      }
    ];
    
    // Filter fields based on confidence threshold
    return fields.filter(field => field.confidence >= confidenceThreshold);
  };
  
  // Rendering helper for file status icon
  const renderFileStatusIcon = (status) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <FileX className="h-5 w-5 text-red-500" />;
      case 'uploading':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="upload">
            <Upload className="h-4 w-4 mr-2" />
            Upload Documents
          </TabsTrigger>
          <TabsTrigger 
            value="process" 
            disabled={files.length === 0}
          >
            <Layers className="h-4 w-4 mr-2" />
            Process Data
          </TabsTrigger>
          <TabsTrigger 
            value="results" 
            disabled={extractedFields.length === 0}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Review Results
          </TabsTrigger>
        </TabsList>
        
        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FilePlus className="h-5 w-5 mr-2 text-blue-500" />
                Upload Regulatory Documents
              </CardTitle>
              <CardDescription>
                Upload existing device documentation to automatically extract device data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  multiple
                  accept={allowedFileTypes.join(',')}
                />
                
                <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                
                <h3 className="text-lg font-medium mb-2">Drag and drop documents or click to browse</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Upload your technical files, 510(k) documents, instructions for use,
                  or any other regulatory documentation to extract device data.
                </p>
                
                <Button 
                  type="button" 
                  onClick={triggerFileInput}
                  variant="outline"
                  className="mt-2"
                >
                  Select Documents
                </Button>
                
                <div className="mt-4 text-xs text-gray-500">
                  Supported formats: {allowedFileTypes.join(', ')} (up to {maxFileSize}MB)
                </div>
              </div>
              
              {files.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Selected Documents ({files.length})</h4>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {files.map(fileObj => (
                        <div 
                          key={fileObj.id}
                          className="flex items-center justify-between p-3 border rounded-md bg-gray-50"
                        >
                          <div className="flex items-center overflow-hidden">
                            {renderFileStatusIcon(fileObj.status)}
                            <div className="ml-2 overflow-hidden">
                              <div className="text-sm font-medium truncate">{fileObj.file.name}</div>
                              <div className="text-xs text-gray-500">{formatFileSize(fileObj.file.size)}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            {fileObj.status === 'uploading' && (
                              <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden mr-3">
                                <div 
                                  className="h-full bg-blue-500 rounded-full" 
                                  style={{ width: `${fileObj.progress}%` }}
                                />
                              </div>
                            )}
                            
                            {fileObj.status === 'complete' && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mr-3">
                                Complete
                              </Badge>
                            )}
                            
                            {fileObj.status === 'error' && (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 mr-3">
                                Failed
                              </Badge>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(fileObj.id)}
                              disabled={fileObj.status === 'uploading'}
                            >
                              <FileX className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex items-center">
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Document Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                type="button"
                onClick={() => setActiveTab('process')}
                disabled={files.length === 0}
              >
                Continue to Processing
                <Layers className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Process Tab */}
        <TabsContent value="process" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Layers className="h-5 w-5 mr-2 text-blue-500" />
                Document Processing
              </CardTitle>
              <CardDescription>
                Extract and analyze structured regulatory data from your documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                  <div className="flex items-center mb-2">
                    <Info className="h-5 w-5 text-blue-500 mr-2" />
                    <h4 className="font-medium text-blue-700">Processing Information</h4>
                  </div>
                  <p className="text-sm text-blue-600">
                    Our document intelligence system will extract key regulatory information from your uploaded 
                    documents. The system will identify device specifications, indications for use, 
                    classifications, and other critical data required for your 510(k) submission.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Document Upload</Label>
                      <Badge 
                        variant={uploadProgress === 100 ? "outline" : "secondary"}
                        className={uploadProgress === 100 ? "bg-green-50 text-green-700 border-green-200" : ""}
                      >
                        {uploadProgress === 100 ? 'Complete' : 'In Progress'}
                      </Badge>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Data Extraction</Label>
                      <Badge 
                        variant={extractionProgress === 100 ? "outline" : "secondary"}
                        className={extractionProgress === 100 ? "bg-green-50 text-green-700 border-green-200" : ""}
                      >
                        {extractionProgress === 0 
                          ? 'Waiting' 
                          : extractionProgress === 100 
                            ? 'Complete' 
                            : 'Extracting'
                        }
                      </Badge>
                    </div>
                    <Progress value={extractionProgress} className="h-2" />
                  </div>
                </div>
                
                <div className="pt-4">
                  <div className="flex items-center mb-2">
                    <h4 className="font-medium">Extraction Settings</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 block">Document Type</Label>
                      <Select value={documentType} onValueChange={setDocumentType} disabled={processingStatus !== 'idle'}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          {documentTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="mb-2 block">Confidence Threshold</Label>
                      <Select 
                        value={confidenceThreshold.toString()} 
                        onValueChange={(value) => setConfidenceThreshold(parseFloat(value))}
                        disabled={processingStatus !== 'idle'}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select confidence threshold" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0.5">Medium (50%+)</SelectItem>
                          <SelectItem value="0.7">High (70%+)</SelectItem>
                          <SelectItem value="0.9">Very High (90%+)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                {processingStatus === 'error' && (
                  <div className="bg-red-50 p-4 rounded-md border border-red-100">
                    <div className="flex items-center mb-2">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                      <h4 className="font-medium text-red-700">Processing Error</h4>
                    </div>
                    <p className="text-sm text-red-600 mb-3">
                      There was an error processing your documents. Please try again or upload different files.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={restartProcess}
                      className="bg-white"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Restart Process
                    </Button>
                  </div>
                )}
                
                {processingStatus === 'complete' && (
                  <div className="bg-green-50 p-4 rounded-md border border-green-100">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <h4 className="font-medium text-green-700">Processing Complete</h4>
                    </div>
                    <p className="text-sm text-green-600 mb-3">
                      Successfully extracted {extractedFields.length} fields from your documents.
                      Please review the results and apply them to your form.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setActiveTab('results')}
                      className="bg-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      View Results
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab('upload')}
                disabled={processingStatus === 'uploading' || processingStatus === 'extracting'}
              >
                Back to Upload
              </Button>
              
              {processingStatus === 'idle' && (
                <Button
                  type="button"
                  onClick={processFiles}
                >
                  Start Processing
                  <RotateCw className="ml-2 h-4 w-4" />
                </Button>
              )}
              
              {(processingStatus === 'uploading' || processingStatus === 'extracting') && (
                <Button disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </Button>
              )}
              
              {processingStatus === 'complete' && (
                <Button
                  type="button"
                  onClick={() => setActiveTab('results')}
                >
                  View Results
                  <CheckCircle className="ml-2 h-4 w-4" />
                </Button>
              )}
              
              {processingStatus === 'error' && (
                <Button
                  type="button"
                  onClick={processFiles}
                >
                  Retry Processing
                  <RefreshCw className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Results Tab */}
        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-blue-500" />
                Extraction Results
              </CardTitle>
              <CardDescription>
                Review and apply the extracted information to your device profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-green-50 p-4 rounded-md border border-green-100">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <h4 className="font-medium text-green-700">Extraction Complete</h4>
                  </div>
                  <p className="text-sm text-green-600">
                    We've extracted {extractedFields.length} data fields from your documents.
                    Review the information below and click "Apply to Form" to automatically
                    populate your device profile.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-blue-800 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-500" />
                    Extracted Device Information
                  </h4>
                  
                  <div className="border rounded-md divide-y">
                    {extractedFields.map((field, index) => (
                      <div 
                        key={`${field.name}-${index}`}
                        className="p-3 hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-medium text-sm">{field.name}</div>
                          <Badge 
                            variant="outline" 
                            className={
                              field.confidence >= 0.9 
                                ? "bg-green-50 text-green-700 border-green-200" 
                                : field.confidence >= 0.7
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                            }
                          >
                            {Math.round(field.confidence * 100)}% Confidence
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-900">{field.value}</div>
                        <div className="flex justify-between mt-1 text-xs text-gray-500">
                          <div>Source: {field.source}</div>
                          <div>{field.matches} {field.matches === 1 ? 'match' : 'matches'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={restartProcess}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Restart Process
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab('process')}
                >
                  Back to Processing
                </Button>
              </div>
              
              <Button
                type="button"
                onClick={applyExtractedData}
              >
                Apply to Form
                <CheckCircle className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper component to keep consistent styling
const Label = ({ children, className, ...props }) => {
  return (
    <label
      className={`text-sm font-medium text-gray-900 ${className || ''}`}
      {...props}
    >
      {children}
    </label>
  );
};

export default DocumentUploader;