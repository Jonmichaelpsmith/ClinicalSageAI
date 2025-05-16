import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Check, X, AlertTriangle, ThumbsUp, Loader2, FileText, GitCompare, BookOpen, Filter, ExternalLink, Eye, Calendar, BarChart, ArrowUpDown, Info } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import FDA510kService from '@/services/FDA510kService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { literatureAPIService } from '@/services/LiteratureAPIService';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

/**
 * Predicate Finder Panel for 510(k) Submissions
 * 
 * This component enables users to enter device details and search for predicate
 * devices in the FDA database to establish substantial equivalence.
 */
const PredicateFinderPanel = ({ 
  deviceProfile, 
  setDeviceProfile, 
  documentId, 
  onPredicatesFound 
}) => {
  // State management
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPredicates, setSelectedPredicates] = useState([]);
  const [profileEditing, setProfileEditing] = useState(true);
  const [activeTab, setActiveTab] = useState("predicates");
  const [literatureResults, setLiteratureResults] = useState([]);
  const [isSearchingLiterature, setIsSearchingLiterature] = useState(false);
  const [selectedLiterature, setSelectedLiterature] = useState([]);
  const [literatureFilters, setLiteratureFilters] = useState({
    yearFrom: new Date().getFullYear() - 5,
    yearTo: new Date().getFullYear(),
    journalImpactFactor: "all",
    studyType: "all"
  });
  const [showLiteratureDetails, setShowLiteratureDetails] = useState(false);
  const [selectedLiteratureItem, setSelectedLiteratureItem] = useState(null);
  
  const [formData, setFormData] = useState({
    deviceName: deviceProfile?.deviceName || '',
    manufacturer: deviceProfile?.manufacturer || '',
    productCode: deviceProfile?.productCode || '',
    deviceClass: deviceProfile?.deviceClass || 'II',
    intendedUse: deviceProfile?.intendedUse || '',
    description: deviceProfile?.description || '',
    technicalSpecifications: deviceProfile?.technicalSpecifications || '',
    regulatoryClass: deviceProfile?.regulatoryClass || 'Class II'
  });
  
  const { toast } = useToast();
  
  // Initialize form data from device profile when component mounts or profile changes
  useEffect(() => {
    if (deviceProfile) {
      setFormData({
        deviceName: deviceProfile.deviceName || '',
        manufacturer: deviceProfile.manufacturer || '',
        productCode: deviceProfile.productCode || '',
        deviceClass: deviceProfile.deviceClass || 'II',
        intendedUse: deviceProfile.intendedUse || '',
        description: deviceProfile.description || '',
        technicalSpecifications: deviceProfile.technicalSpecifications || '',
        regulatoryClass: deviceProfile.regulatoryClass || 'Class II'
      });
      
      // Check for saved predicate selections
      const savedPredicates = localStorage.getItem('510k_selectedPredicates');
      if (savedPredicates) {
        try {
          const parsedPredicates = JSON.parse(savedPredicates);
          if (parsedPredicates && parsedPredicates.length > 0) {
            console.log('Restoring saved predicate selections:', parsedPredicates.length);
            setSelectedPredicates(parsedPredicates);
          }
        } catch (error) {
          console.error('Error restoring saved predicate selections:', error);
        }
      }
      
      // Check for saved search results
      const savedResults = localStorage.getItem('510k_searchResults');
      if (savedResults) {
        try {
          const parsedResults = JSON.parse(savedResults);
          if (parsedResults && parsedResults.length > 0) {
            console.log('Restoring saved search results:', parsedResults.length);
            setSearchResults(parsedResults);
          }
        } catch (error) {
          console.error('Error restoring saved search results:', error);
        }
      }
      
      // Check for saved literature results
      const savedLiterature = localStorage.getItem('510k_literatureResults');
      if (savedLiterature) {
        try {
          const parsedLiterature = JSON.parse(savedLiterature);
          if (parsedLiterature && parsedLiterature.length > 0) {
            console.log('Restoring saved literature results:', parsedLiterature.length);
            setLiteratureResults(parsedLiterature);
          }
        } catch (error) {
          console.error('Error restoring saved literature results:', error);
        }
      }
    }
  }, [deviceProfile]);
  
  // Handle form field updates
  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  // Save device profile with enhanced persistence and error handling
  const saveDeviceProfile = () => {
    // Validate required fields
    if (!formData.deviceName || !formData.manufacturer || !formData.intendedUse) {
      toast({
        title: "Missing Information",
        description: "Please enter at least the device name, manufacturer, and intended use",
        variant: "destructive"
      });
      return false;
    }
    
    // Create a complete updated profile with all necessary data
    const updatedProfile = {
      ...deviceProfile,
      ...formData,
      id: documentId || deviceProfile?.id || `device-${Date.now()}`,
      updatedAt: new Date().toISOString(),
      // Preserve any previously selected predicates
      predicateDevices: deviceProfile?.predicateDevices || selectedPredicates || []
    };
    
    // Log profile update for debugging
    console.log(`[510k] Updating device profile: ${updatedProfile.deviceName} (${updatedProfile.id})`);
    
    // Save to localStorage for persistence
    try {
      localStorage.setItem('510k_deviceProfile', JSON.stringify(updatedProfile));
      console.log(`[510k] Saved device profile to localStorage: ${updatedProfile.deviceName}`);
    } catch (storageError) {
      console.error('[510k] Failed to save device profile to localStorage:', storageError);
    }
    
    // Call the parent update function
    setDeviceProfile(updatedProfile);
    
    // Move to search phase
    setProfileEditing(false);
    
    // Show success toast
    toast({
      title: "Device Profile Saved",
      description: "Device information has been saved. You can now search for predicate devices.",
      variant: "success"
    });
    
    return true;
  };
  
  // Edit device profile (go back to editing mode)
  const editDeviceProfile = () => {
    setProfileEditing(true);
  };
  
  // Search for predicate devices in FDA database
  const searchPredicateDevices = async () => {
    if (!deviceProfile) {
      toast({
        title: "Missing Device Profile",
        description: "Please save your device profile before searching for predicates",
        variant: "destructive"
      });
      return;
    }
    
    setIsSearching(true);
    
    try {
      const results = await FDA510kService.searchPredicateDevices({
        deviceName: deviceProfile.deviceName,
        productCode: deviceProfile.productCode,
        manufacturer: deviceProfile.manufacturer
      });
      
      console.log(`[510k] Found ${results.length} potential predicate devices`);
      
      // Save search results to localStorage for persistence
      try {
        localStorage.setItem('510k_searchResults', JSON.stringify(results));
      } catch (error) {
        console.error('Failed to save search results to localStorage:', error);
      }
      
      setSearchResults(results);
      
      toast({
        title: "Search Complete",
        description: `Found ${results.length} potential predicate devices.`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error searching for predicate devices:', error);
      toast({
        title: "Search Error",
        description: "Failed to search for predicate devices. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  // Select/deselect a predicate device
  const togglePredicateSelection = (device) => {
    const isSelected = selectedPredicates.some(p => p.k_number === device.k_number);
    
    let updatedPredicates;
    if (isSelected) {
      updatedPredicates = selectedPredicates.filter(p => p.k_number !== device.k_number);
    } else {
      updatedPredicates = [...selectedPredicates, device];
    }
    
    // Update state
    setSelectedPredicates(updatedPredicates);
    
    // Save to localStorage for persistence
    try {
      localStorage.setItem('510k_selectedPredicates', JSON.stringify(updatedPredicates));
    } catch (error) {
      console.error('Failed to save predicate selections to localStorage:', error);
    }
  };
  
  // Complete predicate selection and move to the next step
  const completePredicateSelection = () => {
    if (selectedPredicates.length === 0) {
      toast({
        title: "No Predicates Selected",
        description: "Please select at least one predicate device",
        variant: "warning"
      });
      return;
    }
    
    // Update the device profile with selected predicates
    const updatedProfile = {
      ...deviceProfile,
      predicateDevices: selectedPredicates,
      updatedAt: new Date().toISOString()
    };
    
    // Save updated profile
    setDeviceProfile(updatedProfile);
    
    // Save to localStorage
    try {
      localStorage.setItem('510k_deviceProfile', JSON.stringify(updatedProfile));
    } catch (error) {
      console.error('Failed to save updated device profile to localStorage:', error);
    }
    
    // Notify parent component that predicates have been found and selected
    if (onPredicatesFound) {
      onPredicatesFound(selectedPredicates);
    }
    
    toast({
      title: "Predicates Selected",
      description: `You have selected ${selectedPredicates.length} predicate device(s) for your 510(k) submission.`,
      variant: "success"
    });
  };
  
  // Search for literature related to the device and predicates
  const searchRelatedLiterature = async () => {
    if (!deviceProfile) {
      toast({
        title: "Missing Device Profile",
        description: "Please save your device profile before searching for literature",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedPredicates.length === 0) {
      toast({
        title: "No Predicates Selected",
        description: "Please select at least one predicate device before searching for literature",
        variant: "warning"
      });
      return;
    }
    
    setIsSearchingLiterature(true);
    
    try {
      // Build search query combining device info and predicate device characteristics
      const predicateNames = selectedPredicates.map(p => p.device_name).join(', ');
      const searchQuery = `${deviceProfile.deviceName} ${deviceProfile.intendedUse} ${predicateNames}`;
      
      const results = await literatureAPIService.searchLiterature({
        query: searchQuery,
        filters: literatureFilters,
        limit: 20
      });
      
      console.log(`[510k] Found ${results.length} relevant literature items`);
      
      // Save literature results to localStorage for persistence
      try {
        localStorage.setItem('510k_literatureResults', JSON.stringify(results));
      } catch (error) {
        console.error('Failed to save literature results to localStorage:', error);
      }
      
      setLiteratureResults(results);
      
      toast({
        title: "Literature Search Complete",
        description: `Found ${results.length} relevant publications.`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error searching for literature:', error);
      toast({
        title: "Literature Search Error",
        description: "Failed to search for literature. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearchingLiterature(false);
    }
  };
  
  // Toggle selection of a literature item
  const toggleLiteratureSelection = (item) => {
    const isSelected = selectedLiterature.some(l => l.id === item.id);
    
    let updatedSelection;
    if (isSelected) {
      updatedSelection = selectedLiterature.filter(l => l.id !== item.id);
    } else {
      updatedSelection = [...selectedLiterature, item];
    }
    
    // Update state
    setSelectedLiterature(updatedSelection);
    
    // Save to localStorage for persistence
    try {
      localStorage.setItem('510k_selectedLiterature', JSON.stringify(updatedSelection));
    } catch (error) {
      console.error('Failed to save literature selections to localStorage:', error);
    }
  };
  
  // View details of a literature item
  const viewLiteratureDetails = (item) => {
    setSelectedLiteratureItem(item);
    setShowLiteratureDetails(true);
  };
  
  // Render device profile form
  const renderDeviceProfileForm = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Device Profile</CardTitle>
        <CardDescription>
          Enter information about your device to find appropriate predicates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deviceName">Device Name *</Label>
              <Input
                id="deviceName"
                placeholder="Enter device name"
                value={formData.deviceName}
                onChange={(e) => handleInputChange('deviceName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer *</Label>
              <Input
                id="manufacturer"
                placeholder="Enter manufacturer name"
                value={formData.manufacturer}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productCode">Product Code</Label>
              <Input
                id="productCode"
                placeholder="e.g., ABC"
                value={formData.productCode}
                onChange={(e) => handleInputChange('productCode', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deviceClass">Device Class</Label>
              <Select
                value={formData.deviceClass}
                onValueChange={(value) => handleInputChange('deviceClass', value)}
              >
                <SelectTrigger id="deviceClass">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="I">Class I</SelectItem>
                  <SelectItem value="II">Class II</SelectItem>
                  <SelectItem value="III">Class III</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="intendedUse">Intended Use *</Label>
            <Textarea
              id="intendedUse"
              placeholder="Describe the intended use of your device"
              value={formData.intendedUse}
              onChange={(e) => handleInputChange('intendedUse', e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Device Description</Label>
            <Textarea
              id="description"
              placeholder="Provide a description of your device"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="technicalSpecifications">Technical Specifications</Label>
            <Textarea
              id="technicalSpecifications"
              placeholder="Enter technical specifications of your device"
              value={formData.technicalSpecifications}
              onChange={(e) => handleInputChange('technicalSpecifications', e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={saveDeviceProfile}
          className="w-full"
        >
          Save Device Profile
        </Button>
      </CardFooter>
    </Card>
  );
  
  // Render predicate device search interface
  const renderPredicateSearch = () => (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Predicate Device Search</CardTitle>
            <CardDescription>
              Find substantially equivalent predicate devices for your 510(k) submission
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={editDeviceProfile}
          >
            Edit Device Profile
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Button 
              onClick={searchPredicateDevices}
              disabled={isSearching}
              className="flex items-center space-x-2"
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span>{isSearching ? 'Searching...' : 'Search FDA Database'}</span>
            </Button>
            
            {selectedPredicates.length > 0 && (
              <Button
                variant="default"
                onClick={completePredicateSelection}
              >
                <Check className="h-4 w-4 mr-2" />
                <span>Complete Selection ({selectedPredicates.length})</span>
              </Button>
            )}
          </div>
          
          {/* Quick summary of the current device */}
          <div className="bg-blue-50 p-3 rounded-md">
            <h4 className="font-medium text-blue-800 mb-1">Current Device</h4>
            <p className="text-sm text-blue-700">{deviceProfile.deviceName} by {deviceProfile.manufacturer}</p>
            <p className="text-xs text-blue-600 mt-1">{deviceProfile.intendedUse?.substring(0, 150)}...</p>
          </div>
          
          {/* Display predicate search results */}
          {searchResults.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Search Results ({searchResults.length})</h4>
              <ScrollArea className="h-[300px] rounded-md border p-2">
                <div className="space-y-3">
                  {searchResults.map((device) => {
                    const isSelected = selectedPredicates.some(p => p.k_number === device.k_number);
                    return (
                      <div 
                        key={device.k_number} 
                        className={`p-3 rounded-md border ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium">{device.device_name}</h5>
                            <p className="text-sm text-gray-600">{device.applicant}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline">{device.k_number}</Badge>
                              <Badge variant="outline">{new Date(device.decision_date).toLocaleDateString()}</Badge>
                            </div>
                          </div>
                          <Button
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => togglePredicateSelection(device)}
                          >
                            {isSelected ? <Check className="h-4 w-4" /> : 'Select'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}
          
          {/* No results message */}
          {searchResults.length === 0 && !isSearching && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Search className="h-12 w-12 text-gray-400 mb-4" />
              <h4 className="text-xl font-medium text-gray-700">No predicate devices found</h4>
              <p className="text-gray-500 mt-2 max-w-md">
                Try searching the FDA database to find predicate devices for your 510(k) submission.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
  
  // Render literature tab content
  const renderLiteratureContent = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Supporting Literature</CardTitle>
        <CardDescription>
          Find relevant scientific literature to support your 510(k) submission
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Button 
              onClick={searchRelatedLiterature}
              disabled={isSearchingLiterature}
              className="flex items-center space-x-2"
            >
              {isSearchingLiterature ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
              <span>{isSearchingLiterature ? 'Searching...' : 'Search Literature'}</span>
            </Button>
            
            {selectedLiterature.length > 0 && (
              <Badge variant="outline" className="ml-2">
                {selectedLiterature.length} selected
              </Badge>
            )}
          </div>
          
          {/* Literature search filters */}
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="flex items-center space-x-2 mb-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <h4 className="font-medium text-gray-800">Search Filters</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-2">
              <div className="space-y-1">
                <Label htmlFor="yearFrom" className="text-xs">From Year</Label>
                <Input
                  id="yearFrom"
                  type="number"
                  value={literatureFilters.yearFrom}
                  onChange={(e) => setLiteratureFilters({
                    ...literatureFilters,
                    yearFrom: parseInt(e.target.value) || new Date().getFullYear() - 5
                  })}
                  className="h-8"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="yearTo" className="text-xs">To Year</Label>
                <Input
                  id="yearTo"
                  type="number"
                  value={literatureFilters.yearTo}
                  onChange={(e) => setLiteratureFilters({
                    ...literatureFilters,
                    yearTo: parseInt(e.target.value) || new Date().getFullYear()
                  })}
                  className="h-8"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="journalImpactFactor" className="text-xs">Journal Quality</Label>
                <Select
                  value={literatureFilters.journalImpactFactor}
                  onValueChange={(value) => setLiteratureFilters({
                    ...literatureFilters,
                    journalImpactFactor: value
                  })}
                >
                  <SelectTrigger id="journalImpactFactor" className="h-8">
                    <SelectValue placeholder="Impact Factor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Journals</SelectItem>
                    <SelectItem value="high">High Impact (IF {'>'}5)</SelectItem>
                    <SelectItem value="medium">Medium Impact (IF 2-5)</SelectItem>
                    <SelectItem value="low">Low Impact (IF {'<'}2)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="studyType" className="text-xs">Study Type</Label>
                <Select
                  value={literatureFilters.studyType}
                  onValueChange={(value) => setLiteratureFilters({
                    ...literatureFilters,
                    studyType: value
                  })}
                >
                  <SelectTrigger id="studyType" className="h-8">
                    <SelectValue placeholder="Study Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Studies</SelectItem>
                    <SelectItem value="clinical">Clinical Trials</SelectItem>
                    <SelectItem value="meta">Meta-Analyses</SelectItem>
                    <SelectItem value="review">Systematic Reviews</SelectItem>
                    <SelectItem value="case">Case Studies</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Display literature search results */}
          {literatureResults.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Literature Results ({literatureResults.length})</h4>
              <ScrollArea className="h-[300px] rounded-md border p-2">
                <div className="space-y-3">
                  {literatureResults.map((item) => {
                    const isSelected = selectedLiterature.some(l => l.id === item.id);
                    return (
                      <div 
                        key={item.id} 
                        className={`p-3 rounded-md border ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-medium">{item.title}</h5>
                            <p className="text-sm text-gray-600 mt-1">{item.authors}</p>
                            <p className="text-xs text-gray-500 mt-1">{item.journal}, {item.year}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="outline">{item.type || 'Article'}</Badge>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-6 w-6"
                                      onClick={() => viewLiteratureDetails(item)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>View Details</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              {item.url && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6"
                                        onClick={() => window.open(item.url, '_blank')}
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Open Source</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </div>
                          <Button
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleLiteratureSelection(item)}
                          >
                            {isSelected ? <Check className="h-4 w-4" /> : 'Select'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}
          
          {/* No literature results message */}
          {literatureResults.length === 0 && !isSearchingLiterature && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
              <h4 className="text-xl font-medium text-gray-700">No literature found</h4>
              <p className="text-gray-500 mt-2 max-w-md">
                Search for relevant scientific literature to support your substantial equivalence claims.
              </p>
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Literature details dialog */}
      <Dialog open={showLiteratureDetails} onOpenChange={setShowLiteratureDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedLiteratureItem?.title}</DialogTitle>
            <DialogDescription>
              {selectedLiteratureItem?.authors} · {selectedLiteratureItem?.journal}, {selectedLiteratureItem?.year}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Publication Type</h4>
                <p>{selectedLiteratureItem?.type || 'Article'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Published Date</h4>
                <p>{selectedLiteratureItem?.date || `${selectedLiteratureItem?.year}`}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">DOI</h4>
                <p>{selectedLiteratureItem?.doi || 'N/A'}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Abstract</h4>
              <p className="text-sm mt-1">{selectedLiteratureItem?.abstract || 'No abstract available'}</p>
            </div>
            
            {selectedLiteratureItem?.keywords && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Keywords</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedLiteratureItem.keywords.split(',').map((keyword, idx) => (
                    <Badge key={idx} variant="secondary">{keyword.trim()}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {selectedLiteratureItem?.relevance && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Relevance to Your Device</h4>
                <p className="text-sm mt-1">{selectedLiteratureItem.relevance}</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLiteratureDetails(false)}>Close</Button>
            {selectedLiteratureItem?.url && (
              <Button onClick={() => window.open(selectedLiteratureItem.url, '_blank')}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Source
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
  
  // Main component render
  return (
    <div className="space-y-4">
      {/* Display device profile form when in editing mode */}
      {profileEditing ? (
        renderDeviceProfileForm()
      ) : (
        <div>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="predicates">Predicate Devices</TabsTrigger>
              <TabsTrigger value="literature">Supporting Literature</TabsTrigger>
            </TabsList>
            
            <TabsContent value="predicates">
              {renderPredicateSearch()}
            </TabsContent>
            
            <TabsContent value="literature">
              {renderLiteratureContent()}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default PredicateFinderPanel;