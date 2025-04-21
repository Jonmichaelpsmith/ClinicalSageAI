// src/components/ind-wizard/steps/PreIndStep.jsx
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
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
import { format } from "date-fns";
import { CalendarIcon, HelpCircle, UserPlus, Users, Trash2, Bot, Loader2, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";
import { MilestoneTracker } from './components/MilestoneTracker';
import { milestoneSchema } from './components/milestoneSchema';
import { Skeleton } from '@/components/ui/skeleton';

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

// Simulate API functions (replace with actual API calls)
const apiSavePreIndData = async (data) => {
  console.log("API CALL: Saving Pre-IND Data...", data);
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
  return { success: true, message: "Pre-IND data saved successfully." };
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
  const queryClient = useQueryClient(); // For cache invalidation

  // State for AI suggestions dialog
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isAiSuggestLoading, setIsAiSuggestLoading] = useState(false);
  const [aiSuggestionType, setAiSuggestionType] = useState(null);
  const [activeTab, setActiveTab] = useState('project-details');

  // --- Data Fetching (Example - if loading draft from server) ---
  const { data: initialData, isLoading: isLoadingInitialData } = useQuery({
      queryKey: ['indDraft', 'preIndStepData'], 
      queryFn: async () => {
          console.log("API CALL: Fetching initial Pre-IND draft data...");
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate fetch
          return indData; // Using context data as placeholder for fetched data
      },
      enabled: false, // Set to true if you want to fetch data on mount
      staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // --- Form Setup ---
  const form = useForm({
    resolver: zodResolver(preIndStepSchema),
    defaultValues: initialData || {
        projectName: indData.projectDetails?.projectName || '',
        therapeuticArea: indData.projectDetails?.therapeuticArea || '',
        projectObjective: indData.projectDetails?.projectObjective || '',
        targetPreIndMeetingDate: indData.preIndMeeting?.targetPreIndMeetingDate ? new Date(indData.preIndMeeting.targetPreIndMeetingDate) : undefined,
        preIndMeetingObjective: indData.preIndMeeting?.preIndMeetingObjective || '',
        preIndAgendaTopics: indData.preIndMeeting?.preIndAgendaTopics || [],
        preIndAttendees: indData.preIndMeeting?.preIndAttendees || [],
        fdaInteractionNotes: indData.preIndMeeting?.fdaInteractionNotes || '',
        milestones: indData.milestones || [],
    },
  });

  // useFieldArray for dynamic lists (Agenda, Attendees)
  const { fields: agendaFields, append: appendAgenda, remove: removeAgenda } = useFieldArray({
    control: form.control,
    name: "preIndAgendaTopics"
  });

  const { fields: attendeeFields, append: appendAttendee, remove: removeAttendee } = useFieldArray({
    control: form.control,
    name: "preIndAttendees"
  });

  // --- Data Mutation (Saving) ---
  const mutation = useMutation({
    mutationFn: apiSavePreIndData,
    onSuccess: (data) => {
      alert(data.message);
      // Update context/global state if necessary (or rely on query invalidation)
      updateIndDataSection('projectDetails', form.getValues()); // Update context with saved data
      updateIndDataSection('preIndMeeting', form.getValues());
      updateIndDataSection('milestones', form.getValues('milestones'));
      // Invalidate queries if needed to refetch data elsewhere
      // queryClient.invalidateQueries({ queryKey: ['indDraft', 'preIndStepData'] });
      goToNextStep(); // Proceed to next step on successful save
    },
    onError: (error) => {
      alert(error.message || "An unknown error occurred.");
    },
  });

  // Handle form submission -> trigger mutation
  function onSubmit(values) {
    console.log("Pre-IND Step Data Submitted:", values);
    mutation.mutate(values); // Pass validated data to the mutation
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
        alert(error.message || "Could not fetch suggestions.");
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
    alert(`"${suggestion}" added.`);
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
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
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