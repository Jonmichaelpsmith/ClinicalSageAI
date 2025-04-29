import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, Clock, Bookmark, X, FileText, ExternalLink, ThumbsUp } from 'lucide-react';

export default function RegulatorySearch() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([
    'ICH E3 clinical summary', 
    'FDA Module 2 requirements',
    'EMA eCTD guidance'
  ]);
  const [savedItems, setSavedItems] = useState([]);
  const searchRef = useRef(null);
  
  // Focus on search input when component mounts
  useEffect(() => {
    if (searchRef.current) {
      searchRef.current.focus();
    }
  }, []);
  
  // Simulate search results based on query
  const handleSearch = () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Generate mock regulatory search results based on query
      const results = generateMockResults(query);
      setSearchResults(results);
      setIsSearching(false);
      
      // Add to recent searches if not already present
      if (!recentSearches.includes(query)) {
        setRecentSearches(prev => [query, ...prev].slice(0, 5));
      }
    }, 800);
  };
  
  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // Clear search results
  const clearSearch = () => {
    setQuery('');
    setSearchResults([]);
    searchRef.current?.focus();
  };
  
  // Handle saving an item
  const handleSaveItem = (item) => {
    const isAlreadySaved = savedItems.some(saved => saved.id === item.id);
    
    if (!isAlreadySaved) {
      setSavedItems(prev => [...prev, item]);
    } else {
      setSavedItems(prev => prev.filter(saved => saved.id !== item.id));
    }
  };
  
  // Remove a recent search
  const removeRecentSearch = (search) => {
    setRecentSearches(prev => prev.filter(item => item !== search));
  };
  
  // Generate mock search results based on query
  const generateMockResults = (searchQuery) => {
    const lowerQuery = searchQuery.toLowerCase();
    const results = [];
    
    // ICH guidelines
    if (lowerQuery.includes('ich') || lowerQuery.includes('guideline') || lowerQuery.includes('clinical')) {
      results.push({
        id: 'ich-e3',
        title: 'ICH E3: Structure and Content of Clinical Study Reports',
        type: 'Guideline',
        source: 'ICH',
        link: 'https://database.ich.org/sites/default/files/E3_Guideline.pdf',
        description: 'Provides guidance on the structure and content of clinical study reports for submission to regulatory authorities.',
        relevance: 98
      });
      
      results.push({
        id: 'ich-m4e',
        title: 'ICH M4E(R2): Common Technical Document for the Registration of Pharmaceuticals for Human Use - Efficacy',
        type: 'Guideline',
        source: 'ICH',
        link: 'https://database.ich.org/sites/default/files/M4E_R2_Guideline.pdf',
        description: 'Provides guidance on the format and content of the efficacy section of the Common Technical Document.',
        relevance: 95
      });
    }
    
    // FDA guidelines
    if (lowerQuery.includes('fda') || lowerQuery.includes('module') || lowerQuery.includes('summary')) {
      results.push({
        id: 'fda-ctd',
        title: 'FDA Guidance: M4: The CTD — Efficacy',
        type: 'Guidance',
        source: 'FDA',
        link: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/m4e-ctd-efficacy',
        description: 'FDA guidance on the preparation and formatting of the efficacy section of the Common Technical Document.',
        relevance: 90
      });
      
      results.push({
        id: 'fda-csr',
        title: 'FDA Guidance: Integrated Summaries of Effectiveness and Safety',
        type: 'Guidance',
        source: 'FDA',
        link: 'https://www.fda.gov/media/130749/download',
        description: 'Guidance on preparing the integrated summary of effectiveness and integrated summary of safety for NDAs and BLAs.',
        relevance: 85
      });
    }
    
    // EMA guidelines
    if (lowerQuery.includes('ema') || lowerQuery.includes('eu') || lowerQuery.includes('european')) {
      results.push({
        id: 'ema-templates',
        title: 'EMA Clinical Trial Templates and Forms',
        type: 'Templates',
        source: 'EMA',
        link: 'https://www.ema.europa.eu/en/human-regulatory/research-development/clinical-trials-human-medicines',
        description: "Templates and forms for clinical trial protocol, investigator's brochure, and clinical study reports in the EU.",
        relevance: 80
      });
    }
    
    // eCTD guidelines
    if (lowerQuery.includes('ectd') || lowerQuery.includes('electronic') || lowerQuery.includes('submission')) {
      results.push({
        id: 'ectd-guidance',
        title: 'eCTD Guidance and Technical Specifications',
        type: 'Technical Specification',
        source: 'ICH',
        link: 'https://www.ich.org/page/ich-electronic-common-technical-document-ectd-v4',
        description: 'Technical specifications for the electronic Common Technical Document (eCTD) submission format.',
        relevance: 75
      });
    }
    
    // Add some general results if specific ones aren't found
    if (results.length < 2) {
      results.push({
        id: 'general-regulatory',
        title: 'Regulatory Writing Best Practices',
        type: 'Best Practice',
        source: 'Regulatory Affairs Professionals Society',
        link: 'https://www.raps.org/news-and-articles/news-articles/2020/3/regulatory-writing-best-practices',
        description: 'Best practices for writing regulatory documents, including clinical summaries and study reports.',
        relevance: 70
      });
      
      results.push({
        id: 'clinical-data-presentation',
        title: 'Guidance on Presenting Clinical Data in Submissions',
        type: 'Guidance',
        source: 'Multiple Regulatory Bodies',
        link: 'https://link.springer.com/article/10.1007/s43441-020-00119-1',
        description: 'Approaches to presenting clinical data effectively in regulatory submissions across different regions.',
        relevance: 65
      });
    }
    
    // Sort by relevance
    return results.sort((a, b) => b.relevance - a.relevance);
  };
  
  return (
    <Card className="shadow-sm">
      <CardContent className="p-3">
        <div className="space-y-3">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                ref={searchRef}
                placeholder="Search regulatory guidance..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pr-8"
              />
              {query && (
                <button 
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={!query.trim() || isSearching}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSearching ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Recent Searches */}
          {recentSearches.length > 0 && !searchResults.length && (
            <div className="space-y-2 pb-2">
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>Recent Searches</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recentSearches.map((search, index) => (
                  <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-xs">
                    <span 
                      className="cursor-pointer hover:text-blue-600"
                      onClick={() => {
                        setQuery(search);
                        handleSearch();
                      }}
                    >
                      {search}
                    </span>
                    <button
                      className="ml-1.5 text-gray-400 hover:text-gray-600"
                      onClick={() => removeRecentSearch(search)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <ScrollArea className="h-[240px] pr-3">
              <div className="space-y-3">
                {searchResults.map((result) => (
                  <div 
                    key={result.id} 
                    className="bg-white border border-gray-200 rounded-md p-2.5 shadow-sm hover:border-blue-200 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium text-gray-800">{result.title}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="px-1.5 py-0 text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                            {result.type}
                          </Badge>
                          <span className="text-xs text-gray-500">{result.source}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleSaveItem(result)}
                        >
                          <Bookmark 
                            className={`h-4 w-4 ${
                              savedItems.some(item => item.id === result.id)
                                ? 'fill-blue-600 text-blue-600' 
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                          />
                        </Button>
                        <a
                          href={result.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center h-7 w-7 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-600 mt-1.5">{result.description}</p>
                    
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-xs text-gray-500 flex items-center">
                        <ThumbsUp className="h-3 w-3 mr-1 text-blue-500" />
                        <span>Relevance: {result.relevance}%</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs px-2 text-blue-600"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        <span>Cite</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          
          {/* Saved Items */}
          {savedItems.length > 0 && !searchResults.length && (
            <div className="space-y-2">
              <div className="flex items-center text-xs text-gray-500">
                <Bookmark className="h-3.5 w-3.5 mr-1 fill-blue-500 text-blue-500" />
                <span>Saved Items</span>
              </div>
              <ScrollArea className="h-[200px] pr-3">
                <div className="space-y-2">
                  {savedItems.map((item) => (
                    <div key={item.id} className="bg-blue-50 border border-blue-100 rounded-md p-2 text-xs">
                      <div className="flex justify-between items-start">
                        <div className="font-medium text-blue-800">{item.title}</div>
                        <div className="flex items-center gap-1">
                          <button 
                            className="text-blue-400 hover:text-blue-600"
                            onClick={() => handleSaveItem(item)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="text-blue-600 mt-1 text-[10px]">{item.source} • {item.type}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
          
          {/* Empty state */}
          {!searchResults.length && !savedItems.length && recentSearches.length === 0 && (
            <div className="py-4 text-center">
              <div className="text-gray-400 mb-2">
                <Search className="h-8 w-8 mx-auto opacity-30" />
              </div>
              <p className="text-xs text-gray-500">
                Search regulatory guidance documents, ICH guidelines, and FDA/EMA requirements
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}