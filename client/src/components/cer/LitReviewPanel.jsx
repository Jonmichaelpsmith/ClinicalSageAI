import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import axios from 'axios';

export default function LitReviewPanel() {
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [selectedArticles, setSelectedArticles] = useState([]);

  useEffect(() => {
    const fetchRecommended = async () => {
      setLoading(true);
      try {
        // This would be a real API call in production
        // const res = await axios.get('/api/cer/literature/recommended');
        // setArticles(res.data.articles);
        
        // Mock data for demo
        await new Promise(resolve => setTimeout(resolve, 800));
        setArticles([
          {
            id: 'PMC7865214',
            title: 'Clinical evaluation of medical devices: Principles and standard processes',
            authors: 'Smith, J.R., Johnson, A.B.',
            journal: 'Journal of Medical Device Regulation',
            year: 2025,
            relevance: 0.92,
            selected: false
          },
          {
            id: 'PMC6752138',
            title: 'European Union Medical Device Regulation: Impact on CE approval processes',
            authors: 'Chen, M., Williams, P., Garcia, S.',
            journal: 'Regulatory Affairs Professional Journal',
            year: 2024,
            relevance: 0.87,
            selected: false
          },
          {
            id: 'PMC6654379',
            title: 'Methods for post-market surveillance in medical device safety evaluation',
            authors: 'Thompson, K.L., et al.',
            journal: 'International Journal of Clinical Safety',
            year: 2023,
            relevance: 0.81,
            selected: false
          },
          {
            id: 'PMC5589214',
            title: 'Risk Assessment Methodologies for Clinical Evaluation Reports in Conformity Assessment',
            authors: 'Garcia, R., Zhang, W., Patel, S.',
            journal: 'Journal of Medical Engineering',
            year: 2024,
            relevance: 0.76,
            selected: false
          }
        ]);
      } catch (err) {
        console.error('Failed to load recommended literature', err);
        setError('Failed to load recommended literature');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommended();
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setSearching(true);
    try {
      // This would be a real API call in production
      // const res = await axios.get('/api/cer/literature/search', { params: { query: searchTerm } });
      // setArticles(res.data.articles);
      
      // Mock search results for demo
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Tailored results based on search term
      if (searchTerm.toLowerCase().includes('enzymex') || searchTerm.toLowerCase().includes('enzyme')) {
        setArticles([
          {
            id: 'PMC8276539',
            title: 'Enzymex Forte: Clinical outcomes and safety profile in enzymatic treatments',
            authors: 'Rodriguez, A., Smith, J.R.',
            journal: 'Journal of Enzymatic Therapeutics',
            year: 2024,
            relevance: 0.95,
            selected: false
          },
          {
            id: 'PMC7659832',
            title: 'Comparative analysis of enzymatic devices in clinical settings: A 5-year review',
            authors: 'Johnson, K.P., et al.',
            journal: 'International Journal of Medical Enzymology',
            year: 2023,
            relevance: 0.89,
            selected: false
          },
          {
            id: 'PMC6543782',
            title: 'Regulatory considerations for enzymatic medical devices under MDR 2017/745',
            authors: 'Williams, T.N., Chen, M.',
            journal: 'European Journal of Regulatory Affairs',
            year: 2022,
            relevance: 0.87,
            selected: false
          }
        ]);
      } else if (searchTerm.toLowerCase().includes('mdr') || searchTerm.toLowerCase().includes('regulation')) {
        setArticles([
          {
            id: 'PMC9123462',
            title: 'Impact of MDR 2017/745 on clinical evaluation report methodology',
            authors: 'Garcia, S., Thompson, R.',
            journal: 'Regulatory Affairs Professional Journal',
            year: 2025,
            relevance: 0.94,
            selected: false
          },
          {
            id: 'PMC8462157',
            title: 'Evolution of European regulatory standards for medical device clinical evaluation',
            authors: 'Schmidt, M., et al.',
            journal: 'Journal of Medical Device Regulation',
            year: 2024,
            relevance: 0.91,
            selected: false
          }
        ]);
      } else {
        // Generic results for other searches
        setArticles([
          {
            id: 'PMC7865214',
            title: `Clinical evaluation related to "${searchTerm}": A systematic review`,
            authors: 'Smith, J.R., Johnson, A.B.',
            journal: 'Journal of Medical Device Regulation',
            year: 2025,
            relevance: 0.82,
            selected: false
          },
          {
            id: 'PMC6752138',
            title: `${searchTerm} in medical device assessment: Current approaches`,
            authors: 'Chen, M., Williams, P.',
            journal: 'Journal of Clinical Engineering',
            year: 2024,
            relevance: 0.78,
            selected: false
          }
        ]);
      }
    } catch (err) {
      console.error('Literature search failed', err);
      setError('Literature search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const toggleSelect = (id) => {
    const updatedArticles = articles.map(article => 
      article.id === id ? { ...article, selected: !article.selected } : article
    );
    setArticles(updatedArticles);
    
    // Update selected articles list
    const selected = updatedArticles.filter(a => a.selected).map(a => a.id);
    setSelectedArticles(selected);
  };
  
  const addToReport = async () => {
    if (selectedArticles.length === 0) {
      alert('Please select at least one article to add to the report');
      return;
    }
    
    setLoading(true);
    try {
      // This would be a real API call in production
      // await axios.post('/api/cer/literature/add', { articles: selectedArticles });
      
      // Mock success for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Added articles to report:', selectedArticles);
      alert(`Successfully added ${selectedArticles.length} article(s) to the report`);
      
      // Clear selections
      setArticles(articles.map(a => ({ ...a, selected: false })));
      setSelectedArticles([]);
    } catch (err) {
      console.error('Failed to add literature to report', err);
      setError('Failed to add literature to report');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center p-12">
      <div className="w-full max-w-md">
        <p className="text-center mb-4">Loading literature data...</p>
        <Progress value={75} className="w-full" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-4">Literature Search</h3>
              <div className="flex space-x-2">
                <Input
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search for relevant literature..."
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={searching || !searchTerm.trim()}>
                  {searching ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={addToReport} 
                disabled={selectedArticles.length === 0}
                className="w-full sm:w-auto"
              >
                Add Selected to Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-800">
              <h3 className="font-semibold mb-2">Error</h3>
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">
            {searchTerm ? 'Search Results' : 'Recommended Literature'}
          </h3>
          
          {articles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No articles found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Authors</TableHead>
                  <TableHead>Journal</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Relevance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map(article => (
                  <TableRow key={article.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={article.selected}
                        onChange={() => toggleSelect(article.id)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{article.title}</div>
                      <div className="text-xs text-gray-500">{article.id}</div>
                    </TableCell>
                    <TableCell>{article.authors}</TableCell>
                    <TableCell>{article.journal}</TableCell>
                    <TableCell>{article.year}</TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          article.relevance > 0.9 ? "bg-green-100 text-green-800" : 
                          article.relevance > 0.8 ? "bg-blue-100 text-blue-800" : 
                          article.relevance > 0.7 ? "bg-yellow-100 text-yellow-800" : 
                          "bg-gray-100 text-gray-800"
                        }
                      >
                        {(article.relevance * 100).toFixed(0)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}