import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

import {
  FileCheck,
  AlertCircle,
  Clock,
  Upload,
  Search,
  FileX,
  CheckCircle2,
  FileText,
  Folder,
  Download
} from 'lucide-react';

/**
 * eCTD Template Validator Component
 * 
 * This component provides an interface for validating eCTD submission documents
 * against regulatory requirements and ICH M4 specifications.
 * 
 * Features:
 * - Document validation against eCTD specifications
 * - Structure checking for all CTD modules
 * - Detailed validation report with issue identification
 * - Automatic correction suggestions
 * - Export of validation results
 */
const ECTDTemplateValidator = ({ submissionId }) => {
  const [validationStatus, setValidationStatus] = useState('idle'); // 'idle', 'running', 'completed', 'failed'
  const [validationProgress, setValidationProgress] = useState(0);
  const [validationResults, setValidationResults] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('fda');
  const [activeTab, setActiveTab] = useState('overview');
  const [validationSummary, setValidationSummary] = useState({
    totalFiles: 0,
    passedFiles: 0,
    warningFiles: 0,
    failedFiles: 0,
    issuesByType: {}
  });
  
  const { toast } = useToast();

  // Assuming we have a submission ID to validate
  const submissionData = {
    id: submissionId || 'SUB001',
    title: 'NDA 123456 - Initial Submission',
    type: 'Original',
    created: '2025-05-15',
    status: 'Draft',
    totalFiles: 156,
    modules: {
      'Module 1': 23,
      'Module 2': 42,
      'Module 3': 65,
      'Module 4': 12,
      'Module 5': 14
    }
  };

  // Mock validation results for demonstration
  const mockValidationResults = [
    {
      id: 'issue-001',
      file: 'm1/us/cover-letter.pdf',
      module: 'Module 1',
      section: '1.1',
      type: 'error',
      severity: 'high',
      message: 'Cover letter does not include required NDA reference number',
      description: 'FDA requires NDA reference number to be included in the cover letter format per eCTD guidance',
      correctionAvailable: true,
      rule: 'FDA-eCTD-M1-001'
    },
    {
      id: 'issue-002',
      file: 'm2/25-clin-over/clinical-overview.pdf',
      module: 'Module 2',
      section: '2.5',
      type: 'warning',
      severity: 'medium',
      message: 'Clinical Overview missing section 2.5.7',
      description: 'The Clinical Overview document should include Section 2.5.7 (Benefit-Risk Assessment) as per ICH M4E(R2)',
      correctionAvailable: false,
      rule: 'ICH-M4E-R2-001'
    },
    {
      id: 'issue-003',
      file: 'm3/32-body-data/32s-drug-sub/characterization.pdf',
      module: 'Module 3',
      section: '3.2.S',
      type: 'warning',
      severity: 'low',
      message: 'File naming convention deviates from recommended pattern',
      description: 'File should be named using the pattern "32s3-charac.pdf" for consistency with eCTD structure',
      correctionAvailable: true,
      rule: 'ICH-eCTD-FILE-001'
    },
    {
      id: 'issue-004',
      file: 'm5/53-clin-stud-rep/535-rep-effic-safety-stud/study-report-101.pdf',
      module: 'Module 5',
      section: '5.3.5',
      type: 'error',
      severity: 'high',
      message: 'Clinical study report missing synopses',
      description: 'Clinical study reports must include study synopsis as per ICH E3 guidance',
      correctionAvailable: false,
      rule: 'ICH-E3-001'
    },
    {
      id: 'issue-005',
      file: 'm3/32-body-data/32p-drug-prod/32p8-stab/stability-data.pdf',
      module: 'Module 3',
      section: '3.2.P.8',
      type: 'error',
      severity: 'medium',
      message: 'Document exceeds maximum file size (150MB)',
      description: 'eCTD submissions should maintain individual file sizes below 150MB for optimal review',
      correctionAvailable: true,
      rule: 'eCTD-TECH-001'
    },
    {
      id: 'issue-006',
      file: 'm2/23-qos/quality-summary.pdf',
      module: 'Module 2',
      section: '2.3',
      type: 'warning',
      severity: 'low',
      message: 'Document contains scanned text rather than searchable PDF',
      description: 'All PDF documents should contain searchable text per eCTD specifications',
      correctionAvailable: true,
      rule: 'eCTD-FORMAT-001'
    },
    {
      id: 'issue-007',
      file: 'm1/us/administrative/356h.pdf',
      module: 'Module 1',
      section: '1.4',
      type: 'info',
      severity: 'low',
      message: 'Form FDA 356h should use the latest version (05/2021)',
      description: 'The FDA 356h form should be updated to the most recent version',
      correctionAvailable: false,
      rule: 'FDA-FORM-001'
    }
  ];

  useEffect(() => {
    // In a real implementation, we would fetch submission data and prepare for validation
    console.log(`Preparing validation for submission ${submissionId}`);
  }, [submissionId]);

  const calculateValidationSummary = (results) => {
    const summary = {
      totalFiles: submissionData.totalFiles,
      passedFiles: submissionData.totalFiles - results.length,
      warningFiles: results.filter(issue => issue.type === 'warning').length,
      failedFiles: results.filter(issue => issue.type === 'error').length,
      issuesByType: {}
    };

    // Count issues by type
    results.forEach(issue => {
      if (!summary.issuesByType[issue.type]) {
        summary.issuesByType[issue.type] = 0;
      }
      summary.issuesByType[issue.type]++;
    });

    // Count issues by module
    const moduleIssues = {
      'Module 1': 0,
      'Module 2': 0,
      'Module 3': 0,
      'Module 4': 0,
      'Module 5': 0
    };

    results.forEach(issue => {
      moduleIssues[issue.module]++;
    });

    summary.moduleIssues = moduleIssues;

    return summary;
  };

  const startValidation = () => {
    setValidationStatus('running');
    setValidationProgress(0);
    setValidationResults([]);

    // Simulate validation progress
    const interval = setInterval(() => {
      setValidationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setValidationStatus('completed');
          setValidationResults(mockValidationResults);
          setValidationSummary(calculateValidationSummary(mockValidationResults));
          
          toast({
            title: "Validation Complete",
            description: `Found ${mockValidationResults.length} issues that require attention.`,
          });
          
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  const handleApplyCorrection = (issueId) => {
    // In a real implementation, this would apply suggested corrections
    setValidationResults(prevResults => 
      prevResults.map(issue => 
        issue.id === issueId 
          ? { ...issue, status: 'corrected', type: 'info', message: `${issue.message} (Corrected)` } 
          : issue
      )
    );
    
    toast({
      title: "Correction Applied",
      description: "The issue has been automatically corrected.",
    });
    
    // Update summary after correction
    setValidationSummary(prevSummary => {
      const issue = validationResults.find(i => i.id === issueId);
      const newSummary = { ...prevSummary };
      
      if (issue.type === 'error') {
        newSummary.failedFiles--;
        newSummary.issuesByType.error--;
      } else if (issue.type === 'warning') {
        newSummary.warningFiles--;
        newSummary.issuesByType.warning--;
      }
      
      newSummary.passedFiles++;
      if (!newSummary.issuesByType.info) newSummary.issuesByType.info = 0;
      newSummary.issuesByType.info++;
      
      return newSummary;
    });
  };

  const handleDownloadReport = () => {
    // In a real implementation, this would generate and download a validation report
    toast({
      title: "Report Downloaded",
      description: "Validation report has been downloaded as PDF.",
    });
  };

  const renderValidationStatus = () => {
    if (validationStatus === 'idle') {
      return (
        <div className="text-center py-8">
          <FileCheck className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Ready to Validate</h3>
          <p className="text-gray-500 mb-6">
            Click the button below to start validating your eCTD submission against regulatory requirements.
          </p>
          <div className="flex justify-center">
            <Button onClick={startValidation}>
              Start Validation
            </Button>
          </div>
        </div>
      );
    }

    if (validationStatus === 'running') {
      return (
        <div className="text-center py-8">
          <div className="mb-4">
            <Progress value={validationProgress} className="w-full" />
          </div>
          <h3 className="text-lg font-medium mb-2">Validating Submission</h3>
          <p className="text-gray-500">
            Checking eCTD compliance across all modules and files...
          </p>
        </div>
      );
    }

    if (validationStatus === 'failed') {
      return (
        <div className="text-center py-8">
          <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">Validation Failed</h3>
          <p className="text-gray-500 mb-6">
            There was an error validating your submission. Please try again.
          </p>
          <div className="flex justify-center">
            <Button onClick={startValidation}>
              Retry Validation
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderIssueType = (type, severity) => {
    switch (type) {
      case 'error':
        return (
          <Badge variant="destructive" className="font-normal">
            <AlertCircle className="h-3 w-3 mr-1" /> Error
          </Badge>
        );
      case 'warning':
        return (
          <Badge variant="warning" className="font-normal bg-amber-100 text-amber-800 hover:bg-amber-200">
            <AlertCircle className="h-3 w-3 mr-1" /> Warning
          </Badge>
        );
      case 'info':
        return (
          <Badge variant="outline" className="font-normal">
            <Clock className="h-3 w-3 mr-1" /> Info
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="font-normal">
            {type}
          </Badge>
        );
    }
  };

  const renderValidationSummary = () => {
    if (!validationSummary) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-slate-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{validationSummary.totalFiles}</div>
          </CardContent>
        </Card>

        <Card className="bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Passed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{validationSummary.passedFiles}</div>
            <p className="text-sm text-green-600 mt-1">
              {Math.round((validationSummary.passedFiles / validationSummary.totalFiles) * 100)}% compliant
            </p>
          </CardContent>
        </Card>

        <Card className="bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-700">{validationSummary.warningFiles}</div>
            <p className="text-sm text-amber-600 mt-1">
              Issues needing attention
            </p>
          </CardContent>
        </Card>

        <Card className="bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">{validationSummary.failedFiles}</div>
            <p className="text-sm text-red-600 mt-1">
              Critical issues to fix
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderComplianceByModule = () => {
    if (!validationSummary?.moduleIssues) return null;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Compliance by Module</CardTitle>
          <CardDescription>
            Issue distribution across CTD modules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(submissionData.modules).map(([module, count]) => {
              const issues = validationSummary.moduleIssues[module] || 0;
              const complianceRate = Math.round(((count - issues) / count) * 100);
              
              return (
                <div key={module} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{module}</span>
                    <span className="font-medium">{complianceRate}% Compliant</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        complianceRate > 90 ? 'bg-green-500' : 
                        complianceRate > 70 ? 'bg-amber-500' : 'bg-red-500'
                      }`} 
                      style={{ width: `${complianceRate}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{count - issues} of {count} files pass validation</span>
                    <span>{issues} issues</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">eCTD Validation</h2>
          <p className="text-muted-foreground mt-1">
            Validate submission against eCTD specifications and regulatory requirements
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            disabled={validationStatus !== 'completed'}
            onClick={handleDownloadReport}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
          <Button
            disabled={validationStatus === 'running'}
            onClick={startValidation}
          >
            <FileCheck className="h-4 w-4 mr-2" />
            {validationStatus === 'completed' ? 'Revalidate' : 'Start Validation'}
          </Button>
        </div>
      </div>

      <div className="bg-slate-50 border rounded-lg p-4 flex items-center space-x-4">
        <div className="p-2 bg-white rounded-md border">
          <FileText className="h-6 w-6 text-orange-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium">{submissionData.title}</h3>
          <p className="text-sm text-slate-500">
            {submissionData.type} • Created on {submissionData.created} • {submissionData.totalFiles} files
          </p>
        </div>
        <Badge variant={
          submissionData.status === 'Submitted' ? 'default' :
          submissionData.status === 'Approved' ? 'success' :
          'secondary'
        }>
          {submissionData.status}
        </Badge>
      </div>

      {validationStatus === 'completed' ? (
        <>
          {renderValidationSummary()}
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="issues">
                Issues ({validationResults.length})
              </TabsTrigger>
              <TabsTrigger value="by-module">By Module</TabsTrigger>
              <TabsTrigger value="by-rule">By Rule</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              {renderComplianceByModule()}
              
              <Card>
                <CardHeader>
                  <CardTitle>Critical Issues</CardTitle>
                  <CardDescription>
                    High priority issues that must be fixed before submission
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File</TableHead>
                        <TableHead>Module</TableHead>
                        <TableHead>Issue</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validationResults
                        .filter(issue => issue.type === 'error' && issue.severity === 'high')
                        .map(issue => (
                          <TableRow key={issue.id}>
                            <TableCell className="font-medium">{issue.file.split('/').pop()}</TableCell>
                            <TableCell>{issue.section}</TableCell>
                            <TableCell>{issue.message}</TableCell>
                            <TableCell>{renderIssueType(issue.type, issue.severity)}</TableCell>
                            <TableCell className="text-right">
                              {issue.correctionAvailable && issue.status !== 'corrected' && (
                                <Button size="sm" onClick={() => handleApplyCorrection(issue.id)}>
                                  Fix Issue
                                </Button>
                              )}
                              {issue.status === 'corrected' && (
                                <Badge variant="outline" className="font-normal bg-green-100 text-green-800">
                                  <CheckCircle2 className="h-3 w-3 mr-1" /> Fixed
                                </Badge>
                              )}
                              {!issue.correctionAvailable && issue.status !== 'corrected' && (
                                <Button size="sm" variant="outline">
                                  View Details
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      {validationResults.filter(issue => issue.type === 'error' && issue.severity === 'high').length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No critical issues found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="issues">
              <Card>
                <CardHeader>
                  <CardTitle>All Issues</CardTitle>
                  <CardDescription>
                    Complete list of validation issues found in the submission
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File</TableHead>
                        <TableHead>Module</TableHead>
                        <TableHead>Issue</TableHead>
                        <TableHead>Rule</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validationResults.map(issue => (
                        <TableRow key={issue.id}>
                          <TableCell className="font-medium">{issue.file.split('/').pop()}</TableCell>
                          <TableCell>{issue.section}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{issue.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">{issue.description}</p>
                            </div>
                          </TableCell>
                          <TableCell><span className="text-xs font-mono">{issue.rule}</span></TableCell>
                          <TableCell>{renderIssueType(issue.type, issue.severity)}</TableCell>
                          <TableCell>
                            {issue.correctionAvailable && issue.status !== 'corrected' && (
                              <Button size="sm" onClick={() => handleApplyCorrection(issue.id)}>
                                Fix Issue
                              </Button>
                            )}
                            {issue.status === 'corrected' && (
                              <Badge variant="outline" className="font-normal bg-green-100 text-green-800">
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Fixed
                              </Badge>
                            )}
                            {!issue.correctionAvailable && issue.status !== 'corrected' && (
                              <Button size="sm" variant="outline">
                                View Details
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="by-module">
              <Card>
                <CardHeader>
                  <CardTitle>Issues by Module</CardTitle>
                  <CardDescription>
                    Validation issues organized by CTD module
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {['Module 1', 'Module 2', 'Module 3', 'Module 4', 'Module 5'].map(module => {
                      const moduleIssues = validationResults.filter(issue => issue.module === module);
                      
                      if (moduleIssues.length === 0) return null;
                      
                      return (
                        <div key={module}>
                          <h3 className="font-medium mb-4 flex items-center">
                            <Folder className="h-5 w-5 mr-2 text-blue-500" />
                            {module}
                            <Badge className="ml-2">{moduleIssues.length} issues</Badge>
                          </h3>
                          
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Section</TableHead>
                                <TableHead>File</TableHead>
                                <TableHead>Issue</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {moduleIssues.map(issue => (
                                <TableRow key={issue.id}>
                                  <TableCell className="font-medium">{issue.section}</TableCell>
                                  <TableCell className="max-w-xs truncate">{issue.file.split('/').pop()}</TableCell>
                                  <TableCell>
                                    <p className="font-medium">{issue.message}</p>
                                  </TableCell>
                                  <TableCell>{renderIssueType(issue.type, issue.severity)}</TableCell>
                                  <TableCell>
                                    {issue.correctionAvailable && issue.status !== 'corrected' && (
                                      <Button size="sm" onClick={() => handleApplyCorrection(issue.id)}>
                                        Fix Issue
                                      </Button>
                                    )}
                                    {issue.status === 'corrected' && (
                                      <Badge variant="outline" className="font-normal bg-green-100 text-green-800">
                                        <CheckCircle2 className="h-3 w-3 mr-1" /> Fixed
                                      </Badge>
                                    )}
                                    {!issue.correctionAvailable && issue.status !== 'corrected' && (
                                      <Button size="sm" variant="outline">
                                        View Details
                                      </Button>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="by-rule">
              <Card>
                <CardHeader>
                  <CardTitle>Issues by Regulatory Rule</CardTitle>
                  <CardDescription>
                    Validation issues organized by regulatory guideline or rule
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Group issues by rule prefix (FDA, ICH, etc) */}
                    {['FDA', 'ICH', 'eCTD'].map(ruleType => {
                      const ruleIssues = validationResults.filter(issue => 
                        issue.rule.startsWith(ruleType)
                      );
                      
                      if (ruleIssues.length === 0) return null;
                      
                      return (
                        <div key={ruleType}>
                          <h3 className="font-medium mb-4 flex items-center">
                            <FileText className="h-5 w-5 mr-2 text-blue-500" />
                            {ruleType} Guidelines
                            <Badge className="ml-2">{ruleIssues.length} issues</Badge>
                          </h3>
                          
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Rule</TableHead>
                                <TableHead>Issue</TableHead>
                                <TableHead>File</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {ruleIssues.map(issue => (
                                <TableRow key={issue.id}>
                                  <TableCell className="font-medium font-mono text-xs">{issue.rule}</TableCell>
                                  <TableCell>
                                    <p className="font-medium">{issue.message}</p>
                                  </TableCell>
                                  <TableCell className="max-w-xs truncate">{issue.file.split('/').pop()}</TableCell>
                                  <TableCell>{renderIssueType(issue.type, issue.severity)}</TableCell>
                                  <TableCell>
                                    {issue.correctionAvailable && issue.status !== 'corrected' && (
                                      <Button size="sm" onClick={() => handleApplyCorrection(issue.id)}>
                                        Fix Issue
                                      </Button>
                                    )}
                                    {issue.status === 'corrected' && (
                                      <Badge variant="outline" className="font-normal bg-green-100 text-green-800">
                                        <CheckCircle2 className="h-3 w-3 mr-1" /> Fixed
                                      </Badge>
                                    )}
                                    {!issue.correctionAvailable && issue.status !== 'corrected' && (
                                      <Button size="sm" variant="outline">
                                        View Details
                                      </Button>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card>
          <CardContent className="p-6">
            {renderValidationStatus()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ECTDTemplateValidator;