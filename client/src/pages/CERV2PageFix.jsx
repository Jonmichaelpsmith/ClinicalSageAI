import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { DeviceProfileForm } from '@/components/cer/DeviceProfileForm';
import { CerValidationPanel } from '@/components/cer/CerValidationPanel';
import { DeviceProfileDialog } from '@/components/cer/DeviceProfileDialog';
import { PredicateDeviceComparison } from '@/components/cer/PredicateDeviceComparison';
import { DebugPanel } from '@/components/cer/DebugPanel';
import { getDeviceProfiles, createDeviceProfile } from '@/services/cerService';
import { submitPredicateSearch } from '@/services/FDA510kService';
import { AlertCircle, CheckCircle, ChevronRight, FileText, AlertTriangle, Info, BugIcon } from 'lucide-react';
import { PredicateComparison } from '@/components/510k/PredicateComparison';
import { getFeatureFlag } from '@/flags/featureFlags';

const CERV2Page = () => {
  const [activeTab, setActiveTab] = useState('clinical');
  const [deviceProfiles, setDeviceProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [predicateData, setPredicateData] = useState(null);
  const [predicateSearchResults, setPredicateSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [createProfileOpen, setCreateProfileOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDeviceProfiles();
  }, []);

  const loadDeviceProfiles = async () => {
    try {
      const profiles = await getDeviceProfiles();
      setDeviceProfiles(profiles);
    } catch (error) {
      console.error("Failed to load device profiles:", error);
      toast({
        title: "Error",
        description: "Failed to load device profiles. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateProfile = async (data) => {
    try {
      const newProfile = await createDeviceProfile(data);
      setDeviceProfiles([...deviceProfiles, newProfile]);
      setSelectedProfile(newProfile);
      setCreateProfileOpen(false);
      toast({
        title: "Success",
        description: "Device profile created successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to create device profile:", error);
      toast({
        title: "Error",
        description: "Failed to create device profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSelectProfile = (profile) => {
    setSelectedProfile(profile);
    // Reset predicate data when selecting a new profile
    setPredicateData(null);
    setPredicateSearchResults([]);
    setValidationResult(null);
  };

  const handlePredicateSearch = async () => {
    if (!selectedProfile) {
      toast({
        title: "Error",
        description: "Please select a device profile first.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const results = await submitPredicateSearch({
        deviceName: selectedProfile.deviceName,
        deviceType: selectedProfile.deviceType,
        regulationNumber: selectedProfile.regulationNumber,
        intendedUse: selectedProfile.intendedUse
      });
      setPredicateSearchResults(results);
      if (results.length === 0) {
        toast({
          title: "No Results",
          description: "No predicate devices found. Try adjusting your search criteria.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Failed to search for predicate devices:", error);
      toast({
        title: "Error",
        description: "Failed to search for predicate devices. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPredicate = (predicate) => {
    setPredicateData(predicate);
  };

  const runComplianceCheck = async () => {
    if (!selectedProfile) {
      toast({
        title: "Error",
        description: "Please select a device profile first.",
        variant: "destructive",
      });
      return;
    }

    if (!predicateData) {
      toast({
        title: "Error",
        description: "Please select a predicate device first.",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    try {
      // Simulate a validation result
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockValidationResult = {
        status: "success",
        issues: [],
        sections: {
          "device-description": { status: "passed", message: "Device description is compliant." },
          "intended-use": { status: "passed", message: "Intended use is compatible with predicate device." },
          "technical-characteristics": { status: "warning", message: "Some technical characteristics differ from predicate. Ensure substantial equivalence." },
          "performance-data": { status: "info", message: "Consider adding additional performance testing for full compliance." }
        }
      };
      
      setValidationResult(mockValidationResult);
      toast({
        title: "Validation Complete",
        description: "Compliance check completed successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to run compliance check:", error);
      toast({
        title: "Error",
        description: "Failed to run compliance check. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const generateDraft = async () => {
    if (!selectedProfile) {
      toast({
        title: "Error",
        description: "Please select a device profile first.",
        variant: "destructive",
      });
      return;
    }

    if (!predicateData) {
      toast({
        title: "Error",
        description: "Please select a predicate device first.",
        variant: "destructive",
      });
      return;
    }

    if (!validationResult) {
      toast({
        title: "Error",
        description: "Please run the compliance check first.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Generating Draft",
      description: "Generating the 510(k) draft submission...",
      variant: "default",
    });

    // Simulate draft generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast({
      title: "Draft Generated",
      description: "The 510(k) draft has been successfully generated and is ready for review.",
      variant: "default",
    });
  };

  return (
    <div className="p-4 max-w-[1400px] mx-auto">
      <h1 className="text-2xl font-bold text-blue-700 mb-2">510(k) Automation Pipeline</h1>
      <p className="text-gray-600 mb-6">Complete automation pipeline for FDA 510(k) submissions with intelligent predicate discovery.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Device Profile Card */}
          <Card className="border-blue-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-blue-700">
                <FileText className="h-5 w-5 mr-2" />
                1. Device Profile
              </CardTitle>
              <CardDescription>Define your medical device details</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedProfile ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{selectedProfile.deviceName}</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedProfile(null)}
                    >
                      Change
                    </Button>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p><span className="font-medium">Type:</span> {selectedProfile.deviceType}</p>
                    <p><span className="font-medium">Regulation:</span> {selectedProfile.regulationNumber}</p>
                    <p><span className="font-medium">Class:</span> {selectedProfile.deviceClass}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Alert variant="warning" className="bg-amber-50 text-amber-800 border-amber-200">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Device profile required</AlertTitle>
                    <AlertDescription>
                      Please select or create a device profile first.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex flex-col gap-3">
                    {deviceProfiles.length > 0 ? (
                      <>
                        <div className="text-sm font-medium mb-1">Select an existing profile:</div>
                        {deviceProfiles.map((profile) => (
                          <Button 
                            key={profile.id} 
                            variant="outline" 
                            className="justify-start"
                            onClick={() => handleSelectProfile(profile)}
                          >
                            {profile.deviceName}
                          </Button>
                        ))}
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">No device profiles available.</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0">
              <Dialog open={createProfileOpen} onOpenChange={setCreateProfileOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    {selectedProfile ? "Edit Profile" : "Create New Device Profile"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Device Profile</DialogTitle>
                    <DialogDescription>
                      Enter the details of your medical device to create a new profile.
                    </DialogDescription>
                  </DialogHeader>
                  <DeviceProfileForm onSubmit={handleCreateProfile} initialData={selectedProfile} />
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>

          {/* Predicate Finder Card */}
          <Card className={`border-blue-100 shadow-sm ${!selectedProfile ? 'opacity-70' : ''}`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-blue-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                2. Predicate Finder
              </CardTitle>
              <CardDescription>Find and select appropriate predicate devices</CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedProfile ? (
                <Alert variant="warning" className="bg-amber-50 text-amber-800 border-amber-200">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Device profile required</AlertTitle>
                  <AlertDescription>
                    Please select or create a device profile before finding predicate devices.
                  </AlertDescription>
                </Alert>
              ) : predicateData ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{predicateData.deviceName}</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setPredicateData(null)}
                    >
                      Change
                    </Button>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p><span className="font-medium">K Number:</span> {predicateData.kNumber}</p>
                    <p><span className="font-medium">Decision Date:</span> {predicateData.decisionDate}</p>
                    <p><span className="font-medium">Applicant:</span> {predicateData.applicant}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm">
                    {predicateSearchResults.length > 0 
                      ? "Select a predicate device from the search results:"
                      : "Search for appropriate predicate devices based on your device profile."}
                  </p>
                  
                  {predicateSearchResults.length > 0 ? (
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {predicateSearchResults.map((device, index) => (
                        <Button 
                          key={index} 
                          variant="outline" 
                          className="w-full justify-start text-left"
                          onClick={() => handleSelectPredicate(device)}
                        >
                          <div className="truncate">
                            <div className="font-medium">{device.deviceName}</div>
                            <div className="text-xs text-gray-500">{device.kNumber} • {device.applicant}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                      <Info className="h-4 w-4" />
                      <AlertTitle>Find similar devices</AlertTitle>
                      <AlertDescription>
                        Click the search button to find predicate devices that match your device profile.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0">
              <Button 
                className="w-full" 
                onClick={handlePredicateSearch}
                disabled={!selectedProfile || isSearching}
              >
                {isSearching ? "Searching..." : predicateData ? "Search Again" : "Search Predicates"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Compliance Checker Card */}
          <Card className={`border-blue-100 shadow-sm ${(!selectedProfile || !predicateData) ? 'opacity-70' : ''}`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-red-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                4. Compliance Checker
              </CardTitle>
              <CardDescription>Validate against FDA requirements.</CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedProfile || !predicateData ? (
                <Alert variant="warning" className="bg-amber-50 text-amber-800 border-amber-200">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Device profile required</AlertTitle>
                  <AlertDescription>
                    Please select or create a device profile first.
                  </AlertDescription>
                </Alert>
              ) : validationResult ? (
                <div className="space-y-3">
                  <Alert variant={validationResult.status === "success" ? "default" : "warning"} className={
                    validationResult.status === "success" 
                      ? "bg-green-50 text-green-800 border-green-200" 
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  }>
                    {validationResult.status === "success" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertTitle>
                      {validationResult.status === "success" 
                        ? "Validation Passed" 
                        : "Validation Completed with Issues"}
                    </AlertTitle>
                    <AlertDescription>
                      {validationResult.status === "success"
                        ? "Your submission meets all FDA requirements and is ready for submission."
                        : "Your submission has some issues that need to be addressed."}
                    </AlertDescription>
                  </Alert>
                  
                  <Collapsible className="space-y-2">
                    <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-left text-blue-900 bg-blue-50 rounded-md hover:bg-blue-100">
                      View Details
                      <ChevronRight className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 pt-2">
                      {Object.entries(validationResult.sections).map(([key, section]) => (
                        <div key={key} className="rounded-md p-3 text-sm" style={{
                          backgroundColor: section.status === "passed" 
                            ? "rgba(34, 197, 94, 0.1)" 
                            : section.status === "warning" 
                              ? "rgba(245, 158, 11, 0.1)" 
                              : "rgba(59, 130, 246, 0.1)",
                          borderLeft: `4px solid ${
                            section.status === "passed" 
                              ? "rgb(34, 197, 94)" 
                              : section.status === "warning" 
                                ? "rgb(245, 158, 11)" 
                                : "rgb(59, 130, 246)"
                          }`
                        }}>
                          <div className="font-medium mb-1">{key.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</div>
                          <div>{section.message}</div>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm">
                    AI-powered checks verify that your submission meets all FDA requirements and is ready for submission.
                  </p>
                  <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Ready for validation</AlertTitle>
                    <AlertDescription>
                      Click the button below to run compliance checks against FDA requirements.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0">
              <Button 
                className="w-full" 
                onClick={runComplianceCheck}
                disabled={!selectedProfile || !predicateData || isValidating}
              >
                {isValidating ? "Validating..." : validationResult ? "Run Compliance Check Again" : "Run Compliance Check"}
              </Button>
            </CardFooter>
          </Card>

          {/* One-Click Draft Card */}
          <Card className={`border-blue-100 shadow-sm ${(!selectedProfile || !predicateData || !validationResult) ? 'opacity-70' : ''}`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-purple-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                3. One-Click 510(k) Draft
              </CardTitle>
              <CardDescription>AI-draft all required sections and assemble eSTAR package.</CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedProfile || !predicateData || !validationResult ? (
                <Alert variant="warning" className="bg-amber-50 text-amber-800 border-amber-200">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Device profile required</AlertTitle>
                  <AlertDescription>
                    Please select or create a device profile before generating a draft.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm">
                    Generate a complete draft of your 510(k) submission with all required sections, formatted according to FDA guidelines.
                  </p>
                  <Alert className="bg-purple-50 text-purple-800 border-purple-200">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Ready for generation</AlertTitle>
                    <AlertDescription>
                      Click the button below to generate your complete 510(k) draft with eSTAR package.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0">
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={generateDraft}
                disabled={!selectedProfile || !predicateData || !validationResult}
              >
                One-Click 510(k) Draft
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Debug Panel */}
      <div className="mt-8">
        <Collapsible open={showDebugPanel} onOpenChange={setShowDebugPanel} className="w-full">
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <BugIcon className="h-5 w-5 mr-2 text-amber-600" />
                <span className="text-amber-800 font-semibold">Debug Panel</span>
              </div>
              <ChevronRight className={`h-5 w-5 transition-transform ${showDebugPanel ? 'rotate-90' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 p-4 border rounded-md bg-gray-50">
            <div className="text-sm text-gray-700">
              <h3 className="font-medium mb-2">Troubleshooting panel for 510(k) insights module</h3>
              <div className="space-y-2">
                <div><span className="font-medium">Selected Profile:</span> {selectedProfile ? selectedProfile.deviceName : 'None'}</div>
                <div><span className="font-medium">Predicate Data:</span> {predicateData ? predicateData.kNumber : 'None'}</div>
                <div><span className="font-medium">Validation Status:</span> {validationResult ? validationResult.status : 'Not run'}</div>
                <div><span className="font-medium">Feature Flags:</span> {JSON.stringify(getFeatureFlag('ENABLE_510K_ADVANCED_FEATURES'))}</div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default CERV2Page;