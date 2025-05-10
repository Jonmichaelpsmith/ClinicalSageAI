// src/components/ind-wizard/steps/NonclinicalStep.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// UI Components from shadcn/ui
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';

// Icons from lucide-react
import { Bot, FileText, Microscope, AlertTriangle, Loader2, Sparkles, UploadCloud } from 'lucide-react';

// Utilities and Context
import { useWizard } from '../IndWizardLayout';

// Import the components we created
import NonclinicalStudyTracker from './components/milestones/NonclinicalStudyTracker';
import StudyEditorForm from './components/milestones/StudyEditorForm';

// --- Zod Schema Definition ---
const nonclinicalStudySchema = z.object({
  id: z.string().uuid().or(z.string().min(1)),
  studyIdentifier: z.string().min(3, "Identifier required"),
  studyType: z.string().min(3, "Type required (e.g., Toxicology, Pharmacology)"),
  species: z.string().min(3, "Species required"),
  keyFindingsSummary: z.string().optional(),
  documentLink: z.string().url("Must be a valid URL").optional().or(z.string().length(0)),
  aiValidationStatus: z.enum(['Pending', 'Reviewed', 'Needs Attention']).default('Pending'),
});

const nonclinicalStepSchema = z.object({
  overallNonclinicalSummary: z.string().optional(),
  studies: z.array(nonclinicalStudySchema).optional().default([]),
});

// --- API Simulation Functions ---
// Simulate parsing study details from text using AI (e.g., OpenAI Function Calling)
const apiParseStudyText = async (text) => {
  console.log("API CALL: Parsing study text with AI...", text);
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate AI processing
  
  // In a real scenario, this would call backend -> OpenAI with Function Calling
  // to extract structured data based on the nonclinicalStudySchema
  let extracted = { id: crypto.randomUUID() };
  
  if (text.toLowerCase().includes("toxicology")) extracted.studyType = "Toxicology";
  if (text.toLowerCase().includes("pharmacology")) extracted.studyType = "Pharmacology";
  if (text.toLowerCase().includes("rat")) extracted.species = "Rat";
  if (text.toLowerCase().includes("dog")) extracted.species = "Dog";
  extracted.keyFindingsSummary = `AI Parsed Summary: ${text.substring(0, 50)}...`;
  extracted.studyIdentifier = `AI-Parsed-${Date.now() % 1000}`;
  
  return extracted;
};

// Real API function for saving nonclinical data
const apiSaveNonclinicalData = async (data) => {
  console.log("API CALL: Saving Nonclinical Data...", data);
  
  const currentDraftId = localStorage.getItem('currentDraftId') || 'draft-1'; // Use draft-1 as fallback for now
  
  const response = await fetch(`/api/ind-drafts/${currentDraftId}/nonclinical`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }
  
  return await response.json();
};

// Simulate AI analysis
const apiTriggerAiAnalysis = async (type, contextData) => {
  console.log(`API CALL: Triggering AI ${type} analysis...`, contextData);
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate AI processing
  
  // Simulate different responses based on analysis type
  let result = `AI ${type} analysis completed.`;
  
  if (type === 'validation') {
    result = "Overall, your nonclinical data package appears to be on track. Consider adding additional genotoxicity studies to strengthen your submission.";
  } else if (type === 'gap_analysis') {
    result = "Potential gaps identified: Missing carcinogenicity studies for chronic indications, and additional reproductive toxicity studies may be required.";
  }
  
  return { result: result };
};

