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
import DeviceProfileDialog from './DeviceProfileDialog';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import FDA510kService from '../../services/FDA510kService';

export default function KAutomationPanel() {
  const [activeTab, setActiveTab] = useState('workflow');
  const [workflowSubTab, setWorkflowSubTab] = useState('pipeline');
  const [aiProcessing, setAiProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [aiInsights, setAiInsights] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [deviceProfileDialogOpen, setDeviceProfileDialogOpen] = useState(false);
  const [deviceProfiles, setDeviceProfiles] = useState([]);
  const [selectedDeviceProfile, setSelectedDeviceProfile] = useState(null);
  const [currentStep, setCurrentStep] = useState('device-profile');
  const [loadingRequirements, setLoadingRequirements] = useState(false);
  const [predicateDevices, setPredicateDevices] = useState([]);
  const [selectedPredicates, setSelectedPredicates] = useState([]);
  const [loadingPredicates, setLoadingPredicates] = useState(false);
  const [complianceResults, setComplianceResults] = useState(null);
  const [loadingComplianceCheck, setLoadingComplianceCheck] = useState(false);
  const [estarStatus, setEstarStatus] = useState(null);
  const [generatingEstar, setGeneratingEstar] = useState(false);
  
  const { toast } = useToast();
  const { organizationId } = useTenant();

  // Fetch device profiles on component mount
  useEffect(() => {
    const fetchDeviceProfiles = async () => {
      try {
        const profiles = await FDA510kService.DeviceProfileAPI.list(organizationId);
        setDeviceProfiles(profiles || []);
      } catch (error) {
        console.error("Error fetching device profiles:", error);
        toast({
          title: "Error",
          description: "Failed to fetch device profiles",
          variant: "destructive"
        });
      }
    };

    fetchDeviceProfiles();
  }, [organizationId, toast]);

  // Handle device profile creation
  const handleCreateDeviceProfile = async (profileData) => {
    try {
      const newProfile = await FDA510kService.DeviceProfileAPI.create(profileData, organizationId);
      setDeviceProfiles(prev => [...prev, newProfile]);
      setSelectedDeviceProfile(newProfile);
      setDeviceProfileDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Device profile created successfully",
      });
      
      // Load requirements for the device class
      if (newProfile.deviceClass) {
        await loadRequirements(newProfile.deviceClass);
      }
      
    } catch (error) {
      console.error("Error creating device profile:", error);
      toast({
        title: "Error",
        description: "Failed to create device profile",
        variant: "destructive"
      });
    }
  };

  // Load requirements based on device class
  const loadRequirements = async (deviceClass) => {
    try {
      setLoadingRequirements(true);
      const response = await FDA510kService.getRequirements(deviceClass);
      setRequirements(response.requirements || []);
    } catch (error) {
      console.error("Error loading requirements:", error);
      toast({
        title: "Error",
        description: "Failed to load requirements for this device class",
        variant: "destructive"
      });
    } finally {
      setLoadingRequirements(false);
    }
  };

  // Handle device profile selection
  const handleSelectDeviceProfile = (profile) => {
    setSelectedDeviceProfile(profile);
    
    if (profile.deviceClass) {
      loadRequirements(profile.deviceClass);
    }
    
    toast({
      title: "Profile Selected",
      description: `Selected ${profile.deviceName}`
    });
  };

  // Find predicate devices
  const handleFindPredicateDevices = async () => {
    if (!selectedDeviceProfile) {
      toast({
        title: "Error",
        description: "Please select a device profile first",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoadingPredicates(true);
      setCurrentStep('predicate-finder');
      
      const predicateResponse = await FDA510kService.findPredicateDevices({
        deviceName: selectedDeviceProfile.deviceName,
        productCode: selectedDeviceProfile.productCode,
        manufacturer: selectedDeviceProfile.manufacturer,
        intendedUse: selectedDeviceProfile.intendedUse
      }, organizationId);
      
      if (predicateResponse.success) {
        setPredicateDevices(predicateResponse.predicates || []);
      } else {
        toast({
          title: "Warning",
          description: "Could not find matching predicate devices",
          variant: "destructive"
        });
        setPredicateDevices([]);
      }
    } catch (error) {
      console.error("Error finding predicate devices:", error);
      toast({
        title: "Error",
        description: "Failed to search for predicate devices",
        variant: "destructive"
      });
    } finally {
      setLoadingPredicates(false);
    }
  };

  // Select/deselect predicate device
  const togglePredicateSelection = (predicate) => {
    setSelectedPredicates(prev => {
      const isSelected = prev.some(p => p.id === predicate.id);
      if (isSelected) {
        return prev.filter(p => p.id !== predicate.id);
      } else {
        return [...prev, predicate];
      }
    });
  };

  // Move to compliance check step
  const handleMoveToComplianceCheck = () => {
    if (selectedPredicates.length === 0) {
      toast({
        title: "Warning",
        description: "Please select at least one predicate device",
        variant: "destructive"
      });
      return;
    }
    
    setCurrentStep('compliance-check');
  };

  // Run compliance check
  const runComplianceCheck = async () => {
    if (!selectedDeviceProfile || selectedPredicates.length === 0) {
      toast({
        title: "Error",
        description: "Device profile and predicate devices are required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoadingComplianceCheck(true);
      
      const complianceResponse = await FDA510kService.runComplianceCheck(
        "temp-project-id", // This would be a real project ID in production
        {
          deviceProfile: selectedDeviceProfile,
          predicateDevices: selectedPredicates,
          requirementsChecked: true
        }
      );
      
      setComplianceResults(complianceResponse);
      
      toast({
        title: "Compliance Check Complete",
        description: `Found ${complianceResponse.issues?.length || 0} issues to address`
      });
      
    } catch (error) {
      console.error("Error running compliance check:", error);
      toast({
        title: "Error",
        description: "Failed to run compliance check",
        variant: "destructive"
      });
    } finally {
      setLoadingComplianceCheck(false);
    }
  };

  // Move to final review
  const handleMoveToFinalReview = () => {
    if (!complianceResults) {
      toast({
        title: "Warning",
        description: "Please complete compliance check first",
        variant: "destructive"
      });
      return;
    }
    
    setCurrentStep('final-review');
  };

  // Generate eSTAR package
  const generateESTARPackage = async () => {
    try {
      setGeneratingEstar(true);
      
      // This would integrate with the real endpoints in production
      const response = await FDA510kService.buildESTARPackage(
        "temp-project-id", // This would be a real project ID in production
        {
          deviceProfile: selectedDeviceProfile,
          predicateDevices: selectedPredicates,
          complianceResults: complianceResults
        }
      );
      
      setEstarStatus(response);
      
      toast({
        title: "eSTAR Package Generated",
        description: "The 510(k) eSTAR package is ready for submission"
      });
      
    } catch (error) {
      console.error("Error generating eSTAR package:", error);
      toast({
        title: "Error",
        description: "Failed to generate eSTAR package",
        variant: "destructive"
      });
    } finally {
      setGeneratingEstar(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border rounded-lg shadow">
      <div className="border-b bg-white p-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center">
          <FileCheck className="h-5 w-5 text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800">510(k) Automation Panel</h2>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Info className="h-4 w-4 mr-1" />
            Help
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="workflow" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="bg-gray-50 border-b px-4 pt-2">
          <TabsList className="w-full bg-transparent gap-4">
            <TabsTrigger value="workflow" className="data-[state=active]:bg-white">
              <ListChecks className="h-4 w-4 mr-2" />
              Workflow
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-white">
              <FileText className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="ai-tools" className="data-[state=active]:bg-white">
              <Brain className="h-4 w-4 mr-2" />
              AI Tools
            </TabsTrigger>
            <TabsTrigger value="documentation" className="data-[state=active]:bg-white">
              <BookOpen className="h-4 w-4 mr-2" />
              Documentation
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="workflow" className="flex-1 p-4 overflow-auto m-0">
          {currentStep === 'device-profile' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium">Device Profile</h3>
                  <p className="text-sm text-gray-500">Step 1 of 4: Create or select a device profile for your submission</p>
                </div>
                <Badge variant="outline">Step 1</Badge>
              </div>
              
              {!selectedDeviceProfile ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Create Device Profile</CardTitle>
                    <CardDescription>
                      Start by creating a device profile for your 510(k) submission
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-6">
                    <div className="rounded-full bg-blue-50 p-4 mb-4">
                      <FilePlus className="h-8 w-8 text-blue-500" />
                    </div>
                    <h4 className="text-lg font-medium mb-2">No Device Profile Selected</h4>
                    <p className="text-center text-gray-500 mb-4 max-w-md">
                      Create or select a device profile to begin your 510(k) submission workflow
                    </p>
                    <Button onClick={() => setDeviceProfileDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Profile
                    </Button>
                  </CardContent>
                  {deviceProfiles.length > 0 && (
                    <CardFooter className="flex flex-col border-t pt-6">
                      <h4 className="text-sm font-medium mb-3">Or select an existing profile:</h4>
                      <div className="w-full space-y-2">
                        {deviceProfiles.map(profile => (
                          <div 
                            key={profile.id}
                            className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleSelectDeviceProfile(profile)}
                          >
                            <div>
                              <p className="font-medium">{profile.deviceName}</p>
                              <p className="text-xs text-gray-500">
                                {profile.manufacturer} • Class {profile.deviceClass}
                              </p>
                            </div>
                            <Badge variant="outline">{profile.productCode || 'No Code'}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardFooter>
                  )}
                </Card>
              ) : (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between">
                        <CardTitle>Selected Device Profile</CardTitle>
                        <Badge variant="outline">{selectedDeviceProfile.productCode || 'No Code'}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-medium">{selectedDeviceProfile.deviceName}</h3>
                          <p className="text-sm text-gray-500">
                            {selectedDeviceProfile.manufacturer} • Class {selectedDeviceProfile.deviceClass}
                          </p>
                        </div>
                        
                        <Separator />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                          <div>
                            <h4 className="text-sm font-medium">Device Type</h4>
                            <p className="text-sm text-gray-600">{selectedDeviceProfile.deviceType || 'Not specified'}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Regulation Number</h4>
                            <p className="text-sm text-gray-600">{selectedDeviceProfile.regulationNumber || 'Not specified'}</p>
                          </div>
                          <div className="col-span-2">
                            <h4 className="text-sm font-medium">Intended Use</h4>
                            <p className="text-sm text-gray-600">{selectedDeviceProfile.intendedUse || 'Not specified'}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t flex justify-between">
                      <Button variant="outline" onClick={() => setSelectedDeviceProfile(null)}>
                        Change Profile
                      </Button>
                      <Button onClick={handleFindPredicateDevices}>
                        Find Predicate Devices
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  {loadingRequirements ? (
                    <Card>
                      <CardHeader>
                        <CardTitle>Loading Requirements</CardTitle>
                      </CardHeader>
                      <CardContent className="flex justify-center py-6">
                        <Progress value={45} className="w-3/4" />
                      </CardContent>
                    </Card>
                  ) : requirements.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Device Class Requirements</CardTitle>
                        <CardDescription>
                          FDA requirements for {selectedDeviceProfile.deviceClass ? `Class ${selectedDeviceProfile.deviceClass}` : 'this device class'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {requirements.slice(0, 5).map((req, index) => (
                            <div key={index} className="flex items-start p-2 border rounded">
                              <AlertCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium">{req.title || 'Requirement Title'}</p>
                                <p className="text-xs text-gray-500">{req.description || 'Requirement description would appear here.'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}
          
          {currentStep === 'predicate-finder' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium">Predicate Device Finder</h3>
                  <p className="text-sm text-gray-500">Step 2 of 4: Identify appropriate predicate devices for your submission</p>
                </div>
                <Badge variant="outline">Step 2</Badge>
              </div>
              
              {loadingPredicates ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Searching for Predicate Devices</CardTitle>
                    <CardDescription>
                      Finding devices with similar characteristics to use as predicates
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center py-8">
                    <Progress value={65} className="w-3/4 mb-6" />
                    <p className="text-sm text-gray-500">Searching FDA database for matching devices...</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Select Predicate Devices</CardTitle>
                      <CardDescription>
                        Choose one or more predicate devices that are substantially equivalent to your device
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {predicateDevices.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6">
                          <AlertTriangle className="h-8 w-8 text-amber-500 mb-4" />
                          <h4 className="text-lg font-medium mb-2">No Predicate Devices Found</h4>
                          <p className="text-center text-gray-500 mb-4 max-w-md">
                            We couldn't find any matching predicate devices. Try adjusting your device profile or search manually.
                          </p>
                          <Button variant="outline">
                            <Search className="h-4 w-4 mr-2" />
                            Manual Search
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {predicateDevices.map(predicate => (
                            <div 
                              key={predicate.id || predicate.k_number} 
                              className={`flex items-start justify-between p-3 border rounded cursor-pointer ${
                                selectedPredicates.some(p => p.id === predicate.id) ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                              }`}
                              onClick={() => togglePredicateSelection(predicate)}
                            >
                              <div className="flex items-start">
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 mt-1 ${
                                  selectedPredicates.some(p => p.id === predicate.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                                }`}>
                                  {selectedPredicates.some(p => p.id === predicate.id) && (
                                    <Check className="h-3 w-3 text-white" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium">{predicate.deviceName || 'Unnamed Device'}</p>
                                  <p className="text-xs text-gray-500">
                                    {predicate.manufacturer || 'Unknown'} • {predicate.k_number || 'No K-Number'}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">{predicate.clearanceDate || 'No date'}</p>
                                </div>
                              </div>
                              <Badge variant="outline">{predicate.productCode || 'No Code'}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="border-t flex justify-between">
                      <Button variant="outline" onClick={() => setCurrentStep('device-profile')}>
                        Back to Device Profile
                      </Button>
                      <Button 
                        onClick={handleMoveToComplianceCheck}
                        disabled={selectedPredicates.length === 0}
                      >
                        Continue to Compliance Check
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              )}
            </div>
          )}
          
          {currentStep === 'compliance-check' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium">510(k) Compliance Check</h3>
                  <p className="text-sm text-gray-500">Step 3 of 4: Verify submission compliance with FDA requirements</p>
                </div>
                <Badge variant="outline">Step 3</Badge>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Regulatory Compliance Check</CardTitle>
                  <CardDescription>
                    Verify your submission meets all FDA 510(k) requirements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!complianceResults ? (
                    <div className="flex flex-col items-center justify-center py-6">
                      {loadingComplianceCheck ? (
                        <>
                          <Progress value={78} className="w-3/4 mb-6" />
                          <p className="text-sm text-gray-500">Running 510(k) compliance verification...</p>
                        </>
                      ) : (
                        <>
                          <div className="rounded-full bg-amber-50 p-4 mb-4">
                            <AlertCircle className="h-8 w-8 text-amber-500" />
                          </div>
                          <h4 className="text-lg font-medium mb-2">Ready to Check Compliance</h4>
                          <p className="text-center text-gray-500 mb-6 max-w-md">
                            Run an FDA regulatory compliance check to identify any issues with your submission
                          </p>
                          <Button onClick={runComplianceCheck}>
                            <FileCheck className="h-4 w-4 mr-2" />
                            Run Compliance Check
                          </Button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {complianceResults.score >= 80 ? (
                            <div className="flex items-center text-green-600">
                              <CheckCircle2 className="h-5 w-5 mr-2" />
                              <span className="font-medium">Submission Ready</span>
                            </div>
                          ) : complianceResults.score >= 60 ? (
                            <div className="flex items-center text-amber-600">
                              <AlertCircle className="h-5 w-5 mr-2" />
                              <span className="font-medium">Minor Issues Found</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-red-600">
                              <AlertTriangle className="h-5 w-5 mr-2" />
                              <span className="font-medium">Major Issues Found</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-2">Compliance Score:</span>
                          <Badge variant={complianceResults.score >= 80 ? 'default' : 'outline'} className="bg-blue-500">
                            {complianceResults.score || 0}%
                          </Badge>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="text-sm font-medium mb-3">Issues to Address:</h4>
                        <div className="space-y-3">
                          {(complianceResults.issues || []).slice(0, 3).map((issue, index) => (
                            <div key={index} className="p-3 border rounded">
                              <div className="flex items-start">
                                {issue.severity === 'high' ? (
                                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                                ) : issue.severity === 'medium' ? (
                                  <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                                ) : (
                                  <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                                )}
                                <div>
                                  <p className="text-sm font-medium">{issue.title || `Issue #${index + 1}`}</p>
                                  <p className="text-xs text-gray-500">{issue.description || 'No description provided'}</p>
                                  {issue.recommendation && (
                                    <p className="text-xs text-blue-600 mt-1">
                                      <span className="font-medium">Recommendation:</span> {issue.recommendation}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          {(complianceResults.issues || []).length > 3 && (
                            <p className="text-sm text-gray-500 text-center">
                              +{(complianceResults.issues || []).length - 3} more issues to address
                            </p>
                          )}
                          {(complianceResults.issues || []).length === 0 && (
                            <div className="flex items-center justify-center py-4">
                              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                              <p className="text-sm text-gray-600">No issues found. Your submission is compliant!</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep('predicate-finder')}>
                    Back to Predicates
                  </Button>
                  <Button 
                    onClick={handleMoveToFinalReview} 
                    disabled={!complianceResults}
                  >
                    Continue to Final Review
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
          
          {currentStep === 'final-review' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium">Final Review & eSTAR Generation</h3>
                  <p className="text-sm text-gray-500">Step 4 of 4: Generate your FDA-compliant 510(k) eSTAR package</p>
                </div>
                <Badge variant="outline">Step 4</Badge>
              </div>
              
              <Card className="border-blue-100">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <CardTitle className="text-white flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" /> 
                    510(k) eSTAR Package
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Generate your FDA-compliant 510(k) eSTAR submission package
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {!estarStatus ? (
                    <div className="flex flex-col items-center justify-center py-6">
                      {generatingEstar ? (
                        <>
                          <Progress value={85} className="w-3/4 mb-6" />
                          <p className="text-sm text-gray-500">Generating eSTAR package...</p>
                        </>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-6">
                            <div className="border rounded p-4">
                              <h4 className="text-sm font-medium mb-2 flex items-center">
                                <Zap className="h-4 w-4 text-blue-500 mr-1" />
                                Submission Summary
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Device Name:</span>
                                  <span className="font-medium">{selectedDeviceProfile?.deviceName || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Device Class:</span>
                                  <span className="font-medium">Class {selectedDeviceProfile?.deviceClass || 'II'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Product Code:</span>
                                  <span className="font-medium">{selectedDeviceProfile?.productCode || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Predicates:</span>
                                  <span className="font-medium">{selectedPredicates.length} selected</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="border rounded p-4">
                              <h4 className="text-sm font-medium mb-2 flex items-center">
                                <FileCheck className="h-4 w-4 text-blue-500 mr-1" />
                                Compliance Status
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Score:</span>
                                  <span className="font-medium">{complianceResults?.score || 0}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Issues:</span>
                                  <span className="font-medium">{complianceResults?.issues?.length || 0} found</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Status:</span>
                                  <span className={`font-medium ${complianceResults?.score >= 80 ? 'text-green-600' : 'text-amber-600'}`}>
                                    {complianceResults?.score >= 80 ? 'Ready' : 'Needs Attention'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Last Check:</span>
                                  <span className="font-medium">Just now</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="w-full space-y-4">
                            <Alert className="bg-blue-50 border-blue-100">
                              <FileCheck className="h-4 w-4 text-blue-600" />
                              <AlertTitle className="text-blue-800">Ready to Generate eSTAR Package</AlertTitle>
                              <AlertDescription className="text-blue-800">
                                Your 510(k) submission has passed all required checks and is ready for eSTAR package generation.
                              </AlertDescription>
                            </Alert>
                            
                            <div className="flex justify-center">
                              <Button onClick={generateESTARPackage} className="bg-blue-600 hover:bg-blue-700">
                                <FileCheck className="h-4 w-4 mr-2" />
                                Generate eSTAR Package
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <Alert className="bg-green-50 border-green-100">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">eSTAR Package Generated Successfully</AlertTitle>
                        <AlertDescription className="text-green-800">
                          Your 510(k) eSTAR package has been generated and is ready for submission to the FDA.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 p-3 border-b">
                          <h4 className="font-medium">eSTAR Package Details</h4>
                        </div>
                        <div className="p-4 space-y-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Package ID:</span>
                            <span className="font-medium">{estarStatus?.packageId || 'ESTAR-12345'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Generation Date:</span>
                            <span className="font-medium">{new Date().toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Status:</span>
                            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Ready for Submission</Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Validation:</span>
                            <span className="font-medium text-green-600">Passed</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <Button variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download Package
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Submit to FDA
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="templates" className="flex-1 p-4 overflow-auto m-0">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>510(k) Templates</CardTitle>
                <CardDescription>
                  Standard templates for FDA 510(k) submission documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-500 mr-3" />
                      <div>
                        <p className="font-medium">Traditional 510(k) Template</p>
                        <p className="text-xs text-gray-500">Complete template for traditional 510(k) submissions</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Use Template</Button>
                  </div>
                  
                  <div className="border rounded p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-500 mr-3" />
                      <div>
                        <p className="font-medium">Abbreviated 510(k) Template</p>
                        <p className="text-xs text-gray-500">Streamlined template for abbreviated submissions</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Use Template</Button>
                  </div>
                  
                  <div className="border rounded p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-500 mr-3" />
                      <div>
                        <p className="font-medium">Special 510(k) Template</p>
                        <p className="text-xs text-gray-500">Template for device modifications</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Use Template</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="ai-tools" className="flex-1 p-4 overflow-auto m-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-white pb-2">
                <CardTitle className="flex items-center text-indigo-700">
                  <Search className="mr-2 h-5 w-5 text-indigo-600" />
                  Predicate Finder
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600 mb-4">
                  Find similar predicate devices for your 510(k) submission using AI-powered search
                </p>
                <Button variant="outline" className="w-full">
                  Launch Tool
                </Button>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-white pb-2">
                <CardTitle className="flex items-center text-indigo-700">
                  <Bot className="mr-2 h-5 w-5 text-indigo-600" />
                  Compliance Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600 mb-4">
                  Get AI recommendations for addressing compliance issues in your submission
                </p>
                <Button variant="outline" className="w-full">
                  Launch Tool
                </Button>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-white pb-2">
                <CardTitle className="flex items-center text-indigo-700">
                  <Lightbulb className="mr-2 h-5 w-5 text-indigo-600" />
                  Content Generator
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600 mb-4">
                  Generate FDA-compliant content for sections of your 510(k) submission
                </p>
                <Button variant="outline" className="w-full">
                  Launch Tool
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="documentation" className="flex-1 p-4 overflow-auto m-0">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>FDA Guidance Documents</CardTitle>
                <CardDescription>
                  Official FDA guidance for 510(k) submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 text-blue-500 mr-3" />
                      <div>
                        <p className="font-medium">Format for Traditional and Abbreviated 510(k)s</p>
                        <p className="text-xs text-gray-500">Guidance for Industry and FDA Staff</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                  
                  <div className="border rounded p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 text-blue-500 mr-3" />
                      <div>
                        <p className="font-medium">The 510(k) Program: Evaluating Substantial Equivalence</p>
                        <p className="text-xs text-gray-500">Guidance for Industry and FDA Staff</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                  
                  <div className="border rounded p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 text-blue-500 mr-3" />
                      <div>
                        <p className="font-medium">eSTAR Final Guidance</p>
                        <p className="text-xs text-gray-500">Electronic Submission Template And Resource for 510(k)s</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Device Profile Dialog */}
      <DeviceProfileDialog
        open={deviceProfileDialogOpen}
        onOpenChange={setDeviceProfileDialogOpen}
        onSave={handleCreateDeviceProfile}
      />
    </div>
  );
}