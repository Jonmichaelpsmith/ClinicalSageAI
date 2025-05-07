import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, CheckCircle, Save, FileSymlink, AlignJustify, FileText, ClipboardList, Search, Database, BookOpen, AlertTriangle } from 'lucide-react';
import CerTooltipWrapper from './CerTooltipWrapper';
import NotificationBanner from './NotificationBanner';

/**
 * Clinical Evaluation Plan (CEP) Panel
 * 
 * This component allows users to define the evaluation plan for a CER, including:
 * - Scope definition
 * - Clinical questions
 * - Data sources selection
 * - GSPRs to be addressed
 * - Evaluation methods
 * 
 * The CEP is linked to the CER content, providing continuity between planning and reporting.
 */
const ClinicalEvaluationPlanPanel = ({ 
  deviceName = '',
  manufacturer = '',
  onUpdateCEP = () => {},
  initialData = null,
  cerData = null,
  gspr = [] // GSPR list for EU MDR
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('scope');
  const [showBanner, setShowBanner] = useState(false);
  const [activeSection, setActiveSection] = useState('scope-1');
  
  // CEP data state
  const [cepData, setCepData] = useState({
    // Scope section
    deviceName: deviceName || '',
    manufacturer: manufacturer || '',
    modelNumbers: '',
    deviceDescription: '',
    intendedPurpose: '',
    targetPopulation: '',
    clinicalBenefits: '',
    riskProfile: '',
    
    // Clinical Questions section
    safetyQuestions: '',
    performanceQuestions: '',
    riskBenefitQuestions: '',
    
    // Data Sources section
    useClinicalInvestigations: true,
    usePMCF: true, // Post-Market Clinical Follow-up
    useLiterature: true,
    useRegistries: false,
    useComplaints: true,
    useNonClinical: true,
    useEquivalentDevices: false,
    equivalentDeviceDetails: '',
    
    // GSPRs section
    selectedGSPRs: [],
    gspr_justifications: {},
    
    // Methods section
    literatureSearchStrategy: '',
    dataAnalysisMethods: '',
    clinicalEvaluationTeam: '',
    evaluationCriteria: ''
  });
  
  // Initialize CEP data from props if available
  useEffect(() => {
    if (initialData) {
      setCepData({
        ...cepData,
        ...initialData
      });
    }
  }, [initialData]);
  
  // Update device name and manufacturer when parent component passes new values
  useEffect(() => {
    if (deviceName && deviceName !== cepData.deviceName) {
      setCepData(prev => ({
        ...prev,
        deviceName
      }));
    }
    
    if (manufacturer && manufacturer !== cepData.manufacturer) {
      setCepData(prev => ({
        ...prev,
        manufacturer
      }));
    }
  }, [deviceName, manufacturer]);
  
  // List of standard GSPRs for EU MDR if not provided
  const defaultGSPRs = gspr.length > 0 ? gspr : [
    { id: 1, title: "Clinical performance and safety - General", description: "The device achieves the performance intended by its manufacturer and is designed and manufactured in such a way that, during normal conditions of use, it is suitable for its intended purpose." },
    { id: 2, title: "Benefit-risk ratio", description: "The benefits of the device outweigh any risks." },
    { id: 3, title: "Risk management", description: "Risk management processes have been applied throughout the device lifecycle." },
    { id: 4, title: "Clinical evaluation", description: "The clinical evaluation process addresses the clinical data needs of the device." },
    { id: 5, title: "Biocompatibility", description: "Materials used in the device are biocompatible for their intended purpose." },
    { id: 6, title: "Mechanical safety", description: "The device is designed and manufactured to ensure mechanical safety during normal use." },
    { id: 7, title: "Electrical safety", description: "The device is designed and manufactured to ensure electrical safety during normal use." },
    { id: 8, title: "Radiation protection", description: "The device is designed to reduce radiation exposure to users and patients." }
  ];
  
  // Handle input changes
  const handleInputChange = (field, value) => {
    setCepData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle checkbox changes for data sources
  const handleCheckboxChange = (field) => {
    setCepData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  // Handle GSPR selection
  const handleGSPRSelection = (gsprId) => {
    const isSelected = cepData.selectedGSPRs.includes(gsprId);
    
    if (isSelected) {
      // Remove GSPR from selection
      setCepData(prev => ({
        ...prev,
        selectedGSPRs: prev.selectedGSPRs.filter(id => id !== gsprId)
      }));
    } else {
      // Add GSPR to selection
      setCepData(prev => ({
        ...prev,
        selectedGSPRs: [...prev.selectedGSPRs, gsprId]
      }));
    }
  };
  
  // Handle GSPR justification updates
  const handleGSPRJustificationChange = (gsprId, justification) => {
    setCepData(prev => ({
      ...prev,
      gspr_justifications: {
        ...prev.gspr_justifications,
        [gsprId]: justification
      }
    }));
  };
  
  // Save CEP data
  const saveCEP = () => {
    onUpdateCEP(cepData);
    
    toast({
      title: "Clinical Evaluation Plan Saved",
      description: "Your CEP data has been updated successfully.",
    });
    
    // Show notification banner
    setShowBanner(true);
  };
  
  // Link CEP to CER content
  const linkToCER = () => {
    // Here we would call a parent function to set the CER content based on the CEP
    onUpdateCEP(cepData, true); // true flag indicates to use this data for CER
    
    toast({
      title: "CEP Linked to CER",
      description: "Your Clinical Evaluation Plan has been linked to the CER content.",
    });
  };
  
  // Helper to navigate to a specific tab and section
  const navigateToSection = (tab, section) => {
    setActiveTab(tab);
    setActiveSection(section);
  };
  
  return (
    <div className="space-y-4">
      {showBanner && (
        <NotificationBanner
          type="success"
          message="Clinical Evaluation Plan Saved"
          additionalContent="Your CEP has been saved. You can now link it to the CER content."
          action={{ label: "Link to CER", onClick: linkToCER }}
          onDismiss={() => setShowBanner(false)}
          autoDismiss={true}
        />
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <ClipboardList className="mr-2 h-5 w-5 text-blue-600" />
            <CerTooltipWrapper
              content={
                <div>
                  <p className="font-semibold mb-1">Clinical Evaluation Plan</p>
                  <p>A CEP defines the scope, methods, and requirements for a clinical evaluation of a medical device in accordance with EU MDR and MEDDEV 2.7/1 Rev 4.</p>
                  <p className="mt-1">This structured plan ensures all necessary aspects are addressed in your CER.</p>
                </div>
              }
              showIcon={true}
            >
              Clinical Evaluation Plan (CEP)
            </CerTooltipWrapper>
          </CardTitle>
          <CardDescription>
            Define your evaluation methodology, data sources, and GSPRs to address in the CER
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="scope" onClick={() => setActiveTab('scope')}>
                <AlignJustify className="h-4 w-4 mr-2" />
                Scope
              </TabsTrigger>
              <TabsTrigger value="questions" onClick={() => setActiveTab('questions')}>
                <FileText className="h-4 w-4 mr-2" />
                Clinical Questions
              </TabsTrigger>
              <TabsTrigger value="sources" onClick={() => setActiveTab('sources')}>
                <Database className="h-4 w-4 mr-2" />
                Data Sources
              </TabsTrigger>
              <TabsTrigger value="gspr" onClick={() => setActiveTab('gspr')}>
                <CheckCircle className="h-4 w-4 mr-2" />
                GSPRs
              </TabsTrigger>
              <TabsTrigger value="methods" onClick={() => setActiveTab('methods')}>
                <Search className="h-4 w-4 mr-2" />
                Methods
              </TabsTrigger>
            </TabsList>
            
            {/* Scope Tab */}
            <TabsContent value="scope" className="space-y-4">
              <Accordion
                type="single"
                collapsible
                defaultValue="scope-1"
                value={activeSection}
                onValueChange={setActiveSection}
              >
                <AccordionItem value="scope-1">
                  <AccordionTrigger>Device Information</AccordionTrigger>
                  <AccordionContent className="space-y-4 p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="deviceName">Device Name</Label>
                        <Input
                          id="deviceName"
                          value={cepData.deviceName}
                          onChange={(e) => handleInputChange('deviceName', e.target.value)}
                          placeholder="Enter device name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="manufacturer">Manufacturer</Label>
                        <Input
                          id="manufacturer"
                          value={cepData.manufacturer}
                          onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                          placeholder="Enter manufacturer name"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="modelNumbers">Model Number(s)</Label>
                      <Input
                        id="modelNumbers"
                        value={cepData.modelNumbers}
                        onChange={(e) => handleInputChange('modelNumbers', e.target.value)}
                        placeholder="Enter model numbers (comma separated)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deviceDescription">Device Description</Label>
                      <Textarea
                        id="deviceDescription"
                        value={cepData.deviceDescription}
                        onChange={(e) => handleInputChange('deviceDescription', e.target.value)}
                        placeholder="Provide a detailed description of the device"
                        rows={4}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="scope-2">
                  <AccordionTrigger>Intended Purpose</AccordionTrigger>
                  <AccordionContent className="space-y-4 p-4">
                    <div className="space-y-2">
                      <Label htmlFor="intendedPurpose">Intended Purpose</Label>
                      <Textarea
                        id="intendedPurpose"
                        value={cepData.intendedPurpose}
                        onChange={(e) => handleInputChange('intendedPurpose', e.target.value)}
                        placeholder="Describe the intended purpose of the device"
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="targetPopulation">Target Population</Label>
                      <Textarea
                        id="targetPopulation"
                        value={cepData.targetPopulation}
                        onChange={(e) => handleInputChange('targetPopulation', e.target.value)}
                        placeholder="Describe the target population for the device"
                        rows={3}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="scope-3">
                  <AccordionTrigger>Benefits and Risks</AccordionTrigger>
                  <AccordionContent className="space-y-4 p-4">
                    <div className="space-y-2">
                      <Label htmlFor="clinicalBenefits">Clinical Benefits</Label>
                      <Textarea
                        id="clinicalBenefits"
                        value={cepData.clinicalBenefits}
                        onChange={(e) => handleInputChange('clinicalBenefits', e.target.value)}
                        placeholder="List the expected clinical benefits of the device"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="riskProfile">Risk Profile</Label>
                      <Textarea
                        id="riskProfile"
                        value={cepData.riskProfile}
                        onChange={(e) => handleInputChange('riskProfile', e.target.value)}
                        placeholder="Describe the device risk profile"
                        rows={3}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>
            
            {/* Clinical Questions Tab */}
            <TabsContent value="questions" className="space-y-4">
              <div className="space-y-4 p-4 border rounded-md">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="safetyQuestions" className="font-medium">Safety Questions</Label>
                    <CerTooltipWrapper
                      content="Specific questions related to the safety of the device that should be answered in the clinical evaluation"
                    >
                      <AlertTriangle className="h-4 w-4 ml-2 text-amber-500" />
                    </CerTooltipWrapper>
                  </div>
                  <Textarea
                    id="safetyQuestions"
                    value={cepData.safetyQuestions}
                    onChange={(e) => handleInputChange('safetyQuestions', e.target.value)}
                    placeholder="List the safety questions to be addressed in the clinical evaluation"
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="performanceQuestions" className="font-medium">Performance Questions</Label>
                    <CerTooltipWrapper
                      content="Specific questions related to the performance of the device that should be answered in the clinical evaluation"
                    >
                      <AlertTriangle className="h-4 w-4 ml-2 text-amber-500" />
                    </CerTooltipWrapper>
                  </div>
                  <Textarea
                    id="performanceQuestions"
                    value={cepData.performanceQuestions}
                    onChange={(e) => handleInputChange('performanceQuestions', e.target.value)}
                    placeholder="List the performance questions to be addressed in the clinical evaluation"
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="riskBenefitQuestions" className="font-medium">Risk-Benefit Questions</Label>
                    <CerTooltipWrapper
                      content="Specific questions related to the risk-benefit profile of the device that should be answered in the clinical evaluation"
                    >
                      <AlertTriangle className="h-4 w-4 ml-2 text-amber-500" />
                    </CerTooltipWrapper>
                  </div>
                  <Textarea
                    id="riskBenefitQuestions"
                    value={cepData.riskBenefitQuestions}
                    onChange={(e) => handleInputChange('riskBenefitQuestions', e.target.value)}
                    placeholder="List the risk-benefit questions to be addressed in the clinical evaluation"
                    rows={4}
                  />
                </div>
              </div>
            </TabsContent>
            
            {/* Data Sources Tab */}
            <TabsContent value="sources" className="space-y-4">
              <div className="p-4 border rounded-md">
                <h3 className="text-lg font-medium mb-4">Data Sources Selection</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="useClinicalInvestigations"
                      checked={cepData.useClinicalInvestigations}
                      onCheckedChange={() => handleCheckboxChange('useClinicalInvestigations')}
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor="useClinicalInvestigations"
                        className="font-medium cursor-pointer"
                      >
                        Clinical Investigations
                      </Label>
                      <p className="text-sm text-gray-500">
                        Studies specifically conducted for this device
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="usePMCF"
                      checked={cepData.usePMCF}
                      onCheckedChange={() => handleCheckboxChange('usePMCF')}
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor="usePMCF"
                        className="font-medium cursor-pointer"
                      >
                        Post-Market Clinical Follow-up
                      </Label>
                      <p className="text-sm text-gray-500">
                        PMCF studies and reports
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="useLiterature"
                      checked={cepData.useLiterature}
                      onCheckedChange={() => handleCheckboxChange('useLiterature')}
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor="useLiterature"
                        className="font-medium cursor-pointer"
                      >
                        Scientific Literature
                      </Label>
                      <p className="text-sm text-gray-500">
                        Published studies and papers
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="useRegistries"
                      checked={cepData.useRegistries}
                      onCheckedChange={() => handleCheckboxChange('useRegistries')}
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor="useRegistries"
                        className="font-medium cursor-pointer"
                      >
                        Registry Data
                      </Label>
                      <p className="text-sm text-gray-500">
                        Data from device registries
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="useComplaints"
                      checked={cepData.useComplaints}
                      onCheckedChange={() => handleCheckboxChange('useComplaints')}
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor="useComplaints"
                        className="font-medium cursor-pointer"
                      >
                        Complaints & Vigilance
                      </Label>
                      <p className="text-sm text-gray-500">
                        Post-market surveillance data
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="useNonClinical"
                      checked={cepData.useNonClinical}
                      onCheckedChange={() => handleCheckboxChange('useNonClinical')}
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor="useNonClinical"
                        className="font-medium cursor-pointer"
                      >
                        Non-Clinical Studies
                      </Label>
                      <p className="text-sm text-gray-500">
                        Lab tests, bench testing, animal studies
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="useEquivalentDevices"
                      checked={cepData.useEquivalentDevices}
                      onCheckedChange={() => handleCheckboxChange('useEquivalentDevices')}
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor="useEquivalentDevices"
                        className="font-medium cursor-pointer"
                      >
                        Equivalent Device Data
                      </Label>
                      <p className="text-sm text-gray-500">
                        Clinical data from equivalent devices
                      </p>
                    </div>
                  </div>
                </div>
                
                {cepData.useEquivalentDevices && (
                  <div className="mt-4 p-4 border border-dashed rounded-md">
                    <Label htmlFor="equivalentDeviceDetails" className="font-medium">Equivalent Device Details</Label>
                    <Textarea
                      id="equivalentDeviceDetails"
                      value={cepData.equivalentDeviceDetails}
                      onChange={(e) => handleInputChange('equivalentDeviceDetails', e.target.value)}
                      placeholder="Provide details on the equivalent devices and justification for equivalence"
                      className="mt-2"
                      rows={4}
                    />
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* GSPRs Tab */}
            <TabsContent value="gspr" className="space-y-4">
              <div className="p-4 border rounded-md">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  GSPRs to Address
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Select the General Safety and Performance Requirements that will be addressed in the clinical evaluation.
                </p>
                
                <div className="space-y-4">
                  {defaultGSPRs.map((gspr) => (
                    <div key={gspr.id} className="p-3 border rounded-md hover:bg-gray-50">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id={`gspr-${gspr.id}`}
                          checked={cepData.selectedGSPRs.includes(gspr.id)}
                          onCheckedChange={() => handleGSPRSelection(gspr.id)}
                        />
                        <div className="space-y-1 w-full">
                          <Label
                            htmlFor={`gspr-${gspr.id}`}
                            className="font-medium cursor-pointer"
                          >
                            {gspr.title}
                          </Label>
                          <p className="text-sm text-gray-500">
                            {gspr.description}
                          </p>
                          
                          {cepData.selectedGSPRs.includes(gspr.id) && (
                            <div className="mt-2">
                              <Label htmlFor={`gspr-justification-${gspr.id}`} className="text-sm font-medium">
                                Justification Approach
                              </Label>
                              <Textarea
                                id={`gspr-justification-${gspr.id}`}
                                value={cepData.gspr_justifications[gspr.id] || ''}
                                onChange={(e) => handleGSPRJustificationChange(gspr.id, e.target.value)}
                                placeholder="Describe how this requirement will be addressed in the clinical evaluation"
                                className="mt-1"
                                rows={2}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            {/* Methods Tab */}
            <TabsContent value="methods" className="space-y-4">
              <div className="space-y-4 p-4 border rounded-md">
                <div className="space-y-2">
                  <Label htmlFor="literatureSearchStrategy" className="font-medium">Literature Search Strategy</Label>
                  <Textarea
                    id="literatureSearchStrategy"
                    value={cepData.literatureSearchStrategy}
                    onChange={(e) => handleInputChange('literatureSearchStrategy', e.target.value)}
                    placeholder="Describe the literature search strategy (databases, search terms, inclusion/exclusion criteria)"
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dataAnalysisMethods" className="font-medium">Data Analysis Methods</Label>
                  <Textarea
                    id="dataAnalysisMethods"
                    value={cepData.dataAnalysisMethods}
                    onChange={(e) => handleInputChange('dataAnalysisMethods', e.target.value)}
                    placeholder="Describe the methods used to analyze the clinical data"
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clinicalEvaluationTeam" className="font-medium">Clinical Evaluation Team</Label>
                  <Textarea
                    id="clinicalEvaluationTeam"
                    value={cepData.clinicalEvaluationTeam}
                    onChange={(e) => handleInputChange('clinicalEvaluationTeam', e.target.value)}
                    placeholder="List the clinical evaluation team members and their qualifications"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="evaluationCriteria" className="font-medium">Evaluation Criteria</Label>
                  <Textarea
                    id="evaluationCriteria"
                    value={cepData.evaluationCriteria}
                    onChange={(e) => handleInputChange('evaluationCriteria', e.target.value)}
                    placeholder="Define the criteria for evaluating the clinical data"
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button
              variant="outline"
              className="gap-1"
              onClick={() => {
                if (activeTab === 'scope') navigateToSection('questions', 'questions');
                else if (activeTab === 'questions') navigateToSection('sources', 'sources');
                else if (activeTab === 'sources') navigateToSection('gspr', 'gspr');
                else if (activeTab === 'gspr') navigateToSection('methods', 'methods');
              }}
            >
              Next
            </Button>
            <Button
              variant="default"
              className="gap-1"
              onClick={saveCEP}
            >
              <Save className="h-4 w-4 mr-1" />
              Save CEP
            </Button>
            <Button
              variant="secondary"
              className="gap-1"
              onClick={linkToCER}
            >
              <FileSymlink className="h-4 w-4 mr-1" />
              Link to CER
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicalEvaluationPlanPanel;