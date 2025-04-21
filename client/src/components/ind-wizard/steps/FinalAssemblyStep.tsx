// src/components/ind-wizard/steps/FinalAssemblyStep.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form'; 
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { useWizard } from '../IndWizardLayout'; // Access all collected indData
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from '@/components/ui/label';
import { Bot, HelpCircle, Loader2, Sparkles, FileText, CheckCircle2, AlertCircle, Search, Link2, Recycle, Send, ListTodo, Network, FileCheck, GanttChartSquare, ExternalLink } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; 
import { cn } from "@/lib/utils";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// --- API Simulation/Types ---
const apiInitiateSubmission = async (indData: any): Promise<{ success: boolean; submissionId?: string; message: string }> => {
  console.log('Initiating submission with data:', indData);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2500));
  
  // 90% chance of success
  if (Math.random() > 0.1) {
    return {
      success: true,
      submissionId: `IND-${Date.now()}`,
      message: 'Submission successfully prepared and ready for FDA Gateway upload.'
    };
  } else {
    throw new Error('Failed to prepare submission. Please try again.');
  }
};

type FinalCheckStatus = 'pending' | 'running' | 'passed' | 'warnings' | 'failed';
interface CheckDetail {
    section: string; // e.g., 'CMC', 'Form 1571', 'eCTD Structure M1'
    issue: string;
    severity: 'warning' | 'error';
    guidelineRef?: { text: string; url: string }; 
}
interface FinalCheckResult {
    status: FinalCheckStatus;
    summary: string;
    details?: CheckDetail[];
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
  aiChecksPerformed: z.boolean().default(false),
  crossReferencesVerified: z.boolean().default(false),
  technicalValidationPassed: z.boolean().default(false),
  submissionMetadataReviewed: z.boolean().default(false),
  contentHyperlinksTested: z.boolean().default(false),
  readyForSubmission: z.boolean().default(false),
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
  const [ectdCheckResult, setEctdCheckResult] = useState<FinalCheckResult | null>(null);

  // State for submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form for checklist
  const form = useForm<FinalAssemblyChecklistFormData>({
    resolver: zodResolver(finalAssemblyChecklistSchema),
    defaultValues: {
      aiChecksPerformed: false,
      crossReferencesVerified: false,
      technicalValidationPassed: false,
      submissionMetadataReviewed: false,
      contentHyperlinksTested: false,
      readyForSubmission: false,
    }
  });

