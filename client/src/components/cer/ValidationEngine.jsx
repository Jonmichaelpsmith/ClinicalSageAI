/**
 * ValidationEngine Component
 * 
 * This component provides comprehensive regulatory compliance validation
 * for Clinical Evaluation Reports against multiple international frameworks
 * using GPT-4o AI-powered analysis.
 * 
 * It performs detailed verification of document completeness, reference integrity,
 * and regulatory compliance with EU MDR (MEDDEV 2.7/1 Rev 4), FDA, UKCA,
 * Health Canada, and ICH requirements.
 * 
 * The system connects directly to regulatory guidelines without simulated data,
 * ensuring accurate and up-to-date compliance checking.
 */

import React, { useState, useEffect } from 'react';
import { cerApiService } from '@/services/CerAPIService';
import { cerValidationService } from '@/services/CerValidationService';
import { cerAiValidationService } from '@/services/CerAiValidationService';
import axios from 'axios';
import QmpIntegrationHelp from './QmpIntegrationHelp';
import CerValidationPanel from './CerValidationPanel';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  BookOpen,
  Gauge,
  RefreshCw,
  ClipboardList,
  Shield,
  Download,
  Braces,
  User,
  BrainCircuit,
  Eye,
  CornerDownRight,
  Sparkles
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Switch
} from '@/components/ui/switch';
import {
  Label
} from '@/components/ui/label';
import {
  Input
} from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

