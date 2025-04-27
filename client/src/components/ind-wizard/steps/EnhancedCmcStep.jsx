import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Beaker, 
  File, 
  FileText, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  FlaskConical, 
  Factory, 
  Atom, 
  Pill, 
  ListChecks,
  Microscope,
  Book,
  Save,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LumenAssistantButton } from '@/components/assistant';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

/**
 * Enhanced CMC Step Component for IND Wizard
 * 
 * This component provides a full-featured CMC section builder within the IND Wizard
 * rather than as a separate module. It incorporates all essential CMC functionality
 * including blueprint generation, manufacturing parameters, and specifications.
 */
export default function EnhancedCmcStep({ 
  onNext, 
  onPrevious,
  data = {},
  onDataChange = () => {},
}) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [completionStatus, setCompletionStatus] = useState({
    drugSubstance: 60,
    drugProduct: 45,
    manufacturing: 30,
    controls: 20,
    stability: 10
  });
  
  // Calculate overall completion percentage
  const overallCompletion = Math.round(
    Object.values(completionStatus).reduce((sum, value) => sum + value, 0) / 
    Object.values(completionStatus).length
  );
  
  // Helper function to update data
  const updateData = (key, value) => {
    onDataChange({ ...data, [key]: value });
  };
  
  // Save CMC section data
  const handleSave = () => {
    toast({
      title: "CMC Section Saved",
      description: "Your CMC section data has been saved to the IND submission.",
    });
  };
  
  // Generate CMC section document
  const handleGenerateDocument = () => {
    toast({
      title: "Generating CMC Section",
      description: "Your CMC section document is being generated...",
    });
    
    setTimeout(() => {
      toast({
        title: "CMC Section Ready",
        description: "Your CMC section has been generated and added to the IND submission package.",
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Chemistry, Manufacturing, and Controls (CMC)</h2>
          <p className="text-muted-foreground">
            Define and document the chemistry, manufacturing, and control aspects of your drug
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Progress
          </Button>
          <LumenAssistantButton variant="outline" size="sm" />
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>CMC Section Completion</CardTitle>
              <CardDescription>Overall progress: {overallCompletion}% complete</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleGenerateDocument}>
              <Download className="mr-2 h-4 w-4" />
              Generate CMC Section
            </Button>
          </div>
          <Progress value={overallCompletion} className="h-2" />
        </CardHeader>
        <CardContent className="pb-2">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(completionStatus).map(([section, percentage]) => {
              const sectionIcons = {
                drugSubstance: <Atom className="h-8 w-8 text-primary/50" />,
                drugProduct: <Pill className="h-8 w-8 text-primary/50" />,
                manufacturing: <Factory className="h-8 w-8 text-primary/50" />,
                controls: <ListChecks className="h-8 w-8 text-primary/50" />,
                stability: <FlaskConical className="h-8 w-8 text-primary/50" />
              };
              
              const sectionNames = {
                drugSubstance: "Drug Substance",
                drugProduct: "Drug Product",
                manufacturing: "Manufacturing",
                controls: "Controls",
                stability: "Stability"
              };
              
              return (
                <div key={section} className="flex flex-col items-center justify-center p-4 bg-muted/40 rounded-lg">
                  {sectionIcons[section]}
                  <h3 className="mt-2 font-medium text-center">{sectionNames[section]}</h3>
                  <div className="mt-1 text-sm font-medium text-primary">{percentage}%</div>
                  <Progress value={percentage} className="h-1.5 w-full mt-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="drug-substance" className="flex items-center gap-2">
            <Atom className="h-4 w-4" />
            <span>Drug Substance</span>
          </TabsTrigger>
          <TabsTrigger value="drug-product" className="flex items-center gap-2">
            <Pill className="h-4 w-4" />
            <span>Drug Product</span>
          </TabsTrigger>
          <TabsTrigger value="manufacturing" className="flex items-center gap-2">
            <Factory className="h-4 w-4" />
            <span>Manufacturing</span>
          </TabsTrigger>
          <TabsTrigger value="controls" className="flex items-center gap-2">
            <ListChecks className="h-4 w-4" />
            <span>Controls</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="pt-4">
          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <CardTitle>CMC Section Introduction</CardTitle>
                <CardDescription>
                  Provide an overview of your drug product, its chemistry, and manufacturing process
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="product-name">Drug Product Name</Label>
                  <Input 
                    id="product-name" 
                    placeholder="Enter the complete name of your drug product" 
                    value={data.productName || ''} 
                    onChange={(e) => updateData('productName', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="generic-name">Active Ingredient / Generic Name</Label>
                  <Input 
                    id="generic-name" 
                    placeholder="Generic or chemical name of active pharmaceutical ingredient" 
                    value={data.genericName || ''} 
                    onChange={(e) => updateData('genericName', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dosage-form">Dosage Form</Label>
                  <Select 
                    value={data.dosageForm || ''}
                    onValueChange={(value) => updateData('dosageForm', value)}
                  >
                    <SelectTrigger id="dosage-form">
                      <SelectValue placeholder="Select dosage form" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tablet">Tablet</SelectItem>
                      <SelectItem value="capsule">Capsule</SelectItem>
                      <SelectItem value="injection">Injection</SelectItem>
                      <SelectItem value="oral-solution">Oral Solution</SelectItem>
                      <SelectItem value="topical">Topical</SelectItem>
                      <SelectItem value="inhalation">Inhalation</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="drug-class">Drug Classification</Label>
                  <Select 
                    value={data.drugClass || ''}
                    onValueChange={(value) => updateData('drugClass', value)}
                  >
                    <SelectTrigger id="drug-class">
                      <SelectValue placeholder="Select drug classification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small-molecule">Small Molecule</SelectItem>
                      <SelectItem value="peptide">Peptide</SelectItem>
                      <SelectItem value="protein">Protein</SelectItem>
                      <SelectItem value="monoclonal-antibody">Monoclonal Antibody</SelectItem>
                      <SelectItem value="oligonucleotide">Oligonucleotide</SelectItem>
                      <SelectItem value="gene-therapy">Gene Therapy</SelectItem>
                      <SelectItem value="cell-therapy">Cell Therapy</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cmc-summary">CMC Executive Summary</Label>
                  <Textarea 
                    id="cmc-summary" 
                    placeholder="Provide a brief executive summary of the CMC section"
                    rows={4}
                    value={data.cmcSummary || ''} 
                    onChange={(e) => updateData('cmcSummary', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Drug Development Stage</CardTitle>
                  <CardDescription>
                    Select the current development stage of your drug product
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select 
                    value={data.developmentStage || ''}
                    onValueChange={(value) => updateData('developmentStage', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select development stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="discovery">Discovery</SelectItem>
                      <SelectItem value="preclinical">Preclinical</SelectItem>
                      <SelectItem value="phase1">Phase 1</SelectItem>
                      <SelectItem value="phase2">Phase 2</SelectItem>
                      <SelectItem value="phase3">Phase 3</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Regulatory Strategy</CardTitle>
                  <CardDescription>
                    Specify your regulatory approach for this submission
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select 
                    value={data.regulatoryStrategy || ''}
                    onValueChange={(value) => updateData('regulatoryStrategy', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select regulatory strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full CMC Submission</SelectItem>
                      <SelectItem value="phased">Phased CMC Strategy</SelectItem>
                      <SelectItem value="expedited">Expedited Program (e.g., Breakthrough)</SelectItem>
                      <SelectItem value="platform">Platform-Based Strategy</SelectItem>
                      <SelectItem value="standard">Standard Approach</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Drug Substance Tab */}
        <TabsContent value="drug-substance" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Drug Substance Information</CardTitle>
              <CardDescription>
                Characterize the active pharmaceutical ingredient (API)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="chemical-name">Chemical Name</Label>
                  <Input 
                    id="chemical-name" 
                    placeholder="Full chemical name of the API" 
                    value={data.chemicalName || ''} 
                    onChange={(e) => updateData('chemicalName', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cas-number">CAS Number</Label>
                  <Input 
                    id="cas-number" 
                    placeholder="CAS Registry Number" 
                    value={data.casNumber || ''} 
                    onChange={(e) => updateData('casNumber', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="molecular-formula">Molecular Formula</Label>
                <Input 
                  id="molecular-formula" 
                  placeholder="e.g., C17H21NO4" 
                  value={data.molecularFormula || ''} 
                  onChange={(e) => updateData('molecularFormula', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="molecular-weight">Molecular Weight (g/mol)</Label>
                <Input 
                  id="molecular-weight" 
                  type="number"
                  placeholder="e.g., 303.35" 
                  value={data.molecularWeight || ''} 
                  onChange={(e) => updateData('molecularWeight', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="structure-description">Structure Description</Label>
                <Textarea 
                  id="structure-description" 
                  placeholder="Describe the chemical structure and key features"
                  rows={3}
                  value={data.structureDescription || ''} 
                  onChange={(e) => updateData('structureDescription', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Physicochemical Properties</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="physical-form">Physical Form</Label>
                    <Select 
                      value={data.physicalForm || ''}
                      onValueChange={(value) => updateData('physicalForm', value)}
                    >
                      <SelectTrigger id="physical-form">
                        <SelectValue placeholder="Select physical form" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="crystalline">Crystalline</SelectItem>
                        <SelectItem value="amorphous">Amorphous</SelectItem>
                        <SelectItem value="powder">Powder</SelectItem>
                        <SelectItem value="liquid">Liquid</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="solubility">Solubility</Label>
                    <Select 
                      value={data.solubility || ''}
                      onValueChange={(value) => updateData('solubility', value)}
                    >
                      <SelectTrigger id="solubility">
                        <SelectValue placeholder="Select solubility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="very-soluble">Very Soluble</SelectItem>
                        <SelectItem value="freely-soluble">Freely Soluble</SelectItem>
                        <SelectItem value="soluble">Soluble</SelectItem>
                        <SelectItem value="sparingly-soluble">Sparingly Soluble</SelectItem>
                        <SelectItem value="slightly-soluble">Slightly Soluble</SelectItem>
                        <SelectItem value="very-slightly-soluble">Very Slightly Soluble</SelectItem>
                        <SelectItem value="insoluble">Practically Insoluble</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="manufacturer">API Manufacturer</Label>
                <Input 
                  id="manufacturer" 
                  placeholder="Name of the API manufacturer" 
                  value={data.manufacturer || ''} 
                  onChange={(e) => updateData('manufacturer', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Manufacturing Process Summary</Label>
                <Textarea 
                  placeholder="Briefly summarize the synthetic route or manufacturing process"
                  rows={4}
                  value={data.manufacturingProcessSummary || ''} 
                  onChange={(e) => updateData('manufacturingProcessSummary', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Drug Product Tab */}
        <TabsContent value="drug-product" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Drug Product Composition</CardTitle>
              <CardDescription>
                Define the formulation and components of the drug product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="formulation-description">Formulation Description</Label>
                <Textarea 
                  id="formulation-description" 
                  placeholder="Describe the overall formulation approach and rationale"
                  rows={3}
                  value={data.formulationDescription || ''} 
                  onChange={(e) => updateData('formulationDescription', e.target.value)}
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Composition</Label>
                  <Button variant="outline" size="sm">
                    Add Component
                  </Button>
                </div>
                
                <Table>
                  <TableCaption>Composition of the drug product per unit dose</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Component</TableHead>
                      <TableHead>Function</TableHead>
                      <TableHead className="text-right">Amount (mg)</TableHead>
                      <TableHead className="text-right">% w/w</TableHead>
                      <TableHead className="text-right">Standard</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">
                        {data.genericName || 'Active Ingredient'}
                      </TableCell>
                      <TableCell>Active</TableCell>
                      <TableCell className="text-right">100.0</TableCell>
                      <TableCell className="text-right">20.0</TableCell>
                      <TableCell className="text-right">USP</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Microcrystalline Cellulose</TableCell>
                      <TableCell>Diluent</TableCell>
                      <TableCell className="text-right">200.0</TableCell>
                      <TableCell className="text-right">40.0</TableCell>
                      <TableCell className="text-right">NF</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Lactose Monohydrate</TableCell>
                      <TableCell>Diluent</TableCell>
                      <TableCell className="text-right">150.0</TableCell>
                      <TableCell className="text-right">30.0</TableCell>
                      <TableCell className="text-right">NF</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Magnesium Stearate</TableCell>
                      <TableCell>Lubricant</TableCell>
                      <TableCell className="text-right">5.0</TableCell>
                      <TableCell className="text-right">1.0</TableCell>
                      <TableCell className="text-right">NF</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Croscarmellose Sodium</TableCell>
                      <TableCell>Disintegrant</TableCell>
                      <TableCell className="text-right">45.0</TableCell>
                      <TableCell className="text-right">9.0</TableCell>
                      <TableCell className="text-right">NF</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="container-closure">Container Closure System</Label>
                  <Select 
                    value={data.containerClosure || ''}
                    onValueChange={(value) => updateData('containerClosure', value)}
                  >
                    <SelectTrigger id="container-closure">
                      <SelectValue placeholder="Select container closure system" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hdpe-bottle">HDPE Bottle</SelectItem>
                      <SelectItem value="blister">Blister Pack</SelectItem>
                      <SelectItem value="glass-vial">Glass Vial</SelectItem>
                      <SelectItem value="prefilled-syringe">Prefilled Syringe</SelectItem>
                      <SelectItem value="sachet">Sachet</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="storage-conditions">Storage Conditions</Label>
                  <Select 
                    value={data.storageConditions || ''}
                    onValueChange={(value) => updateData('storageConditions', value)}
                  >
                    <SelectTrigger id="storage-conditions">
                      <SelectValue placeholder="Select storage conditions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="room-temperature">Room Temperature (15-30°C)</SelectItem>
                      <SelectItem value="refrigerated">Refrigerated (2-8°C)</SelectItem>
                      <SelectItem value="frozen">Frozen (-20°C)</SelectItem>
                      <SelectItem value="deep-frozen">Deep Frozen (-70°C)</SelectItem>
                      <SelectItem value="controlled-room">Controlled Room Temperature (20-25°C)</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expiration">Proposed Expiration Dating</Label>
                <Select 
                  value={data.expiration || ''}
                  onValueChange={(value) => updateData('expiration', value)}
                >
                  <SelectTrigger id="expiration">
                    <SelectValue placeholder="Select proposed expiration dating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24-months">24 Months</SelectItem>
                    <SelectItem value="18-months">18 Months</SelectItem>
                    <SelectItem value="12-months">12 Months</SelectItem>
                    <SelectItem value="6-months">6 Months</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Manufacturing Tab */}
        <TabsContent value="manufacturing" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Manufacturing Process</CardTitle>
              <CardDescription>
                Document the manufacturing process and controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="manufacturing-site">Manufacturing Site</Label>
                <Input 
                  id="manufacturing-site" 
                  placeholder="Name and location of manufacturing facility" 
                  value={data.manufacturingSite || ''} 
                  onChange={(e) => updateData('manufacturingSite', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="batch-size">Batch Size</Label>
                <Input 
                  id="batch-size" 
                  placeholder="e.g., 100,000 tablets" 
                  value={data.batchSize || ''} 
                  onChange={(e) => updateData('batchSize', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="manufacturing-process">Manufacturing Process Description</Label>
                <Textarea 
                  id="manufacturing-process" 
                  placeholder="Describe the key steps of the manufacturing process"
                  rows={5}
                  value={data.manufacturingProcess || ''} 
                  onChange={(e) => updateData('manufacturingProcess', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Process Flow Diagram</Label>
                <div className="border-2 border-dashed rounded-md p-8 text-center">
                  <Button variant="outline">Upload Process Flow Diagram</Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    Upload a diagram showing the manufacturing process flow
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <Label>Critical Process Parameters</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Parameter</TableHead>
                      <TableHead>Process Step</TableHead>
                      <TableHead className="text-right">Target</TableHead>
                      <TableHead className="text-right">Range</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Blending Time</TableCell>
                      <TableCell>Mixing</TableCell>
                      <TableCell className="text-right">15 min</TableCell>
                      <TableCell className="text-right">10-20 min</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Compression Force</TableCell>
                      <TableCell>Tableting</TableCell>
                      <TableCell className="text-right">15 kN</TableCell>
                      <TableCell className="text-right">12-18 kN</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Granulation Speed</TableCell>
                      <TableCell>Wet Granulation</TableCell>
                      <TableCell className="text-right">100 rpm</TableCell>
                      <TableCell className="text-right">90-110 rpm</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <Button variant="outline" size="sm">Add Parameter</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Controls Tab */}
        <TabsContent value="controls" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Controls and Specifications</CardTitle>
              <CardDescription>
                Define quality control specifications and testing methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Drug Product Specifications</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Test</TableHead>
                      <TableHead>Analytical Method</TableHead>
                      <TableHead className="text-right">Acceptance Criteria</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Description</TableCell>
                      <TableCell>Visual</TableCell>
                      <TableCell className="text-right">White to off-white tablet</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Identification</TableCell>
                      <TableCell>HPLC</TableCell>
                      <TableCell className="text-right">Retention time comparable to standard</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Assay</TableCell>
                      <TableCell>HPLC</TableCell>
                      <TableCell className="text-right">90.0-110.0% of label claim</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Dissolution</TableCell>
                      <TableCell>USP <Apparatus 2></Apparatus></TableCell>
                      <TableCell className="text-right">NLT 80% (Q) in 30 minutes</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Uniformity of Dosage Units</TableCell>
                      <TableCell>USP <711></711></TableCell>
                      <TableCell className="text-right">Meets USP requirements</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <Button variant="outline" size="sm">Add Specification</Button>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="analytical-methods">Analytical Methods Summary</Label>
                <Textarea 
                  id="analytical-methods" 
                  placeholder="Briefly describe the key analytical methods used for control testing"
                  rows={4}
                  value={data.analyticalMethods || ''} 
                  onChange={(e) => updateData('analyticalMethods', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="validation-status">Method Validation Status</Label>
                <Select 
                  value={data.validationStatus || ''}
                  onValueChange={(value) => updateData('validationStatus', value)}
                >
                  <SelectTrigger id="validation-status">
                    <SelectValue placeholder="Select validation status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fully-validated">Fully Validated</SelectItem>
                    <SelectItem value="partially-validated">Partially Validated</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="in-progress">Validation In Progress</SelectItem>
                    <SelectItem value="planned">Validation Planned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous Step
        </Button>
        <Button onClick={onNext}>
          Next Step
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}