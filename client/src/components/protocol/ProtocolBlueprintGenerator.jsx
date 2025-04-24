import React, { useState } from 'react';
import { useToast } from '../../hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  FileText, 
  Check, 
  Brain, 
  Sparkles, 
  ChevronRight, 
  Download, 
  Clock, 
  Zap, 
  BadgeCheck, 
  ListChecks, 
  CalendarRange, 
  Microscope,
  FlaskConical,
  ClipboardList
} from 'lucide-react';

/**
 * Protocol Blueprint Generator Component
 * 
 * Creates a first-draft protocol outline including study rationale, objectives, 
 * endpoints, design schema, schedule of assessments, and CRF maps based on
 * simple study descriptors like phase, population, and objectives.
 */
const ProtocolBlueprintGenerator = () => {
  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  const [blueprintData, setBlueprintData] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    studyTitle: '',
    phase: '',
    indication: '',
    population: '',
    primaryObjective: '',
    secondaryObjectives: '',
    treatmentDuration: '',
    controlType: '',
    estimatedSampleSize: '',
    keyEndpoints: '',
    specialConsiderations: ''
  });
  
  const { toast } = useToast();
  
  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleGenerate = () => {
    // Validate required fields
    if (!formData.studyTitle || !formData.phase || !formData.indication || !formData.primaryObjective) {
      toast({
        title: "Missing required information",
        description: "Please provide study title, phase, indication, and primary objective.",
        variant: "destructive"
      });
      return;
    }
    
    setGenerating(true);
    setGenerationProgress(0);
    
    // Simulate blueprint generation with progress updates
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 5;
      });
    }, 300);
    
    // Simulate completion after 6 seconds
    setTimeout(() => {
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      // Generate mock blueprint data
      const mockBlueprint = generateMockBlueprint(formData);
      setBlueprintData(mockBlueprint);
      
      setTimeout(() => {
        setGenerating(false);
        setGenerationComplete(true);
        
        toast({
          title: "Protocol Blueprint Generated",
          description: "Your protocol blueprint has been successfully created.",
          variant: "default"
        });
      }, 500);
    }, 6000);
  };
  
  const generateMockBlueprint = (data) => {
    // This would be replaced with actual AI generation
    return {
      studyTitle: data.studyTitle,
      protocolId: `PROT-${data.phase.replace(' ', '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      version: "1.0 (Draft)",
      generatedDate: new Date().toLocaleDateString(),
      studyRationale: `This ${data.phase} study aims to evaluate the safety${data.phase !== 'Phase I' ? ' and efficacy' : ''} of the investigational product in patients with ${data.indication}. ${data.indication} represents a significant unmet medical need, with limited treatment options currently available. This study will provide valuable insights into the ${data.phase === 'Phase I' ? 'safety profile and pharmacokinetics' : data.phase === 'Phase II' ? 'optimal dosing and preliminary efficacy' : 'efficacy and safety in a larger population'} of the investigational product.`,
      objectives: {
        primary: data.primaryObjective,
        secondary: data.secondaryObjectives.split('\n').filter(obj => obj.trim() !== '')
      },
      endpoints: {
        primary: `Change from baseline in ${data.keyEndpoints ? data.keyEndpoints.split('\n')[0] : '[Primary endpoint measure]'} at Week ${data.treatmentDuration ? data.treatmentDuration.split(' ')[0] : '12'}`,
        secondary: [
          `Proportion of subjects achieving [clinically significant improvement] at Week ${data.treatmentDuration ? data.treatmentDuration.split(' ')[0] : '12'}`,
          "Incidence of treatment-emergent adverse events (TEAEs)",
          "Change from baseline in quality of life measures"
        ]
      },
      design: {
        type: data.controlType ? (data.controlType.includes('Placebo') ? "Randomized, Double-blind, Placebo-controlled" : "Randomized, Active-controlled") : "Randomized, Double-blind",
        population: `Adult patients with ${data.indication} ${data.population ? `(${data.population})` : ''}`,
        sampleSize: data.estimatedSampleSize || "To be determined based on power calculations",
        duration: data.treatmentDuration || "12 weeks",
        arms: data.controlType ? (
          data.controlType.includes('Placebo') ? 
          ["Investigational Product", "Placebo"] : 
          ["Investigational Product", "Active Control"]
        ) : ["Investigational Product"]
      },
      visitSchedule: [
        { visit: "Screening", timepoint: "Day -28 to Day -1", procedures: ["Informed consent", "Eligibility assessment", "Medical history", "Physical examination", "Vital signs", "Clinical laboratory tests"] },
        { visit: "Baseline/Randomization", timepoint: "Day 1", procedures: ["Randomization", "Baseline assessments", "Study drug dispensation", "Dosing instructions"] },
        { visit: "Week 4", timepoint: "Day 28 ± 3 days", procedures: ["Safety assessments", "Efficacy assessments", "Compliance check", "Adverse event monitoring"] },
        { visit: "Week 8", timepoint: "Day 56 ± 3 days", procedures: ["Safety assessments", "Efficacy assessments", "Compliance check", "Adverse event monitoring"] },
        { visit: "Week 12/End of Treatment", timepoint: `Day ${12*7} ± 3 days`, procedures: ["Safety assessments", "Efficacy assessments", "Compliance check", "Adverse event monitoring", "End of treatment procedures"] },
        { visit: "Follow-up", timepoint: "14 days after last dose", procedures: ["Safety assessments", "Study completion procedures"] }
      ],
      crfSections: [
        { name: "Demographics", fields: ["Date of birth", "Sex", "Race", "Ethnicity", "Height", "Weight", "BMI"] },
        { name: "Medical History", fields: ["Relevant medical conditions", "Prior medications", "Disease history", `${data.indication} severity measures`] },
        { name: "Efficacy Assessments", fields: [data.keyEndpoints ? data.keyEndpoints.split('\n')[0] : "Primary efficacy measure", "Secondary efficacy measures", "Patient-reported outcomes"] },
        { name: "Safety Assessments", fields: ["Adverse events", "Concomitant medications", "Vital signs", "Physical examination findings", "Laboratory results"] },
        { name: "Study Drug Administration", fields: ["Dispensation records", "Compliance assessment", "Dose modifications"] }
      ],
      inclusionCriteria: [
        `Adult patients with confirmed diagnosis of ${data.indication}`,
        `Age ≥ 18 years${data.population && data.population.includes('elderly') ? ' and ≤ 80 years' : ''}`,
        "Able to provide written informed consent",
        "Willing and able to comply with study procedures",
        `${data.indication}-specific inclusion criteria`
      ],
      exclusionCriteria: [
        "History of hypersensitivity to study medication or excipients",
        "Participation in another interventional clinical trial within 30 days",
        "Pregnant or breastfeeding women",
        "Clinically significant abnormal laboratory values",
        "Clinically significant medical condition that could interfere with study participation"
      ],
      complianceScore: Math.floor(85 + Math.random() * 15)
    };
  };
  
  const handleDownload = () => {
    toast({
      title: "Downloading Protocol Blueprint",
      description: "Your protocol blueprint is being prepared for download.",
      variant: "default"
    });
    
    // Simulate download delay
    setTimeout(() => {
      toast({
        title: "Download Complete",
        description: "Protocol blueprint has been downloaded successfully.",
        variant: "default"
      });
    }, 2000);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">Protocol Blueprint Generator</CardTitle>
              <CardDescription>
                AI-powered tool to generate a comprehensive protocol outline from basic study information
              </CardDescription>
            </div>
            <div className="flex items-center">
              <Badge variant="outline" className="mr-2">
                <Sparkles className="h-3.5 w-3.5 mr-1 text-blue-500" />
                AI-Powered
              </Badge>
              <Badge variant="outline">
                <Clock className="h-3.5 w-3.5 mr-1 text-green-500" />
                ~5 min
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!generationComplete ? (
            <div className="space-y-6">
              <Tabs value={activeSection} onValueChange={setActiveSection}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Information</TabsTrigger>
                  <TabsTrigger value="design">Study Design</TabsTrigger>
                  <TabsTrigger value="endpoints">Objectives & Endpoints</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="studyTitle">Study Title <span className="text-red-500">*</span></Label>
                      <Input 
                        id="studyTitle" 
                        placeholder="Enter descriptive study title" 
                        value={formData.studyTitle}
                        onChange={(e) => handleFormChange('studyTitle', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phase">Study Phase <span className="text-red-500">*</span></Label>
                      <Select 
                        value={formData.phase}
                        onValueChange={(value) => handleFormChange('phase', value)}
                      >
                        <SelectTrigger id="phase">
                          <SelectValue placeholder="Select study phase" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Phase I">Phase I</SelectItem>
                          <SelectItem value="Phase I/II">Phase I/II</SelectItem>
                          <SelectItem value="Phase II">Phase II</SelectItem>
                          <SelectItem value="Phase II/III">Phase II/III</SelectItem>
                          <SelectItem value="Phase III">Phase III</SelectItem>
                          <SelectItem value="Phase IV">Phase IV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="indication">Therapeutic Area/Indication <span className="text-red-500">*</span></Label>
                      <Input 
                        id="indication" 
                        placeholder="e.g., Type 2 Diabetes Mellitus" 
                        value={formData.indication}
                        onChange={(e) => handleFormChange('indication', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="population">Target Population</Label>
                      <Input 
                        id="population" 
                        placeholder="e.g., Adults with moderate to severe disease" 
                        value={formData.population}
                        onChange={(e) => handleFormChange('population', e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="design" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="controlType">Control Type</Label>
                      <Select 
                        value={formData.controlType}
                        onValueChange={(value) => handleFormChange('controlType', value)}
                      >
                        <SelectTrigger id="controlType">
                          <SelectValue placeholder="Select control type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Placebo-controlled">Placebo-controlled</SelectItem>
                          <SelectItem value="Active-controlled">Active-controlled</SelectItem>
                          <SelectItem value="Non-controlled">Non-controlled</SelectItem>
                          <SelectItem value="Dose-response">Dose-response</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="treatmentDuration">Treatment Duration</Label>
                      <Input 
                        id="treatmentDuration" 
                        placeholder="e.g., 12 weeks" 
                        value={formData.treatmentDuration}
                        onChange={(e) => handleFormChange('treatmentDuration', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="estimatedSampleSize">Estimated Sample Size</Label>
                      <Input 
                        id="estimatedSampleSize" 
                        placeholder="e.g., 200 subjects" 
                        value={formData.estimatedSampleSize}
                        onChange={(e) => handleFormChange('estimatedSampleSize', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialConsiderations">Special Considerations</Label>
                      <Input 
                        id="specialConsiderations" 
                        placeholder="e.g., Adaptive design elements, special populations" 
                        value={formData.specialConsiderations}
                        onChange={(e) => handleFormChange('specialConsiderations', e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="endpoints" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryObjective">Primary Objective <span className="text-red-500">*</span></Label>
                    <Textarea 
                      id="primaryObjective" 
                      placeholder="State the primary objective of the study"
                      value={formData.primaryObjective}
                      onChange={(e) => handleFormChange('primaryObjective', e.target.value)}
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="secondaryObjectives">Secondary Objectives</Label>
                    <Textarea 
                      id="secondaryObjectives" 
                      placeholder="Enter each secondary objective on a new line"
                      value={formData.secondaryObjectives}
                      onChange={(e) => handleFormChange('secondaryObjectives', e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="keyEndpoints">Key Endpoints</Label>
                    <Textarea 
                      id="keyEndpoints" 
                      placeholder="Enter each key endpoint on a new line"
                      value={formData.keyEndpoints}
                      onChange={(e) => handleFormChange('keyEndpoints', e.target.value)}
                      rows={3}
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              {generating && (
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span>Generating Protocol Blueprint...</span>
                    <span>{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} className="h-2" />
                  <div className="text-xs text-gray-500 italic mt-1">
                    {generationProgress < 30 ? 'Analyzing study parameters...' : 
                     generationProgress < 60 ? 'Creating protocol structure and core elements...' : 
                     generationProgress < 90 ? 'Generating detailed protocol sections...' : 
                     'Finalizing protocol blueprint...'}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {blueprintData && (
                <>
                  <div className="bg-blue-50 p-4 rounded-md mb-6">
                    <div className="flex items-start">
                      <BadgeCheck className="h-5 w-5 text-blue-500 mt-1 mr-2 flex-shrink-0" />
                      <div>
                        <h3 className="text-sm font-medium text-blue-800">Protocol Blueprint Generated</h3>
                        <p className="text-sm text-blue-700 mt-1">
                          Your protocol blueprint has been successfully generated with a compliance score of {blueprintData.complianceScore}%. 
                          Review the sections below and download the complete blueprint.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Tabs defaultValue="overview" className="mt-6">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="design">Design & Population</TabsTrigger>
                      <TabsTrigger value="schedule">Visit Schedule</TabsTrigger>
                      <TabsTrigger value="crf">CRF Elements</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="mt-4 space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold">{blueprintData.studyTitle}</h3>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <Badge className="bg-blue-100 text-blue-800">Protocol ID: {blueprintData.protocolId}</Badge>
                          <Badge className="bg-gray-100 text-gray-800">Version: {blueprintData.version}</Badge>
                          <Badge className="bg-green-100 text-green-800">{blueprintData.phase}</Badge>
                          <Badge className="bg-purple-100 text-purple-800">{blueprintData.design.type}</Badge>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-md font-medium mb-2">Study Rationale</h4>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                          {blueprintData.studyRationale}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-md font-medium mb-2">Objectives</h4>
                          <div className="space-y-3">
                            <div>
                              <div className="text-sm font-medium mb-1">Primary:</div>
                              <div className="text-sm bg-gray-50 p-2 rounded-md">
                                {blueprintData.objectives.primary}
                              </div>
                            </div>
                            {blueprintData.objectives.secondary.length > 0 && (
                              <div>
                                <div className="text-sm font-medium mb-1">Secondary:</div>
                                <ul className="text-sm bg-gray-50 p-2 rounded-md list-disc list-inside space-y-1">
                                  {blueprintData.objectives.secondary.map((obj, i) => (
                                    <li key={i}>{obj}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-md font-medium mb-2">Endpoints</h4>
                          <div className="space-y-3">
                            <div>
                              <div className="text-sm font-medium mb-1">Primary:</div>
                              <div className="text-sm bg-gray-50 p-2 rounded-md">
                                {blueprintData.endpoints.primary}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium mb-1">Secondary:</div>
                              <ul className="text-sm bg-gray-50 p-2 rounded-md list-disc list-inside space-y-1">
                                {blueprintData.endpoints.secondary.map((ep, i) => (
                                  <li key={i}>{ep}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="design" className="mt-4 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-md font-medium mb-2">Study Design</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between p-2 bg-gray-50 rounded-md">
                              <span className="text-sm font-medium">Design Type:</span>
                              <span className="text-sm">{blueprintData.design.type}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-gray-50 rounded-md">
                              <span className="text-sm font-medium">Study Arms:</span>
                              <span className="text-sm">{blueprintData.design.arms.join(", ")}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-gray-50 rounded-md">
                              <span className="text-sm font-medium">Treatment Duration:</span>
                              <span className="text-sm">{blueprintData.design.duration}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-gray-50 rounded-md">
                              <span className="text-sm font-medium">Sample Size:</span>
                              <span className="text-sm">{blueprintData.design.sampleSize}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-md font-medium mb-2">Population</h4>
                          <div className="space-y-3">
                            <div>
                              <div className="text-sm font-medium mb-1">Target Population:</div>
                              <div className="text-sm bg-gray-50 p-2 rounded-md">
                                {blueprintData.design.population}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium mb-1">Key Inclusion Criteria:</div>
                              <ul className="text-sm bg-gray-50 p-2 rounded-md list-disc list-inside space-y-1">
                                {blueprintData.inclusionCriteria.slice(0, 3).map((criteria, i) => (
                                  <li key={i}>{criteria}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <div className="text-sm font-medium mb-1">Key Exclusion Criteria:</div>
                              <ul className="text-sm bg-gray-50 p-2 rounded-md list-disc list-inside space-y-1">
                                {blueprintData.exclusionCriteria.slice(0, 3).map((criteria, i) => (
                                  <li key={i}>{criteria}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="schedule" className="mt-4">
                      <h4 className="text-md font-medium mb-3">Schedule of Assessments</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visit</th>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timepoint</th>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Procedures</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {blueprintData.visitSchedule.map((visit, index) => (
                              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{visit.visit}</td>
                                <td className="px-4 py-3 text-sm text-gray-700">{visit.timepoint}</td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  <ul className="list-disc list-inside">
                                    {visit.procedures.map((procedure, i) => (
                                      <li key={i} className="text-sm">{procedure}</li>
                                    ))}
                                  </ul>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="crf" className="mt-4">
                      <h4 className="text-md font-medium mb-3">Case Report Form Sections</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {blueprintData.crfSections.map((section, index) => (
                          <div key={index} className="border rounded-md p-3">
                            <div className="flex items-center mb-2">
                              <ClipboardList className="h-4 w-4 mr-2 text-blue-500" />
                              <div className="text-sm font-medium">{section.name}</div>
                            </div>
                            <ul className="list-disc list-inside">
                              {section.fields.map((field, i) => (
                                <li key={i} className="text-sm text-gray-700">{field}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {!generationComplete ? (
            <>
              <Button variant="outline" onClick={() => setActiveSection(activeSection === 'basic' ? 'basic' : activeSection === 'design' ? 'basic' : 'design')}>
                {activeSection === 'basic' ? "Reset" : "Back"}
              </Button>
              {activeSection === 'endpoints' ? (
                <Button onClick={handleGenerate} disabled={generating}>
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Blueprint
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={() => setActiveSection(activeSection === 'basic' ? 'design' : 'endpoints')}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => {
                setGenerationComplete(false);
                setActiveSection('basic');
                setBlueprintData(null);
              }}>
                New Blueprint
              </Button>
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download Blueprint
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProtocolBlueprintGenerator;