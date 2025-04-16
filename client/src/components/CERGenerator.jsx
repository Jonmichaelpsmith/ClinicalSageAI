import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, FileText, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * Clinical Evaluation Report (CER) Generator Component
 * 
 * This component allows users to generate CERs from various data sources
 * including FDA MAUDE, EUDAMED, and FAERS databases.
 */
const CERGenerator = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [generatedReports, setGeneratedReports] = useState([]);
  const [formData, setFormData] = useState({
    productId: '',
    productName: '',
    manufacturer: '',
    deviceDescription: '',
    intendedPurpose: '',
    classification: '',
    dateRange: '730',
    outputFormat: 'pdf'
  });
  const [selectedTab, setSelectedTab] = useState('generate');
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle select changes
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Generate CER
  const generateCER = async () => {
    // Validate required fields
    if (!formData.productId || !formData.productName) {
      toast({
        title: "Missing required fields",
        description: "Product ID and Product Name are required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Call API to generate CER
      const response = await fetch('/api/cer/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to generate CER');
      }
      
      setGeneratedReport(data);
      
      toast({
        title: "CER Generated Successfully",
        description: "Your Clinical Evaluation Report has been generated",
      });
      
      // Load the list of reports
      fetchReportsList();
      
      // Switch to reports tab
      setSelectedTab('reports');
    } catch (error) {
      console.error('Error generating CER:', error);
      toast({
        title: "Error Generating CER",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch list of generated reports
  const fetchReportsList = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/cer/list');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reports');
      }
      
      setGeneratedReports(data.files || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error Loading Reports",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Download a report
  const downloadReport = (url) => {
    window.open(url, '_blank');
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        Clinical Evaluation Report (CER) Generator
      </h1>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate CER</TabsTrigger>
          <TabsTrigger value="reports" onClick={fetchReportsList}>View Reports</TabsTrigger>
        </TabsList>
        
        {/* Generate CER Tab */}
        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>Generate New CER</CardTitle>
              <CardDescription>
                Create a clinical evaluation report from FDA MAUDE, EUDAMED, and FAERS data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product ID */}
                <div className="space-y-2">
                  <Label htmlFor="productId">Product ID (Required)</Label>
                  <Input
                    id="productId"
                    name="productId"
                    placeholder="NDC or device code"
                    value={formData.productId}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                {/* Product Name */}
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name (Required)</Label>
                  <Input
                    id="productName"
                    name="productName"
                    placeholder="Product name"
                    value={formData.productName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                {/* Manufacturer */}
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    name="manufacturer"
                    placeholder="Manufacturer name"
                    value={formData.manufacturer}
                    onChange={handleInputChange}
                  />
                </div>
                
                {/* Classification */}
                <div className="space-y-2">
                  <Label htmlFor="classification">Classification</Label>
                  <Select 
                    onValueChange={(value) => handleSelectChange('classification', value)}
                    value={formData.classification}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select classification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Class I">Class I</SelectItem>
                      <SelectItem value="Class II">Class II</SelectItem>
                      <SelectItem value="Class III">Class III</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Device Description */}
                <div className="space-y-2">
                  <Label htmlFor="deviceDescription">Device Description</Label>
                  <Input
                    id="deviceDescription"
                    name="deviceDescription"
                    placeholder="Brief device description"
                    value={formData.deviceDescription}
                    onChange={handleInputChange}
                  />
                </div>
                
                {/* Intended Purpose */}
                <div className="space-y-2">
                  <Label htmlFor="intendedPurpose">Intended Purpose</Label>
                  <Input
                    id="intendedPurpose"
                    name="intendedPurpose"
                    placeholder="Intended use or purpose"
                    value={formData.intendedPurpose}
                    onChange={handleInputChange}
                  />
                </div>
                
                {/* Date Range */}
                <div className="space-y-2">
                  <Label htmlFor="dateRange">Date Range (days)</Label>
                  <Input
                    id="dateRange"
                    name="dateRange"
                    type="number"
                    min="1"
                    max="3650"
                    placeholder="Data time range in days"
                    value={formData.dateRange}
                    onChange={handleInputChange}
                  />
                </div>
                
                {/* Output Format */}
                <div className="space-y-2">
                  <Label htmlFor="outputFormat">Output Format</Label>
                  <Select 
                    onValueChange={(value) => handleSelectChange('outputFormat', value)}
                    value={formData.outputFormat}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select output format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="json">JSON Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={generateCER}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating CER...
                  </>
                ) : (
                  <>Generate CER</>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Generated Report Alert */}
          {generatedReport && (
            <Alert className="mt-4">
              <FileText className="h-4 w-4" />
              <AlertTitle>CER Generated Successfully</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>Your report is ready for download.</span>
                <Button 
                  variant="outline" 
                  onClick={() => downloadReport(generatedReport.file.url)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
        
        {/* View Reports Tab */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Generated Reports</CardTitle>
                  <CardDescription>
                    View and download previously generated CERs
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={fetchReportsList}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : generatedReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No reports found. Generate a new CER to see it here.
                </div>
              ) : (
                <div className="space-y-4">
                  {generatedReports.map((report, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-3 text-blue-500" />
                        <div>
                          <p className="font-medium">{report.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(report.created).toLocaleString()} • {(report.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => downloadReport(report.url)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CERGenerator;