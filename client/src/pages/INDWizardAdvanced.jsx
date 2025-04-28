/**
 * INDWizardAdvanced Page
 * 
 * Advanced IND Wizard interface with comprehensive AI guidance, project management,
 * and document generation capabilities integrated with DocuShare.
 */

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  FileText, 
  LightbulbIcon, 
  Settings, 
  Users, 
  Calendar, 
  ListChecks, 
  FolderOpen, 
  LayoutDashboard, 
  ChevronRight, 
  RotateCw, 
  Plus,
  Home,
  BarChart2,
  ClipboardList
} from 'lucide-react';
import { useLocation, Link } from 'wouter';

// Import IND Wizard components
import AIRegulatoryAdvisor from '@/components/ind-wizard/AIRegulatoryAdvisor';
import INDProjectDashboard from '@/components/ind-wizard/INDProjectDashboard';
import AITimelineGenerator from '@/components/ind-wizard/AITimelineGenerator';
import IndWizardLayout from '@/components/ind-wizard/IndWizardLayout';
import INDAnalyticsDashboard from '@/components/mashable-bi/INDAnalyticsDashboard';
import Module1AdminPage from '@/modules/Module1AdminPage';
import Module2SummaryPage from '@/modules/Module2SummaryPage';
import Module3QualityPage from '@/modules/Module3QualityPage';

