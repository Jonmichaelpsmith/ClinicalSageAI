import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, BookOpen, FileEdit, LineChart, Users } from 'lucide-react';
import StudySessionSelector from './StudySessionSelector';
import StudyDesignAssistant from './StudyDesignAssistant';
import StudyPlanner from './StudyPlanner';
import StudyDesignReport from './StudyDesignReport';
import StudyEditorForm from './StudyEditorForm';
import StudyWorkspace from './StudyWorkspace';

export default function StudyArchitectModule() {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentSession, setCurrentSession] = useState(null);
  
  const handleSessionSelect = (session) => {
    setCurrentSession(session);
    setActiveTab('planner');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Study Architect™</h1>
        <p className="text-gray-600">
          Design, plan, and develop clinical study protocols with AI-powered assistance.
        </p>
      </div>
      
      {!currentSession ? (
        <StudySessionSelector onSelect={handleSessionSelect} />
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">{currentSession.name}</h2>
              <p className="text-sm text-gray-500">Last updated: {currentSession.lastUpdated}</p>
            </div>
            <button 
              onClick={() => setCurrentSession(null)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Change Session
            </button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="assistant" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>Design Assistant</span>
              </TabsTrigger>
              <TabsTrigger value="planner" className="flex items-center gap-2">
                <LineChart className="h-4 w-4" />
                <span>Study Planner</span>
              </TabsTrigger>
              <TabsTrigger value="editor" className="flex items-center gap-2">
                <FileEdit className="h-4 w-4" />
                <span>Protocol Editor</span>
              </TabsTrigger>
              <TabsTrigger value="workspace" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Workspace</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StudyDesignAssistant session={currentSession} />
                <StudyDesignReport session={currentSession} />
              </div>
            </TabsContent>
            
            <TabsContent value="assistant">
              <StudyDesignAssistant session={currentSession} />
            </TabsContent>
            
            <TabsContent value="planner">
              <StudyPlanner session={currentSession} />
            </TabsContent>
            
            <TabsContent value="editor">
              <StudyEditorForm session={currentSession} />
            </TabsContent>
            
            <TabsContent value="workspace">
              <StudyWorkspace session={currentSession} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}