import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  RefreshCw, 
  Download, 
  FileText, 
  Beaker, 
  BarChart4, 
  MoveHorizontal, 
  Check,
  Info,
  Clipboard,
  Copy
} from 'lucide-react';
import { generateMethodValidationProtocol, simulateOpenAIResponse } from '../../services/openaiService';
import { useToast } from '@/hooks/use-toast';

/**
 * MethodValidationGenerator
 * 
 * A component that uses GPT-4o to generate comprehensive analytical method
 * validation protocols based on method information and regulatory requirements.
 */
const MethodValidationGenerator = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('input');
  const [methodType, setMethodType] = useState('HPLC');
  const [methodName, setMethodName] = useState('');
  const [methodDescription, setMethodDescription] = useState('');
  const [targetRegions, setTargetRegions] = useState(['ICH']);
  const [validationParameters, setValidationParameters] = useState({
    specificity: true,
    linearity: true,
    accuracy: true,
    precision: true,
    range: true,
    detection_limit: false,
    quantitation_limit: false,
    robustness: true,
    system_suitability: true,
    stability: false
  });
  const [methodDetails, setMethodDetails] = useState({
    category: 'assay',
    impurity_type: '',
    analyte_concentration: '',
    sample_matrix: '',
    special_considerations: ''
  });
  
  const [generatedProtocol, setGeneratedProtocol] = useState(null);
  
  // Available method types
  const methodTypes = [
    { value: 'HPLC', label: 'HPLC' },
    { value: 'GC', label: 'Gas Chromatography' },
    { value: 'UV', label: 'UV Spectroscopy' },
    { value: 'FTIR', label: 'FTIR Spectroscopy' },
    { value: 'KF', label: 'Karl Fischer Titration' },
    { value: 'Dissolution', label: 'Dissolution Testing' },
    { value: 'Atomic_Absorption', label: 'Atomic Absorption Spectroscopy' },
    { value: 'ICP_MS', label: 'ICP-MS' }
  ];
  
  // Available regions
  const regions = [
    { id: 'ICH', name: 'ICH Guidelines' },
    { id: 'FDA', name: 'FDA (US)' },
    { id: 'EMA', name: 'EMA (EU)' },
    { id: 'PMDA', name: 'PMDA (Japan)' },
    { id: 'WHO', name: 'WHO' }
  ];
  
  // Method categories
  const methodCategories = [
    { value: 'assay', label: 'Assay (Content Determination)' },
    { value: 'impurity', label: 'Impurity Testing' },
    { value: 'dissolution', label: 'Dissolution Testing' },
    { value: 'content_uniformity', label: 'Content Uniformity' },
    { value: 'identification', label: 'Identification' },
    { value: 'residual_solvents', label: 'Residual Solvents' },
    { value: 'water_content', label: 'Water Content' },
    { value: 'elemental_impurities', label: 'Elemental Impurities' }
  ];
  
  // Pre-defined templates for fast input
  const methodTemplates = {
    'HPLC-assay': {
      name: 'HPLC Assay Method for Tablet Formulation',
      description: `HPLC method for the determination of active ingredient in tablets.
      
Column: C18, 150 mm × 4.6 mm, 5 μm
Mobile Phase: Phosphate buffer pH 3.5:Acetonitrile (65:35 v/v)
Flow Rate: 1.0 mL/min
Detection: UV at 254 nm
Injection Volume: 20 μL
Run Time: 15 minutes
Sample Preparation: Extract with diluent, filter through 0.45 μm filter`,
      category: 'assay',
      impurity_type: '',
      analyte_concentration: '0.1 mg/mL',
      sample_matrix: 'Tablet formulation containing lactose, microcrystalline cellulose, magnesium stearate',
      special_considerations: ''
    },
    'HPLC-impurity': {
      name: 'HPLC Related Substances Method',
      description: `HPLC method for the determination of related substances in drug substance.
      
Column: C18, 250 mm × 4.6 mm, 5 μm
Mobile Phase: Gradient elution with buffer and acetonitrile
Flow Rate: 1.0 mL/min
Detection: UV at 220 nm
Injection Volume: 50 μL
Run Time: 60 minutes
Sample Preparation: Dissolve in diluent, filter through 0.45 μm filter`,
      category: 'impurity',
      impurity_type: 'Related substances (process impurities and degradation products)',
      analyte_concentration: '1.0 mg/mL for API, expected impurities at 0.05-0.5%',
      sample_matrix: 'API powder',
      special_considerations: 'Method must be able to separate all known process impurities and degradation products'
    },
    'GC-residual-solvents': {
      name: 'GC Residual Solvents Method',
      description: `Headspace GC method for the determination of residual solvents.
      
Column: DB-624, 30 m × 0.53 mm, 3.0 μm
Oven Program: 40°C (5 min), 10°C/min to 240°C (10 min)
Carrier Gas: Helium at 5 mL/min
Detector: FID
Injection Volume: 1 mL of headspace
Headspace Conditions: 80°C for 45 min
Sample Preparation: Dissolve in DMSO, seal in headspace vial`,
      category: 'residual_solvents',
      impurity_type: 'Class 2 and 3 residual solvents (methanol, acetone, ethyl acetate)',
      analyte_concentration: 'Solvents at 10-5000 ppm level',
      sample_matrix: 'API powder',
      special_considerations: 'Using DMF as internal standard'
    }
  };
  
  const toggleRegion = (regionId) => {
    setTargetRegions(prev => 
      prev.includes(regionId)
        ? prev.filter(r => r !== regionId)
        : [...prev, regionId]
    );
  };
  
  const handleParameterToggle = (parameter) => {
    setValidationParameters(prev => ({
      ...prev,
      [parameter]: !prev[parameter]
    }));
  };
  
  const handleMethodDetailChange = (field, value) => {
    setMethodDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleTemplateLoad = (template) => {
    const templateData = methodTemplates[template];
    if (templateData) {
      setMethodName(templateData.name);
      setMethodDescription(templateData.description);
      handleMethodDetailChange('category', templateData.category);
      handleMethodDetailChange('impurity_type', templateData.impurity_type);
      handleMethodDetailChange('analyte_concentration', templateData.analyte_concentration);
      handleMethodDetailChange('sample_matrix', templateData.sample_matrix);
      handleMethodDetailChange('special_considerations', templateData.special_considerations);
      
      toast({
        title: "Template Loaded",
        description: `${templateData.name} template loaded successfully.`
      });
    }
  };
  
  const handleGenerate = async () => {
    // Validate required fields
    if (!methodName.trim()) {
      toast({
        title: "Method Name Required",
        description: "Please enter a method name.",
        variant: "destructive"
      });
      return;
    }
    
    if (!methodDescription.trim()) {
      toast({
        title: "Method Description Required",
        description: "Please provide a method description.",
        variant: "destructive"
      });
      return;
    }
    
    if (targetRegions.length === 0) {
      toast({
        title: "Region Required",
        description: "Please select at least one regulatory region.",
        variant: "destructive"
      });
      return;
    }
    
    // Check that at least one validation parameter is selected
    const hasValidationParameters = Object.values(validationParameters).some(Boolean);
    if (!hasValidationParameters) {
      toast({
        title: "Validation Parameters Required",
        description: "Please select at least one validation parameter.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    setActiveTab('protocol');
    
    try {
      // Prepare request data
      const requestData = {
        methodType,
        methodName,
        methodDescription,
        targetRegions,
        validationParameters,
        methodDetails
      };
      
      // In a real implementation, we would call the actual API
      // For demo purposes, we're using the simulation
      // const response = await generateMethodValidationProtocol(requestData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate a realistic protocol
      const protocolData = {
        method: {
          name: methodName,
          type: methodType,
          description: methodDescription,
          category: methodDetails.category
        },
        protocol: {
          title: `Validation Protocol for ${methodName}`,
          document_id: `VAL-${methodType}-${Date.now().toString().substring(5)}`,
          version: "1.0",
          date: new Date().toISOString().split('T')[0],
          prepared_by: "AI Validation Expert",
          regulatory_basis: targetRegions.map(region => 
            regions.find(r => r.id === region)?.name || region
          ).join(", "),
          introduction: `This protocol describes the validation procedures for ${methodName}, which is a ${methodType} method used for ${methodDetails.category === 'assay' ? 'quantitative determination' : methodDetails.category.replace('_', ' ')} of the drug substance/product. The validation will be performed in accordance with ${targetRegions.join(', ')} guidelines.`,
          scope: `This validation protocol applies to the ${methodType} method for ${methodDetails.category === 'assay' ? 'the determination of drug content' : methodDetails.category.replace('_', ' ')} in ${methodDetails.sample_matrix || 'the relevant matrix'}.`,
          parameters: []
        },
        acceptance_criteria: {},
        experimental_design: {},
        calculations: {},
        reporting: {
          conclusion_criteria: "The method will be considered validated if all the acceptance criteria for the selected validation parameters are met. Any deviations must be investigated and justified.",
          documentation: "All raw data, calculations, and observations must be documented in the validation report. Chromatograms, spectra, and other primary data must be included as appendices."
        }
      };
      
      // Add parameters based on user selection
      if (validationParameters.specificity) {
        protocolData.protocol.parameters.push("Specificity");
        protocolData.acceptance_criteria.specificity = "No interference at the retention time of the analyte peak from blank, placebo, or known impurities. Peak purity index > 0.990.";
        protocolData.experimental_design.specificity = "Analyze blank, placebo, sample solution, and sample spiked with known impurities. Evaluate chromatograms for interference and perform peak purity analysis.";
        protocolData.calculations.specificity = "Qualitative assessment of chromatograms. Calculate resolution between critical pairs.";
      }
      
      if (validationParameters.linearity) {
        protocolData.protocol.parameters.push("Linearity");
        protocolData.acceptance_criteria.linearity = "Correlation coefficient (r) ≥ 0.999. Y-intercept ≤ 2.0% of the response at 100% concentration.";
        protocolData.experimental_design.linearity = "Prepare and analyze minimum of 5 standard solutions covering 50-150% of the working concentration. Plot peak area vs. concentration.";
        protocolData.calculations.linearity = "Calculate regression equation (y = mx + c), correlation coefficient, y-intercept as percent of response at 100%.";
      }
      
      if (validationParameters.accuracy) {
        protocolData.protocol.parameters.push("Accuracy");
        protocolData.acceptance_criteria.accuracy = "Recovery: 98.0-102.0% at each concentration level for assay methods; 90.0-110.0% for impurity methods.";
        protocolData.experimental_design.accuracy = "Prepare and analyze samples at 3 concentration levels (80%, 100%, 120%) in triplicate. Calculate recovery.";
        protocolData.calculations.accuracy = "Recovery (%) = (Found amount / Added amount) × 100";
      }
      
      if (validationParameters.precision) {
        protocolData.protocol.parameters.push("Precision");
        protocolData.acceptance_criteria.precision = "RSD ≤ 2.0% for repeatability. RSD ≤ 3.0% for intermediate precision.";
        protocolData.experimental_design.precision = "Repeatability: Analyze 6 replicate preparations at 100% concentration. Intermediate precision: Analyze 6 replicate preparations by different analysts on different days.";
        protocolData.calculations.precision = "Calculate mean, standard deviation, and RSD.";
      }
      
      if (validationParameters.range) {
        protocolData.protocol.parameters.push("Range");
        protocolData.acceptance_criteria.range = "The range is established when linearity, accuracy, and precision meet their respective acceptance criteria.";
        protocolData.experimental_design.range = "Use data from linearity, accuracy, and precision studies to establish the range.";
        protocolData.calculations.range = "Define lower and upper concentration limits where linearity, accuracy, and precision criteria are met.";
      }
      
      if (validationParameters.detection_limit) {
        protocolData.protocol.parameters.push("Detection Limit (LOD)");
        protocolData.acceptance_criteria.detection_limit = "Signal-to-noise ratio ≥ 3:1";
        protocolData.experimental_design.detection_limit = "Prepare solutions of decreasing concentration until S/N ratio is approximately 3:1. Alternatively, calculate based on standard deviation of response and slope.";
        protocolData.calculations.detection_limit = "LOD = 3.3 × (SD of y-intercept) / Slope";
      }
      
      if (validationParameters.quantitation_limit) {
        protocolData.protocol.parameters.push("Quantitation Limit (LOQ)");
        protocolData.acceptance_criteria.quantitation_limit = "Signal-to-noise ratio ≥ 10:1. RSD of replicate injections ≤ 10.0%.";
        protocolData.experimental_design.quantitation_limit = "Prepare solutions of decreasing concentration until S/N ratio is approximately 10:1. Analyze 6 replicate preparations at LOQ concentration.";
        protocolData.calculations.quantitation_limit = "LOQ = 10 × (SD of y-intercept) / Slope";
      }
      
      if (validationParameters.robustness) {
        protocolData.protocol.parameters.push("Robustness");
        protocolData.acceptance_criteria.robustness = "System suitability criteria must be met under all varied conditions. RSD of results under varied conditions ≤ 3.0%.";
        
        let robustnessDesign;
        if (methodType === 'HPLC') {
          robustnessDesign = "Evaluate the effect of small variations in method parameters: pH of mobile phase (±0.2 units), flow rate (±10%), column temperature (±5°C), mobile phase composition (±2% organic solvent), different column lot.";
        } else if (methodType === 'GC') {
          robustnessDesign = "Evaluate the effect of small variations in method parameters: carrier gas flow rate (±10%), oven temperature (±5°C), injection temperature (±10°C), different column lot.";
        } else {
          robustnessDesign = "Evaluate the effect of small variations in critical method parameters.";
        }
        
        protocolData.experimental_design.robustness = robustnessDesign;
        protocolData.calculations.robustness = "Calculate system suitability parameters and assay results under each varied condition. Compare with nominal conditions.";
      }
      
      if (validationParameters.system_suitability) {
        protocolData.protocol.parameters.push("System Suitability");
        
        let suitabilityCriteria;
        if (methodType === 'HPLC') {
          suitabilityCriteria = "RSD of replicate injections ≤ 2.0%, theoretical plates ≥ 2000, tailing factor ≤ 2.0, resolution between critical pair ≥ 2.0.";
        } else if (methodType === 'GC') {
          suitabilityCriteria = "RSD of replicate injections ≤ 2.0%, theoretical plates ≥ 2000, tailing factor ≤ 2.0, resolution between critical pair ≥ 1.5.";
        } else {
          suitabilityCriteria = "RSD of replicate measurements ≤ 2.0%.";
        }
        
        protocolData.acceptance_criteria.system_suitability = suitabilityCriteria;
        protocolData.experimental_design.system_suitability = "Analyze system suitability solution (standard or spiked sample) for 5-6 replicate injections. Calculate system suitability parameters.";
        protocolData.calculations.system_suitability = "Calculate RSD of peak area/height, theoretical plates, tailing factor, resolution as applicable.";
      }
      
      if (validationParameters.stability) {
        protocolData.protocol.parameters.push("Solution Stability");
        protocolData.acceptance_criteria.stability = "Standard and sample solutions stable if assay value remains within 98.0-102.0% of initial value.";
        protocolData.experimental_design.stability = "Prepare standard and sample solutions and analyze initially and at specified intervals (e.g., 6, 12, 24, 48 hours) under defined storage conditions.";
        protocolData.calculations.stability = "Percent difference from initial value = ((Final value - Initial value) / Initial value) × 100";
      }
      
      setGeneratedProtocol(protocolData);
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error.message || "An error occurred during protocol generation.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Helper to copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied",
        description: "Content copied to clipboard."
      });
    });
  };
  
  // Format protocol as text
  const formatProtocolText = () => {
    if (!generatedProtocol) return "";
    
    const { protocol, acceptance_criteria, experimental_design, calculations, reporting } = generatedProtocol;
    
    let text = `VALIDATION PROTOCOL\n\n`;
    text += `Title: ${protocol.title}\n`;
    text += `Document ID: ${protocol.document_id}\n`;
    text += `Version: ${protocol.version}\n`;
    text += `Date: ${protocol.date}\n`;
    text += `Prepared by: ${protocol.prepared_by}\n\n`;
    
    text += `1. INTRODUCTION\n${protocol.introduction}\n\n`;
    text += `2. SCOPE\n${protocol.scope}\n\n`;
    text += `3. REGULATORY BASIS\n${protocol.regulatory_basis}\n\n`;
    
    text += `4. VALIDATION PARAMETERS\n`;
    protocol.parameters.forEach((param, index) => {
      text += `\n4.${index + 1}. ${param}\n`;
      text += `Acceptance Criteria: ${acceptance_criteria[param.toLowerCase().replace(/ \(.*\)/, '').replace(/ /g, '_')] || 'To be defined'}\n`;
      text += `Experimental Design: ${experimental_design[param.toLowerCase().replace(/ \(.*\)/, '').replace(/ /g, '_')] || 'To be defined'}\n`;
      text += `Calculations: ${calculations[param.toLowerCase().replace(/ \(.*\)/, '').replace(/ /g, '_')] || 'To be defined'}\n`;
    });
    
    text += `\n5. REPORTING\n`;
    text += `Conclusion Criteria: ${reporting.conclusion_criteria}\n`;
    text += `Documentation: ${reporting.documentation}\n`;
    
    return text;
  };
  
  return (
    <Card className="w-full shadow-md border-2 border-black dark:border-white">
      <CardHeader className="bg-black text-white dark:bg-white dark:text-black">
        <CardTitle className="text-xl flex items-center gap-2">
          <Beaker className="h-5 w-5" />
          Method Validation Protocol Generator (GPT-4o Powered)
        </CardTitle>
        <CardDescription className="text-gray-300 dark:text-gray-700">
          Generate comprehensive method validation protocols according to global regulatory requirements
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full rounded-none">
            <TabsTrigger value="input" className="flex-1">Method Input</TabsTrigger>
            <TabsTrigger value="protocol" className="flex-1" disabled={!generatedProtocol && !loading}>Protocol</TabsTrigger>
          </TabsList>
          
          <TabsContent value="input" className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="method-type">Method Type</Label>
              <Select value={methodType} onValueChange={setMethodType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {methodTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => handleTemplateLoad(`${methodType}-assay`)}
              >
                Load Assay Template
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => handleTemplateLoad(`${methodType}-impurity`)}
              >
                Load Impurity Template
              </Button>
              {methodType === 'GC' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => handleTemplateLoad('GC-residual-solvents')}
                >
                  Load Residual Solvents Template
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="method-name">Method Name</Label>
              <Input
                id="method-name"
                placeholder="Enter method name"
                value={methodName}
                onChange={(e) => setMethodName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="method-description">Method Description</Label>
              <Textarea
                id="method-description"
                placeholder="Enter detailed method description including conditions, parameters, etc."
                className="h-32"
                value={methodDescription}
                onChange={(e) => setMethodDescription(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="method-category">Method Category</Label>
              <Select 
                value={methodDetails.category} 
                onValueChange={(value) => handleMethodDetailChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {methodCategories.map(category => (
                    <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {methodDetails.category === 'impurity' && (
              <div className="space-y-2">
                <Label htmlFor="impurity-type">Impurity Type</Label>
                <Input
                  id="impurity-type"
                  placeholder="e.g., Related substances, degradation products"
                  value={methodDetails.impurity_type}
                  onChange={(e) => handleMethodDetailChange('impurity_type', e.target.value)}
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="analyte-concentration">Analyte Concentration</Label>
                <Input
                  id="analyte-concentration"
                  placeholder="e.g., 0.5 mg/mL"
                  value={methodDetails.analyte_concentration}
                  onChange={(e) => handleMethodDetailChange('analyte_concentration', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sample-matrix">Sample Matrix</Label>
                <Input
                  id="sample-matrix"
                  placeholder="e.g., Tablet formulation, API powder"
                  value={methodDetails.sample_matrix}
                  onChange={(e) => handleMethodDetailChange('sample_matrix', e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="regions">Target Regulatory Regions</Label>
                <span className="text-xs text-gray-500 dark:text-gray-400">Select all that apply</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {regions.map(region => (
                  <Badge
                    key={region.id}
                    variant="outline"
                    className={`cursor-pointer ${
                      targetRegions.includes(region.id) 
                        ? 'bg-indigo-100 dark:bg-indigo-900 border-indigo-300 dark:border-indigo-700 text-indigo-800 dark:text-indigo-200' 
                        : ''
                    }`}
                    onClick={() => toggleRegion(region.id)}
                  >
                    {targetRegions.includes(region.id) && (
                      <Check className="mr-1 h-3 w-3" />
                    )}
                    {region.name}
                  </Badge>
                ))}
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="validation-parameters" className="text-base font-medium">Validation Parameters</Label>
                <span className="text-xs text-gray-500 dark:text-gray-400">Select all parameters to include</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
                {Object.entries(validationParameters).map(([param, checked]) => (
                  <div key={param} className="flex items-center space-x-2">
                    <Checkbox 
                      id={param} 
                      checked={checked}
                      onCheckedChange={() => handleParameterToggle(param)}
                    />
                    <label
                      htmlFor={param}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {param.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="special-considerations">Special Considerations (Optional)</Label>
              <Textarea
                id="special-considerations"
                placeholder="Enter any special considerations for the validation"
                className="h-16"
                value={methodDetails.special_considerations}
                onChange={(e) => handleMethodDetailChange('special_considerations', e.target.value)}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="protocol" className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <RefreshCw className="h-10 w-10 text-indigo-600 animate-spin" />
                <div className="text-center">
                  <p className="font-medium">Generating Protocol with GPT-4o...</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Creating validation parameters based on {methodType} method type and {targetRegions.join(', ')} requirements
                  </p>
                </div>
              </div>
            ) : generatedProtocol ? (
              <div className="p-4">
                <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-md mb-4 text-black dark:text-white">
                  <h3 className="font-semibold text-lg">{generatedProtocol.protocol.title}</h3>
                  <div className="flex flex-col sm:flex-row sm:justify-between mt-2 text-sm">
                    <div>
                      <p><span className="font-medium">Document ID:</span> {generatedProtocol.protocol.document_id}</p>
                      <p><span className="font-medium">Version:</span> {generatedProtocol.protocol.version}</p>
                    </div>
                    <div>
                      <p><span className="font-medium">Date:</span> {generatedProtocol.protocol.date}</p>
                      <p><span className="font-medium">Prepared by:</span> {generatedProtocol.protocol.prepared_by}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-800 rounded-md mb-4 overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 font-medium text-black dark:text-white">
                    Introduction
                  </div>
                  <div className="p-3 text-sm text-gray-700 dark:text-gray-300">
                    {generatedProtocol.protocol.introduction}
                  </div>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-800 rounded-md mb-4 overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 font-medium text-black dark:text-white">
                    Scope
                  </div>
                  <div className="p-3 text-sm text-gray-700 dark:text-gray-300">
                    {generatedProtocol.protocol.scope}
                  </div>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-800 rounded-md mb-4 overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 font-medium text-black dark:text-white">
                    Regulatory Basis
                  </div>
                  <div className="p-3 text-sm text-gray-700 dark:text-gray-300">
                    {generatedProtocol.protocol.regulatory_basis}
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="font-semibold mb-3 text-black dark:text-white">Validation Parameters</h3>
                  <div className="space-y-4">
                    {generatedProtocol.protocol.parameters.map((param, index) => {
                      const paramKey = param.toLowerCase().replace(/ \(.*\)/, '').replace(/ /g, '_');
                      return (
                        <div key={index} className="border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 font-medium text-black dark:text-white">
                            {param}
                          </div>
                          <div className="p-3 space-y-3">
                            <div>
                              <h4 className="text-sm font-medium mb-1 text-black dark:text-white">Acceptance Criteria:</h4>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {generatedProtocol.acceptance_criteria[paramKey]}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium mb-1 text-black dark:text-white">Experimental Design:</h4>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {generatedProtocol.experimental_design[paramKey]}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium mb-1 text-black dark:text-white">Calculations:</h4>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {generatedProtocol.calculations[paramKey]}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 font-medium text-black dark:text-white">
                    Reporting
                  </div>
                  <div className="p-3 space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-1 text-black dark:text-white">Conclusion Criteria:</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {generatedProtocol.reporting.conclusion_criteria}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1 text-black dark:text-white">Documentation:</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {generatedProtocol.reporting.documentation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Enter method details and click "Generate Protocol" to see results.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between p-4 border-t border-gray-200 dark:border-gray-800">
        {activeTab === 'input' ? (
          <>
            <Button variant="outline" onClick={() => setMethodDescription('')}>
              Clear Description
            </Button>
            <Button
              disabled={loading}
              onClick={handleGenerate}
              className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Beaker className="mr-2 h-4 w-4" />
                  Generate Protocol
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={() => setActiveTab('input')}>
              Back to Input
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => copyToClipboard(formatProtocolText())}>
                <Clipboard className="mr-2 h-4 w-4" />
                Copy as Text
              </Button>
              <Button className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                <FileText className="mr-2 h-4 w-4" />
                Export as PDF
              </Button>
            </div>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default MethodValidationGenerator;
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { useToast } from '../../hooks/use-toast';
import { 
  FileText, 
  Beaker, 
  Microscope, 
  PenTool, 
  ChevronRight, 
  BarChart,
  FilePlus,
  Loader2
} from 'lucide-react';

export default function MethodValidationGenerator() {
  const [activeTab, setActiveTab] = useState('parameters');
  const [loading, setLoading] = useState(false);
  const [methodData, setMethodData] = useState({
    methodName: '',
    methodType: 'HPLC',
    methodPurpose: '',
    parameters: {
      specificity: true,
      accuracy: true,
      precision: true,
      linearity: true,
      range: true,
      robustness: false,
      solutionStability: false,
      detectionLimit: false,
      quantitationLimit: false
    },
    specificDetails: {
      analyteConcentration: '',
      matrix: '',
      equipmentDetails: '',
      columnSpecifications: '',
      mobilePhase: '',
      flowRate: '',
      injectionVolume: '',
      runTime: '',
      detectionWavelength: ''
    }
  });
  
  const { toast } = useToast();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setMethodData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleParameterChange = (parameter) => {
    setMethodData(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [parameter]: !prev.parameters[parameter]
      }
    }));
  };
  
  const handleDetailsChange = (e) => {
    const { name, value } = e.target;
    setMethodData(prev => ({
      ...prev,
      specificDetails: {
        ...prev.specificDetails,
        [name]: value
      }
    }));
  };
  
  const handleSelectChange = (name, value) => {
    setMethodData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleGenerateProtocol = () => {
    if (!methodData.methodName) {
      toast({
        title: "Method name required",
        description: "Please enter a name for your analytical method",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    // Simulate API call for method protocol generation
    setTimeout(() => {
      setLoading(false);
      setActiveTab('preview');
      
      toast({
        title: "Method validation protocol generated",
        description: `Protocol for ${methodData.methodName} has been created successfully`
      });
    }, 2000);
  };
  
  const methodTypes = [
    { value: 'HPLC', label: 'HPLC (High Performance Liquid Chromatography)' },
    { value: 'GC', label: 'GC (Gas Chromatography)' },
    { value: 'UV', label: 'UV Spectroscopy' },
    { value: 'FTIR', label: 'FTIR (Fourier Transform Infrared Spectroscopy)' },
    { value: 'NMR', label: 'NMR (Nuclear Magnetic Resonance)' },
    { value: 'MS', label: 'MS (Mass Spectrometry)' },
    { value: 'ICP', label: 'ICP (Inductively Coupled Plasma)' },
    { value: 'Dissolution', label: 'Dissolution Testing' },
    { value: 'KF', label: 'Karl Fischer Titration' },
    { value: 'DSC', label: 'DSC (Differential Scanning Calorimetry)' }
  ];
  
  const validationParameters = [
    { id: 'specificity', name: 'Specificity', description: 'Ability to assess unequivocally the analyte in the presence of components' },
    { id: 'accuracy', name: 'Accuracy', description: 'Closeness of test results to the true value' },
    { id: 'precision', name: 'Precision', description: 'Closeness of agreement between repeated measurements' },
    { id: 'linearity', name: 'Linearity', description: 'Ability to obtain results directly proportional to analyte concentration' },
    { id: 'range', name: 'Range', description: 'Interval between upper and lower concentration with suitable precision, accuracy and linearity' },
    { id: 'robustness', name: 'Robustness', description: 'Capacity to remain unaffected by small variations in method parameters' },
    { id: 'solutionStability', name: 'Solution Stability', description: 'Stability of the analyte in solution over time' },
    { id: 'detectionLimit', name: 'Detection Limit (LOD)', description: 'Lowest amount of analyte that can be detected' },
    { id: 'quantitationLimit', name: 'Quantitation Limit (LOQ)', description: 'Lowest amount of analyte that can be quantitatively determined' }
  ];
  
  // Sample protocol preview content
  const protocolContent = `
ANALYTICAL METHOD VALIDATION PROTOCOL

1. PURPOSE
   This protocol establishes the validation procedure for ${methodData.methodName} by ${methodData.methodType} according to ICH Q2(R1) guidelines.

2. SCOPE
   This validation includes ${Object.entries(methodData.parameters)
     .filter(([_, included]) => included)
     .map(([param]) => param)
     .join(', ')}.

3. RESPONSIBILITIES
   - Quality Control: Execution of validation experiments
   - Quality Assurance: Review of validation results
   - Regulatory Affairs: Compliance assessment

4. METHOD DESCRIPTION
   ${methodData.methodPurpose || 'Quantitative determination of active pharmaceutical ingredient.'}

5. MATERIALS AND EQUIPMENT
   5.1 Equipment
   - ${methodData.methodType} system
   ${methodData.specificDetails.equipmentDetails ? `- ${methodData.specificDetails.equipmentDetails}` : ''}

   5.2 Materials
   - Reference Standard
   - Sample matrix
   ${methodData.specificDetails.matrix ? `- ${methodData.specificDetails.matrix}` : ''}

6. PROCEDURE
   ${methodData.methodType === 'HPLC' ? `
   6.1 Chromatographic Conditions
   - Column: ${methodData.specificDetails.columnSpecifications || 'As specified in the method'}
   - Mobile Phase: ${methodData.specificDetails.mobilePhase || 'As specified in the method'}
   - Flow Rate: ${methodData.specificDetails.flowRate || 'As specified in the method'}
   - Injection Volume: ${methodData.specificDetails.injectionVolume || 'As specified in the method'}
   - Run Time: ${methodData.specificDetails.runTime || 'As specified in the method'}
   - Detection: ${methodData.specificDetails.detectionWavelength || 'As specified in the method'}
   ` : ''}

7. VALIDATION PARAMETERS
   ${methodData.parameters.specificity ? `
   7.1 Specificity
   - Analyze blank, placebo, sample solution, and reference solution
   - Criteria: No interference from blank or placebo at the retention time of the analyte
   ` : ''}

   ${methodData.parameters.accuracy ? `
   7.2 Accuracy
   - Prepare and analyze samples at 3 concentration levels (80%, 100%, 120%)
   - Minimum 3 replicates per level
   - Criteria: Recovery 98.0-102.0%
   ` : ''}

   ${methodData.parameters.precision ? `
   7.3 Precision
   7.3.1 Repeatability
   - 6 determinations at 100% of test concentration
   - Criteria: RSD ≤ 2.0%

   7.3.2 Intermediate Precision
   - Different analyst, different day
   - 6 determinations at 100% of test concentration
   - Criteria: RSD ≤ 3.0%
   ` : ''}

   ${methodData.parameters.linearity ? `
   7.4 Linearity
   - Minimum 5 concentration levels (50%, 75%, 100%, 125%, 150%)
   - Criteria: Correlation coefficient (r) ≥ 0.999
   ` : ''}

   ${methodData.parameters.range ? `
   7.5 Range
   - Defined as the interval from 80% to 120% of the test concentration
   - Criteria: Acceptable accuracy, precision, and linearity within this range
   ` : ''}

8. DOCUMENTATION
   - Raw data from all experiments
   - Calculation spreadsheets
   - Chromatograms/spectra
   - Validation report

9. ACCEPTANCE CRITERIA
   All validation parameters must meet their respective acceptance criteria as defined in ICH Q2(R1) guidelines.

10. DEVIATIONS
    Any deviations from this protocol must be documented, justified, and approved.

11. APPROVALS
    Prepared by: [Name, Date]
    Reviewed by: [Name, Date]
    Approved by: [Name, Date]
  `;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Analytical Method Validation Generator</CardTitle>
        <CardDescription>
          Create ICH-compliant validation protocols for analytical methods
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="parameters">Method Parameters</TabsTrigger>
            <TabsTrigger value="validation">Validation Settings</TabsTrigger>
            <TabsTrigger value="preview">Protocol Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="parameters" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="methodName">Method Name</Label>
              <Input 
                id="methodName"
                name="methodName"
                placeholder="Enter method name"
                value={methodData.methodName}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="methodType">Method Type</Label>
              <Select 
                value={methodData.methodType} 
                onValueChange={(value) => handleSelectChange('methodType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method type" />
                </SelectTrigger>
                <SelectContent>
                  {methodTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="methodPurpose">Method Purpose</Label>
              <Textarea 
                id="methodPurpose"
                name="methodPurpose"
                placeholder="Describe the purpose of this analytical method"
                value={methodData.methodPurpose}
                onChange={handleChange}
                rows={3}
              />
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium mb-2">Method-Specific Parameters</h3>
              
              {methodData.methodType === 'HPLC' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="analyteConcentration">Analyte Concentration</Label>
                      <Input 
                        id="analyteConcentration"
                        name="analyteConcentration"
                        placeholder="e.g., 0.1 mg/mL"
                        value={methodData.specificDetails.analyteConcentration}
                        onChange={handleDetailsChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="matrix">Sample Matrix</Label>
                      <Input 
                        id="matrix"
                        name="matrix"
                        placeholder="e.g., Buffer solution"
                        value={methodData.specificDetails.matrix}
                        onChange={handleDetailsChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="columnSpecifications">Column Specifications</Label>
                    <Input 
                      id="columnSpecifications"
                      name="columnSpecifications"
                      placeholder="e.g., C18, 150 × 4.6 mm, 5 μm"
                      value={methodData.specificDetails.columnSpecifications}
                      onChange={handleDetailsChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mobilePhase">Mobile Phase</Label>
                    <Input 
                      id="mobilePhase"
                      name="mobilePhase"
                      placeholder="e.g., Acetonitrile:Water (70:30 v/v)"
                      value={methodData.specificDetails.mobilePhase}
                      onChange={handleDetailsChange}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="flowRate">Flow Rate</Label>
                      <Input 
                        id="flowRate"
                        name="flowRate"
                        placeholder="e.g., 1.0 mL/min"
                        value={methodData.specificDetails.flowRate}
                        onChange={handleDetailsChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="injectionVolume">Injection Volume</Label>
                      <Input 
                        id="injectionVolume"
                        name="injectionVolume"
                        placeholder="e.g., 20 μL"
                        value={methodData.specificDetails.injectionVolume}
                        onChange={handleDetailsChange}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="runTime">Run Time</Label>
                      <Input 
                        id="runTime"
                        name="runTime"
                        placeholder="e.g., 15 min"
                        value={methodData.specificDetails.runTime}
                        onChange={handleDetailsChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="detectionWavelength">Detection Wavelength</Label>
                      <Input 
                        id="detectionWavelength"
                        name="detectionWavelength"
                        placeholder="e.g., 254 nm"
                        value={methodData.specificDetails.detectionWavelength}
                        onChange={handleDetailsChange}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Add similar sections for other method types like GC, UV, etc. with relevant fields */}
              
              <div className="space-y-2 mt-4">
                <Label htmlFor="equipmentDetails">Equipment Details</Label>
                <Input 
                  id="equipmentDetails"
                  name="equipmentDetails"
                  placeholder="Enter specific equipment model/details"
                  value={methodData.specificDetails.equipmentDetails}
                  onChange={handleDetailsChange}
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button onClick={() => setActiveTab('validation')}>
                Next: Validation Settings
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="validation" className="space-y-4 pt-4">
            <h3 className="text-sm font-medium mb-4">Select Validation Parameters (ICH Q2(R1))</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {validationParameters.map(param => (
                <div key={param.id} className="flex items-start space-x-2">
                  <Checkbox 
                    id={param.id}
                    checked={methodData.parameters[param.id]}
                    onCheckedChange={() => handleParameterChange(param.id)}
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <Label 
                      htmlFor={param.id} 
                      className="font-medium cursor-pointer"
                    >
                      {param.name}
                    </Label>
                    <p className="text-xs text-muted-foreground">{param.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start gap-3">
              <div className="flex-shrink-0">
                <BarChart className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h4 className="font-medium text-blue-800">Statistical Analysis Tools</h4>
                <p className="text-sm text-blue-700">
                  The protocol will include statistical evaluation methods appropriate for your selected validation parameters.
                </p>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setActiveTab('parameters')}>
                Back to Method Parameters
              </Button>
              <Button onClick={handleGenerateProtocol} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Beaker className="mr-2 h-4 w-4" />
                    Generate Protocol
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="pt-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="font-medium">{methodData.methodName || 'Analytical Method'} Validation Protocol</h3>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <PenTool className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <FilePlus className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            
            <div className="bg-muted rounded-md p-4 font-mono text-sm whitespace-pre-wrap overflow-auto max-h-[500px]">
              {protocolContent}
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-muted-foreground flex items-center">
                <Microscope className="h-4 w-4 mr-1" />
                <span>Protocol ready for implementation</span>
              </div>
              <Button>Save and Export</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
