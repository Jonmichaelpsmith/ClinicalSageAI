import React, { useState, useEffect } from 'react';
import { useLumenAiAssistant } from '@/contexts/LumenAiAssistantContext';
import axios from 'axios';
import CerBuilderPanel from '@/components/cer/CerBuilderPanel';
import CerPreviewPanel from '@/components/cer/CerPreviewPanel';
import LiteratureSearchPanel from '@/components/cer/LiteratureSearchPanel';
import LiteratureMethodologyPanel from '@/components/cer/LiteratureMethodologyPanel';
import ComplianceScorePanel from '@/components/cer/ComplianceScorePanel';
import CerAssistantPanel from '@/components/cer/CerAssistantPanel';
import DocumentVaultPanel from '@/components/cer/DocumentVaultPanel';
import CerDataRetrievalPanel from '@/components/cer/CerDataRetrievalPanel';
// Using 510k specific components instead of CER ones
import EquivalenceBuilderPanel from '@/components/510k/EquivalenceBuilderPanel';
import ComplianceCheckPanel from '@/components/510k/ComplianceCheckPanel';
import LiteratureVisualizationPanel from '@/components/510k/LiteratureVisualizationPanel';
import ESTARBuilderPanel from '@/components/510k/ESTARBuilderPanel';
import { FDA510kService } from '@/services/FDA510kService';
import StateOfArtPanel from '@/components/cer/StateOfArtPanel';
import ClinicalEvaluationPlanPanel from '@/components/cer/ClinicalEvaluationPlanPanel';
import QualityManagementPlanPanel from '@/components/cer/QualityManagementPlanPanel';
import RegulatoryTraceabilityMatrix from '@/components/cer/RegulatoryTraceabilityMatrix';
import GSPRMappingPanel from '@/components/cer/GSPRMappingPanel';
import LiteratureReviewWorkflow from '@/components/cer/LiteratureReviewWorkflow';
import NotificationBanner from '@/components/cer/NotificationBanner';
import InternalClinicalDataPanel from '@/components/cer/InternalClinicalDataPanel';
import ExportModule from '@/components/cer/ExportModule';
import CerComprehensiveReportsPanel from '@/components/cer/CerComprehensiveReportsPanel';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import MAUDIntegrationPanel from '@/components/cer/MAUDIntegrationPanel';
import KAutomationPanel from '@/components/cer/KAutomationPanel';

// 510k components - directly importing only what we need
import PredicateFinderPanel from '@/components/510k/PredicateFinderPanel';
import ReportGenerator from '@/components/510k/ReportGenerator';
import SimpleDocumentTreePanel from '@/components/510k/SimpleDocumentTreePanel';
import WelcomeDialog from '@/components/510k/WelcomeDialog';
import DeviceIntakeForm from '@/components/510k/DeviceIntakeForm';
import DeviceProfileForm from '@/components/cer/DeviceProfileForm';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cerApiService } from '@/services/CerAPIService';
import { literatureAPIService } from '@/services/LiteratureAPIService';
import LiteratureFeatureService from '@/services/LiteratureFeatureService';
import { FileText, BookOpen, CheckSquare, Download, MessageSquare, Clock, FileCheck, CheckCircle, AlertCircle, RefreshCw, ZapIcon, BarChart, FolderOpen, Database, GitCompare, BookMarked, Lightbulb, ClipboardList, FileSpreadsheet, Layers, Trophy, ShieldCheck, Shield, Play, Archive, Activity, Cpu, HardDrive, Network, Code, XCircle, DownloadCloud, Search, Calendar, Info, ArrowRight, AlertTriangle, Files, FolderTree, X, FilePlus, FolderPlus, PlusCircle } from 'lucide-react';
import DocumentIntakePanel from '@/components/document-intelligence/DocumentIntakePanel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

