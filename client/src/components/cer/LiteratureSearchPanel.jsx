import React, { useState, useEffect } from 'react';
import { searchLiterature, generateCitations, summarizePaper } from '@/services/LiteratureAPIService';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Search, Plus, Check, FileText } from 'lucide-react';

/**
 * Literature Search Panel Component for CER Generator
 * 
 * Provides functionality to search PubMed and Google Scholar for literature related to a medical device,
 * select relevant papers, generate summaries, and create citations for integration into the CER.
 */
const LiteratureSearchPanel = ({ cerTitle, onAddToCER }) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    yearFrom: new Date().getFullYear() - 5, // Default to last 5 years
    yearTo: new Date().getFullYear(),
    journalType: ''
  });
  const [searchSources, setSearchSources] = useState(['pubmed', 'googleScholar']);
  const [results, setResults] = useState([]);
  const [selectedPapers, setSelectedPapers] = useState([]);
  const [citations, setCitations] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchMetadata, setSearchMetadata] = useState(null);
  const [paperSummaries, setPaperSummaries] = useState({});
  const [activePaper, setActivePaper] = useState(null);

  // Default to using the CER title as the query if no query is entered
  const effectiveQuery = query || cerTitle; 
  
  // Auto-suggest a search query based on the CER title when component loads
  useEffect(() => {
    if (cerTitle && !query) {
      // Extract device/product name from title if it follows a pattern like "Clinical Evaluation Report: Device Name"
      const titleParts = cerTitle.split(':');
      if (titleParts.length > 1) {
        const deviceName = titleParts[1].trim();
        setQuery(deviceName);
      }
    }
  }, [cerTitle]);

  // Handle source selection toggle
  const toggleSource = (source) => {
    if (searchSources.includes(source)) {
      // Don't allow deselecting all sources
      if (searchSources.length > 1) {
        setSearchSources(searchSources.filter(s => s !== source));
      }
    } else {
      setSearchSources([...searchSources, source]);
    }
  };
  
  // Get summary for a paper
  const getSummary = async (paper) => {
    // If we already have the summary, no need to fetch again
    if (paperSummaries[paper.id]) {
      setActivePaper(paper.id);
      return;
    }
    
    try {
      setSummaryLoading(true);
      setActivePaper(paper.id);
      
      const data = await summarizePaper({
        text: paper.abstract,
        context: cerTitle || 'Clinical Evaluation Report'
      });
      
      setPaperSummaries(prev => ({
        ...prev,
        [paper.id]: data.summary
      }));
    } catch (err) {
      console.error('Paper summarization failed:', err);
      setPaperSummaries(prev => ({
        ...prev,
        [paper.id]: 'Error generating summary. Please try again.'
      }));
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!effectiveQuery) {
      setError('Please enter a search query or specify a CER title');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setResults([]);
      setPaperSummaries({});
      setActivePaper(null);
      setSearchMetadata(null);
      
      const data = await searchLiterature({ 
        query: effectiveQuery, 
        filters,
        sources: searchSources,
        limit: 20 
      });
      
      setResults(data.results || []);
      setSearchMetadata(data.metadata || null);
      
      if (data.results?.length === 0) {
        setError('No results found. Try broadening your search.');
      }
    } catch (err) {
      setError(`Search failed: ${err.message}`);
      console.error('Literature search failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPaper = (paper) => {
    // Check if already selected
    if (selectedPapers.some(p => p.id === paper.id)) {
      setSelectedPapers(selectedPapers.filter(p => p.id !== paper.id));
    } else {
      setSelectedPapers([...selectedPapers, paper]);
    }
  };

  const handleGenerateCitations = async () => {
    if (selectedPapers.length === 0) {
      setError('Please select at least one paper');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await generateCitations({ 
        papers: selectedPapers,
        format: 'vancouverStyle' 
      });
      
      setCitations(data.citations || '');
    } catch (err) {
      setError(`Citation generation failed: ${err.message}`);
      console.error('Citation generation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate a literature review and add it to the CER
  const handleAddToCER = () => {
    if (!citations) {
      setError('Please generate citations first');
      return;
    }
    
    // Format the literature section with selected papers and citations using AI summaries when available
    const literatureSection = {
      type: 'Literature Review',
      content: `
## Literature Review

${selectedPapers.map(paper => {
  const summary = paperSummaries[paper.id] || paper.abstract;
  return `### ${paper.title}
${paper.authors.join(', ')}
${paper.journal}, ${paper.publicationDate}

${summary}
`;
}).join('\n\n')}

## References

${citations}
`
    };
    
    onAddToCER(literatureSection);
  };

  return (
    <div className="space-y-6 p-4 border rounded-md bg-white">
      <div>
        <h2 className="text-xl font-bold">Literature AI Search</h2>
        <p className="text-sm text-gray-500">Search scientific literature for your Clinical Evaluation Report</p>
      </div>
      
      {error && (
        <div className="p-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSearch} className="space-y-5 p-4 border rounded-lg bg-gray-50">
        <div>
          <label className="block text-sm font-medium mb-1">Search Query</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={cerTitle || "Enter search terms"}
              className="flex-1 p-2 border rounded"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Search
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Search Sources</label>
            <div className="flex gap-2">
              <Badge 
                onClick={() => toggleSource('pubmed')} 
                className={`cursor-pointer ${searchSources.includes('pubmed') ? 'bg-blue-600' : 'bg-gray-200 text-gray-800'}`}
              >
                PubMed
              </Badge>
              <Badge 
                onClick={() => toggleSource('googleScholar')} 
                className={`cursor-pointer ${searchSources.includes('googleScholar') ? 'bg-blue-600' : 'bg-gray-200 text-gray-800'}`}
              >
                Google Scholar
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full">
            <div>
              <label className="block text-sm font-medium mb-1">Year From</label>
              <input
                type="number"
                value={filters.yearFrom}
                onChange={(e) => setFilters({...filters, yearFrom: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Year To</label>
              <input
                type="number"
                value={filters.yearTo}
                onChange={(e) => setFilters({...filters, yearTo: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Journal Type</label>
              <select
                value={filters.journalType}
                onChange={(e) => setFilters({...filters, journalType: e.target.value})}
                className="w-full p-2 border rounded"
              >
                <option value="">All Journal Types</option>
                <option value="Clinical Trial">Clinical Trial</option>
                <option value="Review">Review</option>
                <option value="Meta-Analysis">Meta-Analysis</option>
                <option value="Randomized Controlled Trial">RCT</option>
                <option value="Case Report">Case Report</option>
              </select>
            </div>
          </div>
        </div>
      </form>
      
      {searchMetadata && (
        <div className="text-sm text-gray-500 flex flex-wrap gap-3">
          <span>Total results: {searchMetadata.totalResults || 0}</span>
          {searchMetadata.pubmedCount > 0 && (
            <span>PubMed: {searchMetadata.pubmedCount}</span>
          )}
          {searchMetadata.scholarCount > 0 && (
            <span>Google Scholar: {searchMetadata.scholarCount}</span>
          )}
          {searchMetadata.duplicatesRemoved > 0 && (
            <span>Duplicates removed: {searchMetadata.duplicatesRemoved}</span>
          )}
        </div>
      )}
      
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Search Results ({results.length})</h3>
            <div className="border rounded max-h-[600px] overflow-y-auto">
              {results.map(paper => (
                <div 
                  key={paper.id}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                    selectedPapers.some(p => p.id === paper.id) ? 'bg-blue-50' : ''
                  } ${activePaper === paper.id ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => getSummary(paper)}
                >
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-medium text-blue-800">{paper.title}</h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPaper(paper);
                      }}
                      className={`shrink-0 p-1 rounded ${
                        selectedPapers.some(p => p.id === paper.id) 
                          ? 'bg-green-100 text-green-800 border border-green-300' 
                          : 'bg-gray-100 text-gray-800 border border-gray-300'
                      }`}
                    >
                      {selectedPapers.some(p => p.id === paper.id) 
                        ? <Check className="h-4 w-4" /> 
                        : <Plus className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-gray-600">
                    <Badge 
                      variant="outline" 
                      className={`${paper.source === 'PubMed' ? 'border-blue-300 bg-blue-50' : 'border-emerald-300 bg-emerald-50'}`}
                    >
                      {paper.source}
                    </Badge>
                    
                    <span>{paper.journal}</span>
                    <span>·</span>
                    <span>{paper.publicationDate}</span>
                    
                    {paper.citationCount && (
                      <>
                        <span>·</span>
                        <span>Citations: {paper.citationCount}</span>
                      </>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-800 mt-2 line-clamp-2">
                    {paper.authors.slice(0, 3).join(', ')}
                    {paper.authors.length > 3 ? ` and ${paper.authors.length - 3} more` : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
            
          <div>
            {activePaper ? (
              <div className="border rounded p-4 h-full">
                <h3 className="text-lg font-semibold">
                  Paper Summary
                  {summaryLoading && <Loader2 className="ml-2 h-4 w-4 inline animate-spin" />}
                </h3>
                
                {activePaper && results.find(p => p.id === activePaper) && (
                  <div className="mt-2">
                    <h4 className="font-medium text-blue-800">
                      {results.find(p => p.id === activePaper)?.title}
                    </h4>
                    
                    <div className="mt-4 space-y-4">
                      {paperSummaries[activePaper] ? (
                        <div className="prose prose-sm max-w-none">
                          <h5 className="text-sm font-medium">AI Summary</h5>
                          <p className="whitespace-pre-line text-sm">
                            {paperSummaries[activePaper]}
                          </p>
                        </div>
                      ) : summaryLoading ? (
                        <div className="flex items-center justify-center p-8">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                      ) : (
                        <div className="prose prose-sm max-w-none">
                          <h5 className="text-sm font-medium">Abstract</h5>
                          <p className="text-sm">
                            {results.find(p => p.id === activePaper)?.abstract || 'No abstract available'}
                          </p>
                        </div>
                      )}
                      
                      <div className="pt-4 border-t flex justify-between">
                        <a 
                          href={results.find(p => p.id === activePaper)?.url || '#'}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 text-sm hover:underline flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <BookOpen className="h-4 w-4" />
                          View Full Paper
                        </a>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const paper = results.find(p => p.id === activePaper);
                            if (paper) handleSelectPaper(paper);
                          }}
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {selectedPapers.some(p => p.id === activePaper) ? (
                            <>
                              <Check className="h-4 w-4" />
                              Selected
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4" />
                              Select for CER
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="border rounded p-6 h-full flex flex-col items-center justify-center text-center text-gray-500">
                <FileText className="h-12 w-12 mb-4 text-gray-400" />
                <p>Select a paper to view its AI-generated summary</p>
                <p className="text-sm mt-2">
                  Summaries are tailored for your Clinical Evaluation Report
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {selectedPapers.length > 0 && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Selected Papers ({selectedPapers.length})</h3>
            <button
              onClick={handleGenerateCitations}
              disabled={isLoading}
              className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Generate Citations</>  
              )}
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {selectedPapers.map(paper => (
              <div key={paper.id} className="border bg-white rounded p-3 text-sm">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium line-clamp-2">{paper.title}</h4>
                  <button
                    onClick={() => handleSelectPaper(paper)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    Remove
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-1 line-clamp-1">{paper.authors.join(', ')}</p>
                <p className="text-xs mt-1">{paper.journal}, {paper.publicationDate}</p>
              </div>
            ))}
          </div>
          
          {citations && (
            <div className="mt-6 p-4 border rounded bg-white">
              <h4 className="font-medium mb-3">Generated Citations</h4>
              <div className="text-sm whitespace-pre-line border-l-4 border-gray-200 pl-4 py-2">{citations}</div>
              <button
                onClick={handleAddToCER}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Add Literature Review to CER
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LiteratureSearchPanel;
