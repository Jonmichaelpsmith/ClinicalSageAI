// NLPQuery.jsx
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, MessageSquare, Clipboard, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

/**
 * NLPQuery Component
 * Allows users to query clinical data with natural language
 * Returns structured query parameters in JSON format
 */
export default function NLPQuery({ onFilterChange }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Process natural language query
  const processQuery = async () => {
    if (!query.trim()) {
      toast({
        title: "Query Required",
        description: "Please enter a natural language query",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest('POST', '/api/cer/nlp-query', { query });
      
      if (!response.ok) {
        throw new Error(`Failed to process query: ${response.statusText}`);
      }
      
      const data = await response.json();
      setResults(data);
      
      // If callback provided, pass the filter parameters
      if (onFilterChange && data.filter_parameters) {
        onFilterChange(data.filter_parameters);
      }

    } catch (err) {
      console.error('Error processing NLP query:', err);
      toast({
        title: "Query Processing Error",
        description: err.message || "Could not process your natural language query",
        variant: "destructive",
      });
      
      // Simulate response for development until backend is ready
      const simulatedResponse = generateSimulatedResponse(query);
      setResults(simulatedResponse);
      
      // If callback provided, pass the simulated filter parameters
      if (onFilterChange && simulatedResponse.filter_parameters) {
        onFilterChange(simulatedResponse.filter_parameters);
      }
    } finally {
      setLoading(false);
    }
  };

  // Generate simulated response for development/testing
  const generateSimulatedResponse = (queryText) => {
    // Extract age if mentioned
    let ageMatch = queryText.match(/age\s+(\d+)/i) || queryText.match(/(\d+)\s+years\s+old/i);
    let ageValue = ageMatch ? parseInt(ageMatch[1]) : null;
    
    // Extract event mentioned
    let eventMatch = queryText.match(/event\s+(\w+)/i) || queryText.match(/(headache|nausea|dizziness|fatigue|rash)/i);
    let eventValue = eventMatch ? eventMatch[1] : null;
    
    // Extract time period
    let timeMatch = queryText.match(/(months|years|weeks|days)/i);
    let timeValue = timeMatch ? timeMatch[1] : null;

    // Create filter parameters
    const filterParams = {};
    if (ageValue) filterParams.age = ageValue;
    if (eventValue) filterParams.event = eventValue;
    if (timeValue) filterParams.period = timeValue;
    
    if (queryText.toLowerCase().includes('trend')) {
      filterParams.view = 'trend';
    } else if (queryText.toLowerCase().includes('compar')) {
      filterParams.view = 'comparison';
    }

    return {
      natural_language_query: queryText,
      interpretation: `Showing data for ${
        ageValue ? `patients over ${ageValue} years old` : 'all patients'
      }${eventValue ? ` with focus on ${eventValue} events` : ''}${
        timeValue ? ` over the last ${timeValue}` : ''
      }.`,
      filter_parameters: filterParams,
      confidence: 0.85
    };
  };

  // Copy query results to clipboard
  const copyToClipboard = () => {
    if (!results) return;
    
    navigator.clipboard.writeText(JSON.stringify(results, null, 2))
      .then(() => {
        setCopied(true);
        toast({ 
          title: "Copied to clipboard", 
          description: "Query results copied to clipboard successfully" 
        });
        
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        toast({
          title: "Copy Failed",
          description: "Could not copy results to clipboard",
          variant: "destructive",
        });
      });
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      processQuery();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          Natural Language Query
        </CardTitle>
        <CardDescription>
          Ask questions about clinical data in plain English
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="e.g., Show trends for patients over 60 with headache events"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyUp={handleKeyPress}
            disabled={loading}
            className="flex-1"
          />
          <Button onClick={processQuery} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Query
              </>
            )}
          </Button>
        </div>
        
        {results && (
          <div className="mt-4 space-y-3">
            <div className="bg-muted p-3 rounded-md relative">
              <div className="flex justify-between items-start">
                <h4 className="font-medium mb-1">Interpretation</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 absolute top-2 right-2"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Clipboard className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{results.interpretation}</p>
              
              <h4 className="font-medium mt-3 mb-1">Generated Filter Parameters</h4>
              <pre className="bg-background p-2 rounded text-xs overflow-x-auto">
                {JSON.stringify(results.filter_parameters, null, 2)}
              </pre>
              
              {results.confidence && (
                <div className="text-xs text-muted-foreground mt-2">
                  Confidence: {Math.round(results.confidence * 100)}%
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0">
        <p className="text-xs text-muted-foreground">
          Examples: "Show adverse events for elderly patients", "Compare headache vs nausea events", "Show trends for the last 6 months"
        </p>
      </CardFooter>
    </Card>
  );
}