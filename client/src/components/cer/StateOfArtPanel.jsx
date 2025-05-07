import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cerApiService } from '@/services/CerAPIService';
import { BookMarked, RefreshCw, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function StateOfArtPanel({ onSectionGenerated }) {
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [indication, setIndication] = useState('');
  const [regulatoryFramework, setRegulatoryFramework] = useState('EU MDR');
  const [isGenerating, setIsGenerating] = useState(false);
  const [sotaContent, setSotaContent] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const { toast } = useToast();

  // Device type options
  const deviceTypes = [
    'Class I Medical Device',
    'Class II Medical Device',
    'Class III Medical Device',
    'Implantable Device',
    'Software as Medical Device',
    'Diagnostic Device',
    'Therapeutic Device',
    'Monitoring Device',
    'Surgical Instrument',
    'Orthopedic Device'
  ];

  // Regulatory framework options
  const regulatoryFrameworks = [
    'EU MDR',
    'FDA 510(k)',
    'FDA PMA',
    'ISO 14155',
    'MEDDEV 2.7/1 Rev 4',
    'EU IVDR'
  ];

  const validateInputs = () => {
    const errors = {};
    
    if (!deviceName.trim()) {
      errors.deviceName = 'Device name is required';
    }
    
    if (!deviceType) {
      errors.deviceType = 'Device type is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGenerateSOTA = async () => {
    if (!validateInputs()) return;
    
    try {
      setIsGenerating(true);
      
      const sotaSection = await cerApiService.generateStateOfArt({
        deviceName,
        deviceType,
        indication,
        regulatoryFramework
      });
      
      setSotaContent(sotaSection.content);
      
      // Pass the generated section up to the parent component
      if (onSectionGenerated) {
        onSectionGenerated(sotaSection);
      }
      
      toast({
        title: 'State of Art Analysis Generated',
        description: 'SOTA section has been successfully created and added to your CER',
        variant: 'success'
      });
    } catch (error) {
      console.error('Error generating SOTA:', error);
      toast({
        title: 'Error Generating SOTA Analysis',
        description: error.message || 'An error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {/* Input panel - Using MS365-inspired design */}
      <div className="lg:col-span-2">
        <Card className="shadow-sm border-[#E1DFDD]">
          <CardHeader className="bg-[#F5F5F5] pb-3 pt-3">
            <CardTitle className="text-[#323130] text-lg flex items-center">
              <BookMarked className="h-5 w-5 mr-2 text-[#0F6CBD]" />
              State of the Art Parameters
            </CardTitle>
            <CardDescription className="text-[#616161]">
              Enter device information to generate a State of the Art analysis
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="device-name" className="text-[#323130]">
                Device Name <span className="text-[#D83B01]">*</span>
              </Label>
              <Input
                id="device-name"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="e.g., Arthrosurface Shoulder Arthroplasty System"
                className="border-[#E1DFDD]"
              />
              {validationErrors.deviceName && (
                <p className="text-xs text-[#D83B01] mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {validationErrors.deviceName}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="device-type" className="text-[#323130]">
                Device Type <span className="text-[#D83B01]">*</span>
              </Label>
              <Select value={deviceType} onValueChange={setDeviceType}>
                <SelectTrigger id="device-type" className="border-[#E1DFDD]">
                  <SelectValue placeholder="Select device type" />
                </SelectTrigger>
                <SelectContent>
                  {deviceTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.deviceType && (
                <p className="text-xs text-[#D83B01] mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {validationErrors.deviceType}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="indication" className="text-[#323130]">
                Intended Use/Indication
              </Label>
              <Textarea
                id="indication"
                value={indication}
                onChange={(e) => setIndication(e.target.value)}
                placeholder="e.g., Treatment of shoulder joint pathologies like osteoarthritis or rotator cuff deficiency"
                className="border-[#E1DFDD] min-h-[80px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="regulatory-framework" className="text-[#323130]">
                Regulatory Framework
              </Label>
              <Select value={regulatoryFramework} onValueChange={setRegulatoryFramework}>
                <SelectTrigger id="regulatory-framework" className="border-[#E1DFDD]">
                  <SelectValue placeholder="Select regulatory framework" />
                </SelectTrigger>
                <SelectContent>
                  {regulatoryFrameworks.map(framework => (
                    <SelectItem key={framework} value={framework}>{framework}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          
          <CardFooter className="bg-[#F5F5F5] border-t border-[#E1DFDD] flex justify-end">
            <Button
              onClick={handleGenerateSOTA}
              disabled={isGenerating}
              className="bg-[#0F6CBD] hover:bg-[#115EA3] text-white"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <BookMarked className="h-4 w-4 mr-2" />
                  Generate SOTA
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        {/* Information panel about SOTA */}
        <Card className="shadow-sm border-[#E1DFDD] mt-4">
          <CardHeader className="bg-[#F5F5F5] pb-3 pt-3">
            <CardTitle className="text-[#323130] text-lg">
              SOTA Guidance
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="regulatory" className="border-[#E1DFDD]">
                <AccordionTrigger className="text-[#323130] hover:text-[#0F6CBD] hover:no-underline">
                  <span className="text-sm font-medium">Regulatory Requirements</span>
                </AccordionTrigger>
                <AccordionContent className="text-[#616161] text-sm">
                  <p>Per MEDDEV 2.7/1 Rev 4, a "State of the Art" section is required in Clinical Evaluation Reports to establish the current knowledge and technical capabilities for similar devices and treatment alternatives.</p>
                  <p className="mt-2">This section must include current knowledge, available standards, and alternative treatments to establish a performance baseline.</p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="content" className="border-[#E1DFDD]">
                <AccordionTrigger className="text-[#323130] hover:text-[#0F6CBD] hover:no-underline">
                  <span className="text-sm font-medium">Content Requirements</span>
                </AccordionTrigger>
                <AccordionContent className="text-[#616161] text-sm">
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Description of medical conditions being addressed</li>
                    <li>Current standard treatments and alternative technologies</li>
                    <li>Relevant published standards and guidance documents</li>
                    <li>Safety & performance benchmarks for similar devices</li>
                    <li>Expected benefits and clinical outcomes</li>
                    <li>Known risks and complications within the device category</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="data" className="border-[#E1DFDD]">
                <AccordionTrigger className="text-[#323130] hover:text-[#0F6CBD] hover:no-underline">
                  <span className="text-sm font-medium">Data Sources</span>
                </AccordionTrigger>
                <AccordionContent className="text-[#616161] text-sm">
                  <p>The SOTA generator connects to authentic sources including:</p>
                  <ul className="list-disc ml-5 space-y-1 mt-2">
                    <li>Scientific literature databases (PubMed, Embase)</li>
                    <li>Clinical practice guidelines</li>
                    <li>Regulatory standards databases (ISO, ASTM)</li>
                    <li>Medical technology position papers</li>
                    <li>Professional society consensus statements</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
      
      {/* Results panel */}
      <div className="lg:col-span-3">
        <Card className="shadow-sm border-[#E1DFDD] h-full">
          <CardHeader className="bg-[#F5F5F5] pb-3 pt-3 flex-row justify-between items-center">
            <div>
              <CardTitle className="text-[#323130] text-lg flex items-center">
                <FileText className="h-5 w-5 mr-2 text-[#0F6CBD]" />
                Generated SOTA Analysis
              </CardTitle>
              <CardDescription className="text-[#616161]">
                This content will be included in your CER
              </CardDescription>
            </div>
            
            {sotaContent && (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  className="h-8 px-2 text-[#0F6CBD] border-[#0F6CBD] bg-white" 
                  onClick={() => {
                    const blob = new Blob([sotaContent], { type: 'text/plain' });
                    cerApiService.downloadBlob(blob, `sota_analysis_${deviceName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`);
                  }}
                >
                  <Download className="h-4 w-4 mr-1" />
                  <span className="text-xs">Export</span>
                </Button>
              </div>
            )}
          </CardHeader>
          
          <CardContent className="pt-4 h-[calc(100%-64px)] overflow-auto">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4 text-[#616161]">
                <RefreshCw className="h-8 w-8 animate-spin text-[#0F6CBD]" />
                <p>Generating State of the Art analysis...</p>
                <p className="text-sm text-center max-w-md">
                  Connecting to authentic scientific literature and regulatory databases to compile a comprehensive SOTA analysis.
                </p>
              </div>
            ) : sotaContent ? (
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ 
                  __html: sotaContent
                    .replace(/# /g, '<h1>')
                    .replace(/\n## /g, '</h1><h2>')
                    .replace(/\n### /g, '</h2><h3>')
                    .replace(/\n#### /g, '</h3><h4>')
                    .replace(/<h(\d)>([^<]+)/g, '<h$1 class="text-[#323130] font-semibold mb-3 mt-5">$2')
                    .replace(/\n/g, '<br/>')
                    .replace(/- ([^\n]+)/g, '<li>$1</li>')
                }} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full space-y-2 text-[#616161]">
                <BookMarked className="h-16 w-16 text-[#E1DFDD]" />
                <p className="text-lg">No SOTA analysis generated yet</p>
                <p className="text-sm text-center max-w-md">
                  Enter your device information and generate a State of the Art analysis to include in your Clinical Evaluation Report.
                </p>
                <div className="bg-[#F0F8FF] text-[#0F6CBD] border border-[#0F6CBD] p-3 rounded-md mt-4 text-sm">
                  <p className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-[#0F6CBD]" />
                    <span>The SOTA section is required for regulatory compliance with MEDDEV 2.7/1 Rev 4 (Section 8).</span>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}