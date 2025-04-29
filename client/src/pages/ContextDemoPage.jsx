import React, { useState } from 'react';
import ContextPreview from '../components/ai/ContextPreview';
import ModuleSectionEditor from '../components/ModuleSectionEditor';

export default function ContextDemoPage() {
  const [activeTab, setActiveTab] = useState('preview');
  const [demoSnippets, setDemoSnippets] = useState([
    {
      id: 'snippet-1',
      chunkId: 'chunk-1',
      text: "Clinical studies must include comprehensive safety assessments, including adverse event monitoring, laboratory evaluations, and vital sign measurements.",
      score: 0.93
    },
    {
      id: 'snippet-2',
      chunkId: 'chunk-2',
      text: "The safety profile of the investigational product should be characterized based on preclinical data and any available clinical data from earlier phase studies.",
      score: 0.87
    },
    {
      id: 'snippet-3',
      chunkId: 'chunk-3',
      text: "ICH E2A provides guidance on definitions and standards for expedited reporting of adverse drug reactions that occur in clinical trials.",
      score: 0.81
    }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSnippetClick = (id) => {
    alert(`Clicked snippet with ID: ${id}`);
  };
  
  const simulateLoading = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };
  
  const simulateError = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setLoading(false);
      setError('Failed to fetch context snippets from the server');
    }, 1500);
  };
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Context Retrieval Demo</h1>
      
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('preview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'preview' 
                  ? 'border-indigo-500 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Component Preview
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'editor' 
                  ? 'border-indigo-500 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Section Editor
            </button>
          </nav>
        </div>
      </div>
      
      {activeTab === 'preview' ? (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">ContextPreview Component</h2>
            
            <div className="mb-4 flex space-x-4">
              <button 
                onClick={simulateLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500"
              >
                Simulate Loading
              </button>
              <button 
                onClick={simulateError}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500"
              >
                Simulate Error
              </button>
              <button 
                onClick={() => {
                  setLoading(false);
                  setError(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:ring-2 focus:ring-gray-500"
              >
                Reset
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border">
              <ContextPreview 
                snippets={demoSnippets} 
                onSnippetClick={handleSnippetClick}
                isLoading={loading}
                error={error}
              />
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium mb-2">Component Props:</h3>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li><code className="bg-gray-100 px-1 py-0.5 rounded">snippets</code>: Array of context snippets</li>
                <li><code className="bg-gray-100 px-1 py-0.5 rounded">onSnippetClick</code>: Callback when "Use here" is clicked</li>
                <li><code className="bg-gray-100 px-1 py-0.5 rounded">isLoading</code>: Loading state boolean</li>
                <li><code className="bg-gray-100 px-1 py-0.5 rounded">error</code>: Error message (if any)</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Section Editor with Context</h2>
          <p className="text-gray-600 mb-6">
            This editor demonstrates the full integration of context retrieval 
            with document editing. Try searching for "clinical safety data" and 
            clicking the "Use here" button on retrieved context snippets.
          </p>
          
          <ModuleSectionEditor 
            moduleId="ind"
            sectionId="clinical" 
            initialContent="# Clinical Protocol\n\nThis section will provide detailed information about the proposed clinical investigation."
            onSave={() => alert('Changes saved!')}
            onCancel={() => setActiveTab('preview')}
          />
        </div>
      )}
    </div>
  );
}