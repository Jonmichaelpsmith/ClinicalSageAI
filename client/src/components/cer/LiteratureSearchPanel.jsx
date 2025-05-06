import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Loader2, BookOpen, FileText, Search, Calendar, Trash2, Newspaper, Book, BookMarked } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * LiteratureSearchPanel - Component for searching and analyzing scientific literature
 * Implements section 8 of the CER Master Data Model (Literature Appraisal & Synthesis)
 */
export default function LiteratureSearchPanel({ cerTitle = '', onAddToCER }) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('pubmed');
  const [dateRange, setDateRange] = useState('5years');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPapers, setSelectedPapers] = useState([]);
  const [generatingReview, setGeneratingReview] = useState(false);
  const [literatureReview, setLiteratureReview] = useState(null);
  
  // Databases to search
  const databases = [
    { id: 'pubmed', name: 'PubMed', icon: Newspaper },
    { id: 'embase', name: 'Embase', icon: Book },
    { id: 'cochrane', name: 'Cochrane Library', icon: BookMarked },
  ];
  
  // Date range options
  const dateRanges = [
    { id: '1year', label: 'Last year' },
    { id: '3years', label: 'Last 3 years' },
    { id: '5years', label: 'Last 5 years' },
    { id: '10years', label: 'Last 10 years' },
    { id: 'all', label: 'All time' },
  ];
  
  // Perform search
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        variant: 'destructive',
        title: 'Search term required',
        description: 'Please enter a keyword or phrase to search.',
      });
      return;
    }
    
    setIsSearching(true);
    setSearchResults([]);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Sample search results - in a real app, this would come from an API
      const sampleResults = [
        {
          id: '1',
          title: 'Clinical outcomes of biodegradable polymer drug-eluting stents versus durable polymer drug-eluting stents: A systematic review and meta-analysis',
          authors: 'Zhang Y, Tian N, Dong S, et al.',
          journal: 'J Clin Med Res',
          year: 2023,
          type: 'meta-analysis',
          abstract: 'Background: This systematic review and meta-analysis aimed to evaluate the clinical outcomes of biodegradable polymer drug-eluting stents (BP-DES) versus durable polymer drug-eluting stents (DP-DES)...',
          relevance: 0.95,
          citationCount: 34,
          evidenceLevel: 'High',
        },
        {
          id: '2',
          title: 'Long-term outcomes after implantation of biodegradable polymer stents: A comparative analysis',
          authors: 'Smith J, Johnson P, Williams A, et al.',
          journal: 'JACC Cardiovasc Interv',
          year: 2022,
          type: 'clinical-trial',
          abstract: 'Objectives: This study sought to evaluate long-term outcomes after implantation of biodegradable polymer drug-eluting stents compared with durable polymer stents...',
          relevance: 0.92,
          citationCount: 56,
          evidenceLevel: 'Moderate',
        },
        {
          id: '3',
          title: 'Safety and efficacy of novel cardiovascular devices: A comprehensive review',
          authors: 'Chen R, Kim S, Park M, et al.',
          journal: 'Eur Heart J',
          year: 2021,
          type: 'review',
          abstract: 'This review examines the latest evidence on safety and efficacy of novel cardiovascular devices, including recent advances in stent technology, valvular interventions, and monitoring systems...',
          relevance: 0.81,
          citationCount: 22,
          evidenceLevel: 'Moderate',
        },
        {
          id: '4',
          title: 'Real-world experience with biodegradable polymer stents in high-risk patients: A single-center registry',
          authors: 'Miller T, Davidson L, et al.',
          journal: 'Catheter Cardiovasc Interv',
          year: 2020,
          type: 'observational',
          abstract: 'Background and aims: Limited data exist regarding the use of biodegradable polymer stents in high-risk patients in real-world clinical practice. This registry sought to evaluate outcomes...',
          relevance: 0.78,
          citationCount: 15,
          evidenceLevel: 'Low',
        },
        {
          id: '5',
          title: 'A prospective evaluation of cardiac device infections and associated outcomes',
          authors: 'Singh R, Patel A, et al.',
          journal: 'J Am Coll Cardiol',
          year: 2022,
          type: 'prospective-cohort',
          abstract: 'Background: Cardiac device infections remain a significant complication of device implantation. This study aimed to evaluate the incidence, risk factors, and outcomes of these infections...',
          relevance: 0.72,
          citationCount: 19,
          evidenceLevel: 'Moderate',
        },
      ];
      
      setSearchResults(sampleResults);
    } catch (err) {
      console.error('Search error:', err);
      
      toast({
        variant: 'destructive',
        title: 'Search failed',
        description: 'An error occurred while searching. Please try again.',
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  // Toggle paper selection
  const togglePaperSelection = (paperId) => {
    if (selectedPapers.includes(paperId)) {
      setSelectedPapers(selectedPapers.filter(id => id !== paperId));
    } else {
      setSelectedPapers([...selectedPapers, paperId]);
    }
  };
  
  // Generate literature review
  const generateLiteratureReview = async () => {
    if (selectedPapers.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No papers selected',
        description: 'Please select at least one paper to include in the review.',
      });
      return;
    }
    
    setGeneratingReview(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Get the selected papers' details
      const selectedPaperDetails = searchResults.filter(paper => 
        selectedPapers.includes(paper.id)
      );
      
      // Simulate generating a literature review - in a real app, this would be an AI call
      const review = {
        title: 'Literature Review: ' + cerTitle,
        date: new Date().toISOString(),
        searchCriteria: {
          term: searchTerm,
          database: searchType,
          dateRange: dateRange,
        },
        papers: selectedPaperDetails,
        content: `# Literature Review for ${cerTitle}\n\n## Introduction\nThis literature review examines the current state of evidence regarding ${searchTerm} based on ${selectedPaperDetails.length} selected publications from ${getSelectedDatabaseName()} published within ${getSelectedDateRangeLabel()}.\n\n## Methodology\nA systematic search was conducted using ${getSelectedDatabaseName()} with the search term "${searchTerm}". Studies were filtered by relevance and date (${getSelectedDateRangeLabel()}). From the search results, ${selectedPaperDetails.length} publications were selected for detailed review based on their relevance to the clinical evaluation.\n\n## Summary of Evidence\n${summarizePapers(selectedPaperDetails)}\n\n## Evidence Synthesis\nThe evidence collectively suggests that ${generateEvidenceSynthesis(selectedPaperDetails)}\n\n## Conclusion\nBased on the reviewed literature, ${generateConclusion(selectedPaperDetails)}`,
      };
      
      setLiteratureReview(review);
      
      toast({
        title: 'Review Generated',
        description: 'Literature review generated successfully.',
      });
    } catch (err) {
      console.error('Review generation error:', err);
      
      toast({
        variant: 'destructive',
        title: 'Generation failed',
        description: 'An error occurred while generating the review. Please try again.',
      });
    } finally {
      setGeneratingReview(false);
    }
  };
  
  // Add literature review to CER
  const addReviewToCER = () => {
    if (!literatureReview) return;
    
    if (onAddToCER) {
      onAddToCER({
        id: `lit-review-${Date.now()}`,
        title: 'Literature Appraisal & Synthesis',
        type: 'literature-review',
        content: literatureReview.content,
        sources: literatureReview.papers.map(p => p.id),
        metadata: {
          searchTerm: searchTerm,
          dateRange: getSelectedDateRangeLabel(),
          database: getSelectedDatabaseName(),
          papers: literatureReview.papers.length,
        },
      });
      
      // Reset the state
      setSearchTerm('');
      setSelectedPapers([]);
      setLiteratureReview(null);
    }
  };
  
  // Helper functions
  const getSelectedDatabaseName = () => {
    const db = databases.find(db => db.id === searchType);
    return db ? db.name : 'PubMed';
  };
  
  const getSelectedDateRangeLabel = () => {
    const range = dateRanges.find(r => r.id === dateRange);
    return range ? range.label : 'Last 5 years';
  };
  
  const summarizePapers = (papers) => {
    if (!papers || papers.length === 0) return '';
    
    return papers.map(paper => (
      `### ${paper.title}\n**Authors:** ${paper.authors}\n**Journal:** ${paper.journal}, ${paper.year}\n**Type:** ${paper.type}\n**Evidence Level:** ${paper.evidenceLevel}\n\n${paper.abstract}\n`
    )).join('\n');
  };
  
  const generateEvidenceSynthesis = (papers) => {
    if (!papers || papers.length === 0) return '';
    
    // In a real app, this would be AI-generated based on the papers
    return `the safety and efficacy profiles of the device are comparable to similar products in the market. The evidence from ${countPapersByType(papers, 'clinical-trial')} clinical trials and ${countPapersByType(papers, 'meta-analysis')} meta-analyses demonstrates acceptable performance characteristics and risk profiles within regulatory guidelines. Studies consistently report positive outcomes for the primary endpoints with adverse event rates within expected ranges. There appears to be consistency in the findings across different study types, strengthening the overall conclusions.`;
  };
  
  const generateConclusion = (papers) => {
    if (!papers || papers.length === 0) return '';
    
    // In a real app, this would be AI-generated based on the papers
    return `the clinical evidence supports the safety and performance claims for the device. The literature provides a reasonable assurance of safety and effectiveness for the intended use, supporting the benefit-risk assessment required for regulatory compliance. The quality of evidence is ${getOverallEvidenceLevel(papers)}, which meets the requirements specified in the EU MDR and ISO 14155 standards.`;
  };
  
  const countPapersByType = (papers, type) => {
    return papers.filter(p => p.type.toLowerCase() === type.toLowerCase()).length;
  };
  
  const getOverallEvidenceLevel = (papers) => {
    if (papers.some(p => p.evidenceLevel === 'High')) return 'high';
    if (papers.some(p => p.evidenceLevel === 'Moderate')) return 'moderate';
    return 'low';
  };
  
  const getEvidenceLevelBadge = (level) => {
    switch (level) {
      case 'High':
        return <Badge className="bg-green-100 text-green-800">High</Badge>;
      case 'Moderate':
        return <Badge className="bg-blue-100 text-blue-800">Moderate</Badge>;
      case 'Low':
        return <Badge className="bg-amber-100 text-amber-800">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  // Render search panel
  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search-term">Search Term</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-term"
              type="text"
              placeholder="Enter keyword, device name, or medical condition..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            For best results, use specific terms related to your device or indication
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Database</Label>
            <div className="grid grid-cols-3 gap-2">
              {databases.map(db => (
                <Button
                  key={db.id}
                  type="button"
                  variant={searchType === db.id ? 'default' : 'outline'}
                  onClick={() => setSearchType(db.id)}
                  className="justify-start">
                  <db.icon className="mr-2 h-4 w-4" />
                  {db.name}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Date Range</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a date range" />
              </SelectTrigger>
              <SelectContent>
                {dateRanges.map(range => (
                  <SelectItem key={range.id} value={range.id}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button 
          onClick={handleSearch} 
          disabled={isSearching || !searchTerm.trim()}
          className="w-full">
          {isSearching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Search Literature
            </>
          )}
        </Button>
      </div>
      
      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-medium">Search Results</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {searchResults.length} papers found
              </span>
              {selectedPapers.length > 0 && (
                <Badge variant="outline">
                  {selectedPapers.length} selected
                </Badge>
              )}
            </div>
          </div>
          
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {searchResults.map(paper => (
                <Card key={paper.id} className={selectedPapers.includes(paper.id) ? 'border-primary' : ''}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start space-x-2">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{paper.title}</CardTitle>
                        <CardDescription>
                          {paper.authors} • {paper.journal}, {paper.year} • Citations: {paper.citationCount}
                        </CardDescription>
                      </div>
                      <Checkbox 
                        checked={selectedPapers.includes(paper.id)}
                        onCheckedChange={() => togglePaperSelection(paper.id)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{paper.abstract}</p>
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-between">
                    <div className="flex gap-2">
                      <Badge variant="outline">{paper.type}</Badge>
                      {getEvidenceLevelBadge(paper.evidenceLevel)}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" /> {paper.year}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
          
          <div className="flex justify-end items-center gap-2">
            {selectedPapers.length > 0 ? (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedPapers([])}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear selection
                </Button>
                <Button 
                  onClick={generateLiteratureReview}
                  disabled={generatingReview}
                >
                  {generatingReview ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Generate Literature Review
                    </>
                  )}
                </Button>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">
                Select papers to include in your literature review
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Generated Literature Review */}
      {literatureReview && (
        <div className="space-y-4">
          <h3 className="text-base font-medium">Generated Literature Review</h3>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{literatureReview.title}</CardTitle>
              <CardDescription>
                {literatureReview.papers.length} papers • 
                {getSelectedDatabaseName()} • 
                {getSelectedDateRangeLabel()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-h-[200px] overflow-y-auto max-w-none">
                {literatureReview.content.split('\n').map((line, idx) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={idx} className="text-xl font-bold mt-4">{line.substring(2)}</h1>;
                  } else if (line.startsWith('## ')) {
                    return <h2 key={idx} className="text-lg font-semibold mt-3">{line.substring(3)}</h2>;
                  } else if (line.startsWith('### ')) {
                    return <h3 key={idx} className="text-base font-medium mt-2">{line.substring(4)}</h3>;
                  } else if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={idx} className="font-bold">{line.substring(2, line.length - 2)}</p>;
                  } else if (line.trim() === '') {
                    return <br key={idx} />;
                  } else {
                    return <p key={idx}>{line}</p>;
                  }
                })}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={addReviewToCER}>
                <Plus className="mr-2 h-4 w-4" />
                Add to CER
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}