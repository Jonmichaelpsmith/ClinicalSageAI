import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Icons
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  BookOpen,
  FileCheck,
  Scale,
  HelpCircle
} from 'lucide-react';

/**
 * ValidationEngine Component
 * 
 * This component validates CER documents for:
 * 1. Regulatory compliance with multiple frameworks
 * 2. Document completeness
 * 3. Reference verification
 * 4. Internal consistency
 * 5. Data source authenticity
 */
const ValidationEngine = ({ 
  documentId, 
  framework = "mdr",
  onValidationComplete = () => {},
  isPreview = false 
}) => {
  const [validationState, setValidationState] = useState({
    status: 'idle', // idle, running, completed, failed
    progress: 0,
    results: null
  });
  const { toast } = useToast();

  // Validation categories with their descriptions and icons
  const validationCategories = [
    {
      id: 'regulatory_compliance',
      name: 'Regulatory Compliance',
      description: 'Verifies that the document meets the requirements of the selected regulatory framework',
      icon: <Scale className="h-4 w-4" />
    },
    {
      id: 'completeness',
      name: 'Document Completeness',
      description: 'Checks that all required sections are present and populated with appropriate content',
      icon: <FileCheck className="h-4 w-4" />
    },
    {
      id: 'references',
      name: 'Reference Verification',
      description: 'Validates that all cited references exist and are correctly formatted',
      icon: <BookOpen className="h-4 w-4" />
    },
    {
      id: 'consistency',
      name: 'Internal Consistency',
      description: 'Ensures that data, claims, and analyses are consistent throughout the document',
      icon: <CheckCircle2 className="h-4 w-4" />
    }
  ];

  // Validation mutation
  const validationMutation = useMutation({
    mutationFn: async () => {
      setValidationState({
        status: 'running',
        progress: 0,
        results: null
      });
      
      // Setup interval to simulate progress
      const progressInterval = setInterval(() => {
        setValidationState(prev => ({
          ...prev,
          progress: prev.progress + Math.random() * 5 > 95 ? 95 : prev.progress + Math.random() * 5
        }));
      }, 500);
      
      // Call API
      const response = await apiRequest('POST', `/api/cer/documents/${documentId}/validate`, {
        framework
      });
      
      // Clear interval and set to 100%
      clearInterval(progressInterval);
      setValidationState(prev => ({
        ...prev,
        progress: 100
      }));
      
      return response;
    },
    onSuccess: (response) => {
      // Process validation results
      const results = response.data;
      
      setValidationState({
        status: 'completed',
        progress: 100,
        results
      });
      
      toast({
        title: 'Validation Complete',
        description: `Found ${results.issues.length} issues that need attention`,
      });
      
      onValidationComplete(results);
    },
    onError: (error) => {
      console.error('Error validating document:', error);
      
      setValidationState({
        status: 'failed',
        progress: 0,
        results: null
      });
      
      toast({
        title: 'Validation failed',
        description: 'There was a problem validating your document. Please try again.',
        variant: 'destructive'
      });
    }
  });

  // If preview mode, load sample data
  useEffect(() => {
    if (isPreview) {
      const previewResults = {
        summary: {
          totalIssues: 5,
          criticalIssues: 1,
          majorIssues: 2,
          minorIssues: 2,
          passedChecks: 42,
          complianceScore: 89
        },
        categories: {
          regulatory_compliance: { status: 'warning', passed: 18, failed: 2 },
          completeness: { status: 'error', passed: 8, failed: 1 },
          references: { status: 'warning', passed: 10, failed: 2 },
          consistency: { status: 'success', passed: 6, failed: 0 }
        },
        issues: [
          {
            id: 1,
            category: 'regulatory_compliance',
            severity: 'critical',
            message: 'Missing GSPR mapping for safety claims in section 4.2.3',
            location: 'Section 4.2.3',
            suggestion: 'Add GSPR mapping for all safety claims per MEDDEV 2.7/1 Rev 4 requirements'
          },
          {
            id: 2,
            category: 'completeness',
            severity: 'major',
            message: 'Literature search methodology is incomplete',
            location: 'Section 3.5',
            suggestion: 'Include search terms, databases, and inclusion/exclusion criteria'
          },
          {
            id: 3,
            category: 'references',
            severity: 'major',
            message: 'Citation Smith et al. (2022) not found in reference list',
            location: 'Section 5.2',
            suggestion: 'Add missing reference to bibliography or correct citation'
          },
          {
            id: 4,
            category: 'regulatory_compliance',
            severity: 'minor',
            message: 'State-of-the-art analysis lacks comparison with current standards',
            location: 'Section 2.3',
            suggestion: 'Include comparison with current industry standards and guidelines'
          },
          {
            id: 5,
            category: 'references',
            severity: 'minor',
            message: 'Inconsistent citation format in section 6',
            location: 'Section 6',
            suggestion: 'Standardize citation format according to document template'
          }
        ]
      };
      
      setTimeout(() => {
        setValidationState({
          status: 'completed',
          progress: 100,
          results: previewResults
        });
      }, 1500);
    }
  }, [isPreview]);

  // Start validation
  const handleStartValidation = () => {
    validationMutation.mutate();
  };

  // Render severity badge
  const renderSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return (
          <Badge variant="destructive" className="ml-2">
            Critical
          </Badge>
        );
      case 'major':
        return (
          <Badge variant="warning" className="ml-2 bg-amber-500">
            Major
          </Badge>
        );
      case 'minor':
        return (
          <Badge variant="secondary" className="ml-2">
            Minor
          </Badge>
        );
      default:
        return null;
    }
  };

  // Render category status
  const renderCategoryStatus = (status) => {
    switch (status) {
      case 'success':
        return (
          <div className="flex items-center text-green-600">
            <CheckCircle2 className="h-5 w-5 mr-1" />
            <span>Passed</span>
          </div>
        );
      case 'warning':
        return (
          <div className="flex items-center text-amber-600">
            <AlertTriangle className="h-5 w-5 mr-1" />
            <span>Warnings</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center text-red-600">
            <XCircle className="h-5 w-5 mr-1" />
            <span>Failed</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-500">
            <HelpCircle className="h-5 w-5 mr-1" />
            <span>Unknown</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {validationState.status === 'idle' && (
        <Card className="border-dashed border-gray-300">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <Shield className="h-12 w-12 text-blue-200 mx-auto" />
              <h3 className="font-medium">Document Validation</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Validate your document against regulatory requirements, check for completeness,
                verify references, and ensure internal consistency.
              </p>
              <Button 
                onClick={handleStartValidation}
                className="mt-2"
              >
                <Shield className="h-4 w-4 mr-2" />
                Start Validation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {validationState.status === 'running' && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                <Shield className="h-16 w-16 text-blue-100" />
                <Loader2 className="h-16 w-16 absolute top-0 left-0 text-blue-500 animate-spin opacity-75" />
              </div>
              <h3 className="font-medium">Validating Document</h3>
              <p className="text-sm text-gray-500">
                Running comprehensive validation checks...
              </p>
              <div className="w-full max-w-md mx-auto">
                <Progress value={validationState.progress} className="h-2" />
                <p className="text-xs text-gray-500 mt-2">
                  {Math.round(validationState.progress)}% complete
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {validationState.status === 'completed' && validationState.results && (
        <div className="space-y-4">
          {/* Summary Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Shield className="h-5 w-5 mr-2 text-blue-600" />
                Validation Summary
              </CardTitle>
              <CardDescription>
                Overall document validation results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-blue-50 rounded-md p-3 text-center">
                  <p className="text-sm text-gray-600">Compliance Score</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {validationState.results.summary.complianceScore}%
                  </p>
                </div>
                <div className="bg-red-50 rounded-md p-3 text-center">
                  <p className="text-sm text-gray-600">Critical Issues</p>
                  <p className="text-2xl font-bold text-red-700">
                    {validationState.results.summary.criticalIssues}
                  </p>
                </div>
                <div className="bg-amber-50 rounded-md p-3 text-center">
                  <p className="text-sm text-gray-600">Major Issues</p>
                  <p className="text-2xl font-bold text-amber-700">
                    {validationState.results.summary.majorIssues}
                  </p>
                </div>
                <div className="bg-green-50 rounded-md p-3 text-center">
                  <p className="text-sm text-gray-600">Passed Checks</p>
                  <p className="text-2xl font-bold text-green-700">
                    {validationState.results.summary.passedChecks}
                  </p>
                </div>
              </div>
              
              <h3 className="text-sm font-medium mb-2">Category Results</h3>
              <div className="space-y-2">
                {validationCategories.map((category) => {
                  const categoryResult = validationState.results.categories[category.id];
                  return (
                    <div 
                      key={category.id} 
                      className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
                    >
                      <div className="flex items-center">
                        {React.cloneElement(category.icon, { className: "h-4 w-4 mr-2 text-gray-500" })}
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-gray-600 mr-2">
                          {categoryResult.passed}/{categoryResult.passed + categoryResult.failed} Passed
                        </span>
                        {renderCategoryStatus(categoryResult.status)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          {/* Issues Card */}
          {validationState.results.issues.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
                  Identified Issues
                </CardTitle>
                <CardDescription>
                  Issues that need to be addressed before export
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {validationState.results.issues.map((issue) => {
                    const category = validationCategories.find(c => c.id === issue.category);
                    return (
                      <AccordionItem key={issue.id} value={`issue-${issue.id}`}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center text-left">
                            <div className="mr-2">
                              {category && React.cloneElement(category.icon, { 
                                className: "h-4 w-4 text-gray-500" 
                              })}
                            </div>
                            <span>{issue.message}</span>
                            {renderSeverityBadge(issue.severity)}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pl-6 space-y-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div>
                                <p className="text-sm font-medium text-gray-600">Location</p>
                                <p className="text-sm">{issue.location}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Category</p>
                                <p className="text-sm">{category ? category.name : issue.category}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Suggestion</p>
                              <p className="text-sm">{issue.suggestion}</p>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </CardContent>
            </Card>
          )}
          
          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline"
              onClick={handleStartValidation}
            >
              Re-validate
            </Button>
            <Button>
              Fix All Issues
            </Button>
          </div>
        </div>
      )}

      {validationState.status === 'failed' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Validation Failed</AlertTitle>
          <AlertDescription>
            There was an error during validation. Please try again or contact support if the issue persists.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ValidationEngine;