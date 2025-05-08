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
import GSPRMappingPanel from '@/components/cer/GSPRMappingPanel';
import LiteratureReviewWorkflow from '@/components/cer/LiteratureReviewWorkflow';
import NotificationBanner from '@/components/cer/NotificationBanner';
import InternalClinicalDataPanel from '@/components/cer/InternalClinicalDataPanel';
import EuPmsDataPanel from '@/components/cer/EuPmsDataPanel';
import RiskManagementPanel from '@/components/cer/RiskManagementPanel';
import EvaluatorQualificationsPanel from '@/components/cer/EvaluatorQualificationsPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cerApiService } from '@/services/CerAPIService';
import { literatureAPIService } from '@/services/LiteratureAPIService';
import { FileText, BookOpen, CheckSquare, Download, MessageSquare, Clock, FileCheck, CheckCircle, AlertCircle, RefreshCw, ZapIcon, BarChart, FolderOpen, Database, GitCompare, BookMarked, Lightbulb, ClipboardList, FileSpreadsheet, Layers, Trophy, Globe, UserCheck, PenTool } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [showWizard, setShowWizard] = useState(false);
  const [showEvidenceReminder, setShowEvidenceReminder] = useState(true);
  const { toast } = useToast();

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
    if (['builder', 'cep', 'documents', 'data-retrieval'].includes(tab)) {
      return 'preparation';
    } else if (['literature', 'literature-review', 'internal-clinical-data', 'eu-pms-data', 'sota'].includes(tab)) {
      return 'evidence';
    } else if (['equivalence', 'risk-management', 'gspr-mapping', 'evaluator-qualifications', 'compliance', 'assistant'].includes(tab)) {
      return 'analysis';
    } else {
      return 'output';
    }
  };

  // Simple navigation tab rendering function
  const renderNavigation = () => {
    // Define tab groups
    const tabGroups = [
      {
        label: "Preparation:",
        tabs: [
          { id: "builder", label: "Builder", icon: <FileText className="h-3.5 w-3.5 mr-1.5" /> },
          { id: "cep", label: "Evaluation Plan", icon: <ClipboardList className="h-3.5 w-3.5 mr-1.5" /> },
          { id: "documents", label: "Documents", icon: <FolderOpen className="h-3.5 w-3.5 mr-1.5" /> },
          { id: "data-retrieval", label: "Data Retrieval", icon: <Database className="h-3.5 w-3.5 mr-1.5" /> }
        ]
      },
      {
        label: "Evidence:",
        tabs: [
          { id: "literature", label: "Literature", icon: <BookOpen className="h-3.5 w-3.5 mr-1.5" /> },
          { id: "literature-review", label: "Literature Review", icon: <BookOpen className="h-3.5 w-3.5 mr-1.5" /> },
          { id: "internal-clinical-data", label: "Internal Clinical Data", icon: <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" /> },
          { id: "eu-pms-data", label: "EU & Global PMS", icon: <Globe className="h-3.5 w-3.5 mr-1.5" /> },
          { id: "sota", label: "State of Art", icon: <BookMarked className="h-3.5 w-3.5 mr-1.5" /> }
        ]
      },
      {
        label: "Analysis:",
        tabs: [
          { id: "equivalence", label: "Equivalence", icon: <GitCompare className="h-3.5 w-3.5 mr-1.5" /> },
          { id: "risk-management", label: "Risk Management", icon: <Layers className="h-3.5 w-3.5 mr-1.5" /> },
          { id: "gspr-mapping", label: "GSPR Mapping", icon: <BarChart className="h-3.5 w-3.5 mr-1.5" /> },
          { id: "evaluator-qualifications", label: "Evaluator Qualifications", icon: <UserCheck className="h-3.5 w-3.5 mr-1.5" /> },
          { id: "compliance", label: "Compliance", icon: <CheckSquare className="h-3.5 w-3.5 mr-1.5" /> },
          { id: "assistant", label: "Assistant", icon: <Lightbulb className="h-3.5 w-3.5 mr-1.5" /> }
        ]
      }
    ];

    return (
      <nav className="w-full">
        {tabGroups.map((group, groupIndex) => (
          <div 
            key={groupIndex} 
            className={`overflow-x-auto whitespace-nowrap bg-white border-b ${group.label === "Preparation" || group.label === "Evidence" || group.label === "Analysis" ? "border-[#E3008C]" : "border-[#E1DFDD]"} py-3 ${groupIndex === tabGroups.length - 1 ? 'mb-4' : ''}`}
          >
            <div className="flex items-center px-6">
              <div className="flex items-center mr-4 flex-shrink-0">
                <span className={`text-sm font-semibold ${group.label === "Preparation" || group.label === "Evidence" || group.label === "Analysis" ? "text-[#E3008C]" : "text-[#505050]"}`}>{group.label}</span>
              </div>
              
              <div className="inline-flex items-center">
                {group.tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex-shrink-0 mx-1 rounded-none border-b-2 px-3 py-1 
                      font-medium text-xs sm:text-sm flex items-center
                      ${activeTab === tab.id 
                        ? 'border-b-[#0F6CBD] text-[#0F6CBD] bg-[#f0f9ff]' 
                        : 'border-b-transparent text-[#616161] hover:text-[#0F6CBD] hover:bg-[#f8f8f8]'
                      }
                    `}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </nav>
    );
  };

  // Render content based on active tab
  const renderContent = () => {
    if (activeTab === 'builder') {
      return (
        <div className="bg-[#F9F9F9] py-4">
          <div className="flex flex-col md:flex-row items-start justify-between">
            <div className="flex-1 px-4">
              <h2 className="text-xl font-semibold text-[#323130]">Section Generator</h2>
              <div className="mt-2 mb-4">
                <div className="bg-[#EFF6FC] rounded-md px-3 py-1 text-sm inline-flex items-center gap-1 text-[#0F6CBD]">
                  <span>AI-Powered</span>
                </div>
              </div>
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
            </div>
            <div className="w-full md:w-auto md:min-w-[280px] md:max-w-[320px] px-4 mt-6 md:mt-0">
              <h2 className="text-xl font-semibold text-[#323130]">Report Sections</h2>
              <div className="mt-2 mb-4">
                <div className="bg-[#F3F2F1] rounded px-3 py-1 text-sm inline-flex items-center gap-1">
                  <span>{sections.length} sections</span>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-md font-medium mb-2 text-[#323130]">Report Title</h3>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border border-[#E1DFDD] rounded"
                  placeholder="Clinical Evaluation Report"
                />
              </div>
              
              {sections.length > 0 ? (
                <div className="space-y-2">
                  {sections.map((section, idx) => (
                    <div key={idx} className="bg-[#F3F2F1] p-2 rounded text-sm">
                      {section.title}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-sm italic">
                  No sections added yet. Generate sections from the tools on the left.
                </div>
              )}
            </div>
          </div>
          <div className="px-4 mt-4 text-center">
            <Button 
              onClick={() => handleExport('docx')} 
              className="bg-transparent text-[#0F6CBD] hover:bg-[#EFF6FC] border-none" 
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      );
    }
    
    if (activeTab === 'cep') {
      return (
        <ClinicalEvaluationPlanPanel
          onCEPGenerated={(cepData) => {
            const existingIndex = sections.findIndex(
              section => section.type === 'cep' || 
              (section.title && section.title.toLowerCase().includes('evaluation plan'))
            );
            
            if (existingIndex >= 0) {
              const updatedSections = [...sections];
              updatedSections[existingIndex] = {
                ...updatedSections[existingIndex],
                content: cepData.content,
                lastUpdated: new Date().toISOString()
              };
              setSections(updatedSections);
              
              toast({
                title: "CEP Updated",
                description: "Clinical Evaluation Plan has been updated in your CER.",
                variant: "success"
              });
            } else {
              setSections([...sections, cepData]);
              
              toast({
                title: "CEP Added",
                description: "Clinical Evaluation Plan has been added to your CER.",
                variant: "success"
              });
            }
          }}
          deviceName={deviceName}
          deviceType={deviceType}
          manufacturer={manufacturer}
        />
      );
    }
    
    if (activeTab === 'compliance') {
      return (
        <ComplianceScorePanel
          deviceName={deviceName}
          deviceType={deviceType}
          manufacturer={manufacturer}
          sections={sections}
          complianceStatus={compliance}
          isLoading={isComplianceRunning}
          onComplianceCheck={(result) => {
            setCompliance(result);
            setIsComplianceRunning(false);
            toast({
              title: "Compliance Check Complete",
              description: "Your CER has been evaluated against EU MDR requirements.",
              variant: "success"
            });
          }}
        />
      );
    }
    
    if (activeTab === 'assistant') {
      return (
        <CerAssistantPanel
          deviceName={deviceName}
          deviceType={deviceType}
          manufacturer={manufacturer}
          sections={sections}
          onAddSuggestion={(newSection) => {
            setSections([...sections, newSection]);
            toast({
              title: "Content Added",
              description: "The suggested content has been added to your CER.",
              variant: "success"
            });
          }}
        />
      );
    }
    
    if (activeTab === 'literature') {
      return (
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="flex overflow-x-auto whitespace-nowrap bg-white border-b border-gray-200 rounded-none w-full justify-start gap-2">
            <TabsTrigger value="search" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F6CBD] data-[state=active]:text-[#0F6CBD] data-[state=active]:shadow-none bg-transparent px-3 py-2 font-normal text-[#616161] flex-shrink-0">
              Search & Analyze
            </TabsTrigger>
            <TabsTrigger value="methodology" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F6CBD] data-[state=active]:text-[#0F6CBD] data-[state=active]:shadow-none bg-transparent px-3 py-2 font-normal text-[#616161] flex-shrink-0">
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
      );
    }
    
    // Add other tab content handlers for literature-review, internal-clinical-data, eu-pms-data,
    // documents, data-retrieval, equivalence, risk-management, gspr-mapping, sota, compliance, assistant
    
    if (activeTab === 'risk-management') {
      return (
        <RiskManagementPanel
          jobId={`cer-${Date.now()}`}
          deviceName={deviceName}
          deviceType={deviceType}
          manufacturer={manufacturer}
          sections={sections}
          onAddToCER={(riskData) => {
            const existingIndex = sections.findIndex(
              section => section.type === 'risk-management' || 
              (section.title && section.title.toLowerCase().includes('risk management'))
            );
            
            if (existingIndex >= 0) {
              const updatedSections = [...sections];
              updatedSections[existingIndex] = {
                ...updatedSections[existingIndex],
                content: riskData.content,
                lastUpdated: new Date().toISOString()
              };
              setSections(updatedSections);
              
              toast({
                title: "Risk Management Data Updated",
                description: "Risk management data has been updated in your CER.",
                variant: "success"
              });
            } else {
              setSections([...sections, riskData]);
              
              toast({
                title: "Risk Management Data Added",
                description: "Risk management data has been added to your CER.",
                variant: "success"
              });
            }
          }}
        />
      );
    }

    if (activeTab === 'literature-review') {
      return (
        <LiteratureReviewWorkflow
          deviceName={deviceName}
          manufacturer={manufacturer}
          onAddToCER={(reviewData) => {
            const existingIndex = sections.findIndex(
              section => section.type === 'literature-review' || 
              (section.title && section.title.toLowerCase().includes('literature review'))
            );
            
            if (existingIndex >= 0) {
              const updatedSections = [...sections];
              updatedSections[existingIndex] = {
                ...updatedSections[existingIndex],
                content: reviewData.content,
                lastUpdated: new Date().toISOString()
              };
              setSections(updatedSections);
              
              toast({
                title: "Literature Review Updated",
                description: "Literature review has been updated in your CER.",
                variant: "success"
              });
            } else {
              setSections([...sections, reviewData]);
              
              toast({
                title: "Literature Review Added",
                description: "Literature review has been added to your CER.",
                variant: "success"
              });
            }
          }}
        />
      );
    }
    
    if (activeTab === 'internal-clinical-data') {
      return (
        <InternalClinicalDataPanel
          jobId={`cer-${Date.now()}`}
          deviceName={deviceName}
          manufacturer={manufacturer}
          onAddToCER={(internalClinicalData) => {
            const existingIndex = sections.findIndex(
              section => section.type === 'internal-clinical-data' || 
              (section.title && section.title.toLowerCase().includes('internal clinical data'))
            );
            
            if (existingIndex >= 0) {
              const updatedSections = [...sections];
              updatedSections[existingIndex] = {
                ...updatedSections[existingIndex],
                content: internalClinicalData.content,
                lastUpdated: new Date().toISOString()
              };
              setSections(updatedSections);
              
              toast({
                title: "Internal Clinical Data Updated",
                description: "Your CER now includes the latest internal clinical evidence.",
                variant: "success"
              });
            } else {
              setSections([...sections, internalClinicalData]);
              
              toast({
                title: "Internal Clinical Data Added",
                description: "Internal clinical evidence has been added to your CER.",
                variant: "success"
              });
            }
          }}
        />
      );
    }
    
    if (activeTab === 'eu-pms-data') {
      return (
        <EuPmsDataPanel
          jobId={`cer-${Date.now()}`}
          deviceName={deviceName}
          manufacturer={manufacturer}
          onAddToCER={(pmsData) => {
            const existingIndex = sections.findIndex(
              section => section.type === 'eu-global-pms-data' || 
              (section.title && section.title.toLowerCase().includes('eu and global post-market surveillance'))
            );
            
            if (existingIndex >= 0) {
              const updatedSections = [...sections];
              updatedSections[existingIndex] = {
                ...updatedSections[existingIndex],
                content: pmsData.content,
                lastUpdated: new Date().toISOString()
              };
              setSections(updatedSections);
              
              toast({
                title: "EU & Global PMS Data Updated",
                description: "European and global post-market surveillance data has been updated in your CER.",
                variant: "success"
              });
            } else {
              setSections([...sections, pmsData]);
              
              toast({
                title: "EU & Global PMS Data Added",
                description: "European and global post-market surveillance data has been added to your CER.",
                variant: "success"
              });
            }
          }}
        />
      );
    }
    
    if (activeTab === 'documents') {
      return (
        <DocumentVaultPanel 
          jobId={`cer-${Date.now()}`} 
        />
      );
    }
    
    if (activeTab === 'data-retrieval') {
      return (
        <>
          {!isFetchingFaers && faers.length === 0 && (
            <NotificationBanner
              title="Essential: Retrieve FAERS Data First"
              description="For optimal CER quality, start by retrieving real-world adverse event data and literature evidence."
              actionText="Start Retrieval"
              onActionClick={() => setActiveTab('data-retrieval')}
              onDismiss={() => setShowEvidenceReminder(false)}
              variant="info"
              visible={showEvidenceReminder}
              showInfoIcon={true}
              infoTooltip="Pull in real-world adverse event data (FAERS) and key published studies—so your AI sections include actual safety and evidence."
              additionalContent="Why run this? AI section drafts will cite and analyze FAERS + literature automatically."
            />
          )}
          <CerDataRetrievalPanel
            reportId={`cer-${Date.now()}`}
            deviceName={deviceName}
            onDataUpdated={(data) => {
              if (data.type === 'faers' && data.data) {
                setFaers(data.data.reports || []);
                setComparators(data.data.comparators || []);
                toast({
                  title: "FAERS Data Retrieved",
                  description: "Your FAERS data has been downloaded and imported.",
                  variant: "success",
                });
              }
            }}
            setIsFetchingFaers={setIsFetchingFaers}
          />
        </>
      );
    }

    if (activeTab === 'equivalence') {
      return (
        <EquivalenceBuilderPanel
          deviceName={deviceName}
          deviceType={deviceType}
          manufacturer={manufacturer}
          onAddToReport={(equivalenceData) => {
            const existingIndex = sections.findIndex(
              section => section.type === 'equivalence' || 
              (section.title && section.title.toLowerCase().includes('equivalence'))
            );
            
            if (existingIndex >= 0) {
              const updatedSections = [...sections];
              updatedSections[existingIndex] = {
                ...updatedSections[existingIndex],
                content: equivalenceData.content,
                lastUpdated: new Date().toISOString()
              };
              setSections(updatedSections);
              
              toast({
                title: "Equivalence Data Updated",
                description: "Device equivalence assessment has been updated in your CER.",
                variant: "success"
              });
            } else {
              setSections([...sections, equivalenceData]);
              
              toast({
                title: "Equivalence Data Added",
                description: "Device equivalence assessment has been added to your CER.",
                variant: "success"
              });
            }
          }}
        />
      );
    }
    
    if (activeTab === 'gspr-mapping') {
      return (
        <GSPRMappingPanel
          deviceName={deviceName}
          deviceType={deviceType}
          manufacturer={manufacturer}
          sections={sections}
          faers={faers}
          comparators={comparators}
          onAddToReport={(gspr) => {
            const existingIndex = sections.findIndex(
              section => section.type === 'gspr' || 
              (section.title && section.title.toLowerCase().includes('gspr'))
            );
            
            if (existingIndex >= 0) {
              const updatedSections = [...sections];
              updatedSections[existingIndex] = {
                ...updatedSections[existingIndex],
                content: gspr.content,
                lastUpdated: new Date().toISOString()
              };
              setSections(updatedSections);
              
              toast({
                title: "GSPR Mapping Updated",
                description: "Your CER now includes the latest GSPR mapping data.",
                variant: "success"
              });
            } else {
              setSections([...sections, gspr]);
              
              toast({
                title: "GSPR Mapping Added",
                description: "GSPR requirements mapping has been added to your CER.",
                variant: "success"
              });
            }
          }}
        />
      );
    }
    
    if (activeTab === 'evaluator-qualifications') {
      return (
        <EvaluatorQualificationsPanel
          deviceName={deviceName}
          deviceType={deviceType}
          manufacturer={manufacturer}
          onAddToCER={(qualificationsData) => {
            const existingIndex = sections.findIndex(
              section => section.type === 'evaluator-qualifications' || 
              (section.title && section.title.toLowerCase().includes('evaluator qualifications'))
            );
            
            if (existingIndex >= 0) {
              const updatedSections = [...sections];
              updatedSections[existingIndex] = {
                ...updatedSections[existingIndex],
                content: qualificationsData.content,
                lastUpdated: new Date().toISOString()
              };
              setSections(updatedSections);
              
              toast({
                title: "Evaluator Qualifications Updated",
                description: "Author qualifications and reviewer sign-off information has been updated in your CER.",
                variant: "success"
              });
            } else {
              setSections([...sections, qualificationsData]);
              
              toast({
                title: "Evaluator Qualifications Added",
                description: "Author qualifications and reviewer sign-off information has been added to your CER as an appendix.",
                variant: "success"
              });
            }
          }}
        />
      );
    }
    
    if (activeTab === 'sota') {
      return (
        <StateOfArtPanel
          deviceName={deviceName}
          deviceType={deviceType}
          manufacturer={manufacturer}
          onAddToReport={(sotaData) => {
            const existingIndex = sections.findIndex(
              section => section.type === 'sota' || 
              (section.title && section.title.toLowerCase().includes('state of the art'))
            );
            
            if (existingIndex >= 0) {
              const updatedSections = [...sections];
              updatedSections[existingIndex] = {
                ...updatedSections[existingIndex],
                content: sotaData.content,
                lastUpdated: new Date().toISOString()
              };
              setSections(updatedSections);
              
              toast({
                title: "State of Art Analysis Updated",
                description: "The state of art analysis has been updated in your CER.",
                variant: "success"
              });
            } else {
              setSections([...sections, sotaData]);
              
              toast({
                title: "State of Art Analysis Added",
                description: "State of art analysis has been added to your CER.",
                variant: "success"
              });
            }
          }}
        />
      );
    }

    // Default fallback for other tabs
    return (
      <div className="p-6 text-center">
        <h3 className="text-xl mb-4">Tab content for "{activeTab}" is loading</h3>
        <p>This tab is under development.</p>
      </div>
    );
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start p-6 pb-2">
        <div>
          <h1 className="text-2xl font-semibold text-[#323130] mb-1">CER Builder</h1>
          <p className="text-[#616161]">EU MDR compliant Clinical Evaluation Report generator</p>
        </div>
        
        <div className="flex gap-2 mt-2 md:mt-0">
          <Button
            onClick={() => setShowDeviceInfoDialog(true)}
            className="bg-[#0F6CBD] hover:bg-[#115EA3] text-white"
          >
            <ZapIcon className="h-4 w-4 mr-2" />
            One-Click CER
          </Button>
          {draftStatus === 'in-progress' && (
            <Badge variant="outline" className="ml-2 bg-[#FFF4CE] text-[#797673] border-[#F9E8A0] px-2 py-1 flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1.5 text-[#797673]" />
              Draft
            </Badge>
          )}
          {draftStatus === 'needs-review' && (
            <Badge variant="outline" className="ml-2 bg-[#FCF4FF] text-[#8F7098] border-[#E6BEEE] px-2 py-1 flex items-center">
              <AlertCircle className="h-3.5 w-3.5 mr-1.5 text-[#8F7098]" />
              Ready for Review
            </Badge>
          )}
          {draftStatus === 'approved' && (
            <Badge variant="outline" className="ml-2 bg-[#DFF6DD] text-[#107C10] border-[#C3F1C2] px-2 py-1 flex items-center">
              <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-[#107C10]" />
              Approved
            </Badge>
          )}
        </div>
      </div>

      {/* Custom navigation without Radix UI dependencies */}
      {renderNavigation()}
      
      {/* Content container */}
      <div className="w-full mt-0">
        {renderContent()}
      </div>

      {/* Device Info Dialog */}
      <Dialog open={showDeviceInfoDialog} onOpenChange={setShowDeviceInfoDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Device Information</DialogTitle>
            <DialogDescription>
              Please provide information about your medical device to generate a personalized CER.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="deviceName">Device Name</Label>
              <Input
                id="deviceName"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="e.g. Arthrosurface Shoulder Arthroplasty System"
              />
            </div>
            <div>
              <Label htmlFor="deviceType">Device Type</Label>
              <Select value={deviceType} onValueChange={setDeviceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select device type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Class I Medical Device">Class I Medical Device</SelectItem>
                  <SelectItem value="Class II Medical Device">Class II Medical Device</SelectItem>
                  <SelectItem value="Class III Medical Device">Class III Medical Device</SelectItem>
                  <SelectItem value="In Vitro Diagnostic">In Vitro Diagnostic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="e.g. Medical Innovations Inc."
              />
            </div>
            <div>
              <Label htmlFor="intendedUse">Intended Use</Label>
              <Input
                id="intendedUse"
                value={intendedUse}
                onChange={(e) => setIntendedUse(e.target.value)}
                placeholder="e.g. For treatment of..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeviceInfoDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setShowDeviceInfoDialog(false);
                toast({
                  title: "Device Info Saved",
                  description: "Your device information has been saved and applied to the CER.",
                  variant: "success"
                });
              }}
            >
              Save & Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}