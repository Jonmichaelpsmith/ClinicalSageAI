import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const CERGenerator = () => {
  const [ndcCode, setNdcCode] = useState('');
  const [productName, setProductName] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [saveStatus, setSaveStatus] = useState({ saving: false, saved: false });
  const { toast } = useToast();

  const handleNdcChange = (e) => {
    setNdcCode(e.target.value);
  };

  const handleProductNameChange = (e) => {
    setProductName(e.target.value);
  };

  const validateNdc = (code) => {
    // NDC codes can be in 10-digit or 11-digit format
    // Common formats: XXXX-XXXX-XX or XXXXX-XXX-XX or without hyphens
    const ndc10Pattern = /^\d{4}-\d{4}-\d{2}$|^\d{5}-\d{3}-\d{2}$|^\d{5}-\d{4}-\d{1}$|^\d{10}$/;
    const ndc11Pattern = /^\d{5}-\d{4}-\d{2}$|^\d{5}-\d{3}-\d{3}$|^\d{11}$/;
    
    return ndc10Pattern.test(code) || ndc11Pattern.test(code);
  };

  const handleGenerateCER = async () => {
    if (!ndcCode) {
      toast({
        title: "Missing NDC Code",
        description: "Please enter an NDC code to generate a CER report.",
        variant: "destructive",
      });
      return;
    }

    if (!validateNdc(ndcCode)) {
      toast({
        title: "Invalid NDC Format",
        description: "Please enter a valid NDC code (e.g., 0074-3797-13 or 00743797-13).",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResults(null);
    
    try {
      const params = new URLSearchParams();
      if (productName) {
        params.append('product_name', productName);
      }
      
      const response = await apiRequest(
        'GET', 
        `/api/cer/faers/${ndcCode}?${params.toString()}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate CER report');
      }
      
      const data = await response.json();
      setResults(data);
      
      toast({
        title: "CER Generated Successfully",
        description: `Generated CER report for NDC ${ndcCode}`,
      });
    } catch (error) {
      console.error('Error generating CER:', error);
      toast({
        title: "CER Generation Failed",
        description: error.message || "An error occurred while generating the CER report.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCER = async () => {
    if (!results) {
      toast({
        title: "No CER to Save",
        description: "Please generate a CER report first before saving.",
        variant: "destructive",
      });
      return;
    }

    setSaveStatus({ saving: true, saved: false });
    
    try {
      const response = await apiRequest('POST', '/api/cer/faers/save', {
        title: `${productName || 'Product'} CER from FAERS Data`,
        device_name: productName || 'FDA Product',
        manufacturer: 'Generated from FDA FAERS',
        content_text: results.cer_report,
        metadata: {
          ndc_code: ndcCode,
          total_records: results.total_records,
          generated_date: new Date().toISOString(),
          source: 'FAERS'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save CER report');
      }
      
      const data = await response.json();
      setSaveStatus({ saving: false, saved: true });
      
      toast({
        title: "CER Saved Successfully",
        description: `Saved as CER #${data.cer_id}`,
      });
    } catch (error) {
      console.error('Error saving CER:', error);
      toast({
        title: "Save Failed",
        description: error.message || "An error occurred while saving the CER report.",
        variant: "destructive",
      });
      setSaveStatus({ saving: false, saved: false });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <label className="font-medium block mb-1" htmlFor="ndc-code">
                NDC Code <span className="text-red-500">*</span>
              </label>
              <Input
                id="ndc-code"
                placeholder="Enter NDC code (e.g., 0074-3797-13)"
                value={ndcCode}
                onChange={handleNdcChange}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground mt-1">
                The FDA's National Drug Code identifier for the product
              </p>
            </div>
            
            <div>
              <label className="font-medium block mb-1" htmlFor="product-name">
                Product Name (Optional)
              </label>
              <Input
                id="product-name"
                placeholder="Enter product name"
                value={productName}
                onChange={handleProductNameChange}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground mt-1">
                If provided, this will help personalize the CER content
              </p>
            </div>
            
            <div className="flex space-x-2 pt-2">
              <Button 
                className="w-full"
                onClick={handleGenerateCER}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating CER...
                  </>
                ) : "Generate CER"}
              </Button>
              
              {results && (
                <Button 
                  className="w-1/3"
                  onClick={handleSaveCER}
                  disabled={saveStatus.saving || saveStatus.saved}
                  variant={saveStatus.saved ? "outline" : "default"}
                >
                  {saveStatus.saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : saveStatus.saved ? "Saved ✓" : "Save CER"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {results && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">
                  CER Report for {productName || `NDC: ${ndcCode}`}
                </h3>
                <span className="text-sm text-muted-foreground">
                  Based on {results.total_records} FAERS records
                </span>
              </div>
              
              <div className="max-h-[600px] overflow-y-auto p-4 border rounded-md bg-slate-50 dark:bg-slate-900/50">
                <div className="whitespace-pre-wrap font-serif text-sm">
                  {results.cer_report}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CERGenerator;