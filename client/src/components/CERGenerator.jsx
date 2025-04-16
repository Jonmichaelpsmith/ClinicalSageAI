import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save, FileDown, AlertTriangle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const CERGenerator = () => {
  const [ndcCode, setNdcCode] = useState('');
  const [productName, setProductName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [faersData, setFaersData] = useState(null);
  const [report, setReport] = useState(null);
  const [reportTitle, setReportTitle] = useState('');
  const [activeSection, setActiveSection] = useState('generator');
  
  const { toast } = useToast();

  const handleNdcCodeChange = (e) => {
    setNdcCode(e.target.value);
  };

  const handleProductNameChange = (e) => {
    setProductName(e.target.value);
  };

  const handleReportTitleChange = (e) => {
    setReportTitle(e.target.value);
  };

  const validateNdcCode = (code) => {
    // Basic NDC validation - should be numbers and hyphens
    return /^[0-9-]+$/.test(code);
  };

  const fetchFaersData = async () => {
    if (!validateNdcCode(ndcCode)) {
      toast({
        title: "Invalid NDC Code",
        description: "Please enter a valid NDC code containing only numbers and hyphens.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setFaersData(null);
    setReport(null);

    try {
      const response = await apiRequest('POST', '/api/cer/faers/data', {
        ndcCode: ndcCode
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching FAERS data: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (!data.results || data.results.length === 0) {
        toast({
          title: "No Data Found",
          description: "No adverse event data was found for the provided NDC code. Please verify the code and try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      setFaersData(data);
      toast({
        title: "FAERS Data Retrieved",
        description: `Successfully retrieved ${data.results.length} adverse event reports.`,
      });
      
      // Automatically generate report once FAERS data is fetched
      generateReport(data);
      
    } catch (error) {
      console.error('Error fetching FAERS data:', error);
      toast({
        title: "Error Retrieving Data",
        description: error.message || "An error occurred while retrieving FAERS data.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  
  const generateReport = async (data) => {
    try {
      const response = await apiRequest('POST', '/api/cer/faers/generate-narrative', {
        faersData: data,
        productName: productName || undefined
      });
      
      if (!response.ok) {
        throw new Error(`Error generating report: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setReport(result.narrative);
      
      // Set default report title if not already set
      if (!reportTitle) {
        const productDisplayName = productName || 
          data.drug_info?.brand_name || 
          data.drug_info?.generic_name || 
          `NDC ${ndcCode}`;
        setReportTitle(`Clinical Evaluation Report - ${productDisplayName}`);
      }
      
      toast({
        title: "Report Generated",
        description: "Successfully generated Clinical Evaluation Report based on FAERS data.",
      });
      
      // Switch to the report view
      setActiveSection('report');
      
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error Generating Report",
        description: error.message || "An error occurred while generating the report.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveReport = async () => {
    if (!report) {
      toast({
        title: "No Report to Save",
        description: "Please generate a report first.",
        variant: "destructive",
      });
      return;
    }
    
    if (!reportTitle) {
      toast({
        title: "Report Title Required",
        description: "Please provide a title for this report.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const response = await apiRequest('POST', '/api/cer/faers/save-report', {
        title: reportTitle,
        content: report,
        ndcCode: ndcCode,
        productName: productName || faersData?.drug_info?.brand_name || faersData?.drug_info?.generic_name,
        manufacturer: faersData?.drug_info?.manufacturer || 'Unknown',
        metadata: {
          faersRecordCount: faersData?.results?.length || 0,
          generatedAt: new Date().toISOString()
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error saving report: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      toast({
        title: "Report Saved",
        description: "Successfully saved the Clinical Evaluation Report to the system.",
      });
      
    } catch (error) {
      console.error('Error saving report:', error);
      toast({
        title: "Error Saving Report",
        description: error.message || "An error occurred while saving the report.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const downloadReport = () => {
    if (!report) {
      toast({
        title: "No Report to Download",
        description: "Please generate a report first.",
        variant: "destructive",
      });
      return;
    }
    
    const filename = (reportTitle || 'Clinical-Evaluation-Report').replace(/\s+/g, '-') + '.txt';
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report Downloaded",
      description: `Saved as ${filename}`,
    });
  };

  return (
    <div className="space-y-8">
      <Tabs defaultValue="generator" value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generator">Generator</TabsTrigger>
          <TabsTrigger value="report" disabled={!report}>Report</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generator" className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="ndc-code" className="text-sm font-medium">
                  NDC Code <span className="text-destructive">*</span>
                </label>
                <div className="flex gap-2">
                  <Input
                    id="ndc-code"
                    placeholder="Enter NDC code (e.g., 0310-0790)"
                    value={ndcCode}
                    onChange={handleNdcCodeChange}
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button onClick={fetchFaersData} disabled={!ndcCode || isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Fetch Data"
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter the National Drug Code to retrieve data from the FDA FAERS database.
                </p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="product-name" className="text-sm font-medium">
                  Product Name (Optional)
                </label>
                <Input
                  id="product-name"
                  placeholder="Override product name"
                  value={productName}
                  onChange={handleProductNameChange}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Optionally specify a product name to use in the report instead of the one retrieved from FAERS.
                </p>
              </div>
            </CardContent>
          </Card>
          
          {faersData && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">FAERS Data Summary</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Product</h4>
                      <p>
                        {productName || 
                         faersData.drug_info?.brand_name || 
                         faersData.drug_info?.generic_name || 
                         `NDC ${ndcCode}`}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">Manufacturer</h4>
                      <p>{faersData.drug_info?.manufacturer || 'Unknown'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">Reports Count</h4>
                      <p>{faersData.results?.length || 0}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">Generic Name</h4>
                      <p>{faersData.drug_info?.generic_name || 'Not available'}</p>
                    </div>
                  </div>
                  
                  {isLoading && (
                    <div className="flex items-center justify-center py-4">
                      <div className="flex flex-col items-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="mt-2 text-sm text-muted-foreground">Generating CER narrative...</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="report" className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="report-title" className="text-sm font-medium">
                  Report Title <span className="text-destructive">*</span>
                </label>
                <Input
                  id="report-title"
                  placeholder="Enter report title"
                  value={reportTitle}
                  onChange={handleReportTitleChange}
                  className="w-full"
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={saveReport} 
                  className="flex-1"
                  disabled={isSaving || !report || !reportTitle}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Report
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={downloadReport} 
                  variant="outline"
                  disabled={!report}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Report Content</h3>
              {report ? (
                <Textarea 
                  value={report}
                  readOnly
                  className="min-h-[500px] font-mono text-sm"
                />
              ) : (
                <div className="flex flex-col items-center justify-center border border-dashed rounded-md p-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mb-2" />
                  <p>No report content available. Please generate a report first.</p>
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