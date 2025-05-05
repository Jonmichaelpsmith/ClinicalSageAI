import React, { useState, useEffect } from 'react';
import LiteratureSearchPanel from './LiteratureSearchPanel';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, AlignLeft, FileDown, FileText, BookOpen, Search, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useExportFAERS } from '../../hooks/useExportFAERS';
import { FaersRiskBadge } from './FaersRiskBadge';
import { CerReportPreview } from './CerReportPreview';
import CerPreviewPanel from './CerPreviewPanel';

/**
 * CER Builder Panel Component
 * 
 * Comprehensive interface for building, previewing, and exporting Clinical Evaluation Reports
 * with integrated FAERS data and AI-generated sections
 */
export default function CerBuilderPanel({ title, faers, comparators, sections, onTitleChange, onSectionsChange, onFaersChange, onComparatorsChange, complianceThresholds }) {
  // Set default compliance thresholds if not provided
  const thresholds = complianceThresholds || {
    OVERALL_THRESHOLD: 0.8, // 80% overall compliance required to pass
    FLAG_THRESHOLD: 0.7,    // 70% section threshold for flagging issues
  };
  const { toast } = useToast();
  const { exportToPDF, exportToWord } = useExportFAERS();
  
  const [activeTab, setActiveTab] = useState('generator');
  const [selectedSectionType, setSelectedSectionType] = useState('benefit-risk');
  const [sectionContext, setSectionContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSection, setGeneratedSection] = useState(null);
  const [cerSections, setCerSections] = useState([]);
  const [cerTitle, setCerTitle] = useState(`Clinical Evaluation Report: ${title || 'Device/Product'}`); 
  const [exportFormat, setExportFormat] = useState('pdf');
  const [previewData, setPreviewData] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [complianceData, setComplianceData] = useState(null);
  const [isRunningCompliance, setIsRunningCompliance] = useState(false);
  
  // Section type options
  const sectionTypes = [
    { id: 'benefit-risk', label: 'Benefit-Risk Analysis' },
    { id: 'safety', label: 'Safety Analysis' },
    { id: 'clinical-background', label: 'Clinical Background' },
    { id: 'device-description', label: 'Device Description' },
    { id: 'state-of-art', label: 'State of the Art Review' },
    { id: 'equivalence', label: 'Equivalence Assessment' },
    { id: 'literature-analysis', label: 'Literature Analysis' },
    { id: 'pms-data', label: 'Post-Market Surveillance Data' },
    { id: 'conclusion', label: 'Conclusion' },
  ];
  
  // Fetch preview data when switching to preview tab
  useEffect(() => {
    if (activeTab === 'preview' && cerSections.length > 0) {
      fetchPreview();
    }
  }, [activeTab, cerSections]);
  
  // Generate section using AI
  const generateSection = async () => {
    if (!sectionContext) {
      toast({
        title: 'Missing information',
        description: 'Please provide context for the section generation.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/cer/generate-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section: selectedSectionType,
          context: sectionContext,
          productName: title.split(':')[1]?.trim() || 'Device/Product',
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      const data = await response.json();
      setGeneratedSection(data);
      
      toast({
        title: 'Section generated',
        description: `${getSelectedSectionLabel()} section successfully generated.`,
      });
    } catch (error) {
      console.error('Error generating section:', error);
      toast({
        title: 'Generation failed',
        description: error.message || 'Failed to generate section. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Add the generated section to the report
  const addToReport = () => {
    if (!generatedSection) return;
    
    const newSection = {
      id: `section-${Date.now()}`,
      type: selectedSectionType,
      title: getSelectedSectionLabel(),
      content: generatedSection.content,
      dateAdded: new Date().toISOString(),
    };
    
    setCerSections([...cerSections, newSection]);
    
    toast({
      title: 'Section added',
      description: `${newSection.title} added to report. Switch to Preview to see the full report.`,
    });
  };
  
  // Get the human-readable label for the selected section type
  const getSelectedSectionLabel = () => {
    const section = sectionTypes.find(s => s.id === selectedSectionType);
    return section ? section.label : selectedSectionType;
  };
  
  // Fetch preview data from the API
  const fetchPreview = async () => {
    setIsLoadingPreview(true);
    
    try {
      const response = await fetch('/api/cer/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: cerTitle,
          sections: cerSections,
          faers: faers?.reports || [],
          comparators: faers?.comparators || [],
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      const data = await response.json();
      setPreviewData(data);
      
      // Automatically run compliance analysis if we have sections
      if (cerSections.length > 0) {
        runComplianceAnalysis();
      }
    } catch (error) {
      console.error('Error fetching preview:', error);
      toast({
        title: 'Preview failed',
        description: error.message || 'Failed to generate preview. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingPreview(false);
    }
  };
  
  // Run compliance analysis against regulatory standards
  const runComplianceAnalysis = async () => {
    if (cerSections.length === 0) {
      toast({
        title: 'No content to analyze',
        description: 'Please add at least one section to your report before running compliance analysis.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsRunningCompliance(true);
    
    try {
      const response = await fetch('/api/cer/compliance-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: cerTitle,
          sections: cerSections.map(s => ({ title: s.title, content: s.content })),
          standards: ['EU MDR', 'ISO 14155', 'FDA']
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      const data = await response.json();
      setComplianceData(data);
      
      toast({
        title: 'Compliance analysis complete',
        description: `Overall compliance score: ${Math.round(data.overallScore * 100)}%`,
      });
    } catch (error) {
      console.error('Error analyzing compliance:', error);
      toast({
        title: 'Analysis failed',
        description: error.message || 'Failed to analyze compliance. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRunningCompliance(false);
    }
  };
  
  // Export the report as PDF or DOCX
  const exportReport = async () => {
    if (cerSections.length === 0) {
      toast({
        title: 'No content to export',
        description: 'Please generate and add at least one section to your report before exporting.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsExporting(true);
    
    try {
      // Prepare export data
      const exportData = {
        title: cerTitle,
        sections: cerSections,
        faers: faers?.reports || [],
        comparators: faers?.comparators || [],
      };
      
      // Call the appropriate export function based on format
      if (exportFormat === 'pdf') {
        await handlePdfExport(exportData);
      } else if (exportFormat === 'docx') {
        await handleDocxExport(exportData);
      }
      
      toast({
        title: 'Export successful',
        description: `Your CER has been exported as ${exportFormat.toUpperCase()}. Check your downloads folder.`,
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        title: 'Export failed',
        description: error.message || 'Failed to export report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  // Handle PDF export
  const handlePdfExport = async (exportData) => {
    // Add compliance data to export if available
    const exportPayload = {
      ...exportData,
      complianceData: complianceData,
      compliance_thresholds: {
        threshold: thresholds.OVERALL_THRESHOLD * 100, // Convert to percentage (0-100)
        flag_threshold: thresholds.FLAG_THRESHOLD * 100 // Convert to percentage (0-100)
      }
    };

    const response = await fetch('/api/cer/export-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(exportPayload),
    });
    
    if (!response.ok) {
      throw new Error(`PDF export failed: ${response.statusText}`);
    }
    
    // Create download link
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `cer_${title.split(':')[1]?.trim() || 'device'}.pdf`.replace(/\s+/g, '_').toLowerCase();
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };
  
  // Handle DOCX export using the implemented exportToWord function
  const handleDocxExport = async (exportData) => {
    try {
      await exportToWord(faers, title.split(':')[1]?.trim() || 'Device/Product', {
        sections: cerSections,
        title: cerTitle
      });
    } catch (error) {
      throw new Error(`DOCX export failed: ${error.message}`);
    }
  };
  
  // Render the UI
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Clinical Evaluation Report Builder</CardTitle>
          <CardDescription>
            Generate, review, and export your Clinical Evaluation Report with FAERS data integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="generator">
                <AlignLeft className="mr-2 h-4 w-4" />
                Section Generator
                {complianceData && (
                  <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${complianceData.overallScore >= thresholds.OVERALL_THRESHOLD ? 'bg-green-100 text-green-700' : complianceData.overallScore >= thresholds.FLAG_THRESHOLD ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                    {Math.round(complianceData.overallScore * 100)}%
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="literature">
                <BookOpen className="mr-2 h-4 w-4" />
                Literature AI
              </TabsTrigger>
              <TabsTrigger value="preview">
                <FileText className="mr-2 h-4 w-4" />
                Report Preview
                {complianceData && (
                  <span className="ml-2 flex items-center">
                    {complianceData.overallScore >= thresholds.OVERALL_THRESHOLD ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : complianceData.overallScore >= thresholds.FLAG_THRESHOLD ? (
                      <AlertTriangle className="h-3 w-3 text-amber-500" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-red-500" />
                    )}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="export">
                <FileDown className="mr-2 h-4 w-4" />
                Export Options
                {complianceData && complianceData.sectionScores && (
                  <span className="ml-2 flex items-center">
                    {complianceData.sectionScores.filter(s => s.averageScore < thresholds.FLAG_THRESHOLD).length > 0 ? (
                      <Badge variant="outline" className="bg-red-50 text-red-700 text-xs py-0 px-1.5">
                        {complianceData.sectionScores.filter(s => s.averageScore < thresholds.FLAG_THRESHOLD).length} issue{complianceData.sectionScores.filter(s => s.averageScore < thresholds.FLAG_THRESHOLD).length !== 1 ? 's' : ''}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-50 text-green-700 text-xs py-0 px-1.5">Ready</Badge>
                    )}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            {/* Section Generator Tab */}
            <TabsContent value="generator">
              <div className="space-y-4">
                {/* Compliance Score Badge */}
                {complianceData && (
                  <div className="flex justify-between items-center mb-4 p-3 border rounded-md bg-muted/20">
                    <div className="flex items-center">
                      {complianceData.overallScore >= thresholds.OVERALL_THRESHOLD ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : complianceData.overallScore >= thresholds.FLAG_THRESHOLD ? (
                        <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          Compliance Score: {Math.round(complianceData.overallScore * 100)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Based on EU MDR, ISO 14155, FDA 21 CFR 812 requirements
                        </p>
                      </div>
                    </div>
                    <Badge 
                      className={`${complianceData.overallScore >= thresholds.OVERALL_THRESHOLD ? 'bg-green-100 text-green-800' : 
                        complianceData.overallScore >= thresholds.FLAG_THRESHOLD ? 'bg-amber-100 text-amber-800' : 
                        'bg-red-100 text-red-800'}`}
                    >
                      {complianceData.overallScore >= thresholds.OVERALL_THRESHOLD ? 'Ready for Review' : 'Needs Attention'}
                    </Badge>
                  </div>
                )}
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sectionType">Section Type</Label>
                    <Select 
                      value={selectedSectionType} 
                      onValueChange={setSelectedSectionType}
                    >
                      <SelectTrigger id="sectionType">
                        <SelectValue placeholder="Select section type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>CER Sections</SelectLabel>
                          {sectionTypes.map(section => (
                            <SelectItem key={section.id} value={section.id}>
                              {section.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="context">Context Information</Label>
                    <Textarea 
                      id="context" 
                      placeholder="Enter information to help generate this section, such as device details, clinical data, or specific regulatory requirements..." 
                      value={sectionContext}
                      onChange={(e) => setSectionContext(e.target.value)}
                      rows={6}
                    />
                    <p className="text-sm text-gray-500">
                      Provide relevant details to enhance the generated content. For best results, include specifics about your device/product.
                    </p>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={generateSection} 
                      disabled={isGenerating || !sectionContext}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        'Generate Section'
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Generated Section Display */}
                {generatedSection && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{getSelectedSectionLabel()}</CardTitle>
                      <CardDescription>
                        AI-generated content based on your inputs
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none dark:prose-invert">
                        {generatedSection.content.split('\n').map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button variant="outline" className="mr-2">
                        Edit
                      </Button>
                      <Button onClick={addToReport}>
                        Add to Report
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            {/* Literature AI Tab */}
            <TabsContent value="literature">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Literature AI Search</CardTitle>
                    <CardDescription>
                      Search and analyze scientific literature for your Clinical Evaluation Report
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LiteratureSearchPanel 
                      cerTitle={title} 
                      onAddToCER={(literatureSection) => {
                        setCerSections([...cerSections, {
                          id: `section-${Date.now()}`,
                          type: 'literature-review',
                          title: 'Literature Review',
                          content: literatureSection.content,
                          dateAdded: new Date().toISOString(),
                        }]);
                        
                        toast({
                          title: 'Literature Review Added',
                          description: 'Literature review and citations have been added to your report.',
                        });
                        
                        // Switch to preview tab to show the added content
                        setActiveTab('preview');
                      }}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Report Preview Tab */}
            <TabsContent value="preview">
              <div className="space-y-4">
                <div className="flex">
                  <Input 
                    value={cerTitle} 
                    onChange={(e) => setCerTitle(e.target.value)} 
                    className="text-lg font-bold"
                  />
                </div>
                
                <CerReportPreview 
                  isLoading={isLoadingPreview || isRunningCompliance}
                  previewData={{
                    title: cerTitle,
                    sections: cerSections,
                    faersData: faers,
                    comparatorData: faers?.comparators || [],
                    generatedAt: new Date().toISOString(),
                    metadata: {
                      totalSections: cerSections.length,
                      hasFaersData: Boolean(faers?.reports?.length > 0),
                      hasComparatorData: Boolean(faers?.comparators?.length > 0)
                    }
                  }}
                  productName={title.split(':')[1]?.trim() || 'Device/Product'}
                  complianceData={complianceData}
                />
                
                {/* Compliance Check Button and Section Issues */}
                <div className="flex flex-col space-y-4 mt-4">
                  {complianceData && complianceData.sectionScores && (
                    <div className="border rounded-md p-4 bg-muted/10">
                      <h3 className="text-sm font-medium mb-2 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                        Section Compliance Issues
                      </h3>
                      
                      <div className="space-y-2">
                        {complianceData.sectionScores
                          .filter(section => section.averageScore < thresholds.FLAG_THRESHOLD)
                          .map((section, index) => (
                            <div 
                              key={index} 
                              className="p-2 bg-red-50 border border-red-200 rounded-md flex justify-between items-center cursor-pointer hover:bg-red-100 transition-colors"
                              onClick={() => {
                                // Find the section element and scroll to it
                                const sectionTitle = section.title;
                                const sectionElement = document.getElementById(`section-${cerSections.findIndex(s => s.title === sectionTitle)}`);
                                if (sectionElement) {
                                  sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  // Highlight the section briefly
                                  sectionElement.classList.add('highlight-section');
                                  setTimeout(() => {
                                    sectionElement.classList.remove('highlight-section');
                                  }, 2000);
                                }
                              }}
                            >
                              <div className="flex items-center">
                                <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                                <span className="text-sm text-red-700">{section.title}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-red-700">{Math.round(section.averageScore * 100)}%</span>
                                <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded ml-2">Scroll to</span>
                              </div>
                            </div>
                          ))
                        }
                        
                        {complianceData.sectionScores.filter(section => section.averageScore < thresholds.FLAG_THRESHOLD).length === 0 && (
                          <div className="p-2 bg-green-50 border border-green-200 rounded-md">
                            <div className="flex items-center">
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                              <span className="text-sm text-green-700">All sections meet compliance thresholds</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {cerSections.length > 0 && !isRunningCompliance && (
                    <div className="flex justify-end">
                      <Button 
                        onClick={runComplianceAnalysis}
                        variant="outline"
                        className="flex items-center gap-2"
                        disabled={isRunningCompliance}
                      >
                        {isRunningCompliance ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Analyzing Compliance...
                          </>
                        ) : (
                          <>Run Compliance Check</>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
                
                {isRunningCompliance && (
                  <div className="mt-4 p-4 border rounded-md bg-muted/30">
                    <div className="flex items-center">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      <p>Analyzing regulatory compliance against EU MDR, FDA, and ISO 14155 standards...</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Export Options Tab */}
            <TabsContent value="export">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Export Options</CardTitle>
                    <CardDescription>
                      Configure and download your Clinical Evaluation Report
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="exportFormat">File Format</Label>
                        <div className="flex space-x-4">
                          <div className="flex items-center space-x-2">
                            <input 
                              type="radio" 
                              id="pdf-format" 
                              value="pdf" 
                              checked={exportFormat === 'pdf'}
                              onChange={() => setExportFormat('pdf')}
                            />
                            <Label htmlFor="pdf-format">PDF</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="radio" 
                              id="docx-format" 
                              value="docx" 
                              checked={exportFormat === 'docx'}
                              onChange={() => setExportFormat('docx')}
                            />
                            <Label htmlFor="docx-format">Word (DOCX)</Label>
                          </div>
                        </div>
                      </div>
                      
                      {/* Additional export options can be added here */}
                      
                      <div className="space-y-1">
                        <Label htmlFor="reportTitle">Report Title</Label>
                        <Input 
                          id="reportTitle"
                          value={cerTitle}
                          onChange={(e) => setCerTitle(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button
                      onClick={exportReport}
                      disabled={isExporting || cerSections.length === 0}
                    >
                      {isExporting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <FileDown className="mr-2 h-4 w-4" />
                          Export as {exportFormat.toUpperCase()}
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
                
                <div className="text-sm text-muted-foreground">
                  <p>The exported report will include:</p>
                  <ul className="list-disc list-inside pl-4 mt-2">
                    <li>Report title and metadata</li>
                    <li>All generated sections ({cerSections.length} added)</li>
                    {complianceData && (
                      <li className="flex items-center text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Regulatory compliance analysis ({Math.round(complianceData.overallScore * 100)}% overall score)
                      </li>
                    )}
                    {faers && (
                      <>
                        <li>FAERS safety analysis ({faers.totalReports || 0} reports)</li>
                        {faers.comparators && faers.comparators.length > 0 && (
                          <li>Comparator analysis ({faers.comparators.length} products)</li>
                        )}
                      </>
                    )}
                  </ul>
                </div>
                
                {/* Compliance Export Information */}
                {complianceData ? (
                  <div className="p-3 mt-2 border border-green-200 bg-green-50 rounded-md">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-green-800">Compliance data will be included in the export</p>
                        <p className="text-xs text-green-700 mt-1">
                          The PDF will include visual indicators for sections below compliance thresholds, color coding, and regulatory guidance.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 mt-2 border border-amber-200 bg-amber-50 rounded-md">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">Compliance data not available</p>
                        <p className="text-xs text-amber-700 mt-1">
                          For regulatory compliance indicators in your export, please run the compliance check in the Preview tab first.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
