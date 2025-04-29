import React from 'react';
import CoAuthorLayout from '../components/coauthor/CoAuthorLayout';
import SectionEditor from '../components/coauthor/SectionEditor';
import AICopilotPanel from '../components/coauthor/AICopilotPanel';

/**
 * eCTD Co-Author Page
 * 
 * This page provides AI-assisted co-authoring of CTD submission sections
 * with context retrieval and draft generation capabilities.
 */
export default function CoAuthor() {
  return (
    <CoAuthorLayout copilot={<AICopilotPanel />}>
      <SectionEditor />
    </CoAuthorLayout>
  );
}