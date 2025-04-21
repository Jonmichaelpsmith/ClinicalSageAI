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
  CardFooter, 
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

export default function PreIndStep() {
  const { indData, updateIndDataSection, getAiAssistance } = useWizard();
  const [activeTab, setActiveTab] = useState('project-details');
  const [isSaving, setIsSaving] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiSuggestionType, setAiSuggestionType] = useState(null);
  const [isLoadingAiSuggestions, setIsLoadingAiSuggestions] = useState(false);
  
  // Load data from the global context, or initialize if not present
  const [projectDetails, setProjectDetails] = useState(indData.projectDetails || {
    projectName: '',
    investigationalProduct: '',
    therapeuticArea: '',
    targetIndication: '',
    developmentPhase: '',
    projectDescription: '',
    startDate: null,
    estimatedSubmissionDate: null,
  });

  const [preIndMeeting, setPreIndMeeting] = useState(indData.preIndMeeting || {
    meetingRequested: false,
    proposedDate: null,
    meetingObjectives: '',
    keyQuestions: '',
    meetingMaterials: [],
    agendaItems: [],
    attendees: [],
    fdaFeedback: '',
  });

  // Handle input changes for project details
  const handleProjectDetailsChange = (e) => {
    const { name, value } = e.target;
    setProjectDetails((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle input changes for pre-IND meeting
  const handlePreIndMeetingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreIndMeeting((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle tab changes and save data
  const handleTabChange = (value) => {
    // Save current tab data
    if (activeTab === 'project-details') {
      updateIndDataSection('projectDetails', projectDetails);
    } else if (activeTab === 'pre-ind-meeting') {
      updateIndDataSection('preIndMeeting', preIndMeeting);
    }
    
    setActiveTab(value);
  };

  // Handle file upload for meeting materials
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // In a real implementation, you would upload these files to your server
    // and then update the state with the file metadata or URLs
    
    // For now, just update the local state with file names
    setPreIndMeeting((prev) => ({
      ...prev,
      meetingMaterials: [
        ...prev.meetingMaterials,
        ...files.map(file => ({ name: file.name, size: file.size }))
      ]
    }));
    
    // Replace alert with more sophisticated notification system in the future
    alert('Files uploaded successfully');
  };
  
  // Add new agenda item
  const handleAddAgendaItem = () => {
    const newAgendaItems = [...(preIndMeeting.agendaItems || []), ''];
    setPreIndMeeting(prev => ({
      ...prev,
      agendaItems: newAgendaItems
    }));
  };
  
  // Update specific agenda item
  const handleAgendaItemChange = (index, value) => {
    const updatedAgendaItems = [...(preIndMeeting.agendaItems || [])];
    updatedAgendaItems[index] = value;
    setPreIndMeeting(prev => ({
      ...prev, 
      agendaItems: updatedAgendaItems
    }));
  };
  
  // Remove agenda item
  const handleRemoveAgendaItem = (index) => {
    const updatedAgendaItems = [...(preIndMeeting.agendaItems || [])];
    updatedAgendaItems.splice(index, 1);
    setPreIndMeeting(prev => ({
      ...prev,
      agendaItems: updatedAgendaItems
    }));
  };
  
  // Add attendee
  const handleAddAttendee = () => {
    const newAttendees = [...(preIndMeeting.attendees || []), ''];
    setPreIndMeeting(prev => ({
      ...prev,
      attendees: newAttendees
    }));
  };
  
  // Update specific attendee
  const handleAttendeeChange = (index, value) => {
    const updatedAttendees = [...(preIndMeeting.attendees || [])];
    updatedAttendees[index] = value;
    setPreIndMeeting(prev => ({
      ...prev,
      attendees: updatedAttendees
    }));
  };
  
  // Remove attendee
  const handleRemoveAttendee = (index) => {
    const updatedAttendees = [...(preIndMeeting.attendees || [])];
    updatedAttendees.splice(index, 1);
    setPreIndMeeting(prev => ({
      ...prev,
      attendees: updatedAttendees
    }));
  };
  
  // Handle save with feedback
  const handleSave = (section) => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      if (section === 'projectDetails') {
        updateIndDataSection('projectDetails', projectDetails);
      } else if (section === 'preIndMeeting') {
        updateIndDataSection('preIndMeeting', preIndMeeting);
      }
      
      setIsSaving(false);
      // Display success notification - would use useToast in production
      alert('Saved successfully');
    }, 800);
  };
  
  // Get AI suggestions
  const fetchAiSuggestions = (type) => {
    setIsLoadingAiSuggestions(true);
    setAiSuggestionType(type);
    
    // Simulated AI suggestion response
    setTimeout(() => {
      let suggestions = [];
      
      if (type === 'agenda') {
        suggestions = [
          "Review of nonclinical data summary",
          "Discussion of proposed clinical trial design",
          "Chemistry, Manufacturing, and Controls (CMC) update",
          "Regulatory strategy alignment",
          "Pediatric study plan discussion (if applicable)"
        ];
      } else if (type === 'questions') {
        suggestions = [
          "Is our nonclinical package sufficient to support Phase 1 studies?",
          "Do you concur with our proposed starting dose and dose escalation plan?",
          "Are there specific safety monitoring requirements for our first-in-human study?",
          "Are additional CMC data needed before IND submission?",
          "Do you agree with our proposed patient population for the Phase 1 study?"
        ];
      }
      
      setAiSuggestions(suggestions);
      setIsLoadingAiSuggestions(false);
    }, 1500);
  };
  
  // Add AI suggestion to appropriate field
  const addAiSuggestion = (suggestion) => {
    if (aiSuggestionType === 'agenda') {
      const newAgendaItems = [...(preIndMeeting.agendaItems || []), suggestion];
      setPreIndMeeting(prev => ({
        ...prev,
        agendaItems: newAgendaItems
      }));
    } else if (aiSuggestionType === 'questions') {
      const currentQuestions = preIndMeeting.keyQuestions || '';
      const newQuestions = currentQuestions 
        ? `${currentQuestions}\n• ${suggestion}` 
        : `• ${suggestion}`;
      
      setPreIndMeeting(prev => ({
        ...prev,
        keyQuestions: newQuestions
      }));
    }
  };

  return (
    <TooltipProvider>
      <Tabs value={activeTab} onValueChange={handleTabChange}>
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
                    <Button variant="ghost" size="icon" className="ml-2" onClick={() => getAiAssistance("Project Details section guidance")}>
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
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input 
                    id="projectName" 
                    name="projectName"
                    value={projectDetails.projectName || ''}
                    onChange={handleProjectDetailsChange}
                    placeholder="Enter project name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="investigationalProduct">Investigational Product</Label>
                  <Input 
                    id="investigationalProduct" 
                    name="investigationalProduct"
                    value={projectDetails.investigationalProduct || ''}
                    onChange={handleProjectDetailsChange}
                    placeholder="Enter drug/biologic name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="therapeuticArea">Therapeutic Area</Label>
                  <Input 
                    id="therapeuticArea" 
                    name="therapeuticArea"
                    value={projectDetails.therapeuticArea || ''}
                    onChange={handleProjectDetailsChange}
                    placeholder="E.g., Oncology, Neurology, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetIndication">Target Indication</Label>
                  <Input 
                    id="targetIndication" 
                    name="targetIndication"
                    value={projectDetails.targetIndication || ''}
                    onChange={handleProjectDetailsChange}
                    placeholder="Specific disease indication"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="developmentPhase">Development Phase</Label>
                  <Input 
                    id="developmentPhase" 
                    name="developmentPhase"
                    value={projectDetails.developmentPhase || ''}
                    onChange={handleProjectDetailsChange}
                    placeholder="E.g., First-in-human, Phase 1"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="projectDescription">Project Description</Label>
                  <Textarea 
                    id="projectDescription" 
                    name="projectDescription"
                    value={projectDetails.projectDescription || ''}
                    onChange={handleProjectDetailsChange}
                    placeholder="Brief description of the development program"
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={() => {
                  updateIndDataSection('projectDetails', projectDetails);
                }}
              >
                Save Details
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="pre-ind-meeting">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                Pre-IND Meeting
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-2" onClick={() => getAiAssistance("Pre-IND Meeting guidance")}>
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click for AI guidance on Pre-IND meetings</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <CardDescription>
                Manage Pre-IND meeting requests and FDA interactions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="meetingRequested" 
                    name="meetingRequested"
                    checked={preIndMeeting.meetingRequested || false}
                    onChange={handlePreIndMeetingChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="meetingRequested">Request Pre-IND Meeting</Label>
                </div>

                {preIndMeeting.meetingRequested && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="meetingObjectives">Meeting Objectives</Label>
                      <Textarea 
                        id="meetingObjectives" 
                        name="meetingObjectives"
                        value={preIndMeeting.meetingObjectives || ''}
                        onChange={handlePreIndMeetingChange}
                        placeholder="Primary objectives for this meeting"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="keyQuestions">Key Questions for FDA</Label>
                      <Textarea 
                        id="keyQuestions" 
                        name="keyQuestions"
                        value={preIndMeeting.keyQuestions || ''}
                        onChange={handlePreIndMeetingChange}
                        placeholder="Specific questions you would like the FDA to address"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="meetingMaterials">Upload Meeting Materials</Label>
                      <Input 
                        id="meetingMaterials"
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-gray-500">
                        Upload briefing documents, background materials, or presentation slides
                      </p>
                    </div>

                    {preIndMeeting.meetingMaterials.length > 0 && (
                      <div className="space-y-2">
                        <Label>Uploaded Materials</Label>
                        <ul className="text-sm space-y-1">
                          {preIndMeeting.meetingMaterials.map((file, index) => (
                            <li key={index} className="flex items-center justify-between">
                              <span>{file.name}</span>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setPreIndMeeting(prev => ({
                                    ...prev,
                                    meetingMaterials: prev.meetingMaterials.filter((_, i) => i !== index)
                                  }));
                                }}
                              >
                                Remove
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="fdaFeedback">FDA Feedback (if received)</Label>
                      <Textarea 
                        id="fdaFeedback" 
                        name="fdaFeedback"
                        value={preIndMeeting.fdaFeedback || ''}
                        onChange={handlePreIndMeetingChange}
                        placeholder="Document key feedback or guidance received from the FDA"
                        rows={3}
                      />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={() => {
                  updateIndDataSection('preIndMeeting', preIndMeeting);
                }}
              >
                Save Meeting Information
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="milestones">
          <div className="space-y-4">
            <MilestoneTracker 
              initialMilestones={indData.milestones || []}
              onMilestonesChange={(milestones) => {
                updateIndDataSection('milestones', milestones);
              }}
              triggerAiAssistance={(context, milestone) => {
                getAiAssistance(`${context} ${milestone ? `for milestone "${milestone.title}"` : ''}`);
              }}
            />
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  getAiAssistance("Suggest typical milestones for Pre-IND phase");
                }}
              >
                Generate Suggested Milestones with AI
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </TooltipProvider>
  );
}