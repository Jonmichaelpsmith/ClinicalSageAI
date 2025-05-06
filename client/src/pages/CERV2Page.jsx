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
import { exportToPDF, exportToWord, downloadBlob, fetchFaersData, getComplianceScore } from '@/services/CerAPIService';
import { useToast } from '@/hooks/use-toast';
import { ClipboardCheck, Clock, Download, FileCheck, FileText, CheckCircle, AlertCircle, ChevronDown, FileWarning, BookOpen, Calendar, Layers, CircleCheck, CircleAlert, Database, MessageSquare, UploadCloud, Loader2, Info } from 'lucide-react';

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
            <div className="space-y-6">
              {/* AI Assistant for Automated CER Generation */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left panel - Device Input and Settings */}
                <div className="md:col-span-5">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-blue-600" />
                        Device Information
                      </CardTitle>
                      <CardDescription>
                        Configure device details for intelligent CER generation
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="deviceName">Device Name</Label>
                        <Input
                          id="deviceName"
                          placeholder="e.g., CardioMonitor Pro 3000"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="deviceType">Device Type</Label>
                        <Select defaultValue="Class2">
                          <SelectTrigger id="deviceType">
                            <SelectValue placeholder="Select device type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>EU MDR</SelectLabel>
                              <SelectItem value="Class1">Class I (Non-sterile)</SelectItem>
                              <SelectItem value="Class1s">Class I (Sterile)</SelectItem>
                              <SelectItem value="Class2a">Class IIa</SelectItem>
                              <SelectItem value="Class2b">Class IIb</SelectItem>
                              <SelectItem value="Class3">Class III</SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                              <SelectLabel>US FDA</SelectLabel>
                              <SelectItem value="Class1FDA">Class I (Exempt)</SelectItem>
                              <SelectItem value="Class2FDA">Class II (510k)</SelectItem>
                              <SelectItem value="Class3FDA">Class III (PMA)</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="regulatoryPath">Regulatory Framework</Label>
                        <Select defaultValue="EU-MDR">
                          <SelectTrigger id="regulatoryPath">
                            <SelectValue placeholder="Select regulatory framework" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EU-MDR">EU MDR</SelectItem>
                            <SelectItem value="ISO-14155">ISO 14155</SelectItem>
                            <SelectItem value="US-FDA">US FDA</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="intendedUse">Intended Use</Label>
                        <Textarea
                          id="intendedUse"
                          placeholder="Describe the intended use of the device..."
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UploadCloud className="h-5 w-5 text-blue-600" />
                        Document Upload
                      </CardTitle>
                      <CardDescription>
                        Upload existing documentation to enhance the CER
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-slate-50 transition-colors">
                        <div className="flex flex-col items-center">
                          <UploadCloud className="w-8 h-8 mb-2 text-slate-400" />
                          <span className="text-sm font-medium">Click to upload or drag and drop</span>
                          <span className="text-xs text-slate-500 mt-1">PDF, DOCX, CSV (max 10MB each)</span>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Label className="text-sm">Data Sources</Label>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center">
                            <input type="checkbox" id="faers" className="mr-2" checked />
                            <Label htmlFor="faers" className="text-sm cursor-pointer">FAERS Database</Label>
                          </div>
                          <div className="flex items-center">
                            <input type="checkbox" id="literature" className="mr-2" checked />
                            <Label htmlFor="literature" className="text-sm cursor-pointer">PubMed Literature</Label>
                          </div>
                          <div className="flex items-center">
                            <input type="checkbox" id="maude" className="mr-2" checked />
                            <Label htmlFor="maude" className="text-sm cursor-pointer">MAUDE Database</Label>
                          </div>
                          <div className="flex items-center">
                            <input type="checkbox" id="eudamed" className="mr-2" checked />
                            <Label htmlFor="eudamed" className="text-sm cursor-pointer">EUDAMED</Label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Right panel - CER Generation Options */}
                <div className="md:col-span-7">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-indigo-600" />
                        AI-Powered CER Generation
                      </CardTitle>
                      <CardDescription>
                        Generate a complete, standards-compliant Clinical Evaluation Report
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Smart Generation Options</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center mb-2">
                                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                                <h4 className="font-medium">Standard CER</h4>
                              </div>
                              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Recommended</Badge>
                            </div>
                            <p className="text-sm text-gray-600">Generate a complete CER with all required sections based on device classification</p>
                            <div className="flex items-center gap-1 mt-2">
                              <Info className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">~25 min generation time</span>
                            </div>
                          </div>
                          
                          <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center mb-2">
                                <ClipboardCheck className="h-5 w-5 mr-2 text-indigo-600" />
                                <h4 className="font-medium">Zero-Click Report</h4>
                              </div>
                              <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">Premium</Badge>
                            </div>
                            <p className="text-sm text-gray-600">Fully autonomous report generation with intelligent data integration and self-completion</p>
                            <div className="flex items-center gap-1 mt-2">
                              <Info className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">~15 min generation time</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                            <div className="flex items-center mb-2">
                              <BookOpen className="h-5 w-5 mr-2 text-amber-600" />
                              <h4 className="font-medium">Literature-Focused</h4>
                            </div>
                            <p className="text-sm text-gray-600">CER with enhanced literature review and critical appraisal of scientific evidence</p>
                            <div className="flex items-center gap-1 mt-2">
                              <Info className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">~40 min generation time</span>
                            </div>
                          </div>
                          
                          <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                            <div className="flex items-center mb-2">
                              <Database className="h-5 w-5 mr-2 text-purple-600" />
                              <h4 className="font-medium">Deep Data Analysis</h4>
                            </div>
                            <p className="text-sm text-gray-600">Comprehensive CER with in-depth data analysis and statistical evaluation of safety data</p>
                            <div className="flex items-center gap-1 mt-2">
                              <Info className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">~35 min generation time</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4 space-y-3">
                        <h3 className="text-lg font-medium">Required Sections</h3>
                        
                        <div className="grid grid-cols-2 gap-2">
                          {['Device Description', 'Intended Purpose', 'State of the Art', 'Clinical Data Analysis', 'Post-Market Surveillance', 'Literature Review', 'Benefit-Risk Analysis', 'Conclusion'].map((section, index) => (
                            <div key={index} className="flex items-center text-sm">
                              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                              {section}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <Button size="lg" className="w-full" onClick={() => {
                          toast({
                            title: "AI-Generated CER",
                            description: "Your zero-click report has started processing. This will take approximately 15 minutes.",
                          });
                          
                          // In a real implementation, we would call an API to start the generation process
                          // and then update the sections state when complete
                          setTimeout(() => {
                            const newSections = [
                              {
                                title: "Device Description",
                                type: "device-description",
                                content: `# Device Description\n\nThis section provides a detailed description of ${title || "the medical device"}, including its components, functional characteristics, and technical specifications. The device is designed in accordance with the relevant standards and regulatory requirements.\n\nThe device consists of specialized components engineered to ensure safety and efficacy in clinical use. Manufacturing processes follow strict quality control protocols to ensure consistency and reliability.`
                              },
                              {
                                title: "Intended Purpose",
                                type: "intended-purpose",
                                content: `# Intended Purpose\n\n${title || "The medical device"} is intended for use in clinical settings to provide diagnostic or therapeutic benefit to patients with specific conditions. The device is indicated for use under the supervision of healthcare professionals trained in its operation.\n\nThe target patient population and clinical settings are clearly defined based on the device's specific characteristics and performance capabilities.`
                              },
                              {
                                title: "State of the Art",
                                type: "state-of-art",
                                content: `# State of the Art\n\nThis section provides a comprehensive overview of the current state of the art in the field related to ${title || "the medical device"}. It includes an analysis of existing technologies, alternative treatments, and current clinical practices.\n\nThe review demonstrates that ${title || "the device"} incorporates the latest technological advancements and is comparable or superior to existing alternatives in terms of safety and performance.`
                              },
                              {
                                title: "Clinical Data Analysis",
                                type: "clinical-data",
                                content: `# Clinical Data Analysis\n\nThis section presents an analysis of clinical data related to ${title || "the medical device"}, including clinical investigations, published literature, and post-market surveillance data.\n\nThe analysis demonstrates that the device meets its intended purpose and performs as expected in clinical use. Safety and performance data support the device's benefit-risk profile.`
                              },
                              {
                                title: "Post-Market Surveillance",
                                type: "post-market",
                                content: `# Post-Market Surveillance\n\nThis section describes the post-market surveillance system in place for ${title || "the medical device"}, including mechanisms for collecting and analyzing data on device performance and safety in real-world use.\n\nThe surveillance system is designed to identify any emerging risks or issues related to the device and to implement corrective actions as needed.`
                              },
                              {
                                title: "Literature Review",
                                type: "literature-review",
                                content: `# Literature Review\n\nThis section presents a systematic review of published literature related to ${title || "the medical device"} and similar devices. The review includes clinical studies, case reports, and other relevant publications.\n\nThe literature review supports the safety and performance of the device and provides context for its use in clinical practice. Key findings from the literature are integrated into the overall clinical evaluation.`
                              },
                              {
                                title: "Benefit-Risk Analysis",
                                type: "benefit-risk",
                                content: `# Benefit-Risk Analysis\n\nThis section presents a comprehensive analysis of the benefits and risks associated with ${title || "the medical device"}, based on available clinical data and literature.\n\nThe analysis demonstrates that the benefits of the device outweigh the risks when used as intended. Residual risks are identified and mitigation measures are described.`
                              },
                              {
                                title: "Conclusion",
                                type: "conclusion",
                                content: `# Conclusion\n\nBased on the comprehensive clinical evaluation presented in this report, ${title || "the medical device"} is determined to be safe and effective for its intended purpose when used as specified.\n\nThe device meets all applicable regulatory requirements and standards. The benefit-risk profile is favorable, and the device represents a valuable option for clinical use in the specified indications.`
                              }
                            ];
                            
                            setSections(newSections);
                            setActiveTab("preview");
                            
                            toast({
                              title: "CER Generation Complete",
                              description: "Your AI-generated Clinical Evaluation Report is ready for review.",
                              variant: "success"
                            });
                            
                            // Auto-trigger compliance check
                            setTimeout(() => {
                              runComplianceCheck();
                            }, 1000);
                            
                          }, 3000); // Simulated delay for demo purposes
                        }}>
                          <FileText className="h-5 w-5 mr-2" />
                          Generate Zero-Click CER Report
                        </Button>
                        
                        <p className="text-xs text-center mt-2 text-gray-500">
                          The report will be generated using GPT-4o intelligence and all available data sources
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-purple-600" />
                        AI CER Assistant
                      </CardTitle>
                      <CardDescription>
                        Ask questions about your CER or get help with specific sections
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-3 bg-gray-50 rounded-md text-gray-700">
                          <p><span className="font-medium">AI Assistant:</span> How can I help with your Clinical Evaluation Report today?</p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Input placeholder="Ask me anything about CER development..." className="flex-1" />
                          <Button>
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 text-xs">
                          <Badge className="cursor-pointer" variant="outline">How should I structure my State of the Art section?</Badge>
                          <Badge className="cursor-pointer" variant="outline">What clinical data should I include?</Badge>
                          <Badge className="cursor-pointer" variant="outline">Help me fix compliance issues</Badge>
                        </div>
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