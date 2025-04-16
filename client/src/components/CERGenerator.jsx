import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, FileText, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CERGenerator = () => {
  const [ndcCode, setNdcCode] = useState('');
  const [cerReport, setCerReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [generationCompleted, setGenerationCompleted] = useState(false);
  const { toast } = useToast();

  const validateNdcCode = (code) => {
    // Basic validation - could be enhanced based on NDC code format requirements
    return code.trim().length > 0;
  };

  const generateCER = async () => {
    // Validate input
    if (!validateNdcCode(ndcCode)) {
      toast({
        title: "Invalid NDC Code",
        description: "Please enter a valid NDC code",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setCerReport('');
    setGenerationCompleted(false);

    try {
      const response = await fetch(`/api/cer/${ndcCode}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      const data = await response.json();
      setCerReport(data.cer_report);
      setGenerationCompleted(true);
      
      toast({
        title: "CER Generated Successfully",
        description: "Your Clinical Evaluation Report has been generated.",
      });
    } catch (error) {
      console.error('Error generating CER:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate CER. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!generationCompleted) {
      toast({
        title: "No Report Generated",
        description: "Please generate a CER report first before creating a PDF.",
        variant: "destructive"
      });
      return;
    }

    setPdfLoading(true);
    
    try {
      const response = await fetch(`/api/cer/${ndcCode}/enhanced-pdf-task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: '123' }) // In a real app, this would be the actual user ID
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      toast({
        title: "PDF Generation Started",
        description: "Your PDF is being prepared and will be available shortly.",
      });
    } catch (error) {
      console.error('Error requesting PDF:', error);
      toast({
        title: "PDF Request Failed",
        description: error.message || "Failed to request PDF generation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label htmlFor="ndc-code" className="block text-sm font-medium mb-2">
            NDC Code
          </label>
          <Input
            id="ndc-code"
            placeholder="Enter NDC Code (e.g., 0074-3799)"
            value={ndcCode}
            onChange={(e) => setNdcCode(e.target.value)}
            className="w-full"
          />
        </div>
        <Button 
          onClick={generateCER} 
          disabled={loading}
          className="mb-0"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Generate CER
            </>
          )}
        </Button>
      </div>

      {generationCompleted && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={generatePDF}
            disabled={pdfLoading}
          >
            {pdfLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Preparing PDF...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Generate PDF
              </>
            )}
          </Button>
        </div>
      )}

      {loading && (
        <div className="p-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {cerReport && (
        <div>
          <h3 className="text-lg font-medium mb-4">Clinical Evaluation Report</h3>
          <div className="p-6 bg-muted/50 rounded-md whitespace-pre-wrap">
            {cerReport}
          </div>
        </div>
      )}
    </div>
  );
};

export default CERGenerator;