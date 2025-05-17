import React, { useEffect, useState } from 'react';
import ProjectManagerGrid from '@/components/project-manager/ProjectManagerGrid';
import { useLumenAiAssistant } from '@/contexts/LumenAiAssistantContext';
import ProjectService from '@/services/ProjectService';

const ProjectManagerPage = ({ userId = 'user-1', orgId = 'org-1' }) => {
  const { setModuleContext } = useLumenAiAssistant();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setModuleContext({ module: 'project-manager', context: { userId, orgId } });
  }, [userId, orgId, setModuleContext]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await ProjectService.getUserProjects(userId, orgId);
        setProjects(data);
      } catch (err) {
        console.error('Error loading projects:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId, orgId]);

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <ProjectManagerGrid projects={projects} userId={userId} orgId={orgId} />
    </div>
  );
};

export default ProjectManagerPage;
