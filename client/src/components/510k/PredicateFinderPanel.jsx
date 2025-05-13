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
  Database,
  Lightbulb,
  BookOpen
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FDA510kService from '../../services/FDA510kService';

const PredicateFinderPanel = ({ deviceProfile, organizationId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState("predicates");
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
    try {
      // Use the service for finding predicates and literature
      const result = await FDA510kService.findPredicatesAndLiterature(deviceProfile, organizationId || 1);
      
      // Set the results
      setResults(result);
      
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
  
  // Helper to show detailed comparison between selected device and the predicate
  const renderDeviceComparison = (predicateDevice) => {
    if (!deviceProfile || !predicateDevice) return null;
    
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
                
                {/* Add detailed comparison when we have both device profile and a predicate */}
                {deviceProfile && renderDeviceComparison(device)}
                
                <div className="flex justify-end space-x-2 mt-4">
                  {device.kNumber && (
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
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                    onClick={() => {
                      const comparisonText = `Comparison Summary: ${deviceProfile.deviceName} vs ${device.deviceName}

Device Class: ${deviceProfile.deviceClass || 'Not specified'} vs ${device.deviceClass || 'Not specified'}
Technology Type: ${deviceProfile.technologyType || 'Not specified'} vs ${device.technologyType || 'Not specified'}
Intended Use: ${deviceProfile.intendedUse || 'Not specified'} vs ${device.intendedUse || 'Not specified'}
Match Score: ${Math.round(device.matchScore * 100)}%
Match Rationale: ${device.matchRationale || 'Not available'}
`;
                      navigator.clipboard.writeText(comparisonText);
                      toast({
                        title: "Comparison Copied",
                        description: "The device comparison has been copied to clipboard",
                      });
                    }}
                  >
                    <FileText className="h-3.5 w-3.5 mr-1" />
                    Copy Comparison
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center text-green-600 border-green-200 hover:bg-green-50"
                    onClick={() => {
                      // In a real implementation, this would save the predicate to the project
                      localStorage.setItem('selectedPredicate', JSON.stringify(device));
                      toast({
                        title: "Predicate Device Saved",
                        description: `${device.deviceName} has been added as a predicate device for your 510(k) submission`,
                        variant: "success",
                      });
                    }}
                  >
                    <Scissors className="h-3.5 w-3.5 mr-1" />
                    Use as Predicate
                  </Button>
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
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          onClick={() => {
                            // In a real implementation, this would add the citation to the 510(k) submission
                            const citations = JSON.parse(localStorage.getItem('citations') || '[]');
                            citations.push({
                              id: new Date().getTime(),
                              title: reference.title,
                              authors: reference.authors,
                              journal: reference.journal,
                              year: reference.year,
                              doi: reference.doi || '',
                              addedAt: new Date().toISOString()
                            });
                            localStorage.setItem('citations', JSON.stringify(citations));
                            
                            toast({
                              title: "Citation Added",
                              description: `"${reference.title}" has been added to your 510(k) submission references`,
                              variant: "success",
                            });
                          }}
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

  // Timeline visualization for FDA review process
  const renderTimelineVisualization = () => {
    if (!results) return null;
    
    const milestones = [
      { name: "Device Selection", days: 0, icon: <Check className="h-4 w-4" /> },
      { name: "Predicate Analysis", days: 10, icon: <Database className="h-4 w-4" /> },
      { name: "Draft 510(k) Submission", days: 30, icon: <FileText className="h-4 w-4" /> },
      { name: "FDA Acceptance Review", days: 45, icon: <Lightbulb className="h-4 w-4" /> },
      { name: "FDA Substantive Review", days: 90, icon: <Book className="h-4 w-4" /> },
      { name: "Final Decision", days: 120, icon: <Check className="h-4 w-4" /> }
    ];
    
    return (
      <Card className="shadow-sm mt-6">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-white py-4">
          <CardTitle className="text-indigo-700 flex items-center text-base">
            <Lightbulb className="h-4 w-4 mr-2 text-indigo-600" />
            FDA 510(k) Review Process Timeline
          </CardTitle>
          <CardDescription>
            Estimated timeline for the 510(k) review process based on selected device class
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute top-5 left-5 h-full w-0.5 bg-indigo-200"></div>
            
            {/* Timeline milestones */}
            <div className="space-y-8 relative">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 -ml-0.5">
                    <div className="rounded-full h-10 w-10 flex items-center justify-center bg-indigo-100 text-indigo-600 border-2 border-indigo-200 z-10 relative">
                      {milestone.icon}
                    </div>
                  </div>
                  <div className="ml-4 pb-4">
                    <div className="font-medium">{milestone.name}</div>
                    <div className="text-sm text-gray-500">
                      {milestone.days === 0 ? 'Today' : `Day ${milestone.days}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className="shadow overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-white pb-3 border-b">
        <CardTitle className="flex items-center">
          <Search className="mr-2 h-5 w-5 text-blue-600" />
          Predicate & Literature Finder
        </CardTitle>
        <CardDescription>
          Discover potential predicate devices and relevant scientific literature for your 510(k) submission
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {!results ? (
          renderEmptyState()
        ) : (
          <>
            {renderStatsDashboard()}
            
            <Tabs defaultValue="predicates" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="predicates" className="flex items-center">
                  <Database className="h-4 w-4 mr-2" />
                  Predicate Devices
                </TabsTrigger>
                <TabsTrigger value="literature" className="flex items-center">
                  <Book className="h-4 w-4 mr-2" />
                  Literature References 
                </TabsTrigger>
                <TabsTrigger value="saved" className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Saved References
                </TabsTrigger>
              </TabsList>
              
              <div className="mt-4">
                <TabsContent value="predicates" className="m-0">
                  <ScrollArea className="h-[400px] pr-3">
                    {renderPredicateDevices()}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="literature" className="m-0">
                  <ScrollArea className="h-[400px] pr-3">
                    {renderLiteratureReferences()}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="saved" className="m-0">
                  <ScrollArea className="h-[400px] pr-3">
                    {(() => {
                      // Get saved predicates and citations from localStorage
                      const savedPredicate = localStorage.getItem('selectedPredicate') 
                        ? JSON.parse(localStorage.getItem('selectedPredicate')) 
                        : null;
                      const savedCitations = localStorage.getItem('citations') 
                        ? JSON.parse(localStorage.getItem('citations')) 
                        : [];
                      
                      if (!savedPredicate && savedCitations.length === 0) {
                        return (
                          <Alert className="bg-blue-50 border-blue-200 mb-4">
                            <AlertTitle className="text-blue-800">No saved references yet</AlertTitle>
                            <AlertDescription className="text-blue-700">
                              Use the "Use as Predicate" and "Cite in Submission" buttons to save predicate devices and literature references for your 510(k) submission.
                            </AlertDescription>
                          </Alert>
                        );
                      }
                      
                      return (
                        <div className="space-y-6">
                          {/* Selected Predicate Device */}
                          {savedPredicate && (
                            <div>
                              <h3 className="text-sm font-medium mb-3 flex items-center">
                                <Database className="h-4 w-4 mr-2 text-blue-600" />
                                Selected Predicate Device
                              </h3>
                              <Card className="bg-blue-50 border-blue-200">
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h4 className="font-medium">{savedPredicate.deviceName}</h4>
                                      <p className="text-sm text-gray-600">
                                        {savedPredicate.manufacturer} • {savedPredicate.kNumber || 'No K-number'} • 
                                        Class {savedPredicate.deviceClass || 'II'}
                                      </p>
                                      <p className="text-sm mt-2">{savedPredicate.description}</p>
                                    </div>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="text-red-600 border-red-200 hover:bg-red-50"
                                      onClick={() => {
                                        localStorage.removeItem('selectedPredicate');
                                        toast({
                                          title: "Predicate Device Removed",
                                          description: "The predicate device has been removed from your saved references",
                                        });
                                        // Force re-render
                                        setActiveTab('predicates');
                                        setTimeout(() => setActiveTab('saved'), 10);
                                      }}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                  
                                  <div className="mt-3 pt-3 border-t border-blue-200">
                                    <h4 className="text-xs font-medium text-gray-500 mb-1">Match Rationale</h4>
                                    <p className="text-sm">{savedPredicate.matchRationale}</p>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                          
                          {/* Saved Citations */}
                          {savedCitations.length > 0 && (
                            <div>
                              <h3 className="text-sm font-medium mb-3 flex items-center">
                                <Book className="h-4 w-4 mr-2 text-emerald-600" />
                                Saved Literature References
                                <Badge className="ml-2 bg-emerald-100 text-emerald-800 border-emerald-200">
                                  {savedCitations.length}
                                </Badge>
                              </h3>
                              
                              <div className="space-y-3">
                                {savedCitations.map((citation, index) => (
                                  <Card key={citation.id} className="bg-emerald-50 border-emerald-200">
                                    <CardContent className="p-4">
                                      <div className="flex items-start justify-between">
                                        <div>
                                          <h4 className="font-medium">{citation.title}</h4>
                                          <p className="text-sm text-gray-600">
                                            {citation.authors && citation.authors.length > 0 
                                              ? citation.authors.slice(0, 2).join(', ') + (citation.authors.length > 2 ? ' et al.' : '')
                                              : 'Unknown authors'
                                            } • {citation.journal} • {citation.year}
                                          </p>
                                          {citation.doi && (
                                            <p className="text-xs text-gray-500 mt-1">DOI: {citation.doi}</p>
                                          )}
                                        </div>
                                        <div className="flex space-x-2">
                                          <Button 
                                            variant="outline" 
                                            size="sm"
                                            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                            onClick={() => {
                                              // Generate APA-style citation
                                              const apaCitation = `${citation.authors ? citation.authors.join(', ') : 'Unknown'} (${citation.year}). ${citation.title}. ${citation.journal}. ${citation.doi ? `https://doi.org/${citation.doi}` : ''}`;
                                              
                                              // Copy to clipboard
                                              navigator.clipboard.writeText(apaCitation);
                                              
                                              toast({
                                                title: "Citation Copied",
                                                description: "The citation has been copied to your clipboard in APA format",
                                              });
                                            }}
                                          >
                                            Copy Citation
                                          </Button>
                                          <Button 
                                            variant="outline" 
                                            size="sm"
                                            className="text-red-600 border-red-200 hover:bg-red-50"
                                            onClick={() => {
                                              // Remove this citation
                                              const updatedCitations = savedCitations.filter(c => c.id !== citation.id);
                                              localStorage.setItem('citations', JSON.stringify(updatedCitations));
                                              
                                              toast({
                                                title: "Citation Removed",
                                                description: "The citation has been removed from your saved references",
                                              });
                                              
                                              // Force re-render
                                              setActiveTab('literature');
                                              setTimeout(() => setActiveTab('saved'), 10);
                                            }}
                                          >
                                            Remove
                                          </Button>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
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