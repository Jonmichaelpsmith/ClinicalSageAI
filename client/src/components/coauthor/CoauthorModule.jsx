import React, { useState } from 'react';
import SectionHeader from './SectionHeader';
import DraftEditor from './DraftEditor';
import RegulatorySearch from './RegulatorySearch';
import RiskAnalysisWidget from './RiskAnalysisWidget';
import GuidancePanel from './GuidancePanel';
import LumenChatPane from './LumenChatPane';
import TimelineSimulator from './TimelineSimulator';

export default function CoauthorModule() {
  const [content, setContent] = useState(
    'This is the initial content for your CTD section. You can edit this and use AI to help generate a compliant draft.'
  );

  return (
    <div className="p-6 space-y-6">
      <SectionHeader
        sectionId="2.7"
        title="Clinical Summary"
        onGenerate={() => {/* enqueue draft generation via WebSocket */}}
      />

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
    </div>
  );
}
