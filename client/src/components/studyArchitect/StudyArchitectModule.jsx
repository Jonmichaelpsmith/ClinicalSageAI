import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StudySessionSelector from './StudySessionSelector';
import StudyDesignAssistant from './StudyDesignAssistant';
import StudyPlanner from './StudyPlanner';
import StudyDesignReport from './StudyDesignReport';
import StudyEditorForm from './StudyEditorForm';
import StudyWorkspace from './StudyWorkspace';

export default function StudyArchitectModule() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSessionSelect = async (selectedSession) => {
    setLoading(true);
    
    // Simulate API call to load session data
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSession(selectedSession);
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Study Architect™</h1>
      <p className="text-gray-600 max-w-3xl">
        Design, plan, and optimize clinical study protocols with AI-powered insights from
        historical trials and regulatory requirements.
      </p>
      
      <StudySessionSelector onSelect={handleSessionSelect} />
      
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3">Loading session data...</span>
          </CardContent>
        </Card>
      ) : session ? (
        <div className="space-y-6">
          <StudyPlanner session={session} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StudyDesignAssistant session={session} />
            <StudyDesignReport session={session} />
          </div>
          <StudyEditorForm session={session} />
          <StudyWorkspace session={session} />
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              Select an existing session or create a new one to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}