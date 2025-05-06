import React, { useState, useEffect } from 'react';
import { cerApiService } from '../../services/CerAPIService';
import LiteratureSearchPanel from './LiteratureSearchPanel';
import ComplianceScorePanel from './ComplianceScorePanel';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
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
import { Loader2, AlignLeft, FileDown, FileText, BookOpen, Search } from 'lucide-react';
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
export default function CerBuilderPanel({ title, faers, comparators, sections, onTitleChange, onSectionsChange, onFaersChange, onComparatorsChange }) {
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
      const data = await cerApiService.generateSection({
        section: selectedSectionType,
        context: sectionContext,
        productName: title.split(':')[1]?.trim() || 'Device/Product',
      });
      
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
      const data = await cerApiService.getPreview({
        title: cerTitle,
        sections: cerSections,
        faers: faers?.reports || [],
        comparators: faers?.comparators || [],
      });
      
      setPreviewData(data);
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
    try {
      // Get product name from title
      const productName = title.split(':')[1]?.trim() || 'Device/Product';
      
      // Use the cerApiService to get the PDF blob
      const blob = await cerApiService.exportToPDF(exportData);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `cer_${productName.replace(/\s+/g, '_').toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('PDF export error:', error);
      throw error;
    }
  };
  
  // Handle DOCX export using cerApiService
  const handleDocxExport = async (exportData) => {
    try {
      const productName = title.split(':')[1]?.trim() || 'Device/Product';
      
      // Use the cerApiService to handle Word document export
      await cerApiService.exportToWord(exportData, productName);
    } catch (error) {
      console.error('DOCX export error:', error);
      throw new Error(`DOCX export failed: ${error.message}`);
    }
  };
  
  // Render the UI
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Clinical Evaluation Report Builder</h1>
        <p className="text-muted-foreground mt-2">
          Generate, review, and export your Clinical Evaluation Report with FAERS data integration
        </p>
      </div>
      
      <Card className="shadow-sm border-gray-200">
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 mb-6 bg-slate-50 p-1 rounded-md border border-slate-200">
              <TabsTrigger 
                value="generator" 
                className={cn(
                  "flex items-center justify-center py-2 rounded-md transition-all",
                  activeTab === 'generator' ? 'bg-white shadow-sm text-blue-600 font-medium' : 'hover:bg-slate-100'
                )}
              >
                <AlignLeft className="h-4 w-4 mr-2" />
                <span>Section Generator</span>
              </TabsTrigger>
              <TabsTrigger 
                value="literature" 
                className={cn(
                  "flex items-center justify-center py-2 rounded-md transition-all",
                  activeTab === 'literature' ? 'bg-white shadow-sm text-blue-600 font-medium' : 'hover:bg-slate-100'
                )}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                <span>Literature AI</span>
              </TabsTrigger>
              <TabsTrigger 
                value="preview" 
                className={cn(
                  "flex items-center justify-center py-2 rounded-md transition-all",
                  activeTab === 'preview' ? 'bg-white shadow-sm text-blue-600 font-medium' : 'hover:bg-slate-100'
                )}
              >
                <FileText className="h-4 w-4 mr-2" />
                <span>Report Preview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="compliance" 
                className={cn(
                  "flex items-center justify-center py-2 rounded-md transition-all",
                  activeTab === 'compliance' ? 'bg-white shadow-sm text-blue-600 font-medium' : 'hover:bg-slate-100'
                )}
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
                  <path d="M9 14l2 2 4-4" />
                </svg>
                <span>Compliance</span>
              </TabsTrigger>
              <TabsTrigger 
                value="export" 
                className={cn(
                  "flex items-center justify-center py-2 rounded-md transition-all",
                  activeTab === 'export' ? 'bg-white shadow-sm text-blue-600 font-medium' : 'hover:bg-slate-100'
                )}
              >
                <FileDown className="h-4 w-4 mr-2" />
                <span>Export</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Section Generator Tab */}
            <TabsContent value="generator">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sectionType">Section Type</Label>
                    <Select 
                      value={selectedSectionType} 
                      onValueChange={setSelectedSectionType}
                    >
                      <SelectTrigger id="sectionType" className="bg-white border-slate-200">
                        <SelectValue placeholder="Select section type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-slate-200 shadow-md">
                        <SelectGroup>
                          <SelectLabel className="text-slate-500 font-medium">CER Sections</SelectLabel>
                          {sectionTypes.map(section => (
                            <SelectItem key={section.id} value={section.id} className="text-slate-800 hover:bg-slate-50">
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
                <Card className="bg-white border-slate-200 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="space-y-3">
                      <Label htmlFor="reportTitlePreview" className="text-base font-medium">Report Title</Label>
                      <Input 
                        id="reportTitlePreview"
                        value={cerTitle} 
                        onChange={(e) => setCerTitle(e.target.value)} 
                        className="text-lg font-semibold bg-white border-slate-200 focus:border-blue-400"
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-end mb-4">
                      <Button 
                        size="sm" 
                        onClick={fetchPreview} 
                        disabled={isLoadingPreview || cerSections.length === 0}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isLoadingPreview ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Refreshing...
                          </>
                        ) : (
                          <>Refresh Preview</>
                        )}
                      </Button>
                    </div>
                    
                    <CerReportPreview 
                      isLoading={isLoadingPreview}
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
                    />
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-between">
                    <div className="text-sm text-slate-500">
                      {cerSections.length === 0 ? (
                        "No sections added yet. Generate sections in the 'Section Generator' tab."
                      ) : (
                        `${cerSections.length} section${cerSections.length !== 1 ? 's' : ''} included in this report`
                      )}
                    </div>
                    <Button
                      onClick={() => setActiveTab('export')}
                      size="sm"
                      variant="outline"
                      disabled={cerSections.length === 0}
                    >
                      <FileDown className="mr-2 h-4 w-4" /> Export Report
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            {/* Compliance Tab */}
            <TabsContent value="compliance">
              <ComplianceScorePanel 
                sections={cerSections}
                title={cerTitle}
                onComplianceChange={(complianceData) => {
                  // Handle compliance data updates if needed
                  console.log('Compliance data updated:', complianceData);
                }}
                onStatusChange={(status) => {
                  // Handle status changes if needed
                  console.log('Compliance status changed:', status);
                }}
              />
            </TabsContent>
            
            {/* Export Options Tab */}
            <TabsContent value="export">
              <div className="space-y-6">
                <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-slate-100">
                    <CardTitle className="flex items-center">
                      <FileDown className="mr-2 h-5 w-5 text-blue-500" />
                      Export Clinical Evaluation Report
                    </CardTitle>
                    <CardDescription>
                      Configure your document format and download your complete Clinical Evaluation Report
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="exportFormat" className="text-base font-medium">File Format</Label>
                          <p className="text-sm text-slate-500 mt-1">Choose the format for your exported document</p>
                        </div>
                        <div className="grid gap-2">
                          <div className={`flex items-center space-x-2 rounded-md px-3 py-2 cursor-pointer border ${exportFormat === 'pdf' ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200 hover:bg-slate-50'}`} onClick={() => setExportFormat('pdf')}>
                            <div className="flex h-5 w-5 items-center justify-center rounded-full border border-primary">
                              {exportFormat === 'pdf' && <div className="h-2.5 w-2.5 rounded-full bg-primary"></div>}
                            </div>
                            <div>
                              <Label htmlFor="pdf-format" className="cursor-pointer font-medium block">PDF Format</Label>
                              <span className="text-xs text-slate-500">Best for review and printing</span>
                            </div>
                          </div>
                          <div className={`flex items-center space-x-2 rounded-md px-3 py-2 cursor-pointer border ${exportFormat === 'docx' ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200 hover:bg-slate-50'}`} onClick={() => setExportFormat('docx')}>
                            <div className="flex h-5 w-5 items-center justify-center rounded-full border border-primary">
                              {exportFormat === 'docx' && <div className="h-2.5 w-2.5 rounded-full bg-primary"></div>}
                            </div>
                            <div>
                              <Label htmlFor="docx-format" className="cursor-pointer font-medium block">Word (DOCX)</Label>
                              <span className="text-xs text-slate-500">Best for editing and collaboration</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="reportTitle" className="text-base font-medium">Report Title</Label>
                          <p className="text-sm text-slate-500 mt-1">This will appear at the top of your exported document</p>
                        </div>
                        <Input 
                          id="reportTitle"
                          value={cerTitle}
                          onChange={(e) => setCerTitle(e.target.value)}
                          className="bg-white border-slate-200 focus:border-blue-400 font-medium"
                          placeholder="Enter report title..."
                        />
                      </div>
                    </div>
                    
                    <div className="mt-8 p-4 bg-slate-50 rounded-md border border-slate-200">
                      <h4 className="text-sm font-semibold mb-2 flex items-center">
                        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
                          <path d="M9 14l2 2 4-4" />
                        </svg>
                        Content Summary
                      </h4>
                      <ul className="text-sm space-y-1 text-slate-600">
                        <li className="flex items-center">
                          <svg className="h-3.5 w-3.5 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Report title and metadata
                        </li>
                        <li className="flex items-center">
                          <svg className="h-3.5 w-3.5 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {cerSections.length === 0 ? (
                            <span className="text-amber-600">No sections added yet</span>
                          ) : (
                            <span>{cerSections.length} report section{cerSections.length !== 1 ? 's' : ''}</span>
                          )}
                        </li>
                        {faers && (
                          <>
                            <li className="flex items-center">
                              <svg className="h-3.5 w-3.5 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              FAERS safety analysis ({faers.totalReports || 0} reports)
                            </li>
                            {faers.comparators && faers.comparators.length > 0 && (
                              <li className="flex items-center">
                                <svg className="h-3.5 w-3.5 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Comparator analysis ({faers.comparators.length} products)
                              </li>
                            )}
                          </>
                        )}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end border-t bg-slate-50 py-4">
                    <Button
                      onClick={exportReport}
                      disabled={isExporting || cerSections.length === 0}
                      className="bg-blue-600 hover:bg-blue-700 shadow-sm"
                      size="lg"
                    >
                      {isExporting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <FileDown className="mr-2 h-5 w-5" />
                          Export as {exportFormat.toUpperCase()}
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
