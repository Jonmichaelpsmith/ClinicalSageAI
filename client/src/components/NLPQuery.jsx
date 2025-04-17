import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';

const NLPQuery = ({ onFilterResults }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [interpretation, setInterpretation] = useState(null);
  const { toast } = useToast();
  
  // Example queries that users might want to try
  const exampleQueries = [
    "Show me all serious adverse events in elderly patients",
    "Which adverse events are most common in female patients?",
    "Compare headache and nausea events across all products",
    "Show adverse events reported in the last 6 months",
    "Which drugs have the highest rate of gastrointestinal side effects?"
  ];

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Query required",
        description: "Please enter a search query",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.post('/api/cer/nlp-query', { query });
      
      if (response.data.success) {
        setInterpretation(response.data.results.interpretation);
        onFilterResults(response.data.results);
        
        toast({
          title: "Query processed",
          description: `Found ${response.data.results.filtered_data?.events?.length || 0} matching events`,
        });
      } else {
        toast({
          title: "Error processing query",
          description: response.data.message || "An error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error processing NLP query:', error);
      toast({
        title: "Error",
        description: "Failed to process your query. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const tryExampleQuery = (example) => {
    setQuery(example);
    // Don't auto-execute to give users a chance to modify
  };

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Natural Language Query
        </CardTitle>
        <CardDescription>
          Ask questions about adverse events in plain English
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="e.g., Show serious adverse events in female patients over 65"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>
          
          {interpretation && (
            <div className="bg-muted p-3 rounded-md">
              <h4 className="font-medium mb-1">Query Interpretation</h4>
              <div className="text-sm">
                <p><strong>Intent:</strong> {interpretation.intent}</p>
                <p><strong>Filters:</strong> {interpretation.filters?.map(f => 
                  `${f.type}: ${f.value}`
                ).join(', ') || 'None'}</p>
                {interpretation.group_by && (
                  <p><strong>Grouping:</strong> {interpretation.group_by}</p>
                )}
              </div>
            </div>
          )}
          
          <div>
            <p className="text-sm text-muted-foreground mb-2">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.map((example, i) => (
                <button
                  key={i}
                  onClick={() => tryExampleQuery(example)}
                  className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Powered by GPT-4o • Results are based on FDA FAERS data analysis
      </CardFooter>
    </Card>
  );
};

export default NLPQuery;