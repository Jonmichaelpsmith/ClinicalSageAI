import React from 'react';
import ModuleSectionEditor from '../ModuleSectionEditor';

export default function SectionEditor() {
  const initialContent = 'This is the initial content for your CTD section. You can edit this and use AI to help generate a compliant draft.';
  
  // Placeholder handlers
  const handleSave = () => {
    console.log('Saving section content...');
  };
  
  const handleCancel = () => {
    console.log('Cancelling edit...');
  };
  
  const handleContentChange = (content) => {
    console.log('Content updated:', content.substring(0, 50) + '...');
  };
  
  return (
    <div className="section-editor">
      <h2 className="text-xl font-semibold mb-4">Section 2.7: Clinical Summary</h2>
      
      <ModuleSectionEditor 
        initialContent={initialContent}
        moduleId="m2"
        sectionId="2.7"
        onSave={handleSave}
        onCancel={handleCancel}
        onContentChange={handleContentChange}
      />
    </div>
  );
}