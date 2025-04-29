import React, { useState } from 'react';

/**
 * SectionEditor
 * 
 * Main editor component for CTD sections with rich text editing capabilities
 */
export default function SectionEditor() {
  const [sectionContent, setSectionContent] = useState(
    'This is the initial content for your CTD section. You can edit this and use AI to help generate a compliant draft.'
  );
  
  // Sample section for demo
  const sectionTitle = "Section 2.7: Clinical Summary";
  const sectionSubtitle = "Section Editor";
  
  const handleContentChange = (e) => {
    setSectionContent(e.target.value);
  };
  
  return (
    <div className="section-editor-container">
      <h1 className="text-2xl font-medium text-gray-900 mb-1">{sectionTitle}</h1>
      <h2 className="text-lg text-gray-600 mb-4">{sectionSubtitle}</h2>
      
      <div className="text-sm text-right text-gray-500 mb-1">
        Press <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded">Ctrl+Enter</kbd> to generate
      </div>
      
      <div className="editor-area border border-gray-300 rounded-md p-4 min-h-[400px] bg-white">
        <textarea
          className="w-full h-full min-h-[350px] focus:outline-none resize-none"
          value={sectionContent}
          onChange={handleContentChange}
          placeholder="Enter your section content here..."
        />
      </div>
    </div>
  );
}