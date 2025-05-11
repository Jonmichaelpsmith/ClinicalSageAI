import React, { memo, useMemo } from 'react';

// Cache for status colors and text to avoid recalculation
const STATUS_COLORS = {
  in_progress: 'bg-blue-100 text-blue-800',
  at_risk: 'bg-yellow-100 text-yellow-800',
  complete: 'bg-green-100 text-green-800',
  review: 'bg-purple-100 text-purple-800',
  default: 'bg-gray-100 text-gray-800'
};

// Cache for status text to avoid string manipulation on each render
const STATUS_TEXT = {
  in_progress: 'In Progress',
  at_risk: 'At Risk',
  complete: 'Complete',
  review: 'In Review'
};

// Safe helper functions for styling
const getStatusColor = (status) => {
  if (!status) return STATUS_COLORS.default;
  return STATUS_COLORS[status] || STATUS_COLORS.default;
};

// Safe formatter for status text
const formatStatus = (status) => {
  if (!status) return 'Unknown';
  return STATUS_TEXT[status] || status;
};

// Safe progress bar color - uses constant lookups instead of conditionals
const PROGRESS_BAR_COLORS = {
  complete: 'bg-green-500',
  at_risk: 'bg-red-500',
  default: 'bg-yellow-500',
  none: 'bg-gray-400'
};

const getProgressBarColor = (status) => {
  if (!status) return PROGRESS_BAR_COLORS.none;
  return PROGRESS_BAR_COLORS[status] || PROGRESS_BAR_COLORS.default;
};

// Memoized table header to prevent re-renders
const TableHeader = memo(() => (
  <thead className="bg-gray-100">
    <tr>
      <th className="py-2 px-4 border-b text-left">Project Name</th>
      <th className="py-2 px-4 border-b text-left">Client</th>
      <th className="py-2 px-4 border-b text-left">Type</th>
      <th className="py-2 px-4 border-b text-left">Status</th>
      <th className="py-2 px-4 border-b text-left">Completion</th>
      <th className="py-2 px-4 border-b text-left">Due Date</th>
      <th className="py-2 px-4 border-b text-left">Missing Items</th>
      <th className="py-2 px-4 border-b text-left">Actions</th>
    </tr>
  </thead>
));
TableHeader.displayName = 'TableHeader';

// Memoized project row component to prevent unnecessary renders
const ProjectRow = memo(({ project }) => {
  // Safe default values
  const {
    id = 'unknown',
    name = 'Unnamed Project',
    client = 'Unassigned',
    type = 'Unspecified',
    status,
    percentComplete = 0,
    dueDate = 'Not set',
    missingItems = []
  } = project;

  const hasMissingItems = missingItems.length > 0;
  const missingItemsText = hasMissingItems ? missingItems.join(', ') : 'None';
  const missingItemsClass = hasMissingItems ? 'text-red-500' : 'text-green-500';
  const dueDateClass = dueDate === 'Completed' ? 'text-green-600' : 'text-gray-600';

  return (
    <tr key={id} className="hover:bg-gray-50">
      <td className="py-2 px-4 border-b">
        <div className="font-medium text-indigo-700">{name}</div>
        {id && <div className="text-xs text-gray-500">{id}</div>}
      </td>
      <td className="py-2 px-4 border-b">{client}</td>
      <td className="py-2 px-4 border-b">{type}</td>
      <td className="py-2 px-4 border-b">
        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(status)}`}>
          {formatStatus(status)}
        </span>
      </td>
      <td className="py-2 px-4 border-b">
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getProgressBarColor(status)}`}
              style={{ width: `${percentComplete}%` }}
            ></div>
          </div>
          <div className="text-right text-xs text-gray-500 mt-1">
            {percentComplete}% Complete
          </div>
        </div>
      </td>
      <td className="py-2 px-4 border-b">
        <div className={`text-sm ${dueDateClass}`}>{dueDate}</div>
      </td>
      <td className="py-2 px-4 border-b">
        <div className={`text-xs ${missingItemsClass}`}>{missingItemsText}</div>
      </td>
      <td className="py-2 px-4 border-b">
        <div className="flex space-x-2">
          <button className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200">
            View
          </button>
          <button className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200">
            Edit
          </button>
        </div>
      </td>
    </tr>
  );
});
ProjectRow.displayName = 'ProjectRow';

// Main component with useMemo for optimal performance
const ProjectManagerGrid = ({ projects = [] }) => {
  // If no projects are provided, show a message
  if (!projects || projects.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-center">No projects found. Projects loaded via API will appear here.</p>
      </div>
    );
  }

  // Render only when projects array changes
  const renderedProjects = useMemo(() => {
    return projects.map(project => (
      <ProjectRow key={project.id || 'unknown'} project={project} />
    ));
  }, [projects]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <TableHeader />
        <tbody>
          {renderedProjects}
        </tbody>
      </table>
    </div>
  );
};

export default memo(ProjectManagerGrid);