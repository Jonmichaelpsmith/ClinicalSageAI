import React, { useState } from 'react';
import { Search, Loader2, Info } from 'lucide-react';

/**
 * AICopilotPanel
 * 
 * Right-side panel for the Co-Author feature that provides AI assistance.
 * Includes context retrieval, draft generation, and section validation.
 */
export default function AICopilotPanel() {
  const [contextQuery, setContextQuery] = useState('');
  const [contextSnippets, setContextSnippets] = useState([]);
  const [loadingContext, setLoadingContext] = useState(false);
  const [selectedSnippets, setSelectedSnippets] = useState([]);
  
  // Handle context search
  const handleContextSearch = async () => {
    if (!contextQuery.trim()) return;
    
    setLoadingContext(true);
    
    try {
      // Simulate API call
      setTimeout(() => {
        // Sample context snippets
        const sampleSnippets = [
          {
            id: 1,
            source: "ICH E3 Guidelines",
            text: "Clinical summaries should include a comprehensive analysis of all clinical data relevant to the product."
          },
          {
            id: 2,
            source: "FDA Guidance, 2023",
            text: "Section 2.7 should provide a detailed summary of clinical findings, including benefits and risks assessment."
          },
          {
            id: 3,
            source: "EMA Clinical Documentation",
            text: "The clinical summary should be concise but comprehensive, highlighting key efficacy and safety findings."
          }
        ];
        
        setContextSnippets(sampleSnippets);
        setLoadingContext(false);
      }, 800);
    } catch (error) {
      console.error('Error fetching context:', error);
      setLoadingContext(false);
    }
  };
  
  // Toggle a context snippet selection
  const toggleSnippetSelection = (snippet) => {
    if (selectedSnippets.some(s => s.id === snippet.id)) {
      setSelectedSnippets(selectedSnippets.filter(s => s.id !== snippet.id));
    } else {
      setSelectedSnippets([...selectedSnippets, snippet]);
    }
  };
  
  // Check if a snippet is selected
  const isSnippetSelected = (snippet) => {
    return selectedSnippets.some(s => s.id === snippet.id);
  };
  
  return (
    <div className="ai-copilot-panel">
      <h2 className="text-xl font-medium mb-4">Risk Heatmap</h2>
      
      {/* Search box */}
      <div className="mb-6">
        <label htmlFor="context-search" className="block text-sm font-medium text-gray-700 mb-1">
          Search Regulatory Context
        </label>
        <div className="flex gap-2">
          <input
            id="context-search"
            type="text"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Search for relevant guidance..."
            value={contextQuery}
            onChange={(e) => setContextQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleContextSearch();
            }}
          />
          <button
            onClick={handleContextSearch}
            disabled={loadingContext || !contextQuery.trim()}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loadingContext ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      
      {/* Context search results */}
      {contextSnippets.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Found {contextSnippets.length} relevant sources:
          </h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {contextSnippets.map((snippet) => (
              <div 
                key={snippet.id}
                className={`p-3 text-sm border rounded-md cursor-pointer transition-colors ${
                  isSnippetSelected(snippet)
                    ? 'bg-indigo-50 border-indigo-200'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => toggleSnippetSelection(snippet)}
              >
                <p className="text-gray-700 italic">"{snippet.text}"</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">{snippet.source}</span>
                  {isSnippetSelected(snippet) ? (
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                      Selected
                    </span>
                  ) : (
                    <span className="text-xs text-indigo-600">Click to select</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Timeline simulator placeholder */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Timeline Simulator</h3>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
          <div className="flex justify-center items-center h-32">
            <p className="text-gray-500 text-sm">Timeline visualization will appear here</p>
          </div>
        </div>
      </div>
      
      {/* Ask Lumen AI */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Ask Lumen AI</h3>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
          <div className="mb-2 flex items-start">
            <Info className="h-4 w-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-xs text-gray-500">
              Ask Lumen AI questions about regulatory guidelines, submission requirements, or
              best practices for this section.
            </p>
          </div>
          <textarea 
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
            placeholder="Ask a question..."
            rows={2}
          />
          <button className="mt-2 px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors">
            Ask
          </button>
        </div>
      </div>
    </div>
  );
}