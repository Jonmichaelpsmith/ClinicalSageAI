import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import PredicateDeviceComparison from './PredicateDeviceComparison';
import {
  Search,
  Filter,
  Calendar,
  FileText,
  Plus,
  Check,
  X,
  ExternalLink,
  Clock,
  Upload,
  Trash,
  BookOpen,
  GraduationCap,
  Beaker,
  Database,
  FileCheck,
  FileWarning,
  Layers,
  Shield
} from 'lucide-react';

export default function LitReviewPanel({ 
  deviceProfile = {}, 
  deviceName = '',
  manufacturer = '',
  cerTitle = '',
  onAddSection = () => {} 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [deviceDescription, setDeviceDescription] = useState('');
  const [currentTab, setCurrentTab] = useState('search');
  const [searchType, setSearchType] = useState('literature'); // 'literature' or 'predicates'
  const [searchResults, setSearchResults] = useState([]);
  const [predicateResults, setPredicateResults] = useState([]);
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [selectedPredicates, setSelectedPredicates] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchingPredicates, setSearchingPredicates] = useState(false);
  const [generatingReview, setGeneratingReview] = useState(false);
  const [reviewGenerated, setReviewGenerated] = useState(false);
  const [filters, setFilters] = useState({
    yearStart: 2020,
    yearEnd: 2025,
    peerReviewedOnly: true,
    fullTextAvailable: true,
    includePreprints: false,
    keywordFilters: ['efficacy', 'safety', 'clinical trial']
  });

  // Handle switching between literature search and predicate search
  const handleSearchTypeChange = (type) => {
    setSearchType(type);
    setSearchResults([]);
    setPredicateResults([]);
  };

  // Real API call for literature search
  const handleSearch = async () => {
    if (searchType === 'predicates') {
      handlePredicateSearch();
      return;
    }
    
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    setSearchResults([]);
    
    try {
      // Prepare filter object based on UI settings
      const apiFilters = {
        yearStart: filters.yearStart,
        yearEnd: filters.yearEnd,
        peerReviewedOnly: filters.peerReviewedOnly,
        fullTextAvailable: filters.fullTextAvailable,
        includePreprints: filters.includePreprints,
        keywords: filters.keywordFilters
      };
      
      // Import the API functions
      const literatureApi = await import('../../api/cer');
      
      // Try the unified discovery service first
      console.log('Attempting to use unified discovery service...');
      try {
        const unifiedResults = await literatureApi.searchUnifiedLiterature(searchQuery, {
          limit: 15,
          module: 'cer'
        });
        
        // If the unified endpoint returns results, use them
        if (unifiedResults && unifiedResults.length > 0) {
          console.log('Using results from unified discovery service:', unifiedResults);
          setSearchResults(unifiedResults);
          setSearching(false);
          return;
        }
      } catch (unifiedError) {
        console.warn('Unified discovery service error:', unifiedError);
        // Continue with fallback options
      }
      
      // Fallback: Try the combined literature search endpoint
      console.log('Falling back to combined literature search endpoint...');
      try {
        const results = await literatureApi.searchLiterature(searchQuery, apiFilters);
        
        // If the combined endpoint returns results, use them
        if (results && results.length > 0) {
          console.log('Using results from combined literature search:', results);
          setSearchResults(results);
          setSearching(false);
          return;
        }
      } catch (combinedError) {
        console.warn('Combined literature search error:', combinedError);
        // Continue with individual source endpoints
      }
      
      // Last resort: Try individual source endpoints and combine results
      console.log('Trying individual source endpoints...');
      const [pubmedResults, ieeeResults] = await Promise.all([
        literatureApi.searchPubMed(searchQuery, apiFilters).catch(err => {
          console.warn('PubMed search error:', err);
          return [];
        }),
        literatureApi.searchIEEE(searchQuery, apiFilters).catch(err => {
          console.warn('IEEE search error:', err);
          return [];
        })
      ]);
      
      // Combine and deduplicate results by ID
      const combinedResults = [...pubmedResults, ...ieeeResults];
      const uniqueResults = combinedResults.filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
      );
      
      console.log('Using combined individual source results:', uniqueResults);
      setSearchResults(uniqueResults);
    } catch (error) {
      console.error('Error searching literature:', error);
      // Show error in UI
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred during search';
      // In a real app, we would show this error to the user in a toast or alert
      console.error(errorMessage);
    } finally {
      setSearching(false);
    }
  };
  
  // Handle predicate device search using the unified discovery service
  const handlePredicateSearch = async () => {
    if (!deviceDescription.trim()) return;
    
    setSearchingPredicates(true);
    setPredicateResults([]);
    setSearchResults([]); // Clear search results when searching for predicates
    
    try {
      // Import the API functions
      const cerApi = await import('../../api/cer');
      
      console.log('Searching for predicate devices...');
      const predicates = await cerApi.findPredicateDevices(deviceDescription, {
        limit: 10,
        module: 'cer' // Use 'cer' module format
      });
      
      console.log('Predicate device search results:', predicates);
      setPredicateResults(predicates);
      setSearchResults(predicates); // Set search results to show in UI
    } catch (error) {
      console.error('Error searching for predicate devices:', error);
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred during predicate search';
      console.error(errorMessage);
    } finally {
      setSearchingPredicates(false);
    }
  };

  const toggleArticleSelection = (article) => {
    // Add check to see if we're in predicate search mode
    if (searchType === 'predicates') {
      // Handle predicate device selection
      if (selectedPredicates.some(p => p.id === article.id)) {
        setSelectedPredicates(selectedPredicates.filter(p => p.id !== article.id));
      } else {
        setSelectedPredicates([...selectedPredicates, article]);
        // Show visual confirmation
        console.log('Predicate device selected:', article.title || article.name);
      }
    } else {
      // Handle literature selection
      if (selectedArticles.some(a => a.id === article.id)) {
        setSelectedArticles(selectedArticles.filter(a => a.id !== article.id));
      } else {
        setSelectedArticles([...selectedArticles, article]);
        // Show visual confirmation
        console.log('Literature article selected:', article.title);
      }
    }
  };
  
  const togglePredicateSelection = (predicate) => {
    if (selectedPredicates.some(p => p.id === predicate.id)) {
      setSelectedPredicates(selectedPredicates.filter(p => p.id !== predicate.id));
    } else {
      setSelectedPredicates([...selectedPredicates, predicate]);
      // Show visual confirmation
      console.log('Predicate device selected:', predicate.title || predicate.name);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value
    });
  };

  const handleKeywordAdd = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      const newKeyword = e.target.value.trim();
      if (!filters.keywordFilters.includes(newKeyword)) {
        setFilters({
          ...filters,
          keywordFilters: [...filters.keywordFilters, newKeyword]
        });
        e.target.value = '';
      }
    }
  };

  const removeKeywordFilter = (keyword) => {
    setFilters({
      ...filters,
      keywordFilters: filters.keywordFilters.filter(k => k !== keyword)
    });
  };

  const uploadPaperHandler = () => {
    // Trigger file upload dialog
    document.getElementById('paper-upload').click();
  };

  const handleFileUpload = async (e) => {
    if (e.target.files.length > 0) {
      try {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);
        
        // Show uploading state
        const tempArticle = {
          id: `uploading-${Date.now()}`,
          title: `Uploading: ${file.name}...`,
          authors: 'Processing...',
          journal: 'User Upload',
          year: new Date().getFullYear(),
          abstract: 'Upload in progress. The document is being processed and analyzed.',
          keywords: ['user upload'],
          citationCount: 0,
          fullTextAvailable: true,
          peerReviewed: false,
          isUpload: true,
          uploading: true
        };
        
        setSelectedArticles([...selectedArticles, tempArticle]);
        
        // Upload to server and process the document
        const response = await fetch('/api/cer/upload-literature', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
        }
        
        const processedArticle = await response.json();
        
        // Replace the temporary uploading article with the processed one
        setSelectedArticles(prev => prev.map(article => 
          article.id === tempArticle.id ? {
            ...processedArticle,
            isUpload: true
          } : article
        ));
        
        // Reset file input
        e.target.value = '';
        
        // Switch to selected tab
        setCurrentTab('selected');
      } catch (error) {
        console.error('Error uploading literature:', error);
        
        // Remove the temporary uploading article and show error
        setSelectedArticles(prev => prev.filter(article => !article.uploading));
        
        // In a real app, show an error toast to the user
        console.error('Failed to process uploaded document');
        
        // Reset file input
        e.target.value = '';
      }
    }
  };

  const handleClearSelections = async () => {
    if (confirm('Are you sure you want to clear all selected literature?')) {
      try {
        // Clear from state first for immediate UI response
        setSelectedArticles([]);
        
        // Then clear from server/database
        const cerProjectId = localStorage.getItem('currentCerProjectId');
        if (cerProjectId) {
          // Import the API functions
          const cerApi = await import('../../api/cer');
          
          // Clear the literature selection on the server
          await cerApi.saveLiteratureSelection(cerProjectId, []);
        }
      } catch (error) {
        console.error('Error clearing literature selections:', error);
      }
    }
  };
  
  // Save selected articles to the server
  const handleSaveSelections = async () => {
    try {
      const cerProjectId = localStorage.getItem('currentCerProjectId');
      if (!cerProjectId) {
        alert('No active CER project found. Please create or select a project first.');
        return false;
      }
      
      if (selectedArticles.length === 0) {
        alert('Please select at least one article to save.');
        return false;
      }
      
      // Import the API functions
      const cerApi = await import('../../api/cer');
      
      // Save the selected literature to the server
      await cerApi.saveLiteratureSelection(cerProjectId, selectedArticles);
      
      // Show success message to user
      console.log('Literature selections saved successfully');
      
      return true;
    } catch (error) {
      console.error('Error saving literature selections:', error);
      alert(`Error saving selections: ${error.message}`);
      return false;
    }
  };
  
  // Generate a literature review from the selected articles
  const handleGenerateLiteratureReview = async () => {
    try {
      // First save the current selections
      const saveResult = await handleSaveSelections();
      if (!saveResult) {
        return; // Don't proceed if saving failed
      }
      
      const cerProjectId = localStorage.getItem('currentCerProjectId');
      if (!cerProjectId) {
        alert('No active CER project found. Please create or select a project first.');
        return;
      }
      
      if (selectedArticles.length < 3) {
        alert('Please select at least 3 articles for a comprehensive literature review.');
        return;
      }
      
      // Show generating state
      setGeneratingReview(true);
      
      // Import the necessary services and API functions
      const [cerApi, cerComplianceService] = await Promise.all([
        import('../../api/cer'),
        import('../../services/CerComplianceService')
      ]);
      
      // Call the API to generate literature review
      const response = await fetch('/api/cer/generate-literature-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cerProjectId,
          deviceName: deviceName || (deviceProfile?.deviceName || ''),
          manufacturer: manufacturer || (deviceProfile?.manufacturer || ''),
          articleIds: selectedArticles.map(article => article.id)
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate review: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Validate the generated review for compliance
      const validationResults = await cerComplianceService.default.validateLiteratureReview(
        result.review,
        selectedArticles,
        deviceName || (deviceProfile?.deviceName || 'Device')
      );
      
      // Show success state
      setGeneratingReview(false);
      setReviewGenerated(true);
      
      // Check for critical compliance issues
      if (validationResults.criticalIssues && validationResults.criticalIssues.length > 0) {
        const issueMessages = validationResults.criticalIssues.map(issue => `- ${issue.message}`).join('\n');
        
        const proceed = window.confirm(
          `Warning: The generated literature review has critical compliance issues:\n\n${issueMessages}\n\nDo you want to continue anyway?`
        );
        
        if (!proceed) {
          return false;
        }
      }
      
      // Add compliance metadata to the review
      result.review.complianceStatus = {
        complianceScore: validationResults.complianceScore || 0,
        valid: validationResults.valid || false,
        passedChecks: validationResults.passedChecks || [],
        failedChecks: validationResults.failedChecks || [],
        issueCount: {
          critical: validationResults.criticalIssues?.length || 0,
          major: validationResults.majorIssues?.length || 0,
          minor: validationResults.minorIssues?.length || 0
        },
        validatedAt: new Date().toISOString()
      };
      
      // Save the generated and validated review to the CER project
      await cerApi.saveGeneratedLiteratureReview(cerProjectId, result.review);
      
      // Add the review as a section to the CER document using the callback
      if (onAddSection && typeof onAddSection === 'function') {
        const newSection = {
          id: `lit-review-${Date.now()}`,
          title: 'Literature Review',
          type: 'literature-review',
          content: result.review.content,
          metadata: {
            articleCount: selectedArticles.length,
            articleIds: selectedArticles.map(article => article.id),
            generatedAt: new Date().toISOString(),
            complianceStatus: result.review.complianceStatus
          }
        };
        
        onAddSection(newSection);
      }
      
      // Show appropriate success message based on compliance
      if (validationResults.valid) {
        alert(`Literature review generated and added to your CER! Compliance score: ${validationResults.complianceScore}%`);
      } else {
        alert(`Literature review generated with compliance warnings (Score: ${validationResults.complianceScore}%). Review the regulatory compliance section for details.`);
      }
      
      return true;
    } catch (error) {
      console.error('Error generating literature review:', error);
      setGeneratingReview(false);
      
      // Show error message
      alert(`Error generating literature review: ${error.message}`);
      
      return false;
    }
  };

  const getSourceIcon = (article) => {
    if (article.isUpload) return <Upload className="h-4 w-4 text-purple-500" />;
    if (!article.peerReviewed) return <FileWarning className="h-4 w-4 text-yellow-500" />;
    
    const journal = article.journal.toLowerCase();
    if (journal.includes('nature') || journal.includes('science') || journal.includes('cell') || journal.includes('nejm')) {
      return <GraduationCap className="h-4 w-4 text-indigo-600" />;
    } else if (journal.includes('clinical') || journal.includes('medicine') || journal.includes('medical') || journal.includes('therapeutic')) {
      return <Beaker className="h-4 w-4 text-blue-600" />;
    } else if (journal.includes('review') || journal.includes('meta')) {
      return <Database className="h-4 w-4 text-emerald-600" />;
    }
    
    return <FileCheck className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-blue-600" />
              Literature Review
            </h3>
            <div className="mt-2 sm:mt-0 flex space-x-2">
              <Badge variant="outline" className="flex items-center">
                <Clock className="mr-1 h-3 w-3" />
                <span>{selectedArticles.length} publications selected</span>
              </Badge>
              {selectedArticles.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleClearSelections}>
                  <Trash className="mr-1 h-3 w-3" />
                  Clear
                </Button>
              )}
            </div>
          </div>
          
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="search" className="flex items-center">
                <Search className="mr-2 h-4 w-4" />
                Search
              </TabsTrigger>
              <TabsTrigger value="selected" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Selected ({selectedArticles.length})
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center">
                <Upload className="mr-2 h-4 w-4" />
                Upload Paper
              </TabsTrigger>
              <TabsTrigger value="compare" className="flex items-center">
                <Layers className="mr-2 h-4 w-4" />
                Compare
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="search">
              <div className="space-y-4">
                {/* Search Type Toggle */}
                <div className="flex items-center justify-center bg-gray-50 rounded-md p-1 max-w-sm mx-auto">
                  <Button
                    type="button"
                    variant={searchType === 'literature' ? "default" : "ghost"}
                    size="sm"
                    className={`flex-1 ${searchType === 'literature' ? '' : 'hover:bg-gray-100'}`}
                    onClick={() => handleSearchTypeChange('literature')}
                  >
                    <BookOpen className="h-4 w-4 mr-2" /> Literature
                  </Button>
                  <Button
                    type="button"
                    variant={searchType === 'predicates' ? "default" : "ghost"}
                    size="sm"
                    className={`flex-1 ${searchType === 'predicates' ? '' : 'hover:bg-gray-100'}`}
                    onClick={() => handleSearchTypeChange('predicates')}
                  >
                    <Layers className="h-4 w-4 mr-2" /> Predicate Devices
                  </Button>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="w-full sm:w-3/4">
                    {searchType === 'literature' ? (
                      <>
                        <div className="flex space-x-2">
                          <div className="relative flex-grow">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                              placeholder="Search for relevant literature..."
                              className="pl-9"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                          </div>
                          <Button onClick={handleSearch} disabled={searching}>
                            {searching ? 'Searching...' : 'Search'}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Search PubMed, Google Scholar, and other scientific databases
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex space-x-2">
                          <div className="relative flex-grow">
                            <Shield className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                              placeholder="Describe the device to find predicates..."
                              className="pl-9"
                              value={deviceDescription}
                              onChange={(e) => setDeviceDescription(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handlePredicateSearch()}
                            />
                          </div>
                          <Button onClick={handlePredicateSearch} disabled={searchingPredicates}>
                            {searchingPredicates ? 'Searching...' : 'Search'}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Search for similar predicate devices for 510(k) submissions
                        </p>
                      </>
                    )}
                  </div>
                  
                  <div className="w-full sm:w-1/4">
                    <div className="flex items-center p-2 border rounded-md">
                      <Filter className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm font-medium">
                        {searchType === 'literature' 
                          ? `Filters: ${Object.values(filters).flat().filter(Boolean).length}`
                          : 'FDA Cleared Devices'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Literature Search Progress */}
                {searching && searchType === 'literature' && (
                  <div className="py-8 text-center">
                    <p className="text-sm text-gray-500 mb-2">Searching multiple databases...</p>
                    <Progress value={65} className="max-w-md mx-auto" />
                  </div>
                )}
                
                {/* Predicate Device Search Progress */}
                {searchingPredicates && searchType === 'predicates' && (
                  <div className="py-8 text-center">
                    <p className="text-sm text-gray-500 mb-2">Searching for predicate devices in FDA database...</p>
                    <Progress value={65} className="max-w-md mx-auto" />
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-1">
                    <Card>
                      <CardContent className="p-4">
                        {searchType === 'literature' ? (
                          /* Literature Filter Options */
                          <div className="space-y-4">
                            <h4 className="font-medium text-sm mb-3">Filter Literature</h4>
                            
                            <div>
                              <Label className="text-xs">Publication Year Range</Label>
                              <div className="flex items-center space-x-2 mt-1">
                                <Input
                                  type="number"
                                  min="1900"
                                  max="2030"
                                  value={filters.yearStart}
                                  onChange={(e) => handleFilterChange('yearStart', parseInt(e.target.value))}
                                  className="w-24"
                                />
                                <span>to</span>
                                <Input
                                  type="number"
                                  min="1900"
                                  max="2030"
                                  value={filters.yearEnd}
                                  onChange={(e) => handleFilterChange('yearEnd', parseInt(e.target.value))}
                                  className="w-24"
                                />
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="peer-reviewed" className="text-xs">Peer-Reviewed Only</Label>
                                <Switch
                                  id="peer-reviewed"
                                  checked={filters.peerReviewedOnly}
                                  onCheckedChange={(checked) => handleFilterChange('peerReviewedOnly', checked)}
                                />
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <Label htmlFor="full-text" className="text-xs">Full Text Available</Label>
                                <Switch
                                  id="full-text"
                                  checked={filters.fullTextAvailable}
                                  onCheckedChange={(checked) => handleFilterChange('fullTextAvailable', checked)}
                                />
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <Label htmlFor="preprints" className="text-xs">Include Preprints</Label>
                                <Switch
                                  id="preprints"
                                  checked={filters.includePreprints}
                                  onCheckedChange={(checked) => handleFilterChange('includePreprints', checked)}
                                />
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div>
                              <Label className="text-xs">Keyword Filters</Label>
                              <Input
                                placeholder="Add keyword and press Enter"
                                onKeyPress={handleKeywordAdd}
                                className="mt-1"
                              />
                              <div className="flex flex-wrap gap-1 mt-2">
                                {filters.keywordFilters.map(keyword => (
                                  <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
                                    {keyword}
                                    <X
                                      className="h-3 w-3 cursor-pointer"
                                      onClick={() => removeKeywordFilter(keyword)}
                                    />
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Predicate Device Filter Options */
                          <div className="space-y-4">
                            <h4 className="font-medium text-sm mb-3">Predicate Device Filters</h4>
                            
                            <div>
                              <Label className="text-xs">Device Characteristics</Label>
                              <div className="mt-2 space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Switch id="fda-cleared" checked={true} disabled />
                                  <Label htmlFor="fda-cleared" className="text-xs">FDA Cleared Devices</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Switch id="same-classification" checked={true} disabled />
                                  <Label htmlFor="same-classification" className="text-xs">Same Classification</Label>
                                </div>
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div>
                              <Label className="text-xs">Clearance Year Range</Label>
                              <div className="flex items-center space-x-2 mt-1">
                                <Input
                                  type="number"
                                  min="1976"
                                  max="2030"
                                  value="2010"
                                  disabled
                                  className="w-24"
                                />
                                <span>to</span>
                                <Input
                                  type="number"
                                  min="1976" 
                                  max="2030"
                                  value="2025"
                                  disabled
                                  className="w-24"
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-1">Filters auto-applied for relevance</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-4">
                          <Button variant="outline" size="sm" className="w-full" onClick={() => handleSearch()}>
                            Apply Filters
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="md:col-span-3">
                    {searchResults.length === 0 && !searching ? (
                      <div className="text-center py-12 border rounded-md">
                        <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-700 mb-1">No search results yet</h3>
                        <p className="text-gray-500">
                          Enter search terms or try different filters to find relevant literature
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {searchResults.map(article => (
                          <Card key={article.id} className={`transition-all ${
                            selectedArticles.some(a => a.id === article.id) ? 'border-blue-500 bg-blue-50' : ''
                          }`}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center mb-1 gap-2">
                                    {getSourceIcon(article)}
                                    <Badge variant="outline" className="text-xs">
                                      {article.journal}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs bg-blue-50">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      {article.year}
                                    </Badge>
                                    {article.citationCount > 0 && (
                                      <Badge variant="outline" className="text-xs bg-amber-50">
                                        {article.citationCount} citations
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <h4 className="font-medium text-base mb-1">{article.title}</h4>
                                  <p className="text-sm text-gray-600 mb-2">{article.authors}</p>
                                  
                                  <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                                    {article.abstract}
                                  </p>
                                  
                                  <div className="flex flex-wrap gap-1">
                                    {article.keywords.map(keyword => (
                                      <Badge key={keyword} variant="secondary" className="text-xs">
                                        {keyword}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="flex items-center ml-4">
                                  <Button
                                    variant={selectedArticles.some(a => a.id === article.id) ? "default" : "outline"}
                                    size="sm"
                                    className="min-w-24"
                                    onClick={() => toggleArticleSelection(article)}
                                  >
                                    {selectedArticles.some(a => a.id === article.id) ? (
                                      <>
                                        <Check className="mr-1 h-4 w-4" />
                                        Selected
                                      </>
                                    ) : (
                                      <>
                                        <Plus className="mr-1 h-4 w-4" />
                                        Select
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-center mt-3 pt-2 border-t">
                                <div className="flex space-x-2">
                                  <Badge variant={article.fullTextAvailable ? 'success' : 'outline'} className="text-xs">
                                    {article.fullTextAvailable ? 'Full Text Available' : 'Abstract Only'}
                                  </Badge>
                                  <Badge variant={article.peerReviewed ? 'success' : 'warning'} className="text-xs">
                                    {article.peerReviewed ? 'Peer Reviewed' : 'Preprint'}
                                  </Badge>
                                </div>
                                <Button variant="ghost" size="sm">
                                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                  View Source
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="selected">
              {selectedArticles.length === 0 ? (
                <div className="text-center py-12 border rounded-md">
                  <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-700 mb-1">No literature selected yet</h3>
                  <p className="text-gray-500 mb-3">
                    Search for and select relevant articles for your clinical evaluation
                  </p>
                  <Button onClick={() => setCurrentTab('search')}>
                    <Search className="mr-2 h-4 w-4" />
                    Search Literature
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Selected Literature ({selectedArticles.length})</h4>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setCurrentTab('search')}>
                        <Plus className="mr-1 h-4 w-4" />
                        Add More
                      </Button>
                      <Button variant="destructive" size="sm" onClick={handleClearSelections}>
                        <Trash className="mr-1 h-4 w-4" />
                        Clear All
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {selectedArticles.map(article => (
                      <Card key={article.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-1 gap-2">
                                {getSourceIcon(article)}
                                <Badge variant="outline" className="text-xs">
                                  {article.journal}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {article.year}
                                </Badge>
                              </div>
                              
                              <h4 className="font-medium text-base mb-1">{article.title}</h4>
                              <p className="text-sm text-gray-600">{article.authors}</p>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleArticleSelection(article)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-blue-800">Literature Review Summary</h4>
                        <p className="text-sm text-blue-600">
                          Selected literature will be incorporated into your Clinical Evaluation Report
                        </p>
                      </div>
                      
                      <Button 
                        onClick={handleGenerateLiteratureReview}
                        disabled={generatingReview || selectedArticles.length < 3}
                      >
                        {generatingReview ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating Review...
                          </>
                        ) : (
                          <>
                            <FileText className="mr-2 h-4 w-4" />
                            Generate Literature Review
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="upload">
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-md">
                <Upload className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-700 mb-1">Upload Literature</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-3">
                  Upload PDFs of literature relevant to your clinical evaluation. The system will extract key information automatically.
                </p>
                <input
                  id="paper-upload"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button onClick={uploadPaperHandler}>
                  <Upload className="mr-2 h-4 w-4" />
                  Select PDF File
                </Button>
              </div>
              
              <div className="mt-6 space-y-2">
                <h4 className="font-medium">Upload Guidelines</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex space-x-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <p>Upload peer-reviewed journal articles relevant to your device</p>
                  </div>
                  <div className="flex space-x-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <p>Include systematic reviews and meta-analyses when available</p>
                  </div>
                  <div className="flex space-x-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <p>Clinical studies with your specific device are especially valuable</p>
                  </div>
                  <div className="flex space-x-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <p>Make sure PDFs are text-searchable for best extraction results</p>
                  </div>
                  <div className="flex space-x-2">
                    <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <p>Avoid marketing materials or non-peer-reviewed content</p>
                  </div>
                  <div className="flex space-x-2">
                    <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <p>Do not upload copyrighted content without proper permissions</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="compare">
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Predicate Device Comparison</h3>
                  <p className="text-gray-600 mb-4">
                    Compare your device with selected predicate devices to analyze similarities and differences for regulatory submissions.
                  </p>
                  
                  {selectedPredicates.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-md">
                      <Layers className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h4 className="font-medium text-gray-700 mb-1">No Predicate Devices Selected</h4>
                      <p className="text-gray-500 max-w-md mx-auto mb-3">
                        Search for and select predicate devices in the Search tab to enable comparison.
                      </p>
                      <Button 
                        onClick={() => {
                          setCurrentTab('search');
                          setSearchType('predicates');
                        }}
                      >
                        <Search className="mr-2 h-4 w-4" />
                        Search Predicates
                      </Button>
                    </div>
                  ) : (
                    <PredicateDeviceComparison 
                      deviceProfile={deviceProfile} 
                      predicateDevices={selectedPredicates}
                    />
                  )}
                </div>
                
                <div className="flex justify-between mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setCurrentTab('search');
                      setSearchType('predicates');
                    }}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Find More Predicates
                  </Button>
                  
                  {selectedPredicates.length > 0 && (
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedPredicates([])}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Clear All Predicates
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}