  // --- Data Mutation (Final Submission) ---
  const submissionMutation = useMutation({
    mutationFn: apiInitiateSubmission,
    onSuccess: (data) => {
      toast({
        title: "Submission Ready",
        description: data.message,
      });
      form.setValue('readyForSubmission', true);
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  function handleFinalSubmit() {
    // Check for AI validation critical failures
    if (crossRefResult?.status === 'failed' || techValResult?.status === 'failed' || ectdCheckResult?.status === 'failed') {
      toast({
        title: "Cannot Submit - Critical Issues",
        description: "Please resolve critical issues identified in AI checks before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    // Proceed with submission
    submissionMutation.mutate(indData);
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
    const values = form.watch();
    const checklist = [
      values.aiChecksPerformed,
      values.crossReferencesVerified, 
      values.technicalValidationPassed,
      values.submissionMetadataReviewed,
      values.contentHyperlinksTested,
      values.readyForSubmission
    ];
    
    return Math.round((checklist.filter(Boolean).length / checklist.length) * 100);
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
      
      // Show the right badge based on status
      let BadgeComponent = <Badge className="bg-gray-100 text-gray-600 border-gray-300">Pending</Badge>;
      if (result.status === 'running') BadgeComponent = <Badge className="bg-blue-100 text-blue-600 border-blue-300">Running</Badge>;
      if (result.status === 'passed') BadgeComponent = <Badge className="bg-green-100 text-green-700 border-green-300">Passed</Badge>;
      if (result.status === 'warnings') BadgeComponent = <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">Warnings</Badge>;
      if (result.status === 'failed') BadgeComponent = <Badge className="bg-red-100 text-red-700 border-red-300">Failed</Badge>;
      
      return (
          <div className="space-y-2">
              <div className="flex items-center gap-2">
                  {BadgeComponent}
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
      let Icon = AlertCircle; let color = "text-gray-500"; let text = "Unknown";
      if (status === 'complete') { Icon = CheckCircle2; color = "text-green-600"; text = "Complete"; }
      if (status === 'warnings') { Icon = AlertCircle; color = "text-yellow-600"; text = "Warnings"; }
      // Add more statuses as needed
      return <Badge variant="outline" className={cn("ml-2 text-xs", color, `border-${color.replace('text-', '')}`)}><Icon className="h-3 w-3 mr-1"/>{text}</Badge>;
  };

  // Calculate overall risk based on AI checks
  const overallRisk: FinalCheckResult['riskLevel'] = useMemo(() => {
      if (crossRefResult?.status === 'failed' || techValResult?.status === 'failed' || ectdCheckResult?.status === 'failed') return 'High';
      if (crossRefResult?.status === 'warnings' || techValResult?.status === 'warnings' || ectdCheckResult?.status === 'warnings') return 'Medium';
      if (crossRefResult?.status === 'passed' && techValResult?.status === 'passed' && ectdCheckResult?.status === 'passed') return 'Low';
      return undefined; // Not calculated yet
  }, [crossRefResult, techValResult, ectdCheckResult]);


  // --- Render Logic ---
  return (
    <TooltipProvider>
       <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFinalSubmit)} className="space-y-8">
          {/* Section 1: Submission Overview & Status (Enhanced) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><ListTodo className="mr-2 h-5 w-5" /> Submission Overview & Readiness</CardTitle>
              <CardDescription>Final review of all IND sections and readiness checklist before assembly.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 {/* Overall Progress Bar */}
                 <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-sm font-medium">Overall Completion:</Label>
                      <span className="text-sm font-medium">{overallProgress}%</span>
                    </div>
                    <Progress value={overallProgress} className="h-2" />
                 </div>

                 {/* Section Status Summary */}
                 <div className="space-y-1">
                     <Label className="text-sm font-medium">Section Status Summary:</Label>
                     <div className="flex flex-wrap gap-2 p-2 border rounded bg-muted/30">
                         {Object.entries(sectionStatuses).map(([key, status]) => (
                             <div key={key} className="flex items-center">
                                 <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                 {renderSectionStatus(status)}
                             </div>
                         ))}
                     </div>
                 </div>

                 {/* AI Submission Risk Score */}
                  {overallRisk && (
                     <Alert variant={overallRisk === 'High' ? 'destructive' : overallRisk === 'Medium' ? 'default' : 'default'} className={overallRisk === 'Medium' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : overallRisk === 'Low' ? 'bg-green-50 border-green-200 text-green-800' : ''}>
                        <Bot className="h-4 w-4" />
                        <AlertTitle>AI Submission Risk Assessment: {overallRisk}</AlertTitle>
                        <AlertDescription>
                            {crossRefResult?.riskReasoning || techValResult?.riskReasoning || ectdCheckResult?.riskReasoning || 'Based on completed AI checks.'}
                        </AlertDescription>
                    </Alert>
                  )}
            </CardContent>
          </Card>

          {/* Section 2: Final AI Checks (Added eCTD Structure Check) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><Bot className="mr-2 h-5 w-5" /> Final AI Validation Checks</CardTitle>
              <CardDescription>Run comprehensive AI checks across the entire application data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Cross-Reference Check */}
                <div className="p-4 border rounded">
                   <Label className="text-base font-medium">Cross-Reference Check</Label>
                   <p className="text-sm text-muted-foreground mb-3">AI identifies cross-references between documents and verifies consistency.</p>
                   <Button type="button" onClick={() => runFinalAiCheck('cross_reference')} disabled={isAiChecking} className="mb-3">
                       {isAiChecking && aiCheckType === 'cross_reference' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
                       Run AI Cross-Reference Check
                   </Button>
                   {renderCheckResult(crossRefResult, 'Cross-Reference')}
                </div>
                
                {/* Technical Validation Check */}
                <div className="p-4 border rounded">
                   <Label className="text-base font-medium">Technical Validation Check</Label>
                   <p className="text-sm text-muted-foreground mb-3">AI validates document format, completeness and technical compliance with FDA requirements.</p>
                   <Button type="button" onClick={() => runFinalAiCheck('technical_validation')} disabled={isAiChecking} className="mb-3">
                       {isAiChecking && aiCheckType === 'technical_validation' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileCheck className="mr-2 h-4 w-4" />}
                       Run AI Technical Validation
                   </Button>
                   {renderCheckResult(techValResult, 'Technical Validation')}
                </div>
                
                {/* NEW: eCTD Structure Check */}
                <div className="p-4 border rounded">
                   <Label className="text-base font-medium">eCTD Structure & Placement Check</Label>
                   <p className="text-sm text-muted-foreground mb-3">AI analyzes collected data against expected eCTD module structure and common placement requirements.</p>
                   <Button type="button" onClick={() => runFinalAiCheck('ectd_structure')} disabled={isAiChecking} className="mb-3">
                       {isAiChecking && aiCheckType === 'ectd_structure' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Network className="mr-2 h-4 w-4" />}
                       Run AI eCTD Structure Check
                   </Button>
                   {renderCheckResult(ectdCheckResult, 'eCTD Structure')}
                </div>
            </CardContent>
          </Card>

          {/* Section 3: Submission Readiness Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><GanttChartSquare className="mr-2 h-5 w-5" /> Submission Readiness Checklist</CardTitle>
              <CardDescription>Complete the final checklist to confirm your IND is ready for submission.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="aiChecksPerformed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          AI-powered checks performed
                        </FormLabel>
                        <FormDescription>
                          All AI validation checks have been run
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="crossReferencesVerified"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Cross-references verified
                        </FormLabel>
                        <FormDescription>
                          All cross-references between sections are consistent
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="technicalValidationPassed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Technical validation passed
                        </FormLabel>
                        <FormDescription>
                          All documents meet FDA technical requirements
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="submissionMetadataReviewed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Submission metadata reviewed
                        </FormLabel>
                        <FormDescription>
                          All submission metadata is accurate and complete
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contentHyperlinksTested"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Content/hyperlinks tested
                        </FormLabel>
                        <FormDescription>
                          All hyperlinks and TOCs have been verified
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <div className="text-sm text-muted-foreground">
                All items must be checked before submission
              </div>
              <Button 
                type="submit" 
                disabled={
                  Object.values(form.getValues()).some(val => val === false) || 
                  isSubmitting || 
                  submissionMutation.isPending || 
                  form.getValues().readyForSubmission
                }
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

          {/* Footer Info */}
          <div className="text-center text-sm text-muted-foreground mt-4">
            This is the final step of the IND Wizard. Complete all checks before submission.
          </div>
        </form>
      </Form>
    </TooltipProvider>
  );
}