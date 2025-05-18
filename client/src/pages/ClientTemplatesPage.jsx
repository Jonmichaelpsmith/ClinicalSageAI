/**
 * Client Templates Page for eCTD Module
 * 
 * This page combines all the template components to provide a complete
 * interface for managing client-specific document templates.
 */
import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, BookOpen } from 'lucide-react';
import { useTenant } from '../contexts/TenantContext';

// Import template components
import ClientTemplateLibrary from '../components/ectd/ClientTemplateLibrary';
import TemplateEditor from '../components/ectd/TemplateEditor';
import TemplateQualityAnalyzer from '../components/ectd/TemplateQualityAnalyzer';

export default function ClientTemplatesPage() {
  const [activeView, setActiveView] = useState('library');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { currentClientWorkspace } = useTenant();
  
  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setActiveView('editor');
  };
  
  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setActiveView('editor');
  };
  
  const handleAnalyzeTemplate = (template) => {
    setSelectedTemplate(template);
    setActiveView('analyzer');
  };
  
  const handleSaveTemplate = (templateData) => {
    // In a real implementation, this would call an API to save the template
    toast({
      title: selectedTemplate ? "Template Updated" : "Template Created",
      description: `${templateData.name} has been ${selectedTemplate ? 'updated' : 'created'} successfully.`,
    });
    
    setActiveView('library');
  };
  
  const handleCancel = () => {
    setActiveView('library');
    setSelectedTemplate(null);
  };
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="mr-2" 
                onClick={() => setLocation('/client-portal')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold text-indigo-800">Document Templates</h1>
            </div>
            <p className="text-gray-600 mt-1">
              {activeView === 'library' && 'Manage your document templates for regulatory submissions'}
              {activeView === 'editor' && (selectedTemplate ? 'Edit template' : 'Create a new template')}
              {activeView === 'analyzer' && 'Analyze template quality and regulatory compliance'}
            </p>
          </div>
          
          {activeView === 'library' && (
            <Button onClick={handleCreateTemplate} className="flex items-center">
              <Plus size={16} className="mr-1" />
              New Template
            </Button>
          )}
        </div>
        
        {currentClientWorkspace && activeView === 'library' && (
          <div className="mt-2 text-sm text-gray-500 flex items-center">
            <BookOpen size={16} className="mr-1" />
            Client: <span className="font-medium ml-1">{currentClientWorkspace.name}</span>
          </div>
        )}
      </div>
      
      {activeView === 'library' && (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Templates</TabsTrigger>
            <TabsTrigger value="m1">Module 1</TabsTrigger>
            <TabsTrigger value="m2">Module 2</TabsTrigger>
            <TabsTrigger value="m3">Module 3</TabsTrigger>
            <TabsTrigger value="m4">Module 4</TabsTrigger>
            <TabsTrigger value="m5">Module 5</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <ClientTemplateLibrary 
              onEditTemplate={handleEditTemplate}
              onAnalyzeTemplate={handleAnalyzeTemplate}
            />
          </TabsContent>
          
          <TabsContent value="m1">
            <ClientTemplateLibrary 
              categoryFilter="m1"
              onEditTemplate={handleEditTemplate}
              onAnalyzeTemplate={handleAnalyzeTemplate}
            />
          </TabsContent>
          
          <TabsContent value="m2">
            <ClientTemplateLibrary 
              categoryFilter="m2"
              onEditTemplate={handleEditTemplate}
              onAnalyzeTemplate={handleAnalyzeTemplate}
            />
          </TabsContent>
          
          <TabsContent value="m3">
            <ClientTemplateLibrary 
              categoryFilter="m3"
              onEditTemplate={handleEditTemplate}
              onAnalyzeTemplate={handleAnalyzeTemplate}
            />
          </TabsContent>
          
          <TabsContent value="m4">
            <ClientTemplateLibrary 
              categoryFilter="m4"
              onEditTemplate={handleEditTemplate}
              onAnalyzeTemplate={handleAnalyzeTemplate}
            />
          </TabsContent>
          
          <TabsContent value="m5">
            <ClientTemplateLibrary 
              categoryFilter="m5"
              onEditTemplate={handleEditTemplate}
              onAnalyzeTemplate={handleAnalyzeTemplate}
            />
          </TabsContent>
        </Tabs>
      )}
      
      {activeView === 'editor' && (
        <TemplateEditor
          templateId={selectedTemplate?.id}
          onSave={handleSaveTemplate}
          onCancel={handleCancel}
        />
      )}
      
      {activeView === 'analyzer' && (
        <div className="space-y-6">
          <TemplateQualityAnalyzer 
            template={selectedTemplate}
            onFixIssues={(issueId) => {
              toast({
                title: "Issue Fixed",
                description: "The template has been updated to fix the issue.",
              });
            }}
          />
          
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="mx-auto"
            >
              Back to Template Library
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}