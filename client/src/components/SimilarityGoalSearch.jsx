import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SimilarityGoalSearch = ({ onSearchResults }) => {
  const [loading, setLoading] = useState(false);
  const [searchGoal, setSearchGoal] = useState('');
  const [advancedOptions, setAdvancedOptions] = useState({
    minSimilarity: 0.6,
    maxResults: 10,
    includeEndpoints: true,
    includeAdverseEvents: true,
    includeSampleSize: true,
    searchType: 'semantic'
  });
  const { toast } = useToast();

  const handleSearchTypeChange = (value) => {
    setAdvancedOptions({
      ...advancedOptions,
      searchType: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!searchGoal.trim()) {
      toast({
        title: "Search goal required",
        description: "Please enter a description of your study goals",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/csr/similar-goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          goalText: searchGoal,
          minSimilarity: advancedOptions.minSimilarity,
          maxResults: advancedOptions.maxResults,
          includeEndpoints: advancedOptions.includeEndpoints,
          includeAdverseEvents: advancedOptions.includeAdverseEvents,
          includeSampleSize: advancedOptions.includeSampleSize,
          searchType: advancedOptions.searchType
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to search for similar studies');
      }
      
      const data = await response.json();
      onSearchResults(data.results, searchGoal);
      
      toast({
        title: "Search completed",
        description: `Found ${data.results.length} studies with similar goals`,
      });
    } catch (error) {
      console.error('Error searching for similar studies:', error);
      toast({
        title: "Search failed",
        description: error.message || "An error occurred during search",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Find Similar Study Goals</CardTitle>
        <CardDescription>
          Enter your study goals to find CSRs with similar objectives
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="study-goals">Study Goals</Label>
            <Textarea
              id="study-goals"
              placeholder="Describe the primary and secondary objectives of your study..."
              value={searchGoal}
              onChange={(e) => setSearchGoal(e.target.value)}
              className="h-28"
            />
          </div>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Search</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic">
              <div className="py-2">
                <p className="text-sm text-slate-500">
                  Basic search uses semantic matching to find CSRs with similar study goals
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced">
              <div className="space-y-4 py-2">
                <div>
                  <Label htmlFor="searchType">Search Method</Label>
                  <RadioGroup 
                    id="searchType" 
                    value={advancedOptions.searchType}
                    onValueChange={handleSearchTypeChange}
                    className="flex flex-col space-y-1 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="semantic" id="semantic" />
                      <Label htmlFor="semantic" className="font-normal">
                        Semantic Search (meaning-based)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hybrid" id="hybrid" />
                      <Label htmlFor="hybrid" className="font-normal">
                        Hybrid Search (semantic + keyword)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="keyword" id="keyword" />
                      <Label htmlFor="keyword" className="font-normal">
                        Keyword Search
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div>
                  <Label htmlFor="max-results">Maximum Results</Label>
                  <Input
                    id="max-results"
                    type="number"
                    min="1"
                    max="50"
                    value={advancedOptions.maxResults}
                    onChange={(e) => setAdvancedOptions({
                      ...advancedOptions,
                      maxResults: parseInt(e.target.value) || 10
                    })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="min-similarity">Minimum Similarity Score (0-1)</Label>
                  <Input
                    id="min-similarity"
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={advancedOptions.minSimilarity}
                    onChange={(e) => setAdvancedOptions({
                      ...advancedOptions,
                      minSimilarity: parseFloat(e.target.value) || 0.6
                    })}
                    className="mt-1"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !searchGoal.trim()}
          >
            {loading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-t-2 border-white"></span>
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Find Similar Studies
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SimilarityGoalSearch;