export default function CERV2Page({ initialDocumentType, initialActiveTab }) {
  // Hook into the Lumen AI Assistant context
  const { openAssistant, setModuleContext } = useLumenAiAssistant();
  const { toast } = useToast();
  
  // State variables
  const [title, setTitle] = useState('FDA 510(k) Submission');
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [showDeviceIntakeForm, setShowDeviceIntakeForm] = useState(false);
  const [newClientMode, setNewClientMode] = useState(false);
  const [deviceIntakeData, setDeviceIntakeData] = useState(null);
  const [deviceType, setDeviceType] = useState('Class II Medical Device');
  const [documentType, setDocumentType] = useState(initialDocumentType || '510k'); // Options: 'cer' or '510k'
  const [deviceName, setDeviceName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [intendedUse, setIntendedUse] = useState('');
  const [faers, setFaers] = useState([]);
  const [cerDocumentId, setCerDocumentId] = useState(() => {
    const prefix = "CER-";
    return prefix + Math.floor(100000 + Math.random() * 900000);
  });
  const [k510DocumentId, setK510DocumentId] = useState(() => {
    const prefix = "510K-";
    return prefix + Math.floor(100000 + Math.random() * 900000);
  });
  const [comparators, setComparators] = useState([]);
  const [sections, setSections] = useState([]);
  const [equivalenceData, setEquivalenceData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingFaers, setIsFetchingFaers] = useState(false);
  const [isFetchingLiterature, setIsFetchingLiterature] = useState(false);
  const [activeTab, setActiveTab] = useState(initialActiveTab || 'predicates');
  
  // Document Intelligence state variables
  const [processedDocuments, setProcessedDocuments] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  
  // 510k workflow specific state
  const [workflowStep, setWorkflowStep] = useState(1);
  const [workflowProgress, setWorkflowProgress] = useState(25);
  const [predicatesFound, setPredicatesFound] = useState(false);
  const [predicateDevices, setPredicateDevices] = useState([]);
  const [literatureResults, setLiteratureResults] = useState([]);
  
  // eSTAR Builder state variables
  const [isValidatingEstar, setIsValidatingEstar] = useState(false);
  const [isGeneratingEstar, setIsGeneratingEstar] = useState(false);
  const [estarValidationResults, setEstarValidationResults] = useState(null);
  const [estarGeneratedUrl, setEstarGeneratedUrl] = useState('');
  const [estarFormat, setEstarFormat] = useState('zip');
  const [selectedLiterature, setSelectedLiterature] = useState([]);
  const [equivalenceCompleted, setEquivalenceCompleted] = useState(false);
  const [complianceScore, setComplianceScore] = useState(null);
  const [submissionReady, setSubmissionReady] = useState(false);
  
  // eSTAR specific state variables are defined above
  
  // Create a deviceProfile object for easier passing to 510k components
  const [deviceProfile, setDeviceProfile] = useState({
    id: k510DocumentId,
    deviceName: deviceName || 'Sample Medical Device',
    manufacturer: manufacturer || 'Sample Manufacturer',
    productCode: 'ABC',
    deviceClass: 'II',
    intendedUse: intendedUse || 'For diagnostic use in clinical settings',
    description: 'A medical device designed for diagnostic procedures',
    technicalSpecifications: 'Meets ISO 13485 standards',
    regulatoryClass: 'Class II',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  const [compliance, setCompliance] = useState(null);
  const [draftStatus, setDraftStatus] = useState('in-progress');
  const [exportTimestamp, setExportTimestamp] = useState(null);
  const [isComplianceRunning, setIsComplianceRunning] = useState(false);
  const [isGeneratingFullCER, setIsGeneratingFullCER] = useState(false);
  const [showDeviceInfoDialog, setShowDeviceInfoDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('eu-mdr');
  const [showWizard, setShowWizard] = useState(false);
  const [showEvidenceReminder, setShowEvidenceReminder] = useState(true);
  const [showSystemHealth, setShowSystemHealth] = useState(false);
  const [showDocumentTree, setShowDocumentTree] = useState(false);
  const [systemInfo, setSystemInfo] = useState({
    memory: { used: 0, total: 0, percentage: 0 },
    api: { status: 'unknown', latency: 0 },
    uptime: 0,
    errorCount: 0,
    lastChecked: null
  });

  // Update device profile when device information changes
  useEffect(() => {
    if (documentType === '510k') {
      setDeviceProfile(prev => ({
        ...prev,
        deviceName: deviceName || prev.deviceName,
        manufacturer: manufacturer || prev.manufacturer,
        intendedUse: intendedUse || prev.intendedUse
      }));
    }
  }, [deviceName, manufacturer, intendedUse, documentType]);
  
  // Helper function to format CtQ factors for a specific objective
  const getCtqFactorsForSection = (objectiveId, ctqFactors) => {
    const factors = ctqFactors.filter(factor => factor.objectiveId === objectiveId);
    
    if (factors.length === 0) {
      return "No Critical-to-Quality factors defined.";
    }
    
    return `**Critical-to-Quality Factors:**\n${factors.map(factor => `
* **${factor.name}**
  * Associated Section: ${factor.associatedSection}
  * Risk Level: ${factor.riskLevel}
  * Description: ${factor.description}
  * Mitigation: ${factor.mitigation}
`).join('')}`;
  };

  // Set up the 510K workflow if initialized with that document type
  useEffect(() => {
    if (documentType === '510k') {
      console.log("Document type set to 510k, active tab set to: predicates");
    }
  }, [documentType]);
  
  // Set up event listener for draft document loading within CERV2
  useEffect(() => {
    // Create event handler for loading draft documents
    const handleDraftDocumentLoad = (event) => {
      const { document } = event.detail;
      
      if (document && document.content) {
        console.log("Loading draft document in CERV2:", document.name);
        
        try {
          // Update document state based on content type
          if (document.type === '510k') {
            // Update 510k document state
            setDocumentType('510k');
            
            // Apply content to device profile if available
            if (document.content.deviceProfile) {
              setDeviceProfile(document.content.deviceProfile);
              setDeviceName(document.content.deviceProfile.deviceName || '');
              setManufacturer(document.content.deviceProfile.manufacturer || '');
              setIntendedUse(document.content.deviceProfile.intendedUse || '');
              setK510DocumentId(document.content.deviceProfile.id || document.id);
            }
            
            // Set appropriate active tab based on document content
            if (document.content.workflowStep) {
              setWorkflowStep(document.content.workflowStep);
              const tabMap = {
                1: 'predicates',
                2: 'predicates',
                3: 'equivalence',
                4: 'compliance',
                5: 'submission'
              };
              setActiveTab(tabMap[document.content.workflowStep] || 'predicates');
            } else {
              // Default to predicates if no workflow step is specified
              setActiveTab('predicates');
            }
          } else if (document.type === 'cer') {
            // Update CER document state
            setDocumentType('cer');
            setCerDocumentId(document.id);
            setActiveTab('builder');
          }
          
          // Close document tree after loading
          setShowDocumentTree(false);
          
          toast({
            title: "Draft Loaded",
            description: `Successfully loaded draft: ${document.name}`,
            variant: "default"
          });
        } catch (error) {
          console.error("Error loading draft document in CERV2:", error);
          toast({
            title: "Error Loading Draft",
            description: "There was a problem loading the draft document.",
            variant: "destructive"
          });
        }
      }
    };
    
    // Add event listener for draft document loading
    window.addEventListener('cerv2-load-document', handleDraftDocumentLoad);
    
    // Clean up listener on component unmount
    return () => {
      window.removeEventListener('cerv2-load-document', handleDraftDocumentLoad);
    };
  }, []);

  // Update workflow progress when steps change
  useEffect(() => {
    if (documentType === '510k') {
      // Calculate progress based on workflow step
      const progressMap = {
        1: deviceProfile ? 25 : 5,
        2: predicatesFound ? 50 : 30,
        3: equivalenceCompleted ? 75 : 55,
        4: complianceScore ? 90 : 80,
        5: submissionReady ? 100 : 95
      };
      
      setWorkflowProgress(progressMap[workflowStep] || 0);
    }
  }, [documentType, workflowStep, deviceProfile, predicatesFound, equivalenceCompleted, complianceScore, submissionReady]);

  // Handler functions for 510k workflow
  const handlePredicatesComplete = async (data, literatureData = []) => {
    console.log('[CERV2 Workflow] Predicates complete handler called with data:', { 
      predicateCount: data?.length || 0,
      literatureCount: literatureData?.length || 0,
      deviceProfileId: deviceProfile?.id || 'No device profile ID'
    });
    
    // First, update state for predicates found
    setPredicatesFound(true);
    
    try {
      // Check if we have what we need to proceed to equivalence analysis
      if (deviceProfile?.id) {
        try {
          console.log('[CERV2 Workflow] Checking readiness for equivalence analysis with device:', deviceProfile.id);
          
          // Check if we have predicate devices to proceed with equivalence analysis
          if (!data || data.length === 0) {
            console.warn('[CERV2 Workflow] No predicate devices available for equivalence analysis');
            toast({
              title: "Missing Predicate Devices",
              description: "Please find and select predicate devices before proceeding to equivalence analysis.",
              variant: "destructive",
              duration: 3000
            });
            return; // Prevent transition if no predicates are found
          }
          
          console.log(`[CERV2 Workflow] Found ${data.length} predicate devices, proceeding with equivalence analysis`);
          toast({
            title: "Workflow Check",
            description: "Predicate devices verified. Proceeding with equivalence analysis...",
            duration: 2000
          });
        } catch (verificationError) {
          console.error('[CERV2 Workflow] Error during predicate verification:', verificationError);
          // Log error but continue with transition
        }
      } else {
        console.warn('[CERV2 Workflow] Missing device profile ID for equivalence analysis');
      }
    } catch (error) {
      console.error('[CERV2 Workflow] General error in workflow transition check:', error);
    }
    
    // Set predicate devices with a slight delay to ensure proper state update
    setTimeout(() => {
      // Update all necessary state values before navigation
      setPredicateDevices(data || []);
      
      // Process any literature results that were found during predicate search
      if (literatureData && literatureData.length > 0) {
        setLiteratureResults(literatureData);
        // Automatically select highly relevant papers (score >= 0.8) up to 5 papers
        setSelectedLiterature(literatureData.filter(item => item.relevanceScore >= 0.8).slice(0, 5));
      }
      
      toast({
        title: "Predicate Devices Found",
        description: `Found ${data?.length || 0} potential predicate devices that match your criteria.`,
        variant: "success"
      });
      
      try {
        // First update the workflow step - this is critical for the tab navigation
        console.log('[CERV2 Workflow] Setting workflow step to 3');
        setWorkflowStep(3);
        
        // Wait for state update to propagate, then update tab
        // Increased delay to ensure state is fully updated
        setTimeout(() => {
          try {
            console.log('[CERV2 Workflow] Setting active tab to equivalence');
            setActiveTab('equivalence');
            
            // Enhanced verification with multiple retries
            let verificationAttempts = 0;
            const verifyTransition = () => {
              verificationAttempts++;
              console.log(`[CERV2 Workflow] Verifying tab transition (attempt ${verificationAttempts}): current=${activeTab}`);
              
              if (activeTab !== 'equivalence' && verificationAttempts < 3) {
                console.warn('[CERV2 Workflow] Tab transition incomplete, retrying...');
                setActiveTab('equivalence');
                setTimeout(verifyTransition, 200);
              } else if (activeTab !== 'equivalence') {
                console.error('[CERV2 Workflow] Tab transition failed after multiple attempts');
                
                // Emergency recovery - force both state values synchronously
                setWorkflowStep(3);
                setActiveTab('equivalence');
                
                // Final confirmation toast to indicate recovery action
                toast({
                  title: "Navigation Assistance",
                  description: "Workflow stabilized. You can continue with equivalence analysis.",
                  variant: "default",
                  duration: 3000
                });
              } else {
                console.log('[CERV2 Workflow] Tab transition successful');
              }
            };
            
            // Start verification process after initial tab change
            setTimeout(verifyTransition, 300);
          } catch (tabError) {
            console.error('[CERV2 Workflow] Error during tab transition:', tabError);
          }
        }, 200);
      } catch (workflowError) {
        console.error('[CERV2 Workflow] Critical error in workflow step transition:', workflowError);
        
        // Hard reset both values as emergency recovery
        setWorkflowStep(3);
        setTimeout(() => setActiveTab('equivalence'), 100);
      }
    }, 100);
  };
  
  // Handle literature selection updates
  const handleLiteratureSelect = (item) => {
    if (selectedLiterature.some(lit => lit.id === item.id)) {
      setSelectedLiterature(prev => prev.filter(lit => lit.id !== item.id));
    } else {
      setSelectedLiterature(prev => [...prev, item]);
    }
  };
  
  const handleEquivalenceComplete = (data) => {
    setEquivalenceCompleted(true);
    setEquivalenceData(data); // Store the equivalence data including literature evidence
    
    // Explicitly move to the next step in the workflow
    setWorkflowStep(4);
    setActiveTab('compliance');
    
    console.log('Equivalence step completed successfully, transitioning to compliance step');
    
    // Save literature-feature connections if available
    if (data && data.literatureEvidence && Object.keys(data.literatureEvidence).length > 0) {
      // Save to the server via the LiteratureFeatureService
      LiteratureFeatureService.saveLiteratureFeatureConnections({
        documentId: deviceProfile?.id || data.documentId,
        featureEvidence: data.literatureEvidence,
        organizationId: deviceProfile?.organizationId
      })
      .then(() => {
        // Log successful connection
        const connectionCount = Object.values(data.literatureEvidence).reduce((acc, papers) => acc + papers.length, 0);
        console.log(`Saved ${connectionCount} literature evidence connections for ${Object.keys(data.literatureEvidence).length} features`);
        
        // Update toast message to include literature connections
        toast({
          title: "Equivalence Analysis Complete",
          description: `Substantial equivalence documentation has been prepared with ${connectionCount} literature evidence connections.`,
          variant: "success"
        });
      })
      .catch(error => {
        console.error('Error saving literature evidence connections:', error);
        
        // Show error toast
        toast({
          title: "Warning",
          description: "Equivalence analysis saved, but there was an issue connecting literature evidence. This won't affect your submission.",
          variant: "warning"
        });
      });
    } else {
      // Standard completion toast when no literature evidence
      toast({
        title: "Equivalence Analysis Complete",
        description: "Substantial equivalence documentation has been prepared.",
        variant: "success"
      });
    }
    
    // Automatically advance to compliance check
    setWorkflowStep(4);
    setActiveTab('compliance');
  };
  
  const handleComplianceComplete = (score) => {
    const numericScore = typeof score === 'number' ? score : 85;
    setComplianceScore(numericScore);
    toast({
      title: "Compliance Check Complete",
      description: `Your 510(k) submission is ${numericScore}% compliant with FDA requirements.`,
      variant: numericScore > 80 ? "success" : "warning"
    });
    
    // Advance to final submission
    setWorkflowStep(5);
    setActiveTab('submission');
  };
  
  const handleSubmissionReady = () => {
    setSubmissionReady(true);
    toast({
      title: "Submission Package Ready",
      description: "Your 510(k) submission package is now ready for final review.",
      variant: "success"
    });
  };
  
  /**
   * Validate the eSTAR package against FDA requirements
   * 
   * @param {boolean} strictMode Whether to apply strict validation rules
   * @returns {Promise<void>}
   */
  const validateESTARPackage = async (strictMode = false) => {
    if (!deviceProfile?.id) {
      toast({
        title: "Validation Error",
        description: "No device profile found. Please complete device setup first.",
        variant: "destructive",
      });
      return;
    }
    
    setIsValidatingEstar(true);
    setEstarValidationResults(null);
    
    try {
      const results = await FDA510kService.validateESTARPackage(deviceProfile.id, strictMode);
      
      setEstarValidationResults(results);
      
      if (results.valid) {
        toast({
          title: "Validation Successful",
          description: "eSTAR package meets FDA submission requirements.",
          variant: "default",
        });
      } else {
        toast({
          title: "Validation Issues Found",
          description: `${results.issues?.length || 0} issues need to be resolved before submission.`,
          variant: "warning",
        });
      }
    } catch (error) {
      console.error("Error validating eSTAR package:", error);
      toast({
        title: "Validation Error",
        description: "Failed to validate eSTAR package. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsValidatingEstar(false);
    }
  };
  
  /**
   * Generate a FDA-compliant eSTAR package
   * 
   * @param {string} format Format for the eSTAR package ('zip', 'pdf', or 'json')
   * @returns {Promise<void>}
   */
  const generateESTARPackage = async (format = 'zip') => {
    if (!deviceProfile?.id) {
      toast({
        title: "Generation Error",
        description: "No device profile found. Please complete device setup first.",
        variant: "destructive",
      });
      return;
    }
    
    if (!submissionReady) {
      toast({
        title: "Not Ready for Submission",
        description: "Please complete all required sections before generating the eSTAR package.",
        variant: "warning",
      });
      return;
    }
    
    setIsGeneratingEstar(true);
    setEstarGeneratedUrl('');
    
    try {
      // Collect all the necessary data for the eSTAR package
      const reportData = {
        deviceProfile: deviceProfile,
        compliance: {
          score: complianceScore,
          status: draftStatus,
        },
        equivalence: {
          predicateDevices: predicateDevices,
          completed: equivalenceCompleted,
        },
        sections: sections,
        options: {
          format: format,
          includeAttachments: true,
          validateBeforeGeneration: true
        }
      };
      
      // Generate the final 510(k) report including eSTAR package
      const result = await FDA510kService.generateFinal510kReport(reportData);
      
      if (result?.downloadUrl) {
        setEstarGeneratedUrl(result.downloadUrl);
        toast({
          title: "eSTAR Package Generated",
          description: "Your eSTAR package has been generated successfully.",
          variant: "default",
        });
      } else {
        toast({
          title: "Generation Warning",
          description: "eSTAR package was generated but no download URL was returned.",
          variant: "warning",
        });
      }
    } catch (error) {
      console.error("Error generating eSTAR package:", error);
      toast({
        title: "Generation Error",
        description: "Failed to generate eSTAR package. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingEstar(false);
    }
  };
  
  // Navigation functions for 510k workflow
  const goToStep = (step) => {
    if (step >= 1 && step <= 5) {
      try {
        console.log(`[CERV2 Navigation] Attempting to go to step ${step}`);
        
        // Track current state before transition for debugging
        const previousStep = workflowStep;
        const previousTab = activeTab;
        
        setWorkflowStep(step);
        
        // Update active tab based on step
        const tabMap = {
          1: 'predicates', // Device Profile (displayed in Predicate Finder)
          2: 'predicates', // Predicate Finder
          3: 'equivalence', // Substantial Equivalence
          4: 'compliance', // Compliance Check 
          5: 'submission' // Final Submission
        };
        
        // Store the target tab for verification
        const targetTab = tabMap[step];
        
        console.log(`[CERV2 Navigation] Transitioning from tab "${previousTab}" to "${targetTab}"`);
        
        // Set the active tab with a timeout to ensure state is updated properly
        setActiveTab(targetTab);
        
        // Verify the transition occurred properly
        setTimeout(() => {
          if (workflowStep === step && activeTab === targetTab) {
            console.log(`[CERV2 Navigation] Successfully transitioned to step ${step} and tab "${targetTab}"`);
          } else {
            console.warn(`[CERV2 Navigation] Transition may have failed. Current tab: "${activeTab}", Expected: "${targetTab}"`);
          }
        }, 100);
      } catch (error) {
        console.error(`[CERV2 Navigation] Error transitioning to step ${step}:`, error);
        // Attempt recovery
        try {
          const targetTab = {
            1: 'predicates',
            2: 'predicates',
            3: 'equivalence',
            4: 'compliance',
            5: 'submission'
          }[step];
          
          // Force update both state variables directly
          setWorkflowStep(step);
          setActiveTab(targetTab);
          
          console.log(`[CERV2 Navigation] Recovery attempt completed for step ${step}`);
        } catch (recoveryError) {
          console.error('[CERV2 Navigation] Recovery attempt failed:', recoveryError);
        }
      }
    }
  };
  
  // Render the 510k workflow progress bar
  const render510kProgressBar = () => (
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
            (deviceProfile ? 'bg-blue-50 text-blue-800' : 'bg-gray-100 text-gray-600')}
            ${deviceProfile ? 'hover:bg-blue-100' : 'hover:bg-gray-200'}`}
          onClick={() => goToStep(1)}
        >
          <div className={`rounded-full h-8 w-8 flex items-center justify-center mx-auto mb-1 
            ${deviceProfile ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
            {deviceProfile ? <CheckCircle className="h-4 w-4" /> : "1"}
          </div>
          <div className="text-xs font-medium">Device Profile</div>
          {deviceProfile && (
            <div className="text-xs mt-1 truncate max-w-full">
              {deviceProfile.deviceName}
            </div>
          )}
        </div>
        
        <div 
          className={`p-3 rounded-lg text-center cursor-pointer transition-all
            ${workflowStep === 2 ? 'bg-blue-100 ring-2 ring-blue-400 shadow-md' : 
            (predicatesFound ? 'bg-blue-50 text-blue-800' : 'bg-gray-100 text-gray-600')}
            ${deviceProfile ? 'hover:bg-blue-100' : 'hover:bg-gray-200'}`}
          onClick={() => deviceProfile && goToStep(2)}
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
          onClick={() => {
            if (workflowStep > 1) {
              goToStep(workflowStep - 1);
            }
          }}
          disabled={workflowStep === 1}
        >
          Previous Step
        </Button>
        
        <Button 
          variant="default" 
          size="sm" 
          onClick={() => {
            if (workflowStep < 5) {
              goToStep(workflowStep + 1);
            }
          }}
          disabled={
            (workflowStep === 1 && !deviceProfile) ||
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
  
  // Render the 510k step content based on current workflow step
  const render510kStepContent = () => {
    switch(workflowStep) {
      case 1:
      case 2:
        return (
          <div className="space-y-4">
            <PredicateFinderPanel 
              deviceProfile={deviceProfile}
              setDeviceProfile={(newProfile) => {
                // Just save the updated device profile
                if (newProfile) {
                  setDeviceProfile(newProfile);
                }
              }}
              documentId={deviceProfile?.id}
              onPredicatesFound={handlePredicatesComplete}
            />
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-4">
            {/* Display literature visualization if literature results exist */}
            {literatureResults.length > 0 && (
              <div className="mb-6">
                <LiteratureVisualizationPanel 
                  literatureData={literatureResults}
                  selectedItems={selectedLiterature}
                  onSelectItem={handleLiteratureSelect}
                  deviceProfile={deviceProfile}
                />
              </div>
            )}
            
            <EquivalenceBuilderPanel 
              deviceProfile={deviceProfile}
              setDeviceProfile={(newProfile) => {
                // Just save the updated device profile
                if (newProfile) {
                  setDeviceProfile(newProfile);
                }
              }}
              documentId={deviceProfile?.id}
              onComplete={handleEquivalenceComplete}
              predicateDevices={predicateDevices}
              selectedLiterature={selectedLiterature}
            />
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-4">
            <ComplianceCheckPanel 
              deviceProfile={deviceProfile}
              documentId={deviceProfile?.id}
              predicateDevices={predicateDevices}
              equivalenceData={equivalenceData}
              onComplete={handleComplianceComplete}
            />
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-6">
            {/* Report Generator */}
            <ReportGenerator
              deviceProfile={deviceProfile}
              documentId={deviceProfile?.id}
              exportTimestamp={new Date().toISOString()}
              draftStatus={compliance?.status || 'draft'}
              setDraftStatus={setDraftStatus}
              sections={sections}
              onSubmissionReady={handleSubmissionReady}
            />
            
            {/* eSTAR Builder Panel */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileDown className="mr-2 h-5 w-5 text-blue-600" />
                  eSTAR Package Builder
                </CardTitle>
                <CardDescription>
                  Generate a FDA-compliant eSTAR package for your 510(k) submission
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Validation panel */}
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">1. Validate eSTAR Package</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Ensure your eSTAR package meets all FDA requirements before generating it
                    </p>
                    
                    <div className="flex items-center gap-3">
                      <Button 
                        onClick={() => validateESTARPackage(false)}
                        disabled={isValidatingEstar || !submissionReady}
                        variant="outline"
                      >
                        {isValidatingEstar ? (
                          <>Validating<span className="loading ml-2">...</span></>
                        ) : "Standard Validation"}
                      </Button>
                      
                      <Button 
                        onClick={() => validateESTARPackage(true)}
                        disabled={isValidatingEstar || !submissionReady}
                        variant="outline"
                      >
                        {isValidatingEstar ? (
                          <>Validating<span className="loading ml-2">...</span></>
                        ) : "Strict Validation"}
                      </Button>
                    </div>
                    
                    {/* Validation results display */}
                    {estarValidationResults && (
                      <div className="mt-4 p-4 rounded-md border bg-gray-50">
                        <div className="flex items-center mb-2">
                          {estarValidationResults.valid ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                          )}
                          <h4 className="font-medium">
                            {estarValidationResults.valid 
                              ? "Package Valid" 
                              : `${estarValidationResults.issues?.length || 0} Issues Found`}
                          </h4>
                        </div>
                        
                        {estarValidationResults.issues && estarValidationResults.issues.length > 0 && (
                          <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                            {estarValidationResults.issues.slice(0, 5).map((issue, idx) => (
                              <li key={idx} className={
                                issue.severity === 'error' 
                                  ? 'text-red-600' 
                                  : issue.severity === 'warning' 
                                    ? 'text-amber-600' 
                                    : 'text-blue-600'
                              }>
                                {issue.message}
                              </li>
                            ))}
                            {estarValidationResults.issues.length > 5 && (
                              <li>...and {estarValidationResults.issues.length - 5} more issues</li>
                            )}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Package generation */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">2. Generate eSTAR Package</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Create an FDA-compliant eSTAR package for submission
                    </p>
                    
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Select
                        value={estarFormat}
                        onValueChange={setEstarFormat}
                        disabled={isGeneratingEstar || !submissionReady}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="zip">ZIP Archive</SelectItem>
                          <SelectItem value="pdf">PDF Document</SelectItem>
                          <SelectItem value="json">JSON Data</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button 
                        onClick={() => generateESTARPackage(estarFormat)}
                        disabled={isGeneratingEstar || !submissionReady}
                        className="w-full sm:w-auto"
                      >
                        {isGeneratingEstar ? (
                          <>Generating<span className="loading ml-2">...</span></>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Generate eSTAR Package
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {/* Download link when available */}
                    {estarGeneratedUrl && (
                      <div className="mt-4">
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertTitle>Package Generated</AlertTitle>
                          <AlertDescription>
                            Your eSTAR package is ready for download.
                            <a 
                              href={estarGeneratedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block mt-2 text-blue-600 hover:underline font-medium"
                            >
                              Download eSTAR Package
                            </a>
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
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
  
  const renderContent = () => {
    // If 510k document type is selected, show integrated 510k content
    if (documentType === '510k') {
      // Show document intelligence tab if active
      if (activeTab === 'document-intelligence') {
        return (
          <div className="p-4 space-y-4">
            <DocumentIntakePanel
              onExtractComplete={(data) => {
                setExtractedData(data);
                setIsExtracting(false);
                // If data contains device profile information and we don't have a device profile yet,
                // we can pre-populate the device profile form with this information
                if (data && !deviceProfile) {
                  // Create a stub deviceProfile with extracted data
                  const extractedProfile = {
                    deviceName: data.deviceName || '',
                    description: data.description || '',
                    manufacturer: data.manufacturer || '',
                    regulatoryClass: data.regulatoryClass || 'Class II',
                    intendedUse: data.indications || '',
                    // Add any other fields that might be extracted
                  };
                  
                  // Update device profile with extracted data
                  setDeviceProfile(extractedProfile);
                  
                  toast({
                    title: "Data Extracted Successfully",
                    description: "Device information has been extracted and is ready for review.",
                    variant: "success",
                  });
                }
              }}
              processedDocuments={processedDocuments}
              setProcessedDocuments={setProcessedDocuments}
              isExtracting={isExtracting}
              setIsExtracting={setIsExtracting}
            />
          </div>
        );
      }
      
      // Show device profile tab if active
      if (activeTab === 'device-profile') {
        return (
          <div className="p-4 space-y-4">
            <DeviceProfileForm 
              projectId={k510DocumentId || 'new-device'} 
              initialData={deviceProfile}
              onSubmit={(savedProfile) => {
                console.log('Device profile saved with vault integration:', savedProfile);
                // Update the device profile in state
                setDeviceProfile(savedProfile);
                
                // If the profile has a Document Vault structure, we can proceed to next steps
                if (savedProfile.folderStructure && savedProfile.folderStructure.rootFolderId) {
                  // Set the document ID from the saved profile
                  setK510DocumentId(savedProfile.id);
                  
                  // Transition to the predicate finder step with the new profile
                  setActiveTab('predicates');
                  setWorkflowStep(1);
                }
              }}
              onCancel={() => {
                // Return to previous tab or dashboard
                setActiveTab('dashboard');
              }}
            />
          </div>
        );
      }
      // Otherwise show the step-based workflow content
      return (
        <div className="p-4 space-y-4">
          {render510kProgressBar()}
          {render510kStepContent()}
        </div>
      );
    }
    
    // Special handling for equivalence tab outside of workflow steps
    else if (activeTab === 'equivalence') {
      // Make sure UI shows we're in this tab regardless of workflow state
      console.log('[CERV2 Content] Explicitly rendering Equivalence tab content');
      
      try {
        return (
          <div className="p-4 space-y-4">
            {/* Display literature visualization if literature results exist */}
            {literatureResults.length > 0 && (
              <div className="mb-6">
                <LiteratureVisualizationPanel 
                  literatureData={literatureResults}
                  selectedItems={selectedLiterature}
                  onSelectItem={handleLiteratureSelect}
                  deviceProfile={deviceProfile}
                />
              </div>
            )}
            
            <EquivalenceBuilderPanel 
              deviceProfile={deviceProfile}
              setDeviceProfile={(newProfile) => {
                // Just save the updated device profile
                if (newProfile) {
                  setDeviceProfile(newProfile);
                }
              }}
              documentId={deviceProfile?.id || k510DocumentId}
              onComplete={handleEquivalenceComplete}
              predicateDevices={predicateDevices}
              selectedLiterature={selectedLiterature}
            />
          </div>
        );
      } catch (error) {
        console.error('[CERV2 Content] Error rendering Equivalence tab:', error);
        return (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <h3 className="text-lg font-medium text-red-700">Error Loading Equivalence Tab</h3>
            <p className="mt-2 text-red-600">
              There was an error loading the Substantial Equivalence tab. Please try refreshing the page.
            </p>
            <Button 
              variant="destructive"
              size="sm"
              className="mt-4"
              onClick={() => {
                setActiveTab('predicates');
                setTimeout(() => setActiveTab('equivalence'), 500);
              }}
            >
              Retry Loading
            </Button>
          </div>
        );
      }
    }
    
    // If CER document type is selected
    else if (documentType === 'cer' && activeTab === 'builder') {
      return <CerBuilderPanel cerDocumentId={cerDocumentId} />;
    }
    else if (documentType === 'cer' && activeTab === 'preview') {
      return <CerPreviewPanel cerDocumentId={cerDocumentId} />;
    }
    else if (documentType === 'cer' && activeTab === 'literature') {
      return <LiteratureSearchPanel cerDocumentId={cerDocumentId} manufacturer={manufacturer} deviceName={deviceName} intendedUse={intendedUse} deviceType={deviceType} />;
    }
    else if (documentType === 'cer' && activeTab === 'literature-methodology') {
      return <LiteratureMethodologyPanel cerDocumentId={cerDocumentId} />;
    }
    else if (documentType === 'cer' && activeTab === 'literature-review') {
      return <LiteratureReviewWorkflow cerDocumentId={cerDocumentId} />;
    }
    else if (activeTab === 'compliance') {
      return <ComplianceScorePanel 
        documentId={documentType === 'cer' ? cerDocumentId : k510DocumentId}
        documentType={documentType}
        sections={sections}
        deviceProfile={deviceProfile}
        predicateDevices={predicateDevices}
        equivalenceData={equivalenceData}
      />;
    }
    else if (documentType === 'cer' && activeTab === 'assistant') {
      return <CerAssistantPanel cerDocumentId={cerDocumentId} />;
    }
    else if (documentType === 'cer' && activeTab === 'documents') {
      return <DocumentVaultPanel cerDocumentId={cerDocumentId} />;
    }
    else if (documentType === 'cer' && activeTab === 'data-retrieval') {
      return <CerDataRetrievalPanel cerDocumentId={cerDocumentId} />;
    }
    else if (activeTab === 'equivalence') {
      // Support both CER and 510k document types for the equivalence tab
      return <EquivalenceBuilderPanel 
        deviceProfile={deviceProfile}
        documentId={documentType === 'cer' ? cerDocumentId : k510DocumentId}
        predicateDevices={predicateDevices}
        selectedLiterature={selectedLiterature}
        onComplete={handleEquivalenceComplete}
      />;
    }
    else if (documentType === 'cer' && activeTab === 'sota') {
      return <StateOfArtPanel cerDocumentId={cerDocumentId} />;
    }
    else if (documentType === 'cer' && activeTab === 'cep') {
      return <ClinicalEvaluationPlanPanel cerDocumentId={cerDocumentId} />;
    }
    else if (documentType === 'cer' && activeTab === 'qmp') {
      return <QualityManagementPlanPanel cerDocumentId={cerDocumentId} />;
    }
    else if (documentType === 'cer' && activeTab === 'traceability') {
      return <RegulatoryTraceabilityMatrix cerDocumentId={cerDocumentId} />;
    }
    else if (documentType === 'cer' && activeTab === 'gspr-mapping') {
      return <GSPRMappingPanel cerDocumentId={cerDocumentId} />;
    }
    else if (documentType === 'cer' && activeTab === 'internal-clinical-data') {
      return <InternalClinicalDataPanel cerDocumentId={cerDocumentId} />;
    }
    else if (documentType === 'cer' && activeTab === 'export') {
      return <ExportModule cerDocumentId={cerDocumentId} sections={sections} />;
    }
    else if (documentType === 'cer' && activeTab === 'reports') {
      return <CerComprehensiveReportsPanel cerDocumentId={cerDocumentId} />;
    }
    else if (documentType === 'cer' && activeTab === 'maud') {
      return <MAUDIntegrationPanel cerDocumentId={cerDocumentId} />;
    }
    else if (documentType === 'cer' && activeTab === 'k-automation') {
      return <KAutomationPanel cerDocumentId={cerDocumentId} />;
    }
    else {
      // Default to CER builder panel if no matching tab
      return <CerBuilderPanel cerDocumentId={cerDocumentId} />;
    }
  };

  // Simple navigation tab rendering function
  const renderNavigation = () => {
    // Define 510k specific tab groups if the document type is 510k
    if (documentType === '510k') {
      const k510TabGroups = [
        {
          label: "510(k) Submission:",
          tabs: [
            { id: "device-profile", label: "Device Profile", icon: <FileText className="h-3.5 w-3.5 mr-1.5 text-blue-600" /> },
            { id: "document-intelligence", label: <div className="flex flex-col items-center leading-tight">
              <span>Document Intelligence</span>
              <span className="text-[0.65rem] text-blue-600">AI-Powered Data Extraction</span>
            </div>, icon: <Layers className="h-3.5 w-3.5 mr-1.5 text-blue-600" /> },
            { id: "predicates", label: "Predicate Finder", icon: <Search className="h-3.5 w-3.5 mr-1.5 text-blue-600" /> },
            { id: "equivalence", label: <div className="flex flex-col items-center leading-tight">
              <span>Substantial Equivalence</span>
              <span className="text-[0.65rem] text-blue-600">FDA Requirements</span>
            </div>, icon: <GitCompare className="h-3.5 w-3.5 mr-1.5 text-blue-600" /> },
            { id: "compliance", label: <div className="flex flex-col items-center leading-tight">
              <span>FDA Compliance</span>
              <span className="text-[0.65rem] text-blue-600">510(k) Requirements</span>
            </div>, icon: <CheckSquare className="h-3.5 w-3.5 mr-1.5 text-blue-600" /> },
            { id: "submission", label: <div className="flex items-center">
              <span>Final Submission</span>
              <span className="ml-1.5 bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full shadow-sm">New</span>
            </div>, icon: <FileText className="h-3.5 w-3.5 mr-1.5 text-blue-600" /> }
          ]
        },
        {
          label: "Resources:",
          tabs: [
            { id: "fda-guidance", label: "FDA Guidance", icon: <BookOpen className="h-3.5 w-3.5 mr-1.5 text-green-600" /> },
            { id: "assistant", label: "AI Assistant", icon: <Lightbulb className="h-3.5 w-3.5 mr-1.5 text-amber-500" /> }
          ]
        }
      ];
      
      // Return 510k specific tabs
      return (
        <div className="mt-2 mb-4 border-b border-blue-100">
          <div className="flex overflow-x-auto pb-2 px-6 space-x-6">
            {k510TabGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-2 min-w-fit">
                <div className="text-xs font-medium text-blue-800 flex items-center gap-1.5">
                  {group.label}
                </div>
                <div className="flex space-x-1.5">
                  {group.tabs.map((tab) => (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? 'default' : 'outline'}
                      className={`h-9 px-3 text-xs font-medium rounded ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'text-gray-600 border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                      }`}
                      onClick={() => {
                        setActiveTab(tab.id);
                        // If this is the AI Assistant tab, open the assistant
                        if (tab.id === "assistant") {
                          // Set context information for the assistant (current document type and device info)
                          setModuleContext(
                            documentType === 'cer' ? 'Clinical Evaluation Report' : 'FDA 510(k) Submission', 
                            {
                              documentId: documentType === 'cer' ? cerDocumentId : k510DocumentId,
                              deviceName: deviceName || (documentType === 'cer' ? 'Medical Device' : 'Subject Device'),
                              deviceType: deviceType,
                              manufacturer: manufacturer,
                              intendedUse: intendedUse,
                              documentType: documentType
                            }
                          );
                          // Open the assistant
                          openAssistant();
                        }
                      }}
                    >
                      <span className="flex items-center">
                        {tab.icon}
                        {tab.label}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    // Default CER tab groups
    const tabGroups = [
      {
        label: "Preparation:",
        tabs: [
          { id: "builder", label: "Builder", icon: <FileText className="h-3.5 w-3.5 mr-1.5 text-blue-600" /> },
          { id: "cep", label: "Evaluation Plan", icon: <ClipboardList className="h-3.5 w-3.5 mr-1.5 text-blue-600" /> },
          { id: "qmp", label: <div className="flex flex-col items-center leading-tight">
            <span>Quality Management</span>
            <span className="text-[0.65rem] text-blue-600">ICH E6(R3)</span>
          </div>, icon: <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-blue-600" /> },
          { id: "documents", label: <div className="flex flex-col items-center leading-tight">
            <span>Documents</span>
            <span className="text-[0.65rem] text-blue-600">Validated for GxP</span>
          </div>, icon: <FolderOpen className="h-3.5 w-3.5 mr-1.5 text-blue-600" /> },
          { id: "data-retrieval", label: "Data Retrieval", icon: <Database className="h-3.5 w-3.5 mr-1.5 text-blue-600" /> }
        ]
      },
      {
        label: "Evidence:",
        tabs: [
          { id: "literature", label: "Literature", icon: <BookOpen className="h-3.5 w-3.5 mr-1.5 text-green-600" /> },
          { id: "literature-review", label: "Literature Review", icon: <BookOpen className="h-3.5 w-3.5 mr-1.5 text-green-600" /> },
          { id: "internal-clinical-data", label: "Internal Clinical Data", icon: <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5 text-green-600" /> },
          { id: "sota", label: "State of Art", icon: <BookMarked className="h-3.5 w-3.5 mr-1.5 text-green-600" /> }
        ]
      },
      {
        label: "Analysis:",
        tabs: [
          { id: "equivalence", label: "Equivalence", icon: <GitCompare className="h-3.5 w-3.5 mr-1.5 text-purple-600" /> },
          { id: "gspr-mapping", label: "GSPR Mapping", icon: <BarChart className="h-3.5 w-3.5 mr-1.5 text-purple-600" /> },
          { id: "traceability", label: <div className="flex flex-col items-center leading-tight">
            <span>Regulatory Traceability</span>
            <span className="text-[0.65rem] text-purple-600">EU MDR and FDA</span>
          </div>, icon: <Layers className="h-3.5 w-3.5 mr-1.5 text-purple-600" /> },
          { id: "compliance", label: <div className="flex flex-col items-center leading-tight">
            <span>EU MDR Compliance</span>
            <span className="text-[0.65rem] text-purple-600">CER Requirements</span>
          </div>, icon: <CheckSquare className="h-3.5 w-3.5 mr-1.5 text-purple-600" /> }
        ]
      },
      {
        label: "Output:",
        tabs: [
          { id: "preview", label: "Preview", icon: <FileText className="h-3.5 w-3.5 mr-1.5 text-orange-600" /> },
          { id: "export", label: "Export", icon: <Download className="h-3.5 w-3.5 mr-1.5 text-orange-600" /> },
          { id: "reports", label: "Reports", icon: <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5 text-orange-600" /> },
          { id: "assistant", label: <div className="flex items-center">
            <span>AI Assistant</span>
            <span className="ml-1.5 bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-full shadow-sm">GPT-4o</span>
          </div>, icon: <Lightbulb className="h-3.5 w-3.5 mr-1.5 text-amber-500" /> }
        ]
      },
      {
        label: "Integrations:",
        tabs: [
          { id: "maud", label: <div className="flex flex-col items-center leading-tight">
            <span>MAUD Integration</span>
            <span className="text-[0.65rem] text-teal-600">Adverse Events</span>
          </div>, icon: <Activity className="h-3.5 w-3.5 mr-1.5 text-teal-600" /> },
          { id: "k-automation", label: <div className="flex flex-col items-center leading-tight">
            <span>K-Automation</span>
            <span className="text-[0.65rem] text-teal-600">PMCF/PSUR</span>
          </div>, icon: <Cpu className="h-3.5 w-3.5 mr-1.5 text-teal-600" /> },
          { id: "510k", label: <div className="flex flex-col items-center leading-tight text-center">
            <span>510(k) Automation</span>
            <span className="text-[0.65rem] text-teal-600">FDA Submission</span>
          </div>, icon: <Archive className="h-3.5 w-3.5 mr-1.5 text-teal-600" /> }
        ]
      }
    ];
    
    // Return CER tabs
    return (
      <div className="mt-2 mb-4 border-b border-neutral-100">
        <div className="flex overflow-x-auto pb-2 px-6 space-x-6">
          {tabGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-1 min-w-fit">
              <div className="text-xs font-medium text-gray-600 pl-1">
                {group.label}
              </div>
              <div className="flex space-x-1">
                {group.tabs.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'default' : 'ghost'}
                    className={`h-9 px-2.5 py-1.5 text-xs font-medium rounded-md ${
                      activeTab === tab.id 
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    }`}
                    onClick={() => {
                      setActiveTab(tab.id);
                      // Special case for 510k tab
                      if (tab.id === '510k') {
                        setDocumentType('510k');
                        setActiveTab('predicates');
                      }
                    }}
                  >
                    <span className="flex items-center">
                      {tab.icon}
                      {tab.label}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Helper functions
  const handleExport = async (format) => {
    setIsLoading(true);
    try {
      // Code for export handling
      setExportTimestamp(new Date());
      toast({
        title: `Export ${format.toUpperCase()} Successful`,
        description: "Your Clinical Evaluation Report has been exported.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error.message || "There was an error exporting your CER.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle new client onboarding
  const startNewClientOnboarding = () => {
    setNewClientMode(true);
    setShowWelcomeDialog(true);
  };

  // Function to handle welcome dialog continue
  const handleWelcomeContinue = () => {
    setShowWelcomeDialog(false);
    setShowDeviceIntakeForm(true);
  };

  // Function to handle device intake form submission
  const handleDeviceIntakeSubmit = (data) => {
    setDeviceIntakeData(data);
    setShowDeviceIntakeForm(false);
    
    // Update device profile with intake form data
    setDeviceName(data.deviceName);
    setManufacturer(data.manufacturer);
    setDeviceType(`Class ${data.deviceClass} Medical Device`);
    
    // Set active tab to predicates to start the 510(k) workflow
    setActiveTab('predicates');
    
    toast({
      title: "Device Profile Created",
      description: "Your device profile has been created successfully. You can now proceed with the 510(k) submission process.",
      duration: 5000
    });
  };

  const generateFullCER = async () => {
    setIsGeneratingFullCER(true);
    try {
      // Code for CER generation
      toast({
        title: "CER Generated Successfully",
        description: "Your Clinical Evaluation Report has been generated with all required sections.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "CER Generation Failed",
        description: error.message || "There was an error generating your CER.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingFullCER(false);
    }
  };

  const getWizardStep = (tab) => {
    if (['builder', 'cep', 'qmp', 'documents', 'data-retrieval'].includes(tab)) {
      return 'preparation';
    } else if (['literature', 'literature-review', 'internal-clinical-data', 'sota'].includes(tab)) {
      return 'evidence';
    } else if (['equivalence', 'gspr-mapping', 'compliance', 'assistant'].includes(tab)) {
      return 'analysis';
    } else if (['export'].includes(tab)) {
      return 'export';
    } else {
      return 'output';
    }
  };

  // Handle the change of document type
  const handleSetDocumentType = (type) => {
    setDocumentType(type);
    if (type === 'cer') {
      setActiveTab('builder');
    } else if (type === '510k') {
      setActiveTab('predicates');
    }
  };

  // Displaying Switched Panel banner
  const renderDocumentTypeBanner = () => (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Info className="h-5 w-5 text-blue-500" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-blue-700">
            You are currently working on a <strong>{documentType === 'cer' ? 'Clinical Evaluation Report' : 'FDA 510(k) Submission'}</strong>.
            Switch to {documentType === 'cer' ? 'FDA 510(k) Submission' : 'Clinical Evaluation Report'}?
          </p>
        </div>
        <div className="ml-auto">
          <Button
            variant="outline"
            size="sm"
            className="text-blue-700 border-blue-300 hover:bg-blue-100"
            onClick={() => handleSetDocumentType(documentType === 'cer' ? '510k' : 'cer')}
          >
            Switch to {documentType === 'cer' ? '510(k)' : 'CER'}
          </Button>
        </div>
      </div>
    </div>
  );

  // Render page
  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <header className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {documentType === 'cer' ? 'Clinical Evaluation Report Generator' : 'FDA 510(k) Submission Pipeline'}
              </h1>
              <Badge variant="outline" className="ml-3 px-2 py-0.5 text-xs bg-blue-50 text-blue-700 border border-blue-200">
                {documentType === 'cer' ? cerDocumentId : k510DocumentId}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="default"
                size="sm"
                className="bg-green-600 text-white hover:bg-green-700"
                onClick={() => setActiveTab('device-profile')}
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                New Device Submission
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowDeviceInfoDialog(true)}
                className="flex items-center text-gray-600"
              >
                <FileText className="mr-1.5 h-4 w-4" />
                Device Info
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowDocumentTree(true)}
                className="flex items-center text-gray-600"
              >
                <FolderTree className="mr-1.5 h-4 w-4" />
                Document Vault
              </Button>
              
              <Button 
                variant={activeTab === 'document-intelligence' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('document-intelligence')}
                className={`flex items-center ${activeTab === 'document-intelligence' ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-gray-600'}`}
              >
                <Layers className="mr-1.5 h-4 w-4" />
                Document Intelligence
              </Button>
              
              {documentType === '510k' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => openAssistant()}
                  className="flex items-center text-gray-600"
                >
                  <MessageSquare className="mr-1.5 h-4 w-4" />
                  Open Assistant
                </Button>
              )}
              
              <Button 
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={documentType === 'cer' ? generateFullCER : handleSubmissionReady}
                disabled={documentType === 'cer' ? isGeneratingFullCER : !equivalenceCompleted}
              >
                {documentType === 'cer' ? (
                  <>
                    <ZapIcon className="mr-1.5 h-4 w-4" />
                    {isGeneratingFullCER ? 'Generating...' : 'Generate Full CER'}
                  </>
                ) : (
                  <>
                    <Download className="mr-1.5 h-4 w-4" />
                    Generate FDA Submission
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {renderDocumentTypeBanner()}
      
      <div className="container mx-auto px-6 mt-4">
        {renderNavigation()}
        
        <div className="flex">
          {/* Document Manager - Using real API-based SimpleDocumentTreePanel */}
          {showDocumentTree && (
            <SimpleDocumentTreePanel 
              isOpen={showDocumentTree} 
              onClose={() => setShowDocumentTree(false)}
              documentId={deviceProfile?.id || "default"} 
            />
          )}
          
          <div className={`bg-white rounded-lg border shadow-sm flex-1 ${showDocumentTree ? 'rounded-l-none' : ''}`}>
            {renderContent()}
          </div>
        </div>
      </div>
      
      {/* Welcome Dialog for new client onboarding */}
      <WelcomeDialog 
        open={showWelcomeDialog} 
        onOpenChange={setShowWelcomeDialog}
        onContinue={handleWelcomeContinue}
        documentType={documentType}
      />
      
      {/* Device Intake Form */}
      <DeviceIntakeForm
        open={showDeviceIntakeForm}
        onOpenChange={setShowDeviceIntakeForm}
        onSubmit={handleDeviceIntakeSubmit}
        onCancel={() => setShowDeviceIntakeForm(false)}
      />
    </div>
  );
}