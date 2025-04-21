// src/components/ind-wizard/steps/ClinicalProtocolStep.jsx
import React, { useState, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQueryClient, useMutation } from '@tanstack/react-query';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';

// Icons
import { Bot, HelpCircle, Loader2, Sparkles, FileText, Target, Users, ShieldCheck, ClipboardList, PlusCircle, Trash2, Check, AlertCircle, Library, Edit } from 'lucide-react';

// Utilities and Context
import { useWizard } from '../IndWizardLayout';
import { cn } from "@/lib/utils";

// --- API Simulation ---
// Simulated API functions
const apiSaveClinicalProtocolData = async (data) => {
  console.log("Saving clinical protocol data:", data);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true, message: "Protocol data saved." };
};

const apiTriggerProtocolAiAnalysis = async (type, contextData) => {
  console.log(`Triggering AI analysis for ${type}:`, contextData);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000));
  return { result: `AI ${type} analysis completed successfully.` };
};

// Simulate AI check for a single criterion
const apiCheckCriterionAi = async (criterionText, criteriaType, context) => {
    console.log(`API CALL: AI Checking ${criteriaType} criterion: "${criterionText}"`, context);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Simulate different outcomes
    const rand = Math.random();
    if (rand < 0.6) return { status: 'Checked', feedback: 'Criterion appears clear and standard.' };
    if (rand < 0.85) return { status: 'Suggestion', feedback: 'Consider rephrasing for clarity or adding specific timeframe.' };
    return { status: 'Potential Issue', feedback: 'This criterion might conflict with [other criteria/guideline] or be ambiguous.' };
};

// --- Zod Schema Definition ---
// Define schema for a single criterion
const criterionSchema = z.object({
  id: z.string().uuid().or(z.string().min(1)),
  text: z.string().min(5, "Criterion text is too short"),
  // category: z.string().optional(), // Optional categorization
  aiStatus: z.enum(['Not Checked', 'Checking', 'Checked', 'Suggestion', 'Potential Issue']).default('Not Checked'),
  aiFeedback: z.string().optional(),
});

