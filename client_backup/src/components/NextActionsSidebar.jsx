import React, { useState } from 'react';

const NextActionsSidebar = () => {
  // Sample next actions (in a real app these would come from an API)
  const [actions] = useState([
    {
      id: 1,
      title: 'Review draft IND form',
      priority: 'High',
      dueDate: '2025-05-05',
      project: 'Enzyvant BLA',
      module: 'IND Wizard'
    },
    {
      id: 2,
      title: 'Upload clinical data for CSR',
      priority: 'Medium',
      dueDate: '2025-05-10',
      project: 'Axogen CMC',
      module: 'CSR Analyzer'
    },
    {
      id: 3,
      title: 'Prepare FDA response',
      priority: 'High',
      dueDate: '2025-05-03',
      project: 'Novartis IND',
      module: 'IND Wizard'
    },
    {
      id: 4,
      title: 'Schedule CRO meeting',
      priority: 'Low',
      dueDate: '2025-05-15',
      project: 'Merck PMDA',
      module: 'Study Architect'
    },
    {
      id: 5,
      title: 'Update study protocol',
      priority: 'Medium',
      dueDate: '2025-05-12',
      project: 'Pfizer CER',
      module: 'Study Architect'
    }
  ]);

  return (
    <div className="space-y-4">
      {actions.map((action) => (
        <div key={action.id} className="p-3 bg-gray-50 rounded-lg hover:shadow-sm transition">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-gray-900">{action.title}</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(action.priority)}`}>
              {action.priority}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Due: {formatDate(action.dueDate)}
          </div>
          <div className="flex justify-between mt-2 text-xs">
            <span className="text-indigo-700">{action.project}</span>
            <span className="text-gray-500">{action.module}</span>
          </div>
          <div className="flex justify-end mt-2">
            <button className="text-xs text-white bg-indigo-600 hover:bg-indigo-700 px-2 py-1 rounded">
              Complete
            </button>
          </div>
        </div>
      ))}
      
      <div className="pt-4 border-t border-gray-200">
        <button className="w-full text-sm bg-indigo-50 text-indigo-700 py-2 rounded-lg hover:bg-indigo-100 transition">
          View All Actions
        </button>
      </div>
    </div>
  );
};

// Get appropriate background color based on priority
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

// Format date to be more readable
const formatDate = (dateString) => {
  const options = { month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export default NextActionsSidebar;