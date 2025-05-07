import React, { useState, useEffect, useCallback } from 'react';
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
import CerOnboardingGuide from '@/components/cer/CerOnboardingGuide';
import WizardStepper from '@/components/cer/WizardStepper';
import NotificationBanner from '@/components/cer/NotificationBanner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cerApiService } from '@/services/CerAPIService';
import { literatureAPIService } from '@/services/LiteratureAPIService';
import { FileText, BookOpen, CheckSquare, Download, MessageSquare, Clock, FileCheck, CheckCircle, AlertCircle, RefreshCw, ZapIcon, BarChart, FolderOpen, Database, GitCompare, BookMarked, Lightbulb, ClipboardList } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function CERV2Page() {
  const [title, setTitle] = useState('Clinical Evaluation Report');
  const [deviceType, setDeviceType] = useState('Class II Medical Device');
  const [deviceName, setDeviceName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [intendedUse, setIntendedUse] = useState('');
  const [faers, setFaers] = useState([]);
  const [comparators, setComparators] = useState([]);
  const [sections, setSections] = useState([]);
  const [equivalenceData, setEquivalenceData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingFaers, setIsFetchingFaers] = useState(false);
  const [isFetchingLiterature, setIsFetchingLiterature] = useState(false);
  const [activeTab, setActiveTab] = useState('builder');
  const [compliance, setCompliance] = useState(null);
  const [draftStatus, setDraftStatus] = useState('in-progress');
  const [exportTimestamp, setExportTimestamp] = useState(null);
  const [isComplianceRunning, setIsComplianceRunning] = useState(false);
  const [isGeneratingFullCER, setIsGeneratingFullCER] = useState(false);
  const [showDeviceInfoDialog, setShowDeviceInfoDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('eu-mdr');
  const [showFetchingBanner, setShowFetchingBanner] = useState(false);
  const [showEvidenceReminder, setShowEvidenceReminder] = useState(false);
  const [hasAutoFetched, setHasAutoFetched] = useState(false);
  const [literatureResult, setLiteratureResult] = useState(null);
  const [retrievalProgress, setRetrievalProgress] = useState({ faers: 0, literature: 0 });
  const [evidenceSnapshot, setEvidenceSnapshot] = useState(null);
  const [cepData, setCepData] = useState(null);
  const { toast } = useToast();

  // Load FAERS data when device name changes
  const loadFaersData = async (device = deviceName) => {
    if (!device || device.trim() === '') return;
    
    try {
      setIsFetchingFaers(true);
      setFaers([]);
      setComparators([]);
      
      const data = await cerApiService.fetchFaersData(device);
      
      if (data) {
        setFaers(data.reports || []);
        setComparators(data.comparators || []);
        
        toast({
          title: 'FAERS Data Retrieved',
          description: `Found ${data.reports?.length || 0} adverse event reports and ${data.comparators?.length || 0} comparator products.`,
          variant: 'success'
        });
      }
    } catch (error) {
      console.error('Failed to load FAERS data:', error);
      toast({
        title: 'FAERS Data Error',
        description: error.message || 'Could not retrieve FDA adverse event data',
        variant: 'destructive'
      });
    } finally {
      setIsFetchingFaers(false);
    }
  };
  
  // Function to fetch literature data
  const fetchLiteratureData = async (query = deviceName) => {
    if (!query || query.trim() === '') return;
    
    try {
      setIsFetchingLiterature(true);
      
      const result = await literatureAPIService.searchPubMed({
        query: query,
        manufacturer: manufacturer || '',
        limit: 20
      });
      
      if (result && result.papers) {
        setLiteratureResult(result);
        toast({
          title: 'Literature Retrieved',
          description: `Found ${result.papers.length} relevant publications.`,
          variant: 'success'
        });
      }
      
      return result;
    } catch (error) {
      console.error('Failed to load literature data:', error);
      toast({
        title: 'Literature Data Error',
        description: error.message || 'Could not retrieve literature data',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsFetchingLiterature(false);
    }
  };
  
  // Simulate progress for data retrieval processes
  const simulateProgress = (type) => {
    return new Promise((resolve) => {
      let progress = 0;
      const maxProgress = 95; // Only go to 95%, the final 5% when data is received
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 5; // Increments between 5-15%
        
        if (progress >= maxProgress) {
          progress = maxProgress;
          clearInterval(interval);
          resolve();
        }
        
        setRetrievalProgress(prev => ({
          ...prev,
          [type]: progress
        }));
      }, 500);
    });
  };
  
  // Function to run both FAERS and literature fetching in parallel
  const runEnhancedDataRetrieval = useCallback(async () => {
    if (!deviceName || deviceName.trim() === '') {
      toast({
        title: 'Missing Device Name',
        description: 'Please enter a device name first.',
        variant: 'destructive'
      });
      return;
    }
    
    // Reset progress
    setRetrievalProgress({ faers: 0, literature: 0 });
    setEvidenceSnapshot(null);
    setShowFetchingBanner(true);
    setHasAutoFetched(true);
    
    // Start progress simulation
    const faersProgressPromise = simulateProgress('faers');
    const literatureProgressPromise = simulateProgress('literature');
    
    try {
      // Start the actual data fetching
      const resultsPromise = Promise.allSettled([
        loadFaersData(deviceName),
        fetchLiteratureData(deviceName)
      ]);
      
      // Wait for both progress simulation and actual data fetching
      await Promise.all([
        faersProgressPromise,
        literatureProgressPromise
      ]);
      
      // Fetch the actual results
      const results = await resultsPromise;
      
      // Set progress to 100% for both
      setRetrievalProgress({ faers: 100, literature: 100 });
      
      // Check for errors
      const faersResult = results[0];
      const litResult = results[1];
      
      let hasFaersData = false;
      let hasLiteratureData = false;
      let faersCount = 0;
      let litCount = 0;
      
      if (faersResult.status === 'fulfilled') {
        hasFaersData = true;
        faersCount = faers.length || 0;
      } else {
        console.error('FAERS data retrieval failed:', faersResult.reason);
      }
      
      if (litResult.status === 'fulfilled') {
        hasLiteratureData = true;
        if (litResult.value && litResult.value.papers) {
          setLiteratureResult(litResult.value);
          litCount = litResult.value.papers.length || 0;
        }
      } else {
        console.error('Literature data retrieval failed:', litResult.reason);
      }
      
      // Create evidence snapshot
      setEvidenceSnapshot({
        faersCount: faersCount,
        literatureCount: litCount
      });
      
      // Show toast notification
      if (hasFaersData || hasLiteratureData) {
        toast({
          title: 'Evidence Collection Complete',
          description: `Retrieved ${hasFaersData ? `${faersCount} FAERS reports` : ''}${hasFaersData && hasLiteratureData ? ' and ' : ''}${hasLiteratureData ? `${litCount} literature studies` : ''}.`,
          variant: 'success'
        });
      } else {
        toast({
          title: 'Evidence Collection Issue',
          description: 'Could not retrieve data. Please try again or manually search in each tab.',
          variant: 'destructive'
        });
      }
      
      // Keep the banner visible for a moment so user can see the 100% completion
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      console.error('Enhanced data retrieval error:', error);
      toast({
        title: 'Data Retrieval Failed',
        description: error.message || 'An error occurred during data retrieval',
        variant: 'destructive'
      });
    } finally {
      setShowFetchingBanner(false);
    }
  }, [deviceName, manufacturer, loadFaersData, fetchLiteratureData, toast, faers.length, setLiteratureResult, simulateProgress]);
  
  // Auto-trigger data collection when both device name and manufacturer are filled
  useEffect(() => {
    if (deviceName && deviceName.trim() !== '' && 
        manufacturer && manufacturer.trim() !== '' && 
        !hasAutoFetched) {
      // Auto-trigger enhanced data retrieval
      setShowFetchingBanner(true);
      
      // Give a slight delay so the user sees the banner first
      const timer = setTimeout(() => {
        runEnhancedDataRetrieval();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [deviceName, manufacturer, hasAutoFetched, runEnhancedDataRetrieval]);
  
  // Show reminder if user tries to use builder without retrieving data
  useEffect(() => {
    if (activeTab === 'builder' && 
        deviceName && deviceName.trim() !== '' && 
        !faers.length && 
        !literatureResult &&
        !hasAutoFetched) {
      setShowEvidenceReminder(true);
    } else {
      setShowEvidenceReminder(false);
    }
  }, [activeTab, deviceName, faers, literatureResult, hasAutoFetched]);

  // Removed duplicate runComplianceCheck function

  // Handle export
  const handleExport = async (format) => {
    try {
      let blob;
      if (format === 'pdf') {
        blob = await cerApiService.exportToPDF({ title, faers, comparators, sections });
        cerApiService.downloadBlob(blob, 'cer_report.pdf');
      } else {
        blob = await cerApiService.exportToWord({ title, faers, comparators, sections });
        cerApiService.downloadBlob(blob, 'cer_report.docx');
      }
      
      setExportTimestamp(new Date());
      
      toast({
        title: `Export successful`,
        description: `Report exported as ${format.toUpperCase()}.`,
        variant: "success"
      });
    } catch (error) {
      console.error(`Export failed:`, error);
      toast({
        title: `Export failed`,
        description: error.message || "An error occurred during export",
        variant: "destructive"
      });
    }
  };

  // Draft status badge color - MS365-inspired
  const getDraftStatusColor = () => {
    switch (draftStatus) {
      case 'in-progress': return 'bg-[#FFFCE5] text-[#986F0B] border-[#F2C811]';
      case 'ready-for-review': return 'bg-[#E5F2FF] text-[#0F6CBD] border-[#0F6CBD]';
      case 'finalized': return 'bg-[#DFF6DD] text-[#107C10] border-[#107C10]';
      default: return 'bg-[#F5F5F5] text-[#616161] border-[#BDBDBD]';
    }
  };

  // Draft status text
  const getDraftStatusText = () => {
    switch (draftStatus) {
      case 'in-progress': return 'Draft';
      case 'ready-for-review': return 'Ready for Review';
      case 'finalized': return 'Finalized';
      default: return 'Draft';
    }
  };

  // Draft status icon
  const getDraftStatusIcon = () => {
    switch (draftStatus) {
      case 'in-progress': return <Clock className="h-3 w-3 mr-1" />;
      case 'ready-for-review': return <FileCheck className="h-3 w-3 mr-1" />;
      case 'finalized': return <CheckSquare className="h-3 w-3 mr-1" />;
      default: return <FileText className="h-3 w-3 mr-1" />;
    }
  };

  // Generate a full CER using the "Zero-Click Report" feature
  const generateFullCER = async () => {
    if (!deviceName.trim()) {
      setShowDeviceInfoDialog(true);
      return;
    }
    
    try {
      setIsGeneratingFullCER(true);
      
      const deviceInfo = {
        name: deviceName,
        type: deviceType,
        manufacturer: manufacturer || 'Not specified',
        intendedUse: intendedUse || 'Not specified'
      };
      
      const result = await cerApiService.generateFullCER({
        deviceInfo,
        templateId: selectedTemplate,
        fdaData: faers.length > 0 ? { reports: faers, comparators } : null
      });
      
      // Update sections with generated content
      if (result && result.sections) {
        setSections(result.sections);
        setTitle(`${deviceName} Clinical Evaluation Report`);
        
        // Auto-run compliance check on the generated report
        await runComplianceCheck(result.sections);
        
        toast({
          title: 'CER Generation Complete',
          description: `Generated ${result.sections.length} sections following ${selectedTemplate.toUpperCase()} requirements.`,
          variant: 'success'
        });
        
        // Switch to preview tab
        setActiveTab('preview');
      }
    } catch (error) {
      console.error('Zero-click CER generation failed:', error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'An error occurred while generating the CER',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingFullCER(false);
    }
  };
  
  // Run compliance check with specified sections or current sections
  const runComplianceCheck = async (sectionsToCheck = sections) => {
    if (sectionsToCheck.length === 0) {
      toast({
        title: "No sections to analyze", 
        description: "Please add at least one section to your report.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsComplianceRunning(true);
      const result = await cerApiService.getComplianceScore({
        sections: sectionsToCheck,
        title,
        standards: ['EU MDR', 'ISO 14155', 'FDA']
      });
      
      setCompliance(result);
      
      if (result.overallScore >= 0.8) {
        setDraftStatus('ready-for-review');
      }
      
      toast({
        title: "Compliance check complete",
        description: `Overall score: ${Math.round(result.overallScore * 100)}%`,
        variant: result.overallScore >= 0.8 ? "success" : "warning"
      });
    } catch (error) {
      console.error('Compliance check failed:', error);
      toast({
        title: "Compliance check failed",
        description: error.message || "An error occurred during analysis",
        variant: "destructive"
      });
    } finally {
      setIsComplianceRunning(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Onboarding guide component */}
      <CerOnboardingGuide onDismiss={() => {
        toast({
          title: "Welcome to the CER Builder",
          description: "You can always restart the guide from the Help menu if you need it.",
          variant: "default"
        });
      }} />

      {/* MS365-inspired header */}
      <div className="border-b border-[#E1DFDD] px-4 py-3 flex justify-between items-center bg-white sticky top-0 z-10">
        <div className="flex items-center">
          <FileText className="h-5 w-5 text-[#0F6CBD] mr-2" />
          <h1 className="text-lg font-semibold text-[#323130]">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* 1-Click Evidence Fetch Button (moved from Data Retrieval tab) */}
          <Button 
            onClick={() => {
              if (activeTab !== 'data-retrieval') {
                setActiveTab('data-retrieval');
                
                // Give the tab time to render
                setTimeout(() => {
                  toast({
                    title: "Data Retrieval Tab",
                    description: "Use the 1-Click Evidence Fetch to get FAERS and literature data.",
                    variant: "default"
                  });
                }, 500);
              }
            }}
            className="bg-amber-500 hover:bg-amber-600 text-white h-8 mr-2"
            size="sm"
          >
            <Database className="h-3.5 w-3.5 mr-1.5" />
            <span>Get Evidence</span>
          </Button>

          {/* Zero-click generation button */}
          <Button 
            onClick={() => setShowDeviceInfoDialog(true)}
            className="bg-[#0F6CBD] hover:bg-[#115EA3] text-white h-8 mr-2"
            size="sm"
            disabled={isGeneratingFullCER}
          >
            {isGeneratingFullCER ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <ZapIcon className="h-3.5 w-3.5 mr-1.5" />
                <span>Zero-Click Report</span>
              </>
            )}
          </Button>
          
          {/* MS365-style status badges */}
          <Badge variant="outline" className={`px-2 py-1 text-xs font-normal border rounded-sm ${getDraftStatusColor()}`}>
            {getDraftStatusIcon()}
            <span>{getDraftStatusText()}</span>
          </Badge>
          
          {compliance && (
            <Badge variant="outline" className={`px-2 py-1 text-xs font-normal border rounded-sm ${compliance.overallScore >= 0.8 ? 'bg-[#DFF6DD] text-[#107C10] border-[#107C10]' : 'bg-[#FFFCE5] text-[#986F0B] border-[#F2C811]'}`}>
              {compliance.overallScore >= 0.8 ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
              <span>Compliance: {Math.round(compliance.overallScore * 100)}%</span>
            </Badge>
          )}
          
          {isFetchingFaers && (
            <Badge variant="outline" className="px-2 py-1 text-xs font-normal border rounded-sm bg-[#E5F2FF] text-[#0F6CBD] border-[#0F6CBD]">
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              <span>Fetching FAERS...</span>
            </Badge>
          )}
        </div>
      </div>
      
      {/* MS365-inspired main container */}
      <div className="container mx-auto p-4 bg-[#FAF9F8]">
        {/* Notification Banners */}
        {showFetchingBanner && (
          <NotificationBanner
            message="Fetching FDA FAERS + literature data—this usually takes ~20–30 seconds."
            type="loading"
            visible={showFetchingBanner}
            progress={retrievalProgress}
            evidenceSnapshot={evidenceSnapshot}
            showInfoIcon={true}
            infoTooltip="Pull in real-world adverse event data (FAERS) and key published studies—so your AI sections include actual safety and evidence."
            additionalContent="Why run this? AI section drafts will cite and analyze FAERS + literature automatically."
          />
        )}
        
        {showEvidenceReminder && (
          <NotificationBanner
            message="🔍 We recommend running Enhanced Retrieval first to pre-load safety & literature data."
            type="warning"
            action={{
              label: "Run now",
              onClick: runEnhancedDataRetrieval
            }}
            secondaryAction={{
              label: "Skip",
              onClick: () => setShowEvidenceReminder(false)
            }}
            visible={showEvidenceReminder}
            showInfoIcon={true}
            infoTooltip="Pull in real-world adverse event data (FAERS) and key published studies—so your AI sections include actual safety and evidence."
            additionalContent="Why run this? AI section drafts will cite and analyze FAERS + literature automatically."
          />
        )}
        
        {/* MS365-style tabs */}
        <Tabs defaultValue="builder" className="w-full" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="flex flex-wrap bg-transparent p-0 mb-4 border-b border-[#E1DFDD] w-full gap-1">
            <TabsTrigger 
              value="builder" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F6CBD] data-[state=active]:text-[#0F6CBD] data-[state=active]:shadow-none bg-transparent px-3 py-2 font-normal text-[#616161] text-xs sm:text-sm"
            >
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              <span>Builder</span>
            </TabsTrigger>
            <TabsTrigger 
              value="literature" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F6CBD] data-[state=active]:text-[#0F6CBD] data-[state=active]:shadow-none bg-transparent px-3 py-2 font-normal text-[#616161] text-xs sm:text-sm"
            >
              <BookOpen className="h-3.5 w-3.5 mr-1.5" />
              <span>Literature</span>
            </TabsTrigger>
            <TabsTrigger 
              value="equivalence" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F6CBD] data-[state=active]:text-[#0F6CBD] data-[state=active]:shadow-none bg-transparent px-3 py-2 font-normal text-[#616161] text-xs sm:text-sm"
            >
              <GitCompare className="h-3.5 w-3.5 mr-1.5" />
              <span>Equivalence</span>
            </TabsTrigger>
            <TabsTrigger 
              value="compliance" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F6CBD] data-[state=active]:text-[#0F6CBD] data-[state=active]:shadow-none bg-transparent px-3 py-2 font-normal text-[#616161] text-xs sm:text-sm"
            >
              <CheckSquare className="h-3.5 w-3.5 mr-1.5" />
              <span>Compliance</span>
            </TabsTrigger>
            <TabsTrigger 
              value="assistant" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F6CBD] data-[state=active]:text-[#0F6CBD] data-[state=active]:shadow-none bg-transparent px-3 py-2 font-normal text-[#616161] text-xs sm:text-sm"
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
              <span>Assistant</span>
            </TabsTrigger>
            <TabsTrigger 
              value="preview" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F6CBD] data-[state=active]:text-[#0F6CBD] data-[state=active]:shadow-none bg-transparent px-3 py-2 font-normal text-[#616161] text-xs sm:text-sm"
            >
              <BarChart className="h-3.5 w-3.5 mr-1.5" />
              <span>Preview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="documents" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F6CBD] data-[state=active]:text-[#0F6CBD] data-[state=active]:shadow-none bg-transparent px-3 py-2 font-normal text-[#616161] text-xs sm:text-sm"
            >
              <FolderOpen className="h-3.5 w-3.5 mr-1.5" />
              <span>Documents</span>
            </TabsTrigger>
            <TabsTrigger 
              value="data-retrieval" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F6CBD] data-[state=active]:text-[#0F6CBD] data-[state=active]:shadow-none bg-transparent px-3 py-2 font-normal text-[#616161] text-xs sm:text-sm"
            >
              <Database className="h-3.5 w-3.5 mr-1.5" />
              <span>Data Retrieval</span>
            </TabsTrigger>
            <TabsTrigger 
              value="sota" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F6CBD] data-[state=active]:text-[#0F6CBD] data-[state=active]:shadow-none bg-transparent px-3 py-2 font-normal text-[#616161] text-xs sm:text-sm"
            >
              <BookMarked className="h-3.5 w-3.5 mr-1.5" />
              <span>State of Art</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="cep" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F6CBD] data-[state=active]:text-[#0F6CBD] data-[state=active]:shadow-none bg-transparent px-3 py-2 font-normal text-[#616161] text-xs sm:text-sm"
            >
              <ClipboardList className="h-3.5 w-3.5 mr-1.5" />
              <span>Evaluation Plan</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="export" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F6CBD] data-[state=active]:text-[#0F6CBD] data-[state=active]:shadow-none bg-transparent px-3 py-2 font-normal text-[#616161] text-xs sm:text-sm"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              <span>Export</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="builder" className="mt-0">
            <CerBuilderPanel
              title={title}
              faers={faers}
              comparators={comparators}
              sections={sections}
              onTitleChange={setTitle}
              onSectionsChange={setSections}
              onFaersChange={setFaers}
              onComparatorsChange={setComparators}
            />
          </TabsContent>

          <TabsContent value="literature" className="mt-0">
            {/* Nested tabs for Literature section */}
            <Tabs defaultValue="search" className="w-full">
              <TabsList className="bg-white border-b border-gray-200 rounded-none w-full flex justify-start">
                <TabsTrigger value="search" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F6CBD] data-[state=active]:text-[#0F6CBD] data-[state=active]:shadow-none bg-transparent px-3 py-2 font-normal text-[#616161]">
                  Search & Analyze
                </TabsTrigger>
                <TabsTrigger value="methodology" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F6CBD] data-[state=active]:text-[#0F6CBD] data-[state=active]:shadow-none bg-transparent px-3 py-2 font-normal text-[#616161]">
                  Search Methodology
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="search" className="mt-4">
                <LiteratureSearchPanel
                  onAddSection={(newSection) => {
                    setSections([...sections, newSection]);
                    toast({
                      title: "Literature Review Added",
                      description: "Added to your CER.",
                      variant: "success",
                    });
                  }}
                  deviceName={deviceName}
                  manufacturer={manufacturer}
                  cerTitle={title}
                />
              </TabsContent>
              
              <TabsContent value="methodology" className="mt-4">
                <LiteratureMethodologyPanel
                  onAddToCER={(newSection) => {
                    setSections([...sections, newSection]);
                    toast({
                      title: "Literature Methodology Added",
                      description: "Search methodology documentation added to your CER.",
                      variant: "success",
                    });
                  }}
                  deviceName={deviceName}
                  deviceType={deviceType}
                  manufacturer={manufacturer}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>
          
          <TabsContent value="equivalence" className="mt-0">
            <EquivalenceBuilderPanel
              onEquivalenceDataChange={(data) => {
                setEquivalenceData(data);
                
                // Create a section for the Clinical Evaluation Report if we have equivalence data
                if (data && data.subjectDevice && data.equivalentDevices && data.equivalentDevices.length > 0) {
                  // Find existing equivalence section if it exists
                  const existingIndex = sections.findIndex(
                    section => section.type === 'device-equivalence' || 
                    (section.title && section.title.toLowerCase().includes('equivalence'))
                  );
                  
                  // Format the section content
                  const formattedContent = `
# Device Description and Equivalence Assessment

## Subject Device Description
**Device Name:** ${data.subjectDevice.name || 'Not specified'}
**Manufacturer:** ${data.subjectDevice.manufacturer || 'Not specified'}
**Model/Version:** ${data.subjectDevice.model || 'Not specified'}

${data.subjectDevice.description ? `**Description:** ${data.subjectDevice.description}` : ''}

## Equivalent Device Comparison
This section presents a detailed comparison between the subject device and claimed equivalent devices, following MEDDEV 2.7/1 Rev 4 requirements for device equivalence justification.

${data.equivalentDevices.map(device => `
### ${device.name} (${device.manufacturer})
${device.description ? `**Description:** ${device.description}\n` : ''}

${device.features && device.features.length > 0 ? `
#### Feature Comparison
${device.features.map(feature => `
- **${feature.name}** (${feature.category})
  - Subject Device: ${feature.subjectValue}
  - Equivalent Device: ${feature.equivalentValue}
  - Assessment: ${feature.impact === 'none' ? 'No Significant Difference' : 
                 feature.impact === 'minor' ? 'Minor Difference' : 
                 feature.impact === 'moderate' ? 'Moderate Difference' : 
                 'Significant Difference'}
  - Rationale: ${feature.rationale || 'Not provided'}
`).join('')}
` : ''}

${device.overallRationale ? `
#### Overall Equivalence Assessment
${device.overallRationale}
` : ''}
`).join('\n')}
                  `;
                  
                  // Create or update section
                  if (existingIndex >= 0) {
                    const updatedSections = [...sections];
                    updatedSections[existingIndex] = {
                      ...updatedSections[existingIndex],
                      content: formattedContent,
                      lastUpdated: new Date().toISOString()
                    };
                    setSections(updatedSections);
                    
                    toast({
                      title: "Equivalence Section Updated",
                      description: "Device equivalence information has been updated in your CER.",
                      variant: "success",
                    });
                  } else {
                    const newSection = {
                      title: "Device Description and Equivalence",
                      type: "device-equivalence",
                      content: formattedContent,
                      lastUpdated: new Date().toISOString()
                    };
                    
                    setSections([...sections, newSection]);
                    
                    toast({
                      title: "Equivalence Section Added",
                      description: "Device equivalence information has been added to your CER.",
                      variant: "success",
                    });
                  }
                }
              }}
            />
          </TabsContent>

          <TabsContent value="compliance" className="mt-0">
            <ComplianceScorePanel
              sections={sections}
              title={title}
              onComplianceChange={setCompliance}
              onStatusChange={setDraftStatus}
            />
          </TabsContent>
          
          <TabsContent value="assistant" className="mt-0">
            <CerAssistantPanel
              sections={sections}
              title={title}
              faers={faers}
            />
          </TabsContent>

          <TabsContent value="preview" className="mt-0">
            <CerPreviewPanel
              title={title}
              faers={faers}
              comparators={comparators}
              sections={sections}
              complianceData={compliance}
            />
          </TabsContent>
          
          <TabsContent value="documents" className="mt-0">
            <DocumentVaultPanel 
              jobId={`cer-${Date.now()}`} 
            />
          </TabsContent>
          
          <TabsContent value="data-retrieval" className="mt-0">
            <CerDataRetrievalPanel
              reportId={`cer-${Date.now()}`}
              deviceName={deviceName}
              onDataUpdated={(data) => {
                if (data.type === 'faers' && data.data) {
                  setFaers(data.data.reports || []);
                  setComparators(data.data.comparators || []);
                  toast({
                    title: "FAERS Data Retrieved",
                    description: `Loaded ${data.data.reports?.length || 0} adverse event reports.`,
                    variant: "success"
                  });
                }
              }}
            />
          </TabsContent>
          
          <TabsContent value="sota" className="mt-0">
            <StateOfArtPanel
              onSectionGenerated={(sotaSection) => {
                // Check if we already have a SOTA section
                const existingIndex = sections.findIndex(
                  section => section.type === 'state-of-art' || 
                  (section.title && section.title.toLowerCase().includes('state of the art'))
                );
                
                if (existingIndex >= 0) {
                  // Update existing section
                  const updatedSections = [...sections];
                  updatedSections[existingIndex] = {
                    ...updatedSections[existingIndex],
                    content: sotaSection.content,
                    lastUpdated: new Date().toISOString()
                  };
                  setSections(updatedSections);
                  
                  toast({
                    title: "State of the Art Section Updated",
                    description: "SOTA analysis has been updated in your CER.",
                    variant: "success"
                  });
                } else {
                  // Add new section
                  setSections([...sections, sotaSection]);
                  
                  toast({
                    title: "State of the Art Section Added",
                    description: "SOTA analysis has been added to your CER.",
                    variant: "success"
                  });
                }
              }}
            />
          </TabsContent>

          <TabsContent value="cep" className="mt-0">
            <ClinicalEvaluationPlanPanel
              deviceName={deviceName}
              manufacturer={manufacturer}
              initialData={cepData}
              cerData={{
                title,
                deviceType,
                sections
              }}
              onUpdateCEP={(updatedCepData, linkToCER = false) => {
                // Store the updated CEP data
                setCepData(updatedCepData);
                
                if (linkToCER) {
                  // Generate a new section or update existing one based on CEP data
                  const cepSection = {
                    title: "Clinical Evaluation Plan",
                    type: "clinical-evaluation-plan",
                    content: `
# Clinical Evaluation Plan

## 1. Device Information
**Device Name:** ${updatedCepData.deviceName || deviceName}
**Manufacturer:** ${updatedCepData.manufacturer || manufacturer}
**Model Numbers:** ${updatedCepData.modelNumbers || 'Not specified'}

${updatedCepData.deviceDescription ? `**Device Description:**\n${updatedCepData.deviceDescription}\n` : ''}

## 2. Scope of the Clinical Evaluation
**Intended Purpose:**\n${updatedCepData.intendedPurpose || 'Not specified'}

**Target Population:**\n${updatedCepData.targetPopulation || 'Not specified'}

**Clinical Benefits:**\n${updatedCepData.clinicalBenefits || 'Not specified'}

**Risk Profile:**\n${updatedCepData.riskProfile || 'Not specified'}

## 3. Clinical Questions to be Addressed

### Safety Questions:
${updatedCepData.safetyQuestions || 'Not specified'}

### Performance Questions:
${updatedCepData.performanceQuestions || 'Not specified'}

### Risk-Benefit Questions:
${updatedCepData.riskBenefitQuestions || 'Not specified'}

## 4. Data Sources for Clinical Evaluation
${updatedCepData.useClinicalInvestigations ? '- **Clinical Investigations**: Studies specifically conducted for this device\n' : ''}
${updatedCepData.usePMCF ? '- **Post-Market Clinical Follow-up**: PMCF studies and reports\n' : ''}
${updatedCepData.useLiterature ? '- **Scientific Literature**: Published studies and papers\n' : ''}
${updatedCepData.useRegistries ? '- **Registry Data**: Data from device registries\n' : ''}
${updatedCepData.useComplaints ? '- **Complaints & Vigilance**: Post-market surveillance data\n' : ''}
${updatedCepData.useNonClinical ? '- **Non-Clinical Studies**: Lab tests, bench testing, animal studies\n' : ''}
${updatedCepData.useEquivalentDevices ? '- **Equivalent Device Data**: Clinical data from equivalent devices\n' : ''}

${updatedCepData.useEquivalentDevices && updatedCepData.equivalentDeviceDetails ? `### Equivalent Device Details:
${updatedCepData.equivalentDeviceDetails}\n` : ''}

## 5. GSPRs to be Addressed in the Clinical Evaluation
${updatedCepData.selectedGSPRs && updatedCepData.selectedGSPRs.length > 0 
  ? updatedCepData.selectedGSPRs.map(gsprId => {
      const gspr = (Array.isArray(gspr) && gspr.length > 0) 
        ? gspr.find(g => g.id === gsprId) 
        : { title: `GSPR ${gsprId}`, description: 'Not specified' };
      return `### ${gspr?.title || `GSPR ${gsprId}`}
${gspr?.description || 'Not specified'}

**Justification Approach:**
${updatedCepData.gspr_justifications[gsprId] || 'To be determined during clinical evaluation'}\n`;
    }).join('\n')
  : '- No specific GSPRs selected for this evaluation.\n'}

## 6. Methods

### Literature Search Strategy:
${updatedCepData.literatureSearchStrategy || 'Not specified'}

### Data Analysis Methods:
${updatedCepData.dataAnalysisMethods || 'Not specified'}

### Clinical Evaluation Team:
${updatedCepData.clinicalEvaluationTeam || 'Not specified'}

### Evaluation Criteria:
${updatedCepData.evaluationCriteria || 'Not specified'}
                    `,
                    lastUpdated: new Date().toISOString()
                  };
                  
                  // Check if we already have a CEP section
                  const existingIndex = sections.findIndex(
                    section => section.type === 'clinical-evaluation-plan' || 
                    (section.title && section.title.toLowerCase().includes('clinical evaluation plan'))
                  );
                  
                  if (existingIndex >= 0) {
                    // Update existing section
                    const updatedSections = [...sections];
                    updatedSections[existingIndex] = {
                      ...updatedSections[existingIndex],
                      content: cepSection.content,
                      lastUpdated: new Date().toISOString()
                    };
                    setSections(updatedSections);
                    
                    toast({
                      title: "Clinical Evaluation Plan Updated",
                      description: "CEP has been updated in your CER.",
                      variant: "success"
                    });
                  } else {
                    // Add new section
                    setSections([...sections, cepSection]);
                    
                    toast({
                      title: "Clinical Evaluation Plan Added",
                      description: "CEP has been added to your CER.",
                      variant: "success"
                    });
                  }
                }
              }}
            />
          </TabsContent>

          <TabsContent value="export" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 border border-[#E1DFDD] rounded">
              <div className="bg-white p-4 border border-[#E1DFDD] rounded">
                <h3 className="text-[#323130] font-semibold mb-4">Export Options</h3>
                <div className="space-y-3">
                  <Button 
                    onClick={() => handleExport('pdf')} 
                    className="w-full justify-start bg-[#0F6CBD] hover:bg-[#115EA3] text-white" 
                    disabled={sections.length === 0}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export as PDF
                  </Button>
                  <Button 
                    onClick={() => handleExport('docx')} 
                    className="w-full justify-start bg-white hover:bg-[#EFF6FC] text-[#0F6CBD] border border-[#0F6CBD]" 
                    variant="outline"
                    disabled={sections.length === 0}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export as Word Document
                  </Button>
                </div>
              </div>
              <div className="bg-white p-4 border border-[#E1DFDD] rounded">
                <h3 className="text-[#323130] font-semibold mb-4">Report Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-[#F3F2F1]">
                    <span className="text-[#616161]">Title:</span>
                    <span className="text-[#323130]">{title}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#F3F2F1]">
                    <span className="text-[#616161]">Sections:</span>
                    <span className="text-[#323130]">{sections.length}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#F3F2F1]">
                    <span className="text-[#616161]">FAERS Data:</span>
                    <span className="text-[#323130]">{faers.length > 0 ? 'Included' : 'Not included'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#F3F2F1]">
                    <span className="text-[#616161]">Compliance:</span>
                    <span className="text-[#323130]">
                      {compliance ? `${Math.round(compliance.overallScore * 100)}%` : 'Not checked'}
                    </span>
                  </div>
                  {exportTimestamp && (
                    <div className="flex justify-between py-1 border-b border-[#F3F2F1]">
                      <span className="text-[#616161]">Last Export:</span>
                      <span className="text-[#323130]">{exportTimestamp.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Device Info Dialog for Zero-Click Report Generation */}
      <Dialog open={showDeviceInfoDialog} onOpenChange={setShowDeviceInfoDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-[#323130]">Zero-Click CER Generation</DialogTitle>
            <DialogDescription className="text-[#616161]">
              Enter your medical device information to generate a complete CER with regulatory compliance built-in.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="device-name" className="text-[#323130]">
                Device Name <span className="text-[#D83B01]">*</span>
              </Label>
              <Input
                id="device-name"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="e.g., Stentra LX"
                className="border-[#E1DFDD]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="device-type" className="text-[#323130]">
                Device Classification <span className="text-[#D83B01]">*</span>
              </Label>
              <Select value={deviceType} onValueChange={setDeviceType}>
                <SelectTrigger id="device-type" className="border-[#E1DFDD]">
                  <SelectValue placeholder="Select device classification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Class I Medical Device">Class I Medical Device</SelectItem>
                  <SelectItem value="Class II Medical Device">Class II Medical Device</SelectItem>
                  <SelectItem value="Class III Medical Device">Class III Medical Device</SelectItem>
                  <SelectItem value="IVD Device">IVD Device</SelectItem>
                  <SelectItem value="Software as Medical Device">Software as Medical Device</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="manufacturer" className="text-[#323130]">
                Manufacturer
              </Label>
              <Input
                id="manufacturer"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="e.g., MedTech Innovations Inc."
                className="border-[#E1DFDD]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="intended-use" className="text-[#323130]">
                Intended Use
              </Label>
              <Input
                id="intended-use"
                value={intendedUse}
                onChange={(e) => setIntendedUse(e.target.value)}
                placeholder="e.g., Cardiac monitoring and diagnostic use"
                className="border-[#E1DFDD]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="template" className="text-[#323130]">
                Regulatory Template <span className="text-[#D83B01]">*</span>
              </Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger id="template" className="border-[#E1DFDD]">
                  <SelectValue placeholder="Select regulatory template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eu-mdr">EU MDR (Annex XIV)</SelectItem>
                  <SelectItem value="iso-14155">ISO 14155</SelectItem>
                  <SelectItem value="fda-510k">FDA 510(k)</SelectItem>
                  <SelectItem value="eu-ivdr">EU IVDR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {deviceName && (
              <div className="rounded-md p-2 bg-[#E5F2FF] border border-[#0F6CBD] text-xs text-[#323130]">
                <p>FAERS data will be automatically retrieved for "{deviceName}" to include adverse event analysis.</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeviceInfoDialog(false)}
              className="border-[#E1DFDD] text-[#616161]"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setShowDeviceInfoDialog(false);
                generateFullCER();
              }}
              disabled={!deviceName.trim() || !deviceType || isGeneratingFullCER}
              className="bg-[#0F6CBD] hover:bg-[#115EA3] text-white"
            >
              {isGeneratingFullCER ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>Generate Full CER</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}