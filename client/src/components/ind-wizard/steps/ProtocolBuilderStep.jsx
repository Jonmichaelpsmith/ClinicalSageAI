/**
 * Protocol Builder Step
 * 
 * This component provides a comprehensive interface for creating and managing
 * clinical trial protocols as part of the IND submission process.
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  AlertCircle, 
  BookOpen, 
  FileText, 
  Pencil, 
  Plus, 
  Check, 
  RotateCw, 
  Clock, 
  MessageSquare,
  Users,
  CalendarDays,
  Building,
  FileCheck,
  Coffee,
  Pill,
  Activity,
  Sparkles,
  Eye,
  Trash2,
  Copy,
  Beaker,
  Settings,
  ChevronRight,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useDatabaseStatus } from '@/components/providers/database-status-provider';
import { DatabaseAware } from '@/components/ui/database-aware';
import ErrorBoundary from '@/components/ui/error-boundary';

// Protocol editor sections
const PROTOCOL_SECTIONS = [
  {
    id: 'objectives',
    title: 'Study Objectives & Endpoints',
    description: 'Define the primary and secondary objectives and endpoints of the study',
    icon: Target,
    content: ObjectivesSection
  },
  {
    id: 'design',
    title: 'Study Design',
    description: 'Specify the design, methodology and procedures of the clinical trial',
    icon: Layout,
    content: DesignSection
  },
  {
    id: 'population',
    title: 'Study Population',
    description: 'Define the inclusion and exclusion criteria for study participants',
    icon: Users,
    content: PopulationSection
  },
  {
    id: 'scheduling',
    title: 'Scheduling and Assessments',
    description: 'Define visit schedule and assessments to be performed',
    icon: CalendarDays,
    content: SchedulingSection
  },
  {
    id: 'treatment',
    title: 'Study Treatment',
    description: 'Specify treatment details including drug information and dosing',
    icon: Pill,
    content: TreatmentSection
  },
  {
    id: 'safety',
    title: 'Safety Monitoring',
    description: 'Define safety assessments, adverse event reporting, and monitoring',
    icon: Activity,
    content: SafetySection
  },
  {
    id: 'statistics',
    title: 'Statistical Analysis',
    description: 'Specify statistical methods, sample size, and analysis populations',
    icon: BarChart,
    content: StatisticsSection
  },
  {
    id: 'appendices',
    title: 'Appendices',
    description: 'Additional information to support the protocol',
    icon: FileText,
    content: AppendicesSection
  }
];

// Protocol template options
const PROTOCOL_TEMPLATES = [
  {
    id: 'phase1-sad',
    title: 'Phase 1 - Single Ascending Dose',
    description: 'Template for first-in-human single ascending dose study',
    category: 'Phase 1'
  },
  {
    id: 'phase1-mad',
    title: 'Phase 1 - Multiple Ascending Dose',
    description: 'Template for multiple ascending dose study',
    category: 'Phase 1'
  },
  {
    id: 'phase1-food-effect',
    title: 'Phase 1 - Food Effect',
    description: 'Template for food effect bioavailability study',
    category: 'Phase 1'
  },
  {
    id: 'phase2a-poc',
    title: 'Phase 2a - Proof of Concept',
    description: 'Template for proof of concept efficacy study',
    category: 'Phase 2'
  },
  {
    id: 'phase2b-dose-finding',
    title: 'Phase 2b - Dose Finding',
    description: 'Template for dose-finding study',
    category: 'Phase 2'
  },
  {
    id: 'phase3-pivotal',
    title: 'Phase 3 - Pivotal',
    description: 'Template for pivotal efficacy study',
    category: 'Phase 3'
  }
];

// Icons for the Protocol Builder
const Target = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("lucide lucide-target", className)}
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const Layout = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("lucide lucide-layout", className)}
    {...props}
  >
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <line x1="3" x2="21" y1="9" y2="9" />
    <line x1="9" x2="9" y1="21" y2="9" />
  </svg>
);

const BarChart = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("lucide lucide-bar-chart", className)}
    {...props}
  >
    <line x1="12" x2="12" y1="20" y2="10" />
    <line x1="18" x2="18" y1="20" y2="4" />
    <line x1="6" x2="6" y1="20" y2="16" />
  </svg>
);

// Helper for class names
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Study Objectives and Endpoints Section Component
 */
