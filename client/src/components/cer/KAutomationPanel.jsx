import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { 
  Upload, Search, FilePlus, BarChart, ArrowRight, Shield, Zap, 
  FileCheck, CheckCircle2, AlertTriangle, Lightbulb, Bot, Star, ListChecks, BookOpen, 
  Clock, Info, Check, Brain, Activity, FileText, Undo2, Users, Plus, Database,
  ChevronDown, ExternalLink, Bug, AlertCircle, BookmarkPlus, Calendar,
  ChevronUp, ListPlus, Settings, PlusCircle, RefreshCw, ChevronRight, CheckCircle
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import PredicateFinderPanel from '@/components/510k/PredicateFinderPanel';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ToastAction } from "@/components/ui/toast";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from 'date-fns';
import DeviceProfileForm from './DeviceProfileForm';
import DeviceProfileList from './DeviceProfileList';
import DeviceProfileDialog from './DeviceProfileDialog';
import { postDeviceProfile, getDeviceProfiles } from '../../api/cer';
// Import the service directly
import FDA510kService from '../../services/FDA510kService';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

export default function KAutomationPanel() {
  const [activeTab, setActiveTab] = useState('workflow');
  const [workflowSubTab, setWorkflowSubTab] = useState('devices');
  const [aiProcessing, setAiProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [aiInsights, setAiInsights] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [deviceProfileDialogOpen, setDeviceProfileDialogOpen] = useState(false);
  const [deviceProfileSubmitted, setDeviceProfileSubmitted] = useState(false);
  const [currentDeviceProfile, setCurrentDeviceProfile] = useState(null);
  const [predicateSearchResults, setPredicateSearchResults] = useState([]);
  const [isSearchingPredicates, setIsSearchingPredicates] = useState(false);
  const [recommendedPredicates, setRecommendedPredicates] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [showDeviceProfileDialog, setShowDeviceProfileDialog] = useState(false);
  const { currentOrganization } = useTenant();
  const { toast } = useToast();
  
  // Query to fetch device profiles
  const { 
    data: deviceProfiles, 
    isLoading: isLoadingProfiles, 
    isError: isProfileError, 
    refetch: refetchProfiles 
  } = useQuery({
    queryKey: ['/api/cer/device-profile/organization', currentOrganization?.id],
    queryFn: () => getDeviceProfiles(currentOrganization?.id),
    enabled: !!currentOrganization?.id,
    staleTime: 30000, // 30 seconds
    onSuccess: (data) => {
      // If there's a current device and it's in the returned data, update it
      if (currentDeviceProfile && data.some(profile => profile.id === currentDeviceProfile.id)) {
        const updated = data.find(profile => profile.id === currentDeviceProfile.id);
        setCurrentDeviceProfile(updated);
      }
    }
  });

  // Handle device profile form submission
  const handleSubmitDeviceProfile = async (data) => {
    try {
      // Show progress and clear errors
      setAiProcessing(true);
      setErrorMessage('');
      
      // Call API to save the device profile
      const response = await postDeviceProfile(data);
      
      // Update state with the new device profile
      setCurrentDeviceProfile(response);
      setDeviceProfileSubmitted(true);
      
      // Close the dialog
      setDeviceProfileDialogOpen(false);
      
      // Refresh the device profiles list
      refetchProfiles();
      
      // Show success toast
      toast({
        title: "Device Profile Saved",
        description: `${data.deviceName} has been successfully saved.`,
      });
      
      // Show success insights
      setAiInsights([
        {
          id: 'device-profile-1',
          type: 'device',
          name: data.deviceName,
          deviceClass: data.deviceClass,
          timestamp: new Date().toISOString()
        },
        ...aiInsights
      ]);
      
      // Auto-navigate to pipeline view
      setWorkflowSubTab('pipeline');
      
    } catch (error) {
      console.error('Error saving device profile:', error);
      setErrorMessage(error.message || 'Failed to save device profile');
      toast({
        title: "Error Saving Profile",
        description: error.message || 'Failed to save device profile',
        variant: "destructive",
      });
    } finally {
      setAiProcessing(false);
    }
  };
  
  // Handle selection of a device profile
  const handleSelectDeviceProfile = (profile) => {
    setCurrentDeviceProfile(profile);
    
    // Show success toast
    toast({
      title: "Device Profile Selected",
      description: `${profile.deviceName} is now the active device for your 510(k) submission.`,
    });
    
    // Update insights
    const existingInsight = aiInsights.find(insight => 
      insight.type === 'device' && insight.name === profile.deviceName
    );
    
    if (!existingInsight) {
      setAiInsights([
        {
          id: `device-profile-${Date.now()}`,
          type: 'device',
          name: profile.deviceName,
          deviceClass: profile.deviceClass,
          timestamp: new Date().toISOString()
        },
        ...aiInsights
      ]);
    }
  };

  return (
    <Card className="mb-6 border-0 shadow-md overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 pb-4">
        <CardTitle className="text-white flex items-center">
          <FileCheck className="h-5 w-5 mr-2" />
          510(k) Submission Workflow
        </CardTitle>
        <CardDescription className="text-blue-100">
          Complete your FDA 510(k) submission with our streamlined, intelligent workflow process
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Device Management System - Unified Navigation Card */}
          <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
              <h3 className="text-xl font-semibold flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Medical Device Management
              </h3>
              <p className="text-blue-100 text-sm mt-1">
                Unified system for managing your 510(k) device submission process
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-x divide-gray-100">
              {/* COLUMN 1: Device Profile */}
              <div className="p-4 bg-gradient-to-b from-blue-50 to-white">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-100 rounded-full p-2 mr-3">
                    <FileText className="h-5 w-5 text-blue-700" />
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-800">Device Profile</h4>
                    <p className="text-xs text-blue-700">FDA Regulatory Information</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3 border-l-2 border-blue-300 pl-3">
                  Create and manage your device profiles and their associated regulatory information.
                </p>
                
                <div className="flex items-center mb-3">
                  <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                    {deviceProfiles?.length || 0} Profiles
                  </Badge>
                  
                  {currentDeviceProfile && (
                    <Badge variant="outline" className="ml-2 text-green-600 border-green-200 bg-green-50">
                      Active: {currentDeviceProfile.deviceName}
                    </Badge>
                  )}
                </div>
                
                <Button 
                  id="create-device-profile-btn"
                  size="sm" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => setDeviceProfileDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Device Profile
                </Button>
              </div>
              
              {/* COLUMN 2: Device Setup */}
              <div className="p-4 bg-gradient-to-b from-green-50 to-white relative">
                <div className="flex items-center mb-3">
                  <div className="bg-green-100 rounded-full p-2 mr-3">
                    <Settings className="h-5 w-5 text-green-700" />
                  </div>
                  <div>
                    <h4 className="font-medium text-green-800">Device Setup</h4>
                    <p className="text-xs text-green-700">System Configuration</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3 border-l-2 border-green-300 pl-3">
                  System-level parameters and configuration that control how your device is processed in the platform.
                </p>
                
                <div className="flex items-center mb-3">
                  {currentDeviceProfile ? (
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                      {currentDeviceProfile.deviceClass ? `Class ${currentDeviceProfile.deviceClass}` : 'Class II'} Device
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-500 border-gray-200 bg-gray-50">
                      No Device Selected
                    </Badge>
                  )}
                </div>
                
                <Button 
                  size="sm" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={!currentDeviceProfile}
                  onClick={() => {
                    if (currentDeviceProfile) {
                      // Set to the configured workflow subtab
                      setWorkflowSubTab('compliance');
                      
                      toast({
                        title: "Device Setup",
                        description: `Configuring setup for ${currentDeviceProfile.deviceName}`,
                      });
                    }
                  }}
                >
                  Configure Device Setup
                </Button>
              </div>
              
              {/* COLUMN 3: Device Intake */}
              <div className="p-4 bg-gradient-to-b from-purple-50 to-white">
                <div className="flex items-center mb-3">
                  <div className="bg-purple-100 rounded-full p-2 mr-3">
                    <Upload className="h-5 w-5 text-purple-700" />
                  </div>
                  <div>
                    <h4 className="font-medium text-purple-800">Device Intake</h4>
                    <p className="text-xs text-purple-700">Onboarding Wizard</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3 border-l-2 border-purple-300 pl-3">
                  Step-by-step wizard for bringing a new device into the system, including data validation and enhancement.
                </p>
                
                <div className="flex items-center mb-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50 cursor-help">
                          AI Assisted
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-[200px] text-xs">
                          The device intake process uses AI to enhance your device data and find regulatory matches.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <Button 
                  size="sm" 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => {
                    if (!currentDeviceProfile) {
                      setDeviceProfileDialogOpen(true);
                      toast({
                        title: "Device Intake Started",
                        description: "Please complete the device profile form to continue",
                      });
                    }
                  }}
                >
                  Start Device Intake
                </Button>
              </div>
            </div>
          </div>

          <Tabs value={workflowSubTab} onValueChange={setWorkflowSubTab} className="mb-6">
            <TabsList className="w-full bg-blue-50 p-1">
              <TabsTrigger value="devices" className="flex-1 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-700">
                <Database className="h-4 w-4 mr-2" />
                1. Device Profile
              </TabsTrigger>
              <TabsTrigger value="predicates" className="flex-1 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-700">
                <Search className="h-4 w-4 mr-2" />
                2. Predicate Finder
              </TabsTrigger>
              <TabsTrigger value="compliance" className="flex-1 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-700">
                <Shield className="h-4 w-4 mr-2" />
                3. Compliance Check
              </TabsTrigger>
              <TabsTrigger value="review" className="flex-1 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                4. Final Review
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="devices">
              <Card className="border shadow-sm">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 pb-4">
                  <CardTitle className="text-white flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    Device Profile Management
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Create or select a device profile to start your 510(k) submission process
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <h3 className="text-lg font-semibold text-blue-700 flex items-center mb-2">
                        <FileText className="h-5 w-5 mr-2" />
                        Device Profile Required
                      </h3>
                      <p className="text-sm text-blue-700">
                        A device profile is required to proceed with your 510(k) submission. 
                        This profile will be used throughout the process for predicate device comparisons, 
                        testing requirements, and final submission documents.
                      </p>
                      <Button 
                        className="mt-3 bg-blue-600 hover:bg-blue-700"
                        onClick={() => setDeviceProfileDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Device Profile
                      </Button>
                    </div>
                    
                    <DeviceProfileList
                      deviceProfiles={deviceProfiles || []}
                      isLoading={isLoadingProfiles}
                      onSelect={handleSelectDeviceProfile}
                      selectedProfileId={currentDeviceProfile?.id}
                      onCreateNew={() => setDeviceProfileDialogOpen(true)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="predicates">
              <PredicateFinderPanel 
                deviceProfile={currentDeviceProfile}
                onSelect={results => {
                  console.log('Selected predicate device:', results);
                }}
              />
            </TabsContent>
            
            <TabsContent value="compliance">
              <Card className="border shadow-sm">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 pb-4">
                  <CardTitle className="text-white flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Compliance Verification
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Verify your submission meets all FDA regulatory requirements
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {!currentDeviceProfile ? (
                    <Alert className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Select a device profile</AlertTitle>
                      <AlertDescription>
                        Please select a device profile to run compliance checks.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Compliance Requirements for {currentDeviceProfile.deviceName}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {requirements.map((req) => (
                          <div key={req.id} className="border rounded-md p-4 bg-white">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                {req.required ? (
                                  <Badge className="bg-red-100 text-red-800 border-red-200 mr-2">Required</Badge>
                                ) : (
                                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 mr-2">Recommended</Badge>
                                )}
                                <span className="font-medium">{req.title}</span>
                              </div>
                              <CheckCircle2 className="h-5 w-5 text-gray-300" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end border-t px-6 py-4">
                  <Button 
                    disabled={!currentDeviceProfile} 
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Run Compliance Check
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="review">
              <Card className="border shadow-sm">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 pb-4">
                  <CardTitle className="text-white flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Final Review & Submission
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Review and generate your complete 510(k) submission package
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {!currentDeviceProfile ? (
                    <Alert className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Complete previous steps</AlertTitle>
                      <AlertDescription>
                        Please complete the device profile, predicate finder, and compliance check steps before final review.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                          <div>
                            <h4 className="font-medium">Ready for Final Review</h4>
                            <p className="text-sm text-gray-600">Your 510(k) submission package is ready for final review.</p>
                          </div>
                        </div>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          Generate 510(k) Package
                        </Button>
                      </div>
                      
                      {/* FDA eSTAR Generation Section */}
                      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
                          <h3 className="font-medium flex items-center">
                            <FileCheck className="h-5 w-5 mr-2" />
                            FDA eSTAR Submission Package
                          </h3>
                          <p className="text-blue-100 text-sm">
                            Generate your FDA-compliant eSTAR submission package
                          </p>
                        </div>
                        
                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 border rounded-md bg-blue-50">
                              <h4 className="font-medium text-blue-800 mb-1">Device Profile</h4>
                              <div className="text-sm text-gray-600">
                                <p><span className="font-medium">Name:</span> {currentDeviceProfile.deviceName}</p>
                                <p><span className="font-medium">Class:</span> {currentDeviceProfile.deviceClass || 'Class II'}</p>
                                <p><span className="font-medium">Manufacturer:</span> {currentDeviceProfile.manufacturer}</p>
                              </div>
                            </div>
                            
                            <div className="p-3 border rounded-md bg-green-50">
                              <h4 className="font-medium text-green-800 mb-1">Predicate Comparison</h4>
                              <div className="text-sm text-gray-600">
                                <p><span className="font-medium">Status:</span> <Badge className="bg-green-100 text-green-800">Complete</Badge></p>
                                <p><span className="font-medium">Predicates:</span> 2 predicate devices found</p>
                                <p><span className="font-medium">Similarity:</span> 94% match with K123456</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-4">
                            <div className="p-3 border rounded-md">
                              <h4 className="font-medium mb-2">eSTAR Package Options</h4>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <span className="font-medium mr-2">Include Testing Data:</span>
                                    <Badge>Recommended</Badge>
                                  </div>
                                  <Switch defaultChecked={true} />
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <span className="font-medium mr-2">Include Predicate Comparisons:</span>
                                    <Badge>Required</Badge>
                                  </div>
                                  <Switch defaultChecked={true} />
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <span className="font-medium mr-2">Generate FDA Cover Letter:</span>
                                    <Badge>Recommended</Badge>
                                  </div>
                                  <Switch defaultChecked={true} />
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-end space-x-2 mt-4">
                            <Button variant="outline">
                              <Shield className="h-4 w-4 mr-2" />
                              Validate Submission
                            </Button>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                              <FileText className="h-4 w-4 mr-2" />
                              Generate eSTAR Package
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>

      {/* Device Profile Dialog */}
      <Dialog open={deviceProfileDialogOpen} onOpenChange={setDeviceProfileDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Device Profile</DialogTitle>
            <DialogDescription>
              Enter information about your medical device to start the 510(k) submission process.
            </DialogDescription>
          </DialogHeader>
          
          <DeviceProfileForm
            initialData={null}
            onSubmit={handleSubmitDeviceProfile}
            onCancel={() => setDeviceProfileDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
