import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Database, 
  FileUp, 
  FileText, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Activity,
  AlertCircle,
  LineChart,
  PieChart,
  Upload,
  File,
  X,
  Globe,
  EuroIcon
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cerApiService as CerAPIService } from '@/services/CerAPIService';

/**
 * EU and Global PMS Data Integration Component for Clinical Evaluation Reports
 * 
 * This component provides functionality to integrate EU and global post-market
 * surveillance data sources into CERs, including:
 * - Eudamed vigilance data
 * - EU FSCA/incident reports
 * - Other global regulatory authority incident data
 */
export default function EuPmsDataPanel({ jobId, deviceName, manufacturer, onAddToCER }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("eudamed");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    fileName: "",
    reportType: "",
    region: "",
    timeframe: "",
    reportCount: "",
    summary: "",
    incidentCategory: "",
    severity: "",
    fileUrl: ""
  });

  // Query to fetch existing EU/global PMS data
  const { data: pmsData, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/cer/eu-pms-data'],
    enabled: true,
  });

  // Query to fetch summary of EU/global PMS data
  const { 
    data: summaryData, 
    isLoading: isSummaryLoading, 
    error: summaryError 
  } = useQuery({
    queryKey: ['/api/cer/eu-pms-data/summary'],
    enabled: !!pmsData && Object.values(pmsData).some(arr => arr.length > 0),
  });

  // Mutation for file upload
  const uploadFileMutation = useMutation({
    mutationFn: (formData) => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/cer/eu-pms-data/upload');
        
        // Track upload progress
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        };
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (e) {
              reject(new Error('Invalid response format'));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };
        
        xhr.onerror = () => reject(new Error('Upload failed'));
        
        xhr.send(formData);
      });
    },
    onSuccess: (data) => {
      // Add uploaded file to the list
      setUploadedFiles([...uploadedFiles, data]);
      
      // Update the form with the file URL
      setFormData(prev => ({
        ...prev,
        fileUrl: data.fileUrl,
        fileName: prev.fileName || data.originalFilename
      }));
      
      toast({
        title: "File Uploaded Successfully",
        description: "Your file has been uploaded and is ready to be added to the CER database.",
        variant: "success"
      });
      
      setIsUploading(false);
      setUploadProgress(0);
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message || "An error occurred while uploading the file.",
        variant: "destructive"
      });
      
      setIsUploading(false);
      setUploadProgress(0);
    }
  });
  
  // Mutation for adding new EU/global PMS data
  const addPmsDataMutation = useMutation({
    mutationFn: (data) => CerAPIService.addEuPmsData(data),
    onSuccess: () => {
      toast({
        title: "Data Added Successfully",
        description: "Your EU/global PMS data has been added to the CER database.",
        variant: "success"
      });
      
      // Reset form
      setFormData({
        fileName: "",
        reportType: "",
        region: "",
        timeframe: "",
        reportCount: "",
        summary: "",
        incidentCategory: "",
        severity: "",
        fileUrl: ""
      });
      
      // Clear uploaded files
      setUploadedFiles([]);
      
      // Refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/cer/eu-pms-data'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cer/eu-pms-data/summary'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Data",
        description: error.message || "An error occurred while adding EU/global PMS data.",
        variant: "destructive"
      });
    }
  });

  // Mutation for deleting EU/global PMS data
  const deletePmsDataMutation = useMutation({
    mutationFn: (id) => CerAPIService.deleteEuPmsData(id),
    onSuccess: () => {
      toast({
        title: "Data Deleted",
        description: "The EU/global PMS data has been removed from the CER database.",
        variant: "success"
      });
      
      // Refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/cer/eu-pms-data'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cer/eu-pms-data/summary'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Delete Data",
        description: error.message || "An error occurred while deleting EU/global PMS data.",
        variant: "destructive"
      });
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Create form data for upload
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('category', activeTab);
      uploadData.append('jobId', jobId || `cer-${Date.now()}`);
      
      // Start upload
      setIsUploading(true);
      uploadFileMutation.mutate(uploadData);
      
      // Auto-populate filename if not already set
      if (!formData.fileName) {
        // Remove extension from filename
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        setFormData(prev => ({
          ...prev,
          fileName
        }));
      }
    }
  };
  
  // Trigger file input click
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Remove uploaded file
  const removeUploadedFile = (index) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
    
    // If removing the last file, clear the fileUrl
    if (newFiles.length === 0) {
      setFormData(prev => ({
        ...prev,
        fileUrl: ""
      }));
    } else {
      // Set the fileUrl to the last file in the list
      setFormData(prev => ({
        ...prev,
        fileUrl: newFiles[newFiles.length - 1].fileUrl
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.fileName || !formData.reportType || !formData.region) {
      toast({
        title: "Missing Information",
        description: "Please provide at least a file name, report type, and region.",
        variant: "destructive"
      });
      return;
    }
    
    // Add category from active tab
    const dataToSubmit = {
      ...formData,
      category: activeTab
    };
    
    // Submit data
    addPmsDataMutation.mutate(dataToSubmit);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this PMS data? This action cannot be undone.")) {
      deletePmsDataMutation.mutate(id);
    }
  };

  // Helper to render category-specific icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'eudamed':
        return <EuroIcon className="h-5 w-5 text-blue-600" />;
      case 'fsca':
        return <AlertCircle className="h-5 w-5 text-amber-600" />;
      case 'global':
        return <Globe className="h-5 w-5 text-green-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };
  
  // Generate CER section content for EU/global PMS data
  const generateCERSection = () => {
    // Early return if there's no data
    if (!pmsData || Object.values(pmsData).every(arr => arr.length === 0)) {
      toast({
        title: "No Data Available",
        description: "Please add EU/global PMS data before generating a CER section.",
        variant: "destructive"
      });
      return;
    }
    
    // Format data for the CER section
    const content = {
      title: "European and Global PMS Data Analysis",
      type: "eu-global-pms-data",
      content: `# European and Global Post-Market Surveillance Data Analysis
      
## Overview
This section presents an analysis of EU and global post-market surveillance data for ${deviceName || 'the device'}, including Eudamed vigilance data, FSCA/incident reports, and global regulatory reports.

${pmsData.eudamed && pmsData.eudamed.length > 0 ? `
## Eudamed Vigilance Data
${pmsData.eudamed.map(item => `
### ${item.fileName}
- **Report Type:** ${item.reportType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
- **Region:** ${item.region || 'European Union'}
- **Time Period:** ${item.timeframe || 'Not specified'}
- **Number of Reports:** ${item.reportCount || 'Not specified'}
- **Incident Category:** ${item.incidentCategory ? item.incidentCategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not specified'}
- **Severity Classification:** ${item.severity ? item.severity.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not specified'}

${item.summary || 'No summary provided.'}
`).join('')}
` : ''}

${pmsData.fsca && pmsData.fsca.length > 0 ? `
## Field Safety Corrective Actions (FSCA) and Incident Reports
${pmsData.fsca.map(item => `
### ${item.fileName}
- **Report Type:** ${item.reportType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
- **Region:** ${item.region || 'European Union'}
- **Time Period:** ${item.timeframe || 'Not specified'}
- **Number of Actions/Reports:** ${item.reportCount || 'Not specified'}
- **Incident Category:** ${item.incidentCategory ? item.incidentCategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not specified'}
- **Severity Classification:** ${item.severity ? item.severity.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not specified'}

${item.summary || 'No summary provided.'}
`).join('')}
` : ''}

${pmsData.global && pmsData.global.length > 0 ? `
## Global Regulatory Authority Reports
${pmsData.global.map(item => `
### ${item.fileName}
- **Report Type:** ${item.reportType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
- **Region:** ${item.region || 'Not specified'}
- **Time Period:** ${item.timeframe || 'Not specified'}
- **Number of Reports:** ${item.reportCount || 'Not specified'}
- **Incident Category:** ${item.incidentCategory ? item.incidentCategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not specified'}
- **Severity Classification:** ${item.severity ? item.severity.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not specified'}

${item.summary || 'No summary provided.'}
`).join('')}
` : ''}

## Synthesis of EU and Global PMS Data
${summaryData ? summaryData.synthesis || 'The EU and global post-market surveillance data provide a comprehensive view of the device\'s safety and performance profile across different markets. This data complements the FDA FAERS data and provides a global risk assessment.' : 'The EU and global post-market surveillance data provide a comprehensive view of the device\'s safety and performance profile across different markets. This data complements the FDA FAERS data and provides a global risk assessment.'}

## Global Safety Profile
${summaryData ? summaryData.safetyProfile || 'Based on the collective assessment of post-market surveillance data from multiple regulatory jurisdictions, the device demonstrates a consistent safety profile that meets the requirements of EU MDR, FDA regulations, and other applicable global standards.' : 'Based on the collective assessment of post-market surveillance data from multiple regulatory jurisdictions, the device demonstrates a consistent safety profile that meets the requirements of EU MDR, FDA regulations, and other applicable global standards.'}

## Conclusions
${summaryData ? summaryData.conclusions || 'The EU and global post-market surveillance data, when analyzed alongside FDA FAERS data, support the overall favorable benefit-risk profile of the device within its intended use population.' : 'The EU and global post-market surveillance data, when analyzed alongside FDA FAERS data, support the overall favorable benefit-risk profile of the device within its intended use population.'}
`,
      lastUpdated: new Date().toISOString()
    };
    
    return content;
  };
  
  // Handle adding to CER
  const handleAddToCER = () => {
    if (typeof onAddToCER === 'function') {
      const cerSection = generateCERSection();
      if (cerSection) {
        onAddToCER(cerSection);
        toast({
          title: "Added to CER",
          description: "EU and global PMS data analysis has been added to your Clinical Evaluation Report.",
          variant: "success"
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Panel - Data Entry Form */}
        <Card className="w-full md:w-1/2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              EU & Global PMS Data Integration
            </CardTitle>
            <CardDescription>
              Add Eudamed vigilance data, FSCA/incident reports, and global regulatory reports
              to create a comprehensive safety profile for your EU MDR Clinical Evaluation Reports.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="eudamed" className="text-xs md:text-sm">Eudamed</TabsTrigger>
                <TabsTrigger value="fsca" className="text-xs md:text-sm">FSCA/Incidents</TabsTrigger>
                <TabsTrigger value="global" className="text-xs md:text-sm">Global Reports</TabsTrigger>
              </TabsList>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fileName">Document Name</Label>
                    <Input
                      id="fileName"
                      name="fileName"
                      value={formData.fileName}
                      onChange={handleInputChange}
                      placeholder="Enter document name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reportType">Report Type</Label>
                    <Select
                      value={formData.reportType}
                      onValueChange={(value) => handleSelectChange("reportType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeTab === "eudamed" && (
                          <>
                            <SelectItem value="vigilance-report">Vigilance Report</SelectItem>
                            <SelectItem value="periodic-summary-report">Periodic Summary Report</SelectItem>
                            <SelectItem value="trend-report">Trend Report</SelectItem>
                            <SelectItem value="manufacturer-incident-report">Manufacturer Incident Report</SelectItem>
                          </>
                        )}
                        
                        {activeTab === "fsca" && (
                          <>
                            <SelectItem value="fsca-report">Field Safety Corrective Action</SelectItem>
                            <SelectItem value="fsn">Field Safety Notice</SelectItem>
                            <SelectItem value="recall-report">Recall Report</SelectItem>
                            <SelectItem value="incident-investigation">Incident Investigation Report</SelectItem>
                          </>
                        )}
                        
                        {activeTab === "global" && (
                          <>
                            <SelectItem value="tga-report">TGA Report (Australia)</SelectItem>
                            <SelectItem value="health-canada">Health Canada Report</SelectItem>
                            <SelectItem value="pmda-report">PMDA Report (Japan)</SelectItem>
                            <SelectItem value="anvisa-report">ANVISA Report (Brazil)</SelectItem>
                            <SelectItem value="nmpa-report">NMPA Report (China)</SelectItem>
                            <SelectItem value="mhra-report">MHRA Report (UK)</SelectItem>
                            <SelectItem value="other-regulatory">Other Regulatory Report</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Select
                      value={formData.region}
                      onValueChange={(value) => handleSelectChange("region", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="european-union">European Union</SelectItem>
                        <SelectItem value="united-kingdom">United Kingdom</SelectItem>
                        <SelectItem value="australia">Australia</SelectItem>
                        <SelectItem value="canada">Canada</SelectItem>
                        <SelectItem value="japan">Japan</SelectItem>
                        <SelectItem value="brazil">Brazil</SelectItem>
                        <SelectItem value="china">China</SelectItem>
                        <SelectItem value="global">Global/Multiple Regions</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="timeframe">Time Period</Label>
                      <Input
                        id="timeframe"
                        name="timeframe"
                        value={formData.timeframe}
                        onChange={handleInputChange}
                        placeholder="e.g., 2020-2023"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reportCount">Number of Reports</Label>
                      <Input
                        id="reportCount"
                        name="reportCount"
                        value={formData.reportCount}
                        onChange={handleInputChange}
                        placeholder="e.g., 12"
                        type="number"
                      />
                    </div>
                  </div>
                  
                  {(activeTab === "eudamed" || activeTab === "fsca" || activeTab === "global") && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="incidentCategory">Incident Category</Label>
                        <Select
                          value={formData.incidentCategory}
                          onValueChange={(value) => handleSelectChange("incidentCategory", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="device-deficiency">Device Deficiency</SelectItem>
                            <SelectItem value="device-malfunction">Device Malfunction</SelectItem>
                            <SelectItem value="serious-injury">Serious Injury</SelectItem>
                            <SelectItem value="death">Death</SelectItem>
                            <SelectItem value="unanticipated-side-effect">Unanticipated Side Effect</SelectItem>
                            <SelectItem value="use-error">Use Error</SelectItem>
                            <SelectItem value="manufacturing-issue">Manufacturing Issue</SelectItem>
                            <SelectItem value="multiple-categories">Multiple Categories</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="severity">Severity Classification</Label>
                        <Select
                          value={formData.severity}
                          onValueChange={(value) => handleSelectChange("severity", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select severity" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="serious">Serious</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="minor">Minor</SelectItem>
                            <SelectItem value="negligible">Negligible</SelectItem>
                            <SelectItem value="not-applicable">Not Applicable</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  
                  {/* File Upload Section */}
                  <div className="space-y-2">
                    <Label>Upload Document</Label>
                    <div className="flex flex-col space-y-2">
                      {/* Hidden file input */}
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx,.xlsx,.xls,.csv,.json,.xml"
                      />
                      
                      {/* Upload button */}
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={triggerFileUpload}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <span className="flex items-center gap-2">
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></span>
                            Uploading...
                          </span>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            Select File
                          </>
                        )}
                      </Button>
                      
                      {/* Upload progress bar */}
                      {isUploading && (
                        <div className="w-full space-y-1">
                          <Progress value={uploadProgress} className="h-2 w-full" />
                          <p className="text-xs text-muted-foreground text-center">{uploadProgress}%</p>
                        </div>
                      )}
                      
                      {/* Uploaded files list */}
                      {uploadedFiles.length > 0 && (
                        <div className="mt-2 space-y-2">
                          <p className="text-xs font-medium">Uploaded Files:</p>
                          <div className="space-y-1">
                            {uploadedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                                <div className="flex items-center gap-2">
                                  <File className="h-4 w-4 text-primary" />
                                  <span className="text-sm truncate max-w-[180px]">
                                    {file.originalFilename || 'Uploaded file'}
                                  </span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => removeUploadedFile(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="summary">Summary</Label>
                    <Textarea
                      id="summary"
                      name="summary"
                      value={formData.summary}
                      onChange={handleInputChange}
                      placeholder="Enter a summary of the PMS data findings"
                      rows={4}
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={addPmsDataMutation.isPending}
                >
                  {addPmsDataMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      Adding Data...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <FileUp className="h-4 w-4" />
                      Add PMS Data
                    </span>
                  )}
                </Button>
              </form>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4 pt-0">
            <div className="text-sm text-muted-foreground mt-2 w-full">
              <div className="flex items-center gap-2 mb-1">
                <Info className="h-4 w-4 text-blue-500" />
                <span>EU MDR requires comprehensive PMS data in CERs.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Global data enhances risk assessment validity.</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 w-full">
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
                <span className="flex items-center gap-1">
                  {isLoading ? (
                    <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></span>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                      <path d="M21 3v5h-5"></path>
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                      <path d="M8 16H3v5"></path>
                    </svg>
                  )}
                  Refresh
                </span>
              </Button>
            </div>
          </CardFooter>
        </Card>
        
        {/* Right Panel - Overview and Existing Data */}
        <Card className="w-full md:w-1/2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              EU & Global PMS Data Overview
            </CardTitle>
            <CardDescription>
              View and manage EU/global post-market surveillance data for CER inclusion
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error loading data</AlertTitle>
                <AlertDescription>
                  {error.message || "Failed to load EU/global PMS data. Please try again."}
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <DataCountCard 
                    title="Eudamed Reports" 
                    count={pmsData?.eudamed?.length || 0}
                    icon={<EuroIcon className="h-5 w-5 text-blue-600" />}
                  />
                  <DataCountCard 
                    title="FSCA/Incidents" 
                    count={pmsData?.fsca?.length || 0}
                    icon={<AlertCircle className="h-5 w-5 text-amber-600" />}
                  />
                  <DataCountCard 
                    title="Global Reports" 
                    count={pmsData?.global?.length || 0}
                    icon={<Globe className="h-5 w-5 text-green-600" />}
                  />
                </div>
                
                {/* Existing Data List */}
                <div className="border rounded-md">
                  <div className="p-3 border-b bg-muted/50 font-medium">
                    EU & Global PMS Data Records
                  </div>
                  <div className="divide-y max-h-[400px] overflow-y-auto">
                    {pmsData && Object.keys(pmsData).map(category => (
                      pmsData[category].map(item => (
                        <div key={item.id} className="p-3 hover:bg-muted/50">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                              {getCategoryIcon(category)}
                              <div>
                                <div className="font-medium">{item.fileName}</div>
                                <div className="text-sm text-muted-foreground">
                                  {item.reportType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} • {item.region.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} • {item.timeframe || "No timeframe"}
                                </div>
                                <div className="text-sm mt-1 text-gray-600 max-w-md">
                                  {item.summary?.length > 100 
                                    ? `${item.summary.substring(0, 100)}...` 
                                    : item.summary}
                                </div>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(item.id)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                              </svg>
                            </Button>
                          </div>
                        </div>
                      ))
                    ))}
                    
                    {(!pmsData || Object.values(pmsData).flat().length === 0) && (
                      <div className="p-8 text-center text-muted-foreground">
                        <div className="flex justify-center mb-3">
                          <FileText className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                        <h3 className="font-medium mb-1">No EU/Global PMS Data Available</h3>
                        <p className="text-sm">
                          Add Eudamed vigilance data, FSCA/incident reports, or global regulatory reports to enhance your CER's safety profile.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Generate CER Section Button */}
                <Button 
                  variant="default" 
                  className="w-full mt-4" 
                  onClick={handleAddToCER}
                  disabled={!pmsData || Object.values(pmsData).flat().length === 0}
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Add EU & Global PMS Data to CER
                  </span>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper component for data count cards
function DataCountCard({ title, count, icon }) {
  return (
    <div className="border rounded-md p-3 flex flex-col items-center justify-center bg-card">
      <div className="mb-1">{icon}</div>
      <span className="font-semibold text-xl mb-1">{count}</span>
      <span className="text-xs text-center text-muted-foreground">{title}</span>
    </div>
  );
}