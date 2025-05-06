import React, { useState, useEffect } from 'react';
import { cerApiService } from '@/services/CerAPIService';
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
import { Loader2, FileText, BookOpen, FileDown, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
  
  // Sync local state with props
  useEffect(() => {
    setCerSections(sections || []);
  }, [sections]);
  
  useEffect(() => {
    setCerTitle(title || 'Clinical Evaluation Report');
  }, [title]);
  
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
        productName: cerTitle,
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
    
    const updatedSections = [...cerSections, newSection];
    setCerSections(updatedSections);
    onSectionsChange(updatedSections);
    
    toast({
      title: 'Section added',
      description: `${newSection.title} added to report.`,
    });
    
    // Clear generated section
    setGeneratedSection(null);
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
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel className="text-xs font-semibold text-[#616161]">CER Sections</SelectLabel>
                        {sectionTypes.map(section => (
                          <SelectItem key={section.id} value={section.id} className="text-sm">
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
                
                <div className="flex justify-end">
                  <Button 
                    onClick={generateSection} 
                    disabled={isGenerating || !sectionContext}
                    className="bg-[#0F6CBD] hover:bg-[#115EA3] text-white"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Generating...</span>
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
                  <h3 className="text-base font-semibold text-[#323130]">{getSelectedSectionLabel()}</h3>
                  <p className="text-xs text-[#616161] mt-1">
                    AI-generated content based on your inputs
                  </p>
                </div>
                <div className="p-4">
                  <div className="text-sm text-[#323130] leading-relaxed">
                    {generatedSection.content.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-3 last:mb-0">{paragraph}</p>
                    ))}
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
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-[#323130]">{section.title}</h4>
                          <p className="text-xs text-[#616161] mt-1 line-clamp-2">
                            {section.content.substring(0, 100)}...
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeSection(section.id)}
                          className="h-8 w-8 p-0 text-[#616161] hover:text-[#D83B01] hover:bg-[#FFF4CE]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* FAERS Data Panel */}
      {faers && faers.length > 0 && (
        <div className="bg-white p-4 border border-[#E1DFDD] rounded mt-4">
          <div className="flex items-center justify-between border-b border-[#E1DFDD] pb-3 mb-3">
            <h3 className="text-base font-semibold text-[#323130]">FDA FAERS Data Integration</h3>
            <Badge variant="outline" className="bg-[#E5F2FF] text-[#0F6CBD] text-xs border-[#0F6CBD] px-2 py-0.5">
              Auto-included
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-3">
              <p className="text-sm text-[#616161]">
                FAERS data for your product has been automatically integrated into the report. This data will appear in the Safety Analysis section of your final document.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}