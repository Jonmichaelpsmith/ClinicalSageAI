import React, { useState } from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { 
  FileIcon, 
  FileTextIcon, 
  AlertCircleIcon, 
  CheckCircleIcon, 
  LoaderIcon, 
  FileDownIcon,
  BarChart2Icon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * CER Generator Component
 * 
 * This component allows users to generate Clinical Evaluation Reports (CERs)
 * by providing product details and selecting options.
 */
const CERGenerator = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("generate");
  const [formData, setFormData] = useState({
    productId: "",
    productName: "",
    manufacturer: "",
    deviceDescription: "",
    intendedPurpose: "",
    classification: "",
    dateRangeDays: 730,
    isDevice: true,
    isDrug: false,
    format: "pdf"
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (name, checked) => {
    setFormData({ ...formData, [name]: checked });
  };
  
  // Handle select changes
  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };
  
  // Generate CER
  const handleGenerateCER = async () => {
    // Validate required fields
    if (!formData.productId || !formData.productName) {
      toast({
        title: "Missing required fields",
        description: "Product ID and name are required to generate a report.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/cer/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate CER');
      }
      
      setResults(data);
      
      toast({
        title: "CER Generated Successfully",
        description: `The report has been generated and is ready for download.`,
        variant: "default",
      });
    } catch (err) {
      console.error('Error generating CER:', err);
      setError(err.message || 'An unexpected error occurred');
      
      toast({
        title: "Generation Failed",
        description: err.message || 'An unexpected error occurred',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch available reports
  const fetchReports = async () => {
    setReportsLoading(true);
    
    try {
      const response = await fetch('/api/cer/reports');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch reports');
      }
      
      setReports(data.reports || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
      toast({
        title: "Failed to Load Reports",
        description: err.message || 'An unexpected error occurred',
        variant: "destructive",
      });
    } finally {
      setReportsLoading(false);
    }
  };
  
  // Load reports when switching to reports tab
  const handleTabChange = (value) => {
    setActiveTab(value);
    
    if (value === 'reports') {
      fetchReports();
    }
  };
  
  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Clinical Evaluation Report (CER) Generator
        </CardTitle>
        <CardDescription>
          Generate regulatory-compliant Clinical Evaluation Reports by integrating data from FDA MAUDE, FDA FAERS, and EU EUDAMED databases.
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="generate" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="reports">Generated Reports</TabsTrigger>
          <TabsTrigger value="data">Regulatory Data</TabsTrigger>
        </TabsList>
        
        {/* Generate Report Tab */}
        <TabsContent value="generate">
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Identifier */}
                <div className="space-y-2">
                  <Label htmlFor="productId">Product Identifier (NDC/UDI/Device Code) *</Label>
                  <Input
                    id="productId"
                    name="productId"
                    placeholder="e.g. ABC-123456"
                    value={formData.productId}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                {/* Product Name */}
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name *</Label>
                  <Input
                    id="productName"
                    name="productName"
                    placeholder="e.g. Medical Device Name"
                    value={formData.productName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Manufacturer */}
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    name="manufacturer"
                    placeholder="e.g. Lumen Biosciences"
                    value={formData.manufacturer}
                    onChange={handleInputChange}
                  />
                </div>
                
                {/* Classification */}
                <div className="space-y-2">
                  <Label htmlFor="classification">Device Classification</Label>
                  <Select 
                    value={formData.classification} 
                    onValueChange={(value) => handleSelectChange("classification", value)}
                  >
                    <SelectTrigger id="classification">
                      <SelectValue placeholder="Select classification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Not Specified</SelectItem>
                      <SelectItem value="Class I">Class I</SelectItem>
                      <SelectItem value="Class II">Class II</SelectItem>
                      <SelectItem value="Class III">Class III</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deviceDescription">Device Description</Label>
                <Input
                  id="deviceDescription"
                  name="deviceDescription"
                  placeholder="Brief description of the device"
                  value={formData.deviceDescription}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="intendedPurpose">Intended Purpose</Label>
                <Input
                  id="intendedPurpose"
                  name="intendedPurpose"
                  placeholder="Intended use of the device"
                  value={formData.intendedPurpose}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date Range */}
                <div className="space-y-2">
                  <Label htmlFor="dateRangeDays">Date Range (days)</Label>
                  <Select 
                    value={formData.dateRangeDays.toString()} 
                    onValueChange={(value) => handleSelectChange("dateRangeDays", parseInt(value))}
                  >
                    <SelectTrigger id="dateRangeDays">
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="365">1 Year</SelectItem>
                      <SelectItem value="730">2 Years</SelectItem>
                      <SelectItem value="1095">3 Years</SelectItem>
                      <SelectItem value="1825">5 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Format */}
                <div className="space-y-2">
                  <Label htmlFor="format">Output Format</Label>
                  <Select 
                    value={formData.format} 
                    onValueChange={(value) => handleSelectChange("format", value)}
                  >
                    <SelectTrigger id="format">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="json">JSON Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="isDevice" 
                    checked={formData.isDevice}
                    onCheckedChange={(checked) => handleCheckboxChange("isDevice", checked)}
                  />
                  <Label htmlFor="isDevice">Device</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="isDrug" 
                    checked={formData.isDrug}
                    onCheckedChange={(checked) => handleCheckboxChange("isDrug", checked)}
                  />
                  <Label htmlFor="isDrug">Drug</Label>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setFormData({
              productId: "",
              productName: "",
              manufacturer: "",
              deviceDescription: "",
              intendedPurpose: "",
              classification: "",
              dateRangeDays: 730,
              isDevice: true,
              isDrug: false,
              format: "pdf"
            })}>
              Reset
            </Button>
            <Button onClick={handleGenerateCER} disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate CER'
              )}
            </Button>
          </CardFooter>
          
          {/* Results Section */}
          {(results || error) && (
            <CardContent className="border-t pt-4">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircleIcon className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {results && (
                <Alert className="bg-green-50 border-green-200 mb-4">
                  <CheckCircleIcon className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-700">CER Generated Successfully</AlertTitle>
                  <AlertDescription className="text-green-600">
                    <div className="mt-2">
                      <p><strong>File:</strong> {results.fileName}</p>
                      <p><strong>Size:</strong> {formatFileSize(results.fileSize)}</p>
                      <p><strong>Format:</strong> {results.format.toUpperCase()}</p>
                      <p><strong>Generated:</strong> {new Date(results.generatedAt).toLocaleString()}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="mt-2 text-green-700 border-green-600 hover:bg-green-100"
                      onClick={() => window.open(`/api/cer/report/${results.fileName}`, '_blank')}
                    >
                      <FileDownIcon className="mr-2 h-4 w-4" />
                      Download Report
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          )}
        </TabsContent>
        
        {/* Generated Reports Tab */}
        <TabsContent value="reports">
          <CardContent>
            {reportsLoading ? (
              <div className="flex items-center justify-center p-8">
                <LoaderIcon className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                <FileTextIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No reports have been generated yet.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setActiveTab('generate')}
                >
                  Generate Your First Report
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Available Reports</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={fetchReports}
                  >
                    Refresh
                  </Button>
                </div>
                
                <div className="border rounded-md divide-y">
                  {reports.map((report, index) => (
                    <div key={index} className="p-4 flex items-center justify-between hover:bg-muted/50">
                      <div className="flex items-center space-x-4">
                        {report.format === 'pdf' ? (
                          <FileIcon className="h-8 w-8 text-red-500" />
                        ) : (
                          <FileTextIcon className="h-8 w-8 text-blue-500" />
                        )}
                        <div>
                          <p className="font-medium">{report.product.name}</p>
                          <p className="text-sm text-muted-foreground">ID: {report.product.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(report.created).toLocaleString()} • {formatFileSize(report.size)}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(report.url, '_blank')}
                      >
                        <FileDownIcon className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </TabsContent>
        
        {/* Regulatory Data Tab */}
        <TabsContent value="data">
          <CardContent>
            <div className="text-center p-8 space-y-4">
              <BarChart2Icon className="h-12 w-12 mx-auto text-primary/60" />
              <h3 className="text-lg font-medium">Access Regulatory Data Only</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Query regulatory databases without generating a full report.
                This is useful for preliminary analysis or data exploration.
              </p>
              <Button className="mt-4" onClick={() => setActiveTab('generate')}>
                Generate Full Report Instead
              </Button>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default CERGenerator;