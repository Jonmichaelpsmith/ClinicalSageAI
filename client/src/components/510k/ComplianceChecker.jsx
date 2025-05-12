import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, Play, Download, Info, RotateCw, FileCheck, FileX, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import FDA510kService from '../../services/FDA510kService';

/**
 * ComplianceChecker Component
 * 
 * This component provides an automated QA system to check compliance of a 510(k) submission
 * against FDA requirements and guidelines.
 * 
 * @param {Object} props
 * @param {string} props.projectId - The ID of the 510(k) project
 */
const ComplianceChecker = ({ projectId }) => {
  const [loading, setLoading] = useState(false);
  const [checkResults, setCheckResults] = useState(null);
  const [runningCheck, setRunningCheck] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [overallStatus, setOverallStatus] = useState(null);
  const [fixableIssues, setFixableIssues] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    if (projectId) {
      fetchLatestResults();
    }
  }, [projectId]);

  // Calculate overall status whenever check results change
  useEffect(() => {
    if (checkResults) {
      calculateOverallStatus();
      identifyFixableIssues();
    }
  }, [checkResults]);

  // Fetch the latest compliance check results
  const fetchLatestResults = async () => {
    try {
      setLoading(true);
      const results = await FDA510kService.getComplianceCheckResults(projectId);
      setCheckResults(results);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching compliance check results:", error);
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to load compliance check results",
        variant: "destructive"
      });
    }
  };

  // Run a new compliance check
  const runComplianceCheck = async () => {
    try {
      setRunningCheck(true);
      const results = await FDA510kService.runComplianceCheck(projectId);
      setCheckResults(results);
      setRunningCheck(false);
      
      toast({
        title: "Compliance Check Complete",
        description: "Results have been updated with the latest submission status"
      });
    } catch (error) {
      console.error("Error running compliance check:", error);
      setRunningCheck(false);
      toast({
        title: "Error",
        description: "Failed to run compliance check",
        variant: "destructive"
      });
    }
  };

  // Calculate overall submission status
  const calculateOverallStatus = () => {
    if (!checkResults || !checkResults.sections) {
      setOverallStatus(null);
      return;
    }

    const sectionStatuses = checkResults.sections.map(section => section.status);
    
    if (sectionStatuses.some(status => status === 'failed')) {
      setOverallStatus('failed');
    } else if (sectionStatuses.some(status => status === 'warning')) {
      setOverallStatus('warning');
    } else if (sectionStatuses.every(status => status === 'passed')) {
      setOverallStatus('passed');
    } else {
      setOverallStatus('incomplete');
    }
  };

  // Identify which issues can be automatically fixed
  const identifyFixableIssues = () => {
    if (!checkResults || !checkResults.sections) {
      setFixableIssues([]);
      return;
    }

    const fixable = [];
    
    checkResults.sections.forEach(section => {
      section.checks.forEach(check => {
        if ((check.status === 'failed' || check.status === 'warning') && check.autoFixAvailable) {
          fixable.push({
            sectionId: section.id,
            checkId: check.id,
            description: check.description,
            status: check.status,
            fix: check.autoFixDescription
          });
        }
      });
    });
    
    setFixableIssues(fixable);
  };

  // Apply automatic fixes for an issue
  const applyAutoFix = async (sectionId, checkId) => {
    try {
      setLoading(true);
      await FDA510kService.applyAutoFix(projectId, sectionId, checkId);
      
      // Refresh results after applying the fix
      await fetchLatestResults();
      
      toast({
        title: "Auto-Fix Applied",
        description: "The issue has been automatically fixed"
      });
    } catch (error) {
      console.error("Error applying auto-fix:", error);
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to apply automatic fix",
        variant: "destructive"
      });
    }
  };

  // Export compliance report
  const exportReport = async () => {
    try {
      const response = await FDA510kService.exportComplianceReport(projectId);
      
      // Trigger download using the URL from the response
      if (response && response.downloadUrl) {
        window.open(response.downloadUrl, '_blank');
      }
      
      toast({
        title: "Report Exported",
        description: "Compliance report has been exported successfully"
      });
    } catch (error) {
      console.error("Error exporting compliance report:", error);
      toast({
        title: "Error",
        description: "Failed to export compliance report",
        variant: "destructive"
      });
    }
  };

  // Get icon based on check status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  // Get color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'warning':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      case 'failed':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compliance Check</CardTitle>
          <CardDescription>
            Loading compliance check results...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="flex flex-col items-center">
            <RotateCw className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Retrieving latest compliance data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>510(k) Compliance Checker</CardTitle>
            <CardDescription>
              Automated verification of FDA 510(k) submission requirements
            </CardDescription>
          </div>
          {overallStatus && (
            <Badge className={getStatusColor(overallStatus)} size="lg">
              {overallStatus === 'passed' ? 'PASSED' : 
               overallStatus === 'warning' ? 'WARNINGS' : 
               overallStatus === 'failed' ? 'ISSUES DETECTED' : 'INCOMPLETE'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!checkResults ? (
          <div className="text-center p-8">
            <FileCheck className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No Compliance Check Results</h3>
            <p className="text-gray-500 mb-4">
              Run a compliance check to verify your 510(k) submission against FDA requirements.
            </p>
            <Button onClick={runComplianceCheck} disabled={runningCheck}>
              {runningCheck ? (
                <>
                  <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                  Running Check...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Compliance Check
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Overall Compliance</h3>
                <span className="text-sm font-medium">{checkResults.overallScore}%</span>
              </div>
              <Progress value={checkResults.overallScore} className="h-2" />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="details">Detailed Results</TabsTrigger>
                <TabsTrigger value="fixes">Auto-Fixes ({fixableIssues.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-md border p-3">
                    <div className="text-sm text-muted-foreground">Required Sections</div>
                    <div className="mt-1 text-2xl font-bold">
                      {checkResults.completedSections}/{checkResults.totalSections}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {checkResults.completedSections === checkResults.totalSections ? 
                        "All sections completed" : "Sections still needed"}
                    </div>
                  </div>
                  
                  <div className="rounded-md border p-3">
                    <div className="text-sm text-muted-foreground">Compliance Issues</div>
                    <div className="mt-1 text-2xl font-bold text-red-600">
                      {checkResults.criticalIssues}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {checkResults.criticalIssues === 0 ? 
                        "No critical issues found" : "Must be fixed before submission"}
                    </div>
                  </div>
                  
                  <div className="rounded-md border p-3">
                    <div className="text-sm text-muted-foreground">Warnings</div>
                    <div className="mt-1 text-2xl font-bold text-amber-600">
                      {checkResults.warnings}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {checkResults.warnings === 0 ? 
                        "No warnings found" : "Recommended to address"}
                    </div>
                  </div>
                </div>

                <div className="rounded-md border p-4 mt-4">
                  <h3 className="font-medium mb-2">Summary by Section</h3>
                  <div className="space-y-4">
                    {checkResults.sections.map((section) => (
                      <div key={section.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          {getStatusIcon(section.status)}
                          <span className="ml-2">{section.name}</span>
                        </div>
                        <Badge className={getStatusColor(section.status)}>
                          {section.status === 'passed' ? 'PASSED' : 
                           section.status === 'warning' ? 'WARNING' : 
                           section.status === 'failed' ? 'FAILED' : 'PENDING'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <Alert className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Next Steps</AlertTitle>
                  <AlertDescription>
                    {overallStatus === 'passed' ? 
                      "Your submission meets all FDA requirements and is ready for final review." : 
                     overallStatus === 'warning' ? 
                      "Address warnings to improve your submission quality before final review." : 
                     overallStatus === 'failed' ? 
                      "Critical issues must be resolved before your 510(k) can be submitted." : 
                      "Complete all required sections of your 510(k) submission."}
                  </AlertDescription>
                </Alert>
              </TabsContent>
              
              <TabsContent value="details" className="space-y-6">
                {checkResults.sections.map((section) => (
                  <div key={section.id} className="rounded-md border overflow-hidden">
                    <div className={`p-4 ${
                      section.status === 'passed' ? 'bg-green-50' : 
                      section.status === 'warning' ? 'bg-amber-50' : 
                      section.status === 'failed' ? 'bg-red-50' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {getStatusIcon(section.status)}
                          <h3 className="font-medium ml-2">{section.name}</h3>
                        </div>
                        <Badge className={getStatusColor(section.status)}>
                          {section.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-3">
                      {section.checks.map((check) => (
                        <div key={check.id} className="flex items-start">
                          <div className="flex-shrink-0 mt-0.5">
                            {getStatusIcon(check.status)}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm">{check.description}</p>
                            {check.message && (
                              <p className={`text-xs mt-1 ${
                                check.status === 'failed' ? 'text-red-600' :
                                check.status === 'warning' ? 'text-amber-600' :
                                check.status === 'passed' ? 'text-green-600' : 'text-gray-600'
                              }`}>
                                {check.message}
                              </p>
                            )}
                            {check.autoFixAvailable && (
                              <div className="mt-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => applyAutoFix(section.id, check.id)}
                                >
                                  Auto-Fix Issue
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="fixes" className="space-y-4">
                {fixableIssues.length > 0 ? (
                  <>
                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertTitle className="text-blue-800">Automatic Fixes Available</AlertTitle>
                      <AlertDescription className="text-blue-700">
                        The system can automatically fix {fixableIssues.length} issues in your submission.
                        Review each issue carefully before applying any automatic fixes.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-4 mt-4">
                      {fixableIssues.map((issue, index) => (
                        <div key={index} className="rounded-md border p-4">
                          <div className="flex items-start">
                            {issue.status === 'failed' ? 
                              <FileX className="h-5 w-5 text-red-500 mt-0.5" /> : 
                              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                            }
                            <div className="ml-3 flex-1">
                              <p className="font-medium">{issue.description}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Automatic fix will: {issue.fix}
                              </p>
                              <div className="mt-3">
                                <Button 
                                  size="sm"
                                  onClick={() => applyAutoFix(issue.sectionId, issue.checkId)}
                                >
                                  Apply Fix
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Auto-Fixable Issues</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      There are no issues that can be automatically fixed at this time.
                      Any remaining issues will need to be addressed manually.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
      
      {checkResults && (
        <CardFooter className="flex justify-between border-t pt-6">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            Last checked: {new Date(checkResults.timestamp).toLocaleString()}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={runComplianceCheck} disabled={runningCheck}>
              {runningCheck ? (
                <>
                  <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <RotateCw className="h-4 w-4 mr-2" />
                  Run Again
                </>
              )}
            </Button>
            
            <Button onClick={exportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default ComplianceChecker;