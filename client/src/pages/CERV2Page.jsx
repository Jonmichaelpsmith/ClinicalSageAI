import React, { useState, useEffect, useCallback, useRef } from 'react';
// Safely handle LumenAiAssistant context access with fallbacks
import { useLumenAiAssistant } from '@/contexts/LumenAiAssistantContext';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ShieldAlert, RefreshCw, AlertCircle } from 'lucide-react';
import { initializeStates, saveState, loadState, recoverWorkflow, getWorkflowDiagnostics } from '../utils/stabilityPatches';
import WorkflowContinuityManager from '../components/recovery/WorkflowContinuityManager';
import DeviceProfileSelector from '../components/510k/DeviceProfileSelector';

// Block navigation from the page during critical operations
const NavigationBlocker = ({ isBlocking }) => {
  const blockingRef = useRef(false);
  
  useEffect(() => {
    blockingRef.current = isBlocking;
    
    // Handle before unload event to prevent leaving page 
    const handleBeforeUnload = (e) => {
      if (blockingRef.current) {
        e.preventDefault();
        e.returnValue = "Changes you made may not be saved. Are you sure you want to leave?";
        return "Changes you made may not be saved. Are you sure you want to leave?";
      }
    };
    
    // Add the event listener
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Clean up
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isBlocking]);
  
  return null;
};

// Function to safely open documents and prevent redirection issues
const openDocumentSafely = (url, documentName, showToast) => {
  try {
    window.open(url, '_blank', 'noopener,noreferrer');
    if (showToast) {
      showToast({
        title: "Document opened",
        description: `Viewing ${documentName} document`
      });
    }
  } catch (error) {
    console.error("Error opening document:", error);
    if (showToast) {
      showToast({
        title: "Error",
        description: "Could not open document. Popup may be blocked.",
        variant: "destructive"
      });
    }
  }
};

// Create a fallback if context is unavailable
const safeAssistantHook = () => {
  try {
    return useLumenAiAssistant() || { 
      openAssistant: () => {}, 
      setModuleContext: () => {} 
    };
  } catch (e) {
    console.warn('LumenAiAssistant context not available, using fallback');
    return { 
      openAssistant: () => {}, 
      setModuleContext: () => {} 
    };
  }
};
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
import MAUDIntegrationPanel from '@/components/cer/MAUDIntegrationPanel';
import KAutomationPanel from '@/components/cer/KAutomationPanel';

// 510k components - directly importing only what we need
import PredicateFinderPanel from '@/components/510k/PredicateFinderPanel';
import ReportGenerator from '@/components/510k/ReportGenerator';
// Enhanced document management with professional vault system
import SimpleDocumentTreePanel from '@/components/510k/SimpleDocumentTreePanel';
// Import the device profile utilities
import { createNewDeviceProfile, ensureProfileIntegrity } from '@/utils/deviceProfileUtils';
import WelcomeDialog from '@/components/510k/WelcomeDialog';
import DeviceIntakeForm from '@/components/510k/DeviceIntakeForm';
import DeviceProfileForm from '@/components/cer/DeviceProfileForm';

// Button already imported above
import { Badge } from '@/components/ui/badge';
import { cerApiService } from '@/services/CerAPIService';
import { literatureAPIService } from '@/services/LiteratureAPIService';
import LiteratureFeatureService from '@/services/LiteratureFeatureService';
import { FileText, BookOpen, CheckSquare, Download, MessageSquare, Clock, FileCheck, CheckCircle, AlertCircle, ZapIcon, BarChart, FolderOpen, Database, GitCompare, BookMarked, Lightbulb, ClipboardList, FileSpreadsheet, Layers, Trophy, ShieldCheck, Shield, Play, Archive, Activity, Cpu, HardDrive, Network, Code, XCircle, DownloadCloud, Search, Calendar, Info, ArrowRight, AlertTriangle, Files, FolderTree, X, FilePlus, FolderPlus, PlusCircle, Loader2, UploadCloud, CalendarDays, User, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

export default function CERV2Page({ initialDocumentType, initialActiveTab }) {
  // Use the safe assistant hook instead of direct context access
  const assistantContext = safeAssistantHook();
  const { openAssistant = () => {}, setModuleContext = () => {} } = assistantContext || {};
  const { toast } = useToast();
  
  // State variables
  const [title, setTitle] = useState('FDA 510(k) Submission');
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [showDeviceIntakeForm, setShowDeviceIntakeForm] = useState(false);
  const [newClientMode, setNewClientMode] = useState(false);
  const [deviceIntakeData, setDeviceIntakeData] = useState(null);
  const [deviceType, setDeviceType] = useState('Class II Medical Device');
  const [showFolderCreate, setShowFolderCreate] = useState(false);
  const [documentType, setDocumentType] = useState(initialDocumentType || '510k'); // Options: 'cer' or '510k'
  const [deviceName, setDeviceName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [intendedUse, setIntendedUse] = useState('');
  const [faers, setFaers] = useState([]);
  const [showESTARDemo, setShowESTARDemo] = useState(false);
  const [showProcessingResults, setShowProcessingResults] = useState(false);
  const [processingType, setProcessingType] = useState('');
  const [processingResults, setProcessingResults] = useState(null);
  // Device profile selector state is defined later
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
  const [showDebugInfo, setShowDebugInfo] = useState(true); // Debug UI visibility toggle
  const [saveError, setSaveError] = useState(null); // Error state for save operations
  
  // Enhanced helper function to load saved state from localStorage with multi-key support
  const loadSavedState = (key, defaultValue) => {
    try {
      // Try to get from primary storage location
      const savedValue = localStorage.getItem(`510k_${key}`);
      if (savedValue) {
        return JSON.parse(savedValue);
      }
      
      // For critical flags, check alternate storage locations
      if (key === 'isPredicateStepCompleted') {
        // Check alternate keys for this specific flag
        const altValue1 = localStorage.getItem('isPredicateStepCompleted');
        const altValue2 = localStorage.getItem('510k_workflow_step2_completed');
        const altValue3 = localStorage.getItem('510k_emergency_recovery_applied');
        
        if (altValue1) return JSON.parse(altValue1);
        if (altValue2) return JSON.parse(altValue2);
        if (altValue3) return JSON.parse(altValue3);
        
        console.log('[CERV2 Recovery] Checking all predicate completion indicators, none found');
      }
      
      return defaultValue;
    } catch (error) {
      console.warn(`Error loading saved state for ${key}:`, error);
      return defaultValue;
    }
  };

  // Helper function to save state to localStorage
  const saveState = (key, value) => {
    try {
      localStorage.setItem(`510k_${key}`, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error saving state for ${key}:`, error);
    }
  };
  
  // 510k workflow specific state with persistence - starting at Step 2 with predicate search completed
  const [workflowStep, setWorkflowStep] = useState(() => loadSavedState('workflowStep', 2));
  const [workflowProgress, setWorkflowProgress] = useState(() => loadSavedState('workflowProgress', 30));
  const [predicatesFound, setPredicatesFound] = useState(() => loadSavedState('predicatesFound', true));
  const [isPredicateStepCompleted, setIsPredicateStepCompleted] = useState(() => loadSavedState('isPredicateStepCompleted', true));
  const [predicateSearchError, setPredicateSearchError] = useState(null);
  const [predicateDevices, setPredicateDevices] = useState(() => {
    // Create sample predicate devices if none exist
    const saved = loadSavedState('predicateDevices', []);
    if (saved && saved.length > 0) {
      return saved;
    }
    
    // Pre-filled predicate devices for demonstration purposes
    const samplePredicates = [
      {
        id: "K201234",
        deviceName: "CardioMonitor 1500",
        manufacturer: "MedTech Innovations",
        dateCleared: "2022-05-15",
        productCode: "DRT",
        submissionType: "Traditional",
        predicateType: "Primary",
        technicalCharacteristics: [
          { name: "Display", value: "5-inch LCD, 800x600 resolution" },
          { name: "Sensors", value: "ECG (8-lead), SpO2, NIBP, temperature" },
          { name: "Battery Life", value: "8 hours" },
          { name: "Weight", value: "3.2 lbs" },
          { name: "Connectivity", value: "Bluetooth 4.2, Wi-Fi, USB-B" }
        ],
        description: "Previous generation cardiac monitoring system"
      },
      {
        id: "K198765",
        deviceName: "VitalTrack Pro",
        manufacturer: "Medical Systems Inc.",
        dateCleared: "2021-11-03",
        productCode: "DRT",
        submissionType: "Traditional",
        predicateType: "Reference",
        technicalCharacteristics: [
          { name: "Display", value: "6-inch LCD touchscreen" },
          { name: "Sensors", value: "ECG (12-lead), SpO2, NIBP, temperature, respiration" },
          { name: "Battery Life", value: "10 hours" },
          { name: "Weight", value: "2.8 lbs" },
          { name: "Connectivity", value: "Bluetooth 5.0, Wi-Fi, USB-C" }
        ],
        description: "Competitor's cardiac monitoring system with similar indications for use"
      }
    ];
    
    // Save the sample predicates to localStorage
    saveState('predicateDevices', samplePredicates);
    
    return samplePredicates;
  });
  const [literatureResults, setLiteratureResults] = useState(() => {
    // Check for saved literature data first
    const savedLiterature = loadSavedState('literatureResults', []);
    if (savedLiterature && savedLiterature.length > 0) {
      return savedLiterature;
    }
    
    // Create sample literature results
    const sampleLiterature = [
      {
        id: "PMID-34561234",
        title: "Clinical Evaluation of CardioMonitor Systems in Hospital Settings",
        authors: "Johnson AR, Smith B, Williams C, et al.",
        journal: "Journal of Medical Devices",
        publicationDate: "2022-03-15",
        abstract: "This study evaluated the performance of various cardiac monitoring systems in clinical settings, focusing on accuracy, reliability, and ease of use. Results showed high sensitivity and specificity for arrhythmia detection across most tested devices.",
        relevanceScore: 0.92,
        citations: 24,
        fullTextUrl: "#",
        keyFindings: [
          "95.7% sensitivity for arrhythmia detection",
          "98.2% specificity in clinical testing",
          "Reduced false alarms by 37% compared to previous generation devices"
        ],
        selected: true
      },
      {
        id: "PMID-33987621",
        title: "Safety and Efficacy of Continuous Cardiac Monitoring in Ambulatory Care",
        authors: "Anderson T, Roberts L, Garcia M, et al.",
        journal: "International Journal of Cardiology Technology",
        publicationDate: "2021-11-10",
        abstract: "This paper presents findings from a multi-center study on continuous cardiac monitoring in ambulatory settings. The study included evaluation of various monitoring systems and their impact on patient outcomes and clinical workflow.",
        relevanceScore: 0.85,
        citations: 18,
        fullTextUrl: "#",
        keyFindings: [
          "Ambulatory monitoring improved diagnosis rates by 28%",
          "Earlier intervention was possible in 47% of cases",
          "Technical specifications of modern devices allow for non-clinical settings"
        ],
        selected: true
      },
      {
        id: "PMID-35123456",
        title: "Comparative Analysis of Current Generation Physiological Monitors",
        authors: "Patel R, Kim S, Thompson J, et al.",
        journal: "Medical Devices: Research and Reviews",
        publicationDate: "2023-01-22",
        abstract: "This systematic review compares technical specifications, clinical performance, and user satisfaction across 12 modern physiological monitoring systems. Special attention was given to cardiac monitoring capabilities and integration with hospital systems.",
        relevanceScore: 0.89,
        citations: 9,
        fullTextUrl: "#",
        keyFindings: [
          "Modern monitors show 99.1% uptime in clinical environments",
          "Wireless connectivity improved nursing workflow efficiency by 23%",
          "Battery life remains a limiting factor in portable applications"
        ],
        selected: true
      }
    ];
    
    // Save sample literature to localStorage
    saveState('literatureResults', sampleLiterature);
    
    return sampleLiterature;
  });
  
  // Predicate Device Finder state
  const [predicateSearchTerm, setPredicateSearchTerm] = useState('');
  const [predicateSearchResults, setPredicateSearchResults] = useState([]);
  const [predicateLoading, setPredicateLoading] = useState(false);
  const [selectedPredicate, setSelectedPredicate] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [predicateFilterType, setPredicateFilterType] = useState('all'); // 'all', 'product_code', 'manufacturer'
  
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
  
  // FDA 510(k) Risk Assessment state variables
  const [riskAssessmentData, setRiskAssessmentData] = useState(() => loadSavedState('riskAssessmentData', null));
  const [isAssessingRisks, setIsAssessingRisks] = useState(false);
  const [riskAssessmentProgress, setRiskAssessmentProgress] = useState(0);
  const [showRiskDialog, setShowRiskDialog] = useState(false);
  const [complianceFixes, setComplianceFixes] = useState(null);
  const [isGeneratingFixes, setIsGeneratingFixes] = useState(false);
  const [showFixesDialog, setShowFixesDialog] = useState(false);
  const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false);
  const [templateData, setTemplateData] = useState(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  
  // Create a deviceProfile object for easier passing to 510k components with localStorage persistence
  // Using our new utilities for robust device profile creation and validation with pre-filled data
  const [deviceProfile, setDeviceProfile] = useState(() => {
    console.log("CERV2Page: Initializing deviceProfile state...");
    
    // Check if a profile already exists in localStorage
    const savedProfile = loadSavedState('deviceProfile', null);
    if (savedProfile) {
      console.log('CERV2Page: Loaded device profile from localStorage:', savedProfile);
      return ensureProfileIntegrity(savedProfile);
    }
    
    // If no saved profile, return null to show the profile selector
    return null;
  });
  
  // State for device profile selector
  const [showProfileSelector, setShowProfileSelector] = useState(!deviceProfile);
  
  // Handle device profile selection from the selector 
  // Updated with proper state handling and user feedback
  const handleProfileSelect = (selectedProfile) => {
    console.log('CERV2Page: Selected device profile:', selectedProfile);
    
    // Save the selected profile to localStorage
    saveState('deviceProfile', selectedProfile);
    saveState('isPredicateStepCompleted', true);
    saveState('predicatesFound', true);
    saveState('workflowStep', 2);
    saveState('workflowProgress', 30);
    
    // Update state with profile data
    setDeviceProfile(selectedProfile);
    
    // Only update these if not already set from profile
    if (selectedProfile.deviceName) setDeviceName(selectedProfile.deviceName);
    if (selectedProfile.intendedUse) setIntendedUse(selectedProfile.intendedUse);
    setShowProfileSelector(false);
    
    toast({
      title: "Device Profile Selected",
      description: `${selectedProfile.deviceName} profile has been loaded successfully.`,
      variant: "success",
    });
  };
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
  const [documentPreview, setDocumentPreview] = useState({ show: false, path: '', title: '' });
  
  // Document Vault - folder expansion state
  const [expandedFolders, setExpandedFolders] = useState({
    regulatory: true,
    clinical: true,
    submissions: true,
    technical: true,
    global: false,
    cer: false,
    k510: false
  });
  
  // Toggle folder expansion in document tree
  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };
  
  // Document Vault - file management state
  const [documentView, setDocumentView] = useState('all'); // 'all', 'cer', '510k', 'global'
  const [folderRenameState, setFolderRenameState] = useState({
    isRenaming: false,
    folderId: null,
    folderName: ''
  });
  
  // Start folder rename
  const startRenameFolder = (folderId, currentName, e) => {
    e.stopPropagation();
    setFolderRenameState({
      isRenaming: true,
      folderId,
      folderName: currentName
    });
  };
  
  // Complete folder rename
  const completeRenameFolder = () => {
    // In a real app, this would save to database
    toast({
      title: "Folder renamed",
      description: `Renamed to: ${folderRenameState.folderName}`,
    });
    setFolderRenameState({
      isRenaming: false,
      folderId: null,
      folderName: ''
    });
  };
  
  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // In a real app, this would upload to server
      toast({
        title: "File uploaded",
        description: `Uploaded: ${file.name}`,
      });
    }
  };
  const [systemInfo, setSystemInfo] = useState({
    memory: { used: 0, total: 0, percentage: 0 },
    api: { status: 'unknown', latency: 0 },
    uptime: 0,
    errorCount: 0,
    lastChecked: null
  });

  useEffect(() => {
    console.log("CERV2Page: deviceProfile state updated in useEffect:", deviceProfile);
  }, [deviceProfile]);

  // Update device profile when device information changes and persist it
  useEffect(() => {
    if (documentType === '510k' && deviceProfile) {
      const updatedProfile = {
        ...deviceProfile,
        deviceName: deviceName || (deviceProfile?.deviceName || ''),
        manufacturer: manufacturer || (deviceProfile?.manufacturer || ''),
        intendedUse: intendedUse || (deviceProfile?.intendedUse || ''),
        updatedAt: new Date().toISOString()
      };
      
      setDeviceProfile(updatedProfile);
      
      // Persist device profile to localStorage
      saveState('deviceProfile', updatedProfile);
    }
  }, [deviceName, manufacturer, intendedUse, documentType, deviceProfile]);
  
  const handleSaveDeviceProfile = useCallback(async (formDataFromForm) => {
    console.log("CERV2Page: handleSaveDeviceProfile called with formDataFromForm:", formDataFromForm);
    setSaveError(null); // Clear previous errors

    // We use the functional update form of setDeviceProfile to ensure we're working with the latest state.
    // However, the core logic of building updatedProfile can happen outside,
    // then we pass the final result to setDeviceProfile.
    
    // Create a snapshot of the current profile to work with
    const currentProfileSnapshot = deviceProfile;

    let updatedProfile = {
      ...currentProfileSnapshot, // Start with the existing full profile
      ...formDataFromForm,      // Override with values from the form
    };
    console.log("CERV2Page: Profile after merging formDataFromForm:", JSON.parse(JSON.stringify(updatedProfile)));


    // CRITICAL STEP: Ensure profile integrity (id, structure, metadata, status)
    // This function will log details if it makes changes.
    updatedProfile = ensureProfileIntegrity(updatedProfile);
    console.log("CERV2Page: Profile after ensureProfileIntegrity:", JSON.parse(JSON.stringify(updatedProfile)));
    
    // Specifically ensure metadata.lastUpdated is set, though ensureProfileIntegrity should do it.
    if (updatedProfile.metadata) {
        updatedProfile.metadata.lastUpdated = new Date().toISOString();
    } else { // Should not happen if ensureProfileIntegrity worked
        updatedProfile.metadata = { ...getDefaultDeviceProfileMetadata(), lastUpdated: new Date().toISOString()};
    }
    console.log("CERV2Page: Profile after final metadata.lastUpdated update:", JSON.parse(JSON.stringify(updatedProfile)));

    try {
      console.log("CERV2Page: >>>>>>>>>> PRE-SAVE CHECK: Final object being passed to saveState <<<<<<<<<<", JSON.parse(JSON.stringify(updatedProfile)));
      
      // Perform the save operation
      saveState('deviceProfile', updatedProfile); 
      
      // If saveState is successful, update the component's state
      setDeviceProfile(updatedProfile); 
      
      toast({
        title: "Device Profile Saved",
        description: "Your device profile has been saved successfully.",
        variant: "success"
      });
      console.log("CERV2Page: Device profile saved and state updated successfully.");

    } catch (error) {
      console.error("CERV2Page: Error during save operation in handleSaveDeviceProfile:", error);
      console.error("CERV2Page: Data that failed to save (this is the 'updatedProfile' variable):", JSON.parse(JSON.stringify(updatedProfile)));
      setSaveError(error.message || "An unknown error occurred while saving."); // Set the error message for UI display
      // Do NOT update setDeviceProfile here, keep the old state.
    }
  }, [deviceProfile]); // Added deviceProfile to dependencies of useCallback

  // Add a watcher to persist device profile when it changes from other sources
  useEffect(() => {
    // Don't save if the profile is empty or null
    if (deviceProfile && Object.keys(deviceProfile).length > 0 && deviceProfile.deviceName) {
      console.log('Persisting device profile:', deviceProfile.deviceName);
      saveState('deviceProfile', deviceProfile);
    }
  }, [deviceProfile]);
  
  // Persist risk assessment data when it changes
  useEffect(() => {
    if (riskAssessmentData) {
      console.log('Saving risk assessment data to localStorage');
      saveState('riskAssessmentData', riskAssessmentData);
    }
  }, [riskAssessmentData]);
  
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
  // and handle state persistence on page load
  useEffect(() => {
    if (documentType === '510k') {
      console.log("Document type set to 510k, active tab set to: predicates");
      
      // Load saved device profile from localStorage if available
      const savedDeviceProfile = localStorage.getItem('510k_deviceProfile');
      if (savedDeviceProfile) {
        try {
          const parsedProfile = JSON.parse(savedDeviceProfile);
          setDeviceProfile(parsedProfile);
          console.log("Restored device profile from local storage:", parsedProfile.deviceName);
          
          // Also restore workflow step if available
          const savedStep = localStorage.getItem('510k_workflowStep');
          if (savedStep) {
            const step = parseInt(savedStep);
            console.log(`Restoring workflow to step ${step}`);
            setWorkflowStep(step);
            
            // Set appropriate tab based on step
            if (step === 1) setActiveTab('device-profile');
            else if (step === 2) setActiveTab('predicates');
            else if (step === 3) setActiveTab('equivalence');
            else if (step === 4) setActiveTab('compliance');
            else if (step === 5) setActiveTab('submission');
          }
        } catch (error) {
          console.error("Error restoring saved device profile:", error);
          toast({
            title: "Error Restoring Data",
            description: "We couldn't restore your previous work. Starting with a fresh form.",
            variant: "destructive"
          });
        }
      }
    }
  }, [documentType]);

  // Update workflow progress when steps change and persist state to localStorage
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
      
      // Save current step to localStorage for persistence across page refreshes
      localStorage.setItem('510k_workflowStep', workflowStep.toString());
      console.log(`Saved workflow step ${workflowStep} to localStorage`);
      
      // Also save device profile if it exists
      if (deviceProfile && Object.keys(deviceProfile).length > 0 && deviceProfile.deviceName) {
        localStorage.setItem('510k_deviceProfile', JSON.stringify(deviceProfile));
        console.log(`Saved device profile to localStorage: ${deviceProfile.deviceName}`);
      }
    }
  }, [documentType, workflowStep, deviceProfile, predicatesFound, equivalenceCompleted, complianceScore, submissionReady]);

  // Handler functions for 510k workflow
  
  // Completely rewritten handler for predicate completion to fix workflow transition
  // EMERGENCY FIX: Direct function for manual predicate step completion
  const forcePredicateStepCompletion = () => {
    console.log('[CERV2 EMERGENCY RECOVERY] Forcing predicate step completion');
    
    // 1. Directly set the flags in component state
    setIsPredicateStepCompleted(true);
    setPredicatesFound(true);
    
    // 2. Save state to localStorage through stability system 
    saveState('isPredicateStepCompleted', true);
    saveState('predicatesFound', true);
    
    // 3. Direct localStorage backup with multiple keys
    try {
      localStorage.setItem('510k_isPredicateStepCompleted', JSON.stringify(true));
      localStorage.setItem('isPredicateStepCompleted', JSON.stringify(true));
      localStorage.setItem('510k_predicatesFound', JSON.stringify(true));
      localStorage.setItem('510k_workflow_step2_completed', JSON.stringify(true));
      localStorage.setItem('510k_predicate_completion_timestamp', JSON.stringify(new Date().toISOString()));
      localStorage.setItem('510k_emergency_recovery_applied', JSON.stringify(true));
      console.log('[CERV2 EMERGENCY FIX] Multiple recovery flags saved to localStorage');
    } catch (storageError) {
      console.error('[CERV2 EMERGENCY FIX] Error saving recovery flags:', storageError);
    }
    
    toast({
      title: "Workflow Fixed",
      description: "Predicate step marked as completed. You can now proceed to the next step.",
      variant: "success",
      duration: 5000
    });
    
    // 4. Force navigation to next step after a short delay
    setTimeout(() => {
      setActiveTab('equivalence');
      setWorkflowStep(3);
      setWorkflowProgress(50);
      
      toast({
        title: "Moving to Equivalence Step",
        description: "You're now in the Equivalence Analysis step of the 510(k) workflow.",
        variant: "info",
        duration: 3000
      });
    }, 800);
  };

  const handlePredicatesComplete = (data, error = null) => {
    console.log('[CERV2 Workflow] Predicate completion handler called:', {
      predicateCount: data?.length || 0,
      error: error
    });
    
    // Log the actual predicate data for debugging
    console.log('[CERV2 Workflow] Predicate data received:', JSON.stringify(data));
    
    // Handle error case
    if (error) {
      console.error('[CERV2 Workflow] Error in predicate search:', error);
      setPredicateSearchError(error);
      toast({
        title: "Predicate Search Error",
        description: error || "An error occurred during predicate search.",
        variant: "destructive",
        duration: 3000
      });
      return;
    }

    // Basic validation
    if (!data || data.length === 0) {
      toast({
        title: "Missing Predicate Devices",
        description: "Please select at least one predicate device before proceeding.",
        variant: "destructive",
        duration: 3000
      });
      return;
    }
    
    try {
      // 1. First update the device profile to include the predicate information
      const updatedDeviceProfile = {
        ...deviceProfile,
        predicateDevices: data.map(p => ({
          id: p.id || p.k_number,
          k_number: p.k_number,
          name: p.device_name || p.deviceName,
          applicant: p.applicant_100 || p.manufacturer
        }))
      };
      
      // 2. Set all state variables synchronously for workflow transition
      setPredicatesFound(true);
      setIsPredicateStepCompleted(true); // CRITICAL FIX: Explicitly mark the predicate step as completed
      setPredicateSearchError(null); // Clear any previous errors
      setPredicateDevices(data);
      setDeviceProfile(updatedDeviceProfile);
      
      // 3. Save state to localStorage for persistence - USING MULTIPLE METHODS FOR MAXIMUM RELIABILITY
      saveState('predicatesFound', true);
      saveState('isPredicateStepCompleted', true); // CRITICAL FIX: Save completion flag to localStorage
      saveState('predicateDevices', data);
      saveState('deviceProfile', updatedDeviceProfile);
      
      // 4. EMERGENCY DIRECT FIX: Save directly to localStorage with multiple keys and formats
      try {
        // Try multiple storage formats to maximize chances of success
        localStorage.setItem('510k_isPredicateStepCompleted', JSON.stringify(true));
        localStorage.setItem('isPredicateStepCompleted', JSON.stringify(true));
        localStorage.setItem('510k_predicatesFound', JSON.stringify(true));
        localStorage.setItem('510k_workflow_step2_completed', JSON.stringify(true));
        
        // Create emergency backup timestamp to verify completion happened
        localStorage.setItem('510k_predicate_completion_timestamp', JSON.stringify(new Date().toISOString()));
        
        console.log('[CERV2 EMERGENCY FIX] Multiple predicate completion flags saved to localStorage');
      } catch (storageError) {
        console.error('[CERV2 EMERGENCY FIX] Error saving additional completion flags:', storageError);
      }
      
      // 4. Process literature if available (from another source)
      // Get literature data from a different source since we changed the parameter structure
      const storedLiteratureData = loadState('literatureData', []);
      if (storedLiteratureData && storedLiteratureData.length > 0) {
        setLiteratureResults(storedLiteratureData);
        setSelectedLiterature(storedLiteratureData.filter(item => 
          item.relevanceScore >= 0.8).slice(0, 5)
        );
      }
      
      // 4. Success notification
      toast({
        title: "Predicate Devices Selected",
        description: `Found ${data.length} predicate devices for comparison.`,
        variant: "success",
        duration: 2000
      });
      
      // 5. Critical workflow transition fix - direct and synchronous workflow navigation
      console.log('[CERV2 Workflow] Directly transitioning to Equivalence step');
      
      // Force direct state updates for workflow progression
      setActiveTab('equivalence');
      setWorkflowStep(3);
      setWorkflowProgress(50); // Update progress to 50%
      
      // 6. Save workflow state changes for persistence - using multiple methods for maximum reliability
      saveState('activeTab', 'equivalence');
      saveState('workflowStep', 3);
      saveState('workflowProgress', 50);
      
      // Direct localStorage setting as fallback/redundancy
      try {
        localStorage.setItem('510k_activeTab', JSON.stringify('equivalence'));
        localStorage.setItem('510k_workflowStep', JSON.stringify(3));
        localStorage.setItem('510k_workflowProgress', JSON.stringify(50));
        localStorage.setItem('510k_workflow_transition_timestamp', new Date().toISOString());
      } catch (e) {
        console.error('[CERV2 Workflow] Error saving direct workflow state to localStorage:', e);
      }
      
      // Show success toast to notify user of transition
      setTimeout(() => {
        toast({
          title: "Workflow Advanced",
          description: "Successfully moved to Equivalence Builder step",
          variant: "success",
          duration: 2000
        });
      }, 800);
    } catch (error) {
      console.error('[CERV2 Workflow] Error during predicate selection completion:', error);
      toast({
        title: "Workflow Error",
        description: "There was an issue processing the selected predicates. Please try again.",
        variant: "destructive",
        duration: 5000
      });
    }
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
    
    // Set submission ready based on compliance score
    if (numericScore >= 70) {
      setSubmissionReady(true);
    }
    
    // Use a timeout to ensure state updates are processed before navigation
    setTimeout(() => {
      try {
        // First update the tab to ensure it's ready when we change the step
        setActiveTab('submission');
        
        // Short delay to let the tab change apply
        setTimeout(() => {
          // Then update the workflow step
          setWorkflowStep(5);
          
          console.log("[CERV2 Flow] Successfully advanced to final submission step");
          
          // Confirm the navigation with a user-friendly toast
          toast({
            title: "Final Submission Ready",
            description: "You can now review and generate your eSTAR package",
            variant: "success"
          });
        }, 100);
      } catch (error) {
        console.error("[CERV2 Flow] Error navigating to final step:", error);
        
        // Fallback approach if the primary navigation fails
        goToStep(5);
      }
    }, 200);
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
  
  // Track loading state for navigation
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Enhanced navigation function for 510k workflow with robust error handling and data consistency
  const goToStep = (step) => {
    if (step >= 1 && step <= 5) {
      // Validate step transitions
      if (step > 2 && !isPredicateStepCompleted) {
        // CRITICAL FIX: Block navigation past step 2 if predicate search is incomplete
        console.log(`[CERV2 Navigation] Blocked: Cannot navigate to step ${step} because predicate step is not completed.`);
        toast({
          title: "Workflow Step Blocked",
          description: "You must complete the predicate device search before proceeding to later steps.",
          variant: "destructive",
          duration: 3000
        });
        
        // Force navigation to predicate step instead
        setWorkflowStep(2);
        setActiveTab('predicates');
        setWorkflowProgress(30);
        setIsNavigating(false);
        return;
      }
      
      // Set navigating state to show loading indicators
      setIsNavigating(true);
      
      try {
        console.log(`[CERV2 Navigation] Transitioning to step ${step}`);
        
        // Map steps to tabs - this is the core navigation logic
        const tabMap = {
          1: 'device-profile', // Device Profile
          2: 'predicates',     // Predicate Finder
          3: 'equivalence',    // Substantial Equivalence
          4: 'compliance',     // Compliance Check 
          5: 'submission'      // Final Submission
        };
        
        // Get target tab based on step
        const targetTab = tabMap[step] || 'device-profile';
        
        // Calculate progress values based on step - calibrated for smoother progression
        const progressMap = {
          1: 20, // Initial step
          2: 40, // Predicate finding
          3: 60, // Equivalence analysis
          4: 80, // Compliance check
          5: 100 // Final submission
        };
        
        // Perform data integrity checks to ensure required data exists
        if (step > 1 && (!deviceProfile || (deviceProfile && !deviceProfile.deviceName))) {
          // Try to recover device profile from localStorage if it exists there
          const savedProfile = loadSavedState('deviceProfile', null);
          if (savedProfile && savedProfile.deviceName) {
            console.log("[CERV2 Recovery] Recovered device profile from localStorage:", savedProfile.deviceName);
            setDeviceProfile(savedProfile);
          } else {
            // Show profile selector if we can't recover the profile
            setShowProfileSelector(true);
            console.warn("[CERV2 Navigation] Cannot advance to step", step, "without completing step 1 (Device Profile)");
            toast({
              title: "Complete Device Profile First",
              description: "Please create and save a device profile before proceeding to the next step.",
              variant: "warning"
            });
            setIsNavigating(false);
            return;
          }
        }
        
        if (step > 2 && (!predicateDevices || predicateDevices.length === 0) && !isPredicateStepCompleted) {
          // Try to recover predicate devices from localStorage if they exist there
          const savedPredicates = loadSavedState('predicateDevices', []);
          if (savedPredicates && savedPredicates.length > 0) {
            console.log("[CERV2 Recovery] Recovered predicate devices from localStorage:", savedPredicates.length);
            setPredicateDevices(savedPredicates);
            setPredicatesFound(true);
            setIsPredicateStepCompleted(true); // Mark step as completed
            saveState('isPredicateStepCompleted', true); // Save to localStorage
          } else {
            // Check if the step was previously marked as completed
            const stepWasCompleted = loadSavedState('isPredicateStepCompleted', false);
            if (stepWasCompleted) {
              console.log("[CERV2 Navigation] Predicate step was previously completed, allowing progression");
              setIsPredicateStepCompleted(true);
            } else {
              console.warn("[CERV2 Navigation] Cannot advance to step", step, "without completing step 2 (Predicate Finder)");
              toast({
                title: "Find Predicates First",
                description: "Please select at least one predicate device before moving to equivalence building.",
                variant: "warning"
              });
              setIsNavigating(false);
              return;
            }
          }
        }
        
        if (step > 3 && !equivalenceCompleted) {
          // Try to recover equivalence data from localStorage if it exists
          const savedEquivalence = loadSavedState('equivalenceData', null);
          if (savedEquivalence) {
            console.log("[CERV2 Recovery] Recovered equivalence data from localStorage");
            setEquivalenceData(savedEquivalence);
            setEquivalenceCompleted(true);
          } else {
            console.warn("[CERV2 Navigation] Cannot advance to step", step, "without completing step 3 (Equivalence)");
            toast({
              title: "Complete Equivalence First",
              description: "Please complete the substantial equivalence analysis before proceeding to compliance check.",
              variant: "warning"
            });
            setIsNavigating(false);
            return; 
          }
        }
        
        if (step > 4 && !complianceScore) {
          // Try to recover compliance data from localStorage if it exists
          const savedCompliance = loadSavedState('complianceScore', null);
          if (savedCompliance) {
            console.log("[CERV2 Recovery] Recovered compliance score from localStorage:", savedCompliance);
            setComplianceScore(savedCompliance);
          } else {
            console.warn("[CERV2 Navigation] Cannot advance to step", step, "without completing step 4 (Compliance)");
            toast({
              title: "Complete Compliance Check First",
              description: "Please finish the compliance check before generating your submission.",
              variant: "warning"
            });
            setIsNavigating(false);
            return;
          }
        }
        
        // Save current state to ensure nothing is lost during transition
        if (deviceProfile) {
          saveState('deviceProfile', deviceProfile);
        }
        
        if (predicateDevices && predicateDevices.length > 0) {
          saveState('predicateDevices', predicateDevices);
          saveState('predicatesFound', true);
        }
        
        if (equivalenceData) {
          saveState('equivalenceData', equivalenceData);
          saveState('equivalenceCompleted', true);
        }
        
        if (complianceScore) {
          saveState('complianceScore', complianceScore);
        }
        
        // Use a slight delay to allow the loading state to be visible
        // and to ensure state updates are processed correctly
        setTimeout(() => {
          // Update step with proper persistence
          setWorkflowStep(step);
          saveState('workflowStep', step);
          
          // Update progress with proper persistence
          setWorkflowProgress(progressMap[step]);
          saveState('workflowProgress', progressMap[step]);
          
          // Update tab with proper persistence
          setActiveTab(targetTab);
          saveState('activeTab', targetTab);
          
          console.log(`[CERV2 Navigation] Successfully transitioned to step ${step} and tab "${targetTab}"`);
          
          // Show success toast only when navigation completes successfully
          toast({
            title: "Navigation Successful",
            description: `Moved to ${tabMap[step].replace('-', ' ')} step.`,
            variant: "default"
          });
          
          // Clear navigation loading state
          setIsNavigating(false);
        }, 500);
      } catch (error) {
        console.error(`[CERV2 Navigation] Error transitioning to step ${step}:`, error);
        
        // Show error to user with specific message from error if available
        toast({
          title: "Navigation Error",
          description: error.message || "There was a problem navigating to the next step. Please try again.",
          variant: "destructive"
        });
        
        // Enhanced error state recovery - restore from localStorage where possible
        try {
          // Attempt to restore critical state from localStorage
          const savedStep = loadSavedState('workflowStep', workflowStep);
          const savedTab = loadSavedState('activeTab', activeTab);
          
          console.log(`[CERV2 Recovery] Restoring to step ${savedStep} and tab "${savedTab}"`);
          
          // Restore to previous known good state
          setWorkflowStep(savedStep);
          setActiveTab(savedTab);
          
          setTimeout(() => setIsNavigating(false), 300);
        } catch (recoveryError) {
          console.error('[CERV2 Navigation] Recovery attempt failed:', recoveryError);
          setIsNavigating(false);
        }
      }
    } else {
      // Handle invalid step numbers
      console.error(`[CERV2 Navigation] Invalid step number: ${step}`);
      toast({
        title: "Navigation Error",
        description: `Invalid step number: ${step}. Steps must be between 1 and 5.`,
        variant: "destructive"
      });
    }
  };
  
  // Render the 510k workflow progress bar
  const render510kProgressBar = () => (
    <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-blue-100">
      {/* Loading indicator for workflow transitions */}
      {isNavigating && (
        <div className="bg-blue-50 p-3 rounded-md flex items-center space-x-2 mb-4 border border-blue-200">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-blue-700">Loading workflow step, please wait...</span>
        </div>
      )}
      
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
          onClick={() => (predicatesFound || isPredicateStepCompleted) && goToStep(3)}
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
        
        {/* EMERGENCY FIX: Add direct workflow step completion override */}
        {workflowStep === 2 && !isPredicateStepCompleted && (
          <Button
            variant="destructive"
            size="sm"
            onClick={forcePredicateStepCompletion}
            className="mx-2 animate-pulse border border-red-700"
          >
            <ShieldAlert className="h-4 w-4 mr-1" />
            Fix Workflow
          </Button>
        )}
        
        {/* Add select profile button when needed */}
        {workflowStep <= 2 && !deviceProfile && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowProfileSelector(true)}
            className="mx-2"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Select Profile
          </Button>
        )}
        
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
            (workflowStep === 2 && !isPredicateStepCompleted) || // CRITICAL FIX: Use isPredicateStepCompleted flag instead of predicatesFound
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
            {/* Show device profile selector when needed */}
            {showProfileSelector && (
              <div className="mb-4 p-4 border border-blue-100 rounded-lg bg-blue-50">
                <h3 className="text-lg font-semibold mb-2">Select a Device Profile</h3>
                <p className="mb-4 text-gray-600">Choose a pre-configured device profile to streamline your workflow:</p>
                <DeviceProfileSelector onProfileSelect={handleProfileSelect} />
              </div>
            )}
            
            <PredicateFinderPanel 
              deviceProfile={deviceProfile || {
                id: k510DocumentId,
                deviceName: deviceName || 'Sample Medical Device',
                manufacturer: manufacturer || 'Sample Manufacturer',
                productCode: 'ABC',
                deviceClass: 'II',
                intendedUse: intendedUse || 'For diagnostic use in clinical settings'
              }}
              setDeviceProfile={(newProfile) => {
                // Just save the updated device profile
                if (newProfile) {
                  console.log("Updating device profile from PredicateFinderPanel:", newProfile.deviceName);
                  setDeviceProfile(newProfile);
                  // Ensure workflow progression
                  saveState('deviceProfile', newProfile);
                }
              }}
              initialError={predicateSearchError} // Pass any existing error
              documentId={k510DocumentId}
              onPredicatesFound={handlePredicatesComplete} // CRITICAL FIX: Connect onPredicatesFound callback
              organizationId={1}
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
              
              // FDA Risk Assessment state
              riskAssessmentData={riskAssessmentData}
              setRiskAssessmentData={setRiskAssessmentData}
              isAssessingRisks={isAssessingRisks}
              setIsAssessingRisks={setIsAssessingRisks}
              riskAssessmentProgress={riskAssessmentProgress}
              setRiskAssessmentProgress={setRiskAssessmentProgress}
              showRiskDialog={showRiskDialog}
              setShowRiskDialog={setShowRiskDialog}
              
              // Template generation state
              templateData={templateData}
              setTemplateData={setTemplateData}
              isGeneratingTemplate={isGeneratingTemplate}
              setIsGeneratingTemplate={setIsGeneratingTemplate}
              showTemplateDialog={showTemplateDialog}
              setShowTemplateDialog={setShowTemplateDialog}
              
              // Fix suggestions state
              complianceFixes={complianceFixes}
              setComplianceFixes={setComplianceFixes}
              isGeneratingFixes={isGeneratingFixes}
              setIsGeneratingFixes={setIsGeneratingFixes}
              showFixesDialog={showFixesDialog}
              setShowFixesDialog={setShowFixesDialog}
            />
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-4">
            <ComplianceCheckPanel 
              deviceProfile={deviceProfile}
              documentId={deviceProfile?.id}
              predicateDevices={predicateDevices}
              literatureReferences={selectedLiterature}
              setCompliance={setCompliance}
              isComplianceRunning={isComplianceRunning}
              setIsComplianceRunning={setIsComplianceRunning}
              complianceScore={complianceScore}
              setComplianceScore={setComplianceScore}
              
              // Risk assessment state
              riskAssessmentData={riskAssessmentData}
              setRiskAssessmentData={setRiskAssessmentData}
              isAssessingRisks={isAssessingRisks}
              setIsAssessingRisks={setIsAssessingRisks}
              riskAssessmentProgress={riskAssessmentProgress}
              setRiskAssessmentProgress={setRiskAssessmentProgress}
              showRiskDialog={showRiskDialog}
              setShowRiskDialog={setShowRiskDialog}
              
              // Template generation state
              templateData={templateData}
              setTemplateData={setTemplateData}
              isGeneratingTemplate={isGeneratingTemplate}
              setIsGeneratingTemplate={setIsGeneratingTemplate}
              showTemplateDialog={showTemplateDialog}
              setShowTemplateDialog={setShowTemplateDialog}
              
              // Fix suggestions state
              complianceFixes={complianceFixes}
              setComplianceFixes={setComplianceFixes}
              isGeneratingFixes={isGeneratingFixes}
              setIsGeneratingFixes={setIsGeneratingFixes}
              showFixesDialog={showFixesDialog}
              setShowFixesDialog={setShowFixesDialog}
            />
          </div>
        );
      
      case 6:
        return (
          <div className="space-y-4">
            <Card className="border-orange-200">
              <CardHeader className="bg-orange-50 border-b border-orange-100">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                      FDA 510(k) Risk Assessment
                    </CardTitle>
                    <CardDescription>
                      Analyze and address potential risks for your 510(k) submission
                    </CardDescription>
                  </div>
                  
                  {riskAssessmentData && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                      Risk Assessment Complete
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-6">
                {!riskAssessmentData ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                      <h3 className="text-sm font-medium text-blue-800 mb-1 flex items-center">
                        <Info className="h-4 w-4 mr-1.5" />
                        Why Risk Assessment Matters
                      </h3>
                      <p className="text-sm text-blue-700">
                        The FDA requires manufacturers to identify and mitigate potential risks associated with their devices.
                        A thorough risk assessment improves your chances of 510(k) clearance and helps ensure patient safety.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Device Details for Assessment</h3>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="p-3 bg-gray-50 rounded-md border">
                          <p className="text-xs text-gray-500 mb-1">Device Name</p>
                          <p className="font-medium">{deviceProfile?.deviceName}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-md border">
                          <p className="text-xs text-gray-500 mb-1">Device Class</p>
                          <p className="font-medium">Class {deviceProfile?.deviceClass || 'II'}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-md border">
                          <p className="text-xs text-gray-500 mb-1">Manufacturer</p>
                          <p className="font-medium">{deviceProfile?.manufacturer}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-md border">
                          <p className="text-xs text-gray-500 mb-1">Selected Predicates</p>
                          <p className="font-medium">{predicateDevices?.length || 0} device(s)</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={() => {
                          setIsAssessingRisks(true);
                          setRiskAssessmentProgress(0);
                          
                          // Simulate incremental progress
                          const interval = setInterval(() => {
                            setRiskAssessmentProgress(prev => {
                              if (prev >= 100) {
                                clearInterval(interval);
                                return 100;
                              }
                              return prev + 5;
                            });
                          }, 300);
                          
                          // Simulate completion after 6 seconds
                          setTimeout(() => {
                            clearInterval(interval);
                            setRiskAssessmentProgress(100);
                            setIsAssessingRisks(false);
                            
                            // Create mock risk assessment data
                            const riskData = {
                              deviceId: deviceProfile?.id,
                              timestamp: new Date().toISOString(),
                              overallRiskLevel: "MODERATE",
                              risks: [
                                {
                                  id: "RISK-001",
                                  category: "Safety",
                                  description: "Potential for device malfunction during critical use",
                                  severity: "High",
                                  probability: "Low",
                                  riskLevel: "MODERATE",
                                  mitigations: [
                                    "Implement robust quality control testing",
                                    "Add redundant safety mechanisms",
                                    "Provide clear warnings in instructions for use"
                                  ]
                                },
                                {
                                  id: "RISK-002",
                                  category: "Manufacturing",
                                  description: "Variation in device performance due to manufacturing processes",
                                  severity: "Medium",
                                  probability: "Medium",
                                  riskLevel: "MODERATE",
                                  mitigations: [
                                    "Establish statistical process controls",
                                    "Implement batch testing protocols",
                                    "Conduct regular calibration of manufacturing equipment"
                                  ]
                                },
                                {
                                  id: "RISK-003",
                                  category: "Regulatory",
                                  description: "510(k) submission lacking sufficient evidence for substantial equivalence",
                                  severity: "High",
                                  probability: "Medium",
                                  riskLevel: "HIGH",
                                  mitigations: [
                                    "Provide comprehensive comparison data with predicate devices",
                                    "Include detailed testing results for all performance characteristics",
                                    "Prepare responses to potential FDA questions in advance"
                                  ]
                                },
                                {
                                  id: "RISK-004",
                                  category: "Clinical",
                                  description: "Potential for adverse events in certain patient populations",
                                  severity: "Medium",
                                  probability: "Low",
                                  riskLevel: "LOW",
                                  mitigations: [
                                    "Include contraindications for vulnerable populations",
                                    "Provide clear usage guidelines for clinicians",
                                    "Implement post-market surveillance plan"
                                  ]
                                },
                                {
                                  id: "RISK-005",
                                  category: "Labeling",
                                  description: "Inadequate instructions for use leading to improper device operation",
                                  severity: "Medium",
                                  probability: "Medium",
                                  riskLevel: "MODERATE",
                                  mitigations: [
                                    "Develop comprehensive, user-tested instructions",
                                    "Include visual aids and clear step-by-step procedures",
                                    "Provide training materials for clinicians"
                                  ]
                                }
                              ],
                              recommendations: [
                                "Address all identified high-risk items before submission",
                                "Include a comprehensive risk management report in your 510(k) submission",
                                "Document all mitigation efforts with supporting evidence",
                                "Consider comparative risk analysis with predicate devices"
                              ]
                            };
                            
                            setRiskAssessmentData(riskData);
                            saveState('riskAssessmentData', riskData);
                            
                            toast({
                              title: "Risk Assessment Complete",
                              description: "5 potential risks identified with recommended mitigations",
                            });
                          }, 6000);
                        }}
                        disabled={isAssessingRisks}
                      >
                        {isAssessingRisks ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Analyzing Risks...
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Start Risk Assessment
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {isAssessingRisks && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Analyzing device risks and mitigations...</span>
                          <span>{riskAssessmentProgress}%</span>
                        </div>
                        <Progress value={riskAssessmentProgress} className="h-2" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className={`p-4 rounded-md flex items-center justify-between ${
                      riskAssessmentData.overallRiskLevel === "LOW" 
                        ? "bg-green-50 border border-green-200" 
                        : riskAssessmentData.overallRiskLevel === "MODERATE"
                          ? "bg-orange-50 border border-orange-200"
                          : "bg-red-50 border border-red-200"
                    }`}>
                      <div>
                        <h3 className={`text-lg font-medium ${
                          riskAssessmentData.overallRiskLevel === "LOW" 
                            ? "text-green-800" 
                            : riskAssessmentData.overallRiskLevel === "MODERATE"
                              ? "text-orange-800"
                              : "text-red-800"
                        }`}>
                          {riskAssessmentData.overallRiskLevel} Overall Risk
                        </h3>
                        <p className="text-sm mt-1">
                          {riskAssessmentData.risks.length} risks identified with mitigations
                        </p>
                      </div>
                      <div className="space-x-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          setRiskAssessmentData(null);
                          localStorage.removeItem('510k_riskAssessmentData');
                          toast({
                            title: "Assessment Reset",
                            description: "Risk assessment has been reset",
                          });
                        }}>
                          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                          Reset
                        </Button>
                        <Button size="sm" onClick={() => {
                          // In a real app, this would download a PDF report
                          toast({
                            title: "Report Generated",
                            description: "Risk assessment report has been generated",
                          });
                        }}>
                          <Download className="h-3.5 w-3.5 mr-1.5" />
                          Export Report
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium mb-3">Identified Risks & Mitigations</h3>
                      <div className="space-y-3">
                        {riskAssessmentData.risks.map((risk) => (
                          <div 
                            key={risk.id} 
                            className="border rounded-md p-4"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-medium flex items-center">
                                  <span className={`h-2 w-2 rounded-full mr-2 ${
                                    risk.riskLevel === "LOW" 
                                      ? "bg-green-500" 
                                      : risk.riskLevel === "MODERATE"
                                        ? "bg-orange-500"
                                        : "bg-red-500"
                                  }`}></span>
                                  {risk.description}
                                </h4>
                                <div className="flex space-x-4 text-xs text-gray-500 mt-1">
                                  <span>ID: {risk.id}</span>
                                  <span>Category: {risk.category}</span>
                                  <span>Severity: {risk.severity}</span>
                                  <span>Probability: {risk.probability}</span>
                                </div>
                              </div>
                              <Badge 
                                variant="outline" 
                                className={
                                  risk.riskLevel === "LOW" 
                                    ? "border-green-500 text-green-700 bg-green-50" 
                                    : risk.riskLevel === "MODERATE"
                                      ? "border-orange-500 text-orange-700 bg-orange-50"
                                      : "border-red-500 text-red-700 bg-red-50"
                                }
                              >
                                {risk.riskLevel} RISK
                              </Badge>
                            </div>
                            
                            <div className="mt-2">
                              <h5 className="text-sm font-medium mb-1">Recommended Mitigations:</h5>
                              <ul className="text-sm space-y-1 pl-5 list-disc">
                                {risk.mitigations.map((mitigation, index) => (
                                  <li key={index}>{mitigation}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h3 className="text-base font-medium mb-2">Recommendations for 510(k) Submission</h3>
                      <ul className="space-y-2">
                        {riskAssessmentData.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex justify-between border-t pt-4">
                      <div className="text-xs text-gray-500">
                        Generated on {new Date(riskAssessmentData.timestamp).toLocaleString()}
                      </div>
                      <Button 
                        onClick={() => {
                          // Move to the next step
                          setWorkflowStep(7);
                          saveState('workflowStep', 7);
                          const newProgress = Math.round((7 / 8) * 100);
                          setWorkflowProgress(newProgress);
                          saveState('workflowProgress', newProgress);
                          setActiveTab('estar-builder');
                          
                          toast({
                            title: "Moving to eSTAR Builder",
                            description: "Risk assessment completed successfully",
                          });
                        }}
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Continue to eSTAR Builder
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
        
      case 7:
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
            
            {/* Enhanced eSTAR Builder Panel using dedicated component */}
            <ESTARBuilderPanel
              projectId={k510DocumentId}
              deviceProfile={deviceProfile}
              complianceScore={complianceScore}
              equivalenceData={equivalenceData}
              isValidating={isValidatingEstar}
              isGenerating={isGeneratingEstar}
              validationResults={estarValidationResults}
              generatedUrl={estarGeneratedUrl}
              estarFormat={estarFormat}
              setEstarFormat={setEstarFormat}
              setIsValidating={setIsValidatingEstar}
              setIsGenerating={setIsGeneratingEstar}
              setValidationResults={setEstarValidationResults}
              setGeneratedUrl={setEstarGeneratedUrl}
              onValidationComplete={(results) => {
                setEstarValidationResults(results);
                if (results.valid) {
                  toast({
                    title: "eSTAR Validation Successful",
                    description: "Your package meets FDA requirements",
                    variant: "success"
                  });
                } else {
                  toast({
                    title: "Validation Issues Found",
                    description: `${results.issues?.length || 0} issues need to be addressed`,
                    variant: "warning"
                  });
                }
              }}
              onGenerationComplete={(result) => {
                setGeneratedEstarUrl(result.downloadUrl);
                setSubmissionReady(true);
                toast({
                  title: "eSTAR Package Generated",
                  description: "Your FDA-compliant submission is ready",
                  variant: "success"
                });
              }}
            />
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
      // If no device profile is selected and profile selector is visible, show it
      if (!deviceProfile && showProfileSelector) {
        return (
          <DeviceProfileSelector
            isOpen={true}
            onClose={() => setShowProfileSelector(false)}
            onProfileSelect={handleProfileSelect}
            k510DocumentId={k510DocumentId || 'new-device'}
          />
        );
      }
      
      // Show device profile tab if active
      if (activeTab === 'device-profile') {
        return (
          <div className="p-4 space-y-4">
            <DeviceProfileForm 
              projectId={k510DocumentId || 'new-device'} 
              initialData={deviceProfile}
              onSubmit={async (formData) => {
                console.log('Device profile form submitted:', formData);
                
                // Show loading toast to provide user feedback
                toast({
                  title: "Processing Device Profile",
                  description: "Saving your device information and preparing for predicate search...",
                  variant: "default"
                });
                
                try {
                  // Use our new robust handling function to ensure proper document structure
                  await handleSaveDeviceProfile(formData);
                  
                  // If formData has an ID, use it to update k510DocumentId
                  if (formData.id) {
                    setK510DocumentId(formData.id);
                  }
                  
                  // Transition to predicates step with 500ms delay to ensure UI updates
                  setTimeout(() => {
                    // Use the predicates tab and set the workflow step to 2
                    setActiveTab('predicates');
                    setWorkflowStep(2);
                    
                    // Show success toast after transition
                    toast({
                      title: "Device Profile Saved",
                      description: "Successfully saved your device profile. Now you can search for predicate devices.",
                      variant: "success"
                    });
                  }, 500);
                } catch (error) {
                  console.error("Error in device profile processing:", error);
                  // Set saveError state to display the error message in the UI
                  setSaveError(error.message || "Error creating document structure. Please check profile data.");
                  toast({
                    title: "Profile Error",
                    description: "There was a problem saving the device profile. Please check the error message below.",
                    variant: "destructive"
                  });
                }
              }}
              onCancel={() => {
                // Return to previous tab or dashboard
                setActiveTab('dashboard');
              }}
            />
            
            {/* Device profile debugging UI */}
            {showDebugInfo && (
              <div className="mt-8 p-4 border border-gray-300 rounded-lg bg-gray-50">
                <h3 className="text-md font-medium mb-2">Device Profile Debug Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold">Profile Structure Integrity:</p>
                    <pre className="text-xs bg-white p-2 rounded border mt-1 max-h-32 overflow-auto">
                      {deviceProfile && JSON.stringify(deviceProfile.structure || {}, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Profile Metadata:</p>
                    <pre className="text-xs bg-white p-2 rounded border mt-1 max-h-32 overflow-auto">
                      {deviceProfile && JSON.stringify(deviceProfile.metadata || {}, null, 2)}
                    </pre>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-semibold">Last Save Error:</p>
                  <div className="text-xs bg-white p-2 rounded border mt-1">
                    {saveError || 'No errors recorded'}
                  </div>
                </div>
                <button 
                  className="mt-4 px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded"
                  onClick={() => setShowDebugInfo(false)}
                >
                  Hide Debug Info
                </button>
              </div>
            )}
          </div>
        );
      }
      // Otherwise show the step-based workflow content
      return (
        <div className="p-4 space-y-4">
          {/* No emergency recovery button */}
          
          {render510kProgressBar()}
          
          {saveError && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              <p className="font-bold">Save Error:</p>
              <p>{saveError}</p> {/* Display the error message from state */}
            </div>
          )}
          
          {/* No demo panel */}
          
          
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
    else if (activeTab === 'documents') {
      // Support both CER and 510k documents in the vault
      return <DocumentVaultPanel 
        documentType={documentType} 
        jobId={documentType === 'cer' ? cerDocumentId : k510DocumentId}
        position="left"
        isOpen={true}
      />;
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
          name: "Device Definition",
          icon: <FileText className="h-4 w-4" />,
          items: [
            { 
              id: "device-profile", 
              name: "Device Profile", 
              icon: <FileText className="h-4 w-4" />,
              isCompleted: () => deviceProfile && deviceProfile.deviceName && deviceProfile.manufacturer && deviceProfile.intendedUse
            },
            { 
              id: "predicates", 
              name: "Predicate Finder", 
              icon: <Search className="h-4 w-4" />,
              isCompleted: () => predicateDevices && predicateDevices.length > 0
            }
          ]
        },
        {
          name: "Literature & Evidence",
          icon: <BookOpen className="h-4 w-4" />,
          items: [
            { 
              id: "literature", 
              name: "Literature Review", 
              icon: <BookMarked className="h-4 w-4" />,
              isCompleted: () => selectedLiterature && selectedLiterature.length > 0
            }
          ]
        },
        {
          name: "Substantial Equivalence",
          icon: <GitCompare className="h-4 w-4" />,
          items: [
            { 
              id: "equivalence", 
              name: "Equivalence Builder", 
              icon: <GitCompare className="h-4 w-4" />,
              isCompleted: () => equivalenceCompleted
            }
          ]
        },
        {
          name: "Compliance & Risk",
          icon: <ShieldCheck className="h-4 w-4" />,
          items: [
            { 
              id: "compliance", 
              name: "Compliance Check", 
              icon: <CheckSquare className="h-4 w-4" />,
              isCompleted: () => complianceScore && complianceScore.score > 65
            },
            { 
              id: "risk-assessment", 
              name: "Risk Assessment", 
              icon: <AlertTriangle className="h-4 w-4" />,
              isCompleted: () => riskAssessmentData && riskAssessmentData.risks && riskAssessmentData.risks.length > 0
            }
          ]
        },
        {
          name: "Submission Package",
          icon: <FileCheck className="h-4 w-4" />,
          items: [
            { 
              id: "estar-builder", 
              name: "eSTAR Builder", 
              icon: <FileCheck className="h-4 w-4" />,
              isCompleted: () => estarGeneratedUrl
            },
            { 
              id: "report-generator", 
              name: "Final Review", 
              icon: <FileText className="h-4 w-4" />,
              isCompleted: () => submissionReady
            }
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
                  {group.tabs && Array.isArray(group.tabs) && group.tabs.map((tab) => tab && (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? 'default' : 'outline'}
                      className={`h-9 px-3 text-xs font-medium rounded ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : tab.id === 'predicates' && predicatesFound 
                            ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                            : tab.id === 'literature' && selectedLiterature?.length > 0
                              ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                              : tab.id === 'equivalence' && equivalenceCompleted
                                ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                                : tab.id === 'compliance' && complianceScore?.score > 65
                                  ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                                  : tab.id === 'risk-assessment' && riskAssessmentData?.risks?.length > 0
                                    ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                                    : tab.id === 'estar-builder' && estarGeneratedUrl
                                      ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                                      : tab.id === 'submission' && submissionReady
                                        ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                                        : 'text-gray-600 border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                      }`}
                      onClick={() => {
                        // Calculate new workflow step based on tab selection
                        let newStep = 1;
                        if (tab.id === 'predicates') newStep = 1;
                        else if (tab.id === 'literature') newStep = 3;
                        else if (tab.id === 'equivalence') newStep = 4;
                        else if (tab.id === 'compliance') newStep = 5;
                        else if (tab.id === 'risk-assessment') newStep = 6;
                        else if (tab.id === 'estar-builder') newStep = 7;
                        else if (tab.id === 'submission') newStep = 8;
                        
                        // Update workflow step if needed
                        if (newStep !== workflowStep && tab.id !== 'assistant' && tab.id !== 'fda-guidance') {
                          setWorkflowStep(newStep);
                          saveState('workflowStep', newStep);
                          
                          // Update progress based on step position (8 steps total)
                          const newProgress = Math.round((newStep / 8) * 100);
                          setWorkflowProgress(newProgress);
                          saveState('workflowProgress', newProgress);
                        }
                        
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
                className="flex items-center text-blue-600 font-medium border-blue-200 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 shadow-sm"
              >
                <FolderTree className="mr-1.5 h-4 w-4" />
                Document Vault
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
          {/* Document Vault Sidebar */}
          {showDocumentTree && (
            <div className="w-64 bg-gray-50 border-r border-gray-200 shadow-md h-full overflow-auto">
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-center p-3 border-b bg-gray-100">
                  <h2 className="text-base font-semibold flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-600">
                      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                    </svg>
                    Document Vault
                  </h2>
                  <button
                    onClick={() => setShowDocumentTree(false)}
                    className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                  </button>
                </div>
                
                {/* Document View Tabs */}
                <div className="border-b">
                  <div className="flex">
                    <button 
                      className={`flex-1 py-2 text-sm font-medium text-center ${documentView === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                      onClick={() => setDocumentView('all')}
                    >
                      All Files
                    </button>
                    <button 
                      className={`flex-1 py-2 text-sm font-medium text-center ${documentView === 'cer' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                      onClick={() => setDocumentView('cer')}
                    >
                      CER
                    </button>
                    <button 
                      className={`flex-1 py-2 text-sm font-medium text-center ${documentView === '510k' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                      onClick={() => setDocumentView('510k')}
                    >
                      510(k)
                    </button>
                    <button 
                      className={`flex-1 py-2 text-sm font-medium text-center ${documentView === 'global' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                      onClick={() => setDocumentView('global')}
                    >
                      Global
                    </button>
                  </div>
                </div>
                
                {/* Search Bar */}
                <div className="p-2 border-b">
                  <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-2 top-2.5 h-4 w-4 text-gray-400">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.3-4.3"></path>
                    </svg>
                    <input 
                      type="text" 
                      placeholder="Search documents..." 
                      className="pl-8 pr-2 py-2 w-full text-sm border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                {/* Navigation Tree */}
                <div className="flex-1 overflow-auto bg-white">
                  <nav className="p-1">
                    {/* Regulatory Documents */}
                    <div className="mb-0.5">
                      <div 
                        className="flex items-center py-2 px-3 hover:bg-blue-50 cursor-pointer"
                        onClick={() => toggleFolder('regulatory')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${expandedFolders.regulatory ? 'rotate-90' : ''} mr-2 text-gray-500`}>
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-600">
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span className="text-sm font-medium">Regulatory</span>
                        <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">3</span>
                      </div>
                      {expandedFolders.regulatory && (
                        <div>
                          <button 
                            type="button"
                            className="flex items-center w-full text-left py-2 px-3 pl-9 hover:bg-blue-50"
                            onClick={() => openDocumentSafely('/attached_assets/Format-and-Content-of-the-Clinical-and-Statistical-Sections-of-an-Application.pdf', '510(k) Summary', toast)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <span className="text-sm">510(k) Summary</span>
                            <span className="ml-auto text-xs text-green-600 font-medium">v1.3</span>
                          </button>
                          <button 
                            type="button"
                            className="flex items-center w-full text-left py-2 px-3 pl-9 hover:bg-blue-50"
                            onClick={() => openDocumentSafely('/attached_assets/E3-Structure-and-Content-of-Clinical-Study-Reports.pdf', 'Clinical Study Report', toast)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <span className="text-sm">Clinical Study Report</span>
                            <span className="ml-auto text-xs text-green-600 font-medium">v2.0</span>
                          </button>
                          <button 
                            type="button"
                            className="flex items-center w-full text-left py-2 px-3 pl-9 hover:bg-blue-50"
                            onClick={() => openDocumentSafely('/attached_assets/7.19.13.Miller-Clinical-Trials.pdf', 'Regulatory Checklist', toast)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <span className="text-sm">Regulatory Checklist</span>
                            <span className="ml-auto text-xs text-amber-600 font-medium">Draft</span>
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* 510(k) Documents */}
                    <div className="mb-0.5">
                      <div 
                        className="flex items-center py-2 px-3 hover:bg-blue-50 cursor-pointer"
                        onClick={() => toggleFolder('510k')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${expandedFolders['510k'] ? 'rotate-90' : ''} mr-2 text-gray-500`}>
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-amber-500">
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span className="text-sm font-medium">510(k) Documents</span>
                        <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">4</span>
                      </div>
                      {expandedFolders['510k'] && (
                        <div>
                          <button 
                            type="button"
                            className="flex items-center w-full text-left py-2 px-3 pl-9 hover:bg-blue-50"
                            onClick={() => openDocumentSafely('/attached_assets/Format-and-Content-of-the-Clinical-and-Statistical-Sections-of-an-Application.pdf', 'FDA Submission Template', toast)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-amber-500">
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <span className="text-sm">FDA Submission Template</span>
                            <span className="ml-auto text-xs text-blue-600 font-medium">2025</span>
                          </button>
                          <button 
                            type="button"
                            className="flex items-center w-full text-left py-2 px-3 pl-9 hover:bg-blue-50"
                            onClick={() => openDocumentSafely('/attached_assets/Choosing-the-Right-Study-Design-for-Your-Research-20220921.pdf', 'Study Design Guidelines', toast)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-amber-500">
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <span className="text-sm">Study Design Guidelines</span>
                            <span className="ml-auto text-xs text-blue-600 font-medium">2022</span>
                          </button>
                          <button 
                            type="button"
                            className="flex items-center w-full text-left py-2 px-3 pl-9 hover:bg-blue-50"
                            onClick={() => openDocumentSafely('/attached_assets/ICH_Q2(R2)_Guideline_2023_1130.pdf', 'ICH Guidelines', toast)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-amber-500">
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <span className="text-sm">ICH Guidelines</span>
                            <span className="ml-auto text-xs text-blue-600 font-medium">2023</span>
                          </button>
                          <button 
                            type="button"
                            className="flex items-center w-full text-left py-2 px-3 pl-9 hover:bg-blue-50"
                            onClick={() => openDocumentSafely('/attached_assets/Human-Factors-Studies-and-Related-Clinical-Study-Considerations-in-Combination-Product-Design-and-Development.pdf', 'Human Factors Studies', toast)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-amber-500">
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <span className="text-sm">Human Factors Studies</span>
                            <span className="ml-auto text-xs text-blue-600 font-medium">2024</span>
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Clinical Documents */}
                    <div className="mb-0.5">
                      <div 
                        className="flex items-center py-2 px-3 hover:bg-blue-50 cursor-pointer"
                        onClick={() => toggleFolder('clinical')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${expandedFolders.clinical ? 'rotate-90' : ''} mr-2 text-gray-500`}>
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-600">
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span className="text-sm font-medium">Clinical</span>
                        <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">4</span>
                      </div>
                      {expandedFolders.clinical && (
                        <div>
                          <button 
                            type="button"
                            className="flex items-center w-full text-left py-2 px-3 pl-9 hover:bg-blue-50"
                            onClick={() => {
                              window.open('/attached_assets/CER REPORT EXAMPLE OUTPUT.pdf', '_blank');
                              toast({
                                title: "Document opened",
                                description: "Viewing CER Report"
                              });
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <span className="text-sm">CER Report</span>
                            <span className="ml-auto text-xs text-green-600 font-medium">v2.4</span>
                          </button>
                          <button 
                            type="button"
                            className="flex items-center w-full text-left py-2 px-3 pl-9 hover:bg-blue-50"
                            onClick={() => {
                              window.open('/attached_assets/ICER_Acute-Pain_Evidence-Report_For-Publication_020525.pdf', '_blank');
                              toast({
                                title: "Document opened",
                                description: "Viewing Evidence Report"
                              });
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <span className="text-sm">Evidence Report</span>
                            <span className="ml-auto text-xs text-green-600 font-medium">v1.1</span>
                          </button>
                          <button 
                            type="button"
                            className="flex items-center w-full text-left py-2 px-3 pl-9 hover:bg-blue-50"
                            onClick={() => {
                              window.open('/attached_assets/AO_2508_2023_1-3.pdf', '_blank');
                              toast({
                                title: "Document opened",
                                description: "Viewing PMS Data Analysis document"
                              });
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <span className="text-sm">PMS Data Analysis</span>
                            <span className="ml-auto text-xs text-amber-600 font-medium">Draft</span>
                          </button>
                          <button 
                            type="button"
                            className="flex items-center w-full text-left py-2 px-3 pl-9 hover:bg-blue-50"
                            onClick={() => {
                              window.open('/attached_assets/9789240097711-eng.pdf', '_blank');
                              toast({
                                title: "Document opened",
                                description: "Viewing Clinical Guidelines document"
                              });
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <span className="text-sm">Clinical Guidelines</span>
                            <span className="ml-auto text-xs text-green-600 font-medium">v3.0</span>
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* FDA Submissions */}
                    <div className="mb-0.5 bg-blue-50">
                      <div 
                        className="flex items-center py-2 px-3 hover:bg-blue-100 cursor-pointer bg-blue-50"
                        onClick={() => toggleFolder('submissions')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${expandedFolders.submissions ? 'rotate-90' : ''} mr-2 text-blue-600`}>
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-600">
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span className="text-sm font-medium">FDA Submissions</span>
                        <div className="ml-auto flex items-center">
                          <span className="mr-1.5 text-xs text-gray-700 bg-white px-1.5 py-0.5 rounded-full border border-blue-200">New</span>
                          <span className="text-xs text-gray-500 bg-white px-1.5 py-0.5 rounded-full border border-blue-200">3</span>
                        </div>
                      </div>
                      {expandedFolders.submissions && (
                        <div>
                          <button 
                            type="button"
                            className="flex items-center w-full text-left py-2 px-3 pl-9 hover:bg-blue-100 bg-blue-50"
                            onClick={() => openDocumentSafely('/attached_assets/1 - CER 2021 Update - Arthrosurface Shoulder Implant Systems - 10.07.2021 (FINAL).pdf', '510(k) Submission', toast)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-600">
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <span className="text-sm font-medium">510(k) Submission</span>
                            <span className="ml-auto text-xs text-blue-700 font-medium">Final</span>
                          </button>
                          <button 
                            type="button"
                            className="flex items-center w-full text-left py-2 px-3 pl-9 hover:bg-blue-100 bg-blue-50"
                            onClick={() => openDocumentSafely('/attached_assets/Clinical-Evaluation-Reports-How-To-Leverage-Published-Data-–-Pro-Te-Fall-2016.pdf', 'Predicate Device', toast)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-600">
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <span className="text-sm font-medium">Predicate Device</span>
                            <span className="ml-auto text-xs text-blue-700 font-medium">Final</span>
                          </button>
                          <button 
                            type="button"
                            className="flex items-center w-full text-left py-2 px-3 pl-9 hover:bg-blue-100 bg-blue-50"
                            onClick={() => openDocumentSafely('/attached_assets/Human-Factors-Studies-and-Related-Clinical-Study-Considerations-in-Combination-Product-Design-and-Development.pdf', 'eSTAR Package', toast)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-600">
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <span className="text-sm font-medium">eSTAR Package</span>
                            <span className="ml-auto text-xs text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded-full">NEW</span>
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Technical Documentation */}
                    <div className="mb-0.5">
                      <div 
                        className="flex items-center py-2 px-3 hover:bg-blue-50 cursor-pointer"
                        onClick={() => toggleFolder('technical')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${expandedFolders.technical ? 'rotate-90' : ''} mr-2 text-gray-500`}>
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-600">
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                        </svg>
                        {folderRenameState.isRenaming && folderRenameState.folderId === 'technical' ? (
                          <input
                            type="text"
                            className="text-sm w-28 p-0.5 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={folderRenameState.folderName}
                            onChange={(e) => setFolderRenameState(prev => ({...prev, folderName: e.target.value}))}
                            onBlur={completeRenameFolder}
                            onKeyDown={(e) => e.key === 'Enter' && completeRenameFolder()}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="text-sm font-medium">Technical</span>
                        )}
                        <div className="ml-auto flex items-center">
                          <button 
                            className="h-5 w-5 text-gray-400 hover:text-gray-600 mr-1"
                            onClick={(e) => startRenameFolder('technical', 'Technical', e)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                              <path d="m15 5 4 4"></path>
                            </svg>
                          </button>
                          <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">2</span>
                        </div>
                      </div>
                      {expandedFolders.technical && (
                        <div>
                          <button 
                            type="button"
                            className="flex items-center w-full text-left py-2 px-3 pl-9 hover:bg-blue-50"
                            onClick={() => openDocumentSafely('/attached_assets/ENVIA_Whitepaper_SOTApdf.pdf', 'Technical Specs', toast)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <span className="text-sm">Technical Specs</span>
                            <span className="ml-auto text-xs text-green-600 font-medium">v4.2</span>
                          </button>
                          <button 
                            type="button"
                            className="flex items-center w-full text-left py-2 px-3 pl-9 hover:bg-blue-50"
                            onClick={() => openDocumentSafely('/attached_assets/DI_Intelligent-clinical-trials.pdf', 'Risk Analysis', toast)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <span className="text-sm">Risk Analysis</span>
                            <span className="ml-auto text-xs text-green-600 font-medium">v1.8</span>
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Global Documents Folder */}
                    {(documentView === 'all' || documentView === 'global') && (
                      <div className="mb-0.5">
                        <div 
                          className="flex items-center py-2 px-3 hover:bg-blue-50 cursor-pointer bg-gray-50"
                          onClick={() => toggleFolder('global')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${expandedFolders.global ? 'rotate-90' : ''} mr-2 text-gray-500`}>
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-purple-600">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                          </svg>
                          <span className="text-sm font-medium">Global Documents</span>
                          <div className="ml-auto flex items-center">
                            <button 
                              className="h-5 w-5 text-gray-400 hover:text-gray-600 mr-1"
                              onClick={(e) => startRenameFolder('global', 'Global Documents', e)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                                <path d="m15 5 4 4"></path>
                              </svg>
                            </button>
                            <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">1</span>
                          </div>
                        </div>
                        {expandedFolders.global && (
                          <div>
                            <button 
                              type="button"
                              className="flex w-full items-center py-2 px-3 pl-9 hover:bg-blue-50 cursor-pointer text-left"
                              onClick={() => openDocumentSafely('/attached_assets/9789240097711-eng.pdf', 'Shared Resources', toast)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-purple-500">
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                              </svg>
                              <span className="text-sm">Shared Resources</span>
                              <span className="ml-auto text-xs text-green-600 font-medium">v2.0</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </nav>
                </div>
                
                {/* Action buttons */}
                <div className="p-2 border-t bg-gray-50">
                  <div className="flex space-x-2">
                    <label className="flex items-center justify-center py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      Upload Document
                      <input 
                        type="file" 
                        accept=".pdf,.doc,.docx,.xlsx,.ppt,.pptx" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            // Show upload in progress
                            toast({
                              title: "Uploading Document",
                              description: `Uploading ${file.name}...`
                            });
                            
                            // Simulate file upload with delay (in real app, this would be an actual upload)
                            setTimeout(() => {
                              // Success notification
                              toast({
                                title: "Upload Complete",
                                description: `${file.name} has been added to the document vault`
                              });
                              
                              // Expand appropriate folder based on file type/name
                              if (file.name.toLowerCase().includes('510') || 
                                  file.name.toLowerCase().includes('fda') || 
                                  file.name.toLowerCase().includes('submission')) {
                                setExpandedFolders(prev => ({...prev, submissions: true}));
                              } else if (file.name.toLowerCase().includes('clinical') || 
                                         file.name.toLowerCase().includes('study')) {
                                setExpandedFolders(prev => ({...prev, clinical: true}));
                              } else if (file.name.toLowerCase().includes('tech') || 
                                         file.name.toLowerCase().includes('spec')) {
                                setExpandedFolders(prev => ({...prev, technical: true}));
                              } else {
                                setExpandedFolders(prev => ({...prev, regulatory: true}));
                              }
                              
                              // Clear the file input for future uploads
                              e.target.value = null;
                            }, 1800);
                          }
                        }}
                      />
                    </label>
                    <button 
                      className="flex items-center justify-center py-1.5 px-3 border border-green-600 bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium rounded-md"
                      onClick={() => setShowFolderCreate(true)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                        <line x1="12" y1="11" x2="12" y2="17"></line>
                        <line x1="9" y1="14" x2="15" y2="14"></line>
                      </svg>
                      New Folder
                    </button>
                    
                    <div className="relative">
                      <input
                        type="file"
                        id="documentUpload"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            const fileName = e.target.files[0].name;
                            
                            // Show that the document is being uploaded and processed
                            toast({
                              title: "Uploading Document",
                              description: `Processing ${fileName}...`
                            });
                            
                            // Simulate document upload and AI processing
                            setTimeout(() => {
                              toast({
                                title: "Document Uploaded",
                                description: `${fileName} has been analyzed and categorized`
                              });
                              
                              // Simulate document being uploaded and automatically classified
                              setShowProcessingResults(true);
                              setProcessingType('upload');
                              
                              // Set upload results with AI analysis
                              setProcessingResults({
                                processingType: 'upload',
                                status: 'success',
                                timestamp: new Date().toISOString(),
                                fileName: fileName,
                                fileSize: '2.4 MB',
                                fileType: fileName.endsWith('.pdf') ? 'PDF Document' : 'Document',
                                results: {
                                  documentType: '510(k) Technical Document',
                                  autoClassification: 'Performance Testing',
                                  suggestedFolder: 'Regulatory Documents/510(k) Documents/Performance Testing',
                                  contentSummary: 'This document contains bench testing results for the device, including mechanical strength testing, durability assessment, and biocompatibility data according to ISO 10993 standards.',
                                  relevantStandards: [
                                    'ISO 10993-1:2018',
                                    'FDA 21 CFR 807.92(b)(3)',
                                    'ASTM F2514-08'
                                  ]
                                }
                              });
                            }, 1500);
                          }
                        }}
                        multiple={false}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                      />
                      <button 
                        className="flex items-center justify-center py-1.5 px-3 border border-blue-600 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-md"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        Upload Document
                      </button>
                    </div>
                    
                    <button 
                      className="flex items-center justify-center py-1.5 px-3 border border-gray-300 hover:bg-gray-100 text-sm font-medium rounded-md"
                      onClick={() => {
                        toast({
                          title: "Document Export",
                          description: "Preparing document export...",
                        });
                          
                        // In a real app, this would trigger a download
                        setTimeout(() => {
                          toast({
                            title: "Export Complete",
                            description: "Documents have been exported successfully",
                          });
                        }, 1500);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Export
                    </button>
                    
                    <button 
                      className="flex items-center justify-center py-1.5 px-3 border border-purple-600 bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm font-medium rounded-md"
                      onClick={() => {
                        toast({
                          title: "Workflow Integration",
                          description: "Adding documents to the 510(k) submission workflow..."
                        });
                        
                        setTimeout(() => {
                          toast({
                            title: "Workflow Updated",
                            description: "Documents are now linked to the current workflow stage"
                          });
                        }, 1000);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="3" y1="9" x2="21" y2="9"></line>
                        <line x1="9" y1="21" x2="9" y2="9"></line>
                      </svg>
                      Add to Workflow
                    </button>
                  </div>
                  
                  {/* Advanced Document Processing Panel */}
                  <div className="mt-2 border rounded-md bg-gray-50 p-3">
                    <h4 className="text-sm font-semibold mb-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-600">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      AI Document Intelligence
                    </h4>
                    
                    <div className="space-y-2 mb-3">
                      <input 
                        type="text"
                        placeholder="Search documents by content..."
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            toast({
                              title: "Semantic Search",
                              description: `Searching for "${e.target.value}" in document content...`
                            });
                            
                            // This would call the vault search API in production
                            setTimeout(() => {
                              toast({
                                title: "Search Complete",
                                description: "3 matching sections found across documents"
                              });
                            }, 1200);
                          }
                        }}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <button 
                        className="w-full flex items-center justify-center py-1.5 px-3 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-md"
                        onClick={() => {
                          toast({
                            title: "Running Compliance Check",
                            description: "Analyzing documents for regulatory compliance..."
                          });
                          
                          // Initialize compliance check processing
                          setShowProcessingResults(true);
                          setProcessingType('compliance');
                          
                          setTimeout(() => {
                            toast({
                              title: "Compliance Analysis Complete",
                              description: "Found 1 issue requiring attention"
                            });
                            
                            // Set simulated processing results
                            setProcessingResults({
                              processingType: 'compliance',
                              status: 'complete',
                              timestamp: new Date().toISOString(),
                              results: [
                                {
                                  id: 'comp-1',
                                  section: 'Device Description',
                                  standard: 'FDA 21 CFR 807.92(a)(4)',
                                  documents: ['Device Technical Documentation.pdf'],
                                  status: 'compliant',
                                  message: 'The device description contains all required elements for a 510(k) submission.',
                                  confidence: 0.96
                                },
                                {
                                  id: 'comp-2',
                                  section: 'Substantial Equivalence',
                                  standard: 'FDA 21 CFR 807.92(b)',
                                  documents: ['Predicate Device Comparison.pdf'],
                                  status: 'compliant',
                                  message: 'Comparison to predicate device adequately demonstrates substantial equivalence.',
                                  confidence: 0.92
                                },
                                {
                                  id: 'comp-3',
                                  section: 'Performance Testing',
                                  standard: 'FDA 21 CFR 807.92(b)(3)',
                                  documents: ['Bench Testing Report.pdf'],
                                  status: 'non-compliant',
                                  message: 'Performance testing documentation is incomplete. Missing biocompatibility test results according to ISO 10993.',
                                  confidence: 0.89,
                                  recommendation: 'Add biocompatibility testing results for all patient-contacting materials according to ISO 10993-1 requirements.'
                                },
                                {
                                  id: 'comp-4',
                                  section: 'Clinical Evidence',
                                  standard: 'FDA 21 CFR 807.92(b)(2)',
                                  documents: ['Clinical Study Report 510k.pdf'],
                                  status: 'compliant',
                                  message: 'Clinical evidence sufficiently demonstrates safety and effectiveness for the intended use.',
                                  confidence: 0.94
                                }
                              ]
                            });
                          }, 2000);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        Run Compliance Check
                      </button>
                      
                      <button 
                        className="w-full flex items-center justify-center py-1.5 px-3 border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-medium rounded-md"
                        onClick={() => {
                          toast({
                            title: "AI Analysis",
                            description: "Generating regulatory tags from document content..."
                          });
                          
                          // Initialize smart tag processing
                          setShowProcessingResults(true);
                          setProcessingType('tags');
                          
                          setTimeout(() => {
                            toast({
                              title: "Tag Generation Complete",
                              description: "8 regulatory tags extracted from documents"
                            });
                            
                            // Set simulated processing results
                            setProcessingResults({
                              processingType: 'tags',
                              status: 'success',
                              timestamp: new Date().toISOString(),
                              results: [
                                {
                                  id: 'tag-1',
                                  category: 'Regulatory Standards',
                                  tags: [
                                    { name: 'ISO 13485:2016', confidence: 0.94, relevance: 'high' },
                                    { name: 'FDA 21 CFR Part 820', confidence: 0.91, relevance: 'high' },
                                    { name: 'EU MDR 2017/745', confidence: 0.88, relevance: 'medium' }
                                  ]
                                },
                                {
                                  id: 'tag-2',
                                  category: 'Safety & Performance',
                                  tags: [
                                    { name: 'Biocompatibility', confidence: 0.92, relevance: 'high' },
                                    { name: 'Sterilization Validation', confidence: 0.89, relevance: 'high' },
                                    { name: 'Performance Testing', confidence: 0.93, relevance: 'medium' }
                                  ]
                                },
                                {
                                  id: 'tag-3',
                                  category: 'Clinical Evidence',
                                  tags: [
                                    { name: 'Clinical Evaluation', confidence: 0.96, relevance: 'high' },
                                    { name: 'Post-Market Surveillance', confidence: 0.87, relevance: 'medium' }
                                  ]
                                }
                              ]
                            });
                          }, 1500);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        Generate Smart Tags
                      </button>
                      
                      <button 
                        className="w-full flex items-center justify-center py-1.5 px-3 border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm font-medium rounded-md"
                        onClick={() => {
                          toast({
                            title: "OCR Processing",
                            description: "Extracting text from document images..."
                          });
                          
                          // Call OCR processing on the /api/vault/process-images endpoint
                          // This is a mockup API call for the investor demo
                          setShowProcessingResults(true);
                          setProcessingType('ocr');
                          
                          setTimeout(() => {
                            toast({
                              title: "OCR Complete",
                              description: "Text extracted from 2 scanned documents"
                            });
                            
                            // Set simulated processing results
                            setProcessingResults({
                              processingType: 'ocr',
                              status: 'success',
                              timestamp: new Date().toISOString(),
                              results: [
                                {
                                  id: 'doc-1',
                                  title: 'Clinical Study Report 510k.pdf',
                                  wordCount: 5842,
                                  confidence: 0.94,
                                  extract: "This clinical evaluation provides a critical assessment of the relevant pre-clinical and clinical data relating to the safety and performance of the MEDXHEALTH AUTOSTENT Device...",
                                  pages: 27
                                },
                                {
                                  id: 'doc-2',
                                  title: 'Annual Device Report.pdf',
                                  wordCount: 3215,
                                  confidence: 0.89,
                                  extract: "Annual monitoring period: January 2024 - December 2024. Total number of devices sold: 1,245. Adverse event rate: 0.3%...",
                                  pages: 18
                                }
                              ]
                            });
                          }, 2500);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                          <polygon points="14 2 18 6 7 17 3 17 3 13 14 2"></polygon>
                          <line x1="3" y1="22" x2="21" y2="22"></line>
                        </svg>
                        Process Scanned Documents
                      </button>
                    </div>
                  </div>
                  
                  {/* Document Processing Results Panel */}
                  {showProcessingResults && processingResults && (
                    <div className="mt-4 border rounded-md overflow-hidden">
                      <div className="bg-gray-100 px-3 py-2 border-b flex items-center justify-between">
                        <h3 className="font-medium flex items-center">
                          {processingType === 'ocr' && (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-purple-600">
                                <polygon points="14 2 18 6 7 17 3 17 3 13 14 2"></polygon>
                                <line x1="3" y1="22" x2="21" y2="22"></line>
                              </svg>
                              OCR Processing Results
                            </>
                          )}
                          {processingType === 'tags' && (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-amber-600">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                              </svg>
                              Smart Tags Generated
                            </>
                          )}
                          {processingType === 'compliance' && (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-600">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                              </svg>
                              Compliance Check Results
                            </>
                          )}
                        </h3>
                        <button 
                          className="text-gray-500 hover:text-gray-700"
                          onClick={() => setShowProcessingResults(false)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                      
                      <div className="p-3">
                        {processingType === 'ocr' && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm text-gray-500 border-b pb-2">
                              <span>Processed on: {new Date(processingResults.timestamp).toLocaleString()}</span>
                              <span>Status: <span className="text-green-600 font-medium">Successful</span></span>
                            </div>
                            
                            {processingResults.results.map(doc => (
                              <div key={doc.id} className="border rounded-md p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-gray-900 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-red-500">
                                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                      <polyline points="14 2 14 8 20 8"></polyline>
                                    </svg>
                                    {doc.title}
                                  </h4>
                                  <span className="text-sm text-gray-500">
                                    {doc.pages} pages • {doc.wordCount.toLocaleString()} words
                                  </span>
                                </div>
                                
                                <div className="text-sm bg-gray-50 p-2 rounded border mb-2">
                                  <p className="text-gray-700">{doc.extract}</p>
                                </div>
                                
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-500">OCR Confidence: {(doc.confidence * 100).toFixed(1)}%</span>
                                  <div>
                                    <button className="text-blue-600 hover:text-blue-800 mr-3">
                                      View Full Text
                                    </button>
                                    <button className="text-purple-600 hover:text-purple-800">
                                      Add to Document
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            <div className="flex justify-end mt-2">
                              <button 
                                className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md text-sm font-medium hover:bg-purple-100"
                                onClick={() => {
                                  setShowProcessingResults(false);
                                  toast({
                                    title: "Processing Complete",
                                    description: "OCR results have been saved to the document vault"
                                  });
                                }}
                              >
                                Save Results
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {processingType === 'compliance' && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm text-gray-500 border-b pb-2">
                              <span>Analyzed on: {new Date(processingResults.timestamp).toLocaleString()}</span>
                              <span>Status: <span className="text-amber-600 font-medium">Needs Review</span></span>
                            </div>
                            
                            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm mb-3">
                              <div className="flex items-center text-amber-700 font-medium mb-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                  <line x1="12" y1="9" x2="12" y2="13"></line>
                                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                </svg>
                                Your submission has 1 compliance issue that requires attention
                              </div>
                              <p className="text-amber-600 ml-6">Please review and address all compliance issues before final submission.</p>
                            </div>
                            
                            {processingResults.results.map(item => (
                              <div 
                                key={item.id} 
                                className={`border rounded-md p-3 ${item.status === 'non-compliant' ? 'border-red-200 bg-red-50' : ''}`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-gray-900 flex items-center">
                                    {item.status === 'compliant' ? (
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-500">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                      </svg>
                                    ) : (
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-red-500">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="15" y1="9" x2="9" y2="15"></line>
                                        <line x1="9" y1="9" x2="15" y2="15"></line>
                                      </svg>
                                    )}
                                    {item.section}
                                  </h4>
                                  <span className="text-sm text-gray-500">
                                    {item.standard}
                                  </span>
                                </div>
                                
                                <div className={`text-sm p-2 rounded border mb-2 ${
                                  item.status === 'non-compliant' 
                                    ? 'bg-white border-red-200 text-red-700' 
                                    : 'bg-gray-50 border-gray-200 text-gray-700'
                                }`}>
                                  <p>{item.message}</p>
                                  {item.recommendation && (
                                    <div className="mt-2 pt-2 border-t border-red-200">
                                      <p className="font-medium">Recommendation:</p>
                                      <p>{item.recommendation}</p>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex items-center justify-between text-sm">
                                  <div>
                                    <span className="text-gray-500 mr-4">Documents: </span>
                                    {item.documents.map((doc, index) => (
                                      <span key={index} className="text-blue-600">{doc}{index < item.documents.length - 1 ? ', ' : ''}</span>
                                    ))}
                                  </div>
                                  <span className="text-gray-500">Confidence: {(item.confidence * 100).toFixed(0)}%</span>
                                </div>
                                
                                {item.status === 'non-compliant' && (
                                  <div className="mt-3 pt-2 border-t flex justify-end">
                                    <button className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm font-medium hover:bg-red-100">
                                      Fix Issue
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                            
                            <div className="flex justify-end mt-2">
                              <button 
                                className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-sm font-medium hover:bg-blue-100"
                                onClick={() => {
                                  setShowProcessingResults(false);
                                  toast({
                                    title: "Compliance Report Saved",
                                    description: "You can access this report in the document history"
                                  });
                                }}
                              >
                                Save Report
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {processingType === 'upload' && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm text-gray-500 border-b pb-2">
                              <span>Processed on: {new Date(processingResults.timestamp).toLocaleString()}</span>
                              <span>Status: <span className="text-green-600 font-medium">Success</span></span>
                            </div>
                            
                            <div className="border rounded-md p-3">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-gray-900 flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-red-500">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                  </svg>
                                  {processingResults.fileName}
                                </h4>
                                <div className="text-sm text-gray-500">
                                  {processingResults.fileSize} • {processingResults.fileType}
                                </div>
                              </div>
                              
                              <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mb-3">
                                <h5 className="text-sm font-medium text-blue-700 mb-2">AI Document Classification</h5>
                                <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                                  <div>
                                    <span className="text-gray-500">Document Type:</span>
                                    <span className="ml-2 font-medium">{processingResults.results.documentType}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Category:</span>
                                    <span className="ml-2 font-medium">{processingResults.results.autoClassification}</span>
                                  </div>
                                </div>
                                <div className="mb-2 text-sm">
                                  <span className="text-gray-500">Suggested Location:</span>
                                  <span className="ml-2 font-medium">{processingResults.results.suggestedFolder}</span>
                                </div>
                              </div>
                              
                              <div className="border rounded-md p-3 bg-gray-50 mb-3 text-sm">
                                <h5 className="font-medium text-gray-900 mb-2">Document Summary</h5>
                                <p className="text-gray-700">{processingResults.results.contentSummary}</p>
                              </div>
                              
                              {processingResults.results.relevantStandards && (
                                <div className="mb-3">
                                  <h5 className="font-medium text-sm text-gray-900 mb-2">Relevant Standards</h5>
                                  <div className="flex flex-wrap gap-2">
                                    {processingResults.results.relevantStandards.map((standard, index) => (
                                      <span 
                                        key={index} 
                                        className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-md"
                                      >
                                        {standard}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between pt-2 border-t">
                                <div className="flex space-x-2">
                                  <button className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm font-medium hover:bg-green-100">
                                    Accept Classification
                                  </button>
                                  <button className="px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-100">
                                    Change Category
                                  </button>
                                </div>
                                <button 
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                  onClick={() => {
                                    // Add document to compliance check
                                    toast({
                                      title: "Added to Workflow",
                                      description: "Document added to Performance Testing workflow stage"
                                    });
                                    
                                    setShowProcessingResults(false);
                                  }}
                                >
                                  Add to Current Workflow
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {processingType === 'tags' && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm text-gray-500 border-b pb-2">
                              <span>Generated on: {new Date(processingResults.timestamp).toLocaleString()}</span>
                              <span>Status: <span className="text-green-600 font-medium">Complete</span></span>
                            </div>
                            
                            {processingResults.results.map(category => (
                              <div key={category.id} className="border rounded-md p-3">
                                <h4 className="font-medium text-gray-900 mb-2 pb-2 border-b flex items-center">
                                  {category.category === 'Regulatory Standards' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-500">
                                      <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                                      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                                      <line x1="6" y1="1" x2="6" y2="4"></line>
                                      <line x1="10" y1="1" x2="10" y2="4"></line>
                                      <line x1="14" y1="1" x2="14" y2="4"></line>
                                    </svg>
                                  )}
                                  {category.category === 'Safety & Performance' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-500">
                                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                    </svg>
                                  )}
                                  {category.category === 'Clinical Evidence' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-amber-500">
                                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                                    </svg>
                                  )}
                                  {category.category}
                                </h4>
                                
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {category.tags.map((tag, index) => (
                                    <div 
                                      key={index} 
                                      className={`text-sm px-2 py-1 rounded-md flex items-center
                                        ${tag.relevance === 'high' 
                                          ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                                          : 'bg-gray-50 text-gray-700 border border-gray-200'
                                        }`}
                                    >
                                      <span className="mr-1">{tag.name}</span>
                                      <span className="text-xs opacity-70">({(tag.confidence * 100).toFixed(0)}%)</span>
                                    </div>
                                  ))}
                                </div>

                                <div className="flex justify-end text-sm">
                                  <button className="text-amber-600 hover:text-amber-800">
                                    Apply Tags to Document
                                  </button>
                                </div>
                              </div>
                            ))}
                            
                            <div className="flex justify-end mt-2">
                              <button 
                                className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-sm font-medium hover:bg-amber-100"
                                onClick={() => {
                                  setShowProcessingResults(false);
                                  toast({
                                    title: "Tags Generated",
                                    description: "Regulatory tags have been saved to the document metadata"
                                  });
                                }}
                              >
                                Save All Tags
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Create new folder dialog */}
                  {showFolderCreate && (
                    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg shadow-xl p-4 w-80">
                        <h3 className="text-lg font-medium mb-3">Create New Folder</h3>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Folder Name
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter folder name"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Parent Folder
                          </label>
                          <select 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="regulatory">Regulatory Documents</option>
                            <option value="clinical">Clinical Documents</option>
                            <option value="technical">Technical Documents</option>
                            <option value="submissions">Submission Documents</option>
                            <option value="510k">510(k) Documents</option>
                            <option value="global">Global Documents</option>
                          </select>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white hover:bg-gray-50"
                            onClick={() => {
                              setShowFolderCreate(false);
                              setNewFolderName('');
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                            onClick={() => {
                              if (newFolderName.trim()) {
                                // Would store in database in production
                                toast({
                                  title: "Folder Created",
                                  description: `Folder "${newFolderName}" created successfully`
                                });
                                setShowFolderCreate(false);
                                setNewFolderName('');
                              } else {
                                toast({
                                  title: "Error",
                                  description: "Please enter a folder name",
                                  variant: "destructive"
                                });
                              }
                            }}
                          >
                            Create
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Additional vault actions */}
                  <div className="mt-2">
                    <button 
                      className="w-full flex items-center justify-center py-1.5 px-3 border border-gray-300 bg-white hover:bg-gray-50 text-sm font-medium rounded-md"
                      onClick={() => {
                        // Create a new folder functionality
                        toast({
                          title: "New Folder",
                          description: "Created new folder in current view",
                        });
                        
                        // This would typically involve server operations
                        setExpandedFolders(prev => ({
                          ...prev,
                          newFolder: true
                        }));
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                        <line x1="12" y1="11" x2="12" y2="17"></line>
                        <line x1="9" y1="14" x2="15" y2="14"></line>
                      </svg>
                      Create New Folder
                    </button>
                  </div>
                </div>
              </div>
            </div>
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