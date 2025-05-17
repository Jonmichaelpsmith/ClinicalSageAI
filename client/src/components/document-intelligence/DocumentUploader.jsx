import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Upload, FileText, AlertCircle, RefreshCw, CheckCircle2, FileUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { documentIntelligenceService } from '@/services/DocumentIntelligenceService';

const DocumentUploader = ({ onExtractedData, maxFiles = 5 }) => {
  const { toast } = useToast();
  const [files, setFiles] = useState([]);
  const [documentType, setDocumentType] = useState("510k");
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7);
  const [processingState, setProcessingState] = useState({
    isProcessing: false,
    phase: null,
    progress: 0,
    message: ""
  });
  const [extractionResults, setExtractionResults] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");
  const fileInputRef = useRef(null);
  
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Validate total file count
    if (selectedFiles.length + files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can upload a maximum of ${maxFiles} files in a single batch`,
        variant: "destructive"
      });
      return;
    }
    
    // Validate file types
    const validTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    
    const invalidFiles = selectedFiles.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid file type",
        description: `Only PDF, DOCX, DOC, and TXT files are accepted`,
        variant: "destructive"
      });
      return;
    }
    
    // Add new files to the list
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
  };
  
  const handleRemoveFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('border-primary');
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-primary');
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-primary');
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      
      // Validate total file count
      if (droppedFiles.length + files.length > maxFiles) {
        toast({
          title: "Too many files",
          description: `You can upload a maximum of ${maxFiles} files in a single batch`,
          variant: "destructive"
        });
        return;
      }
      
      // Validate file types
      const validTypes = [
        'application/pdf', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain'
      ];
      
      const invalidFiles = droppedFiles.filter(file => !validTypes.includes(file.type));
      
      if (invalidFiles.length > 0) {
        toast({
          title: "Invalid file type",
          description: `Only PDF, DOCX, DOC, and TXT files are accepted`,
          variant: "destructive"
        });
        return;
      }
      
      // Add dropped files to the list
      setFiles(prevFiles => [...prevFiles, ...droppedFiles]);
    }
  };
  
  const handleProcessDocuments = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to process",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setProcessingState({
        isProcessing: true,
        phase: 'starting',
        progress: 0,
        message: "Initializing document processing..."
      });
      
      setExtractionResults(null);
      
      // Process the documents
      const results = await documentIntelligenceService.extractDataFromDocuments(
        files,
        {
          documentType,
          confidenceThreshold,
          onProgress: (update) => {
            setProcessingState({
              isProcessing: true,
              phase: update.phase,
              progress: update.progress * 100,
              message: update.message
            });
          }
        }
      );
      
      // Update with results
      setExtractionResults(results);
      
      // Switch to results tab
      setActiveTab("results");
      
      // Reset processing state
      setProcessingState({
        isProcessing: false,
        phase: null,
        progress: 0,
        message: ""
      });
      
      // Show success message
      toast({
        title: "Document Processing Complete",
        description: `Successfully extracted ${results.length} fields from your documents`,
        variant: "default"
      });
    } catch (error) {
      console.error("Document processing error:", error);
      
      // Reset processing state
      setProcessingState({
        isProcessing: false,
        phase: null,
        progress: 0,
        message: ""
      });
      
      // Show error message
      toast({
        title: "Document Processing Failed",
        description: error.message || "An error occurred while processing your documents",
        variant: "destructive"
      });
    }
  };
  
  const handleClearFiles = () => {
    setFiles([]);
    setExtractionResults(null);
    setActiveTab("upload");
  };
  
  const handleApplyData = useCallback(() => {
    if (!extractionResults || extractionResults.length === 0) {
      toast({
        title: "No Data to Apply",
        description: "There are no extracted fields to apply to your form",
        variant: "destructive"
      });
      return;
    }
    
    // Call the parent component with the extracted data
    if (onExtractedData) {
      onExtractedData(extractionResults);
    }
    
    toast({
      title: "Data Applied",
      description: "The extracted data has been applied to your form",
      variant: "default"
    });
  }, [extractionResults, onExtractedData, toast]);
  
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  const getPhaseIcon = () => {
    switch (processingState.phase) {
      case 'uploading':
        return <FileUp className="mr-2 h-4 w-4 animate-pulse" />;
      case 'analyzing':
        return <RefreshCw className="mr-2 h-4 w-4 animate-spin" />;
      case 'complete':
        return <CheckCircle2 className="mr-2 h-4 w-4" />;
      default:
        return null;
    }
  };
  
  const renderProcessingIndicator = () => {
    if (!processingState.isProcessing) return null;
    
    return (
      <div className="mt-4">
        <div className="flex items-center mb-2">
          {getPhaseIcon()}
          <span className="text-sm font-medium">{processingState.message}</span>
        </div>
        <Progress value={processingState.progress} className="h-2" />
      </div>
    );
  };
  
  const renderFileList = () => {
    if (files.length === 0) {
      return (
        <div className="py-4 text-center text-muted-foreground">
          <FileText className="mx-auto h-8 w-8 mb-2" />
          <p>No files selected</p>
        </div>
      );
    }
    
    return (
      <ul className="divide-y">
        {files.map((file, index) => (
          <li key={index} className="py-2 flex justify-between items-center">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2 flex-shrink-0" />
              <div className="truncate max-w-[200px]">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleRemoveFile(index)}
              disabled={processingState.isProcessing}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
    );
  };
  
  const renderExtractedFields = () => {
    if (!extractionResults || extractionResults.length === 0) {
      return (
        <div className="py-4 text-center text-muted-foreground">
          <AlertCircle className="mx-auto h-8 w-8 mb-2" />
          <p>No fields were extracted</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">Extracted Fields ({extractionResults.length})</h3>
          <p className="text-xs text-muted-foreground">Confidence threshold: {confidenceThreshold}</p>
        </div>
        
        <div className="bg-muted p-3 rounded-md">
          <p className="text-sm mb-3 text-muted-foreground">These fields were extracted from your documents with at least {confidenceThreshold * 100}% confidence:</p>
          
          <div className="max-h-[300px] overflow-y-auto pr-2">
            <ul className="divide-y divide-border">
              {extractionResults.map((field, index) => (
                <li key={index} className="py-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{field.name}</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {Math.round(field.confidence * 100)}%
                    </span>
                  </div>
                  <p className="text-sm truncate">{field.value}</p>
                  {field.source && (
                    <p className="text-xs text-muted-foreground mt-1">Source: {field.source}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleClearFiles}
          >
            Clear All
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleApplyData}
          >
            Apply to Form
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Upload className="mr-2 h-5 w-5" />
          Document Intelligence
        </CardTitle>
        <CardDescription>
          Upload regulatory documents to automatically extract device information
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6">
          <TabsList className="w-full">
            <TabsTrigger value="upload" className="flex-1">Upload</TabsTrigger>
            <TabsTrigger value="results" className="flex-1" disabled={!extractionResults}>Results</TabsTrigger>
          </TabsList>
        </div>
        
        <CardContent className="pt-4">
          <TabsContent value="upload" className="m-0">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Document Type</label>
                  <Select value={documentType} onValueChange={setDocumentType} disabled={processingState.isProcessing}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="510k">510(k) Submission</SelectItem>
                      <SelectItem value="technical">Technical File</SelectItem>
                      <SelectItem value="clinical">Clinical Report</SelectItem>
                      <SelectItem value="ifu">Instructions for Use</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Confidence Threshold: {confidenceThreshold.toFixed(1)}</label>
                  <Slider
                    value={[confidenceThreshold * 10]}
                    min={5}
                    max={10}
                    step={1}
                    disabled={processingState.isProcessing}
                    onValueChange={(value) => setConfidenceThreshold(value[0] / 10)}
                    className="mt-2"
                  />
                </div>
              </div>
              
              <div
                className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.doc,.txt"
                  multiple
                  disabled={processingState.isProcessing}
                />
                
                <div className="space-y-2">
                  <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Drag files here or click to browse</h3>
                  <p className="text-xs text-muted-foreground">
                    Upload up to {maxFiles} files (PDF, DOCX, DOC, TXT)
                  </p>
                </div>
              </div>
              
              {renderFileList()}
              {renderProcessingIndicator()}
              
              {files.length > 0 && !processingState.isProcessing && (
                <div className="flex justify-end space-x-2 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleClearFiles}
                    disabled={processingState.isProcessing}
                  >
                    Clear
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={handleProcessDocuments}
                    disabled={processingState.isProcessing}
                  >
                    Process Documents
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="m-0">
            {renderExtractedFields()}
          </TabsContent>
        </CardContent>
      </Tabs>
      
      <CardFooter className="bg-muted/50 flex justify-between py-2 px-6">
        <div className="text-xs text-muted-foreground">
          Powered by Document Intelligence
        </div>
        
        {processingState.isProcessing && (
          <div className="text-xs text-muted-foreground animate-pulse">
            Processing...
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default DocumentUploader;