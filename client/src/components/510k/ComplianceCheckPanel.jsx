import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import FDA510kService from "@/services/FDA510kService";
import { CheckSquare, AlertCircle, AlertTriangle, BookOpen, CheckCircle, XCircle, RefreshCw, FileCheck, Loader2, Save } from 'lucide-react';

/**
 * Compliance Check Panel for 510(k) Submissions
 * 
 * This component performs a comprehensive compliance check for 510(k) submissions
 * against FDA requirements, identifying issues and providing an overall compliance score.
 */
const ComplianceCheckPanel = ({ 
  deviceProfile, 
  documentId,
  onComplete,
  predicateDevices = [],
  equivalenceData = null
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [complianceData, setComplianceData] = useState(null);
  const [complianceComplete, setComplianceComplete] = useState(false);
  const { toast } = useToast();

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'error': return 'text-red-500';
      case 'warning': return 'text-amber-500';
      case 'info': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive" className="font-medium">Critical</Badge>;
      case 'error':
        return <Badge variant="destructive" className="bg-red-500 font-medium">Error</Badge>;
      case 'warning':
        return <Badge variant="warning" className="bg-amber-500 text-white font-medium">Warning</Badge>;
      case 'info':
        return <Badge variant="default" className="bg-blue-500 text-white font-medium">Info</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getComplianceStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-8 w-8 text-amber-500" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <CheckSquare className="h-8 w-8 text-blue-500" />;
    }
  };

  const getComplianceColor = (score) => {
    if (score >= 0.9) return 'bg-green-500';
    if (score >= 0.7) return 'bg-amber-500';
    return 'bg-red-500';
  };

  // Run compliance check against FDA requirements
  const runComplianceCheck = async () => {
    if (!deviceProfile?.id) {
      toast({
        title: "Missing Device Profile",
        description: "A device profile is required to run a compliance check.",
        variant: "destructive"
      });
      return;
    }
    
    setIsChecking(true);
    setProgress(25);
    
    try {
      // Save to Document Vault first if available
      if (deviceProfile?.folderStructure?.complianceFolderId) {
        setProgress(50);
        
        // First save our current state to Document Vault
        const hasLiteratureEvidence = equivalenceData && equivalenceData.literatureEvidence && 
          Object.keys(equivalenceData.literatureEvidence).length > 0;
          
        const complianceInputData = {
          deviceProfile: deviceProfile,
          predicateDevices: predicateDevices,
          equivalenceData: equivalenceData,
          literatureEvidence: hasLiteratureEvidence ? equivalenceData.literatureEvidence : {},
          timestamp: new Date().toISOString()
        };
        
        // Create JSON blob for upload
        const jsonBlob = new Blob([JSON.stringify(complianceInputData, null, 2)], {
          type: 'application/json'
        });
        
        // Create file object for upload
        const jsonFile = new File([jsonBlob], 'compliance-check-input.json', {
          type: 'application/json'
        });
        
        // Upload to Document Vault
        await FDA510kService.saveComplianceInput(
          deviceProfile.folderStructure.complianceFolderId,
          jsonFile,
          deviceProfile.id
        );
      }
      
      setProgress(75);
      
      // Run the compliance check with literature evidence if available
      const hasLiteratureEvidence = equivalenceData && equivalenceData.literatureEvidence && 
        Object.keys(equivalenceData.literatureEvidence).length > 0;
      
      console.log('Compliance check with literature evidence:', 
        hasLiteratureEvidence ? 'Yes' : 'No', 
        hasLiteratureEvidence ? Object.keys(equivalenceData.literatureEvidence).length : 0, 
        'connections'
      );
      
      const result = await FDA510kService.runComplianceCheck(
        deviceProfile,
        deviceProfile.organizationId,
        {
          literatureEvidence: hasLiteratureEvidence ? equivalenceData.literatureEvidence : {},
          includeEvidenceValidation: hasLiteratureEvidence
        }
      );
      
      setComplianceData(result);
      
      if (result.score >= 0.75) {
        setComplianceComplete(true);
        
        if (onComplete) {
          onComplete(Math.round(result.score * 100));
        }
        
        toast({
          title: "Compliance Check Complete",
          description: `Your submission is ${Math.round(result.score * 100)}% compliant with FDA requirements.`,
          variant: "success"
        });
      } else {
        toast({
          title: "Compliance Issues Found",
          description: `Your submission is only ${Math.round(result.score * 100)}% compliant. Please address the issues before proceeding.`,
          variant: "warning"
        });
      }
    } catch (error) {
      console.error('Error running compliance check:', error);
      toast({
        title: "Compliance Check Failed",
        description: "There was an error running the compliance check. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
      setProgress(100);
      
      // Reset progress after delay
      setTimeout(() => setProgress(0), 500);
    }
  };

  // Save compliance report to Document Vault
  const saveComplianceReport = async () => {
    if (!complianceData || !deviceProfile?.folderStructure?.complianceFolderId) {
      toast({
        title: "Cannot Save Report",
        description: "No compliance data available or Document Vault integration is missing.",
        variant: "destructive"
      });
      return;
    }
    
    setIsChecking(true);
    setProgress(30);
    
    try {
      const reportData = {
        ...complianceData,
        deviceProfile: deviceProfile,
        generatedAt: new Date().toISOString(),
        status: complianceData.score >= 0.75 ? 'ready' : 'needs_revision'
      };
      
      // Create JSON blob for upload
      const jsonBlob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json'
      });
      
      // Create file object for upload
      const jsonFile = new File([jsonBlob], 'compliance-report.json', {
        type: 'application/json'
      });
      
      setProgress(60);
      
      // Upload to Document Vault
      await FDA510kService.saveComplianceReport(
        deviceProfile.folderStructure.complianceFolderId,
        jsonFile,
        deviceProfile.id
      );
      
      setProgress(100);
      
      toast({
        title: "Report Saved",
        description: "Compliance report has been saved to Document Vault.",
        variant: "success"
      });
    } catch (error) {
      console.error('Error saving compliance report:', error);
      toast({
        title: "Save Failed",
        description: "There was an error saving the compliance report.",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
      setProgress(0);
    }
  };

  // Render the compliance results
  const renderComplianceResults = () => {
    if (!complianceData) return null;
    
    const { score, status, issues = [], literatureEvidence = {} } = complianceData;
    const percentage = Math.round(score * 100);
    const hasLiteratureEvidence = literatureEvidence && Object.keys(literatureEvidence).length > 0;
    const literatureEvidenceCount = hasLiteratureEvidence ? 
      Object.values(literatureEvidence).reduce((acc, papers) => acc + papers.length, 0) : 0;
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {getComplianceStatusIcon(status)}
            <div>
              <h3 className="text-lg font-medium">
                {percentage >= 90 ? 'Submission Ready' : 
                 percentage >= 75 ? 'Minor Issues' : 'Critical Issues'}
              </h3>
              <p className="text-sm text-gray-500">
                {percentage >= 90 ? 'Your submission meets FDA requirements' : 
                 percentage >= 75 ? 'Address minor issues before submitting' : 
                 'Major compliance issues must be resolved'}
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold">
              {percentage}%
            </div>
            <div className="text-sm text-gray-500">Compliance Score</div>
          </div>
        </div>
        
        <Progress value={percentage} className={`h-2 ${getComplianceColor(score)}`} />
        
        {/* Literature Evidence Summary */}
        {hasLiteratureEvidence && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-medium text-blue-700">Literature Evidence</h4>
                  <p className="text-sm text-blue-600">
                    {literatureEvidenceCount} {literatureEvidenceCount === 1 ? 'paper' : 'papers'} supporting {Object.keys(literatureEvidence).length} {Object.keys(literatureEvidence).length === 1 ? 'feature' : 'features'}
                  </p>
                  {deviceProfile?.deviceName?.includes('BP-Track') && (
                    <p className="text-xs text-blue-600 mt-1 italic">
                      Including AAMI/ANSI SP10 standard evidence for blood pressure accuracy
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Badge className="bg-blue-500">{Object.keys(literatureEvidence).length} Features Supported</Badge>
                {deviceProfile?.deviceName?.includes('BP-Track') && (
                  <Badge className="bg-green-500">FDA BP Monitor Guidelines</Badge>
                )}
              </div>
            </div>
          </div>
        )}
        
        <Separator />
        
        <div className="space-y-4">
          <h3 className="text-md font-medium">
            {issues.length > 0 ? `${issues.length} Issues Found` : 'No Issues Found'}
          </h3>
          
          {issues.length > 0 ? (
            <ScrollArea className="h-64 rounded-md border">
              <div className="p-4 space-y-3">
                {issues.map((issue, index) => (
                  <Alert key={index} variant={issue.severity === 'critical' || issue.severity === 'error' ? 'destructive' : 'default'}>
                    <div className="flex justify-between items-start">
                      <div className="flex space-x-2 items-center">
                        {issue.severity === 'critical' && <AlertCircle className="h-4 w-4" />}
                        {issue.severity === 'error' && <XCircle className="h-4 w-4" />}
                        {issue.severity === 'warning' && <AlertTriangle className="h-4 w-4" />}
                        {issue.severity === 'info' && <CheckCircle className="h-4 w-4" />}
                        <AlertTitle className={`text-sm font-medium ${getSeverityColor(issue.severity)}`}>
                          {issue.section}
                        </AlertTitle>
                      </div>
                      {getSeverityBadge(issue.severity)}
                    </div>
                    <AlertDescription className="mt-2 text-sm">
                      {issue.message}
                    </AlertDescription>
                    
                    {/* Show literature evidence hint if relevant */}
                    {issue.missingEvidence && (
                      <div className="mt-2 p-2 bg-amber-50 text-xs rounded border border-amber-200">
                        <div className="flex items-center space-x-1">
                          <AlertTriangle className="h-3 w-3 text-amber-600" />
                          <span className="font-medium">Literature evidence recommended for this feature</span>
                        </div>
                      </div>
                    )}
                  </Alert>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <Alert variant="success" className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-700">All Requirements Met</AlertTitle>
              <AlertDescription className="text-green-600">
                Your 510(k) submission meets all FDA compliance requirements.
                {hasLiteratureEvidence && (
                  <span className="block mt-1">
                    Literature evidence supporting {Object.keys(literatureEvidence).length} features enhances submission quality.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-blue-50 border-b">
        <CardTitle className="text-blue-800 flex items-center">
          <CheckSquare className="mr-2 h-5 w-5 text-blue-600" />
          510(k) Compliance Check
        </CardTitle>
        <CardDescription>
          Verify your submission meets FDA requirements for 510(k) clearance
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        {!complianceData ? (
          <div className="text-center p-6 space-y-6">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
            <div>
              <h3 className="text-lg font-medium">Compliance Check Required</h3>
              <p className="text-gray-600 mt-2 max-w-md mx-auto">
                Run a compliance check to validate your 510(k) submission against FDA requirements and identify any issues.
              </p>
            </div>
            <Button 
              onClick={runComplianceCheck} 
              disabled={isChecking}
              className="mt-4"
            >
              {isChecking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Check...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Run Compliance Check
                </>
              )}
            </Button>
          </div>
        ) : renderComplianceResults()}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t bg-gray-50 px-6 py-4">
        <div className="flex items-center text-sm text-gray-600">
          {isChecking && (
            <div className="mr-4 flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Processing...</span>
            </div>
          )}
          {progress > 0 && (
            <div className="w-32">
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>
        
        <div className="flex space-x-4">
          {complianceData && deviceProfile?.folderStructure?.complianceFolderId && (
            <Button
              variant="outline"
              onClick={saveComplianceReport}
              disabled={isChecking}
              size="sm"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Report to Vault
            </Button>
          )}
          
          {complianceData && (
            <Button
              variant="default"
              onClick={runComplianceCheck}
              disabled={isChecking}
              size="sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Run Check Again
            </Button>
          )}
          
          {complianceData && complianceData.score >= 0.75 && !complianceComplete && (
            <Button
              variant="primary"
              onClick={() => {
                setComplianceComplete(true);
                if (onComplete) {
                  onComplete(Math.round(complianceData.score * 100));
                }
              }}
              disabled={isChecking}
            >
              <FileCheck className="mr-2 h-4 w-4" />
              Complete Compliance Check
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ComplianceCheckPanel;