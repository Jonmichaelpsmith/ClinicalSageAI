import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, CheckCircle, AlertTriangle, Loader2, FileCheck, Clock, XCircle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { FDA510kService } from '@/services/FDA510kService';

/**
 * 510(k) Report Generator
 * 
 * This component handles the final report generation for the 510(k) submission,
 * including the eSTAR package creation and final submission readiness check.
 */
const ReportGenerator = ({ 
  deviceProfile, 
  documentId, 
  draftStatus, 
  setDraftStatus,
  exportTimestamp,
  sections,
  onSubmissionReady
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState('idle');
  const [reportURL, setReportURL] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [generationStep, setGenerationStep] = useState('');
  const { toast } = useToast();
  
  // Handle report generation
  const generateSubmissionPackage = async () => {
    setIsGenerating(true);
    setGenerationStatus('generating');
    setGenerationProgress(0);
    
    try {
      // Simulate report generation steps
      await simulateGenerationStep('Preparing device information...', 10);
      await simulateGenerationStep('Compiling predicate device comparisons...', 30);
      await simulateGenerationStep('Generating substantial equivalence documentation...', 50);
      await simulateGenerationStep('Validating FDA compliance...', 70);
      await simulateGenerationStep('Creating eSTAR package...', 85);
      await simulateGenerationStep('Finalizing submission document...', 95);
      
      // Get report URL from API
      const result = await FDA510kService.generateSubmissionPDF(documentId);
      
      if (result) {
        setReportURL(result.pdfUrl);
        setGenerationStatus('complete');
        setGenerationProgress(100);
        setDraftStatus('ready');
        
        toast({
          title: "Submission Package Ready",
          description: "Your 510(k) submission package has been successfully generated.",
          variant: "success"
        });
        
        // Validate the package
        await validateSubmissionPackage();
        
        // Call the onSubmissionReady callback
        if (onSubmissionReady) {
          onSubmissionReady();
        }
      }
    } catch (error) {
      console.error("Error generating submission package:", error);
      setGenerationStatus('error');
      
      toast({
        title: "Generation Error",
        description: "An error occurred while generating your submission package. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Helper function to simulate generation steps with progress updates
  const simulateGenerationStep = async (step, progress) => {
    return new Promise(resolve => {
      setGenerationStep(step);
      setGenerationProgress(progress);
      setTimeout(resolve, 1000); // Simulate processing time
    });
  };
  
  // Validate the submission package
  const validateSubmissionPackage = async () => {
    try {
      const validationResult = await FDA510kService.validateESTARPackage(documentId);
      
      setValidationResults(validationResult);
      
      if (validationResult.score >= 0.9) {
        toast({
          title: "Validation Successful",
          description: "Your submission package passed FDA validation with high compliance.",
          variant: "success"
        });
      } else if (validationResult.score >= 0.7) {
        toast({
          title: "Validation Warning",
          description: "Your submission package has some minor compliance issues that should be addressed.",
          variant: "warning"
        });
      } else {
        toast({
          title: "Validation Failed",
          description: "Your submission package has significant compliance issues that must be fixed.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error validating submission package:", error);
      toast({
        title: "Validation Error",
        description: "An error occurred while validating your submission package.",
        variant: "destructive"
      });
    }
  };
  
  // Render the validation results
  const renderValidationResults = () => {
    if (!validationResults) return null;
    
    const score = validationResults.score;
    const scorePercentage = Math.round(score * 100);
    
    return (
      <div className="mt-6 space-y-4">
        <h3 className="text-lg font-medium">FDA Compliance Check</h3>
        
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              {score >= 0.9 ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : score >= 0.7 ? (
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
              )}
              <span className="font-medium">Compliance Score:</span>
            </div>
            <span className={`font-bold ${
              score >= 0.9 ? 'text-green-600' : 
              score >= 0.7 ? 'text-yellow-600' : 
              'text-red-600'
            }`}>
              {scorePercentage}%
            </span>
          </div>
          
          <Progress 
            value={scorePercentage} 
            className={`h-2 ${
              score >= 0.9 ? 'bg-green-100' : 
              score >= 0.7 ? 'bg-yellow-100' : 
              'bg-red-100'
            }`}
          />
          
          {validationResults.issues && validationResults.issues.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Issues to Address:</h4>
              <ul className="space-y-2">
                {validationResults.issues.map((issue, index) => (
                  <li key={index} className="text-sm flex items-start">
                    <div className={`mt-0.5 mr-2 flex-shrink-0 rounded-full h-4 w-4 flex items-center justify-center ${
                      issue.severity === 'error' ? 'bg-red-100 text-red-600' :
                      issue.severity === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {issue.severity === 'error' ? '!' :
                       issue.severity === 'warning' ? '⚠' : 'i'}
                    </div>
                    <div>
                      <span className="font-medium">{issue.section}: </span>
                      {issue.message}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Render generation status
  const renderGenerationStatus = () => {
    if (generationStatus === 'generating') {
      return (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <Loader2 className="h-5 w-5 text-blue-600 mr-2 animate-spin" />
            <h3 className="text-blue-800 font-medium">Generating Submission Package</h3>
          </div>
          <p className="text-blue-700 text-sm mb-3">{generationStep}</p>
          <Progress value={generationProgress} className="h-2" />
        </div>
      );
    } else if (generationStatus === 'complete') {
      return (
        <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="text-green-800 font-medium">Submission Package Ready</h3>
          </div>
          <p className="text-green-700 text-sm mb-3">
            Your FDA 510(k) submission package has been successfully generated and is ready for final review.
          </p>
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              className="bg-white text-green-700 border-green-200 hover:bg-green-50"
              onClick={() => {
                if (reportURL) {
                  window.open(reportURL, '_blank');
                }
              }}
              disabled={!reportURL}
            >
              <FileText className="h-4 w-4 mr-2" />
              View Submission Package
            </Button>
          </div>
        </div>
      );
    } else if (generationStatus === 'error') {
      return (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-red-800 font-medium">Generation Error</h3>
          </div>
          <p className="text-red-700 text-sm mb-3">
            There was an error generating your submission package. Please try again or contact support.
          </p>
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              className="bg-white text-red-700 border-red-200 hover:bg-red-50"
              onClick={generateSubmissionPackage}
            >
              <FileCheck className="h-4 w-4 mr-2" />
              Retry Generation
            </Button>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-blue-50 border-b">
        <CardTitle className="text-blue-800 flex items-center">
          <FileText className="mr-2 h-5 w-5 text-blue-600" />
          FDA 510(k) Submission Generator
        </CardTitle>
        <CardDescription>
          Generate your complete FDA 510(k) submission package with eSTAR format for regulatory review
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {renderGenerationStatus()}
          
          <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
            <h3 className="text-lg font-medium">Submission Information</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Device Name:</span>
                <span className="font-medium">{deviceProfile?.deviceName || 'No device name'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Manufacturer:</span>
                <span className="font-medium">{deviceProfile?.manufacturer || 'No manufacturer'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Document ID:</span>
                <span className="font-medium">{documentId || 'No ID'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge className={
                  draftStatus === 'ready' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                  draftStatus === 'in-progress' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                  'bg-gray-100 text-gray-800 hover:bg-gray-100'
                }>
                  {draftStatus === 'ready' ? 'Ready for Submission' :
                   draftStatus === 'in-progress' ? 'In Progress' :
                   'Draft'}
                </Badge>
              </div>
              
              {exportTimestamp && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">
                    {new Date(exportTimestamp).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {validationResults && renderValidationResults()}
          
          <div className="flex justify-between items-center pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                // Implementation for preview/download individual sections would go here
                toast({
                  title: "Feature Not Available",
                  description: "Section download is not available in this preview.",
                  variant: "default"
                });
              }}
              disabled={isGenerating}
            >
              <FileText className="mr-2 h-4 w-4" />
              Preview Sections
            </Button>
            
            <Button 
              onClick={generateSubmissionPackage}
              disabled={isGenerating || generationStatus === 'complete'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  {generationStatus === 'complete' 
                    ? 'Package Generated' 
                    : 'Generate FDA Submission Package'}
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportGenerator;