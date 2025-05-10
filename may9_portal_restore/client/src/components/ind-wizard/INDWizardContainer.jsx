/**
 * IND Wizard Container
 * 
 * A comprehensive multi-page application for creating and managing Investigational New Drug (IND) applications
 * with intelligent document generation, regulatory guidance, and AI-powered medical writing.
 */

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Route, Switch, useLocation, useRoute, Link } from 'wouter';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronRight, 
  FileText, 
  Clipboard, 
  BookOpen, 
  Calendar, 
  Users, 
  FileCheck,
  BarChart,
  Settings,
  PencilRuler,
  GraduationCap,
  MessageSquare,
  HelpCircle,
  Beaker,
  Clock,
  Home,
  ClipboardList,
  AlertCircle,
  Plus as PlusIcon
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';

// Import wizard step components
import FdaFormsStep from './steps/FdaFormsStep';
import RegulatoryIntelligenceStep from './steps/RegulatoryIntelligenceStep';
import ProtocolBuilderStep from './steps/ProtocolBuilderStep';
import CmcStep from './steps/CmcStep';
import { useDatabaseStatus } from '@/components/providers/database-status-provider';
import ErrorBoundary from '@/components/ui/error-boundary';
import { LumenAssistantButton, LumenAssistant } from '@/components/assistant';

// IND Wizard Steps
const IND_WIZARD_STEPS = [
  { 
    id: 'overview', 
    title: 'Project Overview', 
    icon: Home, 
    path: '/ind-wizard',
    exact: true
  },
  { 
    id: 'regulatory-intelligence', 
    title: 'Regulatory Intelligence', 
    icon: BookCheck, 
    path: '/ind-wizard/regulatory-intelligence',
  },
  { 
    id: 'protocol', 
    title: 'Protocol Builder', 
    icon: BookOpen, 
    path: '/ind-wizard/protocol',
    hasSubSteps: true,
    subSteps: [
      { id: 'protocol-objectives', title: 'Objectives & Endpoints' },
      { id: 'protocol-design', title: 'Study Design' },
      { id: 'protocol-population', title: 'Population' },
      { id: 'protocol-procedures', title: 'Procedures' },
      { id: 'protocol-safety', title: 'Safety' },
      { id: 'protocol-review', title: 'Protocol Review' }
    ]
  },
  { 
    id: 'cmc', 
    title: 'CMC Section', 
    icon: Beaker, 
    path: '/ind-wizard/cmc',
    hasSubSteps: true,
    subSteps: [
      { id: 'cmc-drug-substance', title: 'Drug Substance' },
      { id: 'cmc-drug-product', title: 'Drug Product' },
      { id: 'cmc-manufacturing', title: 'Manufacturing' },
      { id: 'cmc-controls', title: 'Controls' },
      { id: 'cmc-stability', title: 'Stability' }
    ]
  },
  { 
    id: 'nonclinical', 
    title: 'Nonclinical Data', 
    icon: Clipboard, 
    path: '/ind-wizard/nonclinical',
    hasSubSteps: true,
    subSteps: [
      { id: 'nonclinical-pharm', title: 'Pharmacology' },
      { id: 'nonclinical-adme', title: 'ADME' },
      { id: 'nonclinical-tox', title: 'Toxicology' },
      { id: 'nonclinical-data', title: 'Data Summary' }
    ]
  },
  { 
    id: 'clinical', 
    title: 'Clinical Data', 
    icon: Users, 
    path: '/ind-wizard/clinical',
    hasSubSteps: true,
    subSteps: [
      { id: 'clinical-summary', title: 'Clinical Summary' },
      { id: 'clinical-studies', title: 'Previous Studies' },
      { id: 'clinical-safety', title: 'Safety & Efficacy' },
      { id: 'clinical-risk-analysis', title: 'Risk Analysis' }
    ]
  },
  { 
    id: 'forms', 
    title: 'FDA Forms', 
    icon: FileText, 
    path: '/ind-wizard/forms'
  },
  { 
    id: 'monitoring', 
    title: 'Study Monitoring', 
    icon: BarChart, 
    path: '/ind-wizard/monitoring'
  },
  { 
    id: 'investigators', 
    title: 'Investigators', 
    icon: Users, 
    path: '/ind-wizard/investigators'
  },
  { 
    id: 'irb', 
    title: 'IRB Submissions', 
    icon: ClipboardList, 
    path: '/ind-wizard/irb'
  },
  { 
    id: 'medical-writer', 
    title: 'Medical Writer', 
    icon: PencilRuler, 
    path: '/ind-wizard/medical-writer'
  },
  { 
    id: 'timelines', 
    title: 'Project Timeline', 
    icon: Calendar, 
    path: '/ind-wizard/timelines'
  },
  { 
    id: 'review', 
    title: 'Regulatory Review', 
    icon: FileCheck, 
    path: '/ind-wizard/review'
  },
  { 
    id: 'ai-assistant', 
    title: 'AI Assistant', 
    icon: MessageSquare, 
    path: '/ind-wizard/ai-assistant'
  },
  { 
    id: 'training', 
    title: 'Training Resources', 
    icon: GraduationCap, 
    path: '/ind-wizard/training'
  }
];

