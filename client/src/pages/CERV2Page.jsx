import React, { useState, useEffect } from 'react';
import CerBuilderPanel from '@/components/cer/CerBuilderPanel';
import CerPreviewPanel from '@/components/cer/CerPreviewPanel';
import LiteratureSearchPanel from '@/components/cer/LiteratureSearchPanel';
import ComplianceScorePanel from '@/components/cer/ComplianceScorePanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cerApiService } from '@/services/CerAPIService';
import { FileText, BookOpen, CheckSquare, Download, MessageSquare, Clock, FileCheck, CheckCircle, AlertCircle } from 'lucide-react';

export default function CERV2Page() {
  const [title, setTitle] = useState('Clinical Evaluation Report');
  const [deviceType, setDeviceType] = useState('Class II Medical Device');
  const [faers, setFaers] = useState([]);
  const [comparators, setComparators] = useState([]);
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('builder');
  const [compliance, setCompliance] = useState(null);
  const [draftStatus, setDraftStatus] = useState('in-progress');
  const [exportTimestamp, setExportTimestamp] = useState(null);
  const [isComplianceRunning, setIsComplianceRunning] = useState(false);
  const { toast } = useToast();

  // Load FAERS data when title changes
  useEffect(() => {
    const loadFaersData = async () => {
      if (!title || title === 'Clinical Evaluation Report') return;
      
      try {
        setIsLoading(true);
        const data = await cerApiService.fetchFaersData(title);
        if (data) {
          setFaers(data.reports || []);
          setComparators(data.comparators || []);
        }
      } catch (error) {
        console.error('Failed to load FAERS data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the FAERS data loading
    const timer = setTimeout(() => {
      loadFaersData();
    }, 1000);

    return () => clearTimeout(timer);
  }, [title]);

  // Run compliance check
  const runComplianceCheck = async () => {
    if (sections.length === 0) {
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
        sections,
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

  return (
    <div className="bg-white min-h-screen">
      {/* MS365-inspired header */}
      <div className="border-b border-[#E1DFDD] px-4 py-3 flex justify-between items-center bg-white sticky top-0 z-10">
        <div className="flex items-center">
          <FileText className="h-5 w-5 text-[#0F6CBD] mr-2" />
          <h1 className="text-lg font-semibold text-[#323130]">Clinical Evaluation Report</h1>
        </div>
        <div className="flex items-center gap-2">
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
        </div>
      </div>
      
      {/* MS365-inspired main container */}
      <div className="container mx-auto p-4 bg-[#FAF9F8]">
        {/* MS365-style tabs */}
        <Tabs defaultValue="builder" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="flex bg-transparent p-0 mb-4 border-b border-[#E1DFDD] w-full">
            <TabsTrigger 
              value="builder" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F6CBD] data-[state=active]:text-[#0F6CBD] data-[state=active]:shadow-none bg-transparent px-4 py-2 font-normal text-[#616161]"
            >
              <FileText className="h-4 w-4 mr-2" />
              Builder
            </TabsTrigger>
            <TabsTrigger 
              value="literature" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F6CBD] data-[state=active]:text-[#0F6CBD] data-[state=active]:shadow-none bg-transparent px-4 py-2 font-normal text-[#616161]"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Literature
            </TabsTrigger>
            <TabsTrigger 
              value="compliance" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F6CBD] data-[state=active]:text-[#0F6CBD] data-[state=active]:shadow-none bg-transparent px-4 py-2 font-normal text-[#616161]"
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Compliance
            </TabsTrigger>
            <TabsTrigger 
              value="preview" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F6CBD] data-[state=active]:text-[#0F6CBD] data-[state=active]:shadow-none bg-transparent px-4 py-2 font-normal text-[#616161]"
            >
              <FileText className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
            <TabsTrigger 
              value="export" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F6CBD] data-[state=active]:text-[#0F6CBD] data-[state=active]:shadow-none bg-transparent px-4 py-2 font-normal text-[#616161]"
            >
              <Download className="h-4 w-4 mr-2" />
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

          <TabsContent value="preview" className="mt-0">
            <CerPreviewPanel
              title={title}
              faers={faers}
              comparators={comparators}
              sections={sections}
              complianceData={compliance}
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
    </div>
  );
}