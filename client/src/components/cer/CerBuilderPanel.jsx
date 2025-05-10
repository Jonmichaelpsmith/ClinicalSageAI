import React, { useState, useEffect } from 'react';
import { cerApiService } from '@/services/CerAPIService';
import { checkSectionCtqFactors } from '@/services/CerQualityGatingService';
import LiteratureSearchPanel from './LiteratureSearchPanel';
import ComplianceScorePanel from './ComplianceScorePanel';
import EvidenceGapDetector from './EvidenceGapDetector';
import CerTooltipWrapper from './CerTooltipWrapper';
import CerOnboardingGuide from './CerOnboardingGuide';
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
import { Loader2, FileText, BookOpen, FileDown, Plus, Trash2, Lightbulb, Search, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useExportFAERS } from '../../hooks/useExportFAERS';
import CerPreviewPanel from './CerPreviewPanel';

export default function CerBuilderPanel({ title, faers, comparators, sections, onTitleChange, onSectionsChange, onFaersChange, onComparatorsChange }) {
  const { toast } = useToast();
  const { exportToPDF, exportToWord } = useExportFAERS();
  
  const [selectedSectionType, setSelectedSectionType] = useState('benefit-risk');
  const [sectionContext, setSectionContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSection, setGeneratedSection] = useState(null);
  const [cerSections, setCerSections] = useState(sections || []);
  const [cerTitle, setCerTitle] = useState(title || 'Clinical Evaluation Report'); 
  
  // Quality Gating State
  const [isCheckingQuality, setIsCheckingQuality] = useState(false);
  const [qualityStatus, setQualityStatus] = useState(null);
  const [isQualityOverridden, setIsQualityOverridden] = useState(false);
  
  // Sync local state with props
  useEffect(() => {
    setCerSections(sections || []);
  }, [sections]);
  
  useEffect(() => {
    setCerTitle(title || 'Clinical Evaluation Report');
  }, [title]);
  
  // Reset quality state when section type changes
  useEffect(() => {
    setQualityStatus(null);
    setIsQualityOverridden(false);
  }, [selectedSectionType]);
  
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
  
  // Generate section using AI with CtQ factor gating
  const generateSection = async () => {
    if (!sectionContext) {
      toast({
        title: 'Missing information',
        description: 'Please provide context for the section generation.',
        variant: 'destructive',
      });
      return;
    }
    
    // First check if quality requirements are satisfied
    setIsCheckingQuality(true);
    
    try {
      // Check CtQ factors for this section type
      const qualityCheck = await checkSectionCtqFactors(selectedSectionType);
      setQualityStatus(qualityCheck);
      
      // If cannot proceed due to high-risk factors, show error and abort
      if (!qualityCheck.canProceed && !isQualityOverridden) {
        toast({
          title: 'Quality Requirements Not Met',
          description: 'Critical quality factors must be satisfied before generating this section',
          variant: 'destructive',
        });
        setIsCheckingQuality(false);
        return;
      }
      
      // Proceed with section generation
      setIsGenerating(true);
      
      // If medium-risk factors are not satisfied but user is proceeding, log warning
      if (qualityCheck.mediumRiskBlockers > 0) {
        console.warn('Proceeding with section generation despite medium-risk quality factors not being satisfied');
      }
      
      const response = await fetch('/api/cer/generate-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section: selectedSectionType,
          productName: cerTitle,
          context: sectionContext,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error generating section: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // If response includes a section property, use that
      if (data.section) {
        setGeneratedSection(data.section);
      } else {
        setGeneratedSection(data);
      }
      
      toast({
        title: 'Section generated',
        description: `${getSelectedSectionLabel()} section successfully generated.`,
      });
    } catch (error) {
      console.error('Error in section generation process:', error);
      toast({
        title: 'Generation failed',
        description: error.message || 'Failed to generate section. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setIsCheckingQuality(false);
    }
  };
  
  // Add the generated section to the report
  const addToReport = () => {
    if (!generatedSection) return;
    
    // Check if we need to handle additional metadata from AI generation
    const content = generatedSection.content;
    const model = generatedSection.model || 'gpt-4o';
    
    // Determine quality status indicators for metadata
    const qualityMetadata = qualityStatus ? {
      qualityRequirementsMet: qualityStatus.canProceed || isQualityOverridden,
      qualityOverridden: isQualityOverridden,
      highRiskFactors: qualityStatus.highRiskBlockers > 0,
      mediumRiskFactors: qualityStatus.mediumRiskBlockers > 0,
      lowRiskFactors: qualityStatus.lowRiskBlockers > 0,
      ctqFactors: qualityStatus.ctqFactors ? qualityStatus.ctqFactors.map(factor => ({
        id: factor.id,
        name: factor.name,
        riskLevel: factor.riskLevel,
        status: factor.status
      })) : []
    } : {
      qualityRequirementsMet: true, // Assume requirements met if no check performed
      qualityOverridden: false,
      highRiskFactors: false,
      mediumRiskFactors: false,
      lowRiskFactors: false,
      ctqFactors: []
    };
    
    const newSection = {
      id: `section-${Date.now()}`,
      type: selectedSectionType,
      title: getSelectedSectionLabel(),
      content: content,
      markdown: true, // Flag to indicate markdown formatting
      dateAdded: new Date().toISOString(),
      metadata: {
        generatedBy: model,
        contextLength: sectionContext.length,
        regulatoryStandard: 'EU MDR 2017/745',
        complianceChecked: false,
        ...qualityMetadata // Include quality metadata
      }
    };
    
    // Add to beginning if it's a device description or clinical background
    // otherwise add to the end
    let updatedSections;
    if (['device-description', 'clinical-background'].includes(selectedSectionType) && cerSections.length > 0) {
      updatedSections = [newSection, ...cerSections];
    } else {
      updatedSections = [...cerSections, newSection];
    }
    
    setCerSections(updatedSections);
    onSectionsChange(updatedSections);
    
    // Show toast with quality status if applicable
    let toastVariant = 'default';
    let toastDescription = `${newSection.title} added to report${model ? ` (generated with ${model})` : ''}.`;
    
    if (qualityStatus) {
      if (isQualityOverridden) {
        toastVariant = 'warning';
        toastDescription += ' Quality requirements overridden - this may affect regulatory compliance.';
      } else if (qualityStatus.mediumRiskBlockers > 0) {
        toastVariant = 'warning';
        toastDescription += ' Some medium-risk quality factors are pending.';
      } else if (qualityStatus.highRiskBlockers === 0) {
        toastVariant = 'success';
        toastDescription += ' All quality requirements satisfied.';
      }
    }
    
    toast({
      title: 'Section added',
      description: toastDescription,
      variant: toastVariant
    });
    
    // Clear generated section, context, and quality status for a fresh start
    setGeneratedSection(null);
    setSectionContext('');
    setQualityStatus(null);
    setIsQualityOverridden(false);
  };
  
  // Get the human-readable label for the selected section type
  const getSelectedSectionLabel = () => {
    const section = sectionTypes.find(s => s.id === selectedSectionType);
    return section ? section.label : selectedSectionType;
  };
  
  // Handle title change
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setCerTitle(newTitle);
    onTitleChange(newTitle);
  };
  
  // Remove a section from the report
  const removeSection = (sectionId) => {
    const updatedSections = cerSections.filter(section => section.id !== sectionId);
    setCerSections(updatedSections);
    onSectionsChange(updatedSections);
    
    toast({
      title: 'Section removed',
      description: 'The section has been removed from your report.',
    });
  };
  
  return (
    <div className="space-y-4">
      {/* Section Generator Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left column - Section Generator */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-4 border border-[#E1DFDD] rounded">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E1DFDD] pb-3 mb-3">
                <h3 className="text-base font-semibold text-[#323130]">Section Generator</h3>
                <Badge variant="outline" className="bg-[#E5F2FF] text-[#0F6CBD] text-xs border-[#0F6CBD] px-2 py-0.5">
                  AI-Powered
                </Badge>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sectionType" className="text-sm font-medium text-[#323130]">Section Type</Label>
                  <Select 
                    value={selectedSectionType} 
                    onValueChange={setSelectedSectionType}
                  >
                    <SelectTrigger id="sectionType" className="h-9 border-[#E1DFDD] bg-white">
                      <SelectValue placeholder="Select section type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-[#E1DFDD] shadow-lg max-h-80 overflow-y-auto z-50 mt-6">
                      <SelectGroup>
                        <SelectLabel className="text-xs font-semibold text-[#616161]">CER Sections</SelectLabel>
                        {sectionTypes.map(section => (
                          <SelectItem 
                            key={section.id} 
                            value={section.id} 
                            className="text-sm hover:bg-[#F3F2F1] hover:text-[#323130] cursor-pointer"
                          >
                            {section.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="context" className="text-sm font-medium text-[#323130]">Context Information</Label>
                  <Textarea 
                    id="context" 
                    placeholder="Enter information to help generate this section..." 
                    value={sectionContext}
                    onChange={(e) => setSectionContext(e.target.value)}
                    rows={5}
                    className="border-[#E1DFDD] focus:border-[#0F6CBD] focus:ring-1 focus:ring-[#0F6CBD] resize-none"
                  />
                  <p className="text-xs text-[#616161]">
                    Include specifics about your device or product for best results.
                  </p>
                </div>
                
                {/* Quality Status Display */}
                {qualityStatus && (
                  <Alert 
                    className={cn(
                      "border py-3",
                      qualityStatus.severity === 'error' ? "border-red-500 bg-red-50 text-red-800" : 
                      qualityStatus.severity === 'warning' ? "border-amber-500 bg-amber-50 text-amber-800" : 
                      "border-blue-500 bg-blue-50 text-blue-800"
                    )}
                  >
                    {qualityStatus.severity === 'error' && <ShieldAlert className="h-4 w-4 mr-2" />}
                    {qualityStatus.severity === 'warning' && <AlertTriangle className="h-4 w-4 mr-2" />}
                    {qualityStatus.severity === 'info' && <CheckCircle2 className="h-4 w-4 mr-2" />}
                    <AlertTitle className="text-sm font-semibold">
                      {qualityStatus.severity === 'error' ? 'Quality Requirements Not Met' : 
                       qualityStatus.severity === 'warning' ? 'Quality Warning' : 
                       'Quality Check Passed'}
                    </AlertTitle>
                    <AlertDescription className="text-xs mt-1">
                      {qualityStatus.message}
                      
                      {/* Show override option for high-risk blockers */}
                      {qualityStatus.highRiskBlockers > 0 && (
                        <div className="mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsQualityOverridden(true)}
                            className="text-xs bg-white hover:bg-red-50 border-red-300 text-red-700"
                          >
                            Override Quality Gate (Not Recommended)
                          </Button>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Check Quality button or Generate Section button */}
                <div className="flex justify-end space-x-2">
                  {sectionContext && !qualityStatus && (
                    <Button 
                      onClick={async () => {
                        setIsCheckingQuality(true);
                        try {
                          const check = await checkSectionCtqFactors(selectedSectionType);
                          setQualityStatus(check);
                        } catch (error) {
                          console.error('Error checking quality requirements:', error);
                          toast({
                            title: 'Quality Check Failed',
                            description: 'Unable to verify quality requirements. Proceed with caution.',
                            variant: 'destructive',
                          });
                        } finally {
                          setIsCheckingQuality(false);
                        }
                      }}
                      disabled={isCheckingQuality}
                      variant="outline"
                      className="border-[#0F6CBD] text-[#0F6CBD]"
                    >
                      {isCheckingQuality ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span>Checking...</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="mr-2 h-4 w-4" />
                          <span>Check Quality Requirements</span>
                        </>
                      )}
                    </Button>
                  )}
                  
                  <Button 
                    onClick={generateSection} 
                    disabled={isGenerating || !sectionContext || 
                             (isCheckingQuality || 
                              (qualityStatus && !qualityStatus.canProceed && !isQualityOverridden))}
                    className={cn(
                      "text-white",
                      isQualityOverridden ? "bg-red-600 hover:bg-red-700" : "bg-[#0F6CBD] hover:bg-[#115EA3]"
                    )}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : isQualityOverridden ? (
                      <>
                        <ShieldAlert className="mr-2 h-4 w-4" />
                        <span>Generate With Override</span>
                      </>
                    ) : (
                      <>
                        <span>Generate Section</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Generated Section Display */}
            {generatedSection && (
              <div className="bg-white border border-[#E1DFDD] rounded mt-4">
                <div className="p-4 border-b border-[#E1DFDD] bg-[#FAF9F8]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-[#323130]">{getSelectedSectionLabel()}</h3>
                      <p className="text-xs text-[#616161] mt-1">
                        AI-generated content based on your inputs
                      </p>
                    </div>
                    {generatedSection.model && (
                      <Badge variant="outline" className="bg-[#E5F2FF] text-[#0F6CBD] text-xs border-[#0F6CBD] px-2 py-0.5">
                        Model: {generatedSection.model}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-sm text-[#323130] leading-relaxed markdown-content">
                    {generatedSection.content.split('\n').map((paragraph, index) => {
                      // Handle Markdown heading formats
                      if (paragraph.startsWith('# ')) {
                        return <h1 key={index} className="text-xl font-bold mb-3">{paragraph.replace('# ', '')}</h1>;
                      } else if (paragraph.startsWith('## ')) {
                        return <h2 key={index} className="text-lg font-semibold mb-3">{paragraph.replace('## ', '')}</h2>;
                      } else if (paragraph.startsWith('### ')) {
                        return <h3 key={index} className="text-base font-semibold mb-3">{paragraph.replace('### ', '')}</h3>;
                      } else if (paragraph.startsWith('- ')) {
                        // Handle bullet points
                        return <li key={index} className="ml-4 mb-2">{paragraph.replace('- ', '')}</li>;
                      } else if (paragraph.trim() === '') {
                        // Handle empty lines
                        return <div key={index} className="h-2"></div>;
                      } else {
                        // Handle regular paragraphs
                        return <p key={index} className="mb-3 last:mb-0">{paragraph}</p>;
                      }
                    })}
                  </div>
                </div>
                <div className="p-3 flex justify-end border-t border-[#E1DFDD] bg-[#FAF9F8]">
                  <Button 
                    onClick={addToReport}
                    className="bg-[#0F6CBD] hover:bg-[#115EA3] text-white"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    <span>Add to Report</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Right column - Report Sections */}
        <div className="space-y-4">
          <div className="bg-white p-4 border border-[#E1DFDD] rounded">
            <div className="flex items-center justify-between border-b border-[#E1DFDD] pb-3 mb-3">
              <h3 className="text-base font-semibold text-[#323130]">Report Sections</h3>
              <Badge variant="outline" className="text-xs bg-[#F5F5F5] text-[#616161] border-[#E1DFDD] px-2 py-0.5">
                {cerSections.length} section{cerSections.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="space-y-2">
                <Label htmlFor="report-title" className="text-sm font-medium text-[#323130]">Report Title</Label>
                <Input
                  id="report-title"
                  value={cerTitle}
                  onChange={handleTitleChange}
                  className="h-9 border-[#E1DFDD] focus:border-[#0F6CBD] focus:ring-1 focus:ring-[#0F6CBD]"
                />
              </div>
              
              {cerSections.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 bg-[#FAF9F8] rounded border border-[#E1DFDD] text-center">
                  <FileText className="h-8 w-8 text-[#A19F9D] mb-2" />
                  <p className="text-sm text-[#323130] font-medium">No sections yet</p>
                  <p className="text-xs text-[#616161] mt-1">Generate and add sections to build your report</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {cerSections.map((section) => (
                    <div 
                      key={section.id} 
                      className="p-3 border border-[#E1DFDD] rounded mb-2 bg-white hover:bg-[#F3F2F1]"
                    >
                      {/* Add Evidence Gap Detector before the section content */}
                      <EvidenceGapDetector 
                        section={section}
                        onCitationNeeded={(gap) => {
                          toast({
                            title: 'Citation needed',
                            description: `Add support for claim: "${gap.claim}"`,
                            variant: 'warning',
                          });
                        }}
                      />
                    
                      <div className="flex justify-between items-start">
                        <CerTooltipWrapper 
                          tooltipContent={
                            <div>
                              <p className="font-semibold mb-1">{section.title}</p>
                              <p className="text-xs opacity-80">Added: {new Date(section.dateAdded).toLocaleString()}</p>
                              {section.metadata?.generatedBy && (
                                <p className="text-xs opacity-80 mt-1">Generated by: {section.metadata.generatedBy}</p>
                              )}
                              
                              {/* Display quality metadata */}
                              {section.metadata?.qualityOverridden && (
                                <p className="text-xs text-amber-600 mt-1 font-semibold">
                                  ⚠️ Quality requirements were overridden
                                </p>
                              )}
                              {section.metadata?.highRiskFactors && !section.metadata?.qualityOverridden && (
                                <p className="text-xs text-red-600 mt-1">
                                  High-risk quality factors not satisfied
                                </p>
                              )}
                              {section.metadata?.mediumRiskFactors && !section.metadata?.highRiskFactors && (
                                <p className="text-xs text-amber-600 mt-1">
                                  Medium-risk quality factors not satisfied
                                </p>
                              )}
                            </div>
                          }
                        >
                          <div>
                            <div className="flex items-center space-x-1">
                              <span className="text-sm font-medium text-[#323130]">{section.title}</span>
                              
                              {/* Quality indicators */}
                              {section.metadata?.qualityOverridden && (
                                <Badge variant="outline" className="ml-1 bg-amber-50 text-amber-700 text-xs border-amber-300 px-1.5 py-0">
                                  Override
                                </Badge>
                              )}
                              {section.metadata?.highRiskFactors && !section.metadata?.qualityOverridden && (
                                <Badge variant="outline" className="ml-1 bg-red-50 text-red-700 text-xs border-red-300 px-1.5 py-0">
                                  High Risk
                                </Badge>
                              )}
                              {section.metadata?.mediumRiskFactors && !section.metadata?.highRiskFactors && (
                                <Badge variant="outline" className="ml-1 bg-amber-50 text-amber-700 text-xs border-amber-300 px-1.5 py-0">
                                  Warning
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-[#616161] mt-0.5 line-clamp-2">
                              {section.content.substring(0, 120)}...
                            </p>
                          </div>
                        </CerTooltipWrapper>
                    
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-[#616161] hover:text-red-600 hover:bg-red-50"
                          onClick={() => removeSection(section.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Export button */}
            {cerSections.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#E1DFDD]">
                <Button
                  variant="outline"
                  className="w-full text-[#0F6CBD] border-[#0F6CBD]"
                  onClick={() => exportToPDF({ title: cerTitle, sections: cerSections })}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  <span>Export Report</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}