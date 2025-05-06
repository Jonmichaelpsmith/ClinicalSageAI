import React, { useState, useEffect } from 'react';
import LiteratureSearchPanel from './LiteratureSearchPanel';
import CerReportPreview from './CerReportPreview';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, FileText, AlignLeft, BookOpen, FileDown, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function CerBuilderPanel({
  title = 'Clinical Evaluation Report',
  faers,
  comparators = [],
  sections = [],
  onTitleChange,
  onSectionsChange,
  onFaersChange,
  onComparatorsChange,
  complianceThresholds = {
    OVERALL_THRESHOLD: 0.8, // 80% threshold for passing
    FLAG_THRESHOLD: 0.7     // 70% threshold for warnings/flagging
  },
  onComplianceScoreChange,
  hideHeader = false
}) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('generator');
  const [cerTitle, setCerTitle] = useState(title || 'Clinical Evaluation Report');
  const [selectedSectionType, setSelectedSectionType] = useState('benefit-risk');
  const [sectionContext, setSectionContext] = useState('');
  const [generatedSection, setGeneratedSection] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isRunningCompliance, setIsRunningCompliance] = useState(false);
  const [complianceData, setComplianceData] = useState(null);
  const [cerSections, setCerSections] = useState(sections || []);
  
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
  
  const thresholds = complianceThresholds || {
    OVERALL_THRESHOLD: 0.8,
    FLAG_THRESHOLD: 0.7
  };
  
  // Update parent component with title changes
  useEffect(() => {
    if (onTitleChange && cerTitle !== title) {
      onTitleChange(cerTitle);
    }
  }, [cerTitle, onTitleChange, title]);
  
  // Update parent component with sections changes
  useEffect(() => {
    if (onSectionsChange && JSON.stringify(cerSections) !== JSON.stringify(sections)) {
      onSectionsChange(cerSections);
    }
  }, [cerSections, onSectionsChange, sections]);
  
  // Run compliance check when viewing preview if sections exist
  useEffect(() => {
    if (activeTab === 'preview' && cerSections.length > 0) {
      // TODO: Implement automatic compliance checking
      // runComplianceCheck();
    }
  }, [activeTab, cerSections]);
  
  // Get description for the selected section type
  const getSectionDescription = (sectionType) => {
    const descriptions = {
      'benefit-risk': 'Analysis of clinical benefits versus risks based on ISO 14971 methodology.',
      'safety': 'Evaluation of safety profile including adverse events and complications.',
      'clinical-background': 'Background information on the clinical problem and needs.',
      'device-description': 'Technical description of the device and its components.',
      'state-of-art': 'Current state of the art in medical practice for this indication.',
      'equivalence': 'Comparison with equivalent devices currently on the market.',
      'literature-analysis': 'Analysis of relevant scientific literature and clinical evidence.',
      'pms-data': 'Post-market surveillance data and real-world performance.',
      'conclusion': 'Overall conclusions about safety, performance and benefit-risk.',
    };
    
    return descriptions[sectionType] || 'No description available';
  };
  
  // Generate a section based on the type and context
  const generateSection = async () => {
    setIsGenerating(true);
    
    try {
      // This would be an API call in a real application
      // const response = await fetch('/api/cer/generate-section', { ... })
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newSection = {
        id: `section-${Date.now()}`,
        type: selectedSectionType,
        title: getSelectedSectionLabel(),
        content: sectionContext,
        dateAdded: new Date().toISOString(),
      };
      
      setGeneratedSection(newSection);
      
      toast({
        title: 'Section Generated',
        description: `${getSelectedSectionLabel()} section successfully generated.`,
      });
    } catch (err) {
      console.error('Error generating section:', err);
      
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Failed to generate section. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Add the generated section to the report
  const addToReport = () => {
    if (!generatedSection) return;
    
    setCerSections([...cerSections, generatedSection]);
    
    toast({
      title: 'Section Added',
      description: 'Section has been added to your report.',
    });
    
    setGeneratedSection(null);
    setSectionContext('');
    // Optional: Switch to preview
    // setActiveTab('preview');
  };
  
  // Get a user-friendly label for the selected section type
  const getSelectedSectionLabel = () => {
    const selectedType = sectionTypes.find(type => type.id === selectedSectionType);
    return selectedType ? selectedType.label : 'Section';
  };
  
  // Run a compliance check with configurable thresholds
  const runComplianceCheck = async () => {
    if (cerSections.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Sections',
        description: 'Add sections to your report before running a compliance check.',
      });
      return;
    }
    
    setIsRunningCompliance(true);
    
    try {
      // Simulate API call - in real app, this would be a fetch to backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Sample compliance data - would come from API
      const sampleComplianceData = {
        overallScore: 0.75,
        summary: 'Your report meets most regulatory requirements but needs improvement in some areas.',
        standards: {
          'EU MDR': {
            score: 0.68,
            criticalGaps: ['Missing clinical investigation data', 'Insufficient state of the art analysis'],
          },
          'ISO 14155': {
            score: 0.82,
            criticalGaps: [],
          },
          'FDA': {
            score: 0.76,
            criticalGaps: ['Benefit-risk analysis needs strengthening'],
          },
        },
        sectionScores: cerSections.map(section => ({
          id: section.id,
          title: section.title,
          averageScore: Math.random() * 0.5 + 0.5, // Random score between 0.5 and 1.0
          standards: {
            'EU MDR': {
              score: Math.random() * 0.5 + 0.5,
              feedback: 'Section meets basic requirements',
              suggestions: ['Add more clinical data', 'Strengthen equivalence justification'],
            },
            'ISO 14155': {
              score: Math.random() * 0.5 + 0.5,
              feedback: 'Good compliance with ISO standards',
              suggestions: [],
            },
            'FDA': {
              score: Math.random() * 0.5 + 0.5,
              feedback: 'Acceptable but could be improved',
              suggestions: ['Add more detail on adverse events', 'Include more statistical analysis'],
            },
          },
        })),
      };
      
      setComplianceData(sampleComplianceData);
      
      // Update parent component if callback provided
      if (onComplianceScoreChange) {
        onComplianceScoreChange(sampleComplianceData);
      }
      
      toast({
        title: 'Compliance Check Complete',
        description: `Overall Score: ${Math.round(sampleComplianceData.overallScore * 100)}%`,
      });
    } catch (err) {
      console.error('Error running compliance check:', err);
      
      toast({
        variant: 'destructive',
        title: 'Compliance Check Failed',
        description: 'Failed to analyze compliance. Please try again.',
      });
    } finally {
      setIsRunningCompliance(false);
    }
  };
  
  // Simulate loading the preview
  const loadPreview = async () => {
    if (cerSections.length === 0) return;
    
    setIsLoadingPreview(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoadingPreview(false);
  };
  
  // Handle export of the report
  const handleExport = async (format = 'pdf') => {
    if (cerSections.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Sections',
        description: 'Add sections to your report before exporting.',
      });
      return;
    }
    
    toast({
      title: 'Exporting Report',
      description: `Preparing ${format.toUpperCase()} export...`,
    });
    
    // This would be an API call in a real application
    // const response = await fetch('/api/cer/export', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     title: cerTitle,
    //     sections: cerSections,
    //     faersData: faers,
    //     comparatorData: faers?.comparators || [],
    //     format
    //   })
    // });
  };
  
  // Render the UI
  return (
    <div className="space-y-4">
      {!hideHeader && (
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
                  </div>
                )}
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold mb-2">Section Type Selection</h3>
                      <p className="text-sm text-muted-foreground mb-4">Choose a section type to generate content compliant with EU MDR, ISO 14155, and FDA regulations</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                      {sectionTypes.map(section => (
                        <div
                          key={section.id}
                          className={`relative flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-muted/30 ${selectedSectionType === section.id ? 'border-primary bg-primary/10' : 'border-muted'}`}
                          onClick={() => setSelectedSectionType(section.id)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-semibold">{section.label}</span>
                            {selectedSectionType === section.id && (
                              <CheckCircle className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {getSectionDescription(section.id)}
                          </p>
                        </div>
                      ))}
                    </div>
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
                      cerTitle={cerTitle} 
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
                      <h3 className="text-base font-medium mb-3">Section Compliance</h3>
                      <div className="space-y-2">
                        {complianceData.sectionScores
                          .filter(section => section.averageScore < thresholds.FLAG_THRESHOLD)
                          .map((section, idx) => (
                            <div key={idx} className="flex items-start p-3 bg-red-50 rounded-md border border-red-200">
                              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-red-800">{section.title}</p>
                                <p className="text-sm text-red-700 mt-1">
                                  Compliance Score: {Math.round(section.averageScore * 100)}%
                                </p>
                                <ul className="text-sm text-red-700 mt-2 space-y-1 list-disc list-inside">
                                  {Object.values(section.standards).flatMap(std => 
                                    std.suggestions.map((suggestion, i) => (
                                      <li key={i}>{suggestion}</li>
                                    ))
                                  )}
                                </ul>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={runComplianceCheck}
                      disabled={isRunningCompliance || cerSections.length === 0}
                    >
                      {isRunningCompliance ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        'Run Compliance Check'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Export Tab */}
            <TabsContent value="export">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">PDF Export</CardTitle>
                      <CardDescription>
                        Export your report as a professional PDF document
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">
                        Generate a complete PDF document with all sections, FAERS data, and regulatory compliance information.
                      </p>
                      <Button 
                        onClick={() => handleExport('pdf')}
                        disabled={cerSections.length === 0}
                        className="w-full"
                      >
                        <FileDown className="mr-2 h-4 w-4" />
                        Export as PDF
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">DOCX Export</CardTitle>
                      <CardDescription>
                        Export your report as an editable Word document
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">
                        Generate a Microsoft Word document that you can further customize in your preferred word processor.
                      </p>
                      <Button 
                        variant="outline"
                        onClick={() => handleExport('docx')}
                        disabled={cerSections.length === 0}
                        className="w-full"
                      >
                        <FileDown className="mr-2 h-4 w-4" />
                        Export as DOCX
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                
                {!complianceData && (
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
      )}
      
      {/* If the header is hidden, we're in embed mode, so show tabs directly */}
      {hideHeader && (
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
            </TabsTrigger>
          </TabsList>
          
          {/* Add main tab contents here, similar to above */}
          {/* ... */}
        </Tabs>
      )}
    </div>
  );
}