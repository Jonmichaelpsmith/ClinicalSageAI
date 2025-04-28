import React from 'react';

// Safe helper functions for styling
const getStatusColor = (status) => {
  if (!status) return 'bg-gray-100 text-gray-800';
  
  switch (status) {
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'at_risk':
      return 'bg-yellow-100 text-yellow-800';
    case 'complete':
      return 'bg-green-100 text-green-800';
    case 'review':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Safe formatter for status text
const formatStatus = (status) => {
  if (!status) return 'Unknown';
  
  switch (status) {
    case 'in_progress':
      return 'In Progress';
    case 'at_risk':
      return 'At Risk';
    case 'complete':
      return 'Complete';
    case 'review':
      return 'In Review';
    default:
      return status;
  }
};

// Safe progress bar color based on status and completion
const getProgressBarColor = (status, percentComplete) => {
  if (!status) return 'bg-gray-400';
  if (status === 'complete') return 'bg-green-500';
  if (status === 'at_risk') return 'bg-red-500';
  return 'bg-yellow-500';
};

const ProjectManagerGrid = ({ projects = [] }) => {
  // If no projects are provided, show a message
  if (!projects || projects.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-center">No projects found. Projects loaded via API will appear here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
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
        <tbody>
          {projects.map((project) => (
            <tr key={project.id || 'unknown'} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">
                <div className="font-medium text-indigo-700">{project.name || 'Unnamed Project'}</div>
                {project.id && <div className="text-xs text-gray-500">{project.id}</div>}
              </td>
              <td className="py-2 px-4 border-b">
                {project.client || 'Unassigned'}
              </td>
              <td className="py-2 px-4 border-b">
                {project.type || 'Unspecified'}
              </td>
              <td className="py-2 px-4 border-b">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                  {formatStatus(project.status)}
                </span>
              </td>
              <td className="py-2 px-4 border-b">
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressBarColor(project.status, project.percentComplete)}`}
                      style={{ width: `${project.percentComplete || 0}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {(project.percentComplete || 0)}% Complete
                  </div>
                </div>
              </td>
              <td className="py-2 px-4 border-b">
                <div className={`text-sm ${project.dueDate === 'Completed' ? 'text-green-600' : 'text-gray-600'}`}>
                  {project.dueDate || 'Not set'}
                </div>
              </td>
              <td className="py-2 px-4 border-b">
                {/* Safe Missing Items Check */}
                {project.missingItems && project.missingItems.length > 0 ? (
                  <div className="text-xs text-red-500">
                    {project.missingItems.join(', ')}
                  </div>
                ) : (
                  <div className="text-xs text-green-500">None</div>
                )}
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectManagerGrid;