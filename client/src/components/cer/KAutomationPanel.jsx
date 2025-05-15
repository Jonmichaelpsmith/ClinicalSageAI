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
                  <DeviceProfileList
                    deviceProfiles={deviceProfiles || []}
                    isLoading={isLoadingProfiles}
                    onSelect={profile => setCurrentDeviceProfile(profile)}
                    selectedProfileId={currentDeviceProfile?.id}
                    onCreateNew={() => setDeviceProfileDialogOpen(true)}
                  />
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
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Select a device profile</AlertTitle>
                    <AlertDescription>
                      Please select a device profile to run compliance checks.
                    </AlertDescription>
                  </Alert>
                </CardContent>
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
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Complete previous steps</AlertTitle>
                    <AlertDescription>
                      Please complete the device profile, predicate finder, and compliance check steps before final review.
                    </AlertDescription>
                  </Alert>
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
            onSubmit={(data) => {
              console.log('Device profile submitted:', data);
              setDeviceProfileDialogOpen(false);
              toast({
                title: "Device Profile Created",
                description: `${data.deviceName} has been successfully created.`,
              });
            }}
            onCancel={() => setDeviceProfileDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
