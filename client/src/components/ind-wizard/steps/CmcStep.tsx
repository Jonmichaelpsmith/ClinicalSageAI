import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, Clipboard, AlertCircle, CheckCircle, ChevronRight,
  AlertTriangle, CircleDashed, FilePlus, TestTube, ShieldAlert
} from 'lucide-react';

interface CmcStepProps {
  projectId: string;
  onComplete?: () => void;
  onPrevious?: () => void;
}

export default function CmcStep({ projectId, onComplete, onPrevious }: CmcStepProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [cmcData, setCmcData] = useState<any>({});
  
  // In a real implementation, we would fetch the CMC data using the projectId
  // For now, we'll use a placeholder
  const cmc = cmcData || {};

  // Add navigation buttons to bottom of step
  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (onPrevious) {
      onPrevious();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <TestTube className="mr-2 h-5 w-5" />
                Chemistry, Manufacturing & Controls (CMC)
              </CardTitle>
              <CardDescription>
                Document critical information about the drug substance and product manufacturing
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" className="flex items-center">
                <FilePlus className="mr-2 h-4 w-4" />
                Import CMC Data
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="drug-substance">Drug Substance</TabsTrigger>
              <TabsTrigger value="drug-product">Drug Product</TabsTrigger>
              <TabsTrigger value="facilities">Facilities</TabsTrigger>
              <TabsTrigger value="manufacturing">Manufacturing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">CMC Requirements Overview</CardTitle>
                  <CardDescription>
                    FDA requirements for Chemistry, Manufacturing, and Controls data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-md p-4 bg-slate-50">
                      <h3 className="text-base font-medium flex items-center mb-2">
                        <TestTube className="mr-2 h-4 w-4" />
                        Drug Substance Information
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                          <span>Nomenclature, structure, and properties</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                          <span>Manufacturing and control processes</span>
                        </li>
                        <li className="flex items-start">
                          <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 mt-0.5" />
                          <span>Reference standards and controls</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="border rounded-md p-4 bg-slate-50">
                      <h3 className="text-base font-medium flex items-center mb-2">
                        <ShieldAlert className="mr-2 h-4 w-4" />
                        Drug Product Requirements
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                          <span>Composition, formulation, and specifications</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                          <span>Manufacturing process and controls</span>
                        </li>
                        <li className="flex items-start">
                          <CircleDashed className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                          <span>Container closure system</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-base font-medium mb-2">Required Documentation</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <Button variant="outline" className="justify-start text-left">
                        <FileText className="h-4 w-4 mr-2" />
                        Drug Master File (DMF)
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      </Button>
                      <Button variant="outline" className="justify-start text-left">
                        <FileText className="h-4 w-4 mr-2" />
                        Stability Data
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      </Button>
                      <Button variant="outline" className="justify-start text-left">
                        <FileText className="h-4 w-4 mr-2" />
                        Methods Validation
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">CMC Completion Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 border rounded">
                      <div className="flex items-center">
                        <TestTube className="h-4 w-4 mr-2" />
                        <span>Drug Substance Characterization</span>
                      </div>
                      <span className="flex items-center text-green-600 font-medium">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-2 border rounded">
                      <div className="flex items-center">
                        <ShieldAlert className="h-4 w-4 mr-2" />
                        <span>Drug Product Formulation</span>
                      </div>
                      <span className="flex items-center text-green-600 font-medium">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-2 border rounded">
                      <div className="flex items-center">
                        <Clipboard className="h-4 w-4 mr-2" />
                        <span>Manufacturing Process Controls</span>
                      </div>
                      <span className="flex items-center text-amber-500 font-medium">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        In Progress
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-2 border rounded">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>Stability Data</span>
                      </div>
                      <span className="flex items-center text-amber-500 font-medium">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        In Progress
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="drug-substance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Drug Substance Information</CardTitle>
                  <CardDescription>
                    Details about the active pharmaceutical ingredient (API)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Name (USAN/INN)</label>
                        <div className="border rounded p-2 bg-slate-50">
                          {cmc.drugSubstance?.name || "LPDT-3892"}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Chemical Name</label>
                        <div className="border rounded p-2 bg-slate-50">
                          {cmc.drugSubstance?.chemicalName || "2-(4-{[2-(4-chlorophenyl)-4,4-dimethylcyclohex-1-en-1-yl]methyl}piperazin-1-yl)-N-(2H-1,2,3-triazol-4-yl)acetamide"}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Molecular Formula</label>
                        <div className="border rounded p-2 bg-slate-50">
                          {cmc.drugSubstance?.molecularFormula || "C25H34ClN7O"}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Molecular Weight</label>
                        <div className="border rounded p-2 bg-slate-50">
                          {cmc.drugSubstance?.molecularWeight || "484.04 g/mol"}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <label className="text-sm font-medium">Structure</label>
                      <div className="border rounded-md p-4 h-40 flex items-center justify-center bg-slate-50">
                        <div className="text-center text-slate-500">
                          <FileText className="h-10 w-10 mx-auto mb-2" />
                          <span>Chemical structure diagram</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <label className="text-sm font-medium">Physical Properties</label>
                      <div className="border rounded-md p-4 bg-slate-50">
                        <ul className="space-y-2">
                          <li>
                            <span className="font-medium">Physical State:</span> {cmc.drugSubstance?.physicalState || "White to off-white crystalline powder"}
                          </li>
                          <li>
                            <span className="font-medium">Solubility:</span> {cmc.drugSubstance?.solubility || "Slightly soluble in water (0.25 mg/mL at 25°C)"}
                          </li>
                          <li>
                            <span className="font-medium">Melting Point:</span> {cmc.drugSubstance?.meltingPoint || "172-175°C"}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="drug-product" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Drug Product Information</CardTitle>
                  <CardDescription>
                    Final formulation and dosage form details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Dosage Form</label>
                        <div className="border rounded p-2 bg-slate-50">
                          {cmc.drugProduct?.dosageForm || "Tablet"}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Route of Administration</label>
                        <div className="border rounded p-2 bg-slate-50">
                          {cmc.drugProduct?.routeOfAdmin || "Oral"}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Strength</label>
                        <div className="border rounded p-2 bg-slate-50">
                          {cmc.drugProduct?.strength || "25 mg, 50 mg, 100 mg"}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Storage Conditions</label>
                        <div className="border rounded p-2 bg-slate-50">
                          {cmc.drugProduct?.storage || "Store at 20°C to 25°C (68°F to 77°F); excursions permitted to 15°C to 30°C (59°F to 86°F)"}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <label className="text-sm font-medium">Composition</label>
                      <div className="border rounded-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Component</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Function</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount (mg)</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            <tr>
                              <td className="px-4 py-2 text-sm">LPDT-3892</td>
                              <td className="px-4 py-2 text-sm">Active Ingredient</td>
                              <td className="px-4 py-2 text-sm">25.0</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2 text-sm">Microcrystalline Cellulose</td>
                              <td className="px-4 py-2 text-sm">Diluent</td>
                              <td className="px-4 py-2 text-sm">120.0</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2 text-sm">Lactose Monohydrate</td>
                              <td className="px-4 py-2 text-sm">Diluent</td>
                              <td className="px-4 py-2 text-sm">100.0</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2 text-sm">Magnesium Stearate</td>
                              <td className="px-4 py-2 text-sm">Lubricant</td>
                              <td className="px-4 py-2 text-sm">3.0</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="facilities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Manufacturing Facilities</CardTitle>
                  <CardDescription>
                    Details about manufacturing, testing, and packaging sites
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="border rounded-md p-4">
                      <h3 className="text-base font-medium mb-3">Drug Substance Manufacturing</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Facility Name</label>
                          <div className="border rounded p-2 bg-slate-50">
                            {cmc.facilities?.apiManufacturer?.name || "PharmaSynth Laboratories"}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">FEI Number</label>
                          <div className="border rounded p-2 bg-slate-50">
                            {cmc.facilities?.apiManufacturer?.feiNumber || "3008675309"}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Address</label>
                          <div className="border rounded p-2 bg-slate-50">
                            {cmc.facilities?.apiManufacturer?.address || "123 Pharma Way, Research Triangle Park, NC 27709, USA"}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">DUNS Number</label>
                          <div className="border rounded p-2 bg-slate-50">
                            {cmc.facilities?.apiManufacturer?.dunsNumber || "01-234-5678"}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h3 className="text-base font-medium mb-3">Drug Product Manufacturing</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Facility Name</label>
                          <div className="border rounded p-2 bg-slate-50">
                            {cmc.facilities?.drugProductManufacturer?.name || "MedTech Pharmaceuticals"}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">FEI Number</label>
                          <div className="border rounded p-2 bg-slate-50">
                            {cmc.facilities?.drugProductManufacturer?.feiNumber || "1234567890"}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Address</label>
                          <div className="border rounded p-2 bg-slate-50">
                            {cmc.facilities?.drugProductManufacturer?.address || "456 Manufacturing Blvd, Cambridge, MA 02142, USA"}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">DUNS Number</label>
                          <div className="border rounded p-2 bg-slate-50">
                            {cmc.facilities?.drugProductManufacturer?.dunsNumber || "98-765-4321"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="manufacturing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Manufacturing Process</CardTitle>
                  <CardDescription>
                    Overview of the manufacturing process and controls
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="border rounded-md p-4">
                      <h3 className="text-base font-medium mb-3">Drug Substance Manufacturing Process</h3>
                      <p className="text-sm text-slate-600 mb-4">
                        The manufacturing process for LPDT-3892 involves a multi-step synthesis with the following key stages:
                      </p>
                      <ol className="space-y-3 ml-5 list-decimal text-sm">
                        <li>Synthesis of 4,4-dimethylcyclohex-1-ene intermediate</li>
                        <li>Chlorophenyl coupling reaction</li>
                        <li>Piperazine alkylation</li>
                        <li>Triazole conjugation</li>
                        <li>Purification by recrystallization</li>
                        <li>Micronization to particle size specification</li>
                      </ol>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h3 className="text-base font-medium mb-3">Drug Product Manufacturing Process</h3>
                      <p className="text-sm text-slate-600 mb-4">
                        The manufacturing process for the tablet formulation follows industry standard approaches:
                      </p>
                      <ol className="space-y-3 ml-5 list-decimal text-sm">
                        <li>Weighing and dispensing of components</li>
                        <li>Dry blending of API with diluents</li>
                        <li>Wet granulation</li>
                        <li>Drying and milling</li>
                        <li>Final blending with lubricant</li>
                        <li>Compression into tablets</li>
                        <li>Film coating</li>
                        <li>Packaging</li>
                      </ol>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h3 className="text-base font-medium mb-3">Process Controls</h3>
                      <p className="text-sm text-slate-600 mb-4">
                        The following critical process parameters are monitored during manufacturing:
                      </p>
                      <div className="border rounded-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Process Step</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Critical Parameter</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Acceptance Criteria</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            <tr>
                              <td className="px-4 py-2 text-sm">Wet Granulation</td>
                              <td className="px-4 py-2 text-sm">Mixing time</td>
                              <td className="px-4 py-2 text-sm">10 ± 1 minutes</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2 text-sm">Drying</td>
                              <td className="px-4 py-2 text-sm">Final LOD</td>
                              <td className="px-4 py-2 text-sm">≤ 2.0%</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2 text-sm">Compression</td>
                              <td className="px-4 py-2 text-sm">Tablet hardness</td>
                              <td className="px-4 py-2 text-sm">8-12 kp</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2 text-sm">Compression</td>
                              <td className="px-4 py-2 text-sm">Tablet weight</td>
                              <td className="px-4 py-2 text-sm">250 ± 5 mg</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
        >
          Back to Protocol Builder
        </Button>
        <Button 
          onClick={handleComplete}
        >
          Continue to Nonclinical Data
        </Button>
      </div>
    </div>
  );
}