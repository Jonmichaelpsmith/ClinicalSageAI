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
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cerApiService } from '@/services/CerAPIService';
import { useToast } from '@/hooks/use-toast';
import { ClipboardCheck, Clock, Download, FileCheck, FileText, CheckCircle, AlertCircle, ChevronDown, FileWarning, BookOpen, Calendar, Layers, CircleCheck, CircleAlert, Database, MessageSquare, UploadCloud, Loader2, Info } from 'lucide-react';

export default function CERV2Page() {
  const [title, setTitle] = useState('Clinical Evaluation Report');
  const [deviceType, setDeviceType] = useState('Class II Medical Device');
  const [manufacturer, setManufacturer] = useState('Medical Device Manufacturer');
  const [intendedUse, setIntendedUse] = useState('The device is intended for use in clinical settings for diagnostic or therapeutic purposes.');
  const [regulatoryPath, setRegulatoryPath] = useState('EU MDR');
  const [faers, setFaers] = useState([]);
  const [comparators, setComparators] = useState([]);
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('builder');
  const [compliance, setCompliance] = useState(null);
  const [complianceScores, setComplianceScores] = useState(null);
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
      const result = await cerApiService.getComplianceScore({
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
        blob = await cerApiService.exportToPDF({ title, faers, comparators, sections });
        cerApiService.downloadBlob(blob, 'cer_report.pdf');
      } else {
        blob = await cerApiService.exportToWord({ title, faers, comparators, sections });
        cerApiService.downloadBlob(blob, 'cer_report.docx');
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
          <CollapsibleTrigger>
            <ChevronDown className={`h-5 w-5 transform transition-transform ${instructionsOpen ? '' : 'rotate-180'}`} />
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
          <div className="flex items-center">
            <FileText className="h-6 w-6 mr-2 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Report Builder Tools</h2>
          </div>
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
            <TabsTrigger value="ai-assist" className="flex gap-1 items-center">
              <MessageSquare className="h-4 w-4" />
              <span>AI Assistant</span>
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
              complianceData={compliance}
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
          
          <TabsContent value="ai-assist">
            <div className="space-y-8">
              {/* AI Assistant for Automated CER Generation */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left panel - Device Input and Settings */}
                <div className="lg:col-span-5 space-y-8">
                  <Card className="border border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white pb-4">
                      <CardTitle className="flex items-center gap-2 text-slate-800">
                        <Database className="h-5 w-5 text-primary" />
                        <span className="text-h4 font-semibold">Device Information</span>
                      </CardTitle>
                      <CardDescription className="text-body-sm text-slate-500">
                        Configure device details for intelligent CER generation
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      <div className="space-y-2">
                        <Label htmlFor="deviceName" className="text-body-sm font-medium text-slate-700">Device Name</Label>
                        <Input
                          id="deviceName"
                          placeholder="e.g., CardioMonitor Pro 3000"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="border-slate-200 focus:border-primary focus:ring-primary h-10"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="deviceType" className="text-body-sm font-medium text-slate-700">Device Type</Label>
                        <Select defaultValue="Class2">
                          <SelectTrigger id="deviceType" className="border-slate-200 bg-white h-10">
                            <SelectValue placeholder="Select device type" />
                          </SelectTrigger>
                          <SelectContent className="border border-slate-200 shadow-md">
                            <SelectGroup>
                              <SelectLabel className="text-caption font-semibold text-slate-500">EU MDR</SelectLabel>
                              <SelectItem value="Class1" className="text-body-sm">Class I (Non-sterile)</SelectItem>
                              <SelectItem value="Class1s" className="text-body-sm">Class I (Sterile)</SelectItem>
                              <SelectItem value="Class2a" className="text-body-sm">Class IIa</SelectItem>
                              <SelectItem value="Class2b" className="text-body-sm">Class IIb</SelectItem>
                              <SelectItem value="Class3" className="text-body-sm">Class III</SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                              <SelectLabel className="text-caption font-semibold text-slate-500">US FDA</SelectLabel>
                              <SelectItem value="Class1FDA" className="text-body-sm">Class I (Exempt)</SelectItem>
                              <SelectItem value="Class2FDA" className="text-body-sm">Class II (510k)</SelectItem>
                              <SelectItem value="Class3FDA" className="text-body-sm">Class III (PMA)</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="regulatoryPath" className="text-body-sm font-medium text-slate-700">Regulatory Framework</Label>
                        <Select defaultValue="EU-MDR">
                          <SelectTrigger id="regulatoryPath" className="border-slate-200 bg-white h-10">
                            <SelectValue placeholder="Select regulatory framework" />
                          </SelectTrigger>
                          <SelectContent className="border border-slate-200 shadow-md">
                            <SelectItem value="EU-MDR" className="text-body-sm">EU MDR</SelectItem>
                            <SelectItem value="ISO-14155" className="text-body-sm">ISO 14155</SelectItem>
                            <SelectItem value="US-FDA" className="text-body-sm">US FDA</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="intendedUse" className="text-body-sm font-medium text-slate-700">Intended Use</Label>
                        <Textarea
                          id="intendedUse"
                          placeholder="Describe the intended use of the device..."
                          rows={3}
                          className="border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white pb-4">
                      <CardTitle className="flex items-center gap-2 text-slate-800">
                        <UploadCloud className="h-5 w-5 text-primary" />
                        <span className="text-h4 font-semibold">Document Upload</span>
                      </CardTitle>
                      <CardDescription className="text-body-sm text-slate-500">
                        Upload existing documentation to enhance the CER
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-5">
                      <div className="border border-dashed border-slate-200 rounded-lg p-6 text-center cursor-pointer hover:bg-slate-50 transition-colors">
                        <div className="flex flex-col items-center">
                          <UploadCloud className="w-10 h-10 mb-3 text-slate-300" />
                          <span className="text-sm font-medium text-slate-600">Click to upload or drag and drop</span>
                          <span className="text-xs text-slate-500 mt-1">PDF, DOCX, CSV (max 10MB each)</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-body-sm font-medium text-slate-700 mb-3 block">Data Sources</Label>
                        <div className="space-y-3">
                          <div className="flex items-center p-2 rounded-md hover:bg-slate-50 transition-colors">
                            <div className="flex h-5 w-5 items-center justify-center rounded border border-primary mr-3">
                              <div className="h-3 w-3 rounded-sm bg-primary"></div>
                            </div>
                            <Label htmlFor="faers" className="text-body-sm text-slate-700 cursor-pointer">FAERS Database</Label>
                          </div>
                          <div className="flex items-center p-2 rounded-md hover:bg-slate-50 transition-colors">
                            <div className="flex h-5 w-5 items-center justify-center rounded border border-primary mr-3">
                              <div className="h-3 w-3 rounded-sm bg-primary"></div>
                            </div>
                            <Label htmlFor="literature" className="text-body-sm text-slate-700 cursor-pointer">PubMed Literature</Label>
                          </div>
                          <div className="flex items-center p-2 rounded-md hover:bg-slate-50 transition-colors">
                            <div className="flex h-5 w-5 items-center justify-center rounded border border-primary mr-3">
                              <div className="h-3 w-3 rounded-sm bg-primary"></div>
                            </div>
                            <Label htmlFor="maude" className="text-body-sm text-slate-700 cursor-pointer">MAUDE Database</Label>
                          </div>
                          <div className="flex items-center p-2 rounded-md hover:bg-slate-50 transition-colors">
                            <div className="flex h-5 w-5 items-center justify-center rounded border border-primary mr-3">
                              <div className="h-3 w-3 rounded-sm bg-primary"></div>
                            </div>
                            <Label htmlFor="eudamed" className="text-body-sm text-slate-700 cursor-pointer">EUDAMED</Label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Right panel - CER Generation Options */}
                <div className="lg:col-span-7 space-y-8">
                  <Card className="border border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white pb-4">
                      <CardTitle className="flex items-center gap-2 text-slate-800">
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="text-h4 font-semibold">AI-Powered CER Generation</span>
                      </CardTitle>
                      <CardDescription className="text-body-sm text-slate-500">
                        Generate a complete, standards-compliant Clinical Evaluation Report
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-6">
                      <div>
                        <h3 className="text-h5 font-semibold text-slate-800 mb-4">Smart Generation Options</h3>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 cursor-pointer transition-colors shadow-sm">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center">
                                <div className="rounded-full bg-blue-50 p-2 mr-3">
                                  <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <h4 className="font-medium text-slate-800">Standard CER</h4>
                              </div>
                              <Badge className="bg-blue-50 text-primary hover:bg-blue-100 border-0">Recommended</Badge>
                            </div>
                            <p className="text-body-sm text-slate-600 mt-3">Generate a complete CER with all required sections based on device classification</p>
                            <div className="flex items-center gap-1 mt-3">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              <span className="text-caption text-slate-500">~25 min generation time</span>
                            </div>
                          </div>
                          
                          <div className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 cursor-pointer transition-colors shadow-sm">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center">
                                <div className="rounded-full bg-indigo-50 p-2 mr-3">
                                  <ClipboardCheck className="h-5 w-5 text-indigo-600" />
                                </div>
                                <h4 className="font-medium text-slate-800">Zero-Click Report</h4>
                              </div>
                              <Badge className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-0">Premium</Badge>
                            </div>
                            <p className="text-body-sm text-slate-600 mt-3">Fully autonomous report generation with intelligent data integration and self-completion</p>
                            <div className="flex items-center gap-1 mt-3">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              <span className="text-caption text-slate-500">~15 min generation time</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                          <div className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 cursor-pointer transition-colors shadow-sm">
                            <div className="flex items-center">
                              <div className="rounded-full bg-amber-50 p-2 mr-3">
                                <BookOpen className="h-5 w-5 text-amber-600" />
                              </div>
                              <h4 className="font-medium text-slate-800">Literature-Focused</h4>
                            </div>
                            <p className="text-body-sm text-slate-600 mt-3">CER with enhanced literature review and critical appraisal of scientific evidence</p>
                            <div className="flex items-center gap-1 mt-3">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              <span className="text-caption text-slate-500">~40 min generation time</span>
                            </div>
                          </div>
                          
                          <div className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 cursor-pointer transition-colors shadow-sm">
                            <div className="flex items-center">
                              <div className="rounded-full bg-purple-50 p-2 mr-3">
                                <Database className="h-5 w-5 text-purple-600" />
                              </div>
                              <h4 className="font-medium text-slate-800">Deep Data Analysis</h4>
                            </div>
                            <p className="text-body-sm text-slate-600 mt-3">Comprehensive CER with in-depth data analysis and statistical evaluation of safety data</p>
                            <div className="flex items-center gap-1 mt-3">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              <span className="text-caption text-slate-500">~35 min generation time</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 rounded-lg border border-slate-200 p-5">
                        <h3 className="text-h5 font-semibold text-slate-800 flex items-center gap-2 mb-4">
                          <CheckCircle className="h-5 w-5 text-primary" />
                          <span>Required Sections</span>
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                          {['Device Description', 'Intended Purpose', 'State of the Art', 'Clinical Data Analysis', 'Post-Market Surveillance', 'Literature Review', 'Benefit-Risk Analysis', 'Conclusion'].map((section, index) => (
                            <div key={index} className="flex items-center text-body-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></div>
                              <span className="text-slate-700">{section}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <Button 
                          size="lg" 
                          className="w-full bg-primary hover:bg-primary-dark text-white font-medium shadow transition-all duration-200 py-6" 
                          onClick={async () => {
                            setIsLoading(true);
                            
                            toast({
                              title: "AI-Generated CER",
                              description: "Your zero-click report has started processing. This will take approximately 5-10 minutes.",
                            });
                            
                            try {
                              // Get selected data sources
                              const selectedDataSources = [];
                              if (document.getElementById('faers')?.checked) selectedDataSources.push('FAERS');
                              if (document.getElementById('literature')?.checked) selectedDataSources.push('PubMed');
                              if (document.getElementById('maude')?.checked) selectedDataSources.push('MAUDE');
                              if (document.getElementById('eudamed')?.checked) selectedDataSources.push('EUDAMED');
                              
                              // Map template ID based on regulatoryPath
                              let templateId = 'eu-mdr';
                              if (regulatoryPath === 'FDA') templateId = 'fda-510k';
                              else if (regulatoryPath === 'MEDDEV') templateId = 'meddev';
                              else if (regulatoryPath === 'ISO 14155') templateId = 'iso-14155';
                              
                              // Construct device info
                              const deviceInfo = {
                                name: title || 'Medical Device',
                                type: deviceType || 'Class II Medical Device',
                                manufacturer: manufacturer || 'Medical Device Manufacturer',
                                intendedUse: intendedUse || ''
                              };
                              
                              // Call the API to generate the full CER
                              const generationResult = await generateFullCER({
                                deviceInfo,
                                templateId,
                                literature: [], // In a real implementation, this would be populated from uploaded documents
                                fdaData: faers.length > 0 ? { reports: faers, reportCount: faers.length } : null
                              });
                              
                              console.log('Generation result:', generationResult);
                              
                              if (generationResult && generationResult.sections) {
                                // Update state with the generated sections
                                setSections(generationResult.sections);
                                setActiveTab("preview");
                                
                                // Save compliance score if available
                                if (generationResult.complianceScore) {
                                  setComplianceScores(generationResult.complianceScore);
                                }
                                
                                toast({
                                  title: "CER Generation Complete",
                                  description: "Your AI-generated Clinical Evaluation Report is ready for review.",
                                  variant: "success"
                                });
                              } else {
                                throw new Error('No sections returned from generation');
                              }
                            } catch (error) {
                              console.error('Error generating CER:', error);
                              toast({
                                title: "Generation Error",
                                description: `Failed to generate report: ${error.message}`,
                                variant: "destructive"
                              });
                            } finally {
                              setIsLoading(false);
                            }
                          }}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              <span className="text-body-sm">Generating Report...</span>
                            </>
                          ) : (
                            <>
                              <FileText className="h-5 w-5 mr-2" />
                              <span className="text-body-sm">Generate Zero-Click CER Report</span>
                            </>
                          )}
                        </Button>
                        
                        <p className="text-caption text-center mt-3 text-slate-500">
                          The report will be generated using GPT-4o intelligence and all available data sources
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-purple-50 to-white pb-4">
                      <CardTitle className="flex items-center gap-2 text-slate-800">
                        <MessageSquare className="h-5 w-5 text-purple-600" />
                        <span className="text-h4 font-semibold">AI CER Assistant</span>
                      </CardTitle>
                      <CardDescription className="text-body-sm text-slate-500">
                        Ask questions about your CER or get help with specific sections
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-slate-700">
                        <p className="flex items-start gap-3">
                          <span className="text-purple-600"><MessageSquare className="h-5 w-5" /></span>
                          <span><span className="font-medium">AI Assistant:</span> How can I help with your Clinical Evaluation Report today?</span>
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Ask me anything about CER development..." 
                          className="flex-1 border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary h-10" 
                        />
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Badge className="cursor-pointer text-body-xs bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200">How should I structure my State of the Art section?</Badge>
                        <Badge className="cursor-pointer text-body-xs bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200">What clinical data should I include?</Badge>
                        <Badge className="cursor-pointer text-body-xs bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200">Help me fix compliance issues</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
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