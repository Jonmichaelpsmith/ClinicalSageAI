import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SectionHeader from './SectionHeader';
import DraftEditor from './DraftEditor';
import TemplateEditor from './TemplateEditor';
import RegulatorySearch from './RegulatorySearch';
import RiskAnalysisWidget from './RiskAnalysisWidget';
import GuidancePanel from './GuidancePanel';
import LumenChatPane from './LumenChatPane';
import TimelineSimulator from './TimelineSimulator';
import CanvasWorkbenchModule from './CanvasWorkbenchModule';
import { FileText, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import templates from '@/services/templates/ctdTemplates.json';

export default function CoauthorModule() {
  const sections = [
    { id: '2.1', title: 'Table of Contents' },
    { id: '2.2', title: 'Introduction' },
    { id: '2.3', title: 'Quality Overall Summary' },
    { id: '2.4', title: 'Nonclinical Overview' },
    { id: '2.5', title: 'Clinical Overview' },
    { id: '2.6', title: 'Nonclinical Written and Tabulated Summaries' },
    { id: '2.7', title: 'Clinical Summary' },
    { id: '2.8', title: 'Bibliography' }
  ];

  const [activeSection, setActiveSection] = useState('2.7');
  const [contentMap, setContentMap] = useState(
    Object.fromEntries(sections.map(s => [s.id, 'This is the initial content for your CTD section ' + s.id + '. You can edit this and use AI to help generate a compliant draft.']))
  );
  const [activeTab, setActiveTab] = useState('editor');
  const submissionId = 'SUB-123456'; // This would normally come from a route parameter or context

  const handleChange = (text) => {
    setContentMap(prev => ({ ...prev, [activeSection]: text }));
  };

  const handleGenerate = () => {
    // enqueue draft generation via WebSocket
    console.log('Generating draft for section', activeSection);
  };

  const currentSectionTitle = sections.find(s => s.id === activeSection)?.title || 'Unknown Section';

  return (
    <div className="p-6 space-y-6">
      {/* Section Navigation */}
      <nav className="flex space-x-2 overflow-x-auto pb-2 mb-4 border-b">
        {sections.map(section => (
          <Button
            key={section.id}
            variant={activeSection === section.id ? "default" : "outline"}
            className={activeSection === section.id 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'hover:bg-blue-50'}
            onClick={() => setActiveSection(section.id)}
            size="sm"
          >
            {section.id}
          </Button>
        ))}
      </nav>

      <SectionHeader
        sectionId={activeSection}
        title={currentSectionTitle}
        onGenerate={handleGenerate}
      />

      <Tabs 
        defaultValue="editor" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="editor" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Document Editor</span>
          </TabsTrigger>
          <TabsTrigger value="canvas" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            <span>Canvas Workbench</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {templates[activeSection] ? (
                <TemplateEditor
                  sectionId={activeSection}
                  content={contentMap[activeSection]}
                  onChange={handleChange}
                  onGenerateDraft={handleGenerate}
                />
              ) : (
                <DraftEditor
                  content={contentMap[activeSection]}
                  onChange={handleChange}
                  onGenerateDraft={handleGenerate}
                />
              )}
            </div>

            <aside className="space-y-4">
              <RegulatorySearch sectionId={activeSection} />
              <RiskAnalysisWidget sectionId={activeSection} />
              <GuidancePanel sectionId={activeSection} />
            </aside>
          </div>

          <div className="space-y-6">
            <LumenChatPane contextId={activeSection} />
            <TimelineSimulator submissionId={submissionId} />
          </div>
        </TabsContent>
        
        <TabsContent value="canvas">
          <div className="border rounded-lg shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
            <CanvasWorkbenchModule submissionId={submissionId} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}