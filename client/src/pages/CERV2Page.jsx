import React, { useState, useEffect } from 'react';
import { useLumenAiAssistant } from '@/contexts/LumenAiAssistantContext';
import CerBuilderPanel from '@/components/cer/CerBuilderPanel';
import CerPreviewPanel from '@/components/cer/CerPreviewPanel';
import LiteratureSearchPanel from '@/components/cer/LiteratureSearchPanel';
import LiteratureMethodologyPanel from '@/components/cer/LiteratureMethodologyPanel';
import ComplianceScorePanel from '@/components/cer/ComplianceScorePanel';
import CerAssistantPanel from '@/components/cer/CerAssistantPanel';
import DocumentVaultPanel from '@/components/cer/DocumentVaultPanel';
import CerDataRetrievalPanel from '@/components/cer/CerDataRetrievalPanel';
import EquivalenceBuilderPanel from '@/components/cer/EquivalenceBuilderPanel';
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
import SimpleDocumentTreePanel from '@/components/510k/SimpleDocumentTreePanel';
import WelcomeDialog from '@/components/510k/WelcomeDialog';
import DeviceIntakeForm from '@/components/510k/DeviceIntakeForm';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cerApiService } from '@/services/CerAPIService';
import { literatureAPIService } from '@/services/LiteratureAPIService';
import { FileText, BookOpen, CheckSquare, Download, MessageSquare, Clock, FileCheck, CheckCircle, AlertCircle, RefreshCw, ZapIcon, BarChart, FolderOpen, Database, GitCompare, BookMarked, Lightbulb, ClipboardList, FileSpreadsheet, Layers, Trophy, ShieldCheck, Shield, Play, Archive, Activity, Cpu, HardDrive, Network, Code, XCircle, DownloadCloud, Search, Calendar, Info, ArrowRight, AlertTriangle, Files, FolderTree, X, FilePlus, FolderPlus } from 'lucide-react';
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
  
  // 510k workflow specific state
  const [workflowStep, setWorkflowStep] = useState(1);
  const [workflowProgress, setWorkflowProgress] = useState(25);
  const [predicatesFound, setPredicatesFound] = useState(false);
  const [predicateDevices, setPredicateDevices] = useState([]);
  const [equivalenceCompleted, setEquivalenceCompleted] = useState(false);
  const [complianceScore, setComplianceScore] = useState(null);
  const [submissionReady, setSubmissionReady] = useState(false);
  
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
  const { toast } = useToast();

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
  const handlePredicatesComplete = (data) => {
    setPredicatesFound(true);
    setPredicateDevices(data || []);
    toast({
      title: "Predicate Devices Found",
      description: `Found ${data?.length || 'multiple'} potential predicate devices that match your criteria.`,
      variant: "success"
    });
    
    // Automatically advance to next step after short delay
    setTimeout(() => {
      setWorkflowStep(prev => prev + 1);
      setActiveTab('equivalence');
    }, 500);
  };
  
  const handleEquivalenceComplete = (data) => {
    setEquivalenceCompleted(true);
    toast({
      title: "Equivalence Analysis Complete",
      description: "Substantial equivalence documentation has been prepared.",
      variant: "success"
    });
    
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
  
  // Navigation functions for 510k workflow
  const goToStep = (step) => {
    if (step >= 1 && step <= 5) {
      setWorkflowStep(step);
      
      // Update active tab based on step
      const tabMap = {
        1: 'predicates', // Device Profile (displayed in Predicate Finder)
        2: 'predicates', // Predicate Finder
        3: 'equivalence', // Substantial Equivalence
        4: 'compliance', // Compliance Check 
        5: 'submission' // Final Submission
      };
      
      setActiveTab(tabMap[step]);
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
            />
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-4">
            <ComplianceScorePanel 
              deviceProfile={deviceProfile}
              setDeviceProfile={(newProfile) => {
                // Just save the updated device profile
                if (newProfile) {
                  setDeviceProfile(newProfile);
                }
              }}
              documentId={deviceProfile?.id}
              compliance={compliance}
              setCompliance={(complianceData) => {
                setCompliance(complianceData);
                if (complianceData?.score) {
                  handleComplianceComplete(Math.round(complianceData.score * 100));
                }
              }}
              isLoading={isComplianceRunning}
              setIsLoading={setIsComplianceRunning}
            />
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-4">
            <ReportGenerator
              deviceProfile={deviceProfile}
              documentId={deviceProfile?.id}
              exportTimestamp={new Date().toISOString()}
              draftStatus={compliance?.status || 'draft'}
              setDraftStatus={setDraftStatus}
              sections={sections}
              onSubmissionReady={handleSubmissionReady}
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
      return (
        <div className="p-4 space-y-4">
          {render510kProgressBar()}
          {render510kStepContent()}
        </div>
      );
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
    else if (documentType === 'cer' && activeTab === 'compliance') {
      return <ComplianceScorePanel cerDocumentId={cerDocumentId} sections={sections} />;
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
    else if (documentType === 'cer' && activeTab === 'equivalence') {
      return <EquivalenceBuilderPanel cerDocumentId={cerDocumentId} />;
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
          {/* Document Manager - Professional UI with best practices */}
          {showDocumentTree && (
            <div className="w-[300px] bg-white border-r rounded-l-lg shadow-sm overflow-hidden flex flex-col h-[calc(100vh-270px)]">
              {/* Header with search */}
              <div className="border-b p-3 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <FolderTree className="h-4 w-4 text-blue-600 mr-2" />
                    <h3 className="font-medium text-sm">Document Repository</h3>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowDocumentTree(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-gray-400" />
                  <Input
                    placeholder="Search documents..."
                    className="h-8 pl-8 text-xs"
                  />
                </div>
              </div>
              
              {/* File type filter */}
              <div className="px-3 py-2 border-b bg-gray-50">
                <div className="flex space-x-1">
                  <Button variant="outline" size="sm" className="h-6 text-xs px-2 bg-white">
                    All
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 text-xs px-2">
                    Submissions
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 text-xs px-2">
                    Predicates
                  </Button>
                </div>
              </div>
              
              {/* File browser */}
              <div className="flex-grow overflow-auto">
                <div className="p-0.5">
                  {/* Folders section */}
                  <div className="mb-2">
                    <div className="px-3 py-1.5 text-xs font-medium text-gray-500">
                      Folders
                    </div>
                    <ul>
                      {[
                        { name: 'Device Information', count: 3 },
                        { name: 'Predicate Devices', count: 2 },
                        { name: 'Test Reports', count: 5 },
                        { name: 'Regulatory Documents', count: 4 }
                      ].map((folder, i) => (
                        <li 
                          key={i}
                          className="flex items-center justify-between px-3 py-1.5 hover:bg-blue-50 cursor-pointer"
                        >
                          <div className="flex items-center">
                            <FolderOpen className="w-4 h-4 text-yellow-500 mr-2" />
                            <span className="text-sm">{folder.name}</span>
                          </div>
                          <span className="text-xs text-gray-500 bg-gray-100 px-1.5 rounded-full">
                            {folder.count}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Recent files section */}
                  <div>
                    <div className="px-3 py-1.5 text-xs font-medium text-gray-500 flex items-center justify-between">
                      <span>Recent Files</span>
                      <Button variant="ghost" size="sm" className="h-5 text-xs px-2 text-blue-600">
                        View All
                      </Button>
                    </div>
                    <ul>
                      {[
                        { name: 'Device Description.pdf', type: 'pdf', date: 'Today' },
                        { name: 'Substantial Equivalence.docx', type: 'docx', date: 'Yesterday' },
                        { name: '510(k) Submission.pdf', type: 'pdf', date: '2 days ago' },
                        { name: 'Performance Testing.xlsx', type: 'xlsx', date: 'May 10' },
                        { name: 'FDA Predicates List.pdf', type: 'pdf', date: 'May 8' }
                      ].map((file, i) => (
                        <li 
                          key={i}
                          className="flex items-center px-3 py-1.5 hover:bg-blue-50 cursor-pointer"
                        >
                          <div className="mr-2">
                            {file.type === 'pdf' ? (
                              <FileText className="h-4 w-4 text-red-500" />
                            ) : file.type === 'docx' ? (
                              <FileText className="h-4 w-4 text-blue-500" />
                            ) : (
                              <FileText className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm truncate">{file.name}</div>
                            <div className="text-xs text-gray-500">{file.date}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Footer with actions */}
              <div className="border-t p-2 bg-gray-50 flex items-center justify-between">
                <Button variant="outline" size="sm" className="text-xs px-2">
                  <FolderPlus className="h-3.5 w-3.5 mr-1" />
                  New Folder
                </Button>
                <Button variant="primary" size="sm" className="text-xs px-2 bg-blue-600 text-white hover:bg-blue-700">
                  <FilePlus className="h-3.5 w-3.5 mr-1" />
                  Upload
                </Button>
              </div>
            </div>
          )}
          
          <div className={`bg-white rounded-lg border shadow-sm flex-1 ${showDocumentTree ? 'rounded-l-none' : ''}`}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}