// src/components/ind-wizard/steps/PreIndStep.jsx
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useWizard } from '../IndWizardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { format } from "date-fns";
import { AlertCircle, CalendarIcon, HelpCircle, UserPlus, Users, Trash2, Bot, Loader2, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";
import { MilestoneTracker } from './components/MilestoneTracker';
import { milestoneSchema } from './components/milestoneSchema';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

// --- Zod Schema and API Simulation ---
// Define the form schema with zod
const preIndStepSchema = z.object({
  projectName: z.string().min(3, { message: "Project name must be at least 3 characters." }),
  therapeuticArea: z.string().nonempty({ message: "Therapeutic area is required." }),
  projectObjective: z.string().max(500, { message: "Objective cannot exceed 500 characters." }).optional(),
  targetPreIndMeetingDate: z.date().optional(),
  preIndMeetingObjective: z.string().max(1000, "Meeting objective too long").optional(),
  preIndAgendaTopics: z.array(z.string().min(1, "Topic cannot be empty")).optional().default([]),
  preIndAttendees: z.array(z.string().min(1, "Attendee name cannot be empty")).optional().default([]),
  fdaInteractionNotes: z.string().optional(),
  milestones: z.array(z.any()).optional().default([]),
});

// API function for fetching Pre-IND data 
const fetchPreIndData = async (draftId) => {
  console.log("API CALL: Fetching Pre-IND Data for draft:", draftId);
  
  if (!draftId) {
    throw new Error("Draft ID is required to fetch Pre-IND data.");
  }
  
  const response = await fetch(`/api/ind-drafts/${draftId}/pre-ind`);
  
  if (!response.ok) {
    // Handle specific errors if needed (e.g., 404 Not Found) 
    if (response.status === 404) {
      console.warn("No Pre-IND data found for this draft yet.");
      return null; // Return null to indicate no data exists yet
    }
    
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch Pre-IND data (${response.status})`);
  }
  
  const data = await response.json();
  return data.data; // Assuming backend wraps response in { success: true, data: {...} }
};

// API function for saving Pre-IND data
const savePreIndData = async ({ draftId, data }) => {
  console.log("API CALL: Saving Pre-IND Data for draft:", draftId, data);
  
  if (!draftId) {
    throw new Error("Draft ID is required to save Pre-IND data.");
  }
  
  const response = await fetch(`/api/ind-drafts/${draftId}/pre-ind`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  const responseData = await response.json();
  
  if (!response.ok) {
    throw new Error(responseData.message || `Failed to save Pre-IND data (${response.status})`);
  }
  
  return responseData; // Assuming backend returns { success: true, message: '...' }
};

const apiFetchAiSuggestions = async (context, prompt) => {
  console.log("API CALL: Fetching AI Suggestions...", { context, prompt });
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate AI processing time
  
  // Example response based on prompt
  if (prompt.includes("agenda topics")) {
      return [
          "Review of Nonclinical Data Summary",
          "Proposed Clinical Protocol Overview (Phase 1)",
          "CMC Update and Stability Data",
          "Specific Questions for FDA Regarding Protocol Design",
          "Pediatric Study Plan Discussion (if applicable)",
      ];
  } else if (prompt.includes("FDA questions")) {
       return [
          "Are the proposed nonclinical safety studies adequate to support Phase 1 initiation?",
          "Does the FDA concur with the proposed starting dose and dose escalation plan?",
          "Is the proposed patient population for the Phase 1 study acceptable?",
          "Are there specific CMC requirements we should address prior to Phase 2?",
       ];
  }
  return ["AI Suggestion 1", "AI Suggestion 2", "AI Suggestion 3"];
};

// Enhanced PreIndStep component with React Hook Form
export default function PreIndStep() {
  const { indData, updateIndDataSection, goToNextStep, getAiAssistance } = useWizard();

  // State for AI suggestions dialog
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isAiSuggestLoading, setIsAiSuggestLoading] = useState(false);
  const [aiSuggestionType, setAiSuggestionType] = useState(null);
  const [activeTab, setActiveTab] = useState('project-details');

  // Get current draft ID for API calls
  const currentDraftId = localStorage.getItem('currentDraftId') || 'draft-1';

  // --- Simple Data Fetching with useEffect ---
  const [fetchedData, setFetchedData] = useState(null);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
  const [isFetchError, setIsFetchError] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  
  // Fetch data on component mount
  useEffect(() => {
    let isMounted = true;
    let fetchTimeout = null;
    
    const fetchData = async () => {
      if (!currentDraftId) {
        setIsLoadingInitialData(false);
        return;
      }
      
      setIsLoadingInitialData(true);
      setIsFetchError(false);
      
      // Set a timeout to prevent indefinite loading
      fetchTimeout = setTimeout(() => {
        if (isMounted && isLoadingInitialData) {
          console.log("Fetch timeout reached, using default data");
          setIsLoadingInitialData(false);
          // Use default initial data only if no data exists yet
          if (!fetchedData) {
            setFetchedData({
              projectName: "New IND Application",
              therapeuticArea: "",
              projectObjective: "",
              targetPreIndMeetingDate: new Date(),
              preIndMeetingObjective: "",
              preIndAgendaTopics: [],
              preIndAttendees: [],
              fdaInteractionNotes: "",
              milestones: []
            });
          }
        }
      }, 5000); // 5 second timeout
      
      try {
        const data = await fetchPreIndData(currentDraftId);
        
        // Clear the timeout since we got a response
        clearTimeout(fetchTimeout);
        
        // Only update state if component is still mounted
        if (isMounted) {
          setFetchedData(data || {
            projectName: "New IND Application",
            therapeuticArea: "",
            projectObjective: "",
            targetPreIndMeetingDate: new Date(),
            preIndMeetingObjective: "",
            preIndAgendaTopics: [],
            preIndAttendees: [],
            fdaInteractionNotes: "",
            milestones: []
          });
          setIsLoadingInitialData(false);
        }
      } catch (error) {
        // Clear the timeout since we got a response
        clearTimeout(fetchTimeout);
        
        // Only update state if component is still mounted
        if (isMounted) {
          console.error("Error fetching data:", error);
          setIsFetchError(true);
          setFetchError(error);
          setIsLoadingInitialData(false);
          
          // Use default initial data on error (only if no data exists yet)
          if (!fetchedData) {
            setFetchedData({
              projectName: "New IND Application",
              therapeuticArea: "",
              projectObjective: "",
              targetPreIndMeetingDate: new Date(),
              preIndMeetingObjective: "",
              preIndAgendaTopics: [],
              preIndAttendees: [],
              fdaInteractionNotes: "",
              milestones: []
            });
          }
        }
      }
    };
    
    fetchData();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
      if (fetchTimeout) clearTimeout(fetchTimeout);
    };
  }, [currentDraftId, isLoadingInitialData]); // Only re-run if currentDraftId changes

  // --- Form Setup ---
  const form = useForm({
    resolver: zodResolver(preIndStepSchema),
    defaultValues: {
      projectName: '',
      therapeuticArea: '',
      projectObjective: '',
      targetPreIndMeetingDate: undefined,
      preIndMeetingObjective: '',
      preIndAgendaTopics: [],
      preIndAttendees: [],
      fdaInteractionNotes: '',
      milestones: [],
    },
  });

  // Update form with fetched data when it becomes available
  useEffect(() => {
    if (fetchedData) {
      // Map fetched data (potentially API/DB structure) to form structure
      const formData = {
        ...fetchedData,
        // Convert date string from API to Date object for the form/calendar
        targetPreIndMeetingDate: fetchedData.targetPreIndMeetingDate
          ? new Date(fetchedData.targetPreIndMeetingDate)
          : undefined,
        // Ensure arrays are initialized correctly
        preIndAgendaTopics: fetchedData.preIndAgendaTopics || [],
        preIndAttendees: fetchedData.preIndAttendees || [],
        milestones: (fetchedData.milestones || []).map(m => ({
          ...m,
          // Convert milestone due date string to Date object if needed
          dueDate: m.dueDate ? new Date(m.dueDate) : undefined,
        })),
      };
      form.reset(formData); // Reset the form with fetched data
    } else if (indData) {
      // Fallback to context data if API returns no data
      form.reset({
        projectName: indData.projectDetails?.projectName || '',
        therapeuticArea: indData.projectDetails?.therapeuticArea || '',
        projectObjective: indData.projectDetails?.projectObjective || '',
        targetPreIndMeetingDate: indData.preIndMeeting?.targetPreIndMeetingDate 
          ? new Date(indData.preIndMeeting.targetPreIndMeetingDate) 
          : undefined,
        preIndMeetingObjective: indData.preIndMeeting?.preIndMeetingObjective || '',
        preIndAgendaTopics: indData.preIndMeeting?.preIndAgendaTopics || [],
        preIndAttendees: indData.preIndMeeting?.preIndAttendees || [],
        fdaInteractionNotes: indData.preIndMeeting?.fdaInteractionNotes || '',
        milestones: indData.milestones || [],
      });
    }
  }, [fetchedData, indData, form.reset]);

  // useFieldArray for dynamic lists (Agenda, Attendees)
  const { fields: agendaFields, append: appendAgenda, remove: removeAgenda } = useFieldArray({
    control: form.control,
    name: "preIndAgendaTopics"
  });

  const { fields: attendeeFields, append: appendAttendee, remove: removeAttendee } = useFieldArray({
    control: form.control,
    name: "preIndAttendees"
  });

  // --- Data Saving State ---
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Handle form submission -> save data directly
  async function onSubmit(values) {
    console.log("Pre-IND Step Data Submitted:", values);
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // Get the current draft ID
      const currentDraftId = localStorage.getItem('currentDraftId') || 'draft-1';
      
      // Call save function directly
      const data = await savePreIndData({ 
        draftId: currentDraftId, 
        data: values 
      });
      
      // Handle success
      toast({
        title: "Save Successful",
        description: data.message || "Pre-IND data saved successfully.",
      });
      
      // Update context/global state
      updateIndDataSection('projectDetails', form.getValues());
      updateIndDataSection('preIndMeeting', form.getValues());
      updateIndDataSection('milestones', form.getValues('milestones'));
      
      // Refresh data (optional - not needed here since we're navigating away)
      // setFetchedData(values);
      
      // Proceed to next step
      goToNextStep();
    } catch (error) {
      // Handle error
      setSaveError(error);
      toast({
        title: "Save Failed",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  // --- AI Interaction ---
  const handleAiTrigger = async (context, milestone) => {
    console.log("AI Triggered:", { context, milestone });
    getAiAssistance(context);
  };

  const fetchAndShowAiSuggestions = async (type) => {
    setIsAiSuggestLoading(true);
    setAiSuggestionType(type);
    setAiSuggestions([]); // Clear previous suggestions

    const currentData = form.getValues();
    const promptContext = `Project: ${currentData.projectName}, Area: ${currentData.therapeuticArea}, Objective: ${currentData.projectObjective || 'N/A'}`;
    const prompt = type === 'agenda'
        ? `Based on the context [${promptContext}], suggest 5 key agenda topics for a Pre-IND meeting with the FDA.`
        : `Based on the context [${promptContext}], suggest 5 potential questions to ask the FDA during a Pre-IND meeting.`;

    try {
        const suggestions = await apiFetchAiSuggestions(promptContext, prompt);
        setAiSuggestions(suggestions);
    } catch (error) {
        toast({
          title: "Error",
          description: error.message || "Could not fetch suggestions.",
          variant: "destructive",
        });
    } finally {
        setIsAiSuggestLoading(false);
    }
  };

  const addSuggestionToForm = (suggestion) => {
    if (aiSuggestionType === 'agenda') {
        appendAgenda(suggestion);
    } else if (aiSuggestionType === 'questions') {
        form.setValue('fdaInteractionNotes', form.getValues('fdaInteractionNotes') + `\n• ${suggestion}`);
    }
    toast({
      title: "Suggestion Added",
      description: `"${suggestion}" has been added.`
    });
  };

  // Callback for MilestoneTracker
  const handleMilestonesChange = (updatedMilestones) => {
    form.setValue('milestones', updatedMilestones, { shouldValidate: true });
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

  if (isFetchError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Data</AlertTitle>
        <AlertDescription>
          {fetchError?.message || "Could not load Pre-IND data. Please try again later."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <TooltipProvider>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="project-details">Project Details</TabsTrigger>
              <TabsTrigger value="pre-ind-meeting">Pre-IND Meeting</TabsTrigger>
              <TabsTrigger value="milestones">Key Milestones</TabsTrigger>
            </TabsList>

            <TabsContent value="project-details">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    Project Details
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="ml-2" onClick={() => handleAiTrigger("Project Details section guidance")}>
                          <HelpCircle className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Click for AI guidance on project details</p>
                      </TooltipContent>
                    </Tooltip>
                  </CardTitle>
                  <CardDescription>
                    Enter basic information about your investigational product and development program.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="projectName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Name</FormLabel>
                          <div className="flex items-center space-x-2">
                            <FormControl>
                              <Input placeholder="e.g., TrialSage Alpha Study" {...field} />
                            </FormControl>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button type="button" variant="ghost" size="icon" onClick={() => handleAiTrigger('Guidance on project naming conventions.')}>
                                  <HelpCircle className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Get AI guidance on project naming.</p></TooltipContent>
                            </Tooltip>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="therapeuticArea"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Therapeutic Area</FormLabel>
                          <div className="flex items-center space-x-2">
                            <FormControl>
                              <Input placeholder="e.g., Oncology, Neurology, etc." {...field} />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name="projectObjective"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Objective</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Brief description of the development objectives" 
                                {...field} 
                                rows={3}
                              />
                            </FormControl>
                            <FormDescription>
                              Provide a clear statement of the project's aims (500 chars max)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pre-ind-meeting">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    Pre-IND Meeting Planning
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="ml-2" onClick={() => handleAiTrigger("Pre-IND Meeting guidance")}>
                          <HelpCircle className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Click for AI guidance on Pre-IND meetings</p>
                      </TooltipContent>
                    </Tooltip>
                  </CardTitle>
                  <CardDescription>
                    Prepare for your Pre-IND meeting with the FDA
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <FormField
                      control={form.control}
                      name="targetPreIndMeetingDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Target Meeting Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-[240px] pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            Select your desired Pre-IND meeting date
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preIndMeetingObjective"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meeting Objectives</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the objectives of this Pre-IND meeting" 
                              {...field} 
                              rows={3}
                            />
                          </FormControl>
                          <FormDescription>
                            Clearly articulate what you hope to achieve from this FDA interaction
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <FormLabel>Agenda Topics</FormLabel>
                        <div className="flex space-x-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => fetchAndShowAiSuggestions('agenda')}
                                disabled={isAiSuggestLoading}
                              >
                                {isAiSuggestLoading && aiSuggestionType === 'agenda' ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Sparkles className="h-4 w-4 mr-2" />
                                )}
                                AI Suggest Topics
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>AI-Suggested Agenda Topics</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Select topics to add to your agenda
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              {isAiSuggestLoading ? (
                                <div className="flex justify-center py-8">
                                  <Loader2 className="h-8 w-8 animate-spin" />
                                </div>
                              ) : (
                                <div className="py-4 space-y-2">
                                  {aiSuggestions.map((suggestion, i) => (
                                    <div key={i} className="flex justify-between items-center border p-2 rounded">
                                      <p>{suggestion}</p>
                                      <Button 
                                        type="button"
                                        size="sm"
                                        onClick={() => addSuggestionToForm(suggestion)}
                                      >
                                        Add
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <AlertDialogFooter>
                                <AlertDialogCancel>Close</AlertDialogCancel>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <Button 
                            type="button"
                            size="sm" 
                            variant="outline" 
                            onClick={() => appendAgenda("")}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Topic
                          </Button>
                        </div>
                      </div>

                      {agendaFields.length > 0 ? (
                        <div className="space-y-2">
                          {agendaFields.map((field, index) => (
                            <div key={field.id} className="flex items-center gap-2">
                              <FormField
                                control={form.control}
                                name={`preIndAgendaTopics.${index}`}
                                render={({ field }) => (
                                  <FormItem className="flex-1 mb-0">
                                    <FormControl>
                                      <Input {...field} placeholder="Agenda topic" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeAgenda(index)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No agenda topics added yet</p>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <FormLabel>Attendees</FormLabel>
                        <Button 
                          type="button"
                          size="sm" 
                          variant="outline" 
                          onClick={() => appendAttendee("")}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Attendee
                        </Button>
                      </div>

                      {attendeeFields.length > 0 ? (
                        <div className="space-y-2">
                          {attendeeFields.map((field, index) => (
                            <div key={field.id} className="flex items-center gap-2">
                              <FormField
                                control={form.control}
                                name={`preIndAttendees.${index}`}
                                render={({ field }) => (
                                  <FormItem className="flex-1 mb-0">
                                    <FormControl>
                                      <Input {...field} placeholder="Name and role" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeAttendee(index)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No attendees added yet</p>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name="fdaInteractionNotes"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between items-center">
                            <FormLabel>FDA Questions/Notes</FormLabel>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => fetchAndShowAiSuggestions('questions')}
                                  disabled={isAiSuggestLoading}
                                >
                                  {isAiSuggestLoading && aiSuggestionType === 'questions' ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <Sparkles className="h-4 w-4 mr-2" />
                                  )}
                                  AI Suggest Questions
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>AI-Suggested FDA Questions</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Select questions to add to your notes
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                {isAiSuggestLoading ? (
                                  <div className="flex justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                  </div>
                                ) : (
                                  <div className="py-4 space-y-2">
                                    {aiSuggestions.map((suggestion, i) => (
                                      <div key={i} className="flex justify-between items-center border p-2 rounded">
                                        <p>{suggestion}</p>
                                        <Button 
                                          type="button"
                                          size="sm"
                                          onClick={() => addSuggestionToForm(suggestion)}
                                        >
                                          Add
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Close</AlertDialogCancel>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter key questions for the FDA or meeting notes" 
                              {...field} 
                              rows={6}
                            />
                          </FormControl>
                          <FormDescription>
                            Document important questions and notes for FDA discussion
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="milestones">
              <MilestoneTracker 
                initialMilestones={form.getValues('milestones') || []}
                onMilestonesChange={handleMilestonesChange}
                triggerAiAssistance={handleAiTrigger}
              />
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
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