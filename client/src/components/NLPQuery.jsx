// NLPQuery.jsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function NLPQuery({ onFilter }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const submitQuery = async () => {
    if (!query.trim()) {
      toast({
        title: "Empty Query",
        description: "Please enter a search query.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Try to use the API request utility from the app
      const response = await apiRequest('POST', '/api/cer/nlp-query', { query });
      
      if (!response.ok) {
        throw new Error('Failed to process the query: ' + response.statusText);
      }
      
      const data = await response.json();
      
      toast({
        title: "Query Processed",
        description: "Natural language query processed successfully.",
      });
      
      onFilter(data); // Return filtered data to parent
    } catch (error) {
      console.error('NLP query error:', error);
      toast({
        title: "Query Processing Error",
        description: error.message || "Failed to process natural language query.",
        variant: "destructive",
      });
      
      // Use mock filtered data for development purposes
      fallbackMockFilter();
    } finally {
      setLoading(false);
    }
  };

  const fallbackMockFilter = () => {
    // This is just for UI testing until the backend endpoint is implemented
    toast({
      title: "Using Simulated Response",
      description: "The NLP query endpoint is not yet available. Using simulated data for preview.",
      variant: "warning",
    });

    // Provide minimal simulated data for UI testing
    onFilter({
      query: query,
      filtered: true,
      message: "Simulated filter applied for: " + query,
      count: 3,
    });
  };

  return (
    <div className="space-y-2 mb-6">
      <h3 className="text-lg font-medium">Natural Language Query</h3>
      <p className="text-sm text-muted-foreground mb-2">
        Ask questions about the data in natural language. For example: "Show me adverse events for elderly patients" or "Compare efficacy across age groups".
      </p>
      
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Ask a question about the clinical data..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              submitQuery();
            }
          }}
        />
        <Button
          onClick={submitQuery}
          disabled={loading || !query.trim()}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Search
            </>
          )}
        </Button>
      </div>
    </div>
  );
}