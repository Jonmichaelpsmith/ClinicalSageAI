import React, { useState, useEffect, useRef } from 'react';
import { 
  searchPubMed, 
  searchLiterature, 
  generateCitations, 
  summarizePaper, 
  generateLiteratureReview, 
  analyzePaperPDF 
} from '@/services/LiteratureAPIService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, BookOpen, BookOpenCheck, BookmarkCheck, Check, Download, FileCheck, FileText, FileUp, Loader2, Plus, Search, Sparkles, Upload, Zap } from 'lucide-react';

/**
 * Literature Search Panel Component for CER Generator
 * 
 * Provides functionality to search PubMed and Google Scholar for literature related to a medical device,
 * select relevant papers, generate summaries, and create citations for integration into the CER.
 */
const LiteratureSearchPanel = ({ cerTitle, onAddToCER, deviceName = '', manufacturer = '' }) => {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  
  // Search state
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    yearFrom: new Date().getFullYear() - 10, // Default to last 10 years for medical devices
    yearTo: new Date().getFullYear(),
    journalType: '',
    relevanceFilter: 'high' // high, medium, all
  });
  const [searchSources, setSearchSources] = useState(['pubmed', 'googleScholar', 'clinicalTrials']);
  const [activeTab, setActiveTab] = useState('search'); // search, upload, review, generate
  
  // Results and selection state
  const [results, setResults] = useState([]);
  const [selectedPapers, setSelectedPapers] = useState([]);
  const [citations, setCitations] = useState('');
  const [generatedReview, setGeneratedReview] = useState(null);
  const [reviewOptions, setReviewOptions] = useState({
    format: 'comprehensive', // comprehensive, concise
    citationStyle: 'vancouverStyle',
    includeEvidenceGrading: true,
    conformToMeddev: true,
    standard: 'MEDDEV 2.7/1 Rev 4'
  });
  
  // Status flags
  const [isLoading, setIsLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  
  // Search for papers
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a search query.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Default search query based on device if query is empty
      const searchQuery = query.trim() || `${deviceName || 'medical device'} ${manufacturer || ''}`.trim();
      
      // Search both PubMed and Google Scholar
      const searchResults = await searchLiterature(searchQuery, searchSources, filters);
      
      setResults(searchResults);
      
      toast({
        title: 'Search Complete',
        description: `Found ${searchResults.length} results`,
        variant: 'default'
      });
      
    } catch (err) {
      console.error('Search failed:', err);
      setError(`Search failed: ${err.message}`);
      toast({
        title: 'Search Failed',
        description: err.message || 'Failed to search for papers',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Select or deselect a paper
  const togglePaperSelection = (paper) => {
    setSelectedPapers(prev => {
      const isPaperSelected = prev.some(p => p.id === paper.id);
      
      if (isPaperSelected) {
        return prev.filter(p => p.id !== paper.id);
      } else {
        return [...prev, paper];
      }
    });
  };
  
  // Generate Vancouver-style citations for selected papers
  const handleGenerateCitations = async () => {
    if (selectedPapers.length === 0) {
      setError('Please select at least one paper to generate citations.');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await generateCitations(selectedPapers, reviewOptions.citationStyle);
      setCitations(result.citations);
      
      toast({
        title: 'Citations Generated',
        description: `${selectedPapers.length} citations generated in ${reviewOptions.citationStyle}`,
        variant: 'default'
      });
      
    } catch (err) {
      console.error('Citation generation failed:', err);
      setError(`Citation generation failed: ${err.message}`);
      toast({
        title: 'Citation Generation Failed',
        description: err.message || 'Failed to generate citations',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Summarize a single paper
  const handleSummarizePaper = async (paper) => {
    setIsSummarizing(true);
    setError(null);
    
    try {
      const summary = await summarizePaper(paper);
      
      // Update the paper with its summary
      setResults(prev => 
        prev.map(p => 
          p.id === paper.id ? { ...p, summary: summary.summary } : p
        )
      );
      
      toast({
        title: 'Summary Generated',
        description: 'Paper summary generated successfully',
        variant: 'default'
      });
      
    } catch (err) {
      console.error('Summary generation failed:', err);
      setError(`Summary generation failed: ${err.message}`);
      toast({
        title: 'Summary Generation Failed',
        description: err.message || 'Failed to generate summary',
        variant: 'destructive'
      });
    } finally {
      setIsSummarizing(false);
    }
  };
  
  // Upload and analyze a PDF paper
  const handlePDFUpload = async (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    setUploadLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const result = await analyzePaperPDF(formData);
      
      // Add the analyzed paper to results and automatically select it
      const newPaper = {
        id: `uploaded-${Date.now()}`,
        title: result.title,
        authors: result.authors,
        journal: result.journal,
        year: result.year,
        abstract: result.abstract,
        keywords: result.keywords,
        fullText: result.fullText,
        doi: result.doi || '',
        pmid: result.pmid || '',
        source: 'upload'
      };
      
      setResults(prev => [newPaper, ...prev]);
      setSelectedPapers(prev => [...prev, newPaper]);
      
      toast({
        title: 'PDF Analyzed',
        description: 'Paper successfully analyzed and added to your selection',
        variant: 'default'
      });
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (err) {
      console.error('PDF analysis failed:', err);
      setError(`Failed to analyze PDF: ${err.message}`);
      toast({
        title: 'PDF Analysis Failed',
        description: err.message || 'Please try another file',
        variant: 'destructive'
      });
    } finally {
      setUploadLoading(false);
    }
  };
  
  // Generate MEDDEV 2.7/1 Rev 4 compliant literature review
  const handleGenerateMeddevReview = async () => {
    if (selectedPapers.length === 0) {
      setError('Please select at least one paper to generate a literature review.');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await generateLiteratureReview(
        selectedPapers, 
        {
          deviceName: deviceName || 'medical device',
          manufacturer: manufacturer || '',
          ...reviewOptions
        }
      );
      
      setGeneratedReview(result);
      
      toast({
        title: 'Literature Review Generated',
        description: `MEDDEV 2.7/1 Rev 4 compliant review generated from ${selectedPapers.length} papers`,
        variant: 'default'
      });
      
    } catch (err) {
      console.error('Review generation failed:', err);
      setError(`Review generation failed: ${err.message}`);
      toast({
        title: 'Review Generation Failed',
        description: err.message || 'Failed to generate literature review',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Add the generated review to the CER
  const handleAddToCER = () => {
    if (!generatedReview) {
      setError('Please generate a literature review first.');
      return;
    }
    
    if (onAddToCER) {
      onAddToCER({
        title: 'Literature Review',
        content: generatedReview.review,
        citations: citations,
        papers: selectedPapers
      });
      
      toast({
        title: 'Added to CER',
        description: 'Literature review successfully added to your CER document',
        variant: 'default'
      });
    }
  };
  
  return (
    <div className="space-y-6 p-4 border rounded-md bg-white">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Proxima CRO Literature AI</h2>
          <p className="text-sm text-gray-500">Generate MEDDEV 2.7/1 Rev 4 compliant literature reviews for your Clinical Evaluation Report</p>
        </div>
        <Badge variant="outline" className="px-2 py-1 border-blue-200 bg-blue-50 text-blue-700">
          MEDDEV 2.7/1 Rev 4
        </Badge>
      </div>
      
      <Tabs defaultValue="search" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search" className="flex items-center gap-1">
            <Search className="h-4 w-4" /> Search Literature
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-1">
            <Upload className="h-4 w-4" /> Upload Papers
          </TabsTrigger>
          <TabsTrigger value="review" className="flex items-center gap-1">
            <FileCheck className="h-4 w-4" /> Generate Review
          </TabsTrigger>
        </TabsList>

        {error && (
          <div className="p-3 mt-4 text-sm bg-red-50 border border-red-200 text-red-600 rounded">
            {error}
          </div>
        )}
        
        <TabsContent value="search">
          <form onSubmit={handleSearch} className="space-y-5 p-4 border rounded-lg bg-gray-50">
            <div>
              <label className="block text-sm font-medium mb-1">Search Query</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={cerTitle || "Enter search terms"}
                  className="flex-1 p-2 border rounded"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Search
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Year Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.yearFrom}
                    onChange={(e) => setFilters({...filters, yearFrom: parseInt(e.target.value)})}
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-24 p-2 border rounded"
                  />
                  <span className="self-center">to</span>
                  <input
                    type="number"
                    value={filters.yearTo}
                    onChange={(e) => setFilters({...filters, yearTo: parseInt(e.target.value)})}
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-24 p-2 border rounded"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Relevance Filter</label>
                <select
                  value={filters.relevanceFilter}
                  onChange={(e) => setFilters({...filters, relevanceFilter: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="high">High Relevance Only</option>
                  <option value="medium">Medium & High Relevance</option>
                  <option value="all">All Results</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Search Sources</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSearchSources(prev => 
                    prev.includes('pubmed') ? prev.filter(s => s !== 'pubmed') : [...prev, 'pubmed']
                  )}
                  className={`px-3 py-1 text-sm border rounded-full ${
                    searchSources.includes('pubmed') 
                      ? 'bg-blue-100 border-blue-300 text-blue-800' 
                      : 'bg-gray-100 border-gray-300 text-gray-800'
                  }`}
                >
                  PubMed
                </button>
                <button
                  type="button"
                  onClick={() => setSearchSources(prev => 
                    prev.includes('googleScholar') ? prev.filter(s => s !== 'googleScholar') : [...prev, 'googleScholar']
                  )}
                  className={`px-3 py-1 text-sm border rounded-full ${
                    searchSources.includes('googleScholar') 
                      ? 'bg-blue-100 border-blue-300 text-blue-800' 
                      : 'bg-gray-100 border-gray-300 text-gray-800'
                  }`}
                >
                  Google Scholar
                </button>
                <button
                  type="button"
                  onClick={() => setSearchSources(prev => 
                    prev.includes('clinicalTrials') ? prev.filter(s => s !== 'clinicalTrials') : [...prev, 'clinicalTrials']
                  )}
                  className={`px-3 py-1 text-sm border rounded-full ${
                    searchSources.includes('clinicalTrials') 
                      ? 'bg-blue-100 border-blue-300 text-blue-800' 
                      : 'bg-gray-100 border-gray-300 text-gray-800'
                  }`}
                >
                  ClinicalTrials.gov
                </button>
              </div>
            </div>
          </form>
          
          {/* Search Results */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Search Results ({results.length})</h3>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Selected: {selectedPapers.length}
                </Badge>
                <button
                  onClick={handleGenerateCitations}
                  disabled={selectedPapers.length === 0 || isGenerating}
                  className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                >
                  {isGenerating ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <FileText className="h-3 w-3" />
                  )}
                  Generate Citations
                </button>
              </div>
            </div>
            
            {results.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto p-2">
                {results.map((paper) => {
                  const isSelected = selectedPapers.some(p => p.id === paper.id);
                  
                  return (
                    <div 
                      key={paper.id} 
                      className={`p-4 border rounded transition-colors ${
                        isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-blue-200'
                      }`}
                    >
                      <div className="flex justify-between">
                        <h4 className="font-medium">{paper.title}</h4>
                        <button
                          onClick={() => togglePaperSelection(paper)}
                          className={`p-1 rounded-full ${
                            isSelected ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'
                          }`}
                        >
                          {isSelected ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <Plus className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      
                      <div className="text-sm text-gray-500 mt-1">
                        {paper.authors} • {paper.journal} • {paper.year}
                      </div>
                      
                      <p className="text-sm mt-2">{paper.abstract?.substring(0, 200)}...</p>
                      
                      <div className="flex gap-2 mt-3">
                        <Badge variant="outline" className="text-xs">
                          {paper.source}
                        </Badge>
                        {paper.doi && (
                          <Badge variant="outline" className="text-xs">
                            DOI: {paper.doi}
                          </Badge>
                        )}
                        {paper.pmid && (
                          <Badge variant="outline" className="text-xs">
                            PMID: {paper.pmid}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleSummarizePaper(paper)}
                          disabled={isSummarizing}
                          className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 disabled:opacity-50 flex items-center gap-1"
                        >
                          {isSummarizing ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Sparkles className="h-3 w-3" />
                          )}
                          Summarize
                        </button>
                        {paper.fullTextUrl && (
                          <a
                            href={paper.fullTextUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-2 py-1 bg-gray-50 text-gray-700 border border-gray-200 rounded hover:bg-gray-100 flex items-center gap-1"
                          >
                            <FileText className="h-3 w-3" />
                            View Full Text
                          </a>
                        )}
                      </div>
                      
                      {paper.summary && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded text-sm">
                          <div className="font-medium text-blue-800 mb-1">AI Summary</div>
                          {paper.summary}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              !isLoading && (
                <div className="text-center p-8 border rounded bg-gray-50">
                  <BookOpen className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Search for papers or upload your own to begin</p>
                </div>
              )
            )}
          </div>
          
          {/* Citations Display */}
          {citations && (
            <div className="mt-6 p-4 border rounded bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium">Generated Citations</h3>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(citations);
                    toast({
                      title: 'Citations Copied',
                      description: 'Citations copied to clipboard',
                      variant: 'default'
                    });
                  }}
                  className="text-sm px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex items-center gap-1"
                >
                  <FileText className="h-3 w-3" />
                  Copy All
                </button>
              </div>
              <div className="p-3 bg-white border rounded font-mono text-sm whitespace-pre-line">
                {citations}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="upload">
          <div className="p-6 border rounded-lg bg-gray-50 text-center">
            <div className="mb-4">
              <BookOpenCheck className="h-12 w-12 text-blue-600 mx-auto mb-2" />
              <h3 className="text-lg font-medium">Upload Research Papers</h3>
              <p className="text-sm text-gray-600 mb-6">Upload PDF papers to analyze and include in your literature review</p>
            </div>
            
            <div className="mb-6">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePDFUpload}
                accept=".pdf"
                className="hidden"
                id="pdf-upload"
              />
              <label
                htmlFor="pdf-upload"
                className={`
                  flex flex-col items-center justify-center w-full h-36 px-4 transition 
                  border-2 border-dashed rounded-lg cursor-pointer
                  ${uploadLoading ? 'bg-gray-100 border-gray-300' : 'bg-white border-blue-300 hover:bg-blue-50'}
                `}
              >
                {uploadLoading ? (
                  <>
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
                    <p className="text-sm text-gray-500">Analyzing paper...</p>
                  </>
                ) : (
                  <>
                    <FileUp className="h-8 w-8 text-blue-500 mb-2" />
                    <p className="text-sm text-gray-700">Click to upload a PDF paper</p>
                    <p className="text-xs text-gray-500 mt-1">PDF files only, max 10MB</p>
                  </>
                )}
              </label>
            </div>
            
            <div className="text-center">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Currently Selected Papers: {selectedPapers.length}</h4>
              <button
                onClick={() => setActiveTab('search')}
                className="text-sm px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 mx-auto"
              >
                <Search className="h-4 w-4" />
                View Selected Papers
              </button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="review">
          <div className="space-y-6 p-6 border rounded-lg bg-gray-50">
            <div className="text-center mb-6">
              <BookmarkCheck className="h-12 w-12 text-blue-600 mx-auto mb-2" />
              <h3 className="text-lg font-medium">Generate MEDDEV Compliant Literature Review</h3>
              <p className="text-sm text-gray-600">
                Create a comprehensive literature review that meets MEDDEV 2.7/1 Rev 4 requirements
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Review Format</label>
                <select
                  value={reviewOptions.format}
                  onChange={(e) => setReviewOptions({...reviewOptions, format: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="comprehensive">Comprehensive (Full Details)</option>
                  <option value="concise">Concise (Summarized)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Citation Style</label>
                <select
                  value={reviewOptions.citationStyle}
                  onChange={(e) => setReviewOptions({...reviewOptions, citationStyle: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="vancouverStyle">Vancouver Style</option>
                  <option value="apa">APA Style</option>
                  <option value="mla">MLA Style</option>
                </select>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 mb-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="evidence-grading"
                  checked={reviewOptions.includeEvidenceGrading}
                  onChange={(e) => setReviewOptions({...reviewOptions, includeEvidenceGrading: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="evidence-grading" className="text-sm">
                  Include evidence grading for each reference
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="conform-meddev"
                  checked={reviewOptions.conformToMeddev}
                  onChange={(e) => setReviewOptions({...reviewOptions, conformToMeddev: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="conform-meddev" className="text-sm">
                  Ensure compliance with MEDDEV 2.7/1 Rev 4 standard
                </label>
              </div>
            </div>
            
            <div className="flex flex-col gap-4 items-center">
              <div className="text-center w-full">
                <p className="text-sm text-gray-700 mb-2">
                  Selected Papers: {selectedPapers.length}/5 Minimum
                </p>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-2 ${selectedPapers.length >= 5 ? 'bg-green-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(100, (selectedPapers.length / 5) * 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveTab('search')}
                  className="text-sm px-4 py-2 border border-blue-300 text-blue-700 bg-white rounded hover:bg-blue-50"
                >
                  Select More Papers
                </button>
                
                <button
                  onClick={handleGenerateMeddevReview}
                  disabled={selectedPapers.length < 1 || isGenerating}
                  className="text-sm px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Generate Literature Review
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {generatedReview && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium">Generated Literature Review</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedReview.review);
                        toast({
                          title: 'Review Copied',
                          description: 'Literature review copied to clipboard',
                          variant: 'default'
                        });
                      }}
                      className="text-sm px-3 py-1 border border-gray-300 bg-white rounded hover:bg-gray-50 flex items-center gap-1"
                    >
                      <FileText className="h-3 w-3" />
                      Copy
                    </button>
                    
                    <button
                      onClick={handleAddToCER}
                      className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                    >
                      <Check className="h-3 w-3" />
                      Add to CER
                    </button>
                  </div>
                </div>
                
                <div className="border rounded bg-white p-4 max-h-96 overflow-y-auto prose prose-sm">
                  <div dangerouslySetInnerHTML={{ __html: generatedReview.review.replace(/\n/g, '<br />') }} />
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LiteratureSearchPanel;