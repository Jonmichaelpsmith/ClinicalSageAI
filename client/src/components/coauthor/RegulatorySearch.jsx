import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, BookOpen, ExternalLink, Plus } from 'lucide-react';

export default function RegulatorySearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([
    {
      id: 'ich-e3-2.7.3',
      title: 'ICH E3 Guideline',
      section: '2.7.3',
      excerpt: 'Summary of Clinical Efficacy should include a detailed analysis of clinical efficacy data...',
      url: '#ich-e3'
    },
    {
      id: 'fda-2023-clinical',
      title: 'FDA Guidance (2023)',
      section: 'Clinical Summary',
      excerpt: 'Sponsors should provide comprehensive analysis of all clinical studies...',
      url: '#fda-guidance'
    },
    {
      id: 'eu-mdr-2017-745',
      title: 'EU MDR 2017/745',
      section: 'Article 61',
      excerpt: 'Clinical evaluation requirements for medical devices...',
      url: '#eu-mdr'
    }
  ]);
  
  const handleSearch = () => {
    // In a real implementation, this would call the API endpoint:
    // fetch('/api/regulatory/search?q=' + encodeURIComponent(query))
    console.log('Searching for:', query);
    // For now we're using mock data already in state
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-md flex items-center">
          <BookOpen className="h-4 w-4 mr-2 text-blue-600" />
          Regulatory Search
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex space-x-2 mb-4">
          <Input 
            placeholder="Search regulatory guidance..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} size="sm">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {results.map(result => (
            <div key={result.id} className="p-3 border rounded-md hover:bg-gray-50">
              <div className="flex justify-between">
                <h4 className="font-medium text-sm">{result.title}</h4>
                <span className="text-xs text-blue-600">{result.section}</span>
              </div>
              <p className="text-xs text-gray-600 my-1 line-clamp-2">{result.excerpt}</p>
              <div className="flex justify-between items-center mt-2">
                <a 
                  href={result.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center"
                >
                  View source <ExternalLink className="h-3 w-3 ml-1" />
                </a>
                <Button variant="ghost" size="xs" className="h-6 text-xs">
                  <Plus className="h-3 w-3 mr-1" /> Insert
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}