/**
 * Project Manager Grid Component
 * 
 * This component displays a grid of active projects with their statuses,
 * completion percentages, missing parts, and deadlines.
 * It leverages the RegulatoryProjectMap brain for intelligent project tracking.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  AlertCircle, 
  Calendar, 
  ChevronRight, 
  ClipboardList,
  FileText,
  Info,
  PlusCircle
} from 'lucide-react';

// Import project service
import ProjectService from '../../services/ProjectService';

/**
 * Project Manager Grid Component
 * 
 * @param {Object} props Component props
 * @param {string} props.userId Current user ID
 * @param {string} props.orgId Current organization ID
 * @param {Function} props.onProjectSelect Callback when a project is selected
 */
const ProjectManagerGrid = ({ userId, orgId, onProjectSelect }) => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load projects when component mounts
  useEffect(() => {
    const init = async () => {
      try {
        const response = await fetch('/api/projects');
        const data = await response.json();
        setProjects(data.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading projects:', error);
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // Render loading state
  if (isLoading) {
    return (
      <Card className="min-h-[240px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </Card>
    );
  }

  // Render empty state if no projects
  if (projects.length === 0) {
    return (
      <Card className="min-h-[240px] flex flex-col items-center justify-center p-6 text-center">
        <Info className="h-10 w-10 text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium">No Active Projects</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Get started by creating your first regulatory project
        </p>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </Card>
    );
  }

  // Helper to determine project status badge variant and label
  const getStatusBadge = (project) => {
    const { progress, issues } = project;
    
    if (progress < 25) {
      return { label: 'Starting', variant: 'outline' };
    } else if (issues > 0) {
      return { label: 'Issues', variant: 'destructive' };
    } else if (progress === 100) {
      return { label: 'Complete', variant: 'success' };
    } else if (progress >= 75) {
      return { label: 'Near Complete', variant: 'default' };
    } else {
      return { label: 'In Progress', variant: 'secondary' };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold tracking-tight">Project Manager</h2>
        <Button variant="outline" size="sm">
          <PlusCircle className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map((project) => {
          const status = getStatusBadge(project);
          const moduleLink = ProjectService.getProjectModuleLink(project.type);
          
          return (
            <Card key={project.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{project.id}</CardTitle>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <CardDescription>{project.name}</CardDescription>
              </CardHeader>
              
              <CardContent className="pb-2">
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
                
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      Due Date
                    </span>
                    <span>{new Date(project.dueDate).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center">
                      <FileText className="h-3.5 w-3.5 mr-1" />
                      Status
                    </span>
                    <span>{project.phase.replace(/_/g, ' ')}</span>
                  </div>
                  
                  {project.issues > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-destructive flex items-center">
                        <AlertCircle className="h-3.5 w-3.5 mr-1" />
                        Issues
                      </span>
                      <span className="text-destructive">{project.issues} to resolve</span>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <Separator />
              
              <CardFooter className="pt-2">
                <Button asChild variant="ghost" className="w-full justify-between" size="sm">
                  <Link to={moduleLink}>
                    Work on Project
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectManagerGrid;