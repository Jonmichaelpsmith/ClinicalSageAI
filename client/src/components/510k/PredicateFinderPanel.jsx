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
import { FDA510kService } from '@/services/FDA510kService';
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
  
  // Initialize form with existing device profile data if available
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
      
      // If profile seems complete, move to search phase
      if (deviceProfile.deviceName && deviceProfile.intendedUse && deviceProfile.manufacturer) {
        setProfileEditing(false);
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
  
  // Save device profile
  const saveDeviceProfile = () => {
    // Validate required fields
    if (!formData.deviceName || !formData.manufacturer || !formData.intendedUse) {
      toast({
        title: "Missing Information",
        description: "Please enter at least the device name, manufacturer, and intended use",
        variant: "destructive"
      });
      return;
    }
    
    // Update device profile state
    const updatedProfile = {
      ...deviceProfile,
      ...formData,
      id: documentId || deviceProfile?.id || `device-${Date.now()}`,
      updatedAt: new Date().toISOString()
    };
    
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
  };
  
  // Edit device profile (go back to editing mode)
  const editDeviceProfile = () => {
    setProfileEditing(true);
  };
  
  // Search for predicate devices using the integrated Document Vault profile
  const searchForPredicates = async () => {
    setIsSearching(true);
    
    try {
      // Use device profile from vault if available, otherwise use form data
      const searchProfile = deviceProfile?.documentVaultId ? deviceProfile : formData;
      
      console.log('Searching for predicates with device profile:', searchProfile);
      
      // Log if we're using the Document Vault integrated profile
      if (deviceProfile?.documentVaultId) {
        console.log('Using Document Vault integrated profile with ID:', deviceProfile.documentVaultId);
      }
      
      // Get organization context if available
      const organizationId = deviceProfile?.organizationId;
      
      // Use the enhanced service to search with the proper context
      const results = await FDA510kService.findPredicatesAndLiterature(
        searchProfile,
        organizationId
      );
      
      if (results.success && results.predicateDevices?.length > 0) {
        // Store search results
        setSearchResults(results.predicateDevices);
        
        // If we have a valid device profile with Document Vault integration, save the search results
        if (deviceProfile?.folderStructure?.predicatesFolderId) {
          try {
            // Save the predicate search results to the Document Vault
            await savePredicateSearchResults(
              deviceProfile.folderStructure.predicatesFolderId,
              results.predicateDevices,
              results.searchQueries
            );
          } catch (vaultError) {
            console.error('Error saving predicate results to vault:', vaultError);
            // Non-fatal error, just log it and continue
          }
        }
        
        toast({
          title: "Predicate Devices Found",
          description: `Found ${results.predicateDevices.length} potential predicate devices that match your criteria.`,
          variant: "success"
        });
      } else {
        toast({
          title: "Search Results",
          description: "No matching predicate devices found. Try adjusting your search terms.",
          variant: "warning"
        });
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching for predicates:", error);
      toast({
        title: "Search Error",
        description: "We encountered an error while searching for predicate devices. Please try again.",
        variant: "destructive"
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Save predicate search results to Document Vault
  const savePredicateSearchResults = async (folderId, predicates, searchQueries) => {
    try {
      // Create search results JSON
      const searchResultsData = {
        predicates: predicates,
        searchQueries: searchQueries,
        searchDate: new Date().toISOString(),
        deviceProfile: deviceProfile
      };
      
      // Create a blob from the search results
      const jsonBlob = new Blob([JSON.stringify(searchResultsData, null, 2)], { 
        type: 'application/json' 
      });
      
      // Create a file from the blob
      const jsonFile = new File([jsonBlob], 'predicate-search-results.json', { 
        type: 'application/json' 
      });
      
      // Upload the file to the Document Vault using FDA510kService
      const result = await FDA510kService.savePredicateSearchResults(
        folderId,
        jsonFile,
        deviceProfile.id
      );
      
      console.log('Predicate search results saved to vault:', result);
      return result;
    } catch (error) {
      console.error('Error saving predicate search results:', error);
      throw error;
    }
  };
  
  // Toggle a predicate device selection
  const togglePredicateSelection = (predicate) => {
    if (selectedPredicates.some(p => p.id === predicate.id)) {
      // Remove from selection
      setSelectedPredicates(selectedPredicates.filter(p => p.id !== predicate.id));
    } else {
      // Add to selection (limit to 3)
      if (selectedPredicates.length < 3) {
        setSelectedPredicates([...selectedPredicates, predicate]);
      } else {
        toast({
          title: "Selection Limit Reached",
          description: "You can select up to three predicate devices for comparison.",
          variant: "warning"
        });
      }
    }
  };
  
  // Complete the predicate selection and move to next step
  const completePredicateSelection = async () => {
    if (selectedPredicates.length === 0) {
      toast({
        title: "No Predicates Selected",
        description: "Please select at least one predicate device for your 510(k) submission.",
        variant: "warning"
      });
      return;
    }
    
    // Show loading indicator
    setIsSearching(true);
    
    try {
      // If we have Document Vault integration, save the selected predicates
      if (deviceProfile?.folderStructure?.predicatesFolderId) {
        // Create data object with selected predicates
        const predicateSelectionData = {
          selectedPredicates,
          deviceProfile,
          selectionDate: new Date().toISOString(),
          selectionRationale: "Selected by user for 510(k) substantial equivalence comparison"
        };
        
        // Convert to JSON file
        const jsonBlob = new Blob([JSON.stringify(predicateSelectionData, null, 2)], {
          type: 'application/json'
        });
        
        // Create file object for upload
        const jsonFile = new File([jsonBlob], 'selected-predicates.json', {
          type: 'application/json'
        });
        
        // Upload to Document Vault
        await FDA510kService.savePredicateSearchResults(
          deviceProfile.folderStructure.predicatesFolderId,
          jsonFile,
          deviceProfile.id
        );
        
        console.log('Selected predicates saved to Document Vault successfully');
      }
      
      // Call the parent component's callback to move to the next step
      if (onPredicatesFound) {
        // Create enhanced predicates with device profile context
        const enhancedPredicates = selectedPredicates.map(predicate => ({
          ...predicate,
          comparisonWithSubject: {
            subjectDevice: deviceProfile,
            predicateDevice: predicate,
            comparisonInitiated: new Date().toISOString()
          }
        }));
        
        onPredicatesFound(enhancedPredicates);
      }
      
      toast({
        title: "Predicate Selection Complete",
        description: `Selected ${selectedPredicates.length} predicate devices for your submission.`,
        variant: "success"
      });
    } catch (error) {
      console.error('Error saving selected predicates:', error);
      toast({
        title: "Warning",
        description: "Selected predicates will be used, but there was an issue saving them to Document Vault.",
        variant: "warning"
      });
      
      // Still call the parent callback to continue the workflow
      if (onPredicatesFound) {
        onPredicatesFound(selectedPredicates);
      }
    } finally {
      setIsSearching(false);
    }
  };
  
  // Render device profile form
  const renderProfileForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="deviceName">Device Name <span className="text-red-500">*</span></Label>
          <Input 
            id="deviceName"
            value={formData.deviceName}
            onChange={(e) => handleInputChange('deviceName', e.target.value)}
            placeholder="Enter the name of your medical device"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="manufacturer">Manufacturer <span className="text-red-500">*</span></Label>
          <Input 
            id="manufacturer"
            value={formData.manufacturer}
            onChange={(e) => handleInputChange('manufacturer', e.target.value)}
            placeholder="Enter the manufacturer name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="productCode">FDA Product Code</Label>
          <Input 
            id="productCode"
            value={formData.productCode}
            onChange={(e) => handleInputChange('productCode', e.target.value)}
            placeholder="e.g., LLZ, DYB, etc."
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="deviceClass">Device Class</Label>
          <Select 
            value={formData.deviceClass}
            onValueChange={(value) => handleInputChange('deviceClass', value)}
          >
            <SelectTrigger id="deviceClass">
              <SelectValue placeholder="Select device class" />
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
        <Label htmlFor="intendedUse">Intended Use <span className="text-red-500">*</span></Label>
        <Textarea 
          id="intendedUse"
          value={formData.intendedUse}
          onChange={(e) => handleInputChange('intendedUse', e.target.value)}
          placeholder="Describe the intended use of your device"
          rows={3}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Device Description</Label>
        <Textarea 
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Provide a detailed description of your device"
          rows={3}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="technicalSpecifications">Technical Specifications</Label>
        <Textarea 
          id="technicalSpecifications"
          value={formData.technicalSpecifications}
          onChange={(e) => handleInputChange('technicalSpecifications', e.target.value)}
          placeholder="List technical specifications and standards compliance"
          rows={3}
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button 
          variant="outline" 
          onClick={() => {
            // Reset form to original device profile data
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
            }
          }}
        >
          Reset
        </Button>
        <Button onClick={saveDeviceProfile}>
          Save Device Profile
        </Button>
      </div>
    </div>
  );
  
  // Render predicate device search interface
  const renderPredicateSearch = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Device Profile</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p className="font-medium">{formData.deviceName}</p>
              <p>{formData.manufacturer}</p>
              <p className="mt-1 text-sm text-blue-600 line-clamp-2">{formData.intendedUse}</p>
            </div>
            <div className="mt-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 px-2 text-xs border-blue-200 text-blue-700 hover:bg-blue-100"
                onClick={editDeviceProfile}
              >
                Edit Device Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Find Predicate Devices</h3>
          <Button 
            onClick={searchForPredicates} 
            disabled={isSearching}
            className="flex items-center"
          >
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search FDA Database
              </>
            )}
          </Button>
        </div>
        
        {/* Search results */}
        {searchResults.length > 0 ? (
          <div className="space-y-3">
            <div className="bg-gray-50 py-2 px-3 rounded-md">
              <p className="text-sm text-gray-700">
                Select up to <span className="font-medium">three</span> predicate devices to establish substantial equivalence. Choose devices with high match scores for better comparison.
              </p>
            </div>
            
            <ScrollArea className="h-[360px] rounded-md border">
              <div className="divide-y">
                {searchResults.map((predicate) => (
                  <div 
                    key={predicate.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      selectedPredicates.some(p => p.id === predicate.id) ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => togglePredicateSelection(predicate)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <h4 className="font-medium text-gray-900">{predicate.deviceName || predicate.name}</h4>
                          <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                            {predicate.id}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{predicate.manufacturer}</p>
                        <p className="text-sm text-gray-700 max-w-3xl">{predicate.intendedUse}</p>
                        <div className="pt-1 flex items-center space-x-3 text-xs text-gray-500">
                          {predicate.productCode && (
                            <span>Product Code: {predicate.productCode}</span>
                          )}
                          {predicate.decisionDate && (
                            <span>Decision: {predicate.decisionDate}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                          selectedPredicates.some(p => p.id === predicate.id) 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {selectedPredicates.some(p => p.id === predicate.id) ? (
                            <Check className="h-4 w-4" />
                          ) : null}
                        </div>
                        
                        <div className="mt-1 flex items-center space-x-1">
                          <span className="text-sm font-medium">
                            Match:
                          </span>
                          <span className={`text-sm font-medium ${
                            predicate.matchScore >= 0.9 ? 'text-green-600' :
                            predicate.matchScore >= 0.8 ? 'text-blue-600' :
                            'text-amber-600'
                          }`}>
                            {Math.round(predicate.matchScore * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="flex justify-between items-center pt-2">
              <div className="text-sm text-gray-600">
                {selectedPredicates.length > 0 ? (
                  <span>
                    Selected {selectedPredicates.length} predicate device{selectedPredicates.length !== 1 ? 's' : ''}
                  </span>
                ) : (
                  <span>No predicate devices selected</span>
                )}
              </div>
              
              <Button 
                onClick={completePredicateSelection}
                disabled={selectedPredicates.length === 0}
                className="flex items-center"
              >
                <GitCompare className="mr-2 h-4 w-4" />
                Proceed to Equivalence Analysis
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center p-8 border rounded-md bg-gray-50">
            <Search className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No Predicate Devices Found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Use the search button above to find FDA-cleared devices similar to yours.
            </p>
          </div>
        )}
      </div>
    </div>
  );
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-blue-50 border-b">
        <CardTitle className="text-blue-800 flex items-center">
          <Search className="mr-2 h-5 w-5 text-blue-600" />
          Predicate Device Finder
        </CardTitle>
        <CardDescription>
          Find suitable predicate devices to establish substantial equivalence for your 510(k) submission
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {profileEditing ? renderProfileForm() : renderPredicateSearch()}
      </CardContent>
    </Card>
  );
};

export default PredicateFinderPanel;