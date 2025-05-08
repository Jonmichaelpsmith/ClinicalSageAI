import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, FileText, CheckCircle, AlertCircle, FileType2, 
  RefreshCw, Database, FilePlus, FileBarChart, FileSpreadsheet, ClipboardList 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import CerTooltipWrapper from './CerTooltipWrapper';

export default function InternalClinicalDataPanel({ onDataUpdated }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('investigations');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [internalData, setInternalData] = useState({
    investigations: [],
    pmsReports: [],
    registryData: [],
    complaints: []
  });
  const [currentUploadType, setCurrentUploadType] = useState(null);
  const [formData, setFormData] = useState({
    reportType: 'investigation',
    studyDesign: 'prospective',
    dataType: 'safety',
    timeframe: '',
    sampleSize: '',
    summary: '',
    author: '',
    department: '',
    documentId: '',
  });

  // Handle form input changes
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleUpload = async (category) => {
    if (selectedFiles.length === 0) {
      toast({
        title: 'No files selected',
        description: 'Please select at least one file to upload',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setCurrentUploadType(category);

    // Create form data for upload
    const uploadData = new FormData();
    selectedFiles.forEach(file => {
      uploadData.append('files', file);
    });
    
    // Add metadata
    Object.entries(formData).forEach(([key, value]) => {
      uploadData.append(key, value);
    });
    uploadData.append('category', category);

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);

      // Make actual API call
      const response = await fetch('/api/cer/internal-data/upload', {
        method: 'POST',
        body: uploadData
      });

      clearInterval(interval);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      setUploadProgress(100);

      // Add the new data to state
      const newFile = {
        id: result.fileId || Date.now().toString(),
        name: selectedFiles[0].name,
        type: category,
        size: selectedFiles[0].size,
        uploadedAt: new Date().toISOString(),
        metadata: { ...formData },
        processingStatus: 'completed'
      };

      setInternalData(prev => ({
        ...prev,
        [category]: [...prev[category], newFile]
      }));

      // Notify parent component that data has been updated
      if (onDataUpdated) {
        onDataUpdated({
          type: 'internal-clinical-data',
          data: {
            ...internalData,
            [category]: [...internalData[category], newFile]
          }
        });
      }

      toast({
        title: 'Upload successful',
        description: `${selectedFiles.length} file(s) uploaded for ${getCategoryLabel(category)}`,
      });

      // Reset form after successful upload
      setSelectedFiles([]);
      document.getElementById('file-upload').value = '';

    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'There was an error uploading your files',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setCurrentUploadType(null);
    }
  };

  // Load existing internal data
  useEffect(() => {
    const fetchInternalData = async () => {
      try {
        const response = await fetch('/api/cer/internal-data');
        if (response.ok) {
          const data = await response.json();
          setInternalData(data);
        }
      } catch (error) {
        console.error('Error fetching internal clinical data:', error);
      }
    };

    fetchInternalData();
  }, []);

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'investigations': return 'Clinical Investigations';
      case 'pmsReports': return 'PMS Reports';
      case 'registryData': return 'Registry Data';
      case 'complaints': return 'Complaint Trends';
      default: return category;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'investigations': return <FileText className="h-4 w-4" />;
      case 'pmsReports': return <FileBarChart className="h-4 w-4" />;
      case 'registryData': return <FileSpreadsheet className="h-4 w-4" />;
      case 'complaints': return <ClipboardList className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const removeFile = async (category, fileId) => {
    try {
      const response = await fetch(`/api/cer/internal-data/${fileId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setInternalData(prev => ({
          ...prev,
          [category]: prev[category].filter(file => file.id !== fileId)
        }));

        // Notify parent component that data has been updated
        if (onDataUpdated) {
          const updatedData = {
            ...internalData,
            [category]: internalData[category].filter(file => file.id !== fileId)
          };
          onDataUpdated({
            type: 'internal-clinical-data',
            data: updatedData
          });
        }

        toast({
          title: 'File removed',
          description: `File has been removed from ${getCategoryLabel(category)}`
        });
      }
    } catch (error) {
      console.error('Error removing file:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove file',
        variant: 'destructive'
      });
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf': return <FileText className="h-4 w-4 text-red-500" />;
      case 'excel': return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
      case 'word': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'csv': return <FileSpreadsheet className="h-4 w-4 text-green-700" />;
      default: return <FileType2 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getFileTypeFromName = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf': return 'pdf';
      case 'xlsx':
      case 'xls': return 'excel';
      case 'docx':
      case 'doc': return 'word';
      case 'csv': return 'csv';
      default: return 'other';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Database className="mr-2 h-5 w-5 text-blue-500" />
            Internal Clinical Data Management
          </CardTitle>
          <CardDescription>
            Upload and manage your organization's internal clinical data for inclusion in the Clinical Evaluation Report.
            This is critical for comprehensive compliance with EU MDR regulations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <h3 className="font-medium text-blue-800 mb-1 text-sm">Why This Matters</h3>
                  <p className="text-blue-700 text-xs">
                    EU MDR requires Clinical Evaluation Reports to include <span className="font-semibold">all available clinical evidence</span>, not just literature. 
                    Adding internal data is critical for regulatory compliance and demonstrates a comprehensive evaluation of your device's safety and performance.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reportType">Document Type</Label>
                    <Select value={formData.reportType} onValueChange={(value) => handleSelectChange('reportType', value)}>
                      <SelectTrigger id="reportType">
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="investigation">Clinical Investigation Report</SelectItem>
                        <SelectItem value="pms">Post-Market Surveillance Report</SelectItem>
                        <SelectItem value="registry">Registry Dataset</SelectItem>
                        <SelectItem value="complaint">Complaint Trend Analysis</SelectItem>
                        <SelectItem value="other">Other Clinical Document</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studyDesign">Study Design (if applicable)</Label>
                    <Select value={formData.studyDesign} onValueChange={(value) => handleSelectChange('studyDesign', value)}>
                      <SelectTrigger id="studyDesign">
                        <SelectValue placeholder="Select study design" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prospective">Prospective</SelectItem>
                        <SelectItem value="retrospective">Retrospective</SelectItem>
                        <SelectItem value="observational">Observational</SelectItem>
                        <SelectItem value="randomized">Randomized Controlled Trial</SelectItem>
                        <SelectItem value="case-series">Case Series</SelectItem>
                        <SelectItem value="registry">Registry Analysis</SelectItem>
                        <SelectItem value="na">Not Applicable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataType">Primary Data Type</Label>
                    <RadioGroup
                      value={formData.dataType}
                      onValueChange={(value) => handleSelectChange('dataType', value)}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="safety" id="safety" />
                        <Label htmlFor="safety" className="font-normal">Safety Data</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="performance" id="performance" />
                        <Label htmlFor="performance" className="font-normal">Performance Data</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="both" id="both" />
                        <Label htmlFor="both" className="font-normal">Safety & Performance</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeframe">Time Period Covered</Label>
                    <Input
                      id="timeframe"
                      name="timeframe"
                      value={formData.timeframe}
                      onChange={handleInputChange}
                      placeholder="e.g., Jan 2023 - Dec 2023"
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sampleSize">Sample Size (if applicable)</Label>
                    <Input
                      id="sampleSize"
                      name="sampleSize"
                      value={formData.sampleSize}
                      onChange={handleInputChange}
                      placeholder="e.g., 120 patients"
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="summary">Brief Summary</Label>
                    <Textarea
                      id="summary"
                      name="summary"
                      value={formData.summary}
                      onChange={handleInputChange}
                      placeholder="Provide a brief summary of the key findings..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file-upload">Upload Document</Label>
                    <div className="flex items-center">
                      <Input
                        id="file-upload"
                        type="file"
                        onChange={handleFileChange}
                        className="w-full"
                        multiple
                      />
                    </div>
                  </div>

                  {uploading && (
                    <div className="space-y-1">
                      <Progress value={uploadProgress} className="h-2 w-full" />
                      <p className="text-xs text-gray-500 text-right">{uploadProgress}%</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="author">Author/Owner</Label>
                    <Input
                      id="author"
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      placeholder="Document author or owner"
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      placeholder="e.g., Clinical Affairs"
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documentId">Document ID/Version</Label>
                    <Input
                      id="documentId"
                      name="documentId"
                      value={formData.documentId}
                      onChange={handleInputChange}
                      placeholder="e.g., CSR-2023-001 v1.0"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                  <TabsTrigger value="investigations" className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Clinical Investigations</span>
                    <span className="sm:hidden">Investigations</span>
                    {internalData.investigations.length > 0 && (
                      <Badge variant="secondary" className="ml-2">{internalData.investigations.length}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="pmsReports" className="flex items-center">
                    <FileBarChart className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">PMS Reports</span>
                    <span className="sm:hidden">PMS</span>
                    {internalData.pmsReports.length > 0 && (
                      <Badge variant="secondary" className="ml-2">{internalData.pmsReports.length}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="registryData" className="flex items-center">
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Registry Data</span>
                    <span className="sm:hidden">Registry</span>
                    {internalData.registryData.length > 0 && (
                      <Badge variant="secondary" className="ml-2">{internalData.registryData.length}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="complaints" className="flex items-center">
                    <ClipboardList className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Complaint Trends</span>
                    <span className="sm:hidden">Complaints</span>
                    {internalData.complaints.length > 0 && (
                      <Badge variant="secondary" className="ml-2">{internalData.complaints.length}</Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                {Object.keys(internalData).map((category) => (
                  <TabsContent key={category} value={category} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium flex items-center">
                        {getCategoryIcon(category)}
                        <span className="ml-2">{getCategoryLabel(category)}</span>
                      </h3>
                      <CerTooltipWrapper
                        content={
                          <div className="text-xs max-w-md">
                            <p className="font-medium mb-1">Regulatory Importance:</p>
                            <p>
                              {category === 'investigations' && 'Clinical investigation summaries are required under EU MDR Annex XIV, Part A, Section 1.'}
                              {category === 'pmsReports' && 'Post-market surveillance data is required under EU MDR Article 83 and Annex III.'}
                              {category === 'registryData' && 'Registry data provides real-world evidence required by EU MDR Article 61 for clinical evaluation.'}
                              {category === 'complaints' && 'Complaint trends analysis is required under EU MDR Article 87 for vigilance reporting.'}
                            </p>
                          </div>
                        }
                      >
                        <Button variant="outline" size="sm" onClick={() => handleUpload(category)} disabled={uploading}>
                          <FilePlus className="h-4 w-4 mr-2" />
                          Add {category === 'investigations' ? 'Investigation' : 
                              category === 'pmsReports' ? 'PMS Report' : 
                              category === 'registryData' ? 'Registry Data' : 
                              'Complaint Data'}
                        </Button>
                      </CerTooltipWrapper>
                    </div>

                    {internalData[category].length === 0 ? (
                      <div className="border border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center bg-gray-50">
                        <Database className="h-10 w-10 text-gray-400 mb-3" />
                        <p className="text-gray-500 text-sm text-center">
                          No {getCategoryLabel(category)} data uploaded yet. 
                          <br />
                          {category === 'investigations' && 'Add clinical investigation summaries to strengthen your CER.'}
                          {category === 'pmsReports' && 'Add post-market surveillance reports to demonstrate ongoing safety monitoring.'}
                          {category === 'registryData' && 'Add registry datasets to provide real-world clinical evidence.'}
                          {category === 'complaints' && 'Add complaint trends to show post-market vigilance.'}
                        </p>
                      </div>
                    ) : (
                      <div className="border rounded-md overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document ID</th>
                              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Period</th>
                              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {internalData[category].map((file, index) => (
                              <tr key={file.id || index}>
                                <td className="p-3 whitespace-nowrap">
                                  <div className="flex items-center">
                                    {getFileIcon(getFileTypeFromName(file.name))}
                                    <span className="ml-2 font-medium text-gray-700">{file.name}</span>
                                  </div>
                                </td>
                                <td className="p-3 whitespace-nowrap text-gray-600">
                                  {file.metadata?.documentId || '-'}
                                </td>
                                <td className="p-3 whitespace-nowrap text-gray-600">
                                  {file.metadata?.timeframe || '-'}
                                </td>
                                <td className="p-3 whitespace-nowrap">
                                  <div className="flex space-x-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-8 px-2 text-blue-600"
                                      onClick={() => {/* View file details */}}
                                    >
                                      View
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-8 px-2 text-red-600"
                                      onClick={() => removeFile(category, file.id)}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                      <h4 className="text-sm font-medium text-blue-800 mb-1 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1 text-blue-700" />
                        Regulatory Compliance Note
                      </h4>
                      <p className="text-xs text-blue-700">
                        {category === 'investigations' && 'Clinical investigation reports provide direct evidence of device safety and performance required by EU MDR Article 61.'}
                        {category === 'pmsReports' && 'PMS data is critical for demonstrating ongoing monitoring of device safety and performance in accordance with EU MDR Article 83.'}
                        {category === 'registryData' && 'Registry data offers real-world evidence of device performance, strengthening your clinical evaluation as required by EU MDR Annex XIV.'}
                        {category === 'complaints' && 'Complaint trend analysis demonstrates vigilance and risk management compliance with EU MDR Article 87 and 88.'}
                      </p>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}