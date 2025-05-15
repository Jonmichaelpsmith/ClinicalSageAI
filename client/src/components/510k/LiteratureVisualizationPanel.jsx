import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { BarChart as BarChartIcon, Calendar, FileText, AlertTriangle, ThumbsUp, BookOpen, ArrowUpDown } from 'lucide-react';

/**
 * Literature Visualization Panel
 * 
 * This component visualizes academic literature data for 510(k) submissions,
 * providing insights into publication trends, relevance, and citation metrics.
 */
const LiteratureVisualizationPanel = ({ 
  literatureResults = [],
  selectedLiterature = [],
  deviceProfile = {},
  onLiteratureSelect
}) => {
  // State for analysis data
  const [yearDistribution, setYearDistribution] = useState({});
  const [journalDistribution, setJournalDistribution] = useState({});
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [impactFactorAvg, setImpactFactorAvg] = useState(0);
  const [relevanceScoreAvg, setRelevanceScoreAvg] = useState(0);
  const [sortOption, setSortOption] = useState('relevance');
  
  // Format data for visualization when literature results change
  useEffect(() => {
    if (literatureResults && literatureResults.length > 0) {
      analyzeData();
    }
  }, [literatureResults]);
  
  // Analyze the literature data to extract insights
  const analyzeData = () => {
    // Create year distribution
    const years = {};
    const journals = {};
    let impactSum = 0;
    let impactCount = 0;
    let relevanceSum = 0;
    
    literatureResults.forEach(item => {
      // Process publication year
      let year = 'Unknown';
      if (item.publicationDate) {
        const dateMatch = item.publicationDate.match(/\d{4}/);
        if (dateMatch) {
          year = dateMatch[0];
        }
      }
      years[year] = (years[year] || 0) + 1;
      
      // Process journal
      if (item.journal) {
        journals[item.journal] = (journals[item.journal] || 0) + 1;
      }
      
      // Track impact factors
      if (item.impactFactor) {
        impactSum += parseFloat(item.impactFactor);
        impactCount++;
      }
      
      // Track relevance scores
      if (item.relevanceScore) {
        relevanceSum += parseFloat(item.relevanceScore);
      }
    });
    
    setYearDistribution(years);
    setJournalDistribution(journals);
    setImpactFactorAvg(impactCount > 0 ? (impactSum / impactCount).toFixed(2) : 'N/A');
    setRelevanceScoreAvg((relevanceSum / literatureResults.length).toFixed(2));
    setAnalysisComplete(true);
  };
  
  // Sort literature results based on selected option
  const getSortedResults = () => {
    if (!literatureResults || literatureResults.length === 0) return [];
    
    const results = [...literatureResults];
    
    switch (sortOption) {
      case 'relevance':
        return results.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
      case 'year':
        return results.sort((a, b) => {
          const yearA = a.publicationDate ? parseInt(a.publicationDate.match(/\d{4}/)?.[0] || 0) : 0;
          const yearB = b.publicationDate ? parseInt(b.publicationDate.match(/\d{4}/)?.[0] || 0) : 0;
          return yearB - yearA;
        });
      case 'citations':
        return results.sort((a, b) => (b.citationCount || 0) - (a.citationCount || 0));
      case 'impact':
        return results.sort((a, b) => (b.impactFactor || 0) - (a.impactFactor || 0));
      default:
        return results;
    }
  };
  
  // Render the publication year trend visualization
  const renderYearTrendChart = () => {
    if (!analysisComplete || Object.keys(yearDistribution).length < 2) {
      return (
        <div className="text-center py-8 text-gray-500">
          <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
          <p>Not enough publication year data for trend visualization</p>
        </div>
      );
    }
    
    // Get years and sort them
    const years = Object.keys(yearDistribution)
      .filter(year => year !== 'Unknown')
      .sort((a, b) => parseInt(a) - parseInt(b));
    
    // Get the max count to scale the bars properly
    const maxCount = Math.max(...Object.values(yearDistribution));
    
    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Publication Trend Over Time</h4>
        <div className="grid grid-cols-1 gap-1">
          {years.map(year => {
            const count = yearDistribution[year];
            const percentage = (count / maxCount) * 100;
            
            return (
              <div key={year} className="flex items-center">
                <span className="text-xs w-10">{year}</span>
                <div className="flex-1 h-5 bg-gray-100 rounded-sm overflow-hidden">
                  <div 
                    className="h-full bg-blue-400 rounded-sm"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-xs w-8 ml-2 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Render the journal distribution section
  const renderJournalDistribution = () => {
    const sortedJournals = Object.entries(journalDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    if (sortedJournals.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500">
          <p>No journal data available</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Top Journals</h4>
        {sortedJournals.map(([journal, count]) => (
          <div key={journal} className="flex justify-between items-center">
            <span className="text-sm truncate max-w-[70%]">{journal}</span>
            <Badge variant="outline">{count} article{count !== 1 ? 's' : ''}</Badge>
          </div>
        ))}
      </div>
    );
  };
  
  // Render the key metrics section
  const renderKeyMetrics = () => {
    return (
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="p-3 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium mb-1">Publications</h4>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-blue-600">{literatureResults.length}</span>
            <span className="text-xs ml-1 text-gray-500">articles</span>
          </div>
        </div>
        
        <div className="p-3 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium mb-1">Avg. Relevance</h4>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-blue-600">
              {relevanceScoreAvg > 0 ? `${Math.round(relevanceScoreAvg * 100)}%` : 'N/A'}
            </span>
            <span className="text-xs ml-1 text-gray-500">match</span>
          </div>
        </div>
        
        <div className="p-3 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium mb-1">Selected</h4>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-blue-600">{selectedLiterature.length}</span>
            <span className="text-xs ml-1 text-gray-500">of {literatureResults.length}</span>
          </div>
        </div>
        
        <div className="p-3 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium mb-1">Avg. Impact Factor</h4>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-blue-600">{impactFactorAvg}</span>
            <span className="text-xs ml-1 text-gray-500">IF</span>
          </div>
        </div>
      </div>
    );
  };
  
  // Toggle a literature item selection
  const toggleLiteratureSelection = (id) => {
    if (onLiteratureSelect) {
      const item = literatureResults.find(lit => lit.id === id);
      if (item) {
        onLiteratureSelect(item);
      }
    }
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-blue-50 border-b">
        <CardTitle className="text-blue-800 flex items-center">
          <BookOpen className="mr-2 h-5 w-5 text-blue-600" />
          Literature Insights
        </CardTitle>
        <CardDescription>
          Publication trends and metrics for {deviceProfile?.deviceName || 'your medical device'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Publication Analysis</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={analyzeData}
                disabled={!literatureResults || literatureResults.length === 0}
              >
                Refresh Analysis
              </Button>
            </div>
            
            {renderKeyMetrics()}
            <div className="mt-4">{renderJournalDistribution()}</div>
            <div className="mt-4 h-[200px]">{renderYearTrendChart()}</div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Literature Results</h3>
              <div className="flex items-center space-x-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSortOption('relevance')}
                  className={sortOption === 'relevance' ? 'bg-blue-100' : ''}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Relevance
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSortOption('year')}
                  className={sortOption === 'year' ? 'bg-blue-100' : ''}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Date
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSortOption('citations')}
                  className={sortOption === 'citations' ? 'bg-blue-100' : ''}
                >
                  <BarChartIcon className="h-4 w-4 mr-1" />
                  Citations
                </Button>
              </div>
            </div>
            
            {literatureResults && literatureResults.length > 0 ? (
              <ScrollArea className="h-[400px] border rounded-md p-2">
                <div className="space-y-2">
                  {getSortedResults().map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 border rounded-md hover:bg-blue-50 transition-colors cursor-pointer ${
                        selectedLiterature.some(lit => lit.id === item.id) ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => toggleLiteratureSelection(item.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <h4 className="font-medium text-gray-900 flex items-center">
                            {item.title}
                            {selectedLiterature.some(lit => lit.id === item.id) && (
                              <Badge className="ml-2 bg-blue-600 text-white">Selected</Badge>
                            )}
                          </h4>
                          
                          <p className="text-sm text-gray-600">
                            {item.authors && item.authors.length > 0 ? (
                              <>
                                {item.authors.slice(0, 3).join(', ')}
                                {item.authors.length > 3 && ' et al.'}
                              </>
                            ) : 'Unknown authors'}
                          </p>
                          
                          <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                            {item.publicationDate && (
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {item.publicationDate.split(' ')[0]}
                              </span>
                            )}
                            
                            {item.journal && (
                              <span className="flex items-center">
                                <FileText className="h-3 w-3 mr-1" />
                                {item.journal}
                              </span>
                            )}
                            
                            {item.citationCount !== undefined && (
                              <span className="flex items-center">
                                <BarChartIcon className="h-3 w-3 mr-1" />
                                {item.citationCount} citations
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {item.relevanceScore !== undefined && (
                          <div className="ml-2 flex flex-col items-center">
                            <div className={`rounded-full h-8 w-8 flex items-center justify-center text-xs font-medium ${
                              item.relevanceScore >= 0.8 ? 'bg-green-100 text-green-700' :
                              item.relevanceScore >= 0.6 ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {Math.round(item.relevanceScore * 100)}%
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center p-8 border rounded-md bg-gray-50">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No Literature Found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Search for literature using the search panel to analyze publication data.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiteratureVisualizationPanel;