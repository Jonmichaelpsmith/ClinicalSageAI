import React, { useEffect, useState } from 'react';
import ProjectManagerGrid from '../components/project-manager/ProjectManagerGrid';

const mockProjects = [
  {
    id: 1,
    name: 'Phase II Clinical Trial - BX-107',
    status: 'in_progress',
    module: 'trial-vault',
    progress: 65,
    dueDate: '2025-06-15',
    priority: 'high'
  },
  {
    id: 2,
    name: 'IND Application for BTX-331',
    status: 'in_progress',
    module: 'ind-wizard',
    progress: 42,
    dueDate: '2025-05-30',
    priority: 'medium'
  },
  {
    id: 3,
    name: 'Clinical Study Report - Phase I',
    status: 'pending_review',
    module: 'csr-intelligence',
    progress: 95,
    dueDate: '2025-05-10',
    priority: 'high'
  },
  {
    id: 4,
    name: 'Study Protocol Development',
    status: 'not_started',
    module: 'study-architect',
    progress: 0,
    dueDate: '2025-07-21',
    priority: 'low'
  }
];

const ProjectManagerFullScreen = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    // In a real application this would fetch data from an API
    setProjects(mockProjects);
  }, []);

  return (
    <div className="min-h-screen w-full p-4 bg-gray-50 overflow-auto">
      <ProjectManagerGrid projects={projects} />
    </div>
  );
};

export default ProjectManagerFullScreen;