function ObjectivesSection({ data, onChange, isReadOnly }) {
  const [objectives, setObjectives] = useState(data?.objectives || []);
  
  // Update parent when objectives change
  useEffect(() => {
    if (onChange) {
      onChange({ ...data, objectives });
    }
  }, [objectives, data, onChange]);
  
  // Add a new objective
  const handleAddObjective = (type) => {
    setObjectives([
      ...objectives,
      { 
        id: Date.now().toString(),
        type, 
        text: '',
        endpoints: [{ id: Date.now().toString() + '-1', text: '' }]
      }
    ]);
  };
  
  // Update objective text
  const handleObjectiveChange = (id, text) => {
    setObjectives(objectives.map(obj => {
      if (obj.id === id) {
        return { ...obj, text };
      }
      return obj;
    }));
  };
  
  // Add an endpoint to an objective
  const handleAddEndpoint = (objectiveId) => {
    setObjectives(objectives.map(obj => {
      if (obj.id === objectiveId) {
        return { 
          ...obj, 
          endpoints: [
            ...obj.endpoints, 
            { id: Date.now().toString(), text: '' }
          ]
        };
      }
      return obj;
    }));
  };
  
  // Update endpoint text
  const handleEndpointChange = (objectiveId, endpointId, text) => {
    setObjectives(objectives.map(obj => {
      if (obj.id === objectiveId) {
        return {
          ...obj,
          endpoints: obj.endpoints.map(endpoint => {
            if (endpoint.id === endpointId) {
              return { ...endpoint, text };
            }
            return endpoint;
          })
        };
      }
      return obj;
    }));
  };
  
  // Remove an objective
  const handleRemoveObjective = (id) => {
    setObjectives(objectives.filter(obj => obj.id !== id));
  };
  
  // Remove an endpoint
  const handleRemoveEndpoint = (objectiveId, endpointId) => {
    setObjectives(objectives.map(obj => {
      if (obj.id === objectiveId) {
        return {
          ...obj,
          endpoints: obj.endpoints.filter(endpoint => endpoint.id !== endpointId)
        };
      }
      return obj;
    }));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Study Objectives and Endpoints</h3>
          <p className="text-sm text-muted-foreground">
            Define the primary and secondary objectives of your study and their corresponding endpoints
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleAddObjective('primary')}
            disabled={isReadOnly}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Primary
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleAddObjective('secondary')}
            disabled={isReadOnly}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Secondary
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleAddObjective('exploratory')}
            disabled={isReadOnly}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Exploratory
          </Button>
        </div>
      </div>
      
      {objectives.length === 0 ? (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <Target className="h-8 w-8 mb-4 text-muted-foreground/60" />
            <p className="mb-4 text-muted-foreground">No objectives defined yet</p>
            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleAddObjective('primary')}
                disabled={isReadOnly}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Primary Objective
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {objectives.map((objective) => (
            <Card key={objective.id} className={
              objective.type === 'primary' 
                ? 'border-blue-200' 
                : objective.type === 'secondary' 
                  ? 'border-green-200' 
                  : 'border-purple-200'
            }>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <Badge className={
                      objective.type === 'primary' 
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' 
                        : objective.type === 'secondary' 
                          ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                          : 'bg-purple-100 text-purple-800 hover:bg-purple-100'
                    }>
                      {objective.type.charAt(0).toUpperCase() + objective.type.slice(1)}
                    </Badge>
                    <span className="text-sm text-muted-foreground ml-2">Objective</span>
                  </div>
                  
                  {!isReadOnly && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveObjective(objective.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Objective Description</Label>
                  <Textarea 
                    placeholder="Describe the objective..."
                    value={objective.text}
                    onChange={(e) => handleObjectiveChange(objective.id, e.target.value)}
                    className="min-h-24"
                    disabled={isReadOnly}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="flex items-center">
                      Associated Endpoints
                      <span className="text-xs text-muted-foreground ml-2">
                        (Measurable outcomes)
                      </span>
                    </Label>
                    
                    {!isReadOnly && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleAddEndpoint(objective.id)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Endpoint
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-3 pl-4 border-l-2 border-muted">
                    {objective.endpoints.map((endpoint, index) => (
                      <div key={endpoint.id} className="flex">
                        <div className="flex-1">
                          <Textarea 
                            placeholder={`Endpoint ${index + 1}...`}
                            value={endpoint.text}
                            onChange={(e) => handleEndpointChange(objective.id, endpoint.id, e.target.value)}
                            className="min-h-20"
                            disabled={isReadOnly}
                          />
                        </div>
                        
                        {!isReadOnly && objective.endpoints.length > 1 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRemoveEndpoint(objective.id, endpoint.id)}
                            className="ml-2 h-8 w-8 p-0 self-start mt-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center">
            <Lightbulb className="h-4 w-4 mr-2 text-amber-500" />
            Guidance
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <p>
            <strong>Primary objectives</strong> are the most important questions your study is designed to answer. 
            These typically relate to the primary efficacy or safety parameters.
          </p>
          <p>
            <strong>Secondary objectives</strong> address additional important questions but are not the main 
            focus of the study.
          </p>
          <p>
            <strong>Exploratory objectives</strong> investigate areas of interest that are not critical 
            to evaluating the primary hypothesis.
          </p>
          <p>
            <strong>Endpoints</strong> should be specific, measurable outcomes that directly relate to 
            the objectives. They should include the variable, timepoint, and how it will be analyzed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Design Section Component
 */
function DesignSection({ data, onChange, isReadOnly }) {
  const [designData, setDesignData] = useState(data || {
    studyPhase: '',
    studyType: '',
    trialDesign: '',
    randomization: false,
    blindingType: 'none',
    controlType: '',
    numberOfArms: 2,
    sampleSize: '',
    studyDuration: '',
    description: '',
    diagram: null
  });
  
  // Update parent when design data changes
  useEffect(() => {
    if (onChange) {
      onChange(designData);
    }
  }, [designData, onChange]);
  
  // Handle field changes
  const handleChange = (field, value) => {
    setDesignData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Study Design</h3>
        <p className="text-sm text-muted-foreground">
          Specify the design, methodology and procedures of the clinical trial
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Design Characteristics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studyPhase">Study Phase</Label>
              <Select 
                value={designData.studyPhase} 
                onValueChange={(value) => handleChange('studyPhase', value)}
                disabled={isReadOnly}
              >
                <SelectTrigger id="studyPhase">
                  <SelectValue placeholder="Select phase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phase1">Phase 1</SelectItem>
                  <SelectItem value="phase1b">Phase 1b</SelectItem>
                  <SelectItem value="phase2a">Phase 2a</SelectItem>
                  <SelectItem value="phase2b">Phase 2b</SelectItem>
                  <SelectItem value="phase3">Phase 3</SelectItem>
                  <SelectItem value="phase4">Phase 4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="studyType">Study Type</Label>
              <Select 
                value={designData.studyType} 
                onValueChange={(value) => handleChange('studyType', value)}
                disabled={isReadOnly}
              >
                <SelectTrigger id="studyType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interventional">Interventional</SelectItem>
                  <SelectItem value="observational">Observational</SelectItem>
                  <SelectItem value="expanded_access">Expanded Access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="trialDesign">Trial Design</Label>
              <Select 
                value={designData.trialDesign} 
                onValueChange={(value) => handleChange('trialDesign', value)}
                disabled={isReadOnly}
              >
                <SelectTrigger id="trialDesign">
                  <SelectValue placeholder="Select design" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parallel">Parallel Group</SelectItem>
                  <SelectItem value="crossover">Crossover</SelectItem>
                  <SelectItem value="factorial">Factorial</SelectItem>
                  <SelectItem value="single_arm">Single Arm</SelectItem>
                  <SelectItem value="sequential">Sequential</SelectItem>
                  <SelectItem value="adaptive">Adaptive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="numberOfArms">Number of Arms</Label>
              <Input 
                id="numberOfArms"
                type="number"
                min={1}
                max={20}
                value={designData.numberOfArms}
                onChange={(e) => handleChange('numberOfArms', parseInt(e.target.value) || 1)}
                disabled={isReadOnly || designData.trialDesign === 'single_arm'}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sampleSize">Target Sample Size</Label>
              <Input 
                id="sampleSize"
                type="number"
                min={1}
                value={designData.sampleSize}
                onChange={(e) => handleChange('sampleSize', e.target.value)}
                disabled={isReadOnly}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="studyDuration">Study Duration</Label>
              <Input 
                id="studyDuration"
                placeholder="e.g., 12 weeks"
                value={designData.studyDuration}
                onChange={(e) => handleChange('studyDuration', e.target.value)}
                disabled={isReadOnly}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Randomization and Blinding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="randomization">Randomized Study</Label>
                <p className="text-xs text-muted-foreground">
                  Participants are randomly assigned to groups
                </p>
              </div>
              <Switch 
                id="randomization"
                checked={designData.randomization}
                onCheckedChange={(value) => handleChange('randomization', value)}
                disabled={isReadOnly}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="blindingType">Blinding Type</Label>
              <Select 
                value={designData.blindingType} 
                onValueChange={(value) => handleChange('blindingType', value)}
                disabled={isReadOnly}
              >
                <SelectTrigger id="blindingType">
                  <SelectValue placeholder="Select blinding type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Open Label)</SelectItem>
                  <SelectItem value="single">Single Blind</SelectItem>
                  <SelectItem value="double">Double Blind</SelectItem>
                  <SelectItem value="triple">Triple Blind</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="controlType">Control Type</Label>
              <Select 
                value={designData.controlType} 
                onValueChange={(value) => handleChange('controlType', value)}
                disabled={isReadOnly || designData.trialDesign === 'single_arm'}
              >
                <SelectTrigger id="controlType">
                  <SelectValue placeholder="Select control type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="placebo">Placebo Control</SelectItem>
                  <SelectItem value="active">Active Control</SelectItem>
                  <SelectItem value="dose_comparison">Dose Comparison</SelectItem>
                  <SelectItem value="historical">Historical Control</SelectItem>
                  <SelectItem value="no_treatment">No Treatment Control</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="pt-4">
              <Label htmlFor="description">Design Description</Label>
              <Textarea 
                id="description"
                className="mt-2 min-h-40"
                placeholder="Provide a detailed description of the study design..."
                value={designData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                disabled={isReadOnly}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Study Design Diagram</CardTitle>
          <CardDescription>
            Upload or create a visual representation of your study design
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!designData.diagram ? (
            <div className="border border-dashed rounded-lg p-12 text-center">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground/60 mb-4" />
              <p className="text-muted-foreground mb-4">No diagram uploaded</p>
              
              {!isReadOnly && (
                <div className="flex justify-center space-x-4">
                  <Button variant="outline">
                    Upload Diagram
                  </Button>
                  <Button variant="outline">
                    Create Using Templates
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-center border rounded-lg p-4">
              <img 
                src={designData.diagram} 
                alt="Study Design Diagram" 
                className="max-h-80"
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center">
            <Lightbulb className="h-4 w-4 mr-2 text-amber-500" />
            Guidance
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <p>
            <strong>Randomization</strong> minimizes selection bias and creates comparable groups.
          </p>
          <p>
            <strong>Blinding</strong> prevents subjective bias in the study:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Single Blind: Participants don't know their assigned group</li>
            <li>Double Blind: Neither participants nor investigators know the assignments</li>
            <li>Triple Blind: Participants, investigators, and data analysts are all blinded</li>
          </ul>
          <p>
            <strong>Design description</strong> should include the progression of participants through 
            the study, including screening, randomization, treatment periods, follow-up, and 
            any washout periods.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Population Section Component
 */
function PopulationSection({ data, onChange, isReadOnly }) {
  const [populationData, setPopulationData] = useState(data || {
    inclusionCriteria: [],
    exclusionCriteria: [],
    demographics: {
      ageMin: '',
      ageMax: '',
      gender: 'both',
      specialPopulations: []
    },
    withdrawalCriteria: [],
    stratification: []
  });
  
  // Update parent when population data changes
  useEffect(() => {
    if (onChange) {
      onChange(populationData);
    }
  }, [populationData, onChange]);
  
  // Handle adding a new criterion
  const handleAddCriterion = (type) => {
    setPopulationData(prev => ({
      ...prev,
      [type]: [...prev[type], { id: Date.now().toString(), text: '' }]
    }));
  };
  
  // Handle updating a criterion
  const handleCriterionChange = (type, id, text) => {
    setPopulationData(prev => ({
      ...prev,
      [type]: prev[type].map(criterion => {
        if (criterion.id === id) {
          return { ...criterion, text };
        }
        return criterion;
      })
    }));
  };
  
  // Handle removing a criterion
  const handleRemoveCriterion = (type, id) => {
    setPopulationData(prev => ({
      ...prev,
      [type]: prev[type].filter(criterion => criterion.id !== id)
    }));
  };
  
  // Handle demographics changes
  const handleDemographicsChange = (field, value) => {
    setPopulationData(prev => ({
      ...prev,
      demographics: {
        ...prev.demographics,
        [field]: value
      }
    }));
  };
  
  // Toggle special population selection
  const handleSpecialPopulationToggle = (population) => {
    setPopulationData(prev => {
      const specialPopulations = prev.demographics.specialPopulations;
      const isSelected = specialPopulations.includes(population);
      
      return {
        ...prev,
        demographics: {
          ...prev.demographics,
          specialPopulations: isSelected
            ? specialPopulations.filter(p => p !== population)
            : [...specialPopulations, population]
        }
      };
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Study Population</h3>
        <p className="text-sm text-muted-foreground">
          Define the inclusion and exclusion criteria for study participants
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-base">Inclusion Criteria</CardTitle>
            
            {!isReadOnly && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleAddCriterion('inclusionCriteria')}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Criterion
              </Button>
            )}
          </div>
          <CardDescription>
            Participants must meet ALL of the following criteria to be eligible
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {populationData.inclusionCriteria.length === 0 ? (
            <div className="text-center p-6 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No inclusion criteria defined</p>
              <p className="text-xs mt-1">
                Add criteria that participants must meet to be included in the study
              </p>
            </div>
          ) : (
            populationData.inclusionCriteria.map((criterion, index) => (
              <div key={criterion.id} className="flex items-start gap-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center mt-1">
                  <span className="text-sm font-medium">{index + 1}</span>
                </div>
                <div className="flex-grow">
                  <Textarea 
                    value={criterion.text}
                    onChange={(e) => handleCriterionChange('inclusionCriteria', criterion.id, e.target.value)}
                    placeholder="Enter inclusion criterion..."
                    disabled={isReadOnly}
                  />
                </div>
                {!isReadOnly && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveCriterion('inclusionCriteria', criterion.id)}
                    className="flex-shrink-0 h-8 w-8 p-0 mt-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-base">Exclusion Criteria</CardTitle>
            
            {!isReadOnly && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleAddCriterion('exclusionCriteria')}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Criterion
              </Button>
            )}
          </div>
          <CardDescription>
            Participants meeting ANY of these criteria will be excluded
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {populationData.exclusionCriteria.length === 0 ? (
            <div className="text-center p-6 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No exclusion criteria defined</p>
              <p className="text-xs mt-1">
                Add criteria that would exclude participants from the study
              </p>
            </div>
          ) : (
            populationData.exclusionCriteria.map((criterion, index) => (
              <div key={criterion.id} className="flex items-start gap-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center mt-1">
                  <span className="text-sm font-medium">{index + 1}</span>
                </div>
                <div className="flex-grow">
                  <Textarea 
                    value={criterion.text}
                    onChange={(e) => handleCriterionChange('exclusionCriteria', criterion.id, e.target.value)}
                    placeholder="Enter exclusion criterion..."
                    disabled={isReadOnly}
                  />
                </div>
                {!isReadOnly && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveCriterion('exclusionCriteria', criterion.id)}
                    className="flex-shrink-0 h-8 w-8 p-0 mt-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Demographics and Special Populations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Age Range</Label>
                <div className="flex items-center space-x-2">
                  <Input 
                    type="number"
                    placeholder="Min"
                    value={populationData.demographics.ageMin}
                    onChange={(e) => handleDemographicsChange('ageMin', e.target.value)}
                    disabled={isReadOnly}
                    className="w-24"
                  />
                  <span>to</span>
                  <Input 
                    type="number"
                    placeholder="Max"
                    value={populationData.demographics.ageMax}
                    onChange={(e) => handleDemographicsChange('ageMax', e.target.value)}
                    disabled={isReadOnly}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">years</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select 
                  value={populationData.demographics.gender} 
                  onValueChange={(value) => handleDemographicsChange('gender', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender eligibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Males and Females</SelectItem>
                    <SelectItem value="male">Males Only</SelectItem>
                    <SelectItem value="female">Females Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Special Populations</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Pregnant Women',
                  'Nursing Women',
                  'Pediatric',
                  'Elderly',
                  'Renal Impairment',
                  'Hepatic Impairment'
                ].map(population => (
                  <div key={population} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`population-${population}`}
                      checked={populationData.demographics.specialPopulations.includes(population)}
                      onChange={() => handleSpecialPopulationToggle(population)}
                      disabled={isReadOnly}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label 
                      htmlFor={`population-${population}`}
                      className="text-sm"
                    >
                      {population}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-base">Withdrawal Criteria</CardTitle>
            
            {!isReadOnly && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleAddCriterion('withdrawalCriteria')}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Criterion
              </Button>
            )}
          </div>
          <CardDescription>
            Criteria for early withdrawal of participants from the study
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {populationData.withdrawalCriteria.length === 0 ? (
            <div className="text-center p-6 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No withdrawal criteria defined</p>
              <p className="text-xs mt-1">
                Define conditions under which participants should be withdrawn from the study
              </p>
            </div>
          ) : (
            populationData.withdrawalCriteria.map((criterion, index) => (
              <div key={criterion.id} className="flex items-start gap-2">
                <div className="flex-grow">
                  <Textarea 
                    value={criterion.text}
                    onChange={(e) => handleCriterionChange('withdrawalCriteria', criterion.id, e.target.value)}
                    placeholder="Enter withdrawal criterion..."
                    disabled={isReadOnly}
                  />
                </div>
                {!isReadOnly && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveCriterion('withdrawalCriteria', criterion.id)}
                    className="flex-shrink-0 h-8 w-8 p-0 mt-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Scheduling Section Component
 */
function SchedulingSection({ data, onChange, isReadOnly }) {
  // Placeholder for schedule builder implementation
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Visit Schedule and Assessments</h3>
        <p className="text-sm text-muted-foreground">
          Define study visits, procedures, and assessments to be performed
        </p>
      </div>
      
      <Card className="border-dashed border-muted/80">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <CalendarDays className="h-12 w-12 mb-4 text-muted-foreground/60" />
          <h3 className="text-lg font-medium mb-2">Schedule Builder</h3>
          <p className="mb-4 text-muted-foreground max-w-lg">
            The interactive Schedule of Activities (SoA) builder allows you to create 
            a comprehensive visit schedule with all required assessments and procedures.
          </p>
          <Button>
            Open Schedule Builder
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Treatment Section Component
 */
function TreatmentSection({ data, onChange, isReadOnly }) {
  // Placeholder for treatment section implementation
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Study Treatment</h3>
        <p className="text-sm text-muted-foreground">
          Specify details about investigational products, dosing, and administration
        </p>
      </div>
      
      <Card className="border-dashed border-muted/80">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <Pill className="h-12 w-12 mb-4 text-muted-foreground/60" />
          <h3 className="text-lg font-medium mb-2">Treatment Details</h3>
          <p className="mb-4 text-muted-foreground max-w-lg">
            Define study drugs, dosage forms, strength, dosing frequency, 
            duration of treatment, and handling procedures.
          </p>
          <Button>
            Configure Treatment Arms
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Safety Section Component
 */
function SafetySection({ data, onChange, isReadOnly }) {
  // Placeholder for safety monitoring section implementation
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Safety Monitoring</h3>
        <p className="text-sm text-muted-foreground">
          Define safety assessments, adverse event reporting, and monitoring procedures
        </p>
      </div>
      
      <Card className="border-dashed border-muted/80">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <Activity className="h-12 w-12 mb-4 text-muted-foreground/60" />
          <h3 className="text-lg font-medium mb-2">Safety Parameters Configuration</h3>
          <p className="mb-4 text-muted-foreground max-w-lg">
            Set up safety monitoring committees, define adverse event reporting 
            procedures, and establish stopping rules for the trial.
          </p>
          <Button>
            Configure Safety Parameters
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Statistics Section Component
 */
function StatisticsSection({ data, onChange, isReadOnly }) {
  // Placeholder for statistical analysis section implementation
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Statistical Analysis</h3>
        <p className="text-sm text-muted-foreground">
          Specify statistical methods, sample size calculations, and analysis populations
        </p>
      </div>
      
      <Card className="border-dashed border-muted/80">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <BarChart className="h-12 w-12 mb-4 text-muted-foreground/60" />
          <h3 className="text-lg font-medium mb-2">Statistical Methods</h3>
          <p className="mb-4 text-muted-foreground max-w-lg">
            Define hypothesis testing approaches, statistical models, sample size 
            justification, and interim analysis plans.
          </p>
          <Button>
            Configure Statistical Methods
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Appendices Section Component
 */
function AppendicesSection({ data, onChange, isReadOnly }) {
  // Placeholder for appendices section implementation
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Protocol Appendices</h3>
        <p className="text-sm text-muted-foreground">
          Additional supporting information for the protocol
        </p>
      </div>
      
      <Card className="border-dashed border-muted/80">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <FileText className="h-12 w-12 mb-4 text-muted-foreground/60" />
          <h3 className="text-lg font-medium mb-2">Protocol Appendices</h3>
          <p className="mb-4 text-muted-foreground max-w-lg">
            Add supporting documentation such as laboratory normal ranges, 
            assessment scales, drug handling procedures, and more.
          </p>
          <Button>
            Manage Appendices
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Main Protocol Builder Component
 */
export default function ProtocolBuilderStep({ projectId }) {
  const { toast } = useToast();
  const { isConnected } = useDatabaseStatus();
  const [activeSection, setActiveSection] = useState('overview');
  const [isEditMode, setIsEditMode] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  
  // Fetch protocol data
  const { 
    data: protocolData, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['protocol', projectId],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/ind/${projectId}/protocol`);
        if (!response.ok) throw new Error('Failed to fetch protocol data');
        return response.json();
      } catch (error) {
        console.error('Error fetching protocol data:', error);
        
        // Return minimal structure for new protocol
        return {
          id: null,
          title: '',
          version: '1.0',
          date: new Date().toISOString().split('T')[0],
          status: 'draft',
          sections: {}
        };
      }
    },
    enabled: !!projectId
  });
  
  // Save protocol data mutation
  const saveProtocolMutation = useMutation({
    mutationFn: async (data) => {
      const method = data.id ? 'PUT' : 'POST';
      const url = `/api/ind/${projectId}/protocol${data.id ? `/${data.id}` : ''}`;
      
      const response = await apiRequest(method, url, data);
      if (!response.ok) throw new Error('Failed to save protocol');
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Protocol Saved',
        description: 'Your changes have been saved successfully.',
        variant: 'default',
      });
      refetch();
      setIsEditMode(false);
    },
    onError: (error) => {
      toast({
        title: 'Save Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Handle section data change
  const handleSectionChange = (sectionId, sectionData) => {
    if (!protocolData) return;
    
    // Update protocol data with new section data
    const updatedProtocolData = {
      ...protocolData,
      sections: {
        ...protocolData.sections,
        [sectionId]: sectionData
      }
    };
    
    // Save automatically in edit mode after a delay
    // In a real implementation, you might want to debounce this
    if (isEditMode) {
      // saveProtocolMutation.mutate(updatedProtocolData);
      // For now, just log the updated data
      console.log('Updated protocol data:', updatedProtocolData);
    }
  };
  
  // Handle save protocol
  const handleSaveProtocol = () => {
    if (!protocolData) return;
    
    saveProtocolMutation.mutate(protocolData);
  };
  
  // Handle template selection
  const handleTemplateSelect = (templateId) => {
    // In a real implementation, fetch the template data and apply it
    toast({
      title: 'Template Applied',
      description: `Template ${templateId} has been applied to your protocol.`,
      variant: 'default',
    });
    
    setShowTemplateSelector(false);
    setIsEditMode(true);
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RotateCw className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading protocol data...</p>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <DatabaseAware
        title="Protocol Data Unavailable"
        description="Unable to load protocol data due to a database connection issue."
      >
        <div className="p-8">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-destructive mb-4" />
            <h3 className="font-semibold mb-2">Error Loading Protocol</h3>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={refetch}>Retry</Button>
          </div>
        </div>
      </DatabaseAware>
    );
  }
  
  // Template selector view
  if (showTemplateSelector) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Protocol Templates</h2>
            <p className="text-muted-foreground">Select a template to start with</p>
          </div>
          
          <Button variant="outline" onClick={() => setShowTemplateSelector(false)}>
            Cancel
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PROTOCOL_TEMPLATES.map(template => (
            <Card 
              key={template.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleTemplateSelect(template.id)}
            >
              <CardHeader>
                <Badge variant="secondary">{template.category}</Badge>
                <CardTitle className="mt-2">{template.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{template.description}</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <DatabaseAware
        title="Protocol Builder Unavailable"
        description="The protocol builder requires a database connection which is currently unavailable."
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Protocol Builder</h2>
              <p className="text-muted-foreground">
                {isEditMode ? 'Edit protocol details' : 'View and manage clinical trial protocol'}
              </p>
            </div>
            
            <div className="flex space-x-2">
              {!isEditMode ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowTemplateSelector(true)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditMode(true)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Protocol
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditMode(false)}
                  >
                    Cancel
                  </Button>
                  
                  <Button 
                    onClick={handleSaveProtocol}
                    disabled={saveProtocolMutation.isPending}
                  >
                    {saveProtocolMutation.isPending ? (
                      <>
                        <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Save Protocol
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Protocol Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Protocol Title</Label>
                    <Input 
                      id="title"
                      value={protocolData?.title || ''}
                      onChange={(e) => {
                        // In a real implementation, update the protocol data
                      }}
                      disabled={!isEditMode}
                      placeholder="Enter protocol title..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="version">Protocol Version</Label>
                    <Input 
                      id="version"
                      value={protocolData?.version || '1.0'}
                      onChange={(e) => {
                        // In a real implementation, update the protocol data
                      }}
                      disabled={!isEditMode}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Protocol Date</Label>
                    <Input 
                      id="date"
                      type="date"
                      value={protocolData?.date || new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        // In a real implementation, update the protocol data
                      }}
                      disabled={!isEditMode}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={protocolData?.status || 'draft'} 
                      onValueChange={(value) => {
                        // In a real implementation, update the protocol data
                      }}
                      disabled={!isEditMode}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="in_review">In Review</SelectItem>
                        <SelectItem value="final">Final</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="amended">Amended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Tabs value={activeSection} onValueChange={setActiveSection}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="objectives">Objectives & Endpoints</TabsTrigger>
              <TabsTrigger value="design">Study Design</TabsTrigger>
              <TabsTrigger value="population">Population</TabsTrigger>
              <TabsTrigger value="scheduling">Schedule & Assessments</TabsTrigger>
              <TabsTrigger value="treatment">Treatment</TabsTrigger>
              <TabsTrigger value="safety">Safety</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Protocol Development Overview</CardTitle>
                  <CardDescription>
                    Current protocol development status and next steps
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Section Completion Status</h3>
                        <div className="space-y-2">
                          {PROTOCOL_SECTIONS.map(section => {
                            const isCompleted = protocolData?.sections?.[section.id] ? true : false;
                            
                            return (
                              <div 
                                key={section.id} 
                                className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
                              >
                                <div className="flex items-center">
                                  <section.icon className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span className="text-sm">{section.title}</span>
                                </div>
                                <Badge 
                                  variant={isCompleted ? "default" : "outline"} 
                                  className={isCompleted ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                                >
                                  {isCompleted ? "Completed" : "Not Started"}
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Next Steps</h3>
                        <div className="space-y-2">
                          <div className="flex items-start p-3 bg-blue-50 rounded-md">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              <span className="text-sm font-medium text-blue-700">1</span>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-blue-700">Define Study Objectives</h4>
                              <p className="text-xs text-blue-700 mt-1">
                                Start by clearly defining your primary and secondary objectives
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 bg-white border-blue-200"
                                onClick={() => setActiveSection('objectives')}
                              >
                                Go to Objectives
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex items-start p-3 bg-gray-50 rounded-md">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                              <span className="text-sm font-medium text-gray-700">2</span>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-700">Design Study Methodology</h4>
                              <p className="text-xs text-gray-700 mt-1">
                                Define your study design including randomization and blinding
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start p-3 bg-gray-50 rounded-md">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                              <span className="text-sm font-medium text-gray-700">3</span>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-700">Define Study Population</h4>
                              <p className="text-xs text-gray-700 mt-1">
                                Specify inclusion and exclusion criteria for participants
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2">Resources</h3>
                        <div className="space-y-2">
                          <Button variant="link" className="h-auto p-0 flex items-center text-primary">
                            <BookOpen className="h-4 w-4 mr-2" />
                            <span className="text-sm">ICH E6(R2) Protocol Development Guide</span>
                          </Button>
                          <Button variant="link" className="h-auto p-0 flex items-center text-primary">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            <span className="text-sm">Ask AI Assistant for Help</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="objectives">
              <ObjectivesSection 
                data={protocolData?.sections?.objectives} 
                onChange={(data) => handleSectionChange('objectives', data)}
                isReadOnly={!isEditMode}
              />
            </TabsContent>
            
            <TabsContent value="design">
              <DesignSection 
                data={protocolData?.sections?.design} 
                onChange={(data) => handleSectionChange('design', data)}
                isReadOnly={!isEditMode}
              />
            </TabsContent>
            
            <TabsContent value="population">
              <PopulationSection 
                data={protocolData?.sections?.population} 
                onChange={(data) => handleSectionChange('population', data)}
                isReadOnly={!isEditMode}
              />
            </TabsContent>
            
            <TabsContent value="scheduling">
              <SchedulingSection 
                data={protocolData?.sections?.scheduling} 
                onChange={(data) => handleSectionChange('scheduling', data)}
                isReadOnly={!isEditMode}
              />
            </TabsContent>
            
            <TabsContent value="treatment">
              <TreatmentSection 
                data={protocolData?.sections?.treatment} 
                onChange={(data) => handleSectionChange('treatment', data)}
                isReadOnly={!isEditMode}
              />
            </TabsContent>
            
            <TabsContent value="safety">
              <SafetySection 
                data={protocolData?.sections?.safety} 
                onChange={(data) => handleSectionChange('safety', data)}
                isReadOnly={!isEditMode}
              />
            </TabsContent>
            
            <TabsContent value="statistics">
              <StatisticsSection 
                data={protocolData?.sections?.statistics} 
                onChange={(data) => handleSectionChange('statistics', data)}
                isReadOnly={!isEditMode}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DatabaseAware>
    </ErrorBoundary>
  );
}