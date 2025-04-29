// client/src/components/cer/GenerateFullCerButton.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { XCircle, CheckCircle, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function GenerateFullCerButton({ productId, templateId, metadata = {}, onSuccess }) {
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState({ progress: 0, step: '' });
  const [resultUrl, setResultUrl] = useState('');
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [polling, setPolling] = useState(false);
  const { toast } = useToast();

  const startGeneration = async () => {
    setDialogOpen(true);
    try {
      const res = await fetch('/api/cer/generate-full', { 
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
      
      const data = await res.json();
      if (res.status === 202) {
        setJobId(data.jobId);
        setPolling(true);
        toast({
          title: 'CER Generation Started',
          description: 'Your report is being generated. You can track progress in the dialog.',
        });
      } else {
        setStatus({ progress: 0, step: data.error || 'Generation failed' });
        toast({
          title: 'Generation Failed',
          description: data.error || 'Failed to start CER generation',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error starting generation:', error);
      setStatus({ progress: 0, step: error.message || 'Failed to connect to server' });
      toast({
        title: 'Connection Error',
        description: 'Could not connect to the CER generation service',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    let timer;
    if (polling && jobId) {
      timer = setInterval(async () => {
        try {
          const res = await fetch(`/api/cer/jobs/${jobId}/status`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            },
          });
          
          if (!res.ok) {
            throw new Error('Failed to check job status');
          }
          
          const stat = await res.json();
          setStatus({ progress: stat.progress, step: stat.step });
          
          if (stat.status === 'completed') {
            clearInterval(timer);
            setPolling(false);
            
            try {
              const resultRes = await fetch(`/api/cer/jobs/${jobId}/result`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                },
              });
              
              if (!resultRes.ok) {
                throw new Error('Failed to retrieve result');
              }
              
              const { downloadUrl } = await resultRes.json();
              setResultUrl(downloadUrl);
              
              toast({
                title: 'Report Generated Successfully',
                description: 'Your Clinical Evaluation Report is ready to view',
              });
              
              // Call success callback if provided
              if (onSuccess) {
                onSuccess(jobId, { downloadUrl });
              }
            } catch (error) {
              console.error('Error getting result:', error);
              setStatus({ 
                ...status, 
                step: 'Report generated but preview unavailable. Try downloading directly.' 
              });
            }
          }
          
          if (stat.status === 'failed') {
            clearInterval(timer);
            setPolling(false);
            setStatus({ progress: stat.progress, step: stat.last_error || 'Generation failed' });
            
            toast({
              title: 'Generation Failed',
              description: stat.last_error || 'The CER generation process encountered an error',
              variant: 'destructive',
            });
          }
        } catch (error) {
          console.error('Error in polling:', error);
          // Don't stop polling on transient errors
        }
      }, 2000);
    }
    
    return () => clearInterval(timer);
  }, [polling, jobId, onSuccess, toast, status]);

  const handleDialogClose = () => {
    // Only allow closing if not actively polling or if we have a result/error
    if (!polling || resultUrl || status.step.includes('failed')) {
      setDialogOpen(false);
    }
  };

  return (
    <>
      <Button 
        onClick={startGeneration} 
        disabled={polling}
        className="gap-2"
      >
        {polling ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        <span>Generate Full CER Report</span>
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Full CER Generation</h3>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleDialogClose}
              disabled={polling && !resultUrl && !status.step.includes('failed')}
            >
              <XCircle className="h-5 w-5" />
            </Button>
          </div>

          {polling ? (
            <div className="space-y-4">
              <p className="font-medium">{status.step || 'Initializing...'}</p>
              <Progress value={status.progress} max={100} />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>{Math.round(status.progress)}%</span>
                <span>100%</span>
              </div>
              {jobId && (
                <p className="text-xs text-muted-foreground">
                  Job ID: {jobId}
                </p>
              )}
            </div>
          ) : resultUrl ? (
            <div className="space-y-4">
              <p className="font-medium text-green-600 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Report Ready!
              </p>
              <iframe
                src={resultUrl}
                title="CER Preview"
                className="w-full h-80 border rounded-md"
              />
              <div className="flex justify-end">
                <Button asChild>
                  <a href={resultUrl} target="_blank" rel="noopener noreferrer">
                    Download PDF
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {status.step ? (
                <p className="text-red-600">{status.step}</p>
              ) : (
                <>
                  <div className="flex items-start gap-4 p-4 rounded-lg border bg-muted/50">
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
                    <p className="mb-2">This process will generate:</p>
                    <ul className="space-y-1 list-disc pl-5">
                      <li>A complete ICH E3-compliant report</li>
                      <li>All sections with auto-populated data</li>
                      <li>In-text citations and references</li>
                      <li>Regulatory-ready formatting</li>
                    </ul>
                  </div>
                </>
              )}
              
              <div className="flex justify-end gap-2">
                {status.step ? (
                  <Button onClick={startGeneration}>Try Again</Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={startGeneration}>
                      Generate Report
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}