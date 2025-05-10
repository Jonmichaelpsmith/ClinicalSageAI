import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, MessageSquare, Lightbulb, AlertCircle, Search } from "lucide-react";

export default function RegulatoryAdvisorPanel({ formData, currentStep }) {
  const [insights, setInsights] = useState([]);
  const [citations, setCitations] = useState([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('insights');

  // Generate insights based on form data and current step
  useEffect(() => {
    if (!formData) return;
    
    // Clear previous insights when step changes
    if (currentStep) {
      setInsights([]);
      generateInsights();
    }
  }, [formData, currentStep]);

  // Simulate generating insights from the AI
  const generateInsights = async () => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate insights based on the current step and form data
    const newInsights = [];
    
    // Step 1: Sponsor Information
    if (currentStep === 1) {
      if (formData.sponsor) {
        const sponsor = formData.sponsor;
        
        if (!sponsor.sponsorName) {
          newInsights.push({
            type: 'warning',
            message: 'Sponsor name is required per 21 CFR 312.23(a)(1)(i).',
            citation: '21 CFR 312.23(a)(1)(i)'
          });
        }
        
        if (!sponsor.address) {
          newInsights.push({
            type: 'warning',
            message: 'A complete sponsor address is required for IND submissions.',
            citation: '21 CFR 312.23(a)(1)(i)'
          });
        }
        
        if (sponsor.country !== 'United States' && !sponsor.usDAgent) {
          newInsights.push({
            type: 'warning',
            message: 'Non-U.S. sponsors must designate a U.S. agent for FDA communications.',
            citation: 'FDA Guidance for Industry: Content and Format of INDs'
          });
        }
        
        if (sponsor.contactEmail && !sponsor.contactEmail.includes('@')) {
          newInsights.push({
            type: 'warning',
            message: 'Contact email format appears invalid; this may delay FDA communications.',
            citation: 'FDA Electronic Submissions Gateway (ESG) Guidelines'
          });
        }
        
        if (sponsor.sponsorName && sponsor.address && sponsor.contactName) {
          newInsights.push({
            type: 'success',
            message: 'Primary sponsor information is complete. Remember to upload Form FDA 1571 in the Forms section.',
            citation: 'FDA Form 1571 Instructions'
          });
        }
      }
    }
    
    // Step 2: Investigator Information
    else if (currentStep === 2) {
      if (formData.investigator) {
        const investigator = formData.investigator;
        
        if (!investigator.investigatorName) {
          newInsights.push({
            type: 'warning',
            message: 'Principal investigator name is required for IND submissions.',
            citation: '21 CFR 312.23(a)(6)(iii)(b)'
          });
        }
        
        if (!investigator.qualification) {
          newInsights.push({
            type: 'info',
            message: 'Including investigator qualifications helps establish their expertise for the proposed study.',
            citation: 'FDA Guidance: Investigator Responsibilities'
          });
        }
        
        newInsights.push({
          type: 'info',
          message: 'Form FDA 1572 (Statement of Investigator) should be completed by each investigator and uploaded in the Forms section.',
          citation: 'FDA Form 1572 Requirements'
        });
      }
    }
    
    // Step 3: Protocol Synopsis
    else if (currentStep === 3) {
      if (formData.protocol) {
        const protocol = formData.protocol;
        
        if (!protocol.title) {
          newInsights.push({
            type: 'warning',
            message: 'Protocol title is required in the IND submission.',
            citation: '21 CFR 312.23(a)(3)'
          });
        }
        
        if (!protocol.phase) {
          newInsights.push({
            type: 'warning',
            message: 'Study phase should be specified in the protocol.',
            citation: '21 CFR 312.23(a)(3)(iv)'
          });
        }
        
        newInsights.push({
          type: 'info',
          message: 'The protocol should include clear primary and secondary endpoints.',
          citation: 'ICH E6(R2) Good Clinical Practice'
        });
        
        newInsights.push({
          type: 'info',
          message: 'Include a statistical analysis plan in your protocol to strengthen your IND submission.',
          citation: 'FDA Guidance for Industry: E9 Statistical Principles for Clinical Trials'
        });
      }
    }
    
    // Step 4: Forms Uploader
    else if (currentStep === 4) {
      newInsights.push({
        type: 'warning',
        message: 'Form FDA 1571 (IND Application) must be included in your submission.',
        citation: '21 CFR 312.23(a)(1)(i)'
      });
      
      newInsights.push({
        type: 'warning',
        message: 'Form FDA 1572 (Statement of Investigator) is required for each investigator.',
        citation: '21 CFR 312.53(c)'
      });
      
      newInsights.push({
        type: 'warning',
        message: 'Form FDA 3674 (Certification of Compliance) is required to certify compliance with ClinicalTrials.gov requirements.',
        citation: '42 CFR 11'
      });
    }
    
    // Step 5: Supporting Documents
    else if (currentStep === 5) {
      newInsights.push({
        type: 'warning',
        message: 'An Investigator\'s Brochure (IB) containing relevant information about the investigational drug is required.',
        citation: '21 CFR 312.23(a)(5)'
      });
      
      newInsights.push({
        type: 'info',
        message: 'Include CMC (Chemistry, Manufacturing, and Controls) information for the investigational drug.',
        citation: '21 CFR 312.23(a)(7)'
      });
      
      newInsights.push({
        type: 'info',
        message: 'Include pharmacology and toxicology information to support the safety of the proposed clinical investigation.',
        citation: '21 CFR 312.23(a)(8)'
      });
      
      newInsights.push({
        type: 'info',
        message: 'If available, include previous human experience with the investigational drug.',
        citation: '21 CFR 312.23(a)(9)'
      });
    }
    
    // Add general insights regardless of step
    newInsights.push({
      type: 'info',
      message: 'FDA\'s goal date for reviewing a complete IND is typically 30 days from receipt.',
      citation: '21 CFR 312.40(b)(1)'
    });
    
    // Extract citations for the Citations tab
    const newCitations = newInsights.map(insight => insight.citation).filter((citation, index, self) => 
      self.indexOf(citation) === index
    );
    
    setInsights(newInsights);
    setCitations(newCitations);
    setIsLoading(false);
  };

  // Handle manual query submission
  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsLoading(true);
    setSelectedTab('insights');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Example responses based on common regulatory questions
    let newInsight = {
      type: 'info',
      message: 'No specific information found for your query.',
      citation: 'N/A'
    };
    
    // Very simplified keyword matching
    if (query.toLowerCase().includes('investigator')) {
      newInsight = {
        type: 'info',
        message: 'Investigators must be qualified by training and experience to evaluate the investigational drug. Their qualifications should be documented in Form FDA 1572.',
        citation: '21 CFR 312.53'
      };
    } else if (query.toLowerCase().includes('protocol')) {
      newInsight = {
        type: 'info',
        message: 'A protocol for a Phase 1 study should include: objectives, subject selection criteria, dose information, safety assessments, and study duration.',
        citation: '21 CFR 312.23(a)(6)'
      };
    } else if (query.toLowerCase().includes('adverse') || query.toLowerCase().includes('safety')) {
      newInsight = {
        type: 'info',
        message: 'Sponsors must promptly review all safety information. Serious and unexpected adverse reactions must be reported to FDA within 15 calendar days.',
        citation: '21 CFR 312.32'
      };
    } else if (query.toLowerCase().includes('amendment')) {
      newInsight = {
        type: 'info',
        message: 'Protocol amendments requiring FDA notification include: changes in drug substance/manufacturing, new toxicology findings, or new clinical procedures affecting subject safety.',
        citation: '21 CFR 312.30'
      };
    }
    
    setInsights([newInsight, ...insights]);
    if (!citations.includes(newInsight.citation) && newInsight.citation !== 'N/A') {
      setCitations([...citations, newInsight.citation]);
    }
    
    setQuery('');
    setIsLoading(false);
  };

  // Get icon for insight type
  const getIconForType = (type) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'success':
        return <Lightbulb className="h-4 w-4 text-green-500" />;
      case 'info':
      default:
        return <BookOpen className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="mr-2 h-5 w-5 text-blue-500" />
          Regulatory Advisor
        </CardTitle>
        <CardDescription>
          AI-powered guidance based on FDA regulations
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleQuerySubmit} className="flex gap-2 mb-4">
          <Input
            placeholder="Ask about regulations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
          />
          <Button type="submit" size="sm" disabled={isLoading || !query.trim()}>
            <Search className="h-4 w-4" />
          </Button>
        </form>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="citations">Citations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="insights">
            <ScrollArea className="h-[350px] pr-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mb-2"></div>
                  <p className="text-sm text-muted-foreground">Analyzing submission data...</p>
                </div>
              ) : insights.length > 0 ? (
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <div key={index} className="flex gap-3 border-b pb-3 last:border-0">
                      <div className="mt-0.5">
                        {getIconForType(insight.type)}
                      </div>
                      <div>
                        <p className="text-sm">{insight.message}</p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {insight.citation}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-8">
                  <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Complete more fields to receive guidance</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="citations">
            <ScrollArea className="h-[350px] pr-4">
              {citations.length > 0 ? (
                <div className="space-y-3">
                  {citations.map((citation, index) => (
                    <div key={index} className="p-3 border rounded-md">
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="text-sm font-medium">{citation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-8">
                  <BookOpen className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No citations available yet</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}