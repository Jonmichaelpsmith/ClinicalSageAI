import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import SectionHeader from './SectionHeader';
import DraftEditor from './DraftEditor';
import RegulatorySearch from './RegulatorySearch';
import RiskAnalysisWidget from './RiskAnalysisWidget';
import GuidancePanel from './GuidancePanel';
import LumenChatPane from './LumenChatPane';
import TimelineSimulator from './TimelineSimulator';
import CanvasWorkbenchModule from './CanvasWorkbenchModule';
import { FileText, Layout } from 'lucide-react';

export default function CoauthorModule() {
  const [content, setContent] = useState(
    'This is the initial content for your CTD section. You can edit this and use AI to help generate a compliant draft.'
  );
  const [activeTab, setActiveTab] = useState('editor');
  const submissionId = 'SUB-123456'; // This would normally come from a route parameter or context

  return (
    <div className="p-6 space-y-6">
      <SectionHeader
        sectionId="2.7"
        title="Clinical Summary"
        onGenerate={() => {/* enqueue draft generation via WebSocket */}}
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
              <DraftEditor
                content={content}
                onChange={setContent}
                onGenerateDraft={() => {/* call /api/coauthor/generate-draft */}}
              />
            </div>

            <aside className="space-y-4">
              <RegulatorySearch />
              <RiskAnalysisWidget sectionId="2.7" />
              <GuidancePanel sectionId="2.7" />
            </aside>
          </div>

          <div className="space-y-6">
            <LumenChatPane contextId="2.7" />
            <TimelineSimulator />
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