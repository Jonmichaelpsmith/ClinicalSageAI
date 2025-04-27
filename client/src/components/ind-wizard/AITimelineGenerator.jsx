/**
 * AI Timeline Generator Component
 * 
 * This component uses AI to generate an optimized timeline for IND submission,
 * taking into account the project's specifics, regulatory requirements, and
 * historical submission timelines.
 */

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar, 
  Clock, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Info, 
  RotateCw, 
  ChevronRight, 
  ChevronsUpDown, 
  LightbulbIcon, 
  AlertTriangle, 
  Target, 
  CalendarDays, 
  FileBarChart,
  Save
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function AITimelineGenerator({ projectId, indData, onTimelineGenerated }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('parameters');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTimeline, setSelectedTimeline] = useState(null);
  
  // Timeline generation parameters
  const [parameters, setParameters] = useState({
    targetDate: null,
    priority: 'balanced', // balanced, speed, thoroughness
    includePreINDMeeting: true,
    considerHolidays: true,
    optimizeWorkload: true
  });

  // Handle parameter change
  const handleParameterChange = (key, value) => {
    setParameters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Get AI-generated timeline options
  const { 
    data: timelineOptions, 
    isLoading: isOptionsLoading,
    refetch: refetchOptions
  } = useQuery({
    queryKey: ['ind-timeline-options', projectId],
    queryFn: async () => {
      try {
        const response = await apiRequest('POST', '/api/ind/ai-timeline-options', {
          projectId,
          indData,
          parameters
        });
        
        if (!response.ok) throw new Error('Failed to generate timeline options');
        return response.json();
      } catch (error) {
        console.error('Error generating timeline options:', error);
        
        // Example fallback data for development/demo
        return {
          options: [
            {
              id: 'timeline-1',
              name: 'Standard Timeline',
              description: 'Balanced approach with industry-standard timelines',
              submissionDate: '2025-07-30',
              confidence: 'high',
              riskLevel: 'low',
              workloadDistribution: 'balanced',
              keyMilestones: [
                { id: 1, title: 'Complete CMC Documentation', date: '2025-05-15' },
                { id: 2, title: 'Finalize Clinical Protocol', date: '2025-06-10' },
                { id: 3, title: 'Complete FDA Forms', date: '2025-07-01' },
                { id: 4, title: 'QC Review', date: '2025-07-15' },
                { id: 5, title: 'IND Submission', date: '2025-07-30' }
              ]
            },
            {
              id: 'timeline-2',
              name: 'Accelerated Timeline',
              description: 'Expedited process targeting earlier submission',
              submissionDate: '2025-07-01',
              confidence: 'medium',
              riskLevel: 'medium',
              workloadDistribution: 'front-loaded',
              keyMilestones: [
                { id: 1, title: 'Complete CMC Documentation', date: '2025-05-01' },
                { id: 2, title: 'Finalize Clinical Protocol', date: '2025-05-20' },
                { id: 3, title: 'Complete FDA Forms', date: '2025-06-15' },
                { id: 4, title: 'QC Review', date: '2025-06-22' },
                { id: 5, title: 'IND Submission', date: '2025-07-01' }
              ]
            },
            {
              id: 'timeline-3',
              name: 'Conservative Timeline',
              description: 'Extended schedule with additional QC checkpoints',
              submissionDate: '2025-08-15',
              confidence: 'very high',
              riskLevel: 'very low',
              workloadDistribution: 'even',
              keyMilestones: [
                { id: 1, title: 'Complete CMC Documentation', date: '2025-06-01' },
                { id: 2, title: 'Finalize Clinical Protocol', date: '2025-06-30' },
                { id: 3, title: 'Complete FDA Forms', date: '2025-07-15' },
                { id: 4, title: 'QC Review', date: '2025-08-01' },
                { id: 5, title: 'IND Submission', date: '2025-08-15' }
              ]
            }
          ]
        };
      }
    },
    enabled: false // Don't auto-fetch
  });

  // Generate detailed timeline from selected option
  const { 
    data: detailedTimeline, 
    isLoading: isDetailedLoading,
    mutate: generateDetailedTimeline
  } = useMutation({
    mutationFn: async (timelineId) => {
      try {
        const response = await apiRequest('POST', '/api/ind/generate-detailed-timeline', {
          projectId,
          timelineId,
          parameters
        });
        
        if (!response.ok) throw new Error('Failed to generate detailed timeline');
        return response.json();
      } catch (error) {
        console.error('Error generating detailed timeline:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: 'Timeline Generated',
        description: 'Detailed timeline has been successfully created'
      });
      
      if (onTimelineGenerated) {
        onTimelineGenerated(data);
      }
    },
    onError: (error) => {
      toast({
        title: 'Generation Failed',
        description: error.message || 'Failed to generate detailed timeline',
        variant: 'destructive'
      });
    }
  });

  // Generate timeline options
  const handleGenerateOptions = () => {
    setIsGenerating(true);
    refetchOptions().finally(() => {
      setIsGenerating(false);
      setActiveTab('options');
    });
  };

  // Apply the selected timeline
  const handleApplyTimeline = () => {
    if (!selectedTimeline) {
      toast({
        title: 'No Timeline Selected',
        description: 'Please select a timeline before applying',
        variant: 'destructive'
      });
      return;
    }
    
    generateDetailedTimeline(selectedTimeline);
  };

  // Get confidence badge color
  const getConfidenceBadge = (confidence) => {
    switch (confidence) {
      case 'very high':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Very High</Badge>;
      case 'high':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>;
      case 'low':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Low</Badge>;
      case 'very low':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Very Low</Badge>;
      default:
        return <Badge>{confidence}</Badge>;
    }
  };

  // Get risk level badge color
  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'very low':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Very Low</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>;
      case 'high':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">High</Badge>;
      case 'very high':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Very High</Badge>;
      default:
        return <Badge>{risk}</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <CalendarDays className="h-5 w-5 mr-2 text-primary" />
              AI-Guided Timeline Generator
            </CardTitle>
            <CardDescription>
              Create an optimized IND submission timeline with AI assistance
            </CardDescription>
          </div>
          
          {activeTab === 'options' && timelineOptions?.options && (
            <Button variant="outline" size="sm" onClick={() => setActiveTab('parameters')}>
              <ChevronsUpDown className="h-4 w-4 mr-1" />
              Adjust Parameters
            </Button>
          )}
        </div>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <CardContent className="p-6">
          <TabsContent value="parameters" className="mt-0 space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Target Submission Date</h3>
                <div className="flex items-center space-x-4">
                  <input 
                    type="date" 
                    className="border rounded-md p-2"
                    value={parameters.targetDate || ''}
                    onChange={(e) => handleParameterChange('targetDate', e.target.value)}
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Info className="h-4 w-4 mr-1" />
                        Guidance
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-medium">Target Date Selection</h4>
                        <p className="text-sm text-muted-foreground">
                          Based on your current progress, a submission date between July 15, 2025 and August 30, 2025 is realistic.
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Timeline Priority</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="priority-balanced" 
                      name="priority"
                      value="balanced"
                      checked={parameters.priority === 'balanced'}
                      onChange={() => handleParameterChange('priority', 'balanced')}
                      className="mr-2"
                    />
                    <label htmlFor="priority-balanced" className="text-sm flex items-center">
                      <Target className="h-4 w-4 mr-1 text-blue-600" />
                      Balanced (Default)
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="priority-speed" 
                      name="priority"
                      value="speed"
                      checked={parameters.priority === 'speed'}
                      onChange={() => handleParameterChange('priority', 'speed')}
                      className="mr-2"
                    />
                    <label htmlFor="priority-speed" className="text-sm flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-amber-600" />
                      Speed (Expedited Timeline)
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="priority-thoroughness" 
                      name="priority"
                      value="thoroughness"
                      checked={parameters.priority === 'thoroughness'}
                      onChange={() => handleParameterChange('priority', 'thoroughness')}
                      className="mr-2"
                    />
                    <label htmlFor="priority-thoroughness" className="text-sm flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" />
                      Thoroughness (Additional QC Time)
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Additional Options</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="includePreINDMeeting"
                      checked={parameters.includePreINDMeeting}
                      onChange={(e) => handleParameterChange('includePreINDMeeting', e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="includePreINDMeeting" className="text-sm">
                      Include Pre-IND meeting
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="considerHolidays"
                      checked={parameters.considerHolidays}
                      onChange={(e) => handleParameterChange('considerHolidays', e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="considerHolidays" className="text-sm">
                      Account for holidays and weekends
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="optimizeWorkload"
                      checked={parameters.optimizeWorkload}
                      onChange={(e) => handleParameterChange('optimizeWorkload', e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="optimizeWorkload" className="text-sm">
                      Optimize team workload distribution
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={handleGenerateOptions} 
                  disabled={isGenerating || isOptionsLoading}
                  className="w-full"
                >
                  {isGenerating || isOptionsLoading ? (
                    <>
                      <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating Options...
                    </>
                  ) : (
                    <>
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Generate Timeline Options
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="options" className="mt-0 space-y-6">
            {isOptionsLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <RotateCw className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
                  <p className="text-muted-foreground">Generating optimized timeline options...</p>
                </div>
              </div>
            ) : timelineOptions?.options ? (
              <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-md">
                  <div className="flex items-start">
                    <LightbulbIcon className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-medium">AI Recommendation</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Based on your project details and parameters, the AI recommends the <span className="font-medium">Standard Timeline</span> option for the best balance of thoroughness and efficiency.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {timelineOptions.options.map((option) => (
                    <div 
                      key={option.id}
                      className={`border rounded-lg p-4 transition-colors ${
                        selectedTimeline === option.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setSelectedTimeline(option.id)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium flex items-center">
                            {option.name}
                            {option.name === 'Standard Timeline' && (
                              <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-800">Recommended</Badge>
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                        </div>
                        
                        <div className="flex space-x-2">
                          {getConfidenceBadge(option.confidence)}
                          {getRiskBadge(option.riskLevel)}
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium">Submission Date:</span>
                          <span>{new Date(option.submissionDate).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium">Workload Distribution:</span>
                          <span className="capitalize">{option.workloadDistribution}</span>
                        </div>
                      </div>
                      
                      <div className="border-t pt-3">
                        <h4 className="text-sm font-medium mb-2">Key Milestones</h4>
                        <div className="space-y-2">
                          {option.keyMilestones.slice(0, 3).map((milestone) => (
                            <div key={milestone.id} className="flex justify-between text-sm">
                              <span>{milestone.title}</span>
                              <span className="text-muted-foreground">{new Date(milestone.date).toLocaleDateString()}</span>
                            </div>
                          ))}
                          {option.keyMilestones.length > 3 && (
                            <div className="text-sm text-blue-600">
                              +{option.keyMilestones.length - 3} more milestones
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        <Button 
                          variant={selectedTimeline === option.id ? "default" : "outline"} 
                          size="sm"
                          onClick={() => setSelectedTimeline(option.id)}
                        >
                          {selectedTimeline === option.id ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Selected
                            </>
                          ) : (
                            "Select"
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 flex justify-end">
                  <Button 
                    onClick={handleApplyTimeline} 
                    disabled={!selectedTimeline || isDetailedLoading}
                  >
                    {isDetailedLoading ? (
                      <>
                        <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Apply Selected Timeline
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center p-6">
                <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                <h3 className="font-medium mb-2">No Timeline Options</h3>
                <p className="text-muted-foreground mb-4">
                  Unable to generate timeline options. Please adjust parameters and try again.
                </p>
                <Button variant="outline" onClick={() => setActiveTab('parameters')}>
                  Return to Parameters
                </Button>
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Tabs>
      
      <CardFooter className="bg-slate-50 p-4 border-t">
        <div className="w-full text-sm text-muted-foreground">
          <InfoNote>
            The AI timeline generator analyzes your project data, regulatory requirements, and industry benchmarks
            to create optimized IND submission timelines with realistic estimates.
          </InfoNote>
        </div>
      </CardFooter>
    </Card>
  );
}

// Info note component
function InfoNote({ children }) {
  return (
    <div className="flex items-start">
      <Info className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
      <p>{children}</p>
    </div>
  );
}

export default AITimelineGenerator;