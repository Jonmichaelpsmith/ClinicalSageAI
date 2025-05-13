import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Route, 
  FileText, 
  ClipboardCheck, 
  Package, 
  FileDown 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DeviceProfileDialog from '@/components/cer/DeviceProfileDialog';
import DeviceProfileList from '@/components/cer/DeviceProfileList';
import PredicateFinderPanel from '@/components/510k/PredicateFinderPanel';
import RegPathwayAnalyzer from '@/components/510k/RegPathwayAnalyzer';

/**
 * FDA 510(k) Dashboard
 * 
 * This page serves as the central hub for all 510(k) regulatory submission activities,
 * including device profile management, predicate search, pathway analysis, and more.
 */
const FDA510kDashboard = () => {
  const [selectedTab, setSelectedTab] = useState('device-profile');
  const [selectedDeviceProfile, setSelectedDeviceProfile] = useState(null);
  const [isDeviceProfileDialogOpen, setIsDeviceProfileDialogOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const { toast } = useToast();

  // Force refresh of device profiles
  const handleRefresh = () => {
    setRefresh(prev => prev + 1);
  };

  // Handle selection of a device profile
  const handleSelectDeviceProfile = (profile) => {
    setSelectedDeviceProfile(profile);
    
    toast({
      title: 'Device Profile Selected',
      description: `${profile.deviceName} has been selected for 510(k) workflow.`,
    });
  };

  // Handle creation of a new device profile
  const handleCreateDeviceProfile = () => {
    setIsDeviceProfileDialogOpen(true);
  };

  // Handle dialog close with refresh if needed
  const handleDialogClose = (shouldRefresh) => {
    setIsDeviceProfileDialogOpen(false);
    if (shouldRefresh) {
      handleRefresh();
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">510(k) Submission Dashboard</h1>
          <p className="text-muted-foreground">
            Streamline your 510(k) submission process with AI-powered regulatory tools.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            Refresh
          </Button>
          <Button onClick={handleCreateDeviceProfile}>
            New Device Profile
          </Button>
        </div>
      </div>
      
      <DeviceProfileDialog 
        open={isDeviceProfileDialogOpen} 
        onOpenChange={handleDialogClose}
        mode="create"
      />
      
      <div className="grid grid-cols-1 gap-4">
        {!selectedDeviceProfile ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select a Device Profile</CardTitle>
              <CardDescription>
                Choose an existing device profile or create a new one to begin the 510(k) submission process.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeviceProfileList 
                onSelectDeviceProfile={handleSelectDeviceProfile}
                refresh={refresh}
              />
            </CardContent>
            <CardFooter className="border-t bg-slate-50 flex justify-end">
              <Button onClick={handleCreateDeviceProfile}>
                Create New Device Profile
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <>
            <Card className="mb-6 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedDeviceProfile.deviceName}</CardTitle>
                    <CardDescription className="mt-1">
                      <span className="font-medium">Class {selectedDeviceProfile.deviceClass}</span> • {selectedDeviceProfile.manufacturer} • {selectedDeviceProfile.productCode || 'No Product Code'}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedDeviceProfile(null)}>
                    Change Device
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="px-6 py-4 bg-blue-50 border-y">
                  <h3 className="text-sm font-medium mb-2">Device Description</h3>
                  <p className="text-sm text-gray-700">
                    {selectedDeviceProfile.description || 'No description provided'}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
                  <div className="p-4">
                    <h3 className="text-xs text-gray-500 mb-1">Intended Use</h3>
                    <p className="text-sm">{selectedDeviceProfile.intendedUse || 'Not specified'}</p>
                  </div>
                  <div className="p-4">
                    <h3 className="text-xs text-gray-500 mb-1">Technology Type</h3>
                    <p className="text-sm">{selectedDeviceProfile.technologyType || 'Not specified'}</p>
                  </div>
                  <div className="p-4">
                    <h3 className="text-xs text-gray-500 mb-1">Regulatory Status</h3>
                    <p className="text-sm">{selectedDeviceProfile.regulatoryStatus || 'Pre-submission'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Tabs defaultValue="device-profile" value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid grid-cols-5 mb-6">
                <TabsTrigger value="device-profile" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Device Profile</span>
                </TabsTrigger>
                <TabsTrigger value="predicate-finder" className="flex items-center gap-2">
                  <BarChart className="h-4 w-4" />
                  <span className="hidden sm:inline">Predicate Finder</span>
                </TabsTrigger>
                <TabsTrigger value="pathway-analyzer" className="flex items-center gap-2">
                  <Route className="h-4 w-4" />
                  <span className="hidden sm:inline">Pathway Analyzer</span>
                </TabsTrigger>
                <TabsTrigger value="equivalence-statement" className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Equivalence</span>
                </TabsTrigger>
                <TabsTrigger value="submission-package" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">eSTAR Package</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="device-profile">
                <DeviceProfileDialog 
                  open={true}
                  mode="view"
                  initialDeviceProfile={selectedDeviceProfile}
                  canClose={false}
                  embedded={true}
                />
              </TabsContent>
              
              <TabsContent value="predicate-finder">
                <PredicateFinderPanel 
                  deviceProfile={selectedDeviceProfile} 
                  organizationId={1}
                />
              </TabsContent>
              
              <TabsContent value="pathway-analyzer">
                <RegPathwayAnalyzer 
                  deviceProfile={selectedDeviceProfile}
                  organizationId={1}
                />
              </TabsContent>
              
              <TabsContent value="equivalence-statement">
                <Card className="mb-6">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
                    <CardTitle className="flex items-center text-green-700">
                      <ClipboardCheck className="h-5 w-5 mr-2 text-green-600" />
                      Substantial Equivalence Statement Builder
                    </CardTitle>
                    <CardDescription>
                      AI-powered drafting of substantial equivalence statements based on your device and predicate comparisons.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-center p-8">
                      <div className="mx-auto h-12 w-12 text-gray-400 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <ClipboardCheck className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Coming Soon</h3>
                      <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
                        Substantial Equivalence Statement Builder is currently under development and will be available in the next update.
                      </p>
                      <Button variant="outline" disabled>
                        Build Equivalence Statement
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="submission-package">
                <Card className="mb-6">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-fuchsia-50">
                    <CardTitle className="flex items-center text-purple-700">
                      <Package className="h-5 w-5 mr-2 text-purple-600" />
                      eSTAR Package Assembly
                    </CardTitle>
                    <CardDescription>
                      Automatically assemble and validate your eSTAR submission package for FDA submission.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-center p-8">
                      <div className="mx-auto h-12 w-12 text-gray-400 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Package className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Coming Soon</h3>
                      <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
                        eSTAR Package Assembly is currently under development and will be available in the next update.
                      </p>
                      <Button variant="outline" disabled>
                        Start Package Assembly
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};

export default FDA510kDashboard;