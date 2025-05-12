import React, { useState, useEffect } from 'react';
import { FDA510kService } from '../../services/FDA510kService';

/**
 * LiteratureCard Component
 * 
 * This component provides a UI for searching and displaying relevant
 * scientific literature for a medical device from PubMed.
 */
const LiteratureCard = ({ 
  deviceProfile,
  onArticleSelect,
  selectedArticles = [],
  organizationId = null
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [articles, setArticles] = useState([]);
  const [searchError, setSearchError] = useState(null);
  const [searchKeywords, setSearchKeywords] = useState('');
  const [expandedAbstracts, setExpandedAbstracts] = useState({});
  
  // Load articles when device profile changes
  useEffect(() => {
    if (deviceProfile && deviceProfile.name) {
      searchLiterature();
    }
  }, [deviceProfile]);
  
  // Search for literature based on device profile
  const searchLiterature = async () => {
    if (!deviceProfile) return;
    
    setIsLoading(true);
    setSearchError(null);
    
    try {
      // Convert comma-separated keywords to array
      const keywordsArray = searchKeywords
        ? searchKeywords.split(',').map(k => k.trim()).filter(Boolean)
        : [];
      
      // Call the FDA510kService to find literature
      const result = await FDA510kService.searchLiterature({
        deviceName: deviceProfile.name,
        manufacturer: deviceProfile.manufacturer,
        medicalSpecialty: deviceProfile.medicalSpecialty,
        intendedUse: deviceProfile.intendedUse,
        keywords: keywordsArray,
        limit: 5
      }, organizationId);
      
      if (result && result.articles) {
        setArticles(result.articles);
      } else {
        setArticles([]);
        if (result && result.error) {
          setSearchError(result.error);
        }
      }
    } catch (error) {
      console.error('Error searching for literature:', error);
      setSearchError('Failed to search for literature. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle keyword search input changes
  const handleKeywordsChange = (e) => {
    setSearchKeywords(e.target.value);
  };
  
  // Handle article selection
  const handleArticleSelect = (article) => {
    if (onArticleSelect) {
      onArticleSelect(article);
    }
  };
  
  // Check if an article is already selected
  const isArticleSelected = (pmid) => {
    return selectedArticles.some(a => a.pmid === pmid);
  };
  
  // Toggle abstract expansion
  const toggleAbstract = (pmid) => {
    setExpandedAbstracts(prev => ({
      ...prev,
      [pmid]: !prev[pmid]
    }));
  };
  
  // Format authors list for display
  const formatAuthors = (authors) => {
    if (!authors || authors.length === 0) return 'Unknown';
    if (authors.length === 1) return authors[0];
    if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
    return `${authors[0]} et al.`;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <h3 className="text-lg font-medium mb-4">Relevant Literature</h3>
      
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Additional search keywords (comma-separated)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            value={searchKeywords}
            onChange={handleKeywordsChange}
          />
          <button
            onClick={searchLiterature}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-white ${
              isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Searching literature for: {deviceProfile?.name || 'Unknown device'}
        </p>
      </div>
      
      {searchError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
          {searchError}
        </div>
      )}
      
      {articles.length === 0 && !isLoading && !searchError && (
        <div className="bg-yellow-50 border border-yellow-100 text-yellow-800 px-4 py-3 rounded mb-4">
          No relevant literature found. Try adding more keywords or broadening your search criteria.
        </div>
      )}
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {articles.map((article) => (
          <div 
            key={article.pmid} 
            className={`border rounded-md p-3 ${
              isArticleSelected(article.pmid) 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 hover:border-indigo-200'
            }`}
          >
            <div className="flex justify-between">
              <div className="flex-1">
                <h4 className="font-medium">{article.title}</h4>
                <p className="text-sm text-gray-600">
                  {formatAuthors(article.authors)} • {article.journal} • {article.publicationDate}
                </p>
                
                <div className="mt-2">
                  <button
                    onClick={() => toggleAbstract(article.pmid)}
                    className="text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    {expandedAbstracts[article.pmid] ? 'Hide Abstract' : 'Show Abstract'}
                  </button>
                  
                  {expandedAbstracts[article.pmid] && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                      <p className="text-gray-700">{article.abstract}</p>
                      
                      {article.aiSummary && (
                        <div className="mt-2 p-2 bg-blue-50 rounded">
                          <p className="text-xs font-medium text-blue-800">AI Summary:</p>
                          <p className="text-sm text-gray-700">{article.aiSummary}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {article.keywords && article.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {article.keywords.map((keyword, index) => (
                        <span 
                          key={index}
                          className="text-xs bg-gray-100 px-2 py-0.5 rounded"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col gap-2 ml-4">
                <button
                  onClick={() => handleArticleSelect(article)}
                  className={`text-xs px-2 py-1 rounded ${
                    isArticleSelected(article.pmid)
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                  }`}
                >
                  {isArticleSelected(article.pmid) ? 'Selected' : 'Select'}
                </button>
                
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                >
                  View on PubMed
                </a>
                
                {article.doi && (
                  <a
                    href={`https://doi.org/${article.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  >
                    DOI
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {isLoading && (
        <div className="flex justify-center items-center h-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}
    </div>
  );
};

export default LiteratureCard;