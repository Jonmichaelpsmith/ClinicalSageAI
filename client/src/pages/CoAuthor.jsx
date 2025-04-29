import React, { useState } from 'react';
import axios from 'axios';
import UnifiedTopNavV3 from '../components/navigation/UnifiedTopNavV3';
import ModuleSectionEditor from '../components/ModuleSectionEditor';
import { CheckCircle, AlertTriangle, Info, X, Search, Loader2 } from 'lucide-react';

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
  const [sectionText, setSectionText] = useState(initialContent);
  
  // New state for context retrieval and validation
  const [contextQuery, setContextQuery] = useState('');
  const [contextSnippets, setContextSnippets] = useState([]);
  const [validationIssues, setValidationIssues] = useState(null);
  const [loadingContext, setLoadingContext] = useState(false);
  const [validating, setValidating] = useState(false);
  const [selectedContext, setSelectedContext] = useState([]);
  const [generatingDraft, setGeneratingDraft] = useState(false);

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
  
  // Handle content change from editor
  const handleContentChange = (content) => {
    setSectionText(content);
  };

  // Context Retrieval
  const fetchContext = async () => {
    if (!contextQuery.trim()) return;
    
    setLoadingContext(true);
    try {
      const { data } = await axios.get('/api/coauthor/context', {
        params: { query: contextQuery }
      });
      
      if (data.success && data.snippets) {
        setContextSnippets(data.snippets);
      } else {
        console.error('Context fetch returned invalid data', data);
        setContextSnippets([]);
      }
    } catch (err) {
      console.error('Context fetch error', err);
      setContextSnippets([]);
    } finally {
      setLoadingContext(false);
    }
  };

  // Generate Draft
  const handleGenerateDraft = async () => {
    setGeneratingDraft(true);
    setValidationIssues(null); // Clear any existing validation issues
    
    try {
      const { data } = await axios.post('/api/coauthor/generate', {
        moduleId,
        sectionId,
        prompt: sectionText,
        context: selectedContext.map(s => s.text)
      });
      
      if (data.success && data.draft) {
        setSectionText(data.draft);
        // Show a temporary success message
        setValidationIssues([{
          type: 'info',
          message: 'Draft generated successfully. You can now edit or further refine it.'
        }]);
      } else {
        console.error('Draft generation returned error', data);
        setValidationIssues([{ 
          type: 'error', 
          message: data.error || 'Failed to generate draft content' 
        }]);
      }
    } catch (err) {
      console.error('Draft generation error', err);
      setValidationIssues([{ 
        type: 'error', 
        message: 'Server error during draft generation. Please try again.' 
      }]);
    } finally {
      setGeneratingDraft(false);
    }
  };

  // Validate Draft
  const validateDraft = async () => {
    setValidating(true);
    try {
      const { data } = await axios.post('/api/coauthor/validate', {
        section: sectionText,
        moduleId,
        sectionId
      });
      
      if (data.success) {
        setValidationIssues(data.issues || []);
      } else {
        console.error('Validation returned error', data);
        setValidationIssues([{ 
          type: 'error', 
          message: data.error || 'Server error during validation.' 
        }]);
      }
    } catch (err) {
      console.error('Validation error', err);
      setValidationIssues([{ 
        type: 'error', 
        message: 'Server error during validation.' 
      }]);
    } finally {
      setValidating(false);
    }
  };
  
  // Toggle a context snippet for selection
  const toggleSnippetSelection = (snippet) => {
    setSelectedContext(prev => {
      // Check if this snippet is already selected
      const isSelected = prev.some(item => 
        item.docId === snippet.docId && item.text === snippet.text
      );
      
      if (isSelected) {
        // Remove it from selection
        return prev.filter(item => 
          !(item.docId === snippet.docId && item.text === snippet.text)
        );
      } else {
        // Add it to selection
        return [...prev, snippet];
      }
    });
  };
  
  // Check if a snippet is selected
  const isSnippetSelected = (snippet) => {
    return selectedContext.some(item => 
      item.docId === snippet.docId && item.text === snippet.text
    );
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column - Editor Component */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <ModuleSectionEditor 
                initialContent={initialContent}
                moduleId={moduleId}
                sectionId={sectionId}
                onSave={handleSave}
                onCancel={handleCancel}
                onContentChange={handleContentChange}
                contextSnippets={selectedContext}
              />
              
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={handleGenerateDraft}
                  disabled={generatingDraft || !sectionText.trim()}
                  className="flex items-center px-4 py-2 bg-indigo-600 disabled:bg-indigo-300 text-white rounded hover:bg-indigo-700 transition-colors"
                >
                  {generatingDraft ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">✨</span>
                      Generate Draft
                    </>
                  )}
                </button>
                
                <button
                  onClick={validateDraft}
                  disabled={validating || !sectionText.trim()}
                  className="flex items-center px-4 py-2 bg-amber-600 disabled:bg-amber-300 text-white rounded hover:bg-amber-700 transition-colors"
                >
                  {validating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Validate Draft
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Validation Issues */}
            {validationIssues && validationIssues.length > 0 && (
              <div className="mt-4 bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <h3 className="text-amber-800 font-medium mb-2 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" /> 
                  Validation Issues
                </h3>
                <ul className="space-y-2">
                  {validationIssues.map((issue, i) => (
                    <li key={i} className="flex">
                      {issue.type === 'error' ? (
                        <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                      ) : issue.type === 'warning' ? (
                        <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                      ) : (
                        <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${
                        issue.type === 'error' 
                          ? 'text-red-700' 
                          : issue.type === 'warning' 
                            ? 'text-amber-700'
                            : 'text-blue-700'
                      }`}>{issue.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Success message */}
            {contentSaved && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Content saved successfully
                </p>
              </div>
            )}
          </div>
          
          {/* Sidebar Column - Context Retrieval */}
          <div className="lg:col-span-1">
            <div className="bg-white p-4 rounded-lg shadow-sm border sticky top-6">
              <h3 className="font-medium text-gray-900 mb-3">Context Retrieval</h3>
              
              <div className="flex space-x-2">
                <input
                  type="text" 
                  value={contextQuery}
                  onChange={(e) => setContextQuery(e.target.value)}
                  placeholder="Search for regulatory context..."
                  className="flex-1 border rounded-md px-3 py-2 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') fetchContext();
                  }}
                />
                <button
                  onClick={fetchContext}
                  disabled={loadingContext || !contextQuery.trim()}
                  className="flex-shrink-0 bg-indigo-600 text-white px-3 py-2 rounded-md disabled:bg-indigo-300 hover:bg-indigo-700 transition-colors"
                >
                  {loadingContext ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              {contextSnippets.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Found {contextSnippets.length} relevant sources:
                  </h4>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {contextSnippets.map((snippet, idx) => (
                      <div 
                        key={idx}
                        className={`p-3 rounded-md border text-sm transition-colors cursor-pointer ${
                          isSnippetSelected(snippet)
                            ? 'bg-indigo-50 border-indigo-200'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                        onClick={() => toggleSnippetSelection(snippet)}
                      >
                        <p className="text-gray-800 italic">"{snippet.text}"</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">{snippet.source}</span>
                          <button 
                            className={`text-xs px-2 py-1 rounded ${
                              isSnippetSelected(snippet)
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {isSnippetSelected(snippet) ? 'Selected' : 'Use'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedContext.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-700">
                      Selected Context ({selectedContext.length})
                    </h4>
                    <button 
                      className="text-xs text-red-600 hover:text-red-800"
                      onClick={() => setSelectedContext([])}
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}