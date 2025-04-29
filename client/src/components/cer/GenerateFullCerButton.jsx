import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Check, Hourglass, FileDown, AlertTriangle, Zap } from 'lucide-react';

export default function GenerateFullCerButton({ onCompletion }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  const [generationComplete, setGenerationComplete] = useState(false);

  const stages = [
    { name: 'Initializing generation process', duration: 800 },
    { name: 'Gathering device information', duration: 1200 },
    { name: 'Analyzing clinical data', duration: 1500 },
    { name: 'Retrieving literature review data', duration: 1200 },
    { name: 'Synthesizing regulatory requirements', duration: 1000 },
    { name: 'Building document structure', duration: 1000 },
    { name: 'Generating content sections', duration: 2000 },
    { name: 'Applying template formatting', duration: 1000 },
    { name: 'Validating against regulatory standards', duration: 1500 },
    { name: 'Creating final document', duration: 1500 },
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setProgress(0);
    setCurrentStage(0);
    setErrorMessage(null);
    setGenerationComplete(false);
    
    // Simulate a generation process with multiple stages
    runGenerationProcess();
  };

  const runGenerationProcess = async () => {
    let currentProgress = 0;
    
    for (let i = 0; i < stages.length; i++) {
      setCurrentStage(i);
      
      const stageDuration = stages[i].duration;
      const stageProgress = 100 / stages.length;
      const incrementInterval = stageDuration / 10;
      
      // Randomly determine if this stage should fail (for demo purposes)
      const shouldFail = i === 4 && Math.random() < 0.05;
      
      if (shouldFail) {
        setErrorMessage('Error during regulatory data synthesis. Please check your template settings and try again.');
        setIsGenerating(false);
        return;
      }
      
      // Update progress through the current stage
      for (let j = 0; j < 10; j++) {
        await new Promise(resolve => setTimeout(resolve, incrementInterval));
        currentProgress = Math.min(100, Math.round((i * stageProgress) + ((j + 1) / 10) * stageProgress));
        setProgress(currentProgress);
      }
    }
    
    // Complete the generation process
    setGenerationComplete(true);
    setIsGenerating(false);
    
    // Generate a mock job ID
    const jobId = `cer-${Date.now().toString(36)}`;
    
    // Notify parent component that generation is complete with the job ID
    if (onCompletion) {
      onCompletion(jobId);
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      setIsOpen(false);
    }
  };

  const handleViewGenerated = () => {
    setIsOpen(false);
    // In a real app, we would navigate to the generated report tab
  };

  const renderContent = () => {
    if (errorMessage) {
      return (
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium mb-2">Generation Error</h3>
          <p className="text-gray-500 mb-6">{errorMessage}</p>
          <Button onClick={() => handleGenerate()}>Try Again</Button>
        </div>
      );
    }

    if (generationComplete) {
      return (
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium mb-2">Generation Complete</h3>
          <p className="text-gray-500 mb-6">
            Your Clinical Evaluation Report has been successfully generated and is ready for review.
          </p>
          <div className="flex justify-center space-x-3">
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
            <Button 
              className="space-x-2" 
              onClick={handleViewGenerated}
            >
              <FileDown className="h-4 w-4" />
              <span>View Generated Report</span>
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 py-2">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="space-y-4">
          {stages.map((stage, index) => (
            <div 
              key={index}
              className={`flex items-center justify-between ${
                index < currentStage 
                  ? 'text-gray-500' 
                  : index === currentStage 
                    ? 'text-blue-600 font-medium' 
                    : 'text-gray-400'
              }`}
            >
              <div className="flex items-center">
                {index < currentStage ? (
                  <div className="w-5 h-5 mr-3 flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-500" />
                  </div>
                ) : index === currentStage ? (
                  <div className="w-5 h-5 mr-3 flex items-center justify-center">
                    <Hourglass className="h-4 w-4 text-blue-500 animate-pulse" />
                  </div>
                ) : (
                  <div className="w-5 h-5 mr-3" />
                )}
                <span className="text-sm">{stage.name}</span>
              </div>
            </div>
          ))}
        </div>
        
        <Separator />
        
        <div className="bg-amber-50 p-3 rounded-md">
          <p className="text-sm text-amber-800 flex items-start">
            <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            This process may take a few minutes. Please do not close this dialog or navigate away from the page.
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} size="lg" className="bg-blue-700 hover:bg-blue-800">
        <Zap className="mr-2 h-4 w-4" />
        Generate Full CER
      </Button>
      
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Clinical Evaluation Report</DialogTitle>
            {!generationComplete && !errorMessage && (
              <DialogDescription>
                Creating a comprehensive CER based on your input data and template settings
              </DialogDescription>
            )}
          </DialogHeader>
          
          {renderContent()}
          
          {isGenerating && (
            <DialogFooter>
              <Button 
                variant="outline" 
                disabled
                className="opacity-50"
              >
                Cancel
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}