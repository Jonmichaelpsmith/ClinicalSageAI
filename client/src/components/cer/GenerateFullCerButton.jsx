import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import axios from 'axios';

export default function GenerateFullCerButton({ onCompletion }) {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [generationResult, setGenerationResult] = useState(null);
  const [error, setError] = useState('');

  const startGeneration = async () => {
    setGenerating(true);
    setProgress(0);
    setStatus('Initializing...');
    setShowDialog(true);
    setError('');

    try {
      // In a real implementation, this would be a connection to a WebSocket
      // that provides real-time updates about the generation process
      
      // Simulate API call to start the generation process
      // const res = await axios.post('/api/cer/generate');
      // const jobId = res.data.jobId;
      
      // Mock generation process with artificial delays
      const jobId = 'JOB-' + Date.now();
      simulateGeneration(jobId);
    } catch (err) {
      console.error('Failed to start generation', err);
      setStatus('Error starting generation process');
      setError(err.message || 'Failed to start generation');
      setGenerating(false);
    }
  };

  const simulateGeneration = async (jobId) => {
    try {
      // Step 1: Validating inputs
      await updateProgressWithDelay(5, 'Validating inputs...', 500);
      
      // Step 2: Preparing data
      await updateProgressWithDelay(15, 'Preparing data...', 1000);
      
      // Step 3: Extracting literature references
      await updateProgressWithDelay(25, 'Extracting literature references...', 1500);
      
      // Step 4: Analyzing clinical data
      await updateProgressWithDelay(40, 'Analyzing clinical data...', 2000);
      
      // Step 5: Generating risk assessment
      await updateProgressWithDelay(60, 'Generating risk assessment...', 1800);
      
      // Step 6: Creating executive summary
      await updateProgressWithDelay(75, 'Creating executive summary...', 1600);
      
      // Step 7: Compiling full report
      await updateProgressWithDelay(90, 'Compiling full report...', 1400);
      
      // Step 8: Finalizing document
      await updateProgressWithDelay(100, 'Finalizing document...', 1000);
      
      // Complete
      setStatus('Generation complete!');
      setGenerationResult({
        jobId,
        completedAt: new Date().toISOString(),
        downloadUrl: `/api/cer/jobs/${jobId}/download`,
        previewUrl: `/api/cer/jobs/${jobId}/preview`,
      });
      
      // Notify parent component if callback provided
      if (onCompletion) {
        onCompletion(jobId);
      }
    } catch (err) {
      console.error('Generation process error', err);
      setStatus('Error during generation process');
      setError(err.message || 'An unexpected error occurred during generation');
    } finally {
      setGenerating(false);
    }
  };

  const updateProgressWithDelay = (newProgress, newStatus, delay) => {
    return new Promise(resolve => {
      setTimeout(() => {
        setProgress(newProgress);
        setStatus(newStatus);
        resolve();
      }, delay);
    });
  };

  const handleClose = () => {
    if (!generating) {
      setShowDialog(false);
    }
  };

  return (
    <>
      <Button
        onClick={startGeneration}
        disabled={generating}
        className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
      >
        {generating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>Generate Full CER</>
        )}
      </Button>

      <Dialog open={showDialog} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>CER Generation</DialogTitle>
            <DialogDescription>
              {generating 
                ? 'Please wait while your Clinical Evaluation Report is being generated...'
                : error 
                  ? 'An error occurred during the generation process.'
                  : 'Your Clinical Evaluation Report has been generated successfully!'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {generating ? (
              <div className="space-y-4">
                <Progress value={progress} className="h-2 w-full" />
                <p className="text-sm text-center text-gray-500">{status}</p>
              </div>
            ) : error ? (
              <div className="flex items-center p-4 border border-red-200 rounded-md bg-red-50">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <div className="text-sm text-red-700">{error}</div>
              </div>
            ) : generationResult ? (
              <div className="space-y-4">
                <div className="flex items-center p-4 border border-green-200 rounded-md bg-green-50">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <div className="text-sm text-green-700">
                    CER generated successfully!
                  </div>
                </div>
                <div className="text-sm space-y-2">
                  <p><span className="font-semibold">Job ID:</span> {generationResult.jobId}</p>
                  <p><span className="font-semibold">Completed:</span> {new Date(generationResult.completedAt).toLocaleString()}</p>
                </div>
              </div>
            ) : null}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between">
            {!generating && (
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
            )}
            {generationResult && (
              <div className="flex gap-2 mt-2 sm:mt-0">
                <Button 
                  variant="outline" 
                  onClick={() => window.open(generationResult.previewUrl, '_blank')}
                >
                  Preview
                </Button>
                <Button
                  onClick={() => window.open(generationResult.downloadUrl, '_blank')}
                >
                  Download PDF
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}