import React, { useState } from 'react';
import UnifiedTopNavV3 from '../components/navigation/UnifiedTopNavV3';
import ModuleSectionEditor from '../components/ModuleSectionEditor';

/**
 * eCTD Co-Author Page
 * 
 * This page provides AI-assisted co-authoring of CTD submission sections
 * with context retrieval and draft generation capabilities.
 */
export default function CoAuthor() {
  const [activeTab, setActiveTab] = useState('CoAuthor');
  const [moduleId, setModuleId] = useState('m2');
  const [sectionId, setSectionId] = useState('2.7');
  const [contentSaved, setContentSaved] = useState(false);
  const [initialContent, setInitialContent] = useState(
    'This is the initial content for your CTD section. You can edit this and use AI to help generate a compliant draft.'
  );

  // Breadcrumbs for navigation context
  const breadcrumbs = ['TrialSage™', 'eCTD Co-Author™', `Module ${moduleId.replace('m', '')}`, `Section ${sectionId}`];

  // Handle tab changes in the top navigation
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle save operation
  const handleSave = () => {
    setContentSaved(true);
    // In a real implementation, this would make an API call to save the content
    console.log(`Content saved for Module ${moduleId}, Section ${sectionId}`);
    
    // Reset the saved message after 3 seconds
    setTimeout(() => {
      setContentSaved(false);
    }, 3000);
  };

  // Handle cancel operation
  const handleCancel = () => {
    // In a real implementation, this would reset the content to the last saved version
    console.log('Edit canceled');
  };

  // Handle module change
  const handleModuleChange = (e) => {
    setModuleId(e.target.value);
  };

  // Handle section change
  const handleSectionChange = (e) => {
    setSectionId(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedTopNavV3 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        breadcrumbs={breadcrumbs}
      />

      <main className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">eCTD Co-Author™</h1>
          <p className="text-gray-600">
            AI-assisted co-authoring of CTD submission sections with regulatory compliance guidance.
          </p>
        </div>

        {/* Module/Section Selector */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div>
              <label htmlFor="module-select" className="block text-sm font-medium text-gray-700 mb-1">
                Module
              </label>
              <select
                id="module-select"
                value={moduleId}
                onChange={handleModuleChange}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="m1">Module 1: Administrative</option>
                <option value="m2">Module 2: CTD Summaries</option>
                <option value="m3">Module 3: Quality</option>
                <option value="m4">Module 4: Nonclinical</option>
                <option value="m5">Module 5: Clinical</option>
              </select>
            </div>

            <div>
              <label htmlFor="section-select" className="block text-sm font-medium text-gray-700 mb-1">
                Section
              </label>
              <select
                id="section-select"
                value={sectionId}
                onChange={handleSectionChange}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {moduleId === 'm2' && (
                  <>
                    <option value="2.1">2.1: Table of Contents</option>
                    <option value="2.2">2.2: Introduction</option>
                    <option value="2.3">2.3: Quality Overall Summary</option>
                    <option value="2.4">2.4: Nonclinical Overview</option>
                    <option value="2.5">2.5: Clinical Overview</option>
                    <option value="2.6">2.6: Nonclinical Written & Tabulated Summaries</option>
                    <option value="2.7">2.7: Clinical Summary</option>
                  </>
                )}
                {moduleId === 'm3' && (
                  <>
                    <option value="3.1">3.1: Table of Contents</option>
                    <option value="3.2">3.2: Body of Data</option>
                    <option value="3.3">3.3: Literature References</option>
                  </>
                )}
                {/* Add sections for other modules as needed */}
              </select>
            </div>
          </div>
        </div>

        {/* Editor Component */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <ModuleSectionEditor 
            initialContent={initialContent}
            moduleId={moduleId}
            sectionId={sectionId}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>

        {/* Success message */}
        {contentSaved && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">
              ✅ Content saved successfully
            </p>
          </div>
        )}
      </main>
    </div>
  );
}