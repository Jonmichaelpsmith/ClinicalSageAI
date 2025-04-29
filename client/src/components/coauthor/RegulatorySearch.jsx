import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, BookOpen, FileText, ChevronRight, Lightbulb, ExternalLink, Bookmark } from 'lucide-react';

export default function RegulatorySearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Mock regulatory search results for demo purposes
  const mockResults = [
    {
      id: 'ich-e3-12.3',
      type: 'guideline',
      title: 'ICH E3 Guideline',
      section: '12.3 - Clinical Study Reports',
      excerpt: 'The Clinical Summary should provide a detailed tabulation of efficacy findings from all controlled clinical studies...',
      source: 'ICH',
      url: 'https://database.ich.org/sites/default/files/E3_Guideline.pdf',
      relevance: 98
    },
    {
      id: 'fda-clinical-2023',
      type: 'guideline',
      title: 'FDA Clinical Data Requirements',
      section: 'Section 3.2 - Efficacy Data Presentation',
      excerpt: 'For Type 2 diabetes submissions, primary endpoints should include HbA1c reduction from baseline with appropriate statistical analysis...',
      source: 'FDA',
      url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents',
      relevance: 92
    },
    {
      id: 'ema-2022-rev1',
      type: 'guideline',
      title: 'EMA Clinical Documentation',
      section: 'Annex I - Statistical Considerations',
      excerpt: 'Forest plots should be used to present subgroup analyses with appropriate interaction tests to detect heterogeneity of treatment effects...',
      source: 'EMA',
      url: 'https://www.ema.europa.eu/en/documents/scientific-guideline/',
      relevance: 85
    },
    {
      id: 'pmda-format-2021',
      type: 'requirement',
      title: 'PMDA Submission Format',
      section: 'Module 2.7.3 - Summary of Clinical Efficacy',
      excerpt: 'The Summary should include tabular presentations of demographics, baseline characteristics, and results of all primary and secondary analyses...',
      source: 'PMDA',
      url: '#',
      relevance: 80
    }
  ];

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    
    // Simulate API call to /api/regulatory/search?q=searchQuery
    setTimeout(() => {
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-md flex items-center">
          <BookOpen className="h-4 w-4 mr-2 text-blue-600" />
          Regulatory Search
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search guidance for clinical summary..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button 
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSearching ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Suggested searches */}
        {!hasSearched && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">Suggested searches:</p>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs"
                onClick={() => {
                  setSearchQuery('ICH E3 clinical summary format');
                  setTimeout(handleSearch, 100);
                }}
              >
                <Lightbulb className="h-3 w-3 mr-1 text-amber-500" />
                ICH E3 clinical summary
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs"
                onClick={() => {
                  setSearchQuery('FDA type 2 diabetes efficacy endpoints');
                  setTimeout(handleSearch, 100);
                }}
              >
                <Lightbulb className="h-3 w-3 mr-1 text-amber-500" />
                FDA diabetes endpoints
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs"
                onClick={() => {
                  setSearchQuery('EMA statistical requirements');
                  setTimeout(handleSearch, 100);
                }}
              >
                <Lightbulb className="h-3 w-3 mr-1 text-amber-500" />
                EMA statistics
              </Button>
            </div>
          </div>
        )}
        
        {/* Search results */}
        {hasSearched && searchResults.length > 0 && (
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {searchResults.map(result => (
              <div 
                key={result.id}
                className="p-3 border rounded-md hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
              >
                <div className="flex justify-between">
                  <div className="flex items-start">
                    <div className="mt-0.5">
                      {result.type === 'guideline' ? (
                        <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                      ) : (
                        <FileText className="h-3.5 w-3.5 text-indigo-600" />
                      )}
                    </div>
                    <div className="ml-2">
                      <h5 className="text-sm font-medium">{result.title}</h5>
                      <p className="text-xs text-gray-500">{result.section}</p>
                    </div>
                  </div>
                  <div className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                    {result.source}
                  </div>
                </div>
                
                <p className="text-xs text-gray-700 mt-2 line-clamp-2">
                  {result.excerpt}
                </p>
                
                <div className="flex justify-between items-center mt-2">
                  {result.url !== '#' ? (
                    <a 
                      href={result.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center"
                    >
                      View guideline <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400">No external link</span>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      title="Bookmark this reference"
                    >
                      <Bookmark className="h-3.5 w-3.5 text-gray-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      title="Insert into document"
                    >
                      <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* No results */}
        {hasSearched && !isSearching && searchResults.length === 0 && (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <FileText className="h-8 w-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No regulatory guidance found</p>
            <p className="text-xs text-gray-400 mt-1">Try different search terms</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}