const ValidationEngine = ({ documentId, sections = [], onValidationComplete }) => {
  const [validationData, setValidationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFramework, setSelectedFramework] = useState('mdr');
  const [cerSections, setCerSections] = useState([]);
  const [validationMode, setValidationMode] = useState('standard'); // 'standard' or 'enhanced'
  const [enhancedValidationResults, setEnhancedValidationResults] = useState(null);
  const [qmpAssessment, setQmpAssessment] = useState(null);
  const [isLoadingQmpData, setIsLoadingQmpData] = useState(false);
  const [qmpIntegrationEnabled, setQmpIntegrationEnabled] = useState(true); // Default to enabled
  const [activeFilter, setActiveFilter] = useState('all'); // Filter for validation issues
  const { toast } = useToast();
  
  // Update cerSections when sections prop changes
  useEffect(() => {
    setCerSections(sections);
  }, [sections]);

  // Maps validation severities to UI elements
  const severityMap = {
    critical: {
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      badge: <Badge variant="destructive">Critical</Badge>,
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    major: {
      icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
      badge: <Badge variant="warning">Major</Badge>,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50'
    },
    minor: {
      icon: <FileCheck className="h-5 w-5 text-blue-500" />,
      badge: <Badge variant="outline">Minor</Badge>,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    }
  };

  // Maps category names to UI elements
  const categoryMap = {
    regulatory_compliance: {
      name: 'Regulatory Compliance',
      icon: <Shield className="h-5 w-5" />
    },
    completeness: {
      name: 'Document Completeness',
      icon: <ClipboardList className="h-5 w-5" />
    },
    references: {
      name: 'Reference Verification',
      icon: <BookOpen className="h-5 w-5" />
    },
    consistency: {
      name: 'Internal Consistency',
      icon: <FileCheck className="h-5 w-5" />
    },
    qms_quality: {
      name: 'QMS Integration',
      icon: <Gauge className="h-5 w-5" />
    },
    risk_assessment: {
      name: 'Risk Assessment',
      icon: <AlertTriangle className="h-5 w-5" />
    },
    data_integrity: {
      name: 'Data Integrity',
      icon: <Braces className="h-5 w-5" />
    },
    ich_compliance: {
      name: 'ICH E6(R3) Compliance',
      icon: <Sparkles className="h-5 w-5" />
    }
  };

  // Framework display names
  const frameworkNames = {
    mdr: 'EU MDR',
    fda: 'US FDA',
    ukca: 'UKCA',
    health_canada: 'Health Canada',
    ich: 'ICH'
  };

  // Run validation when framework changes
  useEffect(() => {
    if (documentId) {
      runValidation();
    }
  }, [documentId, selectedFramework]);
  
  // Fetch QMP data for validation integration
  const fetchQmpAssessment = async () => {
    try {
      setIsLoadingQmpData(true);
      
      // Fetch QMP data from the API
      const response = await axios.get(`/api/qmp?documentId=${documentId}`);
      
      if (response.data && response.data.success) {
        setQmpAssessment(response.data.data);
        return response.data.data;
      } else {
        console.warn('QMP data not available:', response.data.message);
        return null;
      }
    } catch (error) {
      console.error('Error fetching QMP data:', error);
      toast({
        title: 'QMP Integration Warning',
        description: 'Unable to fetch Quality Management Plan data. Some validation checks may be limited.',
        variant: 'warning'
      });
      return null;
    } finally {
      setIsLoadingQmpData(false);
    }
  };

  // Run validation with selected framework
  const runValidation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let data;
      let qmpData = null;
      
      // Fetch QMP data if integration is enabled
      if (qmpIntegrationEnabled) {
        qmpData = await fetchQmpAssessment();
      }
      
      // Choose validation method based on mode
      if (validationMode === 'enhanced') {
        // Enhanced AI validation with advanced hallucination detection
        console.log('Running enhanced AI validation with GPT-4o...');
        
        // Get document data from all sections
        const cerDocument = {
          id: documentId,
          sections: cerSections,
          qmpData: qmpData, // Include QMP data for ICH E6(R3) risk-based quality assessment
          // Add additional document metadata as available
        };
        
        // Use AI validation service for enhanced checking
        data = await cerAiValidationService.validateWithAI(cerDocument, selectedFramework);
        
        // Store enhanced results separately
        setEnhancedValidationResults(data);
      } else {
        // Standard validation
        console.log('Running standard validation...');
        
        // Include QMP data in the validation request if available
        const additionalParams = qmpData ? { qmpData } : {};
        
        data = await cerApiService.validateCERDocument(
          documentId, 
          selectedFramework,
          cerSections, // Send document sections for AI validation
          additionalParams
        );
      }
      
      // Add Quality Management Plan integration data if enabled
      if (qmpIntegrationEnabled && qmpData) {
        // Add QMP validation category if not already present
        if (!data.categories.qms_quality) {
          data.categories.qms_quality = { passed: 0, failed: 0, total: 0 };
        }
        
        // Enhance validation results with QMP data
        const qmpIssues = await processQmpRisks(qmpData, data);
        
        // Add QMP-based validation issues to results
        data.issues = [...data.issues, ...qmpIssues];
        
        // Update category counts
        data.categories.qms_quality.total = qmpIssues.length;
        data.categories.qms_quality.failed = qmpIssues.filter(issue => issue.severity === 'critical' || issue.severity === 'major').length;
        data.categories.qms_quality.passed = qmpIssues.filter(issue => issue.severity === 'minor' || issue.status === 'passed').length;
        
        // Update total issues count
        data.summary.totalIssues += qmpIssues.filter(issue => issue.status !== 'passed').length;
        data.summary.criticalIssues += qmpIssues.filter(issue => issue.severity === 'critical').length;
        data.summary.majorIssues += qmpIssues.filter(issue => issue.severity === 'major').length;
        data.summary.minorIssues += qmpIssues.filter(issue => issue.severity === 'minor').length;
        
        // Update compliance score (basic calculation)
        const totalChecks = Object.values(data.categories).reduce((sum, cat) => sum + cat.total, 0);
        const passedChecks = Object.values(data.categories).reduce((sum, cat) => sum + cat.passed, 0);
        data.summary.complianceScore = Math.round((passedChecks / totalChecks) * 100) || 0;
      }
      
      setValidationData(data);
      
      if (onValidationComplete) {
        onValidationComplete(data);
      }
      
      // Determine validation method for message
      let validationMethod = validationMode === 'enhanced' ? 'Enhanced GPT-4o AI' : 
        (data.validationMethod === 'ai' ? 'GPT-4o AI-Powered' : 'Standard');
      
      // Add QMP tag if QMP integration is enabled
      if (qmpIntegrationEnabled && qmpData) {
        validationMethod = `${validationMethod} with ICH E6(R3) QMS`;
      }
      
      // Display toast based on validation results
      if (data.summary.criticalIssues > 0) {
        toast({
          title: `${validationMethod} Validation: ${data.summary.criticalIssues} Critical Issues Found`,
          description: 'Your document has critical compliance issues that must be addressed.',
          variant: 'destructive'
        });
      } else if (data.summary.totalIssues === 0) {
        toast({
          title: `${validationMethod} Validation Successful`,
          description: 'Your document passed all validation checks against the selected regulatory framework.',
          variant: 'success'
        });
      } else {
        toast({
          title: `${validationMethod} Validation: ${data.summary.totalIssues} Issues Found`,
          description: 'Your document has compliance issues that should be reviewed.',
          variant: 'warning'
        });
      }
    } catch (err) {
      console.error('Validation error:', err);
      setError(err.message || 'Error running validation');
      
      toast({
        title: 'Validation Error',
        description: err.message || 'An error occurred while validating your document',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Process QMP risks and convert them to validation issues
  const processQmpRisks = async (qmpData, validationData) => {
    if (!qmpData || !qmpData.riskAssessments || qmpData.riskAssessments.length === 0) {
      return [];
    }
    
    // Map QMP risk levels to validation severities
    const riskToSeverity = {
      high: 'critical',
      medium: 'major',
      low: 'minor'
    };
    
    // Convert QMP risks to validation issues
    const qmpIssues = qmpData.riskAssessments.map(risk => {
      // Only create issues for risks that aren't adequately controlled
      if (risk.mitigated || risk.controlStatus === 'complete') {
        return {
          id: `qmp-${risk.id}`,
          title: `QMS: ${risk.title}`,
          description: `Risk adequately controlled through: ${risk.mitigationStrategy || 'Appropriate controls'}`,
          category: 'qms_quality',
          severity: 'minor',
          status: 'passed',
          section: risk.applicableSection || 'General',
          impacts: risk.impactedProcess ? [risk.impactedProcess] : [],
          remediation: 'No action needed'
        };
      }
      
      // Create validation issues for unmitigated risks
      return {
        id: `qmp-${risk.id}`,
        title: `QMS: ${risk.title}`,
        description: risk.description || `Unmitigated quality risk in "${risk.applicableSection || 'General'}" section`,
        category: 'qms_quality',
        severity: riskToSeverity[risk.riskLevel] || 'major',
        status: 'failed',
        section: risk.applicableSection || 'General',
        impacts: risk.impactedProcess ? [risk.impactedProcess] : [],
        remediation: risk.mitigationStrategy || 'Implement appropriate controls based on ICH E6(R3) requirements'
      };
    });
    
    // If using enhanced validation, use AI to enhance QMP issue descriptions
    if (validationMode === 'enhanced' && qmpIssues.length > 0) {
      try {
        // Format the QMP issues to send to AI service
        const enhancementData = {
          documentId: documentId,
          framework: selectedFramework,
          qmpIssues: qmpIssues,
          regulatoryContext: validationData.framework || 'mdr'
        };
        
        // Call AI service to enhance QMP issue descriptions
        const response = await axios.post('/api/qmp/enhance-issues', enhancementData);
        
        if (response.data && response.data.success && response.data.enhancedIssues) {
          return response.data.enhancedIssues;
        }
      } catch (error) {
        console.warn('Error enhancing QMP issues with AI:', error);
      }
    }
    
    return qmpIssues;
  };
  
  // Submit document for human review
  const submitForHumanReview = async (reviewerEmail) => {
    try {
      setLoading(true);
      
      // Create document object
      const cerDocument = {
        id: documentId,
        sections: cerSections,
        // Add additional document metadata
      };
      
      // Use validation results if available, otherwise run validation
      const validationResults = validationData || await cerValidationService.validateCompleteCER(
        cerDocument, 
        selectedFramework, 
        validationMode === 'enhanced'
      );
      
      // Submit for human review
      const result = await cerValidationService.submitForHumanReview(
        cerDocument,
        validationResults,
        reviewerEmail
      );
      
      if (result.success) {
        toast({
          title: 'Review Request Submitted',
          description: `Your document has been submitted for review to ${reviewerEmail}`,
          variant: 'success'
        });
      } else {
        toast({
          title: 'Review Request Failed',
          description: result.error || 'Unable to submit review request',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error submitting for review:', error);
      toast({
        title: 'Review Request Failed',
        description: error.message || 'An error occurred while submitting for review',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate compliance score display
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };
  
  // Progress bar color based on status
  const getProgressColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-amber-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  // Rendering loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-6 w-5/6" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-28" />
          </CardFooter>
        </Card>
        
        <div className="text-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-lg font-medium">Validating document against {frameworkNames[selectedFramework]} requirements...</p>
          <p className="text-sm text-muted-foreground my-2">
            AI-powered validation with GPT-4o is analyzing your content in real-time
          </p>
          <div className="max-w-md mx-auto mt-6 space-y-2">
            <div className="flex justify-between mb-1">
              <span className="text-xs font-medium text-primary">AI Analysis Progress</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div className="bg-primary h-2.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
            <ul className="text-xs text-left space-y-2 mt-4 bg-gray-50 p-3 rounded-md border">
              <li className="flex items-center">
                <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-2" /> 
                <span>Loading document sections</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-2" /> 
                <span>Identifying regulatory framework requirements</span>
              </li>
              <li className="flex items-center opacity-70">
                <RefreshCw className="h-3.5 w-3.5 text-primary mr-2 animate-spin" /> 
                <span>Analyzing content against {frameworkNames[selectedFramework]} requirements</span>
              </li>
              {qmpIntegrationEnabled && (
                <li className="flex items-center opacity-70">
                  <RefreshCw className="h-3.5 w-3.5 text-[#E3008C] mr-2 animate-spin" /> 
                  <span>Integrating ICH E6(R3) Quality Management System data</span>
                </li>
              )}
              <li className="flex items-center opacity-50">
                <div className="h-3.5 w-3.5 rounded-full border border-gray-300 mr-2"></div>
                <span>Generating detailed compliance report</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Rendering error state
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            Validation Error
          </CardTitle>
          <CardDescription className="text-red-600">
            An error occurred while validating your document
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-800 font-mono text-sm bg-red-100 p-3 rounded">{error}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={runValidation} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Main validation results rendering
  return (
    <div className="space-y-4">
      {/* Framework selector and validation mode */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-1">Regulatory Validation</h2>
          <p className="text-muted-foreground">
            Validate your CER against international regulatory requirements
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="flex flex-col xs:flex-row gap-2">
            <div className="flex gap-2 items-center bg-slate-50 border rounded-md px-2 py-1 h-10">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="validation-mode" 
                  checked={validationMode === 'enhanced'}
                  onCheckedChange={(checked) => setValidationMode(checked ? 'enhanced' : 'standard')}
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label htmlFor="validation-mode" className="cursor-pointer flex items-center">
                        <span className="mr-1">Enhanced Validation</span>
                        <BrainCircuit className="h-4 w-4 text-blue-500" />
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        Enhanced validation uses GPT-4o AI to perform in-depth checks for hallucinated citations, 
                        factual accuracy verification, and regulatory compliance testing that goes beyond standard validation.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            <div className="flex gap-2 items-center bg-slate-50 border rounded-md px-2 py-1 h-10">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="qmp-integration" 
                  checked={qmpIntegrationEnabled}
                  onCheckedChange={(checked) => setQmpIntegrationEnabled(checked)}
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label htmlFor="qmp-integration" className="cursor-pointer flex items-center">
                        <span className="mr-1">QMS Integration</span>
                        <Gauge className="h-4 w-4 text-[#E3008C]" />
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        Integrate Quality Management Plan risk assessment data into the validation process,
                        enabling ICH E6(R3) risk-based quality monitoring across all phases of CER development.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="link" 
                    className="text-xs p-0 h-auto text-[#E3008C]" 
                    size="sm"
                  >
                    Learn More
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <QmpIntegrationHelp onClose={() => document.querySelector('[data-state="open"][role="dialog"] button[aria-label="Close"]').click()} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <select 
            value={selectedFramework}
            onChange={(e) => setSelectedFramework(e.target.value)}
            className="rounded-md border border-input h-10 px-3 py-2 text-sm"
          >
            <option value="mdr">EU MDR</option>
            <option value="fda">US FDA</option>
            <option value="ukca">UKCA</option>
            <option value="health_canada">Health Canada</option>
            <option value="ich">ICH</option>
          </select>
          
          <Button onClick={runValidation} className="gap-2 bg-[#0F6CBD]">
            <RefreshCw className="h-4 w-4" />
            Run Validation
          </Button>
          
          {validationData && (
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  if (onValidationComplete) {
                    const validationSummary = {
                      title: "Regulatory Validation Report",
                      type: "validation-report",
                      content: {
                        framework: frameworkNames[selectedFramework],
                        validationMode: validationMode,
                        score: validationData.summary.complianceScore,
                        issues: validationData.issues,
                        summary: validationData.summary
                      },
                      lastUpdated: new Date().toISOString()
                    };
                    
                    onValidationComplete(validationSummary, true);
                    
                    toast({
                      title: "Validation Report Added",
                      description: `Validation report for ${frameworkNames[selectedFramework]} has been added to your CER`,
                      variant: "success"
                    });
                  }
                }}
                variant="outline" 
                className="gap-2 border-[#0F6CBD] text-[#0F6CBD]"
              >
                Add to CER
              </Button>
              
              {/* Human Review Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <User className="h-4 w-4" />
                    Human Review
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Request Human Review</DialogTitle>
                    <DialogDescription>
                      Submit this document for review by a regulatory expert to verify AI-generated content before finalization.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="reviewer-email" className="text-right">
                        Reviewer Email
                      </Label>
                      <Input
                        id="reviewer-email"
                        type="email"
                        placeholder="reviewer@example.com"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="priority" className="text-right">
                        Priority
                      </Label>
                      <select
                        id="priority"
                        className="col-span-3 rounded-md border border-input h-10 px-3 py-2 text-sm"
                      >
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="review-notes" className="text-right">
                        Notes
                      </Label>
                      <Input
                        id="review-notes"
                        placeholder="Any specific concerns or areas to focus on"
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      className="gap-2"
                      onClick={() => {
                        const reviewerEmail = document.getElementById('reviewer-email').value;
                        if (reviewerEmail) {
                          submitForHumanReview(reviewerEmail);
                        } else {
                          toast({
                            title: "Missing Information",
                            description: "Please enter the reviewer's email address",
                            variant: "destructive"
                          });
                        }
                      }}
                    >
                      <User className="h-4 w-4" />
                      Submit for Review
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>
      
      {/* Validation results */}
      {validationData && (
        <div className="space-y-6">
          {/* Summary card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  Validation Summary
                  {validationData.aiValidated && (
                    <span className="px-2 py-1 rounded-full text-xs bg-[#0F6CBD] text-white">
                      GPT-4o AI Powered
                    </span>
                  )}
                </span>
                
                <span className={`font-bold ${getScoreColor(validationData.summary.complianceScore)}`}>
                  <Gauge className="inline-block mr-2 h-5 w-5" />
                  {validationData.summary.complianceScore}% Compliance
                </span>
              </CardTitle>
              <CardDescription>
                {validationData.summary.totalIssues === 0 
                  ? 'Your document passed all validation checks' 
                  : `${validationData.summary.totalIssues} issues found during validation`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="flex flex-col items-center p-4 rounded-lg border bg-background">
                  <span className="text-3xl font-bold mb-1 text-red-600">
                    {validationData.summary.criticalIssues}
                  </span>
                  <span className="text-sm text-muted-foreground">Critical Issues</span>
                </div>
                <div className="flex flex-col items-center p-4 rounded-lg border bg-background">
                  <span className="text-3xl font-bold mb-1 text-amber-600">
                    {validationData.summary.majorIssues}
                  </span>
                  <span className="text-sm text-muted-foreground">Major Issues</span>
                </div>
                <div className="flex flex-col items-center p-4 rounded-lg border bg-background">
                  <span className="text-3xl font-bold mb-1 text-blue-600">
                    {validationData.summary.minorIssues}
                  </span>
                  <span className="text-sm text-muted-foreground">Minor Issues</span>
                </div>
                <div className="flex flex-col items-center p-4 rounded-lg border bg-background">
                  <span className="text-3xl font-bold mb-1 text-green-600">
                    {validationData.summary.passedChecks}
                  </span>
                  <span className="text-sm text-muted-foreground">Passed Checks</span>
                </div>
              </div>
              
              {/* Category progress bars */}
              <div className="space-y-4">
                {Object.entries(validationData.categories).map(([key, category]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {categoryMap[key]?.icon}
                        <span className="font-medium">{categoryMap[key]?.name || key}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-green-600 font-medium">{category.passed} Passed</span>
                        <span className="mx-1">•</span>
                        <span className="text-red-600 font-medium">{category.failed} Failed</span>
                      </div>
                    </div>
                    <Progress 
                      value={(category.passed / (category.passed + category.failed)) * 100} 
                      className={`h-2 ${getProgressColor(category.status)}`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export Validation Report
              </Button>
            </CardFooter>
          </Card>
          
          {/* Enhanced AI Analysis Results - only shown when validationMode is enhanced and we have enhanced results */}
          {validationMode === 'enhanced' && validationData.hallucinations && (
            <Card className="border-[#E3008C] border-2">
              <CardHeader className="bg-[#FCF2F8]">
                <CardTitle className="text-[#E3008C] flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5" />
                  AI Hallucination Detection
                </CardTitle>
                <CardDescription>
                  Enhanced GPT-4o AI analysis to catch potential hallucinations and fabricated references
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {validationData.hallucinations.length === 0 ? (
                  <div className="flex items-center justify-center py-6 text-center bg-green-50 rounded-md border border-green-100">
                    <div>
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                      <p className="font-medium text-green-700">No hallucinations detected</p>
                      <p className="text-sm text-green-600 mt-1">
                        All content appears to be factually accurate and properly cited
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-[#FCF2F8] p-4 rounded-md border border-[#E3008C]">
                      <p className="font-medium text-[#E3008C] mb-2 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Potential AI Hallucinations Detected
                      </p>
                      <p className="text-sm">
                        {validationData.hallucinations.length} potential hallucinations were identified. These are sections where AI may have
                        generated content that is not supported by evidence or references.
                      </p>
                    </div>
                    
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                      {validationData.hallucinations.map((hallucination, index) => (
                        <div 
                          key={index} 
                          className="bg-white border rounded-md p-3 shadow-sm"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2 font-medium text-red-600 mb-1">
                              <AlertTriangle className="h-4 w-4" />
                              Potential Hallucination ({Math.round(hallucination.confidence * 100)}% confidence)
                            </div>
                            <Badge variant="outline" className="text-[#E3008C] border-[#E3008C]">
                              {hallucination.location}
                            </Badge>
                          </div>
                          <div className="text-sm border-l-2 border-red-200 pl-3 py-1 my-2 bg-red-50">
                            "{hallucination.text}"
                          </div>
                          <div className="text-xs text-gray-600">
                            <span className="font-medium">Reason:</span> {hallucination.details}
                          </div>
                          {hallucination.suggestedCorrection && (
                            <div className="mt-2 pt-2 border-t text-xs">
                              <span className="font-medium text-green-600">Suggested correction:</span>
                              <div className="border-l-2 border-green-200 pl-3 py-1 mt-1 bg-green-50">
                                {hallucination.suggestedCorrection}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        
          {/* Issues list */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Validation Issues</CardTitle>
                  <CardDescription>
                    {validationData.issues.length === 0 
                      ? 'No issues were found during validation' 
                      : `${validationData.issues.length} issues require attention`}
                  </CardDescription>
                </div>
                
                {/* ICH E6(R3) tag if QMP integration is enabled */}
                {qmpIntegrationEnabled && (
                  <Badge className="bg-[#FDF2F8] hover:bg-[#FDF2F8] text-[#E3008C] border border-[#E3008C]">
                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                    ICH E6(R3) Integrated
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* QMP integration banner */}
              {qmpIntegrationEnabled && (
                <div className="mb-4 p-3 bg-[#FDF2F8] border border-[#E3008C] rounded-md">
                  <div className="flex items-start gap-2">
                    <Gauge className="h-5 w-5 text-[#E3008C] mt-0.5" />
                    <div>
                      <h4 className="font-medium text-[#E3008C]">Quality Management Plan Integration</h4>
                      <p className="text-sm text-gray-600">
                        ICH E6(R3) risk-based quality monitoring has been integrated into the validation process.
                        Critical-to-Quality (CtQ) factors are being tracked across all phases of document development.
                      </p>
                      {activeFilter === 'qms_quality' && (
                        <div className="mt-2 p-2 bg-white border border-[#E3008C] rounded text-sm">
                          <span className="font-medium text-[#E3008C]">Currently showing: </span>
                          Only QMS-related validation issues based on ICH E6(R3) risk assessment
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Filter by category buttons */}
              {validationData.issues.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button
                    variant={activeFilter === 'all' ? 'default' : 'outline'}
                    onClick={() => setActiveFilter('all')}
                    className="text-xs h-8"
                  >
                    All Issues
                  </Button>
                  
                  {Object.keys(validationData.categories).map((category) => (
                    <Button
                      key={category}
                      variant={activeFilter === category ? 'default' : 'outline'}
                      onClick={() => setActiveFilter(category)}
                      className={`text-xs h-8 gap-1 ${category === 'qms_quality' || category === 'ich_compliance' ? 'border-[#E3008C] text-[#E3008C] hover:bg-[#FDF2F8] hover:text-[#E3008C]' : ''}`}
                    >
                      {categoryMap[category]?.icon}
                      {categoryMap[category]?.name || category}
                      {(category === 'qms_quality' || category === 'ich_compliance') && (
                        <Badge variant="outline" className="ml-1 bg-[#FDF2F8] text-[#E3008C] border-[#E3008C] text-[10px]">
                          ICH E6(R3)
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              )}
              
              {validationData.issues.length === 0 ? (
                <div className="text-center py-10">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <h3 className="text-xl font-medium text-green-700 mb-1">All Validation Checks Passed</h3>
                  <p className="text-muted-foreground">
                    Your document complies with {frameworkNames[selectedFramework]} requirements
                    {qmpIntegrationEnabled && " including ICH E6(R3) Quality Management standards"}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Severity</TableHead>
                      <TableHead>Issue</TableHead>
                      <TableHead className="w-[120px]">Location</TableHead>
                      <TableHead className="w-[180px]">Category</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validationData.issues
                      .filter(issue => activeFilter === 'all' || issue.category === activeFilter)
                      .map((issue) => (
                        <TableRow key={issue.id} className={severityMap[issue.severity]?.bgColor}>
                          <TableCell>
                            {severityMap[issue.severity]?.badge}
                          </TableCell>
                        <TableCell>
                          <div className="font-medium">{issue.message}</div>
                          <div className="text-sm text-muted-foreground mt-1">{issue.suggestion}</div>
                        </TableCell>
                        <TableCell>{issue.location}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {categoryMap[issue.category]?.icon}
                            <span className="text-sm">{categoryMap[issue.category]?.name || issue.category}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ValidationEngine;