import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogTrigger,
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { FileText, ArrowRight, Settings, CheckCircle, Loader, AlertCircle } from 'lucide-react';
import { handleApiError } from '@/services/errorHandling';
import { useToast } from '@/hooks/use-toast';

/**
 * Generate Full CER Button component
 * 
 * This component provides a button to generate a full Clinical Evaluation Report,
 * with a confirmation dialog and progress tracking.
 */
const GenerateFullCerButton = ({ productId, templateId, metadata = {}, disabled = false, onSuccess, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [jobId, setJobId] = useState(null);
  const [error, setError] = useState(null);
  const [progressCheckInterval, setProgressCheckInterval] = useState(null);
  
  const { toast } = useToast();
  
  // Start the generation process
  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setJobId(null);
    
    try {
      const response = await fetch('/api/cer/generate-full', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          product_id: productId,
          template_id: templateId,
          metadata,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start CER generation');
      }
      
      const data = await response.json();
      setJobId(data.job_id);
      
      // Start checking progress
      const intervalId = setInterval(() => {
        checkProgress(data.job_id);
      }, 3000);
      
      setProgressCheckInterval(intervalId);
    } catch (error) {
      setError(handleApiError(error, {
        context: 'CER Generation',
        endpoint: '/api/cer/generate-full',
        toast,
      }));
      setIsGenerating(false);
    }
  };
  
  // Check the progress of a running job
  const checkProgress = async (id) => {
    try {
      const response = await fetch(`/api/cer/jobs/${id}/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to check job progress');
      }
      
      const data = await response.json();
      setProgress(data.progress);
      
      // If complete or failed, stop checking
      if (data.progress >= 100 || data.status === 'failed') {
        if (progressCheckInterval) {
          clearInterval(progressCheckInterval);
          setProgressCheckInterval(null);
        }
        
        setIsGenerating(false);
        
        if (data.status === 'failed') {
          setError(data.error || 'CER generation failed');
          toast({
            title: 'Generation Failed',
            description: data.error || 'Failed to generate the CER report',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'CER Generated',
            description: 'The Clinical Evaluation Report has been successfully generated',
          });
          
          // Call success callback with job ID
          if (onSuccess) {
            onSuccess(id, data);
          }
          
          // Close dialog after a delay
          setTimeout(() => {
            setIsOpen(false);
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Error checking progress:', error);
      // Don't stop checking on transient errors
    }
  };
  
  // Clean up interval when dialog is closed
  const handleOpenChange = (open) => {
    setIsOpen(open);
    
    if (!open && progressCheckInterval) {
      clearInterval(progressCheckInterval);
      setProgressCheckInterval(null);
      setIsGenerating(false);
    }
  };
  
  // Determine what to display in the dialog
  const renderContent = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Generation Failed</h3>
          <p className="text-sm text-muted-foreground mb-6">
            {error}
          </p>
          <Button onClick={() => handleGenerate()}>
            Try Again
          </Button>
        </div>
      );
    }
    
    if (isGenerating) {
      return (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          {progress >= 100 ? (
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
          ) : (
            <Loader className="h-12 w-12 mb-4 animate-spin" />
          )}
          
          <h3 className="text-lg font-semibold mb-2">
            {progress >= 100 ? 'Generation Complete' : 'Generating Report'}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-6">
            {progress >= 100 
              ? 'Your Clinical Evaluation Report has been successfully generated' 
              : 'This may take several minutes. Please do not close this window.'}
          </p>
          
          <div className="w-full mb-4">
            <Progress value={progress} max={100} className="h-2" />
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>0%</span>
              <span>{Math.round(progress)}%</span>
              <span>100%</span>
            </div>
          </div>
          
          {jobId && (
            <p className="text-xs text-muted-foreground">
              Job ID: {jobId}
            </p>
          )}
        </div>
      );
    }
    
    return (
      <>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <fileText className="h-5 w-5" />
            Generate Full CER Report
          </DialogTitle>
          <DialogDescription>
            This will generate a complete Clinical Evaluation Report using the selected template.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-lg border bg-muted/50">
              <settings className="h-6 w-6 mt-0.5 text-muted-foreground" />
              <div>
                <h4 className="font-medium mb-1">Report Generation Details</h4>
                <div className="text-sm space-y-2">
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Product ID:</span>
                    <span className="font-mono">{productId}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Template:</span>
                    <span>{templateId}</span>
                  </p>
                  {Object.entries(metadata).map(([key, value]) => (
                    <p key={key} className="flex justify-between">
                      <span className="text-muted-foreground">{key}:</span>
                      <span>{value}</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">
                The generation process will:
              </p>
              <ul className="space-y-1 list-disc pl-5">
                <li>Extract all relevant clinical data</li>
                <li>Analyze safety and performance data</li>
                <li>Apply the ICH E3 structure to the report</li>
                <li>Generate comprehensive tables and figures</li>
                <li>Format to regulatory requirements</li>
              </ul>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleGenerate} className="gap-2">
            <span>Generate Report</span>
            <arrowRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </>
    );
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button 
            onClick={() => setIsOpen(true)} 
            className={`gap-2 ${className || ''}`}
            disabled={disabled}
          >
            <fileText className="h-4 w-4" />
            <span>Generate Full CER Report</span>
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-md">
          {renderContent()}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GenerateFullCerButton;