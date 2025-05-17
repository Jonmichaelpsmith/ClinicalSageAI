import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploader } from "@/components/ui/file-uploader";
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FilePlus, FileText, Upload, Database, ArrowRight, AlertCircle, CheckCircle, Layers } from 'lucide-react';
import { documentIntelligenceService } from '@/services/DocumentIntelligenceService';

const DocumentIntakePanel = ({ 
  onExtractComplete,
  processedDocuments,
  setProcessedDocuments,
  isExtracting,
  setIsExtracting
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [recognizedDocuments, setRecognizedDocuments] = useState([]);
  const [extractionConfig, setExtractionConfig] = useState({
    regulatoryContext: '510k',
    confidenceThreshold: 0.7,
    extractionMode: 'comprehensive'
  });

  // Handle file upload
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    setUploadProgress(0);
    setUploadedFiles([...files]);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 100);
    
    // Simulate document recognition
    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      
      // Recognize document types
      const newRecognizedDocs = [...files].map(file => ({
        id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        // Auto-detect document type based on filename (simplified logic for demo)
        recognizedType: file.name.toLowerCase().includes('510k') ? '510K Submission' :
                        file.name.toLowerCase().includes('technical') ? 'Technical File' :
                        file.name.toLowerCase().includes('ifu') ? 'Instructions for Use' :
                        file.name.toLowerCase().includes('clinical') ? 'Clinical Report' :
                        'Unknown Document',
        confidence: 0.8 + (Math.random() * 0.2),
        file
      }));
      
      setRecognizedDocuments(prev => [...prev, ...newRecognizedDocs]);
      setProcessedDocuments(prev => [...prev, ...newRecognizedDocs]);
      setActiveTab('process');
      
      toast({
        title: 'Documents Uploaded',
        description: `${files.length} ${files.length === 1 ? 'document' : 'documents'} have been uploaded and recognized`,
        variant: 'success',
      });
    }, 1500);
  };
  
  // Extract data from documents
  const extractDataFromDocuments = async () => {
    if (recognizedDocuments.length === 0) {
      toast({
        title: 'No Documents',
        description: 'Please upload documents first',
        variant: 'destructive',
      });
      return;
    }
    
    setIsExtracting(true);
    
    try {
      // Normally we would call a real service here
      // const extractedData = await documentIntelligenceService.extractDocumentData({
      //   ...extractionConfig,
      //   documents: recognizedDocuments
      // });
      
      // For this demo, simulate extraction with a timeout
      setTimeout(() => {
        // Simulate extracted data based on document types
        const extractedData = {
          deviceName: "CardioHealth Monitor X1",
          manufacturer: "MedTech Innovations, Inc.",
          productCode: "DXH",
          deviceClass: "II",
          regulatoryClass: "Class II",
          intendedUse: "Continuous monitoring of cardiac rhythm and vital signs in clinical and home settings",
          description: "A portable cardiac monitoring system designed for continuous heart rhythm monitoring and vital sign tracking",
          indications: "For use in patients requiring continuous cardiac monitoring due to suspected arrhythmias, post-cardiac surgery, or chronic cardiac conditions",
          contraindications: "Not for use in MRI environments. Not for invasive pressure monitoring.",
          operatingPrinciple: "Non-invasive ECG monitoring with proprietary algorithm for arrhythmia detection",
          technicalSpecifications: {
            dimensions: "120mm x 70mm x 15mm",
            weight: "95g including battery",
            powerSource: "Rechargeable lithium-ion battery",
            batteryLife: "Up to 72 hours continuous monitoring",
            connectivity: "Bluetooth 5.0, Wi-Fi",
            storage: "32GB onboard storage for up to 30 days of data"
          }
        };
        
        // Update extraction status
        setIsExtracting(false);
        onExtractComplete(extractedData);
        
        toast({
          title: 'Data Extraction Complete',
          description: 'Document data has been successfully extracted and processed',
          variant: 'success',
        });
        
      }, 2500);
    } catch (error) {
      setIsExtracting(false);
      toast({
        title: 'Extraction Failed',
        description: error.message || 'An error occurred during data extraction',
        variant: 'destructive',
      });
    }
  };
  
  // Clear all data
  const handleClear = () => {
    setUploadedFiles([]);
    setRecognizedDocuments([]);
    setProcessedDocuments([]);
    setUploadProgress(0);
    setActiveTab('upload');
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Document Intelligence</CardTitle>
            <CardDescription>Upload and extract data from regulatory documents</CardDescription>
          </div>
          <Layers className="h-7 w-7 text-blue-600" />
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="upload" disabled={isExtracting}>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="process" disabled={recognizedDocuments.length === 0 || isExtracting}>
              <Database className="h-4 w-4 mr-2" />
              Process
            </TabsTrigger>
            <TabsTrigger value="results" disabled={!processedDocuments.some(doc => doc.extractedData)}>
              <FileText className="h-4 w-4 mr-2" />
              Results
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="mt-0">
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 border">
                <FileUploader 
                  onFilesAdded={handleFileUpload}
                  maxFiles={5}
                  maxSize={10 * 1024 * 1024} // 10MB
                  accept={{
                    'application/pdf': ['.pdf'],
                    'application/msword': ['.doc'],
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
                  }}
                  label="Drag & drop regulatory documents or click to browse"
                  description="Supports PDF, DOC, and DOCX files up to 10MB"
                />
              </div>
              
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}
              
              {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Uploaded Files</h3>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-blue-500 mr-2" />
                          <span className="text-sm font-medium">{file.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {uploadProgress === 100 && (
                    <div className="flex justify-end">
                      <Button size="sm" onClick={() => setActiveTab('process')}>
                        Continue to Processing
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="process" className="mt-0">
            <div className="space-y-5">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">Document Recognition Results</h3>
                
                {recognizedDocuments.length > 0 ? (
                  <div className="space-y-3">
                    {recognizedDocuments.map((doc) => (
                      <div key={doc.id} className="bg-white p-3 rounded border flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-blue-500 mr-2" />
                          <div>
                            <div className="text-sm font-medium">{doc.name}</div>
                            <div className="text-xs text-gray-500">
                              Recognized as: <span className="font-medium text-blue-600">{doc.recognizedType}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs bg-blue-100 px-2 py-1 rounded-full text-blue-800">
                          {(doc.confidence * 100).toFixed(0)}% confidence
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-2">
                      <h3 className="text-sm font-semibold mb-2">Extraction Settings</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="regulatoryContext">Regulatory Context</Label>
                          <select 
                            id="regulatoryContext"
                            className="w-full rounded-md border border-input p-2 text-sm"
                            value={extractionConfig.regulatoryContext}
                            onChange={(e) => setExtractionConfig({
                              ...extractionConfig, 
                              regulatoryContext: e.target.value
                            })}
                          >
                            <option value="510k">FDA 510(k)</option>
                            <option value="pma">FDA PMA</option>
                            <option value="mdr">EU MDR</option>
                            <option value="ivdr">EU IVDR</option>
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="extractionMode">Extraction Mode</Label>
                          <select 
                            id="extractionMode"
                            className="w-full rounded-md border border-input p-2 text-sm"
                            value={extractionConfig.extractionMode}
                            onChange={(e) => setExtractionConfig({
                              ...extractionConfig, 
                              extractionMode: e.target.value
                            })}
                          >
                            <option value="basic">Basic</option>
                            <option value="comprehensive">Comprehensive</option>
                            <option value="detailed">Detailed</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between pt-2">
                      <Button variant="outline" size="sm" onClick={handleClear}>
                        Clear All
                      </Button>
                      <Button 
                        onClick={extractDataFromDocuments}
                        disabled={isExtracting}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                      >
                        {isExtracting ? (
                          <>
                            <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent rounded-full" />
                            Extracting Data...
                          </>
                        ) : (
                          <>
                            Extract Device Data
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Alert variant="info" className="bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertTitle>No documents processed</AlertTitle>
                    <AlertDescription>
                      Upload documents first to begin the recognition process.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="mt-0">
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="flex items-center mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="font-medium text-green-800">Extraction Complete</h3>
                </div>
                
                <Alert variant="success" className="bg-white border-green-200 mb-4">
                  <AlertTitle>Device data successfully extracted</AlertTitle>
                  <AlertDescription>
                    The system has extracted key device information from your documents. 
                    You can now use this data to pre-populate your device profile.
                  </AlertDescription>
                </Alert>
                
                <div className="bg-white rounded-lg border p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">Device Name</Label>
                      <div className="font-medium">CardioHealth Monitor X1</div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Manufacturer</Label>
                      <div className="font-medium">MedTech Innovations, Inc.</div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Product Code</Label>
                      <div className="font-medium">DXH</div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Device Class</Label>
                      <div className="font-medium">Class II</div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-gray-500">Intended Use</Label>
                    <div className="text-sm">
                      Continuous monitoring of cardiac rhythm and vital signs in clinical and home settings
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-gray-500">Description</Label>
                    <div className="text-sm">
                      A portable cardiac monitoring system designed for continuous heart rhythm monitoring and vital sign tracking
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mr-2"
                    onClick={() => setActiveTab('process')}
                  >
                    Back to Processing
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      toast({
                        title: "Data Applied to Device Profile",
                        description: "The extracted data has been successfully applied to your device profile form.",
                        variant: "success",
                      });
                    }}
                  >
                    Apply to Device Profile
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DocumentIntakePanel;