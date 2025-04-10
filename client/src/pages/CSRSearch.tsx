import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

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
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!query.trim() && phase === 'Any' && indication === 'Any' && !minSampleSize) {
      toast({
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
      
      // Get results from FastAPI backend
      // Using proxy to forward the request to the FastAPI backend running on port 8000
      const response = await axios.get(`${endpoint}?${params.toString()}`);
      
      setResults(response.data.csrs || []);
      
      toast({
        title: `Found ${response.data.results_count || 0} results`,
        description: searchType === 'fast' ? "Using fast in-memory search" : "Using standard search",
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "Could not connect to the search API. Make sure the FastAPI server is running on port 8000.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">CSR Search Engine</h1>
        <p className="text-muted-foreground">
          Search across clinical study reports using natural language or filters
        </p>
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

      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Results</h2>
        
        {results.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {loading ? 'Searching...' : 'No results found. Try a different search query or filters.'}
          </div>
        ) : (
          <div className="grid gap-4">
            {results.map((result) => (
              <Card key={result.csr_id}>
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-semibold">{result.title}</h3>
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

                    <div className="pt-2">
                      <Button variant="outline" size="sm" onClick={() => window.open(`/reports/${result.csr_id}`, '_blank')}>
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}