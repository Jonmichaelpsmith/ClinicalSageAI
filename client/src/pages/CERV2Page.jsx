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
import QualityManagementPlanPanel from '@/components/cer/QualityManagementPlanPanel';
import RegulatoryTraceabilityMatrix from '@/components/cer/RegulatoryTraceabilityMatrix';
import GSPRMappingPanel from '@/components/cer/GSPRMappingPanel';
import LiteratureReviewWorkflow from '@/components/cer/LiteratureReviewWorkflow';
import NotificationBanner from '@/components/cer/NotificationBanner';
import InternalClinicalDataPanel from '@/components/cer/InternalClinicalDataPanel';
import ExportModule from '@/components/cer/ExportModule';
import CerComprehensiveReportsPanel from '@/components/cer/CerComprehensiveReportsPanel';
import MAUDIntegrationPanel from '@/components/cer/MAUDIntegrationPanel';
// 510k enhanced components
import PredicateFinderPanel from '@/components/510k/PredicateFinderPanel';
import GuidedTooltip from '@/components/510k/GuidedTooltip';
import InsightsDisplay from '@/components/510k/InsightsDisplay';
import ProgressTracker from '@/components/510k/ProgressTracker';
import SubmissionTimeline from '@/components/510k/SubmissionTimeline';
import ReportGenerator from '@/components/510k/ReportGenerator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cerApiService } from '@/services/CerAPIService';
import { literatureAPIService } from '@/services/LiteratureAPIService';
import { FileText, BookOpen, CheckSquare, Download, MessageSquare, Clock, FileCheck, CheckCircle, AlertCircle, RefreshCw, ZapIcon, BarChart, FolderOpen, Database, GitCompare, BookMarked, Lightbulb, ClipboardList, FileSpreadsheet, Layers, Trophy, ShieldCheck, Shield, Play, Archive, Activity, Cpu, HardDrive, Network, Code, XCircle, DownloadCloud, Search, Calendar, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import KAutomationPanel from '@/components/cer/KAutomationPanel';

export default function CERV2Page() {
  const [title, setTitle] = useState('Clinical Evaluation Report');
  const [deviceType, setDeviceType] = useState('Class II Medical Device');
  const [documentType, setDocumentType] = useState('cer'); // Options: 'cer' or '510k'
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
  const [activeTab, setActiveTab] = useState('builder');
  
  // Create a deviceProfile object for easier passing to 510k components
  const [deviceProfile, setDeviceProfile] = useState(null);
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
  const [systemInfo, setSystemInfo] = useState({
    memory: { used: 0, total: 0, percentage: 0 },
    api: { status: 'unknown', latency: 0 },
    uptime: 0,
    errorCount: 0,
    lastChecked: null
  });
  const { toast } = useToast();
  
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

  // Simple navigation tab rendering function
  const renderNavigation = () => {
    // Define tab groups
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
          { id: "data-retrieval", label: "Data Retrieval", icon: <Database className="h-3.5 w-3.5 mr-1.5 text-blue-600" /> },
          { id: "510k", label: <div className="flex flex-col items-center leading-tight">
            <span>510(k) Automation</span>
            <span className="text-[0.65rem] text-blue-600">FDA Submission</span>
          </div>, icon: <Archive className="h-3.5 w-3.5 mr-1.5 text-blue-600" /> }
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
            <span className="text-[0.65rem] text-purple-600">ICH E6(R3) & MDR</span>
          </div>, icon: <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-purple-600" /> },
          { id: "compliance", label: documentType === '510k' ? 
            <div className="flex flex-col items-center leading-tight">
              <span>FDA Compliance</span>
              <span className="text-[0.65rem] text-purple-600">510(k) Requirements</span>
            </div> : "Compliance", 
            icon: <CheckSquare className="h-3.5 w-3.5 mr-1.5 text-purple-600" /> },
          { id: "maud", label: <div className="flex flex-col items-center leading-tight">
            <span>MAUD Integration</span>
            <span className="text-[0.65rem] text-purple-600">Algorithm Validation</span>
          </div>, icon: <Shield className="h-3.5 w-3.5 mr-1.5 text-purple-600" /> },
          { id: "reports", label: <div className="flex items-center">
            <span>Reports</span>
            <span className="ml-1.5 bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full shadow-sm">New</span>
          </div>, icon: <FileText className="h-3.5 w-3.5 mr-1.5 text-blue-600" /> },
          { id: "assistant", label: "Assistant", icon: <Lightbulb className="h-3.5 w-3.5 mr-1.5 text-amber-500" /> }
        ]
      },
      {
        label: "Export:",
        tabs: [
          { id: "export", label: "Export Options", icon: <Download className="h-3.5 w-3.5 mr-1.5 text-green-600" /> }
        ]
      }
    ];

    return (
      <nav className="w-full shadow-sm rounded-md overflow-hidden">
        {tabGroups.map((group, groupIndex) => (
          <div 
            key={groupIndex} 
            className={`overflow-x-auto whitespace-nowrap bg-white border-b border-[#E1DFDD] py-2 ${groupIndex === tabGroups.length - 1 ? 'mb-4' : ''} ${
              groupIndex === 0 ? 'bg-gradient-to-r from-blue-50 to-white' : 
              groupIndex === 1 ? 'bg-gradient-to-r from-green-50 to-white' :
              groupIndex === 2 ? 'bg-gradient-to-r from-purple-50 to-white' :
              'bg-gradient-to-r from-gray-50 to-white'
            }`}
          >
            <div className="flex items-center px-6">
              <div className="flex items-center mr-4 flex-shrink-0">
                <span className={`text-xs font-medium ${
                  groupIndex === 0 ? 'text-blue-700' : 
                  groupIndex === 1 ? 'text-green-700' :
                  groupIndex === 2 ? 'text-purple-700' :
                  'text-gray-700'
                }`}>{group.label}</span>
              </div>
              
              <div className="inline-flex items-center">
                {group.tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex-shrink-0 mx-1 rounded-none border-b-2 px-3 py-1.5
                      font-normal text-xs sm:text-sm flex items-center
                      transition-all duration-200 ease-in-out
                      ${activeTab === tab.id 
                        ? `border-[#0F6CBD] text-[#0F6CBD] bg-blue-50 bg-opacity-50` 
                        : 'border-transparent text-[#616161] hover:text-[#0F6CBD] hover:bg-blue-50 hover:bg-opacity-20'
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

  // Direct action for 510(k) Automation
  const show510kPanel = () => {
    console.log("Attempting to show 510k panel");
    setActiveTab('510k');
    console.log("Active tab set to:", '510k');
  };
  
  // Render content based on active tab
  const renderContent = () => {
    if (activeTab === 'builder') {
      return (
        <div className="bg-gradient-to-b from-blue-50 to-white py-4 rounded-md">
          <div className="flex flex-col md:flex-row items-start justify-between">
            <div className="flex-1 px-4">
              <h2 className="text-xl font-semibold text-blue-700">Section Generator</h2>
              <div className="mt-2 mb-4">
                <div className="bg-blue-100 rounded-md px-3 py-1 text-sm inline-flex items-center gap-1 text-blue-700 shadow-sm">
                  <span className="flex items-center"><Lightbulb className="h-3.5 w-3.5 mr-1.5 text-blue-600" /> AI-Powered</span>
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
              <h2 className="text-xl font-semibold text-[#323130]">
                {documentType === 'cer' ? 'Report Sections' : 'Submission Sections'}
              </h2>
              <div className="mt-2 mb-4">
                <div className="bg-[#F3F2F1] rounded px-3 py-1 text-sm inline-flex items-center gap-1">
                  <span>{sections.length} sections</span>
                </div>
                <div className="mt-2 text-xs text-blue-600 font-medium">
                  {documentType === 'cer' ? 'EU MDR Compliant' : 'FDA 510(K) Format'}
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-md font-medium mb-2 text-[#323130]">
                  {documentType === 'cer' ? 'Report Title' : 'Submission Title'}
                </h3>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border border-[#E1DFDD] rounded"
                  placeholder={documentType === 'cer' ? 'Clinical Evaluation Report' : '510(K) Premarket Notification'}
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
          <div className="px-4 mt-4 text-center flex justify-center space-x-3">
            <Button 
              onClick={() => handleExport('docx')} 
              className="bg-transparent text-[#0F6CBD] hover:bg-[#EFF6FC] border-none" 
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Export to Word
            </Button>
            <Button 
              onClick={() => handleExport('pdf')} 
              className="bg-transparent text-green-600 hover:bg-green-50 border-none" 
              variant="outline"
            >
              <FileText className="h-4 w-4 mr-2" />
              Export to PDF
            </Button>
            {documentType === '510k' && (
              <Button 
                onClick={() => handleExport('eCopy')} 
                className="bg-transparent text-purple-600 hover:bg-purple-50 border-none" 
                variant="outline"
                title="Creates FDA eCopy format for submission"
              >
                <Archive className="h-4 w-4 mr-2" />
                FDA eCopy
              </Button>
            )}
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
    
    if (activeTab === 'qmp') {
      return (
        <QualityManagementPlanPanel
          deviceName={deviceName}
          manufacturer={manufacturer}
          cerData={{
            version: "1.0",
            author: "", // This would ideally come from user context
            title: title
          }}
          onQMPGenerated={(qmpData) => {
            // Create a new section for the QMS Plan with metadata
            const qmpTitle = qmpData.title || "Quality Management Plan";
            const qmpContent = qmpData.content || "";
            const qmpMetadata = qmpData.metadata || {};
            
            const qmsSection = {
              title: qmpTitle,
              type: "qmp",
              content: qmpContent,
              metadata: qmpMetadata,
              lastUpdated: qmpData.lastUpdated || new Date().toISOString()
            };
            
            // Check if a QMS section already exists
            const existingIndex = sections.findIndex(
              section => section.type === 'qmp' || section.type === 'qms-plan' || 
              (section.title && section.title.toLowerCase().includes('quality management'))
            );
            
            if (existingIndex >= 0) {
              const updatedSections = [...sections];
              updatedSections[existingIndex] = {
                ...updatedSections[existingIndex],
                content: qmsSection.content,
                metadata: qmpMetadata,
                lastUpdated: new Date().toISOString()
              };
              setSections(updatedSections);
              
              toast({
                title: "QMP Updated",
                description: "Quality Management Plan (ICH E6(R3)) has been updated in your CER.",
                variant: "success"
              });
            } else {
              setSections([...sections, qmsSection]);
              
              toast({
                title: "QMP Added",
                description: "Quality Management Plan (ICH E6(R3)) has been added to your CER.",
                variant: "success"
              });
            }
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
    
    // Add other tab content handlers for literature-review, internal-clinical-data, 
    // documents, data-retrieval, equivalence, gspr-mapping, sota, assistant
    
    if (activeTab === 'maud') {
      // Store the document ID in localStorage for persistence across module changes
      if (cerDocumentId) {
        localStorage.setItem('cerDocumentId', cerDocumentId);
      }
      
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <ShieldCheck className="mr-2 h-6 w-6 text-blue-600" />
                <span>MAUD Algorithm Validation</span>
              </h2>
              <p className="text-gray-600 mt-1">
                Validate your clinical evaluation report with certified algorithms for regulatory compliance
              </p>
            </div>
            
            <Badge 
              variant="outline" 
              className="bg-blue-100 text-blue-800 border-blue-200 font-medium px-3 py-1"
            >
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              {new Date().toLocaleDateString()} - Version 2.1
            </Badge>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-md mr-3">
                <ShieldCheck className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <h3 className="font-medium text-blue-900">Enhanced Regulatory Compliance</h3>
                <p className="text-sm text-blue-800 mt-1">
                  MAUD (Medical Algorithm User Database) provides certified algorithm validation for clinical evaluation reports, 
                  ensuring compliance with EU MDR, FDA regulations, and ISO 14155 standards.
                </p>
              </div>
            </div>
          </div>
          
          <MAUDIntegrationPanel 
            documentId={localStorage.getItem('cerDocumentId') || cerDocumentId || "CER-" + Math.floor(100000 + Math.random() * 900000)}
          />
          
          <div className="mt-6 bg-gray-50 border rounded-md p-4">
            <h3 className="font-medium text-lg mb-2 text-gray-800">Validation Benefits</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>Automated validation against medical device regulatory requirements</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>Traceability to international standards and regulatory frameworks</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>Certified algorithm validation improves regulatory submission success rates</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>Documentation of compliance for notified bodies and regulatory audits</span>
              </li>
            </ul>
          </div>
        </div>
      );
    }
    
    if (activeTab === 'compliance') {
      // Different compliance checking based on document type
      if (documentType === '510k') {
        // 510(k) specialized compliance checker
        return (
          <div className="bg-white border border-blue-100 rounded-lg shadow-sm">
            <div className="border-b border-blue-100 p-4">
              <h2 className="text-lg font-semibold text-blue-700">FDA 510(k) Pre-Submission Compliance Check</h2>
              <p className="text-sm text-gray-600 mt-1">
                Validate that your 510(k) submission meets all FDA requirements and standards
              </p>
            </div>
            <div className="p-4">
              {/* Use modified version of ComplianceChecker for 510(k) submissions */}
              <ComplianceScorePanel
                title="FDA 510(k) Compliance Assessment"
                description="Verify your submission against FDA 510(k) requirements"
                sections={sections}
                template="fda-510k"
                deviceType={deviceType}
                onComplianceDataChange={(complianceData) => {
                  const existingIndex = sections.findIndex(
                    section => section.type === 'fda-510k-compliance' || section.type === 'compliance' || 
                    (section.title && section.title.toLowerCase().includes('fda') && section.title.toLowerCase().includes('compliance'))
                  );
                  
                  if (existingIndex >= 0) {
                    const updatedSections = [...sections];
                    updatedSections[existingIndex] = {
                      ...updatedSections[existingIndex],
                      content: JSON.stringify(complianceData),
                      type: 'fda-510k-compliance',
                      title: 'FDA 510(k) Compliance Assessment',
                      lastUpdated: new Date().toISOString()
                    };
                    setSections(updatedSections);
                    
                    toast({
                      title: "510(k) Compliance Check Updated",
                      description: "Your submission now includes the latest FDA compliance assessment.",
                      variant: "success"
                    });
                  } else {
                    setSections([...sections, {
                      type: 'fda-510k-compliance',
                      title: 'FDA 510(k) Compliance Assessment',
                      content: JSON.stringify(complianceData),
                      lastUpdated: new Date().toISOString()
                    }]);
                    
                    toast({
                      title: "510(k) Compliance Check Added",
                      description: "FDA regulatory compliance assessment has been added to your submission.",
                      variant: "success"
                    });
                  }
                }}
              />
            </div>
          </div>
        );
      } else {
        // Original CER compliance checker
        return (
          <ComplianceScorePanel
            title="Regulatory Compliance Assessment"
            description="Verify your CER against regulatory requirements and standards"
            sections={sections}
            template="eu-mdr"
            deviceType={deviceType}
            onComplianceDataChange={(complianceData) => {
              const existingIndex = sections.findIndex(
                section => section.type === 'eu-mdr-compliance' || section.type === 'compliance' || 
                (section.title && section.title.toLowerCase().includes('regulatory') && section.title.toLowerCase().includes('compliance'))
              );
              
              if (existingIndex >= 0) {
                const updatedSections = [...sections];
                updatedSections[existingIndex] = {
                  ...updatedSections[existingIndex],
                  content: JSON.stringify(complianceData),
                  type: 'eu-mdr-compliance',
                  title: 'Regulatory Compliance Assessment',
                  lastUpdated: new Date().toISOString()
                };
                setSections(updatedSections);
                
                toast({
                  title: "Compliance Check Updated",
                  description: "Your CER now includes the latest compliance assessment.",
                  variant: "success"
                });
              } else {
                setSections([...sections, {
                  type: 'eu-mdr-compliance',
                  title: 'Regulatory Compliance Assessment',
                  content: JSON.stringify(complianceData),
                  lastUpdated: new Date().toISOString()
                }]);
                
                toast({
                  title: "Compliance Check Added",
                  description: "Regulatory compliance assessment has been added to your CER.",
                  variant: "success"
                });
              }
            }}
          />
        );
      }
    }
    
    if (activeTab === '510k') {
      console.log("Rendering enhanced 510k tab content");
      return (
        <div className="bg-white p-6 rounded-md shadow-sm border border-blue-100">
          <Tabs defaultValue="workflow" className="w-full">
            <TabsList className="mb-4 bg-blue-50 w-full flex justify-start gap-2 p-1 border-b">
              <TabsTrigger value="workflow" className="data-[state=active]:bg-blue-600">
                <FileText className="h-4 w-4 mr-2" />
                Workflow
              </TabsTrigger>
              <TabsTrigger value="discovery" className="data-[state=active]:bg-blue-600">
                <Search className="h-4 w-4 mr-2" />
                Predicate Discovery
              </TabsTrigger>
              <TabsTrigger value="insights" className="data-[state=active]:bg-blue-600">
                <Lightbulb className="h-4 w-4 mr-2" />
                Insights
              </TabsTrigger>
              <TabsTrigger value="timeline" className="data-[state=active]:bg-blue-600">
                <Calendar className="h-4 w-4 mr-2" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:bg-blue-600">
                <FileText className="h-4 w-4 mr-2" />
                Reports
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="workflow" className="mt-4">
              <div className="grid grid-cols-1 gap-6">
                <GuidedTooltip
                  title="510(k) Submission Process"
                  steps={[
                    {
                      content: (
                        <p className="text-sm text-gray-600">
                          Welcome to the 510(k) submission wizard! This guided process will help you prepare a complete submission for the FDA.
                        </p>
                      )
                    },
                    {
                      content: (
                        <p className="text-sm text-gray-600">
                          Step 1: Begin by creating or selecting a device profile that contains essential information about your medical device.
                        </p>
                      )
                    },
                    {
                      content: (
                        <p className="text-sm text-gray-600">
                          Step 2: Use the predicate discovery tool to find potential predicate devices for your submission.
                        </p>
                      )
                    },
                    {
                      content: (
                        <p className="text-sm text-gray-600">
                          Step 3: Complete a compliance check to ensure your submission meets all regulatory requirements.
                        </p>
                      )
                    },
                    {
                      content: (
                        <p className="text-sm text-gray-600">
                          Final Step: Generate a comprehensive report for your 510(k) submission.
                        </p>
                      )
                    }
                  ]}
                  showDismissible={true}
                  className="mb-4 p-2 bg-blue-50 border border-blue-100 rounded-md flex items-center text-sm text-blue-700"
                >
                  <Info className="h-4 w-4 mr-2" />
                  <span>Click here for a guided walkthrough of the 510(k) submission process</span>
                </GuidedTooltip>
                
                <KAutomationPanel />
                
                <ProgressTracker
                  currentStep={2}
                  totalSteps={5}
                  progress={65}
                  status="processing"
                  steps={[
                    {
                      name: "Device Profile Creation",
                      status: "complete",
                      type: "file",
                      description: "Define your device characteristics",
                      timestamp: new Date(Date.now() - 3600000).toISOString()
                    },
                    {
                      name: "Predicate Device Discovery",
                      status: "processing",
                      type: "search",
                      description: "Find and select predicate devices",
                      timestamp: new Date().toISOString(),
                      progress: 65
                    },
                    {
                      name: "Substantial Equivalence Analysis",
                      status: "waiting",
                      type: "analysis",
                      description: "Compare your device to predicates"
                    },
                    {
                      name: "Literature Review Integration",
                      status: "waiting",
                      type: "literature",
                      description: "Integrate scientific literature"
                    },
                    {
                      name: "Compliance Check",
                      status: "waiting",
                      type: "report",
                      description: "Ensure regulatory compliance"
                    }
                  ]}
                  logs={[
                    { timestamp: new Date(Date.now() - 3600000).toISOString(), level: "info", message: "Device profile created successfully" },
                    { timestamp: new Date(Date.now() - 1800000).toISOString(), level: "info", message: "Beginning predicate device search" },
                    { timestamp: new Date(Date.now() - 900000).toISOString(), level: "info", message: "Found 12 potential predicate devices" },
                    { timestamp: new Date(Date.now() - 600000).toISOString(), level: "info", message: "Analyzing device compatibility" },
                    { timestamp: new Date().toISOString(), level: "info", message: "Processing predicate analysis (65% complete)" }
                  ]}
                  onRetry={() => {
                    console.log("Retry processing");
                    toast({
                      title: "Processing Restarted",
                      description: "The predicate discovery process has been restarted.",
                      variant: "default"
                    });
                  }}
                  onContinue={() => {
                    console.log("Continue to next step");
                    toast({
                      title: "Moving to Next Step",
                      description: "Proceeding to substantial equivalence analysis.",
                      variant: "default"
                    });
                  }}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="discovery" className="mt-4">
              <div className="grid grid-cols-1 gap-6">
                <PredicateFinderPanel 
                  deviceProfile={deviceProfile || {
                    deviceName: deviceName,
                    manufacturer: manufacturer,
                    deviceClass: deviceType.includes('II') ? 'II' : deviceType.includes('III') ? 'III' : 'I',
                    intendedUse: intendedUse
                  }}
                  organizationId={1}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="insights" className="mt-4">
              <InsightsDisplay 
                insights={[
                  {
                    id: "insight-1",
                    title: "Predicate Device Match Found",
                    description: "We've identified a potential predicate device with a 92% match to your device profile. The device was cleared in 2023 and shares similar technological characteristics.",
                    category: "predicate",
                    priority: "high",
                    timestamp: new Date(Date.now() - 86400000).toISOString(),
                    recommendation: "Review the K230421 device and consider using it as your primary predicate reference."
                  },
                  {
                    id: "insight-2",
                    title: "Missing Design Controls Documentation",
                    description: "Your current profile lacks references to design controls documentation, which is required for Class II devices.",
                    category: "regulatory",
                    priority: "high",
                    timestamp: new Date(Date.now() - 72000000).toISOString(),
                    recommendation: "Complete the Design Controls section in your device profile to satisfy FDA requirements."
                  },
                  {
                    id: "insight-3",
                    title: "Relevant Literature Available",
                    description: "5 recent publications were found that support the safety and efficacy claims for your device type.",
                    category: "literature",
                    priority: "medium",
                    timestamp: new Date(Date.now() - 43200000).toISOString(),
                    recommendation: "Review the literature findings and incorporate relevant citations into your submission."
                  }
                ]}
                predicateDevices={[
                  {
                    id: "pred-1",
                    deviceName: "CardioFlow X200",
                    manufacturer: "MedTech Innovations",
                    deviceClass: "II",
                    kNumber: "K230421",
                    matchScore: 0.92,
                    decisionDate: new Date(Date.now() - 180 * 86400000).toISOString(),
                    description: "CardioFlow X200 is a cardiovascular monitoring system cleared for use in clinical settings."
                  },
                  {
                    id: "pred-2",
                    deviceName: "VitalScan Pro",
                    manufacturer: "HealthSystems Inc.",
                    deviceClass: "II",
                    kNumber: "K220189",
                    matchScore: 0.78,
                    decisionDate: new Date(Date.now() - 360 * 86400000).toISOString(),
                    description: "VitalScan Pro is a patient monitoring system for continuous vital signs monitoring."
                  }
                ]}
                literatureReferences={[
                  {
                    id: "lit-1",
                    title: "Clinical Evaluation of Next-Generation Monitoring Systems",
                    authors: "Johnson, M., et al.",
                    journal: "Journal of Medical Devices",
                    publicationDate: new Date(Date.now() - 120 * 86400000).toISOString(),
                    relevanceScore: 0.89,
                    abstract: "This study evaluates the efficacy and safety of new-generation patient monitoring systems in clinical settings."
                  },
                  {
                    id: "lit-2",
                    title: "Safety Assessment of Modern Patient Monitors",
                    authors: "Williams, R. and Thompson, K.",
                    journal: "International Journal of Biomedical Engineering",
                    publicationDate: new Date(Date.now() - 180 * 86400000).toISOString(),
                    relevanceScore: 0.76,
                    abstract: "A comprehensive assessment of safety features in modern patient monitoring devices approved in the last five years."
                  }
                ]}
                onGenerateReport={() => {
                  toast({
                    title: "Generating Insights Report",
                    description: "Preparing a comprehensive report of all insights.",
                    variant: "default"
                  });
                }}
              />
            </TabsContent>
            
            <TabsContent value="timeline" className="mt-4">
              <SubmissionTimeline 
                currentStep={2}
                steps={[
                  {
                    id: 1,
                    title: "Device Profile Creation",
                    status: "complete",
                    shortDescription: "Define device characteristics and intended use",
                    dueDate: new Date(Date.now() - 7 * 86400000).toISOString(),
                    substeps: [
                      { name: "Enter device details", complete: true },
                      { name: "Define intended use", complete: true },
                      { name: "Upload device images", complete: true }
                    ]
                  },
                  {
                    id: 2,
                    title: "Predicate Device Discovery",
                    status: "in-progress",
                    shortDescription: "Identify and select appropriate predicate devices",
                    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
                    description: "This phase involves finding appropriate predicate devices that have already been cleared by the FDA. These devices will serve as a benchmark for your submission.",
                    recommendation: "Focus on devices with similar technological characteristics and intended use. Prioritize more recent clearances (within the last 3-5 years) when possible.",
                    substeps: [
                      { name: "Run initial predicate search", complete: true },
                      { name: "Review potential matches", complete: true },
                      { name: "Select primary predicate", complete: false },
                      { name: "Document substantial equivalence rationale", complete: false }
                    ]
                  },
                  {
                    id: 3,
                    title: "Substantial Equivalence Analysis",
                    status: "upcoming",
                    shortDescription: "Compare your device to selected predicates",
                    dueDate: new Date(Date.now() + 14 * 86400000).toISOString()
                  },
                  {
                    id: 4,
                    title: "Literature Review",
                    status: "upcoming",
                    shortDescription: "Find and analyze relevant scientific literature",
                    dueDate: new Date(Date.now() + 21 * 86400000).toISOString()
                  },
                  {
                    id: 5,
                    title: "Compliance Check",
                    status: "upcoming",
                    shortDescription: "Ensure submission meets all regulatory requirements",
                    dueDate: new Date(Date.now() + 28 * 86400000).toISOString()
                  },
                  {
                    id: 6,
                    title: "Final Submission Preparation",
                    status: "upcoming",
                    shortDescription: "Compile all documents and finalize submission",
                    dueDate: new Date(Date.now() + 35 * 86400000).toISOString()
                  }
                ]}
                onSelectStep={(stepId) => {
                  console.log(`Selected step: ${stepId}`);
                  toast({
                    title: "Timeline Step Selected",
                    description: `You selected step ${stepId} in the submission timeline.`,
                    variant: "default"
                  });
                }}
              />
            </TabsContent>
            
            <TabsContent value="reports" className="mt-4">
              <ReportGenerator 
                deviceProfile={deviceProfile || {
                  deviceName: deviceName,
                  manufacturer: manufacturer,
                  deviceClass: deviceType.includes('II') ? 'II' : deviceType.includes('III') ? 'III' : 'I',
                  intendedUse: intendedUse
                }}
                predicates={[
                  {
                    deviceName: "CardioFlow X200",
                    manufacturer: "MedTech Innovations",
                    deviceClass: "II",
                    kNumber: "K230421",
                    matchScore: 0.92
                  }
                ]}
                recentReports={[
                  {
                    name: "510k_Submission_Draft_20250512.pdf",
                    type: "pdf",
                    timestamp: new Date(Date.now() - 86400000).toISOString()
                  }
                ]}
                onGenerateReport={(options) => {
                  console.log("Generating report with options:", options);
                  toast({
                    title: "Report Generation Started",
                    description: `Generating a ${options.type.toUpperCase()} report with selected sections.`,
                    variant: "default"
                  });
                  
                  // Simulate report generation completion after delay
                  setTimeout(() => {
                    toast({
                      title: "Report Generated Successfully",
                      description: "Your 510(k) submission report is ready to download.",
                      variant: "success"
                    });
                  }, 3000);
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      );
    }

    if (activeTab === 'reports') {
      return (
        <CerComprehensiveReportsPanel 
          deviceName={deviceName}
          deviceType={deviceType}
          manufacturer={manufacturer}
          cerData={{
            title: title,
            sections: sections
          }}
        />
      );
    }
    
    if (activeTab === 'traceability') {
      return (
        <RegulatoryTraceabilityMatrix
          deviceName={deviceName}
          manufacturer={manufacturer}
          onGenerateReport={(reportData) => {
            // Find if a traceability report already exists
            const existingIndex = sections.findIndex(
              section => section.type === 'traceability-report' || 
              (section.title && section.title.toLowerCase().includes('traceability'))
            );
            
            if (existingIndex >= 0) {
              const updatedSections = [...sections];
              updatedSections[existingIndex] = {
                ...updatedSections[existingIndex],
                content: reportData.content,
                lastUpdated: new Date().toISOString()
              };
              setSections(updatedSections);
              
              toast({
                title: "Traceability Report Updated",
                description: "Regulatory Traceability Matrix Report has been updated in your CER.",
                variant: "success"
              });
            } else {
              setSections([...sections, reportData]);
              
              toast({
                title: "Traceability Report Added",
                description: "Regulatory Traceability Matrix Report has been added to your CER.",
                variant: "success"
              });
            }
          }}
          onTraceabilityDataChange={(data) => {
            console.log("Traceability data updated:", data);
            // Save the traceability data for use in other components
          }}
        />
      );
    }
    
    if (activeTab === 'export') {
      return (
        <div className="bg-[#F9F9F9] py-4">
          <div className="px-4">
            <h2 className="text-xl font-semibold text-[#323130] mb-4">Export Options</h2>
            <ExportModule 
              title={title}
              sections={sections}
              deviceName={deviceName}
              manufacturer={manufacturer}
              deviceType={deviceType}
              isComplete={sections.length > 5}
              lastModified={new Date().toISOString()}
              onExport={handleExport}
            />
          </div>
        </div>
      );
    }

    if (activeTab === 'sota') {
      return (
        <StateOfArtPanel
          onSectionGenerated={(sotaSection) => {
            const existingIndex = sections.findIndex(
              section => section.type === 'state-of-art' || 
              (section.title && section.title.toLowerCase().includes('state of the art'))
            );
            
            if (existingIndex >= 0) {
              const updatedSections = [...sections];
              updatedSections[existingIndex] = {
                ...updatedSections[existingIndex],
                content: sotaSection.content,
                lastUpdated: new Date().toISOString()
              };
              setSections(updatedSections);
            } else {
              setSections([...sections, sotaSection]);
            }
            
            // Update localStorage
            saveToLocalStorage('cer-sections', [...sections, sotaSection]);
            
            // Show success message
            toast({
              title: 'State of Art Section Added',
              description: 'The section has been added to your CER document.',
              variant: 'success',
            });
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
    
    if (activeTab === 'equivalence') {
      return (
        <EquivalenceBuilderPanel
          onEquivalenceDataChange={(equivalenceData) => {
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
                description: "Your CER now includes the latest device equivalence data.",
                variant: "success"
              });
            } else {
              setSections([...sections, equivalenceData]);
              
              toast({
                title: "Equivalence Data Added",
                description: "Device equivalence analysis has been added to your CER.",
                variant: "success"
              });
            }
          }}
        />
      );
    }
    
    if (activeTab === 'compliance') {
      return (
        <ComplianceScorePanel
          sections={sections}
          title={`${deviceName || 'Device'} Clinical Evaluation Report`}
          onComplianceChange={(complianceData) => {
            const existingIndex = sections.findIndex(
              section => section.type === 'compliance' || 
              (section.title && section.title.toLowerCase().includes('compliance'))
            );
            
            if (existingIndex >= 0) {
              const updatedSections = [...sections];
              updatedSections[existingIndex] = {
                ...updatedSections[existingIndex],
                content: JSON.stringify(complianceData),
                type: 'compliance',
                title: 'Regulatory Compliance Assessment',
                lastUpdated: new Date().toISOString()
              };
              setSections(updatedSections);
              
              toast({
                title: "Compliance Check Updated",
                description: "Your CER now includes the latest compliance assessment.",
                variant: "success"
              });
            } else {
              setSections([...sections, {
                type: 'compliance',
                title: 'Regulatory Compliance Assessment',
                content: JSON.stringify(complianceData),
                lastUpdated: new Date().toISOString()
              }]);
              
              toast({
                title: "Compliance Check Added",
                description: "Regulatory compliance assessment has been added to your CER.",
                variant: "success"
              });
            }
          }}
          onStatusChange={(status) => {
            if (status === 'ready-for-review') {
              setDraftStatus('needs-review');
            }
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
          onAddContent={(assistantContent) => {
            setSections([...sections, assistantContent]);
            
            toast({
              title: "Content Added",
              description: "Assistant-generated content has been added to your CER.",
              variant: "success"
            });
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
  }

  // System Health monitoring function
  const refreshSystemHealth = useCallback(async () => {
    try {
      // Get memory info
      const memoryInfo = window.performance?.memory || { 
        usedJSHeapSize: 0, 
        totalJSHeapSize: 2000000000 
      };
      
      // Check API health with a timeout
      const apiStartTime = Date.now();
      let apiStatus = 'unknown';
      let apiLatency = 0;
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch('/api/health', { 
          signal: controller.signal 
        });
        
        clearTimeout(timeoutId);
        apiStatus = response.ok ? 'healthy' : 'unhealthy';
        apiLatency = Date.now() - apiStartTime;
      } catch (err) {
        console.error('API health check failed:', err);
        apiStatus = 'error';
        apiLatency = Date.now() - apiStartTime;
      }
      
      // Get error logs count from localStorage
      const errorLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      
      // Calculate uptime (based on when page was loaded)
      const uptime = Math.floor(performance.now() / 1000);
      
      // Update state
      setSystemInfo({
        memory: {
          used: Math.round(memoryInfo.usedJSHeapSize / 1000000),
          total: Math.round(memoryInfo.totalJSHeapSize / 1000000),
          percentage: Math.round((memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100)
        },
        api: {
          status: apiStatus,
          latency: apiLatency
        },
        uptime,
        errorCount: errorLogs.length,
        lastChecked: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error refreshing system health:', error);
    }
  }, []);
  
  // Collect system info when panel is opened
  useEffect(() => {
    if (showSystemHealth) {
      refreshSystemHealth();
    }
  }, [showSystemHealth, refreshSystemHealth]);

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* System Health Dialog */}
      <Dialog open={showSystemHealth} onOpenChange={setShowSystemHealth}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health Dashboard
              <Badge variant="outline" className={systemInfo.memory.percentage > 80 ? 'bg-red-100 text-red-800 border-red-200' : 
                systemInfo.memory.percentage > 60 ? 'bg-amber-100 text-amber-800 border-amber-200' : 
                'bg-green-100 text-green-800 border-green-200'}>
                {systemInfo.memory.percentage > 80 ? 'Attention Needed' : 
                 systemInfo.memory.percentage > 60 ? 'Fair' : 
                 'Good'}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              System performance metrics and diagnostics information
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="overview" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="mb-4">
              <TabsTrigger value="overview" className="flex items-center gap-1.5">
                <Activity className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="resources" className="flex items-center gap-1.5">
                <Cpu className="h-4 w-4" />
                <span>Resources</span>
              </TabsTrigger>
              <TabsTrigger value="connectivity" className="flex items-center gap-1.5">
                <Network className="h-4 w-4" />
                <span>Connectivity</span>
              </TabsTrigger>
              <TabsTrigger value="errors" className="flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />
                <span>Issues</span>
                {systemInfo.errorCount > 0 && (
                  <Badge className="ml-1 bg-red-100 text-red-800 border-red-200 h-5 px-1.5">
                    {systemInfo.errorCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <ScrollArea className="flex-1">
              <TabsContent value="overview" className="mt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Memory Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">{systemInfo.memory.percentage}%</div>
                        <div className="text-sm text-muted-foreground">
                          {systemInfo.memory.used} MB / {systemInfo.memory.total} MB
                        </div>
                      </div>
                      <div className="mt-2 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            systemInfo.memory.percentage > 80 ? 'bg-red-500' : 
                            systemInfo.memory.percentage > 60 ? 'bg-amber-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${systemInfo.memory.percentage}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">API Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {systemInfo.api.status === 'healthy' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <span className="text-lg font-medium capitalize">
                            {systemInfo.api.status}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {systemInfo.api.latency}ms latency
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">System Uptime</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {Math.floor(systemInfo.uptime / 60)} minutes
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Session started at {new Date(Date.now() - systemInfo.uptime * 1000).toLocaleTimeString()}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">System Info</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Last checked:</span>
                          <span>{systemInfo.lastChecked ? new Date(systemInfo.lastChecked).toLocaleTimeString() : 'Never'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Browser:</span>
                          <span>{navigator.userAgent.split(' ').slice(-1)[0]}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Issues detected:</span>
                          <span>{systemInfo.errorCount}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="resources" className="mt-0 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Memory Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Heap Memory Used:</span>
                        <span>{systemInfo.memory.used} MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Heap Allocated:</span>
                        <span>{systemInfo.memory.total} MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Available Memory:</span>
                        <span>{systemInfo.memory.total - systemInfo.memory.used} MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Usage Percentage:</span>
                        <span>{systemInfo.memory.percentage}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Storage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>LocalStorage:</span>
                        <span>{Object.keys(localStorage).length} items</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SessionStorage:</span>
                        <span>{Object.keys(sessionStorage).length} items</span>
                      </div>
                      <div className="flex justify-between">
                        <span>IndexedDB Status:</span>
                        <span>
                          {window.indexedDB ? 'Available' : 'Not Available'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="connectivity" className="mt-0 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Network Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Connection:</span>
                        <span className="capitalize">
                          {navigator.onLine ? 'Online' : 'Offline'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>API Endpoint Status:</span>
                        <span className="capitalize flex items-center gap-1">
                          {systemInfo.api.status === 'healthy' ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              Healthy
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-red-500" />
                              {systemInfo.api.status}
                            </>
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>API Response Time:</span>
                        <span>{systemInfo.api.latency} ms</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="errors" className="mt-0 space-y-4">
                {systemInfo.errorCount > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        Errors Detected
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        {systemInfo.errorCount} errors have been detected in this session. Please contact support if you're experiencing issues.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <CheckCircle className="h-16 w-16 text-green-100 mb-4" />
                    <h3 className="text-lg font-medium">No Issues Detected</h3>
                    <p className="text-sm text-muted-foreground max-w-md mt-1">
                      The system is currently running smoothly without any detected errors or issues.
                    </p>
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
          
          <DialogFooter className="flex items-center justify-between mt-4 sm:justify-between">
            <div>
              <Button
                onClick={refreshSystemHealth}
                variant="outline"
                size="sm"
                className="mr-2"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              <Button 
                onClick={() => {
                  const report = {
                    systemInfo,
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString()
                  };
                  
                  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `system-health-report-${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                variant="outline" 
                size="sm"
              >
                <DownloadCloud className="h-4 w-4 mr-1" />
                Export Report
              </Button>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setShowSystemHealth(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Direct 510(k) Automation Panel */}
      <div className="bg-white mb-6 p-6 border border-blue-200 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-blue-700">510(k) Automation Pipeline</h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1.5"
              onClick={() => setShowSystemHealth(true)}
            >
              <Activity className="h-4 w-4" />
              <span>System Health</span>
            </Button>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              FDA Submission
            </Badge>
          </div>
        </div>
        <p className="text-gray-600 mb-6">Complete automation pipeline for FDA 510(k) submissions with intelligent predicate discovery.</p>
        <div className="p-4 bg-blue-50 rounded-md mb-6">
          <KAutomationPanel />
        </div>
      </div>
    
      <div className="flex flex-col md:flex-row justify-between items-start p-6 pb-2 bg-gradient-to-r from-blue-50 to-white rounded-t-lg shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-[#0F6CBD] mb-1">CER Builder</h1>
          <p className="text-[#616161]">EU MDR compliant Clinical Evaluation Report generator</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 shadow-sm transition-all hover:shadow"
          onClick={() => window.location.href = '/cer-projects'}
        >
          <FolderOpen className="h-4 w-4" />
          Manage CER Projects
        </Button>
        
        <div className="flex gap-2 mt-2 md:mt-0">
          <Button
            onClick={() => setShowDeviceInfoDialog(true)}
            className="bg-[#0F6CBD] hover:bg-[#115EA3] text-white shadow-sm transition-all hover:shadow"
          >
            <ZapIcon className="h-4 w-4 mr-2" />
            One-Click CER
          </Button>
          {draftStatus === 'in-progress' && (
            <Badge variant="outline" className="ml-2 bg-[#FFF4CE] text-[#797673] border-[#F9E8A0] px-2 py-1 flex items-center shadow-sm">
              <Clock className="h-3.5 w-3.5 mr-1.5 text-amber-500 animate-pulse" />
              <span className="font-medium">Draft</span>
            </Badge>
          )}
          {draftStatus === 'needs-review' && (
            <Badge variant="outline" className="ml-2 bg-[#FCF4FF] text-[#8F7098] border-[#E6BEEE] px-2 py-1 flex items-center shadow-sm">
              <AlertCircle className="h-3.5 w-3.5 mr-1.5 text-purple-500 animate-pulse" />
              <span className="font-medium">Ready for Review</span>
            </Badge>
          )}
          {draftStatus === 'approved' && (
            <Badge variant="outline" className="ml-2 bg-[#DFF6DD] text-[#107C10] border-[#C3F1C2] px-2 py-1 flex items-center shadow-sm">
              <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-green-500" />
              <span className="font-medium">Approved</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Custom navigation without Radix UI dependencies */}
      {renderNavigation()}
      
      {/* Content container */}
      <div className="w-full mt-0 rounded-md bg-white shadow-sm border border-gray-100">
        <div className="p-1">
          {renderContent()}
        </div>
      </div>

      {/* Device Info Dialog */}
      <Dialog open={showDeviceInfoDialog} onOpenChange={setShowDeviceInfoDialog}>
        <DialogContent className="sm:max-w-[500px] shadow-lg border-blue-100">
          <DialogHeader className="bg-gradient-to-r from-blue-50 to-white rounded-t-lg pb-2">
            <DialogTitle className="text-blue-700 flex items-center">
              <ShieldCheck className="h-5 w-5 mr-2 text-blue-600" />
              Device Information
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Please provide information about your medical device to generate personalized documentation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="documentType">Document Type</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cer">Clinical Evaluation Report (CER)</SelectItem>
                  <SelectItem value="510k">510(K) Submission</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {documentType === 'cer' 
                  ? 'CER documents are required for EU MDR compliance.' 
                  : '510(K) submissions are required for FDA market clearance.'}
              </p>
            </div>
            
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
                
                // Save device data including cerDocumentId to localStorage
                localStorage.setItem('cerDeviceData', JSON.stringify({
                  deviceName,
                  manufacturer,
                  deviceType,
                  intendedUse,
                  cerDocumentId
                }));
                
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