import React, { useState } from 'react';
import CollaborativeTemplateEditor from '@/components/templates/CollaborativeTemplateEditor';
import EnhancedDocumentTemplates from './EnhancedDocumentTemplates';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, FileText, Users, Settings } from 'lucide-react';
import { Link } from 'wouter';

/**
 * Collaborative Template Workspace
 * 
 * This page integrates the template management system with collaboration features,
 * providing a workspace for teams to collaborate on regulatory document templates.
 */
const CollaborativeTemplateWorkspace = () => {
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [workspaceView, setWorkspaceView] = useState('templates');
  
  // Handle template selection
  const handleTemplateSelect = (templateId) => {
    setSelectedTemplateId(templateId);
    setWorkspaceView('editor');
  };
  
  // Return to template list
  const handleBackToList = () => {
    setWorkspaceView('templates');
    setSelectedTemplateId(null);
  };
  
  return (
    <>      
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="border-b bg-white dark:bg-slate-950 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-bold tracking-tight">
                TrialSage™
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-xl font-semibold">Template Workspace</h1>
            </div>
            
            <Tabs value={workspaceView === 'templates' ? 'browse' : 'collaborate'} className="w-auto">
              <TabsList>
                <TabsTrigger 
                  value="browse" 
                  onClick={() => setWorkspaceView('templates')}
                  disabled={workspaceView === 'editor' && selectedTemplateId}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Browse Templates
                </TabsTrigger>
                <TabsTrigger 
                  value="collaborate" 
                  onClick={() => workspaceView === 'editor' ? null : null}
                  disabled={!selectedTemplateId}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Collaborate
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div>
              <Button variant="outline" size="sm">
                Help
              </Button>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-slate-900">
          {workspaceView === 'templates' ? (
            <div className="container py-6 mx-auto">
              <EnhancedDocumentTemplates onTemplateSelect={handleTemplateSelect} />
            </div>
          ) : (
            <div className="h-full">
              <div className="h-12 border-b bg-white dark:bg-slate-950 px-6 flex items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBackToList}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to Templates
                </Button>
              </div>
              <div className="p-6 h-[calc(100%-3rem)]">
                <CollaborativeTemplateEditor 
                  templateId={selectedTemplateId} 
                  projectId="regulatory-documents"
                  moduleName="templates"
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default CollaborativeTemplateWorkspace;