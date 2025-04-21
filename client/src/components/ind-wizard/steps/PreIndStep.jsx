// src/components/ind-wizard/steps/PreIndStep.jsx
import React, { useState } from 'react';
import { useWizard } from '../IndWizardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { HelpCircle } from 'lucide-react';

export default function PreIndStep() {
  const { indData, updateIndDataSection, getAiAssistance } = useWizard();
  const [activeTab, setActiveTab] = useState('project-details');
  
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
    
    alert('Files uploaded successfully');
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
          <Card>
            <CardHeader>
              <CardTitle>Key Milestones</CardTitle>
              <CardDescription>
                Set and track key milestones for your IND preparation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* In a real implementation, this would be a component like MilestoneTracker */}
              <div className="p-20 border rounded flex flex-col items-center justify-center text-center">
                <h3 className="text-lg font-semibold mb-2">Milestone Tracker</h3>
                <p className="text-gray-500 mb-4">Track important dates and deliverables for your IND submission</p>
                <Button 
                  onClick={() => {
                    getAiAssistance("Suggest milestones for Pre-IND phase");
                  }}
                >
                  Generate Suggested Milestones with AI
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </TooltipProvider>
  );
}