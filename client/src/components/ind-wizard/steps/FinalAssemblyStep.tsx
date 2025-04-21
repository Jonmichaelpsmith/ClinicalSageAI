// src/components/ind-wizard/steps/FinalAssemblyStep.tsx
/**
 * PRODUCTION-LOCKED: FinalAssemblyStep Component (v1.0)
 * 
 * Core IND module for final submission assembly and validation.
 * Features comprehensive AI-driven checks and validation before submission.
 * 
 * Features:
 * - AI Cross-Reference Validation
 * - AI Technical Validation
 * - AI eCTD Structure Check
 * - Submission Risk Assessment
 * - Integrated Section Status Display
 * 
 * © 2025 Concept2Cures.AI - All Rights Reserved
 */
import React, { useState, useMemo, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form'; 
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { useWizard } from '../IndWizardLayout'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Bot, HelpCircle, Loader2, Sparkles, FileText, CheckCircle2, AlertCircle, Search, Link2, Recycle, Send, ListTodo, Network, FileCheck, GanttChartSquare, ExternalLink, ShieldAlert, BarChart3, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

// --- API Simulation/Types ---
const apiInitiateSubmission = async (indData: any): Promise<{ success: boolean; submissionId?: string; message: string }> => {
    console.log('API CALL: Initiating IND Submission...', indData);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { success: true, submissionId: `IND-${Math.floor(Math.random() * 100000)}`, message: "IND submission initiated successfully." };
};

type FinalCheckStatus = 'pending' | 'running' | 'passed' | 'warnings' | 'failed';
interface CheckDetail {
    section: string; // e.g., 'CMC', 'Form 1571', 'eCTD Structure M1'
    issue: string;
    severity: 'warning' | 'error';
    guidelineRef?: { text: string; url: string }; // Added guideline reference
}
interface FinalCheckResult {
    status: FinalCheckStatus;
    summary: string;
    details?: CheckDetail[];
    // Add conceptual risk score/level
    riskLevel?: 'Low' | 'Medium' | 'High';
    riskReasoning?: string;
}

// Enhanced AI Check Simulation
const apiTriggerFinalAiChecks = async (type: 'cross_reference' | 'technical_validation' | 'ectd_structure', indData: any): Promise<FinalCheckResult> => {
    console.log(`API CALL: Triggering Final AI Check (${type})...`, indData);
    await new Promise(resolve => setTimeout(resolve, 2500 + Math.random() * 1000)); // Simulate longer check

    let status: FinalCheckStatus = 'passed';
    let summary = `AI Check (${type.replace('_', ' ')}) indicates consistency and adherence.`;
    let details: CheckDetail[] = [];
    let riskLevel: FinalCheckResult['riskLevel'] = 'Low';
    let riskReasoning = 'No major issues detected.';

    // Simulate finding issues based on type and context (indData)
    const hasCmcData = !!indData.cmcData; // Example context check
    const hasClinicalData = !!indData.clinicalProtocolData;
    const linkedProtocols = indData.fdaFormsData?.form1571?.protocolLinks?.length || 0;

    if (type === 'cross_reference') {
        if (Math.random() < 0.3 || linkedProtocols === 0 && hasClinicalData) {
            status = 'warnings';
            summary = `AI found potential cross-referencing warnings.`;
            riskLevel = 'Medium';
            riskReasoning = 'Potential inconsistencies in references detected.';
            details.push({ section: 'Protocol/Form 1571', issue: `Protocol defined in Clinical Step ${hasClinicalData ? 'exists' : 'missing'} but ${linkedProtocols} linked on Form 1571. Verify linkage.`, severity: 'warning', guidelineRef: { text: 'IND Content Req.', url: '#' } });
            if (Math.random() < 0.2) {
                 details.push({ section: 'IB/Nonclinical', issue: 'Nonclinical study NC-002 mentioned in IB summary but not found in Nonclinical study list.', severity: 'warning' });
            }
        }
    } else if (type === 'technical_validation') {
         if (!hasCmcData || Math.random() < 0.2) {
            status = 'warnings';
            summary = `AI found potential technical validation warnings.`;
            riskLevel = 'Medium';
            riskReasoning = 'Potential formatting or completeness issues based on standard requirements.';
            details.push({ section: 'CMC', issue: 'Stability data summary appears incomplete for required timepoints (based on Phase).', severity: 'warning', guidelineRef: { text: 'ICH Q1A', url: '#' } });
         }
    } else if (type === 'ectd_structure') {
         summary = `AI analyzed data against eCTD structure requirements.`;
         if (Math.random() < 0.25) {
             status = 'warnings';
             riskLevel = 'Medium';
             summary = `AI suggests potential eCTD structure/placement warnings.`;
             riskReasoning = 'Some data may not align perfectly with standard eCTD module placement.';
             details.push({ section: 'eCTD M3 (Quality)', issue: 'Detailed batch analysis data seems sparse for Module 3.2.P.5.', severity: 'warning', guidelineRef: { text: 'ICH M4Q', url: '#' } });
         }
         if (!hasClinicalData && status !== 'failed') { // Example check
             status = status === 'passed' ? 'warnings' : status; // Don't override failed
             riskLevel = 'Medium';
             summary += ` Clinical protocol section (M5) appears missing or incomplete.`;
             details.push({ section: 'eCTD M5 (Clinical)', issue: 'No clinical protocol data found to populate Module 5.', severity: 'warning' });
         }
    }

    // Simulate critical failure
     if (Math.random() < 0.05) {
        status = 'failed';
        summary = `AI found critical ${type} errors that likely block submission.`;
        riskLevel = 'High';
        riskReasoning = 'Critical inconsistencies or missing required elements detected.';
        details.push({ section: 'Form 1571/CMC', issue: 'Critical Mismatch: Product name discrepancy prevents validation.', severity: 'error', guidelineRef: { text: '21 CFR 312.23', url: '#' } });
     }

    return { status, summary, details, riskLevel, riskReasoning };
};

// --- Zod Schema Definition ---
const finalAssemblyChecklistSchema = z.object({
  crossReferencesVerified: z.boolean().default(false),
  technicalValidationPassed: z.boolean().default(false),
  aiChecksPerformed: z.boolean().default(false),
  submissionReadyConfirmed: z.boolean().default(false)
});
export type FinalAssemblyChecklistFormData = z.infer<typeof finalAssemblyChecklistSchema>;

// --- Component Implementation ---
export default function FinalAssemblyStep() {
  const { indData } = useWizard();
  const queryClient = useQueryClient();

  // State for AI checks
  const [isAiChecking, setIsAiChecking] = useState(false);
  const [aiCheckType, setAiCheckType] = useState<'cross_reference' | 'technical_validation' | 'ectd_structure' | null>(null);
  const [crossRefResult, setCrossRefResult] = useState<FinalCheckResult | null>(null);
  const [techValResult, setTechValResult] = useState<FinalCheckResult | null>(null);
  const [ectdCheckResult, setEctdCheckResult] = useState<FinalCheckResult | null>(null); // State for eCTD check

  // State for submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form for checklist
  const form = useForm<FinalAssemblyChecklistFormData>({
    resolver: zodResolver(finalAssemblyChecklistSchema),
    defaultValues: {
      crossReferencesVerified: false,
      technicalValidationPassed: false,
      aiChecksPerformed: false,
      submissionReadyConfirmed: false
    }
  });

  // --- Data Mutation (Final Submission) ---
  const submissionMutation = useMutation({
    mutationFn: apiInitiateSubmission,
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message + (data.submissionId ? ` Submission ID: ${data.submissionId}` : ""),
      });
      // Would typically navigate to a confirmation screen or back to dashboard
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to initiate IND submission",
        variant: "destructive",
      });
    }
  });

  function handleFinalSubmit() {
    // Ensure no checks have failed status
    if (crossRefResult?.status === 'failed' || techValResult?.status === 'failed' || ectdCheckResult?.status === 'failed') {
      return toast({
        title: "Cannot Submit",
        description: "One or more checks have failed. Please resolve issues before submitting.",
        variant: "destructive",
      });
    }
    
    setIsSubmitting(true);
    try {
      submissionMutation.mutate(indData);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  // --- AI Interaction ---
  const runFinalAiCheck = async (type: 'cross_reference' | 'technical_validation' | 'ectd_structure') => {
      setIsAiChecking(true);
      setAiCheckType(type);
      // Reset specific result state
      if (type === 'cross_reference') setCrossRefResult({ status: 'running', summary: 'Running check...' });
      if (type === 'technical_validation') setTechValResult({ status: 'running', summary: 'Running check...' });
      if (type === 'ectd_structure') setEctdCheckResult({ status: 'running', summary: 'Running check...' });

      try {
          const result = await apiTriggerFinalAiChecks(type, indData);
          // Update specific result state
          if (type === 'cross_reference') { setCrossRefResult(result); form.setValue('crossReferencesVerified', result.status === 'passed' || result.status === 'warnings'); }
          if (type === 'technical_validation') { setTechValResult(result); form.setValue('technicalValidationPassed', result.status === 'passed' || result.status === 'warnings'); }
          if (type === 'ectd_structure') { setEctdCheckResult(result); } // Update eCTD result state

          form.setValue('aiChecksPerformed', true);
          toast({title: `AI Check Complete: ${type.replace('_', ' ')}`, description: result.summary});
      } catch (error: any) {
          toast({ title: `AI Check Failed`, description: error.message || "Could not perform check.", variant: "destructive" });
          // Update specific result state to failed
          const failureResult = { status: 'failed' as FinalCheckStatus, summary: 'Check failed to run.' };
          if (type === 'cross_reference') setCrossRefResult(failureResult);
          if (type === 'technical_validation') setTechValResult(failureResult);
          if (type === 'ectd_structure') setEctdCheckResult(failureResult);
      } finally {
          setIsAiChecking(false);
          setAiCheckType(null);
      }
  };

  // --- Calculate Overall Readiness & Section Statuses (Conceptual) ---
  const overallProgress = useMemo(() => {
    const { crossReferencesVerified, technicalValidationPassed, aiChecksPerformed, submissionReadyConfirmed } = form.watch();
    let percentage = 0;
    if (crossReferencesVerified) percentage += 25;
    if (technicalValidationPassed) percentage += 25;
    if (aiChecksPerformed) percentage += 25;
    if (submissionReadyConfirmed) percentage += 25;
    return percentage;
  }, [form.watch()]);

  // Simulate fetching section statuses (replace with actual logic reading indData/validation results)
  const sectionStatuses = useMemo(() => ({
      preInd: 'complete',
      nonclinical: 'complete',
      cmc: 'warnings', // Example status
      clinicalProtocol: 'complete',
      ib: 'complete',
      fdaForms: 'warnings', // Example status
  }), [indData]); // Recalculate if indData changes

  // --- Render Helpers ---
  const renderCheckResult = (result: FinalCheckResult | null, typeLabel: string) => {
      if (!result) return <p className="text-sm text-muted-foreground">Run AI {typeLabel} check...</p>;
      
      const badgeVariant = result.status === 'passed' ? 'outline' : 'secondary';
      const badgeColor = 
        result.status === 'passed' ? 'text-green-600' :
        result.status === 'warnings' ? 'text-yellow-600' :
        result.status === 'failed' ? 'text-red-600' :
        result.status === 'running' ? 'text-blue-600' : 'text-gray-600';
      
      const statusText = 
        result.status === 'passed' ? 'PASSED' :
        result.status === 'warnings' ? 'WARNINGS' :
        result.status === 'failed' ? 'FAILED' :
        result.status === 'running' ? 'RUNNING' : 'PENDING';
      
      return (
          <div className="space-y-2">
              <div className="flex items-center">
                  <Badge variant={badgeVariant} className={`mr-2 ${badgeColor}`}>
                      {result.status === 'running' && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                      {result.status === 'passed' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                      {result.status === 'warnings' && <AlertCircle className="mr-1 h-3 w-3" />}
                      {result.status === 'failed' && <AlertCircle className="mr-1 h-3 w-3" />}
                      {statusText}
                  </Badge>
                  <span className="text-sm">{result.summary}</span>
              </div>
              {result.details && result.details.length > 0 && (
                  <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                          <AccordionTrigger className="text-xs py-1">View Details ({result.details.length})</AccordionTrigger>
                          <AccordionContent className="text-xs space-y-1 bg-muted/50 p-2 rounded">
                              {result.details.map((detail, index) => (
                                  <div key={index} className={detail.severity === 'error' ? 'text-red-600' : 'text-yellow-700'}>
                                      <strong>[{detail.section}]</strong> {detail.issue}
                                      {detail.guidelineRef && (
                                          <a href={detail.guidelineRef.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1 opacity-80">
                                              ({detail.guidelineRef.text} <ExternalLink className="inline h-3 w-3"/>)
                                          </a>
                                      )}
                                  </div>
                              ))}
                          </AccordionContent>
                      </AccordionItem>
                  </Accordion>
              )}
          </div>
      );
  };

  const renderSectionStatus = (status: string) => {
      let Icon = AlertCircle;
      let color = "text-gray-500";
      let text = "Unknown";
      
      if (status === 'complete') { Icon = CheckCircle2; color = "text-green-600"; text = "Complete"; }
      if (status === 'warnings') { Icon = AlertCircle; color = "text-yellow-600"; text = "Warnings"; }
      if (status === 'incomplete') { Icon = Info; color = "text-red-600"; text = "Incomplete"; }
      
      return (
        <Badge variant="outline" className={cn("ml-2 text-xs", color)}>
          <Icon className="h-3 w-3 mr-1"/>{text}
        </Badge>
      );
  };

  // Calculate overall risk based on AI checks
  const overallRisk: FinalCheckResult['riskLevel'] = useMemo(() => {
    // If any check has "High" risk, overall is High
    if (
      crossRefResult?.riskLevel === 'High' || 
      techValResult?.riskLevel === 'High' ||
      ectdCheckResult?.riskLevel === 'High'
    ) {
      return 'High';
    }
    
    // If any check has "Medium" risk, overall is Medium
    if (
      crossRefResult?.riskLevel === 'Medium' || 
      techValResult?.riskLevel === 'Medium' ||
      ectdCheckResult?.riskLevel === 'Medium'
    ) {
      return 'Medium';
    }
    
    // If at least one check has Low risk and none are higher
    if (
      crossRefResult?.riskLevel === 'Low' || 
      techValResult?.riskLevel === 'Low' ||
      ectdCheckResult?.riskLevel === 'Low'
    ) {
      return 'Low';
    }
    
    // If no checks have been run yet
    return undefined;
  }, [crossRefResult, techValResult, ectdCheckResult]);

  const overallRiskReasoning = useMemo(() => {
    const reasons: string[] = [];
    if (crossRefResult?.riskReasoning) reasons.push(crossRefResult.riskReasoning);
    if (techValResult?.riskReasoning) reasons.push(techValResult.riskReasoning);
    if (ectdCheckResult?.riskReasoning) reasons.push(ectdCheckResult.riskReasoning);
    
    if (reasons.length === 0) return "No AI checks have been performed.";
    return reasons.join(' ');
  }, [crossRefResult, techValResult, ectdCheckResult]);

  const shouldShowRiskAssessment = !!overallRisk;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileCheck className="mr-2 h-5 w-5" /> Final Assembly & Submission
          </CardTitle>
          <CardDescription>
            Review your IND submission package, run final checks, and submit to the FDA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Overall Progress */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <Label>Submission Readiness</Label>
                <span className="text-sm font-medium">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
            
            {/* Risk Assessment (only shown after checks run) */}
            {shouldShowRiskAssessment && (
              <Alert className={
                overallRisk === 'Low' ? "bg-green-50 border-green-200" :
                overallRisk === 'Medium' ? "bg-yellow-50 border-yellow-200" :
                "bg-red-50 border-red-200"
              }>
                <ShieldAlert className={
                  overallRisk === 'Low' ? "h-4 w-4 text-green-600" :
                  overallRisk === 'Medium' ? "h-4 w-4 text-yellow-600" :
                  "h-4 w-4 text-red-600"
                } />
                <AlertTitle className={
                  overallRisk === 'Low' ? "text-green-800" :
                  overallRisk === 'Medium' ? "text-yellow-800" :
                  "text-red-800"
                }>
                  AI Submission Risk Assessment: <span className="font-semibold">{overallRisk}</span>
                </AlertTitle>
                <AlertDescription className={
                  overallRisk === 'Low' ? "text-green-700" :
                  overallRisk === 'Medium' ? "text-yellow-700" :
                  "text-red-700"
                }>
                  {overallRiskReasoning}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Section Status Summary */}
            <Card className="border-muted">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center">
                  <GanttChartSquare className="h-4 w-4 mr-2" /> IND Section Status Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Pre-IND</span>
                    {renderSectionStatus(sectionStatuses.preInd)}
                  </div>
                  <div className="flex justify-between">
                    <span>Nonclinical Studies</span>
                    {renderSectionStatus(sectionStatuses.nonclinical)}
                  </div>
                  <div className="flex justify-between">
                    <span>CMC</span>
                    {renderSectionStatus(sectionStatuses.cmc)}
                  </div>
                  <div className="flex justify-between">
                    <span>Clinical Protocol</span>
                    {renderSectionStatus(sectionStatuses.clinicalProtocol)}
                  </div>
                  <div className="flex justify-between">
                    <span>Investigator Brochure</span>
                    {renderSectionStatus(sectionStatuses.ib)}
                  </div>
                  <div className="flex justify-between">
                    <span>FDA Forms</span>
                    {renderSectionStatus(sectionStatuses.fdaForms)}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Final AI Checks */}
            <div className="space-y-5">
              <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
                <h3 className="text-base font-medium flex items-center text-blue-800 mb-2">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  AI-Powered Final Validation
                </h3>
                <p className="text-sm text-blue-600 mb-4">
                  Run comprehensive AI checks to ensure your IND submission meets FDA requirements and is internally consistent.
                </p>
              </div>
              
              <Form {...form}>
                <form className="space-y-5">
                  {/* Cross Reference Check */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium flex items-center">
                        <Network className="h-4 w-4 mr-2" /> Cross-Reference Check
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Validates consistency across all referenced items (protocols, studies, etc.)
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      <div>
                        {renderCheckResult(crossRefResult, 'cross-reference')}
                      </div>
                      <FormField
                        control={form.control}
                        name="crossReferencesVerified"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!crossRefResult || crossRefResult.status === 'failed'}
                              />
                            </FormControl>
                            <div className="leading-none">
                              <FormLabel>
                                Cross-references verified
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => runFinalAiCheck('cross_reference')}
                        disabled={isAiChecking}
                        className="w-full sm:w-auto"
                      >
                        {isAiChecking && aiCheckType === 'cross_reference' ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Run Cross-Reference Check
                      </Button>
                    </CardContent>
                  </Card>
                  
                  {/* Technical Validation */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium flex items-center">
                        <ListTodo className="h-4 w-4 mr-2" /> Technical Validation
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Checks data formatting, required fields, and submission readiness
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      <div>
                        {renderCheckResult(techValResult, 'technical validation')}
                      </div>
                      <FormField
                        control={form.control}
                        name="technicalValidationPassed"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!techValResult || techValResult.status === 'failed'}
                              />
                            </FormControl>
                            <div className="leading-none">
                              <FormLabel>
                                Technical validation passed
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => runFinalAiCheck('technical_validation')}
                        disabled={isAiChecking}
                        className="w-full sm:w-auto"
                      >
                        {isAiChecking && aiCheckType === 'technical_validation' ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Run Technical Validation
                      </Button>
                    </CardContent>
                  </Card>
                  
                  {/* eCTD Structure Check */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium flex items-center">
                        <FileText className="h-4 w-4 mr-2" /> eCTD Structure Check
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Validates your data structure against eCTD format requirements
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      <div>
                        {renderCheckResult(ectdCheckResult, 'eCTD structure')}
                      </div>
                      <Button 
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => runFinalAiCheck('ectd_structure')}
                        disabled={isAiChecking}
                        className="w-full sm:w-auto"
                      >
                        {isAiChecking && aiCheckType === 'ectd_structure' ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Run eCTD Structure Check
                      </Button>
                    </CardContent>
                  </Card>
                  
                  {/* Final Submission Section */}
                  <Card className="border-blue-200">
                    <CardHeader className="bg-blue-50">
                      <CardTitle className="text-base font-medium flex items-center text-blue-800">
                        <Send className="h-4 w-4 mr-2 text-blue-700" /> Final Submission
                      </CardTitle>
                      <CardDescription>
                        Review submission package and confirm readiness to submit to FDA
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-3">
                      <FormField
                        control={form.control}
                        name="aiChecksPerformed"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={
                                  !crossRefResult || 
                                  !techValResult || 
                                  !ectdCheckResult ||
                                  crossRefResult.status === 'running' || 
                                  techValResult.status === 'running' ||
                                  ectdCheckResult.status === 'running'
                                }
                              />
                            </FormControl>
                            <div className="leading-none">
                              <FormLabel>
                                All AI checks completed and reviewed
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="submissionReadyConfirmed"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!form.watch("aiChecksPerformed")}
                              />
                            </FormControl>
                            <div className="leading-none">
                              <FormLabel>
                                I confirm this IND submission package is complete and ready for FDA submission
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" type="button">
                        Previous
                      </Button>
                      <Button 
                        type="button" 
                        onClick={handleFinalSubmit} 
                        disabled={
                          submissionMutation.isPending || 
                          isSubmitting || 
                          !form.watch("submissionReadyConfirmed") ||
                          (crossRefResult?.status === 'failed' || techValResult?.status === 'failed' || ectdCheckResult?.status === 'failed')
                        }
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        {submissionMutation.isPending || isSubmitting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="mr-2 h-4 w-4" />
                        )}
                        Submit to FDA
                      </Button>
                    </CardFooter>
                  </Card>
                </form>
              </Form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}