import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Download, FileText, Loader2 } from 'lucide-react';
import { generateFullCER } from '../../services/cerService';

/**
 * Generate Full CER Button Component
 * 
 * This component handles the full generation of Clinical Evaluation Reports
 * with real-time progress tracking, error handling, and PDF preview.
 */
const GenerateFullCerButton = ({ deviceInfo, literature = [], fdaData = [], templateId = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [jobId, setJobId] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [error, setError] = useState(null);
  const [polling, setPolling] = useState(false);

  // Start the generation process
  const handleGenerateClick = async () => {
    setIsModalOpen(true);
    setIsGenerating(true);
    setProgressValue(0);
    setCurrentStep('Initializing CER generation...');
    setJobId(null);
    setResultUrl(null);
    setError(null);
    setPolling(false);

    try {
      // Start the job by calling the API
      const result = await generateFullCER({
        deviceInfo,
        literature,
        fdaData,
        templateId
      });

      if (result.jobId) {
        setJobId(result.jobId);
        setPolling(true);
      } else if (result.error) {
        throw new Error(result.error);
      } else {
        throw new Error('Unknown error starting CER generation');
      }
    } catch (err) {
      console.error('Failed to start CER generation:', err);
      setError(err.message || 'Failed to start CER generation');
      setIsGenerating(false);
    }
  };

  // Poll for job status
  useEffect(() => {
    if (!jobId || !polling) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/cer/jobs/${jobId}/status`);
        
        if (!response.ok) {
          throw new Error(`Failed to check job status: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Update the UI with progress information
        setProgressValue(data.progress || 0);
        if (data.step) setCurrentStep(data.step);
        
        // Check if the job is complete
        if (data.status === 'completed') {
          setPolling(false);
          setIsGenerating(false);
          setResultUrl(`/api/cer/jobs/${jobId}/result`);
        } 
        // Check if the job failed
        else if (data.status === 'failed') {
          setPolling(false);
          setIsGenerating(false);
          setError('CER generation failed. Please try again.');
        }
      } catch (err) {
        console.error('Error polling job status:', err);
        // Don't stop polling on temporary network errors
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [jobId, polling]);

  // Close the modal and reset the state
  const handleClose = () => {
    setIsModalOpen(false);
    setPolling(false);
    
    // If we're still generating, keep the job running in the background
    if (isGenerating) {
      // Maybe show a toast notification that the job continues in the background
    }
  };

  return (
    <>
      <Button 
        onClick={handleGenerateClick} 
        className="bg-indigo-600 hover:bg-indigo-700 text-white"
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <FileText className="mr-2 h-4 w-4" />
            Generate Full CER Report
          </>
        )}
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                  Generating Clinical Evaluation Report
                </>
              ) : error ? (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Error Generating Report
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Report Generation Complete
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {isGenerating 
                ? "Please wait while we generate your comprehensive Clinical Evaluation Report. This may take a few minutes." 
                : error 
                  ? "We encountered an error while generating your report."
                  : "Your Clinical Evaluation Report has been generated successfully and is ready to view or download."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {/* Progress indicator */}
            {isGenerating && (
              <div className="space-y-4">
                <Progress value={progressValue} className="h-2" />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{Math.round(progressValue)}% complete</span>
                  <Badge variant="outline" className="font-normal">
                    {currentStep}
                  </Badge>
                </div>
              </div>
            )}

            {/* Error display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Generation Failed</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleGenerateClick}
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* PDF Preview */}
            {!isGenerating && resultUrl && (
              <div className="space-y-4">
                <div className="border-t border-b border-gray-100 py-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Preview</h3>
                  <div className="bg-gray-50 rounded-md overflow-hidden">
                    <iframe
                      src={resultUrl}
                      className="w-full h-[400px] border"
                      title="CER Preview"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between items-center">
            {!isGenerating && resultUrl && (
              <a
                href={resultUrl}
                download="ClinicalEvaluationReport.pdf"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </a>
            )}
            
            <Button variant="outline" onClick={handleClose}>
              {resultUrl ? "Close" : (isGenerating ? "Continue in Background" : "Close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GenerateFullCerButton;