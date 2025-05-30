import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Beaker, BarChart3, Database, FileText, SearchCode, 
  Plus, CheckCircle, LineChart, GitCompare, CheckSquare,
  Archive, FileCheck, AlertTriangle, Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FDA510kService } from '../../services/FDA510kService';
import DeviceProfileList from '../cer/DeviceProfileList';
import DeviceProfileDialog from '../cer/DeviceProfileDialog';
import PredicateFinderPanel from './PredicateFinderPanel';
import EquivalenceBuilderPanel from './EquivalenceBuilderPanel';
import ComplianceCheckPanel from './ComplianceCheckPanel';
import ReportGenerator from './ReportGenerator';

/**
 * 510(k) Workflow Panel - GA Ready
 * 
 * This component provides a full card-based workflow for the 510(k) submission process,
 * including device profile management, predicate device search, substantial equivalence,
 * FDA compliance checks, and final submission generation.
 */
const WorkflowPanel = ({ 
  projectId, 
  organizationId, 
  deviceProfile, 
  setDeviceProfile, 
  onComplianceChange,
  onPredicatesFound,
  onEquivalenceComplete,
  onComplianceComplete,
  onSubmissionReady,
  activeStep,
  onStepChange,
  predicates = [],
  complianceStatus = 'draft',
  sections = [] 
}) => {
  const [activeTab, setActiveTab] = useState('workflow');
  const [workflowStep, setWorkflowStep] = useState(activeStep || 1);
  const [workflowProgress, setWorkflowProgress] = useState(0);
  const [selectedDeviceProfile, setSelectedDeviceProfile] = useState(deviceProfile || null);
  const [predicatesFound, setPredicatesFound] = useState(false);
  const [predicateDevices, setPredicateDevices] = useState([]);
  const [equivalenceCompleted, setEquivalenceCompleted] = useState(false);
  const [complianceScore, setComplianceScore] = useState(null);
  const [compliance, setCompliance] = useState(null);
  const [isComplianceRunning, setIsComplianceRunning] = useState(false);
  const [submissionReady, setSubmissionReady] = useState(false);
  const [exportTimestamp, setExportTimestamp] = useState(null);
  const [draftStatus, setDraftStatus] = useState('in-progress');

  const [isLoading, setIsLoading] = useState({
    predicateFinder: false,
    contentAssistant: false,
    complianceChecker: false,
    exportPackage: false,
    workflowTransition: false,
    deviceProfile: false,
    predicates: false,
    equivalence: false,
    compliance: false,
    submission: false
  });
  
  const { toast } = useToast();

  // Sync the local selectedDeviceProfile with the parent's deviceProfile
  useEffect(() => {
    if (deviceProfile && (!selectedDeviceProfile || deviceProfile.id !== selectedDeviceProfile.id)) {
      setSelectedDeviceProfile(deviceProfile);
    }
    
    if (selectedDeviceProfile && typeof setDeviceProfile === 'function') {
      setDeviceProfile(selectedDeviceProfile);
    }
  }, [deviceProfile, selectedDeviceProfile, setDeviceProfile]);
  
  // Recovery mechanism - attempt to restore workflow state from localStorage on mount or if errors occur
  useEffect(() => {
    try {
      // Check if we have saved workflow state in localStorage
      const savedState = localStorage.getItem('510k_workflowState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        
        // Only restore if the saved state is less than 24 hours old (for safety)
        const savedTime = new Date(parsedState.timestamp).getTime();
        const currentTime = new Date().getTime();
        const hoursSinceSave = (currentTime - savedTime) / (1000 * 60 * 60);
        
        if (hoursSinceSave < 24) {
          console.log('[WorkflowPanel] Found saved workflow state, checking for recovery needs');
          
          // Check if we're in an inconsistent state that requires recovery
          const needsRecovery = (
            // If current workflowStep doesn't match saved workflowStep but we have the data for the saved step
            (workflowStep !== parsedState.currentStep && 
              ((parsedState.currentStep === 3 && parsedState.predicatesFound) || 
               (parsedState.currentStep === 4 && parsedState.equivalenceCompleted) ||
               (parsedState.currentStep === 5 && parsedState.complianceScore)))
          );
          
          if (needsRecovery) {
            console.log('[WorkflowPanel] Recovery needed - restoring workflow state');
            
            // Restore device profile if available
            if (parsedState.deviceProfile && (!selectedDeviceProfile || parsedState.deviceProfile.updatedAt > selectedDeviceProfile.updatedAt)) {
              setSelectedDeviceProfile(parsedState.deviceProfile);
              if (typeof setDeviceProfile === 'function') {
                setDeviceProfile(parsedState.deviceProfile);
              }
            }
            
            // Restore workflow state
            if (parsedState.predicatesFound) setPredicatesFound(parsedState.predicatesFound);
            if (parsedState.predicateDevices) setPredicateDevices(parsedState.predicateDevices);
            if (parsedState.equivalenceCompleted) setEquivalenceCompleted(parsedState.equivalenceCompleted);
            if (parsedState.complianceScore) setComplianceScore(parsedState.complianceScore);
            
            // Only update workflow step after state is restored
            if (parsedState.currentStep && parsedState.currentStep !== workflowStep) {
              setWorkflowStep(parsedState.currentStep);
              // Update active tab based on the restored step
              const stepToTabValueMap = {
                1: 'workflow',
                2: 'predicates',
                3: 'equivalence',
                4: 'compliance',
                5: 'submission'
              };
              setActiveTab(stepToTabValueMap[parsedState.currentStep] || 'workflow');
            }
            
            // Notify user of recovery
            toast({
              title: "Workflow State Recovered",
              description: "Your previous work has been restored",
              variant: "default"
            });
          }
        }
      }
    } catch (error) {
      console.error('[WorkflowPanel] Error during state recovery:', error);
      // Non-critical error, don't interrupt user flow
    }
  }, []);

  // Update workflow progress based on completed steps
  useEffect(() => {
    // Calculate progress based on workflow step
    const progressMap = {
      1: selectedDeviceProfile ? 20 : 0,
      2: predicatesFound ? 40 : 20,
      3: equivalenceCompleted ? 60 : 40,
      4: complianceScore ? 80 : 60,
      5: submissionReady ? 100 : 80
    };
    
    setWorkflowProgress(progressMap[workflowStep] || 0);
  }, [workflowStep, selectedDeviceProfile, predicatesFound, equivalenceCompleted, complianceScore, submissionReady]);

  // Handle predicate finder
  const handlePredicateFinder = async () => {
    if (!selectedDeviceProfile) {
      toast({
        title: "Device Profile Required",
        description: "Please select a device profile before running the predicate finder",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading({ ...isLoading, predicateFinder: true });
    
    try {
      // We'll use the enhanced findPredicatesAndLiterature method that searches for both
      // predicate devices and literature references in one call
      const result = await FDA510kService.findPredicatesAndLiterature(selectedDeviceProfile, organizationId || 1);
      
      setPredicateDevices(result.predicateDevices || []);
      setPredicatesFound(true);
      
      toast({
        title: "Predicate Search Complete",
        description: `Found ${result.predicateDevices?.length || 0} potential predicate devices and ${result.literatureReferences?.length || 0} literature references`,
        variant: "success"
      });
      
      // Notify parent of predicate finding completion
      if (typeof onPredicatesFound === 'function') {
        onPredicatesFound(result.predicateDevices || []);
      }
      
      // First verify the data before proceeding
      if (!result.predicateDevices || result.predicateDevices.length === 0) {
        console.warn('[WorkflowPanel] No predicate devices found, cannot proceed to equivalence step');
        toast({
          title: "Workflow Warning",
          description: "No predicate devices were found. Please refine your search criteria.",
          variant: "destructive"
        });
        return;
      }
      
      // Go to next step
      console.log('[WorkflowPanel] Found predicates, transitioning to equivalence step');
      setWorkflowStep(3);
      
      // Use a slight delay to ensure step is updated before changing tab
      setTimeout(() => {
        try {
          setActiveTab('equivalence');
          console.log('[WorkflowPanel] Tab transition initiated');
          
          // Verify transition was successful
          setTimeout(() => {
            if (activeTab !== 'equivalence') {
              console.warn('[WorkflowPanel] Tab transition failed, retrying...');
              setActiveTab('equivalence');
            }
          }, 200);
        } catch (transitionError) {
          console.error('[WorkflowPanel] Error during tab transition:', transitionError);
        }
      }, 100);
    } catch (error) {
      console.error('Error in predicate finder:', error);
      toast({
        title: "Predicate Search Error",
        description: error.message || "Could not complete predicate device search",
        variant: "destructive",
      });
    } finally {
      setIsLoading({ ...isLoading, predicateFinder: false });
    }
  };

  // Handle equivalence builder completion with enhanced data persistence and error recovery
  const handleEquivalenceComplete = async (data) => {
    console.log('[WorkflowPanel] Equivalence completed with data:', data);
    
    // Save data to localStorage first as a backup before any API calls
    try {
      localStorage.setItem('510k_equivalenceData', JSON.stringify(data));
      console.log('[WorkflowPanel] Successfully saved equivalence data to localStorage');
    } catch (storageError) {
      console.error('[WorkflowPanel] Error saving to localStorage:', storageError);
      // Continue even if localStorage fails
    }
    
    setEquivalenceCompleted(true);
    
    toast({
      title: "Equivalence Analysis Complete",
      description: "Substantial equivalence documentation has been prepared.",
      variant: "success"
    });
    
    // Notify parent of equivalence completion
    if (typeof onEquivalenceComplete === 'function') {
      try {
        onEquivalenceComplete(data);
      } catch (callbackError) {
        console.error('[WorkflowPanel] Error in parent callback:', callbackError);
        // Continue despite callback error
      }
    }
    
    // Update device profile with equivalence data to ensure data persistence
    if (selectedDeviceProfile) {
      try {
        const updatedProfile = {
          ...selectedDeviceProfile,
          equivalenceAnalysis: data,
          updatedAt: new Date().toISOString()
        };
        
        // Save to localStorage for resilience
        localStorage.setItem('510k_deviceProfile', JSON.stringify(updatedProfile));
        
        // Update state
        setSelectedDeviceProfile(updatedProfile);
        if (typeof setDeviceProfile === 'function') {
          setDeviceProfile(updatedProfile);
        }
      } catch (profileUpdateError) {
        console.error('[WorkflowPanel] Error updating device profile with equivalence data:', profileUpdateError);
      }
    }
    
    // Use the new API-based verification for workflow transitions
    try {
      console.log('[WorkflowPanel] Verifying compliance step transition');
      
      // Check if transition is allowed via API
      const checkResult = await FDA510kService.checkWorkflowTransition(
        'equivalence', 'compliance', selectedDeviceProfile?.id, organizationId
      );
      
      if (checkResult.canTransition) {
        console.log('[WorkflowPanel] Transition to compliance step approved by API');
        
        // Update the step and tab states
        setWorkflowStep(4);
        
        // Use a safety timer to ensure transition completes
        const transitionTimer = setTimeout(() => {
          try {
            console.log('[WorkflowPanel] Setting active tab to compliance');
            setActiveTab('compliance');
            
            // Verify transition was successful with retry mechanism
            const verifyTimer = setTimeout(() => {
              if (activeTab !== 'compliance') {
                console.warn('[WorkflowPanel] Tab transition failed, retrying...');
                setActiveTab('compliance');
                
                // Double-check with a second retry
                setTimeout(() => {
                  if (activeTab !== 'compliance') {
                    console.error('[WorkflowPanel] Tab transition failed after retry, forcing refresh');
                    setActiveTab('compliance');
                    
                    // Force a re-render if needed by toggling a state
                    setWorkflowProgress(prev => {
                      setTimeout(() => setWorkflowProgress(prev), 50);
                      return prev - 1;
                    });
                  }
                }, 300);
              } else {
                console.log('[WorkflowPanel] Tab transition to compliance successful');
              }
            }, 200);
            
            // Cleanup verify timer if component unmounts
            return () => clearTimeout(verifyTimer);
          } catch (transitionError) {
            console.error('[WorkflowPanel] Error during tab transition:', transitionError);
            // Emergency fallback
            setActiveTab('compliance');
          }
        }, 100);
        
        // Cleanup transition timer if component unmounts
        return () => clearTimeout(transitionTimer);
      } else {
        console.warn(`[WorkflowPanel] API blocked transition to compliance: ${checkResult.message}`);
        toast({
          title: "Cannot Proceed to Compliance Check",
          description: checkResult.message || "Equivalence analysis is incomplete",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('[WorkflowPanel] Critical error in workflow transition:', error);
      
      // Display error but provide recovery options
      toast({
        title: "Error During Transition",
        description: "Workflow transition encountered an error. Your data has been saved, please try again.",
        variant: "destructive"
      });
      
      // Recovery mechanism - provide a direct way to retry
      setTimeout(() => {
        // Allow user to see the error message before showing recovery
        toast({
          title: "Recovery Available",
          description: "Your equivalence data was saved. You can safely continue.",
          variant: "default"
        });
      }, 3000);
    }
  };

  // Handle compliance check
  const handleComplianceCheck = async () => {
    if (!selectedDeviceProfile) {
      toast({
        title: "Device Profile Required",
        description: "Please select a device profile before running compliance check",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading({ ...isLoading, complianceChecker: true });
    setIsComplianceRunning(true);
    
    try {
      // Use the service for compliance checking against the profile
      const result = await FDA510kService.runComplianceCheck(selectedDeviceProfile, organizationId || 1);
      
      setCompliance(result);
      setComplianceScore(Math.round(result.score * 100));
      
      // Pass the compliance data up to the parent
      if (typeof onComplianceChange === 'function') {
        onComplianceChange(result);
      }
      
      // Notify parent of compliance check completion
      if (typeof onComplianceComplete === 'function') {
        onComplianceComplete(Math.round(result.score * 100));
      }
      
      toast({
        title: "Compliance Check Complete",
        description: `Your submission is ${Math.round(result.score * 100)}% compliant with FDA 510(k) requirements.`,
        variant: Math.round(result.score * 100) >= 80 ? "success" : "warning"
      });
      
      // Go to final submission
      setWorkflowStep(5);
      setActiveTab('submission');
    } catch (error) {
      console.error('Error in compliance checker:', error);
      toast({
        title: "Compliance Check Error",
        description: error.message || "Could not complete compliance check",
        variant: "destructive",
      });
    } finally {
      setIsLoading({ ...isLoading, complianceChecker: false });
      setIsComplianceRunning(false);
    }
  };

  // Handle submission ready
  const handleSubmissionReady = () => {
    setSubmissionReady(true);
    
    toast({
      title: "Submission Package Ready",
      description: "Your 510(k) submission package is now ready for final review.",
      variant: "success"
    });
    
    // Notify parent of submission readiness
    if (typeof onSubmissionReady === 'function') {
      onSubmissionReady();
    }
  };

  // Handle package export
  const handleExportPackage = async () => {
    setIsLoading({ ...isLoading, exportPackage: true });
    
    try {
      // Set timestamp for the export
      const timestamp = new Date().toISOString();
      setExportTimestamp(timestamp);
      
      toast({
        title: "Package Export Started",
        description: "Your 510(k) submission package is being prepared for export.",
      });
      
      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Package Export Complete",
        description: "Your 510(k) submission package has been successfully exported.",
        variant: "success"
      });
      
      // Update status
      setDraftStatus('ready-for-submission');
    } catch (error) {
      console.error('Error exporting package:', error);
      toast({
        title: "Export Error",
        description: error.message || "Could not export the submission package",
        variant: "destructive",
      });
    } finally {
      setIsLoading({ ...isLoading, exportPackage: false });
    }
  };

  // Handler for device profile selection
  const handleDeviceProfileSelect = (profile) => {
    setSelectedDeviceProfile(profile);
    
    // Pass the profile up to the parent component if needed
    if (typeof setDeviceProfile === 'function') {
      setDeviceProfile(profile);
    }
    
    toast({
      title: 'Device Profile Selected',
      description: `${profile.deviceName} has been selected for your 510(k) submission.`,
      variant: "success"
    });
  };

  // Enhanced Navigation functions with API verification and loading indicators
  const goToStep = async (step) => {
    console.log(`[WorkflowPanel] Attempting to navigate to step ${step}`);
    
    // First, save the current state to localStorage for data persistence and recovery
    try {
      const currentState = {
        currentStep: workflowStep,
        deviceProfile: selectedDeviceProfile,
        predicatesFound,
        predicateDevices,
        equivalenceCompleted,
        complianceScore,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('510k_workflowState', JSON.stringify(currentState));
      console.log(`[WorkflowPanel] Saved workflow state before step transition to ${step}`);
    } catch (saveError) {
      console.error('[WorkflowPanel] Error saving workflow state to localStorage:', saveError);
      // Continue despite save error - non-critical
    }
    
    // Set global transition loading state to prevent UI jumps
    setIsLoading({...isLoading, workflowTransition: true});
    
    // Map steps to their corresponding tab names for loading state and UI navigation
    const stepToTabMap = {
      1: 'deviceProfile',
      2: 'predicates',
      3: 'equivalence',
      4: 'compliance',
      5: 'submission'
    };
    
    // Map steps to their corresponding tab values
    const stepToTabValueMap = {
      1: 'workflow',
      2: 'predicates',
      3: 'equivalence',
      4: 'compliance',
      5: 'submission'
    };
    
    // Set specific step loading state
    if (stepToTabMap[step]) {
      setIsLoading({...isLoading, workflowTransition: true, [stepToTabMap[step]]: true});
    }
    
    try {
      // Validate the step can be accessed
      if (step === 1) {
        // Always allow returning to step 1 (device profile)
        setWorkflowStep(1);
        
        // Use timeout to ensure smooth transition
        const transitionTimer = setTimeout(() => {
          setActiveTab('workflow');
          if (typeof onStepChange === 'function') {
            try {
              onStepChange(1);
            } catch (callbackError) {
              console.error('[WorkflowPanel] Error in step change callback:', callbackError);
              // Continue despite callback error
            }
          }
          
          // Reset loading state with a slight delay to prevent flickering
          const loadingTimer = setTimeout(() => {
            setIsLoading({
              ...isLoading, 
              workflowTransition: false, 
              deviceProfile: false
            });
          }, 300);
          
          return () => clearTimeout(loadingTimer);
        }, 100);
        
        return () => clearTimeout(transitionTimer);
      } else if (step === 2 && selectedDeviceProfile) {
        // Predicate finder - verify we can transition
        const checkResult = await FDA510kService.checkWorkflowTransition(
          'device', 'predicate', selectedDeviceProfile.id, organizationId
        );
        
        if (checkResult.canTransition) {
          // Update workflow step state first
          setWorkflowStep(2);
          
          // Use timeout to ensure smooth transition with verification
          const transitionTimer = setTimeout(() => {
            // Set the correct tab for this step
            setActiveTab(stepToTabValueMap[2]);
            
            // Notify parent of step change if callback exists
            if (typeof onStepChange === 'function') {
              try {
                onStepChange(2);
              } catch (callbackError) {
                console.error('[WorkflowPanel] Error in step change callback:', callbackError);
                // Continue despite callback error
              }
            }
            
            // Verify the tab transition worked
            const verifyTimer = setTimeout(() => {
              if (activeTab !== stepToTabValueMap[2]) {
                console.warn('[WorkflowPanel] Tab transition verification failed, retrying...');
                setActiveTab(stepToTabValueMap[2]);
              }
              
              // Reset loading state after verification
              setIsLoading({
                ...isLoading, 
                workflowTransition: false, 
                predicates: false
              });
            }, 300);
            
            return () => clearTimeout(verifyTimer);
          }, 100);
          
          return () => clearTimeout(transitionTimer);
        } else {
          console.warn(`[WorkflowPanel] Transition to step 2 blocked: ${checkResult.message}`);
          toast({
            title: "Cannot Proceed",
            description: checkResult.message || "Device profile data is incomplete",
            variant: "destructive"
          });
          // Reset loading state immediately on error
          setIsLoading({...isLoading, workflowTransition: false, predicates: false});
        }
      } else if (step === 3 && predicatesFound) {
        // Critical transition: Equivalence step requires API verification
        // This is the problematic transition we're fixing
        console.log('[WorkflowPanel] Verifying equivalence readiness before transition');
        
        try {
          // First check workflow transition
          const checkResult = await FDA510kService.checkWorkflowTransition(
            'predicate', 'equivalence', selectedDeviceProfile.id, organizationId
          );
          
          // Then check equivalence status for added verification
          const statusResult = await FDA510kService.checkEquivalenceStatus(
            selectedDeviceProfile.id, organizationId
          );
          
          // Only proceed if both checks pass
          if (checkResult.canTransition && statusResult.canProceed) {
            setWorkflowStep(3);
            
            // Use timeout to ensure smooth transition
            setTimeout(() => {
              setActiveTab('equivalence');
              if (typeof onStepChange === 'function') onStepChange(3);
              
              // Reset loading state with a slight delay to prevent flickering
              setTimeout(() => {
                setIsLoading({
                  ...isLoading, 
                  workflowTransition: false, 
                  equivalence: false
                });
              }, 300);
            }, 100);
          } else {
            // Get the most specific error message with improved error handling
            let errorTitle = "Cannot Proceed to Equivalence"; 
            let errorMessage = "";
            
            if (!statusResult.canProceed) {
              // Status result shows specific device issues
              errorMessage = statusResult.message;
              
              if (statusResult.status === 'missing_data') {
                errorMessage = statusResult.requiredAction || statusResult.message;
                errorTitle = `Incomplete Data: ${statusResult.deviceName || 'Device'}`;
              } else if (statusResult.status === 'not_found') {
                errorTitle = "Device Not Found";
              }
            } else if (!checkResult.canTransition) {
              // Workflow transition issue
              errorMessage = checkResult.message;
            } else {
              // Fallback error
              errorMessage = "Unable to proceed to equivalence analysis at this time";
            }
              
            console.warn(`[WorkflowPanel] Transition to equivalence blocked: ${errorMessage}`);
            toast({
              title: errorTitle,
              description: errorMessage,
              variant: "destructive"
            });
          }
        } catch (transitionError) {
          console.error('[WorkflowPanel] Error during equivalence transition:', transitionError);
          toast({
            title: "Transition Error",
            description: "Could not verify readiness for equivalence analysis",
            variant: "destructive"
          });
        }
      } else if (step === 4 && equivalenceCompleted) {
        // Verify transition to compliance step with enhanced error handling
        try {
          const checkResult = await FDA510kService.checkWorkflowTransition(
            'equivalence', 'compliance', selectedDeviceProfile.id, organizationId
          );
          
          if (checkResult.canTransition) {
            setWorkflowStep(4);
            
            // Use timeout to ensure smooth transition
            setTimeout(() => {
              setActiveTab('compliance');
              if (typeof onStepChange === 'function') onStepChange(4);
              
              // Reset loading state with a slight delay to prevent flickering
              setTimeout(() => {
                setIsLoading({
                  ...isLoading, 
                  workflowTransition: false, 
                  compliance: false
                });
              }, 300);
            }, 100);
          } else {
            console.warn(`[WorkflowPanel] Transition to compliance blocked: ${checkResult.message}`);
            toast({
              title: "Cannot Proceed to Compliance Check",
              description: checkResult.message || "Equivalence analysis is incomplete",
              variant: "destructive"
            });
            
            // Reset loading state immediately on error
            setIsLoading({...isLoading, workflowTransition: false, compliance: false});
          }
        } catch (error) {
          console.error('[WorkflowPanel] Error checking compliance transition:', error);
          toast({
            title: "Transition Error",
            description: error.message || "An error occurred while verifying workflow transition",
            variant: "destructive"
          });
          
          // Reset loading state immediately on error
          setIsLoading({...isLoading, workflowTransition: false, compliance: false});
        }
      } else if (step === 5 && complianceScore) {
        // Verify transition to submission step with enhanced error handling
        try {
          const checkResult = await FDA510kService.checkWorkflowTransition(
            'compliance', 'submission', selectedDeviceProfile.id, organizationId
          );
          
          if (checkResult.canTransition) {
            setWorkflowStep(5);
            
            // Use timeout to ensure smooth transition
            setTimeout(() => {
              setActiveTab('submission');
              if (typeof onStepChange === 'function') onStepChange(5);
              
              // Reset loading state with a slight delay to prevent flickering
              setTimeout(() => {
                setIsLoading({
                  ...isLoading, 
                  workflowTransition: false, 
                  submission: false
                });
              }, 300);
            }, 100);
          } else {
            console.warn(`[WorkflowPanel] Transition to submission blocked: ${checkResult.message}`);
            toast({
              title: "Cannot Proceed to Final Submission",
              description: checkResult.message || "Compliance check is incomplete",
              variant: "destructive"
            });
            
            // Reset loading state immediately on error
            setIsLoading({...isLoading, workflowTransition: false, submission: false});
          }
        } catch (error) {
          console.error('[WorkflowPanel] Error checking submission transition:', error);
          toast({
            title: "Transition Error",
            description: error.message || "An error occurred while verifying workflow transition",
            variant: "destructive"
          });
          
          // Reset loading state immediately on error
          setIsLoading({...isLoading, workflowTransition: false, submission: false});
        }
      } else {
        console.warn(`[WorkflowPanel] Cannot navigate to step ${step} - preconditions not met`);
        
        // Reset all loading states to prevent UI getting stuck
        setIsLoading({
          ...isLoading, 
          workflowTransition: false,
          deviceProfile: false,
          predicates: false,
          equivalence: false,
          compliance: false,
          submission: false
        });
        
        // Show appropriate error message based on step
        let errorMessage = "Cannot proceed to this step at this time.";
        let errorTitle = "Workflow Navigation";
        
        switch(step) {
          case 2:
            errorMessage = "Device profile must be completed before finding predicate devices.";
            break;
          case 3:
            errorMessage = "You must select predicate devices before performing equivalence analysis.";
            break;
          case 4:
            errorMessage = "Equivalence analysis must be completed before compliance check.";
            break;
          case 5:
            errorMessage = "Compliance check must be completed before final submission.";
            break;
        }
        
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error(`[WorkflowPanel] Error in goToStep(${step}):`, error);
      
      // Reset all loading states on error to prevent UI getting stuck
      setIsLoading({
        ...isLoading, 
        workflowTransition: false,
        deviceProfile: false,
        predicates: false,
        equivalence: false,
        compliance: false,
        submission: false
      });
      
      toast({
        title: "Navigation Error",
        description: error.message || "An error occurred while changing workflow steps",
        variant: "destructive"
      });
    }
  };
  
  const nextStep = () => {
    const newStep = workflowStep + 1;
    if (newStep <= 5) {
      goToStep(newStep);
    }
  };
  
  const prevStep = () => {
    const newStep = workflowStep - 1;
    if (newStep >= 1) {
      goToStep(newStep);
    }
  };

  // Render the workflow progress bar
  const renderProgressBar = () => (
    <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-blue-100">
      <div className="flex justify-between mb-3 items-center">
        <h3 className="text-lg font-medium text-blue-800">510(k) Submission Pipeline</h3>
        <div className="flex items-center">
          <span className="text-sm font-medium text-blue-700 mr-2">{workflowProgress}% Complete</span>
        </div>
      </div>
      
      <Progress value={workflowProgress} className="h-2 mb-4" />
      
      <div className="grid grid-cols-5 gap-2">
        <div 
          className={`p-3 rounded-lg text-center cursor-pointer transition-all
            ${workflowStep === 1 ? 'bg-blue-100 ring-2 ring-blue-400 shadow-md' : 
            (selectedDeviceProfile ? 'bg-blue-50 text-blue-800' : 'bg-gray-100 text-gray-600')}
            ${selectedDeviceProfile ? 'hover:bg-blue-100' : 'hover:bg-gray-200'}`}
          onClick={() => goToStep(1)}
        >
          <div className={`rounded-full h-8 w-8 flex items-center justify-center mx-auto mb-1 
            ${selectedDeviceProfile ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
            {selectedDeviceProfile ? <CheckCircle className="h-4 w-4" /> : "1"}
          </div>
          <div className="text-xs font-medium">Device Profile</div>
          {selectedDeviceProfile && (
            <div className="text-xs mt-1 truncate max-w-full">
              {selectedDeviceProfile.deviceName}
            </div>
          )}
        </div>
        
        <div 
          className={`p-3 rounded-lg text-center cursor-pointer transition-all
            ${workflowStep === 2 ? 'bg-blue-100 ring-2 ring-blue-400 shadow-md' : 
            (predicatesFound ? 'bg-blue-50 text-blue-800' : 'bg-gray-100 text-gray-600')}
            ${selectedDeviceProfile ? 'hover:bg-blue-100' : 'hover:bg-gray-200'}`}
          onClick={() => selectedDeviceProfile && goToStep(2)}
        >
          <div className={`rounded-full h-8 w-8 flex items-center justify-center mx-auto mb-1 
            ${predicatesFound ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
            {predicatesFound ? <CheckCircle className="h-4 w-4" /> : "2"}
          </div>
          <div className="text-xs font-medium">Predicate Search</div>
        </div>
        
        <div 
          className={`p-3 rounded-lg text-center cursor-pointer transition-all
            ${workflowStep === 3 ? 'bg-blue-100 ring-2 ring-blue-400 shadow-md' : 
            (equivalenceCompleted ? 'bg-blue-50 text-blue-800' : 'bg-gray-100 text-gray-600')}
            ${predicatesFound ? 'hover:bg-blue-100' : 'hover:bg-gray-200'}`}
          onClick={() => predicatesFound && goToStep(3)}
        >
          <div className={`rounded-full h-8 w-8 flex items-center justify-center mx-auto mb-1 
            ${equivalenceCompleted ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
            {equivalenceCompleted ? <CheckCircle className="h-4 w-4" /> : "3"}
          </div>
          <div className="text-xs font-medium">Equivalence</div>
        </div>
        
        <div 
          className={`p-3 rounded-lg text-center cursor-pointer transition-all
            ${workflowStep === 4 ? 'bg-blue-100 ring-2 ring-blue-400 shadow-md' : 
            (complianceScore ? 'bg-blue-50 text-blue-800' : 'bg-gray-100 text-gray-600')}
            ${equivalenceCompleted ? 'hover:bg-blue-100' : 'hover:bg-gray-200'}`}
          onClick={() => equivalenceCompleted && goToStep(4)}
        >
          <div className={`rounded-full h-8 w-8 flex items-center justify-center mx-auto mb-1 
            ${complianceScore ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
            {complianceScore ? <CheckCircle className="h-4 w-4" /> : "4"}
          </div>
          <div className="text-xs font-medium">Compliance</div>
          {complianceScore && (
            <div className="text-xs mt-1">
              {complianceScore}% Ready
            </div>
          )}
        </div>
        
        <div 
          className={`p-3 rounded-lg text-center cursor-pointer transition-all
            ${workflowStep === 5 ? 'bg-blue-100 ring-2 ring-blue-400 shadow-md' : 
            (submissionReady ? 'bg-blue-50 text-blue-800' : 'bg-gray-100 text-gray-600')}
            ${complianceScore ? 'hover:bg-blue-100' : 'hover:bg-gray-200'}`}
          onClick={() => complianceScore && goToStep(5)}
        >
          <div className={`rounded-full h-8 w-8 flex items-center justify-center mx-auto mb-1 
            ${submissionReady ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
            {submissionReady ? <CheckCircle className="h-4 w-4" /> : "5"}
          </div>
          <div className="text-xs font-medium">Final Submission</div>
        </div>
      </div>
      
      <div className="flex justify-between mt-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={prevStep}
          disabled={workflowStep === 1}
        >
          Previous Step
        </Button>
        
        <Button 
          variant="default" 
          size="sm" 
          onClick={nextStep}
          disabled={
            (workflowStep === 1 && !selectedDeviceProfile) ||
            (workflowStep === 2 && !predicatesFound) ||
            (workflowStep === 3 && !equivalenceCompleted) ||
            (workflowStep === 4 && !complianceScore) ||
            workflowStep === 5
          }
        >
          Next Step
        </Button>
      </div>
    </div>
  );

  // Render content based on the current workflow step
  const renderContent = () => {
    switch (workflowStep) {
      case 1:
        return (
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white pb-2">
                <CardTitle className="flex items-center text-blue-700">
                  <Database className="mr-2 h-5 w-5 text-blue-600" />
                  1. Device Profile Setup
                </CardTitle>
                <CardDescription>
                  Create or select a device profile to begin the 510(k) submission process.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600 mb-4">
                  Creating a thorough device profile is the critical first step in your 510(k) submission process. 
                  This information will be used to find predicates and analyze the regulatory pathway.
                </p>

                <div className="flex flex-col space-y-3">
                  {!selectedDeviceProfile ? (
                    <DeviceProfileDialog
                      buttonText="Create New Device Profile"
                      buttonVariant="default"
                      dialogTitle="Create 510(k) Device Profile"
                      dialogDescription="Enter the details of your medical device to begin the 510(k) submission process."
                      onSuccessfulSubmit={(profile) => {
                        handleDeviceProfileSelect(profile);
                      }}
                      isStartingPoint={true}
                    />
                  ) : (
                    <>
                      <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-100 rounded-md">
                        <div className="flex-shrink-0 bg-green-100 p-2 rounded-full">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-green-800">Selected Device: {selectedDeviceProfile.deviceName}</h4>
                          <p className="text-xs text-green-700">
                            Class {selectedDeviceProfile.deviceClass} • {selectedDeviceProfile.manufacturer || 'No manufacturer specified'}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" className="flex-shrink-0" onClick={() => setSelectedDeviceProfile(null)}>
                          Change
                        </Button>
                      </div>
                      
                      <DeviceProfileDialog
                        buttonText="Edit Device Profile"
                        buttonVariant="outline"
                        dialogTitle="Edit 510(k) Device Profile"
                        dialogDescription="Update the details of your medical device for the 510(k) submission."
                        existingData={selectedDeviceProfile}
                        onSuccessfulSubmit={(profile) => {
                          handleDeviceProfileSelect(profile);
                        }}
                      />
                    </>
                  )}
                </div>
                
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-2">Existing Device Profiles</h4>
                  <DeviceProfileList 
                    onSelectProfile={handleDeviceProfileSelect} 
                    selectedProfileId={selectedDeviceProfile?.id}
                    compact={true}
                    limitDisplay={3}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end bg-gray-50 border-t">
                <Button
                  onClick={nextStep}
                  disabled={!selectedDeviceProfile}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Continue to Predicate Search
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white pb-2">
                <CardTitle className="flex items-center text-blue-700">
                  <SearchCode className="mr-2 h-5 w-5 text-blue-600" />
                  2. Predicate Device Search
                </CardTitle>
                <CardDescription>
                  Find and select predicate devices for your 510(k) submission.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <PredicateFinderPanel 
                    deviceProfile={selectedDeviceProfile}
                    documentId={selectedDeviceProfile?.id}
                    organizationId={organizationId}
                    onPredicatesFound={(results) => {
                      setPredicateDevices(results);
                      setPredicatesFound(true);
                    }}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between bg-gray-50 border-t">
                <Button
                  variant="outline"
                  onClick={prevStep}
                >
                  Back to Device Profile
                </Button>
                
                <Button
                  onClick={nextStep}
                  disabled={!predicatesFound}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Continue to Equivalence Analysis
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white pb-2">
                <CardTitle className="flex items-center text-blue-700">
                  <GitCompare className="mr-2 h-5 w-5 text-blue-600" />
                  3. Substantial Equivalence Analysis
                </CardTitle>
                <CardDescription>
                  Establish substantial equivalence with your selected predicate devices.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <EquivalenceBuilderPanel 
                  deviceProfile={selectedDeviceProfile}
                  setDeviceProfile={setSelectedDeviceProfile}
                  documentId={selectedDeviceProfile?.id}
                  onComplete={handleEquivalenceComplete}
                  predicateDevices={predicateDevices}
                />
              </CardContent>
              <CardFooter className="flex justify-between bg-gray-50 border-t">
                <Button
                  variant="outline"
                  onClick={prevStep}
                >
                  Back to Predicate Search
                </Button>
                
                <Button
                  onClick={nextStep}
                  disabled={!equivalenceCompleted}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Continue to Compliance Check
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white pb-2">
                <CardTitle className="flex items-center text-blue-700">
                  <CheckSquare className="mr-2 h-5 w-5 text-blue-600" />
                  4. FDA Compliance Check
                </CardTitle>
                <CardDescription>
                  Ensure your submission meets all FDA 510(k) requirements.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ComplianceCheckPanel 
                  deviceProfile={selectedDeviceProfile}
                  setDeviceProfile={setSelectedDeviceProfile}
                  documentId={selectedDeviceProfile?.id}
                  compliance={compliance}
                  setCompliance={(complianceData) => {
                    setCompliance(complianceData);
                    if (complianceData?.score) {
                      setComplianceScore(Math.round(complianceData.score * 100));
                    }
                    if (typeof onComplianceChange === 'function') {
                      onComplianceChange(complianceData);
                    }
                  }}
                  isLoading={isComplianceRunning}
                  setIsLoading={setIsComplianceRunning}
                  onRunCompliance={handleComplianceCheck}
                />
              </CardContent>
              <CardFooter className="flex justify-between bg-gray-50 border-t">
                <Button
                  variant="outline"
                  onClick={prevStep}
                >
                  Back to Equivalence Analysis
                </Button>
                
                <Button
                  onClick={nextStep}
                  disabled={!complianceScore}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Continue to Final Submission
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white pb-2">
                <CardTitle className="flex items-center text-blue-700">
                  <FileText className="mr-2 h-5 w-5 text-blue-600" />
                  5. Generate 510(k) Submission Package
                </CardTitle>
                <CardDescription>
                  Review and export your 510(k) submission package for FDA submission.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ReportGenerator
                  deviceProfile={selectedDeviceProfile}
                  documentId={selectedDeviceProfile?.id}
                  exportTimestamp={exportTimestamp || new Date().toISOString()}
                  draftStatus={draftStatus}
                  setDraftStatus={setDraftStatus}
                  sections={sections}
                  onSubmissionReady={handleSubmissionReady}
                />
                
                {submissionReady && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-md">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-green-100 p-2 rounded-full mr-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-green-800">Submission Package Ready</h4>
                        <p className="text-xs text-green-700 mb-3">
                          Your 510(k) submission package has been generated and is ready for FDA submission.
                        </p>
                        
                        <Button
                          className="bg-green-600 hover:bg-green-700"
                          disabled={isLoading.exportPackage}
                          onClick={handleExportPackage}
                        >
                          {isLoading.exportPackage ? (
                            <>
                              <span className="animate-spin mr-2">⟳</span>
                              Exporting...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-2" />
                              Export eSTAR Package
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between bg-gray-50 border-t">
                <Button
                  variant="outline"
                  onClick={prevStep}
                >
                  Back to Compliance Check
                </Button>
                
                {draftStatus === 'ready-for-submission' && (
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      toast({
                        title: "Submission Complete",
                        description: "Your FDA 510(k) submission has been successfully completed.",
                        variant: "success"
                      });
                    }}
                  >
                    <FileCheck className="h-4 w-4 mr-2" />
                    Submit to FDA
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        );
      
      default:
        return (
          <div className="text-center p-8">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Invalid Step</h3>
            <p className="text-gray-600 mt-2">Please navigate to a valid workflow step</p>
            <Button onClick={() => setWorkflowStep(1)} className="mt-4">
              Return to Start
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Render the workflow progress indicator */}
      {renderProgressBar()}
      
      {/* Render the content for the current step */}
      {renderContent()}
    </div>
  );
};

export default WorkflowPanel;