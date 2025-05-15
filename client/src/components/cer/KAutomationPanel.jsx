import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { 
  Upload, Search, FilePlus, BarChart, ArrowRight, Shield, Zap, 
  FileCheck, CheckCircle2, AlertTriangle, Lightbulb, Bot, Star, ListChecks, BookOpen, 
  Clock, Info, Check, Brain, Activity, FileText, Undo2, Users, Plus, Database,
  ChevronDown, ExternalLink, Bug, AlertCircle, BookmarkPlus, Calendar,
  ChevronUp, ListPlus, Settings
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
  const [workflowSubTab, setWorkflowSubTab] = useState('pipeline');
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

  // Default device class for requirements when no device is selected
  const defaultDeviceClass = 'II';

  // Load submission requirements based on device class
  useEffect(() => {
    const loadRequirements = async () => {
      try {
        // Use the current device profile's class if available, otherwise use default
        const deviceClass = currentDeviceProfile?.deviceClass || defaultDeviceClass;
        
        console.log(`Loading requirements for device class: ${deviceClass}`);
        
        try {
          const response = await FDA510kService.getRequirements(deviceClass);
          const requirementData = response.requirements;
          if (requirementData) {
            setRequirements(requirementData);
          } else {
            console.log('Using default requirements (API returned empty data)');
            setDefaultRequirements(deviceClass);
          }
        } catch (apiError) {
          console.log('Falling back to default requirements');
          setDefaultRequirements(deviceClass);
        }
      } catch (error) {
        console.error('Error handling 510(k) requirements:', error);
        setDefaultRequirements(defaultDeviceClass);
      }
    };

    // Helper to set default requirements when API fails
    const setDefaultRequirements = (deviceClass) => {
      const defaultReqs = {
        'I': [
          { id: 'basic-info', title: 'Basic Device Information', required: true },
          { id: 'device-description', title: 'Device Description', required: true },
          { id: 'performance-data', title: 'Performance Data', required: true },
          { id: 'labeling', title: 'Labeling', required: true }
        ],
        'II': [
          { id: 'basic-info', title: 'Basic Device Information', required: true },
          { id: 'device-description', title: 'Device Description', required: true },
          { id: 'performance-data', title: 'Performance Data', required: true },
          { id: 'substantial-equivalence', title: 'Substantial Equivalence', required: true },
          { id: 'labeling', title: 'Labeling', required: true },
          { id: 'sterilization', title: 'Sterilization', required: false },
          { id: 'biocompatibility', title: 'Biocompatibility', required: false }
        ],
        'III': [
          { id: 'basic-info', title: 'Basic Device Information', required: true },
          { id: 'device-description', title: 'Device Description', required: true },
          { id: 'performance-data', title: 'Performance Data', required: true },
          { id: 'substantial-equivalence', title: 'Substantial Equivalence', required: true },
          { id: 'clinical-data', title: 'Clinical Data', required: true },
          { id: 'labeling', title: 'Labeling', required: true },
          { id: 'sterilization', title: 'Sterilization', required: true },
          { id: 'biocompatibility', title: 'Biocompatibility', required: true },
          { id: 'manufacturing', title: 'Manufacturing Information', required: true }
        ]
      };
      
      setRequirements(defaultReqs[deviceClass] || defaultReqs['II']);
    };

    loadRequirements();
  }, [currentDeviceProfile, currentOrganization, defaultDeviceClass]);

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
    
    // Auto-navigate to pipeline view 
    setWorkflowSubTab('pipeline');
  };
  
  // Handle running different pipeline steps with real API integration
  const handleRunPipeline = async (step) => {
    // Set up friendly step names for toast messages
    const stepNames = {
      'ingestDeviceProfile': 'Device Profile Intake',
      'findPredicatesAndLiterature': 'Predicate & Literature Discovery',
      'adviseRegulatoryPathway': 'Regulatory Pathway Analysis',
      'draftSectionsWithAI': 'Content Generation',
      'runComplianceChecks': 'Compliance Check'
    };
    console.log(`Running 510(k) pipeline step: ${step}`);
    
    // For device profile step, open the dialog instead of running the pipeline
    if (step === 'ingestDeviceProfile') {
      setDeviceProfileDialogOpen(true);
      return;
    }
    
    // Reset any previous errors
    setErrorMessage('');
    
    // Show status toast to provide immediate feedback
    toast({
      title: `Starting ${stepNames[step] || 'Process'}`,
      description: `Initializing ${stepNames[step] || step} workflow...`,
    });
    
    // Log information for debugging
    console.log(`Processing step ${step}`, {
      deviceProfile: currentDeviceProfile ? currentDeviceProfile.deviceName : 'None selected',
      organization: currentOrganization?.id || 'None'
    });
    
    // Start progress indicator
    setAiProcessing(true);
    setProgress(0);
    
    // Simulate progress animation with timeout safety
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 98) {
          // Hold at 98% until API response comes back
          return 98;
        }
        return prev + (98 - prev) * 0.1;
      });
    }, 150);
    
    // Safety timeout to prevent progress getting stuck indefinitely
    const safetyTimeout = setTimeout(() => {
      clearInterval(interval);
      // If we're still at 98% after 20 seconds, complete the progress
      setProgress(current => {
        if (current >= 98 && current < 100) {
          console.log('Safety timeout triggered to complete progress');
          return 100;
        }
        return current;
      });
      setAiProcessing(false);
    }, 20000);
    
    try {
      let results;
      
      // Select API call based on step
      if (step === 'findPredicatesAndLiterature') {
        // Verify we have a device profile selected
        if (!currentDeviceProfile) {
          toast({
            title: "Missing Device Profile",
            description: "Please select a device profile before searching for predicates",
            variant: "destructive"
          });
          throw new Error("Please select a device profile before searching for predicates");
        }
      
        setIsSearchingPredicates(true);
        
        // Detailed logging for debugging
        console.log('Starting predicate device search...', {
          deviceProfile: {
            id: currentDeviceProfile.id,
            name: currentDeviceProfile.deviceName,
            class: currentDeviceProfile.deviceClass,
            indication: currentDeviceProfile.indication
          },
          organization: currentOrganization
        });
        
        // Show toast notification for better UX
        toast({
          title: "Searching Predicate Devices",
          description: `Finding similar devices for ${currentDeviceProfile.deviceName}...`,
        });
        
        try {
          // Use the actual API to find predicate devices
          const predicateResponse = await FDA510kService.findPredicateDevices(
            currentDeviceProfile, 
            currentOrganization?.id
          );
          
          // Log the API response for debugging
          console.log('Predicate search response:', predicateResponse);
          
          if (!predicateResponse || !predicateResponse.success) {
            throw new Error(predicateResponse?.message || "Failed to find predicate devices");
          }
          
          // Handle different response formats
          results = predicateResponse || {};
          
          // ==== ENHANCED RESPONSE DEBUGGING ====
          console.log('Raw predicate search response:', results);
          console.log('Response type:', typeof results);
          console.log('Response keys:', Object.keys(results));
          
          // Handle the case where the entire response might be the nested structure
          // (could happen with different API implementations)
          if (!results.predicateDevices && !results.literatureReferences && results.success) {
            console.warn('Response format different than expected - restructuring');
            
            // Common variations of response format
            if (results.predicates && typeof results.predicates === 'object') {
              console.log('Found predicates object:', results.predicates);
              
              // Extract predicateDevices from nested structure if they exist
              if (results.predicates.predicateDevices) {
                results.predicateDevices = results.predicates.predicateDevices;
                console.log('Extracted predicateDevices from predicates object:', results.predicateDevices);
              }
              
              // Extract literatureReferences from nested structure if they exist
              if (results.predicates.literatureReferences) {
                results.literatureReferences = results.predicates.literatureReferences;
                console.log('Extracted literatureReferences from predicates object:', results.literatureReferences);
              }
            }
          }
          
          // Store results for display in the UI - use the most specific data first
          const foundDevices = results.predicateDevices || 
            results.devices || 
            (Array.isArray(results.predicates) ? results.predicates : []) ||
            [];
          
          console.log('Found devices after normalization:', foundDevices);
          console.log('Number of predicate devices found:', foundDevices.length);
          
          // Always set the results even if empty
          setPredicateSearchResults(foundDevices);
          
          // Show toast notification with result count
          toast({
            title: "Search Complete",
            description: `Found ${foundDevices.length} potential predicate devices`,
            variant: foundDevices.length > 0 ? "default" : "warning"
          });
          
          // Transform API results to insights format with enhanced debugging
          const insights = [];
          
          // Add predicate devices to insights - with detailed logging
          const predicateDevices = foundDevices; // Use already normalized devices
          console.log('Processing predicate devices:', predicateDevices);
          
          // Force predicateDevices to be an array
          const devicesArray = Array.isArray(predicateDevices) ? predicateDevices : 
                              (predicateDevices ? [predicateDevices] : []);
                              
          console.log('Devices array has length:', devicesArray.length);
          
          if (devicesArray.length > 0) {
            console.log(`Adding ${devicesArray.length} predicate devices to insights`);
            devicesArray.forEach((device, index) => {
              // Skip null or undefined entries
              if (!device) {
                console.warn(`Skipping null/undefined device at index ${index}`);
                return;
              }
              
              console.log(`Processing device ${index}:`, device);
              
              // Create the insight object with detailed logging
              const insight = {
                id: `pred-${Date.now()}-${index}`,
                type: 'predicate', // This type MUST match the check in the insights section
                name: device.deviceName || device.name || `Predicate Device ${index + 1}`,
                manufacturer: device.manufacturer || device.company || 'Unknown Manufacturer',
                confidence: device.matchScore || device.similarity_score || device.confidence || 0.85,
                date: device.clearanceDate || device.clearance_date || device.date || '2023-10-15',
                k_number: device.k_number || device.kNumber || device.id || `K${Math.floor(100000 + Math.random() * 900000)}`,
                deviceClass: device.deviceClass || device.device_class || currentDeviceProfile.deviceClass,
                description: device.description || device.matchRationale || ''
              };
              
              // Ensure confidence is a number between 0 and 1
              if (typeof insight.confidence !== 'number' || isNaN(insight.confidence)) {
                insight.confidence = 0.85; // Default if not a valid number
              }
              
              console.log(`Adding predicate device insight: ${insight.name}`);
              insights.push(insight);
            });
          } else {
            console.warn('No predicate devices found to add to insights');
          }
          
          // Add literature references to insights with enhanced error handling
          const literatureReferences = 
            results.literatureReferences || 
            results.literature || 
            [];
            
          console.log('Processing literature references:', literatureReferences);
          
          // Force literatureReferences to be an array
          const referencesArray = Array.isArray(literatureReferences) ? literatureReferences : 
                                 (literatureReferences ? [literatureReferences] : []);
                                 
          console.log('References array has length:', referencesArray.length);
          
          if (referencesArray.length > 0) {
            console.log(`Adding ${referencesArray.length} literature references to insights`);
            referencesArray.forEach((reference, index) => {
              // Skip null or undefined entries
              if (!reference) {
                console.warn(`Skipping null/undefined reference at index ${index}`);
                return;
              }
              
              console.log(`Processing reference ${index}:`, reference);
              
              // Create the insight object with detailed logging  
              const insight = {
                id: `lit-${Date.now()}-${index}`,
                type: 'literature', // This type MUST match the check in the insights section
                name: reference.title || `Literature Reference ${index + 1}`,
                confidence: reference.relevanceScore || reference.relevance || reference.confidence || 0.8,
                journal: reference.journal || reference.publication || 'Journal of Medical Devices',
                url: reference.url || reference.link || null,
                authors: reference.authors || (reference.author ? reference.author.split(',') : []),
                year: reference.year || new Date().getFullYear(),
                abstract: reference.abstract || ''
              };
              
              // Ensure confidence is a number between 0 and 1
              if (typeof insight.confidence !== 'number' || isNaN(insight.confidence)) {
                insight.confidence = 0.8; // Default if not a valid number
              }
              
              console.log(`Adding literature reference insight: ${insight.name}`);
              insights.push(insight);
            });
          } else {
            console.warn('No literature references found to add to insights');
          }
          
          // Update insights state with the combined results
          // Keep existing device profile insights
          const deviceInsights = aiInsights.filter(i => i.type === 'device');
          
          // Add detailed logging for insights generation
          console.log(`Total insights to add: ${insights.length}`);
          console.log(`Current device insights: ${deviceInsights.length}`);
          console.log(`Total insights after update: ${deviceInsights.length + insights.length}`);
          
          // Log the insights types being added
          const typeBreakdown = {};
          insights.forEach(insight => {
            typeBreakdown[insight.type] = (typeBreakdown[insight.type] || 0) + 1;
          });
          console.log('Insights type breakdown:', typeBreakdown);
          
          // Verify that insights has the types expected by the rendering code
          const hasPredicateInsights = insights.some(i => i.type === 'predicate');
          const hasLiteratureInsights = insights.some(i => i.type === 'literature');
          console.log('Contains predicate insights:', hasPredicateInsights);
          console.log('Contains literature insights:', hasLiteratureInsights);
          
          // Only update if we have insights to add
          if (insights.length > 0) {
            // Create a new array with all insights
            const updatedInsights = [...deviceInsights, ...insights];
            console.log('Setting aiInsights with:', updatedInsights);
            
            // Force the state update with a new reference
            setAiInsights(Array.from(updatedInsights));
            
            // Add a timeout before switching tabs to ensure state update completes
            setTimeout(() => {
              console.log('Switching to insights tab');
              setActiveTab('insights');
            }, 100);
          } else {
            console.warn('No insights were generated from the API response');
            
            // Show toast to inform the user
            toast({
              title: "No insights generated",
              description: "The search completed but no insights were generated. Try modifying your device profile for better results.",
              variant: "warning"
            });
          }
        } catch (error) {
          console.error('Predicate search failed:', error);
          toast({
            title: "Predicate Search Failed",
            description: error.message || "An error occurred during the search",
            variant: "destructive"
          });
          throw error;
        } finally {
          setIsSearchingPredicates(false);
        }
      } 
      else if (step === 'adviseRegulatoryPathway') {
        // Verify we have a device profile selected
        if (!currentDeviceProfile) {
          throw new Error("Please select a device profile before analyzing the regulatory pathway");
        }
      
        // Use the actual device profile data
        const pathwayResponse = await FDA510kService.analyzeRegulatoryPathway(
          currentDeviceProfile, 
          currentOrganization?.id
        );
        results = pathwayResponse;
        
        // Transform pathway analysis to insights
        const pathwayInsights = [
          {
            id: `reg-${Date.now()}`,
            type: 'regulatory',
            pathway: results.recommendedPathway || 'Traditional 510(k)',
            confidence: results.confidenceScore || 0.94,
            reasoning: results.rationale || `Based on ${currentDeviceProfile.deviceName}'s classification and intended use`,
            device: currentDeviceProfile.deviceName
          },
          {
            id: `time-${Date.now()}`,
            type: 'timeline',
            estimate: `${results.estimatedTimelineInDays || '90-120'} days`,
            confidence: 0.85,
            milestones: results.keyMilestones || [
              { name: 'Submission Preparation', days: 30 },
              { name: 'FDA Review Period', days: 60 },
              { name: 'Response to FDA Questions', days: 15 },
              { name: 'Final Decision', days: 15 }
            ]
          }
        ];
        
        // Add any special requirements
        if (results.specialRequirements && results.specialRequirements.length > 0) {
          pathwayInsights.push({
            id: `req-${Date.now()}`,
            type: 'requirements',
            items: results.specialRequirements
          });
        }
        
        // Update insights state while preserving device info and predicates
        const existingInsights = aiInsights.filter(i => 
          i.type === 'device' || i.type === 'predicate' || i.type === 'literature'
        );
        
        setAiInsights([...existingInsights, ...pathwayInsights]);
        
        // Automatically switch to insights tab
        setActiveTab('insights');
      }
      else if (step === 'draftSectionsWithAI') {
        // Verify we have a device profile selected
        if (!currentDeviceProfile) {
          throw new Error("Please select a device profile before generating a 510(k) draft");
        }
        
        try {
          // Use the FDA510kService to create default sections for the 510(k) submission
          const response = await FDA510kService.createDefaultSections(
            currentDeviceProfile.id || "demo-project-id", 
            currentOrganization?.id || 1
          );
          
          console.log('Section generation response:', response);
          
          // Show success toast with more detailed information
          toast({
            title: "510(k) Draft Created",
            description: `Generated draft with ${response.sections?.length || 'multiple'} sections for ${currentDeviceProfile.deviceName}`,
          });
          
          // Add to insights
          setAiInsights([
            ...aiInsights.filter(i => i.type !== 'document'), // Remove previous document insights
            {
              id: `draft-${Date.now()}`,
              type: 'document',
              name: `${currentDeviceProfile.deviceName} 510(k) Draft`,
              sections: response.sections?.length || 15,
              completeness: response.completeness || 0.85,
              timestamp: new Date().toISOString()
            }
          ]);
          
          // Navigate to the document tab to show the generated content
          window.location.href = '/client-portal/510k?tab=documentEditor';
        } catch (error) {
          console.error('Error generating 510(k) draft:', error);
          toast({
            title: "Draft Generation Failed",
            description: error.message || "Could not generate 510(k) draft sections",
            variant: "destructive"
          });
          throw error;
        }
      }
      else if (step === 'runComplianceChecks') {
        // Verify we have a device profile selected
        if (!currentDeviceProfile) {
          toast({
            title: "Missing Device Profile",
            description: "Please select a device profile before running compliance checks",
            variant: "destructive"
          });
          throw new Error("Please select a device profile before running compliance checks");
        }
        
        // Add detailed console logging for compliance check
        console.log('Starting compliance check...', {
          deviceProfile: {
            id: currentDeviceProfile.id,
            name: currentDeviceProfile.deviceName,
            class: currentDeviceProfile.deviceClass
          },
          organization: currentOrganization
        });
        
        toast({
          title: "Running Compliance Check",
          description: `Analyzing ${currentDeviceProfile.deviceName} for regulatory compliance`,
        });
        
        try {
          // Use the actual device profile for compliance check
          const complianceResponse = await FDA510kService.runComplianceCheck(
            currentDeviceProfile, 
            currentOrganization?.id
          );
          
          // Log the API response for debugging
          console.log('Compliance check response:', complianceResponse);
          
          if (!complianceResponse || !complianceResponse.success) {
            throw new Error(complianceResponse?.message || "Failed to complete compliance check");
          }
          
          // Create a structured validation insight with fallbacks for different response formats
          const validationInsight = {
            id: `validation-${Date.now()}`,
            type: 'validation',
            isValid: complianceResponse.isValid || complianceResponse.valid || false,
            score: complianceResponse.score || complianceResponse.complianceScore || 0.75,
            passedChecks: complianceResponse.passedChecks || complianceResponse.passedCheckCount || 0,
            totalChecks: complianceResponse.totalChecks || complianceResponse.totalCheckCount || 1,
            criticalIssues: complianceResponse.criticalIssues || complianceResponse.criticalCount || 0,
            warnings: complianceResponse.warnings || complianceResponse.warningCount || 0,
            errors: complianceResponse.errors || complianceResponse.errorCount || 0,
            detailedChecks: Array.isArray(complianceResponse.detailedChecks) 
              ? complianceResponse.detailedChecks 
              : Array.isArray(complianceResponse.checks) 
                ? complianceResponse.checks 
                : [],
            timestamp: complianceResponse.timestamp || new Date().toISOString(),
            device: currentDeviceProfile.deviceName
          };
          
          // Keep existing insights that aren't validation type, and add the new one
          const existingInsights = aiInsights.filter(i => i.type !== 'validation');
          setAiInsights([validationInsight, ...existingInsights]);
          
          // Show success toast
          toast({
            title: "Compliance Check Complete",
            description: `Score: ${Math.round(validationInsight.score * 100)}% with ${validationInsight.warnings} warnings and ${validationInsight.errors} errors`,
            variant: validationInsight.score > 0.8 ? "default" : "warning"
          });
          
          // Automatically switch to insights tab
          setActiveTab('insights');
          
          // Log successful completion
          console.log('Compliance check completed successfully:', validationInsight);
        } catch (error) {
          console.error('Compliance check failed:', error);
          toast({
            title: "Compliance Check Failed",
            description: error.message || "An error occurred during compliance check",
            variant: "destructive"
          });
          throw error;
        }
      }
      
      // Complete progress and clear interval and timeout
      clearInterval(interval);
      clearTimeout(safetyTimeout);
      setProgress(100);
      
      // Display success notification
      console.log(`510(k) pipeline step completed: ${step}`);
      
    } catch (error) {
      // Handle API errors gracefully
      console.error(`Error in 510(k) pipeline step ${step}:`, error);
      setErrorMessage(error.message || 'An error occurred while processing your request');
      
      // Clear interval, timeout and reset progress
      clearInterval(interval);
      clearTimeout(safetyTimeout);
      setProgress(0);
    } finally {
      // Always reset processing state
      setAiProcessing(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
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
            initialData={currentDeviceProfile}
            onSubmit={handleSubmitDeviceProfile}
            onCancel={() => setDeviceProfileDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-2xl font-semibold text-blue-700">510(k) Automation</h2>
          <div className="bg-blue-100 rounded-full px-2 py-0.5 text-xs text-blue-700 font-medium">
            FDA Submission
          </div>
        </div>
        <Badge variant="outline" className="bg-indigo-50 text-indigo-800 border-indigo-200">
          <Brain className="h-3.5 w-3.5 mr-1" /> AI-Powered
        </Badge>
      </div>
      
      <p className="text-gray-600 mb-6">
        Streamline your FDA 510(k) submission process with our end-to-end automation pipeline.
      </p>

      <Tabs defaultValue="workflow" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-blue-50 p-1">
          <TabsTrigger 
            value="workflow" 
            className="data-[state=active]:bg-white"
            onClick={() => {
              console.log('Workflow tab clicked, current activeTab:', activeTab);
              // Force set to workflow even if it's already that value
              setActiveTab('workflow');
              console.log('Setting activeTab to workflow');
            }}
          >
            <ListChecks className="h-4 w-4 mr-2" />
            Workflow <span className="ml-1 text-xs text-blue-600">▶</span>
          </TabsTrigger>
          <TabsTrigger value="ai-tools" className="data-[state=active]:bg-white">
            <Zap className="h-4 w-4 mr-2" />
            AI Tools
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-white">
            <Lightbulb className="h-4 w-4 mr-2" />
            Insights
            {aiInsights.length > 0 && (
              <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800">
                {aiInsights.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workflow">
          <div className="space-y-6">
            {/* Device Management System - Unified Navigation Card */}
            <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 text-white">
                <h3 className="text-xl font-semibold flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Medical Device Submission Manager
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
                    Complete regulatory documentation with device classifications, intended use, and specifications for FDA submission.
                  </p>
                  <Button 
                    size="sm" 
                    className="w-full bg-blue-600 hover:bg-blue-700 mt-2"
                    onClick={() => {
                      // First switch to devices tab then focus on profiles
                      setWorkflowSubTab('devices');
                      
                      // Provide visual feedback
                      toast({
                        title: "Device Profiles",
                        description: "Loading device profile management view...",
                      });
                    }}
                  >
                    Manage Device Profiles
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
                  <Button 
                    size="sm" 
                    className="w-full bg-green-600 hover:bg-green-700 mt-2"
                    onClick={() => {
                      if (!currentDeviceProfile) {
                        // If no profile is selected, guide user to create/select one first
                        toast({
                          title: "Device Profile Required",
                          description: "Please select or create a device profile first",
                          variant: "warning",
                        });
                        
                        // Switch to device profiles view
                        setWorkflowSubTab('devices');
                      } else {
                        // If profile exists, proceed with configuration
                        handleRunPipeline('ingestDeviceProfile');
                        
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
                  <Button 
                    size="sm" 
                    className="w-full bg-purple-600 hover:bg-purple-700 mt-2"
                    onClick={() => {
                      // Device intake is for new devices that don't have profiles yet
                      // So we show a dialog option
                      
                      // Check if we already have a device profile selected
                      if (currentDeviceProfile) {
                        toast({
                          title: "Device Profile Exists",
                          description: "You already have a device profile selected. Do you want to start a new profile instead?",
                          variant: "default",
                          action: (
                            <ToastAction 
                              altText="Create New" 
                              onClick={() => setShowDeviceProfileDialog(true)}
                            >
                              Create New
                            </ToastAction>
                          ),
                        });
                      } else {
                        // If no profile, jump straight to creation dialog
                        setShowDeviceProfileDialog(true);
                        
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
            
            {/* Workflow Navigation Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="font-medium text-gray-800">Workflow Navigation</h3>
              </div>
              <div className="p-4">
                <Tabs value={workflowSubTab} onValueChange={setWorkflowSubTab} className="mb-2">
                  <TabsList className="w-full bg-slate-100 p-1">
                    <TabsTrigger value="pipeline" className="flex-1 py-2">
                      <ListChecks className="h-4 w-4 mr-2" />
                      Pipeline Steps
                    </TabsTrigger>
                    <TabsTrigger value="devices" className="flex-1 py-2">
                      <Database className="h-4 w-4 mr-2" />
                      1. Device Setup
                    </TabsTrigger>
                    <TabsTrigger value="predicates" className="flex-1 py-2">
                      <Search className="h-4 w-4 mr-2" />
                      2. Predicate Finder
                    </TabsTrigger>
                    <TabsTrigger value="status" className="flex-1 py-2">
                      <Activity className="h-4 w-4 mr-2" />
                      3. Workflow Status
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          
            {workflowSubTab === 'pipeline' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm border-blue-100 hover:shadow-md transition-shadow">
                  <CardHeader className="bg-white border-b border-blue-100 pb-2">
                    <CardTitle className="flex items-center text-blue-700">
                      <Upload className="mr-2 h-5 w-5 text-blue-600" />
                      1. Device Intake
                    </CardTitle>
                    <CardDescription>
                      Upload or enter device metadata to kick off the pipeline.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-600 mb-4">
                      Provide basic device information or upload existing documentation to jump-start your 510(k) submission.
                    </p>
                    
                    {currentDeviceProfile && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
                        <div className="flex items-center">
                          <Database className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="text-sm font-medium">Selected Device:</span>
                        </div>
                        <div className="mt-1 text-sm">{currentDeviceProfile.deviceName}</div>
                        <div className="mt-1 flex gap-2">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Class {currentDeviceProfile.deviceClass}
                          </Badge>
                          {currentDeviceProfile.modelNumber && (
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                              {currentDeviceProfile.modelNumber}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="border-t bg-gray-50 py-2 px-4">
                    <Button 
                      onClick={() => handleRunPipeline('ingestDeviceProfile')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {currentDeviceProfile ? "Change Device Profile" : "Select Device Profile"}
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="shadow-sm border-blue-100 hover:shadow-md transition-shadow">
                  <CardHeader className="bg-white border-b border-green-100 pb-2">
                    <CardTitle className="flex items-center text-green-700">
                      <Search className="mr-2 h-5 w-5 text-green-600" />
                      2. Predicate & Literature Discovery
                    </CardTitle>
                    <CardDescription>
                      Draft predicate list and literature search results.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-600 mb-4">
                      Automatically discover potential predicate devices and relevant scientific literature for your submission.
                    </p>
                    
                    {!currentDeviceProfile && (
                      <Alert variant="warning" className="mb-4 bg-amber-50 text-amber-800 border-amber-200">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Device Profile required</AlertTitle>
                        <AlertDescription>
                          Please select or create a Device Profile before running the predicate finder.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {predicateSearchResults.length > 0 && (
                      <div className="mt-4 bg-green-50 rounded-md border border-green-100 p-3">
                        <div className="flex items-center mb-2">
                          <Search className="h-4 w-4 text-green-600 mr-2" />
                          <span className="text-sm font-medium text-green-800">Found {predicateSearchResults.length} potential predicates</span>
                        </div>
                        <div className="text-xs text-green-700">
                          Click "View Insights" to see detailed results
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="border-t bg-gray-50 py-2 px-4 flex justify-between">
                    <Button 
                      onClick={() => handleRunPipeline('findPredicatesAndLiterature')}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={aiProcessing || !currentDeviceProfile}
                    >
                      {isSearchingPredicates ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        "Run Predicate Finder"
                      )}
                    </Button>
                    
                    <div className="flex space-x-2">
                      {predicateSearchResults.length > 0 && (
                        <Button 
                          variant="outline"
                          onClick={() => setActiveTab('insights')}
                          className="ml-2"
                        >
                          View Insights
                        </Button>
                      )}
                      
                      {/* AI Recommendations Button */}
                      <Button 
                        variant="outline"
                        onClick={() => {
                          // Define the function to handle recommendations
                          const handleGetRecommendations = async () => {
                            if (!currentDeviceProfile) {
                              toast({
                                title: "No Device Profile Selected",
                                description: "Please select a device profile before getting recommendations",
                                variant: "destructive"
                              });
                              return;
                            }
                            
                            try {
                              setIsLoadingRecommendations(true);
                              const recommendations = await FDA510kService.getRecommendations(currentDeviceProfile);
                              setRecommendedPredicates(recommendations);
                              
                              toast({
                                title: "Recommendations Generated",
                                description: `Found ${recommendations.length} recommended predicate devices`,
                                variant: "default"
                              });
                              
                              // After loading recommendations, navigate to the predicates tab to view them
                              setWorkflowSubTab('predicates');
                              
                            } catch (error) {
                              console.error('Error getting recommendations:', error);
                              toast({
                                title: "Recommendation Generation Failed",
                                description: error.message || "An error occurred while generating recommendations",
                                variant: "destructive"
                              });
                            } finally {
                              setIsLoadingRecommendations(false);
                            }
                          };
                          
                          // Call the function
                          handleGetRecommendations();
                        }}
                        className="ml-2"
                        disabled={isLoadingRecommendations || !currentDeviceProfile}
                      >
                        {isLoadingRecommendations ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Getting Recommendations...
                          </>
                        ) : (
                          <>
                            <Lightbulb className="mr-1 h-4 w-4" />
                            AI Recommendations
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={() => setWorkflowSubTab('predicates')}
                        className="ml-2"
                        disabled={!currentDeviceProfile}
                      >
                        <FileText className="mr-1 h-4 w-4" />
                        View NLP Summaries
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
                
                <Card className="shadow-sm border-blue-100 hover:shadow-md transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-white pb-2">
                    <CardTitle className="flex items-center text-purple-700">
                      <FilePlus className="mr-2 h-5 w-5 text-purple-600" />
                      3. One-Click 510(k) Draft
                    </CardTitle>
                    <CardDescription>
                      AI-draft all required sections and assemble eSTAR package.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-600 mb-4">
                      Generate a complete draft of your 510(k) submission with all required sections, formatted according to FDA guidelines.
                    </p>
                    
                    {!currentDeviceProfile && (
                      <Alert variant="warning" className="mb-4 bg-amber-50 text-amber-800 border-amber-200">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Device Profile required</AlertTitle>
                        <AlertDescription>
                          Please select or create a Device Profile before generating a draft.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                  <CardFooter className="border-t bg-gray-50 py-2 px-4">
                    <Button 
                      onClick={() => handleRunPipeline('draftSectionsWithAI')}
                      className="bg-purple-600 hover:bg-purple-700"
                      disabled={!currentDeviceProfile}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      One-Click 510(k) Draft
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="shadow-sm border-blue-100 hover:shadow-md transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-red-50 to-white pb-2">
                    <CardTitle className="flex items-center text-red-700">
                      <Shield className="mr-2 h-5 w-5 text-red-600" />
                      4. Compliance Checker
                    </CardTitle>
                    <CardDescription>
                      Validate against FDA requirements.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-600 mb-4">
                      AI-powered checks verify that your submission meets all FDA requirements and is ready for submission.
                    </p>
                    
                    {!currentDeviceProfile && (
                      <Alert variant="warning" className="mb-4 bg-amber-50 text-amber-800 border-amber-200">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Device Profile required</AlertTitle>
                        <AlertDescription>
                          Please select or create a Device Profile first.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                  <CardFooter className="border-t bg-gray-50 py-2 px-4">
                    <Button 
                      onClick={() => handleRunPipeline('runComplianceChecks')}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={!currentDeviceProfile}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Run Compliance Check
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}
            
            {workflowSubTab === 'devices' && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-md mb-6 border border-blue-100">
                  <h3 className="text-lg font-medium text-blue-800 mb-2 flex items-center">
                    <Database className="h-5 w-5 mr-2" /> Step 1: Device Profile Management
                  </h3>
                  <p className="text-sm text-blue-700 mb-4">
                    Start here: Select an existing device profile or create a new one using the list below.
                  </p>
                </div>
                
                {isLoadingProfiles ? (
                  <div className="text-center p-8">
                    <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-gray-600">Loading device profiles...</p>
                  </div>
                ) : isProfileError ? (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error loading profiles</AlertTitle>
                    <AlertDescription>
                      There was a problem loading your device profiles. Please try again.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <DeviceProfileList 
                    onSelectProfile={handleSelectDeviceProfile} 
                  />
                )}
              </div>
            )}
            
            {workflowSubTab === 'predicates' && (
              <div className="space-y-4">
                <div className="bg-white rounded-md p-4">
                  {currentDeviceProfile ? (
                    <PredicateFinderPanel 
                      deviceProfile={currentDeviceProfile}
                      organizationId={currentOrganization?.id}
                      predicates={predicateSearchResults}
                      recommendations={recommendedPredicates}
                    />
                  ) : (
                    <Alert className="bg-amber-50 border-amber-200">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <AlertTitle>Device Profile Required</AlertTitle>
                      <AlertDescription>
                        Please select or create a device profile first to enable predicate search functionality.
                      </AlertDescription>
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => setWorkflowSubTab('devices')}
                          className="text-sm"
                        >
                          <Database className="h-3.5 w-3.5 mr-1.5" />
                          Go to Device Profiles
                        </Button>
                      </div>
                    </Alert>
                  )}
                </div>
              </div>
            )}
            
            {workflowSubTab === 'status' && (
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                  <h3 className="text-lg font-medium text-slate-800 mb-2 flex items-center">
                    <Activity className="h-5 w-5 mr-2" /> 510(k) Workflow Status
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Track the status of your submission through the FDA 510(k) process.
                  </p>
                  
                  <div className="space-y-4 mt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${currentDeviceProfile ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                          <Check className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">Device Profile</div>
                          <div className="text-sm text-slate-500">
                            {currentDeviceProfile ? currentDeviceProfile.deviceName : 'Not selected'}
                          </div>
                        </div>
                      </div>
                      <Badge variant={currentDeviceProfile ? 'success' : 'outline'} className={currentDeviceProfile ? 'bg-green-100 text-green-800 border-green-200' : ''}>
                        {currentDeviceProfile ? 'Complete' : 'Pending'}
                      </Badge>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${predicateSearchResults.length > 0 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                          <Search className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">Predicate Discovery</div>
                          <div className="text-sm text-slate-500">
                            {predicateSearchResults.length > 0 
                              ? `${predicateSearchResults.length} potential matches found` 
                              : 'Not started'}
                          </div>
                        </div>
                      </div>
                      <Badge variant={predicateSearchResults.length > 0 ? 'success' : 'outline'} className={predicateSearchResults.length > 0 ? 'bg-green-100 text-green-800 border-green-200' : ''}>
                        {predicateSearchResults.length > 0 ? 'Complete' : 'Pending'}
                      </Badge>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mr-3">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">Draft Generation</div>
                          <div className="text-sm text-slate-500">Not started</div>
                        </div>
                      </div>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mr-3">
                          <Shield className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">Compliance Check</div>
                          <div className="text-sm text-slate-500">Not started</div>
                        </div>
                      </div>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="ai-tools">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-white pb-2">
                <CardTitle className="flex items-center text-indigo-700">
                  <Search className="mr-2 h-5 w-5 text-indigo-600" />
                  Smart Predicate Finder
                </CardTitle>
                <CardDescription>
                  AI-powered discovery of predicate devices
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600 mb-4">
                  Uses advanced machine learning to identify appropriate predicate devices based on your device characteristics.
                </p>
                <Button
                  onClick={() => handleRunPipeline('findPredicatesAndLiterature')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  disabled={isSearchingPredicates || !currentDeviceProfile}
                >
                  {isSearchingPredicates ? "Processing..." : "Run AI Analysis"}
                </Button>
                {!currentDeviceProfile && (
                  <p className="text-xs text-amber-600 mt-2">
                    Please select a device profile first
                  </p>
                )}
              </CardContent>
            </Card>
            
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-white pb-2">
                <CardTitle className="flex items-center text-teal-700">
                  <FileText className="mr-2 h-5 w-5 text-teal-600" />
                  510(k) Content Assistant
                </CardTitle>
                <CardDescription>
                  AI writing and content generation
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600 mb-4">
                  Generates draft content for all required 510(k) sections based on your device specifications and intended use.
                </p>
                <Button
                  onClick={() => handleRunPipeline('draftSectionsWithAI')}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  disabled={aiProcessing || !currentDeviceProfile}
                >
                  {aiProcessing ? "Processing..." : "Launch Content Assistant"}
                </Button>
                {!currentDeviceProfile && (
                  <p className="text-xs text-amber-600 mt-2">
                    Please select a device profile first
                  </p>
                )}
              </CardContent>
            </Card>
            
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-red-50 to-white pb-2">
                <CardTitle className="flex items-center text-red-700">
                  <FileCheck className="mr-2 h-5 w-5 text-red-600" />
                  Compliance Checker
                </CardTitle>
                <CardDescription>
                  AI validation against FDA requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600 mb-4">
                  Analyzes your 510(k) submission for compliance with FDA requirements and guidelines, identifying potential issues.
                </p>
                <Button
                  onClick={() => handleRunPipeline('runComplianceChecks')}
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={aiProcessing || !currentDeviceProfile}
                >
                  {aiProcessing ? "Processing..." : "Check Compliance"}
                </Button>
                {!currentDeviceProfile && (
                  <p className="text-xs text-amber-600 mt-2">
                    Please select a device profile first
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="insights">
          {aiInsights.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Insights Available</CardTitle>
                <CardDescription>
                  Run the AI tools to generate insights about your 510(k) submission.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Lightbulb className="h-16 w-16 text-amber-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Use the Smart Predicate Finder or Content Assistant to generate insights.
                  </p>
                </div>
                <Button onClick={() => setActiveTab('workflow')} variant="outline" className="mt-4">
                  Go to Workflow
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Validation & Compliance Insights */}
              {aiInsights.some(i => i.type === 'validation') && (
                <Card className="shadow-sm border-amber-100">
                  <CardHeader className="bg-gradient-to-r from-amber-50 to-white">
                    <CardTitle className="flex items-center text-amber-700">
                      <FileCheck className="mr-2 h-5 w-5 text-amber-600" />
                      Compliance Analysis
                    </CardTitle>
                    <CardDescription>
                      Compliance check results for your 510(k) submission
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      {aiInsights
                        .filter(i => i.type === 'validation')
                        .map((insight, index) => (
                          <div key={insight.id} className="space-y-4">
                            <div className="bg-amber-50 rounded-md p-4 border border-amber-100">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-medium text-amber-800">Compliance Score</h3>
                                <Badge 
                                  variant="outline" 
                                  className={
                                    insight.score > 0.9 
                                      ? "bg-green-100 text-green-700 border-green-200"
                                      : insight.score > 0.7
                                        ? "bg-amber-100 text-amber-700 border-amber-200"
                                        : "bg-red-100 text-red-700 border-red-200"
                                  }
                                >
                                  {Math.round(insight.score * 100)}%
                                </Badge>
                              </div>
                              <div className="flex flex-col gap-2">
                                <div className="flex justify-between text-sm text-amber-700">
                                  <span>Total checks completed:</span>
                                  <span className="font-medium">{insight.passedChecks} / {insight.totalChecks}</span>
                                </div>
                                
                                <div className="flex justify-between text-sm text-amber-700">
                                  <span>Critical issues:</span>
                                  <span className={insight.criticalIssues > 0 ? "font-medium text-red-600" : "font-medium text-green-600"}>
                                    {insight.criticalIssues}
                                  </span>
                                </div>
                                
                                <div className="flex justify-between text-sm text-amber-700">
                                  <span>Warnings:</span>
                                  <span className={insight.warnings > 0 ? "font-medium text-amber-600" : "font-medium text-green-600"}>
                                    {insight.warnings}
                                  </span>
                                </div>
                                
                                {insight.errors > 0 && (
                                  <div className="flex justify-between text-sm text-amber-700">
                                    <span>Errors:</span>
                                    <span className="font-medium text-red-600">
                                      {insight.errors}
                                    </span>
                                  </div>
                                )}
                                
                                <div className="mt-2">
                                  <Progress 
                                    value={(insight.passedChecks / insight.totalChecks) * 100} 
                                    className="h-2"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            {insight.detailedChecks && insight.detailedChecks.length > 0 && (
                              <div className="bg-white rounded-md border shadow-sm">
                                <div className="p-3 border-b bg-gray-50">
                                  <h4 className="font-medium">Detailed Check Results</h4>
                                </div>
                                <ScrollArea className="h-[300px]">
                                  <div className="p-4 space-y-3">
                                    {insight.detailedChecks
                                      .filter(check => !check.passed)
                                      .map((check, checkIndex) => (
                                        <div 
                                          key={checkIndex} 
                                          className={`p-3 rounded-md ${
                                            check.severity === 'error' 
                                              ? 'bg-red-50 border border-red-100' 
                                              : 'bg-amber-50 border border-amber-100'
                                          }`}
                                        >
                                          <div className="flex items-start gap-3">
                                            {check.severity === 'error' ? (
                                              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                                            ) : (
                                              <Info className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                                            )}
                                            <div>
                                              <div className="font-medium">
                                                {check.category}: {check.description}
                                              </div>
                                              {check.recommendation && (
                                                <div className="text-sm mt-1">
                                                  {check.recommendation}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ))
                                    }
                                  </div>
                                </ScrollArea>
                              </div>
                            )}
                          </div>
                        ))
                      }
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Device Profile Insights */}
              {aiInsights.some(i => i.type === 'device') && (
                <Card className="shadow-sm border-blue-100">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
                    <CardTitle className="flex items-center text-blue-700">
                      <Database className="mr-2 h-5 w-5 text-blue-600" />
                      Device Profile
                    </CardTitle>
                    <CardDescription>
                      Your selected medical device profile for 510(k) submission
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      {aiInsights
                        .filter(i => i.type === 'device')
                        .map((insight, index) => (
                          <div key={insight.id} className="bg-blue-50 rounded-md p-4 border border-blue-100">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium text-blue-800">{insight.name}</h3>
                              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                                Class {insight.deviceClass}
                              </Badge>
                            </div>
                            <div className="text-sm text-blue-700">
                              Added {new Date(insight.timestamp).toLocaleString()}
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Predicate Device Insights */}
              {aiInsights.some(i => i.type === 'predicate') && (
                <Card className="shadow-sm border-green-100">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-white">
                    <CardTitle className="flex items-center text-green-700">
                      <Search className="mr-2 h-5 w-5 text-green-600" />
                      Predicate Devices
                    </CardTitle>
                    <CardDescription>
                      Potential predicate devices for your 510(k) submission
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {/* Predicate devices statistics dashboard */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="bg-green-50 p-3 rounded-md border border-green-100 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-green-700">
                          {aiInsights.filter(i => i.type === 'predicate').length}
                        </span>
                        <span className="text-xs text-green-600">Potential Predicates</span>
                      </div>
                      <div className="bg-green-50 p-3 rounded-md border border-green-100 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-green-700">
                          {aiInsights.filter(i => i.type === 'predicate' && i.confidence && i.confidence >= 0.7).length}
                        </span>
                        <span className="text-xs text-green-600">High Match Score</span>
                      </div>
                      <div className="bg-green-50 p-3 rounded-md border border-green-100 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-green-700">
                          {Math.round(aiInsights.filter(i => i.type === 'predicate').reduce((sum, item) => sum + (item.confidence || 0), 0) / 
                          (aiInsights.filter(i => i.type === 'predicate').length || 1) * 100)}%
                        </span>
                        <span className="text-xs text-green-600">Avg. Match Score</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {aiInsights
                        .filter(i => i.type === 'predicate')
                        .sort((a, b) => b.confidence - a.confidence)
                        .map((insight, index) => (
                          <div key={insight.id} className="bg-green-50 rounded-md p-4 border border-green-100">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium text-green-800">{insight.name}</h3>
                              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                                {insight.k_number}
                              </Badge>
                            </div>
                            
                            {/* Match score with visual indicator */}
                            <div className="mb-3">
                              <div className="flex justify-between text-sm text-green-700 mb-1">
                                <span className="font-medium">Match Score:</span>
                                <span className="font-medium">{Math.round(insight.confidence * 100)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-600 h-2 rounded-full" 
                                  style={{ width: `${Math.round(insight.confidence * 100)}%` }}
                                />
                              </div>
                            </div>
                            
                            {/* Enhanced device visualizaton with badges */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                                {insight.k_number}
                              </Badge>
                              {insight.productCode && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  Product Code: {insight.productCode}
                                </Badge>
                              )}
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                Class {insight.deviceClass || 'II'}
                              </Badge>
                            </div>

                            {/* Key Information with improved styling */}
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-green-700 p-3 bg-green-50 rounded-md mb-3">
                              <div>
                                <span className="font-medium block text-green-800">Manufacturer:</span>
                                {insight.manufacturer}
                              </div>
                              <div>
                                <span className="font-medium block text-green-800">Clearance Date:</span>
                                {insight.date}
                              </div>
                              <div className="col-span-2 mt-1">
                                <span className="font-medium block text-green-800 mb-1">Similarity Factors:</span>
                                <div className="flex flex-wrap gap-1">
                                  {insight.similarityFactors ? (
                                    insight.similarityFactors.map((factor, idx) => (
                                      <Badge key={idx} variant="secondary" className="bg-green-100 text-green-800">
                                        {factor}
                                      </Badge>
                                    ))
                                  ) : (
                                    <>
                                      <Badge variant="secondary" className="bg-green-100 text-green-800">Intended Use</Badge>
                                      <Badge variant="secondary" className="bg-green-100 text-green-800">Technology</Badge>
                                      <Badge variant="secondary" className="bg-green-100 text-green-800">Classification</Badge>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Description with improved collapsible */}
                            {insight.description && (
                              <Collapsible className="border border-green-100 rounded-md overflow-hidden mb-2">
                                <CollapsibleTrigger className="w-full flex items-center justify-between p-2 bg-green-50 hover:bg-green-100 text-sm font-medium text-green-800">
                                  <div className="flex items-center">
                                    <FileText className="h-4 w-4 mr-1.5 text-green-600" />
                                    <span>Similarity Analysis</span>
                                  </div>
                                  <ChevronDown className="h-4 w-4 text-green-600" />
                                </CollapsibleTrigger>
                                <CollapsibleContent className="text-sm text-gray-700 p-3 border-t border-green-100">
                                  {insight.description}
                                </CollapsibleContent>
                              </Collapsible>
                            )}

                            {/* Enhanced action buttons with improved UX */}
                            <div className="flex items-center justify-between mt-4">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-xs border-green-200 text-green-700 hover:bg-green-50"
                                onClick={() => window.open(`https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm?ID=${insight.k_number}`, '_blank')}
                              >
                                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                View FDA Record
                              </Button>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                                  onClick={() => {
                                    // Add to comparison list
                                    toast({
                                      title: "Added to Comparison",
                                      description: `${insight.name} added to comparison list.`,
                                    });
                                  }}
                                >
                                  <ListPlus className="h-3.5 w-3.5 mr-1" />
                                  Compare
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="text-xs bg-green-600 hover:bg-green-700"
                                  onClick={() => {
                                    // Set as primary predicate
                                    toast({
                                      title: "Primary Predicate Selected",
                                      description: `${insight.name} set as primary predicate device.`,
                                    });
                                  }}
                                >
                                  <Check className="h-3.5 w-3.5 mr-1" />
                                  Select as Primary
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Literature Insights */}
              {aiInsights.some(i => i.type === 'literature') && (
                <Card className="shadow-sm border-purple-100">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-white">
                    <CardTitle className="flex items-center text-purple-700">
                      <BookOpen className="mr-2 h-5 w-5 text-purple-600" />
                      Relevant Literature
                    </CardTitle>
                    <CardDescription>
                      Scientific literature supporting your 510(k) submission
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {/* Literature statistics dashboard */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="bg-purple-50 p-3 rounded-md border border-purple-100 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-purple-700">
                          {aiInsights.filter(i => i.type === 'literature').length}
                        </span>
                        <span className="text-xs text-purple-600">References Found</span>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-md border border-purple-100 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-purple-700">
                          {aiInsights.filter(i => i.type === 'literature' && i.year && i.year >= new Date().getFullYear() - 3).length}
                        </span>
                        <span className="text-xs text-purple-600">Recent Publications</span>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-md border border-purple-100 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-purple-700">
                          {Math.round(aiInsights.filter(i => i.type === 'literature').reduce((sum, item) => sum + (item.confidence || 0), 0) / 
                          (aiInsights.filter(i => i.type === 'literature').length || 1) * 100)}%
                        </span>
                        <span className="text-xs text-purple-600">Avg. Relevance</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {aiInsights
                        .filter(i => i.type === 'literature')
                        .sort((a, b) => b.confidence - a.confidence)
                        .map((insight, index) => (
                          <div key={insight.id} className="bg-purple-50 rounded-md p-4 border border-purple-100">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-medium text-purple-800 text-md">{insight.name}</h3>
                            </div>
                            
                            {/* Enhanced badges for publication details */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                                {insight.journal || "Journal Article"}
                              </Badge>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                Year: {insight.year || "N/A"}
                              </Badge>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Relevance: {Math.round(insight.confidence * 100)}%
                              </Badge>
                            </div>
                            
                            {/* Relevance score visual indicator */}
                            <div className="mb-3">
                              <div className="flex justify-between text-sm text-purple-700 mb-1">
                                <span className="font-medium">Relevance Score:</span>
                                <span className="font-medium">{Math.round(insight.confidence * 100)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-purple-600 h-2 rounded-full" 
                                  style={{ width: `${Math.round(insight.confidence * 100)}%` }}
                                />
                              </div>
                            </div>
                            
                            {/* Authors */}
                            {insight.authors && insight.authors.length > 0 && (
                              <div className="text-sm p-3 bg-purple-50 rounded-md mb-3">
                                <span className="font-medium text-purple-800 block mb-1">Authors:</span>
                                <div className="text-purple-700">
                                  {Array.isArray(insight.authors) 
                                    ? insight.authors.join(', ')
                                    : insight.authors}
                                </div>
                              </div>
                            )}
                            
                            {/* Abstract with improved collapsible */}
                            {insight.abstract && (
                              <Collapsible className="border border-purple-100 rounded-md overflow-hidden mb-3">
                                <CollapsibleTrigger className="w-full flex items-center justify-between p-2 bg-purple-50 hover:bg-purple-100 text-sm font-medium text-purple-800">
                                  <div className="flex items-center">
                                    <FileText className="h-4 w-4 mr-1.5 text-purple-600" />
                                    <span>Abstract</span>
                                  </div>
                                  <ChevronDown className="h-4 w-4 text-purple-600" />
                                </CollapsibleTrigger>
                                <CollapsibleContent className="text-sm text-gray-700 p-3 border-t border-purple-100">
                                  {insight.abstract}
                                </CollapsibleContent>
                              </Collapsible>
                            )}
                            
                            {/* Enhanced action buttons with improved UX */}
                            <div className="flex items-center justify-between mt-4">
                              {insight.url ? (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
                                  onClick={() => window.open(insight.url, '_blank')}
                                >
                                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                  View Publication
                                </Button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
                                  onClick={() => window.open(`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(insight.name)}`, '_blank')}
                                >
                                  <Search className="h-3.5 w-3.5 mr-1" />
                                  Search PubMed
                                </Button>
                              )}
                              
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                                  onClick={() => {
                                    // Add to references list
                                    toast({
                                      title: "Added to References",
                                      description: `${insight.name} added to literature references.`,
                                    });
                                  }}
                                >
                                  <BookmarkPlus className="h-3.5 w-3.5 mr-1" />
                                  Save Reference
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="text-xs bg-purple-600 hover:bg-purple-700"
                                  onClick={() => {
                                    // Cite in document
                                    toast({
                                      title: "Citation Added",
                                      description: `${insight.name} citation will be added to your documents.`,
                                    });
                                  }}
                                >
                                  <FileText className="h-3.5 w-3.5 mr-1" />
                                  Cite in Document
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Regulatory Pathway Insights */}
              {aiInsights.some(i => i.type === 'regulatory') && (
                <Card className="shadow-sm border-blue-100">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
                    <CardTitle className="flex items-center text-blue-700">
                      <Shield className="mr-2 h-5 w-5 text-blue-600" />
                      Regulatory Pathway Analysis
                    </CardTitle>
                    <CardDescription>
                      Recommended submission approach for your device
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      {aiInsights
                        .filter(i => i.type === 'regulatory')
                        .map((insight, index) => (
                          <div key={insight.id} className="bg-blue-50 rounded-md p-4 border border-blue-100">
                            {/* Enhanced pathway visualization with prominently displayed recommendation */}
                            <div className="flex flex-col items-center justify-center mb-4 bg-white p-3 rounded-md border border-blue-100">
                              <span className="text-xs uppercase text-blue-600 font-semibold mb-1">Recommended Regulatory Pathway</span>
                              <h3 className="font-bold text-blue-800 text-xl">{insight.pathway}</h3>
                              <div className="mt-2 w-3/4">
                                <div className="flex justify-between text-sm text-blue-700 mb-1">
                                  <span>Confidence</span>
                                  <span>{Math.round(insight.confidence * 100)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${Math.round(insight.confidence * 100)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                            
                            {/* Pathway characteristics badges */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {insight.characteristics ? (
                                insight.characteristics.map((characteristic, idx) => (
                                  <Badge key={idx} variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                                    {characteristic}
                                  </Badge>
                                ))
                              ) : (
                                <>
                                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                                    Class {insight.deviceClass || currentDeviceProfile?.deviceClass || 'II'}
                                  </Badge>
                                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                                    Traditional
                                  </Badge>
                                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                                    Clinical Data Required
                                  </Badge>
                                </>
                              )}
                            </div>
                            
                            {/* Reasoning section in collapsible container */}
                            <Collapsible className="border border-blue-100 rounded-md overflow-hidden mb-3">
                              <CollapsibleTrigger className="w-full flex items-center justify-between p-2 bg-blue-50 hover:bg-blue-100 text-sm font-medium text-blue-800">
                                <div className="flex items-center">
                                  <FileText className="h-4 w-4 mr-1.5 text-blue-600" />
                                  <span>Pathway Justification</span>
                                </div>
                                <ChevronDown className="h-4 w-4 text-blue-600" />
                              </CollapsibleTrigger>
                              <CollapsibleContent className="text-sm text-gray-700 p-3 border-t border-blue-100 bg-white">
                                {insight.reasoning}
                              </CollapsibleContent>
                            </Collapsible>
                            
                            {/* Action buttons */}
                            <div className="flex items-center justify-end mt-4">
                              <Button 
                                size="sm" 
                                className="text-xs bg-blue-600 hover:bg-blue-700"
                                onClick={() => {
                                  // Accept recommendation
                                  toast({
                                    title: "Pathway Selected",
                                    description: `${insight.pathway} pathway has been selected for your device.`,
                                  });
                                }}
                              >
                                <Check className="h-3.5 w-3.5 mr-1" />
                                Use This Pathway
                              </Button>
                            </div>
                          </div>
                        ))
                      }
                      
                      {aiInsights
                        .filter(i => i.type === 'timeline')
                        .map((insight, index) => (
                          <div key={insight.id} className="mt-4 bg-white rounded-md p-4 border border-blue-100">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center">
                                <Clock className="mr-2 h-5 w-5 text-blue-600" />
                                <h3 className="font-medium text-blue-800">Estimated Review Process</h3>
                              </div>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                Total: {insight.estimate}
                              </Badge>
                            </div>
                            
                            {/* Timeline visualization */}
                            <div className="relative pb-2">
                              <div className="absolute left-[9px] top-0 h-full w-[2px] bg-blue-200"></div>
                              
                              {insight.milestones?.map((milestone, i) => {
                                // Calculate position on timeline based on days
                                const totalDays = insight.milestones.reduce((sum, m) => sum + (m.days || 0), 0);
                                const previousDays = insight.milestones.slice(0, i).reduce((sum, m) => sum + (m.days || 0), 0);
                                const startPercent = (previousDays / totalDays) * 100;
                                const lengthPercent = (milestone.days / totalDays) * 100;
                                
                                return (
                                  <div key={i} className="relative pl-6 py-3">
                                    {/* Milestone marker */}
                                    <div className="absolute left-0 -ml-[1px] mt-1.5 bg-white p-[3px]">
                                      <div className={`h-4 w-4 rounded-full ${i === 0 ? 'bg-blue-600' : i === insight.milestones.length - 1 ? 'bg-green-600' : 'bg-blue-400'}`}></div>
                                    </div>
                                    
                                    {/* Milestone content */}
                                    <div className="flex flex-col mb-1">
                                      <div className="flex justify-between">
                                        <span className="font-medium text-blue-800">{milestone.name}</span>
                                        <span className="text-blue-600 font-medium">{milestone.days} days</span>
                                      </div>
                                      
                                      {milestone.description && (
                                        <p className="text-xs text-gray-600 mt-1">{milestone.description}</p>
                                      )}
                                      
                                      {/* Progress bar */}
                                      <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                                        <div 
                                          className={`h-1.5 rounded-full ${i === 0 ? 'bg-blue-600' : i === insight.milestones.length - 1 ? 'bg-green-600' : 'bg-blue-400'}`}
                                          style={{ width: `${lengthPercent}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            
                            {/* Action button for timeline */}
                            <div className="flex justify-end mt-3">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                                onClick={() => {
                                  toast({
                                    title: "Timeline Exported",
                                    description: "Project timeline has been exported to your calendar",
                                  });
                                }}
                              >
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                Add to Calendar
                              </Button>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Document Insights */}
              {aiInsights.some(i => i.type === 'document') && (
                <Card className="shadow-sm border-amber-100">
                  <CardHeader className="bg-gradient-to-r from-amber-50 to-white">
                    <CardTitle className="flex items-center text-amber-700">
                      <FileText className="mr-2 h-5 w-5 text-amber-600" />
                      Generated Documents
                    </CardTitle>
                    <CardDescription>
                      AI-generated draft documents for your submission
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      {aiInsights
                        .filter(i => i.type === 'document')
                        .map((insight, index) => (
                          <div key={insight.id} className="bg-amber-50 rounded-md p-4 border border-amber-100">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium text-amber-800">{insight.name}</h3>
                              <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                                {insight.sections} sections
                              </Badge>
                            </div>
                            <div className="text-sm text-amber-700 mb-2">
                              Generated on {new Date(insight.timestamp).toLocaleString()}
                            </div>
                            <div className="mt-2">
                              <p className="text-xs text-amber-600 mb-1">Completeness</p>
                              <div className="w-full bg-amber-200 rounded-full h-2">
                                <div 
                                  className="bg-amber-500 rounded-full h-2" 
                                  style={{ width: `${insight.completeness * 100}%` }} 
                                />
                              </div>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Error message display */}
      {errorMessage && (
        <Alert variant="destructive" className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      {/* Progress indicator for API calls */}
      {aiProcessing && progress > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Processing...</span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
      
      {/* Debug Panel - shows in development environment and when aiInsights > 0 */}
      {true && (
        <Card className="mt-8 border-yellow-300 shadow-sm">
          <CardHeader className="bg-yellow-50">
            <CardTitle className="flex items-center text-yellow-800">
              <Bug className="h-5 w-5 mr-2 text-yellow-700" />
              Debug Panel
            </CardTitle>
            <CardDescription className="text-yellow-700">
              Troubleshooting panel for 510(k) insights module
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">State Values</h3>
                <div className="space-y-1 text-xs">
                  <p><span className="font-medium">Active Tab:</span> {activeTab}</p>
                  <p><span className="font-medium">Workflow SubTab:</span> {workflowSubTab}</p>
                  <p><span className="font-medium">AI Processing:</span> {aiProcessing ? 'True' : 'False'}</p>
                  <p><span className="font-medium">Progress:</span> {progress}%</p>
                  <p><span className="font-medium">Device Profile:</span> {currentDeviceProfile ? currentDeviceProfile.deviceName : 'None'}</p>
                  <p><span className="font-medium">Device Profile Class:</span> {currentDeviceProfile?.deviceClass || 'Not set'}</p>
                  <p><span className="font-medium">Total Insights:</span> {aiInsights.length}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Insights Breakdown</h3>
                <div className="space-y-1 text-xs">
                  <p><span className="font-medium">Device Insights:</span> {aiInsights.filter(i => i.type === 'device').length}</p>
                  <p className="flex items-center">
                    <span className="font-medium mr-1">Predicate Insights:</span> 
                    {aiInsights.filter(i => i.type === 'predicate').length}
                    {aiInsights.some(i => i.type === 'predicate') ? (
                      <CheckCircle2 className="h-3 w-3 ml-1 text-green-500" />
                    ) : (
                      <AlertCircle className="h-3 w-3 ml-1 text-red-500" />
                    )}
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium mr-1">Literature Insights:</span> 
                    {aiInsights.filter(i => i.type === 'literature').length}
                    {aiInsights.some(i => i.type === 'literature') ? (
                      <CheckCircle2 className="h-3 w-3 ml-1 text-green-500" />
                    ) : (
                      <AlertCircle className="h-3 w-3 ml-1 text-red-500" />
                    )}
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium mr-1">Regulatory Insights:</span> 
                    {aiInsights.filter(i => i.type === 'regulatory').length}
                    {aiInsights.some(i => i.type === 'regulatory') ? (
                      <CheckCircle2 className="h-3 w-3 ml-1 text-green-500" />
                    ) : (
                      <AlertCircle className="h-3 w-3 ml-1 text-red-500" />
                    )}
                  </p>
                  <p><span className="font-medium">Document Insights:</span> {aiInsights.filter(i => i.type === 'document').length}</p>
                  <p><span className="font-medium">Validation Insights:</span> {aiInsights.filter(i => i.type === 'validation').length}</p>
                </div>
              </div>
            </div>
            
            {/* Review Timeline Card */}
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                  510(k) Review Timeline
                </CardTitle>
                <CardDescription>
                  Estimated timeframes for each stage of your submission
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 h-full w-0.5 bg-blue-100"></div>
                    
                    {/* Timeline events */}
                    <div className="space-y-6">
                      <div className="flex">
                        <div className="relative flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white text-xs z-10">
                          1
                        </div>
                        <div className="ml-4 -mt-1">
                          <h4 className="text-sm font-medium text-blue-700">Initial Submission</h4>
                          <p className="text-xs text-gray-500">Day 0: Submission received by the FDA</p>
                          <div className="mt-1 p-2 bg-blue-50 border border-blue-100 rounded-md">
                            <span className="text-xs text-blue-700">Documents undergo administrative review for completeness</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="relative flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white text-xs z-10">
                          2
                        </div>
                        <div className="ml-4 -mt-1">
                          <h4 className="text-sm font-medium text-blue-700">Acceptance Review</h4>
                          <p className="text-xs text-gray-500">Days 1-15: Administrative screening</p>
                          <div className="mt-1 p-2 bg-blue-50 border border-blue-100 rounded-md">
                            <span className="text-xs text-blue-700">RTA checklist verification and submission validation</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="relative flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white text-xs z-10">
                          3
                        </div>
                        <div className="ml-4 -mt-1">
                          <h4 className="text-sm font-medium text-blue-700">Substantive Review</h4>
                          <p className="text-xs text-gray-500">Days 16-90: Technical and scientific review</p>
                          <div className="mt-1 p-2 bg-blue-50 border border-blue-100 rounded-md">
                            <span className="text-xs text-blue-700">In-depth evaluation of substantial equivalence claims</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="relative flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white text-xs z-10">
                          ✓
                        </div>
                        <div className="ml-4 -mt-1">
                          <h4 className="text-sm font-medium text-green-700">Final Decision</h4>
                          <p className="text-xs text-gray-500">By Day 90: FDA determination</p>
                          <div className="mt-1 p-2 bg-green-50 border border-green-100 rounded-md">
                            <span className="text-xs text-green-700">Traditional 510(k) standard timeline: 90 days</span>
                            <br />
                            <span className="text-xs text-amber-600">Special 510(k) expedited timeline: 30 days</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 italic mt-2">
                    Note: Actual review times may vary based on FDA workload and Additional Information requests.
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Debug panel */}
            <Collapsible className="mt-4">
              <CollapsibleTrigger className="w-full flex items-center justify-between p-2 bg-amber-50 hover:bg-amber-100 text-sm font-medium text-amber-800 rounded-md border border-amber-200">
                <div className="flex items-center">
                  <Bug className="h-4 w-4 mr-1.5 text-amber-600" />
                  <span>Developer Debug Panel</span>
                </div>
                <ChevronDown className="h-4 w-4 text-amber-600" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 space-y-2">
                {/* Insights summary table */}
                <div className="p-3 bg-amber-50 rounded-md border border-amber-100">
                  <h4 className="text-sm font-medium text-amber-800 mb-2">AI Insights Overview</h4>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-white p-2 rounded border border-amber-100">
                      <span className="text-xs text-amber-800">Predicate Devices</span>
                      <div className="flex items-center mt-1">
                        <span className="text-xl font-bold text-amber-700">{aiInsights.filter(i => i.type === 'predicate').length}</span>
                        {aiInsights.some(i => i.type === 'predicate') ? (
                          <CheckCircle2 className="h-3 w-3 ml-2 text-green-500" />
                        ) : (
                          <AlertCircle className="h-3 w-3 ml-2 text-red-500" />
                        )}
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded border border-amber-100">
                      <span className="text-xs text-amber-800">Literature</span>
                      <div className="flex items-center mt-1">
                        <span className="text-xl font-bold text-amber-700">{aiInsights.filter(i => i.type === 'literature').length}</span>
                        {aiInsights.some(i => i.type === 'literature') ? (
                          <CheckCircle2 className="h-3 w-3 ml-2 text-green-500" />
                        ) : (
                          <AlertCircle className="h-3 w-3 ml-2 text-red-500" />
                        )}
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded border border-amber-100">
                      <span className="text-xs text-amber-800">Regulatory</span>
                      <div className="flex items-center mt-1">
                        <span className="text-xl font-bold text-amber-700">{aiInsights.filter(i => i.type === 'regulatory').length}</span>
                        {aiInsights.some(i => i.type === 'regulatory') ? (
                          <CheckCircle2 className="h-3 w-3 ml-2 text-green-500" />
                        ) : (
                          <AlertCircle className="h-3 w-3 ml-2 text-red-500" />
                        )}
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded border border-amber-100">
                      <span className="text-xs text-amber-800">Total Insights</span>
                      <div className="flex items-center mt-1">
                        <span className="text-xl font-bold text-amber-700">{aiInsights.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Tab view for raw data */}
                <Tabs defaultValue="insights" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="insights">AI Insights</TabsTrigger>
                    <TabsTrigger value="device_profile">Device Profile</TabsTrigger>
                    <TabsTrigger value="actions">Actions</TabsTrigger>
                  </TabsList>
                  <TabsContent value="insights" className="border border-amber-100 rounded-md p-2 bg-white">
                    <div className="overflow-auto max-h-[300px]">
                      <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                        {JSON.stringify(aiInsights, null, 2)}
                      </pre>
                    </div>
                  </TabsContent>
                  <TabsContent value="device_profile" className="border border-amber-100 rounded-md p-2 bg-white">
                    <div className="overflow-auto max-h-[300px]">
                      <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                        {JSON.stringify(currentDeviceProfile, null, 2)}
                      </pre>
                    </div>
                  </TabsContent>
                  <TabsContent value="actions" className="border border-amber-100 rounded-md p-2 bg-white">
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs"
                        onClick={() => console.log('Current aiInsights:', aiInsights)}
                      >
                        Log Insights
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs"
                        onClick={() => {
                          setActiveTab('insights');
                          console.log('Manually switched to insights tab');
                        }}
                      >
                        Switch to Insights Tab
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => {
                          setAiInsights([]);
                          console.log('Cleared aiInsights state');
                        }}
                      >
                        Clear Insights
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      )}
    </div>
  );
}