// Main step schema with arrays of criteria
const clinicalProtocolStepSchema = z.object({
  protocolTitle: z.string().min(5, "Protocol title is required"),
  protocolIdentifier: z.string().optional(),
  phase: z.enum(['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'Pilot', 'Other']).optional(),
  objectives: z.string().min(10, "Objectives are required"),
  studyDesignSummary: z.string().min(10, "Study design summary is required"),
  primaryEndpoints: z.string().min(5, "Primary endpoint(s) required"),
  secondaryEndpoints: z.string().optional(),
  // Using array of structured criteria
  inclusionCriteria: z.array(criterionSchema).min(1, "At least one inclusion criterion is required"),
  exclusionCriteria: z.array(criterionSchema).min(1, "At least one exclusion criterion is required"),
  safetyMonitoringPlanSummary: z.string().min(10, "Safety monitoring summary required"),
  statisticalConsiderationsSummary: z.string().optional(),
});

// --- Criteria Builder Sub-Component ---
function CriteriaBuilder({ form, name, label, description, triggerAiCheck }) {
    const { fields, append, remove, update } = useFieldArray({
        control: form.control,
        name: name
    });

    const [editingIndex, setEditingIndex] = useState(null);
    const [editText, setEditText] = useState('');

    const startEditing = (index, currentText) => {
        setEditingIndex(index);
        setEditText(currentText);
    };

    const saveEdit = (index) => {
        if (editText.trim().length >= 5) {
             // Update the specific field's text value
             update(index, { ...fields[index], text: editText.trim(), aiStatus: 'Not Checked', aiFeedback: undefined }); // Reset AI status on edit
        } else {
            toast({ title: "Validation Error", description: "Criterion text must be at least 5 characters.", variant: "destructive" });
        }
        setEditingIndex(null);
        setEditText('');
    };

    const cancelEdit = () => {
        setEditingIndex(null);
        setEditText('');
    };

    // Function to simulate loading criteria from a template
    const loadFromTemplate = () => {
        toast({ title: "Load from Template", description: "Template library integration placeholder." });
        // In real implementation: Open a dialog/picker to select standard criteria
        // Then use `append` multiple times or `replace` to add them.
        // Example appending:
        // append({ id: crypto.randomUUID(), text: "Standard Criterion Example 1", aiStatus: 'Not Checked' });
        // append({ id: crypto.randomUUID(), text: "Standard Criterion Example 2", aiStatus: 'Not Checked' });
    };

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'Checked': return 'default'; // Use default (often blue/primary) for 'Checked'
            case 'Suggestion': return 'secondary'; // Use secondary (often gray) for 'Suggestion'
            case 'Potential Issue': return 'destructive'; // Use destructive (red) for 'Potential Issue'
            case 'Checking': return 'outline'; // Use outline for 'Checking'
            default: return 'outline'; // Default to outline for 'Not Checked'
        }
    };

    const getStatusIcon = (status) => {
         switch (status) {
            case 'Checked': return <Check className="h-3 w-3" />;
            case 'Suggestion': return <HelpCircle className="h-3 w-3" />;
            case 'Potential Issue': return <AlertCircle className="h-3 w-3" />;
            case 'Checking': return <Loader2 className="h-3 w-3 animate-spin" />;
            default: return null; // No icon for 'Not Checked'
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <Label className="text-base font-medium">{label}</Label>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button type="button" variant="outline" size="sm" onClick={loadFromTemplate}>
                            <Library className="mr-2 h-4 w-4" /> Load Template / Standard Criteria
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Load predefined criteria from your library.</p></TooltipContent>
                </Tooltip>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
            <div className="space-y-2">
                {fields.map((field, index) => (
                    <Card key={field.id} className="p-3 bg-muted/40">
                        <div className="flex items-start space-x-2">
                            <span className="font-mono text-xs text-muted-foreground pt-2">{index + 1}.</span>
                            <div className="flex-grow">
                                {editingIndex === index ? (
                                    <Textarea
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        rows={3}
                                        className="mb-1"
                                    />
                                ) : (
                                    <p className="text-sm py-1.5">{field.text}</p>
                                )}
                                {/* AI Status and Feedback */}
                                <div className="flex items-center space-x-2 mt-1">
                                     <Badge variant={getStatusBadgeVariant(field.aiStatus)}>
                                        {getStatusIcon(field.aiStatus)}
                                        <span className="ml-1">{field.aiStatus}</span>
                                    </Badge>
                                    {field.aiFeedback && (
                                        <Tooltip>
                                            <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" /></TooltipTrigger>
                                            <TooltipContent><p>{field.aiFeedback}</p></TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>

                            </div>
                            <div className="flex flex-col space-y-1 items-end">
                                {editingIndex === index ? (
                                    <>
                                        <Button type="button" size="sm" onClick={() => saveEdit(index)}><Check className="h-4 w-4" /></Button>
                                        <Button type="button" size="sm" variant="ghost" onClick={cancelEdit}>Cancel</Button>
                                    </>
                                ) : (
                                    <>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button type="button" size="sm" variant="ghost" onClick={() => startEditing(index, field.text)}><Edit className="h-4 w-4" /></Button>
                                            </TooltipTrigger>
                                            <TooltipContent><p>Edit Criterion</p></TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button type="button" size="sm" variant="ghost" onClick={() => triggerAiCheck(index, name)} disabled={field.aiStatus === 'Checking'}>
                                                    {field.aiStatus === 'Checking' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent><p>AI Check this criterion</p></TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button type="button" size="sm" variant="ghost" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                            </TooltipTrigger>
                                            <TooltipContent><p>Delete Criterion</p></TooltipContent>
                                        </Tooltip>
                                    </>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
            <Button 
                type="button" 
                variant="secondary" 
                size="sm" 
                onClick={() => append({ id: crypto.randomUUID(), text: '', aiStatus: 'Not Checked' })}
            >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Criterion
            </Button>
             {/* Display root error for the array if any */}
             {form.formState.errors[name]?.root && <p className="text-sm font-medium text-destructive">{form.formState.errors[name]?.root?.message}</p>}
             {/* Display error if array is empty but required */}
             {form.formState.errors[name] && !form.formState.errors[name]?.root && fields.length === 0 && <p className="text-sm font-medium text-destructive">{form.formState.errors[name]?.message}</p>}
        </div>
    );
}

// --- Main Component Implementation ---
export default function ClinicalProtocolStep() {
  const { indData, updateIndDataSection, goToNextStep } = useWizard();
  const queryClient = useQueryClient();

  // State for AI analysis (overall)
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null);
  const [isOverallAiLoading, setIsOverallAiLoading] = useState(false);
  const [overallAiAnalysisType, setOverallAiAnalysisType] = useState(null);

  // --- Form Setup ---
  const form = useForm({
    resolver: zodResolver(clinicalProtocolStepSchema),
    defaultValues: {
        protocolTitle: '', 
        protocolIdentifier: '', 
        phase: undefined, 
        objectives: '', 
        studyDesignSummary: '',
        primaryEndpoints: '', 
        secondaryEndpoints: '',
        inclusionCriteria: [], // Initialize as empty array
        exclusionCriteria: [], // Initialize as empty array
        safetyMonitoringPlanSummary: '', 
        statisticalConsiderationsSummary: '',
    },
  });

   // --- Data Mutation (Saving) ---
   const mutation = useMutation({
     mutationFn: apiSaveClinicalProtocolData,
     onSuccess: (data) => {
       toast({ 
         title: "Success", 
         description: data.message || "Protocol data saved successfully" 
       });
       // Update context data
       if (indData && updateIndDataSection) {
         updateIndDataSection('clinicalProtocolData', form.getValues());
       }
     },
     onError: (error) => {
       toast({ 
         title: "Error", 
         description: error.message || "Failed to save protocol data", 
         variant: "destructive" 
       });
     }
   });

   function onSubmit(values) { 
     mutation.mutate(values);
   }

  // --- AI Interaction ---
  // Overall AI Analysis Handler
  const handleOverallAiAnalysis = async (type) => {
      setIsOverallAiLoading(true);
      setOverallAiAnalysisType(type);
      setAiAnalysisResult(null);
      const currentData = form.getValues();
      try {
          const analysis = await apiTriggerProtocolAiAnalysis(type, currentData); // Use existing function
          setAiAnalysisResult(analysis.result);
          toast({title: `AI ${type.replace('_', ' ')} Complete`, description: analysis.result.substring(0, 100) + "..."});
      } catch (error) {
          toast({ title: `AI ${type.replace('_', ' ')} Failed`, description: error.message || "Could not perform analysis.", variant: "destructive" });
          setAiAnalysisResult(`Error performing ${type} analysis.`);
      } finally {
          setIsOverallAiLoading(false);
      }
  };

  // Handler for individual criterion AI check (passed to CriteriaBuilder)
  const triggerCriterionAiCheck = useCallback(async (index, type) => {
        const fieldName = type;
        const criteria = form.getValues(fieldName);
        const criterionToCheck = criteria[index];

        if (!criterionToCheck) return;

        // Set status to 'Checking'
        form.setValue(`${fieldName}.${index}.aiStatus`, 'Checking', { shouldDirty: true });
        form.setValue(`${fieldName}.${index}.aiFeedback`, undefined); // Clear previous feedback

        try {
            // Prepare context (could include objectives, phase, etc.)
            const context = {
                objective: form.getValues('objectives'),
                phase: form.getValues('phase'),
                // Add other relevant context
            };
            const result = await apiCheckCriterionAi(criterionToCheck.text, type === 'inclusionCriteria' ? 'inclusionCriteria' : 'exclusionCriteria', context);
            form.setValue(`${fieldName}.${index}.aiStatus`, result.status, { shouldDirty: true });
            form.setValue(`${fieldName}.${index}.aiFeedback`, result.feedback, { shouldDirty: true });
            toast({ title: `AI Check Complete (${result.status})`, description: result.feedback || `Criterion ${index + 1} checked.` });
        } catch (error) {
            form.setValue(`${fieldName}.${index}.aiStatus`, 'Not Checked', { shouldDirty: true }); // Revert status on error
            toast({ title: "AI Check Failed", description: error.message || "Could not check criterion.", variant: "destructive" });
        }
    }, [form]); // Include form in dependency array for useCallback

  return (
    <TooltipProvider>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Section 1: Protocol Identification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><FileText className="mr-2 h-5 w-5" /> Protocol Identification</CardTitle>
              <CardDescription>Define the basic identifying information for your clinical protocol.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="protocolTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Protocol Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter protocol title..." {...field} />
                    </FormControl>
                    <FormDescription>
                      A clear, descriptive title for the protocol document.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="protocolIdentifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protocol Identifier</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., PROT-2023-001" {...field} />
                      </FormControl>
                      <FormDescription>
                        A unique identifier for this protocol.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Study Phase</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select phase" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Phase 1">Phase 1</SelectItem>
                          <SelectItem value="Phase 2">Phase 2</SelectItem>
                          <SelectItem value="Phase 3">Phase 3</SelectItem>
                          <SelectItem value="Phase 4">Phase 4</SelectItem>
                          <SelectItem value="Pilot">Pilot Study</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The clinical trial phase.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Study Objectives and Design */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><Target className="mr-2 h-5 w-5" /> Objectives & Design</CardTitle>
              <CardDescription>Define the study objectives and overall design approach.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="objectives"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Study Objectives</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter primary and secondary objectives..." 
                        {...field} 
                        rows={4}
                      />
                    </FormControl>
                    <FormDescription>
                      The primary and secondary aims of the study.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="studyDesignSummary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Study Design Summary</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the overall study design..." 
                        {...field} 
                        rows={5}
                      />
                    </FormControl>
                    <FormDescription>
                      Summarize the study design, including control groups, randomization, blinding, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Section 3: Endpoints */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><ClipboardList className="mr-2 h-5 w-5" /> Endpoints</CardTitle>
              <CardDescription>Define the primary and secondary endpoints for the study.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleOverallAiAnalysis('endpoint_suggestion')}
                  disabled={isOverallAiLoading}
                >
                  {isOverallAiLoading && overallAiAnalysisType === 'endpoint_suggestion' 
                    ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    : <Bot className="mr-2 h-4 w-4" />}
                  Suggest Endpoints
                </Button>
              </div>
              
              <FormField
                control={form.control}
                name="primaryEndpoints"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Endpoint(s)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the primary endpoint(s)..." 
                        {...field} 
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      The main outcome measures for the study.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="secondaryEndpoints"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Endpoint(s)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the secondary endpoint(s)..." 
                        {...field} 
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      Additional outcome measures of interest.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Section 4: Study Population (using CriteriaBuilder) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5" /> Study Population</CardTitle>
              <CardDescription>Define the criteria for participant inclusion and exclusion using the builders below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 {/* Inclusion Criteria Builder */}
                 <CriteriaBuilder
                     form={form}
                     name="inclusionCriteria"
                     label="Inclusion Criteria"
                     description="Define conditions participants must meet to be eligible."
                     triggerAiCheck={triggerCriterionAiCheck}
                 />
                 <Separator />
                 {/* Exclusion Criteria Builder */}
                 <CriteriaBuilder
                     form={form}
                     name="exclusionCriteria"
                     label="Exclusion Criteria"
                     description="Define conditions that disqualify participants."
                     triggerAiCheck={triggerCriterionAiCheck}
                 />
            </CardContent>
          </Card>

          {/* Section 5: Safety Monitoring */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><ShieldCheck className="mr-2 h-5 w-5" /> Safety Monitoring</CardTitle>
              <CardDescription>Define the plans for monitoring participant safety during the study.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleOverallAiAnalysis('safety_draft')}
                  disabled={isOverallAiLoading}
                >
                  {isOverallAiLoading && overallAiAnalysisType === 'safety_draft' 
                    ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    : <Bot className="mr-2 h-4 w-4" />}
                  Generate Safety Draft
                </Button>
              </div>
              
              <FormField
                control={form.control}
                name="safetyMonitoringPlanSummary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Safety Monitoring Plan</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the safety monitoring approach..." 
                        {...field} 
                        rows={5}
                      />
                    </FormControl>
                    <FormDescription>
                      Summarize how participant safety will be monitored, including adverse event reporting and data monitoring.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="statisticalConsiderationsSummary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statistical Considerations</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the statistical approach..." 
                        {...field} 
                        rows={4}
                      />
                    </FormControl>
                    <FormDescription>
                      Summarize the statistical methods, sample size considerations, and analysis plans.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleOverallAiAnalysis('stats_guidance')}
                  disabled={isOverallAiLoading}
                >
                  {isOverallAiLoading && overallAiAnalysisType === 'stats_guidance' 
                    ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    : <Bot className="mr-2 h-4 w-4" />}
                  Get Statistical Guidance
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Overall AI Analysis Result Display Area */}
          {aiAnalysisResult && (
            <Card className="border-dashed border-primary/50 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Bot className="mr-2 h-5 w-5 text-primary" />
                  AI {overallAiAnalysisType?.replace('_', ' ')} Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm whitespace-pre-line">{aiAnalysisResult}</div>
              </CardContent>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex justify-between">
            <Button variant="outline" type="button">Previous</Button>
            <div className="space-x-2">
              <Button variant="outline" type="button" onClick={() => form.reset()}>Reset</Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save & Continue
              </Button>
            </div>
          </div>

          {/* Footer Info & Mutation Status */}
          <div className="text-center text-sm text-muted-foreground mt-4">
            Complete this section to define the clinical protocol for your IND submission.
          </div>
          {mutation.isPending && (
            <div className="text-center">
              <Loader2 className="inline-block animate-spin h-4 w-4 mr-2" />
              Saving your protocol data...
            </div>
          )}
          {mutation.isError && (
            <div className="text-center text-destructive">
              <AlertCircle className="inline-block h-4 w-4 mr-2" />
              Error: {mutation.error?.message || "Failed to save data"}
            </div>
          )}
        </form>
      </Form>
    </TooltipProvider>
  );
}