/**
 * Regulatory Intelligence Step for IND Wizard
 * 
 * This step integrates comprehensive regulatory intelligence capabilities into the 
 * IND Wizard workflow, providing FDA guidance, ICH guidelines, IHE profiles, and
 * other regulatory information relevant to IND submissions.
 */

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import ErrorBoundary from '@/components/ui/error-boundary';
import { apiRequest } from '@/lib/queryClient';
import { useDatabaseStatus } from '@/components/providers/database-status-provider';
import { DatabaseAware } from '@/components/ui/database-aware';
import { 
  AlertCircle, 
  CheckCircle2, 
  BookCheck, 
  FileText, 
  ChevronRight,
  Loader2
} from 'lucide-react';

// Import the Regulatory Intelligence component
import RegulatoryIntelligence from '../regulatory-intelligence/RegulatoryIntelligence';

function RegulatoryIntelligenceStep({ projectId, onComplete, onPrevious }) {
  const { toast } = useToast();
  const { isConnected } = useDatabaseStatus();
  const [hasReviewedGuidance, setHasReviewedGuidance] = useState(false);
  
  // Get project checklist data including regulatory progress
  const { 
    data: projectChecklist, 
    isLoading: isLoadingChecklist,
    refetch: refetchChecklist
  } = useQuery({
    queryKey: ['ind-project-checklist', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      
      try {
        const response = await apiRequest('GET', `/api/ind/${projectId}/checklist`);
        
        if (!response.ok) throw new Error('Failed to fetch project checklist');
        
        return response.json();
      } catch (error) {
        console.error('Error fetching project checklist:', error);
        return null;
      }
    },
    enabled: !!projectId && isConnected
  });

  // Update project with regulatory intelligence review status
  const updateRegulatoryReviewStatus = async () => {
    try {
      const response = await apiRequest('PUT', `/api/ind/${projectId}/checklist/regulatory`, {
        reviewed: true,
        reviewDate: new Date().toISOString()
      });
      
      if (!response.ok) throw new Error('Failed to update regulatory review status');
      
      setHasReviewedGuidance(true);
      refetchChecklist();
      
      toast({
        title: 'Regulatory Review Completed',
        description: 'Your review of regulatory guidance has been recorded.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error updating regulatory review status:', error);
      
      toast({
        title: 'Update Failed',
        description: error.message || 'Unable to update regulatory review status. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Effect to set initial review status from project data
  useEffect(() => {
    if (projectChecklist?.regulatory?.reviewed) {
      setHasReviewedGuidance(true);
    }
  }, [projectChecklist]);
  
  // Handler for completing the step
  const handleComplete = () => {
    onComplete();
  };
  
  // Handler for previous step
  const handlePrevious = () => {
    onPrevious();
  };
  
  return (
    <ErrorBoundary title="Regulatory Intelligence Error" description="An error occurred while loading the Regulatory Intelligence component.">
      <DatabaseAware
        title="Regulatory Intelligence Unavailable"
        description="The regulatory intelligence module requires a database connection which is currently unavailable."
      >
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Regulatory Intelligence</CardTitle>
                  <CardDescription>
                    Review FDA, EMA, ICH, and IHE regulatory intelligence to ensure IND compliance
                  </CardDescription>
                </div>
                
                <div className="flex items-center space-x-1 text-sm">
                  <div className={`rounded-full p-1 ${hasReviewedGuidance ? 'bg-green-100' : 'bg-amber-100'}`}>
                    {hasReviewedGuidance ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                    )}
                  </div>
                  <span className={hasReviewedGuidance ? 'text-green-600' : 'text-amber-600'}>
                    {hasReviewedGuidance ? 'Reviewed' : 'Review Needed'}
                  </span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted/30 p-4 rounded-md">
                  <div className="flex items-start">
                    <BookCheck className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Regulatory Review Importance</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Reviewing current regulatory guidance is a critical step in IND preparation. The FDA, ICH, and other
                        regulatory authorities frequently update their guidelines and expectations for INDs. This module helps
                        you stay current with the latest requirements and recommendations.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="py-2">
                  <h3 className="font-medium mb-2">Key Guidance for Your IND</h3>
                  
                  {isLoadingChecklist ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-start p-3 border rounded-md">
                        <FileText className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium">FDA Guidance for Industry: IND Applications</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Comprehensive guidance on preparing and submitting Investigational New Drug applications.
                          </p>
                          <div className="mt-1">
                            <a 
                              href="https://www.fda.gov/drugs/investigational-new-drug-ind-application/ind-application-procedures-clinical-investigations-marketed-drugs-and-biologics" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary inline-flex items-center"
                            >
                              View Guidance
                              <ChevronRight className="h-3.5 w-3.5 ml-1" />
                            </a>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start p-3 border rounded-md">
                        <FileText className="h-5 w-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium">ICH E6(R3) Good Clinical Practice</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            International ethical and scientific quality standard for clinical trials cited in FDA regulations.
                          </p>
                          <div className="mt-1">
                            <a 
                              href="https://database.ich.org/sites/default/files/ICH_E6-R3_GuideLine_Step4_2023_1130.pdf" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary inline-flex items-center"
                            >
                              View Guidance
                              <ChevronRight className="h-3.5 w-3.5 ml-1" />
                            </a>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start p-3 border rounded-md">
                        <FileText className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium">FDA Guidance: Content and Format of INDs</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Specific guidance on the organization and content of IND submissions.
                          </p>
                          <div className="mt-1">
                            <a 
                              href="https://www.fda.gov/regulatory-information/search-fda-guidance-documents/content-and-format-investigational-new-drug-applications-inds-phase-1-studies-pharmaceuticals" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary inline-flex items-center"
                            >
                              View Guidance
                              <ChevronRight className="h-3.5 w-3.5 ml-1" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                {/* Embed the Regulatory Intelligence component */}
                <RegulatoryIntelligence projectId={projectId} />
                
                <Separator />
                
                <div className="bg-muted/30 p-4 rounded-md">
                  <div className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Confirmation of Review</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        By clicking the "Mark as Reviewed" button, you confirm that you have reviewed all relevant
                        regulatory guidance for your IND submission. This information is essential to ensure your
                        IND meets current FDA and international standards.
                      </p>
                      
                      <div className="mt-3">
                        <Button 
                          variant="outline" 
                          onClick={updateRegulatoryReviewStatus}
                          disabled={hasReviewedGuidance}
                        >
                          {hasReviewedGuidance ? 'Already Reviewed' : 'Mark as Reviewed'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
            >
              Previous Step
            </Button>
            
            <Button
              onClick={handleComplete}
              disabled={!hasReviewedGuidance && isConnected}
            >
              Next Step
            </Button>
          </div>
        </div>
      </DatabaseAware>
    </ErrorBoundary>
  );
}

export default RegulatoryIntelligenceStep;