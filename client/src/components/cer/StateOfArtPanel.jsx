import React, { useState, useEffect } from 'react';
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
import { 
  Loader2, 
  FileText, 
  BookOpen, 
  FileDown, 
  Plus, 
  BookMarked, 
  Stethoscope, 
  Microscope, 
  Table,
  Award,
  FileQuestion,
  Landmark,
  List,
  Mail,
  Info
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

/**
 * State of the Art (SOTA) Analysis Panel
 * 
 * This component provides a structured interface for creating a comprehensive 
 * State of the Art section for Clinical Evaluation Reports, which is a critical
 * requirement under EU MDR and MEDDEV 2.7/1 Rev 4.
 * 
 * The SOTA section:
 * - Describes the current medical condition/disease
 * - Reviews alternative treatment options and standards of care
 * - Benchmarks the device against established clinical performance levels
 * - Discusses relevant clinical guidelines and standards for the device type
 */
export default function StateOfArtPanel({ onSectionGenerated }) {
  const { toast } = useToast();
  
  // State variables for different aspects of SOTA
  const [medicalCondition, setMedicalCondition] = useState('');
  const [conditionEpidemiology, setConditionEpidemiology] = useState('');
  const [currentTreatments, setCurrentTreatments] = useState('');
  const [clinicalGuidelines, setClinicalGuidelines] = useState('');
  const [relevantStandards, setRelevantStandards] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [indications, setIndications] = useState('');
  const [expectedOutcomes, setExpectedOutcomes] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSection, setGeneratedSection] = useState(null);
  
  // Handler for generating the SOTA section
  const generateSOTA = async () => {
    if (!medicalCondition || !deviceType) {
      toast({
        title: 'Missing information',
        description: 'Please provide at least the medical condition and device type.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/cer/generate-sota', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          medicalCondition,
          conditionEpidemiology,
          currentTreatments,
          clinicalGuidelines,
          relevantStandards,
          deviceType,
          indications,
          expectedOutcomes,
          additionalContext
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error generating SOTA section: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setGeneratedSection(data);
      
      toast({
        title: 'SOTA section generated',
        description: 'State of the Art section successfully generated.',
      });
      
      // Pass the generated section up to the parent component if needed
      if (onSectionGenerated) {
        onSectionGenerated({
          type: 'state-of-art',
          title: 'State of the Art Analysis',
          content: data.content || data,
          model: data.model || 'gpt-4o',
          metadata: {
            medicalCondition,
            deviceType,
            currentTreatments: currentTreatments || 'Not specified',
            standards: relevantStandards || 'Not specified'
          }
        });
      }
    } catch (error) {
      console.error('Error generating SOTA section:', error);
      toast({
        title: 'Generation failed',
        description: error.message || 'Failed to generate SOTA section. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Card className="w-full border border-[#E1DFDD]">
      <CardHeader className="bg-gray-50 border-b border-[#E1DFDD]">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[#323130] flex items-center">
              <BookMarked className="mr-2 h-5 w-5 text-[#0F6CBD]" />
              State of the Art Analysis
            </CardTitle>
            <CardDescription className="text-[#605E5C]">
              Create a comprehensive analysis of current standards of care and treatment benchmarks
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-[#EFF6FC] text-[#0F6CBD] border-[#0F6CBD]">
            MEDDEV 2.7/1 Rev 4 Compliant
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="bg-[#F3F2F1] p-3 rounded-md border border-[#E1DFDD] mb-4">
            <div className="flex items-start">
              <Info className="h-5 w-5 mr-2 text-[#0F6CBD] mt-0.5" />
              <div className="text-sm text-[#323130]">
                <p className="font-medium">Regulatory Guidance</p>
                <p className="text-[#605E5C]">
                  MEDDEV 2.7/1 Rev 4 requires CERs to include an analysis of the state of the art, including current treatment options and standards.
                  This information establishes the clinical context and benchmarks for evaluating your device's safety and performance.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="medical-condition" className="text-[#323130]">
                Medical Condition/Disease <span className="text-red-500">*</span>
              </Label>
              <Input
                id="medical-condition"
                value={medicalCondition}
                onChange={(e) => setMedicalCondition(e.target.value)}
                placeholder="e.g., Osteoarthritis of the knee"
                className="mt-1.5"
              />
            </div>
            
            <div>
              <Label htmlFor="device-type" className="text-[#323130]">
                Device Type <span className="text-red-500">*</span>
              </Label>
              <Input
                id="device-type"
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value)}
                placeholder="e.g., Total knee replacement implant"
                className="mt-1.5"
              />
            </div>
          </div>
          
          <Accordion type="single" collapsible className="border rounded-md">
            <AccordionItem value="epidemiology">
              <AccordionTrigger className="px-4 py-2 hover:no-underline hover:bg-gray-50">
                <div className="flex items-center">
                  <Stethoscope className="mr-2 h-4 w-4 text-[#0F6CBD]" />
                  <span>Condition Epidemiology & Burden</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-2 pb-4">
                <Textarea
                  value={conditionEpidemiology}
                  onChange={(e) => setConditionEpidemiology(e.target.value)}
                  placeholder="Describe the prevalence, incidence, demographics, and disease burden of the condition. This helps establish the clinical context."
                  className="min-h-[100px]"
                />
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="treatments">
              <AccordionTrigger className="px-4 py-2 hover:no-underline hover:bg-gray-50">
                <div className="flex items-center">
                  <Microscope className="mr-2 h-4 w-4 text-[#0F6CBD]" />
                  <span>Current Treatment Options</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-2 pb-4">
                <Textarea
                  value={currentTreatments}
                  onChange={(e) => setCurrentTreatments(e.target.value)}
                  placeholder="Describe standard treatments and alternative therapies currently used, including conservative options, pharmaceuticals, and other devices."
                  className="min-h-[100px]"
                />
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="guidelines">
              <AccordionTrigger className="px-4 py-2 hover:no-underline hover:bg-gray-50">
                <div className="flex items-center">
                  <FileQuestion className="mr-2 h-4 w-4 text-[#0F6CBD]" />
                  <span>Clinical Guidelines & Standards</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-2 pb-4">
                <Textarea
                  value={clinicalGuidelines}
                  onChange={(e) => setClinicalGuidelines(e.target.value)}
                  placeholder="Reference relevant clinical practice guidelines from professional societies or health authorities (e.g., AAOS, ESC, AHA)."
                  className="min-h-[100px] mb-3"
                />
                <Label htmlFor="relevant-standards" className="text-[#323130] text-sm">
                  Technical or Harmonized Standards (if applicable)
                </Label>
                <Input
                  id="relevant-standards"
                  value={relevantStandards}
                  onChange={(e) => setRelevantStandards(e.target.value)}
                  placeholder="e.g., ISO 14971, ISO 10993, ASTM F1537"
                  className="mt-1.5"
                />
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="indications">
              <AccordionTrigger className="px-4 py-2 hover:no-underline hover:bg-gray-50">
                <div className="flex items-center">
                  <Award className="mr-2 h-4 w-4 text-[#0F6CBD]" />
                  <span>Device Indications & Outcomes</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-2 pb-4">
                <Label htmlFor="indications" className="text-[#323130] text-sm">
                  Indications for Use
                </Label>
                <Textarea
                  id="indications"
                  value={indications}
                  onChange={(e) => setIndications(e.target.value)}
                  placeholder="Describe specific indications, patient populations, and use cases for the device."
                  className="min-h-[80px] mb-3 mt-1.5"
                />
                
                <Label htmlFor="expected-outcomes" className="text-[#323130] text-sm">
                  Expected Clinical Outcomes
                </Label>
                <Textarea
                  id="expected-outcomes"
                  value={expectedOutcomes}
                  onChange={(e) => setExpectedOutcomes(e.target.value)}
                  placeholder="Describe expected performance benchmarks, clinical success criteria, and relevant endpoints for your device type."
                  className="min-h-[80px] mt-1.5"
                />
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="context">
              <AccordionTrigger className="px-4 py-2 hover:no-underline hover:bg-gray-50">
                <div className="flex items-center">
                  <List className="mr-2 h-4 w-4 text-[#0F6CBD]" />
                  <span>Additional Context</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-2 pb-4">
                <Textarea
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder="Provide any additional information relevant to the state of the art for your device."
                  className="min-h-[100px]"
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t border-[#E1DFDD] bg-gray-50 px-6 py-4">
        <Button
          variant="outline"
          onClick={() => {
            setMedicalCondition('');
            setConditionEpidemiology('');
            setCurrentTreatments('');
            setClinicalGuidelines('');
            setRelevantStandards('');
            setDeviceType('');
            setIndications('');
            setExpectedOutcomes('');
            setAdditionalContext('');
            setGeneratedSection(null);
          }}
        >
          Reset Form
        </Button>
        
        <Button
          onClick={generateSOTA}
          disabled={isGenerating || !medicalCondition || !deviceType}
          className="bg-[#0F6CBD] hover:bg-[#0E5EA5] text-white"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Generate SOTA Section
            </>
          )}
        </Button>
      </CardFooter>
      
      {generatedSection && (
        <div className="border-t border-[#E1DFDD] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#323130]">
              Generated State of the Art Analysis
            </h3>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(generatedSection.content || generatedSection)}
              >
                Copy Text
              </Button>
              
              {onSectionGenerated && (
                <Button
                  size="sm"
                  className="bg-[#0F6CBD] hover:bg-[#0E5EA5] text-white"
                  onClick={() => {
                    if (onSectionGenerated) {
                      onSectionGenerated({
                        type: 'state-of-art',
                        title: 'State of the Art Analysis',
                        content: generatedSection.content || generatedSection,
                        model: generatedSection.model || 'gpt-4o',
                        metadata: {
                          medicalCondition,
                          deviceType,
                          currentTreatments: currentTreatments || 'Not specified',
                          standards: relevantStandards || 'Not specified'
                        }
                      });
                    }
                  }}
                >
                  Add to CER
                </Button>
              )}
            </div>
          </div>
          
          <div className="bg-white border border-[#E1DFDD] rounded-md p-4 max-h-96 overflow-y-auto">
            <div className="prose prose-sm max-w-none">
              {(generatedSection.content || generatedSection).split('\n').map((paragraph, idx) => (
                <p key={idx} className={paragraph.startsWith('#') ? 'font-bold mt-4 mb-2' : 'my-2'}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
          
          <div className="mt-3 text-xs text-[#605E5C] flex items-center">
            <Info className="h-3.5 w-3.5 mr-1 text-[#0F6CBD]" />
            Generated content is based on the information provided and should be reviewed for accuracy before inclusion in your CER.
          </div>
        </div>
      )}
    </Card>
  );
}