import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Database, 
  FileUp, 
  FileText, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  ClipboardList, 
  LineChart,
  Activity,
  PieChart
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import CerAPIService from '@/services/CerAPIService';

/**
 * Component for managing internal clinical data for Clinical Evaluation Reports
 * 
 * This component provides functionality to upload and manage internal clinical
 * data required for EU MDR-compliant CERs, including:
 * - Clinical investigation summaries
 * - Post-market surveillance (PMS) reports
 * - Registry data
 * - Complaint trend data
 */
export default function InternalClinicalDataPanel({ jobId }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("investigations");
  const [formData, setFormData] = useState({
    fileName: "",
    reportType: "",
    studyDesign: "",
    dataType: "",
    timeframe: "",
    sampleSize: "",
    summary: "",
    author: "",
    department: "",
    documentId: ""
  });

  // Query to fetch existing internal clinical data
  const { data: internalData, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/cer/internal-data'],
    enabled: true,
  });

  // Query to fetch summary of internal clinical data
  const { data: summaryData } = useQuery({
    queryKey: ['/api/cer/internal-data/summary'],
    enabled: !!internalData,
  });

  // Mutation for adding new internal clinical data
  const addInternalDataMutation = useMutation({
    mutationFn: (data) => CerAPIService.addInternalClinicalData(data),
    onSuccess: () => {
      toast({
        title: "Data Added Successfully",
        description: "Your internal clinical data has been added to the CER database.",
        variant: "success"
      });
      
      // Reset form
      setFormData({
        fileName: "",
        reportType: "",
        studyDesign: "",
        dataType: "",
        timeframe: "",
        sampleSize: "",
        summary: "",
        author: "",
        department: "",
        documentId: ""
      });
      
      // Refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/cer/internal-data'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cer/internal-data/summary'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Data",
        description: error.message || "An error occurred while adding clinical data.",
        variant: "destructive"
      });
    }
  });

  // Mutation for deleting internal clinical data
  const deleteInternalDataMutation = useMutation({
    mutationFn: (id) => CerAPIService.deleteInternalClinicalData(id),
    onSuccess: () => {
      toast({
        title: "Data Deleted",
        description: "The internal clinical data has been removed from the CER database.",
        variant: "success"
      });
      
      // Refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/cer/internal-data'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cer/internal-data/summary'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Delete Data",
        description: error.message || "An error occurred while deleting clinical data.",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.fileName || !formData.reportType) {
      toast({
        title: "Missing Information",
        description: "Please provide at least a file name and report type.",
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
    addInternalDataMutation.mutate(dataToSubmit);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this clinical data? This action cannot be undone.")) {
      deleteInternalDataMutation.mutate(id);
    }
  };

  // Helper to render category-specific icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'investigations':
        return <ClipboardList className="h-5 w-5 text-blue-600" />;
      case 'pmsReports':
        return <Activity className="h-5 w-5 text-green-600" />;
      case 'registryData':
        return <PieChart className="h-5 w-5 text-indigo-600" />;
      case 'complaints':
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Panel - Data Entry Form */}
        <Card className="w-full md:w-1/2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Add Internal Clinical Data
            </CardTitle>
            <CardDescription>
              Upload clinical investigation data, PMS reports, registry data, and complaint trends
              required for comprehensive EU MDR-compliant Clinical Evaluation Reports.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
                <TabsTrigger value="investigations" className="text-xs md:text-sm">Investigations</TabsTrigger>
                <TabsTrigger value="pmsReports" className="text-xs md:text-sm">PMS Reports</TabsTrigger>
                <TabsTrigger value="registryData" className="text-xs md:text-sm">Registry Data</TabsTrigger>
                <TabsTrigger value="complaints" className="text-xs md:text-sm">Complaint Trends</TabsTrigger>
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
                        {activeTab === "investigations" && (
                          <>
                            <SelectItem value="clinical-investigation">Clinical Investigation</SelectItem>
                            <SelectItem value="feasibility-study">Feasibility Study</SelectItem>
                            <SelectItem value="usability-study">Usability Study</SelectItem>
                            <SelectItem value="first-in-human">First-in-Human Study</SelectItem>
                          </>
                        )}
                        
                        {activeTab === "pmsReports" && (
                          <>
                            <SelectItem value="psur">Periodic Safety Update Report (PSUR)</SelectItem>
                            <SelectItem value="pms-report">Post-Market Surveillance Report</SelectItem>
                            <SelectItem value="pmcf-report">PMCF Report</SelectItem>
                            <SelectItem value="safety-update">Safety Update</SelectItem>
                          </>
                        )}
                        
                        {activeTab === "registryData" && (
                          <>
                            <SelectItem value="device-registry">Device Registry Data</SelectItem>
                            <SelectItem value="implant-registry">Implant Registry</SelectItem>
                            <SelectItem value="procedure-registry">Procedure Registry</SelectItem>
                            <SelectItem value="national-registry">National Registry</SelectItem>
                          </>
                        )}
                        
                        {activeTab === "complaints" && (
                          <>
                            <SelectItem value="complaint-analysis">Complaint Analysis</SelectItem>
                            <SelectItem value="trend-report">Trend Report</SelectItem>
                            <SelectItem value="failure-analysis">Failure Analysis</SelectItem>
                            <SelectItem value="vigilance-summary">Vigilance Summary</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {(activeTab === "investigations" || activeTab === "pmsReports") && (
                    <div className="space-y-2">
                      <Label htmlFor="studyDesign">Study Design</Label>
                      <Select
                        value={formData.studyDesign}
                        onValueChange={(value) => handleSelectChange("studyDesign", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select study design" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rct">Randomized Controlled Trial</SelectItem>
                          <SelectItem value="cohort">Cohort Study</SelectItem>
                          <SelectItem value="case-control">Case-Control Study</SelectItem>
                          <SelectItem value="case-series">Case Series</SelectItem>
                          <SelectItem value="observational">Observational Study</SelectItem>
                          <SelectItem value="single-arm">Single-Arm Study</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="timeframe">Time Period</Label>
                      <Input
                        id="timeframe"
                        name="timeframe"
                        value={formData.timeframe}
                        onChange={handleInputChange}
                        placeholder="e.g., 2022-2024"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sampleSize">Sample Size</Label>
                      <Input
                        id="sampleSize"
                        name="sampleSize"
                        value={formData.sampleSize}
                        onChange={handleInputChange}
                        placeholder="e.g., 250"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="summary">Summary</Label>
                    <Textarea
                      id="summary"
                      name="summary"
                      value={formData.summary}
                      onChange={handleInputChange}
                      placeholder="Enter a summary of the clinical data"
                      rows={4}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="author">Author</Label>
                      <Input
                        id="author"
                        name="author"
                        value={formData.author}
                        onChange={handleInputChange}
                        placeholder="Document author"
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
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="documentId">Document ID/Reference</Label>
                    <Input
                      id="documentId"
                      name="documentId"
                      value={formData.documentId}
                      onChange={handleInputChange}
                      placeholder="e.g., CSR-2023-001"
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={addInternalDataMutation.isPending}
                >
                  {addInternalDataMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      Adding Data...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <FileUp className="h-4 w-4" />
                      Add Clinical Data
                    </span>
                  )}
                </Button>
              </form>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex flex-col items-start pt-0">
            <div className="text-sm text-muted-foreground mt-2">
              <div className="flex items-center gap-2 mb-1">
                <Info className="h-4 w-4 text-blue-500" />
                <span>All internal clinical data is included in the CER assessment.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>EU MDR Article 61 requires inclusion of internal clinical data.</span>
              </div>
            </div>
          </CardFooter>
        </Card>
        
        {/* Right Panel - Overview and Existing Data */}
        <Card className="w-full md:w-1/2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Internal Clinical Evidence Overview
            </CardTitle>
            <CardDescription>
              View and manage your internal clinical data for CER inclusion
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
                  {error.message || "Failed to load internal clinical data. Please try again."}
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <DataCountCard 
                    title="Investigations" 
                    count={internalData?.investigations.length || 0}
                    icon={<ClipboardList className="h-5 w-5 text-blue-600" />}
                  />
                  <DataCountCard 
                    title="PMS Reports" 
                    count={internalData?.pmsReports.length || 0}
                    icon={<Activity className="h-5 w-5 text-green-600" />}
                  />
                  <DataCountCard 
                    title="Registry Data" 
                    count={internalData?.registryData.length || 0}
                    icon={<PieChart className="h-5 w-5 text-indigo-600" />}
                  />
                  <DataCountCard 
                    title="Complaints" 
                    count={internalData?.complaints.length || 0}
                    icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
                  />
                </div>
                
                {/* Existing Data List */}
                <div className="border rounded-md">
                  <div className="p-3 border-b bg-muted/50 font-medium">
                    Clinical Data Records
                  </div>
                  <div className="divide-y max-h-[400px] overflow-y-auto">
                    {internalData && Object.keys(internalData).map(category => (
                      internalData[category].map(item => (
                        <div key={item.id} className="p-3 hover:bg-muted/50">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                              {getCategoryIcon(category)}
                              <div>
                                <div className="font-medium">{item.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {item.metadata?.reportType} • {item.metadata?.timeframe || "No timeframe"}
                                </div>
                                <div className="text-sm mt-1 text-gray-600 max-w-md">
                                  {item.metadata?.summary?.length > 100 
                                    ? `${item.metadata.summary.substring(0, 100)}...` 
                                    : item.metadata?.summary}
                                </div>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(item.id)}
                              disabled={deleteInternalDataMutation.isPending}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))
                    ))}
                    
                    {(!internalData || Object.values(internalData).flat().length === 0) && (
                      <div className="p-8 text-center text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                        <p>No internal clinical data has been added yet.</p>
                        <p className="text-sm mt-1">Add clinical investigations, PMS reports, registry data, and complaint trends using the form.</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Summary Section */}
                {summaryData?.summary?.totalItems > 0 && (
                  <Alert className="mt-4 bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-500" />
                    <AlertTitle>Clinical Evidence Summary</AlertTitle>
                    <AlertDescription className="mt-2">
                      <div className="text-sm text-blue-700">
                        {summaryData.summary.narrative || (
                          <p>Your CER includes {summaryData.summary.totalItems} items of internal clinical evidence across {Object.values(summaryData.summary.categories).filter(count => count > 0).length} categories.</p>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => refetch()}>
              Refresh Data
            </Button>
            <Button variant="secondary" onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/cer/internal-data/summary'] })}>
              Update Summary
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Regulatory Guidance */}
      <Card className="bg-gray-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">EU MDR Clinical Data Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p>
              <strong>Article 61(3) of EU MDR 2017/745</strong> requires manufacturers to actively update their clinical evaluation with data obtained from post-market surveillance.
            </p>
            <p>
              <strong>MDCG 2020-13</strong> emphasizes that clinical evaluation must include all available clinical data, 
              both from literature and from the manufacturer's internal clinical investigations, PMS activities, field safety 
              reports, registry data, and complaint trends.
            </p>
            <p>
              <strong>MDCG 2020-6 Section 4</strong> specifically requires post-market clinical follow-up (PMCF) data to be 
              incorporated into the clinical evaluation, forming a continuous process throughout the device lifecycle.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for data count cards
function DataCountCard({ title, count, icon }) {
  return (
    <div className="bg-white rounded-lg border p-3 flex flex-col items-center text-center">
      <div className="mb-1">{icon}</div>
      <div className="text-xl font-bold">{count}</div>
      <div className="text-xs text-muted-foreground">{title}</div>
    </div>
  );
}