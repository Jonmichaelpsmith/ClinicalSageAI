import React, { useState, useEffect, useRef } from 'react';
import CerBuilderPanel from '@/components/cer/CerBuilderPanel';
import CerPreviewPanel from '@/components/cer/CerPreviewPanel';
import LiteratureSearchPanel from '@/components/cer/LiteratureSearchPanel';
import ComplianceScorePanel from '@/components/cer/ComplianceScorePanel';
import QAChecklistButton from '@/components/cer/QAChecklistButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { exportToPDF, exportToWord, downloadBlob, fetchFaersData, getComplianceScore } from '@/services/CerAPIService';
import { useToast } from '@/hooks/use-toast';
import { ClipboardCheck, Clock, Download, FileCheck, FileText, CheckCircle, AlertCircle, ChevronDown, FileWarning, BookOpen, Calendar, Layers, CircleCheck, CircleAlert } from 'lucide-react';

export default function CERV2Page() {
  const [title, setTitle] = useState('Clinical Evaluation Report');
  const [faers, setFaers] = useState([]);
  const [comparators, setComparators] = useState([]);
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('builder');
  const [compliance, setCompliance] = useState(null);
  const [draftStatus, setDraftStatus] = useState('in-progress'); // in-progress, ready-for-review, finalized
  const [exportTimestamp, setExportTimestamp] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [citationCount, setCitationCount] = useState(0);
  const [sectionCoverage, setSectionCoverage] = useState(0);
  const [isComplianceRunning, setIsComplianceRunning] = useState(false);
  const { toast } = useToast();

  // Refs for floating buttons
  const previewPanelRef = useRef(null);

  // Calculate document stats
  useEffect(() => {
    if (sections.length === 0) return;
    
    // Calculate total word count
    let totalWords = 0;
    let totalCitations = 0;
    
    sections.forEach(section => {
      // Count words in content
      if (section.content) {
        const words = section.content.trim().split(/\s+/).length;
        totalWords += words;
      }
      
      // Count citations (assuming format like [1], [2], etc.)
      if (section.content) {
        const citations = (section.content.match(/\[\d+\]/g) || []).length;
        totalCitations += citations;
      }
    });
    
    setWordCount(totalWords);
    setCitationCount(totalCitations);
    
    // Calculate section coverage (based on required sections for a complete CER)
    const requiredSections = ['clinical-background', 'device-description', 'state-of-art', 'benefit-risk', 'safety', 'literature-analysis', 'conclusion'];
    const presentSections = sections.map(s => s.type || s.sectionType);
    const coveredSections = requiredSections.filter(req => presentSections.some(p => p.includes(req)));
    const coveragePercent = (coveredSections.length / requiredSections.length) * 100;
    
    setSectionCoverage(coveragePercent);
  }, [sections]);

  // Load FAERS data when title changes
  useEffect(() => {
    const loadFaersData = async () => {
      if (!title || title === 'Clinical Evaluation Report') return;
      
      try {
        setIsLoading(true);
        const data = await fetchFaersData(title);
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

    // Debounce the FAERS data loading to avoid excessive API calls
    const timer = setTimeout(() => {
      loadFaersData();
    }, 1000);

    return () => clearTimeout(timer);
  }, [title]);

  // Function to run compliance check
  const runComplianceCheck = async () => {
    if (sections.length === 0) {
      toast({
        title: "No sections to analyze", 
        description: "Please add at least one section to your report before running compliance check.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsComplianceRunning(true);
      const result = await getComplianceScore({
        sections,
        title,
        standards: ['EU MDR', 'ISO 14155', 'FDA']
      });
      
      setCompliance(result);
      
      // Update draft status based on compliance score
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
        description: error.message || "An error occurred while checking compliance",
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
        blob = await exportToPDF({ title, faers, comparators, sections });
        downloadBlob(blob, 'cer_report.pdf');
      } else {
        blob = await exportToWord({ title, faers, comparators, sections });
        downloadBlob(blob, 'cer_report.docx');
      }
      
      // Update export timestamp
      setExportTimestamp(new Date());
      
      toast({
        title: `Export successful`,
        description: `Your report has been exported as ${format.toUpperCase()}.`,
        variant: "success"
      });
    } catch (error) {
      console.error(`Failed to export ${format}:`, error);
      toast({
        title: `Export failed`,
        description: `Failed to export your report as ${format.toUpperCase()}.`,
        variant: "destructive"
      });
    }
  };

  // Draft status badge color
  const getDraftStatusColor = () => {
    switch (draftStatus) {
      case 'in-progress': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'ready-for-review': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'finalized': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Draft status text
  const getDraftStatusText = () => {
    switch (draftStatus) {
      case 'in-progress': return 'Draft: In Progress';
      case 'ready-for-review': return 'Draft: Ready for Review';
      case 'finalized': return 'Finalized';
      default: return 'Draft';
    }
  };

  // Draft status icon
  const getDraftStatusIcon = () => {
    switch (draftStatus) {
      case 'in-progress': return <Clock className="h-4 w-4 mr-1" />;
      case 'ready-for-review': return <FileCheck className="h-4 w-4 mr-1" />;
      case 'finalized': return <ClipboardCheck className="h-4 w-4 mr-1" />;
      default: return <FileText className="h-4 w-4 mr-1" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Bar with CER title, compliance badge, export status, timestamp */}
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{title || "Clinical Evaluation Report"}</h1>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Created: {new Date().toLocaleDateString()}</span>
              {exportTimestamp && (
                <span className="ml-4 flex items-center">
                  <Download className="h-4 w-4 mr-1" />
                  Last Export: {exportTimestamp.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            {/* Document status badge */}
            <div className={`flex items-center px-3 py-1 rounded-full border ${getDraftStatusColor()}`}>
              {getDraftStatusIcon()}
              <span className="text-sm font-medium">{getDraftStatusText()}</span>
            </div>
            
            {/* Compliance score badge - only show when we have data */}
            {compliance && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className={`flex items-center px-3 py-1 rounded-full border ${compliance.overallScore >= 0.8 ? 'bg-green-100 text-green-800 border-green-300' : 'bg-amber-100 text-amber-800 border-amber-300'}`}>
                      {compliance.overallScore >= 0.8 
                        ? <CheckCircle className="h-4 w-4 mr-1" /> 
                        : <AlertCircle className="h-4 w-4 mr-1" />}
                      <span className="text-sm font-medium">Compliance: {Math.round(compliance.overallScore * 100)}%</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Based on {compliance.standards ? Object.keys(compliance.standards).join(', ') : 'regulatory'} standards</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {/* QA Checklist button */}
            <QAChecklistButton variant="outline" />
          </div>
        </div>
      </div>
      
      {/* Collapsible instructions panel */}
      <Collapsible 
        open={instructionsOpen} 
        onOpenChange={setInstructionsOpen}
        className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
      >
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">🧠 How to Use the CER Generator</h2>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronDown className={`h-5 w-5 transform transition-transform ${instructionsOpen ? '' : 'rotate-180'}`} />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div className="px-4 pb-4">
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              <li>Select a section type and provide context</li>
              <li>Generate and add each needed section to your report</li>
              <li>Use the compliance scorecard to validate your CER against standards</li>
              <li>Preview and export your complete CER as PDF or DOCX</li>
            </ol>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Main content area with tabs */}
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <div className="pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Clinical Evaluation Report Builder</h2>
          <p className="text-sm text-gray-600 mt-1">Generate, review, and export your Clinical Evaluation Report with FAERS data integration</p>
        </div>

        <Tabs defaultValue="builder" className="w-full mt-4" onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap gap-2 mb-4">
            <TabsTrigger value="builder" className="flex gap-1 items-center">
              <Layers className="h-4 w-4" />
              <span>Section Generator</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex gap-1 items-center">
              <FileText className="h-4 w-4" />
              <span>Report Preview</span>
            </TabsTrigger>
            <TabsTrigger value="literature" className="flex gap-1 items-center">
              <BookOpen className="h-4 w-4" />
              <span>Literature Review</span>
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex gap-1 items-center">
              <ClipboardCheck className="h-4 w-4" />
              <span>Compliance Scorecard</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="flex gap-1 items-center">
              <Download className="h-4 w-4" />
              <span>Export Options</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="builder">
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

          <TabsContent value="preview" ref={previewPanelRef}>
            {/* Preview stats bar */}
            <div className="mb-4 bg-gray-50 border rounded-md p-3 flex flex-wrap gap-4 justify-between items-center">
              <div className="flex gap-4">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-500">Word Count</span>
                  <span className="text-lg font-bold">{wordCount.toLocaleString()}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-500">Citations</span>
                  <span className="text-lg font-bold">{citationCount}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-500">Section Coverage</span>
                  <div className="flex items-center gap-2">
                    <Progress value={sectionCoverage} className="w-24 h-2" />
                    <span className="text-sm font-medium">{Math.round(sectionCoverage)}%</span>
                  </div>
                </div>
              </div>
              
              {/* Floating actions */}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex items-center gap-1"
                  onClick={runComplianceCheck}
                  disabled={isComplianceRunning || sections.length === 0}
                >
                  {isComplianceRunning ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-1" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <ClipboardCheck className="h-4 w-4" />
                      Check Compliance
                    </>
                  )}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex items-center gap-1"
                  onClick={() => handleExport('pdf')}
                  disabled={sections.length === 0}
                >
                  <FileText className="h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            </div>
            
            <CerPreviewPanel
              title={title}
              faers={faers}
              comparators={comparators}
              sections={sections}
            />
          </TabsContent>

          <TabsContent value="literature">
            <LiteratureSearchPanel
              onAddSection={(newSection) => {
                // Add the new section to the sections array
                const updatedSections = [...sections, newSection];
                setSections(updatedSections);
                
                // Show success notification
                toast({
                  title: "Literature Review Added",
                  description: "The generated literature review has been added to your CER.",
                  variant: "success",
                });
              }}
            />
          </TabsContent>

          <TabsContent value="compliance">
            <ComplianceScorePanel
              sections={sections}
              title={title}
              onComplianceChange={setCompliance}
              onStatusChange={setDraftStatus}
            />
          </TabsContent>

          <TabsContent value="export">
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-md p-4 border">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <FileWarning className="h-5 w-5 text-amber-600" />
                  Export Readiness Check
                </h3>
                
                <div className="space-y-3 mt-4">
                  <div className="flex items-center">
                    <div className="mr-3">
                      {wordCount > 1000 ? (
                        <CircleCheck className="h-5 w-5 text-green-600" />
                      ) : (
                        <CircleAlert className="h-5 w-5 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Content Length</p>
                      <p className="text-sm text-gray-600">
                        {wordCount > 1000 
                          ? "Your document meets the minimum expected length" 
                          : "Your document may be too short for a complete CER"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="mr-3">
                      {sectionCoverage >= 80 ? (
                        <CircleCheck className="h-5 w-5 text-green-600" />
                      ) : (
                        <CircleAlert className="h-5 w-5 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Section Coverage</p>
                      <p className="text-sm text-gray-600">
                        {sectionCoverage >= 80 
                          ? "Your document includes all required sections" 
                          : "Your document is missing some required sections"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="mr-3">
                      {citationCount >= 5 ? (
                        <CircleCheck className="h-5 w-5 text-green-600" />
                      ) : (
                        <CircleAlert className="h-5 w-5 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Citations</p>
                      <p className="text-sm text-gray-600">
                        {citationCount >= 5 
                          ? "Your document includes sufficient literature citations" 
                          : "Your document needs more literature citations"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="mr-3">
                      {compliance && compliance.overallScore >= 0.7 ? (
                        <CircleCheck className="h-5 w-5 text-green-600" />
                      ) : (
                        <CircleAlert className="h-5 w-5 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Compliance Score</p>
                      <p className="text-sm text-gray-600">
                        {compliance && compliance.overallScore >= 0.7 
                          ? "Your document meets regulatory compliance requirements" 
                          : compliance ? "Your document needs compliance improvements" : "Run compliance check to validate against standards"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Export Your Report</h3>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => handleExport('pdf')}
                    disabled={sections.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-md flex items-center gap-2 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    Download PDF
                  </button>
                  <button
                    onClick={() => handleExport('docx')}
                    disabled={sections.length === 0}
                    className="bg-purple-700 hover:bg-purple-800 disabled:bg-purple-300 text-white px-4 py-2 rounded-md flex items-center gap-2 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    Download Word
                  </button>
                  <button
                    onClick={() => {
                      if (!compliance || compliance.overallScore < 0.7) {
                        runComplianceCheck();
                      } else {
                        setDraftStatus('finalized');
                        toast({
                          title: "CER Finalized",
                          description: "Your CER has been marked as finalized.",
                          variant: "success"
                        });
                      }
                    }}
                    disabled={sections.length === 0}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-4 py-2 rounded-md flex items-center gap-2 transition"
                  >
                    <ClipboardCheck className="h-4 w-4" />
                    Finalize CER
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}