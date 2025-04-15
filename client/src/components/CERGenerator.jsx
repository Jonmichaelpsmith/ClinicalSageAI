import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CERGenerator() {
  const [ndcCode, setNdcCode] = useState('');
  const [cerReport, setCerReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const generateCER = async () => {
    if (!ndcCode.trim()) {
      setError('Please enter an NDC code');
      return;
    }

    setLoading(true);
    setError('');
    setCerReport('');
    
    try {
      const res = await fetch(`/api/cer/faers/${ndcCode}`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to generate CER report');
      }
      
      const data = await res.json();
      setCerReport(data.cer_report);
      
      toast({
        title: "Report Generated Successfully",
        description: "Your Clinical Evaluation Report has been generated.",
        variant: "success",
      });
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error Generating Report",
        description: err.message || "Failed to generate CER report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>FDA FAERS CER Generator</CardTitle>
        <CardDescription>
          Generate Clinical Evaluation Reports from FDA FAERS data by providing an NDC code
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ndc-code">NDC Code <span className="text-red-500">*</span></Label>
          <div className="flex gap-2">
            <Input
              id="ndc-code"
              placeholder="Enter NDC Code (e.g. 0002-4462)"
              value={ndcCode}
              onChange={(e) => setNdcCode(e.target.value)}
              required
            />
            <Button 
              onClick={generateCER} 
              disabled={loading || !ndcCode}
              className="whitespace-nowrap"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate CER"
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            National Drug Code identifier for the product
          </p>
        </div>
        
        {error && (
          <div className="flex items-center p-3 text-sm border rounded-md border-red-200 bg-red-50 text-red-600">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}
        
        {cerReport && (
          <div className="p-4 mt-4 overflow-auto border rounded-md max-h-[400px]">
            <h3 className="mb-2 text-lg font-medium">Generated CER Report</h3>
            <div className="p-3 overflow-auto text-sm bg-gray-50 rounded-md whitespace-pre-wrap">
              {cerReport}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}