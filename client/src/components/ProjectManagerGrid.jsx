import React from 'react';

const ProjectManagerGrid = ({ projects = [] }) => {
  // If no projects are provided, show a message
  if (projects.length === 0) {
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
            <th className="py-2 px-4 border-b text-left">Status</th>
            <th className="py-2 px-4 border-b text-left">Priority</th>
            <th className="py-2 px-4 border-b text-left">Completion</th>
            <th className="py-2 px-4 border-b text-left">Deadline</th>
            <th className="py-2 px-4 border-b text-left">Assignee</th>
            <th className="py-2 px-4 border-b text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">
                <div className="font-medium text-indigo-700">{project.name}</div>
                <div className="text-xs text-gray-500">{project.modules.join(', ')}</div>
              </td>
              <td className="py-2 px-4 border-b">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </td>
              <td className="py-2 px-4 border-b">
                <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(project.priority)}`}>
                  {project.priority}
                </span>
              </td>
              <td className="py-2 px-4 border-b">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full" 
                    style={{ width: `${project.completion}%` }}
                  ></div>
                </div>
                <div className="text-xs text-center mt-1">{project.completion}%</div>
              </td>
              <td className="py-2 px-4 border-b">
                <div className={`text-sm ${isOverdue(project.deadline) ? 'text-red-600' : 'text-gray-600'}`}>
                  {formatDate(project.deadline)}
                </div>
              </td>
              <td className="py-2 px-4 border-b">{project.assignee}</td>
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

// Helper functions for styling
const getStatusColor = (status) => {
  switch (status) {
    case 'In Progress':
      return 'bg-blue-100 text-blue-800';
    case 'On Hold':
      return 'bg-yellow-100 text-yellow-800';
    case 'Completed':
      return 'bg-green-100 text-green-800';
    case 'In Review':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'High':
      return 'bg-red-100 text-red-800';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'Low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Check if date is overdue
const isOverdue = (dateString) => {
  const today = new Date();
  const deadline = new Date(dateString);
  return deadline < today;
};

// Format date to more readable format
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export default ProjectManagerGrid;