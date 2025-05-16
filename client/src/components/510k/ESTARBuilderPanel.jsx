import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  CheckCircle, 
  AlertCircle, 
  FileCheck, 
  Download, 
  RefreshCw, 
  Shield, 
  CheckSquare 
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { FDA510kService } from "@/services/FDA510kService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * ESTARBuilderPanel Component
 * 
 * This component provides the final step in the 510(k) workflow for generating
 * and validating eSTAR submissions according to FDA guidelines. 
 * 
 * It includes:
 * - Validation functionality with both standard and strict modes
 * - Final report generation with FDA-compliant formatting
 * - Option to download generated files in multiple formats
 * - Comprehensive validation reports with issue listings
 */
const ESTARBuilderPanel = ({ 
  projectId, 
  deviceProfile,
  complianceScore,
  equivalenceData,
  onGenerationComplete,
  onValidationComplete,
  isValidating,
  isGenerating,
  validationResults,
  generatedUrl,
  estarFormat,
  setEstarFormat,
  setIsValidating,
  setIsGenerating,
  setValidationResults,
  setGeneratedUrl
}) => {
  const { toast } = useToast();
  const [validationInProgress, setValidationInProgress] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const [includeAttachments, setIncludeAttachments] = useState(true);
  const [strictValidation, setStrictValidation] = useState(false);
  const [activeTab, setActiveTab] = useState('validation');
  
  // Instance of the FDA510k service
  const fda510kService = new FDA510kService();

  /**
   * Handles the eSTAR validation process
   * @param {boolean} strict Whether to use strict validation
   */
  const handleValidate = async (strict = false) => {
    try {
      setIsValidating(true);
      setValidationInProgress(true);
      setValidationProgress(0);
      
      // Progress simulation for UX
      const progressInterval = setInterval(() => {
        setValidationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);
      
      // Call the actual validation service
      const results = await fda510kService.validateESTARPackage(projectId, strict);
      
      clearInterval(progressInterval);
      setValidationProgress(100);
      
      // Send the results to parent component
      if (onValidationComplete) {
        onValidationComplete(results);
      }
      
      // Set the validation results
      setValidationResults(results);
      
      // Show toast notification
      if (results.valid) {
        toast({
          title: "Validation Successful",
          description: "Your eSTAR package meets FDA requirements.",
          variant: "success"
        });
      } else {
        toast({
          title: "Validation Complete",
          description: `Found ${results.issues?.length || 0} issues to address.`,
          variant: "warning"
        });
      }
    } catch (error) {
      console.error("Error validating eSTAR package:", error);
      toast({
        title: "Validation Error",
        description: error.message || "Failed to validate eSTAR package",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
      setValidationInProgress(false);
      setValidationProgress(100);
    }
  };

  /**
   * Handles the generation of the final eSTAR package
   */
  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      
      // Generate a random report ID if not provided
      const reportId = `510K-${Math.floor(100000 + Math.random() * 900000)}`;
      
      const options = {
        validateFirst: !validationResults?.valid, // Validate first if not already validated
        strictValidation,
        format: estarFormat || 'zip'
      };
      
      // Call the FDA service to integrate with eSTAR
      const result = await fda510kService.integrateWithESTAR(reportId, projectId, options);
      
      if (result.success) {
        setGeneratedUrl(result.downloadUrl);
        
        if (onGenerationComplete) {
          onGenerationComplete(result);
        }
        
        toast({
          title: "eSTAR Package Generated",
          description: "Your FDA-compliant submission package is ready to download.",
          variant: "success"
        });
      } else {
        toast({
          title: "Generation Failed",
          description: result.message || "Failed to generate eSTAR package.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error generating eSTAR package:", error);
      toast({
        title: "Generation Error",
        description: error.message || "Failed to generate eSTAR package",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
              <FileCheck className="h-5 w-5 mr-2 text-blue-600" />
              eSTAR Builder
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 mt-1">
              Generate FDA-compliant eSTAR packages for your 510(k) submission
            </CardDescription>
          </div>
          {complianceScore > 80 && (
            <div className="flex items-center bg-green-50 py-1 px-3 rounded-full">
              <Shield className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm font-medium text-green-700">Ready for Submission</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="validation" className="flex items-center justify-center py-2">
              <CheckSquare className="h-4 w-4 mr-2" />
              Validation
            </TabsTrigger>
            <TabsTrigger value="generation" className="flex items-center justify-center py-2">
              <FileCheck className="h-4 w-4 mr-2" />
              Generation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="validation" className="mt-0">
            {complianceScore < 70 && (
              <Alert variant="warning" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Compliance Score Low</AlertTitle>
                <AlertDescription>
                  We recommend improving your compliance score before submitting your eSTAR package.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Validation Options</label>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="strict-validation" 
                    checked={strictValidation} 
                    onCheckedChange={setStrictValidation}
                  />
                  <label htmlFor="strict-validation" className="text-sm">
                    Strict FDA Validation
                  </label>
                </div>
              </div>
              
              {validationInProgress && (
                <div className="space-y-2 my-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Validating eSTAR Package...</span>
                    <span className="text-sm font-medium">{validationProgress}%</span>
                  </div>
                  <Progress value={validationProgress} className="h-2" />
                </div>
              )}
              
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  className="flex items-center"
                  onClick={() => handleValidate(false)}
                  disabled={isValidating}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Standard Validation
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center"
                  onClick={() => handleValidate(true)}
                  disabled={isValidating}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Strict Validation
                </Button>
              </div>
              
              {/* Validation results display */}
              {validationResults && (
                <div className="mt-4 p-4 rounded-md border bg-gray-50">
                  <div className="flex items-center mb-2">
                    {validationResults.valid ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                    )}
                    <h4 className="font-medium">
                      {validationResults.valid 
                        ? "Package Valid" 
                        : `${validationResults.issues?.length || 0} Issues Found`}
                    </h4>
                  </div>
                  
                  {validationResults.issues && validationResults.issues.length > 0 && (
                    <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                      {validationResults.issues.slice(0, 5).map((issue, idx) => (
                        <li key={idx} className={
                          issue.severity === 'error' 
                            ? 'text-red-600' 
                            : issue.severity === 'warning' 
                              ? 'text-amber-600' 
                              : 'text-blue-600'
                        }>
                          {issue.message}
                        </li>
                      ))}
                      {validationResults.issues.length > 5 && (
                        <li>...and {validationResults.issues.length - 5} more issues</li>
                      )}
                    </ul>
                  )}
                  
                  {validationResults.recommendations && validationResults.recommendations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h5 className="text-sm font-medium mb-1">Recommendations:</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {validationResults.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-gray-600">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="generation" className="mt-0">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Package Format</label>
                <Select 
                  value={estarFormat} 
                  onValueChange={setEstarFormat}
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zip">ZIP Archive</SelectItem>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="folder">Folder Structure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-attachments" 
                  checked={includeAttachments} 
                  onCheckedChange={setIncludeAttachments}
                />
                <label htmlFor="include-attachments" className="text-sm">
                  Include Referenced Attachments
                </label>
              </div>
              
              {!validationResults?.valid && validationResults?.issues?.length > 0 && (
                <Alert className="my-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Validation Required</AlertTitle>
                  <AlertDescription>
                    We recommend validating your submission before generating the final package.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex space-x-3">
                <Button 
                  variant="default" 
                  className="flex items-center"
                  onClick={handleGenerate}
                  disabled={isGenerating || (complianceScore < 60 && !validationResults?.valid)}
                >
                  <FileCheck className="h-4 w-4 mr-2" />
                  Generate eSTAR Package
                </Button>
                
                {generatedUrl && (
                  <Button 
                    variant="outline" 
                    className="flex items-center"
                    as="a" 
                    href={generatedUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Package
                  </Button>
                )}
              </div>
              
              {generatedUrl && (
                <div className="mt-4 p-4 bg-green-50 rounded-md border border-green-100">
                  <div className="flex items-center text-green-700">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="font-medium">eSTAR Package Generated Successfully</span>
                  </div>
                  <p className="mt-1 text-sm text-green-600">
                    Your FDA-compliant eSTAR package is ready. Click the download button to get your file.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="bg-gray-50 border-t flex justify-between py-3">
        <div className="text-xs text-gray-500">
          {validationResults?.valid ? (
            <span className="flex items-center">
              <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
              FDA-Compliant
            </span>
          ) : (
            <span>Contact regulatory affairs for assistance with submission</span>
          )}
        </div>
        
        {complianceScore !== null && (
          <div className="flex items-center">
            <span className="text-xs text-gray-500 mr-2">Compliance Score:</span>
            <div className="bg-gray-200 rounded-full h-2 w-20">
              <div 
                className={`h-2 rounded-full ${
                  complianceScore >= 80 ? 'bg-green-500' : 
                  complianceScore >= 60 ? 'bg-yellow-500' : 
                  'bg-red-500'
                }`}
                style={{ width: `${complianceScore}%` }}
              ></div>
            </div>
            <span className="text-xs font-medium ml-2">{complianceScore}%</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default ESTARBuilderPanel;