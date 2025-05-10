import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, GitCompareIcon, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Link } from 'wouter';
import axios from 'axios';
import CSRCompareViewer from '@/components/csr/CSRCompareViewer';
import html2pdf from 'html2pdf.js';

// These should be dynamically loaded from the backend in a production app
const indications = ['Any', 'Oncology', 'Cardiology', 'Neurology', 'Immunology', 'Infectious Disease'];
const phases = ['Any', 'Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'];

export default function CSRSearch() {
  const [query, setQuery] = useState('');
  const [phase, setPhase] = useState('Any');
  const [indication, setIndication] = useState('Any');
  const [minSampleSize, setMinSampleSize] = useState<number | undefined>(undefined);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<'regular' | 'fast'>('fast');
  const [selectedCSRs, setSelectedCSRs] = useState<string[]>([]);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!query.trim() && phase === 'Any' && indication === 'Any' && !minSampleSize) {
      // toast call replaced
  // Original: toast({
        title: "Search criteria required",
        description: "Please enter a query or select filters",
        variant: "destructive"
      })
  console.log('Toast would show:', {
        title: "Search criteria required",
        description: "Please enter a query or select filters",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Construct API endpoint URL with query parameters
      const endpoint = searchType === 'fast' ? '/api/csrs/fast-query' : '/api/csrs/query';
      const params = new URLSearchParams();
      
      if (query.trim()) {
        params.append('query_text', query.trim());
      }
      
      if (phase !== 'Any') {
        params.append('phase', phase);
      }
      
      if (indication !== 'Any') {
        params.append('indication', indication);
      }
      
      if (minSampleSize) {
        params.append('min_sample_size', minSampleSize.toString());
      }
      
      // Get stats first to check if semantic search is available
      const statsResponse = await axios.get('/api/csrs/stats/overview');
      const semanticSearchAvailable = statsResponse.data?.semantic_search_available;
      
      // Execute the search query
      const response = await axios.get(`${endpoint}?${params.toString()}`);
      
      setResults(response.data.csrs || []);
      
      // Show appropriate toast message
      if (query.trim() && semanticSearchAvailable) {
        // toast call replaced
  // Original: toast({
          title: `Found ${response.data.results_count || 0} results`,
          description: "Using deep semantic search with intelligent matching",
        })
  console.log('Toast would show:', {
          title: `Found ${response.data.results_count || 0} results`,
          description: "Using deep semantic search with intelligent matching",
        });
      } else if (query.trim()) {
        // toast call replaced
  // Original: toast({
          title: `Found ${response.data.results_count || 0} results`,
          description: "Using basic keyword-based search (Deep semantic search unavailable)
  console.log('Toast would show:', {
          title: `Found ${response.data.results_count || 0} results`,
          description: "Using basic keyword-based search (Deep semantic search unavailable)",
        });
      } else {
        // toast call replaced
  // Original: toast({
          title: `Found ${response.data.results_count || 0} results`,
          description: "Using filter-based search"
        })
  console.log('Toast would show:', {
          title: `Found ${response.data.results_count || 0} results`,
          description: "Using filter-based search"
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      // toast call replaced
  // Original: toast({
        title: "Search failed",
        description: "Could not connect to the search API. Please try again.",
        variant: "destructive"
      })
  console.log('Toast would show:', {
        title: "Search failed",
        description: "Could not connect to the search API. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-blue-800">🧬 TrialSage Study Intelligence Search</h1>
        <p className="text-muted-foreground">
          Search and compare CSR-backed designs. Export directly into your protocol dossier.
        </p>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-blue-800">
        <div className="flex items-start">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2 mt-0.5" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <div>
            <h3 className="font-semibold text-base">Deep Semantic CSR Intelligence</h3>
            <p className="text-sm mt-1">
              This search is connected to our deep semantic layer and can understand natural language queries.
              Try searching for concepts, outcomes, or specific protocol designs to find semantically similar studies.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="search-query" className="text-sm font-medium">
            Search Query
          </label>
          <Input
            id="search-query"
            placeholder="e.g., Phase 2 trial for breast cancer with positive outcome"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-lg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="phase-select" className="text-sm font-medium">
              Phase
            </label>
            <Select value={phase} onValueChange={setPhase}>
              <SelectTrigger id="phase-select">
                <SelectValue placeholder="Select phase" />
              </SelectTrigger>
              <SelectContent>
                {phases.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-2">
            <label htmlFor="indication-select" className="text-sm font-medium">
              Indication
            </label>
            <Select value={indication} onValueChange={setIndication}>
              <SelectTrigger id="indication-select">
                <SelectValue placeholder="Select indication" />
              </SelectTrigger>
              <SelectContent>
                {indications.map((i) => (
                  <SelectItem key={i} value={i}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-2">
            <label htmlFor="sample-size" className="text-sm font-medium">
              Min Sample Size
            </label>
            <Input
              id="sample-size"
              type="number"
              min={0}
              placeholder="e.g., 100"
              value={minSampleSize || ''}
              onChange={(e) => setMinSampleSize(e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label htmlFor="search-type" className="text-sm font-medium">
              Search Type
            </label>
            <Select value={searchType} onValueChange={(value: 'regular' | 'fast') => setSearchType(value)}>
              <SelectTrigger id="search-type">
                <SelectValue placeholder="Select search type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fast">Fast (In-Memory)</SelectItem>
                <SelectItem value="regular">Standard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Button onClick={handleSearch} disabled={loading} className="w-28">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching
              </>
            ) : (
              'Search'
            )}
          </Button>
        </div>
      </div>

      {selectedCSRs.length > 0 && (
        <div className="sticky top-0 z-10 bg-background border border-muted rounded-md p-3 mb-4 flex justify-between items-center shadow-sm">
          <p className="text-sm font-medium">🧬 {selectedCSRs.length} trial(s) selected for comparison</p>
          <div className="flex gap-2">
            <Dialog open={compareDialogOpen} onOpenChange={setCompareDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  disabled={selectedCSRs.length < 2} 
                  onClick={() => setCompareDialogOpen(true)}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 mr-2" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4"></path>
                    <path d="M18 21h-4"></path>
                    <path d="M14 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <path d="M18 9 22 12 18 15"></path>
                    <path d="M6 15 2 12 6 9"></path>
                    <path d="M2 12H22"></path>
                  </svg>
                  Compare CSRs
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl">
                <CSRCompareViewer 
                  selectedIds={selectedCSRs} 
                  onClose={() => setCompareDialogOpen(false)} 
                />
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedCSRs([])}
            >
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight">Results</h2>
        </div>
        
        {query && results.length > 0 && (
          <div className="text-sm text-muted-foreground bg-slate-50 p-3 rounded-md border border-slate-200">
            <div className="flex gap-2 items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-slate-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <p>
                <span className="font-medium">Context Insights:</span> Each result now includes an explanation of why it matches your search query. 
                Look for the blue highlight box under each result to understand its relevance.
              </p>
            </div>
          </div>
        )}
        
        {results.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {loading ? 'Searching...' : 'No results found. Try a different search query or filters.'}
          </div>
        ) : (
          <div className="grid gap-4">
            {results.map((result) => {
              const csrId = result.csr_id || result.id;
              const isSelected = selectedCSRs.includes(csrId);
              
              return (
                <Card key={csrId} className={isSelected ? "border-primary" : ""}>
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`select-${csrId}`}
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                if (selectedCSRs.length < 3) {
                                  setSelectedCSRs([...selectedCSRs, csrId]);
                                } else {
                                  // toast call replaced
  // Original: toast({
                                    title: "Maximum selection reached",
                                    description: "You can compare up to 3 CSRs at a time",
                                    variant: "destructive"
                                  })
  console.log('Toast would show:', {
                                    title: "Maximum selection reached",
                                    description: "You can compare up to 3 CSRs at a time",
                                    variant: "destructive"
                                  });
                                }
                              } else {
                                setSelectedCSRs(selectedCSRs.filter(id => id !== csrId));
                              }
                            }}
                          />
                          <h3 className="text-xl font-semibold">{result.title}</h3>
                        </div>
                        {result.similarity && (
                          <Badge variant="outline" className="ml-2">
                            Similarity: {(result.similarity * 100).toFixed(0)}%
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{result.phase}</Badge>
                        <Badge variant="secondary">{result.indication}</Badge>
                        {result.sample_size && (
                          <Badge variant="secondary">N={result.sample_size}</Badge>
                        )}
                        {result.outcome && (
                          <Badge variant={result.outcome.toLowerCase().includes('positive') ? 'default' : 'destructive'}>
                            {result.outcome}
                          </Badge>
                        )}
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <p>
                          <span className="font-medium">Sponsor:</span> {result.sponsor || 'Unknown'}
                        </p>
                        {result.date && (
                          <p>
                            <span className="font-medium">Date:</span> {new Date(result.date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      
                      {result.context_summary && (
                        <div className="mt-2 bg-blue-50 border-l-4 border-blue-500 px-3 py-2 rounded">
                          <div className="flex items-start space-x-2">
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className="h-5 w-5 text-blue-500 mt-0.5" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="10"></circle>
                              <path d="M12 16v-4"></path>
                              <path d="M12 8h.01"></path>
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-blue-800">Why this matches your search:</p>
                              <p className="text-sm text-blue-800">{result.context_summary}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="pt-2 flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          asChild
                        >
                          <Link href={`/reports/${csrId}`}>
                            View Full CSR
                          </Link>
                        </Button>
                        
                        <Button
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedCSRs(selectedCSRs.filter(id => id !== csrId));
                            } else if (selectedCSRs.length < 3) {
                              setSelectedCSRs([...selectedCSRs, csrId]);
                            } else {
                              // toast call replaced
  // Original: toast({
                                title: "Maximum selection reached",
                                description: "You can compare up to 3 CSRs at a time",
                                variant: "destructive"
                              })
  console.log('Toast would show:', {
                                title: "Maximum selection reached",
                                description: "You can compare up to 3 CSRs at a time",
                                variant: "destructive"
                              });
                            }
                          }}
                        >
                          {isSelected ? "✓ Selected" : "Compare"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}