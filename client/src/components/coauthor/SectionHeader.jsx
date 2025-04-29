import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, ExternalLink, Calendar, BookOpen, History, Settings, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function SectionHeader({ sectionId, title, onGenerate }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [generationProgress, setGenerationProgress] = useState(0);
  
  // Simulate generation steps for demo purposes
  const simulateGeneration = () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStep('Initializing AI model...');
    
    const steps = [
      { progress: 10, message: 'Loading clinical templates...' },
      { progress: 20, message: 'Analyzing ICH E3 guidelines...' },
      { progress: 35, message: 'Retrieving clinical study data...' },
      { progress: 50, message: 'Structuring section content...' },
      { progress: 65, message: 'Generating summary tables...' },
      { progress: 80, message: 'Applying regulatory compliance checks...' },
      { progress: 95, message: 'Finalizing document formatting...' },
      { progress: 100, message: 'Draft generation complete!' }
    ];
    
    // Simulate progress updates with realistic timing
    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        const { progress, message } = steps[stepIndex];
        setGenerationProgress(progress);
        setGenerationStep(message);
        stepIndex++;
      } else {
        clearInterval(interval);
        // Wait a moment at 100% before finishing
        setTimeout(() => {
          setIsGenerating(false);
          // Invoke the callback from parent
          onGenerate && onGenerate();
        }, 1000);
      }
    }, 1200); // 1.2 seconds between updates
    
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  };
  
  // WebSocket-driven progress updates (mocked for demo)
  useEffect(() => {
    // In a real implementation, this would connect to WebSocket
    // and listen for progress events for this specific section
    
    // Clean up listener on unmount
    return () => {
      // socket.off('progress:update', handleProgressUpdate);
    };
  }, [sectionId]);
  
  return (
    <div className="flex flex-col space-y-4 mb-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-500"
          onClick={() => window.location.href = '/coauthor'}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Document Selection
        </Button>
        <span className="text-gray-400 px-1">|</span>
        <div className="text-sm text-gray-500">
          Module 2 / Section {sectionId} / {title}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Section {sectionId}: {title}
          </h1>
          <p className="text-gray-500 mt-1">
            Provide a comprehensive clinical summary with detailed analysis of benefits and risks.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="gap-1.5">
            <History className="h-4 w-4" />
            <span>Version History</span>
          </Button>
          
          <Button variant="outline" size="sm" className="gap-1.5">
            <BookOpen className="h-4 w-4" />
            <span>Guidance</span>
          </Button>
          
          <Button variant="outline" size="sm" className="gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>Timeline</span>
          </Button>
          
          <Button variant="outline" size="sm" className="gap-1.5">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Button>
          
          <Button 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white gap-1.5"
            onClick={simulateGeneration}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Draft</span>
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Real-time generation progress indicator */}
      {isGenerating && (
        <div className="bg-blue-50 p-3 rounded-md border border-blue-100 animate-pulse">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center text-blue-700 text-sm font-medium">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span>{generationStep}</span>
            </div>
            <span className="text-blue-600 text-sm font-medium">{generationProgress}%</span>
          </div>
          <Progress value={generationProgress} className="h-2" />
        </div>
      )}
      
      {/* Standard guidance note (shown when not generating) */}
      {!isGenerating && (
        <div className="flex items-center text-xs bg-blue-50 text-blue-700 p-2 rounded-md border border-blue-100">
          <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
          <span>
            <span className="font-medium">Guidance Note:</span> This section should follow ICH E3 guidelines. Use Ctrl+Enter or Cmd+Enter to generate section content with AI assistance.
          </span>
        </div>
      )}
    </div>
  );
}