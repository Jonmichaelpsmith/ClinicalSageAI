import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Clock, 
  Calendar, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Users,
  Database,
  BookOpen,
  BarChart2,
  Sparkles
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// ProjectManagerGrid component for displaying all projects in a grid layout
const ProjectManagerGrid = ({ userId, orgId, onProjectSelect }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // In a real implementation, this would be an API call
        // For demonstration purposes, using mock data
        const mockProjects = [
          {
            id: 'project-1',
            name: 'Phase II Clinical Trial - BX-107',
            status: 'in_progress',
            module: 'trial-vault',
            progress: 65,
            dueDate: '2025-06-15',
            team: 'Clinical Operations',
            priority: 'high'
          },
          {
            id: 'project-2',
            name: 'IND Application for BTX-331',
            status: 'in_progress',
            module: 'ind-wizard',
            progress: 42,
            dueDate: '2025-05-30',
            team: 'Regulatory Affairs',
            priority: 'high'
          },
          {
            id: 'project-3',
            name: 'Clinical Study Report - Phase I',
            status: 'pending_review',
            module: 'csr-intelligence',
            progress: 95,
            dueDate: '2025-05-10',
            team: 'Clinical Operations',
            priority: 'medium'
          },
          {
            id: 'project-4',
            name: 'Study Protocol Development',
            status: 'not_started',
            module: 'study-architect',
            progress: 0,
            dueDate: '2025-07-21',
            team: 'Clinical Operations',
            priority: 'low'
          },
          {
            id: 'project-5',
            name: 'CMC Documentation Package',
            status: 'in_progress',
            module: 'ind-wizard',
            progress: 38,
            dueDate: '2025-06-05',
            team: 'CMC',
            priority: 'medium'
          },
          {
            id: 'project-6',
            name: 'Safety Monitoring Plan',
            status: 'completed',
            module: 'risk-management',
            progress: 100,
            dueDate: '2025-04-30',
            team: 'Safety',
            priority: 'high'
          }
        ];
        
        setProjects(mockProjects);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, [userId, orgId]);
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get days remaining until due date
  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  // Get status display data
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'completed':
        return { 
          icon: <CheckCircle size={16} className="text-green-500" />,
          text: 'Completed',
          className: 'text-green-600',
          bgColor: 'bg-green-100'
        };
      case 'in_progress':
        return { 
          icon: <Clock size={16} className="text-blue-500" />,
          text: 'In Progress',
          className: 'text-blue-600',
          bgColor: 'bg-blue-100'
        };
      case 'pending_review':
        return { 
          icon: <AlertCircle size={16} className="text-yellow-500" />,
          text: 'Pending Review',
          className: 'text-yellow-600',
          bgColor: 'bg-yellow-100'
        };
      case 'not_started':
        return { 
          icon: <Calendar size={16} className="text-gray-500" />,
          text: 'Not Started',
          className: 'text-gray-600',
          bgColor: 'bg-gray-100'
        };
      default:
        return { 
          icon: <Clock size={16} className="text-gray-500" />,
          text: 'Unknown',
          className: 'text-gray-600',
          bgColor: 'bg-gray-100'
        };
    }
  };
  
  // Get priority badge
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="bg-red-100 border-red-200 text-red-700">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-100 border-yellow-200 text-yellow-700">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-blue-100 border-blue-200 text-blue-700">Low</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 border-gray-200 text-gray-700">Normal</Badge>;
    }
  };
  
  // Get module icon
  const getModuleIcon = (module) => {
    switch (module) {
      case 'ind-wizard':
        return <FileText size={16} className="text-primary" />;
      case 'trial-vault':
        return <Database size={16} className="text-primary" />;
      case 'csr-intelligence':
        return <BookOpen size={16} className="text-primary" />;
      case 'study-architect':
        return <Users size={16} className="text-primary" />;
      case 'analytics':
        return <BarChart2 size={16} className="text-primary" />;
      case 'risk-management':
        return <AlertCircle size={16} className="text-primary" />;
      case 'ai-assistant':
        return <Sparkles size={16} className="text-primary" />;
      default:
        return <Briefcase size={16} className="text-primary" />;
    }
  };
  
  // Handle project click
  const handleProjectClick = (projectId) => {
    if (onProjectSelect) {
      onProjectSelect(projectId);
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-36 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-lg text-red-800">
        <AlertCircle size={20} className="inline-block mr-2" />
        Error loading projects: {error}
      </div>
    );
  }
  
  // Render empty state
  if (projects.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
        <Briefcase className="w-12 h-12 mx-auto text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No projects yet</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new project.</p>
        <div className="mt-6">
          <Button>
            Create new project
          </Button>
        </div>
      </div>
    );
  }
  
  // Render project grid
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map(project => (
        <div 
          key={project.id}
          className="border rounded-lg p-4 hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer"
          onClick={() => handleProjectClick(project.id)}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              {getModuleIcon(project.module)}
              <Badge 
                className={`ml-2 ${getStatusDisplay(project.status).bgColor} border-0`}
              >
                {getStatusDisplay(project.status).text}
              </Badge>
            </div>
            {getPriorityBadge(project.priority)}
          </div>
          
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{project.name}</h3>
          
          <div className="mt-2">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-500">Progress</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center text-sm text-gray-500">
              <Calendar size={14} className="mr-1" />
              <span>Due: {formatDate(project.dueDate)}</span>
            </div>
            
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectManagerGrid;