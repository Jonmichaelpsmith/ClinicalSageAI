/**
 * IND Project Dashboard
 * 
 * A comprehensive dashboard for IND projects with AI-guided project management
 * capabilities, including status tracking, timeline visualization, and task management.
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Clipboard, 
  ClipboardCheck, 
  BookOpen, 
  Calendar, 
  Clock, 
  AlertCircle, 
  ChevronDown, 
  ChevronRight, 
  File, 
  PlusCircle, 
  MoreHorizontal, 
  Users, 
  Microscope, 
  Pill, 
  FileText, 
  Folder, 
  Archive, 
  RotateCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info 
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Import custom components
import AIRegulatoryAdvisor from './AIRegulatoryAdvisor';

export function INDProjectDashboard({ projectId }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    assignee: '',
    priority: 'medium'
  });

  // Fetch project data
  const { 
    data: project, 
    isLoading: isProjectLoading, 
    refetch: refetchProject 
  } = useQuery({
    queryKey: ['ind-project', projectId],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/ind/projects/${projectId}`);
        if (!response.ok) throw new Error('Failed to fetch project');
        return response.json();
      } catch (error) {
        console.error('Error fetching project:', error);
        
        // Fallback for demo/development
        return {
          id: projectId || '12345',
          name: 'Enzymax Forte IND Submission',
          drugName: 'Enzymax Forte',
          indication: 'Treatment of Severe Pancreatic Enzyme Deficiency',
          sponsor: 'TrialSage Pharmaceuticals',
          status: 'in_progress',
          phase: 'Phase 1',
          startDate: '2025-03-15',
          targetSubmissionDate: '2025-07-30',
          progress: 65,
          principalInvestigator: 'Dr. Jane Smith',
          team: [
            { id: 1, name: 'Dr. Jane Smith', role: 'Principal Investigator' },
            { id: 2, name: 'Robert Johnson', role: 'Regulatory Affairs Manager' },
            { id: 3, name: 'Sarah Williams', role: 'Clinical Research Coordinator' },
            { id: 4, name: 'Michael Chen', role: 'CMC Lead' }
          ],
          sections: [
            { id: 'pre-ind', name: 'Pre-IND Planning', status: 'completed', progress: 100 },
            { id: 'nonclinical', name: 'Nonclinical Data', status: 'completed', progress: 100 },
            { id: 'cmc', name: 'CMC', status: 'in_progress', progress: 80 },
            { id: 'clinical-protocol', name: 'Clinical Protocol', status: 'in_progress', progress: 70 },
            { id: 'investigator-brochure', name: 'Investigator Brochure', status: 'in_progress', progress: 50 },
            { id: 'fda-forms', name: 'FDA Forms', status: 'in_progress', progress: 40 },
            { id: 'final-assembly', name: 'Final Assembly', status: 'not_started', progress: 0 }
          ],
          tasks: [
            { 
              id: 1, 
              title: 'Complete toxicology report review', 
              description: 'Review the final toxicology report for completeness and accuracy',
              status: 'completed', 
              assignee: 'Michael Chen',
              dueDate: '2025-03-30',
              priority: 'high'
            },
            { 
              id: 2, 
              title: 'Finalize CMC section 3.2.P', 
              description: 'Complete drug product specifications and stability data',
              status: 'in_progress', 
              assignee: 'Sarah Williams',
              dueDate: '2025-04-15',
              priority: 'high'
            },
            { 
              id: 3, 
              title: 'Draft clinical protocol synopsis', 
              description: 'Create a comprehensive synopsis of the Phase 1 clinical trial protocol',
              status: 'in_progress', 
              assignee: 'Dr. Jane Smith',
              dueDate: '2025-04-22',
              priority: 'medium'
            },
            { 
              id: 4, 
              title: 'Prepare Form FDA 1571', 
              description: 'Complete all sections of the main IND application form',
              status: 'not_started', 
              assignee: 'Robert Johnson',
              dueDate: '2025-05-10',
              priority: 'medium'
            },
            { 
              id: 5, 
              title: 'Schedule Pre-IND meeting', 
              description: 'Coordinate with FDA for Pre-IND meeting and prepare briefing document',
              status: 'completed', 
              assignee: 'Robert Johnson',
              dueDate: '2025-03-01',
              priority: 'high'
            }
          ],
          documents: [
            { 
              id: 'doc1', 
              name: 'Enzymax Forte Toxicology Report', 
              type: 'Nonclinical',
              uploadDate: '2025-03-10',
              status: 'approved'
            },
            { 
              id: 'doc2', 
              name: 'CMC Manufacturing Process', 
              type: 'CMC',
              uploadDate: '2025-03-25',
              status: 'under_review'
            },
            { 
              id: 'doc3', 
              name: 'Draft Clinical Protocol', 
              type: 'Clinical',
              uploadDate: '2025-04-05',
              status: 'in_progress'
            },
            { 
              id: 'doc4', 
              name: 'Pre-IND Meeting Minutes', 
              type: 'Regulatory',
              uploadDate: '2025-03-05',
              status: 'approved'
            }
          ],
          timeline: [
            { 
              id: 1, 
              title: 'Project Initiation', 
              date: '2025-03-15',
              status: 'completed'
            },
            { 
              id: 2, 
              title: 'Pre-IND Meeting', 
              date: '2025-03-01',
              status: 'completed'
            },
            { 
              id: 3, 
              title: 'Complete Nonclinical Package', 
              date: '2025-04-15',
              status: 'in_progress'
            },
            { 
              id: 4, 
              title: 'Finalize CMC Section', 
              date: '2025-05-30',
              status: 'not_started'
            },
            { 
              id: 5, 
              title: 'Complete Clinical Protocol', 
              date: '2025-06-15',
              status: 'not_started'
            },
            { 
              id: 6, 
              title: 'IND Submission', 
              date: '2025-07-30',
              status: 'not_started'
            },
          ],
          riskAssessment: {
            overall: 'medium',
            categories: [
              { name: 'CMC Readiness', level: 'medium', details: 'Stability data may not have sufficient time points' },
              { name: 'Nonclinical Safety', level: 'low', details: 'Complete toxicology package with no significant findings' },
              { name: 'Clinical Protocol', level: 'medium', details: 'Endpoint selection needs additional justification' },
              { name: 'Regulatory Strategy', level: 'low', details: 'Clear pathway with positive Pre-IND feedback' }
            ]
          }
        };
      }
    },
    enabled: !!projectId
  });

  // Fetch AI-generated project insights
  const { 
    data: projectInsights, 
    isLoading: isInsightsLoading 
  } = useQuery({
    queryKey: ['ind-project-insights', projectId],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/ind/projects/${projectId}/insights`);
        if (!response.ok) throw new Error('Failed to fetch insights');
        return response.json();
      } catch (error) {
        console.error('Error fetching insights:', error);
        
        // Fallback for demo
        return {
          status: {
            summary: 'On track with some minor delays',
            recommendation: 'Focus on completing the CMC section to maintain timeline'
          },
          criticalPath: [
            'Finalize drug product specifications',
            'Complete clinical protocol',
            'Prepare and review Form FDA 1571'
          ],
          timelineAssessment: {
            prediction: 'Current progress suggests submission by August 15, 2025',
            confidence: 'medium',
            potentialDelays: [
              'Stability data collection',
              'Clinical protocol review cycles'
            ]
          }
        };
      }
    },
    enabled: !!projectId
  });

  // Update task status mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }) => {
      try {
        const response = await apiRequest('PATCH', `/api/ind/projects/${projectId}/tasks/${taskId}`, {
          status
        });
        
        if (!response.ok) throw new Error('Failed to update task');
        return response.json();
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Task Updated',
        description: 'The task status has been updated successfully.'
      });
      refetchProject();
    },
    onError: (error) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update task status',
        variant: 'destructive'
      });
    }
  });

  // Create new task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      try {
        const response = await apiRequest('POST', `/api/ind/projects/${projectId}/tasks`, taskData);
        
        if (!response.ok) throw new Error('Failed to create task');
        return response.json();
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Task Created',
        description: 'New task has been created successfully.'
      });
      setIsCreatingTask(false);
      setNewTask({
        title: '',
        description: '',
        dueDate: '',
        assignee: '',
        priority: 'medium'
      });
      refetchProject();
    },
    onError: (error) => {
      toast({
        title: 'Creation Failed',
        description: error.message || 'Failed to create new task',
        variant: 'destructive'
      });
    }
  });

  // Handle task status change
  const handleTaskStatusChange = (taskId, newStatus) => {
    updateTaskMutation.mutate({ taskId, status: newStatus });
  };

  // Handle task creation
  const handleCreateTask = () => {
    if (!newTask.title) {
      toast({
        title: 'Validation Error',
        description: 'Task title is required',
        variant: 'destructive'
      });
      return;
    }
    
    createTaskMutation.mutate({
      ...newTask,
      status: 'not_started'
    });
  };

  // Handle new task input change
  const handleNewTaskChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Get status badge variant
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>;
      case 'not_started':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">Not Started</Badge>;
      case 'at_risk':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">At Risk</Badge>;
      case 'overdue':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  if (isProjectLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RotateCw className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading project data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{project?.name}</h1>
          <p className="text-muted-foreground">{project?.drugName} - {project?.indication}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {getStatusBadge(project?.status)}
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>
      
      {/* Project Stats & Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project?.progress || 0}%</div>
            <Progress value={project?.progress || 0} className="h-2 mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Target Submission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Date(project?.targetSubmissionDate).toLocaleDateString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Clock className="h-3 w-3 inline mr-1" />
              {projectInsights?.timelineAssessment?.prediction || 'On schedule'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project?.tasks?.filter(t => t.status === 'completed').length || 0}/
              {project?.tasks?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <CheckCircle2 className="h-3 w-3 inline mr-1" />
              {project?.tasks?.filter(t => t.status === 'completed').length || 0} tasks completed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {project?.riskAssessment?.overall || 'Low'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <AlertTriangle className="h-3 w-3 inline mr-1" />
              {project?.riskAssessment?.categories?.filter(c => c.level === 'high').length || 0} high risk items
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sections">IND Sections</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Project Status Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Status</CardTitle>
                  <CardDescription>Current status of your IND submission project</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {projectInsights?.status?.summary && (
                    <div className="bg-slate-50 p-4 rounded-md">
                      <p className="font-medium">{projectInsights.status.summary}</p>
                      <p className="text-sm text-muted-foreground mt-1">{projectInsights.status.recommendation}</p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-medium mb-2">Critical Path Items</h3>
                    <ul className="space-y-2">
                      {projectInsights?.criticalPath?.map((item, i) => (
                        <li key={i} className="flex items-center">
                          <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Section Progress</h3>
                    <div className="space-y-3">
                      {project?.sections?.map((section) => (
                        <div key={section.id} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{section.name}</span>
                            <span className="text-sm text-muted-foreground">{section.progress}%</span>
                          </div>
                          <Progress value={section.progress} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates on your IND submission project</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-4">
                      {/* Activity items would normally be fetched from API */}
                      <div className="flex items-start">
                        <div className="bg-primary/10 p-1 rounded-full mr-3">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm">CMC section updated with new stability data</p>
                          <p className="text-xs text-muted-foreground">Today at 9:42 AM</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="bg-green-100 p-1 rounded-full mr-3">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm">Task "Complete toxicology report review" marked as completed</p>
                          <p className="text-xs text-muted-foreground">Yesterday at 4:30 PM</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="bg-blue-100 p-1 rounded-full mr-3">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm">Team meeting: Clinical protocol review scheduled</p>
                          <p className="text-xs text-muted-foreground">Yesterday at 2:15 PM</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="bg-red-100 p-1 rounded-full mr-3">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm">Risk identified: Additional stability data needed for drug product</p>
                          <p className="text-xs text-muted-foreground">April 25 at 10:18 AM</p>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
            
            {/* AI Regulatory Advisor */}
            <div className="lg:col-span-1">
              <AIRegulatoryAdvisor 
                projectId={projectId} 
                currentStep="overview" 
                indData={project} 
              />
            </div>
          </div>
        </TabsContent>
        
        {/* IND Sections Tab */}
        <TabsContent value="sections" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>IND Sections</CardTitle>
                  <CardDescription>Status of each required section for your IND submission</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {project?.sections?.map((section) => (
                      <div key={section.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{section.name}</h3>
                            <p className="text-sm text-muted-foreground">{section.progress}% complete</p>
                          </div>
                          {getStatusBadge(section.status)}
                        </div>
                        
                        <Progress value={section.progress} className="h-2 mb-3" />
                        
                        <div className="flex justify-end">
                          <Button variant="outline" size="sm">
                            <ChevronRight className="h-4 w-4 mr-1" />
                            Open Section
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Focus</CardTitle>
                  <CardDescription>AI-suggested priority areas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                      <h4 className="font-medium text-amber-800 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Priority Sections
                      </h4>
                      <ul className="mt-2 space-y-2">
                        <li className="text-sm flex items-start">
                          <ChevronRight className="h-4 w-4 mr-1 shrink-0 mt-0.5" />
                          <span>
                            <strong>CMC Section:</strong> Complete stability data documentation (80% complete)
                          </span>
                        </li>
                        <li className="text-sm flex items-start">
                          <ChevronRight className="h-4 w-4 mr-1 shrink-0 mt-0.5" />
                          <span>
                            <strong>Clinical Protocol:</strong> Finalize dosing regimen (70% complete)
                          </span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                      <h4 className="font-medium text-green-800 flex items-center">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Completed Sections
                      </h4>
                      <ul className="mt-2 space-y-1">
                        <li className="text-sm">Pre-IND Planning</li>
                        <li className="text-sm">Nonclinical Data</li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <h4 className="font-medium text-blue-800 flex items-center">
                        <Info className="h-4 w-4 mr-2" />
                        Tips for Efficiency
                      </h4>
                      <p className="text-sm mt-2">
                        Focus on drafting FDA Form 1571 in parallel with completing clinical protocol to expedite final assembly.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Tasks Tab */}
        <TabsContent value="tasks" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Project Tasks</h2>
            <Button onClick={() => setIsCreatingTask(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Not Started Tasks */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  Not Started
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {project?.tasks?.filter(task => task.status === 'not_started').map((task) => (
                      <div key={task.id} className="bg-slate-50 rounded-lg p-3 border">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{task.title}</h3>
                          {getPriorityBadge(task.priority)}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                        
                        <div className="flex justify-between items-center text-sm">
                          <div className="text-muted-foreground">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                          
                          <div className="text-muted-foreground">
                            <Users className="h-3 w-3 inline mr-1" />
                            {task.assignee}
                          </div>
                        </div>
                        
                        <div className="flex justify-end mt-3 space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleTaskStatusChange(task.id, 'in_progress')}
                          >
                            Start
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {project?.tasks?.filter(task => task.status === 'not_started').length === 0 && (
                      <div className="text-center p-6 text-muted-foreground">
                        <ClipboardCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No tasks waiting to be started</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            
            {/* In Progress Tasks */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <RotateCw className="h-4 w-4 mr-2 text-blue-600" />
                  In Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {project?.tasks?.filter(task => task.status === 'in_progress').map((task) => (
                      <div key={task.id} className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{task.title}</h3>
                          {getPriorityBadge(task.priority)}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                        
                        <div className="flex justify-between items-center text-sm">
                          <div className="text-muted-foreground">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                          
                          <div className="text-muted-foreground">
                            <Users className="h-3 w-3 inline mr-1" />
                            {task.assignee}
                          </div>
                        </div>
                        
                        <div className="flex justify-end mt-3 space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleTaskStatusChange(task.id, 'completed')}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {project?.tasks?.filter(task => task.status === 'in_progress').length === 0 && (
                      <div className="text-center p-6 text-muted-foreground">
                        <Clipboard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No tasks in progress</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            
            {/* Completed Tasks */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {project?.tasks?.filter(task => task.status === 'completed').map((task) => (
                      <div key={task.id} className="bg-green-50 rounded-lg p-3 border border-green-100">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{task.title}</h3>
                          {getPriorityBadge(task.priority)}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                        
                        <div className="flex justify-between items-center text-sm">
                          <div className="text-muted-foreground">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                          
                          <div className="text-muted-foreground">
                            <Users className="h-3 w-3 inline mr-1" />
                            {task.assignee}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {project?.tasks?.filter(task => task.status === 'completed').length === 0 && (
                      <div className="text-center p-6 text-muted-foreground">
                        <Clipboard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No completed tasks yet</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
          
          {/* Task Creation Dialog */}
          <Dialog open={isCreatingTask} onOpenChange={setIsCreatingTask}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Add a new task to your IND project
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input 
                    id="title" 
                    name="title"
                    value={newTask.title} 
                    onChange={handleNewTaskChange} 
                    placeholder="Enter task title" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input 
                    id="description" 
                    name="description"
                    value={newTask.description} 
                    onChange={handleNewTaskChange} 
                    placeholder="Enter task description" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assignee">Assignee</Label>
                    <Input 
                      id="assignee" 
                      name="assignee"
                      value={newTask.assignee} 
                      onChange={handleNewTaskChange} 
                      placeholder="Enter assignee name" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input 
                      id="dueDate" 
                      name="dueDate"
                      type="date" 
                      value={newTask.dueDate} 
                      onChange={handleNewTaskChange} 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select 
                    id="priority" 
                    name="priority"
                    value={newTask.priority} 
                    onChange={handleNewTaskChange}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreatingTask(false)}>Cancel</Button>
                <Button onClick={handleCreateTask}>Create Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        {/* Documents Tab */}
        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Project Documents</CardTitle>
                  <CardDescription>Manage all documents related to your IND submission</CardDescription>
                </div>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Document Name</th>
                      <th className="text-left p-2 font-medium">Type</th>
                      <th className="text-left p-2 font-medium">Date</th>
                      <th className="text-left p-2 font-medium">Status</th>
                      <th className="text-left p-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project?.documents?.map((doc) => (
                      <tr key={doc.id} className="border-b">
                        <td className="p-2">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-blue-600" />
                            {doc.name}
                          </div>
                        </td>
                        <td className="p-2">{doc.type}</td>
                        <td className="p-2">{new Date(doc.uploadDate).toLocaleDateString()}</td>
                        <td className="p-2">
                          {doc.status === 'approved' && <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>}
                          {doc.status === 'in_progress' && <Badge variant="outline" className="bg-blue-100 text-blue-800">In Progress</Badge>}
                          {doc.status === 'under_review' && <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Under Review</Badge>}
                        </td>
                        <td className="p-2">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">View</Button>
                            <Button variant="outline" size="sm">Download</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Timeline Tab */}
        <TabsContent value="timeline" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Project Timeline</CardTitle>
                  <CardDescription>Key milestones and deadlines for your IND submission</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative pl-6 border-l-2 border-slate-200 space-y-8">
                    {project?.timeline?.map((event, i) => (
                      <div key={event.id} className="relative">
                        <div 
                          className={`absolute -left-[25px] h-10 w-10 rounded-full flex items-center justify-center ${
                            event.status === 'completed' ? 'bg-green-100' : 
                            event.status === 'in_progress' ? 'bg-blue-100' : 
                            'bg-slate-100'
                          }`}
                        >
                          {event.status === 'completed' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : event.status === 'in_progress' ? (
                            <Clock className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Calendar className="h-5 w-5 text-slate-600" />
                          )}
                        </div>
                        
                        <div className="pb-4">
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.date).toLocaleDateString()}
                          </p>
                          <h3 className="font-medium mt-1">{event.title}</h3>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Timeline Assessment</CardTitle>
                  <CardDescription>AI-powered timeline analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {projectInsights?.timelineAssessment && (
                    <>
                      <div className="bg-slate-50 p-4 rounded-md">
                        <p className="font-medium">{projectInsights.timelineAssessment.prediction}</p>
                        <Badge className="mt-2" variant="outline">
                          {projectInsights.timelineAssessment.confidence} confidence
                        </Badge>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Potential Delays</h4>
                        <ul className="space-y-2">
                          {projectInsights.timelineAssessment.potentialDelays?.map((delay, i) => (
                            <li key={i} className="flex items-center text-sm">
                              <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                              <span>{delay}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                  
                  <div className="pt-4">
                    <Button variant="outline" className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      Update Timeline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default INDProjectDashboard;