// --- Main Nonclinical Step Component ---
export default function NonclinicalStep() {
  const { indData, updateIndDataSection, goToNextStep } = useWizard();

  // State for AI analysis, study editor dialog, text parsing
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAnalysisType, setAiAnalysisType] = useState(null);
  const [isStudyEditorOpen, setIsStudyEditorOpen] = useState(false);
  const [editingStudy, setEditingStudy] = useState(null);
  const [studyTextToParse, setStudyTextToParse] = useState('');
  const [isParsingText, setIsParsingText] = useState(false);

  // --- Data Fetching with useState/useEffect ---
  const [initialData, setInitialData] = useState(null);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  
  // Fetch data on component mount
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      console.log("API CALL: Fetching initial Nonclinical data...");
      
      const currentDraftId = localStorage.getItem('currentDraftId') || 'draft-1'; // Use draft-1 as fallback
      
      try {
        setIsLoadingInitialData(true);
        
        const response = await fetch(`/api/ind-drafts/${currentDraftId}/nonclinical`);
        
        if (!response.ok) {
          if (response.status === 404) {
            console.warn('No Nonclinical data found for this draft yet. Starting with defaults.');
            if (isMounted) {
              setInitialData(null);
              setIsLoadingInitialData(false);
            }
            return;
          }
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Only update state if component is still mounted
        if (isMounted) {
          setInitialData(data.data); // Assuming the API returns { success: true, data: {...} }
          setIsLoadingInitialData(false);
        }
      } catch (error) {
        console.error('Error fetching Nonclinical data:', error);
        
        // Only update state if component is still mounted
        if (isMounted) {
          setFetchError(error);
          // Fall back to context data if API fails
          setInitialData(indData.nonclinicalData);
          setIsLoadingInitialData(false);
        }
      }
    };
    
    fetchData();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array means this runs once on mount

  // --- Form Setup ---
  const form = useForm({
    resolver: zodResolver(nonclinicalStepSchema),
    defaultValues: { 
      overallNonclinicalSummary: '', 
      studies: [] 
    },
  });
  
  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else if (indData && indData.nonclinicalData) {
      form.reset({
        overallNonclinicalSummary: indData.nonclinicalData.overallNonclinicalSummary || '',
        studies: indData.nonclinicalData.studies || []
      });
    }
  }, [initialData, indData, form.reset]);

  // --- Data Saving State ---
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Handle form submission -> save data directly
  async function onSubmit(values) {
    console.log("Nonclinical Step Data Submitted:", values);
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // Call save function directly
      const data = await apiSaveNonclinicalData(values);
      
      // Handle success
      toast({ 
        title: "Save Successful", 
        description: data.message || "Nonclinical data saved successfully." 
      });
      
      // Update context/global state
      updateIndDataSection('nonclinicalData', form.getValues());
      
      // Go to next step
      goToNextStep();
    } catch (error) {
      // Handle error
      setSaveError(error);
      toast({ 
        title: "Save Failed", 
        description: error.message || "An unknown error occurred.", 
        variant: "destructive" 
      });
    } finally {
      setIsSaving(false);
    }
  }

  // --- AI Interaction ---
  const handleAiAnalysis = async (type) => {
    setIsAiLoading(true);
    setAiAnalysisType(type);
    setAiAnalysisResult(null); // Clear previous results

    try {
      const contextData = {
        summary: form.getValues('overallNonclinicalSummary'),
        studyCount: form.getValues('studies').length,
        studyTypes: [...new Set(form.getValues('studies').map(s => s.studyType))],
      };
      
      // Call our new API endpoint
      const response = await fetch('/api/ind/wizard/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, contextData }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      setAiAnalysisResult(result.result);
      
      toast({ 
        title: "AI Analysis Complete", 
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} analysis completed` 
      });
    } catch (error) {
      toast({ 
        title: "AI Analysis Failed", 
        description: error.message || "Could not perform analysis.", 
        variant: "destructive" 
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  // --- Study Management Callbacks ---
  const handleStudiesChange = (updatedStudies) => {
    form.setValue('studies', updatedStudies, { shouldValidate: true });
  };

  const handleEditStudy = (study) => {
    setEditingStudy(study);
    setIsStudyEditorOpen(true);
  };

  const handleDeleteStudy = (id) => {
    if (window.confirm('Are you sure you want to delete this study?')) {
      const currentStudies = form.getValues('studies');
      form.setValue(
        'studies', 
        currentStudies.filter(s => s.id !== id), 
        { shouldValidate: true }
      );
      toast({ title: "Study Deleted" });
    }
  };

  const handleSaveStudy = (data) => {
    const currentStudies = form.getValues('studies');
    const exists = currentStudies.some(s => s.id === data.id);
    let updatedStudies;
    
    if (exists) {
      updatedStudies = currentStudies.map(s => s.id === data.id ? data : s); // Update
    } else {
      updatedStudies = [...currentStudies, data]; // Add new
    }
    
    form.setValue('studies', updatedStudies, { shouldValidate: true });
    setIsStudyEditorOpen(false);
    setEditingStudy(null);
    toast({ title: "Study Saved" });
  };

  const handleOpenNewStudyDialog = () => {
    setEditingStudy({}); // Empty object for new study
    setIsStudyEditorOpen(true);
  };

  // --- AI Text Parsing ---
  const handleParseStudyText = async () => {
    if (!studyTextToParse.trim()) {
      toast({ 
        title: "Input Needed", 
        description: "Please paste study description text first.", 
        variant: "destructive" 
      });
      return;
    }
    
    setIsParsingText(true);
    
    try {
      // Use our new API endpoint for study text parsing
      const response = await fetch('/api/ind/wizard/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          type: 'study_parser', 
          contextData: { text: studyTextToParse } 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      
      // For the study parser, the result is JSON string that needs to be parsed
      const parsedData = typeof result.result === 'string' ? 
        JSON.parse(result.result) : result.result;
        
      // Generate a unique ID for the new study
      parsedData.id = Date.now().toString();
      
      setEditingStudy(parsedData); // Pre-fill editor with parsed data
      setIsStudyEditorOpen(true); // Open editor
      setStudyTextToParse(''); // Clear textarea
      
      toast({ 
        title: "AI Parsing Complete", 
        description: "Review the extracted details and save." 
      });
    } catch (error) {
      console.error("Parsing error:", error);
      toast({ 
        title: "AI Parsing Failed", 
        description: error.message || "Could not parse text.", 
        variant: "destructive" 
      });
    } finally {
      setIsParsingText(false);
    }
  };

  // Handler for AI assistance (called from NonclinicalStudyTracker)
  const handleAiTrigger = (context, study) => {
    console.log("AI Triggered:", { context, study });
    
    toast({
      title: "AI Assistant",
      description: `Requesting assistance for: ${context} ${study ? `(Study: ${study.studyIdentifier || 'Unnamed'})` : ''}`,
    });
    
    // Here you would integrate with your actual AI assistance API
    // For example, making a call to OpenAI or your own AI service
  };

  // --- Render Logic ---
  if (isLoadingInitialData) {
    return (
      <div className="space-y-8 p-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Section 1: Overall Summary & AI Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Nonclinical Data Overview</CardTitle>
              <CardDescription>Summarize findings and utilize AI for analysis.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Overall Summary Textarea + AI Trigger */}
              <FormField 
                control={form.control} 
                name="overallNonclinicalSummary" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall Nonclinical Summary</FormLabel>
                    <FormControl>
                      <Textarea 
                        rows={6} 
                        placeholder="Provide an executive summary of the nonclinical studies for this IND..."
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} 
              />
              <Separator />
              {/* AI Analysis Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleAiAnalysis('validation')} 
                  disabled={isAiLoading}
                > 
                  {isAiLoading && aiAnalysisType === 'validation' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="mr-2 h-4 w-4" />
                  )}
                  AI: Check Requirements 
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleAiAnalysis('gap_analysis')} 
                  disabled={isAiLoading}
                > 
                  {isAiLoading && aiAnalysisType === 'gap_analysis' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <AlertTriangle className="mr-2 h-4 w-4" />
                  )}
                  AI: Identify Data Gaps 
                </Button>
              </div>
              {/* AI Analysis Result Display */}
              {aiAnalysisResult && (
                <div className="mt-4 p-3 border rounded bg-muted">
                  <p className="text-sm font-medium">AI Analysis Result:</p>
                  <p className="text-sm text-muted-foreground">{aiAnalysisResult}</p>
                </div>
              )}
              {/* Placeholder for AI Gap Analysis Visualization */}
              <div className="mt-4 p-4 border rounded border-dashed text-center text-gray-500">
                <AlertTriangle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="font-semibold">AI Gap Analysis Visualization Area</p>
                <p className="text-xs">Results from "Identify Data Gaps" could be visualized here (e.g., checklist, chart).</p>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Study Data Organization (Now with Implemented Tracker) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Nonclinical Study Inventory</CardTitle>
                <CardDescription>Manage individual nonclinical studies.</CardDescription>
              </div>
              <div className="flex space-x-2">
                {/* AI Parse Text Feature */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <UploadCloud className="mr-2 h-4 w-4" /> 
                      Add via Text (AI)
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Add Study from Text Description</DialogTitle>
                      <DialogDescription>Paste the study description below. AI will attempt to extract key details.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                      <Label htmlFor="study-text-parser">Paste Study Text:</Label>
                      <Textarea
                        id="study-text-parser"
                        rows={10}
                        placeholder="Example: A 28-day repeat-dose toxicology study was conducted in Sprague-Dawley rats..."
                        value={studyTextToParse}
                        onChange={(e) => setStudyTextToParse(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button 
                        type="button" 
                        onClick={handleParseStudyText} 
                        disabled={isParsingText || !studyTextToParse.trim()}
                      >
                        {isParsingText ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Parse with AI & Add
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Manual Add Button */}
                <Button onClick={handleOpenNewStudyDialog}>+ Add Study Manually</Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Implemented Nonclinical Study Tracker */}
              <NonclinicalStudyTracker
                studies={form.watch('studies')} // Watch for changes to update table
                onStudiesChange={handleStudiesChange}
                triggerAiAssistance={handleAiTrigger}
                onEditStudy={handleEditStudy}
                onDeleteStudy={handleDeleteStudy}
              />
            </CardContent>
          </Card>

          {/* Study Editor Dialog */}
          <Dialog open={isStudyEditorOpen} onOpenChange={setIsStudyEditorOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingStudy?.id && form.getValues('studies').some(s => s.id === editingStudy.id) 
                    ? 'Edit Study' 
                    : 'Add New Study'}
                </DialogTitle>
                <DialogDescription>
                  {editingStudy?.id 
                    ? 'Update the study details below.' 
                    : 'Fill in the details for the new study.'}
                </DialogDescription>
              </DialogHeader>
              {/* Render form only when dialog is open */}
              {editingStudy !== null && (
                <StudyEditorForm
                  study={editingStudy}
                  onSave={handleSaveStudy}
                  onCancel={() => { 
                    setIsStudyEditorOpen(false); 
                    setEditingStudy(null); 
                  }}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* Footer Info & Saving Status */}
          <div className="text-center text-sm text-muted-foreground mt-4">
            Use the layout buttons to navigate or save.
          </div>
          {isSaving && (
            <div className="flex items-center justify-center text-sm text-blue-600">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </div>
          )}
          {saveError && (
            <div className="text-center text-sm text-red-600">
              Error saving. Please try again.
            </div>
          )}

          {/* Form Submission Buttons - optional, can use layout buttons instead */}
          <div className="mt-6 flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              disabled={isSaving}
              onClick={() => console.log("Saving draft...", form.getValues())}
            >
              Save Draft
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : "Save and Continue"}
            </Button>
          </div>
        </form>
      </Form>
    </TooltipProvider>
  );
}