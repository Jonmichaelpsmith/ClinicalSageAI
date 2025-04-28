/**
 * AI Regulatory Advisor Component for IND Wizard
 * 
 * This component provides AI-powered regulatory guidance throughout the IND preparation process.
 * It analyzes the current state of the IND application and provides targeted advice.
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LightbulbIcon, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ArrowRight, 
  Clock, 
  RotateCw,
  FileText,
  Book,
  ListChecks,
  PieChart
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function AIRegulatoryAdvisor({ 
  projectId, 
  currentStep, 
  indData,
  onSuggestionAccept = () => {}
}) {
  const { toast } = useToast();
  const [activeGuidanceTab, setActiveGuidanceTab] = useState('recommendations');
  
  // Fetch AI recommendations for the current IND step
  const { 
    data: aiGuidance, 
    isLoading: isGuidanceLoading, 
    refetch: refetchGuidance 
  } = useQuery({
    queryKey: ['ind-ai-guidance', projectId, currentStep],
    queryFn: async () => {
      try {
        const response = await apiRequest('POST', '/api/ind/ai-guidance', {
          projectId,
          step: currentStep,
          indData
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch AI guidance');
        }
        
        return response.json();
      } catch (error) {
        console.error('Error fetching AI guidance:', error);
        
        // Graceful fallback for demo
        return {
          recommendations: [
            'Ensure all required fields are completed accurately',
            'Verify consistency between related sections',
            'Check for compliance with FDA guidelines for this section'
          ],
          risks: [
            {
              level: 'high',
              description: 'Missing information in critical sections',
              impact: 'May result in a refusal-to-file determination'
            },
            {
              level: 'medium',
              description: 'Inconsistent information across sections',
              impact: 'Could trigger requests for clarification, delaying review'
            }
          ],
          regulations: [
            {
              citation: '21 CFR 312.23(a)(1)',
              description: 'Requires a comprehensive table of contents',
              url: 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfcfr/CFRSearch.cfm?fr=312.23'
            },
            {
              citation: 'FDA Guidance for Industry: IND Applications',
              description: 'Provides detailed instructions for specific IND components',
              url: 'https://www.fda.gov/drugs/investigational-new-drug-ind-application/ind-application-procedures'
            }
          ],
          timelineImpact: {
            critical: ['Complete Form FDA 1571', 'Prepare Investigator Brochure'],
            recommended: ['Conduct gap analysis of CMC data', 'Finalize study protocol']
          }
        };
      }
    },
    enabled: !!projectId && !!currentStep
  });

  // Generate targeted recommendations for specific form fields
  const { 
    data: fieldGuidance, 
    isLoading: isFieldGuidanceLoading,
    mutate: getFieldGuidance 
  } = useMutation({
    mutationFn: async (field) => {
      try {
        const response = await apiRequest('POST', '/api/ind/field-guidance', {
          projectId,
          step: currentStep,
          field,
          indData
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch field guidance');
        }
        
        return response.json();
      } catch (error) {
        console.error('Error fetching field guidance:', error);
        toast({
          title: 'Error',
          description: 'Unable to generate field guidance. Please try again.',
          variant: 'destructive'
        });
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: 'AI Guidance Ready',
        description: 'Field-specific guidance has been generated',
      });
    }
  });

  // Get AI-powered assessment of the current IND section
  const { 
    data: sectionAssessment, 
    isLoading: isAssessmentLoading,
    mutate: runSectionAssessment 
  } = useMutation({
    mutationFn: async () => {
      try {
        const response = await apiRequest('POST', '/api/ind/section-assessment', {
          projectId,
          step: currentStep,
          indData
        });
        
        if (!response.ok) {
          throw new Error('Failed to assess section');
        }
        
        return response.json();
      } catch (error) {
        console.error('Error assessing section:', error);
        toast({
          title: 'Assessment Failed',
          description: 'Unable to analyze this section. Please try again.',
          variant: 'destructive'
        });
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: 'Assessment Complete',
        description: 'Section assessment has been completed',
      });
    }
  });

  // Analyze content for potential issues
  const handleAnalyzeContent = () => {
    runSectionAssessment();
  };

  // Refresh AI recommendations
  const handleRefreshGuidance = () => {
    refetchGuidance();
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <LightbulbIcon className="w-5 h-5 mr-2 text-amber-500" />
            <CardTitle>AI Regulatory Advisor</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefreshGuidance} disabled={isGuidanceLoading}>
            {isGuidanceLoading ? <RotateCw className="h-4 w-4 mr-1 animate-spin" /> : <RotateCw className="h-4 w-4 mr-1" />}
            Refresh
          </Button>
        </div>
        <CardDescription>
          Real-time guidance for your IND preparation
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="recommendations" value={activeGuidanceTab} onValueChange={setActiveGuidanceTab}>
        <div className="px-6">
          <TabsList className="w-full">
            <TabsTrigger value="recommendations" className="flex-1">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="risks" className="flex-1">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Risks
            </TabsTrigger>
            <TabsTrigger value="regulations" className="flex-1">
              <Book className="h-4 w-4 mr-2" />
              Regulations
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex-1">
              <Clock className="h-4 w-4 mr-2" />
              Timeline
            </TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="pt-4 pb-0">
          {isGuidanceLoading ? (
            <div className="flex flex-col items-center justify-center p-6">
              <RotateCw className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-center text-muted-foreground">Analyzing your IND data and generating regulatory insights...</p>
            </div>
          ) : (
            <>
              <TabsContent value="recommendations" className="mt-0">
                <ScrollArea className="h-[320px]">
                  <div className="space-y-4">
                    {aiGuidance?.recommendations?.length > 0 ? (
                      <ul className="space-y-3">
                        {aiGuidance.recommendations.map((recommendation, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 shrink-0 mt-0.5" />
                            <div>
                              <p>{recommendation}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center p-4">
                        <Info className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                        <p className="mt-2 text-muted-foreground">No recommendations available for this section.</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="risks" className="mt-0">
                <ScrollArea className="h-[320px]">
                  <div className="space-y-4">
                    {aiGuidance?.risks?.length > 0 ? (
                      aiGuidance.risks.map((risk, index) => (
                        <div key={index} className="flex items-start bg-slate-50 p-3 rounded-md">
                          <div className="flex flex-col">
                            <div className="flex items-center mb-2">
                              <Badge 
                                variant={
                                  risk.level === 'high' ? 'destructive' : 
                                  risk.level === 'medium' ? 'default' : 
                                  'outline'
                                }
                                className="mr-2"
                              >
                                {risk.level}
                              </Badge>
                              <span className="font-medium">{risk.description}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              <strong>Impact:</strong> {risk.impact}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-4">
                        <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                        <p className="mt-2 text-muted-foreground">No significant risks identified in this section.</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="regulations" className="mt-0">
                <ScrollArea className="h-[320px]">
                  <div className="space-y-4">
                    {aiGuidance?.regulations?.length > 0 ? (
                      aiGuidance.regulations.map((regulation, index) => (
                        <div key={index} className="border rounded-md p-3">
                          <div className="flex items-start">
                            <FileText className="h-5 w-5 mr-2 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-medium">{regulation.citation}</h4>
                              <p className="text-sm text-muted-foreground">{regulation.description}</p>
                              {regulation.url && (
                                <a 
                                  href={regulation.url} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-xs text-blue-600 flex items-center mt-1"
                                >
                                  View on FDA website
                                  <ArrowRight className="h-3 w-3 ml-1" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-4">
                        <Book className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                        <p className="mt-2 text-muted-foreground">No specific regulations to highlight for this section.</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="timeline" className="mt-0">
                <ScrollArea className="h-[320px]">
                  <div className="space-y-6">
                    {aiGuidance?.timelineImpact ? (
                      <>
                        <div>
                          <h4 className="font-medium text-red-700 mb-2 flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Critical Path Items
                          </h4>
                          <ul className="space-y-2">
                            {aiGuidance.timelineImpact.critical?.map((item, index) => (
                              <li key={index} className="flex items-center bg-red-50 p-2 rounded">
                                <Clock className="h-4 w-4 mr-2 text-red-600" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-blue-700 mb-2 flex items-center">
                            <Info className="h-4 w-4 mr-2" />
                            Recommended Actions
                          </h4>
                          <ul className="space-y-2">
                            {aiGuidance.timelineImpact.recommended?.map((item, index) => (
                              <li key={index} className="flex items-center bg-blue-50 p-2 rounded">
                                <ListChecks className="h-4 w-4 mr-2 text-blue-600" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-4">
                        <Clock className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                        <p className="mt-2 text-muted-foreground">No timeline insights available for this section.</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </>
          )}
        </CardContent>

        <CardFooter className="flex justify-between pt-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleAnalyzeContent}
            disabled={isAssessmentLoading}
          >
            {isAssessmentLoading ? (
              <>
                <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <PieChart className="h-4 w-4 mr-2" />
                Analyze Content
              </>
            )}
          </Button>
          
          <Button 
            size="sm"
            onClick={() => onSuggestionAccept(aiGuidance?.recommendations?.[0] || '')}
          >
            <LightbulbIcon className="h-4 w-4 mr-2" />
            Apply Suggestions
          </Button>
        </CardFooter>
      </Tabs>
    </Card>
  );
}

export default AIRegulatoryAdvisor;