/**
 * Enhanced Literature Search Component
 * 
 * This component provides advanced literature search capabilities for 510(k) submissions,
 * including semantic search, multi-source querying, and AI-powered summaries.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import {
  Search,
  BookOpen,
  FileText,
  ListFilter,
  Calendar,
  Database,
  Link,
  ArrowUpRight,
  Bookmark,
  BookmarkPlus,
  Check,
  X,
  Download,
  RefreshCw,
  Sparkles,
  Brain,
  FileDigit,
  Copy,
  Clock,
  AlignJustify
} from 'lucide-react';

const EnhancedLiteratureSearch = ({ documentId, documentType = '510k', onCiteReference, compact = false }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for search parameters
  const [searchParams, setSearchParams] = useState({
    query: '',
    sources: [],
    startDate: null,
    endDate: null,
    useSemanticSearch: true,
    filters: {}
  });
  
  // State for search execution
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [executionTime, setExecutionTime] = useState(0);
  const [sourcesQueried, setSourcesQueried] = useState([]);
  
  // State for summary generation
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [summaryType, setSummaryType] = useState('standard');
  const [summaryFocus, setSummaryFocus] = useState('');
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  
  // State for UI
  const [activeTab, setActiveTab] = useState('search');
  const [viewMode, setViewMode] = useState('list');
  
  // Fetch available literature sources
  const { data: sources = [], isLoading: isLoadingSources } = useQuery({
    queryKey: ['/api/510k/literature/sources'],
    refetchOnWindowFocus: false
  });
  
  // Fetch recent literature entries
  const { data: recentLiterature = [], isLoading: isLoadingRecent } = useQuery({
    queryKey: ['/api/510k/literature/recent'],
    queryFn: async () => {
      const response = await apiRequest('/api/510k/literature/recent?limit=10');
      return response.entries || [];
    },
    refetchOnWindowFocus: false
  });
  
  // Fetch recent summaries
  const { data: recentSummaries = [], isLoading: isLoadingSummaries } = useQuery({
    queryKey: ['/api/510k/literature/summaries'],
    queryFn: async () => {
      const response = await apiRequest('/api/510k/literature/summaries?limit=5');
      return response.summaries || [];
    },
    refetchOnWindowFocus: false
  });
  
  // Mutation for performing a literature search
  const searchMutation = useMutation({
    mutationFn: async (params) => {
      setIsSearching(true);
      try {
        const response = await apiRequest('/api/510k/literature/search', 'POST', params);
        return response;
      } finally {
        setIsSearching(false);
      }
    },
    onSuccess: (data) => {
      setSearchResults(data.results || []);
      setTotalResults(data.total || 0);
      setExecutionTime(data.execution_time_ms || 0);
      setSourcesQueried(data.sources_queried || []);
      toast({
        title: 'Search completed',
        description: `Found ${data.total} results in ${(data.execution_time_ms / 1000).toFixed(2)} seconds`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Search failed',
        description: error.message || 'Failed to search literature',
        variant: 'destructive',
      });
    }
  });
  
  // Mutation for generating a summary
  const summarizeMutation = useMutation({
    mutationFn: async (params) => {
      setIsSummarizing(true);
      try {
        const response = await apiRequest('/api/510k/literature/summarize', 'POST', params);
        return response;
      } finally {
        setIsSummarizing(false);
      }
    },
    onSuccess: (data) => {
      setGeneratedSummary(data.summary || '');
      toast({
        title: 'Summary generated',
        description: `Summary generated in ${(data.processing_time_ms / 1000).toFixed(2)} seconds`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Summary generation failed',
        description: error.message || 'Failed to generate summary',
        variant: 'destructive',
      });
    }
  });
  
  // Mutation for citing a reference
  const citeMutation = useMutation({
    mutationFn: async (params) => {
      const response = await apiRequest('/api/510k/literature/cite', 'POST', params);
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: 'Reference cited',
        description: 'Reference has been added to your document',
      });
      if (onCiteReference) {
        onCiteReference(data.citation_id);
      }
      // Invalidate citations query
      queryClient.invalidateQueries({ queryKey: [`/api/510k/literature/citations/${documentId}`] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to cite reference',
        description: error.message || 'An error occurred while citing the reference',
        variant: 'destructive',
      });
    }
  });
  
  // Handle search execution
  const handleSearch = useCallback(() => {
    if (!searchParams.query) {
      toast({
        title: 'Search query required',
        description: 'Please enter a search term',
        variant: 'destructive',
      });
      return;
    }
    
    searchMutation.mutate(searchParams);
  }, [searchParams, searchMutation, toast]);
  
  // Handle source selection
  const handleSourceToggle = useCallback((sourceId) => {
    setSearchParams(prev => {
      const sources = [...prev.sources];
      const index = sources.indexOf(sourceId);
      
      if (index !== -1) {
        sources.splice(index, 1);
      } else {
        sources.push(sourceId);
      }
      
      return { ...prev, sources };
    });
  }, []);
  
  // Handle selection of entries for summary
  const handleEntrySelection = useCallback((entryId) => {
    setSelectedEntries(prev => {
      const entries = [...prev];
      const index = entries.indexOf(entryId);
      
      if (index !== -1) {
        entries.splice(index, 1);
      } else {
        entries.push(entryId);
      }
      
      return entries;
    });
  }, []);
  
  // Handle summary generation
  const handleGenerateSummary = useCallback(() => {
    if (selectedEntries.length === 0) {
      toast({
        title: 'No entries selected',
        description: 'Please select at least one entry to summarize',
        variant: 'destructive',
      });
      return;
    }
    
    summarizeMutation.mutate({
      literatureIds: selectedEntries,
      summaryType,
      focus: summaryFocus || undefined
    });
  }, [selectedEntries, summaryType, summaryFocus, summarizeMutation, toast]);
  
  // Handle citation of a reference
  const handleCiteReference = useCallback((entryId, sectionId = 'main', sectionName = 'Main Text') => {
    if (!documentId) {
      toast({
        title: 'Document ID required',
        description: 'Cannot cite reference without a document ID',
        variant: 'destructive',
      });
      return;
    }
    
    citeMutation.mutate({
      literatureId: entryId,
      documentId,
      documentType,
      sectionId,
      sectionName,
      citationText: ''
    });
  }, [documentId, documentType, citeMutation, toast]);
  
  // Handle copying summary to clipboard
  const handleCopySummary = useCallback(() => {
    navigator.clipboard.writeText(generatedSummary).then(() => {
      toast({
        title: 'Summary copied',
        description: 'The summary has been copied to your clipboard',
      });
    }).catch(err => {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy the summary to clipboard',
        variant: 'destructive',
      });
    });
  }, [generatedSummary, toast]);

  // Render compact view
  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Enhanced Literature Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex mb-4">
            <Input
              placeholder="Search for medical device literature..."
              value={searchParams.query}
              onChange={(e) => setSearchParams({ ...searchParams, query: e.target.value })}
              className="mr-2 flex-1"
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
              Search
            </Button>
          </div>
          
          <div className="flex items-center mb-4 text-sm">
            <Switch
              checked={searchParams.useSemanticSearch}
              onCheckedChange={(checked) => setSearchParams({ ...searchParams, useSemanticSearch: checked })}
              id="semantic-search-compact"
            />
            <Label htmlFor="semantic-search-compact" className="ml-2">
              Semantic Search
            </Label>
            
            <Separator orientation="vertical" className="mx-2 h-4" />
            
            <Label className="mr-2">Sources:</Label>
            <div className="flex space-x-2">
              {!isLoadingSources && sources.slice(0, 3).map((source) => (
                <Badge 
                  key={source.id} 
                  variant={searchParams.sources.includes(source.source_name) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleSourceToggle(source.source_name)}
                >
                  {source.source_name}
                </Badge>
              ))}
            </div>
          </div>
          
          {searchResults.length > 0 ? (
            <ScrollArea className="h-60 rounded-md border p-2">
              {searchResults.slice(0, 5).map((entry) => (
                <div key={entry.id} className="mb-3 p-2 rounded hover:bg-accent">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm">{entry.title}</h4>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleCiteReference(entry.id)}
                    >
                      <BookmarkPlus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {entry.source_name} • {entry.publication_date ? new Date(entry.publication_date).toLocaleDateString() : 'Unknown date'}
                  </div>
                </div>
              ))}
              {searchResults.length > 5 && (
                <div className="text-center text-sm text-muted-foreground py-2">
                  + {searchResults.length - 5} more results
                </div>
              )}
            </ScrollArea>
          ) : (
            <div className="h-60 flex flex-col items-center justify-center text-center rounded-md border p-4">
              <BookOpen className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {isSearching 
                  ? 'Searching literature sources...' 
                  : 'Search for medical literature to cite in your 510(k) submission'}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          <div className="text-xs text-muted-foreground">
            {totalResults > 0 && `${totalResults} results in ${(executionTime / 1000).toFixed(2)}s`}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsSummaryDialogOpen(true)}
            disabled={selectedEntries.length === 0}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Summarize
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Render full view
  return (
    <div className="literature-search-container">
      <Tabs defaultValue="search" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Enhanced Literature Discovery</h2>
          <TabsList>
            <TabsTrigger value="search" className="flex items-center">
              <Search className="h-4 w-4 mr-2" />
              Search
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Recent
            </TabsTrigger>
            <TabsTrigger value="summaries" className="flex items-center">
              <Brain className="h-4 w-4 mr-2" />
              Summaries
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Literature Search</CardTitle>
              <CardDescription>
                Search across multiple literature sources to find relevant information for your 510(k) submission.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="search-controls space-y-4">
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Search for medical device literature, clinical studies, predicate devices..."
                      value={searchParams.query}
                      onChange={(e) => setSearchParams({ ...searchParams, query: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  <Button onClick={handleSearch} disabled={isSearching}>
                    {isSearching ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                    Search
                  </Button>
                </div>
                
                <div className="search-options">
                  <Accordion type="single" collapsible defaultValue="sources">
                    <AccordionItem value="sources">
                      <AccordionTrigger>
                        <span className="flex items-center">
                          <Database className="h-4 w-4 mr-2" />
                          Literature Sources
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="source-selector grid grid-cols-2 md:grid-cols-3 gap-2 pt-2">
                          {isLoadingSources ? (
                            <>
                              <Skeleton className="h-8 w-full" />
                              <Skeleton className="h-8 w-full" />
                              <Skeleton className="h-8 w-full" />
                            </>
                          ) : (
                            sources.map((source) => (
                              <div key={source.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`source-${source.id}`}
                                  checked={searchParams.sources.includes(source.source_name)}
                                  onCheckedChange={() => handleSourceToggle(source.source_name)}
                                />
                                <Label
                                  htmlFor={`source-${source.id}`}
                                  className="cursor-pointer"
                                >
                                  {source.source_name}
                                </Label>
                              </div>
                            ))
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="filters">
                      <AccordionTrigger>
                        <span className="flex items-center">
                          <ListFilter className="h-4 w-4 mr-2" />
                          Advanced Filters
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="advanced-filters grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          <div className="date-range">
                            <Label className="mb-1 block">Publication Date Range</Label>
                            <div className="flex space-x-2">
                              <div className="flex-1">
                                <DatePicker
                                  placeholder="Start date"
                                  value={searchParams.startDate}
                                  onChange={(date) => setSearchParams({ ...searchParams, startDate: date })}
                                />
                              </div>
                              <div className="flex-1">
                                <DatePicker
                                  placeholder="End date"
                                  value={searchParams.endDate}
                                  onChange={(date) => setSearchParams({ ...searchParams, endDate: date })}
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="semantic-search">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="semantic-search"
                                checked={searchParams.useSemanticSearch}
                                onCheckedChange={(checked) => setSearchParams({ ...searchParams, useSemanticSearch: checked })}
                              />
                              <Label htmlFor="semantic-search">Enable Semantic Search</Label>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {searchParams.useSemanticSearch
                                ? "Using AI to find conceptually related results even if they don't match keywords exactly"
                                : "Using exact keyword matching only"}
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
              
              <div className="search-results mt-6">
                {isSearching ? (
                  <div className="searching-indicator flex flex-col items-center justify-center p-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p className="text-lg">Searching literature sources...</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Querying {sourcesQueried.length > 0 ? sourcesQueried.join(', ') : 'multiple sources'}
                    </p>
                  </div>
                ) : (
                  <div className="results">
                    {searchResults.length > 0 ? (
                      <>
                        <div className="results-header flex justify-between items-center mb-4">
                          <div className="results-count">
                            <h3 className="text-lg font-semibold">
                              {totalResults} Results
                              <span className="text-sm font-normal text-muted-foreground ml-2">
                                ({(executionTime / 1000).toFixed(2)} seconds)
                              </span>
                            </h3>
                          </div>
                          <div className="view-controls flex items-center space-x-2">
                            <Button
                              variant={viewMode === 'list' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setViewMode('list')}
                            >
                              <AlignJustify className="h-4 w-4" />
                            </Button>
                            <Button
                              variant={viewMode === 'grid' ? 'default' : 'outline'}
                              size="sm" 
                              onClick={() => setViewMode('grid')}
                            >
                              <FileDigit className="h-4 w-4" />
                            </Button>
                            <Button 
                              onClick={() => setIsSummaryDialogOpen(true)}
                              disabled={selectedEntries.length === 0}
                              size="sm"
                            >
                              <Sparkles className="h-4 w-4 mr-2" />
                              Summarize Selected ({selectedEntries.length})
                            </Button>
                          </div>
                        </div>
                        
                        <div className={`results-list ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}`}>
                          {searchResults.map((entry) => (
                            <Card key={entry.id} className="result-card">
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <Badge variant="outline" className="mb-2">
                                      {entry.source_name}
                                    </Badge>
                                    <CardTitle className="text-lg">{entry.title}</CardTitle>
                                  </div>
                                  <Checkbox
                                    checked={selectedEntries.includes(entry.id)}
                                    onCheckedChange={() => handleEntrySelection(entry.id)}
                                    className="mt-1"
                                  />
                                </div>
                              </CardHeader>
                              <CardContent className="pb-3">
                                {entry.authors && entry.authors.length > 0 && (
                                  <p className="text-sm mb-2">
                                    <span className="font-medium">Authors:</span> {entry.authors.join(', ')}
                                  </p>
                                )}
                                
                                {entry.publication_date && (
                                  <p className="text-sm mb-2">
                                    <span className="font-medium">Published:</span> {new Date(entry.publication_date).toLocaleDateString()}
                                  </p>
                                )}
                                
                                {entry.journal && (
                                  <p className="text-sm mb-2">
                                    <span className="font-medium">Journal:</span> {entry.journal}
                                  </p>
                                )}
                                
                                {entry.abstract && (
                                  <div className="abstract mt-3">
                                    <p className="text-sm line-clamp-3">{entry.abstract}</p>
                                  </div>
                                )}
                                
                                {entry.relevance_score !== undefined && (
                                  <div className="relevance mt-2">
                                    <p className="text-xs text-muted-foreground">
                                      Relevance Score: {Math.round(entry.relevance_score * 100)}%
                                    </p>
                                  </div>
                                )}
                              </CardContent>
                              <CardFooter className="pt-0 flex justify-between">
                                <div className="links flex gap-2">
                                  {entry.url && (
                                    <Button variant="outline" size="sm" asChild>
                                      <a href={entry.url} target="_blank" rel="noopener noreferrer">
                                        <ArrowUpRight className="h-4 w-4 mr-1" />
                                        View Source
                                      </a>
                                    </Button>
                                  )}
                                  {entry.doi && (
                                    <Button variant="outline" size="sm" asChild>
                                      <a href={`https://doi.org/${entry.doi}`} target="_blank" rel="noopener noreferrer">
                                        <Link className="h-4 w-4 mr-1" />
                                        DOI
                                      </a>
                                    </Button>
                                  )}
                                </div>
                                <Button 
                                  onClick={() => handleCiteReference(entry.id)}
                                  disabled={!documentId}
                                >
                                  <BookmarkPlus className="h-4 w-4 mr-2" />
                                  Cite
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="no-results flex flex-col items-center justify-center p-12 text-center">
                        <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Literature Found</h3>
                        <p className="text-muted-foreground mb-4">
                          {searchParams.query
                            ? `No results found for "${searchParams.query}". Try broadening your search or adjusting filters.`
                            : 'Enter a search query to find relevant literature for your 510(k) submission.'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recently Accessed Literature</CardTitle>
              <CardDescription>
                Quick access to recently viewed or cited literature entries.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingRecent ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : recentLiterature.length > 0 ? (
                <div className="space-y-4">
                  {recentLiterature.map((entry) => (
                    <Card key={entry.id} className="recent-entry">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{entry.title}</CardTitle>
                        <CardDescription>
                          {entry.source_name} • {entry.publication_date ? new Date(entry.publication_date).toLocaleDateString() : 'Unknown date'}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="pt-0 flex justify-between">
                        <div className="text-xs text-muted-foreground">
                          Added {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => handleCiteReference(entry.id)}
                          disabled={!documentId}
                        >
                          <BookmarkPlus className="h-4 w-4 mr-2" />
                          Cite
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="no-recent flex flex-col items-center justify-center p-12 text-center">
                  <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Recent Literature</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't viewed or cited any literature entries recently.
                  </p>
                  <Button onClick={() => setActiveTab('search')}>
                    <Search className="h-4 w-4 mr-2" />
                    Search Literature
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="summaries">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Literature Summaries</CardTitle>
              <CardDescription>
                Access previously generated summaries or create new ones from your search results.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSummaries ? (
                <div className="space-y-6">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : recentSummaries.length > 0 ? (
                <div className="space-y-6">
                  {recentSummaries.map((summary) => (
                    <Card key={summary.id} className="summary-card">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">{summary.summary_type.charAt(0).toUpperCase() + summary.summary_type.slice(1)} Summary</CardTitle>
                            <CardDescription>
                              {summary.literature_preview?.length > 0 
                                ? `Based on ${summary.total_literature_count} sources including: ${summary.literature_preview.map(l => l.title).join(', ').substring(0, 100)}${summary.literature_preview.length > 1 ? '...' : ''}`
                                : `Based on ${summary.literature_ids.length} sources`}
                            </CardDescription>
                          </div>
                          <Badge variant="outline">{formatDistanceToNow(new Date(summary.created_at), { addSuffix: true })}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-40 rounded-md border p-4">
                          <div className="summary-text whitespace-pre-line">
                            {summary.summary_text}
                          </div>
                        </ScrollArea>
                      </CardContent>
                      <CardFooter className="flex justify-end">
                        <Button variant="outline" size="sm" onClick={() => {
                          navigator.clipboard.writeText(summary.summary_text);
                          toast({
                            title: 'Summary copied',
                            description: 'The summary has been copied to your clipboard',
                          });
                        }}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy to Clipboard
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="no-summaries flex flex-col items-center justify-center p-12 text-center">
                  <Brain className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Summaries Generated</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't created any AI-powered literature summaries yet.
                  </p>
                  <Button onClick={() => setActiveTab('search')}>
                    <Search className="h-4 w-4 mr-2" />
                    Search and Summarize
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Summary Dialog */}
      <Dialog open={isSummaryDialogOpen} onOpenChange={setIsSummaryDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Generate Literature Summary</DialogTitle>
            <DialogDescription>
              Create an AI-powered summary of the selected literature entries.
            </DialogDescription>
          </DialogHeader>
          
          <div className="summary-options grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="summary-type">
              <Label htmlFor="summary-type" className="mb-2 block">Summary Type</Label>
              <Select value={summaryType} onValueChange={setSummaryType}>
                <SelectTrigger id="summary-type">
                  <SelectValue placeholder="Select summary type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Summary</SelectItem>
                  <SelectItem value="detailed">Detailed Analysis</SelectItem>
                  <SelectItem value="critical">Critical Evaluation</SelectItem>
                  <SelectItem value="comparison">Comparative Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="summary-focus">
              <Label htmlFor="summary-focus" className="mb-2 block">Focus Area (Optional)</Label>
              <Input
                id="summary-focus"
                placeholder="E.g., Safety, Effectiveness, Technological characteristics"
                value={summaryFocus}
                onChange={(e) => setSummaryFocus(e.target.value)}
              />
            </div>
          </div>
          
          <div className="selected-entries mb-4">
            <Label className="mb-2 block">Selected Literature ({selectedEntries.length})</Label>
            <ScrollArea className="h-32 rounded-md border p-2">
              {searchResults
                .filter(entry => selectedEntries.includes(entry.id))
                .map(entry => (
                  <div key={entry.id} className="py-1 flex justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{entry.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.source_name} • {entry.publication_date ? new Date(entry.publication_date).toLocaleDateString() : 'Unknown date'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEntrySelection(entry.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </ScrollArea>
          </div>
          
          {generatedSummary && (
            <div className="generated-summary mb-4">
              <div className="flex justify-between items-center mb-2">
                <Label>Generated Summary</Label>
                <Button variant="outline" size="sm" onClick={handleCopySummary}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <ScrollArea className="h-60 rounded-md border p-4">
                <div className="whitespace-pre-line">
                  {generatedSummary}
                </div>
              </ScrollArea>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSummaryDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleGenerateSummary} 
              disabled={selectedEntries.length === 0 || isSummarizing}
            >
              {isSummarizing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Summary
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedLiteratureSearch;