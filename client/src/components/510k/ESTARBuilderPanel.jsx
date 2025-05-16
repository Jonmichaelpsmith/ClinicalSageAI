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
    <Card className="w-full shadow-md border-blue-200">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
              <FileCheck className="h-5 w-5 mr-2 text-blue-600" />
              eSTAR Builder
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-normal">
                FDA 510(k)
              </span>
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 mt-1">
              Generate FDA-compliant eSTAR packages for your 510(k) submission
            </CardDescription>
          </div>
          {complianceScore > 80 ? (
            <div className="flex items-center bg-green-50 py-1 px-3 rounded-full border border-green-100">
              <Shield className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm font-medium text-green-700">Ready for Submission</span>
            </div>
          ) : complianceScore > 60 ? (
            <div className="flex items-center bg-amber-50 py-1 px-3 rounded-full border border-amber-100">
              <AlertCircle className="h-4 w-4 text-amber-500 mr-1" />
              <span className="text-sm font-medium text-amber-700">Minor Issues to Resolve</span>
            </div>
          ) : (
            <div className="flex items-center bg-red-50 py-1 px-3 rounded-full border border-red-100">
              <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-sm font-medium text-red-700">Critical Issues to Resolve</span>
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
              
              {/* Enhanced Validation results display */}
              {validationResults && (
                <div className={`mt-4 p-4 rounded-md border ${
                  validationResults.valid 
                    ? 'bg-green-50/70 border-green-200' 
                    : 'bg-amber-50/70 border-amber-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {validationResults.valid ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                      )}
                      <h4 className="font-medium">
                        {validationResults.valid 
                          ? "FDA Validation Passed" 
                          : `${validationResults.issues?.length || 0} FDA Compliance Issues`}
                      </h4>
                    </div>
                    {typeof validationResults.score === 'number' && (
                      <div className="flex items-center">
                        <span className="text-xs mr-2">Compliance Score:</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          validationResults.score >= 90 ? 'bg-green-100 text-green-800' : 
                          validationResults.score >= 70 ? 'bg-amber-100 text-amber-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {validationResults.score}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Score visualization */}
                  {typeof validationResults.score === 'number' && (
                    <div className="mb-4 mt-2 bg-white p-2 rounded border">
                      <div className="flex justify-between text-xs mb-1">
                        <span>0%</span>
                        <span className="font-medium">FDA Compliance Threshold: 70%</span>
                        <span>100%</span>
                      </div>
                      <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            validationResults.score >= 90 ? 'bg-green-500' : 
                            validationResults.score >= 70 ? 'bg-amber-500' : 
                            'bg-red-500'
                          }`}
                          style={{ width: `${validationResults.score}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {validationResults.issues && validationResults.issues.length > 0 && (
                    <div className="bg-white rounded border p-2 mt-3">
                      <h5 className="font-medium text-sm mb-2 text-gray-700 flex items-center">
                        <AlertCircle className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                        FDA Compliance Issues:
                      </h5>
                      <ul className="space-y-2">
                        {validationResults.issues.slice(0, 5).map((issue, idx) => (
                          <li key={idx} className={`flex items-start p-2 rounded text-sm ${
                            issue.severity === 'error' ? 'bg-red-50 border-l-2 border-red-400' : 
                            issue.severity === 'warning' ? 'bg-amber-50 border-l-2 border-amber-400' : 
                            'bg-blue-50 border-l-2 border-blue-400'
                          }`}>
                            <span className={`mr-2 ${
                              issue.severity === 'error' ? 'text-red-500' :
                              issue.severity === 'warning' ? 'text-amber-500' :
                              'text-blue-500'
                            }`}>
                              {issue.severity === 'error' ? '●' : 
                               issue.severity === 'warning' ? '◆' : 'ⓘ'}
                            </span>
                            <div>
                              <div className="font-medium">{issue.section || 'General'}</div>
                              <div className="text-xs">{issue.message}</div>
                            </div>
                          </li>
                        ))}
                        {validationResults.issues.length > 5 && (
                          <li className="text-center text-xs italic text-gray-500 pt-1">
                            ...and {validationResults.issues.length - 5} more issues
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                  
                  {validationResults.recommendations && validationResults.recommendations.length > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-100">
                      <h5 className="text-sm font-medium mb-2 flex items-center text-blue-700">
                        <CheckSquare className="h-3.5 w-3.5 mr-1.5" />
                        FDA Recommendations:
                      </h5>
                      <ul className="space-y-1.5">
                        {validationResults.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start text-xs text-blue-800">
                            <span className="mr-1.5 text-blue-500 mt-0.5">•</span>
                            <span>{rec}</span>
                          </li>
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
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2">
                  <label className="text-sm font-medium flex items-center">
                    <FileCheck className="h-4 w-4 mr-1.5 text-blue-600" />
                    Package Format
                  </label>
                  <p className="text-xs text-gray-500 mb-1.5">Select the best format for FDA submission</p>
                  <Select 
                    value={estarFormat} 
                    onValueChange={setEstarFormat}
                  >
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zip">
                        <div className="flex items-center">
                          <span>ZIP Archive</span>
                          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Recommended</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="folder">Folder Structure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full md:w-1/2">
                  <label className="text-sm font-medium flex items-center">
                    <CheckSquare className="h-4 w-4 mr-1.5 text-blue-600" />
                    Package Options
                  </label>
                  <p className="text-xs text-gray-500 mb-1.5">Configure additional packaging options</p>
                  <div className="flex flex-col space-y-2 p-2 bg-gray-50 rounded border">
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
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="include-certificates" 
                        checked={true}
                        disabled
                      />
                      <label htmlFor="include-certificates" className="text-sm">
                        Include Digital Signatures
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* FDA submission readiness indicator */}
              <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                <h3 className="text-sm font-medium text-blue-800 mb-1.5 flex items-center">
                  <Shield className="h-4 w-4 mr-1.5" />
                  FDA Submission Readiness
                </h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Device Description</span>
                    <span className="font-medium text-green-600">✓ Complete</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Predicate Device Comparison</span>
                    <span className="font-medium text-green-600">✓ Complete</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Substantial Equivalence</span>
                    <span className="font-medium text-green-600">✓ Complete</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Performance Data</span>
                    <span className="font-medium text-green-600">✓ Complete</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Validation Status</span>
                    {validationResults?.valid ? (
                      <span className="font-medium text-green-600">✓ Validated</span>
                    ) : (
                      <span className="font-medium text-amber-600">⚠ Needs Validation</span>
                    )}
                  </div>
                </div>
              </div>
              
              {!validationResults?.valid && validationResults?.issues?.length > 0 && (
                <Alert className="my-2 border-amber-200 bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <AlertTitle>FDA Validation Recommended</AlertTitle>
                  <AlertDescription>
                    To ensure compliance with FDA requirements, we recommend validating your submission before generating the final package.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="default" 
                  className="flex items-center bg-blue-600 hover:bg-blue-700"
                  onClick={handleGenerate}
                  disabled={isGenerating || (complianceScore < 60 && !validationResults?.valid)}
                >
                  {isGenerating ? (
                    <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Generating FDA Package</>
                  ) : (
                    <><FileCheck className="h-4 w-4 mr-2" />Generate FDA eSTAR Package</>
                  )}
                </Button>
                
                {generatedUrl && (
                  <Button 
                    variant="outline" 
                    className="flex items-center border-green-600 text-green-700 hover:bg-green-50"
                    as="a" 
                    href={generatedUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Package for FDA Submission
                  </Button>
                )}
              </div>
              
              {generatedUrl && (
                <div className="mt-4 p-4 bg-green-50 rounded-md border border-green-200">
                  <div className="flex items-center text-green-700 mb-2">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    <span className="font-medium">FDA-Ready eSTAR Package Generated Successfully</span>
                  </div>
                  <div className="bg-white p-3 rounded border border-green-100 text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Package Format:</span>
                      <span className="font-medium">{estarFormat.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Generated On:</span>
                      <span className="font-medium">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">FDA Compliance:</span>
                      <span className="font-medium text-green-600">✓ Verified</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Digital Signature:</span>
                      <span className="font-medium text-green-600">✓ Signed</span>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-green-600 italic">
                    Your 510(k) submission package is ready for FDA submission.
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