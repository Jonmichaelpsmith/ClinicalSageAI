import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { 
  Upload, Search, FilePlus, Shield, 
  FileCheck, CheckCircle2, AlertTriangle, CheckCircle,
  FileText, Plus, Database, AlertCircle, Settings
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PredicateFinderPanel from '@/components/510k/PredicateFinderPanel';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import DeviceProfileList from './DeviceProfileList';
import DeviceProfileDialog from './DeviceProfileDialog';
import { postDeviceProfile, getDeviceProfiles } from '../../api/cer';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

export default function KAutomationPanel() {
  const [workflowStep, setWorkflowStep] = useState('devices');
  const [aiProcessing, setAiProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentDeviceProfile, setCurrentDeviceProfile] = useState(null);
  const [showDeviceSetupDialog, setShowDeviceSetupDialog] = useState(false);
  const { currentOrganization } = useTenant();
  const { toast } = useToast();
  
  // Query to fetch device profiles
  const { 
    data: deviceProfiles, 
    isLoading: isLoadingProfiles, 
    refetch: refetchProfiles 
  } = useQuery({
    queryKey: ['/api/cer/device-profile/organization', currentOrganization?.id],
    queryFn: () => getDeviceProfiles(currentOrganization?.id),
    enabled: !!currentOrganization?.id,
    staleTime: 30000
  });

  // Handle device profile form submission
  const handleSubmitDeviceProfile = async (data) => {
    try {
      setAiProcessing(true);
      
      const response = await postDeviceProfile(data);
      setCurrentDeviceProfile(response);
      
      // Refresh the device profiles list
      refetchProfiles();
      
      toast({
        title: "Device Profile Saved",
        description: `${data.deviceName} has been successfully saved.`,
        variant: "success"
      });
      
      // Move to next step automatically
      setWorkflowStep('setup');
      
    } catch (error) {
      console.error('Error saving device profile:', error);
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
    
    toast({
      title: "Device Profile Selected",
      description: `${profile.deviceName} is now the active device for your 510(k) submission.`,
      variant: "success"
    });
  };
  
  // Handle device intake process
  const handleDeviceIntake = () => {
    if (!currentDeviceProfile) {
      toast({
        title: "Device Required",
        description: "Please create or select a device profile first",
        variant: "warning"
      });
      setWorkflowStep('devices');
      return;
    }
    
    toast({
      title: "Intake Wizard Started",
      description: `Starting step-by-step intake for ${currentDeviceProfile.deviceName}`,
      duration: 3000
    });
    
    setAiProcessing(true);
    
    // Simulate progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setAiProcessing(false);
        setProgress(0);
        
        toast({
          title: "Device Intake Complete",
          description: `${currentDeviceProfile.deviceName} has been successfully onboarded`,
          variant: "success"
        });
        
        // Move to next step
        setWorkflowStep('predicates');
      }
    }, 200);
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
          {/* Device Management System - Simplified Card Layout */}
          <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden mb-6">
            <div className="bg-blue-50 px-6 py-4">
              <h3 className="text-xl font-semibold flex items-center text-blue-700">
                <Database className="h-5 w-5 mr-2" />
                Medical Device Management
              </h3>
              <p className="text-blue-600 text-sm mt-1">
                Configure and prepare your device for 510(k) submission
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
              {/* COLUMN 1: Device Profile */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-100 rounded-full p-2 mr-3">
                    <FileText className="h-5 w-5 text-blue-700" />
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-800">Device Profile</h4>
                    <p className="text-xs text-blue-700">FDA Regulatory Information</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 border-l-2 border-blue-300 pl-3">
                  Create and manage your device profiles for regulatory submission.
                </p>
                
                <div className="flex items-center mb-4">
                  <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                    {deviceProfiles?.length || 0} Profiles
                  </Badge>
                  
                  {currentDeviceProfile && (
                    <Badge variant="outline" className="ml-2 text-green-600 border-green-200 bg-green-50">
                      Active: {currentDeviceProfile.deviceName}
                    </Badge>
                  )}
                </div>
                
                <DeviceProfileDialog 
                  buttonText="Create Device Profile"
                  buttonClassName="w-full bg-blue-600 hover:bg-blue-700"
                  buttonVariant="default"
                  dialogTitle="Create New Device Profile"
                  dialogDescription="Enter your device information to begin the 510(k) submission process"
                  onSuccessfulSubmit={(profile) => {
                    handleSubmitDeviceProfile(profile);
                    toast({
                      title: "Device Profile Created",
                      description: "Your device profile has been created successfully",
                      variant: "success"
                    });
                  }}
                  buttonIcon={<Plus className="h-4 w-4 mr-2" />}
                  isStartingPoint={true}
                />
              </div>
              
              {/* COLUMN 2: Device Setup */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="bg-green-100 rounded-full p-2 mr-3">
                    <Settings className="h-5 w-5 text-green-700" />
                  </div>
                  <div>
                    <h4 className="font-medium text-green-800">Device Setup</h4>
                    <p className="text-xs text-green-700">System Configuration</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 border-l-2 border-green-300 pl-3">
                  Configure system parameters for your device submission workflow.
                </p>
                
                <div className="flex items-center mb-4">
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
                      toast({
                        title: "Device Setup Started",
                        description: `Opening configuration for ${currentDeviceProfile.deviceName}`,
                        duration: 2000
                      });
                      setShowDeviceSetupDialog(true);
                    }
                  }}
                >
                  Configure Device Setup
                </Button>
              </div>
              
              {/* COLUMN 3: Device Intake */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="bg-purple-100 rounded-full p-2 mr-3">
                    <Upload className="h-5 w-5 text-purple-700" />
                  </div>
                  <div>
                    <h4 className="font-medium text-purple-800">Device Intake</h4>
                    <p className="text-xs text-purple-700">Onboarding Wizard</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 border-l-2 border-purple-300 pl-3">
                  Start the guided device intake process with validation and enhancement.
                </p>
                
                <div className="flex items-center mb-4">
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
                      toast({
                        title: "Device Required",
                        description: "Please create or select a device profile first",
                        variant: "warning"
                      });
                      setWorkflowSubTab('devices');
                    } else {
                      toast({
                        title: "Intake Wizard Started",
                        description: `Starting step-by-step intake for ${currentDeviceProfile.deviceName}`,
                        duration: 3000
                      });
                      
                      setAiProcessing(true);
                      
                      let progress = 0;
                      const interval = setInterval(() => {
                        progress += 5;
                        setProgress(progress);
                        
                        if (progress >= 100) {
                          clearInterval(interval);
                          setAiProcessing(false);
                          setProgress(0);
                          
                          toast({
                            title: "Device Intake Complete",
                            description: `${currentDeviceProfile.deviceName} has been successfully onboarded`,
                            variant: "success"
                          });
                          
                          setWorkflowSubTab('predicates');
                        }
                      }, 200);
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
      
      {/* Device Setup Dialog */}
      <Dialog open={showDeviceSetupDialog} onOpenChange={setShowDeviceSetupDialog}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2 text-green-600" />
              Device Setup Configuration
            </DialogTitle>
            <DialogDescription>
              Configure system parameters for {currentDeviceProfile?.deviceName || 'your device'}
            </DialogDescription>
          </DialogHeader>
          
          {currentDeviceProfile && (
            <div className="space-y-5 py-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                <h3 className="font-medium text-blue-800 mb-2">Device Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">Name:</span> {currentDeviceProfile.deviceName}</div>
                  <div><span className="font-medium">Class:</span> {currentDeviceProfile.deviceClass || 'Class II'}</div>
                  <div><span className="font-medium">Manufacturer:</span> {currentDeviceProfile.manufacturer}</div>
                  <div><span className="font-medium">Type:</span> {currentDeviceProfile.deviceType || 'Medical Device'}</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="testing-level">Testing Level Required</Label>
                  <Select defaultValue="moderate">
                    <SelectTrigger id="testing-level">
                      <SelectValue placeholder="Select testing level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">Determines the extent of testing required for your device</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="comparison-algorithm">Predicate Comparison Algorithm</Label>
                  <Select defaultValue="detailed">
                    <SelectTrigger id="comparison-algorithm">
                      <SelectValue placeholder="Select comparison method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">Simple Matching</SelectItem>
                      <SelectItem value="detailed">Detailed Analysis</SelectItem>
                      <SelectItem value="aienhanced">AI-Enhanced Comparison</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">Algorithm used for comparing your device with predicates</p>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="automated-verification" className="text-base">Automated Verification</Label>
                    <span className="text-sm text-gray-500">Allow system to verify regulatory compliance automatically</span>
                  </div>
                  <Switch id="automated-verification" defaultChecked={true} />
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="ai-review" className="text-base">AI-Assisted Review</Label>
                    <span className="text-sm text-gray-500">Use AI to improve review quality and consistency</span>
                  </div>
                  <Switch id="ai-review" defaultChecked={true} />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex items-center justify-between border-t pt-4">
            <Button variant="outline" onClick={() => setShowDeviceSetupDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                setShowDeviceSetupDialog(false);
                
                toast({
                  title: "Device Setup Complete",
                  description: `Configuration for ${currentDeviceProfile?.deviceName} has been saved`,
                  variant: "success"
                });
                
                // Move to compliance tab
                setWorkflowSubTab('compliance');
              }}
            >
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
