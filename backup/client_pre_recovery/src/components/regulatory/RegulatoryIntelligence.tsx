import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Loader2, Search, FileText, AlertTriangle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Interface for regulatory requirement
interface RegulatoryRequirement {
  agency: string;
  guideline: string;
  requirement: string;
  applicable_phases: string[];
  compliance_level: 'mandatory' | 'recommended' | 'optional';
  document_reference: string;
  last_updated: string;
}

// Interface for regulatory guidance
interface RegulatoryGuidance {
  title: string;
  agency: string;
  year: number;
  url?: string;
  summary: string;
  relevance_score: number;
  tags: string[];
}

// Interface for regulatory summary
interface RegulatorySummary {
  therapeutic_area: string;
  phase: string;
  key_requirements: RegulatoryRequirement[];
  relevant_guidance: RegulatoryGuidance[];
  special_considerations: string[];
}

// Color based on compliance level
const getComplianceColor = (level: string): string => {
  switch (level) {
    case 'mandatory':
      return 'bg-red-100 text-red-700 border-red-300';
    case 'recommended':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'optional':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

export function RegulatoryIntelligence() {
  const [phase, setPhase] = useState('');
  const [indication, setIndication] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<RegulatorySummary | null>(null);
  
  // Protocol analysis
  const [protocolText, setProtocolText] = useState('');
  const [protocolPhase, setProtocolPhase] = useState('');
  const [protocolIndication, setProtocolIndication] = useState('');
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  // Handle search for intelligence
  const handleSearch = async () => {
    if (!phase) {
      // toast call replaced
  // Original: toast({
        title: "Phase is required",
        description: "Please select a trial phase to search for regulatory intelligence.",
        variant: "destructive"
      })
  console.log('Toast would show:', {
        title: "Phase is required",
        description: "Please select a trial phase to search for regulatory intelligence.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const params = new URLSearchParams();
      params.append('phase', phase);
      if (indication) params.append('indication', indication);
      
      const response = await fetch(`/api/regulatory/intelligence?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Search error:', error);
      // toast call replaced
  // Original: toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      })
  console.log('Toast would show:', {
        title: "Search failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle protocol analysis
  const handleProtocolAnalysis = async () => {
    if (!protocolText || !protocolPhase) {
      // toast call replaced
  // Original: toast({
        title: "Missing information",
        description: "Please provide both protocol text and phase.",
        variant: "destructive"
      })
  console.log('Toast would show:', {
        title: "Missing information",
        description: "Please provide both protocol text and phase.",
        variant: "destructive"
      });
      return;
    }

    setAnalysisLoading(true);
    
    try {
      const response = await fetch('/api/regulatory/analyze-protocol', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          protocolText,
          phase: protocolPhase,
          indication: protocolIndication
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setAnalysisResult(data.analysis);
    } catch (error) {
      console.error('Analysis error:', error);
      // toast call replaced
  // Original: toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      })
  console.log('Toast would show:', {
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setAnalysisLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search">Regulatory Intelligence</TabsTrigger>
          <TabsTrigger value="analyze">Protocol Analysis</TabsTrigger>
        </TabsList>
        
        {/* Regulatory Intelligence Search */}
        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>FDA and Global Regulatory Intelligence</CardTitle>
              <CardDescription>
                Search for regulatory requirements and guidance specific to trial phase and therapeutic area.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="phase">Trial Phase <span className="text-red-500">*</span></Label>
                  <Select value={phase} onValueChange={setPhase}>
                    <SelectTrigger id="phase">
                      <SelectValue placeholder="Select phase" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="Phase 1">Phase 1</SelectItem>
                      <SelectItem value="Phase 2">Phase 2</SelectItem>
                      <SelectItem value="Phase 3">Phase 3</SelectItem>
                      <SelectItem value="Phase 4">Phase 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="indication">Therapeutic Area (Optional)</Label>
                  <Input 
                    id="indication" 
                    placeholder="e.g., Oncology, Cardiovascular" 
                    value={indication} 
                    onChange={(e) => setIndication(e.target.value)} 
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSearch} disabled={loading || !phase}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search Regulatory Intelligence
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {summary && (
            <div className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Regulatory Summary</CardTitle>
                  <CardDescription>
                    {summary.phase} • {summary.therapeutic_area || 'All Therapeutic Areas'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {summary.special_considerations.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">Special Considerations</h3>
                      <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
                        <div className="flex space-x-2">
                          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <ul className="list-disc pl-4 space-y-1">
                            {summary.special_considerations.map((consideration, index) => (
                              <li key={index} className="text-sm">{consideration}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Key Requirements */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Key Regulatory Requirements</h3>
                    <Accordion type="multiple" className="w-full">
                      {summary.key_requirements.map((req, index) => (
                        <AccordionItem value={`req-${index}`} key={index}>
                          <AccordionTrigger className="text-left">
                            <div className="flex items-center">
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${getComplianceColor(req.compliance_level)} mr-2`}>
                                {req.compliance_level}
                              </span>
                              <span>{req.agency}: {req.guideline}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="pl-4 border-l-2 border-gray-200">
                              <p className="text-sm mb-2">{req.requirement}</p>
                              <div className="flex flex-wrap gap-1 mb-2">
                                {req.applicable_phases.map((phase, idx) => (
                                  <span key={idx} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
                                    {phase}
                                  </span>
                                ))}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                <p>Reference: {req.document_reference}</p>
                                <p>Last updated: {new Date(req.last_updated).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                  
                  {/* Relevant Guidance */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Relevant Guidance Documents</h3>
                    <div className="space-y-4">
                      {summary.relevant_guidance.map((guidance, index) => (
                        <Card key={index}>
                          <CardHeader className="py-3">
                            <div className="flex justify-between">
                              <CardTitle className="text-base">{guidance.title}</CardTitle>
                              <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                                {guidance.agency}
                              </span>
                            </div>
                            <CardDescription className="text-xs">
                              {guidance.year} • Relevance: {Math.round(guidance.relevance_score * 100)}%
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="py-0">
                            <p className="text-sm">{guidance.summary}</p>
                            {guidance.url && (
                              <a 
                                href={guidance.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                              >
                                View document →
                              </a>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        {/* Protocol Analysis */}
        <TabsContent value="analyze">
          <Card>
            <CardHeader>
              <CardTitle>Protocol Regulatory Analysis</CardTitle>
              <CardDescription>
                Analyze your protocol for regulatory compliance and identify potential issues.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="protocol-phase">Trial Phase <span className="text-red-500">*</span></Label>
                    <Select value={protocolPhase} onValueChange={setProtocolPhase}>
                      <SelectTrigger id="protocol-phase">
                        <SelectValue placeholder="Select phase" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="Phase 1">Phase 1</SelectItem>
                        <SelectItem value="Phase 2">Phase 2</SelectItem>
                        <SelectItem value="Phase 3">Phase 3</SelectItem>
                        <SelectItem value="Phase 4">Phase 4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="protocol-indication">Therapeutic Area (Optional)</Label>
                    <Input 
                      id="protocol-indication" 
                      placeholder="e.g., Oncology, Cardiovascular" 
                      value={protocolIndication} 
                      onChange={(e) => setProtocolIndication(e.target.value)} 
                    />
                  </div>
                </div>
                
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="protocol-text">Protocol Text <span className="text-red-500">*</span></Label>
                  <Textarea 
                    id="protocol-text"
                    placeholder="Paste your protocol text here. Include protocol sections such as eligibility criteria, endpoints, and study design."
                    className="min-h-[200px]"
                    value={protocolText}
                    onChange={(e) => setProtocolText(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleProtocolAnalysis} 
                disabled={analysisLoading || !protocolText || !protocolPhase}
              >
                {analysisLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Analyze Protocol
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {analysisResult && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Regulatory Analysis Results</CardTitle>
                <CardDescription>
                  {protocolPhase} • {protocolIndication || 'Unspecified Indication'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {analysisResult.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-2">{paragraph}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}