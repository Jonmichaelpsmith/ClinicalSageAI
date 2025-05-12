import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, Search, BookOpen, FileText, Download, Plus, Info } from 'lucide-react';

/**
 * Enhanced Literature Search Component
 * 
 * Provides advanced literature search capabilities with semantic relevance,
 * AI-powered summarization, and citation management for 510(k) submissions.
 * 
 * @param {Object} props - Component props
 * @param {string} props.projectId - The current project ID
 * @param {Object} props.deviceProfile - The device profile information
 * @param {Function} props.onAddCitations - Callback when citations are added to report
 */
const EnhancedLiteratureSearch = ({ projectId, deviceProfile, onAddCitations }) => {
  const queryClient = useQueryClient();
  
  // States
  const [searchParams, setSearchParams] = useState({
    query: '',
    source: 'pubmed', // pubmed, clinicaltrials, preprints
    publicationTypes: [],
    dateRange: { start: '', end: '' },
    advancedMode: false,
    semanticSearch: false,
  });
  
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Initialize search query with device name if available
  useEffect(() => {
    if (deviceProfile?.deviceName) {
      setSearchParams(prev => ({ 
        ...prev, 
        query: deviceProfile.deviceName 
      }));
    }
  }, [deviceProfile]);
  
  // Literature search query
  const { 
    data: searchResults, 
    isLoading: isSearching,
    isError: searchError,
    refetch: performSearch
  } = useQuery({
    queryKey: ['/api/510k/literature/search', searchParams, page],
    queryFn: async () => {
      const response = await apiRequest({
        url: '/api/510k/literature/search',
        method: 'GET',
        params: {
          ...searchParams,
          projectId,
          page,
          pageSize: 10
        }
      });
      return response;
    },
    enabled: false // Don't run query on mount
  });
  
  // Summarize selected articles
  const { 
    mutate: summarizeBatch, 
    isPending: isSummarizing 
  } = useMutation({
    mutationFn: async (ids) => {
      const response = await apiRequest({
        url: '/api/510k/literature/summarize',
        method: 'POST',
        data: {
          ids,
          projectId
        }
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/510k/literature/search'] });
    }
  });
  
  // Add selected entries to report
  const { 
    mutate: addToReport, 
    isPending: isAddingToReport 
  } = useMutation({
    mutationFn: async (ids) => {
      const response = await apiRequest({
        url: '/api/510k/literature/citations',
        method: 'POST',
        data: {
          ids,
          projectId
        }
      });
      return response;
    },
    onSuccess: (data) => {
      if (onAddCitations) {
        onAddCitations(data.citations);
      }
    }
  });
  
  // Export selected citations as BibTeX
  const { 
    mutate: exportBibtex, 
    isPending: isExporting 
  } = useMutation({
    mutationFn: async (ids) => {
      const response = await apiRequest({
        url: '/api/510k/literature/export/bibtex',
        method: 'POST',
        data: {
          ids,
          projectId
        }
      });
      
      // Create and download BibTeX file
      const blob = new Blob([response.bibtex], { type: 'application/x-bibtex' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `citations-${new Date().toISOString().slice(0, 10)}.bib`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return response;
    }
  });
  
  // Handle literature search submission
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setPage(1); // Reset to first page
    performSearch();
  };
  
  // Handle selecting/deselecting all items
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(searchResults?.results.map(item => item.id) || []);
    } else {
      setSelectedIds([]);
    }
  };
  
  // Handle selecting/deselecting individual item
  const handleSelectItem = (id, checked) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(itemId => itemId !== id));
    }
  };
  
  // Handle summarize button click
  const handleSummarize = () => {
    if (selectedIds.length > 0) {
      summarizeBatch(selectedIds);
    }
  };
  
  // Handle add to report button click
  const handleAddToReport = () => {
    if (selectedIds.length > 0) {
      addToReport(selectedIds);
    }
  };
  
  // Handle export BibTeX button click
  const handleExportBibtex = () => {
    if (selectedIds.length > 0) {
      exportBibtex(selectedIds);
    }
  };
  
  // Handle summarize single article
  const handleSummarizeSingle = (id) => {
    summarizeBatch([id]);
  };
  
  // Simple/Advanced toggle
  const toggleAdvancedMode = () => {
    setShowAdvanced(!showAdvanced);
    setSearchParams(prev => ({
      ...prev,
      advancedMode: !showAdvanced
    }));
  };
  
  // Semantic search toggle
  const toggleSemanticSearch = (checked) => {
    setSearchParams(prev => ({
      ...prev, 
      semanticSearch: checked
    }));
  };
  
  // Update publication types
  const handlePublicationTypeChange = (type) => {
    setSearchParams(prev => {
      const current = [...prev.publicationTypes];
      const typeIndex = current.indexOf(type);
      
      if (typeIndex > -1) {
        current.splice(typeIndex, 1);
      } else {
        current.push(type);
      }
      
      return {
        ...prev,
        publicationTypes: current
      };
    });
  };
  
  // Handle search source change
  const handleSourceChange = (source) => {
    setSearchParams(prev => ({
      ...prev,
      source
    }));
  };
  
  // Handle pagination
  const handleNextPage = () => {
    setPage(prev => prev + 1);
    performSearch();
  };
  
  const handlePrevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
      performSearch();
    }
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Advanced Literature Discovery</CardTitle>
          <CardDescription>
            Search medical literature across multiple sources to support your 510(k) submission
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <Input
                  placeholder="Search medical literature..."
                  value={searchParams.query}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, query: e.target.value }))}
                  className="w-full"
                />
              </div>
              <Button type="submit" disabled={isSearching}>
                {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Search
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" type="button" onClick={toggleAdvancedMode}>
                      {showAdvanced ? 'Simple' : 'Advanced'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{showAdvanced ? 'Switch to simple search' : 'Access advanced search options'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            {showAdvanced && (
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex flex-wrap gap-4">
                  <div className="w-full md:w-auto">
                    <Label htmlFor="source">Source</Label>
                    <Tabs 
                      defaultValue={searchParams.source} 
                      onValueChange={handleSourceChange}
                      className="w-full mt-1"
                    >
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="pubmed">PubMed</TabsTrigger>
                        <TabsTrigger value="clinicaltrials">ClinicalTrials.gov</TabsTrigger>
                        <TabsTrigger value="preprints">Grey Lit</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  
                  <div className="w-full md:w-auto">
                    <Label>Publication Type</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="pubtype-clinical-trial" 
                          checked={searchParams.publicationTypes.includes('clinical-trial')}
                          onCheckedChange={() => handlePublicationTypeChange('clinical-trial')}
                        />
                        <label 
                          htmlFor="pubtype-clinical-trial"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Clinical Trial
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="pubtype-review" 
                          checked={searchParams.publicationTypes.includes('review')}
                          onCheckedChange={() => handlePublicationTypeChange('review')}
                        />
                        <label 
                          htmlFor="pubtype-review"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Review
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="pubtype-meta-analysis" 
                          checked={searchParams.publicationTypes.includes('meta-analysis')}
                          onCheckedChange={() => handlePublicationTypeChange('meta-analysis')}
                        />
                        <label 
                          htmlFor="pubtype-meta-analysis"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Meta-Analysis
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-auto">
                    <Label>Date Range</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input
                        type="number"
                        placeholder="From Year"
                        className="w-24"
                        value={searchParams.dateRange.start}
                        onChange={(e) => setSearchParams(prev => ({ 
                          ...prev, 
                          dateRange: { ...prev.dateRange, start: e.target.value } 
                        }))}
                      />
                      <span>to</span>
                      <Input
                        type="number"
                        placeholder="To Year"
                        className="w-24"
                        value={searchParams.dateRange.end}
                        onChange={(e) => setSearchParams(prev => ({ 
                          ...prev, 
                          dateRange: { ...prev.dateRange, end: e.target.value } 
                        }))}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="semantic-search"
                      checked={searchParams.semanticSearch}
                      onCheckedChange={toggleSemanticSearch}
                    />
                    <Label htmlFor="semantic-search">Semantic Relevance</Label>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Semantic search uses AI to find conceptually related papers, 
                          even if they don't contain your exact keywords.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
      
      {searchResults && (
        <>
          {/* Bulk actions toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="select-all" 
                checked={selectedIds.length > 0 && selectedIds.length === searchResults.results.length}
                onCheckedChange={handleSelectAll}
              />
              <label 
                htmlFor="select-all"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Select All
              </label>
              <span className="text-sm text-muted-foreground">
                {selectedIds.length} of {searchResults.results.length} selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSummarize}
                disabled={selectedIds.length === 0 || isSummarizing}
              >
                {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                Summarize Selected
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddToReport}
                disabled={selectedIds.length === 0 || isAddingToReport}
              >
                {isAddingToReport ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Add Citations to Report
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportBibtex}
                disabled={selectedIds.length === 0 || isExporting}
              >
                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Export BibTeX
              </Button>
            </div>
          </div>
          
          {/* Results table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="w-[100px]">Year</TableHead>
                    <TableHead className="w-[150px]">Journal/Source</TableHead>
                    {searchParams.semanticSearch && <TableHead className="w-[100px]">Relevance</TableHead>}
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.results.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedIds.includes(item.id)}
                          onCheckedChange={(checked) => handleSelectItem(item.id, checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.authors?.join(', ')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{item.year}</TableCell>
                      <TableCell>{item.journal || item.source}</TableCell>
                      {searchParams.semanticSearch && (
                        <TableCell>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-primary h-2.5 rounded-full" 
                              style={{ width: `${Math.round(item.relevanceScore * 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(item.relevanceScore * 100)}%
                          </span>
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex space-x-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleSummarizeSingle(item.id)}
                                  disabled={isSummarizing}
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Generate AI summary</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => window.open(item.url, '_blank')}
                                >
                                  <BookOpen className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View original article</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between py-4">
              <div className="text-sm text-muted-foreground">
                Showing {searchResults.results.length} of {searchResults.total} results
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handlePrevPage}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleNextPage}
                  disabled={page * 10 >= searchResults.total}
                >
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          {/* Article summaries and insights */}
          {searchResults.results.some(item => item.summary) && (
            <Card>
              <CardHeader>
                <CardTitle>AI-Generated Summaries & Insights</CardTitle>
                <CardDescription>
                  Automatically extracted information from selected articles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {searchResults.results
                    .filter(item => item.summary)
                    .map((item) => (
                      <AccordionItem key={`summary-${item.id}`} value={item.id}>
                        <AccordionTrigger>
                          <div className="text-left">
                            <span className="font-medium">{item.title}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              ({item.year}, {item.journal || item.source})
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-1">Summary</h4>
                              <p className="text-sm">{item.summary}</p>
                            </div>
                            
                            {item.insights && (
                              <div className="space-y-2">
                                <h4 className="font-medium">Key Insights</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {item.insights.studyDesign && (
                                    <div className="border rounded p-3">
                                      <h5 className="text-sm font-medium">Study Design</h5>
                                      <p className="text-sm">{item.insights.studyDesign}</p>
                                    </div>
                                  )}
                                  {item.insights.sampleSize && (
                                    <div className="border rounded p-3">
                                      <h5 className="text-sm font-medium">Sample Size</h5>
                                      <p className="text-sm">{item.insights.sampleSize}</p>
                                    </div>
                                  )}
                                  {item.insights.primaryEfficacy && (
                                    <div className="border rounded p-3">
                                      <h5 className="text-sm font-medium">Primary Efficacy</h5>
                                      <p className="text-sm">{item.insights.primaryEfficacy}</p>
                                    </div>
                                  )}
                                  {item.insights.safetyConcerns && (
                                    <div className="border rounded p-3">
                                      <h5 className="text-sm font-medium">Safety Concerns</h5>
                                      <p className="text-sm">{item.insights.safetyConcerns}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleSelectItem(item.id, true)}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Add to Selection
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                </Accordion>
              </CardContent>
            </Card>
          )}
        </>
      )}
      
      {/* Empty state */}
      {!searchResults && !isSearching && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Search for literature</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Use the search box above to find relevant medical literature
            for your 510(k) submission.
          </p>
        </div>
      )}
      
      {/* Search error state */}
      {searchError && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <p className="font-medium">Error searching literature</p>
          <p className="text-sm">Please try again or contact support if the issue persists.</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedLiteratureSearch;