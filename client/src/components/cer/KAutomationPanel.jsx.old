import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { 
  Upload, Search, FilePlus, BarChart, ArrowRight, Shield, Zap, 
  FileCheck, CheckCircle2, AlertTriangle, Lightbulb, Bot, Star, ListChecks, 
  BookOpen, Clock, Info, Check, Brain, Activity, FileText, Undo2, Users, Plus
} from 'lucide-react';
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
import { useToast } from "@/hooks/use-toast";
import DeviceProfileDialog from './DeviceProfileDialog';
import kAutomationController from '../../controllers/KAutomationController';
import FDA510kService from '../../services/FDA510kService';

export default function KAutomationPanel() {
  const [selectedTab, setSelectedTab] = useState('workflow');
  const [currentFlow, setCurrentFlow] = useState('device-profile');
  const [deviceProfiles, setDeviceProfiles] = useState([]);
  const [currentDeviceProfile, setCurrentDeviceProfile] = useState(null);
  const [showDeviceProfileDialog, setShowDeviceProfileDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch device profiles on component mount
  useEffect(() => {
    const fetchDeviceProfiles = async () => {
      try {
        setLoading(true);
        const profiles = await kAutomationController.fetchDeviceProfiles();
        setDeviceProfiles(profiles || []);
      } catch (error) {
        console.error("Error fetching device profiles:", error);
        toast({
          title: "Error",
          description: "Failed to load device profiles. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDeviceProfiles();
  }, [toast]);

  // Handle device profile creation
  const handleCreateDeviceProfile = async (profileData) => {
    try {
      setLoading(true);
      const newProfile = await kAutomationController.createDeviceProfile(profileData);
      
      setDeviceProfiles(prev => [...prev, newProfile]);
      setCurrentDeviceProfile(newProfile);
      setShowDeviceProfileDialog(false);
      
      toast({
        title: "Success",
        description: "Device profile created successfully.",
        duration: 3000
      });
    } catch (error) {
      console.error("Error creating device profile:", error);
      
      toast({
        title: "Error",
        description: "Failed to create device profile. Please try again.",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  // Handler for selecting a device profile
  const handleSelectDeviceProfile = (profile) => {
    setCurrentDeviceProfile(profile);
    
    toast({
      title: "Profile Selected",
      description: `Selected device profile: ${profile.deviceName}`,
      duration: 2000
    });
  };

  // Handler for finding predicate devices
  const handleFindPredicateDevices = async () => {
    if (!currentDeviceProfile) {
      toast({
        title: "No Device Selected",
        description: "Please select or create a device profile first.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      toast({
        title: "Searching for Predicates",
        description: "Finding similar predicate devices for your submission...",
        duration: 2000
      });
      
      // Navigate to next flow step
      setCurrentFlow('predicate-finder');
      
    } catch (error) {
      console.error("Error finding predicate devices:", error);
      
      toast({
        title: "Search Error",
        description: "Failed to search for predicate devices. Please try again.",
        variant: "destructive",
        duration: 3000
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border rounded-lg shadow">
      <div className="border-b p-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">510(k) Automation Panel</h2>
        
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
      
      <div className="flex-1 p-4 overflow-auto">
        <Tabs defaultValue="workflow" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="workflow">
              <ListChecks className="h-4 w-4 mr-2" />
              Workflow
            </TabsTrigger>
            <TabsTrigger value="templates">
              <FileText className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="documentation">
              <BookOpen className="h-4 w-4 mr-2" />
              Documentation
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="workflow" className="p-0">
            {currentFlow === 'device-profile' && (
              <div className="space-y-6">
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle>Device Profile</CardTitle>
                      <Badge variant="outline" className="ml-2">Step 1 of 4</Badge>
                    </div>
                    <CardDescription>
                      Create or select a device profile for your 510(k) submission
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!currentDeviceProfile ? (
                      <div className="text-center py-4">
                        <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-blue-50 mb-4">
                          <FilePlus className="h-8 w-8 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No Device Profile Selected</h3>
                        <p className="text-gray-500 mb-4 max-w-md mx-auto">
                          Select an existing device profile or create a new one to begin your 510(k) submission process.
                        </p>
                        <div className="flex justify-center space-x-3">
                          <Button 
                            variant="default" 
                            onClick={() => setShowDeviceProfileDialog(true)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Create New Profile
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-lg">{currentDeviceProfile.deviceName}</h3>
                            <p className="text-sm text-gray-500">
                              {currentDeviceProfile.manufacturer} - Class {currentDeviceProfile.deviceClass}
                            </p>
                          </div>
                          <Badge>{currentDeviceProfile.productCode || 'No Product Code'}</Badge>
                        </div>
                        
                        <Separator />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium">Device Type</p>
                            <p className="text-gray-600">{currentDeviceProfile.deviceType || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="font-medium">Regulation Number</p>
                            <p className="text-gray-600">{currentDeviceProfile.regulationNumber || 'Not specified'}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="font-medium">Intended Use</p>
                            <p className="text-gray-600">{currentDeviceProfile.intendedUse || 'Not specified'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="border-t bg-gray-50 flex justify-between">
                    <Button variant="outline" disabled={!currentDeviceProfile}>
                      Change Profile
                    </Button>
                    <Button 
                      onClick={handleFindPredicateDevices}
                      disabled={!currentDeviceProfile}
                    >
                      Find Predicate Devices
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>
                
                {deviceProfiles.length > 0 && !currentDeviceProfile && (
                  <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle>Existing Device Profiles</CardTitle>
                      <CardDescription>
                        Select from your existing device profiles
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {deviceProfiles.map((profile) => (
                          <div 
                            key={profile.id}
                            className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleSelectDeviceProfile(profile)}
                          >
                            <div>
                              <p className="font-medium">{profile.deviceName}</p>
                              <p className="text-sm text-gray-500">
                                {profile.manufacturer} - Class {profile.deviceClass}
                              </p>
                            </div>
                            <Badge variant="outline">
                              {profile.productCode || 'No Code'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
            
            {currentFlow === 'predicate-finder' && (
              <div className="space-y-6">
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle>Predicate Device Finder</CardTitle>
                      <Badge variant="outline" className="ml-2">Step 2 of 4</Badge>
                    </div>
                    <CardDescription>
                      Identify and select suitable predicate devices for your 510(k) submission
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Alert className="mb-4">
                      <Search className="h-4 w-4" />
                      <AlertTitle>Searching for predicate devices</AlertTitle>
                      <AlertDescription>
                        We're searching for devices that match your device profile. This may take a moment.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="text-center py-6">
                      <Progress value={45} className="w-full mb-4" />
                      <p className="text-sm text-gray-500">Searching FDA database...</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="templates">
            <div className="grid gap-4">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Document Templates</CardTitle>
                  <CardDescription>
                    Standardized templates for 510(k) submission documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Template content will appear here</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="documentation">
            <div className="grid gap-4">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>FDA Guidance</CardTitle>
                  <CardDescription>
                    Official FDA guidance documents and references
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Documentation content will appear here</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Device Profile Dialog */}
      {showDeviceProfileDialog && (
        <DeviceProfileDialog
          open={showDeviceProfileDialog}
          onOpenChange={setShowDeviceProfileDialog}
          onSave={handleCreateDeviceProfile}
        />
      )}
    </div>
  );
}