// Project status badges
const ProjectStatusBadge = ({ status }) => {
  const statusConfig = {
    draft: { 
      label: 'Draft', 
      className: 'bg-gray-100 text-gray-800 border-gray-200' 
    },
    in_progress: { 
      label: 'In Progress', 
      className: 'bg-blue-100 text-blue-800 border-blue-200' 
    },
    review: { 
      label: 'Under Review', 
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200' 
    },
    submitted: { 
      label: 'Submitted', 
      className: 'bg-green-100 text-green-800 border-green-200' 
    },
    approved: { 
      label: 'Approved', 
      className: 'bg-green-100 text-green-800 border-green-200' 
    },
    needs_revision: { 
      label: 'Needs Revision', 
      className: 'bg-orange-100 text-orange-800 border-orange-200' 
    }
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};

// Navigation Sidebar
const WizardSidebar = ({ steps, activeStep, projectId, projectData }) => {
  const [location, setLocation] = useLocation();
  
  return (
    <div className="w-64 bg-white border-r flex flex-col h-full overflow-auto">
      <div className="p-4 border-b">
        <h3 className="font-bold truncate">{projectData?.title || 'IND Project'}</h3>
        <div className="flex items-center justify-between mt-1">
          <ProjectStatusBadge status={projectData?.status || 'draft'} />
          <span className="text-xs text-muted-foreground">ID: {projectId}</span>
        </div>
        <Progress 
          value={projectData?.completionPercentage || 0} 
          className="h-1.5 mt-3" 
          indicatorClassName="bg-primary"
        />
        <div className="flex justify-between text-xs mt-1">
          <span>{projectData?.completionPercentage || 0}% Complete</span>
          <span>{projectData?.estimatedDaysRemaining || '--'} days remaining</span>
        </div>
      </div>
      
      <div className="flex-1 py-2">
        {steps.map((step) => {
          const isActiveStep = step.id === activeStep || location === step.path;
          
          return (
            <div key={step.id} className="mb-1">
              <Link href={step.path}>
                <a 
                  className={cn(
                    "flex items-center px-4 py-2 text-sm hover:bg-muted/50 rounded-md mx-2",
                    isActiveStep && "bg-muted font-medium"
                  )}
                >
                  <step.icon className="h-4 w-4 mr-3 text-muted-foreground" />
                  {step.title}
                  {step.hasSubSteps && <ChevronRight className="h-4 w-4 ml-auto" />}
                </a>
              </Link>
              
              {step.hasSubSteps && isActiveStep && (
                <div className="ml-6 mt-1 space-y-1 pl-4 border-l border-muted">
                  {step.subSteps.map((subStep) => (
                    <Link key={subStep.id} href={`${step.path}/${subStep.id}`}>
                      <a className="flex items-center py-1 px-3 text-xs hover:text-primary transition-colors">
                        {subStep.title}
                      </a>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="p-4 border-t mt-auto">
        <div className="flex items-center space-x-2">
          <Link href="/dashboard">
            <a className="text-xs text-muted-foreground hover:text-primary flex items-center">
              <HelpCircle className="h-3 w-3 mr-1" /> 
              Need Help?
            </a>
          </Link>
          
          <span className="text-muted-foreground">|</span>
          
          <Link href="/dashboard/settings">
            <a className="text-xs text-muted-foreground hover:text-primary flex items-center">
              <Settings className="h-3 w-3 mr-1" /> 
              Settings
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Project Header
const ProjectHeader = ({ projectId, projectData }) => {
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = async () => {
    setIsSaving(true);
    // Simulate saving
    setTimeout(() => setIsSaving(false), 1500);
  };
  
  return (
    <div className="bg-white border-b py-3 px-6 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard">
          <a className="text-sm text-muted-foreground hover:text-primary">
            Dashboard
          </a>
        </Link>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">IND Wizard</span>
        {projectData?.title && (
          <>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{projectData.title}</span>
          </>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="text-xs text-muted-foreground flex items-center mr-4">
          <Clock className="h-3.5 w-3.5 mr-1" />
          <span>
            {projectData?.lastSaved 
              ? `Last saved: ${new Date(projectData.lastSaved).toLocaleString()}` 
              : 'Not saved yet'}
          </span>
        </div>
        
        <Button variant="outline" size="sm" disabled={isSaving} onClick={handleSave}>
          {isSaving ? 'Saving...' : 'Save Progress'}
        </Button>
        
        <Link href="/dashboard/projects/preview">
          <a>
            <Button variant="outline" size="sm">Preview</Button>
          </a>
        </Link>
        
        <Button size="sm">Submit IND</Button>
      </div>
    </div>
  );
};

// Project Overview
const ProjectOverview = ({ projectId, projectData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Overall Completion</span>
                <span className="text-sm">{projectData?.completionPercentage || 0}%</span>
              </div>
              <Progress value={projectData?.completionPercentage || 0} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Target Submission</p>
                <p className="font-medium">{projectData?.targetSubmissionDate || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimated Completion</p>
                <p className="font-medium">{projectData?.estimatedCompletionDate || 'Not calculated'}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Review Status</p>
              <ProjectStatusBadge status={projectData?.status || 'draft'} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Critical Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(projectData?.criticalTasks || []).map((task, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${task.overdue ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                  <span className="text-sm">{task.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{task.dueDate}</span>
              </div>
            ))}
            
            {(!projectData?.criticalTasks || projectData.criticalTasks.length === 0) && (
              <p className="text-sm text-muted-foreground">No critical tasks at this time</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Regulatory Guidance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(projectData?.regulatoryUpdates || []).map((update, index) => (
              <div key={index} className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{update.title}</p>
                  <p className="text-xs text-muted-foreground">{update.date}</p>
                </div>
              </div>
            ))}
            
            {(!projectData?.regulatoryUpdates || projectData.regulatoryUpdates.length === 0) && (
              <p className="text-sm text-muted-foreground">No recent regulatory updates</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Project Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Drug Information</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Drug Name:</span>{' '}
                  <span>{projectData?.drugName || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Indication:</span>{' '}
                  <span>{projectData?.indication || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Phase:</span>{' '}
                  <span>{projectData?.phase || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Route of Administration:</span>{' '}
                  <span>{projectData?.routeOfAdministration || 'Not specified'}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-1">Project Team</h4>
              <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
                {(projectData?.team || []).map((member, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                ))}
                
                {(!projectData?.team || projectData.team.length === 0) && (
                  <p className="text-sm text-muted-foreground">No team members assigned</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(projectData?.recentActivity || []).map((activity, index) => (
              <div key={index} className="flex items-start space-x-2">
                <activity.icon className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
            
            {(!projectData?.recentActivity || projectData.recentActivity.length === 0) && (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Main IND Wizard Container Component
 */
export default function INDWizardContainer({ projectId = '12345' }) {
  const [location, setLocation] = useLocation();
  const [activeStep, setActiveStep] = useState('overview');
  const { isConnected } = useDatabaseStatus();
  const [loadedProjects, setLoadedProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Get the active step ID from the URL path
  useEffect(() => {
    const path = location;
    const step = IND_WIZARD_STEPS.find(s => path.startsWith(s.path));
    if (step) {
      setActiveStep(step.id);
    } else {
      setActiveStep('overview');
    }
  }, [location]);
  
  // Fetch list of projects first
  const {
    data: projectsList,
    isLoading: isLoadingProjects,
    error: projectsError
  } = useQuery({
    queryKey: ['ind-projects'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/ind-wizard/projects`);
        if (!response.ok) throw new Error('Failed to fetch projects list');
        const projects = await response.json();
        setLoadedProjects(projects);
        return projects;
      } catch (error) {
        console.error('Error fetching projects list:', error);
        return [];
      }
    }
  });
  
  // Fetch specific project data
  const { 
    data: projectData, 
    isLoading: isLoadingProject,
    error: projectError 
  } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      try {
        // Try fetching from the new API first
        const wizardResponse = await apiRequest('GET', `/api/ind-wizard/${projectId}`);
        if (wizardResponse.ok) {
          const data = await wizardResponse.json();
          return data;
        }
        
        // If that fails, try the regular API
        const response = await apiRequest('GET', `/api/ind-wizard/projects/${projectId}`);
        if (!response.ok) throw new Error('Failed to fetch project data');
        return response.json();
      } catch (error) {
        console.error('Error fetching project data:', error);
        
        // Return a placeholder for development with pre-populated data
        return {
          id: projectId,
          title: 'IND-123 - Novel Therapeutic for Autoimmune Disorders',
          status: 'in_progress',
          completionPercentage: 45,
          estimatedDaysRemaining: 60,
          lastSaved: new Date().toISOString(),
          targetSubmissionDate: '2025-07-15',
          estimatedCompletionDate: '2025-06-30',
          drugName: 'IMD-2023',
          indication: 'Rheumatoid Arthritis',
          phase: 'Phase 1',
          routeOfAdministration: 'Oral',
          criticalTasks: [
            { name: 'Complete Nonclinical Safety Assessment', dueDate: 'May 10, 2025', overdue: false },
            { name: 'Finalize Protocol Design', dueDate: 'May 15, 2025', overdue: false },
            { name: 'Submit CMC Documentation', dueDate: 'Apr 20, 2025', overdue: true }
          ],
          regulatoryUpdates: [
            { title: 'FDA Updates Guidance for First-in-Human Clinical Trials', date: 'Apr 15, 2025' },
            { title: 'New Requirements for CMC Documentation', date: 'Mar 28, 2025' }
          ],
          team: [
            { name: 'Sarah Chen', role: 'Regulatory Lead' },
            { name: 'David Rodriguez', role: 'Medical Director' },
            { name: 'Jennifer Kim', role: 'Clinical Operations' },
            { name: 'Michael Johnson', role: 'CMC Lead' },
            { name: 'Robert Lee', role: 'Toxicology Expert' }
          ],
          recentActivity: [
            { description: 'Protocol draft updated', time: '2 hours ago', icon: FileText },
            { description: 'CMC section reviewed', time: '1 day ago', icon: Clipboard },
            { description: 'New team member added', time: '3 days ago', icon: Users }
          ]
        };
      }
    },
    enabled: !!projectId
  });
  
  if (isLoadingProject) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-t-2 border-primary rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading IND Project...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen bg-muted/20">
      <ErrorBoundary>
        <ProjectHeader projectId={projectId} projectData={projectData} />
        
        <div className="flex flex-1 overflow-hidden">
          <WizardSidebar 
            steps={IND_WIZARD_STEPS} 
            activeStep={activeStep} 
            projectId={projectId}
            projectData={projectData}
          />
          
          {/* Add Lumen AI Assistant */}
          <div className="fixed bottom-4 right-4 z-50">
            <LumenAssistantButton 
              variant="primary" 
              size="lg"
              tooltip="Ask Lumen AI Assistant"
            />
          </div>
          <LumenAssistant />
          
          <main className="flex-1 overflow-auto p-6">
            <ErrorBoundary>
              <Switch>
                <Route path="/ind-wizard" exact>
                  {loadedProjects && loadedProjects.length > 0 ? (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold">Select a Project</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loadedProjects.map((project) => (
                          <Link key={project.id} href={`/ind-wizard/${project.id}`}>
                            <a className="block">
                              <Card className="h-full hover:shadow-md transition-shadow">
                                <CardHeader>
                                  <CardTitle className="flex items-center justify-between">
                                    <span className="truncate">{project.name}</span>
                                    <ProjectStatusBadge status={project.status} />
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-3">
                                    <div>
                                      <p className="text-sm text-muted-foreground">Drug Name</p>
                                      <p className="font-medium">{project.drugName}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Indication</p>
                                      <p className="font-medium">{project.indication}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Progress</p>
                                      <Progress value={project.progress} className="h-2 mt-1" />
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </a>
                          </Link>
                        ))}
                        
                        {/* Add New Project Card */}
                        <div className="block">
                          <Card className="h-full border-dashed hover:shadow-md transition-shadow">
                            <CardContent className="flex flex-col items-center justify-center h-full p-6">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <PlusIcon className="h-6 w-6 text-primary" />
                              </div>
                              <h3 className="text-lg font-semibold mb-2">Create New Project</h3>
                              <p className="text-center text-muted-foreground text-sm mb-4">
                                Start a new IND application with the IND Wizard
                              </p>
                              <Button variant="outline">Create Project</Button>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <ProjectOverview projectId={projectId} projectData={projectData} />
                  )}
                </Route>
                
                <Route path="/ind-wizard/regulatory-intelligence">
                  <RegulatoryIntelligenceStep 
                    projectId={projectId} 
                    onComplete={() => setLocation('/ind-wizard/protocol')}
                    onPrevious={() => setLocation('/ind-wizard')}
                  />
                </Route>
                
                <Route path="/ind-wizard/protocol">
                  <ProtocolBuilderStep 
                    projectId={projectId} 
                    onComplete={() => setLocation('/ind-wizard/cmc')}
                    onPrevious={() => setLocation('/ind-wizard/regulatory-intelligence')}
                  />
                </Route>
                
                <Route path="/ind-wizard/cmc">
                  <CmcStep 
                    projectId={projectId} 
                    onComplete={() => setLocation('/ind-wizard/nonclinical')}
                    onPrevious={() => setLocation('/ind-wizard/protocol')}
                  />
                </Route>
                
                <Route path="/ind-wizard/forms">
                  <FdaFormsStep projectId={projectId} />
                </Route>
                
                <Route path="/ind-wizard/medical-writer">
                  <MedicalWriterContainer projectId={projectId} />
                </Route>
                
                <Route path="/ind-wizard/ai-assistant">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold">ASK LUMEN AI Assistant</h2>
                      <p className="text-muted-foreground">Your regulatory intelligence and document preparation assistant</p>
                    </div>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>AI Assistance Hub</CardTitle>
                        <CardDescription>
                          The ASK LUMEN AI Assistant provides regulatory guidance, document drafting assistance, 
                          and answers questions about IND preparation and submission.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-96 flex items-center justify-center border rounded-lg p-6">
                          <div className="text-center space-y-4">
                            <MessageSquare className="h-16 w-16 mx-auto text-primary/70" />
                            <h3 className="text-xl font-medium">ASK LUMEN AI Assistant</h3>
                            <p className="text-muted-foreground max-w-md mx-auto">
                              Click the assistant button in the bottom right corner to start a conversation 
                              with our AI assistant for regulatory guidance and document preparation help.
                            </p>
                            <Button className="mt-2" onClick={() => document.querySelector('[aria-label="Ask Lumen AI Assistant"]').click()}>
                              Open Assistant
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </Route>
                
                <Route>
                  <div className="flex items-center justify-center h-64 bg-muted/30 rounded-lg border border-dashed">
                    <div className="text-center">
                      <p className="text-muted-foreground mb-2">This section is currently under development.</p>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/ind-wizard">Go to Overview</Link>
                      </Button>
                    </div>
                  </div>
                </Route>
              </Switch>
            </ErrorBoundary>
          </main>
        </div>
      </ErrorBoundary>
    </div>
  );
}

// Medical Writer Container Component
function MedicalWriterContainer({ projectId }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">AI Medical Writer</h2>
        <p className="text-muted-foreground">Intelligent document generation for your IND submission</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="protocol">Protocol Writing</TabsTrigger>
          <TabsTrigger value="investigator-brochure">Investigator Brochure</TabsTrigger>
          <TabsTrigger value="csr">Clinical Study Reports</TabsTrigger>
          <TabsTrigger value="regulatory">Regulatory Documents</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Smart Document Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg">
                <PencilRuler className="h-12 w-12 mb-4 text-primary/70" />
                <h3 className="text-lg font-medium mb-2">AI-Powered Document Writing</h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  Our advanced AI can generate high-quality regulatory documents based on your 
                  project data, saving you time and ensuring compliance.
                </p>
                <Button className="mb-2">
                  Generate Document
                </Button>
                <p className="text-xs text-muted-foreground">
                  Documents are generated using advanced AI with expert review
                </p>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-primary" />
                      <span className="text-sm">Protocol Synopsis</span>
                    </div>
                    <span className="text-xs text-muted-foreground">3 days ago</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-primary" />
                      <span className="text-sm">Inclusion/Exclusion Criteria</span>
                    </div>
                    <span className="text-xs text-muted-foreground">1 week ago</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-primary" />
                      <span className="text-sm">Toxicology Summary</span>
                    </div>
                    <span className="text-xs text-muted-foreground">2 weeks ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Writing Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Need help with writing specific sections? Use our AI assistant to generate
                  content with proper scientific and regulatory language.
                </p>
                <Button variant="outline" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Open Writing Assistant
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Document Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="flex flex-col h-auto p-4 justify-start items-start">
                <div className="flex items-center mb-2 text-left">
                  <FileText className="h-5 w-5 mr-2" />
                  <span className="font-medium">Protocol Template</span>
                </div>
                <p className="text-xs text-muted-foreground text-left">
                  Standard protocol template with all required sections for IND submission
                </p>
              </Button>
              
              <Button variant="outline" className="flex flex-col h-auto p-4 justify-start items-start">
                <div className="flex items-center mb-2 text-left">
                  <FileText className="h-5 w-5 mr-2" />
                  <span className="font-medium">Investigator Brochure</span>
                </div>
                <p className="text-xs text-muted-foreground text-left">
                  Comprehensive template for creating investigator brochures
                </p>
              </Button>
              
              <Button variant="outline" className="flex flex-col h-auto p-4 justify-start items-start">
                <div className="flex items-center mb-2 text-left">
                  <FileText className="h-5 w-5 mr-2" />
                  <span className="font-medium">Clinical Study Report</span>
                </div>
                <p className="text-xs text-muted-foreground text-left">
                  ICH E3 compliant CSR template with all required sections
                </p>
              </Button>
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}