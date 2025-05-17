import React from 'react';
import { useLumenAiAssistant } from '@/contexts/LumenAiAssistantContext';
import { ChevronRight, Clock, BarChart2, FileText, Database, Search, Beaker, ClipboardList } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import useCollaboration from '@/hooks/useCollaboration'; // From codex branch
import RegulatoryProjectMap from '../../models/RegulatoryProjectMap'; // From codex branch

/**
 * Utility functions (kept outside ProjectCard for clarity, can be moved or imported)
 */
const getModuleIcon = (module) => {
  switch (module) {
    case 'cer-generator':
    case 'cer2v': // Corrected from 'cer2v ' to 'cer2v'
      return <FileText className="h-4 w-4 text-green-600" />;
    case 'ind-wizard':
      return <FileText className="h-4 w-4 text-blue-600" />;
    case 'cmc-wizard':
    case 'cmc-module':
      return <Beaker className="h-4 w-4 text-amber-600" />;
    case 'study-architect':
      return <ClipboardList className="h-4 w-4 text-orange-600" />;
    case 'csr-intelligence': // Corrected from 'csr-intelligence ' to 'csr-intelligence'
      return <Search className="h-4 w-4 text-teal-600" />;
    case 'analytics':
      return <BarChart2 className="h-4 w-4 text-indigo-600" />;
    case 'trial-vault':
    case 'vault':
      return <Database className="h-4 w-4 text-slate-600" />;
    default:
      return <FileText className="h-4 w-4 text-gray-600" />;
  }
};

const getBadgeVariant = (status) => {
  switch (status) {
    case 'completed':
      return 'success'; // Assuming 'success' is a valid Badge variant
    case 'in_progress':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'not_started':
      return 'outline';
    case 'at_risk':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getStatusDisplay = (status) => {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'in_progress':
      return 'In Progress';
    case 'pending':
      return 'Pending';
    case 'not_started':
      return 'Not Started';
    case 'at_risk':
      return 'At Risk';
    default:
      return status ? status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ') : 'Unknown';
  }
};

const getDaysRemaining = (dueDate) => {
  if (!dueDate) return 'N/A';
  const today = new Date();
  const due = new Date(dueDate);
  // Set hours to 0 to compare dates only, avoiding issues with time of day
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diffTime = due.getTime() - today.getTime(); // Use getTime() for reliable difference
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};


/**
 * ProjectCard Component
 * Displays individual project information.
 * Merges functionality from both conflicting branches.
 */
const ProjectCard = ({ project, tasks, userId, orgId }) => {
  const { openAssistant, setModuleContext } = useLumenAiAssistant(); // From main branch

  // Task fetching logic from codex branch
  const { tasks: fetchedTasks, isLoading: isLoadingTasks } = useCollaboration(
    project.id,
    project.module,
    { loadOnMount: !tasks } // Only load if tasks are not pre-passed
  );

  const projectTasks = tasks || fetchedTasks || [];

  const nextAction = React.useMemo(() => {
    if (!projectTasks.length) return null;
    // Filter out tasks that might not have a valid dueDate
    const sortedTasks = projectTasks
        .filter(task => task.dueDate && !isNaN(new Date(task.dueDate).getTime()))
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    return sortedTasks.length > 0 ? sortedTasks[0] : null;
  }, [projectTasks]);

  const phaseName = React.useMemo(() => {
    if (!project.type || !project.phase) return project.phase || 'N/A';
    const typeDetails = RegulatoryProjectMap.getProjectType(project.type);
    if (!typeDetails || !typeDetails.phases) return project.phase;
    const phaseObj = typeDetails.phases.find((p) => p.id === project.phase);
    return phaseObj ? phaseObj.name : project.phase;
  }, [project.type, project.phase]);

  const daysRemaining = getDaysRemaining(project.dueDate);

  return (
    <div
      className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col justify-between" // Added flex-col and justify-between
    >
      <div> {/* Top section for project details */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center">
              {getModuleIcon(project.module)}
              <h3 className="ml-2 font-semibold text-gray-800 text-base">{project.name}</h3> {/* Increased font-semibold and text-base */}
            </div>
            <div className="flex items-center mt-1 text-xs text-gray-500">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span>
                Due: {project.dueDate ? new Date(project.dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                }) : 'N/A'}
              </span>
              {project.dueDate && (
                <>
                  <span className="mx-2">•</span>
                  <span>
                    {daysRemaining > 0 
                      ? `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining`
                      : daysRemaining === 0
                      ? 'Due today'
                      : `${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? '' : 's'} overdue`
                    }
                  </span>
                </>
              )}
            </div>
          </div>
          <Badge variant={getBadgeVariant(project.status)} className="text-xs px-2 py-0.5"> {/* Adjusted badge padding */}
            {getStatusDisplay(project.status)}
          </Badge>
        </div>

        <div className="text-xs text-gray-600 mb-2">
          Phase: <span className="font-medium">{phaseName}</span>
        </div>

        {isLoadingTasks && <div className="text-xs text-gray-500 mb-2">Loading tasks...</div>}
        {nextAction && !isLoadingTasks && (
          <div className="text-xs text-gray-600 mb-2">
            Next: <span className="font-medium">{nextAction.title}</span> (due{' '}
            {new Date(nextAction.dueDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })})
          </div>
        )}
        {!nextAction && !isLoadingTasks && projectTasks.length === 0 && (
            <div className="text-xs text-gray-500 mb-2">No upcoming tasks.</div>
        )}


        <div className="mb-4">
          <div className="flex justify-between items-center text-xs mb-1 text-gray-600">
            <span>Progress</span>
            <span>{project.progress || 0}%</span>
          </div>
          <Progress value={project.progress || 0} className="h-2" />
        </div>
      </div>

      {/* Bottom section for actions and priority */}
      <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100"> {/* Added mt-auto, pt-3, border-t */}
        <div className="flex items-center">
          <Badge
            variant="outline"
            className={
              `text-xs px-2 py-0.5 ${project.priority === 'high'
                ? 'text-red-700 border-red-300 bg-red-50'
                : project.priority === 'medium'
                ? 'text-amber-700 border-amber-300 bg-amber-50'
                : 'text-green-700 border-green-300 bg-green-50'}`
            }
          >
            {project.priority ? project.priority.charAt(0).toUpperCase() + project.priority.slice(1) : 'Normal'} Priority
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs" // Ensure button text is small
            onClick={() => {
              setModuleContext({ module: 'project-manager', context: { projectId: project.id, userId, orgId } });
              openAssistant();
            }}
          >
            Ask Lumen AI
          </Button>
          <Button variant="ghost" size="sm" className="text-primary text-xs"> {/* Ensure button text is small */}
            <span>View Details</span>
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};


/**
 * ProjectManagerGrid Component
 * Displays a grid of projects.
 */
const ProjectManagerGrid = ({ projects = [], tasksByProject = {}, userId, orgId }) => {
  if (!projects || projects.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-gray-50"> {/* Added some styling */}
        <FileText className="h-12 w-12 mx-auto text-gray-400" /> {/* Made icon larger and lighter */}
        <h3 className="mt-4 text-lg font-medium text-gray-700">No Projects Found</h3>
        <p className="mt-1 text-sm text-gray-500">There are no projects to display at this time.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"> {/* Added lg:grid-cols-3 */}
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          tasks={tasksByProject ? tasksByProject[project.id] : undefined} // Pass tasks for the specific project
          userId={userId} // Pass userId for Lumen AI
          orgId={orgId}   // Pass orgId for Lumen AI
        />
      ))}
    </div>
  );
};

export default ProjectManagerGrid;
