import React, { useState } from 'react';
import {
  Clipboard,
  ArrowUpDown,
  Filter,
  Info,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Link } from 'wouter';

const SimilarStudyResults = ({ results, queryGoal, onSelectStudy }) => {
  const [sortConfig, setSortConfig] = useState({
    key: 'similarityScore',
    direction: 'desc'
  });
  const [expandedIds, setExpandedIds] = useState({});
  const { toast } = useToast();

  const toggleExpand = (id) => {
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const sortedResults = [...results].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleCopyObjectives = (objectives, title) => {
    navigator.clipboard.writeText(objectives);
    toast({
      title: "Copied to clipboard",
      description: `Study objectives from "${title}" copied`
    });
  };

  const handleSelectForQuery = (study) => {
    onSelectStudy(study);
  };

  const formatSimilarityScore = (score) => {
    return (score * 100).toFixed(1) + '%';
  };

  if (results.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Similar Studies</CardTitle>
          <CardDescription>No results found. Try adjusting your search criteria.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Similar Studies</span>
          <Badge variant="outline" className="ml-2 text-xs">
            {results.length} results
          </Badge>
        </CardTitle>
        <CardDescription>
          Studies with goals similar to: "{queryGoal.length > 120 ? queryGoal.substring(0, 120) + '...' : queryGoal}"
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-between items-center">
          <div className="text-sm text-slate-500">
            Showing studies ranked by similarity to your goals
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('similarityScore')}
              className="h-8 px-2 text-xs"
            >
              <ArrowUpDown className="mr-1 h-3 w-3" />
              Sort by {sortConfig.key === 'similarityScore' ? 
                (sortConfig.direction === 'desc' ? 'Lowest' : 'Highest') + ' Similarity' : 
                'Similarity'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('sampleSize')}
              className="h-8 px-2 text-xs"
            >
              <ArrowUpDown className="mr-1 h-3 w-3" />
              Sort by {sortConfig.key === 'sampleSize' ? 
                (sortConfig.direction === 'desc' ? 'Lowest' : 'Highest') + ' Sample Size' : 
                'Sample Size'}
            </Button>
          </div>
        </div>
        
        <ScrollArea className="h-[600px] rounded-md border">
          {sortedResults.map((study, index) => (
            <Collapsible
              key={study.id}
              open={expandedIds[study.id]}
              onOpenChange={() => toggleExpand(study.id)}
              className={`border-b ${index === 0 ? 'border-t' : ''} py-3 px-4`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        study.similarityScore > 0.8 ? "default" : 
                        study.similarityScore > 0.6 ? "secondary" : 
                        "outline"
                      }
                      className="text-xs font-medium"
                    >
                      {formatSimilarityScore(study.similarityScore)}
                    </Badge>
                    <h3 className="text-sm font-medium">{study.title}</h3>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      {study.sponsor}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {study.phase}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {study.indication}
                    </Badge>
                    {study.sampleSize && (
                      <Badge variant="outline" className="text-xs">
                        N={study.sampleSize}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelectForQuery(study)}
                    className="h-8 px-2 text-xs"
                  >
                    <Info className="mr-1 h-3 w-3" />
                    Query
                  </Button>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      {expandedIds[study.id] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </div>
              
              <CollapsibleContent className="mt-2">
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 mb-1">Primary Objective</h4>
                    <p className="text-sm">{study.primaryObjective}</p>
                    {study.secondaryObjectives && (
                      <>
                        <h4 className="text-xs font-semibold text-slate-500 mt-2 mb-1">Secondary Objectives</h4>
                        <p className="text-sm">{study.secondaryObjectives}</p>
                      </>
                    )}
                    <div className="mt-2 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyObjectives(
                          `Primary Objective: ${study.primaryObjective}\n\n${
                            study.secondaryObjectives ? `Secondary Objectives: ${study.secondaryObjectives}` : ''
                          }`,
                          study.title
                        )}
                        className="h-7 text-xs"
                      >
                        <Clipboard className="mr-1 h-3 w-3" />
                        Copy Objectives
                      </Button>
                    </div>
                  </div>
                  
                  {study.endpoints && study.endpoints.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 mb-1">Endpoints</h4>
                      <div className="flex flex-wrap gap-1">
                        {study.endpoints.map((endpoint, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {endpoint}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-2">
                    <div className="text-xs text-slate-500">
                      ID: {study.id}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/reports/${study.id}`}>
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          <ExternalLink className="mr-1 h-3 w-3" />
                          View Full Report
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SimilarStudyResults;