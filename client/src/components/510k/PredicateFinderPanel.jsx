import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Search, 
  Book, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Download,
  ExternalLink,
  Scissors,
  Check,
  BookmarkPlus,
  Database,
  Lightbulb,
  BookOpen,
  FilePlus,
  Copy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FDA510kService from '../../services/FDA510kService';
import PredicateComparison from './PredicateComparison';
import { isFeatureEnabled } from '@/flags/featureFlags';

const PredicateFinderPanel = ({ deviceProfile, organizationId, predicates = [], recommendations = [] }) => {
  // Make sure we protect against null/undefined props
  const safePredicates = Array.isArray(predicates) ? predicates : [];
  const safeRecommendations = Array.isArray(recommendations) ? recommendations : [];
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(safePredicates.length > 0 ? { predicateDevices: safePredicates } : null);
  const [activeTab, setActiveTab] = useState('predicates');
  const [showCustomization, setShowCustomization] = useState(false);
  const [selectedPredicate, setSelectedPredicate] = useState(null);
  const [savedReferences, setSavedReferences] = useState([]);
  const [summaries, setSummaries] = useState({});
  const [semQuery, setSemQuery] = useState('');
  const [isSemanticSearching, setIsSemanticSearching] = useState(false);
  const [semanticResults, setSemanticResults] = useState([]);
  const [relevanceCriteria, setRelevanceCriteria] = useState({
    intendedUseWeight: 40,
    deviceClassWeight: 20,
    technologyTypeWeight: 25,
    manufacturerWeight: 15
  });
  const { toast } = useToast();

  // Run the predicate and literature search
  const handleSearch = async () => {
    if (!deviceProfile) {
      toast({
        title: "No Device Profile Selected",
        description: "Please select a device profile before running the search",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setIsSearching(true);
    try {
      console.log('Starting predicate search with device profile:', deviceProfile.deviceName);
      
      // Add timeout protection
      const searchPromise = FDA510kService.findPredicatesAndLiterature(
        deviceProfile, 
        organizationId || 1,
        relevanceCriteria // Pass the custom relevance criteria
      );
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Predicate search timed out after 30 seconds'));
        }, 30000);
      });
      
      // Race the search against the timeout
      const result = await Promise.race([searchPromise, timeoutPromise]);
      
      // Validate the result
      if (!result || (typeof result !== 'object')) {
        throw new Error('Invalid response format from predicate search');
      }
      
      // Set the results, ensuring it's a valid object
      setResults(result);
      
      console.log('Predicate search completed successfully:', {
        predicateCount: result.predicateDevices?.length || 0,
        literatureCount: result.literatureReferences?.length || 0
      });
      
      toast({
        title: "Search Complete",
        description: `Found ${result.predicateDevices?.length || 0} potential predicate devices and ${result.literatureReferences?.length || 0} literature references.`,
      });
    } catch (error) {
      console.error('Error in predicate finder:', error);
      toast({
        title: "Search Error",
        description: error.message || "Could not complete predicate and literature search",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };
  
  // Clear the results
  const handleClear = () => {
    setResults(null);
    setActiveTab("predicates");
  };

  // Format a match score as a percentage and badge
  const formatMatchScore = (score) => {
    const percentage = Math.round(score * 100);
    let color = 'bg-green-100 text-green-800 border-green-200';
    
    if (percentage < 50) {
      color = 'bg-red-100 text-red-800 border-red-200';
    } else if (percentage < 75) {
      color = 'bg-amber-100 text-amber-800 border-amber-200';
    }
    
    return (
      <Badge variant="outline" className={`${color} ml-2`}>
        {percentage}% Match
      </Badge>
    );
  };
  
  // Handler for selecting a predicate device for comparison
  const handleSelectPredicate = (device) => {
    setSelectedPredicate(device);
    
    toast({
      title: "Predicate Selected",
      description: `${device.deviceName} selected for detailed comparison.`,
    });
  };
  
  // Generate a summary for a device or literature item
  const handleGenerateSummary = async (item, type = 'predicate') => {
    try {
      // Get the text to summarize
      const textToSummarize = type === 'predicate' 
        ? item.description
        : item.abstract;
      
      if (!textToSummarize) {
        toast({
          title: "Cannot Generate Summary",
          description: "No text available to summarize.",
          variant: "destructive",
        });
        return;
      }
      
      // Generate the summary
      const summary = await FDA510kService.summarizeText(textToSummarize);
      
      // Update state with the summary
      setSummaries(prev => ({
        ...prev,
        [item.id || item.kNumber]: summary
      }));
      
      toast({
        title: "Summary Generated",
        description: "The NLP summary has been generated successfully.",
      });
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: "Summary Error",
        description: error.message || "Could not generate summary. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handler for saving a reference to the list
  const handleSaveReference = (reference) => {
    // Check if already saved to prevent duplicates
    const isAlreadySaved = savedReferences.some(ref => 
      ref.id === reference.id || 
      (ref.title === reference.title && ref.authors === reference.authors)
    );
    
    if (isAlreadySaved) {
      toast({
        title: "Already Saved",
        description: "This reference is already in your saved list.",
        variant: "default",
      });
      return;
    }
    
    // Add the reference to saved references
    setSavedReferences(prev => [...prev, { ...reference, savedAt: new Date().toISOString() }]);
    
    toast({
      title: "Reference Saved",
      description: "The reference has been added to your saved list.",
    });
  };
  
  // Handler for removing a saved reference
  const handleRemoveReference = (referenceId) => {
    setSavedReferences(prev => prev.filter(ref => ref.id !== referenceId));
    
    toast({
      title: "Reference Removed",
      description: "The reference has been removed from your saved list.",
    });
  };
  
  // Handler for semantic search
  const handleSemanticSearch = async () => {
    if (!semQuery.trim()) {
      toast({
        title: "Empty Query",
        description: "Please enter a search query to perform semantic search",
        variant: "destructive",
      });
      return;
    }
    
    setIsSemanticSearching(true);
    try {
      // Add timeout protection
      const searchPromise = FDA510kService.semanticSearch(semQuery);
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Semantic search timed out after 15 seconds'));
        }, 15000);
      });
      
      // Race the search against the timeout
      const results = await Promise.race([searchPromise, timeoutPromise]);
      
      // Set the results
      setSemanticResults(results);
      
      console.log('Semantic search completed successfully:', {
        resultCount: results.length || 0
      });
      
      toast({
        title: "Semantic Search Complete",
        description: `Found ${results.length || 0} potential predicate devices.`,
      });
    } catch (error) {
      console.error('Error in semantic search:', error);
      toast({
        title: "Search Error",
        description: error.message || "Could not complete semantic search",
        variant: "destructive",
      });
    } finally {
      setIsSemanticSearching(false);
    }
  };
  
  // Helper to show detailed comparison between selected device and the predicate
  const renderDeviceComparison = (predicateDevice) => {
    if (!deviceProfile || !predicateDevice) return null;
    
    // Use our dedicated PredicateComparison component if the feature is enabled
    if (isFeatureEnabled('ENABLE_COMPARISONS')) {
      return (
        <PredicateComparison 
          deviceProfile={deviceProfile} 
          predicateDevice={predicateDevice} 
        />
      );
    }
    
    // Fallback to basic comparison if feature flag is disabled
    // Define key properties to compare
    const comparisonPoints = [
      { key: 'deviceClass', label: 'Device Class' },
      { key: 'technologyType', label: 'Technology Type' },
      { key: 'deviceType', label: 'Device Type' },
      { key: 'intendedUse', label: 'Intended Use' },
      { key: 'indications', label: 'Indications' },
      { key: 'description', label: 'Description' }
    ];
    
    return (
      <div className="mt-4 border rounded-md">
        <div className="bg-indigo-50 p-3 border-b border-indigo-100">
          <h3 className="font-medium text-indigo-700 flex items-center">
            <FileText className="h-4 w-4 mr-2 text-indigo-600" />
            Detailed Comparison
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                  Property
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                  Your Device
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                  Predicate Device
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                  Match
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {comparisonPoints.map((point) => {
                const yourValue = deviceProfile[point.key] || 'Not specified';
                const predicateValue = predicateDevice[point.key] || 'Not specified';
                
                // Determine if values match (exact or partial)
                let match = 'No Match';
                let matchColor = 'text-red-600';
                
                if (yourValue.toLowerCase() === predicateValue.toLowerCase()) {
                  match = 'Exact Match';
                  matchColor = 'text-green-600';
                } else if (
                  yourValue && 
                  predicateValue && 
                  (yourValue.toLowerCase().includes(predicateValue.toLowerCase()) || 
                   predicateValue.toLowerCase().includes(yourValue.toLowerCase()))
                ) {
                  match = 'Partial Match';
                  matchColor = 'text-amber-600';
                }
                
                return (
                  <tr key={point.key} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {point.label}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {yourValue}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {predicateValue}
                    </td>
                    <td className={`px-4 py-3 text-sm font-medium ${matchColor}`}>
                      {match}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Helper to get predicate device count by match score ranges
  const getPredicateStatistics = () => {
    if (!results?.predicateDevices?.length) return null;
    
    const predicates = results.predicateDevices;
    const total = predicates.length;
    const highMatch = predicates.filter(p => p.matchScore >= 0.75).length;
    const mediumMatch = predicates.filter(p => p.matchScore >= 0.5 && p.matchScore < 0.75).length;
    const lowMatch = predicates.filter(p => p.matchScore < 0.5).length;
    
    return { total, highMatch, mediumMatch, lowMatch };
  };

  // Helper to get literature reference count by match score ranges
  const getLiteratureStatistics = () => {
    if (!results?.literatureReferences?.length) return null;
    
    const references = results.literatureReferences;
    const total = references.length;
    const highRel = references.filter(p => p.relevanceScore >= 0.75).length;
    const mediumRel = references.filter(p => p.relevanceScore >= 0.5 && p.relevanceScore < 0.75).length;
    const lowRel = references.filter(p => p.relevanceScore < 0.5).length;
    
    return { total, highRel, mediumRel, lowRel };
  };
  
  const predicateStats = getPredicateStatistics();
  const literatureStats = getLiteratureStatistics();
  
  // Render an empty state
  const renderEmptyState = () => (
    <div>
      {/* Semantic Search Panel - only shown if feature flag is enabled */}
      {isFeatureEnabled('ENABLE_SEMANTIC_SEARCH') && (
        <div className="mb-6 p-4 border border-blue-100 rounded-lg bg-blue-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md font-medium flex items-center">
              <Search className="h-4 w-4 mr-2 text-blue-600" />
              <span>🔍 Semantic Search</span>
            </h3>
            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
              Vector Search
            </Badge>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            Describe what you're looking for in natural language and we'll find semantically similar predicate devices.
          </p>
          
          <div className="flex space-x-2 mb-4">
            <div className="flex-1">
              <input
                type="text"
                value={semQuery}
                onChange={e => setSemQuery(e.target.value)}
                placeholder="Describe what you're looking for…"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={isSemanticSearching}
              />
            </div>
            <Button 
              onClick={handleSemanticSearch} 
              disabled={isSemanticSearching || !semQuery.trim()}
              className="flex items-center gap-2"
            >
              {isSemanticSearching ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full"></span>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>
          
          {semanticResults.length > 0 ? (
            <div className="mt-3 space-y-2">
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Database className="h-4 w-4 mr-1.5 text-blue-600" />
                Semantic Search Results ({semanticResults.length})
              </h4>
              <ScrollArea className="h-[300px] rounded-md border p-2">
                <div className="space-y-2">
                  {semanticResults.map(result => (
                    <Card key={result.id} className="p-3 bg-white">
                      <div className="flex justify-between">
                        <span className="font-medium">{result.name}</span>
                        <span className="text-xs text-gray-500">{(result.score*100).toFixed(1)}% Match</span>
                      </div>
                      <p className="text-sm mt-1 text-gray-700">{result.description}</p>
                      <div className="flex justify-end mt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs"
                          onClick={() => handleSelectPredicate({
                            deviceName: result.name,
                            description: result.description,
                            matchScore: result.score,
                            id: result.id
                          })}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Select
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : null}
        </div>
      )}
      
      {/* Customization Panel */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium flex items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="p-0 h-auto" 
                    onClick={() => setShowCustomization(!showCustomization)}
                  >
                    <div className="flex items-center">
                      <Lightbulb className="h-4 w-4 mr-2 text-amber-500" />
                      <span>Relevance Criteria</span>
                      {showCustomization ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Customize how devices and literature are matched to your profile</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h3>
        </div>
        
        {showCustomization && (
          <Card className="bg-slate-50 mb-4">
            <CardContent className="pt-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Customize Relevance Criteria</h3>
                <p className="text-xs text-gray-500 mb-4">
                  Adjust the importance of different factors when matching predicates and literature to your device
                </p>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Intended Use</span>
                      <span className="text-sm font-medium">{relevanceCriteria.intendedUseWeight}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={relevanceCriteria.intendedUseWeight} 
                      onChange={(e) => {
                        const newValue = parseInt(e.target.value);
                        setRelevanceCriteria((prev) => ({
                          ...prev,
                          intendedUseWeight: newValue,
                          // Adjust other weights to keep total at 100%
                          deviceClassWeight: Math.max(5, Math.floor((100 - newValue) * (prev.deviceClassWeight / (100 - prev.intendedUseWeight)))),
                          technologyTypeWeight: Math.max(5, Math.floor((100 - newValue) * (prev.technologyTypeWeight / (100 - prev.intendedUseWeight)))),
                          manufacturerWeight: Math.max(5, 100 - newValue - Math.floor((100 - newValue) * (prev.deviceClassWeight / (100 - prev.intendedUseWeight))) - Math.floor((100 - newValue) * (prev.technologyTypeWeight / (100 - prev.intendedUseWeight))))
                        }));
                      }}
                      className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Device Classification</span>
                      <span className="text-sm font-medium">{relevanceCriteria.deviceClassWeight}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={relevanceCriteria.deviceClassWeight} 
                      onChange={(e) => {
                        const newValue = parseInt(e.target.value);
                        setRelevanceCriteria((prev) => ({
                          ...prev,
                          deviceClassWeight: newValue,
                          // Adjust other weights to keep total at 100%
                          intendedUseWeight: Math.max(5, Math.floor((100 - newValue) * (prev.intendedUseWeight / (100 - prev.deviceClassWeight)))),
                          technologyTypeWeight: Math.max(5, Math.floor((100 - newValue) * (prev.technologyTypeWeight / (100 - prev.deviceClassWeight)))),
                          manufacturerWeight: Math.max(5, 100 - newValue - Math.floor((100 - newValue) * (prev.intendedUseWeight / (100 - prev.deviceClassWeight))) - Math.floor((100 - newValue) * (prev.technologyTypeWeight / (100 - prev.deviceClassWeight))))
                        }));
                      }}
                      className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Technology Type</span>
                      <span className="text-sm font-medium">{relevanceCriteria.technologyTypeWeight}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={relevanceCriteria.technologyTypeWeight} 
                      onChange={(e) => {
                        const newValue = parseInt(e.target.value);
                        setRelevanceCriteria((prev) => ({
                          ...prev,
                          technologyTypeWeight: newValue,
                          // Adjust other weights to keep total at 100%
                          intendedUseWeight: Math.max(5, Math.floor((100 - newValue) * (prev.intendedUseWeight / (100 - prev.technologyTypeWeight)))),
                          deviceClassWeight: Math.max(5, Math.floor((100 - newValue) * (prev.deviceClassWeight / (100 - prev.technologyTypeWeight)))),
                          manufacturerWeight: Math.max(5, 100 - newValue - Math.floor((100 - newValue) * (prev.intendedUseWeight / (100 - prev.technologyTypeWeight))) - Math.floor((100 - newValue) * (prev.deviceClassWeight / (100 - prev.technologyTypeWeight))))
                        }));
                      }}
                      className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Manufacturer</span>
                      <span className="text-sm font-medium">{relevanceCriteria.manufacturerWeight}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={relevanceCriteria.manufacturerWeight} 
                      onChange={(e) => {
                        const newValue = parseInt(e.target.value);
                        setRelevanceCriteria((prev) => ({
                          ...prev,
                          manufacturerWeight: newValue,
                          // Adjust other weights to keep total at 100%
                          intendedUseWeight: Math.max(5, Math.floor((100 - newValue) * (prev.intendedUseWeight / (100 - prev.manufacturerWeight)))),
                          deviceClassWeight: Math.max(5, Math.floor((100 - newValue) * (prev.deviceClassWeight / (100 - prev.manufacturerWeight)))),
                          technologyTypeWeight: Math.max(5, 100 - newValue - Math.floor((100 - newValue) * (prev.intendedUseWeight / (100 - prev.manufacturerWeight))) - Math.floor((100 - newValue) * (prev.deviceClassWeight / (100 - prev.manufacturerWeight))))
                        }));
                      }}
                      className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end mt-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setRelevanceCriteria({
                        intendedUseWeight: 40,
                        deviceClassWeight: 20,
                        technologyTypeWeight: 25,
                        manufacturerWeight: 15
                      });
                      
                      toast({
                        title: "Criteria Reset",
                        description: "Relevance criteria have been reset to default values",
                      });
                    }}
                  >
                    Reset to Default
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="text-center p-8">
        <div className="mx-auto h-12 w-12 text-gray-400 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Search className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No Search Results Yet</h3>
        <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
          Run the search to find potential predicate devices and relevant literature references for your 510(k) submission.
        </p>
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Searching...
            </>
          ) : "Find Predicates & Literature"}
        </Button>
      </div>
    </div>
  );

  // Render a statistics dashboard
  const renderStatsDashboard = () => {
    if (!results) return null;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card className="shadow-sm">
          <CardHeader className="bg-blue-50 py-4">
            <CardTitle className="text-blue-700 flex items-center text-base">
              <Database className="h-4 w-4 mr-2 text-blue-600" />
              Predicate Device Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">Total Predicate Devices:</span>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                {predicateStats?.total || 0}
              </Badge>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">High Match (75-100%):</span>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  {predicateStats?.highMatch || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Medium Match (50-74%):</span>
                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                  {predicateStats?.mediumMatch || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Low Match (0-49%):</span>
                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                  {predicateStats?.lowMatch || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="bg-emerald-50 py-4">
            <CardTitle className="text-emerald-700 flex items-center text-base">
              <BookOpen className="h-4 w-4 mr-2 text-emerald-600" />
              Literature Reference Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">Total References:</span>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                {literatureStats?.total || 0}
              </Badge>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">High Relevance (75-100%):</span>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  {literatureStats?.highRel || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Medium Relevance (50-74%):</span>
                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                  {literatureStats?.mediumRel || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Low Relevance (0-49%):</span>
                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                  {literatureStats?.lowRel || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  // Render predicate devices
  const renderPredicateDevices = () => {
    if (!results?.predicateDevices?.length) {
      return (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTitle className="text-amber-800">No predicate devices found</AlertTitle>
          <AlertDescription className="text-amber-700">
            We couldn't find any potential predicate devices that match your criteria. Try adjusting your device profile details or consult with a regulatory expert.
          </AlertDescription>
        </Alert>
      );
    }
    
    return (
      <div className="space-y-4">
        {isFeatureEnabled('ENABLE_COMPARISONS') && selectedPredicate && (
          <PredicateComparison 
            deviceProfile={deviceProfile} 
            predicateDevice={selectedPredicate} 
          />
        )}
        
        {results.predicateDevices.map((device, index) => (
          <Collapsible key={index} className="border rounded-md overflow-hidden">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-white hover:bg-gray-50 text-left">
              <div className="flex items-center">
                <div className="rounded-md bg-blue-100 p-2 mr-3">
                  <Database className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium flex items-center">
                    {device.deviceName} 
                    {formatMatchScore(device.matchScore)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {device.manufacturer} • {device.kNumber || 'K Number not available'} • Class {device.deviceClass || 'II'}
                  </div>
                </div>
              </div>
              <ChevronDown className="h-5 w-5 text-gray-500 shrink-0" />
            </CollapsibleTrigger>
            <CollapsibleContent className="border-t">
              <div className="p-4 bg-gray-50">
                <h4 className="font-medium mb-2">Match Rationale</h4>
                <p className="text-sm text-gray-700 mb-4">{device.matchRationale}</p>
                
                {/* AI Summary Section */}
                {summaries[device.kNumber] && (
                  <div className="mb-4 bg-gradient-to-r from-blue-50 to-white p-4 rounded-md border border-blue-100 shadow-sm">
                    <h4 className="font-medium mb-2 flex items-center text-blue-700">
                      <Lightbulb className="h-4 w-4 mr-2 text-blue-600" />
                      AI-Generated NLP Summary
                    </h4>
                    <div className="text-sm text-gray-700 bg-white p-3 rounded border border-blue-50">
                      {summaries[device.kNumber]}
                    </div>
                    <div className="mt-2 text-xs text-gray-500 flex items-center">
                      <Check className="h-3 w-3 mr-1 text-green-500" />
                      Generated with OpenAI GPT-4o
                    </div>
                  </div>
                )}
                
                <h4 className="font-medium mb-2">Device Description</h4>
                <p className="text-sm text-gray-700 mb-4">{device.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">FDA Clearance Date</h4>
                    <p className="text-sm">{device.clearanceDate || 'Not available'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">K Number</h4>
                    <p className="text-sm">{device.kNumber || 'Not available'}</p>
                  </div>
                </div>
                
                {/* Display the AI-generated summary if available */}
                {summaries[device.kNumber || device.id] && (
                  <div className="mt-3 mb-4">
                    <h4 className="font-medium mb-2">AI-Generated Summary</h4>
                    <div className="bg-blue-50 border border-blue-100 p-3 rounded-md text-sm text-blue-800">
                      {summaries[device.kNumber || device.id]}
                    </div>
                  </div>
                )}
                
                {/* Add detailed comparison when we have both device profile and a predicate */}
                {deviceProfile && renderDeviceComparison(device)}
                
                <div className="flex justify-end space-x-2 mt-4">
                  {device.kNumber && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center"
                            onClick={() => {
                              window.open(`https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm?ID=${device.kNumber}`, '_blank');
                              toast({
                                title: "Opened FDA Website",
                                description: `Viewing details for ${device.kNumber} in a new tab`,
                              });
                            }}
                          >
                            <ExternalLink className="h-3.5 w-3.5 mr-1" />
                            View on FDA Website
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View the official FDA details for this device</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  {isFeatureEnabled('ENABLE_COMPARISONS') && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center"
                            onClick={() => handleSelectPredicate(device)}
                          >
                            <Scissors className="h-3.5 w-3.5 mr-1" />
                            Compare
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Compare this device to your device profile</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline"
                          size="sm" 
                          className="flex items-center"
                          onClick={() => handleGenerateSummary(device, 'predicate')}
                        >
                          <FileText className="h-3.5 w-3.5 mr-1" />
                          Summarize
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Generate an AI summary of this device</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          size="sm" 
                          className="flex items-center"
                          onClick={() => handleSaveReference({
                            id: device.kNumber || `pred-${Date.now()}`,
                            title: device.deviceName,
                            authors: device.manufacturer,
                            source: "FDA 510(k)",
                            year: device.clearanceDate ? new Date(device.clearanceDate).getFullYear() : "Unknown",
                            type: "predicate",
                            referenceValue: device.kNumber,
                            matchScore: device.matchScore
                          })}
                        >
                          <FilePlus className="h-3.5 w-3.5 mr-1" />
                          Add as Predicate
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add this device as a predicate for your 510(k) submission</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    );
  };
  
  // Render literature references
  const renderLiteratureReferences = () => {
    if (!results?.literatureReferences?.length) {
      return (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTitle className="text-amber-800">No literature references found</AlertTitle>
          <AlertDescription className="text-amber-700">
            We couldn't find any relevant literature references that match your criteria. Try adjusting your device profile details or consult with a regulatory expert.
          </AlertDescription>
        </Alert>
      );
    }
    
    return (
      <div className="space-y-4">
        {results.literatureReferences.map((reference, index) => (
          <Collapsible key={index} className="border rounded-md overflow-hidden">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-white hover:bg-gray-50 text-left">
              <div className="flex items-center">
                <div className="rounded-md bg-green-100 p-2 mr-3">
                  <Book className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium flex items-center">
                    {reference.title} 
                    {reference.relevanceScore && formatMatchScore(reference.relevanceScore)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {reference.authors && reference.authors.length > 0 
                      ? reference.authors.slice(0, 2).join(', ') + (reference.authors.length > 2 ? ' et al.' : '')
                      : 'Unknown authors'
                    } • {reference.journal} • {reference.year}
                  </div>
                </div>
              </div>
              <ChevronDown className="h-5 w-5 text-gray-500 shrink-0" />
            </CollapsibleTrigger>
            <CollapsibleContent className="border-t">
              <div className="p-4 bg-gray-50">
                <h4 className="font-medium mb-1">Abstract</h4>
                <p className="text-sm text-gray-700 mb-4">{reference.abstract}</p>
                
                {/* Display the AI-generated summary if available */}
                {summaries[reference.id || reference.doi] && (
                  <div className="mb-4 bg-gradient-to-r from-green-50 to-white p-4 rounded-md border border-green-100 shadow-sm">
                    <h4 className="font-medium mb-2 flex items-center text-green-700">
                      <Lightbulb className="h-4 w-4 mr-2 text-green-600" />
                      AI-Generated NLP Summary
                    </h4>
                    <div className="text-sm text-gray-700 bg-white p-3 rounded border border-green-50">
                      {summaries[reference.id || reference.doi]}
                    </div>
                    <div className="mt-2 text-xs text-gray-500 flex items-center">
                      <Check className="h-3 w-3 mr-1 text-green-500" />
                      Generated with OpenAI GPT-4o
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">DOI</h4>
                    <p className="text-sm">{reference.doi || 'Not available'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">Publication</h4>
                    <p className="text-sm">{reference.journal}, {reference.year}</p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-2">
                  {reference.url && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center"
                            onClick={() => {
                              window.open(reference.url, '_blank');
                              toast({
                                title: "Opened Publication",
                                description: `Viewing "${reference.title}" in a new tab`,
                              });
                            }}
                          >
                            <ExternalLink className="h-3.5 w-3.5 mr-1" />
                            View Publication
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Opens the original publication in a new tab</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline"
                          size="sm" 
                          className="flex items-center"
                          onClick={() => handleGenerateSummary(reference, 'literature')}
                        >
                          <FileText className="h-3.5 w-3.5 mr-1" />
                          Summarize
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Generate an AI summary of this literature</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          onClick={() => handleSaveReference({
                            id: reference.id || `lit-${Date.now()}`,
                            title: reference.title,
                            authors: reference.authors,
                            journal: reference.journal,
                            year: reference.year,
                            doi: reference.doi || '',
                            url: reference.url,
                            abstract: reference.abstract,
                            relevanceScore: reference.relevanceScore,
                            source: reference.source || reference.journal,
                            type: "literature"
                          })}
                        >
                          <FileText className="h-3.5 w-3.5 mr-1" />
                          Cite in Submission
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add this reference to your 510(k) submission citations</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    );
  };
  
  // Render saved references
  const renderSavedReferences = () => {
    if (savedReferences.length === 0) {
      return (
        <Alert className="bg-blue-50 border-blue-200 mb-4">
          <AlertTitle className="text-blue-800">No saved references yet</AlertTitle>
          <AlertDescription className="text-blue-700">
            Use the "Add as Predicate" button when viewing predicate devices or literature references to save them here for your 510(k) submission.
          </AlertDescription>
        </Alert>
      );
    }
    
    // Group references by type
    const predicates = savedReferences.filter(ref => ref.type === 'predicate');
    const literature = savedReferences.filter(ref => ref.type === 'literature');
    
    return (
      <div className="space-y-6">
        {predicates.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-3 text-gray-700 flex items-center">
              <Database className="h-4 w-4 mr-2 text-blue-600" />
              Saved Predicate Devices ({predicates.length})
            </h3>
            <div className="space-y-3">
              {predicates.map((pred) => (
                <div key={pred.id} className="border rounded-md bg-white shadow-sm">
                  <div className="p-3">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium flex items-center">
                          {pred.title}
                          {pred.matchScore && formatMatchScore(pred.matchScore)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {pred.authors} • {pred.referenceValue || 'No K-Number'} • Added {new Date(pred.savedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveReference(pred.id)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-2 gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => {
                                // Find the original device in results
                                const originalDevice = results?.predicateDevices?.find(d => d.kNumber === pred.referenceValue);
                                if (originalDevice) {
                                  setSelectedPredicate(originalDevice);
                                  toast({
                                    title: "Predicate Selected",
                                    description: `${originalDevice.deviceName} selected for detailed comparison.`,
                                  });
                                } else {
                                  toast({
                                    title: "Device Not Found",
                                    description: "The original device data is not available. Try running the search again.",
                                    variant: "destructive",
                                  });
                                }
                              }}
                            >
                              <Scissors className="h-3 w-3" />
                              <span>Compare</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Compare this predicate with your device</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => {
                                const citation = `${pred.authors} (${pred.year}). ${pred.title}. FDA 510(k) Database, ${pred.referenceValue}.`;
                                navigator.clipboard.writeText(citation);
                                toast({
                                  title: "Citation Copied",
                                  description: "Reference citation copied to clipboard",
                                });
                              }}
                            >
                              <Copy className="h-3 w-3" />
                              <span>Copy Citation</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy formatted citation to clipboard</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {literature.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-3 text-gray-700 flex items-center">
              <BookOpen className="h-4 w-4 mr-2 text-green-600" />
              Saved Literature References ({literature.length})
            </h3>
            <div className="space-y-3">
              {literature.map((lit) => (
                <div key={lit.id} className="border rounded-md bg-white shadow-sm">
                  <div className="p-3">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium flex items-center">
                          {lit.title}
                          {lit.relevanceScore && formatMatchScore(lit.relevanceScore)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {lit.authors?.length > 0 
                            ? lit.authors.slice(0, 2).join(', ') + (lit.authors.length > 2 ? ' et al.' : '')
                            : 'Unknown authors'
                          } • {lit.journal || lit.source} • {lit.year}
                        </div>
                      </div>
                      <div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveReference(lit.id)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-2 gap-2">
                      {lit.url && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={() => {
                                  window.open(lit.url, '_blank');
                                  toast({
                                    title: "Opened Publication",
                                    description: `Viewing publication in a new tab`,
                                  });
                                }}
                              >
                                <ExternalLink className="h-3 w-3" />
                                <span>View Source</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Open publication in a new window</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => {
                                // Create citation in APA format
                                let citation = '';
                                if (lit.authors?.length) {
                                  if (lit.authors.length === 1) {
                                    citation = `${lit.authors[0]}`;
                                  } else if (lit.authors.length === 2) {
                                    citation = `${lit.authors[0]} & ${lit.authors[1]}`;
                                  } else {
                                    citation = `${lit.authors[0]} et al.`;
                                  }
                                } else {
                                  citation = 'Unknown Author';
                                }
                                
                                citation += ` (${lit.year}). ${lit.title}. `;
                                
                                if (lit.journal) {
                                  citation += `${lit.journal}, `;
                                }
                                
                                if (lit.volume) {
                                  citation += `${lit.volume}`;
                                  if (lit.issue) {
                                    citation += `(${lit.issue})`;
                                  }
                                  citation += ', ';
                                }
                                
                                if (lit.pages) {
                                  citation += `${lit.pages}. `;
                                }
                                
                                if (lit.doi) {
                                  citation += `https://doi.org/${lit.doi}`;
                                }
                                
                                navigator.clipboard.writeText(citation);
                                toast({
                                  title: "Citation Copied",
                                  description: "Reference citation copied to clipboard",
                                });
                              }}
                            >
                              <Copy className="h-3 w-3" />
                              <span>Copy Citation</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy formatted citation to clipboard</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {savedReferences.length > 0 && (
          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => {
                setSavedReferences([]);
                toast({
                  title: "References Cleared",
                  description: "All saved references have been removed",
                });
              }}
            >
              Clear All
            </Button>
            
            <Button
              size="sm"
              onClick={() => {
                // In a real implementation, this would save the references to the server
                // For now, we'll just show a toast message
                toast({
                  title: "References Saved",
                  description: `${savedReferences.length} references have been saved to your 510(k) submission`,
                });
              }}
            >
              Save to Submission
            </Button>
          </div>
        )}
      </div>
    );
  };
  
  // Render timeline visualization (simplified)
  const renderTimelineVisualization = () => {
    if (!results) return null;
    
    return (
      <div className="border rounded-md p-4 mt-4 bg-gray-50">
        <h3 className="font-medium mb-3 flex items-center">
          <FileText className="h-4 w-4 mr-2 text-blue-600" />
          Regulatory Timeline Analysis
        </h3>
        <p className="text-sm text-gray-700 mb-2">
          Based on our analysis of similar devices, the average time to clearance for devices in this category is approximately 6-9 months from submission.
        </p>
      </div>
    );
  };
  
  return (
    <Card className="mb-6">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-slate-50 pb-4">
        <CardTitle className="text-blue-700 flex items-center">
          <Search className="h-5 w-5 mr-2 text-blue-600" />
          Predicate Finder & Literature Review
        </CardTitle>
        <CardDescription>
          Find potential predicate devices and relevant literature for your 510(k) submission. Analyze 
          predicate devices for substantial equivalence and discover supporting scientific literature.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        {!results ? renderEmptyState() : (
          <>
            {renderStatsDashboard()}
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList className={`grid w-full ${isFeatureEnabled('ENABLE_SEMANTIC_SEARCH') ? 'grid-cols-5' : 'grid-cols-4'}`}>
                <TabsTrigger value="predicates" className="flex items-center gap-1.5">
                  <Database className="h-4 w-4" />
                  <span>Predicate Devices</span>
                  {predicateStats?.total ? (
                    <Badge className="ml-auto bg-blue-100 border-blue-200 text-blue-800 h-5 px-1.5">
                      {predicateStats.total}
                    </Badge>
                  ) : null}
                </TabsTrigger>
                <TabsTrigger value="recommendations" className="flex items-center gap-1.5">
                  <Lightbulb className="h-4 w-4" />
                  <span>AI Recommendations</span>
                  {recommendations.length > 0 && (
                    <Badge className="ml-auto bg-yellow-100 border-yellow-200 text-yellow-800 h-5 px-1.5">
                      {recommendations.length}
                    </Badge>
                  )}
                </TabsTrigger>
                {isFeatureEnabled('ENABLE_SEMANTIC_SEARCH') && (
                  <TabsTrigger value="semantic" className="flex items-center gap-1.5">
                    <Search className="h-4 w-4" />
                    <span>Semantic Search</span>
                    {semanticResults.length > 0 && (
                      <Badge className="ml-auto bg-indigo-100 border-indigo-200 text-indigo-800 h-5 px-1.5">
                        {semanticResults.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                )}
                <TabsTrigger value="literature" className="flex items-center gap-1.5">
                  <Book className="h-4 w-4" />
                  <span>Literature</span>
                  {literatureStats?.total ? (
                    <Badge className="ml-auto bg-emerald-100 border-emerald-200 text-emerald-800 h-5 px-1.5">
                      {literatureStats.total}
                    </Badge>
                  ) : null}
                </TabsTrigger>
                <TabsTrigger value="saved" className="flex items-center gap-1.5">
                  <Check className="h-4 w-4" />
                  <span>Saved References</span>
                  {savedReferences.length > 0 && (
                    <Badge className="ml-auto bg-purple-100 border-purple-200 text-purple-800 h-5 px-1.5">
                      {savedReferences.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
              
              <div className="mt-3 border rounded-md p-4">
                <TabsContent value="predicates" className="m-0">
                  <ScrollArea className="h-[400px] pr-3">
                    {renderPredicateDevices()}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="recommendations" className="m-0">
                  <ScrollArea className="h-[400px] pr-3">
                    {recommendations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[300px] text-center">
                        <Lightbulb className="h-12 w-12 text-yellow-500 mb-4" />
                        <h3 className="text-lg font-medium mb-2">No AI Recommendations Yet</h3>
                        <p className="text-sm text-gray-500 max-w-md mb-4">
                          Use the "AI Recommendations" button in the Predicate & Literature Discovery section to get AI-powered predicate device suggestions.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 mb-4">
                          <div className="flex items-center">
                            <Lightbulb className="h-5 w-5 text-yellow-600 mr-2" />
                            <span className="font-medium text-yellow-800">AI-Recommended Predicate Devices</span>
                          </div>
                          <p className="text-sm text-yellow-700 mt-1">
                            These recommendations are based on your device profile characteristics and similar regulatory submissions.
                          </p>
                        </div>
                        
                        {recommendations.map((recommendation, index) => (
                          <Card key={`rec-${index}`} className="border-yellow-100 hover:shadow-sm transition-shadow">
                            <CardHeader className="py-3 px-4 bg-gradient-to-r from-yellow-50 to-white">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-base font-medium">{recommendation.name}</CardTitle>
                                  <CardDescription className="text-xs">ID: {recommendation.id}</CardDescription>
                                </div>
                                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                  Recommendation #{index + 1}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="py-3 px-4">
                              <div className="text-sm text-gray-700">
                                <span className="font-medium">Rationale: </span>
                                {recommendation.rationale}
                              </div>
                              
                              <div className="flex mt-3 pt-2 border-t border-gray-100 text-sm justify-end">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="mr-2"
                                  onClick={() => handleGenerateSummary(recommendation)}
                                >
                                  <FileText className="h-3.5 w-3.5 mr-1" />
                                  Summarize
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-green-200 text-green-700 hover:bg-green-50"
                                  onClick={() => {
                                    if (savedReferences.find(ref => ref.id === recommendation.id)) {
                                      toast({
                                        title: "Already Saved",
                                        description: "This reference is already in your saved list",
                                        variant: "default",
                                      });
                                      return;
                                    }
                                    
                                    setSavedReferences([
                                      ...savedReferences,
                                      { 
                                        ...recommendation,
                                        type: 'predicate', 
                                        savedAt: new Date().toISOString() 
                                      }
                                    ]);
                                    
                                    toast({
                                      title: "Predicate Device Saved",
                                      description: "Added to your saved references",
                                      variant: "default",
                                    });
                                  }}
                                >
                                  <BookmarkPlus className="h-3.5 w-3.5 mr-1" />
                                  Save
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
                
                {isFeatureEnabled('ENABLE_SEMANTIC_SEARCH') && (
                  <TabsContent value="semantic" className="m-0">
                    <ScrollArea className="h-[400px] pr-3">
                      {semanticResults.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[300px] text-center">
                          <Search className="h-12 w-12 text-indigo-500 mb-4" />
                          <h3 className="text-lg font-medium mb-2">No Semantic Search Results</h3>
                          <p className="text-sm text-gray-500 max-w-md mb-4">
                            Use the search form to find semantically similar predicate devices using natural language.
                          </p>
                          <div className="w-full max-w-lg">
                            <div className="flex space-x-2">
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={semQuery}
                                  onChange={e => setSemQuery(e.target.value)}
                                  placeholder="Describe what you're looking for…"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                  disabled={isSemanticSearching}
                                />
                              </div>
                              <Button 
                                onClick={handleSemanticSearch} 
                                disabled={isSemanticSearching || !semQuery.trim()}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                              >
                                {isSemanticSearching ? (
                                  <>
                                    <span className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full"></span>
                                    Searching...
                                  </>
                                ) : (
                                  <>
                                    <Search className="h-4 w-4" />
                                    Search
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-indigo-50 p-3 rounded-md border border-indigo-200 mb-4">
                            <div className="flex items-center">
                              <Search className="h-5 w-5 text-indigo-600 mr-2" />
                              <span className="font-medium text-indigo-800">Semantic Search Results</span>
                            </div>
                            <p className="text-sm text-indigo-700 mt-1">
                              These results are ranked by semantic similarity to your query: "{semQuery}"
                            </p>
                          </div>
                          
                          {semanticResults.map((result) => (
                            <Card key={`sem-${result.id}`} className="border-indigo-100 hover:shadow-sm transition-shadow">
                              <CardHeader className="py-3 px-4 bg-gradient-to-r from-indigo-50 to-white">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <CardTitle className="text-base font-medium">{result.name}</CardTitle>
                                    <CardDescription className="text-xs">ID: {result.id}</CardDescription>
                                  </div>
                                  <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
                                    {(result.score*100).toFixed(1)}% Match
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="py-3 px-4">
                                <div className="text-sm text-gray-700">
                                  {result.description}
                                </div>
                                
                                <div className="flex mt-3 pt-2 border-t border-gray-100 text-sm justify-end">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 mr-2"
                                    onClick={() => handleSelectPredicate({
                                      deviceName: result.name,
                                      description: result.description,
                                      matchScore: result.score,
                                      id: result.id
                                    })}
                                  >
                                    <FileText className="h-3.5 w-3.5 mr-1" />
                                    Select
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-green-200 text-green-700 hover:bg-green-50"
                                    onClick={() => {
                                      if (savedReferences.find(ref => ref.id === result.id)) {
                                        toast({
                                          title: "Already Saved",
                                          description: "This reference is already in your saved list",
                                          variant: "default",
                                        });
                                        return;
                                      }
                                      
                                      setSavedReferences([
                                        ...savedReferences,
                                        { 
                                          id: result.id,
                                          name: result.name,
                                          description: result.description,
                                          matchScore: result.score,
                                          type: 'semantic', 
                                          savedAt: new Date().toISOString() 
                                        }
                                      ]);
                                      
                                      toast({
                                        title: "Predicate Device Saved",
                                        description: "Added to your saved references",
                                        variant: "default",
                                      });
                                    }}
                                  >
                                    <BookmarkPlus className="h-3.5 w-3.5 mr-1" />
                                    Save
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                )}
                
                <TabsContent value="literature" className="m-0">
                  <ScrollArea className="h-[400px] pr-3">
                    {renderLiteratureReferences()}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="saved" className="m-0">
                  <ScrollArea className="h-[400px] pr-3">
                    {renderSavedReferences()}
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>
            
            {renderTimelineVisualization()}
          </>
        )}
      </CardContent>
      {results && (
        <CardFooter className="border-t px-6 py-4 bg-slate-50 flex justify-between">
          <Button variant="outline" onClick={handleClear}>
            Clear Results
          </Button>
          <Button 
            onClick={handleSearch} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </>
            ) : "Refresh Search"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default PredicateFinderPanel;