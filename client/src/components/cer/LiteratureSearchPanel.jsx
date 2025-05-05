import React, { useState } from 'react';
import { searchLiterature, generateCitations } from '@/services/LiteratureAPIService';

/**
 * Literature Search Panel Component for CER Generator
 * 
 * Provides functionality to search PubMed for literature related to a medical device,
 * select relevant papers, and generate citations for integration into the CER.
 */
const LiteratureSearchPanel = ({ cerTitle, onAddToCER }) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    yearFrom: new Date().getFullYear() - 5, // Default to last 5 years
    yearTo: new Date().getFullYear(),
    journalType: ''
  });
  const [results, setResults] = useState([]);
  const [selectedPapers, setSelectedPapers] = useState([]);
  const [citations, setCitations] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Default to using the CER title as the query if no query is entered
  const effectiveQuery = query || cerTitle; 

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!effectiveQuery) {
      setError('Please enter a search query or specify a CER title');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await searchLiterature({ 
        query: effectiveQuery, 
        filters,
        limit: 20 
      });
      
      setResults(data.results || []);
      
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

  const handleAddToCER = () => {
    if (!citations) {
      setError('Please generate citations first');
      return;
    }
    
    // Format the literature section with selected papers and citations
    const literatureSection = {
      type: 'Literature Review',
      content: `
## Literature Review

${selectedPapers.map(paper => (
  `### ${paper.title}
${paper.authors.join(', ')}
${paper.journal}, ${paper.publicationDate}

${paper.abstract}
`
)).join('\n\n')}

## References

${citations}
`
    };
    
    onAddToCER(literatureSection);
  };

  return (
    <div className="space-y-4 p-4 border rounded-md bg-white">
      <h2 className="text-xl font-bold">Literature Search</h2>
      
      {error && (
        <div className="p-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Search Query</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={cerTitle || "Enter search terms"}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
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
              <option value="Randomized Controlled Trial">Randomized Controlled Trial</option>
            </select>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Searching...' : 'Search PubMed'}
        </button>
      </form>
      
      {results.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Search Results</h3>
          <div className="border rounded max-h-96 overflow-y-auto">
            {results.map(paper => (
              <div 
                key={paper.id}
                className={`p-3 border-b ${selectedPapers.some(p => p.id === paper.id) ? 'bg-blue-50' : ''}`}
              >
                <div className="flex justify-between">
                  <h4 className="font-medium">{paper.title}</h4>
                  <button
                    onClick={() => handleSelectPaper(paper)}
                    className={`px-2 py-1 text-sm rounded ${selectedPapers.some(p => p.id === paper.id) ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  >
                    {selectedPapers.some(p => p.id === paper.id) ? 'Selected' : 'Select'}
                  </button>
                </div>
                <p className="text-sm text-gray-600">{paper.authors.join(', ')}</p>
                <p className="text-sm">{paper.journal}, {paper.publicationDate}</p>
                {paper.abstract && (
                  <p className="text-sm mt-2 line-clamp-3">{paper.abstract}</p>
                )}
                <a 
                  href={paper.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm hover:underline mt-1 inline-block"
                >
                  View on PubMed
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {selectedPapers.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Selected Papers ({selectedPapers.length})</h3>
            <button
              onClick={handleGenerateCitations}
              disabled={isLoading}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
            >
              Generate Citations
            </button>
          </div>
          
          {citations && (
            <div className="mt-4 p-3 border rounded bg-gray-50">
              <h4 className="font-medium mb-2">Generated Citations</h4>
              <div className="text-sm whitespace-pre-line">{citations}</div>
              <button
                onClick={handleAddToCER}
                className="mt-3 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
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
