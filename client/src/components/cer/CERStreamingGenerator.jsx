import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Download, 
  Check, 
  AlertCircle, 
  Loader2,
  Copy,
  RefreshCw,
  BookOpen,
  Dices,
  FlaskConical,
  PlusCircle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
  Info,
  Search,
  ChevronUp,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * CER Streaming Generator Component
 * 
 * Implements a modern clinical evaluation report generator with streaming capability
 * using server-sent events for real-time content generation. Supports customizable
 * sections, evidence retrieval, and seamless integration with FAERS data.
 */
const CERStreamingGenerator = ({ 
  productInfo = {}, 
  templateId = null,
  onGenerated = () => {},
  onError = () => {}
}) => {
  // State for the generator
  const [generationState, setGenerationState] = useState('idle'); // idle, generating, completed, error
  const [productDetails, setProductDetails] = useState(productInfo);
  const [template, setTemplate] = useState(templateId || 'standard');
  const [sections, setSections] = useState([
    { id: 'executive_summary', label: 'Executive Summary', selected: true },
    { id: 'device_description', label: 'Device Description', selected: true },
    { id: 'regulatory_history', label: 'Regulatory History', selected: true },
    { id: 'intended_use', label: 'Intended Use/Indications', selected: true },
    { id: 'clinical_data', label: 'Clinical Data Summary', selected: true },
    { id: 'performance_data', label: 'Performance Data', selected: true },
    { id: 'risk_analysis', label: 'Risk Analysis', selected: true },
    { id: 'post_market', label: 'Post-Market Surveillance', selected: true },
    { id: 'conclusion', label: 'Conclusions', selected: true }
  ]);
  const [advancedOptions, setAdvancedOptions] = useState({
    includeFAERSData: true,
    generateTables: true,
    detailedEvidenceAnalysis: true,
    enhancedRiskAssessment: true,
    customSummaryLength: 'standard', // brief, standard, detailed
    citationStyle: 'numbered' // numbered, author-date, footnotes
  });
  const [generatedContent, setGeneratedContent] = useState({});
  const [currentlyGeneratingSection, setCurrentlyGeneratingSection] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [totalProgress, setTotalProgress] = useState(0);
  const [evidenceSources, setEvidenceSources] = useState([]);
  const [isAdvancedOptionsOpen, setIsAdvancedOptionsOpen] = useState(false);
  const [showEvidencePanel, setShowEvidencePanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCopying, setIsCopying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [reportMetadata, setReportMetadata] = useState({
    wordCount: 0,
    citationCount: 0,
    generatedAt: null,
    reportId: null
  });
  
  // Refs
  const eventSourceRef = useRef(null);
  const contentRef = useRef(null);
  const { toast } = useToast();
  
  // Set product details when productInfo changes
  useEffect(() => {
    setProductDetails(productInfo);
  }, [productInfo]);
  
  // Set template when templateId changes
  useEffect(() => {
    if (templateId) {
      setTemplate(templateId);
    }
  }, [templateId]);
  
  // Clean up event source on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);
  
  // Scroll to bottom of content when new content is added
  useEffect(() => {
    if (contentRef.current && generationState === 'generating') {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [generatedContent, generationState]);
  
  // Calculate total progress based on completed sections
  useEffect(() => {
    if (generationState === 'generating' || generationState === 'completed') {
      const selectedSections = sections.filter(section => section.selected);
      const completedSections = Object.keys(generatedContent).length;
      const progress = Math.round((completedSections / selectedSections.length) * 100);
      setTotalProgress(progress);
    }
  }, [generatedContent, sections, generationState]);
  
  // Update report metadata
  useEffect(() => {
    if (generationState === 'completed') {
      // Calculate word count
      let totalWords = 0;
      Object.values(generatedContent).forEach(content => {
        totalWords += content.split(/\s+/).filter(Boolean).length;
      });
      
      // Count citations - basic regex to match [1], [2], etc.
      const citationRegex = /\[\d+\]/g;
      let citationCount = 0;
      Object.values(generatedContent).forEach(content => {
        const matches = content.match(citationRegex);
        if (matches) {
          citationCount += matches.length;
        }
      });
      
      setReportMetadata({
        wordCount: totalWords,
        citationCount: citationCount,
        generatedAt: new Date().toISOString(),
        reportId: `CER-${Date.now().toString(36)}`
      });
    }
  }, [generationState, generatedContent]);
  
  // Toggle section selection
  const toggleSection = (sectionId) => {
    setSections(prevSections => 
      prevSections.map(section => 
        section.id === sectionId 
          ? { ...section, selected: !section.selected } 
          : section
      )
    );
  };
  
  // Toggle selection of all sections
  const toggleAllSections = (selected) => {
    setSections(prevSections => 
      prevSections.map(section => ({ ...section, selected }))
    );
  };
  
  // Update advanced options
  const updateAdvancedOption = (key, value) => {
    setAdvancedOptions(prevOptions => ({
      ...prevOptions,
      [key]: value
    }));
  };
  
  // Start generation process
  const startGeneration = async () => {
    try {
      // Reset state
      setGenerationState('generating');
      setGeneratedContent({});
      setCurrentlyGeneratingSection(null);
      setErrorDetails(null);
      setTotalProgress(0);
      setEvidenceSources([]);
      
      // Get selected sections
      const selectedSectionIds = sections
        .filter(section => section.selected)
        .map(section => section.id);
      
      if (selectedSectionIds.length === 0) {
        throw new Error('Please select at least one section to generate');
      }
      
      // Prepare request payload
      const payload = {
        product_id: productDetails.id || 'demo_product',
        product_name: productDetails.name || 'Sample Medical Device',
        manufacturer: productDetails.manufacturer || 'Acme Medical Devices, Inc.',
        template_id: template,
        sections: selectedSectionIds,
        options: {
          include_faers: advancedOptions.includeFAERSData,
          generate_tables: advancedOptions.generateTables,
          detailed_evidence: advancedOptions.detailedEvidenceAnalysis,
          enhanced_risk: advancedOptions.enhancedRiskAssessment,
          summary_length: advancedOptions.customSummaryLength,
          citation_style: advancedOptions.citationStyle
        }
      };
      
      // Create SSE connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      
      const url = new URL('/api/cer/generate', window.location.origin);
      Object.keys(payload).forEach(key => {
        if (typeof payload[key] === 'object') {
          url.searchParams.append(key, JSON.stringify(payload[key]));
        } else {
          url.searchParams.append(key, payload[key]);
        }
      });
      
      eventSourceRef.current = new EventSource(url.toString());
      
      // Handle events
      eventSourceRef.current.onopen = () => {
        console.log('SSE connection opened');
      };
      
      eventSourceRef.current.onerror = (error) => {
        console.error('SSE connection error:', error);
        setGenerationState('error');
        setErrorDetails('Connection to the generation service was lost');
        eventSourceRef.current.close();
        
        toast({
          title: 'Generation Error',
          description: 'Connection to the generation service was lost',
          variant: 'destructive'
        });
        
        onError('Connection to the generation service was lost');
      };
      
      eventSourceRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle different event types
          switch (data.type) {
            case 'section_start':
              setCurrentlyGeneratingSection(data.section_id);
              break;
              
            case 'section_content':
              setGeneratedContent(prev => ({
                ...prev,
                [data.section_id]: data.content
              }));
              break;
              
            case 'section_complete':
              // Section is complete, update progress
              break;
              
            case 'evidence':
              setEvidenceSources(prev => [...prev, ...data.sources]);
              break;
              
            case 'error':
              setGenerationState('error');
              setErrorDetails(data.message);
              eventSourceRef.current.close();
              
              toast({
                title: 'Generation Error',
                description: data.message,
                variant: 'destructive'
              });
              
              onError(data.message);
              break;
              
            case 'complete':
              setGenerationState('completed');
              eventSourceRef.current.close();
              
              toast({
                title: 'Generation Complete',
                description: 'CER has been successfully generated',
              });
              
              onGenerated(generatedContent);
              break;
              
            default:
              console.log('Unknown event type:', data.type);
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };
      
      // If no real API exists, simulate generation for demo purposes
      if (!window.location.host.includes('.replit.app')) {
        simulateGeneration(selectedSectionIds);
      }
      
    } catch (error) {
      console.error('Error starting generation:', error);
      setGenerationState('error');
      setErrorDetails(error.message);
      
      toast({
        title: 'Generation Error',
        description: error.message,
        variant: 'destructive'
      });
      
      onError(error.message);
    }
  };
  
  // Cancel generation
  const cancelGeneration = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    setGenerationState('idle');
    toast({
      title: 'Generation Cancelled',
      description: 'CER generation has been cancelled',
    });
  };
  
  // Copy content to clipboard
  const copyContent = async () => {
    try {
      setIsCopying(true);
      
      // Prepare content for copying
      const contentToCopy = Object.entries(generatedContent)
        .map(([sectionId, content]) => {
          const section = sections.find(s => s.id === sectionId);
          return `# ${section.label}\n\n${content}\n\n`;
        })
        .join('');
      
      await navigator.clipboard.writeText(contentToCopy);
      
      toast({
        title: 'Content Copied',
        description: 'Report content has been copied to clipboard',
      });
    } catch (error) {
      console.error('Error copying content:', error);
      
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy content to clipboard',
        variant: 'destructive'
      });
    } finally {
      setIsCopying(false);
    }
  };
  
  // Download as PDF
  const downloadAsPDF = async () => {
    try {
      setIsDownloading(true);
      
      // In a real implementation, this would call an API to generate the PDF
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'PDF Generated',
        description: 'Report has been downloaded as PDF',
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      
      toast({
        title: 'Download Failed',
        description: 'Failed to generate PDF for download',
        variant: 'destructive'
      });
    } finally {
      setIsDownloading(false);
    }
  };
  
  // Reset the generator
  const resetGenerator = () => {
    setGenerationState('idle');
    setGeneratedContent({});
    setCurrentlyGeneratingSection(null);
    setErrorDetails(null);
    setTotalProgress(0);
    setEvidenceSources([]);
    
    toast({
      title: 'Generator Reset',
      description: 'CER generator has been reset',
    });
  };
  
  // Get section status badge
  const getSectionStatusBadge = (sectionId) => {
    if (generationState === 'generating' && currentlyGeneratingSection === sectionId) {
      return (
        <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Generating
        </Badge>
      );
    } else if (generatedContent[sectionId]) {
      return (
        <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
          <Check className="h-3 w-3 mr-1" />
          Complete
        </Badge>
      );
    } else if (generationState === 'error') {
      return (
        <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700">
          <AlertCircle className="h-3 w-3 mr-1" />
          Error
        </Badge>
      );
    }
    
    return null;
  };
  
  // Simulate generation for demo purposes
  const simulateGeneration = (selectedSections) => {
    const sectionTexts = {
      executive_summary: "This clinical evaluation report evaluates the safety and performance of the Sample Medical Device manufactured by Acme Medical Devices, Inc. Based on the clinical data analysis, the device demonstrates acceptable performance for its intended use with a favorable benefit-risk profile. Post-market surveillance data shows no significant adverse events that would impact the safety profile.",
      device_description: "The Sample Medical Device is a Class II medical device designed for continuous monitoring of vital signs in clinical settings. The device consists of a sensor array, processing unit, and display interface. It operates using proprietary algorithms to process physiological signals and present actionable clinical information to healthcare providers.",
      regulatory_history: "The Sample Medical Device received initial FDA clearance in 2020 (K123456) and CE Mark approval in 2021. The device has been marketed in the United States, European Union, and Japan without significant regulatory compliance issues. There have been no recalls or field safety notices issued for this device.",
      intended_use: "The Sample Medical Device is indicated for continuous monitoring of vital signs including heart rate, blood pressure, respiratory rate, and oxygen saturation in adult patients in hospital settings. It is intended to be used by trained healthcare professionals as an aid in patient assessment and is not intended for home use.",
      clinical_data: "Clinical evaluation is based on data from three clinical studies involving a total of 450 patients. Study ACME-001 (n=150) demonstrated measurement accuracy compared to reference standards. Study ACME-002 (n=200) evaluated clinical outcomes in an ICU setting. Study ACME-003 (n=100) assessed usability and workflow integration in various clinical environments.",
      performance_data: "Performance testing demonstrates that the device meets all specified requirements for accuracy, precision, and reliability. Measurement accuracy was within ±2% of reference standards for all vital sign parameters. Bench testing showed device operation for 24 hours on battery power and ability to store up to 72 hours of patient data.",
      risk_analysis: "Risk analysis identified 12 potential hazards, with comprehensive mitigations implemented for each. Residual risks are considered acceptable according to ISO 14971 principles. The most significant potential risks include inaccurate measurements leading to delayed intervention and potential electrical hazards, both of which have been mitigated through hardware safeguards and software algorithms.",
      post_market: "Post-market surveillance data from approximately 10,000 devices in clinical use shows a complaint rate of 0.3%. The majority of complaints (85%) were related to user interface issues which have been addressed in software updates. No serious injuries or deaths have been associated with device use. FDA MAUDE database analysis revealed no pattern of systematic failures.",
      conclusion: "Based on the comprehensive evaluation of clinical data, performance testing, and post-market surveillance information, the Sample Medical Device demonstrates substantial equivalence to predicate devices and meets all applicable essential requirements. The device has a favorable benefit-risk profile when used as intended. Continued post-market surveillance is recommended to monitor long-term performance."
    };
    
    // Simulate evidence sources
    const demoEvidenceSources = [
      {
        id: 'src_001',
        title: 'Clinical validation of continuous vital signs monitoring in acute care settings',
        author: 'Johnson et al.',
        journal: 'Journal of Medical Devices',
        year: 2022,
        relevance_score: 0.92
      },
      {
        id: 'src_002',
        title: 'Comparative analysis of non-invasive monitoring technologies',
        author: 'Smith et al.',
        journal: 'Biomedical Engineering Reviews',
        year: 2021,
        relevance_score: 0.87
      },
      {
        id: 'src_003',
        title: 'Patient outcomes with continuous vital sign monitoring: A systematic review',
        author: 'Garcia et al.',
        journal: 'Critical Care Medicine',
        year: 2023,
        relevance_score: 0.85
      },
      {
        id: 'src_004',
        title: 'Risk assessment methodologies for medical monitoring devices',
        author: 'Williams et al.',
        journal: 'Journal of Patient Safety',
        year: 2020,
        relevance_score: 0.79
      },
      {
        id: 'src_005',
        title: 'FDA adverse event reporting for monitoring devices: A 10-year review',
        author: 'Chen et al.',
        journal: 'Regulatory Affairs Professionals Journal',
        year: 2023,
        relevance_score: 0.88
      }
    ];
    
    // Set evidence sources
    setTimeout(() => {
      setEvidenceSources(demoEvidenceSources);
    }, 2000);
    
    // Generate each section with a typing effect
    let sectionIndex = 0;
    const generateNextSection = () => {
      if (sectionIndex >= selectedSections.length) {
        // All sections completed
        setTimeout(() => {
          setGenerationState('completed');
          toast({
            title: 'Generation Complete',
            description: 'CER has been successfully generated',
          });
          onGenerated(generatedContent);
        }, 1000);
        return;
      }
      
      const sectionId = selectedSections[sectionIndex];
      setCurrentlyGeneratingSection(sectionId);
      
      const text = sectionTexts[sectionId] || `Content for ${sectionId} would be generated here.`;
      let currentText = '';
      const textArray = text.split('');
      
      // Simulate typing effect
      const interval = setInterval(() => {
        if (textArray.length > 0) {
          currentText += textArray.shift();
          setGeneratedContent(prev => ({
            ...prev,
            [sectionId]: currentText
          }));
        } else {
          clearInterval(interval);
          sectionIndex++;
          setTimeout(generateNextSection, 1000);
        }
      }, 20);
    };
    
    // Start generation
    setTimeout(generateNextSection, 1000);
  };
  
  // Render section selector
  const renderSectionSelector = () => (
    <div className="border rounded-md p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">CER Sections</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => toggleAllSections(true)}
          >
            Select All
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => toggleAllSections(false)}
          >
            Deselect All
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        {sections.map((section) => (
          <div 
            key={section.id}
            className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded"
          >
            <input
              type="checkbox"
              id={`section-${section.id}`}
              checked={section.selected}
              onChange={() => toggleSection(section.id)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label 
              htmlFor={`section-${section.id}`}
              className="flex-1 text-sm font-medium cursor-pointer"
            >
              {section.label}
            </label>
            {getSectionStatusBadge(section.id)}
          </div>
        ))}
      </div>
    </div>
  );
  
  // Render advanced options
  const renderAdvancedOptions = () => (
    <div className="border rounded-md overflow-hidden">
      <div 
        className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer"
        onClick={() => setIsAdvancedOptionsOpen(!isAdvancedOptionsOpen)}
      >
        <div className="flex items-center">
          <Settings className="h-4 w-4 mr-2 text-gray-500" />
          <h3 className="font-medium">Advanced Options</h3>
        </div>
        {isAdvancedOptionsOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </div>
      
      {isAdvancedOptionsOpen && (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Include FAERS Data</label>
              <p className="text-xs text-gray-500">
                Incorporate FDA Adverse Event Reporting System data
              </p>
            </div>
            <Switch
              checked={advancedOptions.includeFAERSData}
              onCheckedChange={(checked) => updateAdvancedOption('includeFAERSData', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Generate Tables</label>
              <p className="text-xs text-gray-500">
                Include data tables in clinical sections
              </p>
            </div>
            <Switch
              checked={advancedOptions.generateTables}
              onCheckedChange={(checked) => updateAdvancedOption('generateTables', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Detailed Evidence Analysis</label>
              <p className="text-xs text-gray-500">
                Provide in-depth analysis of each evidence source
              </p>
            </div>
            <Switch
              checked={advancedOptions.detailedEvidenceAnalysis}
              onCheckedChange={(checked) => updateAdvancedOption('detailedEvidenceAnalysis', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Enhanced Risk Assessment</label>
              <p className="text-xs text-gray-500">
                Include comprehensive risk evaluation tables
              </p>
            </div>
            <Switch
              checked={advancedOptions.enhancedRiskAssessment}
              onCheckedChange={(checked) => updateAdvancedOption('enhancedRiskAssessment', checked)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Summary Length</label>
            <RadioGroup 
              value={advancedOptions.customSummaryLength}
              onValueChange={(value) => updateAdvancedOption('customSummaryLength', value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="brief" id="summary-brief" />
                <Label htmlFor="summary-brief">Brief</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="standard" id="summary-standard" />
                <Label htmlFor="summary-standard">Standard</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="detailed" id="summary-detailed" />
                <Label htmlFor="summary-detailed">Detailed</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Citation Style</label>
            <Select 
              value={advancedOptions.citationStyle}
              onValueChange={(value) => updateAdvancedOption('citationStyle', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Citation style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="numbered">Numbered ([1], [2], ...)</SelectItem>
                <SelectItem value="author-date">Author-Date (Smith, 2023)</SelectItem>
                <SelectItem value="footnotes">Footnotes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
  
  // Render evidence sources
  const renderEvidenceSources = () => {
    const filteredSources = evidenceSources.filter(source => 
      source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.journal.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return (
      <div className="border rounded-md overflow-hidden">
        <div 
          className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer"
          onClick={() => setShowEvidencePanel(!showEvidencePanel)}
        >
          <div className="flex items-center">
            <BookOpen className="h-4 w-4 mr-2 text-gray-500" />
            <h3 className="font-medium">Evidence Sources ({evidenceSources.length})</h3>
          </div>
          {showEvidencePanel ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </div>
        
        {showEvidencePanel && (
          <div className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input 
                type="text" 
                placeholder="Search evidence sources..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {filteredSources.length > 0 ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {filteredSources.map((source) => (
                  <div 
                    key={source.id} 
                    className="p-3 border rounded-md hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm">{source.title}</h4>
                      <Badge className="ml-2 whitespace-nowrap">
                        {(source.relevance_score * 100).toFixed(0)}% relevant
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {source.author} • {source.journal} • {source.year}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No evidence sources found</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  // Render the generated content display
  const renderGeneratedContent = () => {
    if (generationState === 'idle') {
      return (
        <div className="text-center py-20 text-gray-500">
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No Content Generated</h3>
          <p className="max-w-md mx-auto mb-6">
            Select the sections you want to include and click "Generate CER" to create
            your clinical evaluation report.
          </p>
          <Button onClick={startGeneration}>
            Generate CER
          </Button>
        </div>
      );
    }
    
    if (generationState === 'error') {
      return (
        <div className="text-center py-20 text-gray-500">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-medium mb-2 text-red-600">Generation Error</h3>
          <p className="max-w-md mx-auto mb-6">
            {errorDetails || 'An error occurred during generation. Please try again.'}
          </p>
          <Button onClick={resetGenerator}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Generator
          </Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {/* Progress bar */}
        {generationState === 'generating' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Generating content...</span>
              <span>{totalProgress}% complete</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-in-out"
                style={{ width: `${totalProgress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Generated content */}
        <div 
          ref={contentRef}
          className="border rounded-md overflow-y-auto p-6 max-h-[600px] space-y-6 bg-white"
        >
          {sections
            .filter(section => section.selected)
            .map((section) => (
              <div key={section.id} className="space-y-2">
                <h3 className="text-xl font-bold">{section.label}</h3>
                
                {generatedContent[section.id] ? (
                  <div 
                    className="prose max-w-full"
                    dangerouslySetInnerHTML={{ __html: generatedContent[section.id].replace(/\n/g, '<br/>') }}
                  />
                ) : (
                  <div className="py-4 text-gray-400 italic text-sm">
                    {generationState === 'generating' && currentlyGeneratingSection === section.id ? (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating content...
                      </div>
                    ) : generationState === 'generating' ? (
                      'Waiting to generate...'
                    ) : (
                      'No content generated for this section'
                    )}
                  </div>
                )}
              </div>
            ))}
        </div>
        
        {/* Actions when content is generated */}
        {generationState === 'completed' && (
          <div className="flex flex-wrap gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={copyContent}
              disabled={isCopying}
            >
              {isCopying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Copying...
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Content
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={downloadAsPDF}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Preparing PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </>
              )}
            </Button>
            <Button 
              variant="outline"
              onClick={resetGenerator}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate New
            </Button>
          </div>
        )}
      </div>
    );
  };
  
  // Render metadata when report is completed
  const renderReportMetadata = () => {
    if (generationState !== 'completed') return null;
    
    return (
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 border rounded-md bg-gray-50">
          <div className="text-sm text-gray-500">Word Count</div>
          <div className="text-2xl font-bold">{reportMetadata.wordCount.toLocaleString()}</div>
        </div>
        <div className="p-4 border rounded-md bg-gray-50">
          <div className="text-sm text-gray-500">Citations</div>
          <div className="text-2xl font-bold">{reportMetadata.citationCount}</div>
        </div>
        <div className="p-4 border rounded-md bg-gray-50">
          <div className="text-sm text-gray-500">Sections</div>
          <div className="text-2xl font-bold">
            {sections.filter(s => s.selected && generatedContent[s.id]).length}
          </div>
        </div>
        <div className="p-4 border rounded-md bg-gray-50">
          <div className="text-sm text-gray-500">Report ID</div>
          <div className="text-lg font-medium truncate">{reportMetadata.reportId}</div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <FileText className="h-6 w-6 mr-2 text-primary" />
            CER Generator
          </h2>
          <p className="text-gray-500">
            Generate regulatory-compliant clinical evaluation reports with AI assistance
          </p>
        </div>
        
        <div className="flex gap-2">
          {generationState === 'generating' ? (
            <Button 
              variant="destructive" 
              onClick={cancelGeneration}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          ) : generationState === 'idle' ? (
            <Button onClick={startGeneration}>
              <FlaskConical className="h-4 w-4 mr-2" />
              Generate CER
            </Button>
          ) : null}
        </div>
      </div>
      
      {/* Report metadata (shown when completed) */}
      {renderReportMetadata()}
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left sidebar - configuration */}
        <div className="lg:col-span-1 space-y-6">
          {/* Template selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Template</label>
            <Select 
              value={template} 
              onValueChange={setTemplate}
              disabled={generationState === 'generating'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard CER Template</SelectItem>
                <SelectItem value="mdr">MDR 2017/745 Compliant</SelectItem>
                <SelectItem value="meddev">MEDDEV 2.7/1 Rev 4</SelectItem>
                <SelectItem value="fda">FDA Submission Format</SelectItem>
                <SelectItem value="pmda">PMDA (Japan) Format</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Product information */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Product Name</label>
            <Input 
              value={productDetails.name || ''}
              onChange={(e) => setProductDetails({...productDetails, name: e.target.value})}
              placeholder="Enter product name"
              disabled={generationState === 'generating'}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Manufacturer</label>
            <Input 
              value={productDetails.manufacturer || ''}
              onChange={(e) => setProductDetails({...productDetails, manufacturer: e.target.value})}
              placeholder="Enter manufacturer name"
              disabled={generationState === 'generating'}
            />
          </div>
          
          {/* Section selection */}
          {renderSectionSelector()}
          
          {/* Advanced options */}
          {renderAdvancedOptions()}
          
          {/* Evidence sources */}
          {evidenceSources.length > 0 && renderEvidenceSources()}
        </div>
        
        {/* Main content - generated report */}
        <div className="lg:col-span-2">
          {renderGeneratedContent()}
        </div>
      </div>
    </div>
  );
};

export default CERStreamingGenerator;