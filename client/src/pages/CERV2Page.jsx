import React, { useState, useEffect } from 'react';
import CerBuilderPanel from '@/components/cer/CerBuilderPanel';
import CerPreviewPanel from '@/components/cer/CerPreviewPanel';
import LiteratureSearchPanel from '@/components/cer/LiteratureSearchPanel';
import ComplianceScorePanel from '@/components/cer/ComplianceScorePanel';
import CerAssistantPanel from '@/components/cer/CerAssistantPanel';
import DocumentVaultPanel from '@/components/cer/DocumentVaultPanel';
import CerDataRetrievalPanel from '@/components/cer/CerDataRetrievalPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cerApiService } from '@/services/CerAPIService';
import { FileText, BookOpen, CheckSquare, Download, MessageSquare, Clock, FileCheck, CheckCircle, AlertCircle, RefreshCw, ZapIcon, BarChart, FolderOpen, Database } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingFaers, setIsFetchingFaers] = useState(false);
  const [activeTab, setActiveTab] = useState('builder');
  const [compliance, setCompliance] = useState(null);
  const [draftStatus, setDraftStatus] = useState('in-progress');
  const [exportTimestamp, setExportTimestamp] = useState(null);
  const [isComplianceRunning, setIsComplianceRunning] = useState(false);
  const [isGeneratingFullCER, setIsGeneratingFullCER] = useState(false);
  const [showDeviceInfoDialog, setShowDeviceInfoDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('eu-mdr');
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
  
  // Auto-load FAERS data when device name changes
  useEffect(() => {
    if (deviceName && deviceName.trim() !== '') {
      // Debounce the FAERS data loading
      const timer = setTimeout(() => {
        loadFaersData(deviceName);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [deviceName]);

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
      {/* MS365-inspired header */}
      <div className="border-b border-[#E1DFDD] px-4 py-3 flex justify-between items-center bg-white sticky top-0 z-10">
        <div className="flex items-center">
          <FileText className="h-5 w-5 text-[#0F6CBD] mr-2" />
          <h1 className="text-lg font-semibold text-[#323130]">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
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
      <div className="container mx-auto p-4 bg-[#FAF9F8] cer-compact-ui">
        {/* MS365-style tabs */}
        <Tabs defaultValue="builder" className="w-full" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="flex bg-transparent p-0 mb-4 border-b border-[#E1DFDD] w-full">
            <TabsTrigger 
              value="builder" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F6CBD] data-[state=active]:text-[#0F6CBD] data-[state=active]:shadow-none bg-transparent px-2 py-1 font-normal text-[#616161] text-xs tabs-navigation"
            >
              <FileText className="h-3 w-3 mr-1" />
              Builder
            </TabsTrigger>
            <TabsTrigger 
              value="literature" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F6CBD] data-[state=active]:text-[#0F6CBD] data-[state=active]:shadow-none bg-transparent px-2 py-1 font-normal text-[#616161] text-xs tabs-navigation"
            >
              <BookOpen className="h-3 w-3 mr-1" />
              Literature
            </TabsTrigger>
            <TabsTrigger 
              value="compliance" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F6CBD] data-[state=active]:text-[#0F6CBD] data-[state=active]:shadow-none bg-transparent px-2 py-1 font-normal text-[#616161] text-xs tabs-navigation"
            >
              <CheckSquare className="h-3 w-3 mr-1" />
              Compliance
            </TabsTrigger>
            <TabsTrigger 
              value="assistant" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F6CBD] data-[state=active]:text-[#0F6CBD] data-[state=active]:shadow-none bg-transparent px-2 py-1 font-normal text-[#616161] text-xs tabs-navigation"
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Assistant
            </TabsTrigger>
            <TabsTrigger 
              value="preview" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F6CBD] data-[state=active]:text-[#0F6CBD] data-[state=active]:shadow-none bg-transparent px-2 py-1 font-normal text-[#616161] text-xs tabs-navigation"
            >
              <BarChart className="h-3 w-3 mr-1" />
              Preview
            </TabsTrigger>
            <TabsTrigger 
              value="documents" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F6CBD] data-[state=active]:text-[#0F6CBD] data-[state=active]:shadow-none bg-transparent px-2 py-1 font-normal text-[#616161] text-xs tabs-navigation"
            >
              <FolderOpen className="h-3 w-3 mr-1" />
              Documents
            </TabsTrigger>
            <TabsTrigger 
              value="data-retrieval" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F6CBD] data-[state=active]:text-[#0F6CBD] data-[state=active]:shadow-none bg-transparent px-2 py-1 font-normal text-[#616161] text-xs tabs-navigation"
            >
              <Database className="h-3 w-3 mr-1" />
              Data
            </TabsTrigger>
            <TabsTrigger 
              value="export" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F6CBD] data-[state=active]:text-[#0F6CBD] data-[state=active]:shadow-none bg-transparent px-2 py-1 font-normal text-[#616161] text-xs tabs-navigation"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
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
            <LiteratureSearchPanel
              onAddSection={(newSection) => {
                setSections([...sections, newSection]);
                toast({
                  title: "Literature Review Added",
                  description: "Added to your CER.",
                  variant: "success",
                });
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
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#323130] font-semibold text-lg">Zero-Click CER Generation</DialogTitle>
            <DialogDescription className="text-[#323130]">
              Enter your medical device information to generate a complete CER with regulatory compliance built-in.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="device-name" className="text-[#323130] font-medium">
                Device Name <span className="text-[#D83B01]">*</span>
              </Label>
              <Input
                id="device-name"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="e.g., Stentra LX"
                className="border-[#E1DFDD] bg-white text-[#323130]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="device-type" className="text-[#323130] font-medium">
                Device Classification <span className="text-[#D83B01]">*</span>
              </Label>
              <Select value={deviceType} onValueChange={setDeviceType}>
                <SelectTrigger id="device-type" className="border-[#E1DFDD] bg-white text-[#323130]">
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
              <Label htmlFor="manufacturer" className="text-[#323130] font-medium">
                Manufacturer
              </Label>
              <Input
                id="manufacturer"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="e.g., MedTech Innovations Inc."
                className="border-[#E1DFDD] bg-white text-[#323130]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="intended-use" className="text-[#323130] font-medium">
                Intended Use
              </Label>
              <Input
                id="intended-use"
                value={intendedUse}
                onChange={(e) => setIntendedUse(e.target.value)}
                placeholder="e.g., Cardiac monitoring and diagnostic use"
                className="border-[#E1DFDD] bg-white text-[#323130]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="template" className="text-[#323130] font-medium">
                Regulatory Template <span className="text-[#D83B01]">*</span>
              </Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger id="template" className="border-[#E1DFDD] bg-white text-[#323130]">
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
              <div className="rounded-md p-3 bg-[#E5F2FF] border border-[#0F6CBD] text-sm text-[#323130]">
                <p className="font-medium">FAERS data will be automatically retrieved for "{deviceName}" to include adverse event analysis.</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeviceInfoDialog(false)}
              className="border-[#E1DFDD] bg-white text-[#323130] hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setShowDeviceInfoDialog(false);
                generateFullCER();
              }}
              disabled={!deviceName.trim() || !deviceType || isGeneratingFullCER}
              className="bg-[#0F6CBD] hover:bg-[#115EA3] text-white font-medium px-6 py-2"
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