export default function INDWizardAdvanced() {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  
  // Fetch existing IND projects
  const { 
    data: projects, 
    isLoading: isProjectsLoading, 
    refetch: refetchProjects 
  } = useQuery({
    queryKey: ['ind-projects'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/ind/projects');
        if (!response.ok) throw new Error('Failed to fetch projects');
        return response.json();
      } catch (error) {
        console.error('Error fetching projects:', error);
        
        // Sample data for demo/development
        return [
          {
            id: 'project-1',
            name: 'Enzymax Forte IND',
            drugName: 'Enzymax Forte',
            indication: 'Pancreatic Enzyme Deficiency',
            sponsor: 'TrialSage Pharmaceuticals',
            status: 'in_progress',
            progress: 65,
            lastUpdated: '2025-04-20T14:30:00Z'
          },
          {
            id: 'project-2',
            name: 'NeuroClear IND',
            drugName: 'NeuroClear',
            indication: 'Alzheimer\'s Disease',
            sponsor: 'NeuroGenix Therapeutics',
            status: 'not_started',
            progress: 10,
            lastUpdated: '2025-04-15T09:45:00Z'
          },
          {
            id: 'project-3',
            name: 'CardioFlow IND',
            drugName: 'CardioFlow',
            indication: 'Hypertension',
            status: 'completed',
            sponsor: 'HeartWell Biosciences',
            progress: 100,
            lastUpdated: '2025-03-28T16:20:00Z'
          }
        ];
      }
    }
  });

  // Set first project as active if none selected and projects are loaded
  useEffect(() => {
    if (!activeProjectId && projects?.length > 0) {
      setActiveProjectId(projects[0].id);
    }
  }, [projects, activeProjectId]);

  // Handle project selection
  const handleSelectProject = (projectId) => {
    setActiveProjectId(projectId);
    setActiveView('dashboard');
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
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Handle back to wizard navigation
  const handleGoToWizard = () => {
    if (activeProjectId) {
      navigate(`/ind-wizard/${activeProjectId}`);
    } else {
      toast({
        title: 'No Project Selected',
        description: 'Please select a project first',
        variant: 'destructive'
      });
    }
  };

  // Get active project data
  const activeProject = activeProjectId 
    ? projects?.find(p => p.id === activeProjectId) 
    : null;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Navigation */}
      <div className="hidden md:flex w-64 flex-col border-r bg-muted/40">
        <div className="flex h-14 items-center border-b px-4">
          <Link to="/" className="flex items-center font-semibold">
            <Home className="h-5 w-5 mr-2" />
            <span>TrialSage™</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-auto py-2">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
              IND Wizard™
            </h2>
            <div className="space-y-1">
              <Button 
                variant={activeView === 'dashboard' ? 'secondary' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveView('dashboard')}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Button 
                variant={activeView === 'timeline' ? 'secondary' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveView('timeline')}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Timeline Planner
              </Button>
              <Button 
                variant={activeView === 'analytics' ? 'secondary' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveView('analytics')}
              >
                <BarChart2 className="mr-2 h-4 w-4" />
                Analytics & BI
              </Button>
              <Button 
                variant={activeView === 'module1' ? 'secondary' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveView('module1')}
              >
                <ClipboardList className="mr-2 h-4 w-4" />
                Module 1 (Admin)
              </Button>
              <Button 
                variant={activeView === 'module2' ? 'secondary' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveView('module2')}
              >
                <ClipboardList className="mr-2 h-4 w-4" />
                Module 2 (Summaries)
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={handleGoToWizard}
              >
                <ListChecks className="mr-2 h-4 w-4" />
                Step-by-Step Wizard
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => navigate('/docushare')}
              >
                <FolderOpen className="mr-2 h-4 w-4" />
                Document Repository
              </Button>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="px-3 py-2">
            <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
              Projects
            </h2>
            {isProjectsLoading ? (
              <div className="flex justify-center py-4">
                <RotateCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-1">
                {projects?.map((project) => (
                  <Button
                    key={project.id}
                    variant={activeProjectId === project.id ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => handleSelectProject(project.id)}
                  >
                    <Briefcase className="mr-2 h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="text-sm">{project.name}</span>
                      <span className="text-xs text-muted-foreground">{project.progress}% complete</span>
                    </div>
                  </Button>
                ))}
                
                <Button variant="outline" className="w-full justify-start mt-2">
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom actions */}
        <div className="mt-auto p-4 border-t">
          <Button variant="outline" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="border-b">
          <div className="flex h-16 items-center gap-4 px-6">
            <div className="font-semibold text-lg flex items-center">
              <Briefcase className="h-5 w-5 mr-2" />
              {activeProject ? (
                <>
                  {activeProject.name}
                  <ChevronRight className="h-5 w-5 mx-1 text-muted-foreground" />
                  {activeView === 'dashboard' ? 'Dashboard' : 
                   activeView === 'timeline' ? 'Timeline Planner' : 
                   activeView === 'analytics' ? 'Analytics & BI' :
                   activeView === 'module1' ? 'Module 1 (Admin)' : 
                   activeView === 'module2' ? 'Module 2 (Summaries)' : ''}
                </>
              ) : (
                'IND Wizard Advanced'
              )}
            </div>
            
            <div className="ml-auto flex items-center gap-2">
              {activeProject && getStatusBadge(activeProject.status)}
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {!activeProject ? (
            <div className="flex items-center justify-center h-[80vh]">
              <Card className="w-[400px]">
                <CardHeader>
                  <CardTitle>Welcome to IND Wizard™</CardTitle>
                  <CardDescription>
                    Please select a project from the sidebar to get started
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center p-6">
                  <Briefcase className="h-16 w-16 text-muted-foreground opacity-50" />
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New IND Project
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ) : activeView === 'dashboard' ? (
            <INDProjectDashboard projectId={activeProjectId} />
          ) : activeView === 'timeline' ? (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">IND Submission Timeline</h1>
              <AITimelineGenerator 
                projectId={activeProjectId} 
                indData={activeProject}
                onTimelineGenerated={(timeline) => {
                  toast({
                    title: 'Timeline Created',
                    description: 'The AI-generated timeline has been saved to your project',
                  });
                  setActiveView('dashboard');
                }}
              />
            </div>
          ) : activeView === 'analytics' ? (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">IND Analytics & Business Intelligence</h1>
              <p className="text-muted-foreground">Powered by MashableBI</p>
              <INDAnalyticsDashboard 
                projectId={activeProjectId}
                showSummary={true}
              />
            </div>
          ) : activeView === 'module1' ? (
            <Module1AdminPage />
          ) : activeView === 'module2' ? (
            <Module2SummaryPage />
          ) : null}
        </div>
      </div>
    </div>
  );
}