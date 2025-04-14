import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { FileText, Upload, Download, Copy, RefreshCw } from 'lucide-react';

/**
 * CSR Extractor Dashboard Component
 * 
 * A streamlined dashboard for uploading CSRs, processing them into 
 * structured JSON mapping, and visualizing results.
 */
const CSRExtractorDashboard: React.FC = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentReportId, setCurrentReportId] = useState<number | null>(null);
  const [processedData, setProcessedData] = useState<any>(null);

  /**
   * Handle file selection
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus("");
      setProcessedData(null);
    }
  };
  
  /**
   * Handle file upload
   */
  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSR file to upload.",
        variant: "destructive"
      });
      return;
    }
    
    setUploading(true);
    setStatus("📤 Uploading...");
    setUploadProgress(10);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const nextProgress = prev + Math.random() * 15;
          return nextProgress >= 90 ? 90 : nextProgress;
        });
      }, 500);
      
      // Upload the file
      const response = await fetch('/api/csr/upload', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      setUploadProgress(100);
      setCurrentReportId(data.reportId);
      setStatus("✅ Upload complete. Processing CSR...");
      
      // Start polling for the processed data
      await checkProcessingComplete(data.reportId);
      
    } catch (error) {
      console.error('Upload error:', error);
      setStatus(`❌ Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      setUploading(false);
    }
  };
  
  /**
   * Poll for processing completion
   */
  const checkProcessingComplete = async (reportId: number) => {
    try {
      // Poll every 2 seconds for up to 30 seconds
      let attempts = 0;
      const maxAttempts = 15;
      
      const checkStatus = async () => {
        attempts++;
        const response = await apiRequest('GET', `/api/csr/status/${reportId}`);
        const data = await response.json();
        
        if (data.processed) {
          // Fetch the processed data
          await fetchProcessedData(reportId);
          setStatus("✅ Processing complete");
          setUploading(false);
          return;
        }
        
        if (attempts >= maxAttempts) {
          setStatus("⏱️ Processing is taking longer than expected. You can check back later.");
          setUploading(false);
          return;
        }
        
        // Continue polling
        setTimeout(checkStatus, 2000);
      };
      
      await checkStatus();
      
    } catch (error) {
      console.error('Error checking processing status:', error);
      setStatus("❌ Error checking processing status");
      setUploading(false);
    }
  };
  
  /**
   * Fetch the processed data
   */
  const fetchProcessedData = async (reportId: number) => {
    try {
      const response = await apiRequest('GET', `/api/csr/${reportId}`);
      const data = await response.json();
      
      if (data.processedData) {
        setProcessedData(data.processedData);
        toast({
          title: "CSR processed successfully",
          description: "The CSR has been mapped to the structured JSON format.",
        });
      }
    } catch (error) {
      console.error('Error fetching processed data:', error);
      toast({
        title: "Error fetching processed data",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };
  
  /**
   * Download the processed JSON
   */
  const handleDownloadJson = () => {
    if (!processedData) return;
    
    const jsonString = JSON.stringify(processedData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `CSR-${currentReportId || 'processed'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  /**
   * Copy JSON to clipboard
   */
  const handleCopyJson = () => {
    if (!processedData) return;
    
    const jsonString = JSON.stringify(processedData, null, 2);
    navigator.clipboard.writeText(jsonString);
    
    toast({
      title: "Copied to clipboard",
      description: "The JSON has been copied to your clipboard.",
    });
  };
  
  /**
   * Send CSR data to the intelligence engine
   */
  const handleUseForIntelligence = async () => {
    if (!processedData) return;
    
    try {
      setStatus("🔄 Sending to intelligence engine...");
      
      const response = await apiRequest('POST', '/api/intelligence/ingest-csr', {
        csr_id: currentReportId ? `csr_${currentReportId}` : undefined,
        content: processedData
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      toast({
        title: "Success!",
        description: "CSR has been added to the intelligence engine.",
      });
      
      setStatus(`✅ CSR indexed as ${data.csr_id}`);
      
      // Redirect to planning page
      if (data.redirect_route) {
        window.location.href = data.redirect_route;
      }
      
    } catch (error) {
      console.error('Intelligence engine error:', error);
      toast({
        title: "Intelligence engine error",
        description: error instanceof Error ? error.message : "Failed to process CSR with intelligence engine",
        variant: "destructive"
      });
      setStatus(`❌ Intelligence engine error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };
  
  /**
   * Trigger reprocessing of a CSR
   */
  const handleReprocess = async () => {
    if (!currentReportId) return;
    
    try {
      setUploading(true);
      setStatus("🔄 Reprocessing CSR...");
      
      await apiRequest('POST', `/api/csr/process/${currentReportId}`);
      
      // Poll for completion
      await checkProcessingComplete(currentReportId);
      
    } catch (error) {
      console.error('Error reprocessing CSR:', error);
      setStatus(`❌ Reprocessing failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      setUploading(false);
    }
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">📄 CSR Intelligence Extractor</h1>
      <p className="text-muted-foreground text-sm">
        Upload a CSR file to extract and map its contents into structured data fields for predictive use.
      </p>

      <Card>
        <CardContent className="p-4 space-y-4">
          <input 
            type="file" 
            accept=".pdf,.txt"
            onChange={handleFileChange} 
            className="w-full p-2 border rounded"
          />
          
          <div className="flex justify-between">
            <Button 
              onClick={handleUpload}
              disabled={!file || uploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              📤 Upload CSR File
            </Button>
            
            {processedData && (
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleReprocess}
                  disabled={uploading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${uploading ? 'animate-spin' : ''}`} />
                  Reprocess
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCopyJson}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy JSON
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleDownloadJson}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button 
                  onClick={handleUseForIntelligence}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
                >
                  🔗 Use This CSR for Study Planning
                </Button>
              </div>
            )}
          </div>
          
          {status && (
            <div className="text-sm">
              {status}
              {uploading && <Progress value={uploadProgress} className="h-2 mt-2" />}
            </div>
          )}
        </CardContent>
      </Card>

      {processedData && (
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-2">🧠 Mapped Output</h2>
            <ScrollArea className="h-[500px] border rounded p-4 bg-gray-50">
              <pre className="text-sm whitespace-pre-wrap">
                {JSON.stringify(processedData, null, 2)}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CSRExtractorDashboard;